from _lib import *
labs=[]

labs.append(L('xl01','x01','débutant','Dossier de cadrage Defender XDR pour Nordlys',
 'Cadrer ce que Defender XDR couvre pour Nordlys : classer les capacités demandées par nature, lire un incident de bout en bout et définir qui accède à quoi.',
 ['Terrain de jeu KQL (contexte Defender XDR)','Tableur ou éditeur de texte'],
 """**Nordlys Technologies** est une entreprise fictive de 450 personnes (postes Windows 11, quelques serveurs, un domaine Active Directory hybride). Le directeur de la sécurité, Marc-André, vient de recevoir une offre de licences Microsoft et la phrase suivante de son comité : « Avec Defender XDR, on devrait tout voir et tout bloquer. »

Il vous demande un **dossier de cadrage** de deux pages avant la prochaine rencontre : ce qui est réellement couvert, ce qui demande une licence ou un déploiement supplémentaire, comment un analyste lit un incident, et qui aura quel accès. Le comité est enthousiaste mais n'a jamais ouvert le portail.""",
 'Produire le dossier de cadrage : un tableau de dix capacités classées par nature, la reconstitution d\'un incident d\'hameçonnage à partir des données du terrain de jeu, un plan d\'accès pour trois profils et une section « limites » honnête.',
 '60 à 90 min',
 [
 P('Classer dix capacités demandées','Distinguer ce qui est natif, intégré, dépendant d\'un autre déploiement, soumis à une licence supplémentaire ou non pris en charge.',
 """Pour chacune des dix capacités du tableau « Demandes du comité », écrivez dans votre tableur quatre colonnes : **produit porteur**, **nature** (native, intégration, dépendance, licence supplémentaire, non prise en charge), **prérequis** et **où la voir dans le portail**.

1. Commencez par le produit : quel produit Defender produit réellement ce signal ?
2. Demandez-vous ensuite ce qui doit exister pour que le signal arrive : un agent, un capteur, un connecteur, une licence ?
3. Si vous hésitez entre « dépendance » et « licence supplémentaire », posez la question : « est-ce que l'acheteur doit déployer quelque chose, ou payer pour quelque chose ? »
4. Notez une colonne **incertitude** quand la documentation ne tranche pas : ne devinez pas.""",
 """Un classement défendable (à adapter à votre lecture de la documentation consultée, qui évolue) :

| Capacité | Produit | Nature | Prérequis |
|---|---|---|---|
| Détection et réponse sur postes Windows | Defender for Endpoint | native | appareil intégré (onboarding) |
| Détection d'attaques sur Active Directory | Defender for Identity | dépendance | capteur sur les contrôleurs de domaine |
| Threat Explorer complet | Defender for Office 365 | licence supplémentaire | Plan 2 |
| Découverte du shadow IT | Defender for Cloud Apps | dépendance | journaux réseau ou intégration Endpoint |
| Chasse avancée sur 30 jours | portail Defender | native | rétention limitée à 30 jours |
| Corrélation avec les journaux Azure | Microsoft Sentinel | intégration | espace de travail et coûts d'ingestion distincts |
| Contrôle de session des applications SaaS | Defender for Cloud Apps | dépendance | accès conditionnel (Entra ID P1) |
| Correction de vulnérabilités avancée | Vulnerability Management | licence supplémentaire | module complémentaire selon la licence |
| Protection des postes Linux | Defender for Endpoint | dépendance | agent déployé et configuré |
| « Tout bloquer automatiquement » | aucun | non prise en charge | une protection se configure par politique |

Retenez surtout la dernière ligne : aucun produit ne « bloque tout » sans configuration, exclusions et validation.""",
 'Votre tableau a une nature et un prérequis pour chaque ligne, et au moins une incertitude notée honnêtement.'),
 P('Lire un incident d\'hameçonnage','Reconstituer une histoire d\'attaque à partir de plusieurs tables, sans conclure trop vite.',
 """Ouvrez le terrain de jeu en mode Defender XDR avec les blocs ci-dessous. Chaque bloc a un bouton qui l'ouvre directement. Notez ce que chaque résultat vous apprend, en une phrase.

1. Retrouvez la campagne : tous les courriels venant du domaine suspect et ce qui leur est arrivé.

```kql
EmailEvents
| where SenderFromDomain == "n0rdlys-login.example"
| project Timestamp, NetworkMessageId, RecipientEmailAddress, DeliveryAction, DeliveryLocation, ThreatTypes
| order by Timestamp asc
```

2. Cherchez qui a réellement contacté ce domaine depuis un poste.

```kql
DeviceNetworkEvents
| where RemoteUrl == "n0rdlys-login.example"
| project Timestamp, DeviceName, InitiatingProcessAccountName, InitiatingProcessFileName, ActionType
| order by Timestamp asc
```

3. Comparez : combien de destinataires ont reçu le courriel, combien ont été bloqués, combien ont cliqué ? Une différence entre ces trois chiffres est l'histoire à raconter.""",
 """Vous devriez voir :

- une campagne de plusieurs courriels depuis `n0rdlys-login.example`, dont certains **bloqués et mis en quarantaine** (verdict Phish) et d'autres **livrés** à la boîte de réception ;
- des connexions réseau vers ce domaine depuis des postes, qui prouvent qu'au moins un clic a abouti.

Une lecture correcte : « La protection a arrêté une partie de la campagne. Les courriels livrés ont été ouverts et au moins un poste a contacté le domaine. L'incident n'est pas terminé tant qu'on n'a pas vérifié l'identité de la personne et l'activité du poste après le clic. » Ce que les requêtes **ne prouvent pas** : que le mot de passe a été saisi, ou qu'il y a eu compromission.""",
 'Vous pouvez dire en trois phrases ce qui est prouvé, ce qui est probable et ce qui reste à vérifier.'),
 P('Définir l\'accès de trois profils','Appliquer le moindre privilège avec le RBAC unifié sans donner « Administrateur de la sécurité » à tout le monde.',
 """Nordlys aura trois profils : **Analyste de niveau 1** (trie les alertes), **Analyste de niveau 2** (investigue et répond), **Ingénieur de détection** (écrit des requêtes et des règles). Pour chaque profil, proposez :

1. les groupes de permissions du RBAC unifié nécessaires (sécurité opérationnelle, posture, autorisation et paramètres) ;
2. ce qu'il peut faire de **sensible** (isoler un appareil, exécuter une live response, gérer des règles de détection personnalisées) et qui l'approuve ;
3. la portée : tous les appareils ou un groupe seulement ?
4. un rôle d'urgence distinct, exclu des usages quotidiens.""",
 """Un plan raisonnable :

- **Niveau 1** : lecture des données de sécurité et gestion des alertes. Pas d'action de réponse destructive, pas de live response.
- **Niveau 2** : ce qui précède, plus réponse (isolement, collecte, antivirus) et live response de base. Les actions avancées sont soumises à approbation.
- **Ingénieur de détection** : lecture des données brutes et gestion des règles personnalisées, sans accès aux paramètres généraux.
- Un seul petit groupe d'administrateurs détient « autorisation et paramètres », avec une revue trimestrielle.

Rappel de contexte : l'activation du RBAC unifié se planifie pour ne pas casser les accès existants, et les rôles propres à chaque produit ne disparaissent pas par magie.""",
 'Chaque profil a des permissions justifiées par une tâche, et aucun profil quotidien n\'a le droit de modifier les paramètres globaux.'),
 P('Écrire la section « limites »','Dire honnêtement ce que le portail ne fait pas, avant que quelqu\'un le suppose.',
 """Rédigez la section finale du dossier, en moins de 15 lignes, qui répond à : **qu'est-ce qui n'est pas couvert, ou pas encore ?**

1. La rétention de la chasse avancée et ce que ça implique pour une enquête de plus de 30 jours.
2. Les composantes qui exigent un déploiement avant de produire un signal.
3. Le lien avec Sentinel : ce que le portail suffit à faire, et ce que Sentinel ajoute.
4. Ce que vous n'avez pas pu vérifier, avec la date de votre lecture de la documentation.""",
 """Un exemple de texte attendu : « La chasse avancée conserve 30 jours de données : une enquête plus ancienne exige un export vers Sentinel ou un autre SIEM. Defender for Identity ne produit rien tant que les capteurs ne sont pas installés sur les contrôleurs de domaine. Threat Explorer complet suppose Defender for Office 365 Plan 2. Nous n'avons pas validé ces points sur un locataire réel : lecture de la documentation du [date]. »

Ce qui fait un bon dossier : il rend le comité plus prudent sans le décourager.""",
 'Votre section limites cite une date de lecture et au moins trois limites concrètes.'),
 ],
 ['Un tableau de dix capacités avec nature, prérequis et incertitude.','Un paragraphe « ce qui est prouvé, probable, à vérifier » sur l\'incident d\'hameçonnage.','Un plan d\'accès pour les trois profils.','Une section « limites » datée.'],
 ['Chaque capacité est classée avec un prérequis précis.','La lecture de l\'incident sépare preuve et hypothèse.','Aucun profil quotidien n\'a de droit d\'administration globale.'],
 ['Croire qu\'une licence suffit à produire un signal.','Conclure à une compromission après un simple clic.','Donner un rôle large « pour aller plus vite ».'],
 ['Ajouter une colonne « coût » après avoir consulté les tarifs actuels.','Refaire le tableau pour la filiale qui utilise un autre fournisseur de messagerie.'],
 facts=[('Demandes du comité',['#','Capacité demandée'],[['1','Détection et réponse sur les postes Windows'],['2','Détection d\'attaques sur Active Directory'],['3','Threat Explorer complet pour la messagerie'],['4','Découverte du shadow IT'],['5','Chasse avancée sur 30 jours'],['6','Corrélation avec les journaux Azure'],['7','Contrôle de session des applications SaaS'],['8','Correction de vulnérabilités avancée'],['9','Protection des postes Linux'],['10','Tout bloquer automatiquement']])]))

