// Module 7 : Conformité et standards (niveau 2).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, SH, OP, comps, P, assemble } = dsl('d07');
const c1 = { comp: 'd07-c1', lesson: 'd07-l1', tags: ['standards', 'affectation', 'etendue', 'prerequis-plan'] };
const c2 = { comp: 'd07-c2', lesson: 'd07-l2', tags: ['controles', 'evaluations-manuelles', 'responsabilite-partagee'] };
const c3 = { comp: 'd07-c3', lesson: 'd07-l3', tags: ['rapports', 'preuves', 'export', 'limites-conformite'] };

const l1 = lesson(1, {
  title: 'Standards de conformité : affecter, délimiter et surveiller', minutes: 45,
  summary: 'Savoir quels plans ouvrent la conformité, comment affecter un standard à la bonne étendue et pourquoi un standard peut ne pas apparaître.',
  objectives: ['Énoncer les prérequis de plan et de rôle pour affecter un standard.', 'Choisir l’étendue d’affectation et expliquer l’agrégation.', 'Distinguer le portail Azure (affectation) du portail Defender (suivi).'],
  prerequisites: ['Module 5 : posture de sécurité du cloud'],
  body: md(
    '## Un standard est une initiative évaluée',
    'Dans Defender for Cloud, un **standard de conformité** s’appuie sur une initiative Azure Policy (ou, pour AWS et GCP, sur les évaluations du connecteur). Le tableau de bord de **conformité réglementaire** montre par défaut le **Microsoft cloud security benchmark** (MCSB). Pour suivre un autre standard (par exemple une norme de l’industrie des cartes de paiement ou une norme de gestion de la sécurité de l’information), il faut l’ajouter explicitement. C’est la même mécanique qu’au module 5 : sans ressources évaluées pertinentes, un standard affecté **n’apparaît pas** sur le tableau de bord, ce qui surprend souvent.',
    '## Prérequis de plan et de rôle',
    'Pour accéder aux standards additionnels, il faut avoir activé **au moins un plan payant**, à l’exception de Defender for Servers plan 1 et de Defender for API plan 1 : pour Servers, la conformité n’est offerte que par le plan 2. Pour ajouter un standard, il faut le rôle **Owner** ou **Policy Contributor**. Pour **lire** les données, le rôle **Reader** donne accès aux données de conformité Azure Policy, ce que **Security Reader** ne fait pas. Le minimum documenté pour accéder au tableau de bord et gérer les standards est la combinaison **Resource Policy Contributor** et **Security Admin**.',
    '## Choisir l’étendue',
    'Dans le portail Azure, Regulatory compliance puis **Manage compliance policies**, vous choisissez un compte (abonnement ou groupe de gestion, compte AWS ou compte de gestion, projet GCP ou organisation), puis Security policies où vous basculez le standard à « On ». La documentation recommande **l’étendue la plus haute applicable** afin que les données soient agrégées pour toutes les ressources imbriquées. Pour AWS, le standard **AWS Foundational Security Best Practices** est affecté par défaut à chaque compte. Les autres s’ajoutent par Environment settings, le compte, Standards, Add, Standard.',
    '## Où travailler',
    'Le portail **Defender** offre un suivi orienté consommation (indicateur de conformité, filtrage des recommandations par cadre de référence), mais l’**affectation** et la configuration des standards restent dans le portail **Azure**. Une équipe qui n’a accès qu’au portail Defender ne pourra donc pas ajouter de standard. Dites-le au moment de définir les rôles (module 3).',
    '| Besoin | Où | Condition |',
    '| --- | --- | --- |',
    '| Voir le MCSB | Les deux portails | Plan activé ou non |',
    '| Ajouter un standard | Portail Azure | Plan payant (hors Servers P1 et API P1), Owner ou Policy Contributor |',
    '| Suivre l’avancement | Portail Defender ou Azure | Ressources évaluées présentes |',
    '| Rapport PDF ou CSV | Portail Azure | Standard fourni par Microsoft |',
    '```text',
    'Décision d’affectation (exemple fictif)',
    'Standard      : norme de gestion de la sécurité de l’information',
    'Étendue       : groupe de gestion racine (agrégation)',
    'Plans payants : Servers P2 et Storage (donc éligible)',
    'Rôle          : Policy Contributor pour l’équipe conformité',
    'Attente       : premières données après la fenêtre d’évaluation (environ 12 heures)',
    '```',
    '## Erreurs fréquentes',
    '- Affecter un standard sur un abonnement sans ressources pertinentes et conclure à un bogue.',
    '- Compter sur Servers plan 1 pour la conformité.',
    '- Donner Security Reader à l’équipe conformité qui a besoin de lire les données de politique.',
  ),
  demo: { title: 'Pourquoi le standard est absent', body: md(
    'Constat **fictif** : le standard a été affecté hier et n’apparaît pas.',
    '```text',
    'Question 1 : un plan payant (hors Servers P1) est-il activé ?        -> oui, Servers P2',
    'Question 2 : le standard a-t-il été affecté à la bonne étendue ?     -> un seul abonnement de laboratoire',
    'Question 3 : l’étendue contient-elle des ressources pertinentes ?    -> non, aucune ressource évaluable',
    '```',
    '**Lecture commentée.** L’absence vient de l’étendue sans ressource pertinente. Affecter au groupe de gestion racine règle le problème.',
    '**Ce que la démo ne prouve pas.** Scénario inventé.') },
  revision: md('## Fiche : standards', '- Standard = initiative évaluée. MCSB par défaut.', '- Au moins un plan payant, sauf Servers P1 et API P1.', '- Owner ou Policy Contributor pour ajouter. Reader pour lire les données de politique.', '- Étendue la plus haute pour agréger.', '- Affectation : portail Azure. Suivi : portail Defender possible.'),
  links: ['compliance', 'compliance-assign', 'compliance-standards', 'compliance-faq', 'security-policy'], teaches: ['standards', 'affectation', 'etendue', 'prerequis-plan'],
});

