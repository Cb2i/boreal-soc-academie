// Traduction par dictionnaire adressé par contenu : la clé d'une phrase est le hachage de son texte français.
// Une phrase absente du dictionnaire reste en français (repli), ce qui rend la traduction progressive et sûre :
// si le texte français change, seule la phrase modifiée retombe en français.

/** Noms de champs dont la valeur est de la prose traduisible (jamais du code, des identifiants ni des réponses attendues). */
export const PROSE = new Set([
  'title', 'summary', 'body', 'revision', 'objectives', 'prerequisites', 'statement', 'explanation', 'hints', 'text', 'why', 'label', 'message',
  'deliverable', 'question', 'description', 'name', 'scenario', 'problem', 'architecture', 'steps', 'success', 'risks', 'extensions', 'data', 'tools',
  'mission', 'client', 'goal', 'expected', 'check', 'deliverables', 'rows', 'head', 'commonMistakes', 'mistakes', 'notes', 'accounts', 'permissions',
  'costs', 'secrets', 'cleanup', 'limits', 'how', 'needs', 'demo', 'faulty', 'remedies', 'zones', 'lines', 'items', 'choices', 'options', 'fields',
  'blocks', 'rubric', 'rules', 'criteria', 'lab', 'parts', 'facts', 'connected', 'context', 'caption', 'note', 'intro', 'conclusion',
]);

/** Hachage cyrb53 en base 36 : stable, sans dépendance. */
export function h(s: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/** Une ligne vaut la peine d'être traduite si elle contient une lettre et n'est pas un simple identifiant. */
export function translatable(s: string): boolean {
  return /\p{L}/u.test(s) && !/^[a-z0-9_.\-/:]+$/.test(s) && !/^\s*`{3}/.test(s);
}

/** Langages de blocs de code dont le contenu reste tel quel (le texte brut et les fiches se traduisent). */
const CODE_LANGS = /^(kusto|kql|bicep|python|py|json|yaml|yml|powershell|ps1|bash|sh|shell|hcl|terraform|sql|xml|js|javascript|ts|typescript|csv|http|ini|toml|cmd|bat|dockerfile|diff|md|markdown|n8n)$/i;

/** Découpe une chaîne en unités de traduction : une par ligne, sauf dans les blocs de code. */
export function units(s: string): { line: string; tr: boolean }[] {
  const lines = s.split('\n');
  let code = false;
  return lines.map((line) => {
    const m = /^\s*`{3}\s*(\S*)/.exec(line);
    if (m) {
      code = !code ? CODE_LANGS.test(m[1]) : false;
      return { line, tr: false };
    }
    return { line, tr: !code && translatable(line) };
  });
}

/** Copie l'arbre en remplaçant les lignes de prose présentes dans le dictionnaire. */
export function translateTree<T>(v: T, dict: Record<string, string>, key = '', post: (s: string) => string = (s) => s): T {
  if (typeof v === 'string') {
    if (!PROSE.has(key)) return v;
    if (!v.includes('\n')) return (translatable(v) ? post(dict[h(v)] ?? v) : v) as T;
    return units(v).map((u) => (u.tr ? post(dict[h(u.line)] ?? u.line) : u.line)).join('\n') as T;
  }
  if (Array.isArray(v)) return v.map((x) => translateTree(x, dict, key, post)) as T;
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) out[k] = translateTree(x, dict, k, post);
    return out as T;
  }
  return v;
}

/** Parcourt les unités de prose d'un arbre, dans l'ordre. */
export function collectProse(v: unknown, out: string[], key = ''): void {
  if (typeof v === 'string') {
    if (!PROSE.has(key)) return;
    for (const u of units(v)) if (u.tr) out.push(u.line);
  } else if (Array.isArray(v)) for (const x of v) collectProse(x, out, key);
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) collectProse(x, out, k);
}

const NB = '\u00a0';
/** Typographie française soignée : espace insécable avant « : ; ? ! % » et dans les guillemets, entre groupes de milliers; le code (`...`) reste intact. */
export function frTypo(line: string): string {
  return line
    .split(/(`[^`]*`)/)
    .map((part, i) => {
      if (i % 2 === 1) return part;
      return part
        .replace(/(\p{L})'(\p{L})/gu, '$1’$2')
        .replace(/(\S) ([:;?!])(?=$|[\s)»"”’.,])/g, `$1${NB}$2`)
        .replace(/« /g, `«${NB}`)
        .replace(/ »/g, `${NB}»`)
        .replace(/(\d) %/g, `$1${NB}%`)
        .replace(/(\d) (\d{3})(?!\d)/g, `$1${NB}$2`);
    })
    .join('');
}