labs.append(L('xl02','x02','débutant','Plan de déploiement en phases pour 450 postes',
 'Planifier le déploiement de Defender : méthode d\'intégration par plateforme, connectivité, pilotes, critères de passage et vérification de l\'état réel avec des requêtes.',
 ['Terrain de jeu KQL (contexte Defender XDR)','Tableur'],
 """Nordlys veut intégrer tout son parc à Defender for Endpoint en six semaines. Le parc est hétérogène et l'équipe informatique est petite. Le service informatique a déjà **Intune** pour les postes Windows 11, **Configuration Manager** pour les serveurs et un script maison pour les rares postes macOS et Linux.

Votre mandat : proposer le **plan de déploiement** avec un pilote, des critères de passage mesurables, et une vérification que ce qui est « déployé » fonctionne vraiment.""",
 'Livrer le plan de déploiement (méthode par plateforme, phases, critères de passage) et la requête qui détecte les appareils intégrés mais silencieux.',
 '60 min',
 [
 P('Choisir la méthode par plateforme','Associer chaque groupe d\'appareils à un mode d\'intégration réaliste pour une petite équipe.',
 """À partir du tableau du parc, choisissez pour chaque ligne une méthode d'intégration et justifiez en une ligne :

1. Pour les postes Windows 11 gérés par Intune, quelle méthode industrialisable choisir ?
2. Pour les serveurs Windows, qu'est-ce qui diffère d'un poste (agent, version du système, outil de gestion) ?
3. Pour macOS et Linux, la gestion existante suffit-elle ?
4. Identifiez la ligne qui comporte un **risque de doublon ou d'angle mort**.""",
 """Une proposition raisonnable :

| Groupe | Méthode | Pourquoi |
|---|---|---|
| Windows 11 (Intune) | profil d'intégration via Intune | déjà géré, appliqué automatiquement |
| Serveurs Windows | Configuration Manager ou intégration pour serveurs | parc distinct, versions plus anciennes à vérifier |
| macOS | profil de gestion des appareils ou script, à valider au pilote | peu d'appareils, permissions système à approuver |
| Linux | script ou outil d'automatisation | agent à installer et à configurer |
| Postes virtuels non persistants | méthode dédiée aux images dorées | risque de doublons d'appareils à chaque redémarrage |

Le piège principal : les postes virtuels non persistants, qui créent des doublons si l'intégration n'est pas conçue pour eux. Vérifiez toujours la version du système et la documentation de la plateforme avant d'engager une date.""",
 'Chaque groupe a une méthode, et le risque de doublon est nommé.'),
 P('Décider de la connectivité','Comprendre ce que change la connectivité rationalisée et ce qui doit être autorisé sur le réseau.',
 """Le réseau de Nordlys passe par un proxy qui filtre par domaine. Rédigez la note de connectivité :

1. Que doit vérifier l'équipe réseau **avant** le pilote ?
2. Quand envisager la connectivité rationalisée (Streamlined) plutôt que la connectivité Standard ?
3. Quel test simple prouve qu'un poste du pilote communique ?
4. Que faire si le test échoue sur un seul site ?""",
 """Éléments attendus : une liste de destinations autorisées tirée de la documentation actuelle (elle change, ne copiez pas une ancienne liste), un test de connectivité depuis un poste pilote, la vérification que le proxy n'inspecte pas ni ne casse le trafic de l'agent, et une décision documentée entre Standard et rationalisée selon la version des agents et la complexité des règles du proxy. Si un seul site échoue, on compare avec un site qui fonctionne (proxy, VLAN, règle) avant de toucher à l'agent.""",
 'Votre note nomme un test de connectivité et une personne responsable de la liste de destinations.'),
 P('Définir pilote, vagues et critères de passage','Passer d\'une vague à l\'autre sur des chiffres, pas sur une impression.',
 """Proposez trois vagues : pilote (30 appareils), vague 1 et vague 2. Pour chacune :

1. quels appareils (représentatifs : un échantillon de chaque plateforme) ;
2. quelle durée d'observation ;
3. **deux critères de passage mesurables** (par exemple un pourcentage d'appareils actifs et un nombre d'incidents bloquants) ;
4. le plan de retour arrière.""",
 """Un exemple : pilote de 30 appareils sur deux semaines, passage si au moins 95 % des appareils sont actifs et si aucun incident bloquant (poste inutilisable, application métier cassée) n'est ouvert. Vague 1 : un service complet. Vague 2 : le reste. Retour arrière : désintégration par la même méthode que l'intégration, testée sur le pilote.

Un bon critère se mesure avec une requête ou un rapport, et non avec « les gens n'ont pas râlé ».""",
 'Chaque vague a deux critères mesurables et un retour arrière testé.'),
 P('Mesurer l\'état réel avec des requêtes','Trouver les appareils intégrés qui ne parlent plus, et ceux qui ne sont pas intégrés.',
 """Dans le terrain de jeu (Defender XDR), exécutez ces requêtes et interprétez-les.

1. Répartition des états :

```kql
DeviceInfo
| summarize arg_max(Timestamp, *) by DeviceName
| summarize Appareils = count() by OnboardingStatus, SensorHealthState
| order by Appareils desc
```

2. Liste des appareils à traiter en priorité :

```kql
DeviceInfo
| summarize arg_max(Timestamp, *) by DeviceName
| where OnboardingStatus != "Onboarded" or SensorHealthState != "Active"
| project DeviceName, OSPlatform, OnboardingStatus, SensorHealthState, MachineGroup
| order by SensorHealthState asc
```

3. Pour chaque ligne, proposez la première vérification : réseau, service, alimentation, doublon ou appareil retiré ?""",
 """Vous devriez voir une majorité d'appareils actifs et quelques cas à traiter : des capteurs **inactifs** (appareil intégré mais silencieux), un état « communication altérée » sur un serveur et un appareil **non intégré**. Lecture : « intégré » ne veut pas dire « protège » ; il faut mesurer l'état du capteur. Le serveur de fichiers avec communication altérée mérite une vérification réseau avant toute autre action. L'appareil non intégré est un trou de couverture, pas un bruit statistique.""",
 'Vous avez une liste d\'appareils à traiter avec une première vérification pour chacun.'),
 ],
 ['Le plan de déploiement en trois vagues.','La note de connectivité avec son test.','Les deux requêtes et l\'interprétation de leurs résultats.'],
 ['Chaque plateforme a une méthode d\'intégration justifiée.','Les critères de passage sont mesurables.','Les appareils silencieux sont distingués des appareils non intégrés.'],
 ['Considérer « intégré » comme « protégé ».','Passer à la vague suivante sans mesure.','Oublier les postes virtuels non persistants.'],
 ['Ajouter un tableau de bord de santé des capteurs.','Prévoir la procédure de retrait d\'un appareil mis hors service.'],
 facts=[('Parc de Nordlys',['Groupe','Quantité','Gestion actuelle'],[['Windows 11','410','Intune'],['Serveurs Windows','25','Configuration Manager'],['macOS','10','Script maison'],['Linux','5','Script maison'],['Postes virtuels non persistants','20','Image dorée, réinitialisée chaque soir']])],
 mode='tenant', connected=dict(accounts='Un locataire de test avec Defender for Endpoint et deux appareils de test.',permissions='Security Administrator dans le locataire de test.',costs='Licences de test à votre charge.',secrets='Aucun secret dans le dépôt.',cleanup='Retirer les appareils de test du portail et supprimer le profil d\'intégration de test.',limits='Facultatif. N\'intégrez jamais d\'appareil de production pour un exercice.')))

