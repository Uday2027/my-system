'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Counts {
  projects: number;
  skills: number;
  achievements: number;
}

interface BootSequenceProps {
  counts: Counts;
  /** Called synchronously inside the "press any key to enter" gesture (for requestFullscreen). */
  onEnter: () => void;
  onDone: () => void;
}

type Phase = 'run' | 'ready' | 'flash';

/**
 * Fake BIOS/POST screen:
 *  1. `run`   — types the POST lines, fills the progress bar (auto).
 *  2. `ready` — holds on "PRESS ANY KEY TO ENTER" and waits for a real gesture.
 *  3. `flash` — power-on flash, then onDone().
 *
 * The gesture in step 2 is what unlocks fullscreen, so onEnter() is invoked
 * straight from the event handler (no setTimeout in between).
 */
export default function BootSequence({ counts, onEnter, onDone }: BootSequenceProps) {
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

  const [phase, setPhase] = useState<Phase>('run');
  const [text, setText] = useState('');
  const [progress, setProgress] = useState(0);
  const phaseRef = useRef<Phase>('run');
  phaseRef.current = phase;

  const toReady = useCallback(() => {
    setText(full);
    setProgress(100);
    setPhase('ready');
  }, [full]);

  const enter = useCallback(() => {
    if (phaseRef.current === 'flash') return;
    onEnter(); // synchronous — keeps the user-gesture context for requestFullscreen
    setPhase('flash');
    window.setTimeout(onDone, 200);
  }, [onEnter, onDone]);

  // Phase 1: type + fill
  useEffect(() => {
    let i = 0;
    const type = window.setInterval(() => {
      if (phaseRef.current !== 'run') {
        window.clearInterval(type);
        return;
      }
      i = Math.min(full.length, i + 3);
      setText(full.slice(0, i));
      if (i >= full.length) {
        window.clearInterval(type);
        const p0 = Date.now();
        const fill = window.setInterval(() => {
          if (phaseRef.current !== 'run') {
            window.clearInterval(fill);
            return;
          }
          const p = Math.min(100, ((Date.now() - p0) / 650) * 100);
          setProgress(p);
          if (p >= 100) {
            window.clearInterval(fill);
            setPhase('ready');
          }
        }, 30);
      }
    }, 24);

    // Failsafe: never get stuck typing
    const failsafe = window.setTimeout(() => {
      if (phaseRef.current === 'run') toReady();
    }, 4500);

    return () => {
      window.clearInterval(type);
      window.clearTimeout(failsafe);
    };
  }, [full, toReady]);

  // Input: fast-forward during `run`, enter during `ready`
  useEffect(() => {
    const handler = () => {
      if (phaseRef.current === 'run') toReady();
      else if (phaseRef.current === 'ready') enter();
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('pointerdown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('pointerdown', handler);
    };
  }, [toReady, enter]);

  const filled = Math.round((progress / 100) * 28);
  const bar = '[' + '█'.repeat(filled) + '░'.repeat(28 - filled) + ']';

  return (
    <div
      className={
        'fixed inset-0 z-[10000000] flex items-center justify-center bg-black font-mono text-[#8fef8f] ' +
        (phase === 'flash' ? 'crt-boot-flash' : '')
      }
    >
      <div className="w-full max-w-2xl px-6 text-[11px] leading-relaxed sm:text-xs">
        <pre className="whitespace-pre-wrap">{text}</pre>

        {text.length > 0 && phase === 'run' && (
          <div className="mt-1">
            <span>{bar}</span> <span>{Math.round(progress)}%</span>
            <span className="crt-caret">_</span>
          </div>
        )}

        {phase === 'run' && (
          <div className="mt-6 text-[9px] uppercase tracking-widest text-[#8fef8f]/40">
            press any key to skip
          </div>
        )}

        {phase !== 'run' && (
          <div className="mt-5 text-sm font-bold uppercase tracking-[0.3em] crt-caret">
            &gt; press any key to enter
          </div>
        )}
      </div>
    </div>
  );
}
