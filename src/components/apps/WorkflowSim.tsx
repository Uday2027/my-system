'use client';

import { useCallback, useRef, useState } from 'react';

interface Node {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
}
interface Edge {
  from: string;
  to: string;
}

const NODES: Node[] = [
  { id: 'trigger', label: 'HubSpot', sub: 'deal → closed won', x: 20, y: 90 },
  { id: 'gate', label: 'n8n', sub: 'verify + enrich', x: 150, y: 90 },
  { id: 'pay', label: 'Stripe', sub: 'deposit paid?', x: 150, y: 20 },
  { id: 'slack', label: 'Slack', sub: 'notify #delivery', x: 290, y: 20 },
  { id: 'sheet', label: 'Sheets', sub: 'log to tracker', x: 290, y: 90 },
  { id: 'mail', label: 'Gmail', sub: 'send intake form', x: 290, y: 160 },
];
const EDGES: Edge[] = [
  { from: 'pay', to: 'gate' },
  { from: 'trigger', to: 'gate' },
  { from: 'gate', to: 'slack' },
  { from: 'gate', to: 'sheet' },
  { from: 'gate', to: 'mail' },
];
const RUN_ORDER: string[] = ['trigger', 'pay', 'gate', 'slack', 'sheet', 'mail'];
const LOG: Record<string, string> = {
  trigger: '● trigger  deal 4812 → CLOSED_WON',
  pay: '● stripe   deposit $2,500 confirmed',
  gate: '● n8n      gates passed, enriching contact',
  slack: '● slack    posted to #delivery',
  sheet: '● sheets   row appended to Client Tracker',
  mail: '● gmail    intake form sent to client',
};
const W = 360;
const H = 200;
const NW = 66;
const NH = 34;

export default function WorkflowSim() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [doneNodes, setDoneNodes] = useState<Set<string>>(new Set());
  const [activeEdge, setActiveEdge] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);

  const center = (id: string) => {
    const n = NODES.find((x) => x.id === id)!;
    return { x: n.x + NW / 2, y: n.y + NH / 2 };
  };

  const run = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRunning(true);
    setDoneNodes(new Set());
    setActiveNode(null);
    setActiveEdge(null);
    setLog([]);

    let t = 0;
    RUN_ORDER.forEach((id, idx) => {
      timers.current.push(
        window.setTimeout(() => {
          setActiveNode(id);
          const ei = EDGES.findIndex((e) => e.to === id);
          setActiveEdge(ei >= 0 ? ei : null);
          setLog((l) => [...l, LOG[id]]);
        }, (t += 650)),
      );
      timers.current.push(
        window.setTimeout(() => {
          setDoneNodes((d) => new Set(d).add(id));
          if (idx === RUN_ORDER.length - 1) {
            setActiveNode(null);
            setActiveEdge(null);
            setRunning(false);
            setLog((l) => [...l, '✓ onboarding provisioned — 0 manual steps']);
          }
        }, t + 500),
      );
    });
  }, []);

  return (
    <div className="flex flex-col gap-3 font-mono text-[11px] text-foreground select-none">
      <div className="flex items-center justify-between">
        <span className="uppercase tracking-widest text-muted-foreground">workflow.sim — closed-won → kickoff</span>
        <button
          onClick={run}
          disabled={running}
          className="rounded border border-foreground/50 px-3 py-1 text-[10px] uppercase tracking-widest hover:bg-foreground hover:text-background disabled:opacity-40"
        >
          {running ? 'running…' : '▶ run'}
        </button>
      </div>

      <div className="overflow-x-auto rounded border border-border bg-foreground/[0.03] p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[340px]">
          {EDGES.map((e, i) => {
            const a = center(e.from);
            const b = center(e.to);
            const on = activeEdge === i;
            return (
              <g key={i}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" strokeOpacity={on ? 0.9 : 0.2} strokeWidth={on ? 2 : 1} />
                {on && (
                  <circle r="3" fill="#8fef8f">
                    <animate attributeName="cx" from={a.x} to={b.x} dur="0.55s" repeatCount="1" />
                    <animate attributeName="cy" from={a.y} to={b.y} dur="0.55s" repeatCount="1" />
                  </circle>
                )}
              </g>
            );
          })}
          {NODES.map((n) => {
            const active = activeNode === n.id;
            const done = doneNodes.has(n.id);
            return (
              <g key={n.id}>
                <rect
                  x={n.x}
                  y={n.y}
                  width={NW}
                  height={NH}
                  rx="4"
                  fill={active ? '#8fef8f' : done ? 'rgba(143,239,143,0.15)' : 'var(--card)'}
                  stroke="currentColor"
                  strokeOpacity={active ? 1 : 0.4}
                />
                <text x={n.x + NW / 2} y={n.y + 14} textAnchor="middle" fontSize="8" fontWeight="700" fill={active ? '#000' : 'currentColor'}>
                  {n.label}
                </text>
                <text x={n.x + NW / 2} y={n.y + 25} textAnchor="middle" fontSize="6" fill={active ? '#000' : 'currentColor'} fillOpacity="0.7">
                  {n.sub}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="h-24 overflow-y-auto rounded border border-border bg-black/40 p-2 text-[10px] leading-relaxed text-[#8fef8f]">
        {log.length === 0 ? <span className="text-muted-foreground">press run to simulate an automated client onboarding</span> : log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}
