import { describe, expect, it } from 'vitest';
import { runQuery, display } from '../src/kql/index.ts';
import type { Row, Table, Value } from '../src/kql/index.ts';

const NOW = new Date('2026-03-12T12:00:00Z');

function mk(columns: string[], types: Record<string, Table['types'][string]>, rows: Row[]): Table {
  return { columns, types, rows };
}

const logins = mk(
  ['TimeGenerated', 'User', 'IP', 'Result', 'Country', 'Attempts'],
  { TimeGenerated: 'datetime', User: 'string', IP: 'string', Result: 'string', Country: 'string', Attempts: 'number' },
  [
    { TimeGenerated: new Date('2026-03-12T11:00:00Z'), User: 'alice', IP: '10.0.0.1', Result: '0', Country: 'CA', Attempts: 1 },
    { TimeGenerated: new Date('2026-03-12T11:05:00Z'), User: 'bob', IP: '203.0.113.5', Result: '50126', Country: 'RU', Attempts: 3 },
    { TimeGenerated: new Date('2026-03-12T11:06:00Z'), User: 'bob', IP: '203.0.113.5', Result: '50126', Country: 'RU', Attempts: 4 },
    { TimeGenerated: new Date('2026-03-12T11:30:00Z'), User: 'carol', IP: '203.0.113.5', Result: '0', Country: 'RU', Attempts: 2 },
    { TimeGenerated: new Date('2026-03-10T08:00:00Z'), User: 'alice', IP: '10.0.0.1', Result: '0', Country: 'CA', Attempts: 1 },
    { TimeGenerated: new Date('2026-03-12T10:00:00Z'), User: 'Dave', IP: '198.51.100.7', Result: '50053', Country: 'US', Attempts: 9 },
  ],
);

const users = mk(['User', 'Dept'], { User: 'string', Dept: 'string' }, [
  { User: 'alice', Dept: 'IT' },
  { User: 'bob', Dept: 'Finance' },
  { User: 'erin', Dept: 'RH' },
]);

const tables = { Logins: logins, Users: users };

function run(src: string) {
  return runQuery(src, { tables, now: NOW });
}

function ok(src: string) {
  const r = run(src);
  if (!r.ok) throw new Error(`${r.error.kind}: ${r.error.message}`);
  return r;
}

function rows(src: string): Value[][] {
  const r = ok(src);
  return r.table.rows.map((row) => r.table.columns.map((c) => row[c]));
}

function err(src: string) {
  const r = run(src);
  if (r.ok) throw new Error('une erreur était attendue');
  return r.error;
}

describe('opérateurs de base', () => {
  it('where + project + take', () => {
    expect(rows('Logins | where Result == "0" | project User | take 2')).toEqual([['alice'], ['carol']]);
  });
  it('where combine and/or avec la bonne priorité', () => {
    expect(rows('Logins | where Country == "RU" and Result == "0" or User == "Dave" | project User')).toEqual([['carol'], ['Dave']]);
  });
  it('extend crée une colonne et peut référencer une colonne extend précédente', () => {
    expect(rows('Logins | take 1 | extend A = Attempts * 2, B = A + 1 | project A, B')).toEqual([[2, 3]]);
  });
  it('sort desc par défaut et top', () => {
    expect(rows('Logins | top 2 by Attempts | project User, Attempts')).toEqual([
      ['Dave', 9],
      ['bob', 4],
    ]);
    expect(rows('Logins | sort by Attempts asc | take 1 | project Attempts')).toEqual([[1]]);
  });
  it('distinct et count', () => {
    expect(rows('Logins | distinct Country | sort by Country asc')).toEqual([['CA'], ['RU'], ['US']]);
    expect(rows('Logins | count')).toEqual([[6]]);
  });
  it('project-away / project-rename', () => {
    const r = ok('Logins | project-away TimeGenerated, IP, Result, Country, Attempts | project-rename Utilisateur = User | take 1');
    expect(r.table.columns).toEqual(['Utilisateur']);
  });
});

