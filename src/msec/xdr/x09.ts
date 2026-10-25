// Module 9 : Defender for Cloud Apps (niveau 3).
import type { AiCompetency, AiLesson, AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { sref } from '../sources.ts';

const md = (...lines: string[]) => lines.join('\n');
const { a, Q, M } = kit('x09');
const c1 = { comp: 'x09-c1', lesson: 'x09-l1', tags: ['piliers-mda', 'cloud-discovery', 'licences-roles-mda'] };
const c2 = { comp: 'x09-c2', lesson: 'x09-l2', tags: ['sanctionner', 'blocage-mde', 'shadow-it'] };
const c3 = { comp: 'x09-c3', lesson: 'x09-l3', tags: ['politiques-mda', 'acces-session', 'app-governance'] };

const l1: AiLesson = {
  id: 'x09-l1', module: 'x09', title: 'Piliers de Defender for Cloud Apps, Cloud Discovery, licences et rôles', minutes: 40,
  summary: 'Comprendre les quatre façons dont MDA voit et contrôle le SaaS, et ce qu’il faut pour chacune.',
  objectives: ['Distinguer Cloud Discovery, connecteurs d’API, contrôle d’application par accès conditionnel et gouvernance des applications.', 'Choisir entre rapport instantané et rapport continu, et entre intégration MDE, collecteur et passerelle.', 'Lister licences et rôles.'],
  prerequisites: ['Modules 3 et 5'],
  body: md(
    '## Un CASB, quatre sources de visibilité',
    'Defender for Cloud Apps (MDA) est le **courtier de sécurité d’accès infonuagique (CASB)** de Microsoft. Il s’appuie sur quatre leviers qui ne se déploient pas pareil et ne voient pas les mêmes choses.',
    '| Levier | Ce qu’il voit | Ce qu’il permet |',
    '| --- | --- | --- |',
    '| **Cloud Discovery** | Le trafic réseau vers des applications SaaS, même non gérées (shadow IT) | Évaluer le risque d’applications, autoriser ou non autoriser, bloquer via MDE ou une passerelle |',
    '| **Connecteurs d’API** | Activités, fichiers et comptes dans des applications connectées | Détection d’anomalies, politiques d’activité, gouvernance |',
    '| **Contrôle d’application par accès conditionnel** | Les sessions de navigateur, en temps réel, par proxy inverse | Politiques d’accès et de session |',
    '| **Gouvernance des applications (app governance)** | Les applications OAuth inscrites dans Entra ID, Google et Salesforce | Visibilité, politiques, détection, remédiation |',
    '## Cloud Discovery : rapports et sources',
    'Un **rapport instantané (snapshot)** analyse des journaux que vous téléversez manuellement : utile pour valider le format et obtenir une première visibilité. Un **rapport continu** analyse tous les journaux transmis automatiquement et détecte les usages anormaux par apprentissage automatique ou par vos politiques. Les sources d’un rapport continu : l’**intégration à Defender for Endpoint** (aucune étape de routage supplémentaire, visibilité des appareils Windows hors du réseau d’entreprise, avec utilisateur et appareil), un **collecteur de journaux** (Syslog ou FTP, sur votre réseau), une **passerelle web sécurisée** (Zscaler, iboss, Corrata, Menlo Security) ou l’**API Cloud Discovery**. Vérifiez qu’un journal téléversé manuellement est correctement analysé avant d’automatiser. Le collecteur compresse les données (le trafic sortant représente environ 10 % du trafic reçu) et vous alerte si aucune donnée n’arrive pendant 48 heures. Il conserve les 20 derniers journaux et abandonne les nouveaux si le disque est plein.',
    '**Anonymisation** : les noms d’utilisateur peuvent être chiffrés par défaut ; une enquête précise permet de désanonymiser un utilisateur avec justification. Sur macOS, l’intégration MDE peut provoquer une hausse de l’utilisation de l’UC selon la documentation.',
    '## Licences et rôles',
    'Il faut une licence **Defender for Cloud Apps** (autonome ou incluse dans une suite). Le contrôle d’application par accès conditionnel exige aussi **Microsoft Entra ID Premium P1** ou supérieur et des applications avec authentification unique (SAML 2.0 ou OpenID Connect pour Entra ID). Rôles : **Security Administrator** (accès complet), **Cloud App Security Administrator** (accès complet à MDA seulement), **Compliance Administrator** et **Compliance Data Administrator** (lecture, politiques de fichiers), **Security Operator** (lecture et gestion des alertes, pas de création de politiques), **Security Reader** et **Global Reader** (lecture seule). Appliquez le moindre privilège : le Global Administrator doit rester réservé aux situations d’urgence.',
  ),
  demo: { title: 'Quel levier pour quel besoin', body: md(
    'Besoins **fictifs** :',
    '```text',
    'Besoin                                          Levier',
    'Savoir quels SaaS utilisent les employés         Cloud Discovery (MDE + rapport continu)',
    'Bloquer le téléchargement depuis un poste non géré  Accès conditionnel : politique de session',
    'Repérer une application OAuth trop permissive       Gouvernance des applications',
    '```',
    '**Lecture commentée.** Chaque besoin se couvre par un levier distinct.',
    '**Ce que la démo ne prouve pas.** Aucun locataire n’a été configuré.') },
  guided: 'x09-g1', autonomous: 'x09-a1', quiz: ['x09-q1a', 'x09-q1b', 'x09-q1c'],
  revision: md('## Fiche : piliers de MDA', '- Cloud Discovery : trafic SaaS (shadow IT) ; connecteurs : activités et fichiers ; CAAC : sessions ; app governance : OAuth.', '- Snapshot = ponctuel ; continu = MDE, collecteur, SWG ou API.', '- Collecteur : alerte après 48 h sans données.', '- Licences : MDA + Entra P1 pour le contrôle d’application par accès conditionnel.', '- Rôles : moindre privilège, Security Administrator ou Cloud App Security Administrator pour l’administration.'),
  links: [sref('mda-discovery'), sref('mda-snapshot'), sref('mda-log-collector'), sref('mda-mde'), sref('mda-admins'), sref('mda-onboard-entra')], teaches: ['piliers-mda', 'cloud-discovery', 'licences-roles-mda'],
};

const l2: AiLesson = {
  id: 'x09-l2', module: 'x09', title: 'Gouverner le shadow IT : autoriser, interdire et bloquer', minutes: 40,
  summary: 'Décider du statut des applications découvertes et comprendre ce que « non autorisée » signifie réellement.',
  objectives: ['Distinguer autorisée, non autorisée et bloquée.', 'Lister les prérequis du blocage par Defender for Endpoint.', 'Connecter la gouvernance MDA aux indicateurs et à la protection web.'],
  prerequisites: ['Leçon 1 et module 5'],
  body: md(
    '## Trois états, trois effets',
    'Dans Cloud Discovery, une application peut être marquée **Sanctioned** (approuvée) ou **Unsanctioned** (non approuvée). **Marquer une application comme non autorisée ne la bloque pas** : cela facilite le suivi par les filtres de Cloud Discovery, la notification des utilisateurs avec une solution de rechange, ou la génération d’un script de blocage pour votre équipement réseau. Une application intégrée au proxy en ligne ou à un connecteur d’API est automatiquement marquée autorisée dans Cloud Discovery. Un nombre de conflits de gouvernance peut survenir, par exemple deux sources qui s’opposent sur le statut.',
    '## Blocage par Defender for Endpoint',
    'Pour bloquer des applications découvertes avec MDE, il faut : la **protection infonuagique** de MDE configurée, la **protection réseau** activée (en mode blocage), et l’extension **Microsoft Defender Browser Protection** dans les navigateurs non Microsoft. MDA crée alors des **indicateurs de blocage** pour les applications non autorisées et des indicateurs d’**avertissement** pour les applications surveillées. Conséquences, vues au module 5 : l’application peut prendre jusqu’à 48 heures à être bloquée (généralement moins de 2 heures), un Allow personnalisé l’emporte sur un blocage, et la couverture dépend des composants (SmartScreen pour Edge, protection réseau pour les autres navigateurs et processus).',
    '## Passerelles web sécurisées',
    'Avec Zscaler, le trafic proxifié est envoyé à MDA sans collecteur, les blocages de Zscaler s’appliquent automatiquement aux applications non autorisées dans MDA, et l’évaluation des risques MDA apparaît dans le portail Zscaler. Prérequis cités : une licence MDA ou Entra ID P1, une licence Zscaler et un abonnement NSS actif. Les intégrations iboss, Corrata et Menlo suivent le même principe.',
    '## Politiques de découverte',
    'On crée des politiques de découverte d’applications pour être averti en cas de pic de téléchargement ou de trafic d’une application surveillée. Trois politiques utiles à activer : **comportement anormal des utilisateurs découverts**, **vérification de conformité des applications de stockage infonuagique** et **nouvelle application risquée**. Revoyez régulièrement le tableau de bord pour repérer les nouvelles applications.',
    '## Un processus avant un outil',
    'Un bon processus : découvrir, évaluer le risque, **décider** (autoriser, interdire, remplacer), **communiquer** aux utilisateurs avec une solution de rechange, **appliquer** (blocage) et **mesurer**. Bloquer d’emblée toutes les applications inconnues crée du contournement (appareils personnels) et de la friction ; commencer par surveiller, puis resserrer progressivement.',
  ),
  demo: { title: 'Décider du statut', body: md(
    'Applications **fictives** :',
    '```text',
    'Application        Risque   Décision               Effet',
    'StockoNuage         Élevé    Non autorisée + bloc   Indicateur de blocage MDE (jusqu’à 48 h)',
    'NotesRapides        Moyen    Surveillée             Avertissement + message',
    'SuiteCompta         Faible   Autorisée              Aucun indicateur',
    '```',
    '**Lecture commentée.** Non autorisée n’est pas bloquée tant qu’un mécanisme d’application n’est pas en place.',
    '**Ce que la démo ne prouve pas.** Aucun blocage n’a été produit.') },
  guided: 'x09-g2', autonomous: 'x09-a2', quiz: ['x09-q2a', 'x09-q2b', 'x09-q2c'],
  revision: md('## Fiche : gouverner le shadow IT', '- Non autorisée ≠ bloquée : suivi, notification ou script de blocage.', '- Blocage par MDE : protection infonuagique, protection réseau, extension de navigateur.', '- Indicateurs créés : blocage pour non autorisées, avertissement pour surveillées.', '- Délai d’application : jusqu’à 48 h.', '- Processus : découvrir, décider, communiquer, appliquer, mesurer.'),
  links: [sref('mda-govern-discovery'), sref('mda-zscaler'), sref('mda-mde'), sref('mde-indicators'), sref('mde-network-protection')], teaches: ['sanctionner', 'blocage-mde', 'shadow-it'],
};

const l3: AiLesson = {
  id: 'x09-l3', module: 'x09', title: 'Politiques, anomalies, accès et session, et gouvernance des applications', minutes: 45,
  summary: 'Choisir le bon type de politique, comprendre la détection d’anomalies et le proxy de session, et surveiller les applications OAuth.',
  objectives: ['Décrire les types de politiques et leur catégorie.', 'Expliquer la période d’apprentissage et la transition vers le modèle dynamique.', 'Distinguer politique d’accès et de session et leurs prérequis.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Types de politiques',
    'Les politiques se classent par catégorie de risque (contrôle d’accès, conformité, configuration, découverte, prévention des pertes de données, comptes privilégiés, partage, détection de menaces). Types principaux : **politique d’activité** (surveiller des activités précises ou des taux inhabituels, via les API des fournisseurs), **détection d’anomalies** (comportement inhabituel par rapport à la base de référence), **politique d’application OAuth** (permissions demandées, approbation ou révocation ; ces politiques intégrées ne se créent pas), **politique d’accès** et **politique de session** (temps réel, via l’accès conditionnel), et politiques de découverte d’applications. Les **politiques de fichiers** sont annoncées comme **retirées le 6 janvier 2027** : la documentation recommande de migrer vers les politiques de prévention des pertes de données ou d’étiquetage automatique de Purview. Ne bâtissez pas de nouveau programme sur elles.',
    '## Détection d’anomalies',
    'Les politiques d’anomalies sont activées par défaut et reposent sur de l’analytique du comportement des utilisateurs et des entités et de l’apprentissage automatique. Il y a une **période d’apprentissage initiale de sept jours** pendant laquelle toutes les alertes ne sont pas déclenchées ; ensuite, chaque session est comparée à l’activité du mois précédent (heures d’activité, adresses IP, appareils, scores de risque). Les données des connecteurs d’API peuvent prendre plusieurs heures. Le risque est évalué sur plus de 30 indicateurs regroupés en facteurs (adresse IP risquée, échecs de connexion, activité d’administration, comptes inactifs, emplacement, voyage impossible, appareil et agent utilisateur, taux d’activité). **Depuis juin 2025**, MDA migre vers un **modèle de détection dynamique** : plusieurs politiques historiques (par exemple activité depuis des adresses IP suspectes ou anonymes, transfert suspect de boîte de réception, rançongiciel) ont été désactivées et leur couverture assurée par le nouveau modèle, sans action de votre part. Vérifiez donc quelles détections existent dans votre locataire avant de promettre une alerte précise.',
    '## Accès et session',
    'Le **contrôle d’application par accès conditionnel** route les sessions de navigateur vers MDA via une politique d’accès conditionnel d’Entra ID (« Use Conditional Access App Control »), puis des **politiques d’accès** (autoriser ou bloquer) et de **session** (autoriser en surveillant, avec des actions comme bloquer le téléchargement de fichiers sensibles vers des appareils non gérés, exiger l’étiquetage, bloquer le téléversement de fichiers non étiquetés ou de programmes malveillants, relancer l’évaluation de l’accès conditionnel). Les politiques s’appliquent au niveau de l’**application**, pas du fichier. Une politique créée pour une application hôte (Teams, Exchange) ne couvre pas les applications ressources liées (SharePoint, OneDrive) : créez une politique séparée. Dans Edge, une protection directe dans le navigateur s’applique ; dans les autres navigateurs, l’utilisateur est redirigé par proxy inverse et voit le suffixe `.mcas.ms`. Pour éviter le contournement, bloquez l’accès des clients natifs. Testez toujours une politique avant de la généraliser, et ouvrez le pare-feu vers les adresses documentées.',
    '## Gouvernance des applications OAuth',
    'La gouvernance des applications couvre les applications OAuth non Microsoft inscrites dans Entra ID, Google et Salesforce : tableau de bord, politiques prédéfinies et personnalisées, alertes d’anomalies, remédiation. Prérequis : Defender for Cloud Apps présent, un rôle approprié (par exemple Security Administrator ; le rôle Cloud App Security Administrator permet de l’activer mais pas de voir ses données), et une adresse de facturation hors de certaines régions listées. Après l’activation, comptez jusqu’à **10 heures**. Les alertes ne circulent vers Defender qu’après avoir accédé à chacun des deux portails au moins une fois. Connectez le connecteur Microsoft 365 pour voir les activités des applications dans la chasse avancée.',
  ),
  demo: { title: 'Choisir la politique', body: md(
    'Besoins **fictifs** :',
    '```text',
    'Besoin                                              Politique',
    'Bloquer le téléchargement de fichiers sensibles (non gérés)   Session + accès conditionnel',
    'Alerter sur une rafale d’échecs de connexion                  Anomalie (intégrée)',
    'Réviser les permissions d’une application OAuth                Gouvernance des applications',
    '```',
    '**Lecture commentée.** On choisit la politique selon qu’on veut bloquer en temps réel, détecter ou réviser des permissions.',
    '**Ce que la démo ne prouve pas.** Aucune politique n’a été créée.') },
  guided: 'x09-g3', autonomous: 'x09-a3', quiz: ['x09-q3a', 'x09-q3b', 'x09-q3c'],
  revision: md('## Fiche : politiques et session', '- Activité, anomalie, OAuth, accès, session, découverte ; fichiers retirées le 2027-01-06.', '- Anomalies : 7 jours d’apprentissage ; modèle dynamique depuis juin 2025.', '- Session : proxy inverse (.mcas.ms), Edge en direct ; niveau application ; hôte ≠ ressource.', '- Bloquer les clients natifs pour éviter le contournement.', '- App governance : jusqu’à 10 h après activation.'),
  links: [sref('mda-policies'), sref('mda-anomaly'), sref('mda-protect-m365'), sref('mda-cac'), sref('mda-session'), sref('mda-cac-howto'), sref('mda-app-gov'), sref('mda-app-gov-start'), sref('mda-daily-ops')], teaches: ['politiques-mda', 'acces-session', 'app-governance'],
};

const exercises = [
  a.match({ id: 'x09-g1', title: 'Levier et visibilité', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: 'x09-l1',
    st: 'Associez chaque levier à ce qu’il voit.', items: [['p1', 'Cloud Discovery'], ['p2', 'Contrôle d’application par accès conditionnel'], ['p3', 'Gouvernance des applications']],
    options: [['s1', 'Trafic vers le SaaS, même non géré'], ['s2', 'Sessions de navigateur en temps réel'], ['s3', 'Applications OAuth inscrites']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Cloud Discovery voit le trafic SaaS, le proxy voit les sessions, et la gouvernance voit les applications OAuth.' }),
  a.order({ id: 'x09-a1', title: 'Monter un rapport continu', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'fonctionner', lesson: 'x09-l1',
    st: 'Ordonnez la mise en place de Cloud Discovery.',
    items: [['s1', 'Intégrer Defender for Endpoint'], ['s2', 'Créer un rapport instantané avec un journal de test'], ['s3', 'Valider le format du journal'], ['s4', 'Configurer le collecteur de journaux'], ['s5', 'Surveiller l’alerte de 48 heures sans données']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'On valide d’abord avec un snapshot, puis on automatise et on surveille la réception des données.' }),
  Q('x09-q1a', 'quiz', 'comprendre', c1, 'Snapshot et continu', 'Quelle est la différence ?', ['Le snapshot est un téléversement manuel ponctuel ; le continu analyse les journaux transmis automatiquement.', 'Le continu détecte les anomalies.'], [['Aucune.', 'Elles diffèrent.'], ['Le snapshot est automatique.', 'Il est manuel.'], ['Le continu est manuel.', 'Il est automatique.']], 'Le snapshot est ponctuel, le rapport continu est alimenté automatiquement.'),
  Q('x09-q1b', 'quiz', 'fonctionner', c1, 'Alerte du collecteur', 'Après combien d’heures sans données le collecteur vous alerte-t-il ?', ['48 heures.', 'Alerte en cas de problème.'], [['1 heure.', 'Non.'], ['7 jours.', 'Non.'], ['Jamais.', 'Non.']], 'Une alerte se déclenche après 48 heures sans données.'),
  Q('x09-q1c', 'quiz', 'securiser', c1, 'Licences du proxy', 'Que faut-il en plus de MDA pour le contrôle d’application par accès conditionnel ?', ['Microsoft Entra ID Premium P1 ou supérieur.', 'Et des applications avec authentification unique.'], [['Rien.', 'Il faut Entra P1.'], ['Defender for Identity.', 'Non.'], ['Intune.', 'Non.']], 'Il faut Entra ID P1 ou plus.'),

  a.match({ id: 'x09-g2', title: 'Statut et effet', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'comprendre', lesson: 'x09-l2',
    st: 'Associez chaque statut à son effet réel.', items: [['p1', 'Marquée non autorisée seulement'], ['p2', 'Non autorisée avec MDE configuré'], ['p3', 'Application surveillée']],
    options: [['s1', 'Suivi et notification, pas de blocage'], ['s2', 'Indicateur de blocage créé'], ['s3', 'Indicateur d’avertissement']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Marquer ne bloque pas ; avec MDE on obtient un indicateur de blocage ; une application surveillée reçoit un avertissement.' }),
  a.config({ id: 'x09-a2', title: 'Prérequis du blocage', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'fonctionner', lesson: 'x09-l2',
    st: 'Paramétrez ce qu’il faut pour bloquer des applications via MDE.',
    fields: [
      { id: 'cp', label: 'Protection infonuagique de MDE configurée', kind: 'toggle', accept: ['on'], why: 'Prérequis documenté.' },
      { id: 'np', label: 'Protection réseau activée en blocage', kind: 'toggle', accept: ['on'], why: 'Applique le blocage.' },
      { id: 'ext', label: 'Extension Defender Browser Protection dans les navigateurs non Microsoft', kind: 'toggle', accept: ['on'], why: 'Couverture des autres navigateurs.' },
      { id: 'immed', label: 'Annoncer un blocage immédiat', kind: 'toggle', accept: ['off'], why: 'Jusqu’à 48 heures.' },
    ], solution: { cp: 'on', np: 'on', ext: 'on', immed: 'off' }, exp: 'Trois prérequis techniques, et aucune promesse d’immédiateté.' }),
  Q('x09-q2a', 'quiz', 'comprendre', c2, 'Non autorisée', 'Que fait marquer une application comme non autorisée ?', ['Facilite le suivi ; ne bloque pas à elle seule.', 'Il faut un mécanisme d’application.'], [['La bloque partout.', 'Non.'], ['La supprime.', 'Non.'], ['Désactive les comptes.', 'Non.']], 'Le marquage ne bloque pas par lui-même.'),
  Q('x09-q2b', 'quiz', 'fonctionner', c2, 'Application connectée', 'Quel statut reçoit une application connectée par connecteur d’API ou proxy en ligne ?', ['Autorisée automatiquement dans Cloud Discovery.', 'Selon la documentation.'], [['Non autorisée.', 'Non.'], ['Bloquée.', 'Non.'], ['Aucun statut.', 'Non.']], 'Elle est automatiquement marquée autorisée.'),
  Q('x09-q2c', 'quiz', 'maintenir', c2, 'Passerelle', 'Quel avantage apporte l’intégration Zscaler ?', ['Les blocages Zscaler s’appliquent aux applications non autorisées dans MDA.', 'Sans collecteur.'], [['Elle remplace MDA.', 'Non.'], ['Elle chiffre les disques.', 'Non.'], ['Elle supprime les journaux.', 'Non.']], 'Les blocages s’appliquent automatiquement aux applications non autorisées.'),

  a.match({ id: 'x09-g3', title: 'Politique et besoin', comp: c3.comp, tags: c3.tags, role: 'guided', dim: 'fonctionner', lesson: 'x09-l3',
    st: 'Associez chaque besoin à la politique.', items: [['p1', 'Bloquer le téléchargement de fichiers sensibles depuis un poste non géré'], ['p2', 'Détecter un comportement inhabituel d’un utilisateur'], ['p3', 'Réviser les permissions d’une application OAuth']],
    options: [['s1', 'Politique de session'], ['s2', 'Détection d’anomalies'], ['s3', 'Gouvernance des applications']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'La session bloque en temps réel, l’anomalie détecte, la gouvernance révise les permissions OAuth.' }),
  a.inspect({ id: 'x09-a3', title: 'Relire un plan de politiques', comp: c3.comp, tags: c3.tags, role: 'autonomous', dim: 'securiser', lesson: 'x09-l3', language: 'text',
    st: 'Plan fictif. Repérez les failles.',
    lines: [['p1', 'Nous bâtissons notre programme de prévention des pertes sur des politiques de fichiers de MDA.', { ok: 'a1', fixes: [['a1', 'Prévoir la migration vers Purview : retrait annoncé le 2027-01-06'], ['a2', 'Accepter']] }], ['p2', 'La politique de session pour Teams couvre aussi SharePoint.', { ok: 'b1', fixes: [['b1', 'Créer une politique séparée pour l’application ressource'], ['b2', 'Accepter']] }], ['p3', 'Les clients natifs restent autorisés.', { ok: 'c1', fixes: [['c1', 'Bloquer les clients natifs pour éviter le contournement'], ['c2', 'Accepter']] }]],
    exp: 'Les politiques de fichiers sont en retrait ; hôte et ressource demandent des politiques séparées ; les clients natifs contournent le proxy.' }),
  Q('x09-q3a', 'quiz', 'comprendre', c3, 'Période d’apprentissage', 'Quelle est la période d’apprentissage initiale des anomalies ?', ['Sept jours.', 'Toutes les alertes ne sont pas encore déclenchées.'], [['24 heures.', 'Non.'], ['30 jours.', 'Non.'], ['Aucune.', 'Elle existe.']], 'La période d’apprentissage initiale est de sept jours.'),
  Q('x09-q3b', 'quiz', 'fonctionner', c3, 'Niveau d’application', 'À quel niveau s’appliquent les politiques d’accès conditionnel ?', ['Au niveau de l’application, pas du fichier.', 'On ne peut pas exclure des fichiers.'], [['Au niveau du fichier.', 'Non.'], ['Au niveau de l’appareil.', 'Non.'], ['Au niveau du réseau.', 'Non.']], 'Elles s’appliquent à l’application.'),
  Q('x09-q3c', 'quiz', 'maintenir', c3, 'Délai de la gouvernance', 'Combien de temps faut-il attendre après l’activation de la gouvernance des applications ?', ['Jusqu’à 10 heures.', 'Avant de voir le produit.'], [['Immédiat.', 'Non.'], ['Une semaine.', 'Non.'], ['Un mois.', 'Non.']], 'Il faut attendre jusqu’à 10 heures.'),

  Q('x09-ev1', 'eval', 'comprendre', c1, 'Source continue', 'Quelle source de rapport continu n’exige aucun routage supplémentaire du trafic ?', ['L’intégration à Defender for Endpoint.', 'Les journaux viennent de l’agent MDE.'], [['Le collecteur de journaux.', 'Il exige le transfert de journaux.'], ['Le rapport instantané.', 'Manuel.'], ['Aucune.', 'MDE convient.']], 'MDE fournit les journaux sans routage supplémentaire.'),
  M('x09-ev2', 'eval', 'fonctionner', c1, 'Rôles', 'Cochez les rôles en lecture seule pour MDA.', [['Security Reader.', 'Lecture seule.'], ['Global Reader.', 'Lecture seule complète.']], [['Cloud App Security Administrator.', 'Accès complet à MDA.'], ['Security Administrator.', 'Accès complet.']], 'Les administrateurs ont un accès complet, pas en lecture seule.'),
  a.config({ id: 'x09-ev3', title: 'Statuer sur une application', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'securiser', lesson: 'x09-l2',
    st: 'Appliquez le processus à une application à risque élevé.',
    fields: [
      { id: 'dec', label: 'Décision documentée et communiquée aux utilisateurs', kind: 'toggle', accept: ['on'], why: 'Évite le contournement.' },
      { id: 'alt', label: 'Solution de rechange proposée', kind: 'toggle', accept: ['on'], why: 'Réduit la friction.' },
      { id: 'blk', label: 'Blocage appliqué avec suivi des tentatives', kind: 'toggle', accept: ['on'], why: 'L’application doit être vérifiée.' },
    ], solution: { dec: 'on', alt: 'on', blk: 'on' }, exp: 'Décision communiquée, solution de rechange et blocage suivi.' }),
  a.fix({ id: 'x09-ev4', title: 'Corriger une politique de session', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'securiser', lesson: 'x09-l3', language: 'json',
    st: 'Corrigez : action de blocage du téléchargement, appareils non gérés ciblés, clients natifs bloqués.',
    starter: JSON.stringify({ action: 'surveiller', appareils: 'tous', clientsNatifs: 'autorises' }, null, 2),
    rules: [{ kind: 'equals', path: 'action', value: 'bloquer-telechargement', message: 'Bloquer le téléchargement.', dim: 'securiser' }, { kind: 'equals', path: 'appareils', value: 'non-geres', message: 'Cibler les appareils non gérés.', dim: 'fonctionner' }, { kind: 'equals', path: 'clientsNatifs', value: 'bloques', message: 'Bloquer les clients natifs.', dim: 'securiser' }],
    solution: JSON.stringify({ action: 'bloquer-telechargement', appareils: 'non-geres', clientsNatifs: 'bloques' }, null, 2), exp: 'Le téléchargement est bloqué pour les appareils non gérés et le contournement par clients natifs est fermé.' }),
  a.match({ id: 'x09-ev5', title: 'Statuts', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'comprendre', lesson: 'x09-l2',
    st: 'Associez chaque situation au composant qui applique.', items: [['p1', 'Blocage sur un poste Windows'], ['p2', 'Blocage dans un SWG intégré'], ['p3', 'Navigateur non Microsoft']],
    options: [['s1', 'Protection réseau MDE'], ['s2', 'Zscaler'], ['s3', 'Extension Defender Browser Protection']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'MDE applique via la protection réseau, Zscaler via son blocage, et les navigateurs non Microsoft via l’extension.' }),
  a.inspect({ id: 'x09-ev6', title: 'Relire un rapport MDA', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'maintenir', lesson: 'x09-l3', language: 'text',
    st: 'Extrait d’un rapport. Repérez les faiblesses.',
    lines: [['r1', 'Aucune alerte d’anomalie depuis l’activation : tout va bien.', { ok: 'a1', fixes: [['a1', 'Tenir compte des sept jours d’apprentissage'], ['a2', 'Accepter']] }], ['r2', 'Nous avons promis une alerte de rançongiciel historique sans vérifier.', { ok: 'b1', fixes: [['b1', 'Vérifier les détections actives du modèle dynamique'], ['b2', 'Accepter']] }], ['r3', 'Les applications OAuth sont revues par la gouvernance chaque mois.']],
    exp: 'La période d’apprentissage et la transition de modèle expliquent des écarts d’alertes.' }),
  a.workflow({ id: 'x09-ev7', title: 'Déployer une politique de session', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'fonctionner', lesson: 'x09-l3',
    st: 'Ordonnez le déploiement d’une politique de session pour une application SaaS.',
    blocks: [['b1', 'Vérifier licences, SSO et pare-feu'], ['b2', 'Créer la politique d’accès conditionnel dans Entra'], ['b3', 'Créer la politique de session dans MDA'], ['b4', 'Tester avec un groupe pilote'], ['b5', 'Généraliser et surveiller'], ['b6', 'Généraliser sans test']],
    required: ['b1', 'b2', 'b3', 'b4', 'b5'], forbidden: ['b6'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4'], ['b4', 'b5']], notes: { b6: 'Un blocage mal calibré interrompt le travail.' }, solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
    exp: 'On vérifie les prérequis, on configure les deux politiques, on teste puis on généralise.' }),
  a.short({ id: 'x09-ev8', title: 'Jours d’apprentissage', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'comprendre', lesson: 'x09-l3',
    st: 'Combien de jours dure la période d’apprentissage initiale des politiques d’anomalies ? (nombre)', accepted: ['7'], numeric: { value: 7 }, ph: 'un nombre',
    exp: 'La période d’apprentissage initiale est de sept jours, pendant lesquels toutes les alertes ne sont pas déclenchées.' }),

  a.config({ id: 'x09-cs1', title: 'Cas : visibilité du shadow IT chez Nordlys', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'fonctionner', lesson: 'x09-l1',
    st: 'Paramétrez la visibilité du shadow IT.',
    fields: [
      { id: 'mde', label: 'Intégration MDE pour la visibilité hors réseau', kind: 'toggle', accept: ['on'], why: 'Couvre les appareils Windows hors du réseau.' },
      { id: 'cont', label: 'Rapport continu activé', kind: 'toggle', accept: ['on'], why: 'Détection d’anomalies.' },
      { id: 'anon', label: 'Anonymisation par défaut', kind: 'toggle', accept: ['on'], why: 'Protège la vie privée.' },
    ], solution: { mde: 'on', cont: 'on', anon: 'on' }, exp: 'MDE, rapport continu et anonymisation par défaut.' }),
  a.workflow({ id: 'x09-cs2', title: 'Cas : interdire une application', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'securiser', lesson: 'x09-l2',
    st: 'Ordonnez l’interdiction d’une application de stockage non approuvée.',
    blocks: [['t1', 'Évaluer le risque de l’application'], ['t2', 'Décider et communiquer'], ['t3', 'Marquer non autorisée'], ['t4', 'Vérifier les prérequis de blocage MDE'], ['t5', 'Surveiller les tentatives et ajuster'], ['t6', 'Annoncer un blocage immédiat']],
    required: ['t1', 't2', 't3', 't4', 't5'], forbidden: ['t6'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't4'], ['t4', 't5']], notes: { t6: 'L’application de l’indicateur peut prendre jusqu’à 48 h.' }, solution: ['t1', 't2', 't3', 't4', 't5'],
    exp: 'Évaluer, communiquer, marquer, vérifier et surveiller, sans promettre l’immédiateté.' }),
  a.match({ id: 'x09-cs3', title: 'Cas : trois alertes, trois leviers', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'fonctionner', lesson: 'x09-l3',
    st: 'Associez chaque situation au levier.', items: [['p1', 'Téléchargement massif depuis un poste non géré'], ['p2', 'Application OAuth demandant des permissions étendues'], ['p3', 'Connexions depuis une adresse IP rare']],
    options: [['s1', 'Politique de session'], ['s2', 'Gouvernance des applications'], ['s3', 'Détection d’anomalies']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Chaque situation correspond à un levier : session, gouvernance OAuth ou anomalie.' }),
  a.open({ id: 'x09-cs-open', title: 'Cas : programme de gouvernance du SaaS', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'x09-l3',
    st: 'Rédigez le programme de gouvernance du SaaS d’une organisation fictive.',
    deliverable: 'Un programme : sources de découverte, processus d’autorisation, blocage, politiques de session, gouvernance OAuth, rôles, indicateurs, limites, plan de migration des politiques de fichiers.',
    rubric: [['r1', 'Les sources de découverte sont justifiées.', 'fonctionner'], ['r2', 'Le processus est clair et communiqué.', 'maintenir'], ['r3', 'Les politiques de session sont testées.', 'securiser'], ['r4', 'La migration des politiques de fichiers est prévue.', 'maintenir'], ['r5', 'Les limites sont reconnues.', 'comprendre']],
    exp: 'Pas de note automatique : on juge la cohérence du programme.' }),

  Q('x09-rm1', 'remediation', 'comprendre', c1, 'Remédiation : snapshot', 'Quand utiliser un rapport instantané ?', ['Pour valider le format et obtenir une première visibilité.', 'Avant d’automatiser.'], [['Pour la détection continue.', 'Non.'], ['Pour bloquer.', 'Non.'], ['Jamais.', 'Non.']], 'Le snapshot sert à valider avant l’automatisation.'),
  Q('x09-rm2', 'remediation', 'securiser', c2, 'Remédiation : blocage', 'Que faut-il pour que MDE applique un blocage d’application ?', ['Protection infonuagique, protection réseau et extension de navigateur.', 'Trois prérequis.'], [['Rien.', 'Il y a des prérequis.'], ['Une licence Intune.', 'Non.'], ['Un pare-feu.', 'Non.']], 'Trois prérequis sont documentés.'),
  Q('x09-rm3', 'remediation', 'maintenir', c3, 'Remédiation : fichiers', 'Que prévoir pour les politiques de fichiers de MDA ?', ['Migrer vers Purview avant le retrait annoncé.', 'Retrait le 2027-01-06.'], [['Rien.', 'Un retrait est annoncé.'], ['Les multiplier.', 'Non.'], ['Les désactiver sans plan.', 'Non.']], 'Il faut prévoir la migration vers Purview.'),
];

const competencies: AiCompetency[] = [
  { id: 'x09-c1', module: 'x09', name: 'Cadrer MDA et Cloud Discovery', description: 'Leviers, sources, licences et rôles.', criteria: [{ id: 'x09-c1-1', text: 'Je distingue les quatre leviers.' }, { id: 'x09-c1-2', text: 'Je choisis la source de découverte.' }, { id: 'x09-c1-3', text: 'Je connais licences et rôles.' }] },
  { id: 'x09-c2', module: 'x09', name: 'Gouverner le shadow IT', description: 'Statuts, blocage et processus.', criteria: [{ id: 'x09-c2-1', text: 'Je distingue non autorisée et bloquée.' }, { id: 'x09-c2-2', text: 'Je connais les prérequis de blocage.' }, { id: 'x09-c2-3', text: 'Je bâtis un processus communiqué.' }] },
  { id: 'x09-c3', module: 'x09', name: 'Concevoir politiques et gouvernance', description: 'Politiques, anomalies, session et OAuth.', criteria: [{ id: 'x09-c3-1', text: 'Je choisis le bon type de politique.' }, { id: 'x09-c3-2', text: 'Je tiens compte de l’apprentissage et du modèle dynamique.' }, { id: 'x09-c3-3', text: 'Je prévois la migration des politiques de fichiers.' }] },
];

const projects: AiProject[] = [
  { id: 'x09-p1', module: 'x09', level: 'débutant', title: 'Glossaire du SaaS sécurisé', problem: 'Rédiger un glossaire des notions de MDA.', architecture: 'Document de deux pages.', tools: ['Éditeur de texte'], data: 'Aucune donnée réelle.', steps: ['Lister les termes.', 'Définir chacun.', 'Ajouter les limites.'], success: ['Chaque terme cite une source.'], risks: ['Confondre non autorisée et bloquée.'], extensions: ['Ajouter des exemples.'] },
  { id: 'x09-p2', module: 'x09', level: 'intermédiaire', title: 'Processus d’autorisation d’applications', problem: 'Concevoir le processus d’évaluation et de décision pour les applications découvertes.', architecture: 'Processus avec rôles et délais.', tools: ['Éditeur de texte', 'Tableur'], data: 'Applications fictives.', steps: ['Définir les critères.', 'Définir les rôles.', 'Définir la communication.', 'Définir les mesures.'], success: ['Chaque décision est documentée.'], risks: ['Blocage sans communication.'], extensions: ['Ajouter la revue annuelle.'],
    connected: { accounts: 'Un locataire de test avec Defender for Cloud Apps et MDE.', permissions: 'Security Administrator dans le locataire de test.', costs: 'Licences de test à votre charge.', secrets: 'Aucun secret.', cleanup: 'Supprimer rapports, politiques et indicateurs de test.', limits: 'Facultatif : le processus se fait sur papier.' } },
  { id: 'x09-p3', module: 'x09', level: 'avancé', title: 'Plan de migration des politiques de fichiers', problem: 'Concevoir la migration des politiques de fichiers de MDA vers Purview avant leur retrait.', architecture: 'Plan avec inventaire, correspondance et calendrier.', tools: ['Tableur'], data: 'Politiques fictives.', steps: ['Inventorier.', 'Faire correspondre.', 'Tester.', 'Basculer.'], success: ['Aucune couverture perdue.'], risks: ['Retard après la date de retrait.'], extensions: ['Ajouter les rapports.'] },
];

export const x09 = assemble({ id: 'x09', level: 3, n: 9, title: 'Defender for Cloud Apps',
  summary: 'Cloud Discovery, gouvernance du shadow IT, politiques, détection d’anomalies, contrôle d’application par accès conditionnel et gouvernance des applications OAuth.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Gouverner le SaaS de Nordlys',
  caseScenario: 'Vous cadrez la visibilité, interdisez une application et associez trois alertes à leurs leviers. Tout reste sur papier.', caseMinutes: 45 });
