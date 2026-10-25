// Module 12 : Defender for Storage (niveau 3).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, SH, OP, comps, P, assemble } = dsl('d12');
const c1 = { comp: 'd12-c1', lesson: 'd12-l1', tags: ['plan', 'activite', 'hash', 'portee'] };
const c2 = { comp: 'd12-c2', lesson: 'd12-l2', tags: ['maliciels', 'plafond', 'couts', 'limites'] };
const c3 = { comp: 'd12-c3', lesson: 'd12-l3', tags: ['reponse', 'automatisation', 'tests', 'faux-positifs'] };

const l1 = lesson(1, {
  title: 'Defender for Storage : couches de détection, portée et tarification', minutes: 45,
  summary: 'Distinguer surveillance d’activité, réputation de hachage, analyse de maliciels et détection de données sensibles, et choisir la portée d’activation.',
  objectives: ['Décrire les couches de détection du plan par compte de stockage.', 'Distinguer analyse de maliciels et réputation de hachage.', 'Choisir la portée d’activation et les exclusions.'],
  prerequisites: ['Module 2 : plans, licences et coûts', 'Module 4 : déploiement et couverture'],
  body: md(
    '## Un plan par compte de stockage',
    'Le plan actuel de Defender for Storage est tarifé **par compte de stockage protégé**, ce qui rend le coût plus prévisible que l’ancien modèle par transaction. On l’active au niveau de l’**abonnement** (les comptes héritent) ou du **compte**, et on peut **exclure** des comptes d’un abonnement protégé par un remplacement au niveau de la ressource. Des frais supplémentaires peuvent s’appliquer aux comptes à très fort volume de transactions, et le service traite aussi des transactions internes, dont celles de la **gestion du cycle de vie** des objets blob : une politique de cycle de vie peut donc générer des frais. Les anciennes configurations (« classic ») doivent être migrées vers le nouveau plan.',
    '## Quatre couches',
    'La **surveillance d’activité** analyse les opérations du plan de contrôle et du plan de données, sans exiger l’activation des journaux de ressources. L’**analyse de maliciels** (au dépôt ou à la demande) utilise Microsoft Defender Antivirus et n’existe que dans le nouveau plan, facturée au gigaoctet analysé. La **détection de menaces sur données sensibles** s’appuie sur les types d’informations sensibles et les étiquettes de Purview, sans frais supplémentaires, et elle est active par défaut sur un compte activé depuis le portail. La **réputation de hachage** compare les empreintes des nouveaux objets à celles de maliciels connus (Microsoft Defender Threat Intelligence) et existe dans tous les plans, mais certains protocoles et opérations ne sont pas surveillés, par exemple les partages SMB et les blobs créés par `Put Block` et `Put Block List`.',
    '## Choisir la portée',
    'Pour un parc varié, activez au niveau de l’abonnement puis ajustez : analyse de maliciels seulement sur les comptes qui reçoivent du contenu non fiable (téléversements d’utilisateurs, échanges de fichiers), surveillance d’activité partout. Des politiques Azure (« Configure Microsoft Defender for Storage to be enabled », et la variante limitée à la surveillance d’activité) permettent l’activation à grande échelle; l’infrastructure en code est aussi documentée. Dans tous les cas, notez les comptes exclus et le motif : un compte exclu n’est pas surveillé.',
    '| Couche | Disponibilité | Facturation |',
    '| --- | --- | --- |',
    '| Surveillance d’activité | Nouveau plan | Par compte |',
    '| Analyse de maliciels (dépôt, demande) | Nouveau plan seulement | Par Go analysé |',
    '| Détection sur données sensibles | Nouveau plan | Sans frais supplémentaires |',
    '| Réputation de hachage | Tous les plans | Incluse |',
    '```text',
    'Décision (exemple fictif)',
    'Abonnement production : plan activé, surveillance d’activité partout',
    'Comptes "depots-clients" et "echange-fournisseurs" : analyse de maliciels au dépôt, plafond 2 000 Go par mois',
    'Compte "archives-froides" : exclu (aucun dépôt externe), revue annuelle',
    '```',
    '## Erreurs fréquentes',
    '- Croire que la réputation de hachage remplace l’analyse de maliciels.',
    '- Activer l’analyse partout sans estimer le volume scanné.',
    '- Exclure un compte sans motif ni revue.',
  ),
  demo: { title: 'Choisir les couches par compte', body: md(
    'Trois comptes **fictifs** :',
    '```text',
    'depots-clients     : contenu externe, analyse de maliciels au dépôt + activité + données sensibles',
    'journaux-internes  : contenu interne, surveillance d’activité seulement',
    'archives-froides   : aucune écriture, exclu avec revue annuelle',
    '```',
    '**Lecture commentée.** Les couches suivent le risque d’entrée de contenu, pas la taille du compte.',
    '**Ce que la démo ne prouve pas.** Aucun coût chiffré.') },
  revision: md('## Fiche : plan Storage', '- Tarifé par compte; abonnement ou compte; exclusion par remplacement.', '- Analyse de maliciels : nouveau plan, par Go.', '- Données sensibles : sans frais, Purview.', '- Hachage : tous les plans, limites SMB et Put Block.', '- Cycle de vie : transactions possiblement facturées.'),
  links: ['storage', 'storage-enable', 'storage-portal', 'storage-policy', 'storage-iac'], teaches: ['plan', 'activite', 'hash', 'portee'],
});