describe('texte et casse', () => {
  it('== est sensible à la casse, =~ ne l’est pas', () => {
    expect(rows('Logins | where User == "dave" | count')).toEqual([[0]]);
    expect(rows('Logins | where User =~ "dave" | count')).toEqual([[1]]);
  });
  it('contains ignore la casse, contains_cs la respecte', () => {
    expect(rows('Logins | where User contains "AVE" | count')).toEqual([[1]]);
    expect(rows('Logins | where User contains_cs "AVE" | count')).toEqual([[0]]);
  });
  it('has demande un terme entier, contains accepte un fragment', () => {
    const t = mk(['Msg'], { Msg: 'string' }, [{ Msg: 'Failed password for root' }, { Msg: 'Accepted publickey for rooted' }]);
    const run2 = (q: string) => runQuery(q, { tables: { T: t }, now: NOW });
    const a = run2('T | where Msg has "root" | count');
    const b = run2('T | where Msg contains "root" | count');
    expect(a.ok && a.table.rows[0].Count).toBe(1);
    expect(b.ok && b.table.rows[0].Count).toBe(2);
  });
  it('startswith, endswith, in, !in, in~', () => {
    expect(rows('Logins | where IP startswith "203." | count')).toEqual([[3]]);
    expect(rows('Logins | where Country in ("CA", "US") | count')).toEqual([[3]]);
    expect(rows('Logins | where Country !in ("CA", "US") | count')).toEqual([[3]]);
    expect(rows('Logins | where Country in~ ("ca") | count')).toEqual([[2]]);
  });
  it('matches regex et extract', () => {
    expect(rows('Logins | where IP matches regex @"^203\\.0\\.113\\." | count')).toEqual([[3]]);
    expect(rows('print x = extract("(\\\\d+)\\\\.(\\\\d+)", 2, "v12.34")')).toEqual([['34']]);
  });
  it('strcat, strlen, tolower, toupper, substring, split, replace_string', () => {
    expect(rows('print a = strcat("a", 1, "b"), b = strlen("abc"), c = toupper("x"), d = substring("abcdef", 1, 3), e = split("a,b", ","), f = replace_string("aXa", "X", "-")')).toEqual([
      ['a1b', 3, 'X', 'bcd', ['a', 'b'], 'a-a'],
    ]);
  });
  it('between sur nombres', () => {
    expect(rows('Logins | where Attempts between (2 .. 4) | count')).toEqual([[3]]);
  });
});

describe('summarize', () => {
  it('count / dcount / countif / sum / avg / min / max par groupe', () => {
    const r = rows('Logins | summarize n = count(), users = dcount(User), bad = countif(Result != "0"), total = sum(Attempts), mx = max(Attempts) by Country | sort by Country asc');
    expect(r).toEqual([
      ['CA', 2, 1, 0, 2, 1],
      ['RU', 3, 2, 2, 9, 4],
      ['US', 1, 1, 1, 9, 9],
    ]);
  });
  it('noms de colonnes par défaut (count_, dcount_X, sum_X)', () => {
    const r = ok('Logins | summarize count(), dcount(User), sum(Attempts)');
    expect(r.table.columns).toEqual(['count_', 'dcount_User', 'sum_Attempts']);
  });
  it('summarize sans lignes retourne une ligne avec count_ = 0', () => {
    expect(rows('Logins | where false | summarize count()')).toEqual([[0]]);
    expect(rows('Logins | where false | summarize count() by User')).toEqual([]);
  });
  it('bin sur datetime donne le nom de la colonne source', () => {
    const r = ok('Logins | where TimeGenerated > ago(1d) | summarize n = count() by bin(TimeGenerated, 1h) | sort by TimeGenerated asc');
    expect(r.table.columns).toEqual(['TimeGenerated', 'n']);
    expect(display(r.table.rows[0].TimeGenerated)).toBe('2026-03-12T10:00:00Z');
    expect(r.table.rows.map((x) => x.n)).toEqual([1, 4]);
  });
  it('arg_max(col, *) retourne la ligne la plus récente par groupe', () => {
    const r = ok('Logins | summarize arg_max(TimeGenerated, *) by User | sort by User asc');
    expect(r.table.columns.slice(0, 2)).toEqual(['User', 'TimeGenerated']);
    const alice = r.table.rows.find((x) => x.User === 'alice')!;
    expect(display(alice.TimeGenerated)).toBe('2026-03-12T11:00:00Z');
  });
  it('make_set et make_list', () => {
    const r = rows('Logins | summarize s = make_set(Country), l = make_list(Result) by User | where User == "bob"');
    expect(r).toEqual([['bob', ['RU'], ['50126', '50126']]]);
  });
  it('dcount par IP source pour une détection de type password spray', () => {
    const r = rows('Logins | where Result == "50126" | summarize Users = dcount(User), Tentatives = count() by IP | where Users >= 1');
    expect(r).toEqual([['203.0.113.5', 1, 2]]);
  });
});

