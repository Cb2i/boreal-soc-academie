from _lib import *
labs=[]

labs.append(L('xl13','x13','avancé','Transformer une chasse en détection personnalisée',
 'Choisir cadence et fenêtre, produire les colonnes exigées, rédiger l\'alerte et décider des actions automatiques et du cycle de vie de la règle.',
 ['Terrain de jeu KQL (contexte Defender XDR)','Éditeur de texte'],
 """La chasse du lab précédent a révélé trois clics sur une campagne d'hameçonnage. Votre responsable veut que la prochaine campagne soit détectée **sans que quelqu'un relance la requête à la main** : « fais-en une détection personnalisée ».

Vous savez qu'une mauvaise règle est pire que pas de règle : bruit, alertes illisibles, ou action automatique qui isole un poste de production à tort. Votre mandat : concevoir la règle complète, de la requête au cycle de vie.""",
 'Livrer la requête de la règle, ses paramètres (cadence, fenêtre), le gabarit d\'alerte, la décision sur les actions automatiques et le plan d\'entretien.',
 '75 min',
 [
 P('Choisir la cadence et la fenêtre','Faire correspondre la fréquence d\'exécution au risque et au coût.',
 """1. Quelle **cadence** pour cette détection : en continu (quasi temps réel), toutes les heures, toutes les 24 heures ? Justifiez par le délai de réponse voulu.
2. Quelle **fenêtre de recherche** (lookback) doit couvrir la requête pour ne pas rater un événement entre deux exécutions ?
3. Quelles requêtes ne peuvent pas s'exécuter en continu (jointures, opérateurs non pris en charge) ?
4. Quel est le risque d'alertes en double si la fenêtre chevauche l'exécution précédente ?""",
 """Un clic sur un lien d'hameçonnage mérite une réponse rapide : exécution **toutes les heures** au minimum, avec une fenêtre un peu plus large que la cadence (par exemple 1 h 30) pour absorber les retards d'ingestion, et une déduplication. Le mode continu est limité aux requêtes qui n'utilisent que certaines opérations sur une seule table : une jointure entre messagerie et réseau n'en fait pas partie. Les doublons se gèrent par une clé stable.""",
 'Votre choix de cadence et de fenêtre est justifié par un délai de réponse.'),
 P('Écrire la requête et ses colonnes','Produire des colonnes stables pour que la règle crée des alertes lisibles.',
 """Reprenez la chasse et faites-en une requête de règle. Elle doit :

1. se limiter à la fenêtre voulue ;
2. dédupliquer par personne et appareil (une seule alerte par couple) ;
3. produire des colonnes explicites : **Timestamp**, appareil, compte, domaine, délai, adresse du destinataire ;
4. rester lisible.

Voici une base à améliorer :

```kql
let campagne = EmailEvents
| where Timestamp > ago(30d)
| where SenderFromDomain == "n0rdlys-login.example" and DeliveryAction == "Delivered"
| project RecipientEmailAddress, NetworkMessageId, HeureCourriel = Timestamp;
DeviceNetworkEvents
| where Timestamp > ago(30d) and RemoteUrl == "n0rdlys-login.example"
| extend Utilisateur = strcat(InitiatingProcessAccountName, "@nordlys.example")
| join kind=inner campagne on $left.Utilisateur == $right.RecipientEmailAddress
| where Timestamp > HeureCourriel
| summarize arg_max(Timestamp, *) by DeviceName, Utilisateur
| project Timestamp, DeviceName, Utilisateur, RemoteUrl, RemoteIP, NetworkMessageId, DelaiMinutes = datetime_diff("minute", Timestamp, HeureCourriel)
```

Que manquerait-il dans un vrai locataire pour que la règle puisse mapper les entités ?""",
 """La requête rend **trois lignes**, une par couple appareil et personne. Dans un vrai locataire, la règle exige au minimum une colonne d'**heure** et des **identifiants d'entités** (identifiant d'appareil ou de boîte de courriel, identifiant de l'événement), qui permettent de lier l'alerte aux entités et de lancer des actions de réponse. Ici, le jeu de données simplifié n'a pas tous ces identifiants : dans la table réelle, vous les ajouteriez au `project`. Le point à retenir : **si une colonne obligatoire manque, la règle ne s'enregistre pas ou ne peut pas agir**.""",
 'Votre requête rend une ligne par couple appareil et personne et vous savez quelles colonnes exiger en production.'),
 P('Rédiger le gabarit d\'alerte','Faire une alerte que l\'analyste peut traiter sans ouvrir la règle.',
 """Rédigez le gabarit : **titre**, **description** (que s'est-il passé, pourquoi c'est important), gravité, catégorie, techniques MITRE ATT&CK probables, **actions recommandées** (3 étapes), et un champ de regroupement pour éviter vingt alertes pour une campagne.

1. Quelle gravité choisir et pourquoi ?
2. Quelle technique d'attaque nommer ? Lesquelles ne sont pas prouvées ?
3. Comment éviter d'inonder la file ?""",
 """Un exemple : titre « Clic probable sur un lien d'hameçonnage de la campagne MFA » ; description : « Le poste [appareil] a contacté le domaine [domaine] [délai] minutes après la livraison du courriel [identifiant] » ; gravité moyenne (un clic n'est pas une compromission) ; technique : hameçonnage par lien (accès initial), sans conclure à l'exécution de code ; actions : vérifier la session et le poste, réinitialiser la session, rechercher d'autres destinataires. Le regroupement par campagne évite de multiplier les incidents.""",
 'Votre gabarit permet à un analyste d\'agir sans lire la requête.'),
 P('Décider des actions et du cycle de vie','Décider quoi automatiser, qui peut modifier la règle et comment l\'entretenir.',
 """1. Pour cette règle, quelles **actions automatiques** autorisez-vous (collecter un paquet d'investigation, mettre le courriel en quarantaine, isoler l'appareil, désactiver le compte) ? Justifiez le niveau d'automatisation pour chacune.
2. Qui peut **créer, modifier, désactiver** la règle ? Comment l'audite-t-on ?
3. Comment mesurez-vous la qualité (bruit, vrais positifs) et quand révisez-vous ?
4. Comment testez-vous avant la production ?""",
 """Un équilibre : automatiser la **collecte de preuves** et la **mise en quarantaine du courriel** (réversibles) ; **ne pas** automatiser l'isolement d'un appareil ni la désactivation d'un compte sur un seul signal. Permissions : seule l'équipe d'ingénierie de détection modifie les règles, avec revue par un pair et trace dans le journal d'audit. Qualité : tableau mensuel du nombre d'alertes, des vrais positifs et du temps de traitement, avec une révision trimestrielle. Test : exécuter la requête sur l'historique et sur un jeu simulé avant d'activer.""",
 'Vous avez refusé au moins une action automatique avec une raison, et défini une revue.'),
 ],
 ['La requête de la règle.','Le choix de cadence et de fenêtre.','Le gabarit d\'alerte.','Le plan d\'actions et de cycle de vie.'],
 ['La requête produit une ligne par couple appareil et personne.','Aucune action destructrice n\'est automatique sur un seul signal.','La règle a un propriétaire et une revue.'],
 ['Oublier les colonnes obligatoires.','Automatiser l\'isolement trop tôt.','Ne jamais réviser une règle.'],
 ['Ajouter une exception documentée pour les simulations d\'hameçonnage autorisées.','Mesurer le délai de détection avant et après la règle.'],
 mode='tenant', connected=dict(accounts='Un locataire de test avec Defender XDR et des données de test.',permissions='Un rôle permettant de gérer les règles de détection personnalisées dans le locataire de test.',costs='Licences de test à votre charge.',secrets='Aucun secret.',cleanup='Désactiver puis supprimer la règle de test.',limits='Facultatif. N\'activez jamais une action automatique de réponse en production pour un exercice.')))

