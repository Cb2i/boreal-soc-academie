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

function wrap(text: string, lim: number, maxLines: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (t.length <= lim || !cur) cur = t; else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const keep = lines.slice(0, maxLines);
    const rest = lines.slice(maxLines - 1).join(' ');
    keep[maxLines - 1] = rest;
    lines.length = 0; lines.push(...keep);
  }
  return lines.map((l, i) => (l.length > lim ? (i === lines.length - 1 || true ? l.slice(0, lim - 1) + '…' : l) : l));
}

function layout(n: number, narrow: boolean) {
  const W = narrow ? 520 : 920;
  const NW = narrow ? 210 : 220;
  const cols = narrow ? 2 : Math.min(3, n);
  const rows = Math.ceil(n / cols);
  const gx = (W - cols * NW) / (cols + 1);
  const gy = 84;
  const H = rows * NH + (rows - 1) * gy + 56;
  return { W, NW, cols, rows, H, gx, gy, row: (i: number) => Math.floor(i / cols), col: (i: number) => { const r = Math.floor(i / cols); return r % 2 === 0 ? i % cols : cols - 1 - (i % cols); }, pos: (i: number) => {
    const r = Math.floor(i / cols);
    const cInRow = r % 2 === 0 ? i % cols : cols - 1 - (i % cols);
    return { x: gx + cInRow * (NW + gx) + NW / 2, y: 28 + r * (NH + gy) + NH / 2 };
  } };
}

type Pt = { x: number; y: number };

/** Chemin à angles droits arrondis : les flèches suivent les couloirs entre les cases, jamais à travers. */
function roundedPath(pts: Pt[], r = 10) {
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
    const l1 = Math.hypot(p1.x - p0.x, p1.y - p0.y), l2 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const k = Math.min(r, l1 / 2, l2 / 2);
    const a = { x: p1.x - ((p1.x - p0.x) / l1) * k, y: p1.y - ((p1.y - p0.y) / l1) * k };
    const b = { x: p1.x + ((p2.x - p1.x) / l2) * k, y: p1.y + ((p2.y - p1.y) / l2) * k };
    d += ` L${a.x},${a.y} Q${p1.x},${p1.y} ${b.x},${b.y}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L${last.x},${last.y}`;
}

const LANES = [0, -26, 26, -52, 52];

