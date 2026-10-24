import { describe, expect, it } from 'vitest';
import { buildDataset, contextTables, SIM_NOW } from '../src/data/dataset.ts';
import { runQuery } from '../src/kql/index.ts';

const A = buildDataset(1);
const B = buildDataset(2);
const ctxS = contextTables(A, 'sentinel');
const ctxX = contextTables(A, 'defender-xdr');

const q = (src: string, ds = ctxS) => runQuery(src, { tables: ds.tables, unavailableTables: ds.unavailable, now: SIM_NOW });

describe('jeux de données fictifs', () => {
  it('sont déterministes pour une graine donnée', () => {
    const a1 = buildDataset(1).tables.SigninLogs.rows.length;
    expect(a1).toBe(A.tables.SigninLogs.rows.length);
    expect(A.tables.SigninLogs.rows.length).not.toBe(B.tables.SigninLogs.rows.length);
  });
  it('ont des tailles raisonnables', () => {
    for (const [name, t] of Object.entries(A.tables)) {
      expect(t.rows.length, name).toBeGreaterThan(10);
      expect(t.rows.length, name).toBeLessThan(6000);
    }
  });
  it('ne contiennent aucune date dans le futur de l’horloge simulée', () => {
    for (const [name, t] of Object.entries(A.tables)) {
      const c = t.columns[0];
      for (const r of t.rows) expect((r[c] as Date).getTime(), name).toBeLessThanOrEqual(SIM_NOW.getTime());
    }
  });
  it('séparent les tables Sentinel et Defender XDR', () => {
    const r = q('DeviceProcessEvents | take 1');
    expect(r.ok).toBe(false);
    const r2 = q('SigninLogs | take 1', ctxX);
    expect(r2.ok).toBe(false);
  });
  it('contiennent le password spray planté (14 comptes depuis 203.0.113.45)', () => {
    const r = q('SigninLogs | where ResultType == "50126" | summarize Comptes = dcount(UserPrincipalName) by IPAddress | where Comptes >= 10 | sort by IPAddress asc');
    expect(r.ok).toBe(true);
    if (r.ok) {
      const ips = r.table.rows.map((x) => x.IPAddress);
      expect(ips).toContain('203.0.113.45');
      expect(ips.length).toBe(2); // + le second spray dépendant de la graine
    }
  });
  it('le second spray change avec la graine', () => {
    const f = (ds: typeof ctxS) => {
      const r = q('SigninLogs | where ResultType == "50126" | summarize Comptes = dcount(UserPrincipalName) by IPAddress | where Comptes >= 10', ds);
      return r.ok ? r.table.rows.map((x) => x.IPAddress as string).sort().join(',') : '';
    };
    expect(f(ctxS)).not.toBe(f(contextTables(B, 'sentinel')));
  });
  it('contiennent les machines silencieuses dans Heartbeat', () => {
    const r = q('Heartbeat | summarize arg_max(TimeGenerated, *) by Computer | where TimeGenerated < ago(1d) | project Computer | sort by Computer asc');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.table.rows.length).toBe(3);
  });
  it('contiennent l’exfiltration plantée', () => {
    const r = q('CommonSecurityLog | where DeviceAction == "Accept" | summarize Total = sum(SentBytes) by SourceIP, DestinationIP | where Total > 100000000 | sort by Total desc');
    expect(r.ok).toBe(true);
    // exfiltration principale (fixe) + une seconde, plus modeste, dépendant de la graine
    if (r.ok) expect(r.table.rows.length).toBe(2);
  });
  it('contiennent la chaîne de phishing dans Defender XDR', () => {
    const r = q('EmailEvents | where SenderFromDomain == "n0rdlys-login.example" | summarize n = count(), bloques = countif(DeliveryAction == "Blocked")', ctxX);
    expect(r.ok).toBe(true);
    if (r.ok) expect([r.table.rows[0].n, r.table.rows[0].bloques]).toEqual([8, 2]);
  });
});