const l2 = lesson(2, {
  title: 'Contrôles, évaluations automatiques et manuelles, responsabilité partagée', minutes: 50,
  summary: 'Lire les contrôles d’un standard, distinguer actions de l’organisation et actions de Microsoft et savoir attester ce qui ne s’automatise pas.',
  objectives: ['Lire l’onglet Vos actions et l’onglet Actions Microsoft d’un contrôle.', 'Expliquer pourquoi des contrôles sont grisés.', 'Attester une évaluation manuelle avec preuve.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Du contrôle à l’évaluation',
    'Un standard comprend des **contrôles**, groupes logiques de recommandations liées. Defender for Cloud évalue en continu ce qui peut l’être automatiquement et affiche les ressources conformes ou non. Pour chaque contrôle, les **Détails du contrôle** offrent trois onglets : **Overview**, **Your Actions** (les actions de votre organisation, automatisées et manuelles) et **Microsoft Actions** (ce que Microsoft a fait pour respecter la norme dans sa part de responsabilité). Les évaluations automatisées indiquent le nombre de ressources et de types de ressources en échec et mènent à la remédiation.',
    '## Pourquoi des contrôles sont grisés',
    'Un contrôle grisé n’a **aucune évaluation Defender for Cloud associée**. Trois raisons : le contrôle relève d’une procédure ou d’un processus qu’un outil ne peut pas vérifier ; l’évaluation automatisée n’existe pas encore ; ou le contrôle relève de la responsabilité de la plateforme. Un contrôle grisé n’est **ni conforme ni non conforme** : il est non évalué. Un rapport qui compte les contrôles grisés comme conformes est trompeur. La vue « responsabilité partagée » est propre à Azure.',
    '## Les évaluations manuelles et l’attestation',
    'Pour les évaluations manuelles, ouvrez le contrôle, la section **Manual attestation and evidence**, sélectionnez l’évaluation et les abonnements concernés, puis **Attest**. Vous saisissez l’information et joignez la **preuve** (document, lien, capture). L’attestation est la déclaration d’une personne, pas une vérification technique : elle doit nommer l’auteur, la date, la portée et la preuve, et sera réexaminée à une fréquence décidée. Un champ libre rempli de « OK » ne soutient aucun audit.',
    '## Délais et exemptions',
    'Les évaluations s’exécutent environ **toutes les 12 heures** : l’effet d’une correction apparaît après la prochaine exécution. Sur de grands périmètres, l’évaluation Azure Policy n’a pas de délai garanti. Pour exclure une ressource d’une recommandation du MCSB comptée dans le niveau de sécurité, on crée une **exemption** dans le portail ; pour les autres recommandations, on crée l’exemption dans Azure Policy. Chaque exemption doit avoir une raison, un propriétaire et une échéance.',
    '```text',
    'Fiche d’attestation (exemple fictif)',
    'Contrôle     : revue périodique des accès privilégiés',
    'Nature       : évaluation manuelle (procédure)',
    'Déclarant    : responsable sécurité, date 2026-10-25',
    'Preuve       : rapport de revue d’accès du trimestre, stocké dans le dépôt documentaire',
    'Prochaine revue : trimestrielle',
    '```',
    '## Erreurs fréquentes',
    '- Compter les contrôles grisés comme conformes.',
    '- Attester sans preuve ni date.',
    '- Constater l’absence d’amélioration une heure après la correction.',
  ),
  demo: { title: 'Lire un contrôle', body: md(
    'Contrôle **fictif** dans un standard :',
    '```text',
    'Your Actions       : 3 évaluations automatisées (2 en échec), 1 évaluation manuelle',
    'Microsoft Actions  : sécurité physique des centres de données',
    'État du contrôle   : non conforme (2 ressources) ; une évaluation manuelle à attester',
    '```',
    '**Lecture commentée.** Deux actions techniques et une attestation à produire. La sécurité physique est couverte par Microsoft, avec ses rapports d’audit.',
    '**Ce que la démo ne prouve pas.** Données inventées.') },
  revision: md('## Fiche : contrôles', '- Onglets : Overview, Your Actions, Microsoft Actions.', '- Contrôle grisé = non évalué, ni conforme ni non conforme.', '- Attestation : auteur, date, portée, preuve, revue.', '- Évaluations environ toutes les 12 heures.', '- Exemption : raison, propriétaire, échéance.'),
  links: ['compliance-dashboard', 'compliance-faq', 'exemptions', 'compliance', 'secure-score'], teaches: ['controles', 'evaluations-manuelles', 'responsabilite-partagee'],
});

