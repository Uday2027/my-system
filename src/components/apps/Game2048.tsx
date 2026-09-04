'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Grid = number[]; // length 16
const BEST_KEY = 'zhuday.2048.best';

const emptyGrid = (): Grid => new Array(16).fill(0);

function spawn(g: Grid): Grid {
  const empty = g.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
  if (!empty.length) return g;
  const i = empty[Math.floor(Math.random() * empty.length)];
  const next = g.slice();
  next[i] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function rotate(g: Grid): Grid {
  // rotate 4x4 clockwise
  const n = emptyGrid();
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) n[c * 4 + (3 - r)] = g[r * 4 + c];
  return n;
}

function slideLeft(g: Grid): { grid: Grid; gained: number; moved: boolean } {
  let gained = 0;
  let moved = false;
  const out = emptyGrid();
  for (let r = 0; r < 4; r++) {
    const row = [g[r * 4], g[r * 4 + 1], g[r * 4 + 2], g[r * 4 + 3]].filter((v) => v !== 0);
    const merged: number[] = [];
    for (let i = 0; i < row.length; i++) {
      if (i + 1 < row.length && row[i] === row[i + 1]) {
        merged.push(row[i] * 2);
        gained += row[i] * 2;
        i++;
      } else merged.push(row[i]);
    }
    for (let c = 0; c < 4; c++) {
      const v = merged[c] || 0;
      out[r * 4 + c] = v;
      if (v !== g[r * 4 + c]) moved = true;
    }
  }
  return { grid: out, gained, moved };
}

function move(g: Grid, dir: 'left' | 'right' | 'up' | 'down') {
  let work = g;
  const turns = { left: 0, up: 1, right: 2, down: 3 }[dir];
  for (let i = 0; i < turns; i++) work = rotate(work);
  const res = slideLeft(work);
  let outGrid = res.grid;
  for (let i = 0; i < (4 - turns) % 4; i++) outGrid = rotate(outGrid);
  return { grid: outGrid, gained: res.gained, moved: res.moved };
}

function hasMoves(g: Grid): boolean {
  if (g.includes(0)) return true;
  for (const d of ['left', 'right', 'up', 'down'] as const) if (move(g, d).moved) return true;
  return false;
}

const TILE: Record<number, string> = {
  0: 'bg-foreground/5 text-transparent',
  2: 'bg-foreground/10 text-foreground',
  4: 'bg-foreground/15 text-foreground',
  8: 'bg-[#8fef8f]/25 text-foreground',
  16: 'bg-[#8fef8f]/35 text-foreground',
  32: 'bg-[#8fef8f]/45 text-black',
  64: 'bg-[#8fef8f]/60 text-black',
  128: 'bg-[#8fef8f]/75 text-black',
  256: 'bg-[#8fef8f]/85 text-black',
  512: 'bg-[#8fef8f] text-black',
  1024: 'bg-[#d7ffd7] text-black',
  2048: 'bg-white text-black',
};

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>(emptyGrid);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const won = grid.includes(2048);

  const start = useCallback(() => {
    setGrid(spawn(spawn(emptyGrid())));
    setScore(0);
    setOver(false);
  }, []);

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(BEST_KEY)) || 0);
    } catch {
      /* ignore */
    }
    start();
  }, [start]);

  const doMove = useCallback(
    (dir: 'left' | 'right' | 'up' | 'down') => {
      setGrid((g) => {
        if (over) return g;
        const { grid: ng, gained, moved } = move(g, dir);
        if (!moved) return g;
        const withSpawn = spawn(ng);
        setScore((s) => {
          const ns = s + gained;
          setBest((b) => {
            const nb = Math.max(b, ns);
            try {
              localStorage.setItem(BEST_KEY, String(nb));
            } catch {
              /* ignore */
            }
            return nb;
          });
          return ns;
        });
        if (!hasMoves(withSpawn)) setOver(true);
        return withSpawn;
      });
    },
    [over],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const m: Record<string, 'left' | 'right' | 'up' | 'down'> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
        a: 'left',
        d: 'right',
        w: 'up',
        s: 'down',
      };
      const dir = m[e.key] || m[e.key.toLowerCase()];
      if (dir) {
        e.preventDefault();
        doMove(dir);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doMove]);

  const touch = useRef<{ x: number; y: number } | null>(null);

  return (
    <div className="flex flex-col items-center gap-3 font-mono text-[11px] text-foreground select-none">
      <div className="flex w-full max-w-[320px] items-center justify-between">
        <span>SCORE {score}</span>
        <span className="text-muted-foreground">BEST {best}</span>
        <button onClick={start} className="rounded border border-foreground/40 px-2 py-0.5 uppercase tracking-widest active:bg-foreground/10">
          new
        </button>
      </div>

      <div
        className="relative grid grid-cols-4 gap-1.5 rounded bg-foreground/5 p-1.5"
        onTouchStart={(e) => {
          const t = e.touches[0];
          touch.current = t ? { x: t.clientX, y: t.clientY } : null;
        }}
        onTouchEnd={(e) => {
          const s = touch.current;
          const t = e.changedTouches[0];
          if (!s || !t) return;
          const dx = t.clientX - s.x;
          const dy = t.clientY - s.y;
          if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
          if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 'right' : 'left');
          else doMove(dy > 0 ? 'down' : 'up');
        }}
      >
        {grid.map((v, i) => (
          <div
            key={i}
            className={`flex h-14 w-14 items-center justify-center rounded text-sm font-bold transition-colors ${TILE[v] || 'bg-white text-black'}`}
          >
            {v || ''}
          </div>
        ))}

        {(over || won) && (
          <button
            onClick={start}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded bg-black/70 text-[#8fef8f]"
          >
            <span className="text-sm font-bold uppercase tracking-[0.3em]">{won ? 'You win' : 'Game Over'}</span>
            <span className="rounded border border-[#8fef8f]/50 px-3 py-1 text-[10px] uppercase tracking-widest">play again</span>
          </button>
        )}
      </div>

      <p className="text-[9px] uppercase tracking-widest text-muted-foreground">arrows / wasd / swipe</p>
    </div>
  );
}
