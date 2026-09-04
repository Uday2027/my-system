'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const KEY = 'zhuday.helper.seen';

const TIPS = [
  "Open terminal.sh and type `help` — there's more in there than you'd think.",
  "Windows drag, resize from the edges, and snap to screen sides. Try it.",
  "Page Tone + CRT in the top bar turn this into an amber or green tube.",
  "There's a Konami code. And a hidden pixel that crashes the machine.",
];

/**
 * One-time helper. Shows a small retro tip card on the first visit, cycles a
 * few tips, then never appears again. Desktop only. Not a persistent assistant.
 */
export default function Helper() {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(KEY) === '1';
    } catch {
      /* ignore */
    }
    if (seen) return;
    const t = window.setTimeout(() => setOpen(true), 4000);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const next = () => {
    if (i + 1 >= TIPS.length) dismiss();
    else setI(i + 1);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-14 right-3 z-[99998] w-64 border-2 border-foreground bg-card p-3 font-mono text-[11px] text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="mb-2 flex items-center justify-between border-b border-foreground pb-1.5">
        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest">
          <span aria-hidden>{'>_'}</span> system tip {i + 1}/{TIPS.length}
        </span>
        <button onClick={dismiss} aria-label="Dismiss" className="hover:text-muted-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="leading-relaxed text-muted-foreground">{TIPS[i]}</p>
      <div className="mt-2 flex justify-end gap-2">
        <button onClick={dismiss} className="text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
          got it
        </button>
        <button
          onClick={next}
          className="rounded border border-foreground/50 px-2 py-0.5 text-[9px] uppercase tracking-widest hover:bg-foreground hover:text-background"
        >
          {i + 1 >= TIPS.length ? 'done' : 'next'}
        </button>
      </div>
    </div>
  );
}
