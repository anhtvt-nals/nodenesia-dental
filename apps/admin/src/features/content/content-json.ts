export function parseContentObject(value: string): Record<string, unknown> {
  const content: unknown = JSON.parse(value);
  if (!content || Array.isArray(content) || typeof content !== 'object') throw new Error('Konten harus berupa JSON object yang valid.');
  return content as Record<string, unknown>;
}