labs.append(L('xl14','x14','avancé','Brancher Defender à Sentinel et automatiser avec garde-fous',
 'Choisir le bon canal (connecteur, streaming, API), concevoir une application avec le moindre privilège, estimer le volume et gouverner l\'automatisation.',
 ['Terrain de jeu KQL (contexte Defender XDR)','Tableur'],
 """Nordlys a déjà Microsoft Sentinel pour les journaux Azure. L'équipe veut maintenant que les incidents de Defender XDR y apparaissent, que certains événements bruts y soient conservés au-delà de 30 jours, et qu'un script ouvre des tickets automatiquement. Le directeur financier demande : « Ça va nous coûter combien en ingestion ? »

Votre mandat : choisir les canaux, concevoir l'accès programmatique sans secret dans le dépôt, estimer le volume avec les données du terrain de jeu et définir les garde-fous de l'automatisation.""",
 'Livrer le choix des canaux justifié, la conception de l\'application avec ses permissions, l\'estimation de volume et les garde-fous de l\'automatisation.',
 '90 min',
 [
 P('Choisir les canaux','Associer chaque besoin au bon canal d\'intégration.',
 """À partir du tableau « Besoins », choisissez pour chacun : **connecteur Sentinel** (incidents et alertes, éventuellement événements bruts), **API de streaming** (vers un hub d'événements ou un compte de stockage), ou **API REST** (lecture ou action programmatique).

1. Quel canal pour voir les incidents Defender dans Sentinel ?
2. Quel canal pour conserver les événements bruts un an ?
3. Quel canal pour le script de création de tickets ?
4. Quelle conséquence de coût pour chaque choix ?""",
 """Un choix : incidents dans Sentinel → **connecteur Defender XDR** (les incidents et alertes sont synchronisés, ne les traitez pas aux deux endroits) ; événements bruts sur un an → **streaming** vers un stockage peu coûteux ou connecteur avec sélection des tables, en mesurant l'ingestion ; création de tickets → **API REST** avec une application dédiée. Coût : l'ingestion des événements bruts dans Sentinel est facturée au volume, alors que les incidents et alertes sont gratuits à l'ingestion selon la documentation consultée (à vérifier).""",
 'Chaque besoin a un canal et un effet de coût.'),
 P('Concevoir l\'application et ses permissions','Donner à l\'automatisation seulement le droit de faire ce qu\'elle doit faire.',
 """Concevez l'inscription d'application pour le script de tickets :

1. quelles **permissions applicatives** minimales (lecture des incidents seulement) ;
2. **certificat** ou secret client ? Où le conserver ?
3. qui est propriétaire, quelle date d'expiration, comment est-elle renouvelée ;
4. comment surveillez-vous l'usage (journaux de connexion de l'application) ;
5. que se passe-t-il si le secret fuit ?""",
 """Principes : permission en **lecture des incidents** uniquement (jamais d'action d'isolement pour un script de tickets), **certificat** préféré à un secret, conservé dans un coffre de clés, jamais dans le dépôt ni dans une variable d'environnement partagée. Propriétaire nommé, expiration courte, rappel de renouvellement. Une fuite est un incident : révoquer immédiatement, regarder l'usage récent.""",
 'Votre application a une seule permission de lecture, un certificat et un propriétaire.'),
 P('Estimer le volume','Chiffrer le tuyau avant de s\'engager sur un coût.',
 """1. Compter les événements par jour pour deux tables du jeu de données :

```kql
DeviceNetworkEvents
| summarize Evenements = count() by Jour = bin(Timestamp, 1d)
| order by Jour asc
```

```kql
DeviceProcessEvents
| summarize Evenements = count() by Jour = bin(Timestamp, 1d)
| order by Jour asc
```

2. Le jeu de données couvre 20 postes. Nordlys en a 450. Extrapolez le volume quotidien et présentez la fourchette (basse, haute).
3. Quelle table coûte le plus cher à conserver, et laquelle pourriez-vous filtrer à la source ?""",
 """Vous obtenez quelques dizaines d'événements par jour et par table pour 20 postes. Une extrapolation brute multiplie par 22 : c'est **une approximation basse** car le jeu de données est volontairement petit. Dans un vrai locataire, mesurez l'ingestion réelle avec les rapports d'usage avant de budgéter. Les tables de processus et de réseau sont les plus volumineuses ; on peut ne conserver que certaines catégories d'événements ou d'actions. Donnez toujours une **fourchette**, pas un chiffre unique.""",
 'Votre estimation est une fourchette avec ses hypothèses écrites.'),
 P('Gouverner l\'automatisation','Éviter qu\'une automatisation fasse plus que ce qui a été prévu.',
 """Le chef d'équipe propose un playbook qui isole automatiquement tout appareil lié à un incident de gravité élevée, et un assistant d'IA qui résume les incidents.

1. Quelles actions peuvent être automatiques, lesquelles exigent une **approbation humaine** ?
2. Comment limitez-vous l'effet d'une erreur (plafond d'actions, liste d'exclusion des actifs critiques) ?
3. Quelles précautions avec l'assistant d'IA (données envoyées, résumé non vérifié, responsabilité) ?
4. Quelle journalisation prouve ce que l'automatisation a fait ?""",
 """Automatique : création de ticket, enrichissement, résumé. Avec approbation : isolement, désactivation d'un compte. Plafond : pas plus de N actions par heure et jamais sur les actifs critiques. Un assistant d'IA **propose**, un humain **décide** ; le résumé doit être relu avant d'être joint à un dossier. Toute action de l'automatisation est consignée avec l'identité de l'application et l'incident d'origine.""",
 'Vous avez une liste d\'actions avec approbation humaine et un plafond.'),
 ],
 ['Le choix des canaux.','La conception de l\'application.','L\'estimation de volume en fourchette.','Les garde-fous de l\'automatisation.'],
 ['L\'application n\'a que la permission nécessaire.','L\'estimation est une fourchette.','Aucune action destructrice n\'est automatique sans approbation.'],
 ['Mettre un secret dans le dépôt.','Donner à un script de tickets le droit d\'isoler des appareils.','Budgéter avec un seul chiffre.'],
 ['Écrire un playbook de traitement avec étape d\'approbation.','Mesurer le coût réel d\'ingestion après un mois.'],
 facts=[('Besoins',['#','Besoin'],[['1','Voir les incidents de Defender dans Sentinel'],['2','Conserver les événements bruts des postes pendant un an'],['3','Créer un ticket à chaque incident de gravité élevée'],['4','Obtenir un résumé de chaque incident']])]))

