import type { AiProject } from '../../agentic/types.ts';

// Généré par scripts/labs/*.py : ne pas éditer à la main.
export const XDR_LABS_3: AiProject[] = [
 {
  "id": "xl09",
  "module": "x09",
  "level": "avancé",
  "title": "Gouverner le shadow IT et les applications OAuth",
  "problem": "Évaluer des applications découvertes, décider de leur statut, concevoir des politiques de détection et trancher des consentements OAuth risqués.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Terrain de jeu KQL (contexte Defender XDR)"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Comprendre d'où viennent les données de découverte",
   "Décider du statut des applications",
   "Concevoir trois politiques de détection",
   "Trancher les consentements OAuth"
  ],
  "success": [
   "Les statuts sont justifiés par des critères écrits.",
   "Les politiques démarrent en alerte seulement.",
   "Le statut « non autorisée » n'est pas présenté comme un blocage."
  ],
  "risks": [
   "Croire qu'une étiquette bloque.",
   "Activer une action automatique sans mesurer le bruit.",
   "Ne rien faire pour la personne qui a consenti."
  ],
  "extensions": [
   "Ajouter la gouvernance des applications OAuth pour mesurer les permissions inutilisées.",
   "Planifier une revue mensuelle des nouvelles applications découvertes."
  ],
  "lab": {
   "client": "Chez Nordlys, les équipes adoptent des outils SaaS sans demander la permission : outil de transfert de fichiers, assistant d'écriture, tableau de planification. La direction juridique s'inquiète de données clients dans des services non évalués. De son côté, un chef de projet vient de donner son consentement à une application tierce qui demande l'accès à ses courriels.\n\nVotre mandat : produire le **registre de gouvernance des applications** (statut, justification, action), concevoir trois politiques de détection et trancher les consentements OAuth.",
   "mission": "Livrer le registre de statut des applications, trois politiques de détection avec seuils et modes, et les décisions sur les consentements OAuth.",
   "duration": "75 min",
   "mode": "simule",
   "parts": [
    {
     "title": "Comprendre d'où viennent les données de découverte",
     "goal": "Savoir ce que l'on voit réellement et ce qui échappe à la découverte.",
     "steps": "Dans le terrain de jeu, listez les destinations les plus contactées depuis les postes. C'est une version simplifiée de ce que « Cloud Discovery » obtient avec l'intégration Defender for Endpoint ou le téléversement de journaux de proxy.\n\n```kql\nDeviceNetworkEvents\n| summarize Connexions = count(), Postes = dcount(DeviceName), Comptes = dcount(InitiatingProcessAccountName) by RemoteUrl\n| order by Connexions desc\n```\n\n1. Quelles destinations semblent être des applications SaaS à évaluer ?\n2. Quelles destinations ne seraient **pas** visibles si l'on se fiait uniquement aux journaux du proxy du siège social ?\n3. Citez les trois sources possibles de données de découverte et leur limite.",
     "expected": "Vous voyez des destinations de collaboration (Teams, Outlook), de développement (GitHub, un CDN de scripts) et de recherche. Lecture : les sites SaaS les plus fréquents ne sont pas forcément les plus risqués ; ce sont les **moins visibles et les plus sensibles** qui comptent.\n\nTrois sources : les **appareils intégrés** à Defender for Endpoint (voient le trafic partout, y compris en télétravail), les **journaux de proxy ou pare-feu** téléversés (uniquement ce qui passe par le périmètre) et les **connecteurs d'applications** (visibilité de l'intérieur de l'application). Chaque source a un angle mort : télétravail, trafic chiffré non catégorisé, applications sans connecteur.",
     "check": "Vous pouvez nommer les trois sources et un angle mort de chacune."
    },
    {
     "title": "Décider du statut des applications",
     "goal": "Classer chaque application avec des critères écrits, sans confondre statut et blocage.",
     "steps": "À partir du tableau « Applications découvertes », attribuez à chaque application un statut : **autorisée**, **non autorisée** ou **à surveiller**. Écrivez le critère utilisé.\n\n1. Quels critères (score de risque, catégorie, nombre d'utilisateurs, volume de données, conformité du fournisseur) ?\n2. Que fait réellement le statut « non autorisée » ? Bloque-t-il quelque chose par lui-même ?\n3. Pour une application non autorisée mais très utilisée, quelle alternative proposer avant de bloquer ?",
     "expected": "Un classement : l'outil de transfert de fichiers à faible score et à fort volume de données est « non autorisé » **avec une alternative approuvée** ; l'assistant d'écriture est « à surveiller » le temps d'une évaluation ; l'application de planification à bon score et conforme est « autorisée ».\n\nPoint essentiel : le statut « non autorisée » est une **étiquette**. Le blocage effectif exige une intégration avec Defender for Endpoint et la protection réseau (ou un pare-feu qui consomme la liste). Sans cela, l'étiquette n'arrête rien, et c'est une surprise fréquente.",
     "check": "Chaque application a un statut, un critère et une alternative quand elle est non autorisée."
    },
    {
     "title": "Concevoir trois politiques de détection",
     "goal": "Choisir le bon type de politique et la bonne sensibilité pour éviter le bruit.",
     "steps": "Concevez trois politiques, chacune avec : type, condition, **seuil**, portée, action (alerte seulement au début) et responsable.\n\n1. Un **téléchargement massif** de fichiers par un seul compte en peu de temps.\n2. Une **connexion anormale** (déplacement impossible ou pays inhabituel).\n3. Une **nouvelle application OAuth** avec des permissions étendues sur le courrier.\n\nPour chacune : quel est le faux positif le plus probable, et comment le réduire ?",
     "expected": "Exemple : (1) politique d'activité, seuil de 100 fichiers en 5 minutes, portée tous les utilisateurs sauf les comptes de sauvegarde, alerte seulement pendant deux semaines ; (2) détection d'anomalies intégrée, activée avec sensibilité moyenne, avec exclusion documentée des déplacements professionnels connus ; (3) politique d'application OAuth sur les permissions de lecture du courrier, avec communauté d'utilisateurs de référence.\n\nPrincipe : **alerte seulement** d'abord, mesure du bruit, puis action automatique. Les faux positifs viennent des profils particuliers (comptes de service, voyageurs).",
     "check": "Chaque politique a un seuil, une action initiale en alerte seulement et un faux positif nommé."
    },
    {
     "title": "Trancher les consentements OAuth",
     "goal": "Décider révocation, investigation ou conservation à partir de permissions et de contexte.",
     "steps": "À partir du tableau « Consentements OAuth », décidez pour chacune des quatre applications : conserver, investiguer ou révoquer. Utilisez : permissions demandées, éditeur vérifié ou non, nombre d'utilisateurs, ancienneté.\n\n1. Quelle application révoquez-vous tout de suite ?\n2. Que faites-vous pour la personne qui a donné son consentement ?\n3. Comment réduire ces cas : politique de consentement des utilisateurs, flux d'approbation par un administrateur ?",
     "expected": "Révocation immédiate de l'application qui demande la lecture complète du courrier, d'un éditeur non vérifié, avec un seul utilisateur et créée il y a peu de jours. Investigation sur celle qui a beaucoup de permissions mais un éditeur vérifié. Pour la personne : vérifier ses connexions et le courrier accédé, réinitialiser la session. À long terme : restreindre le consentement par les utilisateurs et passer par un **flux d'approbation administrateur**.",
     "check": "Vous avez une décision par application et une mesure de prévention."
    }
   ],
   "deliverables": [
    "Un registre de statut des applications.",
    "Trois politiques de détection.",
    "Quatre décisions de consentement OAuth."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Applications découvertes",
     "head": [
      "Application",
      "Catégorie",
      "Score de risque (0 à 10)",
      "Utilisateurs",
      "Données envoyées"
     ],
     "rows": [
      [
       "TransfertPlus",
       "Partage de fichiers",
       "4",
       "85",
       "Élevé"
      ],
      [
       "RédacteurIA",
       "Assistant d'écriture",
       "5",
       "40",
       "Moyen"
      ],
      [
       "PlanifieTout",
       "Gestion de projet",
       "8",
       "120",
       "Faible"
      ],
      [
       "NotesRapides",
       "Prise de notes",
       "6",
       "25",
       "Faible"
      ]
     ]
    },
    {
     "title": "Consentements OAuth",
     "head": [
      "Application",
      "Permissions",
      "Éditeur vérifié",
      "Utilisateurs",
      "Créée il y a"
     ],
     "rows": [
      [
       "MailSync Pro",
       "Lecture complète du courrier",
       "Non",
       "1",
       "3 jours"
      ],
      [
       "CalendrierExtra",
       "Lecture du calendrier",
       "Oui",
       "60",
       "14 mois"
      ],
      [
       "SignatureDoc",
       "Lecture du profil, signature",
       "Oui",
       "35",
       "8 mois"
      ],
      [
       "OutilBureau",
       "Lecture des fichiers, courrier, contacts",
       "Oui",
       "200",
       "2 ans"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "xl10",
  "module": "x10",
  "level": "avancé",
  "title": "Automatiser la réponse au risque d'identité",
  "problem": "Lire le risque des connexions, concevoir des politiques d'accès conditionnel basées sur le risque sans verrouiller l'entreprise, et gérer exclusions et comptes d'urgence.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Sentinel)",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Lire le risque observé",
   "Concevoir deux politiques basées sur le risque",
   "Prévoir exclusions et compte d'urgence",
   "Lire le risque composé avec Defender"
  ],
  "success": [
   "Les politiques démarrent en rapport seulement.",
   "Il existe deux comptes d'urgence surveillés.",
   "Le risque est présenté comme une probabilité, pas une preuve."
  ],
  "risks": [
   "Bloquer sur risque moyen sans mesure.",
   "Exclure un groupe entier sans propriétaire.",
   "Oublier de surveiller les comptes d'urgence."
  ],
  "extensions": [
   "Relier ce lab au scénario « Risque appareil et accès conditionnel » du parcours Scénarios.",
   "Ajouter un tableau de bord des utilisateurs à risque non traités."
  ],
  "lab": {
   "client": "Nordlys a des licences Entra ID P2. Le journal de connexions montre des connexions classées à **risque moyen**, surtout depuis l'étranger, et une connexion à **risque élevé**. Pour l'instant, personne ne regarde ces signaux : tout est manuel.\n\nLa direction veut automatiser : « si c'est risqué, on bloque ». Vous savez qu'un blocage trop large peut verrouiller le PDG un vendredi soir.\n\nVotre mandat : concevoir une réponse **automatique mais sûre** : politiques d'accès conditionnel basées sur le risque, mode rapport seulement, exclusions documentées et compte d'urgence.",
   "mission": "Livrer l'analyse du risque observé, deux politiques d'accès conditionnel avec plan de déploiement progressif, le traitement des exclusions et le compte d'urgence.",
   "duration": "75 min",
   "mode": "simule",
   "parts": [
    {
     "title": "Lire le risque observé",
     "goal": "Quantifier le risque avant de concevoir des politiques.",
     "steps": "1. Répartition des niveaux de risque :\n\n```kql\nSigninLogs\n| summarize Connexions = count() by RiskLevelDuringSignIn\n| order by Connexions desc\n```\n\n2. Quels comptes concentrent le risque ?\n\n```kql\nSigninLogs\n| where RiskLevelDuringSignIn in (\"medium\", \"high\")\n| summarize Connexions = count(), Pays = make_set(Location), Applications = make_set(AppDisplayName) by UserPrincipalName\n| order by Connexions desc\n```\n\n3. Les connexions à risque moyen sont-elles **diffuses** (beaucoup de comptes) ou **concentrées** ? Qu'est-ce que cela change pour le réglage d'une politique ?",
     "expected": "Vous devriez voir une majorité de connexions sans risque, un volume notable de risque moyen et une connexion à risque élevé. Si le risque moyen est concentré sur peu de comptes, c'est probablement un comportement particulier (voyage, VPN) : une politique « MFA obligatoire au risque moyen » sera tolérable. S'il est diffus, une politique de blocage créerait beaucoup de friction. Dans tous les cas, **un niveau de risque n'est pas une preuve** : c'est une probabilité calculée.",
     "check": "Vous avez une répartition et une conclusion sur la friction attendue."
    },
    {
     "title": "Concevoir deux politiques basées sur le risque",
     "goal": "Choisir des contrôles proportionnés : authentification forte au risque de connexion, changement de mot de passe au risque utilisateur.",
     "steps": "Concevez deux politiques d'accès conditionnel :\n\n1. **Risque de connexion moyen ou élevé** : quel contrôle d'accès (exiger l'authentification multifacteur, bloquer) ?\n2. **Risque utilisateur élevé** : quel contrôle (changement de mot de passe sécurisé) et quelles conditions pour que ce soit possible (méthode d'authentification forte, réécriture du mot de passe) ?\n\nPour chacune : utilisateurs concernés, applications, **exclusions**, état initial (rapport seulement) et critère pour passer à « activé ».",
     "expected": "Un design : (1) connexion à risque moyen ou plus → exiger l'authentification multifacteur ; le blocage est réservé au risque élevé avec accord de la direction ; (2) utilisateur à risque élevé → exiger un changement de mot de passe, ce qui suppose que la personne puisse s'authentifier fortement et que la réécriture de mot de passe soit en place pour les comptes synchronisés. Les deux démarrent en **mode rapport seulement** pendant deux semaines ; critère de passage : le rapport montre que l'effet serait acceptable (peu de verrouillages inattendus).",
     "check": "Chaque politique a des exclusions, un état initial en rapport seulement et un critère de passage."
    },
    {
     "title": "Prévoir exclusions et compte d'urgence",
     "goal": "Éviter le verrouillage total et garder une porte de secours surveillée.",
     "steps": "1. Quels comptes exclure (comptes d'urgence, comptes de service) et pourquoi chaque exclusion est dangereuse si elle n'est pas contrôlée ?\n2. Décrivez le **compte d'urgence** : combien, quelle authentification, où sont conservés les identifiants, comment sont-ils **surveillés** ?\n3. Que faire si une politique verrouille tout le monde un vendredi soir ?",
     "expected": "Principes : au moins **deux comptes d'urgence** exclus de toutes les politiques, avec une méthode d'authentification résistante à l'hameçonnage, des identifiants conservés hors ligne, et une **alerte à chaque connexion** de ces comptes. Pour un verrouillage : la politique se désactive avec le compte d'urgence ; le plan de retour arrière est écrit et testé à l'avance. Chaque exclusion a un propriétaire et une date de revue.",
     "check": "Votre plan a deux comptes d'urgence surveillés et un retour arrière écrit."
    },
    {
     "title": "Lire le risque composé avec Defender",
     "goal": "Comprendre comment le risque d'identité et le risque de l'appareil se combinent.",
     "steps": "Nordlys veut aussi bloquer l'accès aux applications depuis un appareil à risque élevé selon Defender for Endpoint.\n\n1. Quelle chaîne de signaux est nécessaire (Defender → conformité de l'appareil → accès conditionnel) ?\n2. Quels sont les points de panne possibles dans cette chaîne ?\n3. Comment mesurer que la chaîne fonctionne sans attendre un incident ?",
     "expected": "La chaîne : le niveau de risque de l'appareil est évalué par Defender, transmis à la gestion des appareils (conformité), puis consommé par l'accès conditionnel. Pannes possibles : capteur inactif (le risque n'est plus évalué), appareil non inscrit à la gestion, délai de synchronisation, politique de conformité sans règle de risque. Pour mesurer : un appareil de test volontairement mis à risque en environnement contrôlé et un rapport de conformité régulier.",
     "check": "Vous avez nommé la chaîne, trois pannes possibles et une façon de la tester."
    }
   ],
   "deliverables": [
    "L'analyse du risque observé.",
    "Deux politiques en mode rapport seulement.",
    "Le plan des exclusions et du compte d'urgence.",
    "La chaîne de risque composé."
   ],
   "context": "sentinel"
  }
 },
 {
  "id": "xl11",
  "module": "x11",
  "level": "intermédiaire",
  "title": "Piloter la file d'incidents : de la priorité à la clôture",
  "problem": "Prioriser une file, reconstituer un incident, décider de fusionner ou non, approuver des actions et régler le bruit sans perdre de couverture.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Tableur"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Trier la file",
   "Reconstituer l'incident principal",
   "Fusionner ou séparer",
   "Approuver les actions et régler le bruit"
  ],
  "success": [
   "L'ordre de traitement repose sur la preuve et l'activité.",
   "La chronologie est sourcée.",
   "Toute suppression est étroite et datée."
  ],
  "risks": [
   "Traiter uniquement par gravité affichée.",
   "Fusionner des incidents sans entité commune.",
   "Supprimer un motif large qui masque une vraie attaque."
  ],
  "extensions": [
   "Écrire la note de passation de garde.",
   "Mesurer le délai médian de prise en charge."
  ],
  "lab": {
   "client": "Vous êtes l'analyste de garde chez Nordlys. À 8 h, la file contient six incidents. Le niveau de gravité ne suffit pas à choisir par où commencer. L'un d'eux, « Hameçonnage suivi d'une exécution suspecte », regroupe des alertes de messagerie, de poste et d'identité.\n\nVotre mandat : **trier la file**, reconstituer l'incident principal avec une chronologie, décider des actions en attente d'approbation, et proposer des réglages qui réduisent le bruit sans masquer de vrai signal.",
   "mission": "Livrer la file triée avec justification, la chronologie de l'incident principal, les décisions sur les actions en attente et une proposition de réglage du bruit.",
   "duration": "75 min",
   "mode": "simule",
   "parts": [
    {
     "title": "Trier la file",
     "goal": "Décider de l'ordre de traitement avec des critères explicites.",
     "steps": "À partir du tableau « File d'incidents », classez les six incidents de 1 à 6. Pour chacun, écrivez le **critère déterminant** (actif critique touché, activité en cours, nombre d'identités, preuve de compromission, gravité).\n\n1. Lequel traitez-vous en premier, même si sa gravité n'est pas la plus élevée ?\n2. Lesquels peuvent attendre, et que faut-il faire pour qu'ils n'« oublient » pas ?\n3. À qui assignez-vous chaque incident ?",
     "expected": "Un classement : (1) l'incident d'hameçonnage avec exécution suspecte : activité en cours, plusieurs identités, un poste qui a contacté une destination inconnue ; (2) la force brute sur le serveur de fichiers (actif important) ; (3) les alertes de connexions à risque ; (4) le poste silencieux ; (5) l'alerte de test ; (6) le bruit de l'ASR en audit. Le principe : **preuve de compromission et activité en cours > gravité affichée**. Les incidents qui attendent reçoivent un responsable et une date de revue.",
     "check": "Vous avez un classement complet avec un critère déterminant pour chaque ligne."
    },
    {
     "title": "Reconstituer l'incident principal",
     "goal": "Construire une chronologie unique à partir de plusieurs sources.",
     "steps": "Utilisez cette requête pour fusionner messagerie et réseau pour le compte de la personne touchée sur le poste PC-017 :\n\n```kql\nunion\n (EmailEvents\n  | where RecipientEmailAddress startswith \"c.ouellet\" and Timestamp > datetime(2026-03-11)\n  | project Timestamp, Source = \"Courriel\", Detail = strcat(DeliveryAction, \" : \", Subject)),\n (DeviceNetworkEvents\n  | where InitiatingProcessAccountName == \"c.ouellet\" and Timestamp > datetime(2026-03-11)\n  | where RemoteUrl !in (\"login.microsoftonline.com\", \"teams.microsoft.com\", \"outlook.office365.com\", \"www.google.com\", \"github.com\", \"cdn.jsdelivr.net\")\n  | project Timestamp, Source = \"Réseau\", Detail = strcat(InitiatingProcessFileName, \" vers \", RemoteUrl)),\n (DeviceEvents\n  | where DeviceName startswith \"PC-017\" and ActionType startswith \"Asr\" and Timestamp > datetime(2026-03-11)\n  | project Timestamp, Source = \"Poste (audit ASR)\", Detail = strcat(InitiatingProcessFileName, \" lance \", FileName))\n| order by Timestamp asc\n```\n\nÉcrivez ensuite l'histoire en cinq lignes, avec les heures.",
     "expected": "Vous devriez voir, dans l'ordre : le courriel d'hameçonnage livré à 9 h, la connexion du navigateur vers le domaine à 9 h 12, un événement d'audit ASR sur le poste (Word lance PowerShell) à 10 h 05, puis un PowerShell qui contacte une destination inconnue à 10 h 06. L'histoire : « Courriel livré, clic, ouverture d'un document, exécution de script, appel sortant. » L'ordre est la preuve : **le script a suivi le clic de moins d'une heure**.",
     "check": "Votre histoire en cinq lignes contient les heures et la séquence clic, exécution, appel sortant."
    },
    {
     "title": "Fusionner ou séparer",
     "goal": "Comprendre comment les alertes se regroupent et quand elles ne devraient pas fusionner.",
     "steps": "On vous signale deux incidents : l'hameçonnage (A) et la force brute sur le serveur de fichiers (B). L'outil de corrélation les a gardés séparés.\n\n1. Pourquoi la corrélation pourrait-elle les avoir séparés ? Quelles entités (comptes, appareils, adresses) en commun faudrait-il pour les regrouper ?\n2. Quel est le coût d'une fusion à tort ? D'une séparation à tort ?\n3. Si Sentinel est utilisé, qu'est-ce qui change dans la gestion de ces incidents ?",
     "expected": "A et B n'ont ni compte, ni appareil, ni adresse en commun : ils sont probablement **indépendants**, et les regrouper noierait l'enquête. Fusionner à tort mélange les preuves et retarde la clôture ; séparer à tort fait perdre le lien d'une chaîne d'attaque. Avec Sentinel connecté, la file de référence est celle du portail Defender et les incidents sont synchronisés : il faut éviter de les traiter à deux endroits.",
     "check": "Vous avez justifié la séparation par l'absence d'entités communes."
    },
    {
     "title": "Approuver les actions et régler le bruit",
     "goal": "Décider des actions en attente, clôturer avec classification, et réduire le bruit proprement.",
     "steps": "1. Dans le centre d'actions, trois actions attendent : isolement de PC-017, quarantaine d'un fichier, désactivation d'un compte. Pour chacune : approuvez, rejetez, ou demandez plus d'information, avec une justification.\n2. Comment classifiez-vous le bruit de l'ASR en audit à la clôture (vrai positif, faux positif, activité informationnelle) ?\n3. Une règle de suppression est proposée pour « Office lance un processus enfant » : sous quelles conditions l'accepter ?",
     "expected": "Isolement de PC-017 : approuvé (activité en cours, appel sortant). Quarantaine du fichier : approuvée. Désactivation du compte : approuvée si la personne a été jointe ou si le risque justifie. Le bruit de l'ASR en audit est classé « activité informationnelle » avec un commentaire clair. Une suppression est acceptable **seulement** si elle est étroite (règle, appareil ou groupe, processus), datée et revue, car une suppression large masque la vraie attaque : ici le même motif a servi à la chaîne d'hameçonnage.",
     "check": "Chaque action a une décision justifiée et la suppression est étroite et datée."
    }
   ],
   "deliverables": [
    "La file triée.",
    "La chronologie de l'incident principal.",
    "Les décisions d'approbation.",
    "Une proposition de réglage du bruit."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "File d'incidents",
     "head": [
      "#",
      "Incident",
      "Gravité",
      "Alertes",
      "Entités"
     ],
     "rows": [
      [
       "A",
       "Hameçonnage suivi d'une exécution suspecte",
       "Moyenne",
       "5",
       "3 comptes, 3 postes"
      ],
      [
       "B",
       "Échecs de connexion distante sur le serveur de fichiers",
       "Faible",
       "1",
       "1 compte, 1 serveur"
      ],
      [
       "C",
       "Connexions à risque depuis l'étranger",
       "Moyenne",
       "4",
       "2 comptes"
      ],
      [
       "D",
       "Poste sans communication avec le capteur",
       "Informationnelle",
       "1",
       "1 poste"
      ],
      [
       "E",
       "Alerte de test d'un fournisseur",
       "Faible",
       "1",
       "0"
      ],
      [
       "F",
       "Événements ASR en audit",
       "Informationnelle",
       "14",
       "12 postes"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "xl12",
  "module": "x12",
  "level": "avancé",
  "title": "Mener une chasse de bout en bout et la rendre reproductible",
  "problem": "Concevoir une chasse entre courriel, poste et identité, la rendre performante et la documenter pour qu'elle devienne une détection.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Connaître les limites avant d'écrire",
   "Écrire la chasse",
   "Optimiser une première version lente",
   "Documenter et préparer la détection"
  ],
  "success": [
   "La requête filtre avant de joindre.",
   "La limite de la clé de jointure est écrite.",
   "La fiche est reproductible par un collègue."
  ],
  "risks": [
   "Joindre des tables entières.",
   "Croire que l'absence de résultat prouve l'absence d'activité.",
   "Oublier la rétention."
  ],
  "extensions": [
   "Transformer cette chasse en détection personnalisée dans le module 13.",
   "Ajouter une comparaison avec la campagne « facture »."
  ],
  "lab": {
   "client": "Votre responsable pose une question simple : « Parmi les gens qui ont reçu le faux courriel de vérification MFA, qui a cliqué, et en combien de temps ? » Il ajoute : « Je veux pouvoir relancer ça demain avec une autre campagne. »\n\nVotre mandat : écrire la chasse, l'**optimiser** (une première version écrite à la va-vite est lente), l'expliquer à un collègue et la préparer pour devenir une règle de détection.",
   "mission": "Livrer la requête de chasse optimisée, le tableau de limites de la jointure, la fiche de documentation de la chasse et la liste des colonnes à produire pour une future détection.",
   "duration": "90 min",
   "mode": "simule",
   "parts": [
    {
     "title": "Connaître les limites avant d'écrire",
     "goal": "Savoir ce que la chasse avancée contient, jusqu'où elle remonte et ce qui la limite.",
     "steps": "Avant d'écrire, notez dans une fiche :\n\n1. la **rétention** des données de chasse avancée et ce que cela implique pour une campagne vieille de 45 jours ;\n2. les **tables** nécessaires pour la question (messagerie, réseau du poste, identité) ;\n3. les **limites** d'une requête (quotas, volume de résultats) ;\n4. les **clés de jointure** disponibles et leur fiabilité (identifiant de message, adresse du destinataire, nom du compte).\n\nPuis explorez un aperçu des tables :\n\n```kql\nEmailEvents\n| summarize Messages = count(), Premier = min(Timestamp), Dernier = max(Timestamp) by DeliveryAction\n```",
     "expected": "La fiche : les données de chasse avancée sont conservées environ 30 jours : pour une campagne de 45 jours, il faut un autre stockage (Sentinel ou un lac de données). Les tables : EmailEvents (messagerie), DeviceNetworkEvents (poste), et éventuellement un journal d'identité. Les clés : l'adresse du destinataire côté courriel contre le compte côté poste n'ont **pas le même format** (il faut reconstituer l'adresse), ce qui est une source d'erreurs. Notez la limite : la clé est approximative.",
     "check": "Votre fiche nomme la rétention, les tables, les clés et une limite de fiabilité."
    },
    {
     "title": "Écrire la chasse",
     "goal": "Relier le courriel au clic avec une jointure bornée et lisible.",
     "steps": "Écrivez la chasse qui répond à la question : pour chaque destinataire d'un message **livré** de la campagne, y a-t-il eu une connexion réseau vers le domaine, et après combien de minutes ?\n\nPoint de départ :\n\n```kql\nlet campagne = EmailEvents\n| where SenderFromDomain == \"n0rdlys-login.example\" and DeliveryAction == \"Delivered\"\n| project RecipientEmailAddress, HeureCourriel = Timestamp;\nDeviceNetworkEvents\n| where RemoteUrl == \"n0rdlys-login.example\"\n| extend Utilisateur = strcat(InitiatingProcessAccountName, \"@nordlys.example\")\n| join kind=inner campagne on $left.Utilisateur == $right.RecipientEmailAddress\n| project Utilisateur, DeviceName, HeureCourriel, HeureClic = Timestamp\n| extend DelaiMinutes = datetime_diff(\"minute\", HeureClic, HeureCourriel)\n| order by DelaiMinutes asc\n```\n\nAméliorez-la : que faut-il ajouter pour exclure un « clic » antérieur à la réception du courriel ?",
     "expected": "Vous devriez obtenir **trois personnes** qui ont contacté le domaine, avec des délais d'environ 12, 27 et 56 minutes après la livraison. Amélioration : filtrer `HeureClic > HeureCourriel` après la jointure (un accès antérieur ne peut pas être causé par le courriel). Lecture : trois clics sur six livrés ; le délai le plus court est une alerte rapide à surveiller.",
     "check": "Votre requête rend trois personnes et exclut les accès antérieurs au courriel."
    },
    {
     "title": "Optimiser une première version lente",
     "goal": "Appliquer filtres précoces, projection et jointure bornée.",
     "steps": "Voici une première version écrite trop vite :\n\n```kql\nDeviceNetworkEvents\n| extend Utilisateur = strcat(InitiatingProcessAccountName, \"@nordlys.example\")\n| join kind=inner (EmailEvents) on $left.Utilisateur == $right.RecipientEmailAddress\n| where RemoteUrl == \"n0rdlys-login.example\" and SenderFromDomain == \"n0rdlys-login.example\"\n| project Utilisateur, DeviceName, Timestamp, Timestamp1\n```\n\n1. Identifiez **trois défauts** de performance ou de lisibilité.\n2. Réécrivez-la : filtres avant la jointure, colonnes réduites, fenêtre de temps explicite, résultat identique.",
     "expected": "Défauts : (1) la jointure se fait **avant** les filtres sur des tables entières ; (2) aucune colonne n'est réduite avant la jointure ; (3) aucune fenêtre de temps ; (4) des colonnes ambiguës (`Timestamp1`). Une réécriture : filtrer `DeviceNetworkEvents` par domaine et par fenêtre, filtrer `EmailEvents` par domaine et par fenêtre, projeter seulement les colonnes utiles, puis joindre. Le résultat est identique, mais le volume joint passe de milliers de lignes à une dizaine. Règle : **filtrer tôt, projeter court, joindre petit**.",
     "check": "Votre version réécrite filtre avant la jointure et donne le même résultat."
    },
    {
     "title": "Documenter et préparer la détection",
     "goal": "Rendre la chasse reproductible et préparer sa transformation en règle.",
     "steps": "Rédigez la fiche de la chasse : **question**, hypothèse, tables, requête, résultat attendu, faux positifs connus, fréquence conseillée, propriétaire.\n\nPuis listez ce qu'une **règle de détection personnalisée** exigerait en plus : colonnes obligatoires (heure, identifiant de l'appareil ou du compte), cadence d'exécution, entités mappées et actions éventuelles.",
     "expected": "Une fiche courte et exploitable : « Question : qui a contacté le domaine de la campagne après réception du courriel ? Hypothèse : le clic précède la compromission. Faux positifs : un test de sensibilisation autorisé. » Pour une détection : produire l'heure et l'identifiant stable de l'appareil ou du compte, définir la cadence et la fenêtre de recherche, et ne **pas** déclencher d'action automatique avant la validation. C'est l'objet du module suivant.",
     "check": "La fiche permet à un collègue de relancer la chasse demain sans vous demander."
    }
   ],
   "deliverables": [
    "La fiche de limites.",
    "La requête de chasse optimisée.",
    "La fiche de documentation.",
    "La liste des colonnes pour une détection."
   ],
   "context": "defender-xdr"
  }
 }
];