labs.append(L('xl03','x03','intermédiaire','Investiguer un poste et décider de la réponse',
 'Investiguer un poste suspect avec les données du terrain de jeu, choisir et justifier les actions de réponse, et concevoir les groupes d\'appareils.',
 ['Terrain de jeu KQL (contexte Defender XDR)','Éditeur de texte'],
 """Mardi, 10 h 05. Un document Word ouvert sur le poste **PC-017** a lancé un processus PowerShell. La règle de réduction de la surface d'attaque était en mode **audit** : elle a donc journalisé sans bloquer. L'analyste de niveau 1 vous appelle : « Je fais quoi ? J'isole le poste ? »

Votre mandat : investiguer, décider, **justifier** et documenter la réponse, puis proposer un modèle de groupes d'appareils pour que ce type de décision soit plus rapide la prochaine fois.""",
 'Produire une note d\'investigation de PC-017 avec la chronologie, la décision de réponse justifiée et un modèle de groupes d\'appareils.',
 '75 min',
 [
 P('Établir la chronologie du poste','Rassembler les événements du poste avant de décider quoi que ce soit.',
 """1. Listez les événements d'audit de la règle sur ce poste :

```kql
DeviceEvents
| where DeviceName startswith "PC-017"
| where ActionType startswith "Asr"
| project Timestamp, ActionType, FileName, InitiatingProcessFileName, InitiatingProcessAccountName
| order by Timestamp asc
```

2. Regardez ce qui s'est exécuté sur le poste autour de ces heures :

```kql
DeviceProcessEvents
| where DeviceName startswith "PC-017"
| where Timestamp > datetime(2026-03-11)
| project Timestamp, AccountName, FileName, ProcessCommandLine, InitiatingProcessFileName
| order by Timestamp asc
```

3. Vérifiez les connexions réseau du poste :

```kql
DeviceNetworkEvents
| where DeviceName startswith "PC-017"
| where Timestamp > datetime(2026-03-11)
| project Timestamp, ActionType, RemoteUrl, RemoteIP, InitiatingProcessFileName
| order by Timestamp asc
```

4. Écrivez la chronologie en cinq lignes maximum.""",
 """Vous devriez retrouver des événements d'audit répétés (Word qui lance un interpréteur de commandes) sur ce poste. Les journaux de processus et réseau donnent le contexte. Une chronologie utile : « À [heure], WINWORD.EXE a lancé powershell.exe à plusieurs reprises (règle en audit : rien n'a été bloqué). Connexions réseau suivantes : [résultats]. »

Ce que la chronologie ne dit pas encore : l'intention. Un macro légitime d'une application métier produit la même trace qu'un document piégé. Il faut le **contexte** : qui est la personne, quel document, quelle destination réseau.""",
 'Votre chronologie contient des heures, des processus, et une phrase sur ce qu\'elle ne prouve pas.'),
 P('Choisir les actions de réponse','Associer chaque action à son effet, son coût et son niveau d\'approbation.',
 """Dans un tableau, évaluez ces cinq actions pour PC-017 : **isoler l'appareil** (complet ou sélectif), **collecter un paquet d'investigation**, **lancer une analyse antivirus**, **restreindre l'exécution d'applications**, **ouvrir une session de live response**.

Pour chacune : effet sur l'utilisateur, effet sur la preuve, qui approuve, et si c'est réversible. Puis choisissez **l'ordre** et justifiez.""",
 """Un ordre défendable : (1) **collecter le paquet d'investigation** (n'interrompt pas l'utilisateur, préserve la preuve) ; (2) **analyse antivirus** ; (3) si des indices de compromission apparaissent (connexion vers un domaine inconnu après l'exécution), **isoler** le poste (l'isolement sélectif conserve Outlook et Teams si c'est utile à l'enquête) ; (4) live response seulement avec un rôle autorisé et un but précis ; (5) restriction d'exécution en dernier recours.

Principe : on commence par ce qui préserve la preuve et ne coupe pas le travail, on **proportionne** la réponse aux indices. Isoler un poste sur un seul événement d'audit est probablement excessif ; ne rien faire après une connexion suspecte est une faute.""",
 'Votre tableau classe les actions et justifie l\'ordre en fonction des indices recueillis.'),
 P('Concevoir les groupes d\'appareils','Rendre la décision de la prochaine fois plus rapide grâce à un modèle clair.',
 """Nordlys compte 500 appareils. Proposez un modèle de groupes :

1. Quels critères (étiquettes, noms, domaine, système d'exploitation) ?
2. Dans quel **ordre** évaluer les groupes, sachant qu'un appareil n'appartient qu'à un groupe de réponse ?
3. Quel **niveau d'automatisation** par groupe (de l'approbation manuelle à la correction automatique) ?
4. Quel groupe pour les serveurs critiques ?""",
 """Exemple : groupe « Serveurs critiques » en premier (approbation manuelle pour toute action), « Postes pilotes » (automatisation élevée pour tester), « Postes » (correction automatique des menaces), puis un groupe par défaut. Les groupes sont évalués dans l'ordre, le premier qui correspond l'emporte : il faut donc trier du plus spécifique au plus général. Les accès au portail peuvent s'appuyer sur ces groupes.""",
 'Votre modèle a un ordre, un niveau d\'automatisation et une règle pour les serveurs critiques.'),
 P('Rédiger la note de décision','Laisser une trace compréhensible pour l\'analyste suivant et pour l\'audit.',
 """Rédigez une note de 10 lignes : qui, quoi, quand, **preuves consultées**, décision, **justification**, risque résiduel, prochaine vérification. Utilisez uniquement ce que vous avez réellement vu dans les requêtes.

1. Écrivez d'abord les **faits** : seulement ce que les requêtes montrent, avec les heures.
2. Écrivez ensuite l'**interprétation**, en la marquant comme telle (« probable », « possible »).
3. Terminez par la décision et la prochaine vérification, avec un nom et une heure.""",
 """Le point clé : la note sépare les faits (événements journalisés) de l'interprétation. Un exemple de risque résiduel : « Nous n'avons pas confirmé l'origine du document. La règle étant en audit, la commande a pu s'exécuter. » Une bonne note permet à quelqu'un d'autre de reprendre l'enquête sans vous appeler.""",
 'Votre note permet à un autre analyste de reprendre sans vous poser de question.'),
 ],
 ['Une chronologie de PC-017.','Un tableau d\'actions de réponse ordonné et justifié.','Un modèle de groupes d\'appareils.','Une note de décision de 10 lignes.'],
 ['La réponse est proportionnée aux indices.','Les faits et les interprétations sont séparés.','Les groupes sont ordonnés du plus spécifique au plus général.'],
 ['Isoler sans preuve.','Lancer la live response sans but ni autorisation.','Mélanger groupes de réponse et groupes de gestion.'],
 ['Ajouter une règle de détection pour ce motif.','Mesurer le temps moyen de décision.'],
 mode='tenant', connected=dict(accounts='Un locataire de test avec un appareil de test intégré.',permissions='Security Administrator dans le locataire de test.',costs='Licences de test à votre charge.',secrets='Aucun secret dans le dépôt.',cleanup='Supprimer les groupes et étiquettes de test, lever l\'isolement de l\'appareil.',limits='Facultatif. N\'isolez jamais un appareil de production pour un exercice.')))

