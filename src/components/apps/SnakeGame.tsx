'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const CELL = 16;
const COLS = 24;
const ROWS = 20;
const HI_KEY = 'zhuday.snake.hi';
const START_SPEED = 140; // ms per step
const MIN_SPEED = 60;

type Pt = { x: number; y: number };
type Dir = 'up' | 'down' | 'left' | 'right';
type State = 'idle' | 'running' | 'over';

const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
const DELTA: Record<Dir, Pt> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function randFood(snake: Pt[]): Pt {
  while (true) {
    const f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    if (!snake.some((s) => s.x === f.x && s.y === f.y)) return f;
  }
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<State>('idle');
  const [score, setScore] = useState(0);
  const [hi, setHi] = useState(0);

  // mutable game data (kept in refs so the loop isn't re-created)
  const snakeRef = useRef<Pt[]>([]);
  const dirRef = useRef<Dir>('right');
  const nextDirRef = useRef<Dir>('right');
  const foodRef = useRef<Pt>({ x: 10, y: 10 });
  const speedRef = useRef(START_SPEED);
  const accRef = useRef(0);
  const lastRef = useRef(0);
  const stateRef = useRef<State>('idle');
  stateRef.current = state;

  useEffect(() => {
    try {
      setHi(Number(localStorage.getItem(HI_KEY)) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#02140a';
    ctx.fillRect(0, 0, cv.width, cv.height);

    // grid dots
    ctx.fillStyle = 'rgba(143,239,143,0.06)';
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        ctx.fillRect(x * CELL + CELL / 2 - 1, y * CELL + CELL / 2 - 1, 2, 2);
      }
    }

    // food
    const f = foodRef.current;
    ctx.fillStyle = '#8fef8f';
    ctx.fillRect(f.x * CELL + 3, f.y * CELL + 3, CELL - 6, CELL - 6);

    // snake
    snakeRef.current.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#d7ffd7' : '#4fbf6f';
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, []);

  const reset = useCallback(() => {
    snakeRef.current = [
      { x: 6, y: 10 },
      { x: 5, y: 10 },
      { x: 4, y: 10 },
    ];
    dirRef.current = 'right';
    nextDirRef.current = 'right';
    foodRef.current = randFood(snakeRef.current);
    speedRef.current = START_SPEED;
    accRef.current = 0;
    setScore(0);
  }, []);

  const start = useCallback(() => {
    reset();
    setState('running');
    draw();
  }, [reset, draw]);

  const endGame = useCallback(() => {
    setState('over');
    setScore((s) => {
      setHi((h) => {
        const nh = Math.max(h, s);
        try {
          localStorage.setItem(HI_KEY, String(nh));
        } catch {
          /* ignore */
        }
        return nh;
      });
      return s;
    });
  }, []);

  const step = useCallback(() => {
    const dir = nextDirRef.current;
    dirRef.current = dir;
    const d = DELTA[dir];
    const head = snakeRef.current[0];
    const nx = { x: head.x + d.x, y: head.y + d.y };

    // wall / self collision
    if (
      nx.x < 0 ||
      nx.y < 0 ||
      nx.x >= COLS ||
      nx.y >= ROWS ||
      snakeRef.current.some((s) => s.x === nx.x && s.y === nx.y)
    ) {
      endGame();
      return;
    }

    const ate = nx.x === foodRef.current.x && nx.y === foodRef.current.y;
    const next = [nx, ...snakeRef.current];
    if (!ate) next.pop();
    else {
      foodRef.current = randFood(next);
      speedRef.current = Math.max(MIN_SPEED, speedRef.current - 4);
      setScore((s) => s + 1);
    }
    snakeRef.current = next;
  }, [endGame]);

  // game loop
  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (stateRef.current !== 'running') {
        lastRef.current = t;
        return;
      }
      const dt = t - lastRef.current;
      lastRef.current = t;
      accRef.current += dt;
      while (accRef.current >= speedRef.current) {
        accRef.current -= speedRef.current;
        step();
        if (stateRef.current !== 'running') break;
      }
      draw();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [step, draw]);

  const turn = useCallback((d: Dir) => {
    if (stateRef.current !== 'running') return;
    if (d === OPPOSITE[dirRef.current]) return;
    nextDirRef.current = d;
  }, []);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const map: Record<string, Dir> = {
        arrowup: 'up',
        w: 'up',
        arrowdown: 'down',
        s: 'down',
        arrowleft: 'left',
        a: 'left',
        arrowright: 'right',
        d: 'right',
      };
      if (map[k]) {
        e.preventDefault();
        turn(map[k]);
      } else if (k === ' ' || k === 'enter') {
        if (stateRef.current !== 'running') start();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn, start]);

  // touch swipe
  const touchRef = useRef<Pt | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = t ? { x: t.clientX, y: t.clientY } : null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchRef.current;
    const t = e.changedTouches[0];
    if (!s || !t) return;
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
      if (stateRef.current !== 'running') start();
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 'right' : 'left');
    else turn(dy > 0 ? 'down' : 'up');
  };

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-3 font-mono text-[11px] text-foreground select-none">
      <div className="flex w-full max-w-[384px] items-center justify-between">
        <span>SCORE {score}</span>
        <span className="text-muted-foreground">HI {hi}</span>
      </div>

      <div
        className="relative"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          className="rounded border border-foreground/40 bg-[#02140a] max-w-full"
        />
        {state !== 'running' && (
          <button
            onClick={start}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 text-[#8fef8f]"
          >
            <span className="text-sm font-bold uppercase tracking-[0.3em]">
              {state === 'over' ? 'Game Over' : 'Snake'}
            </span>
            {state === 'over' && <span className="text-[11px]">score {score}</span>}
            <span className="mt-1 rounded border border-[#8fef8f]/50 px-3 py-1 text-[10px] uppercase tracking-widest">
              {state === 'over' ? 'play again' : 'press start'}
            </span>
            <span className="mt-1 text-[9px] text-[#8fef8f]/50">arrows / wasd / swipe</span>
          </button>
        )}
      </div>

      {/* On-screen D-pad (mainly for touch) */}
      <div className="grid grid-cols-3 gap-1 sm:hidden">
        <span />
        <button onClick={() => turn('up')} className="h-8 w-8 rounded border border-foreground/40 active:bg-foreground/10">▲</button>
        <span />
        <button onClick={() => turn('left')} className="h-8 w-8 rounded border border-foreground/40 active:bg-foreground/10">◀</button>
        <button onClick={() => (state === 'running' ? undefined : start())} className="h-8 w-8 rounded border border-foreground/40 text-[9px] active:bg-foreground/10">●</button>
        <button onClick={() => turn('right')} className="h-8 w-8 rounded border border-foreground/40 active:bg-foreground/10">▶</button>
        <span />
        <button onClick={() => turn('down')} className="h-8 w-8 rounded border border-foreground/40 active:bg-foreground/10">▼</button>
        <span />
      </div>
    </div>
  );
}
