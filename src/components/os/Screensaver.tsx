'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const IDLE_MS = 40_000;

/**
 * After ~40s of no input, a full-screen matrix rain takes over. Any key /
 * pointer / touch wakes it. Disabled for prefers-reduced-motion.
 */
export default function Screensaver() {
  const [active, setActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const reducedRef = useRef(false);

  const arm = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (reducedRef.current) return;
    timerRef.current = window.setTimeout(() => setActive(true), IDLE_MS);
  }, []);

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const wake = () => {
      setActive(false);
      arm();
    };
    const events = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel'];
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    arm();
    return () => {
      events.forEach((e) => window.removeEventListener(e, wake));
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [arm]);

  // Matrix rain
  useEffect(() => {
    if (!active) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const font = 16;
    const cols = Math.floor(cv.width / font);
    const drops = new Array(cols).fill(1).map(() => Math.random() * -50);
    const glyphs = 'ｱｲｳｴｵｶｷｸ01<>[]{}=+*/#$&';

    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 45) return;
      last = t;
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#8fef8f';
      ctx.font = `${font}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillText(ch, i * font, drops[i] * font);
        if (drops[i] * font > cv.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[9999990] bg-black cursor-none">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-x-0 bottom-16 text-center font-mono text-[10px] uppercase tracking-[0.4em] text-[#8fef8f]/50">
        move to wake · zhuday.me
      </div>
    </div>
  );
}
