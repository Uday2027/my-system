'use client';

import { useEffect, useState } from 'react';

const KEY = 'zhuday.hits';
const BASE = 1372; // vanity starting offset

/**
 * Web 1.0 style visitor counter. Per-browser (localStorage), not a real global
 * count — just charm. Desktop only, sits above the taskbar bottom-left.
 */
export default function HitCounter() {
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    let v = BASE;
    try {
      v = Math.max(BASE, Number(localStorage.getItem(KEY)) || BASE) + 1;
      localStorage.setItem(KEY, String(v));
    } catch {
      /* ignore */
    }
    setN(v);
  }, []);

  if (n == null) return null;
  const digits = String(n).padStart(6, '0').split('');

  return (
    <div className="fixed bottom-12 left-3 z-[99996] hidden select-none items-center gap-1 rounded border border-border bg-card/90 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground shadow md:flex">
      <span className="tracking-wider">visitors</span>
      <span className="flex gap-[2px]">
        {digits.map((d, i) => (
          <span
            key={i}
            className="rounded-[2px] bg-black px-1 py-0.5 text-[10px] font-bold text-[#8fef8f]"
          >
            {d}
          </span>
        ))}
      </span>
    </div>
  );
}
