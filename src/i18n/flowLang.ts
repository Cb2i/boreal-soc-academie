// Localisation des schémas animés : titre, légende, nœuds et étapes sont traduits ligne à ligne
// depuis le dictionnaire « diag » (clé = h(ligne française)), chargé au changement de langue.
import type { Flow } from '../diagrams/types.ts';
import { h, translatable, units } from './prose.ts';
import { loadDict } from './dicts.ts';
import { getLang, onBeforeLangChange } from './lang.ts';

const CODEISH = /(\||==|=>|\bwhere\b|\bproject\b|\bsummarize\b|\bextend\b|\bjoin\b|^\s*[A-Za-z_]+\(|^[\w.\\/%*-]+$|\{|\}|\$|--)/;

/** Lignes traduisibles d'une chaîne de schéma (les lignes de code de la charge utile sont exclues). */
export function flowText(s: string | undefined, payload = false): string[] {
  if (!s) return [];
  return units(s).filter((u) => u.tr && translatable(u.line) && !(payload && CODEISH.test(u.line))).map((u) => u.line);
}

export function flowLines(f: Flow): string[] {
  const o: string[] = [];
  o.push(...flowText(f.title), ...flowText(f.caption));
  for (const n of f.nodes) o.push(...flowText(n[1]), ...flowText(n[2]));
  for (const s of f.steps) o.push(...flowText(s[2]), ...flowText(s[3]), ...flowText(s[4], true), ...flowText(s[5]));
  return o;
}

let dict: Record<string, string> | null = null;
onBeforeLangChange(async (l) => {
  if (l === 'en' && !dict) dict = await loadDict('diag');
});

function tx(s: string | undefined, payload = false): string | undefined {
  if (!s || !dict) return s;
  const d = dict;
  const ok = new Set(flowText(s, payload));
  return s.includes('\n') || ok.size ? s.split('\n').map((line) => (ok.has(line) ? d[h(line)] ?? line : line)).join('\n') : s;
}

const cache = new WeakMap<Flow, Flow>();
/** Version du schéma dans la langue courante (le français d'origine est renvoyé tel quel). */
export function localizeFlow(f: Flow): Flow {
  if (getLang() !== 'en' || !dict) return f;
  const hit = cache.get(f);
  if (hit) return hit;
  const out: Flow = {
    lesson: f.lesson,
    title: tx(f.title)!,
    caption: tx(f.caption)!,
    nodes: f.nodes.map((n) => [n[0], tx(n[1])!, tx(n[2])!, n[3], n[4]] as Flow['nodes'][number]),
    steps: f.steps.map((s) => [s[0], s[1], tx(s[2])!, tx(s[3])!, tx(s[4], true), tx(s[5]), s[6]] as Flow['steps'][number]),
  };
  cache.set(f, out);
  return out;
}