labs.append(L('xl15','x15','avancé','Administrer Defender : rôles, portée, notifications et audit',
 'Concevoir un modèle d\'accès au moindre privilège, régler la portée et les notifications et enquêter sur un changement de configuration à risque.',
 ['Tableur','Éditeur de texte'],
 """Nordlys compte maintenant dix personnes qui touchent à Defender : analystes, ingénieurs, responsables TI et un consultant externe. Personne ne sait vraiment qui peut quoi. Hier, une alerte a cessé d'apparaître et quelqu'un pense qu'un paramètre a été modifié.

Votre mandat : concevoir le modèle d'accès, régler les notifications pour les bonnes personnes, puis enquêter dans le journal d'audit pour trouver le changement problématique.""",
 'Livrer le modèle de rôles et de portées, la matrice de notifications, l\'analyse du journal d\'audit avec le changement à risque, et le contrôle périodique des accès.',
 '75 min',
 [
 P('Concevoir le modèle de rôles','Donner à chaque profil les permissions utiles, rien de plus.',
 """À partir du tableau « Personnes », créez le modèle d'accès :

1. Quels **rôles** (groupes de permissions du RBAC unifié) pour chaque profil ?
2. Quelle **portée** : tous les appareils, un groupe seulement, ou les données d'un seul domaine ?
3. Le consultant externe doit-il avoir un accès permanent ou limité dans le temps ?
4. Comment gérez-vous les **rôles personnalisés** (quand les rôles intégrés sont trop larges) ?
5. Comment activer le modèle unifié sans casser les accès actuels ?""",
 """Un modèle : analystes de niveau 1 en lecture et gestion des alertes, niveau 2 avec réponse, ingénieurs de détection avec gestion des règles personnalisées, un **petit groupe** avec « autorisation et paramètres ». Le consultant reçoit un accès **limité à un groupe d'appareils et dans le temps** (accès à échéance). Rôle personnalisé quand un rôle intégré donne trop (par exemple lecture de données brutes sans gestion de la réponse). Pour l'activation du modèle unifié : inventorier les rôles existants, importer ou recréer dans le nouveau modèle, valider avec un groupe pilote, puis basculer.""",
 'Chaque profil a un rôle, une portée et le consultant a un accès limité dans le temps.'),
 P('Régler portée et notifications','Informer les bonnes personnes au bon moment sans noyer la boîte de réception.',
 """1. Créez trois règles de notification : par gravité, par groupe d'appareils, et par type d'alerte. Qui reçoit quoi ?
2. Pourquoi un courriel pour chaque alerte de faible gravité est-il une mauvaise idée ?
3. Quel paramètre « avancé » peut changer la lecture des données si on l'active ou le désactive sans prévenir (par exemple, protection contre la falsification, accès à la live response, partage de signaux entre produits) ?""",
 """Exemple : gravité élevée → courriel et message à l'équipe de garde ; serveurs critiques → le responsable de l'infrastructure ; faible gravité → rapport quotidien, pas de courriel. Les paramètres avancés **changent ce que les gens voient et peuvent faire** ; un changement sans prévenir explique les « disparitions » d'alertes. Tout changement de paramètre se consigne et se communique.""",
 'Votre matrice dit qui reçoit quoi et pourquoi.'),
 P('Enquêter dans le journal d\'audit','Retrouver qui a changé quoi, quand, et décider quoi faire.',
 """Voici un extrait du journal d'audit (voir le tableau « Journal d'audit »). Une alerte a cessé d'apparaître hier.

1. Quelle entrée explique le mieux la disparition de l'alerte ?
2. Quelles autres entrées sont **suspectes** ou à vérifier ?
3. Qui contacter, dans quel ordre, et que faire avant de rétablir le paramètre ?
4. Quelle preuve conservez-vous ?""",
 """L'entrée la plus probable : l'**ajout d'une règle de suppression large** par un compte non prévu pour cela, la veille. Autres signaux : une désactivation de la protection contre la falsification (très risqué) et un changement de rôle du consultant. Ordre : contacter le propriétaire du compte, vérifier qu'il s'agit d'un changement autorisé, **conserver une copie** du journal, puis rétablir. Ne rétablissez pas en silence : la trace est la preuve.""",
 'Vous avez identifié l\'entrée probable et nommé deux autres entrées à vérifier.'),
 P('Mettre en place le contrôle périodique','Empêcher que les privilèges s\'accumulent avec le temps.',
 """Proposez un contrôle trimestriel :

1. liste des personnes ayant chaque rôle, avec le propriétaire qui **recertifie** ;
2. liste des accès expirés ou inactifs ;
3. liste des changements de paramètres du trimestre, relue par une personne qui n'en est pas l'auteur ;
4. si Nordlys gère plusieurs locataires, comment centraliser sans donner un super-accès.""",
 """Un contrôle simple : rapport des rôles par personne, validé par les responsables, retrait des accès inutilisés depuis 90 jours, revue croisée des changements de paramètres. Pour plusieurs locataires : accès délégué par locataire, avec des rôles distincts, jamais un compte unique avec tous les droits.""",
 'Votre contrôle a un propriétaire, une fréquence et une revue croisée.'),
 ],
 ['Le modèle de rôles et de portées.','La matrice de notifications.','L\'analyse du journal d\'audit.','Le contrôle trimestriel.'],
 ['Le consultant a un accès limité dans le temps.','Le changement à risque est identifié et la trace conservée.','Le contrôle périodique a un propriétaire.'],
 ['Donner un accès global « pour dépanner ».','Rétablir un paramètre sans conserver la preuve.','Recevoir un courriel par alerte de faible gravité.'],
 ['Écrire une détection sur les changements de paramètres critiques.','Planifier une simulation de révocation d\'accès.'],
 facts=[('Personnes',['Profil','Nombre','Besoin'],[['Analyste de niveau 1','4','Trier les alertes'],['Analyste de niveau 2','3','Investiguer, répondre'],['Ingénieur de détection','1','Écrire des requêtes et des règles'],['Responsable TI','1','Voir l\'état du déploiement'],['Consultant externe','1','Auditer la configuration pendant trois semaines']]),
 ('Journal d\'audit',['Heure','Compte','Action'],[['Hier 08 h 12','svc-patch','Mise à jour d\'un groupe d\'appareils'],['Hier 10 h 40','admin.ti','Ajout d\'une règle de suppression d\'alertes pour un type d\'alerte entier'],['Hier 11 h 05','admin.ti','Désactivation de la protection contre la falsification pour un groupe'],['Hier 14 h 20','m.roy','Changement du rôle du consultant externe vers un rôle plus large'],['Hier 16 h 00','analyste2','Lecture d\'un rapport'],['Aujourd\'hui 07 h 30','svc-patch','Mise à jour d\'un groupe d\'appareils']])]))