const l3 = lesson(3, {
  title: 'Rapports, preuves d’audit, export et limites de la conformité', minutes: 50,
  summary: 'Produire des rapports exploitables, automatiser le suivi de la conformité et rappeler ce que le tableau de bord ne prouve pas.',
  objectives: ['Choisir entre le rapport PDF, le rapport CSV et les rapports d’audit.', 'Exporter la conformité en continu et déclencher un flux sur changement.', 'Énoncer les limites : conformité technique ne vaut pas certification.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Trois livrables différents',
    'Le bouton **Download report** produit un rapport pour un standard fourni par Microsoft, au format **PDF** (résumé de l’état de conformité, organisé par contrôles, partageable avec les parties prenantes et utile comme élément de preuve) ou **CSV** (résultats détaillés **par ressource** pour les politiques associées à chaque contrôle). Aucun rapport n’est offert pour un standard **personnalisé**. L’option **Audit reports** télécharge les rapports de certification d’Azure et de Dynamics (SOC, ISO, PCI et autres), qui attestent de la conformité de la **plateforme** de Microsoft, pas de la vôtre. Un consentement de notification s’affiche au téléchargement.',
    '## Suivre dans le temps',
    'Pour suivre la conformité avec d’autres outils, configurez l’**export continu** vers un espace de travail Log Analytics ou Event Hubs : flux continu des données de conformité ou instantanés hebdomadaires. Le classeur « compliance over time » s’appuie sur ces données. L’automatisation de flux peut aussi déclencher une application logique lorsqu’une évaluation de conformité change d’état, par exemple pour avertir un responsable quand une évaluation échoue. Les données de conformité des standards ajoutés remontent également dans **Microsoft Purview Compliance Manager**, qui centralise actions d’amélioration et statut pour l’ensemble de l’environnement numérique.',
    '## Ce que le tableau de bord ne prouve pas',
    'La conformité affichée est **technique et partielle** : elle reflète les évaluations automatisables et les attestations saisies. Elle ne couvre pas les processus, les contrats ni les décisions de gouvernance, et elle ne constitue ni une certification ni un avis juridique. Un auditeur attend des preuves datées, un périmètre précis et un responsable. Présentez toujours le rapport comme **un élément de preuve parmi d’autres**, avec la date de génération, les abonnements inclus et la liste des contrôles non évalués.',
    '## Conserver les preuves',
    'Archivez chaque rapport avec son cartouche dans un dépôt documentaire à accès contrôlé, selon la durée de rétention exigée par l’organisation. Une preuve que personne ne retrouve au moment de l’audit n’en est pas une : nommez un responsable de la collecte, fixez la fréquence (mensuelle ou trimestrielle) et testez une fois par année la recherche d’une preuve ancienne. Pour les données exportées vers Log Analytics, prévoyez la rétention et le coût d’ingestion avant d’activer l’export.',
    '```text',
    'Cartouche de rapport (exemple fictif)',
    'Standard      : MCSB   |  Date : 2026-10-25  |  Périmètre : 14 abonnements',
    'Contrôles     : 62 évalués, 18 grisés (non évalués), 9 manuels attestés',
    'Limites       : conformité technique, pas une certification ; chiffres valables à la date indiquée',
    '```',
    '## Erreurs fréquentes',
    '- Remettre le rapport de certification de Microsoft comme preuve de votre propre conformité.',
    '- Omettre la date et le périmètre du rapport.',
    '- Présenter un pourcentage de conformité comme une garantie de sécurité.',
  ),
  demo: { title: 'Choisir le bon livrable', body: md(
    'Demandes **fictives** :',
    '```text',
    'Un auditeur veut un résumé par contrôle                       -> rapport PDF + cartouche daté',
    'L’équipe infra veut la liste des ressources fautives          -> rapport CSV par ressource',
    'La direction veut prouver la sécurité de la plateforme Azure  -> Audit reports (rapports de certification de Microsoft)',
    'Le SOC veut une alerte à chaque échec                         -> export continu + application logique',
    '```',
    '**Lecture commentée.** Chaque demande reçoit un livrable précis et une source nommée.',
    '**Ce que la démo ne prouve pas.** Aucun rapport n’a été généré.') },
  revision: md('## Fiche : rapports', '- PDF : résumé par contrôle. CSV : détail par ressource.', '- Audit reports : certification de la plateforme Microsoft, pas la vôtre.', '- Export continu et flux sur changement d’évaluation.', '- Purview Compliance Manager reçoit les données des standards ajoutés.', '- Conformité technique ne vaut pas certification.'),
  links: ['compliance-dashboard', 'compliance-faq', 'continuous-export', 'compliance-manager', 'workbooks'], teaches: ['rapports', 'preuves', 'export', 'limites-conformite'],
});

