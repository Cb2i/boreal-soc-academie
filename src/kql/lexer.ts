import { KqlError } from './types.ts';

export type TokKind = 'ident' | 'num' | 'str' | 'span' | 'punct' | 'eof';

export interface Token {
  t: TokKind;
  /** Texte brut (identifiant, ponctuation) ou contenu décodé (chaîne). */
  v: string;
  /** Valeur numérique (num) ou millisecondes (span). */
  n?: number;
  pos: number;
  end: number;
  line: number;
  col: number;
}

const SPAN_UNITS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

const HYPHEN_PREFIXES: Record<string, string[]> = {
  mv: ['expand', 'apply'],
  project: ['away', 'rename', 'keep', 'reorder'],
  make: ['series'],
  top: ['nested'],
};

const TWO_CHAR = ['==', '!=', '<>', '<=', '>=', '=~', '!~', '=>', '..'];
const ONE_CHAR = '|()[]{},;.:=<>+-*/%!~@?';

const isIdentStart = (c: string) => /[A-Za-z_$]/.test(c);
const isIdentPart = (c: string) => /[A-Za-z0-9_]/.test(c);
const isDigit = (c: string) => c >= '0' && c <= '9';

/** Tokenise une requête KQL. Lance KqlError('syntax') pour les chaînes non terminées. */
export function lex(src: string): Token[] {
  const toks: Token[] = [];
  let i = 0;
  let line = 1;
  let col = 1;
  const adv = (n = 1) => {
    for (let k = 0; k < n; k++) {
      if (src[i] === '\n') {
        line++;
        col = 1;
      } else col++;
      i++;
    }
  };

  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      adv();
      continue;
    }
    if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') adv();
      continue;
    }
    const start = { pos: i, line, col };

    // Chaînes
    let verbatim = false;
    let q = c;
    if (c === '@' && (src[i + 1] === "'" || src[i + 1] === '"')) {
      verbatim = true;
      q = src[i + 1];
      adv();
    }
    if (q === "'" || q === '"') {
      adv(); // quote ouvrante
      let out = '';
      let closed = false;
      while (i < src.length) {
        const ch = src[i];
        if (verbatim) {
          if (ch === q) {
            if (src[i + 1] === q) {
              out += q;
              adv(2);
              continue;
            }
            adv();
            closed = true;
            break;
          }
          out += ch;
          adv();
        } else {
          if (ch === '\\') {
            const nx = src[i + 1];
            const map: Record<string, string> = { n: '\n', t: '\t', r: '\r', '\\': '\\', "'": "'", '"': '"' };
            if (nx === 'u' && /^[0-9a-fA-F]{4}$/.test(src.slice(i + 2, i + 6))) {
              out += String.fromCharCode(parseInt(src.slice(i + 2, i + 6), 16));
              adv(6);
              continue;
            }
            if (nx !== undefined && nx in map) {
              out += map[nx];
              adv(2);
              continue;
            }
            out += ch;
            adv();
            continue;
          }
          if (ch === q) {
            adv();
            closed = true;
            break;
          }
          out += ch;
          adv();
        }
      }
      if (!closed) {
        throw new KqlError('syntax', 'Chaîne de caractères non terminée (guillemet fermant manquant).', {
          line: start.line,
          col: start.col,
          hint: 'Vérifiez que chaque guillemet ouvrant a son guillemet fermant.',
        });
      }
      toks.push({ t: 'str', v: out, pos: start.pos, end: i, line: start.line, col: start.col });
      continue;
    }

    // Nombres et littéraux timespan (ex. 30m, 1d, 1.5h)
    if (isDigit(c) || (c === '.' && isDigit(src[i + 1] ?? ''))) {
      let j = i;
      if (c === '0' && (src[i + 1] === 'x' || src[i + 1] === 'X')) {
        j = i + 2;
        while (j < src.length && /[0-9a-fA-F]/.test(src[j])) j++;
        const text = src.slice(i, j);
        adv(j - i);
        toks.push({ t: 'num', v: text, n: parseInt(text, 16), pos: start.pos, end: i, line: start.line, col: start.col });
        continue;
      }
      while (j < src.length && isDigit(src[j])) j++;
      // partie décimale : '.' suivi d'un chiffre (évite de confondre avec '..')
      if (src[j] === '.' && isDigit(src[j + 1] ?? '')) {
        j++;
        while (j < src.length && isDigit(src[j])) j++;
      }
      if ((src[j] === 'e' || src[j] === 'E') && /[0-9+-]/.test(src[j + 1] ?? '') && /[0-9]/.test(src[j + 1] === '+' || src[j + 1] === '-' ? src[j + 2] ?? '' : src[j + 1])) {
        j += 2;
        while (j < src.length && isDigit(src[j])) j++;
      }
      const numText = src.slice(i, j);
      // suffixe d'unité ?
      let unit = '';
      for (const u of ['ms', 's', 'm', 'h', 'd']) {
        if (src.startsWith(u, j) && !isIdentPart(src[j + u.length] ?? '')) {
          unit = u;
          break;
        }
      }
      if (unit) {
        const total = j + unit.length;
        adv(total - i);
        toks.push({ t: 'span', v: src.slice(start.pos, i), n: parseFloat(numText) * SPAN_UNITS[unit], pos: start.pos, end: i, line: start.line, col: start.col });
      } else {
        adv(j - i);
        toks.push({ t: 'num', v: numText, n: parseFloat(numText), pos: start.pos, end: i, line: start.line, col: start.col });
      }
      continue;
    }

    // Identifiants (avec opérateurs à trait d'union : mv-expand, project-away...)
    if (isIdentStart(c)) {
      let j = i + 1;
      while (j < src.length && isIdentPart(src[j])) j++;
      let text = src.slice(i, j);
      const suffixes = HYPHEN_PREFIXES[text];
      if (suffixes && src[j] === '-') {
        let k = j + 1;
        while (k < src.length && isIdentPart(src[k])) k++;
        const sfx = src.slice(j + 1, k);
        if (suffixes.includes(sfx)) {
          text = `${text}-${sfx}`;
          j = k;
        }
      }
      adv(j - i);
      toks.push({ t: 'ident', v: text, pos: start.pos, end: i, line: start.line, col: start.col });
      continue;
    }

    // Ponctuation
    const two = src.slice(i, i + 2);
    if (TWO_CHAR.includes(two)) {
      adv(2);
      toks.push({ t: 'punct', v: two, pos: start.pos, end: i, line: start.line, col: start.col });
      continue;
    }
    if (ONE_CHAR.includes(c)) {
      adv();
      toks.push({ t: 'punct', v: c, pos: start.pos, end: i, line: start.line, col: start.col });
      continue;
    }

    throw new KqlError('syntax', `Caractère inattendu « ${c} ».`, {
      line,
      col,
      hint: c === '`' ? 'Les accents graves ne sont pas utilisés en KQL. Utilisez des apostrophes ou des guillemets pour les chaînes.' : undefined,
    });
  }
  toks.push({ t: 'eof', v: '', pos: src.length, end: src.length, line, col });
  return toks;
}