const l2 = lesson(2, {
  title: 'Analyse de maliciels : au dépôt, à la demande, plafond et limites', minutes: 50,
  summary: 'Maîtriser les plafonds mensuels, les coûts annexes, les cas où l’analyse est inefficace et la lecture des résultats.',
  objectives: ['Expliquer le plafond mensuel et ses alertes.', 'Énoncer les scénarios où l’analyse est inefficace.', 'Choisir où consommer les résultats (balises, alertes, Event Grid, Log Analytics).'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Analyse au dépôt',
    'L’analyse au dépôt examine les objets blob au moment de leur téléversement. Elle traite jusqu’à **50 Go par minute et par compte**; si le rythme dépasse ce seuil de façon soutenue, certains objets peuvent ne pas être analysés. Pour la prévisibilité des coûts, un **plafond mensuel** de Go analysés peut être fixé par compte ou pour tout l’abonnement; par défaut il est de **10 000 Go** par compte et par mois, avec un écart possible de 20 Go. Quand le plafond est atteint, l’analyse **cesse** pour le reste du mois : les nouveaux objets restent non analysés et **aucun événement** n’est émis. Le compteur se remet à zéro à minuit UTC en fin de mois, et une modification du plafond prend environ une heure. Deux alertes préviennent : « 75 % du plafond atteint » et « plafond atteint, analyse arrêtée ».',
    '## Analyse à la demande',
    'L’analyse **à la demande** (blobs, avec Azure Files en préversion) lance une analyse ponctuelle, par exemple pendant un incident. Le portail affiche d’abord une **estimation de coût** fondée sur la capacité; il n’y a **pas de plafond mensuel** et le coût suit l’usage réel. Des filtres (un blob, un conteneur) limitent la portée et le coût. Elle convient à la réponse aux incidents et aux analyses de conformité planifiées.',
    '## Quand l’analyse est inefficace',
    'La documentation liste des cas : les données **fragmentées** (téléversées en morceaux; un fragment d’en-tête peut être jugé corrompu, un fragment de queue paraître bénin), les données **chiffrées côté client** (le service ne peut pas les déchiffrer; analysez avant de chiffrer, ou utilisez le chiffrement au repos géré par Azure) et les **sauvegardes** (qui contiennent des fragments de contenu : fausses alertes possibles). Une absence d’alerte n’est donc jamais une preuve d’innocuité. S’ajoutent des coûts annexes : lectures de stockage, indexation des blobs (balises) et notifications Event Grid, et un léger effet sur les IOPS que l’on réduit en désactivant les balises d’index.',
    '## Consommer les résultats',
    'Quatre voies : **balises d’index de blob** (décisions de contrôle d’accès), **alertes de sécurité** (SOC), **événements Event Grid** (réponse quasi temps réel) et **Log Analytics** (historique pour l’audit). Choisissez selon le consommateur : un contrôle d’accès lit les balises, le SOC lit les alertes, l’automatisation lit Event Grid, l’audit lit Log Analytics.',
    '```text',
    'Plafond (exemple fictif)',
    'Compte depots-clients : 1 800 Go analysés par mois en moyenne; plafond fixé à 2 500 Go',
    'Alerte à 75 % (1 875 Go) acheminée au SOC; revue du plafond chaque mois',
    '```',
    '## Erreurs fréquentes',
    '- Laisser le plafond par défaut de 10 000 Go sans estimation.',
    '- Ne pas surveiller l’alerte de 75 % : l’analyse s’arrête sans bruit.',
    '- Supposer que des fichiers chiffrés côté client sont analysés.',
  ),
  demo: { title: 'Le plafond est atteint', body: md(
    'Constat **fictif** : le 22 du mois, l’alerte « analyse arrêtée » apparaît.',
    '```text',
    'Effet   : les objets téléversés après l’arrêt ne sont pas analysés ni signalés',
    'Réponse : relever temporairement le plafond (effet en une heure) ou lancer une analyse à la demande ciblée',
    'Suivi   : analyser les objets déposés pendant la fenêtre non couverte',
    '```',
    '**Lecture commentée.** Le silence après l’arrêt n’est pas une bonne nouvelle : il faut analyser la fenêtre non couverte.',
    '**Ce que la démo ne prouve pas.** Chiffres inventés.') },
  revision: md('## Fiche : maliciels', '- Au dépôt : 50 Go/min, plafond 10 000 Go par défaut, alertes à 75 % et à 100 %.', '- Plafond atteint : l’analyse cesse, sans événement.', '- À la demande : pas de plafond, estimation affichée.', '- Inefficace : fragmenté, chiffré côté client, sauvegardes.', '- Résultats : balises, alertes, Event Grid, Log Analytics.'),
  links: ['storage-onupload', 'storage-ondemand', 'storage-malware-intro', 'storage-malware', 'cost-calculator'], teaches: ['maliciels', 'plafond', 'couts', 'limites'],
});

