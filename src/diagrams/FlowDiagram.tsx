import { useEffect, useMemo, useRef, useState } from 'react';
import { tr } from '../i18n/lang.ts';
import type { Flow, Icon } from './types.ts';

const NH = 84;

const GLYPH: Record<Icon, string> = {
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9a8 8 0 0116 0z',
  device: 'M3 5h18v11H3zM8 20h8M12 16v4',
  cloud: 'M7 18a4 4 0 010-8 5 5 0 019.6-1A4.5 4.5 0 1117 18z',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M8.5 12l2.5 2.5L16 9.5',
  mail: 'M3 6h18v12H3zM3 7l9 7 9-7',
  db: 'M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3zM5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3',
  key: 'M8 14a4 4 0 110-8 4 4 0 010 8zM11 11l9 9M16 16l2-2M18 18l2-2',
  gear: 'M12 9a3 3 0 100 6 3 3 0 000-6zM12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1',
  doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7',
  alert: 'M12 3l10 18H2zM12 10v5M12 18v.5',
  globe: 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  code: 'M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14',
  bot: 'M5 9h14v10H5zM12 5v4M9 14h.01M15 14h.01M3 13v2M21 13v2',
  chart: 'M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-7',
};

function layout(n: number, narrow: boolean) {
  const W = narrow ? 520 : 920;
  const NW = narrow ? 196 : 200;
  const cols = narrow ? 2 : Math.min(3, n);
  const rows = Math.ceil(n / cols);
  const gx = (W - cols * NW) / (cols + 1);
  const gy = 64;
  const H = rows * NH + (rows - 1) * gy + 56;
  return { W, NW, cols, rows, H, pos: (i: number) => {
    const r = Math.floor(i / cols);
    const cInRow = r % 2 === 0 ? i % cols : cols - 1 - (i % cols);
    return { x: gx + cInRow * (NW + gx) + NW / 2, y: 28 + r * (NH + gy) + NH / 2 };
  } };
}

function edge(a: { x: number; y: number }, b: { x: number; y: number }, NW: number, off = 0) {
  // Point de départ et d'arrivée sur le bord des rectangles.
  const dx = b.x - a.x, dy = b.y - a.y;
  const k = Math.min(dx !== 0 ? (NW / 2 + 4) / Math.abs(dx) : 9, dy !== 0 ? (NH / 2 + 4) / Math.abs(dy) : 9);
  const s = { x: a.x + dx * k, y: a.y + dy * k };
  const e = { x: b.x - dx * k, y: b.y - dy * k };
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * off, ny = (dx / len) * off;
  const c1 = horizontal ? { x: (s.x + e.x) / 2 + nx, y: s.y + ny } : { x: s.x + nx, y: (s.y + e.y) / 2 + ny };
  const c2 = horizontal ? { x: (s.x + e.x) / 2 + nx, y: e.y + ny } : { x: e.x + nx, y: (s.y + e.y) / 2 + ny };
  const m = { x: (s.x + e.x) / 2 + nx * 0.75, y: (s.y + e.y) / 2 + ny * 0.75 };
  return { d: `M${s.x},${s.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${e.x},${e.y}`, s, e, mid: horizontal && off === 0 ? { x: m.x, y: m.y - 14 } : m };
}