describe('temps simulé', () => {
  it('ago() utilise l’horloge simulée', () => {
    // 10:00:00 pile n'est pas strictement supérieur à 10:00:00 (12:00 - 2h)
    expect(rows('Logins | where TimeGenerated > ago(2h) | count')).toEqual([[4]]);
    expect(rows('Logins | where TimeGenerated >= ago(2h) | count')).toEqual([[5]]);
    expect(rows('Logins | where TimeGenerated > ago(10d) | count')).toEqual([[6]]);
  });
  it('arithmétique datetime et timespan', () => {
    expect(rows('print d = datetime(2026-03-12 12:00:00) - datetime(2026-03-12 10:30:00)').map((r) => display(r[0]))).toEqual(['01:30:00']);
    expect(rows('print x = datetime_diff("minute", datetime(2026-03-12 12:00:00), datetime(2026-03-12 11:30:00))')).toEqual([[30]]);
    expect(rows('print x = startofday(datetime(2026-03-12 12:34:56))').map((r) => display(r[0]))).toEqual(['2026-03-12T00:00:00Z']);
  });
});

describe('let et fonctions', () => {
  it('let scalaire et let tabulaire', () => {
    expect(rows('let seuil = 3; Logins | where Attempts >= seuil | count')).toEqual([[3]]);
    expect(rows('let bad = Logins | where Result != "0"; bad | count')).toEqual([[3]]);
  });
  it('let fonction scalaire', () => {
    expect(rows('let double = (x: long) { x * 2 }; print r = double(21)')).toEqual([[42]]);
  });
  it('let tableau dynamic avec in', () => {
    expect(rows('let pays = dynamic(["CA", "US"]); Logins | where Country in (pays) | count')).toEqual([[3]]);
  });
  it('toscalar', () => {
    expect(rows('let m = toscalar(Logins | summarize max(Attempts)); Logins | where Attempts == m | project User')).toEqual([['Dave']]);
  });
  it('sous-requête dans in', () => {
    expect(rows('Logins | where User in (Users | project User) | count')).toEqual([[4]]);
  });
});

describe('join', () => {
  it('le type par défaut est innerunique (déduplique le côté gauche)', () => {
    // bob a 2 lignes à gauche : innerunique n'en garde qu'une
    expect(rows('Logins | join (Users) on User | count')).toEqual([[2]]);
    expect(rows('Logins | join kind=inner (Users) on User | count')).toEqual([[4]]);
  });
  it('leftouter, leftanti, leftsemi', () => {
    expect(rows('Logins | join kind=leftouter (Users) on User | count')).toEqual([[6]]);
    expect(rows('Logins | join kind=leftanti (Users) on User | distinct User | sort by User asc')).toEqual([['Dave'], ['carol']]);
    expect(rows('Logins | join kind=leftsemi (Users) on User | distinct User | sort by User asc')).toEqual([['alice'], ['bob']]);
  });
  it('les colonnes de même nom du côté droit reçoivent le suffixe 1', () => {
    const r = ok('Logins | join kind=inner (Users) on User | project User, User1, Dept | take 1');
    expect(r.table.columns).toEqual(['User', 'User1', 'Dept']);
  });
  it('$left / $right', () => {
    const r = rows('Logins | join kind=inner (Users | project Nom = User, Dept) on $left.User == $right.Nom | count');
    expect(r).toEqual([[4]]);
  });
  it('rightanti', () => {
    expect(rows('Logins | join kind=rightanti (Users) on User | project User')).toEqual([['erin']]);
  });
});

