import { useEffect, useMemo, useState } from 'react';
import { tr } from '../i18n/lang.ts';

function motionAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  const root = document.documentElement.getAttribute('data-motion');
  if (root === 'reduced' || root === 'off') return false;
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

const COLORS = ['#3fd0c9', '#ffb54d', '#b79bff', '#5aa9ff', '#ff8fb1', '#5ee08a'];

/** Petite célébration à la réussite : badge « +N XP » et confettis (désactivés si le mouvement est réduit). */
export function Celebrate({ xp, perfect }: { xp: number; perfect: boolean }) {
  const [on, setOn] = useState(true);
  const motion = useMemo(motionAllowed, []);
  const pieces = useMemo(
    () => Array.from({ length: 36 }, (_, i) => ({ i, x: Math.random() * 100, d: Math.random() * 0.25, r: Math.random() * 360, s: 6 + Math.random() * 6, c: COLORS[i % COLORS.length], t: 1.3 + Math.random() * 0.9 })),
    [],
  );
  useEffect(() => {
    const t = setTimeout(() => setOn(false), 2600);
    return () => clearTimeout(t);
  }, []);
  if (!on) return null;
  return (
    <div className="celebrate" aria-hidden="true">
      {motion && pieces.map((p) => (
        <i key={p.i} style={{ left: `${p.x}%`, background: p.c, width: p.s, height: p.s * 0.6, animationDelay: `${p.d}s`, animationDuration: `${p.t}s`, transform: `rotate(${p.r}deg)` }} />
      ))}
      <div className="xp-burst">
        <strong>+{xp} XP</strong>
        <span>{perfect ? tr('Solution parfaite', 'Perfect solution') : tr('Bien joué', 'Well done')}</span>
      </div>
    </div>
  );
}
