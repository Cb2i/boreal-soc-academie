// Branche le contenu d'un parcours (IA, XDR, Intune, scénarios, Defender for Cloud) sur le changement de langue.
// Le contenu anglais est calculé une fois depuis le dictionnaire (src/i18n/dict/<parcours>/*.json) puis copié
// en place dans les tableaux et dictionnaires du parcours, pour que toutes les pages restent valides.
import { buildContent, type TrackContent } from '../agentic/content/build.ts';
import { translateTree } from './prose.ts';
import { getLang, onBeforeLangChange, type Lang } from './lang.ts';

const ARRAYS = ['LEVELS', 'MODULE_CONTENT', 'MODULES', 'LESSONS', 'EXERCISES', 'COMPETENCIES', 'CASES', 'PROJECTS', 'RESOURCES'] as const;
const RECORDS = ['MODULE_BY_ID', 'LESSON_BY_ID', 'EX_BY_ID', 'COMP_BY_ID', 'CASE_BY_MODULE', 'PROJECT_BY_ID'] as const;

function build(fr: TrackContent, dict: Record<string, string>): TrackContent {
  const t = <T,>(x: T): T => translateTree(x, dict);
  const modules = fr.MODULE_CONTENT.map((m) => t(m));
  const finals = fr.PROJECTS.filter((p) => p.module === 'final').map((p) => t(p));
  return buildContent(t(fr.LEVELS), modules, finals, t(fr.RESOURCES));
}

/** Branche un parcours : `load` renvoie le dictionnaire anglais fusionné (chargé à la demande). */
export async function registerTrackI18n(target: TrackContent, load: () => Promise<Record<string, string>>): Promise<void> {
  const fr = {} as Record<string, unknown>;
  for (const k of ARRAYS) fr[k] = [...(target[k] as unknown[])];
  for (const k of RECORDS) fr[k] = { ...(target[k] as object) };
  const frContent = fr as unknown as TrackContent;
  let en: TrackContent | null = null;
  const apply = async (lang: Lang): Promise<void> => {
    if (lang === 'en') en ??= build(frContent, await load());
    const src = lang === 'en' ? en! : frContent;
    for (const k of ARRAYS) {
      const t = target[k] as unknown[];
      const s = src[k] as unknown[];
      for (let i = 0; i < s.length; i++) t[i] = s[i];
    }
    for (const k of RECORDS) {
      const t = target[k] as Record<string, unknown>;
      for (const key of Object.keys(t)) delete t[key];
      Object.assign(t, src[k]);
    }
  };
  onBeforeLangChange(apply);
  if (getLang() === 'en') await apply('en');
}
