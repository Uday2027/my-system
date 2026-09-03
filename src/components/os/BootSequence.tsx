'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Counts {
  projects: number;
  skills: number;
  achievements: number;
}

interface BootSequenceProps {
  counts: Counts;
  onDone: () => void;
}

/**
 * Fake BIOS/POST screen. Types out lines, fills a progress bar, flashes, then
 * calls onDone(). Skippable with any key / click. Renders inside the CRT layer.
 * A hard failsafe finishes it after ~4.5s no matter what.
 */
export default function BootSequence({ counts, onDone }: BootSequenceProps) {
  const [text, setText] = useState('');
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState(false);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setFlash(true);
    window.setTimeout(onDone, 180);
  }, [onDone]);

  useEffect(() => {
    const full =
      [
        'ZHUDAY BIOS v20.26  —  Zubayer Hossain Uday',
        '',
        'CPU ............. OK        MEM ............. 640K OK',
        'DISPLAY ......... CRT       INPUT ........... KEYBOARD / MOUSE',
        'NETWORK ......... LINK UP   STORAGE ......... portfolio.sys',
        '',
        'Loading portfolio.sys ...',
        `[ OK ]  projects (${counts.projects})   skills (${counts.skills})   history (${counts.achievements})`,
        '',
      ].join('\n') + '\n';

    let i = 0;
    const type = window.setInterval(() => {
      if (doneRef.current) return;
      i = Math.min(full.length, i + 3);
      setText(full.slice(0, i));
      if (i >= full.length) {
        window.clearInterval(type);
        const p0 = Date.now();
        const fill = window.setInterval(() => {
          if (doneRef.current) return;
          const p = Math.min(100, ((Date.now() - p0) / 650) * 100);
          setProgress(p);
          if (p >= 100) {
            window.clearInterval(fill);
            window.setTimeout(finish, 250);
          }
        }, 30);
      }
    }, 24);

    const failsafe = window.setTimeout(finish, 4500);

    return () => {
      window.clearInterval(type);
      window.clearTimeout(failsafe);
    };
  }, [counts.projects, counts.skills, counts.achievements, finish]);

  useEffect(() => {
    const skip = () => finish();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [finish]);

  const filled = Math.round((progress / 100) * 28);
  const bar = '[' + '█'.repeat(filled) + '░'.repeat(28 - filled) + ']';

  return (
    <div
      className={
        'fixed inset-0 z-[10000000] flex items-center justify-center bg-black font-mono text-[#8fef8f] ' +
        (flash ? 'crt-boot-flash' : '')
      }
    >
      <div className="w-full max-w-2xl px-6 text-[11px] leading-relaxed sm:text-xs">
        <pre className="whitespace-pre-wrap">{text}</pre>
        {text.length > 0 && (
          <div className="mt-1">
            <span>{bar}</span> <span>{Math.round(progress)}%</span>
            <span className="crt-caret">_</span>
          </div>
        )}
        <div className="mt-6 text-[9px] uppercase tracking-widest text-[#8fef8f]/40">
          press any key to skip
        </div>
      </div>
    </div>
  );
}
