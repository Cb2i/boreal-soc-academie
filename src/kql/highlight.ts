export interface HlToken {
  text: string;
  cls: '' | 'kql-kw' | 'kql-fn' | 'kql-str' | 'kql-num' | 'kql-com' | 'kql-op' | 'kql-pipe';
}

const KEYWORDS = new Set([
  'where', 'filter', 'project', 'project-away', 'project-keep', 'project-rename', 'extend', 'take', 'limit', 'top', 'sort', 'order', 'by', 'summarize',
  'distinct', 'count', 'join', 'union', 'mv-expand', 'getschema', 'render', 'let', 'on', 'kind', 'and', 'or', 'in', 'between', 'contains', 'has', 'startswith',
  'endswith', 'asc', 'desc', 'nulls', 'first', 'last', 'datatable', 'print', 'materialize', 'to', 'typeof', 'matches', 'regex', 'has_any', 'has_all', 'withsource',
  'contains_cs', 'has_cs', 'startswith_cs', 'endswith_cs', 'true', 'false',
]);

/** Découpe tolérante (ne lance jamais) pour la coloration syntaxique. */
export function highlight(src: string): HlToken[] {
  const out: HlToken[] = [];
  const re = /(\/\/[^\n]*)|(@?(?:'(?:[^'\\\n]|\\.)*'?|"(?:[^"\\\n]|\\.)*"?))|(\b\d+(?:\.\d+)?(?:ms|s|m|h|d)?\b)|(\|)|([A-Za-z_$][A-Za-z0-9_]*(?:-(?:expand|away|keep|rename))?)(\s*\()?|(==|!=|=~|!~|<=|>=|<>|[=<>+\-*\/%!])|(\s+|.)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    if (m[1]) out.push({ text: m[1], cls: 'kql-com' });
    else if (m[2]) out.push({ text: m[2], cls: 'kql-str' });
    else if (m[3]) out.push({ text: m[3], cls: 'kql-num' });
    else if (m[4]) out.push({ text: m[4], cls: 'kql-pipe' });
    else if (m[5]) {
      const word = m[5];
      if (KEYWORDS.has(word) && !(m[6] && word !== 'count' && word !== 'let')) out.push({ text: word, cls: 'kql-kw' });
      else if (m[6]) out.push({ text: word, cls: 'kql-fn' });
      else out.push({ text: word, cls: '' });
      if (m[6]) out.push({ text: m[6], cls: '' });
    } else if (m[7]) out.push({ text: m[7], cls: 'kql-op' });
    else if (m[8]) out.push({ text: m[8], cls: '' });
    if (m[0] === '') re.lastIndex++;
  }
  return out;
}
