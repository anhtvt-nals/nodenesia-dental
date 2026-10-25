import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ToothZone, Service } from '../../types';
import { useI18n } from '../../i18n';
import { formatRupiah } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { PriceSheet } from '../common/PriceSheet';

// Public dental model with both jaws (upper + lower arches).
// "Human mouth detailed" by Mince — licensed CC BY 4.0.
//   https://sketchfab.com/3d-models/human-mouth-detailed-522eda0ec0e3413a914b1b298a791320
// Hosted copy (WMF): File:3D model of the human mouth.stl on Wikimedia Commons.
const MODEL_URL = '/models/human-mouth.stl';
const MODEL_ATTRIBUTION_URL =
  'https://sketchfab.com/3d-models/human-mouth-detailed-522eda0ec0e3413a914b1b298a791320';
// Normalized world-space radius the model is scaled to, so camera framing is stable.
const MODEL_TARGET_RADIUS = 1.4;

// The STL is a single file, but it is built from ~31 detached shells: one large
// soft-tissue shell (gums, lips, tongue, palate) plus a separate shell per tooth
// (a couple of touching pairs are welded, so ~30 shells for ~32 teeth). Splitting
// the shells lets us shade teeth and gingiva differently *and* light up a group
// of teeth — the front teeth vs the premolars/molars — when a zone is selected.
const TEETH_COLOR = 0xFAFBFC;
const GUM_COLOR = 0xD9828B;
const HIGHLIGHT_COLOR = 0x0066CC;
const HIGHLIGHT_EMISSIVE = 0.5;
// Fraction of the model's half-width that separates front teeth from molars.
const FRONT_TOOTH_WIDTH_RATIO = 0.31;
// Fraction of the model's width within which soft tissue is kept (the gums).
// Everything further from the teeth — lips, cheeks, palate, tongue, throat — is
// dropped so only the two dental arches remain.
const TISSUE_CROP_RATIO = 0.072;
// Fraction of the model's width a tooth vertex must clear the gum by before it
// counts as "sticking out" of it.
const ROOT_GAP_RATIO = 0.019;
// The trimmed gum sheet is only a thin band, so the roots would poke out of it.
// A solid gum mass is rebuilt around the gum + roots by sampling them into a
// voxel field and extracting its isosurface: the two arches then read as one
// continuous block of gingiva with the crowns emerging from it.
const GUM_MASS_STEP_RATIO = 0.0154;
const GUM_MASS_RADIUS_RATIO = 0.0265;
const GUM_MASS_BLUR_PASSES = 2;
const GUM_MASS_BLUR_RADIUS = 2;

interface ToothPart {
  geometry: THREE.BufferGeometry;
  /** Incisors / canines (near the midline) vs premolars / molars. */
  front: boolean;
}

