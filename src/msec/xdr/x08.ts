// Module 8 : Defender for Identity (niveau 3).
import type { AiCompetency, AiLesson, AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { sref } from '../sources.ts';

const md = (...lines: string[]) => lines.join('\n');
const { a, Q, M } = kit('x08');
const c1 = { comp: 'x08-c1', lesson: 'x08-l1', tags: ['capteur-v3', 'capteur-v2', 'prerequis-mdi'] };
const c2 = { comp: 'x08-c2', lesson: 'x08-l2', tags: ['audit-windows', 'comptes-service', 'sante-capteurs'] };
const c3 = { comp: 'x08-c3', lesson: 'x08-l3', tags: ['alertes-mdi', 'posture-identite', 'remediation-identite'] };

const l1: AiLesson = {
  id: 'x08-l1', module: 'x08', title: 'Architecture et choix du capteur v2 ou v3', minutes: 40,
  summary: 'Comprendre où s’installe Defender for Identity, les licences, les rôles et le choix entre capteur v3.x et v2.x.',
  objectives: ['Décrire l’architecture : capteurs, connecteurs d’API et service infonuagique.', 'Choisir v3.x ou v2.x selon le système d’exploitation et les fonctions requises.', 'Lister licences, rôles et prérequis réseau.'],
  prerequisites: ['Modules 1 et 3'],
  body: md(
    '## Ce que fait Defender for Identity',
    'Defender for Identity (MDI) détecte les menaces qui ciblent les **identités** : humaines et non humaines (comptes de service, comptes de synchronisation, applications). Il couvre la **posture** (évaluations de la posture de sécurité des identités, visibles dans Secure Score, chemins de mouvement latéral), la **détection** (analytique comportementale et corrélation de signaux), l’**investigation** (alertes enrichies, entités identité et activité d’authentification, intégrées dans le portail Defender) et la **réponse** (actions sur les identités compromises). Les alertes se corrèlent en incidents Defender XDR.',
    '## Architecture',
    'Des **capteurs** s’exécutent sur votre infrastructure d’identité, capturent et analysent localement le trafic réseau et les événements Windows, et n’envoient au service infonuagique que les signaux nécessaires. Des **connecteurs d’API** intègrent des systèmes de gestion des identités externes. Le service infonuagique analyse les signaux et les partage avec les autres charges de travail Defender.',
    '## Capteur v3.x ou v2.x',
    '| | v3.x | v2.x |',
    '| --- | --- | --- |',
    '| Systèmes | Windows Server 2019 ou plus récent, avec une mise à jour cumulative récente indiquée par Microsoft (capteur 3.0.10 ou plus) | Windows Server 2016 ou plus ancien (et rôles non DC sur versions anciennes) |',
    '| Rôles | Contrôleurs de domaine ; AD FS, AD CS et Entra Connect hors DC en **préversion** | Contrôleurs de domaine, AD FS, AD CS, Entra Connect |',
    '| Intégration à Defender for Endpoint | Serveur intégré à MDE (antivirus actif ou passif) ; ou activation sans MDE, en préversion, pour nouveaux déploiements de DC | Installation par paquet, indépendante de MDE |',
    '| Compte de service d’annuaire | **Aucun** (LocalSystem) | **DSA ou gMSA** recommandé |',
    '| Mises à jour | Par **Windows Update** | Gérées par la console, option de mise à jour différée |',
    '| Limites | Pas d’intégration VPN, pas de notifications syslog, limites avec ExpressRoute | Prend en charge VPN et syslog |',
    'Les deux versions peuvent coexister dans le même espace de travail. Règle de décision : v3.x pour tout serveur éligible, v2.x pour les serveurs plus anciens ou quand l’intégration VPN ou le syslog est requis sur le contrôleur de domaine concerné. Si v3.x n’est déployé que sur des serveurs AD FS, AD CS ou Entra Connect, il faut **au moins un capteur v3.x sur un contrôleur de domaine**. Sur AD FS, les capteurs ne sont requis que sur les serveurs de fédération (pas sur les WAP) ; pour Entra Connect, sur les serveurs **actifs et en attente (staging)** ; les serveurs AD CS hors ligne n’ont pas besoin de capteur.',
    '## Licences, rôles et réseau',
    '**Licences** : Enterprise Mobility + Security E5, Microsoft 365 E5, ou les licences Security E5/F5 listées par Microsoft ; une licence autonome existe selon la page v2.x. **Rôles** : Security Administrator, ou en RBAC unifié les permissions **System settings (Read and manage)** et **Security settings (All permissions)**. Il faut un locataire Entra ID. **Réseau** : le capteur v3.x utilise les mêmes URI que Defender for Endpoint (connectivité simplifiée ou standard) ; la documentation v2.x cite le domaine du service MDI sur le port 443. Vérifiez la page de la version que vous déployez.',
    '## Activation automatique et gestion',
    'Dans le portail, l’onglet **Sensor management** liste les capteurs et les serveurs découverts avec un statut d’éligibilité. Des cartes d’action regroupent : contrôleurs de domaine prêts pour l’activation, prêts pour l’intégration manuelle, serveurs prêts pour la migration et capteurs en mauvaise santé. L’**activation automatique du capteur v3.x** se configure dans les fonctions avancées.',
  ),
  demo: { title: 'Choisir le capteur', body: md(
    'Parc **fictif** :',
    '```text',
    'Serveur           OS                  Rôle    Choix',
    'DC01              Windows Server 2022  DC      v3.x (intégré à MDE)',
    'DC02              Windows Server 2016  DC      v2.x',
    'ADFS01            Windows Server 2022  AD FS   v3.x préversion, au moins un DC v3.x requis',
    '```',
    '**Lecture commentée.** Le choix dépend de l’OS, du rôle et des fonctions requises.',
    '**Ce que la démo ne prouve pas.** Aucun capteur n’a été installé.') },
  guided: 'x08-g1', autonomous: 'x08-a1', quiz: ['x08-q1a', 'x08-q1b', 'x08-q1c'],
  revision: md('## Fiche : architecture et capteurs', '- Capteurs + connecteurs d’API + service infonuagique.', '- v3.x : WS2019+, MDE, pas de DSA, Windows Update, pas de VPN ni syslog.', '- v2.x : WS2016 et moins, DSA ou gMSA, VPN et syslog pris en charge.', '- AD FS, AD CS, Entra Connect en v3.x : préversion, au moins un DC v3.x.', '- Rôles : Security Administrator ou RBAC unifié.'),
  links: [sref('mdi-what-is'), sref('mdi-deploy'), sref('mdi-sensor-v3'), sref('mdi-sensor-v2'), sref('mdi-whats-new')], teaches: ['capteur-v3', 'capteur-v2', 'prerequis-mdi'],
};

const l2: AiLesson = {
  id: 'x08-l2', module: 'x08', title: 'Audit Windows, comptes de service et santé des capteurs', minutes: 40,
  summary: 'Configurer ce qui nourrit les détections, choisir entre DSA, gMSA et LocalSystem, et surveiller la santé.',
  objectives: ['Décrire l’audit nécessaire et le rôle des événements 4662 et 5136.', 'Choisir entre DSA, gMSA et compte du capteur, et configurer les comptes d’action.', 'Lire et traiter les problèmes de santé.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Audit des événements Windows',
    'Sans audit correct, les détections sont incomplètes. Pour v3.x, activez l’**audit automatique des événements Windows** : il configure l’audit sur tout serveur éligible exécutant le capteur, y compris AD FS, AD CS et Entra Connect hors contrôleur de domaine. Les configurations d’audit de v2.x sont conservées et converties lors de la migration. À partir du capteur 3.0.8, l’**audit RPC** s’active automatiquement à la mise à niveau.',
    'Pour une configuration manuelle (GPO), les sous-catégories d’audit avancé et leurs événements : Credential Validation (4776), Computer Account Management (4741, 4743), Distribution Group Management (4753, 4763), Security Group Management (4728, 4729, 4730, 4732, 4733, 4756, 4757, 4758), User Account Management (4726), Directory Service Changes (5136), Security System Extension (4697) et Directory Service Access (**4662**, qui exige aussi l’audit des objets de domaine). L’audit des objets doit couvrir **tous** les types descendants : utilisateurs, groupes, ordinateurs, msDS-GroupManagedServiceAccount, msDS-ManagedServiceAccount et msDS-DelegatedManagedServiceAccount. Configurer un seul type donne une couverture incomplète. On vérifie avec `auditpol.exe /get /category:*` et l’observateur d’événements.',
    '## Comptes : DSA, gMSA, LocalSystem',
    'Le **compte de service d’annuaire (DSA)** sert aux capteurs v2.x à lire Active Directory : accès **en lecture seule à tous les objets**, y compris le conteneur **Deleted Objects** (pour détecter les suppressions d’utilisateurs). Préférez un **gMSA** (nom se terminant par `$`) à un compte avec mot de passe. Pour un gMSA, créez un groupe de sécurité avec les comptes d’ordinateur des capteurs, accordez la lecture du mot de passe au groupe, et accordez les permissions AD au groupe. Après un changement d’appartenance au groupe, il faut un nouveau ticket Kerberos : redémarrage, attente (environ 10 heures) ou `klist purge -li 0x3e7`. Le droit **Log on as a service** doit inclure le gMSA, sinon le problème « Directory services user credentials are incorrect » apparaît. La commande `Test-MDIDSA` vérifie que le compte n’a pas trop de permissions. **v3.x** n’a besoin d’aucun DSA ni gMSA : il utilise LocalSystem pour les interactions AD. Si le DSA ou gMSA de v2.x reste configuré dans l’espace de travail, la validation continue sur tous les capteurs, par conception ; retirez-le quand tous les capteurs sont migrés.',
    '**Comptes d’action** : ils exécutent les remédiations (désactiver un utilisateur, forcer un changement de mot de passe). Quand un capteur est v3.x, l’option **Automatically use the sensor’s local system account** doit rester sélectionnée ; avec un gMSA sélectionné, les actions de réponse, dont la perturbation d’attaque, ne fonctionnent pas.',
    '## Santé des capteurs',
    'La page **Health issues** (Settings > Identities > Deployment) distingue les problèmes **globaux** (domaine, agrégés) et les problèmes **spécifiques à un capteur**. Les statuts : **Open**, **Closed** (fermé automatiquement quand le problème est résolu, ou manuellement par un administrateur du bon rôle) et **Suppressed** (supprimé pendant **7 jours**, par exemple pendant une maintenance prévue). Avant d’appliquer une procédure, vérifiez la version du capteur concernée. Un capteur silencieux est un angle mort : surveillez-le comme n’importe quelle source de journaux.',
  ),
  demo: { title: 'Diagnostiquer une alerte de santé', body: md(
    'Cas **fictifs** :',
    '```text',
    'Problème                                   Cause probable                          Action',
    'Directory services user credentials wrong   Droit Log on as a service manquant      Ajouter le gMSA au droit',
    'Capteur v3 : audit RPC mal configuré         Auditing non automatique                Activer l’audit automatique',
    '```',
    '**Lecture commentée.** Chaque alerte de santé nomme la version du capteur concernée.',
    '**Ce que la démo ne prouve pas.** Aucun domaine n’a été audité.') },
  guided: 'x08-g2', autonomous: 'x08-a2', quiz: ['x08-q2a', 'x08-q2b', 'x08-q2c'],
  revision: md('## Fiche : audit et comptes', '- v3.x : audit automatique, LocalSystem, pas de DSA ; audit RPC auto depuis 3.0.8.', '- v2.x : DSA ou gMSA en lecture sur tous les objets, dont Deleted Objects.', '- 4662 exige l’audit des objets sur six types descendants.', '- Comptes d’action : conserver LocalSystem avec v3.x.', '- Santé : Open, Closed, Suppressed (7 jours).'),
  links: [sref('mdi-auditing'), sref('mdi-dsa'), sref('mdi-gmsa'), sref('mdi-migrate-v3'), sref('mdi-health')], teaches: ['audit-windows', 'comptes-service', 'sante-capteurs'],
};

const l3: AiLesson = {
  id: 'x08-l3', module: 'x08', title: 'Alertes, posture des identités et remédiation', minutes: 40,
  summary: 'Lire les alertes selon les phases d’attaque, utiliser la posture et les chemins d’attaque, et répondre aux identités compromises.',
  objectives: ['Classer les alertes par phase d’attaque et distinguer format classique et format Defender.', 'Utiliser les recommandations de posture et les chemins d’attaque.', 'Choisir et exécuter une remédiation avec les droits et prérequis.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Alertes par phase d’attaque',
    'Les alertes MDI suivent les phases d’une attaque : **reconnaissance**, **identifiants compromis** (force brute, authentifications échouées répétées, changements suspects d’appartenance à un groupe), **mouvement latéral**, **domination du domaine AD** (exécution de code à distance sur les contrôleurs de domaine, DCShadow, réplication malveillante, Golden Ticket). Des exemples : Suspected pass-the-ticket, possible prise de contrôle du compte de SSO transparent AZUREADSSOACC, exploitation du service Spooler. Le contexte de chaque alerte (identités touchées, activité liée, techniques MITRE) aide à valider le comportement. Défenseur : MDI **bâtit des profils comportementaux** pour les utilisateurs, appareils et comptes, et détecte les écarts.',
    '**Deux formats** : les alertes **classiques** et les alertes au **format Defender** reposent sur les mêmes détections de capteurs, mais diffèrent par la structure, les noms et les catégories (les identifiants restent cohérents). Le champ **Detection source** indique le format. Classez chaque alerte : **vrai positif**, **vrai positif bénin** ou **faux positif**. Les exclusions de détection se règlent par type de détection : évitez les exclusions larges.',
    '## Posture et chemins d’attaque',
    'Les **évaluations de la posture de sécurité des identités (ISPM)** se lisent dans Secure Score : configurations risquées et expositions. Exemples récents : supprimer les comptes Active Directory périmés (aucune connexion depuis 90 jours), comptes privilégiés Entra ID aussi privilégiés dans Active Directory. L’onglet **Attack paths** d’une identité montre les chemins de **mouvement latéral** qui y mènent ou en partent, et l’onglet des recommandations de sécurité rattache les évaluations à l’identité. **Identity Explorer** (préversion) exige une licence Sentinel Data Lake. Pour une investigation, ouvrez la page de l’identité : comptes liés, alertes, activité, recommandations.',
    '## Remédiation',
    'Les actions disponibles dans le portail : **Disable**, **Revoke session**, **Force password change**, depuis la page de l’identité, la chasse avancée ou le centre d’actions. Prérequis : le compte d’action doit être configuré (LocalSystem avec v3.x), et l’utilisateur du portail doit avoir un rôle personnalisé avec la permission **Response (manage)**. Les actions peuvent aussi viser les comptes liés à une identité. L’état s’observe dans l’**Action center**. Avant d’agir : confirmer l’alerte, évaluer l’impact (compte de service critique ? administrateur ?), prévoir un compte de secours et documenter. Désactiver un compte de service sans analyse peut arrêter une application de production.',
    '## Ce que MDI ne remplace pas',
    'MDI n’active pas par lui-même la protection des mots de passe, ne durcit pas Active Directory et n’applique pas de politique : il **détecte** et **évalue**. Le durcissement (niveaux d’administration, protection des comptes privilégiés) reste un chantier d’architecture distinct.',
  ),
  demo: { title: 'Lire une alerte', body: md(
    'Alerte **fictive** :',
    '```text',
    'Suspected pass-the-ticket (Medium)   Source : MDI (format Defender)',
    'Compte : svc-compta ; ticket émis pour SRV-A, réutilisé sur SRV-B',
    'Décision : valider l’origine, isoler SRV-B (MDE), forcer le changement de mot de passe',
    '```',
    '**Lecture commentée.** On confirme avant de remédier, et on coordonne MDI et MDE.',
    '**Ce que la démo ne prouve pas.** Données inventées.') },
  guided: 'x08-g3', autonomous: 'x08-a3', quiz: ['x08-q3a', 'x08-q3b', 'x08-q3c'],
  revision: md('## Fiche : alertes et remédiation', '- Phases : reconnaissance, identifiants, mouvement latéral, domination du domaine.', '- Formats classique et Defender ; classer TP, B-TP, FP.', '- Posture : Secure Score, comptes périmés (90 jours), chemins d’attaque.', '- Actions : Disable, Revoke session, Force password change.', '- Prérequis : compte d’action LocalSystem avec v3.x ; rôle avec Response (manage).'),
  links: [sref('mdi-alerts'), sref('mdi-alerts-xdr'), sref('mdi-remediation'), sref('mdi-investigate-identity'), sref('mdi-identity-security'), sref('mdi-what-is')], teaches: ['alertes-mdi', 'posture-identite', 'remediation-identite'],
};

const exercises = [
  a.match({ id: 'x08-g1', title: 'Choisir le capteur', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'fonctionner', lesson: 'x08-l1',
    st: 'Associez chaque serveur au capteur approprié.', items: [['p1', 'Contrôleur de domaine Windows Server 2022'], ['p2', 'Contrôleur de domaine Windows Server 2016'], ['p3', 'DC où l’intégration VPN est requise']],
    options: [['s1', 'Capteur v3.x'], ['s2', 'Capteur v2.x']], answer: { p1: 's1', p2: 's2', p3: 's2' },
    exp: 'v3.x convient aux serveurs récents ; v2.x pour Windows Server 2016 ou quand le VPN ou le syslog sont requis.' }),
  a.order({ id: 'x08-a1', title: 'Préparer un déploiement', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'fonctionner', lesson: 'x08-l1',
    st: 'Ordonnez la préparation d’un déploiement v3.x.',
    items: [['s1', 'Vérifier licences et rôles'], ['s2', 'Vérifier OS et mise à jour cumulative'], ['s3', 'Intégrer le serveur à Defender for Endpoint'], ['s4', 'Activer le capteur'], ['s5', 'Vérifier l’audit et la santé']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'On valide licences, OS et intégration MDE avant l’activation, puis l’audit et la santé.' }),
  Q('x08-q1a', 'quiz', 'comprendre', c1, 'Où s’installe MDI', 'Où s’exécutent les capteurs MDI ?', ['Sur votre infrastructure d’identité (contrôleurs de domaine et serveurs d’identité).', 'Ils analysent localement.'], [['Seulement dans le nuage.', 'Les capteurs sont locaux.'], ['Sur chaque poste.', 'Non.'], ['Sur les pare-feu.', 'Non.']], 'Les capteurs s’exécutent sur l’infrastructure d’identité.'),
  Q('x08-q1b', 'quiz', 'fonctionner', c1, 'Exigence avec AD FS', 'Vous déployez v3.x seulement sur AD FS. Que faut-il en plus ?', ['Au moins un capteur v3.x sur un contrôleur de domaine.', 'Exigence documentée.'], [['Rien.', 'Il y a une exigence.'], ['Un capteur v2.x sur le WAP.', 'Non.'], ['Un DSA.', 'Pas avec v3.x.']], 'Il faut au moins un capteur v3.x sur un contrôleur de domaine.'),
  Q('x08-q1c', 'quiz', 'securiser', c1, 'Rôles', 'Quelles permissions RBAC unifié permettent de créer l’espace de travail ?', ['System settings (Read and manage) et Security settings (All permissions).', 'Ou le rôle Security Administrator.'], [['Aucune.', 'Il en faut.'], ['Global Reader.', 'Lecture seule.'], ['Help desk.', 'Non.']], 'Security Administrator, ou ces deux permissions en RBAC unifié.'),

  a.config({ id: 'x08-g2', title: 'Comptes pour un parc mixte', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'securiser', lesson: 'x08-l2',
    st: 'Paramétrez les comptes pour un parc avec v2.x et v3.x.',
    fields: [
      { id: 'dsa', label: 'Type de compte de service d’annuaire pour v2.x', kind: 'select', options: [{ id: 'gmsa', label: 'gMSA' }, { id: 'user', label: 'Compte utilisateur avec mot de passe fixe' }], accept: ['gmsa'], why: 'Pas de mot de passe à gérer.' },
      { id: 'action', label: 'Compte d’action avec capteurs v3.x : utiliser le compte local du capteur', kind: 'toggle', accept: ['on'], why: 'Sinon les actions de réponse échouent.' },
      { id: 'del', label: 'Lecture du conteneur Deleted Objects accordée au compte', kind: 'toggle', accept: ['on'], why: 'Pour détecter les suppressions.' },
    ], solution: { dsa: 'gmsa', action: 'on', del: 'on' }, exp: 'gMSA pour v2.x, compte local pour les actions avec v3.x, et lecture de Deleted Objects.' }),
  a.inspect({ id: 'x08-a2', title: 'Relire un plan d’audit', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'maintenir', lesson: 'x08-l2', language: 'text',
    st: 'Plan d’audit fictif. Repérez les failles.',
    lines: [['p1', 'Audit des objets configuré seulement pour les utilisateurs.', { ok: 'a1', fixes: [['a1', 'Couvrir tous les types descendants (groupes, ordinateurs, comptes gérés)'], ['a2', 'Accepter']] }], ['p2', 'Le DSA est un compte d’administrateur de domaine pour être sûr d’avoir assez de droits.', { ok: 'b1', fixes: [['b1', 'Accorder seulement la lecture et vérifier avec Test-MDIDSA'], ['b2', 'Accepter']] }], ['p3', 'Les alertes de santé sont revues chaque trimestre.', { ok: 'c1', fixes: [['c1', 'Surveiller la santé comme une source de journaux critique'], ['c2', 'Accepter']] }]],
    exp: 'L’audit doit couvrir tous les types ; le DSA reste en lecture ; un capteur muet est un angle mort.' }),
  Q('x08-q2a', 'quiz', 'comprendre', c2, 'Événement 4662', 'Que faut-il pour que l’événement 4662 soit utile ?', ['Configurer aussi l’audit des objets de domaine.', 'Sinon l’événement ne se produit pas comme voulu.'], [['Rien.', 'Il faut l’audit des objets.'], ['Désactiver le pare-feu.', 'Non.'], ['Installer un agent.', 'Non.']], 'L’événement 4662 exige l’audit des objets de domaine.'),
  Q('x08-q2b', 'quiz', 'fonctionner', c2, 'v3.x et DSA', 'Un capteur v3.x a-t-il besoin d’un DSA ?', ['Non, il utilise LocalSystem.', 'Aucun DSA ni gMSA requis.'], [['Oui toujours.', 'Non.'], ['Oui un gMSA.', 'Non.'], ['Oui un administrateur.', 'Non.']], 'Le capteur v3.x n’exige ni DSA ni gMSA.'),
  Q('x08-q2c', 'quiz', 'maintenir', c2, 'Suppression de santé', 'Combien de jours un problème de santé peut-il être supprimé ?', ['7 jours.', 'Statut Suppressed.'], [['1 jour.', 'Non.'], ['30 jours.', 'Non.'], ['Pour toujours.', 'Non.']], 'La suppression dure 7 jours.'),

  a.workflow({ id: 'x08-g3', title: 'Répondre à une identité compromise', comp: c3.comp, tags: c3.tags, role: 'guided', dim: 'securiser', lesson: 'x08-l3',
    st: 'Ordonnez la réponse à une alerte de pass-the-ticket sur un compte de service.',
    blocks: [['b1', 'Confirmer l’alerte et son contexte'], ['b2', 'Évaluer l’impact sur les applications'], ['b3', 'Isoler l’appareil source avec MDE'], ['b4', 'Forcer le changement de mot de passe et révoquer la session'], ['b5', 'Documenter et classer l’alerte'], ['b6', 'Désactiver le compte sans analyse']],
    required: ['b1', 'b2', 'b3', 'b4', 'b5'], forbidden: ['b6'], before: [['b1', 'b2'], ['b2', 'b4'], ['b4', 'b5']], notes: { b6: 'Un compte de service critique arrêté sans analyse peut interrompre la production.' }, solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
    exp: 'On confirme, on évalue l’impact, on coordonne MDE et MDI, puis on documente.' }),
  a.match({ id: 'x08-a3', title: 'Phases d’attaque', comp: c3.comp, tags: c3.tags, role: 'autonomous', dim: 'comprendre', lesson: 'x08-l3',
    st: 'Associez chaque comportement à la phase d’attaque.', items: [['p1', 'Énumération de comptes et de groupes'], ['p2', 'Force brute sur un compte'], ['p3', 'Golden Ticket']],
    options: [['s1', 'Reconnaissance'], ['s2', 'Identifiants compromis'], ['s3', 'Domination du domaine AD']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'L’énumération est de la reconnaissance, la force brute vise les identifiants, le Golden Ticket est une domination du domaine.' }),
  Q('x08-q3a', 'quiz', 'comprendre', c3, 'Formats d’alertes', 'Comment distinguer une alerte classique d’une alerte au format Defender ?', ['Par le champ Detection source.', 'Les identifiants restent cohérents.'], [['Par la couleur.', 'Non.'], ['Par la date.', 'Non.'], ['Impossible.', 'Possible.']], 'Detection source indique le format.'),
  Q('x08-q3b', 'quiz', 'securiser', c3, 'Permission de réponse', 'Quelle permission faut-il pour agir sur une identité dans le portail ?', ['Un rôle personnalisé avec Response (manage).', 'Plus un compte d’action configuré.'], [['Aucune.', 'Non.'], ['Security Reader.', 'Lecture seule.'], ['Global Reader.', 'Lecture seule.']], 'La permission Response (manage) est requise.'),
  Q('x08-q3c', 'quiz', 'fonctionner', c3, 'Compte périmé', 'Quel critère définit un compte AD périmé dans l’évaluation de posture ?', ['Aucune connexion durant les 90 derniers jours.', 'Évaluation de posture.'], [['30 jours.', 'Non.'], ['1 an.', 'Non.'], ['Mot de passe expiré.', 'Non.']], 'Un compte est périmé après 90 jours sans connexion.'),

  Q('x08-ev1', 'eval', 'comprendre', c1, 'Mises à jour v3.x', 'Comment le capteur v3.x se met-il à jour ?', ['Par Windows Update.', 'Dans le processus de mise à jour du serveur.'], [['Par la console MDI seulement.', 'Non.'], ['Manuellement par paquet.', 'Non.'], ['Jamais.', 'Non.']], 'v3.x se met à jour via Windows Update.'),
  M('x08-ev2', 'eval', 'fonctionner', c1, 'Limites de v3.x', 'Cochez les limites de v3.x.', [['Pas d’intégration VPN.', 'Documentée.'], ['Pas de notifications syslog.', 'Documentée.'], ['Limites avec Azure ExpressRoute.', 'Documentées.']], [['Aucun support des contrôleurs de domaine.', 'Ils sont pris en charge.']], 'v3.x prend en charge les contrôleurs de domaine.'),
  a.config({ id: 'x08-ev3', title: 'Configurer l’audit', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'securiser', lesson: 'x08-l2',
    st: 'Paramétrez l’audit d’un domaine surveillé par des capteurs v3.x.',
    fields: [
      { id: 'auto', label: 'Audit automatique des événements Windows', kind: 'toggle', accept: ['on'], why: 'Configuration validée par le service.' },
      { id: 'types', label: 'Audit des objets sur tous les types descendants', kind: 'toggle', accept: ['on'], why: 'Un seul type donne une couverture incomplète.' },
      { id: 'verif', label: 'Vérifier avec auditpol et l’observateur d’événements', kind: 'toggle', accept: ['on'], why: 'On confirme la production des événements.' },
    ], solution: { auto: 'on', types: 'on', verif: 'on' }, exp: 'Audit automatique, tous les types et vérification.' }),
  a.fix({ id: 'x08-ev4', title: 'Corriger une configuration de comptes', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'securiser', lesson: 'x08-l2', language: 'json',
    st: 'Corrigez : gMSA, lecture seule, compte d’action local avec v3.x.',
    starter: JSON.stringify({ dsa: 'admin-domaine', typeDsa: 'utilisateur', droits: 'ecriture', compteAction: 'gmsa' }, null, 2),
    rules: [{ kind: 'equals', path: 'typeDsa', value: 'gmsa', message: 'Utiliser un gMSA.', dim: 'securiser' }, { kind: 'equals', path: 'droits', value: 'lecture', message: 'Lecture seule.', dim: 'securiser' }, { kind: 'equals', path: 'compteAction', value: 'local', message: 'Compte local avec v3.x.', dim: 'fonctionner' }, { kind: 'excludes', path: 'dsa', value: 'admin-domaine', message: 'Pas un administrateur de domaine.', dim: 'securiser' }],
    solution: JSON.stringify({ dsa: 'mdisvc$', typeDsa: 'gmsa', droits: 'lecture', compteAction: 'local' }, null, 2), exp: 'gMSA en lecture seule pour v2.x, et compte local pour les actions avec v3.x.' }),
  a.match({ id: 'x08-ev5', title: 'Statuts de santé', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'comprendre', lesson: 'x08-l2',
    st: 'Associez chaque statut à sa signification.', items: [['p1', 'Open'], ['p2', 'Closed'], ['p3', 'Suppressed']],
    options: [['s1', 'Problème actif à traiter'], ['s2', 'Résolu automatiquement ou manuellement'], ['s3', 'Masqué temporairement pendant 7 jours']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Open est actif, Closed est résolu, Suppressed masque temporairement pour 7 jours.' }),
  a.inspect({ id: 'x08-ev6', title: 'Relire un rapport d’incident d’identité', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'maintenir', lesson: 'x08-l3', language: 'text',
    st: 'Extrait d’un rapport. Repérez les faiblesses.',
    lines: [['r1', 'Nous avons désactivé le compte de service dès l’alerte.', { ok: 'a1', fixes: [['a1', 'Évaluer l’impact avant de désactiver un compte de service'], ['a2', 'Accepter']] }], ['r2', 'L’alerte a été classée faux positif sans enquête.', { ok: 'b1', fixes: [['b1', 'Classer après validation du contexte'], ['b2', 'Accepter']] }], ['r3', 'Les chemins d’attaque ont été examinés pour l’identité touchée.']],
    exp: 'On évalue l’impact avant d’agir et on classe après validation.' }),
  a.workflow({ id: 'x08-ev7', title: 'Migrer un parc v2 vers v3', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'maintenir', lesson: 'x08-l1',
    st: 'Ordonnez la migration d’un contrôleur de domaine de v2.x vers v3.x.',
    blocks: [['b1', 'Vérifier les prérequis de migration'], ['b2', 'Activer l’audit automatique'], ['b3', 'Vérifier le compte d’action local'], ['b4', 'Migrer le capteur'], ['b5', 'Retirer le DSA quand tous sont migrés'], ['b6', 'Retirer le DSA avant la fin de la migration']],
    required: ['b1', 'b2', 'b3', 'b4', 'b5'], forbidden: ['b6'], before: [['b1', 'b4'], ['b3', 'b4'], ['b4', 'b5']], notes: { b6: 'Les capteurs v2.x restants en ont encore besoin.' }, solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
    exp: 'On valide, on configure audit et compte d’action, on migre puis on retire le DSA.' }),
  a.short({ id: 'x08-ev8', title: 'Audit RPC automatique', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'comprendre', lesson: 'x08-l2',
    st: 'À partir de quelle version du capteur (nombre après 3.0.) l’audit RPC s’active-t-il automatiquement à la mise à niveau ? (nombre)', accepted: ['8'], numeric: { value: 8 }, ph: 'un nombre',
    exp: 'À partir du capteur 3.0.8, l’audit RPC s’active automatiquement lors de la mise à niveau, sans configuration manuelle.' }),

  a.config({ id: 'x08-cs1', title: 'Cas : plan de déploiement de Nordlys', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'fonctionner', lesson: 'x08-l1',
    st: 'Paramétrez le déploiement MDI de Nordlys.',
    fields: [
      { id: 'lic', label: 'Licences et rôles vérifiés', kind: 'toggle', accept: ['on'], why: 'Prérequis.' },
      { id: 'v3', label: 'v3.x sur les serveurs éligibles intégrés à MDE', kind: 'toggle', accept: ['on'], why: 'Recommandé pour WS2019 et plus.' },
      { id: 'v2', label: 'v2.x sur les serveurs plus anciens', kind: 'toggle', accept: ['on'], why: 'Seul choix pour WS2016 et moins.' },
    ], solution: { lic: 'on', v3: 'on', v2: 'on' }, exp: 'Prérequis, v3.x pour l’éligible et v2.x pour l’ancien.' }),
  a.config({ id: 'x08-cs2', title: 'Cas : audit et santé de Nordlys', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'maintenir', lesson: 'x08-l2',
    st: 'Paramétrez l’exploitation courante.',
    fields: [
      { id: 'aud', label: 'Audit automatique activé', kind: 'toggle', accept: ['on'], why: 'Détections complètes.' },
      { id: 'sante', label: 'Revue hebdomadaire des problèmes de santé', kind: 'toggle', accept: ['on'], why: 'Un capteur muet est un angle mort.' },
      { id: 'supp', label: 'Suppressions limitées à 7 jours avec justification', kind: 'toggle', accept: ['on'], why: 'Durée maximale de la suppression.' },
    ], solution: { aud: 'on', sante: 'on', supp: 'on' }, exp: 'Audit actif, revue hebdomadaire de la santé et suppressions encadrées dans le temps.' }),
  a.workflow({ id: 'x08-cs3', title: 'Cas : compromission d’un compte privilégié', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'securiser', lesson: 'x08-l3',
    st: 'Ordonnez la réponse à une alerte sur un compte administrateur.',
    blocks: [['t1', 'Confirmer l’alerte et la portée'], ['t2', 'Examiner les chemins d’attaque de l’identité'], ['t3', 'Révoquer la session et forcer le changement de mot de passe'], ['t4', 'Isoler les appareils concernés'], ['t5', 'Revoir les évaluations de posture associées'], ['t6', 'Fermer l’alerte sans suivi']],
    required: ['t1', 't2', 't3', 't4', 't5'], forbidden: ['t6'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't5']], notes: { t6: 'Sans suivi, la cause de l’exposition demeure.' }, solution: ['t1', 't2', 't3', 't4', 't5'],
    exp: 'On cerne la portée, on coupe l’accès, on isole puis on corrige la posture.' }),
  a.open({ id: 'x08-cs-open', title: 'Cas : programme de protection des identités', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'x08-l3',
    st: 'Rédigez le programme de protection des identités d’une organisation fictive.',
    deliverable: 'Un programme : architecture des capteurs, audit, comptes, santé, gestion des alertes, posture, remédiation avec approbation, limites.',
    rubric: [['r1', 'Le choix des capteurs est justifié.', 'fonctionner'], ['r2', 'L’audit et les comptes sont décrits.', 'securiser'], ['r3', 'La santé est surveillée.', 'maintenir'], ['r4', 'La remédiation est encadrée.', 'securiser'], ['r5', 'Les limites sont reconnues.', 'comprendre']],
    exp: 'Pas de note automatique : on juge la cohérence du programme.' }),

  Q('x08-rm1', 'remediation', 'comprendre', c1, 'Remédiation : v3.x', 'Quel compte de service v3.x utilise-t-il pour AD ?', ['LocalSystem, sans DSA.', 'Aucun gMSA requis.'], [['Un administrateur du domaine.', 'Non.'], ['Un compte utilisateur.', 'Non.'], ['Aucun accès.', 'Non.']], 'v3.x utilise LocalSystem.'),
  Q('x08-rm2', 'remediation', 'securiser', c2, 'Remédiation : comptes d’action', 'Avec v3.x, quel réglage garder pour les comptes d’action ?', ['Utiliser automatiquement le compte local du capteur.', 'Sinon les actions échouent.'], [['gMSA.', 'Les actions échouent.'], ['Un administrateur.', 'Non.'], ['Aucun.', 'Non.']], 'Il faut garder le compte local du capteur.'),
  Q('x08-rm3', 'remediation', 'maintenir', c3, 'Remédiation : impact', 'Que faire avant de désactiver un compte de service ?', ['Évaluer l’impact sur les applications.', 'Il peut être critique.'], [['Rien.', 'Risqué.'], ['Le supprimer.', 'Risqué.'], ['Attendre une semaine.', 'Non.']], 'On évalue l’impact avant toute action.'),
];

const competencies: AiCompetency[] = [
  { id: 'x08-c1', module: 'x08', name: 'Planifier le déploiement de MDI', description: 'Architecture, versions de capteurs, licences et rôles.', criteria: [{ id: 'x08-c1-1', text: 'Je choisis v2.x ou v3.x avec justification.' }, { id: 'x08-c1-2', text: 'Je connais les licences et rôles.' }, { id: 'x08-c1-3', text: 'Je planifie la migration.' }] },
  { id: 'x08-c2', module: 'x08', name: 'Configurer audit, comptes et santé', description: 'Événements, DSA, gMSA et comptes d’action.', criteria: [{ id: 'x08-c2-1', text: 'Je configure l’audit complet.' }, { id: 'x08-c2-2', text: 'Je choisis le bon type de compte.' }, { id: 'x08-c2-3', text: 'Je surveille la santé des capteurs.' }] },
  { id: 'x08-c3', module: 'x08', name: 'Traiter alertes, posture et remédiation', description: 'Phases d’attaque, chemins d’attaque et actions.', criteria: [{ id: 'x08-c3-1', text: 'Je classe les alertes par phase.' }, { id: 'x08-c3-2', text: 'J’utilise la posture et les chemins d’attaque.' }, { id: 'x08-c3-3', text: 'Je remédie avec évaluation d’impact.' }] },
];

const projects: AiProject[] = [
  { id: 'x08-p1', module: 'x08', level: 'débutant', title: 'Fiche de choix de capteur', problem: 'Concevoir une fiche pour choisir v2.x ou v3.x selon le serveur.', architecture: 'Arbre de décision.', tools: ['Éditeur de texte'], data: 'Aucune donnée réelle.', steps: ['Lister les critères.', 'Associer les capteurs.', 'Ajouter les limites.'], success: ['Chaque branche cite une source.'], risks: ['Oublier les limites de v3.x.'], extensions: ['Ajouter la migration.'] },
  { id: 'x08-p2', module: 'x08', level: 'intermédiaire', title: 'Plan d’audit et de santé', problem: 'Concevoir l’audit, les comptes et la revue de santé d’un domaine fictif.', architecture: 'Document avec liste de vérification.', tools: ['Tableur'], data: 'Domaine fictif.', steps: ['Lister les événements.', 'Choisir les comptes.', 'Définir la revue.'], success: ['Tous les types d’objets sont couverts.'], risks: ['Audit partiel.'], extensions: ['Ajouter une alerte de santé.'],
    connected: { accounts: 'Un laboratoire Active Directory de test avec un contrôleur de domaine.', permissions: 'Administration du laboratoire et Security Administrator dans le locataire de test.', costs: 'Licences de test et machines virtuelles à votre charge.', secrets: 'Aucun secret en clair ; utilisez un gMSA.', cleanup: 'Retirer les capteurs et supprimer le laboratoire.', limits: 'Facultatif : le plan se fait sur papier.' } },
  { id: 'x08-p3', module: 'x08', level: 'avancé', title: 'Runbook de compromission d’identité', problem: 'Rédiger le runbook de réponse à un compte privilégié compromis.', architecture: 'Runbook avec rôles, preuves et retour arrière.', tools: ['Éditeur de texte'], data: 'Scénario fictif.', steps: ['Définir les déclencheurs.', 'Définir les actions.', 'Définir les preuves.', 'Définir le retour à la normale.'], success: ['Chaque action sensible a un approbateur.'], risks: ['Arrêt d’un compte de service critique.'], extensions: ['Relier à Defender for Endpoint.'] },
];

export const x08 = assemble({ id: 'x08', level: 3, n: 8, title: 'Defender for Identity',
  summary: 'Architecture, capteurs v2.x et v3.x, audit Windows, comptes de service, santé, alertes, posture des identités et remédiation.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Protéger les identités de Nordlys',
  caseScenario: 'Vous planifiez le déploiement, réglez l’audit et la santé, puis répondez à une compromission de compte privilégié. Tout reste sur papier.', caseMinutes: 45 });