labs.append(L('xl16','x16','avancé','Couvrir macOS, Linux, VDI et nuage gouvernemental sans angle mort',
 'Planifier le déploiement sur des plateformes variées, éviter les doublons des postes virtuels non persistants et documenter les écarts de capacité avant de les promettre.',
 ['Tableur','Éditeur de texte'],
 """Nordlys vient d'acheter une filiale qui utilise des Mac, quelques serveurs Linux, un environnement de postes virtuels non persistants pour ses centres d'appels et héberge certains projets dans un nuage souverain à fonctionnalités réduites. Le directeur demande : « Est-ce qu'on est couverts partout comme sur Windows ? »

Votre mandat : répondre honnêtement avec un **plan par plateforme** et une **fiche d'écarts** : ce qui est identique, ce qui diffère, ce qu'on ne sait pas encore.""",
 'Livrer le plan de déploiement par plateforme, la stratégie pour les postes virtuels non persistants et la fiche d\'écarts avec le niveau de certitude de chaque ligne.',
 '75 min',
 [
 P('Planifier macOS et mobile','Anticiper les permissions système et l\'outil de gestion.',
 """Pour les 30 Mac de la filiale :

1. Quel outil de gestion des appareils déploiera l'agent ?
2. Quelles **autorisations système** doivent être accordées en amont (accès complet au disque, extension système, extension réseau) et comment éviter que chaque utilisateur doive cliquer ?
3. Comment vérifier que l'agent est **sain**, pas seulement installé ?
4. Quelles fonctions sont différentes de Windows (limites à noter) ?""",
 """Éléments : déploiement par l'outil de gestion (Intune, Jamf) avec des profils de configuration qui **pré-approuvent** les extensions et l'accès complet au disque, sans quoi la protection est partielle ; vérification de l'état de santé de l'agent depuis le portail et sur l'appareil (`mdatp health`) ; les fonctions diffèrent (par exemple, certaines règles de réduction de la surface d'attaque ne sont pas disponibles). Notez chaque différence dans la fiche d'écarts, avec la date de lecture de la documentation.""",
 'Votre plan pré-approuve les autorisations et vérifie la santé de l\'agent.'),
 P('Planifier Linux','Choisir une méthode d\'installation et d\'exploitation reproductible.',
 """Pour cinq serveurs Linux :

1. Comment vérifier que la **distribution et la version** sont prises en charge ?
2. Quelle méthode d'installation et de configuration (dépôt de paquets, outil d'automatisation, fichier de configuration géré) ?
3. Quelles commandes de vérification donnez-vous à l'exploitant ?
4. Que se passe-t-il pour les performances : comment tester sur un serveur non critique d'abord ?""",
 """Vérification de la matrice de distributions prises en charge **avant** d'engager une date ; installation par le dépôt de paquets avec un outil d'automatisation ; configuration par un fichier géré ; commandes de contrôle comme `mdatp health` et `mdatp threat list` ; test de performance sur un serveur de préproduction avant le déploiement général. Si une distribution n'est pas prise en charge, c'est un **écart à documenter**, pas un détail à ignorer.""",
 'Votre plan vérifie la distribution avant de s\'engager et teste en préproduction.'),
 P('Traiter les postes virtuels non persistants','Éviter les doublons et les angles morts des images réinitialisées.',
 """Le centre d'appels a 200 postes virtuels réinitialisés chaque soir à partir d'une image dorée.

1. Quel problème pose une intégration classique sur l'image (identifiants d'appareil en double, appareils fantômes) ?
2. Quelle méthode d'intégration et quelle convention de nommage ?
3. Comment gérez-vous les mises à jour de signatures et l'**analyse** sur l'image ?
4. Comment mesurer le nombre d'appareils réels et le nettoyer dans le portail ?""",
 """Une intégration classique sur l'image crée un identifiant unique répété : on utilise la **méthode prévue pour les environnements non persistants**, avec un nom d'appareil cohérent pour éviter les doublons. Les mises à jour sont intégrées à l'image mise à jour régulièrement, et l'analyse est planifiée hors des pics. Pour mesurer : comparer le nombre d'appareils du portail avec le nombre réel de postes actifs, et mettre en place un nettoyage des appareils inactifs.""",
 'Votre stratégie évite les doublons et mesure le nombre réel d\'appareils.'),
 P('Rédiger la fiche d\'écarts','Dire clairement ce qui diffère et ce qu\'on ne sait pas.',
 """Remplissez la **fiche d'écarts** : une ligne par capacité et par environnement (Windows commercial, macOS, Linux, VDI, nuage souverain). Colonnes : **disponible**, **limites connues**, **niveau de certitude** (documenté, non vérifié), **date**, **source**.

1. Pour le nuage souverain, quelles capacités vérifiez-vous une par une plutôt que de présumer l'équivalence ?
2. Quelle phrase donnez-vous au directeur ?""",
 """Principe : un même produit **se comporte différemment** d'un nuage à l'autre. Il faut vérifier la disponibilité de chaque fonction dans la documentation de l'environnement concerné. Phrase : « Nous couvrons Windows pleinement. Pour macOS, Linux et le nuage souverain, la couverture existe avec des écarts documentés dans cette fiche. Les lignes marquées “non vérifié” ne sont pas des promesses. » C'est honnête et défendable.""",
 'Votre fiche indique une certitude et une date pour chaque ligne.'),
 ],
 ['Le plan par plateforme.','La stratégie pour les postes virtuels non persistants.','La fiche d\'écarts avec niveaux de certitude.'],
 ['Les autorisations macOS sont pré-approuvées.','La distribution Linux est vérifiée avant l\'engagement.','Chaque écart a une certitude et une date.'],
 ['Promettre l\'équivalence avec Windows.','Intégrer l\'image dorée comme un poste ordinaire.','Ne pas vérifier la santé de l\'agent.'],
 ['Ajouter la couverture des appareils mobiles.','Planifier la revue de la fiche à chaque mise à jour de la documentation.'],
 facts=[('Plateformes de la filiale',['Plateforme','Quantité','Gestion'],[['macOS','30','Aucune pour l\'instant'],['Linux (distributions variées)','5','Scripts manuels'],['Postes virtuels non persistants','200','Image dorée, réinitialisée chaque soir'],['Projets hébergés dans un nuage souverain','3','Gérés par un fournisseur']])]))

emit('src/msec/xdr/labs4.ts','XDR_LABS_4',labs)