const exercises = [
  MT('d07-g1', 'guided', 'comprendre', c1, 'Prérequis', 'Associez chaque exigence à sa raison.', [['Au moins un plan payant', 'Accès aux standards additionnels'], ['Owner ou Policy Contributor', 'Ajouter un standard'], ['Reader', 'Lire les données de conformité Azure Policy']], 'Chaque prérequis se rattache à une capacité précise.'),
  WF('d07-a1', 'autonomous', 'fonctionner', c1, 'Affecter un standard', 'Ordonnez l’affectation d’un standard.', ['Vérifier qu’un plan payant éligible est activé', 'Vérifier le rôle', 'Choisir l’étendue la plus haute applicable', 'Basculer le standard à On', 'Attendre la fenêtre d’évaluation'], [['Affecter à un abonnement vide', 'Aucune ressource pertinente.']], 'On vérifie plan et rôle, on choisit l’étendue, on active et on attend.'),
  Q('d07-q1a', 'quiz', 'comprendre', c1, 'Standard par défaut', 'Quel standard le tableau de bord montre-t-il par défaut ?', ['Le MCSB.', 'Les autres s’ajoutent.'], [['PCI DSS.', 'À ajouter.'], ['ISO 27001.', 'À ajouter.'], ['Aucun.', 'Faux.']], 'Le MCSB est affiché par défaut.'),
  Q('d07-q1b', 'quiz', 'verifier', c1, 'Standard absent', 'Pourquoi un standard affecté peut-il ne pas apparaître ?', ['Il n’y a aucune ressource évaluée pertinente dans l’étendue.', 'Documenté.'], [['Il est supprimé.', 'Faux.'], ['Le portail est en panne.', 'Pas nécessairement.'], ['Il est en anglais.', 'Faux.']], 'L’absence de ressources pertinentes l’explique.'),
  Q('d07-q1c', 'quiz', 'securiser', c1, 'Servers P1', 'Defender for Servers plan 1 ouvre-t-il la conformité réglementaire ?', ['Non, seulement le plan 2.', 'Exception documentée.'], [['Oui.', 'Faux.'], ['Seulement sur AWS.', 'Faux.'], ['Seulement le week-end.', 'Faux.']], 'Seul le plan 2 ouvre la conformité.'),

  MT('d07-g2', 'guided', 'comprendre', c2, 'Onglets d’un contrôle', 'Associez chaque onglet à son contenu.', [['Your Actions', 'Actions de l’organisation'], ['Microsoft Actions', 'Actions de Microsoft'], ['Manual attestation and evidence', 'Déclaration avec preuve']], 'Chaque onglet a un contenu précis.'),
  IN('d07-a2', 'autonomous', 'verifier', c2, 'Relire un rapport de conformité', 'Rapport fictif : repérez les affirmations à corriger.', 'text', [['« 100 % : tous les contrôles sont conformes. »', 'Compter séparément les contrôles grisés non évalués', 'Garder tel quel'], ['« Attesté par l’équipe, sans pièce jointe. »', 'Joindre la preuve, la date et le déclarant', 'Garder tel quel'], ['« Corrigé il y a une heure, toujours en échec : bogue. »', 'Attendre la prochaine évaluation, environ 12 heures', 'Garder tel quel']], 'Chaque ligne est corrigée.'),
  Q('d07-q2a', 'quiz', 'comprendre', c2, 'Contrôle grisé', 'Un contrôle grisé est :', ['Non évalué, ni conforme ni non conforme.', 'Pas d’évaluation associée.'], [['Conforme.', 'Faux.'], ['Non conforme.', 'Faux.'], ['Supprimé.', 'Faux.']], 'Grisé veut dire non évalué.'),
  Q('d07-q2b', 'quiz', 'securiser', c2, 'Attestation', 'Que doit contenir une attestation solide ?', ['Auteur, date, portée et preuve.', 'Rend l’audit possible.'], [['Un OK.', 'Insuffisant.'], ['Le nom de l’abonnement seulement.', 'Insuffisant.'], ['Rien.', 'Faux.']], 'Auteur, date, portée, preuve.'),
  Q('d07-q2c', 'quiz', 'verifier', c2, 'Rythme d’évaluation', 'À quel rythme les évaluations de conformité s’exécutent-elles environ ?', ['Toutes les 12 heures.', 'Effet différé.'], [['Chaque seconde.', 'Faux.'], ['Chaque mois.', 'Faux.'], ['Jamais.', 'Faux.']], 'Environ toutes les 12 heures.'),

  MT('d07-g3', 'guided', 'fonctionner', c3, 'Livrable et usage', 'Associez chaque livrable à son usage.', [['Rapport PDF', 'Résumé par contrôle'], ['Rapport CSV', 'Détail par ressource'], ['Audit reports', 'Certification de la plateforme Microsoft']], 'Chaque livrable a un public et une portée.'),
  OR('d07-a3', 'autonomous', 'maintenir', c3, 'Mettre en place le suivi', 'Ordonnez la mise en place d’un suivi automatisé de la conformité.', ['Définir les standards et la fréquence', 'Configurer l’export continu', 'Créer le classeur de suivi', 'Configurer l’application logique sur changement', 'Revoir le suivi trimestriellement'], 'On définit, exporte, visualise, alerte et revoit.'),
  Q('d07-q3a', 'quiz', 'securiser', c3, 'Portée des rapports d’audit', 'Que démontrent les Audit reports ?', ['La conformité de la plateforme Microsoft, pas la vôtre.', 'Responsabilité partagée.'], [['La conformité de votre organisation.', 'Faux.'], ['Votre niveau de sécurité.', 'Faux.'], ['Vos coûts.', 'Faux.']], 'Ils portent sur la plateforme.'),
  Q('d07-q3b', 'quiz', 'fonctionner', c3, 'Standard personnalisé', 'Peut-on télécharger un rapport de conformité d’un standard personnalisé ?', ['Non, seulement les standards fournis.', 'Limite documentée.'], [['Oui toujours.', 'Faux.'], ['Seulement en CSV.', 'Faux.'], ['Seulement le lundi.', 'Faux.']], 'Les standards personnalisés n’ont pas de rapport téléchargeable.'),
  Q('d07-q3c', 'quiz', 'verifier', c3, 'Conformité et certification', 'La conformité affichée vaut-elle certification ?', ['Non, elle est technique et partielle.', 'Un élément de preuve parmi d’autres.'], [['Oui.', 'Faux.'], ['Oui si 100 %.', 'Faux.'], ['Oui pour AWS.', 'Faux.']], 'Elle ne remplace pas une certification.'),

  Q('d07-ev1', 'eval', 'comprendre', c1, 'Étendue d’affectation', 'Quelle étendue la documentation recommande-t-elle ?', ['La plus haute applicable.', 'Pour agréger.'], [['La plus basse.', 'Faux.'], ['Une ressource.', 'Faux.'], ['Aucune.', 'Faux.']], 'Étendue la plus haute applicable.'),
  M('d07-ev2', 'eval', 'verifier', c2, 'Raisons d’un contrôle grisé', 'Cochez les raisons possibles d’un contrôle grisé.', [['Procédure non vérifiable par un outil.', 'Oui.'], ['Évaluation automatisée non encore implémentée.', 'Oui.'], ['Responsabilité de la plateforme.', 'Oui.']], [['Le contrôle est conforme.', 'Faux.'], ['Le contrôle est supprimé.', 'Faux.']], 'Trois raisons documentées.'),
  FX('d07-ev3', 'eval', 'verifier', c3, 'Corriger un cartouche de rapport', 'Corrigez le cartouche fictif.', { standard: 'MCSB', date: '', perimetre: 'tous', grises: 'ignorés', limites: 'aucune' }, { standard: 'MCSB', date: '2026-10-25', perimetre: '14 abonnements', grises: '18 non évalués', limites: 'conformité technique, pas une certification' }, [['date', '2026-10-25', 'Dater le rapport.', 'verifier'], ['perimetre', '14 abonnements', 'Nommer le périmètre exact.', 'verifier'], ['grises', '18 non évalués', 'Compter les contrôles non évalués.', 'verifier'], ['limites', 'conformité technique, pas une certification', 'Énoncer les limites.', 'securiser']], 'Le cartouche donne date, périmètre, contrôles non évalués et limites.'),
  OR('d07-ev4', 'eval', 'fonctionner', c2, 'Attester une évaluation manuelle', 'Ordonnez l’attestation d’une évaluation manuelle.', ['Ouvrir le contrôle', 'Sélectionner l’évaluation manuelle', 'Sélectionner les abonnements', 'Saisir l’information et joindre la preuve', 'Enregistrer et planifier la revue'], 'On ouvre, sélectionne, précise la portée, prouve et planifie.'),
  CF('d07-ev5', 'eval', 'securiser', c3, 'Remettre un rapport à un auditeur', 'Paramétrez la remise d’un rapport.', [['Joindre date et périmètre', 'on', 'Rend le rapport vérifiable.'], ['Présenter le rapport de certification de Microsoft comme votre preuve', 'off', 'Il porte sur la plateforme.'], ['Lister les contrôles non évalués', 'on', 'Transparence.']], 'Le rapport est daté, délimité et honnête sur ses limites.'),
  WF('d07-ev6', 'eval', 'maintenir', c3, 'Cycle de conformité', 'Ordonnez le cycle de conformité d’un trimestre.', ['Générer les rapports datés', 'Corriger les écarts prioritaires', 'Réattester les évaluations manuelles échues', 'Revoir les exemptions', 'Archiver les preuves'], [['Ne rien conserver', 'Plus d’audit possible.']], 'Rapports, corrections, attestations, exemptions et archivage.'),
  SH('d07-ev7', 'eval', 'comprendre', c2, 'Rythme en heures', 'Environ toutes les combien d’heures les évaluations de conformité s’exécutent-elles ? (nombre)', ['12'], 'Environ toutes les douze heures.', 12),
  Q('d07-ev8', 'eval', 'cout', c1, 'Plans et conformité', 'Quel plan faut-il pour ouvrir les standards additionnels sans dépenser pour Servers ?', ['Au moins un plan payant éligible autre que Servers P1 ou API P1.', 'Choisir le moins coûteux adapté au besoin.'], [['Aucun.', 'Faux.'], ['Servers P1.', 'Exclu.'], ['API P1.', 'Exclu.']], 'Un plan payant éligible suffit.'),

  IN('d07-cs1', 'case', 'verifier', c3, 'Cas : dossier d’audit chez Nordlys', 'Dossier fictif : repérez les affirmations à corriger.', 'text', [['« Nous sommes certifiés puisque le tableau de bord est vert. »', 'Conformité technique, pas certification', 'Garder tel quel'], ['« Rapport sans date ni périmètre. »', 'Dater et délimiter', 'Garder tel quel'], ['« Le rapport Azure prouve notre conformité. »', 'Il porte sur la plateforme Microsoft', 'Garder tel quel']], 'Chaque affirmation est corrigée.'),
  MT('d07-cs2', 'case', 'fonctionner', c1, 'Cas : accès à la conformité', 'Associez chaque rôle à ce qu’il permet.', [['Reader', 'Lire les données de conformité Azure Policy'], ['Policy Contributor', 'Ajouter un standard'], ['Security Reader', 'Lire les recommandations sans les données de politique']], 'Chaque rôle a une portée précise.'),
  WF('d07-cs3', 'case', 'securiser', c2, 'Cas : contrôle grisé et attestation', 'Ordonnez le traitement d’un contrôle de procédure.', ['Confirmer que le contrôle est non évalué', 'Identifier le responsable du processus', 'Rassembler la preuve datée', 'Attester dans le portail', 'Planifier la prochaine revue'], [['Le déclarer conforme sans preuve', 'Inacceptable pour un audit.']], 'On confirme, identifie, prouve, atteste et planifie.'),
  OP('d07-cs-open', 'case', 'verifier', c3, 'Cas : programme de conformité de Nordlys', 'Rédigez le programme de conformité d’une organisation fictive.', 'Une page : standards et étendues, rôles, rythme de rapports, attestations, export continu, limites énoncées.', [['Les standards et étendues sont justifiés.', 'comprendre'], ['Les attestations ont preuve et revue.', 'securiser'], ['Les rapports sont datés et délimités.', 'verifier'], ['Les limites sont énoncées.', 'maintenir']], 'Le programme relie standards, preuves, rapports et limites.'),

  Q('d07-rm1', 'remediation', 'comprendre', c1, 'Remédiation : standard par défaut', 'Quel standard est affiché par défaut ?', ['Le MCSB.', 'Par défaut.'], [['PCI.', 'Additionnel.'], ['HIPAA.', 'Additionnel.'], ['Aucun.', 'Faux.']], 'Le MCSB.'),
  Q('d07-rm2', 'remediation', 'verifier', c2, 'Remédiation : grisé', 'Un contrôle grisé est-il conforme ?', ['Non, il n’est pas évalué.', 'Ni conforme ni non conforme.'], [['Oui.', 'Faux.'], ['Seulement le lundi.', 'Faux.'], ['Oui pour AWS.', 'Faux.']], 'Non évalué.'),
  Q('d07-rm3', 'remediation', 'securiser', c3, 'Remédiation : certification', 'Le tableau de bord vaut-il certification ?', ['Non.', 'Technique et partielle.'], [['Oui.', 'Faux.'], ['Oui à 100 %.', 'Faux.'], ['Oui si payant.', 'Faux.']], 'Non.'),
];

