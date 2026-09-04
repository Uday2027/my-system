'use client';

import { useEffect, useState } from 'react';

const KEY = 'zhuday.guestbook';

interface Entry {
  name: string;
  msg: string;
  at: number;
}

export default function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    try {
      setEntries(JSON.parse(localStorage.getItem(KEY) || '[]'));
    } catch {
      /* ignore */
    }
  }, []);

  const sign = () => {
    const n = name.trim().slice(0, 40);
    const m = msg.trim().slice(0, 200);
    if (!n || !m) return;
    const next = [{ name: n, msg: m, at: Date.now() }, ...entries].slice(0, 50);
    setEntries(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setName('');
    setMsg('');
  };

  return (
    <div className="flex flex-col gap-3 font-mono text-[11px] text-foreground">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        guestbook.txt — signatures are saved to your device only
      </p>

      <div className="flex flex-col gap-2 border border-border bg-card p-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="your name / handle"
          className="border border-border bg-background px-2 py-1 text-[11px] outline-none focus:border-foreground/50"
        />
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="leave a note..."
          rows={2}
          className="resize-none border border-border bg-background px-2 py-1 text-[11px] outline-none focus:border-foreground/50"
        />
        <button
          onClick={sign}
          disabled={!name.trim() || !msg.trim()}
          className="self-end rounded border border-foreground/50 px-3 py-1 text-[10px] uppercase tracking-widest hover:bg-foreground hover:text-background disabled:opacity-40"
        >
          sign
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {entries.length === 0 ? (
          <p className="text-muted-foreground">no signatures yet — be the first.</p>
        ) : (
          entries.map((e, i) => (
            <div key={i} className="border-b border-border pb-2">
              <div className="flex justify-between">
                <span className="font-bold text-foreground">{e.name}</span>
                <span className="text-[9px] text-muted-foreground">
                  {new Date(e.at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{e.msg}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