function buildPartGeometry(
  positions: Float32Array,
  indices: number[],
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
  geometry.setIndex(indices);
  // Indexed geometry → shared vertices → smooth (not faceted) shading.
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Keep only the soft tissue that hugs the teeth (the gums). The single tissue
 * shell also contains the lips, cheeks, palate, tongue and throat; triangles
 * whose vertices are all further than `maxDistance` from any tooth vertex are
 * dropped, leaving just the two dental arches.
 */
function filterTissueToArch(
  positions: Float32Array,
  tissueIndices: number[],
  toothIndices: number[],
  maxDistance: number,
): number[] {
  const cell = maxDistance;
  const cellKey = (x: number, y: number, z: number): string => `${x},${y},${z}`;

  const grid = new Map<string, number[]>();
  for (const index of toothIndices) {
    const key = cellKey(
      Math.floor(positions[index * 3] / cell),
      Math.floor(positions[index * 3 + 1] / cell),
      Math.floor(positions[index * 3 + 2] / cell),
    );
    const bucket = grid.get(key);
    if (bucket) bucket.push(index);
    else grid.set(key, [index]);
  }

  const maxSquared = maxDistance * maxDistance;
  const cache = new Map<number, boolean>();
  const isNearTooth = (index: number): boolean => {
    const cached = cache.get(index);
    if (cached !== undefined) return cached;

    const x = positions[index * 3];
    const y = positions[index * 3 + 1];
    const z = positions[index * 3 + 2];
    const cx = Math.floor(x / cell);
    const cy = Math.floor(y / cell);
    const cz = Math.floor(z / cell);

    let near = false;
    for (let dx = -1; dx <= 1 && !near; dx += 1) {
      for (let dy = -1; dy <= 1 && !near; dy += 1) {
        for (let dz = -1; dz <= 1 && !near; dz += 1) {
          const bucket = grid.get(cellKey(cx + dx, cy + dy, cz + dz));
          if (!bucket) continue;
          for (const toothIndex of bucket) {
            const ox = positions[toothIndex * 3] - x;
            const oy = positions[toothIndex * 3 + 1] - y;
            const oz = positions[toothIndex * 3 + 2] - z;
            if (ox * ox + oy * oy + oz * oz <= maxSquared) {
              near = true;
              break;
            }
          }
        }
      }
    }

    cache.set(index, near);
    return near;
  };

  const kept: number[] = [];
  for (let i = 0; i < tissueIndices.length; i += 3) {
    const a = tissueIndices[i];
    const b = tissueIndices[i + 1];
    const c = tissueIndices[i + 2];
    if (isNearTooth(a) && isNearTooth(b) && isNearTooth(c)) kept.push(a, b, c);
  }
  return kept;
}

/**
 * Separable box blur of the voxel field. Folds in the mucosa and the bumps of
 * the roots would otherwise show up as lumps on the generated gum mass.
 * Runs in O(n) per axis by using a prefix sum along each line.
 */
function smoothDistanceField(
  field: Float32Array,
  gx: number,
  gy: number,
  gz: number,
): void {
  const SY = gx;
  const SZ = gx * gy;
  const radius = GUM_MASS_BLUR_RADIUS;
  const prefix = new Float64Array(Math.max(gx, gy, gz) + 1);
  let src: Float32Array = field;
  let dst: Float32Array = new Float32Array(field.length);

  const blurX = (input: Float32Array, output: Float32Array): void => {
    for (let z = 0; z < gz; z += 1) {
      for (let y = 0; y < gy; y += 1) {
        const base = y * SY + z * SZ;
        prefix[0] = 0;
        for (let x = 0; x < gx; x += 1) prefix[x + 1] = prefix[x] + input[base + x];
        for (let x = 0; x < gx; x += 1) {
          const lo = Math.max(0, x - radius);
          const hi = Math.min(gx - 1, x + radius);
          output[base + x] = (prefix[hi + 1] - prefix[lo]) / (hi - lo + 1);
        }
      }
    }
  };

  const blurY = (input: Float32Array, output: Float32Array): void => {
    for (let z = 0; z < gz; z += 1) {
      for (let x = 0; x < gx; x += 1) {
        const base = x + z * SZ;
        prefix[0] = 0;
        for (let y = 0; y < gy; y += 1) prefix[y + 1] = prefix[y] + input[base + y * SY];
        for (let y = 0; y < gy; y += 1) {
          const lo = Math.max(0, y - radius);
          const hi = Math.min(gy - 1, y + radius);
          output[base + y * SY] = (prefix[hi + 1] - prefix[lo]) / (hi - lo + 1);
        }
      }
    }
  };

  const blurZ = (input: Float32Array, output: Float32Array): void => {
    for (let y = 0; y < gy; y += 1) {
      for (let x = 0; x < gx; x += 1) {
        const base = x + y * SY;
        prefix[0] = 0;
        for (let z = 0; z < gz; z += 1) prefix[z + 1] = prefix[z] + input[base + z * SZ];
        for (let z = 0; z < gz; z += 1) {
          const lo = Math.max(0, z - radius);
          const hi = Math.min(gz - 1, z + radius);
          output[base + z * SZ] = (prefix[hi + 1] - prefix[lo]) / (hi - lo + 1);
        }
      }
    }
  };

  for (let pass = 0; pass < GUM_MASS_BLUR_PASSES; pass += 1) {
    blurX(src, dst);
    blurY(dst, src);
    blurZ(src, dst);
    const swap = src;
    src = dst;
    dst = swap;
  }
  if (src !== field) field.set(src);
}

/**
 * Grow a solid gingiva block around the trimmed gum and the tooth roots.
 *
 * Both are sampled into a grid (vertices, edge midpoints and centroids, so the
 * surface between samples is covered too), a chamfer distance transform turns
 * that point cloud into a field, and a naive surface nets pass extracts the
 * isosurface at the gum radius. The result is one watertight pink mass: the
 * roots are enclosed, the crowns emerge from it, and the ragged crop border of
 * the original sheet is rounded off.
 */
function buildGumMass(
  positions: Float32Array,
  gumIndices: number[],
  rootVertices: number[],
  modelWidth: number,
): THREE.BufferGeometry | null {
  const step = modelWidth * GUM_MASS_STEP_RATIO;
  const radius = modelWidth * GUM_MASS_RADIUS_RATIO;
  if (!(step > 0) || !(radius > 0)) return null;

  // --- sample cloud: gum sheet + tooth roots -------------------------------
  const samples: number[] = [];
  const addSample = (x: number, y: number, z: number): void => {
    samples.push(x, y, z);
  };

  const placed = new Set<number>();
  for (const index of gumIndices) {
    if (placed.has(index)) continue;
    placed.add(index);
    addSample(positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]);
  }
  for (let i = 0; i < gumIndices.length; i += 3) {
    const a = gumIndices[i];
    const b = gumIndices[i + 1];
    const c = gumIndices[i + 2];
    const pairs = [a, b, b, c, c, a];
    for (let p = 0; p < pairs.length; p += 2) {
      const first = pairs[p];
      const second = pairs[p + 1];
      addSample(
        (positions[first * 3] + positions[second * 3]) / 2,
        (positions[first * 3 + 1] + positions[second * 3 + 1]) / 2,
        (positions[first * 3 + 2] + positions[second * 3 + 2]) / 2,
      );
    }
    addSample(
      (positions[a * 3] + positions[b * 3] + positions[c * 3]) / 3,
      (positions[a * 3 + 1] + positions[b * 3 + 1] + positions[c * 3 + 1]) / 3,
      (positions[a * 3 + 2] + positions[b * 3 + 2] + positions[c * 3 + 2]) / 3,
    );
  }
  for (const index of rootVertices) {
    addSample(positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]);
  }
  if (samples.length < 9) return null;

  // --- voxel grid (one voxel of padding on every side) ---------------------
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < samples.length; i += 3) {
    if (samples[i] < minX) minX = samples[i];
    if (samples[i] > maxX) maxX = samples[i];
    if (samples[i + 1] < minY) minY = samples[i + 1];
    if (samples[i + 1] > maxY) maxY = samples[i + 1];
    if (samples[i + 2] < minZ) minZ = samples[i + 2];
    if (samples[i + 2] > maxZ) maxZ = samples[i + 2];
  }
  const margin = radius + step * 2;
  minX -= margin;
  minY -= margin;
  minZ -= margin;
  maxX += margin;
  maxY += margin;
  maxZ += margin;

  const nx = Math.ceil((maxX - minX) / step) + 1;
  const ny = Math.ceil((maxY - minY) / step) + 1;
  const nz = Math.ceil((maxZ - minZ) / step) + 1;
  const gx = nx + 2;
  const gy = ny + 2;
  const gz = nz + 2;
  const SY = gx;
  const SZ = gx * gy;
  const cellCount = gx * gy * gz;

  const FAR = 1e6;
  const field = new Float32Array(cellCount).fill(FAR);
  for (let i = 0; i < samples.length; i += 3) {
    const cx = Math.round((samples[i] - minX) / step) + 1;
    const cy = Math.round((samples[i + 1] - minY) / step) + 1;
    const cz = Math.round((samples[i + 2] - minZ) / step) + 1;
    if (cx < 1 || cy < 1 || cz < 1 || cx > gx - 2 || cy > gy - 2 || cz > gz - 2) continue;
    field[cx + cy * SY + cz * SZ] = 0;
  }

  // --- chamfer distance transform (1 / √2 / √3 weights) -------------------
  const early: { offset: number; weight: number }[] = [];
  const late: { offset: number; weight: number }[] = [];
  for (let dz = -1; dz <= 1; dz += 1) {
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy && !dz) continue;
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const weight = length < 1.5 ? (length === 1 ? 1 : Math.SQRT2) : Math.sqrt(3);
        const neighbour = { offset: dx + dy * SY + dz * SZ, weight };
        const isEarly = dz < 0 || (dz === 0 && (dy < 0 || (dy === 0 && dx < 0)));
        (isEarly ? early : late).push(neighbour);
      }
    }
  }

  for (let z = 1; z < gz - 1; z += 1) {
    for (let y = 1; y < gy - 1; y += 1) {
      let index = 1 + y * SY + z * SZ;
      for (let x = 1; x < gx - 1; x += 1, index += 1) {
        let distance = field[index];
        if (distance === 0) continue;
        for (let k = 0; k < early.length; k += 1) {
          const candidate = field[index + early[k].offset] + early[k].weight;
          if (candidate < distance) distance = candidate;
        }
        field[index] = distance;
      }
    }
  }
  for (let z = gz - 2; z >= 1; z -= 1) {
    for (let y = gy - 2; y >= 1; y -= 1) {
      let index = gx - 2 + y * SY + z * SZ;
      for (let x = gx - 2; x >= 1; x -= 1, index -= 1) {
        let distance = field[index];
        if (distance === 0) continue;
        for (let k = 0; k < late.length; k += 1) {
          const candidate = field[index + late[k].offset] + late[k].weight;
          if (candidate < distance) distance = candidate;
        }
        field[index] = distance;
      }
    }
  }

  smoothDistanceField(field, gx, gy, gz);

  // --- naive surface nets -------------------------------------------------
  const corners = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [1, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1],
  ];
  const edges = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [0, 2],
    [1, 3],
    [4, 6],
    [5, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  const level = radius / step;
  const cornerOffsets = corners.map(([x, y, z]) => x + y * SY + z * SZ);
  const cellVertex = new Int32Array(cellCount).fill(-1);
  const vertexPositions: number[] = [];
  const vertexIndices: number[] = [];
  const values = new Float32Array(8);

  for (let z = 1; z < gz - 2; z += 1) {
    for (let y = 1; y < gy - 2; y += 1) {
      let base = 1 + y * SY + z * SZ;
      for (let x = 1; x < gx - 2; x += 1, base += 1) {
        let insideCount = 0;
        for (let corner = 0; corner < 8; corner += 1) {
          const value = field[base + cornerOffsets[corner]];
          values[corner] = value;
          if (value < level) insideCount += 1;
        }
        if (insideCount === 0 || insideCount === 8) continue;

        let px = 0;
        let py = 0;
        let pz = 0;
        let crossings = 0;
        for (let edge = 0; edge < 12; edge += 1) {
          const a = edges[edge][0];
          const b = edges[edge][1];
          const va = values[a];
          const vb = values[b];
          if ((va < level) === (vb < level)) continue;
          const t = (level - va) / (vb - va);
          px += corners[a][0] + t * (corners[b][0] - corners[a][0]);
          py += corners[a][1] + t * (corners[b][1] - corners[a][1]);
          pz += corners[a][2] + t * (corners[b][2] - corners[a][2]);
          crossings += 1;
        }

        cellVertex[base] = vertexPositions.length / 3;
        vertexPositions.push(
          minX + (x - 1 + px / crossings) * step,
          minY + (y - 1 + py / crossings) * step,
          minZ + (z - 1 + pz / crossings) * step,
        );
      }
    }
  }

  for (let z = 1; z < gz - 2; z += 1) {
    for (let y = 1; y < gy - 2; y += 1) {
      let base = 1 + y * SY + z * SZ;
      for (let x = 1; x < gx - 2; x += 1, base += 1) {
        const first = cellVertex[base];
        if (first < 0) continue;
        const inside = field[base] < level;
        for (let axis = 0; axis < 3; axis += 1) {
          const offset = axis === 0 ? 1 : axis === 1 ? SY : SZ;
          if ((field[base + offset] < level) === inside) continue;
          const u = (axis + 1) % 3;
          const v = (axis + 2) % 3;
          const du = u === 0 ? 1 : u === 1 ? SY : SZ;
          const dv = v === 0 ? 1 : v === 1 ? SY : SZ;
          const second = cellVertex[base - du];
          const third = cellVertex[base - du - dv];
          const fourth = cellVertex[base - dv];
          if (second < 0 || third < 0 || fourth < 0) continue;
          if (inside) {
            vertexIndices.push(first, second, third, first, third, fourth);
          } else {
            vertexIndices.push(first, fourth, third, first, third, second);
          }
        }
      }
    }
  }

  if (vertexPositions.length === 0 || vertexIndices.length === 0) return null;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertexPositions, 3));
  geometry.setIndex(vertexIndices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Distance from a vertex to the nearest gum vertex. Cell size is the gap that
 * matters, so a 3×3×3 cell neighbourhood answers "is this vertex clear of the
 * gum?" exactly and resolves every vertex that is close enough to the gum to
 * define the cervical line. Anything further away reports `Infinity`.
 */
function buildGumDistance(
  positions: Float32Array,
  gumIndices: number[],
  cell: number,
): (index: number) => number {
  // Numeric cell key: model space is ~20 cells across, so a ±512 offset is safe.
  const cellKey = (x: number, y: number, z: number): number =>
    ((x + 512) * 1024 + (y + 512)) * 1024 + (z + 512);

  const grid = new Map<number, number[]>();
  const placed = new Set<number>();
  for (const index of gumIndices) {
    if (placed.has(index)) continue;
    placed.add(index);
    const key = cellKey(
      Math.floor(positions[index * 3] / cell),
      Math.floor(positions[index * 3 + 1] / cell),
      Math.floor(positions[index * 3 + 2] / cell),
    );
    const bucket = grid.get(key);
    if (bucket) bucket.push(index);
    else grid.set(key, [index]);
  }

  const cache = new Map<number, number>();
  return (index: number): number => {
    const cached = cache.get(index);
    if (cached !== undefined) return cached;

    const x = positions[index * 3];
    const y = positions[index * 3 + 1];
    const z = positions[index * 3 + 2];
    const cx = Math.floor(x / cell);
    const cy = Math.floor(y / cell);
    const cz = Math.floor(z / cell);

    let best = Infinity;
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dz = -1; dz <= 1; dz += 1) {
          const bucket = grid.get(cellKey(cx + dx, cy + dy, cz + dz));
          if (!bucket) continue;
          for (const other of bucket) {
            const ox = positions[other * 3] - x;
            const oy = positions[other * 3 + 1] - y;
            const oz = positions[other * 3 + 2] - z;
            const distance = Math.sqrt(ox * ox + oy * oy + oz * oz);
            if (distance < best) best = distance;
          }
        }
      }
    }

    cache.set(index, best);
    return best;
  };
}