function routeEdges(flow: Flow, idx: Record<string, number>, L: ReturnType<typeof layout>) {
  const hw = L.NW / 2, hh = NH / 2, stub = 4;
  const pairSeen: Record<string, number> = {};
  const chanSeen: Record<string, number> = {};
  const faceSeen: Record<string, number> = {};
  const face = (node: number, side: string) => { const k = `${node}${side}`; const n = (faceSeen[k] = (faceSeen[k] ?? -1) + 1); return [0, -18, 18][n % 3]; }; // plusieurs flèches sur la même face : décalées
  const lane = (key: string) => {
    const o = LANES[(chanSeen[key] = (chanSeen[key] ?? -1) + 1) % LANES.length];
    return key[0] === 'v' ? Math.sign(o) * Math.min(Math.abs(o) / 2, L.gx / 2 - 8) : o;
  };
  const cx = (c: number) => L.gx + c * (L.NW + L.gx) + hw;
  const gapX = (c: number) => cx(c) + hw + L.gx / 2; // couloir à droite de la colonne c
  const cy = (r: number) => 28 + r * (NH + L.gy) + hh;
  const chanY = (r: number) => cy(r) + hh + L.gy / 2; // couloir sous la rangée r
  const routes = flow.steps.map((st) => {
    const a = idx[st[0]] ?? 0, b = idx[st[1]] ?? 0;
    const A = L.pos(a), B = L.pos(b);
    const ra = L.row(a), rb = L.row(b), ca = L.col(a), cb = L.col(b);
    const pk = a < b ? `${a}-${b}` : `${b}-${a}`;
    const n = (pairSeen[pk] = (pairSeen[pk] ?? -1) + 1);
    const po = n === 0 ? 0 : (n % 2 ? 9 : -9) * (a < b ? 1 : -1); // lignes parallèles pour l'aller et le retour
    let pts: Pt[];
    if (a === b) {
      pts = [{ x: A.x - 20, y: A.y - hh - stub }, { x: A.x - 20, y: A.y - hh - 18 }, { x: A.x + 20, y: A.y - hh - 18 }, { x: A.x + 20, y: A.y - hh - stub }];
    } else if (ra === rb && Math.abs(ca - cb) === 1) {
      const dir = B.x > A.x ? 1 : -1;
      pts = [{ x: A.x + dir * (hw + stub), y: A.y + po }, { x: B.x - dir * (hw + stub), y: A.y + po }];
    } else if (ca === cb && Math.abs(ra - rb) === 1) {
      const dir = B.y > A.y ? 1 : -1;
      pts = [{ x: A.x + po, y: A.y + dir * (hh + stub) }, { x: A.x + po, y: B.y - dir * (hh + stub) }];
    } else if (ra === rb) {
      const up = ra > 0;
      const y0 = up ? chanY(ra - 1) : ra < L.rows - 1 ? chanY(ra) : A.y - hh - 14;
      const y = y0 + lane(`h${y0}`);
      const s = up || ra >= L.rows - 1 ? -1 : 1;
      const ax = A.x + po + face(a, s < 0 ? 't' : 'b'), bx = B.x + po + face(b, s < 0 ? 't' : 'b');
      pts = [{ x: ax, y: A.y + s * (hh + stub) }, { x: ax, y }, { x: bx, y }, { x: bx, y: B.y + s * (hh + stub) }];
    } else if (ca === cb) {
      const gc = ca < L.cols - 1 ? gapX(ca) : gapX(ca - 1);
      const x = gc + lane(`v${gc}`);
      const dir = gc > A.x ? 1 : -1;
      pts = [{ x: A.x + dir * (hw + stub), y: A.y + po }, { x, y: A.y + po }, { x, y: B.y + po }, { x: B.x + dir * (hw + stub), y: B.y + po }];
    } else if (Math.abs(ra - rb) === 1) {
      const y0 = chanY(Math.min(ra, rb));
      const y = y0 + lane(`h${y0}`);
      const dir = rb > ra ? 1 : -1;
      const ax = A.x + po + face(a, dir > 0 ? 'b' : 't'), bx = B.x + po + face(b, dir > 0 ? 't' : 'b');
      pts = [{ x: ax, y: A.y + dir * (hh + stub) }, { x: ax, y }, { x: bx, y }, { x: bx, y: B.y - dir * (hh + stub) }];
    } else {
      const dir = rb > ra ? 1 : -1;
      const gcol = gapX(Math.min(ca, cb));
      const x = gcol + lane(`v${gcol}`);
      const yA0 = dir > 0 ? chanY(ra) : chanY(ra - 1), yB0 = dir > 0 ? chanY(rb - 1) : chanY(rb);
      const yA = yA0 + lane(`h${yA0}`), yB = yB0 + lane(`h${yB0}`);
      const ax = A.x + po + face(a, dir > 0 ? 'b' : 't'), bx = B.x + po + face(b, dir > 0 ? 't' : 'b');
      pts = [{ x: ax, y: A.y + dir * (hh + stub) }, { x: ax, y: yA }, { x, y: yA }, { x, y: yB }, { x: bx, y: yB }, { x: bx, y: B.y - dir * (hh + stub) }];
    }
    return pts;
  });
  // Pastilles : on teste plusieurs positions par tronçon et on garde celle qui ne touche ni une autre pastille ni une autre ligne.
  const segDist = (p: Pt, a: Pt, b: Pt) => {
    const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  };
  const placed: Pt[] = [];
  return routes.map((pts, ei) => {
    let best = { x: pts[0].x, y: pts[0].y }, bestScore = Infinity;
    for (let i = 0; i < pts.length - 1; i++) {
      const len = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
      if (len < 26 && pts.length > 2) continue;
      for (const t of [0.5, 0.35, 0.65, 0.2, 0.8]) {
        const c = { x: pts[i].x + (pts[i + 1].x - pts[i].x) * t, y: pts[i].y + (pts[i + 1].y - pts[i].y) * t };
        let sc = (0.5 - Math.abs(t - 0.5)) * -10 - Math.min(len, 120) / 12 + Math.abs(t - 0.5) * 30;
        for (const q of placed) if (Math.hypot(q.x - c.x, q.y - c.y) < 30) sc += 1000;
        routes.forEach((o, oj) => { if (oj === ei) return; for (let k = 0; k < o.length - 1; k++) if (segDist(c, o[k], o[k + 1]) < 15) sc += 400; });
        for (let k = 0; k < pts.length - 1; k++) if (k !== i && segDist(c, pts[k], pts[k + 1]) < 15) sc += 300;
        if (sc < bestScore) { bestScore = sc; best = c; }
      }
    }
    placed.push(best);
    return { d: roundedPath(pts), s: pts[0], e: pts[pts.length - 1], mid: best };
  });
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
  const edges = useMemo(() => routeEdges(flow, idx, L), [flow, L, idx]);

  useEffect(() => {
    const el = host.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const io = new IntersectionObserver((es) => setVisible(es.some((e) => e.isIntersecting)), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || !visible) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % N), 2600);
    return () => window.clearTimeout(t);
  }, [playing, visible, step, N]);

  const cur = flow.steps[Math.min(step, N - 1)];
  const curIdx = new Set([idx[cur[0]], idx[cur[1]]]);
  return (
    <figure className="flow" ref={host} aria-label={flow.title}>
      <figcaption><strong>{flow.title}</strong><span className="muted small">{flow.caption}</span></figcaption>
      <svg viewBox={`0 0 ${L.W} ${L.H}`} role="img" aria-label={`${flow.title}. ${flow.steps.map((s, i) => `${i + 1}. ${s[2]}`).join(' ')}`} className={`flow-svg${narrow ? ' narrow' : ''}${reduce ? ' still' : ''}`}>
        <defs>
          <pattern id={`grid-${flow.lesson}`} width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" className="flow-grid" /></pattern>
          <marker id={`ah-${flow.lesson}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1,1 L9,5 L1,9" className="flow-ah" fill="none" /></marker>
        </defs>
        <rect width={L.W} height={L.H} fill={`url(#grid-${flow.lesson})`} />
        {edges.map((ed, i) => {
          const st = i === step ? 'on' : i < step ? 'done' : 'idle';
          return (
            <g key={i} className={`flow-link ${st} k-${flow.steps[i][6] ?? 'n'}`}>
              <path d={ed.d} className="flow-edge" fill="none" markerEnd={`url(#ah-${flow.lesson})`} />
              {!reduce && [0, 1, 2].slice(0, st === 'on' ? 3 : st === 'done' ? 2 : 1).map((k) => (
                <path key={`${step}-${k}`} d={ed.d} pathLength={100} className="flow-streak" fill="none" style={{ animationDelay: `${k * (st === 'on' ? 0.3 : 0.9)}s` }} />
              ))}
              {!reduce && st === 'on' && <path key={`back-${step}`} d={ed.d} pathLength={100} className="flow-back" fill="none" />}
              <g transform={`translate(${ed.mid.x},${ed.mid.y})`} className="flow-badge"><circle r="11" /><text textAnchor="middle" dy="4">{i + 1}</text></g>
            </g>
          );
        })}
        {!reduce && (
          <g key={`pk-${step}`} className={`flow-pk k-${cur[6] ?? 'n'}`}>
            <circle r="9" className="flow-pk-halo" />
            <circle r="5.5" className="flow-pk-dot" />
            <animateMotion path={edges[step].d} dur="1.05s" begin="0s" fill="freeze" calcMode="spline" keyTimes="0;1" keyPoints="0;1" keySplines=".45 .05 .2 1" />
          </g>
        )}
        {flow.nodes.map((n, i) => {
          const p = L.pos(i);
          const on = curIdx.has(i);
          return (
            <g key={n[0]} transform={`translate(${p.x - NW / 2},${p.y - NH / 2})`}>
              <g className={`flow-node${n[4] ? ` t-${n[4]}` : ''}${on ? ' on' : ''}${on && idx[cur[1]] === i ? ' dest' : ''}`}>
                <rect width={NW} height={NH} rx="16" />
                <g transform="translate(14,16) scale(1.5)"><g className="flow-ico"><path d={GLYPH[n[3]]} /></g></g>
                {(() => {
                  const tx = narrow ? 56 : 62;
                  const labLim = narrow ? 16 : 18;
                  const subLim = narrow ? 21 : 22;
                  const ll = wrap(n[1], labLim, 2);
                  const sl = wrap(n[2], subLim, ll.length === 1 ? 2 : 1);
                  const ly = ll.length === 1 ? (sl.length === 1 ? [36] : [30]) : [29, 47];
                  const sy = ll.length === 1 ? (sl.length === 1 ? [56] : [49, 64]) : [66];
                  return (
                    <>
                      {ll.map((t, k) => <text key={`l${k}`} x={tx} y={ly[k]} className="flow-lab">{t}</text>)}
                      {sl.map((t, k) => <text key={`s${k}`} x={tx} y={sy[k]} className="flow-sub">{t}</text>)}
                    </>
                  );
                })()}
              </g>
            </g>
          );
        })}
      </svg>
      <div className={`flow-panel k-${cur[6] ?? 'n'}`} aria-live="polite" key={step}>
        <span className="pill">{tr('Étape', 'Step')} {step + 1}/{N}</span>
        <p><strong>{cur[2]}</strong> : {cur[3]}</p>
        {cur[4] && <p className="flow-pdu"><span className="flow-k">{tr('Paquet', 'Packet')}</span><code>{cur[4]}</code></p>}
        {cur[5] && <p className="flow-in"><span className="flow-k">{tr('Dans', 'Inside')} {flow.nodes[idx[cur[1]]][1]}</span>{cur[5]}</p>}
      </div>
      <div className="row flow-ctl">
        <button type="button" className="btn small" onClick={() => setStep((s) => (s + N - 1) % N)} aria-label={tr('Étape précédente', 'Previous step')}>◀</button>
        <button type="button" className="btn small" onClick={() => setPlaying((v) => !v)} aria-pressed={playing}>{playing ? tr('Pause', 'Pause') : tr('Lecture', 'Play')}</button>
        <button type="button" className="btn small" onClick={() => setStep((s) => (s + 1) % N)} aria-label={tr('Étape suivante', 'Next step')}>▶</button>
        <button type="button" className="btn small" onClick={() => { setStep(0); setPlaying(!reduce); }}>{tr('Rejouer', 'Replay')}</button>
      </div>
      <details className="flow-list"><summary>{tr('Version texte du schéma', 'Text version')}</summary>
        <ol>{flow.steps.map((s, i) => <li key={i}><strong>{s[2]}</strong> : {s[3]}{s[4] ? <> <code>{s[4]}</code></> : null}{s[5] ? <> {s[5]}</> : null}</li>)}</ol>
      </details>
    </figure>
  );
}
