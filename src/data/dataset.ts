// Jeux de données FICTIFS et déterministes pour les exercices.
// Entreprise simulée : Nordlys Technologies (domaine nordlys.example, adresses IP des plages de
// documentation RFC 5737 : 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24).
//
// Deux familles de tables, volontairement séparées (comme dans la réalité) :
//  - Sentinel / Log Analytics : SigninLogs, AuditLogs, AzureActivity, SecurityEvent, Syslog, Heartbeat, CommonSecurityLog
//  - Defender XDR (Advanced Hunting) : DeviceProcessEvents, DeviceNetworkEvents, DeviceLogonEvents, DeviceInfo, DeviceEvents, EmailEvents, EmailUrlInfo
//
// buildDataset(seed) génère le « bruit » à partir de la graine ; les incidents plantés fixes sont
// identiques pour toutes les graines. Certains incidents ont une variante dépendant de la graine :
// cela permet de vérifier qu'une requête applique une logique générale (et pas des valeurs codées en dur).

import type { Row, Table, Ty, Value } from '../kql/types.ts';
import { getLang } from '../i18n/lang.ts';

export const SIM_NOW = new Date('2026-03-12T12:00:00Z');

export type DatasetContext = 'sentinel' | 'defender-xdr';

export const SENTINEL_TABLES = ['SigninLogs', 'AuditLogs', 'AzureActivity', 'SecurityEvent', 'Syslog', 'Heartbeat', 'CommonSecurityLog'] as const;
export const XDR_TABLES = ['DeviceProcessEvents', 'DeviceNetworkEvents', 'DeviceLogonEvents', 'DeviceInfo', 'DeviceEvents', 'EmailEvents', 'EmailUrlInfo'] as const;

export interface Dataset {
  seed: number;
  tables: Record<string, Table>;
}

// ------------------------------------------------------------------------ outils

