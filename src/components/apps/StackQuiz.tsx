'use client';

import { useCallback, useMemo, useState } from 'react';
import { projects } from '@/lib/portfolioData';

const DISTRACTORS = [
  'Vue', 'Angular', 'Svelte', 'Rails', 'Django', 'Flask', 'Laravel', 'Go',
  'Rust', 'GraphQL', 'Kafka', 'DynamoDB', 'Firebase', 'jQuery', 'Kubernetes',
  'Terraform', 'Elixir', 'Spring', 'Kotlin', 'Swift',
];

function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export default function StackQuiz() {
  const rounds = useMemo(() => shuffle(projects).slice(0, 5), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const p = rounds[i];
  const answer = useMemo(
    () => p.tags.split(',').map((t) => t.trim()).filter(Boolean),
    [p],
  );
  const options = useMemo(() => {
    const wrong = shuffle(DISTRACTORS.filter((d) => !answer.some((a) => a.toLowerCase() === d.toLowerCase()))).slice(0, Math.max(3, 8 - answer.length));
    return shuffle([...answer, ...wrong]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const toggle = (t: string) => {
    if (revealed) return;
    setPicked((s) => {
      const n = new Set(s);
      n.has(t) ? n.delete(t) : n.add(t);
      return n;
    });
  };

  const check = useCallback(() => {
    const correct = answer.filter((a) => picked.has(a)).length;
    const wrong = [...picked].filter((x) => !answer.includes(x)).length;
    const roundScore = Math.max(0, correct - wrong);
    setScore((s) => s + roundScore);
    setRevealed(true);
  }, [answer, picked]);

  const next = () => {
    if (i + 1 >= rounds.length) {
      setDone(true);
      return;
    }
    setI(i + 1);
    setPicked(new Set());
    setRevealed(false);
  };

  const restart = () => {
    setI(0);
    setPicked(new Set());
    setRevealed(false);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const max = rounds.reduce((n, r) => n + r.tags.split(',').filter(Boolean).length, 0);
    return (
      <div className="flex flex-col items-center gap-3 py-6 font-mono text-foreground">
        <span className="text-sm font-bold uppercase tracking-[0.3em]">quiz complete</span>
        <span className="text-2xl font-bold">{score} / {max}</span>
        <button onClick={restart} className="rounded border border-foreground/50 px-4 py-1 text-[10px] uppercase tracking-widest hover:bg-foreground hover:text-background">
          try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 font-mono text-[11px] text-foreground">
      <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>round {i + 1} / {rounds.length}</span>
        <span>score {score}</span>
      </div>

      <div className="border border-border bg-card p-2">
        <h3 className="font-bold text-foreground">{p.title}</h3>
        <p className="mt-1 text-muted-foreground leading-relaxed">{p.description}</p>
      </div>

      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">pick the tech used</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((t) => {
          const isPicked = picked.has(t);
          const isRight = answer.includes(t);
          let cls = 'border-border text-foreground';
          if (revealed) {
            if (isRight) cls = 'border-[#8fef8f] bg-[#8fef8f]/15 text-foreground';
            else if (isPicked) cls = 'border-red-500 bg-red-500/10 text-foreground line-through';
            else cls = 'border-border text-muted-foreground';
          } else if (isPicked) {
            cls = 'border-foreground bg-foreground/10 text-foreground';
          }
          return (
            <button key={t} onClick={() => toggle(t)} className={`rounded border px-2 py-0.5 text-[11px] transition-colors ${cls}`}>
              {t}
            </button>
          );
        })}
      </div>

      {!revealed ? (
        <button onClick={check} disabled={picked.size === 0} className="self-start rounded border border-foreground/50 px-3 py-1 text-[10px] uppercase tracking-widest hover:bg-foreground hover:text-background disabled:opacity-40">
          check
        </button>
      ) : (
        <button onClick={next} className="self-start rounded border border-foreground/50 px-3 py-1 text-[10px] uppercase tracking-widest hover:bg-foreground hover:text-background">
          {i + 1 >= rounds.length ? 'see result' : 'next →'}
        </button>
      )}
    </div>
  );
}
