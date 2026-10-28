// Normalisation déterministe de la terminologie (avant la relecture manuelle) : npx tsx scripts/f2-norm.mts
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { h } from '../src/i18n/prose.ts';

const RULES: [RegExp, string][] = [
  [/Defender pour Office 365/g, 'Defender for Office 365'],
  [/\b(?:l[’'])?[Ee]xplorateur de menaces/g, 'Threat Explorer'],
  [/sécurité des terminaux/g, 'sécurité des points de terminaison'],
  [/contrôle d[’']appareil de Defender/g, 'Device Control de Defender'],
  [/sans verrouiller tout le monde/g, 'sans verrouiller tous les utilisateurs'],
  [/Hameçonnage : du courriel au poste/g, 'Hameçonnage, du courriel au poste'],
  [/^(## Fiche : .+?), (cadrage|rôles|exploitation)$/gm, '$1 ($2)'],
  // Advanced Hunting (nom de la fonction, sans article ni traduction)
  [/\b([Dd]ans|[Vv]ia|[Pp]ar) (?:la |le )(?:chasse avancée|advanced hunting)/g, '$1 Advanced Hunting'],
  [/\b(?:de la|du) (?:chasse avancée|advanced hunting)/g, 'd’Advanced Hunting'],
  [/\b([Ee]n) chasse avancée/g, '$1 Advanced Hunting'],
  [/\b(requêtes?|données|tables|API|laboratoire|lab) de chasse avancée/g, '$1 Advanced Hunting'],
  [/\b(?:la|le|La|Le) (?:chasse avancée|advanced hunting)/g, 'Advanced Hunting'],
  [/\b(?:Chasse avancée|chasse avancée|[Aa]dvanced hunting)/g, 'Advanced Hunting'],
  [/\bde Advanced Hunting/g, 'd’Advanced Hunting'],
  // locataire, laboratoire
  [/\b(le|un|ce|du|au|votre|notre|son|ton|d[’'] ?un|dans le|sur le|de ce) tenant\b(?! compte)/g, (m: string, d: string) => `${d} locataire`],
  [/\b(le|du|au|ce|un|chaque|votre|notre|ton|de) labs?\b(?![-\w])/g, (m: string, d: string) => `${d} laboratoire`],
  [/\bles labs\b/g, 'les laboratoires'],
  [/\bc’est à vous d’implémenter\b/g, 'c’est à vous de mettre en œuvre'],
  [/\bImplémenter garde-fou/g, 'Mettre en œuvre un garde-fou'],
  [/\bnon encore implémentée\b/g, 'pas encore mise en œuvre'],
  [/\bl’utilisateur satisfait un contrôle\b/g, 'l’utilisateur répond à l’exigence du contrôle'],
  [/\bJe bâtis un processus communiqué\b/g, 'J’établis un processus communiqué'],
  [/\bcoeur\b/g, 'cœur'],
  [/d[’']hameconnage/g, 'd’hameçonnage'],
  [/\bUn secret committé\b/g, 'Un secret validé (commit)'],
  [/\bCommitter quand même\b/g, 'Valider (commit) quand même'],
  [/\badresses défangées\b/g, 'adresses neutralisées (defanged)'],
  [/\bdétruisible\b/g, 'supprimable'],
  [/\bdétonnées\b/g, 'détonées'],
  [/\bdétonés\b/g, 'détonés'],
  [/\btrafic proxifié\b/g, 'trafic acheminé par proxy'],
  [/\ben prérelease\b/g, 'en préversion'],
  [/\baprès éprouvage\b/g, 'après validation'],
  [/\best entiercée\b/g, 'est séquestrée'],
  [/\bmodèle de profil créable\b/g, 'modèle de profil qui peut être créé'],
  [/\bsans surprivilège\b/g, 'sans privilèges excessifs'],
  [/\bla règle déclenchante\b/g, 'la règle qui a déclenché l’alerte'],
  [/\bterminaux\b/g, 'points de terminaison'],
  [/\b(à|aux|des|les|ces|vos|nos|sur|de) stratégies(?! de groupe)/g, (m: string, d: string) => `${d} politiques`],
  [/\b(la|une|cette|votre|notre|chaque|selon la|sur la|Rédigez la|Paramétrez la|Relire une|Rédigez une|Paramétrez une|Cas : la) stratégie(?! de groupe| réseau)(?!\w)/g, (m: string, d: string) => `${d} politique`],
  [/\bCas : stratégie(?! de groupe)/g, 'Cas : politique'],
  [/\bStratégie de groupe\b/g, 'stratégie de groupe'],
  [/\bphishing\b(?!\.example)/g, 'hameçonnage'],
  [/\bmalwares\b/g, 'maliciels'],
  [/\bmalware\b/g, 'maliciel'],
  [/\b(le|du|au|dans le|vers le|sur le) cloud\b(?! (?:Security|Adoption|Apps|Shell|Discovery|Logging))/g, (m: string, d: string) => `${d} nuage`],
  [/\bposture cloud\b/g, 'posture infonuagique'],
  [/\b[Nn]e bâtissez\b/g, (m: string) => m[0] === 'N' ? 'Ne construisez' : 'ne construisez'],
  [/\bbâtit\b/g, 'établit'],
  [/\bavant de bâtir\b/g, 'avant de construire'],
  [/\bd[’']emballage d[’']intégration/g, 'de package d’intégration'],
  [/\bd[’']package d[’']intégration/g, 'de package d’intégration'],
  [/\bemballage d[’']intégration/g, 'package d’intégration'],
  [/Défenseur : MDI/g, 'Defender for Identity : MDI'],
  [/\bdétonées?\b/g, (m: string) => m.endsWith('s')||m.endsWith('e') ? m.replace('détonée','détonnée') : 'détonné'],
  [/\bnon supportée\b/g, 'non prise en charge'],
  [/\bsupportées\b/g, 'prises en charge'],
  [/\bsupportent\b/g, 'prennent en charge'],
  [/\bSupporte\b/g, 'Prend en charge'],
  [/\bsupporte\b/g, 'prend en charge'],
  [/\bchecklists?\b/g, 'liste de contrôle'],
  [/\bliste de vérification\b/g, 'liste de contrôle'],
  [/\btout le monde\b/g, 'tous'],
];
const TICKET_SKIP = /Kerberos|pass-the-ticket|Golden Ticket|ticket émis|ticket =|si ticket est/;
function norm(s: string): string {
  return s.split(/(`[^`]*`)/).map((part, i) => {
    if (i % 2) return part;
    let a = RULES.reduce((x, [re, to]) => x.replace(re, to as string), part);
    if (!TICKET_SKIP.test(s)) a = a.replace(/(?<![-\w])([Tt])ickets?\b/g, (m: string, c: string) => `${c === 'T' ? 'B' : 'b'}illet${m.endsWith('s') ? 's' : ''}`);
    return a;
  }).join('');
}
const all: Record<string, { k: string; s: string }[]> = JSON.parse(readFileSync('/tmp/claude-0/w/all.json', 'utf8'));
for (const [t, arr] of Object.entries(all)) {
  const dir = `src/i18n/dictfr/${t}`;
  mkdirSync(dir, { recursive: true });
  const dict: Record<string, string> = {};
  for (const f of readdirSync(dir).sort()) if (f.endsWith('.json')) Object.assign(dict, JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
  const res: Record<string, string> = {};
  for (const { k, s } of arr) {
    const cur = dict[k] ?? s;
    const n = norm(cur);
    if (n !== cur) res[k] = n;
  }
  const c = Object.keys(res).length;
  if (c) {
    const next = String(readdirSync(dir).filter((f) => f.endsWith('.json')).length).padStart(3, '0');
    writeFileSync(`${dir}/${next}.json`, JSON.stringify(res));
  }
  console.log(t, c);
}
await import('./f-gen.ts');