function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;
const int = (r: Rng, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
const pick = <T>(r: Rng, arr: readonly T[]): T => arr[Math.floor(r() * arr.length)];
const chance = (r: Rng, p: number) => r() < p;

/** Date UTC : jour 0 = 2026-03-05 (jeudi). */
const at = (day: number, h: number, m = 0, s = 0) => new Date(Date.UTC(2026, 2, 5 + day, h, m, s));
const dayName = (day: number) => ['jeu', 'ven', 'sam', 'dim', 'lun', 'mar', 'mer', 'jeu'][day % 7];
const isWeekend = (day: number) => ['sam', 'dim'].includes(dayName(day));

type Col = [name: string, kql: string];
type RawRows = Partial<Record<string, Value>>[];

function tyOf(k: string): Ty {
  switch (k) {
    case 'string':
      return 'string';
    case 'long':
    case 'int':
    case 'real':
      return 'number';
    case 'datetime':
      return 'datetime';
    case 'bool':
      return 'bool';
    case 'dynamic':
      return 'dynamic';
    case 'timespan':
      return 'timespan';
    default:
      return 'any';
  }
}

function table(cols: Col[], rows: Partial<Record<string, Value>>[]): Table {
  const columns = cols.map((c) => c[0]);
  const types: Record<string, Ty> = {};
  const kqlTypes: Record<string, string> = {};
  for (const [n, k] of cols) {
    types[n] = tyOf(k);
    kqlTypes[n] = k;
  }
  const full: Row[] = rows.map((r) => {
    const o: Row = {};
    for (const [n, k] of cols) {
      const v = r[n];
      o[n] = v === undefined ? (k === 'string' ? '' : null) : v;
    }
    return o;
  });
  const first = cols[0];
  if (first && first[1] === 'datetime') {
    full.sort((a, b) => (a[first[0]] as Date).getTime() - (b[first[0]] as Date).getTime());
  }
  return { columns, types, rows: full, kqlTypes };
}

// -------------------------------------------------------------------- référentiel

interface Person {
  upn: string;
  name: string;
  home: string;
  city: string;
  os: string;
  browser: string;
  pc: string;
  sam: string;
}

const NAMES: [string, string, string][] = [
  ['Camille', 'Tremblay', 'c.tremblay'],
  ['Mathieu', 'Gagnon', 'm.gagnon'],
  ['Sophie', 'Roy', 's.roy'],
  ['Olivier', 'Côté', 'o.cote'],
  ['Léa', 'Bouchard', 'l.bouchard'],
  ['Samuel', 'Gauthier', 's.gauthier'],
  ['Émilie', 'Morin', 'e.morin'],
  ['Nicolas', 'Lavoie', 'n.lavoie'],
  ['Julie', 'Fortin', 'j.fortin'],
  ['Alexandre', 'Pelletier', 'a.pelletier'],
  ['Isabelle', 'Gagné', 'i.gagne'],
  ['Maxime', 'Bergeron', 'm.bergeron'],
  ['Catherine', 'Lévesque', 'c.levesque'],
  ['Vincent', 'Leblanc', 'v.leblanc'],
  ['Audrey', 'Simard', 'a.simard'],
  ['Philippe', 'Poirier', 'p.poirier'],
  ['Chloé', 'Ouellet', 'c.ouellet'],
  ['Antoine', 'Bélanger', 'a.belanger'],
  ['Marie-Ève', 'Caron', 'me.caron'],
  ['Jonathan', 'Martel', 'j.martel'],
];

const CITIES = ['Québec', 'Montréal', 'Lévis', 'Sherbrooke', 'Trois-Rivières'];
const OSES = ['Windows 11', 'Windows 11', 'Windows 10', 'macOS', 'iOS', 'Android'];
const BROWSERS = ['Edge 122.0', 'Chrome 122.0', 'Firefox 123.0', 'Safari 17.3'];

export const PEOPLE: Person[] = NAMES.map(([f, l, sam], i) => ({
  upn: `${sam}@nordlys.example`,
  name: `${f} ${l}`,
  home: `198.51.100.${10 + i}`,
  city: CITIES[i % CITIES.length],
  os: OSES[i % OSES.length],
  browser: BROWSERS[i % BROWSERS.length],
  pc: `PC-${String(i + 1).padStart(3, '0')}`,
  sam,
}));

const OFFICE_IP = '192.0.2.10';
const WORKSTATIONS = PEOPLE.map((p) => p.pc);
const SERVERS = ['SRV-DC01', 'SRV-FILE01', 'SRV-WEB01'];
const LINUX = ['LNX-APP01', 'LNX-DB01'];
const SUBSCRIPTION = '4d2f8a10-7c3b-4e5a-9a11-0b6d2c9e1f21';

const SIGNIN_RESULTS: [string, string][] = [
  ['0', 'Success'],
  ['50126', 'Invalid username or password or Invalid on-premise username or password.'],
  ['50074', 'Strong Authentication is required.'],
  ['50076', 'Due to a configuration change made by your administrator, or because you moved to a new location, you must use multi-factor authentication to access the resource.'],
  ['50053', 'The account is locked, you\'ve tried to sign in too many times with an incorrect user ID or password.'],
  ['50057', 'User account is disabled.'],
];
const resultDesc = (code: string) => SIGNIN_RESULTS.find((r) => r[0] === code)?.[1] ?? 'Unknown';

// --------------------------------------------------------------------- Sentinel

function buildSignins(seed: number, fixed: Rng): RawRows {
  const rng = mulberry32(seed * 7919 + 11);
  const rows: Partial<Record<string, Value>>[] = [];
  const apps = ['Office 365 Exchange Online', 'Microsoft Teams', 'SharePoint Online', 'Azure Portal', 'Microsoft Office'];

  const add = (ts: Date, p: { upn: string; name: string }, ip: string, result: string, opts: Partial<{ app: string; os: string; browser: string; country: string; city: string; client: string; ua: string; ca: string; risk: string }> = {}) => {
    if (ts > SIM_NOW) return;
    const country = opts.country ?? 'CA';
    rows.push({
      TimeGenerated: ts,
      UserPrincipalName: p.upn,
      UserDisplayName: p.name,
      IPAddress: ip,
      AppDisplayName: opts.app ?? pick(rng, apps),
      ResultType: result,
      ResultDescription: resultDesc(result),
      Location: country,
      ClientAppUsed: opts.client ?? 'Browser',
      ConditionalAccessStatus: result === '0' ? 'success' : result === '50076' || result === '50074' ? 'failure' : 'notApplied',
      RiskLevelDuringSignIn: opts.risk ?? 'none',
      UserAgent: opts.ua ?? 'Mozilla/5.0',
      DeviceDetail: { operatingSystem: opts.os ?? 'Windows 11', browser: opts.browser ?? 'Edge 122.0', isCompliant: (opts.os ?? 'Windows 11') !== 'Linux' },
      LocationDetails: { city: opts.city ?? 'Québec', countryOrRegion: country, state: country === 'CA' ? 'Québec' : '' },
    });
  };

  // Bruit : activité quotidienne normale
  for (let d = 0; d <= 7; d++) {
    for (const p of PEOPLE) {
      const n = isWeekend(d) ? (chance(rng, 0.2) ? 1 : 0) : int(rng, 3, 7);
      for (let i = 0; i < n; i++) {
        const ts = at(d, int(rng, 11, 20), int(rng, 0, 59), int(rng, 0, 59));
        const ip = chance(rng, 0.7) ? p.home : OFFICE_IP;
        const roll = rng();
        const result = roll < 0.93 ? '0' : roll < 0.955 ? '50126' : roll < 0.985 ? '50074' : roll < 0.995 ? '50076' : '50053';
        add(ts, p, ip, result, { os: p.os, browser: p.browser, city: p.city });
      }
    }
  }

  const byName = (sam: string) => PEOPLE.find((p) => p.sam === sam)!;
  const atk = (ts: Date, sam: string, ip: string, result: string, ua = 'python-requests/2.31.0') =>
    add(ts, byName(sam), ip, result, { os: 'Linux', browser: 'Python', country: 'RU', city: 'Moscou', client: 'Other clients', ua, risk: result === '0' ? 'high' : 'medium', app: 'Office 365 Exchange Online' });

  // P1 : password spray (fixe) 2026-03-10 02:14 - 02:41 UTC depuis 203.0.113.45, un compte compromis
  const SPRAY_IP = '203.0.113.45';
  const targets = PEOPLE.slice(0, 14);
  let t = at(5, 2, 14, 0);
  targets.forEach((p) => {
    for (let k = 0; k < 2; k++) {
      atk(new Date(t.getTime() + k * 31_000), p.sam, SPRAY_IP, '50126');
    }
    t = new Date(t.getTime() + int(fixed, 100, 130) * 1000);
  });
  atk(at(5, 2, 43, 12), 'l.bouchard', SPRAY_IP, '0');

  // P1b : second spray dépendant de la graine (sans succès), 2026-03-08 20:xx
  const spray2 = `203.0.113.${100 + ((seed * 7) % 100)}`;
  let t2 = at(3, 20, 5, 0);
  PEOPLE.slice(5, 16).forEach((p) => {
    atk(t2, p.sam, spray2, '50126', 'Mozilla/5.0 (compatible; MSIE 9.0)');
    t2 = new Date(t2.getTime() + int(rng, 40, 80) * 1000);
  });

  // P2 : force brute sur un seul compte (c.tremblay) depuis 203.0.113.77, 2026-03-09 18:00-18:20
  for (let i = 0; i < 40; i++) atk(new Date(at(4, 18, 0, 0).getTime() + i * 30_000), 'c.tremblay', '203.0.113.77', i === 39 ? '50053' : '50126');

  // P3 : déplacement impossible : s.roy se connecte du Canada puis du Brésil en 35 min
  add(at(6, 14, 5, 10), byName('s.roy'), byName('s.roy').home, '0', { os: 'Windows 11', city: 'Québec' });
  add(at(6, 14, 40, 31), byName('s.roy'), '203.0.113.120', '0', { os: 'Windows 10', country: 'BR', city: 'São Paulo', risk: 'medium', browser: 'Chrome 121.0' });

  // P4 : faux positif : mot de passe expiré, échecs répétés depuis le bureau puis succès
  for (let i = 0; i < 6; i++) add(new Date(at(6, 12, 30, 0).getTime() + i * 90_000), byName('m.gagnon'), OFFICE_IP, '50126', { os: 'Windows 11' });
  add(at(6, 12, 41, 0), byName('m.gagnon'), OFFICE_IP, '0', { os: 'Windows 11' });

  return rows;
}

function buildAuditLogs(seed: number): RawRows {
  const rng = mulberry32(seed * 104729 + 3);
  const rows: Partial<Record<string, Value>>[] = [];
  const ops: [string, string][] = [
    ['Update user', 'UserManagement'],
    ['Add member to group', 'GroupManagement'],
    ['Change user password', 'UserManagement'],
    ['Update device', 'Device'],
    ['Add registered owner to device', 'Device'],
    ['User registered security info', 'UserManagement'],
  ];
  const admins = ['it.admin@nordlys.example', 'helpdesk@nordlys.example'];
  for (let i = 0; i < 160; i++) {
    const [op, cat] = pick(rng, ops);
    const target = pick(rng, PEOPLE);
    rows.push({
      TimeGenerated: at(int(rng, 0, 6), int(rng, 11, 20), int(rng, 0, 59), int(rng, 0, 59)),
      OperationName: op,
      Category: cat,
      Result: chance(rng, 0.97) ? 'success' : 'failure',
      LoggedByService: 'Core Directory',
      InitiatedBy: { user: { userPrincipalName: pick(rng, admins), ipAddress: OFFICE_IP } },
      TargetResources: [{ type: 'User', displayName: target.name, userPrincipalName: target.upn }],
    });
  }
  const evil = { user: { userPrincipalName: 'l.bouchard@nordlys.example', ipAddress: '203.0.113.45' } };
  rows.push({
    TimeGenerated: at(5, 3, 12, 5),
    OperationName: 'Add user',
    Category: 'UserManagement',
    Result: 'success',
    LoggedByService: 'Core Directory',
    InitiatedBy: evil,
    TargetResources: [{ type: 'User', displayName: 'Backup Service 2', userPrincipalName: 'svc-backup2@nordlys.example' }],
  });
  rows.push({
    TimeGenerated: at(5, 3, 15, 40),
    OperationName: 'Add member to role',
    Category: 'RoleManagement',
    Result: 'success',
    LoggedByService: 'Core Directory',
    InitiatedBy: evil,
    TargetResources: [
      {
        type: 'User',
        displayName: 'Backup Service 2',
        userPrincipalName: 'svc-backup2@nordlys.example',
        modifiedProperties: [{ displayName: 'Role.DisplayName', oldValue: '[]', newValue: '["Global Administrator"]' }],
      },
    ],
  });
  rows.push({
    TimeGenerated: at(5, 3, 18, 2),
    OperationName: 'Add member to role',
    Category: 'RoleManagement',
    Result: 'failure',
    LoggedByService: 'Core Directory',
    InitiatedBy: evil,
    TargetResources: [
      {
        type: 'User',
        displayName: 'Léa Bouchard',
        userPrincipalName: 'l.bouchard@nordlys.example',
        modifiedProperties: [{ displayName: 'Role.DisplayName', oldValue: '[]', newValue: '["Privileged Role Administrator"]' }],
      },
    ],
  });
  // Opération légitime de rôle par un administrateur (bruit « normal » pour contraste)
  rows.push({
    TimeGenerated: at(1, 15, 2, 9),
    OperationName: 'Add member to role',
    Category: 'RoleManagement',
    Result: 'success',
    LoggedByService: 'Core Directory',
    InitiatedBy: { user: { userPrincipalName: 'it.admin@nordlys.example', ipAddress: OFFICE_IP } },
    TargetResources: [
      {
        type: 'User',
        displayName: 'Mathieu Gagnon',
        userPrincipalName: 'm.gagnon@nordlys.example',
        modifiedProperties: [{ displayName: 'Role.DisplayName', oldValue: '[]', newValue: '["Helpdesk Administrator"]' }],
      },
    ],
  });
  return rows;
}

function buildAzureActivity(seed: number): RawRows {
  const rng = mulberry32(seed * 15485863 + 5);
  const rows: Partial<Record<string, Value>>[] = [];
  const callers = ['devops-pipeline@nordlys.example', 'it.admin@nordlys.example', 'a.pelletier@nordlys.example'];
  const ops: [string, string, string][] = [
    ['MICROSOFT.COMPUTE/VIRTUALMACHINES/WRITE', 'Microsoft.Compute', 'rg-app'],
    ['MICROSOFT.STORAGE/STORAGEACCOUNTS/WRITE', 'Microsoft.Storage', 'rg-data'],
    ['MICROSOFT.WEB/SITES/WRITE', 'Microsoft.Web', 'rg-app'],
    ['MICROSOFT.NETWORK/NETWORKSECURITYGROUPS/WRITE', 'Microsoft.Network', 'rg-net'],
    ['MICROSOFT.KEYVAULT/VAULTS/WRITE', 'Microsoft.KeyVault', 'rg-sec'],
    ['MICROSOFT.RESOURCES/DEPLOYMENTS/WRITE', 'Microsoft.Resources', 'rg-app'],
  ];
  for (let i = 0; i < 220; i++) {
    const [op, rp, rg] = pick(rng, ops);
    const status = chance(rng, 0.92) ? 'Succeeded' : 'Failed';
    rows.push({
      TimeGenerated: at(int(rng, 0, 6), int(rng, 11, 20), int(rng, 0, 59), int(rng, 0, 59)),
      OperationNameValue: op,
      ResourceProviderValue: rp,
      Caller: pick(rng, callers),
      CallerIpAddress: pick(rng, [OFFICE_IP, '192.0.2.20', '198.51.100.40']),
      ActivityStatusValue: status,
      CategoryValue: 'Administrative',
      ResourceGroup: rg,
      SubscriptionId: SUBSCRIPTION,
    });
  }
  const evil = 'svc-backup2@nordlys.example';
  const ip = '203.0.113.45';
  rows.push({ TimeGenerated: at(5, 3, 30, 11), OperationNameValue: 'MICROSOFT.AUTHORIZATION/ROLEASSIGNMENTS/WRITE', ResourceProviderValue: 'Microsoft.Authorization', Caller: evil, CallerIpAddress: ip, ActivityStatusValue: 'Succeeded', CategoryValue: 'Administrative', ResourceGroup: '', SubscriptionId: SUBSCRIPTION });
  for (let i = 0; i < 4; i++) {
    rows.push({ TimeGenerated: at(5, 3, 40 + i, 20), OperationNameValue: 'MICROSOFT.COMPUTE/VIRTUALMACHINES/WRITE', ResourceProviderValue: 'Microsoft.Compute', Caller: evil, CallerIpAddress: ip, ActivityStatusValue: 'Succeeded', CategoryValue: 'Administrative', ResourceGroup: 'rg-prod', SubscriptionId: SUBSCRIPTION });
  }
  rows.push({ TimeGenerated: at(5, 3, 52, 3), OperationNameValue: 'MICROSOFT.INSIGHTS/DIAGNOSTICSETTINGS/DELETE', ResourceProviderValue: 'Microsoft.Insights', Caller: evil, CallerIpAddress: ip, ActivityStatusValue: 'Succeeded', CategoryValue: 'Administrative', ResourceGroup: 'rg-sec', SubscriptionId: SUBSCRIPTION });
  return rows;
}

function buildSecurityEvent(seed: number): RawRows {
  const rng = mulberry32(seed * 32452843 + 17);
  const rows: Partial<Record<string, Value>>[] = [];
  const act: Record<number, string> = {
    4624: '4624 - An account was successfully logged on.',
    4625: '4625 - An account failed to log on.',
    4672: '4672 - Special privileges assigned to new logon.',
    4688: '4688 - A new process has been created.',
    4720: '4720 - A user account was created.',
    4732: '4732 - A member was added to a security-enabled local group.',
  };
  const ev = (ts: Date, computer: string, id: number, account: string, logonType: number | null, ip: string, extra: Partial<Record<string, Value>> = {}) =>
    rows.push({ TimeGenerated: ts, Computer: computer, EventID: id, Activity: act[id], Account: account, LogonType: logonType, IpAddress: ip, ...extra });

  for (let i = 0; i < 700; i++) {
    const p = pick(rng, PEOPLE);
    const day = int(rng, 0, 7);
    const ts = at(day, int(rng, 11, 20), int(rng, 0, 59), int(rng, 0, 59));
    if (ts > SIM_NOW) continue;
    const r = rng();
    const computer = r < 0.6 ? p.pc : pick(rng, SERVERS);
    if (r < 0.55) ev(ts, computer, 4624, `NORDLYS\\${p.sam}`, pick(rng, [2, 3, 3, 10]), pick(rng, [p.home, OFFICE_IP, '-']));
    else if (r < 0.62) ev(ts, computer, 4625, `NORDLYS\\${p.sam}`, pick(rng, [2, 3]), pick(rng, [OFFICE_IP, '-']));
    else if (r < 0.7) ev(ts, computer, 4672, `NORDLYS\\${p.sam}`, null, '');
    else {
      const procs: [string, string][] = [
        ['C:\\Windows\\System32\\svchost.exe', 'svchost.exe -k netsvcs'],
        ['C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE', 'OUTLOOK.EXE'],
        ['C:\\Windows\\System32\\cmd.exe', 'cmd.exe /c ipconfig /all'],
        ['C:\\Windows\\System32\\wbem\\WmiPrvSE.exe', 'WmiPrvSE.exe -secured -Embedding'],
      ];
      const [pr, cl] = pick(rng, procs);
      ev(ts, computer, 4688, `NORDLYS\\${p.sam}`, null, '', { ProcessName: pr, CommandLine: cl });
    }
  }

  // P5 : force brute RDP contre Administrator sur SRV-FILE01, depuis 198.51.100.23 (fixe)
  const bf = '198.51.100.23';
  for (let i = 0; i < 60; i++) ev(new Date(at(4, 22, 10, 0).getTime() + i * 15_000), 'SRV-FILE01', 4625, 'NORDLYS\\Administrator', 10, bf);
  ev(at(4, 22, 27, 41), 'SRV-FILE01', 4624, 'NORDLYS\\Administrator', 10, bf);
  ev(at(4, 22, 27, 42), 'SRV-FILE01', 4672, 'NORDLYS\\Administrator', null, '');
  ev(at(4, 22, 33, 5), 'SRV-FILE01', 4720, 'NORDLYS\\Administrator', null, '', { Activity: act[4720] });
  ev(at(4, 22, 35, 10), 'SRV-FILE01', 4732, 'NORDLYS\\Administrator', null, '');
  // seconde source dépendant de la graine, contre « admin » sur SRV-WEB01 (sans succès)
  const bf2 = `198.51.100.${200 + ((seed * 13) % 50)}`;
  for (let i = 0; i < 28; i++) ev(new Date(at(2, 3, 0, 0).getTime() + i * 20_000), 'SRV-WEB01', 4625, 'NORDLYS\\admin', 3, bf2);

  return rows;
}

function buildSyslog(seed: number): RawRows {
  const rng = mulberry32(seed * 49979687 + 23);
  const rows: Partial<Record<string, Value>>[] = [];
  const add = (ts: Date, computer: string, proc: string, sev: string, msg: string, fac = 'auth') =>
    rows.push({ TimeGenerated: ts, Computer: computer, HostIP: computer === 'LNX-APP01' ? '10.20.2.11' : '10.20.2.12', Facility: fac, SeverityLevel: sev, ProcessName: proc, SyslogMessage: msg });
  for (let i = 0; i < 380; i++) {
    const ts = at(int(rng, 0, 7), int(rng, 0, 23), int(rng, 0, 59), int(rng, 0, 59));
    if (ts > SIM_NOW) continue;
    const c = pick(rng, LINUX);
    const r = rng();
    if (r < 0.35) add(ts, c, 'sshd', 'info', `Accepted publickey for deploy from 10.20.1.${int(rng, 2, 30)} port ${int(rng, 40000, 60000)} ssh2`);
    else if (r < 0.5) add(ts, c, 'sudo', 'notice', `deploy : TTY=pts/0 ; PWD=/srv/app ; USER=root ; COMMAND=/usr/bin/systemctl restart app`, 'authpriv');
    else if (r < 0.8) add(ts, c, 'CRON', 'info', `(root) CMD (/usr/local/bin/backup.sh)`, 'cron');
    else add(ts, c, 'systemd', 'info', `Started Session ${int(rng, 100, 999)} of user deploy.`, 'daemon');
  }
  // P6 : attaque par dictionnaire SSH sur LNX-APP01 (fixe)
  const names = ['admin', 'root', 'test', 'oracle', 'postgres', 'ubuntu'];
  for (let i = 0; i < 42; i++) {
    const u = names[i % names.length];
    const invalid = u !== 'root' ? 'invalid user ' : '';
    add(new Date(at(5, 1, 20, 0).getTime() + i * 7000), 'LNX-APP01', 'sshd', 'info', `Failed password for ${invalid}${u} from 203.0.113.99 port ${51000 + i} ssh2`);
  }
  add(at(5, 1, 26, 3), 'LNX-APP01', 'sshd', 'info', 'Accepted password for root from 203.0.113.99 port 51904 ssh2');
  return rows;
}

function buildHeartbeat(seed: number): RawRows {
  const rng = mulberry32(seed * 86028121 + 29);
  const rows: Partial<Record<string, Value>>[] = [];
  const all = [...WORKSTATIONS.slice(0, 12), ...SERVERS, ...LINUX];
  // Machines silencieuses : deux fixes, une dépendant de la graine
  const silentSeed = WORKSTATIONS[2 + (seed % 8)];
  const stopAt: Record<string, number> = {
    'SRV-WEB01': at(6, 6, 0).getTime(),
    'PC-009': at(3, 9, 0).getTime(),
    [silentSeed]: at(4, 15, 0).getTime(),
  };
  for (const c of all) {
    const os = LINUX.includes(c) ? 'Linux' : 'Windows';
    const ip = c.startsWith('PC-') ? `10.20.10.${parseInt(c.slice(3), 10)}` : c === 'SRV-DC01' ? '10.20.1.10' : c === 'SRV-FILE01' ? '10.20.1.15' : c === 'SRV-WEB01' ? '10.20.1.30' : c === 'LNX-APP01' ? '10.20.2.11' : '10.20.2.12';
    for (let h = 0; h <= 7 * 24 + 12; h++) {
      const ts = new Date(at(0, 0).getTime() + h * 3_600_000 + int(rng, 0, 40) * 60_000);
      if (ts > SIM_NOW) continue;
      if (stopAt[c] !== undefined && ts.getTime() >= stopAt[c]) continue;
      rows.push({ TimeGenerated: ts, Computer: c, OSType: os, Category: 'Direct Agent', ComputerIP: ip, Version: os === 'Linux' ? '1.17.2' : '10.20.18053.0' });
    }
  }
  return rows;
}

function buildCommonSecurityLog(seed: number): RawRows {
  const rng = mulberry32(seed * 122949823 + 31);
  const rows: Partial<Record<string, Value>>[] = [];
  const add = (ts: Date, src: string, dst: string, port: number, sent: number, recv: number, action: string, url = '') =>
    rows.push({ TimeGenerated: ts, DeviceVendor: 'Fortinet', DeviceProduct: 'Fortigate', Activity: action === 'Deny' ? 'traffic:forward deny' : 'traffic:forward accept', DeviceAction: action, SourceIP: src, DestinationIP: dst, DestinationPort: port, SentBytes: sent, ReceivedBytes: recv, Protocol: port === 53 ? 'UDP' : 'TCP', RequestURL: url });
  const dests = ['142.250.72.14', '52.96.108.2', '20.190.151.7', '151.101.1.69', '13.107.42.14'];
  for (let i = 0; i < 520; i++) {
    const ts = at(int(rng, 0, 7), int(rng, 0, 23), int(rng, 0, 59), int(rng, 0, 59));
    if (ts > SIM_NOW) continue;
    const r = rng();
    const src = `10.20.10.${int(rng, 1, 20)}`;
    if (r < 0.88) add(ts, src, pick(rng, dests), pick(rng, [443, 443, 443, 80]), int(rng, 500, 90_000), int(rng, 1000, 800_000), 'Accept');
    else if (r < 0.95) add(ts, src, `203.0.113.${int(rng, 1, 254)}`, pick(rng, [22, 3389, 445]), int(rng, 40, 300), 0, 'Deny');
    else add(ts, src, '10.20.1.10', 53, int(rng, 60, 200), int(rng, 100, 400), 'Accept');
  }
  // P7 : exfiltration simulée depuis le serveur de fichiers (fixe), 2026-03-10 04:10-04:40
  for (let i = 0; i < 12; i++) add(new Date(at(5, 4, 10, 0).getTime() + i * 150_000), '10.20.1.15', '203.0.113.200', 443, 30_000_000 + i * 1_200_000, 40_000, 'Accept', 'https://files.exfil-demo.example/upload');
  // seconde exfiltration dépendant de la graine, plus modeste
  const dst2 = `198.51.100.${150 + ((seed * 11) % 50)}`;
  for (let i = 0; i < 6; i++) add(new Date(at(2, 23, 0, 0).getTime() + i * 240_000), '10.20.10.7', dst2, 443, 22_000_000 + i * 900_000, 20_000, 'Accept');
  return rows;
}

// -------------------------------------------------------------------- Defender XDR

function buildXdr(seed: number): Record<string, Table> {
  const rng = mulberry32(seed * 179424673 + 37);

  // Processus
  const proc: Partial<Record<string, Value>>[] = [];
  const normal: [string, string, string, string][] = [
    ['chrome.exe', 'chrome.exe --type=renderer', 'explorer.exe', 'explorer.exe'],
    ['outlook.exe', 'OUTLOOK.EXE', 'explorer.exe', 'explorer.exe'],
    ['Teams.exe', 'Teams.exe --process-start-args', 'explorer.exe', 'explorer.exe'],
    ['svchost.exe', 'svchost.exe -k netsvcs -p', 'services.exe', 'services.exe'],
    ['powershell.exe', 'powershell.exe -ExecutionPolicy Bypass -File C:\\Scripts\\inventory.ps1', 'ccmexec.exe', 'ccmexec.exe'],
    ['cmd.exe', 'cmd.exe /c whoami', 'explorer.exe', 'explorer.exe'],
    ['msedge.exe', 'msedge.exe --type=gpu-process', 'explorer.exe', 'explorer.exe'],
  ];
  for (let i = 0; i < 520; i++) {
    const p = pick(rng, PEOPLE);
    const [file, cmd, ip, ipp] = pick(rng, normal);
    const ts = at(int(rng, 0, 7), int(rng, 11, 20), int(rng, 0, 59), int(rng, 0, 59));
    if (ts > SIM_NOW) continue;
    proc.push({ Timestamp: ts, DeviceName: `${p.pc}.nordlys.example`, AccountName: p.sam, FileName: file, ProcessCommandLine: cmd, InitiatingProcessFileName: ip, InitiatingProcessParentFileName: ipp, SHA256: `e3b0c44298fc1c149afbf4c8996fb924${String(i).padStart(32, '0')}`.slice(0, 64) });
  }
  // P8 : phishing -> macro -> PowerShell encodé (fixe) ; l'encodage décode en : Write-Host 'simulation pedagogique'
  const ENC = 'VwByAGkAdABlAC0ASABvAHMAdAAgACcAcwBpAG0AdQBsAGEAdABpAG8AbgAgAHAAZQBkAGEAZwBvAGcAaQBxAHUAZQAnAA==';
  proc.push({ Timestamp: at(6, 10, 5, 22), DeviceName: 'PC-017.nordlys.example', AccountName: 'c.ouellet', FileName: 'powershell.exe', ProcessCommandLine: `powershell.exe -nop -w hidden -enc ${ENC}`, InitiatingProcessFileName: 'WINWORD.EXE', InitiatingProcessParentFileName: 'explorer.exe', SHA256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90' });
  proc.push({ Timestamp: at(6, 10, 5, 40), DeviceName: 'PC-017.nordlys.example', AccountName: 'c.ouellet', FileName: 'whoami.exe', ProcessCommandLine: 'whoami /all', InitiatingProcessFileName: 'powershell.exe', InitiatingProcessParentFileName: 'WINWORD.EXE', SHA256: '0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c4b5a69788796a5b4c3d2e1f0' });
  // PowerShell encodé légitime (script d'inventaire géré), pour contraster
  proc.push({ Timestamp: at(2, 13, 0, 5), DeviceName: 'PC-003.nordlys.example', AccountName: 'ccm-service', FileName: 'powershell.exe', ProcessCommandLine: `powershell.exe -NoProfile -EncodedCommand ${ENC}`, InitiatingProcessFileName: 'ccmexec.exe', InitiatingProcessParentFileName: 'services.exe', SHA256: 'b1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f91' });

  // Réseau
  const net: Partial<Record<string, Value>>[] = [];
  const goodUrls = ['outlook.office365.com', 'teams.microsoft.com', 'github.com', 'login.microsoftonline.com', 'www.google.com', 'cdn.jsdelivr.net'];
  for (let i = 0; i < 680; i++) {
    const p = pick(rng, PEOPLE);
    const ts = at(int(rng, 0, 7), int(rng, 11, 20), int(rng, 0, 59), int(rng, 0, 59));
    if (ts > SIM_NOW) continue;
    net.push({ Timestamp: ts, DeviceName: `${p.pc}.nordlys.example`, ActionType: chance(rng, 0.97) ? 'ConnectionSuccess' : 'ConnectionFailed', RemoteIP: `52.${int(rng, 96, 110)}.${int(rng, 1, 250)}.${int(rng, 1, 250)}`, RemotePort: 443, RemoteUrl: pick(rng, goodUrls), InitiatingProcessFileName: pick(rng, ['chrome.exe', 'msedge.exe', 'Teams.exe', 'outlook.exe']), InitiatingProcessAccountName: p.sam });
  }
  const phishDomain = 'n0rdlys-login.example';
  for (const [h, m, pc, sam] of [[9, 12, 'PC-017', 'c.ouellet'], [9, 31, 'PC-006', 'e.morin'], [10, 2, 'PC-011', 'c.levesque']] as [number, number, string, string][]) {
    net.push({ Timestamp: at(6, h, m, 14), DeviceName: `${pc}.nordlys.example`, ActionType: 'ConnectionSuccess', RemoteIP: '203.0.113.150', RemotePort: 443, RemoteUrl: phishDomain, InitiatingProcessFileName: 'msedge.exe', InitiatingProcessAccountName: sam });
  }
  net.push({ Timestamp: at(6, 10, 6, 30), DeviceName: 'PC-017.nordlys.example', ActionType: 'ConnectionSuccess', RemoteIP: '203.0.113.200', RemotePort: 443, RemoteUrl: 'cdn.exfil-demo.example', InitiatingProcessFileName: 'powershell.exe', InitiatingProcessAccountName: 'c.ouellet' });

  // Ouvertures de session
  const logon: Partial<Record<string, Value>>[] = [];
  for (let i = 0; i < 300; i++) {
    const p = pick(rng, PEOPLE);
    const ts = at(int(rng, 0, 7), int(rng, 11, 20), int(rng, 0, 59), int(rng, 0, 59));
    if (ts > SIM_NOW) continue;
    const ok = chance(rng, 0.95);
    logon.push({ Timestamp: ts, DeviceName: `${p.pc}.nordlys.example`, AccountName: p.sam, ActionType: ok ? 'LogonSuccess' : 'LogonFailed', LogonType: pick(rng, ['Interactive', 'Interactive', 'Network', 'RemoteInteractive']), RemoteIP: pick(rng, ['', OFFICE_IP, p.home]), FailureReason: ok ? '' : 'InvalidPassword' });
  }
  for (let i = 0; i < 25; i++) logon.push({ Timestamp: new Date(at(5, 5, 0, 0).getTime() + i * 20_000), DeviceName: 'SRV-FILE01.nordlys.example', AccountName: 'administrator', ActionType: 'LogonFailed', LogonType: 'RemoteInteractive', RemoteIP: '198.51.100.23', FailureReason: 'InvalidPassword' });

  // Courriel
  const mail: Partial<Record<string, Value>>[] = [];
  const urls: Partial<Record<string, Value>>[] = [];
  const senders = ['newsletter@vendor-news.example', 'noreply@teams.microsoft.com', 'facturation@fournisseur.example', 'rh@nordlys.example', 'it.admin@nordlys.example'];
  const subjects = ['Infolettre mensuelle', 'Rappel de réunion', 'Facture de mars', 'Politique de télétravail', 'Mise à jour planifiée'];
  let n = 0;
  for (let i = 0; i < 360; i++) {
    const p = pick(rng, PEOPLE);
    const ts = at(int(rng, 0, 7), int(rng, 11, 20), int(rng, 0, 59), int(rng, 0, 59));
    if (ts > SIM_NOW) continue;
    const s = pick(rng, senders);
    const id = `nm-${seed}-${n++}`;
    const hasUrl = chance(rng, 0.5);
    mail.push({ Timestamp: ts, NetworkMessageId: id, SenderFromAddress: s, SenderFromDomain: s.split('@')[1], RecipientEmailAddress: p.upn, Subject: pick(rng, subjects), DeliveryAction: 'Delivered', DeliveryLocation: 'Inbox/folder', ThreatTypes: '', AttachmentCount: int(rng, 0, 2), UrlCount: hasUrl ? 1 : 0, EmailDirection: s.endsWith('nordlys.example') ? 'Intra-org' : 'Inbound' });
    if (hasUrl) urls.push({ Timestamp: ts, NetworkMessageId: id, Url: `https://${s.split('@')[1]}/lien/${int(rng, 100, 999)}`, UrlDomain: s.split('@')[1], UrlLocation: 'Body' });
  }
  const phishTargets = [PEOPLE[16], PEOPLE[4], PEOPLE[6], PEOPLE[12], PEOPLE[2], PEOPLE[8], PEOPLE[11], PEOPLE[18]];
  phishTargets.forEach((p, i) => {
    const id = `nm-phish-${i}`;
    const blocked = i >= 6;
    const ts = at(6, 9, i * 2, 30);
    mail.push({ Timestamp: ts, NetworkMessageId: id, SenderFromAddress: `it-support@${phishDomain}`, SenderFromDomain: phishDomain, RecipientEmailAddress: p.upn, Subject: 'Action requise : vérification MFA', DeliveryAction: blocked ? 'Blocked' : 'Delivered', DeliveryLocation: blocked ? 'Quarantine' : 'Inbox/folder', ThreatTypes: blocked ? 'Phish' : '', AttachmentCount: 0, UrlCount: 1, EmailDirection: 'Inbound' });
    urls.push({ Timestamp: ts, NetworkMessageId: id, Url: `https://${phishDomain}/mfa/verify?u=${i}`, UrlDomain: phishDomain, UrlLocation: 'Body' });
  });
  // seconde campagne dépendant de la graine
  const c2 = 3 + (seed % 3);
  for (let i = 0; i < c2; i++) {
    const p = PEOPLE[(i * 3 + seed) % PEOPLE.length];
    const id = `nm-fact-${i}`;
    const ts = at(4, 14, i * 3, 0);
    mail.push({ Timestamp: ts, NetworkMessageId: id, SenderFromAddress: 'billing@invoice-nordlys.example', SenderFromDomain: 'invoice-nordlys.example', RecipientEmailAddress: p.upn, Subject: 'Facture impayée', DeliveryAction: 'Delivered', DeliveryLocation: 'Inbox/folder', ThreatTypes: '', AttachmentCount: 1, UrlCount: 1, EmailDirection: 'Inbound' });
    urls.push({ Timestamp: ts, NetworkMessageId: id, Url: 'https://invoice-nordlys.example/pay', UrlDomain: 'invoice-nordlys.example', UrlLocation: 'Body' });
  }


  // Inventaire des appareils (DeviceInfo) : un enregistrement par appareil, Timestamp = dernier signalement du capteur.
  // Deux appareils muets fixes et un troisième qui dépend de la graine : de quoi pratiquer la détection de perte de télémétrie.
  const devices: Partial<Record<string, Value>>[] = [];
  const silent = new Set([PEOPLE[3].pc, PEOPLE[9].pc, PEOPLE[12 + (seed % 5)].pc]);
  for (const p of PEOPLE) {
    const mute = silent.has(p.pc);
    devices.push({ Timestamp: mute ? at(1, 9 + (p.pc.length % 3), 14, 5) : at(7, 10, int(rng, 0, 59), int(rng, 0, 59)), DeviceId: `dev-${p.pc.toLowerCase()}`, DeviceName: `${p.pc}.nordlys.example`, OSPlatform: p.os.startsWith('Win') ? p.os : 'Windows11', OnboardingStatus: 'Onboarded', SensorHealthState: mute ? 'Inactive' : 'Active', ExposureLevel: pick(rng, ['Low', 'Low', 'Medium']), MachineGroup: 'Postes' });
  }
  devices.push({ Timestamp: at(7, 11, 20, 0), DeviceId: 'dev-srv-file01', DeviceName: 'SRV-FILE01.nordlys.example', OSPlatform: 'WindowsServer2022', OnboardingStatus: 'Onboarded', SensorHealthState: 'Active', ExposureLevel: 'Medium', MachineGroup: 'Serveurs' });
  devices.push({ Timestamp: at(6, 22, 40, 0), DeviceId: 'dev-srv-dc01', DeviceName: 'SRV-DC01.nordlys.example', OSPlatform: 'WindowsServer2022', OnboardingStatus: 'Onboarded', SensorHealthState: 'Impaired communications', ExposureLevel: 'High', MachineGroup: 'Serveurs' });
  devices.push({ Timestamp: at(3, 8, 0, 0), DeviceId: 'dev-pc-091', DeviceName: 'PC-091.nordlys.example', OSPlatform: 'Windows11', OnboardingStatus: 'Can be onboarded', SensorHealthState: 'No sensor data', ExposureLevel: 'Unknown', MachineGroup: 'Postes' });

  // Événements d’appareil (DeviceEvents) : règles ASR en audit ou en blocage et supports amovibles.
  const dev: Partial<Record<string, Value>>[] = [];
  const asrNoise: [string, string, string][] = [
    ['AsrExecutableEmailContentAudited', 'setup-fournisseur.exe', 'OUTLOOK.EXE'],
    ['AsrOfficeChildProcessAudited', 'cmd.exe', 'EXCEL.EXE'],
    ['AsrScriptExecutableDownloadAudited', 'inventory.ps1', 'powershell.exe'],
  ];
  for (let i = 0; i < 40; i++) {
    const p = pick(rng, PEOPLE);
    const [act, file, init] = pick(rng, asrNoise);
    const ts = at(int(rng, 0, 7), int(rng, 11, 20), int(rng, 0, 59), int(rng, 0, 59));
    if (ts > SIM_NOW) continue;
    dev.push({ Timestamp: ts, DeviceName: `${p.pc}.nordlys.example`, ActionType: act, FileName: file, FolderPath: `C:\\Users\\${p.sam}\\AppData\\Local\\Temp\\${file}`, InitiatingProcessFileName: init, InitiatingProcessAccountName: p.sam, AdditionalFields: '{"IsAudit":"true"}' });
  }
  for (let i = 0; i < 4; i++) dev.push({ Timestamp: at(6, 10, 5, 18 + i), DeviceName: 'PC-017.nordlys.example', ActionType: 'AsrOfficeChildProcessAudited', FileName: 'powershell.exe', FolderPath: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', InitiatingProcessFileName: 'WINWORD.EXE', InitiatingProcessAccountName: 'c.ouellet', AdditionalFields: '{"IsAudit":"true","RuleId":"d4f940ab-401b-4efc-aadc-ad5f3c50688a"}' });
  for (let i = 0; i < 6; i++) {
    const p = PEOPLE[(i * 2 + 1) % PEOPLE.length];
    dev.push({ Timestamp: at(2 + (i % 4), 13, 10 + i, 0), DeviceName: `${p.pc}.nordlys.example`, ActionType: i % 3 === 0 ? 'UsbDriveMounted' : 'PnpDeviceConnected', FileName: '', FolderPath: i % 3 === 0 ? 'E:\\' : '', InitiatingProcessFileName: 'svchost.exe', InitiatingProcessAccountName: 'system', AdditionalFields: `{"ProductName":"USB DISK ${i}","VendorId":"0951"}` });
  }
  dev.push({ Timestamp: at(5, 16, 42, 0), DeviceName: `${PEOPLE.find((x) => x.sam === 'm.gagnon')!.pc}.nordlys.example`, ActionType: 'RemovableStorageAccessTriggered', FileName: 'plans-clients.xlsx', FolderPath: 'E:\\plans-clients.xlsx', InitiatingProcessFileName: 'explorer.exe', InitiatingProcessAccountName: 'm.gagnon', AdditionalFields: '{"Policy":"Refuser l’écriture","AccessMask":"write","Result":"Denied"}' });

  return {
    DeviceProcessEvents: table(
      [
        ['Timestamp', 'datetime'],
        ['DeviceName', 'string'],
        ['AccountName', 'string'],
        ['FileName', 'string'],
        ['ProcessCommandLine', 'string'],
        ['InitiatingProcessFileName', 'string'],
        ['InitiatingProcessParentFileName', 'string'],
        ['SHA256', 'string'],
      ],
      proc,
    ),
    DeviceNetworkEvents: table(
      [
        ['Timestamp', 'datetime'],
        ['DeviceName', 'string'],
        ['ActionType', 'string'],
        ['RemoteIP', 'string'],
        ['RemotePort', 'int'],
        ['RemoteUrl', 'string'],
        ['InitiatingProcessFileName', 'string'],
        ['InitiatingProcessAccountName', 'string'],
      ],
      net,
    ),
    DeviceLogonEvents: table(
      [
        ['Timestamp', 'datetime'],
        ['DeviceName', 'string'],
        ['AccountName', 'string'],
        ['ActionType', 'string'],
        ['LogonType', 'string'],
        ['RemoteIP', 'string'],
        ['FailureReason', 'string'],
      ],
      logon,
    ),
    DeviceInfo: table(
      [
        ['Timestamp', 'datetime'],
        ['DeviceId', 'string'],
        ['DeviceName', 'string'],
        ['OSPlatform', 'string'],
        ['OnboardingStatus', 'string'],
        ['SensorHealthState', 'string'],
        ['ExposureLevel', 'string'],
        ['MachineGroup', 'string'],
      ],
      devices,
    ),
    DeviceEvents: table(
      [
        ['Timestamp', 'datetime'],
        ['DeviceName', 'string'],
        ['ActionType', 'string'],
        ['FileName', 'string'],
        ['FolderPath', 'string'],
        ['InitiatingProcessFileName', 'string'],
        ['InitiatingProcessAccountName', 'string'],
        ['AdditionalFields', 'string'],
      ],
      dev,
    ),
    EmailEvents: table(
      [
        ['Timestamp', 'datetime'],
        ['NetworkMessageId', 'string'],
        ['SenderFromAddress', 'string'],
        ['SenderFromDomain', 'string'],
        ['RecipientEmailAddress', 'string'],
        ['Subject', 'string'],
        ['DeliveryAction', 'string'],
        ['DeliveryLocation', 'string'],
        ['ThreatTypes', 'string'],
        ['AttachmentCount', 'int'],
        ['UrlCount', 'int'],
        ['EmailDirection', 'string'],
      ],
      mail,
    ),
    EmailUrlInfo: table(
      [
        ['Timestamp', 'datetime'],
        ['NetworkMessageId', 'string'],
        ['Url', 'string'],
        ['UrlDomain', 'string'],
        ['UrlLocation', 'string'],
      ],
      urls,
    ),
  };
}

// ------------------------------------------------------------------------- API

const cache = new Map<number, Dataset>();

export function buildDataset(seed: number): Dataset {
  const hit = cache.get(seed);
  if (hit) return hit;
  const fixed = mulberry32(424242);
  const tables: Record<string, Table> = {
    SigninLogs: table(SIGNIN_COLS, buildSignins(seed, fixed)),
    AuditLogs: table(AUDIT_COLS, buildAuditLogs(seed)),
    AzureActivity: table(AZ_COLS, buildAzureActivity(seed)),
    SecurityEvent: table(SEC_COLS, buildSecurityEvent(seed)),
    Syslog: table(SYS_COLS, buildSyslog(seed)),
    Heartbeat: table(HB_COLS, buildHeartbeat(seed)),
    CommonSecurityLog: table(CSL_COLS, buildCommonSecurityLog(seed)),
    ...buildXdr(seed),
  };
  const ds: Dataset = { seed, tables };
  cache.set(seed, ds);
  return ds;
}

const SIGNIN_COLS: Col[] = [
  ['TimeGenerated', 'datetime'],
  ['UserPrincipalName', 'string'],
  ['UserDisplayName', 'string'],
  ['IPAddress', 'string'],
  ['AppDisplayName', 'string'],
  ['ResultType', 'string'],
  ['ResultDescription', 'string'],
  ['Location', 'string'],
  ['ClientAppUsed', 'string'],
  ['ConditionalAccessStatus', 'string'],
  ['RiskLevelDuringSignIn', 'string'],
  ['UserAgent', 'string'],
  ['DeviceDetail', 'dynamic'],
  ['LocationDetails', 'dynamic'],
];
const AUDIT_COLS: Col[] = [
  ['TimeGenerated', 'datetime'],
  ['OperationName', 'string'],
  ['Category', 'string'],
  ['Result', 'string'],
  ['LoggedByService', 'string'],
  ['InitiatedBy', 'dynamic'],
  ['TargetResources', 'dynamic'],
];
const AZ_COLS: Col[] = [
  ['TimeGenerated', 'datetime'],
  ['OperationNameValue', 'string'],
  ['ResourceProviderValue', 'string'],
  ['Caller', 'string'],
  ['CallerIpAddress', 'string'],
  ['ActivityStatusValue', 'string'],
  ['CategoryValue', 'string'],
  ['ResourceGroup', 'string'],
  ['SubscriptionId', 'string'],
];
const SEC_COLS: Col[] = [
  ['TimeGenerated', 'datetime'],
  ['Computer', 'string'],
  ['EventID', 'int'],
  ['Activity', 'string'],
  ['Account', 'string'],
  ['LogonType', 'int'],
  ['IpAddress', 'string'],
  ['ProcessName', 'string'],
  ['CommandLine', 'string'],
];
const SYS_COLS: Col[] = [
  ['TimeGenerated', 'datetime'],
  ['Computer', 'string'],
  ['HostIP', 'string'],
  ['Facility', 'string'],
  ['SeverityLevel', 'string'],
  ['ProcessName', 'string'],
  ['SyslogMessage', 'string'],
];
const HB_COLS: Col[] = [
  ['TimeGenerated', 'datetime'],
  ['Computer', 'string'],
  ['OSType', 'string'],
  ['Category', 'string'],
  ['ComputerIP', 'string'],
  ['Version', 'string'],
];
const CSL_COLS: Col[] = [
  ['TimeGenerated', 'datetime'],
  ['DeviceVendor', 'string'],
  ['DeviceProduct', 'string'],
  ['Activity', 'string'],
  ['DeviceAction', 'string'],
  ['SourceIP', 'string'],
  ['DestinationIP', 'string'],
  ['DestinationPort', 'int'],
  ['Protocol', 'string'],
  ['SentBytes', 'long'],
  ['ReceivedBytes', 'long'],
  ['RequestURL', 'string'],
];

const XDR_NOTE = 'Cette table appartient à Defender XDR (Advanced Hunting), pas à Log Analytics/Sentinel : elle n’est pas disponible dans ce contexte. Dans Sentinel, les équivalents proviennent du connecteur Defender XDR (tables Device*/Email*) lorsqu’il est activé.';
const SENTINEL_NOTE = 'Cette table appartient à Microsoft Sentinel / Log Analytics, pas à Defender XDR (Advanced Hunting) : elle n’est pas disponible dans ce contexte. Dans Advanced Hunting, la colonne de temps s’appelle Timestamp (et non TimeGenerated).';

export function contextTables(ds: Dataset, ctx: DatasetContext): { tables: Record<string, Table>; unavailable: Record<string, string> } {
  const keep = ctx === 'sentinel' ? SENTINEL_TABLES : XDR_TABLES;
  const drop = ctx === 'sentinel' ? XDR_TABLES : SENTINEL_TABLES;
  const tables: Record<string, Table> = {};
  for (const n of keep) tables[n] = ds.tables[n];
  const unavailable: Record<string, string> = {};
  for (const n of drop) unavailable[n] = ctx === 'sentinel' ? XDR_NOTE : SENTINEL_NOTE;
  return { tables, unavailable };
}

export const DATASET_NOTE =
  'Données fictives générées pour l’apprentissage (entreprise simulée « Nordlys Technologies »). Les adresses IP appartiennent aux plages de documentation (RFC 5737). L’horloge simulée est 2026-03-12 12:00 UTC : ago(1d) est évalué par rapport à cette heure.';
export const DATASET_NOTE_EN =
  'Fictional data generated for learning (simulated company “Nordlys Technologies”). The IP addresses belong to the documentation ranges (RFC 5737). The simulated clock is 2026-03-12 12:00 UTC: ago(1d) is evaluated relative to that time.';
export const datasetNote = () => (getLang() === 'en' ? DATASET_NOTE_EN : DATASET_NOTE);
