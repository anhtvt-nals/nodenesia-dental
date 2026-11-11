import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Renders page actions in the persistent admin header without moving their local state. */
export function AdminHeaderActions({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => { setTarget(document.getElementById('admin-header-actions')); }, []);
  return target ? createPortal(children, target) : null;
}