const competencies = comps([
  ['Affecter et délimiter les standards', 'Prérequis, étendue, portails.', ['Je nomme les prérequis de plan et de rôle.', 'Je choisis l’étendue.', 'Je sais pourquoi un standard peut être absent.']],
  ['Lire et attester les contrôles', 'Contrôles, grisés, attestations.', ['Je distingue Your Actions et Microsoft Actions.', 'Je ne compte pas les grisés comme conformes.', 'J’atteste avec preuve et date.']],
  ['Produire des preuves honnêtes', 'Rapports, export, limites.', ['Je choisis le bon livrable.', 'J’automatise le suivi.', 'J’énonce les limites.']],
]);

const projects = [
  P(1, 'débutant', 'Plan d’affectation des standards', 'Choisir standards et étendues pour une organisation fictive.', 'Tableau standard, étendue, plan, rôle.', ['Lister les standards.', 'Choisir les étendues.', 'Vérifier les prérequis.'], ['Chaque standard a étendue et prérequis.'], ['Affecter à des étendues vides.'], ['Ajouter AWS et GCP.']),
  P(2, 'intermédiaire', 'Dossier de preuves trimestriel', 'Concevoir un dossier trimestriel avec rapports datés, attestations et limites.', 'Dossier type avec cartouche.', ['Définir le cartouche.', 'Lister les attestations.', 'Prévoir les revues.'], ['Le dossier est vérifiable.'], ['Remettre un rapport sans date.'], ['Ajouter l’export continu.'],
    { connected: { accounts: 'Un abonnement Azure de test avec le MCSB (aucun plan payant requis pour le lire).', permissions: 'Reader pour lire les données de conformité ; aucune écriture.', costs: 'Aucun frais attendu. Ne pas activer de plan payant.', secrets: 'Aucun secret.', cleanup: 'Aucune ressource créée.', limits: 'Lecture seule du tableau de bord et téléchargement d’un rapport MCSB. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Suivi automatisé de la conformité', 'Concevoir un suivi avec export continu, classeur et alerte sur changement d’évaluation.', 'Schéma export, Log Analytics, application logique.', ['Choisir le mode d’export.', 'Concevoir le classeur.', 'Concevoir l’alerte.', 'Prévoir la gouvernance.'], ['Le suivi est automatisé et documenté.'], ['Alertes trop bruyantes.'], ['Ajouter Purview Compliance Manager.']),
];

export const d07 = assemble({ id: 'd07', level: 2, n: 7, title: 'Conformité et standards',
  summary: 'Standards, plans et rôles requis, étendues d’affectation, contrôles et attestations, rapports PDF et CSV, rapports d’audit, export continu et limites de la conformité technique.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Constituer le dossier de conformité de Nordlys Technologies',
  caseScenario: 'Vous affectez un standard, traitez un contrôle grisé et corrigez un dossier d’audit. Données simulées.', caseMinutes: 50 });