labs.append(L('xl04','x04','intermédiaire','Déployer les règles ASR par anneaux sans casser le métier',
 'Mesurer le bruit des règles ASR en audit, décider des anneaux, encadrer les exclusions et préparer le retour arrière.',
 ['Terrain de jeu KQL (contexte Defender XDR)','Tableur'],
 """Nordlys veut passer plusieurs règles de **réduction de la surface d'attaque** (ASR) en blocage. Le service de la comptabilité utilise des macros Excel pour ses rapports et la direction a peur « que ça bloque la paie ». Les règles tournent en **audit** depuis une semaine.

Votre mandat : mesurer l'effet réel, définir les **anneaux de déploiement**, documenter les exclusions et préparer le retour arrière. Votre responsable ne signera aucun passage en blocage sans chiffres.""",
 'Livrer un plan de passage en blocage par anneaux, appuyé sur les mesures du terrain de jeu, avec registre d\'exclusions et retour arrière.',
 '75 min',
 [
 P('Mesurer le bruit en audit','Savoir quelles règles se déclenchent, sur combien d\'appareils et à cause de quel processus.',
 """1. Vue d'ensemble par règle :

```kql
DeviceEvents
| where ActionType startswith "Asr"
| summarize Evenements = count(), Appareils = dcount(DeviceName), Comptes = dcount(InitiatingProcessAccountName) by ActionType
| order by Evenements desc
```

2. Détail des déclenchements pour la règle « Office lance un processus enfant » :

```kql
DeviceEvents
| where ActionType == "AsrOfficeChildProcessAudited"
| summarize Evenements = count(), Appareils = dcount(DeviceName) by InitiatingProcessFileName, FileName
| order by Evenements desc
```

3. Pour chaque règle : le bruit est-il **diffus** (beaucoup d'appareils, peu d'événements) ou **concentré** (un appareil, beaucoup d'événements) ?""",
 """Vous devriez voir plusieurs règles en audit, avec des déclenchements par des applications Office qui lancent des processus. La lecture clé : un déclenchement **concentré** sur un appareil et un enchaînement Word vers PowerShell n'a pas la même signification qu'un bruit diffus de faible volume. Le premier appelle une enquête ou une exclusion ciblée, le second une communication aux utilisateurs avant le blocage.""",
 'Pour chaque règle, vous avez classé le bruit en diffus ou concentré et proposé une suite.'),
 P('Définir les anneaux de déploiement','Passer en blocage progressivement, avec des critères de passage.',
 """Proposez au moins quatre anneaux : **test** (équipe TI), **pilote** (un service tolérant), **comptabilité** (cas sensible) et **général**. Pour chaque anneau :

1. le mode (audit, avertissement si disponible, blocage) ;
2. la durée d'observation ;
3. le critère de passage chiffré ;
4. le responsable de la décision.""",
 """Exemple : test en blocage dès la semaine 1, pilote en avertissement puis blocage, comptabilité en audit prolongé avec revue des macros avant tout blocage, général en blocage une fois le pilote validé. Critère type : « zéro déclenchement non expliqué pendant sept jours ». Le responsable est un humain nommé, pas « l'équipe ».""",
 'Chaque anneau a un mode, une durée, un critère chiffré et un responsable.'),
 P('Encadrer les exclusions','Éviter que les exclusions deviennent des trous permanents.',
 """Créez le **registre d'exclusions** pour les cas justifiés (par exemple une macro de la comptabilité) avec les colonnes : règle, chemin ou processus, **portée la plus étroite possible**, raison, propriétaire, date de revue.

1. Quelles exclusions seraient dangereuses (par exemple exclure tout un dossier utilisateur) ?
2. Comment vérifier, après coup, que l'exclusion est encore nécessaire ?""",
 """Règles de bon sens : exclure un fichier précis plutôt qu'un dossier ; ne jamais exclure un interpréteur entier (PowerShell, cmd) ; une date de revue obligatoire. Pour vérifier : une requête sur les déclenchements concernés, planifiée chaque trimestre ; si plus aucun déclenchement, l'exclusion se retire.""",
 'Chaque exclusion a un propriétaire, une portée étroite et une date de revue.'),
 P('Préparer le retour arrière et la communication','Pouvoir revenir en arrière en quelques minutes et prévenir les gens.',
 """1. Décrivez la procédure de retour arrière : qui, comment, en combien de temps ?
2. Rédigez un message de 6 lignes pour les employés de la comptabilité : quoi, quand, ce qui change pour eux, à qui s'adresser.
3. Quel indicateur de bascule surveillez-vous la première semaine ?""",
 """Le retour arrière : repasser la règle en audit via la politique, avec un responsable de garde. L'indicateur : tickets au support liés à des blocages, plus une requête sur les événements de blocage. Le message : court, concret, sans jargon, avec une date et un contact.""",
 'Le retour arrière est décrit et le message aux utilisateurs est prêt à envoyer.'),
 ],
 ['Une synthèse chiffrée du bruit en audit.','Un plan d\'anneaux avec critères de passage.','Un registre d\'exclusions.','Un message aux utilisateurs et un retour arrière.'],
 ['Aucune règle ne passe en blocage sans mesure en audit.','Chaque exclusion est étroite et a une date de revue.','Le retour arrière est décrit.'],
 ['Passer en blocage sur une impression.','Exclure un dossier entier.','Oublier de prévenir un service concerné.'],
 ['Relier ce lab au scénario ASR par vagues du parcours Scénarios.','Ajouter la mesure des événements de blocage une fois en production.'],
 mode='tenant', connected=dict(accounts='Un locataire de test avec un poste Windows de test intégré à Defender for Endpoint.',permissions='Security Administrator ou Endpoint Security Manager selon la plateforme de gestion.',costs='Licences de test à votre charge.',secrets='Aucun secret dans le dépôt.',cleanup='Remettre les règles en mode par défaut et supprimer la politique de test.',limits='Facultatif. Ne passez jamais une règle en blocage sur un poste de production pour un exercice.')))

emit('src/msec/xdr/labs1.ts','XDR_LABS_1',labs)