const l3 = lesson(3, {
  title: 'Répondre aux détections : suppression douce, automatisation et tests', minutes: 50,
  summary: 'Concevoir une réponse proportionnée aux maliciels détectés, sans suppression automatique non voulue, et tester sans danger.',
  objectives: ['Distinguer détection et suppression.', 'Choisir un mode de réponse (suppression douce, ABAC, Logic Apps, Functions).', 'Planifier un test inoffensif et le traitement des faux positifs.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Détecter n’est pas supprimer',
    'Par défaut, l’analyse de maliciels **détecte et signale**; elle ne supprime rien. C’est une décision de conception : une suppression automatique peut détruire des preuves, des fichiers légitimes faussement détectés ou des données soumises à des obligations de conservation. Les schémas de réponse documentés sont : activer la **suppression douce des blobs malveillants** (fonction intégrée qui déplace ou supprime sans flux personnalisé, avec possibilité de récupération); **bloquer l’accès** aux fichiers non analysés ou malveillants par le contrôle d’accès par attributs (**ABAC**) fondé sur les balises d’index; **supprimer ou déplacer en quarantaine** par une application logique déclenchée par les alertes ou une fonction déclenchée par Event Grid; **acheminer les fichiers sains** vers un autre stockage.',
    '## Choisir une réponse proportionnée',
    'Pour un dépôt de fichiers clients, un schéma sûr : les fichiers arrivent dans un compte de **réception**; les lecteurs n’y ont accès que si la balise indique « sans maliciel » (ABAC); un flux Event Grid déplace les fichiers sains vers le compte de production et les fichiers malveillants vers une **quarantaine** avec suppression douce et conservation de 14 jours; le SOC reçoit l’alerte. Documentez qui peut libérer un fichier de la quarantaine et comment un faux positif est traité.',
    '## Tester sans danger',
    'La documentation fournit un **test de détection inoffensif** pour valider la chaîne (analyse, alerte, réponse). N’utilisez jamais de vrais maliciels. Effectuez le test dans un compte de laboratoire, consignez les résultats (alerte reçue, balise posée, événement émis) et supprimez le compte ensuite. Un test réussi prouve que la chaîne fonctionne pour ce compte et cette configuration, pas qu’elle détecte tous les maliciels.',
    '## Faux positifs et faux négatifs',
    'Pour un faux positif, la documentation prévoit la soumission du fichier à l’examen et la création de règles de suppression d’alertes (module 21). Pour un faux négatif, soumettez le fichier à Microsoft et analysez à nouveau à la demande. Gardez un registre : fichier, décision, date, responsable.',
    '```text',
    'Chaîne de réponse (exemple fictif)',
    'Réception -> analyse au dépôt -> balise "sans maliciel" -> ABAC autorise la lecture',
    'Maliciel -> suppression douce 14 jours + alerte SOC + déplacement en quarantaine par fonction',
    'Faux positif -> revue par l’équipe sécurité, libération journalisée',
    '```',
    '## Erreurs fréquentes',
    '- Supposer que Defender supprime les fichiers malveillants.',
    '- Laisser les lecteurs accéder aux fichiers non encore analysés.',
    '- Tester avec un vrai maliciel.',
  ),
  demo: { title: 'Test de la chaîne de réponse', body: md(
    'Test **fictif** dans un compte de laboratoire :',
    '```text',
    '1. Déposer le fichier de test inoffensif prévu par la documentation',
    '2. Attendre l’analyse; relever la balise d’index et l’alerte',
    '3. Vérifier l’événement Event Grid et le déplacement en quarantaine',
    '4. Vérifier que la lecture est refusée tant que la balise n’est pas "sans maliciel"',
    '5. Supprimer le compte de laboratoire',
    '```',
    '**Lecture commentée.** Chaque étape produit une preuve distincte.',
    '**Ce que la démo ne prouve pas.** Aucun test réellement exécuté ici.') },
  revision: md('## Fiche : réponse', '- Détection n’est pas suppression.', '- Suppression douce, ABAC, Logic Apps, Functions.', '- Réception, balise, ABAC, quarantaine.', '- Test inoffensif de la documentation, jamais de vrai maliciel.', '- Registre des faux positifs.'),
  links: ['storage-response', 'storage-test', 'storage-malware-intro', 'storage-malware'], teaches: ['reponse', 'automatisation', 'tests', 'faux-positifs'],
});