export function FlowDiagram({ flow }: { flow: Flow }) {
  const reduce = useMemo(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const [visible, setVisible] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const N = flow.steps.length;
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(max-width: 640px)').matches);
  useEffect(() => {
    const mq = window.matchMedia?.('(max-width: 640px)');
    if (!mq) return;
    const f = () => setNarrow(mq.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);
  const L = useMemo(() => layout(flow.nodes.length, narrow), [flow, narrow]);
  const NW = L.NW;
  const idx = useMemo(() => Object.fromEntries(flow.nodes.map((n, i) => [n[0], i])), [flow]);
  const edges = useMemo(() => {
    const seen: Record<string, number> = {};
    return flow.steps.map((s) => {
      const a = idx[s[0]] ?? 0, b = idx[s[1]] ?? 0;
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      const k = seen[key] ?? 0;
      seen[key] = k + 1;
      // Sens normalisé pour que deux flèches de sens contraires se séparent de part et d'autre.
      const sign = a < b ? 1 : -1;
      const off = k === 0 ? 0 : (k % 2 ? 26 : -26) * sign;
      return edge(L.pos(a), L.pos(b), NW, a === b ? 0 : off);
    });
  }, [flow, L, idx, NW]);

  useEffect(() => {
    const el = host.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const io = new IntersectionObserver((es) => setVisible(es.some((e) => e.isIntersecting)), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || !visible) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % N), 3400);
    return () => window.clearTimeout(t);
  }, [playing, visible, step, N]);

  const cur = flow.steps[step];
  const curIdx = new Set([idx[cur[0]], idx[cur[1]]]);
  const e = edges[step];
  return (
    <figure className="flow" ref={host} aria-label={flow.title}>
      <figcaption><strong>{flow.title}</strong><span className="muted small">{flow.caption}</span></figcaption>
      <svg viewBox={`0 0 ${L.W} ${L.H}`} role="img" aria-label={`${flow.title}. ${flow.steps.map((s, i) => `${i + 1}. ${s[2]}`).join(' ')}`} className={`flow-svg${narrow ? ' narrow' : ''}`}>
        <defs>
          <marker id={`ah-${flow.lesson}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" className="flow-ah" /></marker>
          <marker id={`ahon-${flow.lesson}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" className="flow-ah on" /></marker>
        </defs>
        {edges.map((ed, i) => (
          <g key={i}>
            <path d={ed.d} className={`flow-edge${i < step ? ' done' : ''}${i === step ? ' on' : ''}`} markerEnd={`url(#${i <= step ? 'ahon' : 'ah'}-${flow.lesson})`} fill="none" />
            <g transform={`translate(${ed.mid.x},${ed.mid.y})`} className={`flow-badge${i === step ? ' on' : ''}`}><circle r="11" /><text textAnchor="middle" dy="4">{i + 1}</text></g>
          </g>
        ))}
        {flow.nodes.map((n, i) => {
          const p = L.pos(i);
          const on = curIdx.has(i);
          return (
            <g key={n[0]} transform={`translate(${p.x - NW / 2},${p.y - NH / 2})`} className={`flow-node${on ? ' on' : ''}`}>
              <rect width={NW} height={NH} rx="14" />
              <g transform="translate(14,16) scale(1.5)" className="flow-ico"><path d={GLYPH[n[3]]} /></g>
              <text x="62" y="36" className="flow-lab">{n[1].length > (narrow ? 19 : 18) ? n[1].slice(0, narrow ? 18 : 17) + '…' : n[1]}</text>
              <text x="62" y="56" className="flow-sub">{n[2].length > (narrow ? 24 : 22) ? n[2].slice(0, narrow ? 23 : 21) + '…' : n[2]}</text>
            </g>
          );
        })}
        {!reduce && playing && <circle r="7" className="flow-dot" key={`${step}-${flow.lesson}`}><animateMotion dur="1.8s" path={e.d} fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0;1" /></circle>}
        {(!playing || reduce) && <circle r="7" className="flow-dot" cx={e.e.x} cy={e.e.y} />}
      </svg>
      <div className="flow-panel" aria-live="polite">
        <span className="pill">{tr('Étape', 'Step')} {step + 1}/{N}</span>
        <p><strong>{cur[2]}</strong> : {cur[3]}</p>
      </div>
      <div className="row flow-ctl">
        <button type="button" className="btn small" onClick={() => setStep((s) => (s + N - 1) % N)} aria-label={tr('Étape précédente', 'Previous step')}>◀</button>
        <button type="button" className="btn small" onClick={() => setPlaying((v) => !v)} aria-pressed={playing}>{playing ? tr('Pause', 'Pause') : tr('Lecture', 'Play')}</button>
        <button type="button" className="btn small" onClick={() => setStep((s) => (s + 1) % N)} aria-label={tr('Étape suivante', 'Next step')}>▶</button>
        <button type="button" className="btn small" onClick={() => { setStep(0); setPlaying(!reduce); }}>{tr('Rejouer', 'Replay')}</button>
      </div>
      <details className="flow-list"><summary>{tr('Version texte du schéma', 'Text version')}</summary>
        <ol>{flow.steps.map((s, i) => <li key={i}><strong>{s[2]}</strong> : {s[3]}</li>)}</ol>
      </details>
    </figure>
  );
}
