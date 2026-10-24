// Superposition de traduction : un « overlay » est un objet partiel de même forme que l'objet source.
// - chaînes : remplacent la valeur française ;
// - tableaux : fusionnés par `id` quand les éléments en ont un, sinon par position ;
// - le reste de l'objet (solutions KQL, réponses, identifiants) est conservé tel quel.
// Un champ absent de l'overlay retombe sur le français.

type Json = unknown;
const isObj = (v: Json): v is Record<string, Json> => typeof v === 'object' && v !== null && !Array.isArray(v);

export function applyOverlay<T>(base: T, ov: Json): T {
  if (ov === undefined || ov === null) return base;
  if (typeof base === 'string') return (typeof ov === 'string' && ov !== '' ? ov : base) as T;
  if (Array.isArray(base)) {
    if (!Array.isArray(ov)) return base;
    const hasIds = base.length > 0 && base.every((b) => isObj(b) && typeof b.id === 'string');
    return base.map((b, i) => {
      if (hasIds) {
        const id = (b as { id: string }).id;
        const o = ov.find((x) => isObj(x) && x.id === id);
        return applyOverlay(b, o);
      }
      return applyOverlay(b, ov[i]);
    }) as T;
  }
  if (isObj(base)) {
    if (!isObj(ov)) return base;
    const out: Record<string, Json> = { ...base };
    for (const k of Object.keys(ov)) {
      if (k === 'id') continue;
      if (k in base) out[k] = applyOverlay(base[k], ov[k]);
    }
    return out as T;
  }
  return base;
}