/**
 * Separate the dental mesh into shells by connected component: the largest shell
 * is the soft tissue, every other shell is a tooth. STLLoader emits a
 * non-indexed triangle soup, so vertices are welded by quantized position first
 * (which also gives indexed geometry for smooth shading).
 */
function splitDentalParts(geometry: THREE.BufferGeometry): {
  teeth: ToothPart[];
  gum: THREE.BufferGeometry;
} {
  const position = geometry.getAttribute('position') as THREE.BufferAttribute;
  const array = position.array as ArrayLike<number>;
  const vertexCount = position.count;

  // Weld co-located vertices so adjacent faces share a component.
  const keyToId = new Map<string, number>();
  const vertexIds = new Int32Array(vertexCount);
  for (let i = 0; i < vertexCount; i += 1) {
    const x = Math.round(array[i * 3] * 1e5);
    const y = Math.round(array[i * 3 + 1] * 1e5);
    const z = Math.round(array[i * 3 + 2] * 1e5);
    const key = `${x}|${y}|${z}`;
    let id = keyToId.get(key);
    if (id === undefined) {
      id = keyToId.size;
      keyToId.set(key, id);
    }
    vertexIds[i] = id;
  }

  const uniqueCount = keyToId.size;
  const uniquePositions = new Float32Array(uniqueCount * 3);
  const seen = new Uint8Array(uniqueCount);
  for (let i = 0; i < vertexCount; i += 1) {
    const id = vertexIds[i];
    if (seen[id]) continue;
    seen[id] = 1;
    uniquePositions[id * 3] = array[i * 3];
    uniquePositions[id * 3 + 1] = array[i * 3 + 1];
    uniquePositions[id * 3 + 2] = array[i * 3 + 2];
  }

  const parent = new Int32Array(uniqueCount);
  for (let i = 0; i < parent.length; i += 1) parent[i] = i;

  const find = (a: number): number => {
    let root = a;
    while (parent[root] !== root) root = parent[root];
    while (parent[a] !== root) {
      const next = parent[a];
      parent[a] = root;
      a = next;
    }
    return root;
  };
  const union = (a: number, b: number): void => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootA] = rootB;
  };

  const triangleCount = Math.floor(vertexCount / 3);
  for (let t = 0; t < triangleCount; t += 1) {
    const a = vertexIds[t * 3];
    union(a, vertexIds[t * 3 + 1]);
    union(a, vertexIds[t * 3 + 2]);
  }

  const shellIndices = new Map<number, number[]>();
  for (let t = 0; t < triangleCount; t += 1) {
    const root = find(vertexIds[t * 3]);
    let indices = shellIndices.get(root);
    if (!indices) {
      indices = [];
      shellIndices.set(root, indices);
    }
    indices.push(vertexIds[t * 3], vertexIds[t * 3 + 1], vertexIds[t * 3 + 2]);
  }

  let tissueRoot = -1;
  let largest = -1;
  shellIndices.forEach((indices, root) => {
    if (indices.length > largest) {
      largest = indices.length;
      tissueRoot = root;
    }
  });

  let minX = Infinity;
  let maxX = -Infinity;
  for (let i = 0; i < uniqueCount; i += 1) {
    const x = uniquePositions[i * 3];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
  }
  const frontThreshold = ((maxX - minX) / 2) * FRONT_TOOTH_WIDTH_RATIO;

  const toothIndices: number[] = [];
  let tissueIndices: number[] | null = null;
  const shells: { indices: number[]; front: boolean; meanZ: number }[] = [];

  shellIndices.forEach((indices, root) => {
    if (root === tissueRoot) {
      tissueIndices = indices;
      return;
    }
    let sumZ = 0;
    let partMinX = Infinity;
    let partMaxX = -Infinity;
    for (const index of indices) {
      toothIndices.push(index);
      sumZ += uniquePositions[index * 3 + 2];
      const x = uniquePositions[index * 3];
      if (x < partMinX) partMinX = x;
      if (x > partMaxX) partMaxX = x;
    }
    shells.push({
      indices,
      front: Math.abs((partMinX + partMaxX) / 2) < frontThreshold,
      meanZ: sumZ / indices.length,
    });
  });

  // Trim the soft tissue down to the gum band around the teeth.
  const croppedTissue = tissueIndices
    ? filterTissueToArch(uniquePositions, tissueIndices, toothIndices, (maxX - minX) * TISSUE_CROP_RATIO)
    : [];

  // Once the gum is trimmed, a tooth's root can poke out of it as a white spike.
  // The roots are kept — they are covered by the generated gum mass below — so
  // all that is needed here is to know which vertices belong to a root.
  const rootGap = (maxX - minX) * ROOT_GAP_RATIO;
  const gumDistance = buildGumDistance(uniquePositions, croppedTissue, rootGap);

  // The two arches are the only clusters of tooth heights; split them at the
  // widest gap to know which way "towards the gums" points for each tooth.
  const shellHeights = shells.map((shell) => shell.meanZ).sort((a, b) => a - b);
  let archSplit = shellHeights[0] ?? 0;
  let widestGap = -1;
  for (let i = 1; i < shellHeights.length; i += 1) {
    const gap = shellHeights[i] - shellHeights[i - 1];
    if (gap > widestGap) {
      widestGap = gap;
      archSplit = (shellHeights[i] + shellHeights[i - 1]) / 2;
    }
  }

  const rootVertices: number[] = [];
  const teeth: ToothPart[] = shells.map((shell) => {
    const vertices: number[] = [];
    const seenVertex = new Set<number>();
    for (const index of shell.indices) {
      if (seenVertex.has(index)) continue;
      seenVertex.add(index);
      vertices.push(index);
    }

    // The gum hugs the tooth at the cervical line, so the vertices sitting
    // within a gap of it average out to the cervical height.
    let cervical = 0;
    let touching = 0;
    for (const index of vertices) {
      if (gumDistance(index) > rootGap) continue;
      cervical += uniquePositions[index * 3 + 2];
      touching += 1;
    }
    if (touching > 0) cervical /= touching;

    const upper = shell.meanZ > archSplit;
    for (const index of vertices) {
      if (touching === 0) {
        rootVertices.push(index);
        continue;
      }
      const z = uniquePositions[index * 3 + 2];
      if (upper ? z > cervical : z < cervical) rootVertices.push(index);
    }

    return { geometry: buildPartGeometry(uniquePositions, shell.indices), front: shell.front };
  });

  const gumMass = buildGumMass(uniquePositions, croppedTissue, rootVertices, maxX - minX);

  return {
    teeth,
    gum: gumMass ?? buildPartGeometry(uniquePositions, croppedTissue),
  };
}

