// Tests de bout en bout dans un vrai navigateur (Playwright + Chromium).
// Usage : npm run build && node e2e/smoke.cjs
// Playwright n'est pas une dépendance du projet : installez-le globalement (npm i -g playwright) ou localement.
// Variante sous-répertoire : VITE_BASE=/soc-academy/ npx vite build --outDir dist-sub && E2E_SUBPATH=1 node e2e/smoke.cjs
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright est introuvable. Installez-le (npm i -g playwright) puis relancez.');
  process.exit(2);
}

const SUB = process.env.E2E_SUBPATH === '1';
const ROOT = path.join(__dirname, '..', SUB ? 'dist-sub' : 'dist');
const PREFIX = SUB ? '/soc-academy/' : '/';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json' };

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let url = decodeURIComponent((req.url || '/').split('?')[0]);
      if (!url.startsWith(PREFIX)) {
        res.writeHead(404).end('hors du préfixe');
        return;
      }
      url = url.slice(PREFIX.length) || 'index.html';
      const file = path.join(ROOT, url);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404).end('introuvable');
        return;
      }
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

const results = [];
const ok = (name, cond, extra = '') => {
  results.push({ name, pass: !!cond });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  ' + extra}`);
};

(async () => {
  const srv = await serve();
  const base = `http://127.0.0.1:${srv.address().port}${PREFIX}`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const progress = () => page.evaluate(() => JSON.parse(localStorage.getItem('boreal.progress.v1') || 'null'));
  const go = async (hash) => { await page.goto(base + '#/' + hash); await page.waitForLoadState('domcontentloaded'); };

  // 1. Accueil et navigation
  await page.goto(base);
  await page.waitForSelector('h1');
  ok('accueil : titre affiché', (await page.textContent('h1')).length > 3);
  for (const r of ['catalogue', 'tableau', 'terrain', 'revision', 'couverture', 'limites', 'labos', 'parcours/kql', 'cours/cours-kql-bases']) {
    await go(r);
    await page.waitForSelector('h1');
    ok(`navigation : #/${r}`, (await page.textContent('h1')).length > 1);
  }

  // 2. Déverrouillage : un exercice de niveau 2 est fermé au départ
  await go('exercice/kql-031');
  await page.waitForSelector('h2');
  const lockedText = await page.textContent('body');
  ok('verrouillage : kql-031 fermé au départ', /verrouillé/i.test(lockedText), lockedText.slice(0, 200));

  // 3. Mode « tout déverrouiller » + KQL : réponse fausse puis correcte
  await page.evaluate(() => localStorage.setItem('boreal.progress.v1', JSON.stringify({ v: 1, settings: { unlockAll: true, theme: 'dark' } })));
  await go('exercice/kql-003');
  await page.reload();
  await page.waitForSelector('textarea');
  await page.fill('textarea', 'SigninLogs | take 3');
  await page.click('text=Valider ma réponse');
  await page.waitForSelector('.verdict');
  ok('kql : mauvaise requête refusée', /pas celui attendu|incorrect|attendu/i.test(await page.textContent('.verdict')));
  await page.fill('textarea', 'SigninLogs\n| where ResultType != "0"\n| summarize Echecs = count() by UserPrincipalName\n| top 3 by Echecs desc');
  await page.click('text=Valider ma réponse');
  await page.waitForFunction(() => /Correct/.test(document.querySelector('.verdict')?.textContent || ''));
  ok('kql : bonne requête acceptée', true);
  ok('réussite : célébration (+XP) affichée', (await page.$$('.celebrate .xp-burst')).length === 1);
  let pr = await progress();
  ok('progression : enregistrée dans localStorage', pr && pr.done && pr.done['kql-003'] && pr.done['kql-003'].xp > 0);
  await page.reload();
  await page.waitForSelector('h1');
  pr = await progress();
  ok('progression : survit au rechargement', pr && pr.done['kql-003']);

  // 4. Remise en ordre au clavier et avec les boutons (alternative au glisser-déposer)
  await go('exercice/az-022');
  await page.waitForSelector('.dnd-item');
  const target = [
    'Déployer la passerelle VPN dans le GatewaySubnet du hub',
    'Sur le peering hub vers spoke : activer « Allow gateway transit »',
    'Sur le peering spoke vers hub : activer « Use remote gateways »',
    'Vérifier les routes effectives sur l’interface réseau d’une VM du spoke',
  ];
  for (let i = 0; i < target.length; i++) {
    for (let guard = 0; guard < 10; guard++) {
      const labels = await page.$$eval('.dnd-item .grow', (els) => els.map((e) => e.textContent.trim()));
      const at = labels.indexOf(target[i]);
      if (at <= i) break;
      await page.click(`button[aria-label="Monter : ${target[i]}"]`);
    }
  }
  await page.click('text=Valider l’ordre');
  await page.waitForSelector('.verdict');
  ok('ordre : réussi avec les boutons', /Correct|réussi|bien/i.test(await page.textContent('.verdict')), await page.textContent('.verdict'));

  // 5. Glisser-déposer réel (HTML5) : déplacer le dernier élément en première position
  await go('exercice/az-022');
  await page.waitForSelector('.dnd-item');
  const before = await page.$$eval('.dnd-item .grow', (els) => els.map((e) => e.textContent.trim()));
  for (let t = 0; t < 3; t++) {
    await page.dragAndDrop('.dnd-item:last-child', '.dnd-item:first-child');
    const changed = await page.waitForFunction((b) => [...document.querySelectorAll('.dnd-item .grow')].map((e) => e.textContent.trim()).join('|') !== b, before.join('|'), { timeout: 1500 }).then(() => true).catch(() => false);
    if (changed) break;
  }
  const after = await page.$$eval('.dnd-item .grow', (els) => els.map((e) => e.textContent.trim()));
  ok('glisser-déposer : l’ordre change', before.join('|') !== after.join('|'));

  // 6. Placement par menus (alternative au glisser-déposer)
  await go('exercice/az-019');
  await page.waitForSelector('select');
  const selects = await page.$$('select');
  ok('placement : un menu de secours par élément', selects.length === 6);
  const answers = ['Autorise', 'Autorise', 'Refuse', 'Autorise', 'Autorise', 'Refuse'];
  const items = await page.$$eval('select', (els) => els.map((e) => e.getAttribute('id')));
  const rows = await page.$$eval('label[for^="pl-"]', (els) => els.map((e) => e.textContent.trim()));
  for (let i = 0; i < items.length; i++) {
    const label = rows[i] || '';
    const want = /DenyAll/.test(label) ? 'Refuse' : 'Autorise';
    await page.selectOption('#' + items[i], { label: want });
  }
  await page.click('text=Valider le placement');
  await page.waitForSelector('.verdict');
  ok('placement : réussi avec les menus', /Correct|réussi|bien/i.test(await page.textContent('.verdict')), await page.textContent('.verdict'));
  void answers;

  // 7. Enquête multi-étapes
  await go('exercice/soc-002');
  await page.waitForSelector('#n-s1');
  await page.fill('#n-s1', '99');
  await page.click('text=Valider cette étape');
  await page.waitForSelector('.verdict.bad');
  ok('enquête : valeur fausse refusée', true);
  await page.fill('#n-s1', '14');
  await page.click('text=Valider cette étape');
  await page.waitForSelector('textarea');
  await page.fill('textarea', 'SigninLogs\n| where IPAddress == "203.0.113.45"\n| where ResultType == "0"\n| project TimeGenerated, UserPrincipalName, AppDisplayName, Location');
  await page.click('text=Valider cette étape');
  await page.waitForSelector('text=l.bouchard@nordlys.example');
  await page.click('label:has-text("l.bouchard@nordlys.example")');
  await page.click('text=Valider cette étape');
  await page.waitForSelector('label:has-text("Réinitialiser le mot de passe")');
  await page.click('label:has-text("Réinitialiser le mot de passe")');
  await page.click('text=Valider cette étape');
  await page.waitForFunction(() => document.querySelectorAll('.pill.ok').length >= 4);
  pr = await progress();
  ok('enquête : terminée et enregistrée', pr && pr.done['soc-002']);

  // 8. Cours : bloc KQL exécutable
  await go('cours/cours-kql-bases');
  await page.waitForSelector('.prose');
  ok('cours : contenu affiché', (await page.textContent('.prose')).length > 500);

  // 9. Export / import de la progression
  await go('tableau');
  await page.waitForSelector('h1');
  const exported = await page.evaluate(() => localStorage.getItem('boreal.progress.v1'));
  ok('export : JSON valide avec des exercices réussis', JSON.parse(exported).done['kql-003']);

  // 10. Thèmes et mouvement réduit
  for (const theme of ['light', 'dark']) {
    await page.evaluate((t) => { const p = JSON.parse(localStorage.getItem('boreal.progress.v1')); p.settings.theme = t; localStorage.setItem('boreal.progress.v1', JSON.stringify(p)); }, theme);
    await page.reload();
    await page.waitForSelector('h1');
    const attr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    ok(`thème ${theme} appliqué`, attr === theme, String(attr));
  }

  // 11. Mobile : pas de défilement horizontal
  const mobile = await browser.newContext({ viewport: { width: 375, height: 740 }, hasTouch: true });
  const mp = await mobile.newPage();
  await mp.goto(base);
  await mp.waitForSelector('h1');
  for (const r of ['', 'azure', 'ia', 'ia/module/m01', 'ia/cours/m01-l1', 'catalogue', 'exercice/kql-001', 'exercice/az-022', 'parcours/kql']) {
    await mp.goto(base + '#/' + r);
    await mp.waitForSelector('h1, h2');
    const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(`mobile 375 px : pas de défilement horizontal (#/${r})`, overflow <= 1, 'débordement ' + overflow);
  }

  await mp.goto(base + '#/azure');
  await mp.waitForSelector('.site-header');
  const hh = await mp.evaluate(() => document.querySelector('.site-header').getBoundingClientRect().height);
  ok('mobile : en-tête compact (moins de 165 px, trois lignes)', hh < 165, Math.round(hh) + ' px');
  const navRow = await mp.evaluate(() => { const n = document.querySelector('.nav'); return n.scrollWidth >= n.clientWidth && getComputedStyle(n).flexWrap === 'nowrap'; });
  ok('mobile : menu sur une ligne, défilable', navRow);
  await mp.goto(base + '#/exercice/kql-001');
  await mp.waitForSelector('.ex-layout');
  const order = await mp.evaluate(() => { const ed = document.querySelector('.ex-side').getBoundingClientRect().top; const hints = [...document.querySelectorAll('.ex-layout h2')].find((h) => /Indices|Hints/.test(h.textContent)).getBoundingClientRect().top; return ed < hints; });
  ok('mobile : l’espace de travail vient avant les indices', order);

  // 11b. Langue : bouton EN / FR (contenu anglais chargé à la demande, choix mémorisé)
  const lctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const lp = await lctx.newPage();
  const lerrors = [];
  lp.on('pageerror', (e) => lerrors.push('pageerror: ' + e.message));
  lp.on('console', (m) => { if (m.type() === 'error') lerrors.push('console: ' + m.text()); });
  await lp.goto(base + '#/azure');
  await lp.waitForSelector('h1');
  const frH1 = await lp.textContent('h1');
  ok('langue : français par défaut', (await lp.evaluate(() => document.documentElement.lang)) === 'fr-CA');
  await lp.click('button.lang-btn');
  await lp.waitForFunction(() => document.documentElement.lang === 'en');
  const enH1 = await lp.textContent('h1');
  ok('langue : le titre change en anglais', enH1 !== frH1, frH1 + ' / ' + enH1);
  ok('langue : mémorisée dans localStorage', (await lp.evaluate(() => localStorage.getItem('boreal.lang'))) === 'en');
  await lp.goto(base + '#/exercice/kql-001');
  await lp.waitForSelector('h1');
  const enTitle = await lp.textContent('h1');
  ok('langue : titre d’exercice en anglais', !/[éèêàç]/.test(enTitle) && enTitle.length > 3, enTitle);
  const enBody = await lp.textContent('body');
  ok('langue : énoncé en anglais (pas de « Retournez »)', !/Retournez|Écrivez|Valider/.test(enBody), enBody.slice(0, 200));
  await lp.reload();
  await lp.waitForSelector('h1');
  ok('langue : survit au rechargement', (await lp.evaluate(() => document.documentElement.lang)) === 'en' && (await lp.textContent('h1')) === enTitle);
  await lp.goto(base + '#/exercice/kql-003');
  await lp.evaluate(() => localStorage.setItem('boreal.progress.v1', JSON.stringify({ v: 1, settings: { unlockAll: true } })));
  await lp.reload();
  await lp.waitForSelector('textarea');
  await lp.fill('textarea', 'SigninLogs | take 3');
  await lp.click('button:has-text("Check my answer"), button:has-text("Submit"), button.primary');
  await lp.waitForSelector('.verdict');
  ok('langue : verdict KQL en anglais', !/attendu|Requête|incorrect/i.test(await lp.textContent('.verdict')), await lp.textContent('.verdict'));
  await lp.click('button.lang-btn');
  await lp.waitForFunction(() => document.documentElement.lang === 'fr-CA');
  ok('langue : retour au français', /[éèêàç]|Accueil|Catalogue/.test(await lp.textContent('body')));
  const lmob = await browser.newContext({ viewport: { width: 375, height: 740 }, hasTouch: true });
  const lmp = await lmob.newPage();
  await lmp.goto(base + '#/azure');
  await lmp.evaluate(() => localStorage.setItem('boreal.lang', 'en'));
  await lmp.reload();
  await lmp.waitForSelector('h1');
  const ovf = await lmp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok('langue : mobile 375 px en anglais sans défilement horizontal', ovf <= 1, 'débordement ' + ovf);
  ok('langue : aucune erreur de console', lerrors.length === 0, lerrors.join(' | '));
  await lctx.close();
  await lmob.close();

  // 11c. Repères : carte « prochaine étape », recherche Ctrl+K, barre de position, page verrouillée avec issue
  const wctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const wp = await wctx.newPage();
  const werrors = [];
  wp.on('pageerror', (e) => werrors.push('pageerror: ' + e.message));
  wp.on('console', (m) => { if (m.type() === 'error') werrors.push('console: ' + m.text()); });
  await wp.goto(base + '#/azure');
  await wp.waitForSelector('.next-card');
  ok('repères : carte « prochaine étape » avec un bouton', (await wp.$$('.next-card a.btn.primary')).length === 1);
  ok('repères : « Par où commencer ? » pour un nouvel utilisateur', (await wp.$$('.profile')).length === 4);
  await wp.keyboard.press('Control+k');
  await wp.waitForSelector('.cmd input');
  await wp.keyboard.type('spray');
  await wp.waitForSelector('.cmd li[role=option].on');
  ok('recherche : Ctrl+K ouvre la recherche et trouve des résultats', (await wp.$$('.cmd li[role=option]')).length > 1);
  await wp.keyboard.press('Enter');
  await wp.waitForFunction(() => !document.querySelector('.cmd'));
  ok('recherche : Entrée ouvre le résultat et ferme la fenêtre', /#\/(exercice|cours|parcours|labos)/.test(wp.url()), wp.url());
  await wp.keyboard.press('Control+k');
  await wp.keyboard.press('Escape');
  await wp.waitForFunction(() => !document.querySelector('.cmd'));
  ok('recherche : Échap ferme la fenêtre', true);
  await wp.goto(base + '#/exercice/kql-031');
  await wp.waitForSelector('.state');
  ok('verrouillé : propose une issue (prérequis, carte, tout débloquer)', (await wp.$$('.state a.btn, .state button.btn')).length >= 2);
  await wp.evaluate(() => localStorage.setItem('boreal.progress.v1', JSON.stringify({ v: 1, settings: { unlockAll: true } })));
  await wp.goto(base + '#/exercice/kql-003');
  await wp.reload();
  await wp.waitForSelector('.pathbar');
  ok('repères : barre de position affichée dans un exercice', /\d+\s*\/\s*\d+/.test(await wp.textContent('.pathbar-count')));
  await wp.fill('textarea', 'SigninLogs\n| summarize Total = count() by UserPrincipalName');
  await wp.goto(base + '#/parcours/kql');
  await wp.waitForSelector('.next-banner');
  ok('repères : la carte du parcours indique la prochaine étape', (await wp.$$('.next-banner')).length === 1 && (await wp.$$('.node.next')).length <= 1);
  ok('repères : aucune erreur de console', werrors.length === 0, werrors.join(' | '));
  await wctx.close();

  // 11d. Série, objectif et certificat
  const sctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const sp = await sctx.newPage();
  const serrors = [];
  sp.on('pageerror', (e) => serrors.push('pageerror: ' + e.message));
  sp.on('console', (m) => { if (m.type() === 'error') serrors.push('console: ' + m.text()); });
  await sp.goto(base + '#/azure');
  await sp.waitForSelector('.streak-chip');
  ok('série : pastille visible dans l’en-tête à 0 jour', /0\s*j/.test(await sp.textContent('.streak-chip')));
  await sp.evaluate(() => localStorage.setItem('boreal.progress.v1', JSON.stringify({ v: 1, settings: { unlockAll: true } })));
  await sp.goto(base + '#/parcours/azure-foundations');
  await sp.reload();
  await sp.waitForSelector('.node');
  const ids = await sp.$$eval('a[href^="#/exercice/"]', (as) => [...new Set(as.map((a) => decodeURIComponent(a.getAttribute('href').split('/').pop())))]);
  ok('certificat : liste des exercices du parcours lue', ids.length > 5, String(ids.length));
  await sp.goto(base + '#/certificat/azure-foundations');
  await sp.waitForSelector('.state');
  ok('certificat : refusé tant que le parcours n’est pas terminé', (await sp.$$('.cert')).length === 0);
  const nowMs = Date.now();
  await sp.evaluate(([list, now]) => {
    const done = {};
    list.forEach((id, i) => { done[id] = { xp: 10, firstAt: now - 86400000, lastAt: now - (i % 2) * 0, attempts: 1, hintsUsed: 0, status: 'perfect', box: 1, due: now - 1000 }; });
    localStorage.setItem('boreal.progress.v1', JSON.stringify({ v: 1, done, settings: { unlockAll: true, weeklyGoal: 3 } }));
  }, [ids, nowMs]);
  await sp.goto(base + '#/azure');
  await sp.reload();
  await sp.waitForSelector('.streak-chip');
  ok('série : 2 jours consécutifs reconstitués à partir de l’historique', /2\s*j/.test(await sp.textContent('.streak-chip')), await sp.textContent('.streak-chip'));
  ok('défis : plus de « défi du jour » ni de mode chronométré', (await sp.$$('.daily')).length === 0 && !/chronom/i.test(await sp.textContent('body')));
  await sp.goto(base + '#/tableau');
  await sp.waitForSelector('.cert-list');
  ok('tableau : objectif hebdomadaire modifiable', (await sp.inputValue('#goal')) === '3');
  await sp.fill('#goal', '7');
  ok('tableau : objectif enregistré', (await sp.evaluate(() => JSON.parse(localStorage.getItem('boreal.progress.v1')).settings.weeklyGoal)) === 7);
  ok('tableau : lien de certificat pour le parcours terminé', (await sp.$$('.cert-list a[href="#/certificat/azure-foundations"]')).length === 1);
  await sp.goto(base + '#/certificat/azure-foundations');
  await sp.waitForSelector('.cert');
  await sp.fill('#cert-name', 'Jeanne Tremblay');
  ok('certificat : le nom saisi apparaît', /Jeanne Tremblay/.test(await sp.textContent('.cert-name')));
  ok('certificat : le nom est conservé localement', (await sp.evaluate(() => JSON.parse(localStorage.getItem('boreal.progress.v1')).certName)) === 'Jeanne Tremblay');
  await sp.emulateMedia({ media: 'print' });
  const hid = await sp.evaluate(() => getComputedStyle(document.querySelector('.site-header')).display === 'none' && getComputedStyle(document.querySelector('.no-print')).display === 'none');
  ok('certificat : en-tête et commandes masqués à l’impression', hid);
  await sp.pdf({ path: path.join(__dirname, '..', 'dist', '.cert-test.pdf'), landscape: true, printBackground: true }).catch(() => {});
  const pdfSize = fs.existsSync(path.join(ROOT, '.cert-test.pdf')) ? fs.statSync(path.join(ROOT, '.cert-test.pdf')).size : 0;
  if (!SUB) ok('certificat : PDF paysage généré', pdfSize > 5000, String(pdfSize));
  try { fs.unlinkSync(path.join(__dirname, '..', 'dist', '.cert-test.pdf')); } catch { /* ignore */ }
  await sp.emulateMedia({ media: 'screen' });
  await sp.evaluate(() => localStorage.setItem('boreal.lang', 'en'));
  await sp.reload();
  await sp.waitForSelector('.cert');
  ok('certificat : version anglaise', /Certificate of completion/.test(await sp.textContent('.cert')));
  ok('série et certificat : aucune erreur de console', serrors.length === 0, serrors.join(' | '));
  await sctx.close();

  // 11e. Entrée dans un parcours : cours visible, test de niveau, choix libre du niveau
  const nctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const np = await nctx.newPage();
  const nerrors = [];
  np.on('pageerror', (e) => nerrors.push('pageerror: ' + e.message));
  np.on('console', (m) => { if (m.type() === 'error') nerrors.push('console: ' + m.text()); });
  await np.goto(base + '#/parcours/kql');
  await np.waitForSelector('.path-actions');
  ok('parcours : boutons « Lire le cours » et « Tester mon niveau » visibles dès l’entrée', (await np.$$('.path-actions a')).length >= 2);
  const lockedBefore = await np.$$eval('.node.locked', (n) => n.length);
  ok('parcours : des exercices sont verrouillés au départ', lockedBefore > 0);
  const startBtns = await np.$$('.lvl button:has-text("Commencer ici"), .lvl button:has-text("Start here")');
  ok('parcours : « Commencer ici » proposé sur les niveaux supérieurs', startBtns.length >= 1, String(startBtns.length));
  await startBtns[startBtns.length - 1].click();
  await np.waitForFunction((b) => document.querySelectorAll('.node.locked').length < b, lockedBefore);
  ok('parcours : choisir un niveau libère les exercices', (await np.$$eval('.node.locked', (n) => n.length)) < lockedBefore);
  ok('parcours : niveau de départ mémorisé', Object.keys((await np.evaluate(() => JSON.parse(localStorage.getItem('boreal.progress.v1')).startLevel)) || {}).includes('kql'));
  await np.click('.path-actions .linklike');
  await np.waitForFunction((b) => document.querySelectorAll('.node.locked').length === b, lockedBefore);
  ok('parcours : réinitialiser le niveau de départ', true);
  await np.click('.path-actions a[href$="/niveau/kql"]');
  await np.waitForSelector('h1');
  ok('test de niveau : page d’introduction avec 3 niveaux', (await np.$$('ol li')).length >= 2 && /niveau/i.test(await np.textContent('h1')));
  await np.click('button.btn.primary.big');
  await np.waitForSelector('.kicker[role=status]');
  ok('test de niveau : la première question est un vrai exercice', /question 1 sur/i.test(await np.textContent('.kicker[role=status]')) && (await np.$$('.ex-layout')).length === 1);
  await np.click('button:has-text("Je ne sais pas")');
  await np.waitForSelector('text=Résultat du test');
  ok('test de niveau : un échec propose le niveau 1', /niveau 1/i.test(await np.textContent('.card h2')));
  ok('test de niveau : aucune erreur de console', nerrors.length === 0, nerrors.join(' | '));
  await nctx.close();

  // 12. Clavier : tabulation atteint un élément interactif et le lien d'évitement existe
  await page.goto(base + '#/azure');
  await page.waitForSelector('h1');
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement && document.activeElement.tagName);
  ok('clavier : le focus atteint un élément interactif', ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(focused), String(focused));

  ok('aucune erreur de console ni exception', errors.length === 0, errors.join(' | '));
  await browser.close();
  srv.close();
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} vérifications réussies${SUB ? ' (build sous-répertoire)' : ''}.`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