describe('union, mv-expand, dynamic', () => {
  it('union conserve les colonnes des deux tables', () => {
    const r = ok('union Logins, Users | count');
    expect(r.table.rows[0].Count).toBe(9);
  });
  it('union withsource', () => {
    const r = ok('union withsource=Src Users, Users | summarize n = count() by Src');
    expect(r.table.rows).toEqual([{ Src: 'Users', n: 6 }]);
  });
  it('parse_json, accès membre, index, mv-expand', () => {
    expect(rows('print j = parse_json(\'{"a": {"b": [10, 20, 30]}}\') | extend x = j.a.b[1] | project x')).toEqual([[20]]);
    expect(rows('print arr = dynamic([1, 2, 3]) | mv-expand arr | summarize s = sum(toint(arr))')).toEqual([[6]]);
    expect(rows('datatable(k:string, v:dynamic) ["a", dynamic([1,2])] | mv-expand v | project k, v')).toEqual([
      ['a', 1],
      ['a', 2],
    ]);
  });
  it('un tableau vide supprime la ligne avec mv-expand', () => {
    expect(rows('datatable(k:string, v:dynamic) ["a", dynamic([])] | mv-expand v | count')).toEqual([[0]]);
  });
});

describe('conversion et nullité', () => {
  it('isempty / isnotempty / isnull / coalesce / iff / case', () => {
    expect(rows('print a = isempty(""), b = isnotempty("x"), c = coalesce("", "z"), d = iff(1 > 2, "a", "b"), e = case(1 == 2, "x", 2 == 2, "y", "z")')).toEqual([[true, true, 'z', 'b', 'y']]);
    expect(rows('print a = isnull(toint("abc")), b = toint("42"), c = tostring(12)')).toEqual([[true, 42, '12']]);
  });
});

describe('getschema et datatable', () => {
  it('getschema décrit les colonnes', () => {
    const r = ok('Users | getschema');
    expect(r.table.rows.map((x) => [x.ColumnName, x.ColumnType])).toEqual([
      ['User', 'string'],
      ['Dept', 'string'],
    ]);
  });
  it('datatable supporte les types', () => {
    expect(rows('datatable(n:long, s:string, t:datetime) [1, "a", datetime(2026-01-01)] | project n, s')).toEqual([[1, 'a']]);
  });
});