const exercises = [
  MT('d12-g1', 'guided', 'comprendre', c1, 'Couches', 'Associez chaque couche à sa description.', [['Surveillance d’activité', 'Opérations des plans de contrôle et de données'], ['Analyse de maliciels', 'Defender Antivirus, par Go analysé'], ['Données sensibles', 'Types Purview, sans frais'], ['Réputation de hachage', 'Empreintes de maliciels connus']], 'Chaque couche a sa source et sa tarification.'),
  WF('d12-a1', 'autonomous', 'fonctionner', c1, 'Activer le plan', 'Ordonnez l\'activation du plan Storage sur un abonnement.', ['Estimer le coût avec le calculateur', 'Activer au niveau de l’abonnement', 'Configurer l’analyse de maliciels sur les comptes à risque', 'Exclure les comptes justifiés', 'Vérifier la couverture'], [['Activer l\'analyse partout sans estimer', 'Coût imprévisible.']], 'On estime, active, cible, exclut et vérifie.'),
  Q('d12-q1a', 'quiz', 'comprendre', c1, 'Tarification', 'Comment le plan actuel est-il tarifé ?', ['Par compte de stockage protégé.', 'Plus prévisible.'], [['Par transaction.', 'Ancien modèle.'], ['Par utilisateur.', 'Faux.'], ['Gratuit.', 'Faux.']], 'Par compte de stockage.'),
  Q('d12-q1b', 'quiz', 'securiser', c1, 'Hachage', 'La réputation de hachage remplace-t-elle l’analyse de maliciels ?', ['Non, elle ne couvre pas tous les protocoles.', 'SMB et Put Block non surveillés.'], [['Oui.', 'Faux.'], ['Seulement en Premium.', 'Faux.'], ['Seulement Linux.', 'Faux.']], 'Non.'),
  Q('d12-q1c', 'quiz', 'cout', c1, 'Cycle de vie', 'Les transactions du cycle de vie peuvent-elles être facturées ?', ['Oui, par le plan.', 'Documenté.'], [['Jamais.', 'Faux.'], ['Seulement Azure Files.', 'Faux.'], ['Seulement les archives.', 'Faux.']], 'Oui, possible.'),

  MT('d12-g2', 'guided', 'comprendre', c2, 'Plafonds', 'Associez chaque valeur à son sens.', [['10 000 Go', 'Plafond mensuel par défaut'], ['75 %', 'Alerte d’approche du plafond'], ['50 Go par minute', 'Débit maximal du compte']], 'Chaque valeur a son sens.'),
  CF('d12-a2', 'autonomous', 'cout', c2, 'Plafond et alertes', 'Paramétrez le plafond d\'un compte à fort volume.', [['Fixer un plafond selon le volume mesuré', 'on', 'Évite le défaut de 10 000 Go sans estimation.'], ['Ignorer l’alerte de 75 %', 'off', 'L’analyse s’arrête sans bruit à 100 %.'], ['Prévoir une analyse à la demande ciblée si le plafond est atteint', 'on', 'Couvre la fenêtre non analysée.']], 'Plafond mesuré, alerte surveillée, plan de secours.'),
  Q('d12-q2a', 'quiz', 'securiser', c2, 'Plafond atteint', 'Que se passe-t-il quand le plafond est atteint ?', ['L’analyse cesse pour le reste du mois.', 'Aucun événement émis.'], [['Elle continue.', 'Faux.'], ['Les fichiers sont supprimés.', 'Faux.'], ['Le compte est désactivé.', 'Faux.']], 'L’analyse cesse.'),
  Q('d12-q2b', 'quiz', 'securiser', c2, 'Chiffrement côté client', 'Les données chiffrées côté client sont-elles analysées ?', ['Non, le service ne peut pas les déchiffrer.', 'Analyser avant de chiffrer.'], [['Oui.', 'Faux.'], ['Si CMK.', 'Pas côté client.'], ['Si Premium.', 'Faux.']], 'Non.'),
  Q('d12-q2c', 'quiz', 'cout', c2, 'À la demande', 'L\'analyse à la demande a-t-elle un plafond mensuel ?', ['Non, le coût suit l’usage.', 'Estimation affichée avant.'], [['Oui 10 000 Go.', 'Faux.'], ['Oui 1 000 Go.', 'Faux.'], ['Oui 50 Go.', 'Faux.']], 'Non.'),

  MT('d12-g3', 'guided', 'comprendre', c3, 'Réponses', 'Associez chaque réponse à son mécanisme.', [['Suppression douce', 'Fonction intégrée récupérable'], ['ABAC', 'Contrôle d’accès par balise d’index'], ['Quarantaine', 'Fonction déclenchée par Event Grid']], 'Chaque réponse a son mécanisme.'),
  IN('d12-a3', 'autonomous', 'securiser', c3, 'Chaîne de réponse', 'Chaîne fictive : repérez les défauts.', 'text', [['« Defender supprime les fichiers malveillants. »', 'Il détecte et signale; la suppression se configure', 'Garder tel quel'], ['« Les lecteurs accèdent avant l’analyse. »', 'Bloquer par ABAC jusqu’à la balise', 'Garder tel quel'], ['« Test avec un vrai maliciel. »', 'Utiliser le test inoffensif', 'Garder tel quel']], 'Chaque défaut est corrigé.'),
  Q('d12-q3a', 'quiz', 'securiser', c3, 'Détection', 'Defender for Storage supprime-t-il automatiquement les maliciels ?', ['Non, pas par défaut.', 'Configurer la réponse.'], [['Oui.', 'Faux.'], ['Toujours.', 'Faux.'], ['Si Premium.', 'Faux.']], 'Non.'),
  Q('d12-q3b', 'quiz', 'verifier', c3, 'Test', 'Quel test utiliser pour valider la chaîne ?', ['Le test inoffensif de la documentation.', 'Jamais de vrai maliciel.'], [['Un vrai maliciel.', 'Dangereux.'], ['Aucun test.', 'Pas de preuve.'], ['Un fichier chiffré.', 'Non analysé.']], 'Test inoffensif.'),
  Q('d12-q3c', 'quiz', 'maintenir', c3, 'Faux positif', 'Que consigner pour un faux positif ?', ['Fichier, décision, date et responsable.', 'Traçabilité.'], [['Rien.', 'Faux.'], ['Le mot de passe.', 'Faux.'], ['Le contenu complet.', 'Inutile.']], 'Un registre de décision.'),

  Q('d12-ev1', 'eval', 'comprendre', c1, 'Exclusion', 'Comment exclure un compte d\'un abonnement protégé ?', ['Par un remplacement au niveau de la ressource.', 'Documenter le motif.'], [['Supprimer l\'abonnement.', 'Faux.'], ['Renommer le compte.', 'Faux.'], ['Impossible.', 'Faux.']], 'Remplacement au niveau du compte.'),
  M('d12-ev2', 'eval', 'verifier', c2, 'Scénarios inefficaces', 'Cochez les scénarios où l\'analyse est inefficace.', [['Données fragmentées.', 'Oui.'], ['Chiffrement côté client.', 'Oui.'], ['Sauvegardes (fausses alertes possibles).', 'Oui.']], [['Fichiers texte simples.', 'Faux.']], 'Trois cas documentés.'),
  FX('d12-ev3', 'eval', 'cout', c2, 'Corriger une décision de plafond', 'Corrigez la décision fictive.', { plafond: '10000', alerte: 'aucune', secours: '', revue: '' }, { plafond: '2500', alerte: '75 % vers le SOC', secours: 'analyse à la demande ciblée', revue: 'mensuelle' }, [['plafond', '2500', 'Plafond fondé sur le volume mesuré.', 'cout'], ['alerte', '75 % vers le SOC', 'Surveiller l’approche.', 'verifier'], ['secours', 'analyse à la demande ciblée', 'Couvrir la fenêtre non analysée.', 'securiser'], ['revue', 'mensuelle', 'Revoir le plafond.', 'maintenir']], 'Plafond mesuré, alerte, secours, revue.'),
  OR('d12-ev4', 'eval', 'fonctionner', c3, 'Chaîne de réception', 'Ordonnez la chaîne de réception de fichiers.', ['Déposer dans le compte de réception', 'Analyser au dépôt', 'Poser la balise de résultat', 'Autoriser la lecture selon la balise (ABAC)', 'Déplacer vers la production ou la quarantaine'], 'Réception, analyse, balise, ABAC, déplacement.'),
  CF('d12-ev5', 'eval', 'securiser', c3, 'Réponse proportionnée', 'Paramétrez la réponse aux maliciels.', [['Suppression douce de 14 jours', 'on', 'Permet la récupération.'], ['Suppression définitive immédiate', 'off', 'Détruit les preuves.'], ['Alerte au SOC', 'on', 'Investigation humaine.']], 'Suppression douce et alerte.'),
  WF('d12-ev6', 'eval', 'maintenir', c3, 'Tester la chaîne', 'Ordonnez le test de la chaîne.', ['Créer un compte de laboratoire', 'Déposer le fichier de test inoffensif', 'Relever balise, alerte et événement', 'Vérifier le blocage de lecture', 'Supprimer le compte de laboratoire'], [['Tester en production', 'Risque inutile.']], 'Laboratoire, test, preuves, blocage, nettoyage.'),
  SH('d12-ev7', 'eval', 'verifier', c2, 'Plafond par défaut', 'Quel est le plafond mensuel par défaut en Go ? (nombre)', ['10000'], 'Dix mille Go.', 10000),
  Q('d12-ev8', 'eval', 'fonctionner', c1, 'Portée d\'héritage', 'Quelle portée permet aux comptes d\'hériter du plan ?', ['L\'abonnement.', 'Les comptes héritent de l\'abonnement protégé.'], [['Le locataire Entra.', 'Faux.'], ['Le groupe de ressources seulement.', 'Faux.'], ['Aucune.', 'Faux.']], 'Les comptes héritent du plan de l\'abonnement.'),

  IN('d12-cs1', 'case', 'verifier', c2, 'Cas : conception de dépôt chez Nordlys', 'Conception fictive : repérez les défauts.', 'text', [['« Plafond par défaut, pas d\'alerte. »', 'Estimer le volume et surveiller l’alerte de 75 %', 'Garder tel quel'], ['« Fichiers chiffrés côté client analysés. »', 'Non analysables', 'Garder tel quel']], 'Chaque défaut est corrigé.'),
  MT('d12-cs2', 'case', 'fonctionner', c2, 'Cas : résultats', 'Associez chaque consommateur à la voie de résultats.', [['Contrôle d\'accès', 'Balises d\'index'], ['SOC', 'Alertes de sécurité'], ['Automatisation', 'Event Grid'], ['Audit', 'Log Analytics']], 'Chaque consommateur a sa voie.'),
  WF('d12-cs3', 'case', 'securiser', c3, 'Cas : faux positif', 'Ordonnez le traitement d\'un faux positif.', ['Isoler le fichier en quarantaine', 'Faire examiner par l’équipe sécurité', 'Soumettre le fichier à l’examen', 'Libérer avec journalisation', 'Ajuster la règle de suppression'], [['Supprimer sans revue', 'Perte de données.']], 'Isoler, examiner, soumettre, libérer, ajuster.'),
  OP('d12-cs-open', 'case', 'verifier', c3, 'Cas : protection du stockage de Nordlys', 'Rédigez la stratégie de protection du stockage d\'une organisation fictive.', 'Une page : couches par compte, plafonds, réponse, tests, limites.', [['Les couches suivent le risque.', 'comprendre'], ['La réponse est proportionnée.', 'securiser'], ['Les coûts sont maîtrisés.', 'cout'], ['Les limites sont énoncées.', 'verifier']], 'La stratégie relie couches, coûts, réponse et limites.'),

  Q('d12-rm1', 'remediation', 'comprendre', c1, 'Remédiation : couches', 'Quelle couche existe dans tous les plans ?', ['La réputation de hachage.', 'Incluse partout.'], [['L\'analyse de maliciels.', 'Nouveau plan.'], ['Les données sensibles.', 'Nouveau plan.'], ['Aucune.', 'Faux.']], 'Réputation de hachage.'),
  Q('d12-rm2', 'remediation', 'securiser', c2, 'Remédiation : plafond', 'L\'absence d\'événement après le plafond signifie :', ['Que l\'analyse est arrêtée, pas que tout est sain.', 'Fenêtre non couverte.'], [['Tout est sain.', 'Faux.'], ['Le compte est supprimé.', 'Faux.'], ['Un bogue.', 'Faux.']], 'Analyse arrêtée.'),
  Q('d12-rm3', 'remediation', 'securiser', c3, 'Remédiation : suppression', 'Quelle option évite de perdre des preuves ?', ['La suppression douce.', 'Récupérable.'], [['La suppression définitive.', 'Perd les preuves.'], ['L\'écrasement.', 'Perd les preuves.'], ['Aucune.', 'Faux.']], 'Suppression douce.'),
];

