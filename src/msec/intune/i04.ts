// Module 4 : Réduction de la surface d'attaque (niveau 2).
import type { AiCompetency, AiLesson, AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { sref } from '../sources.ts';

const md = (...lines: string[]) => lines.join('\n');
const { a, Q, M } = kit('i04');
const c1 = { comp: 'i04-c1', lesson: 'i04-l1', tags: ['asr', 'modes', 'exclusions-asr'] };
const c2 = { comp: 'i04-c2', lesson: 'i04-l2', tags: ['network-protection', 'controlled-folder-access', 'audit'] };
const c3 = { comp: 'i04-c3', lesson: 'i04-l3', tags: ['exploit-protection', 'deploiement-sur', 'preuves'] };

const l1: AiLesson = {
  id: 'i04-l1', module: 'i04', title: 'Règles ASR : modes, déploiement par étapes et exclusions', minutes: 50,
  summary: 'Déployer les règles de réduction de la surface d’attaque sans casser les applications métier, et lire les preuves.',
  objectives: ['Distinguer les modes Désactivé, Audit, Avertissement et Blocage.', 'Planifier un déploiement par audit puis par blocage progressif.', 'Choisir entre exclusion par règle et exclusion globale, et mesurer leur coût.'],
  prerequisites: ['Modules 2 et 3'],
  body: md(
    '## Ce que sont les règles ASR',
    'Les règles de **réduction de la surface d’attaque (ASR)** ciblent des comportements que les logiciels malveillants utilisent souvent : exécutables et scripts lancés depuis Office, courriel Web qui télécharge ou exécute des fichiers, scripts obscurcis ou comportements qu’une application ne devrait pas adopter en temps normal. Dans Intune, elles se gèrent dans **Endpoint security > Réduction de la surface d’attaque**, plateforme **Windows**, profil **Attack Surface Reduction Rules**. Le même nœud porte le profil **Device Control** (module 11). Les règles s’appuient sur Defender Antivirus : sans lui actif, les règles ne s’appliquent pas.',
    '## Quatre modes',
    'Chaque règle prend un mode : **Désactivé** (valeur 0), **Blocage** (1), **Audit** (2), **Avertissement** (6) ou **Non configuré** (5 dans la représentation CSP). En **audit**, la règle n’empêche rien : elle consigne des événements, ce qui montre quelles activités quotidiennes l’auraient déclenchée. En **avertissement**, l’utilisateur est prévenu et peut, selon la règle, poursuivre : c’est un compromis utile pour limiter la perturbation sans désactiver la règle. Tous les modes ne sont pas disponibles pour toutes les règles : vérifiez dans la référence des règles.',
    '## Déployer par étapes',
    'La documentation distingue deux familles. Les règles de la **protection standard** peuvent généralement être activées en blocage ou en avertissement sans test préalable. Les **autres règles** se testent d’abord en **audit**. La méthode recommandée : activer **toutes** les règles en audit en même temps sur un premier anneau (champions ASR), lire les événements pour savoir lesquelles se déclenchent sur du travail légitime, traiter les faux positifs par des exclusions ciblées, puis passer au blocage ou à l’avertissement par vagues. Le mode d’audit n’a aucun effet sur les utilisateurs, mais il génère des événements à lire : l’audit sans lecture n’apporte rien.',
    '## Exclusions : deux niveaux',
    'Dans la politique Intune, dès qu’une règle quitte « Non configuré », une section **exclusions propres à cette règle** apparaît : elles ne valent que pour cette règle. La section **Attack Surface Reduction Only Exclusions** vaut pour **toutes les règles** de l’appareil. Préférez l’exclusion par règle : la portée est plus étroite. Rappel important de la documentation : un fichier exclu est autorisé à s’exécuter et **aucun rapport ni événement** n’est consigné pour lui. Une exclusion est donc à la fois un trou de protection et un trou de visibilité. Entre désactiver une règle et ajouter une exclusion, l’exclusion est la moins mauvaise. Les chemins s’entrent un par un ou par import d’un CSV.',
    '## Preuves et rapports',
    'Le rapport **règles ASR** du portail Microsoft Defender montre, par appareil, l’état de chaque règle (désactivée, audit, blocage, avertissement, non applicable) et permet d’ajouter des exclusions ou d’ouvrir Intune. Le mode de déploiement n’affecte pas les données de rapport, tant que les appareils sont intégrés à Defender for Endpoint. Localement, l’observateur d’événements consigne les événements ASR. Pour une politique gérée par les paramètres de sécurité de Defender for Endpoint, l’affectation se fait à des **groupes d’appareils** Entra, pas à des groupes d’utilisateurs.',
  ),
  demo: { title: 'Lire un état de règle', body: md(
    'Extrait **fictif** de la vue par appareil :',
    '```text',
    'Règle                         : Bloquer le contenu exécutable du courriel',
    'Poste PC-014                  : Audit',
    'Poste PC-077                  : Blocage',
    'Poste SRV-02                  : Non applicable',
    '```',
    '**Lecture commentée.** Un même résultat de règle peut diverger selon la vague. Non applicable n’est pas un échec.',
    '**Ce que la démo ne prouve pas.** Aucune règle n’a été exécutée ni testée.') },
  guided: 'i04-g1', autonomous: 'i04-a1', quiz: ['i04-q1a', 'i04-q1b', 'i04-q1c'],
  revision: md('## Fiche : règles ASR', '- Modes : désactivé, audit, avertissement, blocage.', '- Protection standard : blocage ou avertissement sans test ; autres règles : audit d’abord.', '- Exclusion par règle plutôt que globale ; exclu = ni protection ni événement.', '- Lire les événements d’audit, sinon l’audit est inutile.', '- Rapport ASR du portail : état par règle et par appareil.'),
  links: [sref('mde-asr-overview'), sref('mde-asr-configure'), sref('mde-asr-test'), sref('mde-asr-report'), sref('intune-asr-policy'), sref('intune-asr-settings')], teaches: ['asr', 'modes', 'exclusions-asr'],
};

const l2: AiLesson = {
  id: 'i04-l2', module: 'i04', title: 'Protection réseau et accès contrôlé aux dossiers : auditer avant d’imposer', minutes: 45,
  summary: 'Déployer Network Protection et Controlled Folder Access avec des modes, des listes et une surveillance adaptés.',
  objectives: ['Expliquer ce que couvre Network Protection et ce qu’il ne remplace pas.', 'Choisir un mode de Controlled Folder Access et gérer dossiers et applications autorisées.', 'Lire les événements d’audit pour décider du passage au blocage.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Network Protection',
    'La **protection réseau** empêche les utilisateurs et les applications de se connecter à des **domaines ou adresses de faible réputation** hébergeant hameçonnage, kits d’exploitation ou contenu malveillant. Elle protège aussi contre des navigateurs tiers qui visiteraient ces sites. Elle fonctionne en **audit** (rien n’est bloqué, l’activité est visible) ou en **blocage**. Dans la représentation CSP, `EnableNetworkProtection` vaut 0 (désactivée), 1 (blocage) ou 2 (audit). Elle se configure par une politique Endpoint security ou par une base de référence ; si vos appareils ne sont pas déjà gérés par une base de référence, n’en déployez pas une uniquement pour ce réglage. Avant de la configurer par MDM, mettez à jour la plateforme Defender Antivirus. Ne confondez pas : ce n’est pas un pare-feu (module 6) ni un filtre de contenu Web complet. Les dépendances d’autres fonctions (par exemple le filtrage de contenu Web) sont à valider dans la documentation de chaque fonction.',
    '## Controlled Folder Access',
    'L’**accès contrôlé aux dossiers (CFA)** protège les fichiers de dossiers courants contre les modifications par des applications non fiables, notamment les rançongiciels. Defender détermine automatiquement les applications fiables ; on peut ajouter les siennes. Modes : **Désactivé** (0), **Activé** (blocage, 1), **Audit** (2), **Bloquer la modification du disque seulement** (3), **Auditer la modification du disque seulement** (4). Les modes 3 et 4 protègent le secteur de démarrage sans protéger les dossiers : utiles si les fichiers sont déjà protégés autrement (par exemple OneDrive avec historique des versions) ou si l’on veut limiter l’impact sur les performances. Tous les outils de gestion ne prennent pas en charge tous les modes : Configuration Manager n’offre pas les modes 3 et 4.',
    '## Listes à gérer',
    'CFA protège une **liste de dossiers par défaut non modifiable** ; on ajoute des dossiers supplémentaires (par exemple des partages de données). Dans le CSP, les chemins sont séparés par le caractère barre verticale. On définit aussi la liste des **applications autorisées** à modifier les fichiers protégés. Piège classique : une application métier légitime bloquée parce qu’elle n’est pas dans la liste, constatée comme « les données ne s’enregistrent plus ». Pour les partages réseau, mesurez l’effet de performance en audit.',
    '## Auditer d’abord, avec une méthode',
    'Les quatre fonctions de ce module (ASR, CFA, exploit protection, protection réseau) prennent en charge l’**audit** : les événements sont consignés comme si la fonction était active, sans blocage. On les lit dans l’observateur d’événements ou par la chasse avancée dans le portail Defender. Méthode : audit sur un anneau pilote, durée suffisante pour couvrir les cycles métier (clôture mensuelle, paie), liste des faux positifs, ajustement, puis blocage par vagues avec un plan de retour en audit documenté. Pour les modes disque de CFA, auditer la modification de disque en premier pour s’assurer qu’aucun outil légitime (imagerie, sauvegarde, chiffrement, partitionnement) n’écrit dans les secteurs.',
  ),
  demo: { title: 'Un déploiement CFA prudent', body: md(
    'Plan **fictif** :',
    '```text',
    'Semaine 1-4 : CFA en audit sur le pilote, lecture des événements',
    'Semaine 5   : ajout des applications métier à la liste autorisée',
    'Semaine 6   : blocage sur la vague 2',
    'Retour      : repasser en audit si une application critique est bloquée',
    '```',
    '**Lecture commentée.** La durée couvre un cycle métier complet et le retour arrière est prévu.',
    '**Ce que la démo ne prouve pas.** Aucun blocage n’a été observé sur un vrai poste.') },
  guided: 'i04-g2', autonomous: 'i04-a2', quiz: ['i04-q2a', 'i04-q2b', 'i04-q2c'],
  revision: md('## Fiche : Network Protection et CFA', '- Network Protection : audit ou blocage ; domaines de faible réputation.', '- Pas un pare-feu ni un filtre Web complet.', '- CFA : 0 désactivé, 1 blocage, 2 audit, 3 et 4 modes disque seulement.', '- Dossiers par défaut non modifiables ; ajouter dossiers et applications autorisées.', '- Auditer sur un cycle métier complet avant de bloquer.'),
  links: [sref('mde-network-protection'), sref('mde-network-protection-config'), sref('mde-cfa'), sref('mde-cfa-configure'), sref('mde-cfa-monitor'), sref('mde-asr-capabilities')], teaches: ['network-protection', 'controlled-folder-access', 'audit'],
};

const l3: AiLesson = {
  id: 'i04-l3', module: 'i04', title: 'Exploit Protection : déploiement sûr, compatibilité et preuves', minutes: 45,
  summary: 'Appliquer des atténuations d’exploitation par fichier XML sans casser les applications, et justifier chaque décision.',
  objectives: ['Décrire la mécanique XML d’Exploit Protection et son exportation.', 'Appliquer des pratiques de déploiement sûr avec surveillance des plantages.', 'Produire une preuve de décision pour chaque atténuation retenue.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Ce que fait Exploit Protection',
    'Exploit Protection applique des **atténuations** au système et à des applications précises pour gêner l’exploitation de vulnérabilités (protection de la pile, du flux de contrôle, randomisation de la mémoire et d’autres). Windows 10 et 11 en activent plusieurs par défaut. Chaque atténuation peut être activée, désactivée ou laissée à sa valeur par défaut, et certaines prennent en charge l’audit. Les filtrages d’adresses d’exportation et d’importation (EAF et IAF) sont **obsolètes** et incompatibles avec les applications .NET Framework 2.0 ou 3.5.',
    '## Mécanique de déploiement',
    'On configure les atténuations sur un poste de référence (application Sécurité Windows ou cmdlets `Get-ProcessMitigation` et `Set-ProcessMitigation`), puis on **exporte un fichier XML** et on le téléverse dans la politique Intune. Un réglage associé contrôle si l’utilisateur peut modifier l’interface d’Exploit Protection. Le fichier XML est un artefact de configuration : il se versionne, se compare et se revoit comme du code.',
    '## Déploiement sûr',
    'La documentation impose des prérequis avant de déployer : **surveiller les plantages** (événements 1000 et 1001) et les blocages (événement 1002), collecter des **vidages mémoire** complets en mode utilisateur, **inventorier les applications compilées avec Control Flow Guard** (`dumpbin /headers /loadconfig`) et disposer d’un **groupe d’appareils de test**. Sans test, un déploiement peut créer des incompatibilités et nuire à la productivité. La pratique de déploiement sûr : petit groupe d’abord, tester avec les applications à protéger, désactiver les atténuations incompatibles pour les applications touchées, répéter, puis un groupe d’acceptation (administrateurs, sécurité, soutien) avant d’étendre par étapes.',
    '## Documenter chaque décision',
    'Pour chaque atténuation retenue, consignez : l’application ou le système visé, le gain recherché, le résultat des tests, la personne qui approuve, le plan de retour. Une atténuation désactivée pour une application doit avoir une raison écrite. Sans cette trace, personne ne sait plus pourquoi une application a une exception, ni si elle est encore justifiée à la prochaine mise à jour.',
    '## Ce que l’on peut prouver',
    'Dans le parcours sans locataire, on prouve que **la décision est justifiée**, pas que l’atténuation protège sur un vrai poste. La preuve réelle exige un appareil de test, des applications représentatives et la lecture des événements. Les exercices de la formation simulent donc la lecture de journaux fictifs et ne présentent jamais un résultat prédéfini comme une exécution réelle.',
  ),
  demo: { title: 'Fiche de décision', body: md(
    'Fiche **fictive** :',
    '```text',
    'Application  : Comptabilité 4.2',
    'Atténuation  : CFG activée',
    'Test         : 2 semaines en groupe pilote, 0 plantage',
    'Approuvé par : responsable applicatif',
    'Retour       : retirer l’entrée du fichier XML',
    '```',
    '**Lecture commentée.** Chaque atténuation a un test, un approbateur et un retour arrière.',
    '**Ce que la démo ne prouve pas.** Aucun plantage réel n’a été surveillé.') },
  guided: 'i04-g3', autonomous: 'i04-a3', quiz: ['i04-q3a', 'i04-q3b', 'i04-q3c'],
  revision: md('## Fiche : Exploit Protection', '- Atténuations système et par application, export XML versionné.', '- EAF et IAF obsolètes.', '- Prérequis : surveillance des plantages, vidages mémoire, inventaire CFG, groupe de test.', '- Déploiement sûr : petit groupe, UAT, étapes.', '- Chaque décision a une trace : test, approbateur, retour.'),
  links: [sref('mde-exploit-protection'), sref('mde-exploit-enable'), sref('mde-asr-capabilities'), sref('intune-asr-policy')], teaches: ['exploit-protection', 'deploiement-sur', 'preuves'],
};

const exercises = [
  a.match({ id: 'i04-g1', title: 'Mode et effet', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: 'i04-l1',
    st: 'Associez chaque mode ASR à son effet.', items: [['p1', 'Audit'], ['p2', 'Avertissement'], ['p3', 'Blocage']],
    options: [['s1', 'Consigne sans empêcher'], ['s2', 'Prévient l’utilisateur'], ['s3', 'Empêche l’activité']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Audit consigne, avertissement prévient, blocage empêche.' }),
  a.order({ id: 'i04-a1', title: 'Déployer les règles ASR', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'fonctionner', lesson: 'i04-l1',
    st: 'Ordonnez le déploiement des règles ASR.',
    items: [['s1', 'Activer l’audit sur l’anneau pilote'], ['s2', 'Lire les événements'], ['s3', 'Traiter les faux positifs par exclusions ciblées'], ['s4', 'Passer en avertissement ou blocage par vagues'], ['s5', 'Surveiller le rapport ASR']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'Audit, lecture, exclusions ciblées, passage progressif puis suivi.' }),
  Q('i04-q1a', 'quiz', 'comprendre', c1, 'Standard', 'Quelles règles peuvent généralement passer en blocage sans test ?', ['Celles de la protection standard.', 'Les autres se testent en audit.'], [['Toutes sans exception.', 'Faux.'], ['Aucune.', 'Faux.'], ['Celles créées hier.', 'Faux.']], 'Les règles de protection standard font exception.'),
  Q('i04-q1b', 'quiz', 'fonctionner', c1, 'Exclusion', 'Que se passe-t-il pour un fichier exclu d’une règle ?', ['Il est autorisé et aucun rapport ni événement n’est consigné.', 'Trou de visibilité.'], [['Il est analysé deux fois.', 'Faux.'], ['Il est bloqué.', 'Faux.'], ['Il est chiffré.', 'Faux.']], 'L’exclusion supprime aussi la visibilité.'),
  Q('i04-q1c', 'quiz', 'maintenir', c1, 'Portée', 'Quelle exclusion préférer ?', ['Celle propre à la règle concernée.', 'Portée plus étroite.'], [['La globale pour tout simplifier.', 'Trop large.'], ['Désactiver la règle.', 'Pire.'], ['Aucune réflexion.', 'Non.']], 'Exclusion par règle plutôt que globale.'),

  a.match({ id: 'i04-g2', title: 'Mode CFA', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'comprendre', lesson: 'i04-l2',
    st: 'Associez chaque valeur CFA à son mode.', items: [['p1', '1'], ['p2', '2'], ['p3', '3']],
    options: [['s1', 'Blocage des dossiers'], ['s2', 'Audit'], ['s3', 'Blocage de la modification du disque seulement']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: '1 bloque, 2 audite, 3 bloque seulement la modification du disque.' }),
  a.config({ id: 'i04-a2', title: 'Plan CFA', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'securiser', lesson: 'i04-l2',
    st: 'Paramétrez le plan de déploiement de CFA.',
    fields: [
      { id: 'mode', label: 'Mode initial', kind: 'select', options: [{ id: 'audit', label: 'Audit' }, { id: 'block', label: 'Blocage' }, { id: 'off', label: 'Désactivé' }], accept: ['audit'], why: 'Mesurer avant d’imposer.' },
      { id: 'apps', label: 'Liste des applications métier autorisées préparée', kind: 'toggle', accept: ['on'], why: 'Évite les blocages légitimes.' },
      { id: 'cycle', label: 'Couvrir un cycle métier complet en audit', kind: 'toggle', accept: ['on'], why: 'Voir les usages rares.' },
    ], solution: { mode: 'audit', apps: 'on', cycle: 'on' }, exp: 'Audit sur un cycle complet avec applications autorisées préparées.' }),
  Q('i04-q2a', 'quiz', 'comprendre', c2, 'Network Protection', 'Que bloque la protection réseau ?', ['Les connexions vers des domaines ou adresses de faible réputation.', 'Hameçonnage, kits d’exploitation.'], [['Tout le trafic Web.', 'Faux.'], ['Les clés USB.', 'Faux.'], ['Les connexions locales.', 'Faux.']], 'Elle vise les destinations de faible réputation.'),
  Q('i04-q2b', 'quiz', 'fonctionner', c2, 'Modes disque', 'À quoi servent les modes disque seulement de CFA ?', ['À protéger le secteur de démarrage sans protéger les dossiers.', 'Utile si les fichiers sont protégés autrement.'], [['À chiffrer le disque.', 'Faux.'], ['À sauvegarder.', 'Faux.'], ['À désactiver CFA.', 'Faux.']], 'Ils protègent les secteurs sans les dossiers.'),
  Q('i04-q2c', 'quiz', 'maintenir', c2, 'Dossiers par défaut', 'La liste de dossiers par défaut de CFA est-elle modifiable ?', ['Non, mais on peut en ajouter.', 'Liste fournie par Microsoft.'], [['Oui, on peut la vider.', 'Faux.'], ['Oui, par les utilisateurs.', 'Faux.'], ['Elle n’existe pas.', 'Faux.']], 'On ajoute des dossiers, on ne modifie pas la liste par défaut.'),

  a.inspect({ id: 'i04-g3', title: 'Prérequis Exploit Protection', comp: c3.comp, tags: c3.tags, role: 'guided', dim: 'comprendre', lesson: 'i04-l3', language: 'text',
    st: 'Plan fictif. Repérez les défauts.',
    lines: [['p1', 'Nous déployons le XML sur tout le parc dès le premier jour.', { ok: 'a1', fixes: [['a1', 'Commencer par un petit groupe de test puis un groupe d’acceptation'], ['a2', 'Accepter']] }], ['p2', 'Nous ne surveillons pas les plantages.', { ok: 'b1', fixes: [['b1', 'Surveiller les événements 1000, 1001 et 1002'], ['b2', 'Accepter']] }], ['p3', 'Nous activons EAF pour toutes les applications.', { ok: 'c1', fixes: [['c1', 'Ne pas utiliser EAF et IAF, obsolètes'], ['c2', 'Accepter']] }]],
    exp: 'Déploiement sans test, absence de surveillance et usage de fonctions obsolètes sont trois défauts.' }),
  a.workflow({ id: 'i04-a3', title: 'Déployer un XML', comp: c3.comp, tags: c3.tags, role: 'autonomous', dim: 'securiser', lesson: 'i04-l3',
    st: 'Ordonnez le déploiement d’un fichier XML d’Exploit Protection.',
    blocks: [['b1', 'Configurer sur un poste de référence'], ['b2', 'Exporter le XML'], ['b3', 'Tester sur un groupe pilote avec surveillance des plantages'], ['b4', 'Désactiver les atténuations incompatibles par application'], ['b5', 'Étendre par étapes'], ['b6', 'Déployer sur tout le parc sans test']],
    required: ['b1', 'b2', 'b3', 'b4', 'b5'], forbidden: ['b6'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4'], ['b4', 'b5']], notes: { b6: 'Risque de plantages à grande échelle.' }, solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
    exp: 'Référence, export, pilote, ajustement puis extension par étapes.' }),
  Q('i04-q3a', 'quiz', 'comprendre', c3, 'XML', 'Comment diffuse-t-on la configuration d’Exploit Protection ?', ['Par un fichier XML exporté et téléversé dans la politique.', 'Versionné.'], [['Par courriel aux utilisateurs.', 'Faux.'], ['Par capture d’écran.', 'Faux.'], ['Par mot de passe.', 'Faux.']], 'Le XML est l’artefact de configuration.'),
  Q('i04-q3b', 'quiz', 'fonctionner', c3, 'Plantages', 'Quels événements surveiller avant le déploiement ?', ['1000, 1001 et 1002.', 'Plantages et blocages.'], [['4624.', 'Connexions.'], ['7045.', 'Services.'], ['Aucun.', 'Faux.']], 'On surveille plantages et blocages d’applications.'),
  Q('i04-q3c', 'quiz', 'maintenir', c3, 'Trace', 'Pourquoi documenter les décisions d’atténuation ?', ['Pour savoir plus tard pourquoi une exception existe et si elle est justifiée.', 'Revue.'], [['Pour allonger le dossier.', 'Non.'], ['Pour supprimer le XML.', 'Non.'], ['Aucune raison.', 'Non.']], 'La trace permet la revue.'),

  Q('i04-ev1', 'eval', 'comprendre', c1, 'Audit ASR', 'Que fait une règle ASR en mode audit ?', ['Elle consigne des événements sans empêcher l’activité.', 'Aucun effet sur les utilisateurs.'], [['Elle bloque en silence.', 'Faux.'], ['Elle désinstalle.', 'Faux.'], ['Elle est désactivée.', 'Faux.']], 'L’audit consigne sans bloquer.'),
  M('i04-ev2', 'eval', 'securiser', c2, 'Bonnes pratiques', 'Cochez les bonnes pratiques de déploiement.', [['Auditer sur un cycle métier complet.', 'Voir les usages rares.'], ['Préparer le retour en audit.', 'Réversibilité.']], [['Bloquer partout le premier jour.', 'Risque.'], ['Ne pas lire les événements.', 'Audit inutile.']], 'Audit complet et retour prévu.'),
  a.order({ id: 'i04-ev3', title: 'Passer au blocage', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'fonctionner', lesson: 'i04-l3',
    st: 'Ordonnez le passage de l’audit au blocage.',
    items: [['s1', 'Lire les événements d’audit'], ['s2', 'Lister les faux positifs'], ['s3', 'Ajuster exclusions ou listes'], ['s4', 'Bloquer sur la vague 1'], ['s5', 'Étendre si les critères sont atteints']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'Lecture, liste, ajustement, blocage puis extension.' }),
  a.fix({ id: 'i04-ev4', title: 'Corriger une règle', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'securiser', lesson: 'i04-l1', language: 'json',
    st: 'Corrigez : audit d’abord, exclusion propre à la règle.',
    starter: JSON.stringify({ mode: 'blocage', exclusion: 'globale', cible: 'groupe-utilisateurs' }, null, 2),
    rules: [{ kind: 'equals', path: 'mode', value: 'audit', message: 'Commencer en audit.', dim: 'fonctionner' }, { kind: 'equals', path: 'exclusion', value: 'par-regle', message: 'Préférer l’exclusion par règle.', dim: 'securiser' }, { kind: 'equals', path: 'cible', value: 'groupe-appareils', message: 'Affecter à des groupes d’appareils.', dim: 'maintenir' }],
    solution: JSON.stringify({ mode: 'audit', exclusion: 'par-regle', cible: 'groupe-appareils' }, null, 2), exp: 'Audit, exclusion par règle et groupe d’appareils.' }),
  a.match({ id: 'i04-ev5', title: 'Symptôme et cause', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'maintenir', lesson: 'i04-l2',
    st: 'Associez chaque symptôme à sa cause probable.', items: [['p1', 'Une application métier ne sauvegarde plus'], ['p2', 'Aucun blocage visible mais des événements'], ['p3', 'Mode 3 inaccessible dans l’outil de gestion']],
    options: [['s1', 'Application absente de la liste autorisée de CFA'], ['s2', 'Mode audit actif'], ['s3', 'Outil de gestion qui ne prend pas en charge ce mode']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Liste incomplète, audit et prise en charge limitée expliquent ces symptômes.' }),
  a.workflow({ id: 'i04-ev6', title: 'Traiter un faux positif', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'securiser', lesson: 'i04-l3',
    st: 'Ordonnez le traitement d’un faux positif.',
    blocks: [['b1', 'Confirmer le faux positif avec les événements'], ['b2', 'Choisir la portée minimale de l’exception'], ['b3', 'Documenter motif, approbateur et retour'], ['b4', 'Déployer l’exception sur un pilote'], ['b5', 'Désactiver la protection pour tous']],
    required: ['b1', 'b2', 'b3', 'b4'], forbidden: ['b5'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4']], notes: { b5: 'Perd la protection partout.' }, solution: ['b1', 'b2', 'b3', 'b4'],
    exp: 'On confirme, on limite, on documente puis on pilote.' }),
  a.short({ id: 'i04-ev7', title: 'Valeur du mode Audit', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'comprendre', lesson: 'i04-l1',
    st: 'Quelle valeur CSP correspond au mode Audit d’une règle ASR ? (nombre)', accepted: ['2'], numeric: { value: 2 }, ph: 'un nombre',
    exp: 'La valeur 2 correspond au mode Audit d’une règle ASR.' }),
  a.short({ id: 'i04-ev8', title: 'Valeur de blocage réseau', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'comprendre', lesson: 'i04-l2',
    st: 'Quelle valeur de EnableNetworkProtection active le mode audit ? (nombre)', accepted: ['2'], numeric: { value: 2 }, ph: 'un nombre',
    exp: 'La valeur 2 de EnableNetworkProtection active le mode audit.' }),

  a.inspect({ id: 'i04-cs1', title: 'Cas : ASR chez Aurore Logistique', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'securiser', lesson: 'i04-l1', language: 'text',
    st: 'Plan fictif. Repérez les défauts.',
    lines: [['p1', 'Toutes les règles en blocage dès le premier jour.', { ok: 'a1', fixes: [['a1', 'Audit pour les règles hors protection standard'], ['a2', 'Accepter']] }], ['p2', 'Exclusions globales pour tout régler.', { ok: 'b1', fixes: [['b1', 'Exclusions par règle avec propriétaire'], ['b2', 'Accepter']] }], ['p3', 'Personne ne lit le rapport ASR.', { ok: 'c1', fixes: [['c1', 'Désigner un lecteur et une cadence'], ['c2', 'Accepter']] }]],
    exp: 'Blocage immédiat, exclusions larges et absence de lecture sont trois défauts.' }),
  a.workflow({ id: 'i04-cs2', title: 'Cas : déploiement CFA et réseau', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'securiser', lesson: 'i04-l2',
    st: 'Ordonnez le déploiement de CFA et de la protection réseau.',
    blocks: [['t1', 'Mettre à jour la plateforme Defender'], ['t2', 'Auditer sur le pilote pendant un cycle métier'], ['t3', 'Compléter les listes d’applications et de dossiers'], ['t4', 'Passer en blocage par vagues'], ['t5', 'Garder un retour en audit documenté'], ['t6', 'Bloquer sans audit']],
    required: ['t1', 't2', 't3', 't4', 't5'], forbidden: ['t6'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't4'], ['t4', 't5']], notes: { t6: 'Blocages légitimes probables.' }, solution: ['t1', 't2', 't3', 't4', 't5'],
    exp: 'Plateforme, audit, listes, blocage progressif et retour prévu.' }),
  a.match({ id: 'i04-cs3', title: 'Cas : preuve Exploit Protection', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'i04-l3',
    st: 'Associez chaque élément à ce qu’il prouve.', items: [['p1', 'Décision documentée avec test'], ['p2', 'Événements 1000 sans hausse après le pilote'], ['p3', 'Lecture d’un journal fictif']],
    options: [['s1', 'Que la décision est justifiée'], ['s2', 'Qu’il n’y a pas de régression de stabilité visible'], ['s3', 'Rien sur un vrai poste']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Un journal fictif ne prouve rien sur un vrai poste.' }),
  a.open({ id: 'i04-cs-open', title: 'Cas : plan de réduction de la surface d’attaque', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'i04-l3',
    st: 'Rédigez le plan de réduction de la surface d’attaque d’une organisation fictive.',
    deliverable: 'Un document : règles ASR par vagues, protection réseau, CFA, Exploit Protection, exclusions, preuves et retour arrière.',
    rubric: [['r1', 'L’audit précède le blocage hors protection standard.', 'securiser'], ['r2', 'Les exclusions sont ciblées et documentées.', 'maintenir'], ['r3', 'Les listes de CFA sont traitées.', 'fonctionner'], ['r4', 'Exploit Protection suit un déploiement sûr.', 'securiser'], ['r5', 'Preuves réelles et simulées sont distinguées.', 'comprendre']],
    exp: 'Pas de note automatique : on juge la cohérence du plan.' }),

  Q('i04-rm1', 'remediation', 'comprendre', c1, 'Remédiation : audit', 'Pourquoi auditer avant de bloquer ?', ['Pour voir les activités légitimes touchées sans perturber les utilisateurs.', 'Mesure.'], [['Pour désactiver la règle.', 'Non.'], ['Pour gagner de la bande passante.', 'Non.'], ['Aucune raison.', 'Non.']], 'L’audit mesure avant d’imposer.'),
  Q('i04-rm2', 'remediation', 'fonctionner', c2, 'Remédiation : CFA', 'Que faire si une application métier est bloquée par CFA ?', ['L’ajouter à la liste des applications autorisées après vérification.', 'Plutôt que désactiver CFA.'], [['Désactiver CFA partout.', 'Non.'], ['Supprimer l’application.', 'Non.'], ['Ignorer.', 'Non.']], 'On autorise l’application ciblée.'),
  Q('i04-rm3', 'remediation', 'securiser', c3, 'Remédiation : XML', 'Pourquoi tester un XML avant le parc ?', ['Les atténuations peuvent causer des incompatibilités applicatives.', 'Déploiement sûr.'], [['Pour économiser du stockage.', 'Non.'], ['Pour chiffrer le XML.', 'Non.'], ['Aucune raison.', 'Non.']], 'Les tests évitent les régressions.'),
];

const competencies: AiCompetency[] = [
  { id: 'i04-c1', module: 'i04', name: 'Déployer les règles ASR', description: 'Modes, audit, exclusions, rapports.', criteria: [{ id: 'i04-c1-1', text: 'Je choisis le bon mode par règle.' }, { id: 'i04-c1-2', text: 'Je déploie par audit puis blocage.' }, { id: 'i04-c1-3', text: 'Je limite la portée des exclusions.' }] },
  { id: 'i04-c2', module: 'i04', name: 'Déployer Network Protection et CFA', description: 'Modes, listes, audit.', criteria: [{ id: 'i04-c2-1', text: 'Je choisis le mode de CFA.' }, { id: 'i04-c2-2', text: 'Je gère dossiers et applications autorisées.' }, { id: 'i04-c2-3', text: 'Je distingue Network Protection d’un pare-feu.' }] },
  { id: 'i04-c3', module: 'i04', name: 'Déployer Exploit Protection en sécurité', description: 'XML, compatibilité, preuves.', criteria: [{ id: 'i04-c3-1', text: 'Je prépare surveillance et groupe de test.' }, { id: 'i04-c3-2', text: 'Je gère les exceptions par application.' }, { id: 'i04-c3-3', text: 'Je documente chaque décision.' }] },
];

const projects: AiProject[] = [
  { id: 'i04-p1', module: 'i04', level: 'débutant', title: 'Tableau des modes ASR', problem: 'Dresser le tableau des règles ASR, leur famille et le mode prévu par vague.', architecture: 'Tableau d’une page.', tools: ['Tableur'], data: 'Règles fictives.', steps: ['Lister les règles.', 'Classer standard ou autre.', 'Choisir le mode par vague.'], success: ['Chaque règle a un mode et une vague.'], risks: ['Blocage sans audit.'], extensions: ['Ajouter un propriétaire.'] },
  { id: 'i04-p2', module: 'i04', level: 'intermédiaire', title: 'Plan d’audit et de passage au blocage', problem: 'Concevoir le plan d’audit, de lecture des événements et de passage au blocage pour ASR et CFA.', architecture: 'Plan avec pilote, durée, critères et exclusions.', tools: ['Tableur'], data: 'Parc fictif.', steps: ['Définir le pilote.', 'Définir la durée.', 'Lister les exclusions.', 'Écrire les critères de passage.'], success: ['Critères mesurables.'], risks: ['Audit trop court.'], extensions: ['Ajouter des indicateurs.'],
    connected: { accounts: 'Un locataire de test avec Intune, Defender for Endpoint et un appareil Windows de test.', permissions: 'Endpoint Security Manager dans le locataire de test.', costs: 'Licences de test.', secrets: 'Aucun secret.', cleanup: 'Retirer les politiques de test.', limits: 'Facultatif : utiliser seulement les démonstrations de Microsoft, jamais de logiciel malveillant réel.' } },
  { id: 'i04-p3', module: 'i04', level: 'avancé', title: 'Registre de décisions d’atténuation', problem: 'Construire le registre de décisions d’Exploit Protection avec tests, approbateurs et retour.', architecture: 'Registre par application.', tools: ['Tableur'], data: 'Applications fictives.', steps: ['Inventorier les applications.', 'Décider les atténuations.', 'Documenter les tests.', 'Prévoir le retour.'], success: ['Chaque exception est justifiée.'], risks: ['Exceptions orphelines.'], extensions: ['Ajouter une revue semestrielle.'] },
];

export const i04 = assemble({ id: 'i04', level: 2, n: 4, title: 'Réduction de la surface d’attaque',
  summary: 'Règles ASR et leurs modes, exclusions, Network Protection, Controlled Folder Access, Exploit Protection, audit avant blocage et preuves.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Réduire la surface d’attaque chez Aurore Logistique',
  caseScenario: 'Vous planifiez les règles ASR, CFA, la protection réseau et Exploit Protection. Actions simulées.', caseMinutes: 45 });