interface TeethSceneProps {
  services: Service[];
  className?: string;
  /** Stretch the 3D canvas to fill the available column height (used in the hero grid). */
  fill?: boolean;
  onZoneSelect?: (zone: ToothZone) => void;
}

export const TeethScene: React.FC<TeethSceneProps> = ({
  services,
  className = '',
  fill = false,
  onZoneSelect: externalZoneSelect,
}) => {
  const { lang, t, localePath } = useI18n();
  const mountRef = useRef<HTMLDivElement>(null);

  const [activeZone, setActiveZone] = useState<ToothZone | null>('front');
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Meshes produced after the model loads, kept so zones can light up tooth groups.
  const dentalPartsRef = useRef<{
    teeth: { mesh: THREE.Mesh; front: boolean }[];
    gum: THREE.Mesh;
  } | null>(null);
  const activeZoneRef = useRef<ToothZone | null>('front');
  // Materials currently glowing, plus their base intensity, for the idle pulse.
  const highlightedRef = useRef<{ material: THREE.MeshStandardMaterial; base: number }[]>([]);

  /** Glow the shells that belong to a zone (front teeth / molars / gums / arch). */
  const applyZoneHighlight = useCallback((zone: ToothZone | null) => {
    const parts = dentalPartsRef.current;
    if (!parts) return;

    const highlighted: { material: THREE.MeshStandardMaterial; base: number }[] = [];

    parts.teeth.forEach(({ mesh, front }) => {
      const material = mesh.material as THREE.MeshPhysicalMaterial;
      const active =
        zone === 'arch' || (zone === 'front' && front) || (zone === 'molar' && !front);
      material.emissive.setHex(active ? HIGHLIGHT_COLOR : 0x000000);
      material.emissiveIntensity = active ? HIGHLIGHT_EMISSIVE : 0;
      if (active) highlighted.push({ material, base: HIGHLIGHT_EMISSIVE });
    });

    const gumMaterial = parts.gum.material as THREE.MeshStandardMaterial;
    const gumActive = zone === 'gum';
    const gumIntensity = HIGHLIGHT_EMISSIVE * 0.7;
    gumMaterial.emissive.setHex(gumActive ? HIGHLIGHT_COLOR : 0x000000);
    gumMaterial.emissiveIntensity = gumActive ? gumIntensity : 0;
    if (gumActive) highlighted.push({ material: gumMaterial, base: gumIntensity });

    highlightedRef.current = highlighted;
  }, []);

  useEffect(() => {
    activeZoneRef.current = activeZone;
    applyZoneHighlight(activeZone);
  }, [activeZone, applyZoneHighlight]);

  // Handle active zone selection
  const handleZoneChange = (zone: ToothZone) => {
    setActiveZone(zone);
    externalZoneSelect?.(zone);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene & Camera
    const scene = new THREE.Scene();

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.01, 100);

    // Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to static poster', e);
      setStatus('error');
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Image-based lighting so enamel reads as glossy and gums stay matte.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environmentTarget.texture;

    // Lighting (Clinical Daylight Key + Cool Medical Fill + subtle rim)
    scene.add(new THREE.HemisphereLight(0xFAFBFC, 0x94A3B8, 0.55));

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.6);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xCFE8FF, 0.85);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xE0F2FE, 0.5);
    rimLight.position.set(0, -3, -4);
    scene.add(rimLight);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Orbit controls → interact to rotate (drag) and zoom (wheel / pinch).
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.rotateSpeed = 0.85;
    controls.zoomSpeed = 0.9;
    controls.minDistance = MODEL_TARGET_RADIUS * 1.15;
    controls.maxDistance = MODEL_TARGET_RADIUS * 6;
    controls.autoRotate = !prefersReducedMotion;
    controls.autoRotateSpeed = 0.7;
    controls.target.set(0, 0, 0);
    camera.position.set(0, MODEL_TARGET_RADIUS * 0.35, MODEL_TARGET_RADIUS * 2.6);
    controls.update();

    // Stop the idle auto-rotation as soon as the visitor starts interacting.
    const stopAutoRotate = () => {
      controls.autoRotate = false;
    };
    controls.addEventListener('start', stopAutoRotate);

    // Load the public STL model, then split into coloured teeth + soft tissue.
    let disposed = false;
    const loader = new STLLoader();
    loader.load(
      MODEL_URL,
      (geometry) => {
        if (disposed) {
          geometry.dispose();
          return;
        }
        geometry.computeBoundingSphere();
        const radius = geometry.boundingSphere?.radius || 1;
        const center = geometry.boundingSphere?.center ?? new THREE.Vector3();
        geometry.translate(-center.x, -center.y, -center.z);

        const { teeth, gum } = splitDentalParts(geometry);
        geometry.dispose();

        const teethMaterial = new THREE.MeshPhysicalMaterial({
          color: TEETH_COLOR,
          roughness: 0.28,
          metalness: 0.0,
          clearcoat: 0.6,
          clearcoatRoughness: 0.3,
          envMapIntensity: 0.5,
        });
        const gumMaterial = new THREE.MeshStandardMaterial({
          color: GUM_COLOR,
          roughness: 0.62,
          metalness: 0.0,
          envMapIntensity: 0.35,
          // The generated isosurface is watertight but its winding cannot be
          // guaranteed, so render both sides to be safe.
          side: THREE.DoubleSide,
        });

        const root = new THREE.Group();
        const toothMeshes = teeth.map((part) => {
          // Own material per tooth so a zone can glow without affecting the rest.
          const mesh = new THREE.Mesh(part.geometry, teethMaterial.clone());
          root.add(mesh);
          return { mesh, front: part.front };
        });
        const gumMesh = new THREE.Mesh(gum, gumMaterial);
        root.add(gumMesh);

        dentalPartsRef.current = { teeth: toothMeshes, gum: gumMesh };

        root.scale.setScalar(MODEL_TARGET_RADIUS / radius);
        // The scan is authored with the mouth facing -Y and the arches stacked
        // along Z. Rotating -90° about X makes it face the camera (+Z) with the
        // upper arch up (+Y).
        root.rotation.x = -Math.PI / 2;
        modelGroup.add(root);

        applyZoneHighlight(activeZoneRef.current);
        setStatus('ready');
      },
      undefined,
      (error) => {
        if (disposed) return;
        console.warn('Failed to load 3D dental model', error);
        setStatus('error');
      },
    );

    // Animation Loop (OrbitControls needs per-frame update for damping/auto-rotate)
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Gentle breathing glow on the selected zone.
      const glowing = highlightedRef.current;
      if (!prefersReducedMotion && glowing.length > 0) {
        const phase = 0.75 + 0.25 * Math.sin(performance.now() * 0.0024);
        for (const { material, base } of glowing) {
          material.emissiveIntensity = base * phase;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handling
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      cancelAnimationFrame(animId);
      controls.removeEventListener('start', stopAutoRotate);
      controls.dispose();

      if (scene.environment) {
        scene.environment.dispose();
      }
      environmentTarget.dispose();
      pmrem.dispose();

      modelGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) {
            material.forEach((m) => m.dispose());
          } else {
            material.dispose();
          }
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      dentalPartsRef.current = null;
      highlightedRef.current = [];
    };
  }, [applyZoneHighlight]);

  const zoneNames: Record<ToothZone, string> = {
    front: t.prices.frontZone,
    molar: t.prices.molarZone,
    gum: t.prices.gumZone,
    arch: t.prices.archZone,
  };

  const currentZoneServices = activeZone ? services.filter((s) => s.zone === activeZone) : [];

  return (
    <div className={`relative w-full ${fill ? 'h-full flex flex-col' : ''} ${className}`.trim()}>
      {/* 3D Scene / Poster Canvas Container (Responsive height) */}
      <div className={`relative w-full ${fill ? 'flex-1 min-h-[280px] sm:min-h-[340px]' : 'h-[280px] sm:h-[340px] md:h-[460px]'} bg-bg-alt border border-border rounded-2xl overflow-hidden shadow-xs`}>
        <div ref={mountRef} className="w-full h-full" />

        {status === 'error' && (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-center bg-bg-alt">
            <span className="badge badge-primary mb-3 text-xs">
              <span>Model 3D Anatomi Gigi</span>
            </span>
            <p className="font-heading text-xl font-bold text-text max-w-sm">
              Anatomi Gigi & Lengkung Rahang Interaktif
            </p>
          </div>
        )}

        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-heading font-semibold text-xs text-text-muted">Memuat model 3D…</span>
          </div>
        )}

        {/* Top bar: Interaction hint + Model attribution (CC BY 4.0) */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
          <div className="bg-bg-card/90 border border-border rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-medium text-text-muted backdrop-blur-xs select-none shadow-2xs leading-snug">
            {t.home.zonesHint}
          </div>

          <a
            href={MODEL_ATTRIBUTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto shrink-0 bg-bg-card/90 border border-border rounded-lg px-2 py-1 text-[10px] font-medium text-text-muted hover:text-primary backdrop-blur-xs whitespace-nowrap"
          >
            3D: Mince · CC BY 4.0
          </a>
        </div>

        {/* Zone Selector Pills / Buttons (Touch accessible) */}
        <div className="absolute bottom-3 left-2.5 right-2.5 flex items-center justify-center gap-2 flex-wrap">
          {(['front', 'molar', 'gum', 'arch'] as ToothZone[]).map((zoneKey) => (
            <button
              key={zoneKey}
              type="button"
              onClick={() => {
                handleZoneChange(zoneKey);
                if (window.innerWidth < 768) {
                  setMobileSheetOpen(true);
                }
              }}
              className={`px-3.5 py-1.5 min-h-[38px] rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                activeZone === zoneKey
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-bg-card/95 text-text border-border hover:border-primary hover:text-primary'
              }`}
            >
              {zoneKey === 'front'
                ? 'Gigi Depan'
                : zoneKey === 'molar'
                ? 'Geraham'
                : zoneKey === 'gum'
                ? 'Gusi'
                : 'Lengkung Behel'}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Zone price list (Demo Card look) */}
      {activeZone && (
        <div className="mt-3.5 trust-card p-5">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary-hover text-xs font-semibold shrink-0">
                {t.prices.activeZone}
              </span>
              <h3 className="font-heading text-base sm:text-lg font-bold text-text truncate">
                {zoneNames[activeZone]}
              </h3>
            </div>
            <span className="text-xs font-semibold text-text-muted whitespace-nowrap">
              {currentZoneServices.length} jenis
            </span>
          </div>

          <ul className="divide-y divide-border mt-1">
            {currentZoneServices.map((svc) => {
              const svcName = lang === 'en' ? svc.nameEn : svc.name;

              return (
                <li key={svc.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link
                    to={localePath(`/layanan/${svc.slug}`)}
                    className="font-body font-medium text-sm text-text hover:text-primary transition-colors truncate"
                  >
                    {svcName}
                  </Link>
                  <span className="flex items-center gap-3 shrink-0">
                    <span className="font-heading text-xs sm:text-sm font-bold text-primary whitespace-nowrap">
                      {formatRupiah(svc.priceFrom, lang === 'en')}
                    </span>
                    <Link
                      to={localePath(`/booking?layanan=${svc.slug}`)}
                      className="btn-primary text-xs py-1.5 px-3.5 min-h-[34px] rounded-lg whitespace-nowrap"
                    >
                      {t.common.bookNow}
                    </Link>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Mobile Bottom Sheet for Tap Interaction */}
      <PriceSheet
        isOpen={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        zone={activeZone}
        services={services}
      />
    </div>
  );
};