const competencies = comps([
  ['Choisir les couches de protection du stockage', 'Plan, couches, portée.', ['Je distingue les quatre couches.', 'Je choisis la portée.', 'Je documente les exclusions.']],
  ['Maîtriser l’analyse de maliciels', 'Plafonds, coûts, limites.', ['Je fixe un plafond mesuré.', 'Je surveille les alertes.', 'Je connais les cas inefficaces.']],
  ['Répondre et tester', 'Réponse, tests, faux positifs.', ['Je distingue détection et suppression.', 'Je conçois une réponse proportionnée.', 'Je teste sans danger.']],
]);

const projects = [
  P(1, 'débutant', 'Matrice des comptes de stockage', 'Classer les comptes de stockage selon le risque de dépôt externe.', 'Tableau compte, risque, couches.', ['Lister les comptes.', 'Classer.', 'Choisir les couches.'], ['Chaque compte a ses couches.'], ['Oublier un compte exposé.'], ['Ajouter les coûts.']),
  P(2, 'intermédiaire', 'Chaîne de réception avec quarantaine', 'Concevoir la chaîne réception, analyse, ABAC et quarantaine.', 'Schéma et règles d\'accès.', ['Définir les comptes.', 'Définir les balises.', 'Définir la quarantaine.'], ['Aucun fichier non analysé n\'est lu.'], ['Lecture avant analyse.'], ['Ajouter la suppression douce.'],
    { connected: { accounts: 'Un abonnement Azure de test avec un compte de stockage de laboratoire.', permissions: 'Droits d\'activation du plan limités au compte de laboratoire.', costs: 'Le plan est payant par compte et l\'analyse est facturée par Go : limiter le plafond à une très petite valeur.', secrets: 'Aucun secret.', cleanup: 'Désactiver le plan sur le compte et supprimer le groupe de ressources du laboratoire.', limits: 'Test avec le fichier inoffensif de la documentation seulement. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Automatisation de réponse et de suivi des plafonds', 'Concevoir l\'automatisation Event Grid et le suivi des alertes de plafond.', 'Flux Event Grid, fonction, alertes.', ['Concevoir le flux.', 'Concevoir le suivi.', 'Prévoir la gouvernance.'], ['Aucune fenêtre non couverte sans suivi.'], ['Boucle d\'événements.'], ['Intégrer à Sentinel.']),
];

export const d12 = assemble({ id: 'd12', level: 3, n: 12, title: 'Defender for Storage',
  summary: 'Couches de détection, tarification par compte, analyse de maliciels au dépôt et à la demande, plafonds et limites, réponse proportionnée et tests inoffensifs.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Protéger le stockage de Nordlys Technologies',
  caseScenario: 'Vous choisissez les couches, fixez un plafond et concevez une chaîne de réponse. Données simulées.', caseMinutes: 50 });
