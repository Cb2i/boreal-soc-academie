// Module 10 : Applications et données (niveau 4).
import type { AiCompetency, AiLesson, AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { sref } from '../sources.ts';

const md = (...lines: string[]) => lines.join('\n');
const { a, Q, M } = kit('i10');
const c1 = { comp: 'i10-c1', lesson: 'i10-l1', tags: ['protection-applications', 'niveaux-donnees', 'effacement-selectif'] };
const c2 = { comp: 'i10-c2', lesson: 'i10-l2', tags: ['mdm-vs-mam', 'limites-byod', 'lancement-conditionnel'] };
const c3 = { comp: 'i10-c3', lesson: 'i10-l3', tags: ['purview', 'dlp-terminaux', 'licence-supplementaire'] };

const l1: AiLesson = {
  id: 'i10-l1', module: 'i10', title: 'Politiques de protection des applications : niveaux, chiffrement et effacement sélectif', minutes: 50,
  summary: 'Concevoir des politiques de protection des applications par niveaux et comprendre ce qu’un effacement sélectif retire vraiment.',
  objectives: ['Choisir un niveau de protection (1, 2 ou 3) selon la sensibilité des données.', 'Décrire ce qui est chiffré et ce qu’un effacement sélectif efface.', 'Configurer des actions de lancement conditionnel.'],
  prerequisites: ['Module 9'],
  body: md(
    '## Ce que protège une politique de protection des applications',
    'Une politique de protection des applications (APP) est un ensemble de règles appliquées *dans* l’application quand l’utilisateur accède à des données « d’entreprise » ou les déplace. Elle fonctionne avec ou sans inscription de l’appareil. Elle couvre les applications intégrées au SDK Intune ou enveloppées par l’outil d’enveloppement, dont les applications Microsoft 365 courantes. Elle s’applique uniformément à un groupe d’applications (par exemple toutes les applications Office mobiles) et ne vise que le contexte professionnel : dans un contexte personnel, les règles ne s’appliquent pas.',
    '## Qu’est-ce qui est chiffré',
    'Seules les données marquées « d’entreprise » sont chiffrées selon la politique. Pour les applications Microsoft 365, les emplacements d’entreprise sont le courriel (Exchange) et le stockage infonuagique (OneDrive avec un compte professionnel). Pour une application métier enveloppée, toutes les données de l’application sont considérées comme d’entreprise. Un fichier enregistré hors de ces emplacements, ou déplacé vers une application non protégée avant que la politique ne s’applique, peut échapper au chiffrement : c’est pourquoi on restreint aussi l’enregistrement de copies et le copier-coller.',
    '## Trois niveaux, pas un réglage unique',
    'Le cadre de protection des données propose trois niveaux cumulatifs. **Niveau 1, protection de base** : NIP, chiffrement, effacement sélectif, et attestation de l’appareil sur Android. **Niveau 2, protection renforcée** : prévention de la fuite de données (restriction du copier-coller et de l’enregistrement) et versions minimales du système. **Niveau 3, protection élevée** : mécanismes avancés, configuration de NIP renforcée et défense contre les menaces mobiles. Choisissez le niveau par groupe d’utilisateurs selon la sensibilité des données et l’impact sur l’expérience : le niveau 3 pour tous les employés est rarement soutenable. Les niveaux se déploient comme les anneaux d’une politique de configuration : pilote d’abord.',
    '## Lancement conditionnel',
    'Le lancement conditionnel évalue des conditions à l’ouverture de l’application (version minimale de l’application ou du système, appareil débridé ou enraciné, version minimale du Portail d’entreprise sur Android, fabricants autorisés) et exécute une action : **bloquer l’accès**, **effacer les données** ou **avertir**. Pour un changement qui force une mise à jour, l’avertissement évite des frais de données imprévus ; l’effacement est réservé aux conditions qui indiquent une compromission, comme un appareil enraciné.',
    '## Trois façons d’effacer',
    'Il y a l’**effacement complet de l’appareil** (retour aux paramètres d’usine, appareil retiré d’Intune, réservé aux appareils inscrits), l’**effacement sélectif MDM** (retrait des données d’entreprise via l’action de mise hors service, appareils inscrits) et l’**effacement sélectif MAM** (retrait des données d’entreprise d’une application, lancé depuis Intune). Pour l’effacement MAM, le SDK interroge le service environ toutes les 30 minutes quand l’application est ouverte, et au premier lancement avec connexion : l’effacement n’est pas instantané et dépend d’un appareil qui ouvre l’application et atteint le réseau.',
  ),
  demo: { title: 'Niveau par groupe', body: md(
    'Choix **fictif** :',
    '```text',
    'Tous les employés mobiles   : niveau 2',
    'Finance et direction        : niveau 3',
    'Stagiaires d’été (BYOD)     : niveau 1 + version minimale',
    '```',
    '**Lecture commentée.** Le niveau suit la sensibilité des données, pas l’ancienneté.',
    '**Ce que la démo ne prouve pas.** Aucune politique n’a été appliquée.') },
  guided: 'i10-g1', autonomous: 'i10-a1', quiz: ['i10-q1a', 'i10-q1b', 'i10-q1c'],
  revision: md('## Fiche : APP', '- Règles dans l’application, avec ou sans inscription.', '- Seules les données d’entreprise sont chiffrées.', '- Niveaux 1, 2, 3 cumulatifs : choisir par groupe.', '- Lancement conditionnel : bloquer, effacer ou avertir.', '- Effacement MAM : jusqu’à environ 30 minutes, appareil en ligne requis.'),
  links: [sref('intune-app-protection'), sref('intune-mam-faq'), sref('intune-app-protection-framework'), sref('intune-wipe-corporate-data')], teaches: ['protection-applications', 'niveaux-donnees', 'effacement-selectif'],
};

const l2: AiLesson = {
  id: 'i10-l2', module: 'i10', title: 'MDM ou MAM : choisir sans promettre ce que l’on ne peut pas faire', minutes: 45,
  summary: 'Comparer la gestion d’appareil et la gestion d’applications, et nommer les limites du BYOD sans inscription.',
  objectives: ['Distinguer MDM, MAM sans inscription et MAM avec MDM.', 'Énoncer les limites d’un appareil non inscrit.', 'Cibler une politique selon l’état de gestion de l’appareil.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Trois configurations',
    '**MDM seul** : l’appareil est inscrit ; l’organisation configure l’appareil, déploie des applications et évalue la conformité. **MAM sans inscription** : l’appareil n’est pas géré ; on protège seulement les données dans les applications. **MAM avec MDM** : les deux ensemble, la politique d’application ajoutant une couche (restrictions d’enregistrement, de copier-coller, NIP, effacement sélectif sans retirer l’application). Une même personne peut avoir un téléphone d’entreprise en MDM plus MAM et une tablette personnelle en MAM seulement.',
    '## Limites d’un appareil non inscrit',
    'Sans inscription, vous **ne pouvez pas déployer** d’applications (l’utilisateur les prend à la boutique), **ne pouvez pas provisionner** de profils de certificats et **ne pouvez pas provisionner** le Wi-Fi ni le VPN de l’entreprise. Vous ne voyez pas non plus l’état du chiffrement du disque ni des correctifs du système. Toute promesse de conformité d’appareil sur ce parc est donc fausse ; la promesse honnête est « les données d’entreprise restent dans des applications protégées ».',
    '## Cibler selon l’état de gestion',
    'Quand vous créez une politique d’application, la question « cibler les applications sur tous les types d’appareils » permet de répondre Non et de choisir : une politique **moins stricte** pour les appareils gérés par Intune et plus restrictive pour les autres ; une politique **équivalente** pour tous ; ou une politique pour les **appareils non inscrits seulement**. Sans choix, l’utilisateur reçoit la politique sur l’appareil personnel et sur l’appareil géré. Cette décision évite de pénaliser deux fois un appareil déjà protégé par la conformité.',
    '## Précautions',
    'La politique ne doit pas être combinée à des solutions de gestion d’applications ou de conteneurs d’un autre fournisseur. Pour Exchange en local, seules Outlook mobile avec authentification moderne hybride et les conditions précisées par la documentation sont prises en charge ; d’autres applications connectées à Exchange ou SharePoint en local ne prennent pas en charge les politiques d’application. Sur Android, le Portail d’entreprise est nécessaire pour recevoir la politique. Pour que la politique soit réellement appliquée, il faut l’associer à l’accès conditionnel (module 9), sinon un client non protégé peut encore accéder aux données.',
    '## Quand préférer l’inscription',
    'Préférez l’inscription pour les appareils de l’organisation, quand il faut déployer des applications, des certificats, des profils réseau, ou prouver la conformité. Préférez la protection des applications quand l’appareil appartient à l’utilisateur et que la vie privée est une exigence. Documentez le choix par catégorie d’appareils plutôt que par préférence de l’équipe.',
  ),
  demo: { title: 'Ce que l’on peut promettre', body: md(
    'Tableau **fictif** :',
    '```text',
    'Capacité                       Inscrit   Non inscrit',
    'Déployer des applications      Oui       Non',
    'Profil Wi-Fi et VPN            Oui       Non',
    'Effacement sélectif d’appli    Oui       Oui',
    'Preuve de chiffrement disque   Oui       Non',
    '```',
    '**Lecture commentée.** La colonne de droite est celle qu’on ne peut pas promettre.',
    '**Ce que la démo ne prouve pas.** Aucun appareil n’a été consulté.') },
  guided: 'i10-g2', autonomous: 'i10-a2', quiz: ['i10-q2a', 'i10-q2b', 'i10-q2c'],
  revision: md('## Fiche : MDM et MAM', '- MAM sans inscription : pas de déploiement, ni certificats, ni Wi-Fi, ni VPN.', '- MAM + MDM : couche supplémentaire sur les appareils inscrits.', '- Ciblage selon l’état de gestion : moins strict, équivalent ou non inscrit seulement.', '- Pas de solution de conteneur tierce en parallèle.', '- Associer à l’accès conditionnel.'),
  links: [sref('intune-mam-step2'), sref('intune-mam-faq'), sref('intune-mam-unenrolled'), sref('intune-app-protection')], teaches: ['mdm-vs-mam', 'limites-byod', 'lancement-conditionnel'],
};

const l3: AiLesson = {
  id: 'i10-l3', module: 'i10', title: 'Purview et DLP des terminaux : un produit distinct relié à Intune et Defender', minutes: 40,
  summary: 'Situer la prévention des pertes de données de Purview par rapport à Intune et Defender, sans la présenter comme native.',
  objectives: ['Classer la DLP des terminaux comme intégration avec licence propre.', 'Décrire comment l’intégration à Defender intègre aussi à la DLP.', 'Savoir ce qui reste hors de portée d’Intune.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Qui fait quoi',
    'Intune protège les données dans les applications (APP) et configure les appareils. **Microsoft Purview Data Loss Prevention** surveille les actions sur des éléments sensibles (copier, enregistrer, imprimer, téléverser) et peut les bloquer. La **DLP des terminaux** étend cette capacité aux appareils Windows 10 et 11 et à macOS (les trois dernières versions majeures prises en charge) ainsi qu’à certains serveurs Windows. Ce sont des produits **distincts** : la politique de DLP se crée et se règle dans Purview, pas dans Intune, qui peut seulement servir de canal de déploiement (par exemple pour l’intégration des appareils ou pour des paramètres Windows).',
    '## Intégration des appareils',
    'La DLP des terminaux exige que les appareils soient **intégrés** aux solutions Purview. Les méthodes comprennent la stratégie de groupe, Configuration Manager, Intune et un script local (jusqu’à dix appareils). Détail utile : **intégrer un appareil à Defender for Endpoint l’intègre aussi à la DLP des terminaux**, il reste alors à activer la surveillance des appareils. Les événements apparaissent dans l’explorateur d’activités avant même qu’une politique ne soit déployée, ce qui permet de mesurer avant de bloquer. L’appareil doit aussi pouvoir joindre le service infonuagique de DLP (configuration du proxy).',
    '## Licences et portée',
    'La DLP des terminaux est incluse dans certaines offres (par exemple Microsoft 365 E5 et les suites Purview), pas dans toutes. **Nature : intégration avec licence supplémentaire possible.** Le ciblage de politique peut combiner utilisateurs et appareils : si un utilisateur connecté ne remplit pas les critères, il faut l’exclure explicitement pour éviter un comportement inattendu. Une étiquette de sensibilité d’un autre locataire n’est pas détectée.',
    '## Ce qu’Intune ne remplace pas',
    'Aucun paramètre Intune ne remplace la classification du contenu ni les types d’informations sensibles. À l’inverse, le contrôle des supports amovibles (module 11) relève de Defender Device Control, et non de la DLP : la documentation de Purview renvoie elle-même à Defender pour le contrôle du stockage amovible. Confondre ces deux produits mène à une promesse de blocage que l’outil choisi ne remplit pas.',
    '## Approche prudente',
    'Auditez d’abord (surveillance seule), puis alertez, puis bloquez avec des remplacements justifiés par l’utilisateur. Gardez la preuve de l’audit pour calibrer les politiques. Dans le parcours sans locataire, la DLP est présentée en simulation : aucune donnée réelle n’est classée ni bloquée.',
  ),
  demo: { title: 'Choisir l’outil', body: md(
    'Tableau **fictif** :',
    '```text',
    'Besoin                                  Outil',
    'Bloquer le copier-coller dans Outlook   Protection des applications (Intune)',
    'Surveiller l’impression de contenu PII  DLP des terminaux (Purview)',
    'Interdire les clés USB                  Device Control (Defender)',
    '```',
    '**Lecture commentée.** Trois besoins voisins, trois produits différents.',
    '**Ce que la démo ne prouve pas.** Aucune politique n’a été créée.') },
  guided: 'i10-g3', autonomous: 'i10-a3', quiz: ['i10-q3a', 'i10-q3b', 'i10-q3c'],
  revision: md('## Fiche : Purview', '- DLP des terminaux : produit distinct, intégration avec licence propre.', '- Intégrer à Defender intègre aussi à la DLP ; activer la surveillance.', '- Auditer avant de bloquer.', '- Supports amovibles : Defender Device Control.', '- Étiquette d’un autre locataire non détectée.'),
  links: [sref('purview-endpoint-dlp'), sref('purview-endpoint-dlp-start'), sref('intune-app-protection')], teaches: ['purview', 'dlp-terminaux', 'licence-supplementaire'],
};

const exercises = [
  a.match({ id: 'i10-g1', title: 'Niveau et contenu', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: 'i10-l1',
    st: 'Associez chaque niveau de protection à son apport.', items: [['p1', 'Niveau 1'], ['p2', 'Niveau 2'], ['p3', 'Niveau 3']],
    options: [['s1', 'NIP, chiffrement et effacement sélectif'], ['s2', 'Prévention de fuite et versions minimales'], ['s3', 'Mécanismes avancés et défense contre les menaces mobiles']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Les niveaux sont cumulatifs et chacun ajoute une famille de contrôles.' }),
  a.config({ id: 'i10-a1', title: 'Lancement conditionnel', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'securiser', lesson: 'i10-l1',
    st: 'Paramétrez les actions du lancement conditionnel.',
    fields: [
      { id: 'root', label: 'Appareil enraciné ou débridé', kind: 'select', options: [{ id: 'warn', label: 'Avertir' }, { id: 'wipe', label: 'Effacer les données' }], accept: ['wipe'], why: 'Indice de compromission.' },
      { id: 'ver', label: 'Version minimale de l’application (mise à jour forcée)', kind: 'select', options: [{ id: 'warn', label: 'Avertir' }, { id: 'wipe', label: 'Effacer les données' }], accept: ['warn'], why: 'Évite des frais et une perte de données.' },
      { id: 'pin', label: 'Exiger un NIP', kind: 'toggle', accept: ['on'], why: 'Niveau 1 de base.' },
    ], solution: { root: 'wipe', ver: 'warn', pin: 'on' }, exp: 'Effacer sur compromission, avertir sur version et exiger un NIP.' }),
  Q('i10-q1a', 'quiz', 'comprendre', c1, 'Données chiffrées', 'Quelles données sont chiffrées ?', ['Celles marquées d’entreprise.', 'Selon la politique.'], [['Toutes les données de l’appareil.', 'Faux.'], ['Seulement les photos.', 'Faux.'], ['Aucune.', 'Faux.']], 'Seules les données d’entreprise sont chiffrées.'),
  Q('i10-q1b', 'quiz', 'fonctionner', c1, 'Effacement MAM', 'Quand un effacement sélectif MAM s’exécute-t-il ?', ['Quand l’application interroge le service, environ toutes les 30 minutes si ouverte.', 'Pas instantané.'], [['Immédiatement toujours.', 'Faux.'], ['Jamais hors ligne.', 'Trop absolu.'], ['Seulement la nuit.', 'Faux.']], 'L’effacement dépend de l’interrogation du service.'),
  Q('i10-q1c', 'quiz', 'maintenir', c1, 'Niveau 3', 'Pourquoi ne pas appliquer le niveau 3 à tous ?', ['L’impact sur l’expérience est élevé.', 'À réserver aux données à haut risque.'], [['Il est gratuit.', 'Faux.'], ['Il est obsolète.', 'Faux.'], ['Il est interdit.', 'Faux.']], 'Le niveau 3 se réserve aux groupes à haut risque.'),

  a.match({ id: 'i10-g2', title: 'Capacité et configuration', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'comprendre', lesson: 'i10-l2',
    st: 'Associez chaque capacité à la configuration qui l’offre.', items: [['p1', 'Déployer une application'], ['p2', 'Effacer les données d’une application seulement'], ['p3', 'Provisionner un profil VPN']],
    options: [['s1', 'MDM (appareil inscrit)'], ['s2', 'MAM, même sans inscription'], ['s3', 'MDM seulement, pas sans inscription']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Sans inscription, ni déploiement ni VPN ; l’effacement d’application reste possible.' }),
  a.inspect({ id: 'i10-a2', title: 'Relire une promesse BYOD', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'securiser', lesson: 'i10-l2', language: 'text',
    st: 'Plan fictif. Repérez les promesses fausses.',
    lines: [['p1', 'Nous déploierons le VPN sur les téléphones personnels non inscrits.', { ok: 'a1', fixes: [['a1', 'Retirer : impossible sans inscription'], ['a2', 'Accepter']] }], ['p2', 'Nous prouverons le chiffrement du disque des tablettes personnelles.', { ok: 'b1', fixes: [['b1', 'Retirer : non visible sans inscription'], ['b2', 'Accepter']] }], ['p3', 'Nous exécuterons aussi une solution de conteneur tierce en parallèle.', { ok: 'c1', fixes: [['c1', 'Éviter la combinaison'], ['c2', 'Accepter']] }]],
    exp: 'Trois promesses que le modèle MAM sans inscription ne permet pas.' }),
  Q('i10-q2a', 'quiz', 'comprendre', c2, 'MAM sans inscription', 'Que ne peut-on pas faire sur un appareil non inscrit ?', ['Déployer des applications ou des certificats.', 'Limites documentées.'], [['Protéger les données d’une application.', 'Possible.'], ['Effacer les données d’une application.', 'Possible.'], ['Exiger un NIP dans l’application.', 'Possible.']], 'Pas de déploiement ni de certificats.'),
  Q('i10-q2b', 'quiz', 'fonctionner', c2, 'Ciblage', 'Comment éviter de pénaliser deux fois un appareil géré ?', ['Cibler selon l’état de gestion avec une politique moins stricte.', 'Option de ciblage.'], [['Désactiver la conformité.', 'Faux.'], ['Retirer les NIP.', 'Faux.'], ['Aucun moyen.', 'Faux.']], 'On cible selon l’état de gestion.'),
  Q('i10-q2c', 'quiz', 'maintenir', c2, 'Accès conditionnel', 'Pourquoi associer la protection des applications à l’accès conditionnel ?', ['Sinon un client non protégé peut accéder aux données.', 'Pour appliquer la politique.'], [['Pour accélérer.', 'Faux.'], ['Pour économiser.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'L’accès conditionnel force l’usage d’applications protégées.'),

  a.match({ id: 'i10-g3', title: 'Besoin et produit', comp: c3.comp, tags: c3.tags, role: 'guided', dim: 'comprendre', lesson: 'i10-l3',
    st: 'Associez chaque besoin à l’outil.', items: [['p1', 'Surveiller l’impression de contenu sensible'], ['p2', 'Interdire les clés USB'], ['p3', 'Limiter le copier-coller dans une application mobile']],
    options: [['s1', 'DLP des terminaux (Purview)'], ['s2', 'Device Control (Defender)'], ['s3', 'Protection des applications (Intune)']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Trois besoins voisins relèvent de trois produits.' }),
  a.workflow({ id: 'i10-a3', title: 'Déployer la DLP des terminaux', comp: c3.comp, tags: c3.tags, role: 'autonomous', dim: 'fonctionner', lesson: 'i10-l3',
    st: 'Ordonnez le déploiement de la DLP des terminaux.',
    blocks: [['b1', 'Vérifier la licence'], ['b2', 'Intégrer les appareils et activer la surveillance'], ['b3', 'Observer l’explorateur d’activités'], ['b4', 'Alerter sur un groupe pilote'], ['b5', 'Bloquer avec remplacement justifié'], ['b6', 'Bloquer d’emblée pour tous']],
    required: ['b1', 'b2', 'b3', 'b4', 'b5'], forbidden: ['b6'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4'], ['b4', 'b5']], notes: { b6: 'Sans mesure préalable.' }, solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
    exp: 'Licence, intégration, mesure, alerte puis blocage.' }),
  Q('i10-q3a', 'quiz', 'comprendre', c3, 'Nature', 'Quelle est la nature de la DLP des terminaux par rapport à Intune ?', ['Produit distinct relié à Intune et Defender, avec licence propre.', 'Intégration.'], [['Fonction native d’Intune.', 'Faux.'], ['Fonction du pare-feu.', 'Faux.'], ['Inexistante.', 'Faux.']], 'C’est un produit Purview distinct.'),
  Q('i10-q3b', 'quiz', 'fonctionner', c3, 'Intégration', 'Que provoque l’intégration d’un appareil à Defender for Endpoint ?', ['Il est aussi intégré à la DLP des terminaux.', 'Il reste à activer la surveillance.'], [['Il est effacé.', 'Faux.'], ['Il est exclu de la DLP.', 'Faux.'], ['Rien.', 'Faux.']], 'L’intégration à Defender intègre aussi à la DLP.'),
  Q('i10-q3c', 'quiz', 'maintenir', c3, 'Audit', 'Pourquoi auditer avant de bloquer ?', ['Pour mesurer et calibrer les politiques.', 'Éviter des faux positifs.'], [['Pour économiser du stockage.', 'Faux.'], ['Pour la licence.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'L’audit calibre les politiques.'),

  Q('i10-ev1', 'eval', 'comprendre', c1, 'Trois effacements', 'Lequel retire seulement les données d’entreprise d’une application ?', ['L’effacement sélectif MAM.', 'Sans retirer l’application.'], [['L’effacement complet.', 'Retour d’usine.'], ['La réinstallation.', 'Faux.'], ['Le redémarrage.', 'Faux.']], 'L’effacement sélectif MAM cible une application.'),
  M('i10-ev2', 'eval', 'securiser', c1, 'Lancement conditionnel', 'Cochez les conditions de lancement conditionnel valables.', [['Appareil débridé ou enraciné.', 'Indice de compromission.'], ['Version minimale du système.', 'Hygiène.']], [['Couleur du fond d’écran.', 'Sans rapport.'], ['Nom du réseau Wi-Fi domestique.', 'Sans rapport.']], 'Compromission et version minimale.'),
  a.order({ id: 'i10-ev3', title: 'Déployer la protection', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'fonctionner', lesson: 'i10-l2',
    st: 'Ordonnez le déploiement de la protection des applications BYOD.',
    items: [['s1', 'Choisir le niveau par groupe'], ['s2', 'Créer la politique pour iOS et Android'], ['s3', 'Piloter'], ['s4', 'Exiger la protection par accès conditionnel en rapport seulement'], ['s5', 'Activer par vagues']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'Niveau, politique, pilote, rapport seulement puis vagues.' }),
  a.fix({ id: 'i10-ev4', title: 'Corriger la politique', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'securiser', lesson: 'i10-l1', language: 'json',
    st: 'Corrigez la politique de protection des applications.',
    starter: JSON.stringify({ niveau: 3, groupe: 'tous', appareilEnracine: 'ignorer' }, null, 2),
    rules: [{ kind: 'equals', path: 'niveau', value: 2, message: 'Niveau 2 pour la majorité.', dim: 'securiser' }, { kind: 'equals', path: 'groupe', value: 'employes-mobiles', message: 'Cibler les employés mobiles.', dim: 'fonctionner' }, { kind: 'equals', path: 'appareilEnracine', value: 'effacer', message: 'Effacer sur appareil enraciné.', dim: 'securiser' }],
    solution: JSON.stringify({ niveau: 2, groupe: 'employes-mobiles', appareilEnracine: 'effacer' }, null, 2), exp: 'Niveau 2, groupe ciblé et effacement sur appareil enraciné.' }),
  a.match({ id: 'i10-ev5', title: 'Symptôme et cause', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'maintenir', lesson: 'i10-l3',
    st: 'Associez chaque symptôme à sa cause probable.', items: [['p1', 'La DLP ne voit pas un fichier étiqueté dans un autre locataire'], ['p2', 'Aucun événement DLP sur un poste'], ['p3', 'Une politique DLP s’applique à un utilisateur hors critères']],
    options: [['s1', 'Limite documentée : étiquette d’un autre locataire non détectée'], ['s2', 'Appareil non intégré ou surveillance non activée'], ['s3', 'Utilisateur ou appareil non exclu du ciblage']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Chaque symptôme a une cause documentée distincte.' }),
  a.workflow({ id: 'i10-ev6', title: 'Départ d’un employé BYOD', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'securiser', lesson: 'i10-l2',
    st: 'Ordonnez le traitement du téléphone personnel d’un employé qui quitte.',
    blocks: [['b1', 'Lancer l’effacement sélectif MAM'], ['b2', 'Vérifier l’exécution à l’ouverture de l’application'], ['b3', 'Désactiver le compte'], ['b4', 'Effacer tout le téléphone personnel']],
    required: ['b1', 'b2', 'b3'], forbidden: ['b4'], before: [['b1', 'b2']], notes: { b4: 'Données personnelles de l’employé.' }, solution: ['b1', 'b2', 'b3'],
    exp: 'Effacement sélectif, vérification puis désactivation du compte.' }),
  a.short({ id: 'i10-ev7', title: 'Niveaux', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'comprendre', lesson: 'i10-l1',
    st: 'Combien de niveaux compte le cadre de protection des données des applications ? (nombre)', accepted: ['3'], numeric: { value: 3 }, ph: 'un nombre',
    exp: 'Le cadre compte trois niveaux cumulatifs.' }),
  a.short({ id: 'i10-ev8', title: 'Intervalle', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'comprendre', lesson: 'i10-l1',
    st: 'Environ toutes les combien de minutes le SDK interroge-t-il une demande d’effacement ? (nombre)', accepted: ['30'], numeric: { value: 30 }, ph: 'un nombre',
    exp: 'Le SDK interroge environ toutes les 30 minutes quand l’application est utilisée.' }),

  a.inspect({ id: 'i10-cs1', title: 'Cas : données chez Aurore Logistique', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'securiser', lesson: 'i10-l1', language: 'text',
    st: 'Plan fictif. Repérez les défauts.',
    lines: [['p1', 'Le niveau 3 est imposé à tous les employés.', { ok: 'a1', fixes: [['a1', 'Niveau 2 par défaut, niveau 3 pour les groupes à risque'], ['a2', 'Accepter']] }], ['p2', 'La politique n’est associée à aucun accès conditionnel.', { ok: 'b1', fixes: [['b1', 'Exiger la protection par accès conditionnel'], ['b2', 'Accepter']] }], ['p3', 'Un effacement complet est prévu pour les téléphones personnels.', { ok: 'c1', fixes: [['c1', 'Utiliser l’effacement sélectif'], ['c2', 'Accepter']] }]],
    exp: 'Trois défauts : niveau, absence d’application et effacement excessif.' }),
  a.workflow({ id: 'i10-cs2', title: 'Cas : choisir MDM ou MAM', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'securiser', lesson: 'i10-l2',
    st: 'Ordonnez la décision par catégorie d’appareils.',
    blocks: [['t1', 'Inventorier les catégories d’appareils'], ['t2', 'Nommer les capacités nécessaires'], ['t3', 'Choisir MDM ou MAM par catégorie'], ['t4', 'Documenter le risque résiduel'], ['t5', 'Promettre la conformité à tous les appareils']],
    required: ['t1', 't2', 't3', 't4'], forbidden: ['t5'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't4']], notes: { t5: 'Impossible sans inscription.' }, solution: ['t1', 't2', 't3', 't4'],
    exp: 'Inventaire, capacités, choix puis risque résiduel.' }),
  a.match({ id: 'i10-cs3', title: 'Cas : produits', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'i10-l3',
    st: 'Associez chaque exigence au produit.', items: [['p1', 'Classer les documents par type d’information sensible'], ['p2', 'Effacer les données d’entreprise d’une application'], ['p3', 'Bloquer les supports amovibles']],
    options: [['s1', 'Purview'], ['s2', 'Intune (MAM)'], ['s3', 'Defender Device Control']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Chaque exigence relève d’un produit distinct.' }),
  a.open({ id: 'i10-cs-open', title: 'Cas : stratégie des données mobiles', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'i10-l3',
    st: 'Rédigez la stratégie de protection des données d’une organisation fictive.',
    deliverable: 'Un document : niveaux, MDM ou MAM, effacement, accès conditionnel, DLP avec licences et risques résiduels.',
    rubric: [['r1', 'Les niveaux sont justifiés par groupe.', 'securiser'], ['r2', 'Les limites du BYOD sont nommées.', 'comprendre'], ['r3', 'La DLP est présentée comme produit distinct sous licence.', 'comprendre'], ['r4', 'L’audit précède le blocage.', 'fonctionner'], ['r5', 'Les risques résiduels sont consignés.', 'maintenir']],
    exp: 'Pas de note automatique : on juge la cohérence de la stratégie.' }),

  Q('i10-rm1', 'remediation', 'comprendre', c1, 'Remédiation : APP', 'Que protège une politique de protection des applications ?', ['Les données d’entreprise dans l’application.', 'Pas tout l’appareil.'], [['Le matériel.', 'Faux.'], ['Le réseau.', 'Faux.'], ['Les photos personnelles.', 'Faux.']], 'Elle protège les données d’entreprise dans l’application.'),
  Q('i10-rm2', 'remediation', 'fonctionner', c2, 'Remédiation : limites', 'Pourquoi ne pas promettre un VPN sur un appareil non inscrit ?', ['On ne peut pas provisionner de VPN sans inscription.', 'Limite documentée.'], [['Le VPN est interdit.', 'Faux.'], ['Il est trop lent.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'Sans inscription, pas de profils VPN.'),
  Q('i10-rm3', 'remediation', 'securiser', c3, 'Remédiation : DLP', 'Pourquoi auditer d’abord avec la DLP ?', ['Pour calibrer avant de bloquer.', 'Éviter les faux positifs.'], [['Pour la licence.', 'Faux.'], ['Pour le stockage.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'L’audit permet de calibrer les politiques.'),
];

const competencies: AiCompetency[] = [
  { id: 'i10-c1', module: 'i10', name: 'Protéger les données dans les applications', description: 'Niveaux, chiffrement, lancement conditionnel, effacement.', criteria: [{ id: 'i10-c1-1', text: 'Je choisis un niveau par groupe.' }, { id: 'i10-c1-2', text: 'Je configure le lancement conditionnel.' }, { id: 'i10-c1-3', text: 'Je distingue les trois effacements.' }] },
  { id: 'i10-c2', module: 'i10', name: 'Choisir MDM ou MAM', description: 'Limites, ciblage, accès conditionnel.', criteria: [{ id: 'i10-c2-1', text: 'Je nomme les limites d’un appareil non inscrit.' }, { id: 'i10-c2-2', text: 'Je cible selon l’état de gestion.' }, { id: 'i10-c2-3', text: 'J’associe l’accès conditionnel.' }] },
  { id: 'i10-c3', module: 'i10', name: 'Situer Purview', description: 'DLP des terminaux, intégration, licences.', criteria: [{ id: 'i10-c3-1', text: 'Je classe la DLP comme produit distinct.' }, { id: 'i10-c3-2', text: 'Je décris l’intégration des appareils.' }, { id: 'i10-c3-3', text: 'J’audite avant de bloquer.' }] },
];

const projects: AiProject[] = [
  { id: 'i10-p1', module: 'i10', level: 'débutant', title: 'Grille des niveaux de protection', problem: 'Attribuer un niveau de protection à chaque groupe d’une organisation fictive.', architecture: 'Tableau d’une page.', tools: ['Tableur'], data: 'Groupes fictifs.', steps: ['Lister les groupes.', 'Évaluer la sensibilité.', 'Choisir le niveau.'], success: ['Chaque niveau est justifié.'], risks: ['Niveau 3 pour tous.'], extensions: ['Ajouter les applications visées.'] },
  { id: 'i10-p2', module: 'i10', level: 'intermédiaire', title: 'Politique mobile avec effacement', problem: 'Concevoir une politique de protection des applications avec lancement conditionnel et procédure d’effacement.', architecture: 'Politique documentée et procédure.', tools: ['Éditeur de texte'], data: 'Scénarios fictifs.', steps: ['Choisir le niveau.', 'Définir les conditions.', 'Écrire la procédure d’effacement.', 'Définir la vérification.'], success: ['La procédure est vérifiable.'], risks: ['Effacement trop large.'], extensions: ['Ajouter un plan de communication.'],
    connected: { accounts: 'Un locataire de test avec Intune et un téléphone de test.', permissions: 'Application Manager dans le locataire de test.', costs: 'Licences de test.', secrets: 'N’utilisez pas un compte personnel réel.', cleanup: 'Supprimer les politiques de test et effacer les données de test.', limits: 'Facultatif : n’effacez jamais un appareil qui ne vous appartient pas.' } },
  { id: 'i10-p3', module: 'i10', level: 'avancé', title: 'Dossier d’architecture des données', problem: 'Rédiger le dossier qui répartit les besoins entre Intune, Defender et Purview, avec licences et risques.', architecture: 'Dossier avec tableau des produits.', tools: ['Éditeur de texte'], data: 'Besoins fictifs.', steps: ['Lister les besoins.', 'Répartir par produit.', 'Chiffrer les licences.', 'Nommer les risques.'], success: ['Aucun besoin sans produit.'], risks: ['Confondre DLP et Device Control.'], extensions: ['Ajouter un plan d’audit.'] },
];

export const i10 = assemble({ id: 'i10', level: 4, n: 10, title: 'Applications et données',
  summary: 'Protection des applications, niveaux, effacement sélectif, choix MDM ou MAM et situation de Purview par rapport à Intune et Defender.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Protéger les données mobiles chez Aurore Logistique',
  caseScenario: 'Vous répartissez la protection des données entre applications, appareils et Purview. Actions simulées.', caseMinutes: 45 });
