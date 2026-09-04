'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Fake Windows 9x blue-screen easter egg. Triggered by the `zhuday:bsod`
 * event (terminal `bsod` command, or the hidden pixel in the taskbar).
 * Auto-recovers after ~6s; any key / click dismisses early.
 */
export default function Bsod() {
  const [on, setOn] = useState(false);
  const [pct, setPct] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const clearAll = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    const start = () => {
      setOn(true);
      setPct(0);
      clearAll();
      let p = 0;
      const iv = window.setInterval(() => {
        p += Math.floor(Math.random() * 18) + 6;
        setPct(Math.min(100, p));
        if (p >= 100) window.clearInterval(iv);
      }, 350);
      timers.current.push(iv, window.setTimeout(() => setOn(false), 6000));
    };
    const stop = () => {
      if (!on) return;
      clearAll();
      setOn(false);
    };
    window.addEventListener('zhuday:bsod', start);
    window.addEventListener('keydown', stop);
    window.addEventListener('pointerdown', stop);
    return () => {
      window.removeEventListener('zhuday:bsod', start);
      window.removeEventListener('keydown', stop);
      window.removeEventListener('pointerdown', stop);
      clearAll();
    };
  }, [on]);

  if (!on) return null;

  return (
    <div className="fixed inset-0 z-[10000001] flex items-center justify-center bg-[#0827c7] font-mono text-white">
      <div className="max-w-xl px-8 text-[12px] leading-relaxed">
        <p className="mb-4 inline-block bg-white px-2 text-[#0827c7]">zhuday.exe</p>
        <p className="mb-3">
          A problem has been detected and the portfolio has been shut down to prevent
          the visitor from having too much fun.
        </p>
        <p className="mb-3">FUN_OVERFLOW_EXCEPTION (0x0000C0FF-EE)</p>
        <p className="mb-3">
          If this is the first time you&apos;ve seen this screen, don&apos;t panic. It&apos;s an
          easter egg. Hire the author: zubayerhossain1009@gmail.com
        </p>
        <p className="mb-1">Collecting data for crash dump ...</p>
        <p className="mb-3">Physical memory dump {pct}% complete.</p>
        <p className="text-white/70">Press any key to continue _</p>
      </div>
    </div>
  );
}
