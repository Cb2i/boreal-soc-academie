import type { AiProject } from '../../agentic/types.ts';

// Généré par scripts/labs/*.py : ne pas éditer à la main.
export const XDR_LABS_4: AiProject[] = [
 {
  "id": "xl13",
  "module": "x13",
  "level": "avancé",
  "title": "Transformer une chasse en détection personnalisée",
  "problem": "Choisir cadence et fenêtre, produire les colonnes exigées, rédiger l'alerte et décider des actions automatiques et du cycle de vie de la règle.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Choisir la cadence et la fenêtre",
   "Écrire la requête et ses colonnes",
   "Rédiger le gabarit d'alerte",
   "Décider des actions et du cycle de vie"
  ],
  "success": [
   "La requête produit une ligne par couple appareil et personne.",
   "Aucune action destructrice n'est automatique sur un seul signal.",
   "La règle a un propriétaire et une revue."
  ],
  "risks": [
   "Oublier les colonnes obligatoires.",
   "Automatiser l'isolement trop tôt.",
   "Ne jamais réviser une règle."
  ],
  "extensions": [
   "Ajouter une exception documentée pour les simulations d'hameçonnage autorisées.",
   "Mesurer le délai de détection avant et après la règle."
  ],
  "lab": {
   "client": "La chasse du lab précédent a révélé trois clics sur une campagne d'hameçonnage. Votre responsable veut que la prochaine campagne soit détectée **sans que quelqu'un relance la requête à la main** : « fais-en une détection personnalisée ».\n\nVous savez qu'une mauvaise règle est pire que pas de règle : bruit, alertes illisibles, ou action automatique qui isole un poste de production à tort. Votre mandat : concevoir la règle complète, de la requête au cycle de vie.",
   "mission": "Livrer la requête de la règle, ses paramètres (cadence, fenêtre), le gabarit d'alerte, la décision sur les actions automatiques et le plan d'entretien.",
   "duration": "75 min",
   "mode": "tenant",
   "parts": [
    {
     "title": "Choisir la cadence et la fenêtre",
     "goal": "Faire correspondre la fréquence d'exécution au risque et au coût.",
     "steps": "1. Quelle **cadence** pour cette détection : en continu (quasi temps réel), toutes les heures, toutes les 24 heures ? Justifiez par le délai de réponse voulu.\n2. Quelle **fenêtre de recherche** (lookback) doit couvrir la requête pour ne pas rater un événement entre deux exécutions ?\n3. Quelles requêtes ne peuvent pas s'exécuter en continu (jointures, opérateurs non pris en charge) ?\n4. Quel est le risque d'alertes en double si la fenêtre chevauche l'exécution précédente ?",
     "expected": "Un clic sur un lien d'hameçonnage mérite une réponse rapide : exécution **toutes les heures** au minimum, avec une fenêtre un peu plus large que la cadence (par exemple 1 h 30) pour absorber les retards d'ingestion, et une déduplication. Le mode continu est limité aux requêtes qui n'utilisent que certaines opérations sur une seule table : une jointure entre messagerie et réseau n'en fait pas partie. Les doublons se gèrent par une clé stable.",
     "check": "Votre choix de cadence et de fenêtre est justifié par un délai de réponse."
    },
    {
     "title": "Écrire la requête et ses colonnes",
     "goal": "Produire des colonnes stables pour que la règle crée des alertes lisibles.",
     "steps": "Reprenez la chasse et faites-en une requête de règle. Elle doit :\n\n1. se limiter à la fenêtre voulue ;\n2. dédupliquer par personne et appareil (une seule alerte par couple) ;\n3. produire des colonnes explicites : **Timestamp**, appareil, compte, domaine, délai, adresse du destinataire ;\n4. rester lisible.\n\nVoici une base à améliorer :\n\n```kql\nlet campagne = EmailEvents\n| where Timestamp > ago(30d)\n| where SenderFromDomain == \"n0rdlys-login.example\" and DeliveryAction == \"Delivered\"\n| project RecipientEmailAddress, NetworkMessageId, HeureCourriel = Timestamp;\nDeviceNetworkEvents\n| where Timestamp > ago(30d) and RemoteUrl == \"n0rdlys-login.example\"\n| extend Utilisateur = strcat(InitiatingProcessAccountName, \"@nordlys.example\")\n| join kind=inner campagne on $left.Utilisateur == $right.RecipientEmailAddress\n| where Timestamp > HeureCourriel\n| summarize arg_max(Timestamp, *) by DeviceName, Utilisateur\n| project Timestamp, DeviceName, Utilisateur, RemoteUrl, RemoteIP, NetworkMessageId, DelaiMinutes = datetime_diff(\"minute\", Timestamp, HeureCourriel)\n```\n\nQue manquerait-il dans un vrai locataire pour que la règle puisse mapper les entités ?",
     "expected": "La requête rend **trois lignes**, une par couple appareil et personne. Dans un vrai locataire, la règle exige au minimum une colonne d'**heure** et des **identifiants d'entités** (identifiant d'appareil ou de boîte de courriel, identifiant de l'événement), qui permettent de lier l'alerte aux entités et de lancer des actions de réponse. Ici, le jeu de données simplifié n'a pas tous ces identifiants : dans la table réelle, vous les ajouteriez au `project`. Le point à retenir : **si une colonne obligatoire manque, la règle ne s'enregistre pas ou ne peut pas agir**.",
     "check": "Votre requête rend une ligne par couple appareil et personne et vous savez quelles colonnes exiger en production."
    },
    {
     "title": "Rédiger le gabarit d'alerte",
     "goal": "Faire une alerte que l'analyste peut traiter sans ouvrir la règle.",
     "steps": "Rédigez le gabarit : **titre**, **description** (que s'est-il passé, pourquoi c'est important), gravité, catégorie, techniques MITRE ATT&CK probables, **actions recommandées** (3 étapes), et un champ de regroupement pour éviter vingt alertes pour une campagne.\n\n1. Quelle gravité choisir et pourquoi ?\n2. Quelle technique d'attaque nommer ? Lesquelles ne sont pas prouvées ?\n3. Comment éviter d'inonder la file ?",
     "expected": "Un exemple : titre « Clic probable sur un lien d'hameçonnage de la campagne MFA » ; description : « Le poste [appareil] a contacté le domaine [domaine] [délai] minutes après la livraison du courriel [identifiant] » ; gravité moyenne (un clic n'est pas une compromission) ; technique : hameçonnage par lien (accès initial), sans conclure à l'exécution de code ; actions : vérifier la session et le poste, réinitialiser la session, rechercher d'autres destinataires. Le regroupement par campagne évite de multiplier les incidents.",
     "check": "Votre gabarit permet à un analyste d'agir sans lire la requête."
    },
    {
     "title": "Décider des actions et du cycle de vie",
     "goal": "Décider quoi automatiser, qui peut modifier la règle et comment l'entretenir.",
     "steps": "1. Pour cette règle, quelles **actions automatiques** autorisez-vous (collecter un paquet d'investigation, mettre le courriel en quarantaine, isoler l'appareil, désactiver le compte) ? Justifiez le niveau d'automatisation pour chacune.\n2. Qui peut **créer, modifier, désactiver** la règle ? Comment l'audite-t-on ?\n3. Comment mesurez-vous la qualité (bruit, vrais positifs) et quand révisez-vous ?\n4. Comment testez-vous avant la production ?",
     "expected": "Un équilibre : automatiser la **collecte de preuves** et la **mise en quarantaine du courriel** (réversibles) ; **ne pas** automatiser l'isolement d'un appareil ni la désactivation d'un compte sur un seul signal. Permissions : seule l'équipe d'ingénierie de détection modifie les règles, avec revue par un pair et trace dans le journal d'audit. Qualité : tableau mensuel du nombre d'alertes, des vrais positifs et du temps de traitement, avec une révision trimestrielle. Test : exécuter la requête sur l'historique et sur un jeu simulé avant d'activer.",
     "check": "Vous avez refusé au moins une action automatique avec une raison, et défini une revue."
    }
   ],
   "deliverables": [
    "La requête de la règle.",
    "Le choix de cadence et de fenêtre.",
    "Le gabarit d'alerte.",
    "Le plan d'actions et de cycle de vie."
   ],
   "context": "defender-xdr"
  },
  "connected": {
   "accounts": "Un locataire de test avec Defender XDR et des données de test.",
   "permissions": "Un rôle permettant de gérer les règles de détection personnalisées dans le locataire de test.",
   "costs": "Licences de test à votre charge.",
   "secrets": "Aucun secret.",
   "cleanup": "Désactiver puis supprimer la règle de test.",
   "limits": "Facultatif. N'activez jamais une action automatique de réponse en production pour un exercice."
  }
 },
 {
  "id": "xl14",
  "module": "x14",
  "level": "avancé",
  "title": "Brancher Defender à Sentinel et automatiser avec garde-fous",
  "problem": "Choisir le bon canal (connecteur, streaming, API), concevoir une application avec le moindre privilège, estimer le volume et gouverner l'automatisation.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Tableur"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Choisir les canaux",
   "Concevoir l'application et ses permissions",
   "Estimer le volume",
   "Gouverner l'automatisation"
  ],
  "success": [
   "L'application n'a que la permission nécessaire.",
   "L'estimation est une fourchette.",
   "Aucune action destructrice n'est automatique sans approbation."
  ],
  "risks": [
   "Mettre un secret dans le dépôt.",
   "Donner à un script de tickets le droit d'isoler des appareils.",
   "Budgéter avec un seul chiffre."
  ],
  "extensions": [
   "Écrire un playbook de traitement avec étape d'approbation.",
   "Mesurer le coût réel d'ingestion après un mois."
  ],
  "lab": {
   "client": "Nordlys a déjà Microsoft Sentinel pour les journaux Azure. L'équipe veut maintenant que les incidents de Defender XDR y apparaissent, que certains événements bruts y soient conservés au-delà de 30 jours, et qu'un script ouvre des tickets automatiquement. Le directeur financier demande : « Ça va nous coûter combien en ingestion ? »\n\nVotre mandat : choisir les canaux, concevoir l'accès programmatique sans secret dans le dépôt, estimer le volume avec les données du terrain de jeu et définir les garde-fous de l'automatisation.",
   "mission": "Livrer le choix des canaux justifié, la conception de l'application avec ses permissions, l'estimation de volume et les garde-fous de l'automatisation.",
   "duration": "90 min",
   "mode": "simule",
   "parts": [
    {
     "title": "Choisir les canaux",
     "goal": "Associer chaque besoin au bon canal d'intégration.",
     "steps": "À partir du tableau « Besoins », choisissez pour chacun : **connecteur Sentinel** (incidents et alertes, éventuellement événements bruts), **API de streaming** (vers un hub d'événements ou un compte de stockage), ou **API REST** (lecture ou action programmatique).\n\n1. Quel canal pour voir les incidents Defender dans Sentinel ?\n2. Quel canal pour conserver les événements bruts un an ?\n3. Quel canal pour le script de création de tickets ?\n4. Quelle conséquence de coût pour chaque choix ?",
     "expected": "Un choix : incidents dans Sentinel → **connecteur Defender XDR** (les incidents et alertes sont synchronisés, ne les traitez pas aux deux endroits) ; événements bruts sur un an → **streaming** vers un stockage peu coûteux ou connecteur avec sélection des tables, en mesurant l'ingestion ; création de tickets → **API REST** avec une application dédiée. Coût : l'ingestion des événements bruts dans Sentinel est facturée au volume, alors que les incidents et alertes sont gratuits à l'ingestion selon la documentation consultée (à vérifier).",
     "check": "Chaque besoin a un canal et un effet de coût."
    },
    {
     "title": "Concevoir l'application et ses permissions",
     "goal": "Donner à l'automatisation seulement le droit de faire ce qu'elle doit faire.",
     "steps": "Concevez l'inscription d'application pour le script de tickets :\n\n1. quelles **permissions applicatives** minimales (lecture des incidents seulement) ;\n2. **certificat** ou secret client ? Où le conserver ?\n3. qui est propriétaire, quelle date d'expiration, comment est-elle renouvelée ;\n4. comment surveillez-vous l'usage (journaux de connexion de l'application) ;\n5. que se passe-t-il si le secret fuit ?",
     "expected": "Principes : permission en **lecture des incidents** uniquement (jamais d'action d'isolement pour un script de tickets), **certificat** préféré à un secret, conservé dans un coffre de clés, jamais dans le dépôt ni dans une variable d'environnement partagée. Propriétaire nommé, expiration courte, rappel de renouvellement. Une fuite est un incident : révoquer immédiatement, regarder l'usage récent.",
     "check": "Votre application a une seule permission de lecture, un certificat et un propriétaire."
    },
    {
     "title": "Estimer le volume",
     "goal": "Chiffrer le tuyau avant de s'engager sur un coût.",
     "steps": "1. Compter les événements par jour pour deux tables du jeu de données :\n\n```kql\nDeviceNetworkEvents\n| summarize Evenements = count() by Jour = bin(Timestamp, 1d)\n| order by Jour asc\n```\n\n```kql\nDeviceProcessEvents\n| summarize Evenements = count() by Jour = bin(Timestamp, 1d)\n| order by Jour asc\n```\n\n2. Le jeu de données couvre 20 postes. Nordlys en a 450. Extrapolez le volume quotidien et présentez la fourchette (basse, haute).\n3. Quelle table coûte le plus cher à conserver, et laquelle pourriez-vous filtrer à la source ?",
     "expected": "Vous obtenez quelques dizaines d'événements par jour et par table pour 20 postes. Une extrapolation brute multiplie par 22 : c'est **une approximation basse** car le jeu de données est volontairement petit. Dans un vrai locataire, mesurez l'ingestion réelle avec les rapports d'usage avant de budgéter. Les tables de processus et de réseau sont les plus volumineuses ; on peut ne conserver que certaines catégories d'événements ou d'actions. Donnez toujours une **fourchette**, pas un chiffre unique.",
     "check": "Votre estimation est une fourchette avec ses hypothèses écrites."
    },
    {
     "title": "Gouverner l'automatisation",
     "goal": "Éviter qu'une automatisation fasse plus que ce qui a été prévu.",
     "steps": "Le chef d'équipe propose un playbook qui isole automatiquement tout appareil lié à un incident de gravité élevée, et un assistant d'IA qui résume les incidents.\n\n1. Quelles actions peuvent être automatiques, lesquelles exigent une **approbation humaine** ?\n2. Comment limitez-vous l'effet d'une erreur (plafond d'actions, liste d'exclusion des actifs critiques) ?\n3. Quelles précautions avec l'assistant d'IA (données envoyées, résumé non vérifié, responsabilité) ?\n4. Quelle journalisation prouve ce que l'automatisation a fait ?",
     "expected": "Automatique : création de ticket, enrichissement, résumé. Avec approbation : isolement, désactivation d'un compte. Plafond : pas plus de N actions par heure et jamais sur les actifs critiques. Un assistant d'IA **propose**, un humain **décide** ; le résumé doit être relu avant d'être joint à un dossier. Toute action de l'automatisation est consignée avec l'identité de l'application et l'incident d'origine.",
     "check": "Vous avez une liste d'actions avec approbation humaine et un plafond."
    }
   ],
   "deliverables": [
    "Le choix des canaux.",
    "La conception de l'application.",
    "L'estimation de volume en fourchette.",
    "Les garde-fous de l'automatisation."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Besoins",
     "head": [
      "#",
      "Besoin"
     ],
     "rows": [
      [
       "1",
       "Voir les incidents de Defender dans Sentinel"
      ],
      [
       "2",
       "Conserver les événements bruts des postes pendant un an"
      ],
      [
       "3",
       "Créer un ticket à chaque incident de gravité élevée"
      ],
      [
       "4",
       "Obtenir un résumé de chaque incident"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "xl15",
  "module": "x15",
  "level": "avancé",
  "title": "Administrer Defender : rôles, portée, notifications et audit",
  "problem": "Concevoir un modèle d'accès au moindre privilège, régler la portée et les notifications et enquêter sur un changement de configuration à risque.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Concevoir le modèle de rôles",
   "Régler portée et notifications",
   "Enquêter dans le journal d'audit",
   "Mettre en place le contrôle périodique"
  ],
  "success": [
   "Le consultant a un accès limité dans le temps.",
   "Le changement à risque est identifié et la trace conservée.",
   "Le contrôle périodique a un propriétaire."
  ],
  "risks": [
   "Donner un accès global « pour dépanner ».",
   "Rétablir un paramètre sans conserver la preuve.",
   "Recevoir un courriel par alerte de faible gravité."
  ],
  "extensions": [
   "Écrire une détection sur les changements de paramètres critiques.",
   "Planifier une simulation de révocation d'accès."
  ],
  "lab": {
   "client": "Nordlys compte maintenant dix personnes qui touchent à Defender : analystes, ingénieurs, responsables TI et un consultant externe. Personne ne sait vraiment qui peut quoi. Hier, une alerte a cessé d'apparaître et quelqu'un pense qu'un paramètre a été modifié.\n\nVotre mandat : concevoir le modèle d'accès, régler les notifications pour les bonnes personnes, puis enquêter dans le journal d'audit pour trouver le changement problématique.",
   "mission": "Livrer le modèle de rôles et de portées, la matrice de notifications, l'analyse du journal d'audit avec le changement à risque, et le contrôle périodique des accès.",
   "duration": "75 min",
   "mode": "simule",
   "parts": [
    {
     "title": "Concevoir le modèle de rôles",
     "goal": "Donner à chaque profil les permissions utiles, rien de plus.",
     "steps": "À partir du tableau « Personnes », créez le modèle d'accès :\n\n1. Quels **rôles** (groupes de permissions du RBAC unifié) pour chaque profil ?\n2. Quelle **portée** : tous les appareils, un groupe seulement, ou les données d'un seul domaine ?\n3. Le consultant externe doit-il avoir un accès permanent ou limité dans le temps ?\n4. Comment gérez-vous les **rôles personnalisés** (quand les rôles intégrés sont trop larges) ?\n5. Comment activer le modèle unifié sans casser les accès actuels ?",
     "expected": "Un modèle : analystes de niveau 1 en lecture et gestion des alertes, niveau 2 avec réponse, ingénieurs de détection avec gestion des règles personnalisées, un **petit groupe** avec « autorisation et paramètres ». Le consultant reçoit un accès **limité à un groupe d'appareils et dans le temps** (accès à échéance). Rôle personnalisé quand un rôle intégré donne trop (par exemple lecture de données brutes sans gestion de la réponse). Pour l'activation du modèle unifié : inventorier les rôles existants, importer ou recréer dans le nouveau modèle, valider avec un groupe pilote, puis basculer.",
     "check": "Chaque profil a un rôle, une portée et le consultant a un accès limité dans le temps."
    },
    {
     "title": "Régler portée et notifications",
     "goal": "Informer les bonnes personnes au bon moment sans noyer la boîte de réception.",
     "steps": "1. Créez trois règles de notification : par gravité, par groupe d'appareils, et par type d'alerte. Qui reçoit quoi ?\n2. Pourquoi un courriel pour chaque alerte de faible gravité est-il une mauvaise idée ?\n3. Quel paramètre « avancé » peut changer la lecture des données si on l'active ou le désactive sans prévenir (par exemple, protection contre la falsification, accès à la live response, partage de signaux entre produits) ?",
     "expected": "Exemple : gravité élevée → courriel et message à l'équipe de garde ; serveurs critiques → le responsable de l'infrastructure ; faible gravité → rapport quotidien, pas de courriel. Les paramètres avancés **changent ce que les gens voient et peuvent faire** ; un changement sans prévenir explique les « disparitions » d'alertes. Tout changement de paramètre se consigne et se communique.",
     "check": "Votre matrice dit qui reçoit quoi et pourquoi."
    },
    {
     "title": "Enquêter dans le journal d'audit",
     "goal": "Retrouver qui a changé quoi, quand, et décider quoi faire.",
     "steps": "Voici un extrait du journal d'audit (voir le tableau « Journal d'audit »). Une alerte a cessé d'apparaître hier.\n\n1. Quelle entrée explique le mieux la disparition de l'alerte ?\n2. Quelles autres entrées sont **suspectes** ou à vérifier ?\n3. Qui contacter, dans quel ordre, et que faire avant de rétablir le paramètre ?\n4. Quelle preuve conservez-vous ?",
     "expected": "L'entrée la plus probable : l'**ajout d'une règle de suppression large** par un compte non prévu pour cela, la veille. Autres signaux : une désactivation de la protection contre la falsification (très risqué) et un changement de rôle du consultant. Ordre : contacter le propriétaire du compte, vérifier qu'il s'agit d'un changement autorisé, **conserver une copie** du journal, puis rétablir. Ne rétablissez pas en silence : la trace est la preuve.",
     "check": "Vous avez identifié l'entrée probable et nommé deux autres entrées à vérifier."
    },
    {
     "title": "Mettre en place le contrôle périodique",
     "goal": "Empêcher que les privilèges s'accumulent avec le temps.",
     "steps": "Proposez un contrôle trimestriel :\n\n1. liste des personnes ayant chaque rôle, avec le propriétaire qui **recertifie** ;\n2. liste des accès expirés ou inactifs ;\n3. liste des changements de paramètres du trimestre, relue par une personne qui n'en est pas l'auteur ;\n4. si Nordlys gère plusieurs locataires, comment centraliser sans donner un super-accès.",
     "expected": "Un contrôle simple : rapport des rôles par personne, validé par les responsables, retrait des accès inutilisés depuis 90 jours, revue croisée des changements de paramètres. Pour plusieurs locataires : accès délégué par locataire, avec des rôles distincts, jamais un compte unique avec tous les droits.",
     "check": "Votre contrôle a un propriétaire, une fréquence et une revue croisée."
    }
   ],
   "deliverables": [
    "Le modèle de rôles et de portées.",
    "La matrice de notifications.",
    "L'analyse du journal d'audit.",
    "Le contrôle trimestriel."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Personnes",
     "head": [
      "Profil",
      "Nombre",
      "Besoin"
     ],
     "rows": [
      [
       "Analyste de niveau 1",
       "4",
       "Trier les alertes"
      ],
      [
       "Analyste de niveau 2",
       "3",
       "Investiguer, répondre"
      ],
      [
       "Ingénieur de détection",
       "1",
       "Écrire des requêtes et des règles"
      ],
      [
       "Responsable TI",
       "1",
       "Voir l'état du déploiement"
      ],
      [
       "Consultant externe",
       "1",
       "Auditer la configuration pendant trois semaines"
      ]
     ]
    },
    {
     "title": "Journal d'audit",
     "head": [
      "Heure",
      "Compte",
      "Action"
     ],
     "rows": [
      [
       "Hier 08 h 12",
       "svc-patch",
       "Mise à jour d'un groupe d'appareils"
      ],
      [
       "Hier 10 h 40",
       "admin.ti",
       "Ajout d'une règle de suppression d'alertes pour un type d'alerte entier"
      ],
      [
       "Hier 11 h 05",
       "admin.ti",
       "Désactivation de la protection contre la falsification pour un groupe"
      ],
      [
       "Hier 14 h 20",
       "m.roy",
       "Changement du rôle du consultant externe vers un rôle plus large"
      ],
      [
       "Hier 16 h 00",
       "analyste2",
       "Lecture d'un rapport"
      ],
      [
       "Aujourd'hui 07 h 30",
       "svc-patch",
       "Mise à jour d'un groupe d'appareils"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "xl16",
  "module": "x16",
  "level": "avancé",
  "title": "Couvrir macOS, Linux, VDI et nuage gouvernemental sans angle mort",
  "problem": "Planifier le déploiement sur des plateformes variées, éviter les doublons des postes virtuels non persistants et documenter les écarts de capacité avant de les promettre.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Planifier macOS et mobile",
   "Planifier Linux",
   "Traiter les postes virtuels non persistants",
   "Rédiger la fiche d'écarts"
  ],
  "success": [
   "Les autorisations macOS sont pré-approuvées.",
   "La distribution Linux est vérifiée avant l'engagement.",
   "Chaque écart a une certitude et une date."
  ],
  "risks": [
   "Promettre l'équivalence avec Windows.",
   "Intégrer l'image dorée comme un poste ordinaire.",
   "Ne pas vérifier la santé de l'agent."
  ],
  "extensions": [
   "Ajouter la couverture des appareils mobiles.",
   "Planifier la revue de la fiche à chaque mise à jour de la documentation."
  ],
  "lab": {
   "client": "Nordlys vient d'acheter une filiale qui utilise des Mac, quelques serveurs Linux, un environnement de postes virtuels non persistants pour ses centres d'appels et héberge certains projets dans un nuage souverain à fonctionnalités réduites. Le directeur demande : « Est-ce qu'on est couverts partout comme sur Windows ? »\n\nVotre mandat : répondre honnêtement avec un **plan par plateforme** et une **fiche d'écarts** : ce qui est identique, ce qui diffère, ce qu'on ne sait pas encore.",
   "mission": "Livrer le plan de déploiement par plateforme, la stratégie pour les postes virtuels non persistants et la fiche d'écarts avec le niveau de certitude de chaque ligne.",
   "duration": "75 min",
   "mode": "simule",
   "parts": [
    {
     "title": "Planifier macOS et mobile",
     "goal": "Anticiper les permissions système et l'outil de gestion.",
     "steps": "Pour les 30 Mac de la filiale :\n\n1. Quel outil de gestion des appareils déploiera l'agent ?\n2. Quelles **autorisations système** doivent être accordées en amont (accès complet au disque, extension système, extension réseau) et comment éviter que chaque utilisateur doive cliquer ?\n3. Comment vérifier que l'agent est **sain**, pas seulement installé ?\n4. Quelles fonctions sont différentes de Windows (limites à noter) ?",
     "expected": "Éléments : déploiement par l'outil de gestion (Intune, Jamf) avec des profils de configuration qui **pré-approuvent** les extensions et l'accès complet au disque, sans quoi la protection est partielle ; vérification de l'état de santé de l'agent depuis le portail et sur l'appareil (`mdatp health`) ; les fonctions diffèrent (par exemple, certaines règles de réduction de la surface d'attaque ne sont pas disponibles). Notez chaque différence dans la fiche d'écarts, avec la date de lecture de la documentation.",
     "check": "Votre plan pré-approuve les autorisations et vérifie la santé de l'agent."
    },
    {
     "title": "Planifier Linux",
     "goal": "Choisir une méthode d'installation et d'exploitation reproductible.",
     "steps": "Pour cinq serveurs Linux :\n\n1. Comment vérifier que la **distribution et la version** sont prises en charge ?\n2. Quelle méthode d'installation et de configuration (dépôt de paquets, outil d'automatisation, fichier de configuration géré) ?\n3. Quelles commandes de vérification donnez-vous à l'exploitant ?\n4. Que se passe-t-il pour les performances : comment tester sur un serveur non critique d'abord ?",
     "expected": "Vérification de la matrice de distributions prises en charge **avant** d'engager une date ; installation par le dépôt de paquets avec un outil d'automatisation ; configuration par un fichier géré ; commandes de contrôle comme `mdatp health` et `mdatp threat list` ; test de performance sur un serveur de préproduction avant le déploiement général. Si une distribution n'est pas prise en charge, c'est un **écart à documenter**, pas un détail à ignorer.",
     "check": "Votre plan vérifie la distribution avant de s'engager et teste en préproduction."
    },
    {
     "title": "Traiter les postes virtuels non persistants",
     "goal": "Éviter les doublons et les angles morts des images réinitialisées.",
     "steps": "Le centre d'appels a 200 postes virtuels réinitialisés chaque soir à partir d'une image dorée.\n\n1. Quel problème pose une intégration classique sur l'image (identifiants d'appareil en double, appareils fantômes) ?\n2. Quelle méthode d'intégration et quelle convention de nommage ?\n3. Comment gérez-vous les mises à jour de signatures et l'**analyse** sur l'image ?\n4. Comment mesurer le nombre d'appareils réels et le nettoyer dans le portail ?",
     "expected": "Une intégration classique sur l'image crée un identifiant unique répété : on utilise la **méthode prévue pour les environnements non persistants**, avec un nom d'appareil cohérent pour éviter les doublons. Les mises à jour sont intégrées à l'image mise à jour régulièrement, et l'analyse est planifiée hors des pics. Pour mesurer : comparer le nombre d'appareils du portail avec le nombre réel de postes actifs, et mettre en place un nettoyage des appareils inactifs.",
     "check": "Votre stratégie évite les doublons et mesure le nombre réel d'appareils."
    },
    {
     "title": "Rédiger la fiche d'écarts",
     "goal": "Dire clairement ce qui diffère et ce qu'on ne sait pas.",
     "steps": "Remplissez la **fiche d'écarts** : une ligne par capacité et par environnement (Windows commercial, macOS, Linux, VDI, nuage souverain). Colonnes : **disponible**, **limites connues**, **niveau de certitude** (documenté, non vérifié), **date**, **source**.\n\n1. Pour le nuage souverain, quelles capacités vérifiez-vous une par une plutôt que de présumer l'équivalence ?\n2. Quelle phrase donnez-vous au directeur ?",
     "expected": "Principe : un même produit **se comporte différemment** d'un nuage à l'autre. Il faut vérifier la disponibilité de chaque fonction dans la documentation de l'environnement concerné. Phrase : « Nous couvrons Windows pleinement. Pour macOS, Linux et le nuage souverain, la couverture existe avec des écarts documentés dans cette fiche. Les lignes marquées “non vérifié” ne sont pas des promesses. » C'est honnête et défendable.",
     "check": "Votre fiche indique une certitude et une date pour chaque ligne."
    }
   ],
   "deliverables": [
    "Le plan par plateforme.",
    "La stratégie pour les postes virtuels non persistants.",
    "La fiche d'écarts avec niveaux de certitude."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Plateformes de la filiale",
     "head": [
      "Plateforme",
      "Quantité",
      "Gestion"
     ],
     "rows": [
      [
       "macOS",
       "30",
       "Aucune pour l'instant"
      ],
      [
       "Linux (distributions variées)",
       "5",
       "Scripts manuels"
      ],
      [
       "Postes virtuels non persistants",
       "200",
       "Image dorée, réinitialisée chaque soir"
      ],
      [
       "Projets hébergés dans un nuage souverain",
       "3",
       "Gérés par un fournisseur"
      ]
     ]
    }
   ]
  }
 }
];
