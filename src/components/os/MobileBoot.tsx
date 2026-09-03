'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronUp } from 'lucide-react';

interface Counts {
  projects: number;
  skills: number;
  achievements: number;
}

interface MobileBootProps {
  counts: Counts;
  /** Called synchronously inside the unlock gesture (for requestFullscreen). */
  onEnter: () => void;
  onDone: () => void;
}

type Phase = 'post' | 'lock' | 'out';

/**
 * Short phone boot: ~1.3s mini-POST -> lock screen with clock and
 * "swipe up to enter". The swipe/tap is the gesture that unlocks fullscreen.
 */
export default function MobileBoot({ counts, onEnter, onDone }: MobileBootProps) {
  const [phase, setPhase] = useState<Phase>('post');
  const [now, setNow] = useState(() => new Date());
  const phaseRef = useRef<Phase>('post');
  phaseRef.current = phase;
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setPhase('lock'), 1300);
    const clock = window.setInterval(() => setNow(new Date()), 10_000);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(clock);
    };
  }, []);

  const enter = useCallback(() => {
    if (phaseRef.current === 'out') return;
    onEnter(); // sync -> fullscreen
    setPhase('out');
    window.setTimeout(onDone, 260);
  }, [onEnter, onDone]);

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0]?.clientY ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (phase !== 'lock') return;
    const y0 = startY.current;
    const y1 = e.changedTouches[0]?.clientY ?? y0;
    if (y0 != null && y1 != null && y0 - y1 > 40) enter();
  };

  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  const dateStr = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div
      className={
        'fixed inset-0 z-[10000000] flex flex-col bg-black font-mono text-[#8fef8f] transition-opacity duration-200 ' +
        (phase === 'out' ? 'opacity-0' : 'opacity-100')
      }
      onClick={() => phase === 'lock' && enter()}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {phase === 'post' && (
        <div className="flex-1 p-6 text-[11px] leading-relaxed">
          <pre className="whitespace-pre-wrap">{`ZHUDAY OS v20.26
booting portfolio.sys ...
[ OK ]  projects (${counts.projects})
[ OK ]  skills (${counts.skills})
[ OK ]  history (${counts.achievements})
`}</pre>
          <span className="crt-caret">_</span>
        </div>
      )}

      {phase !== 'post' && (
        <>
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="text-6xl font-bold tracking-tight text-white tabular-nums">
              {hh}:{mm}
            </div>
            <div className="mt-2 text-xs uppercase tracking-[0.25em] text-[#8fef8f]/70">{dateStr}</div>
            <div className="mt-10 text-[11px] uppercase tracking-[0.3em] text-white/60">
              Zubayer Hossain Uday
            </div>
          </div>
          <div className="pb-10 flex flex-col items-center gap-2 text-[#8fef8f]/60">
            <ChevronUp className="w-5 h-5 animate-bounce" />
            <span className="text-[10px] uppercase tracking-[0.3em]">swipe up to enter</span>
          </div>
        </>
      )}
    </div>
  );
}