describe('erreurs', () => {
  it('pipe manquant', () => {
    const e = err('Logins where User == "bob"');
    expect(e.kind).toBe('syntax');
    expect(e.message).toContain('pipe');
  });
  it('= au lieu de ==', () => {
    const e = err('Logins | where User = "bob"');
    expect(e.kind).toBe('syntax');
    expect(e.hint).toContain('==');
  });
  it('mots-clés en majuscules', () => {
    const e = err('Logins | WHERE User == "bob"');
    expect(e.kind).toBe('syntax');
    expect(e.hint).toContain('minuscules');
  });
  it('SQL : select', () => {
    const e = err('Logins | select User');
    expect(e.kind).toBe('syntax');
    expect(e.hint).toContain('project');
  });
  it('chaîne non terminée', () => {
    expect(err('Logins | where User == "bob').kind).toBe('syntax');
  });
  it('colonne inconnue (avec suggestion de casse)', () => {
    const e = err('Logins | where user == "bob"');
    expect(e.kind).toBe('semantic');
    expect(e.hint).toContain('casse');
  });
  it('table inconnue', () => {
    const e = err('Login | take 1');
    expect(e.kind).toBe('semantic');
    expect(e.message).toContain('introuvable');
  });
  it('valeur texte non quotée', () => {
    const e = err('Logins | where Country == RU');
    expect(e.kind).toBe('semantic');
    expect(e.hint).toContain('guillemets');
  });
  it('comparaison de colonnes de types différents', () => {
    const e = err('Logins | where Result == Attempts');
    expect(e.kind).toBe('semantic');
    expect(e.message).toContain('types différents');
  });
  it('where non booléen', () => {
    expect(err('Logins | where User').kind).toBe('semantic');
  });
  it('opérateur valide mais non pris en charge', () => {
    const e = err('Logins | parse User with "a" b:string');
    expect(e.kind).toBe('unsupported');
  });
  it('fonction non prise en charge vs fonction inconnue', () => {
    expect(err('Logins | extend x = series_decompose_anomalies(Attempts)').kind).toBe('unsupported');
    expect(err('Logins | extend x = strlenn(User)').kind).toBe('semantic');
  });
  it('agrégation hors summarize', () => {
    expect(err('Logins | extend x = count()').kind).toBe('semantic');
  });
  it('+ sur des chaînes suggère strcat', () => {
    const e = err('Logins | extend x = User + IP');
    expect(e.kind).toBe('semantic');
    expect(e.hint).toContain('strcat');
  });
  it('join sans on', () => {
    expect(err('Logins | join (Users)').kind).toBe('syntax');
  });
  it('table de contexte indisponible', () => {
    const r = runQuery('SigninLogs | take 1', { tables, now: NOW, unavailableTables: { SigninLogs: 'Table Sentinel, absente de Defender XDR.' } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.hint).toContain('Sentinel');
  });
});

describe('sécurité du moteur', () => {
  it('n’exécute jamais de code JavaScript', () => {
    const e = err('Logins | where eval("1+1") == 2');
    expect(e.kind).toBe('semantic');
    const g = globalThis as unknown as { __pwn?: boolean };
    expect(g.__pwn).toBeUndefined();
    const r = run('print x = strcat("globalThis.__pwn = true")');
    expect(r.ok).toBe(true);
    expect(g.__pwn).toBeUndefined();
  });
  it('refuse les regex à quantificateurs imbriqués', () => {
    const e = err('Logins | where User matches regex "(a+)+$"');
    expect(e.kind).toBe('limit');
  });
  it('budget de calcul : une jointure croisée explosive est arrêtée', () => {
    const big = mk(['k', 'v'], { k: 'number', v: 'number' }, Array.from({ length: 3000 }, (_, i) => ({ k: 1, v: i })));
    const r = runQuery('Big | join kind=inner (Big) on k | count', { tables: { Big: big }, now: NOW, stepBudget: 200_000 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('limit');
  });
  it('requête vide', () => {
    expect(err('').kind).toBe('syntax');
  });
});

describe('analyse de traits', () => {
  it('retourne les opérateurs, fonctions et l’ordre filtre/agrégation', () => {
    const r = ok('Logins | where Result != "0" | summarize n = count() by IP | where n > 1');
    expect(r.features).toContain('op:where');
    expect(r.features).toContain('op:summarize');
    expect(r.features).toContain('tbl:Logins');
    expect(r.features).toContain('order:filter-before-summarize');
    expect(r.features).toContain('order:where-after-summarize');
    const r2 = ok('Logins | summarize n = count() by IP | where n > 1');
    expect(r2.features).toContain('order:summarize-without-prior-filter');
    const r3 = ok('Logins | where User contains "a" | where TimeGenerated > ago(1d)');
    expect(r3.features).toContain('strop:contains');
    expect(r3.features).toContain('time:window');
  });
});

describe('in avec un nom de table ou un let tabulaire', () => {
  it('in (let) avec une colonne', () => {
    const r = runQuery('let suspects = Logins | where Result != "0" | project IP;\nLogins | where IP in (suspects) | summarize n = count() by User', { tables, now: NOW });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.table.rows.length).toBeGreaterThan(0);
  });
  it('!in (let) exclut les valeurs', () => {
    const r = runQuery('let suspects = Logins | where Result != "0" | project IP;\nLogins | where IP !in (suspects) | distinct IP', { tables, now: NOW });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.table.rows.map((x) => x.IP)).not.toContain('203.0.113.5');
  });
});
