import type { AiProject } from '../../agentic/types.ts';

// Généré par scripts/labs/*.py : ne pas éditer à la main.
export const INTUNE_FINAL_LABS: AiProject[] = [
 {
  "id": "if01",
  "module": "final",
  "level": "intermédiaire",
  "title": "Socle de sécurité Windows pour un parc fictif",
  "problem": "Concevoir le socle de sécurité d'un parc Windows de 300 postes avec la fiche de configuration en 21 points, en distinguant politique créée, assignée, reçue et protection opérationnelle.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Fiche de configuration en 21 points (fournie dans ce lab)"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Choisir le mécanisme de chaque point",
   "Définir le ciblage et les vagues",
   "Écrire la preuve des quatre états",
   "Nommer les risques résiduels et les écarts"
  ],
  "success": [
   "Chaque domaine a un mécanisme, un ciblage et une preuve.",
   "Les quatre états sont distingués pour chaque politique.",
   "Les écarts sont nommés avec une alternative ou un risque accepté."
  ],
  "risks": [
   "Prendre un tableau de bord vert pour une protection.",
   "Empiler des politiques en conflit.",
   "Oublier le pilote."
  ],
  "extensions": [
   "Ajouter la couverture macOS et mobile du module 14.",
   "Ajouter un plan de revue après une mise à jour de la documentation."
  ],
  "lab": {
   "client": "**Nordlys Technologies** a 300 postes Windows répartis en trois groupes : TI (25), bureau (230) et finance et direction (45). La direction demande un **socle de sécurité** unique et démontrable avant l'audit de l'assureur dans huit semaines. L'assureur demandera pour chaque contrôle : « montrez-moi la politique, montrez-moi que le poste l'a reçue, montrez-moi que la protection fonctionne ».\n\nVotre mandat : remplir la **fiche de configuration en 21 points** : un mécanisme, un ciblage, une preuve pour chaque point, et distinguer systématiquement les **quatre états** d'une politique.",
   "mission": "Remplir la fiche de 21 points (mécanisme, cible, valeur, preuve), répartir en trois vagues, écrire la preuve par état et nommer les risques résiduels.",
   "duration": "2 h 30",
   "mode": "simule",
   "parts": [
    {
     "title": "Choisir le mécanisme de chaque point",
     "goal": "Un seul mécanisme par point, selon l'ordre de préférence.",
     "steps": "Pour chacun des 21 points du tableau « Fiche de configuration », écrivez le **mécanisme** (politique de sécurité des terminaux, catalogue de paramètres, base de référence, mécanisme avancé) et le **propriétaire**.\n\n1. Commencez par les points pour lesquels un modèle de sécurité des terminaux existe.\n2. Pour les autres, cherchez d'abord dans le catalogue de paramètres.\n3. Notez les points où **aucun mécanisme Intune** n'existe ou n'est connu : ne les remplissez pas par habitude, écrivez « à vérifier ».\n4. Vérifiez qu'aucun point n'est couvert par deux mécanismes à la fois.",
     "expected": "Une fiche remplie montre : antivirus, ASR, pare-feu, chiffrement, comptes (LAPS) et intégration Defender via les politiques de sécurité des terminaux ; durcissements particuliers via le catalogue ; socle global via une base de référence si utile ; anneaux de mise à jour via leur propre type de politique ; conformité via sa politique. **Un seul mécanisme par point** : c'est ce qui évite les conflits. Les « à vérifier » sont des engagements honnêtes à lever avant l'audit.",
     "check": "Chaque point a un mécanisme unique, un propriétaire et au plus quelques « à vérifier » nommés."
    },
    {
     "title": "Définir le ciblage et les vagues",
     "goal": "Répartir le déploiement en trois vagues avec des critères de passage.",
     "steps": "Définissez trois vagues : **TI** (25), **bureau** (230) et **finance et direction** (45). Pour chaque point, indiquez : groupe ciblé, **filtre** éventuel, ordre de déploiement, durée d'observation et critère de passage.\n\n1. Quels points se déploient en **audit d'abord** (ASR, protection réseau, contrôle des applications) ?\n2. Quels points ne se testent pas en audit (pare-feu, antivirus) mais exigent un pilote ?\n3. Quel groupe reçoit en dernier les contrôles les plus perturbateurs ?",
     "expected": "Un plan : TI reçoit tout en premier (audit ou application selon le point) ; bureau reçoit après sept jours sans incident ; finance et direction reçoit en dernier pour les contrôles perturbateurs (contrôle des applications, ASR en blocage), avec des revues avec les métiers. Les points d'audit exigent une mesure avant le blocage ; les autres un pilote et un retour arrière.",
     "check": "Chaque point a un groupe, une vague, une durée et un critère de passage."
    },
    {
     "title": "Écrire la preuve des quatre états",
     "goal": "Distinguer créée, assignée, reçue, opérationnelle pour chaque politique.",
     "steps": "Pour **cinq points de votre choix** (par exemple antivirus, chiffrement, LAPS, pare-feu, ASR), remplissez quatre colonnes :\n\n1. **Créée** : où voir qu'elle existe ?\n2. **Assignée** : où voir qu'elle cible les bons appareils ?\n3. **Reçue** : où voir l'état par appareil ?\n4. **Opérationnelle** : quelle **preuve locale ou dans Defender** montre que la protection fonctionne ?\n\nIndiquez ce qui **manque** quand seule la colonne 3 est remplie.",
     "expected": "Exemple pour le chiffrement : créée (politique dans Intune), assignée (groupe et filtre), reçue (état par appareil), opérationnelle (rapport de chiffrement **et** statut local, avec clé déposée). Un état « Réussi » sans preuve de la colonne 4 est un **faux sentiment de sécurité** : c'est la phrase à dire à l'assureur.",
     "check": "Pour chacun des cinq points, les quatre états ont une source de preuve distincte."
    },
    {
     "title": "Nommer les risques résiduels et les écarts",
     "goal": "Dire clairement ce qui reste exposé.",
     "steps": "Écrivez une page : **écarts** (points sans mécanisme ou en « à vérifier »), **alternatives** ou **risques acceptés** avec un propriétaire, **dépendances** (licences, Defender), et le plan de revue après une mise à jour de Microsoft.\n\n1. Classez chaque écart par gravité (élevée, moyenne, faible) et par échéance de correction.\n2. Indiquez pour chacun la personne qui accepte le risque, par son nom.\n3. Fixez la date de la prochaine revue.",
     "expected": "Chaque écart est soit corrigé, soit accepté par une personne nommée avec une date de revue. Les dépendances (licence supplémentaire, intégration Defender) apparaissent explicitement. Le plan de revue prévoit une relecture de la documentation à chaque annonce importante.",
     "check": "Chaque écart est corrigé ou accepté par une personne nommée."
    }
   ],
   "deliverables": [
    "La fiche de configuration en 21 points remplie.",
    "Le plan des trois vagues.",
    "La preuve par état pour cinq points.",
    "La page des risques résiduels."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Fiche de configuration",
     "head": [
      "#",
      "Point",
      "À décider",
      "Domaine"
     ],
     "rows": [
      [
       "1",
       "Antivirus en temps réel",
       "Valeur et mécanisme",
       "Antivirus"
      ],
      [
       "2",
       "Protection infonuagique et échantillons",
       "Valeur et décision de confidentialité",
       "Antivirus"
      ],
      [
       "3",
       "Protection contre la falsification",
       "Activée, tolérance aux changements",
       "Antivirus"
      ],
      [
       "4",
       "Applications potentiellement indésirables",
       "Mode (audit ou blocage)",
       "Antivirus"
      ],
      [
       "5",
       "Exclusions antivirus",
       "Registre, portée, revue",
       "Antivirus"
      ],
      [
       "6",
       "Règles de réduction de la surface d'attaque",
       "Mode par règle et anneaux",
       "ASR"
      ],
      [
       "7",
       "Protection réseau",
       "Audit puis blocage",
       "ASR"
      ],
      [
       "8",
       "Accès contrôlé aux dossiers",
       "Dossiers et applications approuvées",
       "ASR"
      ],
      [
       "9",
       "Exploit Protection",
       "Réglages par application",
       "ASR"
      ],
      [
       "10",
       "Pare-feu (trois profils)",
       "Valeurs par défaut et règles",
       "Pare-feu"
      ],
      [
       "11",
       "Chiffrement BitLocker",
       "Méthode, prérequis, dépôt des clés",
       "Chiffrement"
      ],
      [
       "12",
       "Récupération des clés",
       "Qui lit, trace, rotation",
       "Chiffrement"
      ],
      [
       "13",
       "Mot de passe administrateur local (LAPS)",
       "Rotation, lecture tracée",
       "Comptes"
      ],
      [
       "14",
       "Groupes locaux d'administrateurs",
       "Verrouillage et exceptions",
       "Comptes"
      ],
      [
       "15",
       "Identifiants protégés (Hello, Credential Guard)",
       "Prérequis matériels",
       "Comptes"
      ],
      [
       "16",
       "Contrôle des applications",
       "Audit puis application",
       "Applications"
      ],
      [
       "17",
       "Contrôle des périphériques",
       "Groupes et action par défaut",
       "Périphériques"
      ],
      [
       "18",
       "Anneaux de mise à jour",
       "Reports et échéances",
       "Correctifs"
      ],
      [
       "19",
       "Conformité et actions",
       "Délais et paliers",
       "Conformité"
      ],
      [
       "20",
       "Intégration Defender et risque",
       "EDR et seuil de risque",
       "Intégration"
      ],
      [
       "21",
       "Rapports et preuves",
       "Quatre états par politique",
       "Preuves"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "if02",
  "module": "final",
  "level": "avancé",
  "title": "Règles ASR déployées par vagues",
  "problem": "Planifier sur huit semaines le passage des règles ASR de l'audit au blocage pour trois groupes d'appareils, avec mesure du bruit, exclusions documentées et retour arrière.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Tableur"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Mesurer le bruit d'audit par règle et par appareil",
   "Construire le calendrier de huit semaines",
   "Documenter les exclusions",
   "Préparer le retour arrière et la communication"
  ],
  "success": [
   "Aucune règle ne passe en blocage sans mesure en audit.",
   "Chaque exclusion a un propriétaire et une date de revue.",
   "Le retour arrière est décrit et testable."
  ],
  "risks": [
   "Passer en blocage trop tôt.",
   "Exclusions trop larges.",
   "Confondre événement d'audit et blocage réel."
  ],
  "extensions": [
   "Relier la mesure à un tableau de bord.",
   "Ajouter la gouvernance d'un cas comme WSL."
  ],
  "lab": {
   "client": "Nordlys déploie huit règles de réduction de la surface d'attaque pour **trois groupes** : TI, bureau et comptabilité. Le comité de sécurité a posé trois conditions : **aucune règle en blocage sans mesure**, **aucune exclusion sans propriétaire** et **un retour arrière testé**. Le service de la comptabilité exige de ne pas perdre ses macros.\n\nVous disposez de deux semaines d'événements d'audit (jeu de données fictif). Votre mandat : bâtir le **calendrier de huit semaines**, mesurer, décider règle par règle et préparer la communication.",
   "mission": "Mesurer le bruit par règle et par appareil, construire le calendrier de passage en blocage par groupe, documenter les exclusions et rédiger le plan de retour arrière.",
   "duration": "2 h",
   "mode": "tenant",
   "parts": [
    {
     "title": "Mesurer le bruit d'audit par règle et par appareil",
     "goal": "Distinguer bruit diffus et bruit concentré.",
     "steps": "1. Vue par règle :\n\n```kql\nDeviceEvents\n| where ActionType startswith \"Asr\"\n| summarize Evenements = count(), Appareils = dcount(DeviceName), Premier = min(Timestamp), Dernier = max(Timestamp) by ActionType\n| order by Evenements desc\n```\n\n2. Vue par appareil et processus pour la règle la plus sensible :\n\n```kql\nDeviceEvents\n| where ActionType == \"AsrOfficeChildProcessAudited\"\n| summarize Evenements = count() by DeviceName, InitiatingProcessFileName, FileName\n| order by Evenements desc\n```\n\n3. Classez chaque règle : **bruit expliqué**, **bruit inexpliqué**, **signal préoccupant**.",
     "expected": "Le bruit des deux premières règles est expliqué par des applications métier connues ; la règle Office montre toutefois **un appareil avec un enchaînement Word vers PowerShell** qui n'est pas du bruit de macro métier : c'est un **signal préoccupant** à investiguer avant de passer cette règle en blocage pour quiconque. Une mesure par règle seule masquerait cet appareil.",
     "check": "Chaque règle est classée et l'appareil atypique est signalé."
    },
    {
     "title": "Construire le calendrier de huit semaines",
     "goal": "Passer par anneaux avec critères de passage chiffrés.",
     "steps": "Construisez le calendrier : pour chaque règle et chaque groupe, indiquez le **mode** par semaine (audit, avertissement si disponible, blocage), le critère de passage et le responsable.\n\n1. TI : quelles règles passent en blocage dès la semaine 1 ?\n2. Bureau : quelles règles passent en blocage à partir de la semaine 3 ?\n3. Comptabilité : quelles règles restent en audit jusqu'à la revue des macros ?\n4. Que fait-on de la règle dont un appareil montre un signal préoccupant ?",
     "expected": "Un calendrier : TI en blocage semaines 1 à 2 pour les règles à bruit expliqué ; bureau semaines 3 à 5 ; comptabilité semaines 6 à 8 après revue ; la règle Office reste en **audit** partout tant que l'appareil atypique n'est pas investigué. Critère type : zéro événement non expliqué pendant sept jours consécutifs.",
     "check": "Le calendrier a un mode par semaine et par groupe, avec critère et responsable."
    },
    {
     "title": "Documenter les exclusions",
     "goal": "Garder chaque exclusion étroite et datée.",
     "steps": "Remplissez le registre pour les exclusions proposées : règle, **chemin ou processus précis**, groupe, raison, **propriétaire**, date de revue, **condition de retrait**.\n\n1. Quelle exclusion refusez-vous d'emblée ?\n2. Comment vérifiez-vous chaque trimestre qu'elle est encore utile ?",
     "expected": "Refuser : toute exclusion qui désactive la règle pour un interpréteur de commandes. Accepter : un fichier précis d'une application métier pour un groupe précis. Vérification trimestrielle : une requête sur les déclenchements concernés ; sans déclenchement, on retire.",
     "check": "Chaque exclusion a une portée étroite, un propriétaire et une condition de retrait."
    },
    {
     "title": "Préparer le retour arrière et la communication",
     "goal": "Pouvoir revenir à l'audit rapidement et prévenir.",
     "steps": "1. Décrivez le **retour arrière** : qui, comment, délai de propagation, vérification.\n2. Rédigez le message à la comptabilité (6 lignes).\n3. Quels **indicateurs** surveillez-vous la première semaine de blocage (tickets, événements de blocage) ?\n4. Testez le retour arrière sur le groupe TI avant la production : quelle preuve conservez-vous ?",
     "expected": "Retour arrière : repasser la règle en audit via la politique avec un responsable de garde ; le délai de propagation dépend de la synchronisation des appareils et doit être **connu** par un test. Indicateurs : tickets liés à des blocages, volume d'événements de blocage par règle. Preuve du test : capture de l'état avant et après sur un appareil TI et le délai observé.",
     "check": "Le retour arrière est testé sur TI avant la production."
    }
   ],
   "deliverables": [
    "La synthèse chiffrée du bruit.",
    "Le calendrier de huit semaines.",
    "Le registre des exclusions.",
    "Le retour arrière et le message aux utilisateurs."
   ],
   "context": "defender-xdr"
  },
  "connected": {
   "accounts": "Un locataire de test avec Intune et un poste Windows de test intégré à Defender for Endpoint.",
   "permissions": "Rôle Intune adapté (par exemple Policy and Profile Manager) dans le locataire de test.",
   "costs": "Licences de test à votre charge ; vérifiez la tarification actuelle.",
   "secrets": "Aucun secret dans le dépôt.",
   "cleanup": "Retirer la politique ASR de test et réinitialiser le poste.",
   "limits": "Facultatif : ne mettez jamais une règle en blocage sur un poste de production pour ce lab."
  }
 },
 {
  "id": "if03",
  "module": "final",
  "level": "avancé",
  "title": "BitLocker, LAPS et récupération",
  "problem": "Concevoir le chiffrement des disques et la gestion du compte administrateur local, avec dépôt des clés, rotation, accès délégué, procédure de récupération testée en simulation et preuves.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Concevoir la politique de chiffrement",
   "Concevoir LAPS et l'accès aux secrets",
   "Écrire et simuler la récupération",
   "Choisir les preuves d'audit"
  ],
  "success": [
   "Aucun secret n'est stocké hors du service prévu.",
   "L'accès aux secrets est délégué et journalisé.",
   "La procédure de récupération est testée en simulation."
  ],
  "risks": [
   "Chiffrer sans dépôt de clé.",
   "Accès trop large aux mots de passe locaux.",
   "Oublier les postes sans TPM."
  ],
  "extensions": [
   "Ajouter Windows Hello et Credential Guard.",
   "Ajouter un contrôle d'audit sur les lectures de secrets."
  ],
  "lab": {
   "client": "Nordlys veut passer l'audit de l'assureur sur deux contrôles : « **tous les postes sont chiffrés avec des clés récupérables** » et « **aucun mot de passe d'administrateur local n'est partagé** ». Le parc comprend des postes sans TPM, des postes en mode hérité et des comptes partagés historiques. Un exercice de récupération n'a jamais été fait.\n\nVotre mandat : concevoir les deux politiques, prévoir les accès aux secrets, écrire et **simuler** la procédure de récupération et choisir les preuves.",
   "mission": "Concevoir les politiques BitLocker et LAPS, définir qui lit les secrets, rédiger et simuler la procédure de récupération avec double contrôle et choisir les preuves pour l'audit.",
   "duration": "2 h",
   "mode": "simule",
   "parts": [
    {
     "title": "Concevoir la politique de chiffrement",
     "goal": "Choisir méthode, prérequis et dépôt des clés.",
     "steps": "À partir du tableau « Parc à chiffrer », décidez par catégorie : **méthode et taille de clé**, chiffrement silencieux ou non, traitement des postes **sans TPM**, des postes **en mode hérité** et des postes avec un autre chiffrement.\n\n1. Que faire d'un poste sans TPM : exclure, utiliser un autre protecteur, remplacer ?\n2. Comment garantir le **dépôt de la clé avant** le chiffrement ?\n3. Quel avertissement refusez-vous de contourner ?",
     "expected": "Postes sans TPM : protecteur par mot de passe de démarrage ou remplacement planifié, avec **exception approuvée** et risque documenté ; postes en mode hérité : conversion préalable ; poste avec un autre chiffrement : décision d'arbitrage. Le dépôt de la clé doit être une **condition** du chiffrement, pas une étape après. Ne chiffrez pas un poste dont vous ne pouvez pas récupérer la clé.",
     "check": "Chaque catégorie de poste a un traitement et la clé est déposée avant chiffrement."
    },
    {
     "title": "Concevoir LAPS et l'accès aux secrets",
     "goal": "Un mot de passe par poste, une lecture tracée.",
     "steps": "1. Où sauvegarder les mots de passe ? Quelle rotation ? Quelle complexité ?\n2. **Qui lit** quoi (matrice rôles et groupes d'appareils) ? Quel rôle personnalisé évite d'accorder trop ?\n3. Comment la lecture est-elle **journalisée** et qui relit le journal ?\n4. Que devient le compte administrateur historique partagé ?",
     "expected": "Un mot de passe unique par poste, tourné régulièrement et après usage. La lecture est accordée à un petit groupe de soutien avec un rôle limité ; chaque lecture est consignée et relue par une personne qui ne lit pas elle-même les secrets. Le compte administrateur historique est désactivé ou renommé après migration, et les groupes locaux d'administrateurs sont verrouillés par politique.",
     "check": "La matrice dit qui lit quoi, avec journalisation relue par un tiers."
    },
    {
     "title": "Écrire et simuler la récupération",
     "goal": "Prouver que la procédure fonctionne avant le jour où elle sera nécessaire.",
     "steps": "Rédigez la procédure pour trois scénarios : **clé BitLocker demandée au démarrage**, **mot de passe administrateur local à lire**, **poste réinstallé**. Pour chacun : vérification d'identité, rôle, double contrôle, rotation après usage, trace.\n\nEnsuite, **simulez** : sur papier, déroulez chaque scénario avec un collègue qui joue l'employé et notez : temps total, étapes ambiguës, preuves produites.",
     "expected": "La procédure doit nommer des personnes ou des rôles, pas des équipes. La simulation révèle presque toujours une ambiguïté (« qui approuve quand le responsable est absent ? »). Notez le **temps total** : si la récupération prend quatre heures, c'est une perte pour l'employé et un risque pour l'entreprise. La simulation est un **exercice sur papier** : elle ne remplace pas un test sur un appareil réel.",
     "check": "Les trois scénarios ont été déroulés et les ambiguïtés notées."
    },
    {
     "title": "Choisir les preuves d'audit",
     "goal": "Donner à l'assureur ce qu'il demandera.",
     "steps": "Pour chaque contrôle, choisissez les **preuves** : rapport de chiffrement, rapport d'état LAPS, journal d'audit des lectures, compte rendu d'exercice de récupération. Indiquez la fréquence de production et le propriétaire.\n\n1. Précisez l'**emplacement** où la preuve est conservée et qui y a accès.\n2. Précisez la **durée de conservation** de chaque preuve.\n3. Indiquez comment la preuve est **horodatée** pour ne pas pouvoir être refaite après coup.",
     "expected": "Pour « tous les postes sont chiffrés avec des clés récupérables » : rapport de chiffrement et contrôle d'échantillon de dépôt de clés, plus compte rendu de l'exercice. Pour « aucun mot de passe partagé » : rapport LAPS (appareils couverts) et journal d'audit des lectures. Chaque preuve a une date et un propriétaire.",
     "check": "Chaque contrôle a une preuve datée et un propriétaire."
    }
   ],
   "deliverables": [
    "La politique de chiffrement.",
    "La matrice d'accès LAPS.",
    "Les procédures de récupération avec compte rendu de simulation.",
    "La liste des preuves d'audit."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Parc à chiffrer",
     "head": [
      "Catégorie",
      "Quantité",
      "Particularité"
     ],
     "rows": [
      [
       "Portables récents",
       "180",
       "TPM 2.0, UEFI"
      ],
      [
       "Postes fixes anciens",
       "30",
       "Sans TPM"
      ],
      [
       "Postes en mode hérité",
       "20",
       "BIOS hérité"
      ],
      [
       "Postes avec chiffrement tiers",
       "10",
       "Produit installé par un ancien fournisseur"
      ],
      [
       "Comptes administrateurs partagés",
       "1",
       "Un mot de passe partagé par tous"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "if04",
  "module": "final",
  "level": "avancé",
  "title": "Risque Defender et accès conditionnel sans verrouillage",
  "problem": "Relier le niveau de risque de Defender à la conformité et à l'accès conditionnel, avec compte d'urgence, période de grâce, mode rapport seulement et indicateurs de verrouillage.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Décrire la chaîne et ses dépendances",
   "Estimer qui serait verrouillé",
   "Choisir le seuil et le délai de grâce",
   "Concevoir le compte d'urgence et le retour arrière"
  ],
  "success": [
   "Un verrouillage massif est impossible par conception.",
   "Chaque maillon a un indicateur de santé.",
   "Le compte d'urgence est exclu et surveillé."
  ],
  "risks": [
   "Traiter l'inconnu comme conforme sans le dire.",
   "Exclure un groupe entier.",
   "Oublier de surveiller le compte d'urgence."
  ],
  "extensions": [
   "Ajouter une alerte sur les capteurs qui passent inactifs.",
   "Relier au scénario « Risque appareil et accès conditionnel »."
  ],
  "lab": {
   "client": "Nordlys veut exiger que l'accès aux applications ne soit possible que depuis des appareils dont le niveau de risque Defender est acceptable. Le directeur technique précise : « Si on verrouille le PDG un vendredi soir, c'est vous qui répondrez. »\n\nVous devez concevoir la **chaîne complète** : signal Defender, conformité Intune, accès conditionnel Entra, avec exclusions d'urgence, mode rapport seulement, fenêtre de grâce et **indicateurs de verrouillage** qui arrêtent le déploiement.",
   "mission": "Décrire la chaîne et ses dépendances, estimer qui serait verrouillé, choisir le seuil, concevoir le compte d'urgence et rédiger le plan de retour arrière.",
   "duration": "2 h",
   "mode": "tenant",
   "parts": [
    {
     "title": "Décrire la chaîne et ses dépendances",
     "goal": "Savoir où le signal peut se perdre.",
     "steps": "Dessinez (en texte) la chaîne : **capteur Defender** → **niveau de risque** → **connecteur Intune-Defender** → **politique de conformité** → **accès conditionnel** → **accès à l'application**.\n\n1. Quelles sont les **dépendances** de chaque maillon (licence, intégration, inscription) ?\n2. Où le signal peut-il **se perdre** silencieusement ?\n3. Quel **indicateur de santé** surveille chaque maillon ?",
     "expected": "Maillons et risques : capteur inactif (pas de risque évalué), connecteur désactivé (le niveau n'arrive pas à Intune), appareil non inscrit (pas de conformité), politique sans règle de risque, accès conditionnel qui n'exige pas la conformité. Chaque maillon a un indicateur : pourcentage de capteurs actifs, état du connecteur, appareils non évalués, rapport de conformité, journal d'accès conditionnel.",
     "check": "Chaque maillon a une dépendance, une panne possible et un indicateur."
    },
    {
     "title": "Estimer qui serait verrouillé",
     "goal": "Mesurer l'effet avant d'activer.",
     "steps": "1. Estimez les appareils qui poseraient problème **dès le premier jour** :\n\n```kql\nDeviceInfo\n| summarize arg_max(Timestamp, *) by DeviceName\n| summarize Appareils = count(), SansCapteurActif = countif(SensorHealthState != \"Active\"), NonIntegres = countif(OnboardingStatus != \"Onboarded\"), ExpositionElevee = countif(ExposureLevel == \"High\")\n```\n\n2. Quelle proportion du parc serait affectée si « risque inconnu » signifiait « non conforme » ?\n3. Quelle décision prenez-vous sur l'**inconnu** pour la première semaine ?",
     "expected": "Vous verrez une minorité d'appareils sans capteur actif ou non intégrés : si « inconnu » est traité comme non conforme, ils perdent l'accès dès le jour 1. Décision prudente : **rapport seulement** pendant deux semaines pour mesurer, réparer les capteurs, puis traiter l'inconnu comme non conforme avec une fenêtre de grâce.",
     "check": "Vous avez chiffré la population touchée et décidé du traitement de l'inconnu."
    },
    {
     "title": "Choisir le seuil et le délai de grâce",
     "goal": "Équilibrer protection et continuité.",
     "steps": "1. Seuil de risque toléré pour chaque groupe (courant, direction et finance, TI) ?\n2. **Période de grâce** avant blocage ? Pourquoi ?\n3. Quelle action propose-t-on à la personne bloquée (message, lien, soutien) ?\n4. Qui peut accorder une **exception temporaire** et pour combien de temps ?\n5. Comment mesurez-vous le nombre de personnes bloquées chaque jour ?",
     "expected": "Seuil plus strict pour la direction et la finance ; grâce courte (heures) pour laisser la remédiation automatique agir ; message clair avec le contact du soutien. Les seuils se décident avec les propriétaires des données, pas seulement la sécurité.",
     "check": "Chaque groupe a un seuil, une grâce et un message."
    },
    {
     "title": "Concevoir le compte d'urgence et le retour arrière",
     "goal": "Garder une porte de secours surveillée.",
     "steps": "1. Combien de comptes d'urgence ? Quelle authentification ? Où sont les identifiants ?\n2. Comment sont-ils **surveillés** (alerte à chaque connexion) ?\n3. Décrivez le **retour arrière** : qui désactive la politique, en combien de minutes, comment on le vérifie ?\n4. Quels **indicateurs de verrouillage** arrêtent le déploiement ?",
     "expected": "Au moins deux comptes d'urgence exclus, avec méthode d'authentification résistante à l'hameçonnage et alerte à chaque usage. Retour arrière : désactivation de la politique d'accès conditionnel par un rôle désigné, testée. Indicateurs d'arrêt : nombre de tickets d'accès par heure au-dessus d'un seuil, ou utilisation d'un compte d'urgence.",
     "check": "Vous avez deux comptes d'urgence surveillés et un seuil d'arrêt."
    }
   ],
   "deliverables": [
    "La chaîne et ses indicateurs de santé.",
    "L'estimation des appareils touchés.",
    "Les seuils et délais de grâce.",
    "Le plan du compte d'urgence et de retour arrière."
   ],
   "context": "defender-xdr"
  },
  "connected": {
   "accounts": "Un locataire de test avec Intune, Entra ID P1 et Defender for Endpoint.",
   "permissions": "Rôle Intune adapté (par exemple Policy and Profile Manager) dans le locataire de test.",
   "costs": "Licences de test à votre charge ; vérifiez la tarification actuelle.",
   "secrets": "Aucun secret dans le dépôt.",
   "cleanup": "Supprimer la politique d'accès conditionnel et la conformité de test.",
   "limits": "Facultatif : ne créez jamais une politique d'accès conditionnel sans compte d'urgence exclu."
  }
 },
 {
  "id": "if05",
  "module": "final",
  "level": "intermédiaire",
  "title": "Sécurité des appareils personnels (BYOD)",
  "problem": "Concevoir un programme complet pour appareils personnels : niveaux de protection des applications, conditions d'accès, communication aux employés, départ d'un employé et preuves.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Définir le périmètre et les niveaux",
   "Concevoir les conditions d'accès",
   "Écrire le message aux employés",
   "Planifier le départ d'un employé et les preuves"
  ],
  "success": [
   "La liste du non géré est publiée aux employés.",
   "L'effacement est sélectif seulement.",
   "Les preuves sont datées et ont un propriétaire."
  ],
  "risks": [
   "Promettre une confidentialité que l'architecture ne permet pas.",
   "Gérer un appareil personnel comme un appareil d'entreprise.",
   "Oublier le départ des employés."
  ],
  "extensions": [
   "Ajouter la défense contre les menaces mobiles.",
   "Mesurer la satisfaction des employés après trois mois."
  ],
  "lab": {
   "client": "Les 80 employés de Nordlys qui utilisent leur téléphone personnel pour le courriel et Teams ne sont pas inscrits à Intune. Le service juridique s'inquiète des données de l'entreprise sur ces appareils, les employés craignent que l'entreprise « regarde leurs photos », et le responsable de la sécurité veut un programme **proportionné**.\n\nVotre mandat : concevoir le programme complet : ce qu'on protège, ce qu'on ne voit pas, comment on l'explique, ce qui se passe à un départ, et les preuves pour l'audit.",
   "mission": "Définir les niveaux de protection, les conditions d'accès, le message aux employés, la procédure de départ et les preuves du programme BYOD.",
   "duration": "90 min",
   "mode": "tenant",
   "parts": [
    {
     "title": "Définir le périmètre et les niveaux",
     "goal": "Protéger les données, pas l'appareil.",
     "steps": "1. Quelles **applications** sont dans le périmètre (courriel, Teams, stockage de fichiers) ?\n2. Quels **niveaux de protection** (base, amélioré, élevé) pour quelles personnes ?\n3. Quelles **conditions préalables** (version minimale du système, code d'accès) ?\n4. Qu'est-ce que l'entreprise **ne gère pas** : listez-le explicitement.",
     "expected": "Périmètre : courriel, Teams et applications de fichiers approuvées. Niveaux proportionnés à la donnée. Conditions : système à jour et code d'accès. **Non géré** : photos, messages personnels, applications personnelles, localisation de l'appareil. Cette liste est la **promesse de confidentialité** à écrire noir sur blanc.",
     "check": "Le périmètre est défini et la liste du non géré est écrite."
    },
    {
     "title": "Concevoir les conditions d'accès",
     "goal": "Exiger une application approuvée et une politique de protection.",
     "steps": "Concevez la règle d'accès : **application cliente approuvée** exigée, **politique de protection** appliquée, blocage des clients non approuvés, comportement quand l'utilisateur refuse.\n\n1. Quel est l'effet sur un employé qui utilise l'application de courriel native du téléphone ?\n2. Comment gérez-vous la période de transition ?\n3. Que se passe-t-il si l'appareil est jailbreaké ou débridé ?",
     "expected": "Un accès conditionnel peut exiger une application approuvée avec une politique de protection : l'application native non approuvée n'aurait plus accès. Prévoir une transition (rapport seulement, messages, soutien). Un appareil débridé peut être traité par une condition de conformité mobile ou par la défense contre les menaces mobiles, selon la licence.",
     "check": "La règle d'accès a une transition et un traitement de l'appareil débridé."
    },
    {
     "title": "Écrire le message aux employés",
     "goal": "Expliquer sans inquiéter ni mentir.",
     "steps": "Rédigez la communication (une page) : **ce que nous protégeons**, **ce que nous ne voyons pas**, **ce que nous pouvons effacer** (données de l'entreprise seulement), **ce que vous devez faire**, **qui contacter**.\n\n1. Relisez le texte à voix haute : y a-t-il un mot que votre mère ne comprendrait pas ?\n2. Retirez toute phrase qui promet plus que l'architecture ne permet.\n3. Ajoutez une question fréquente : « Mon employeur voit-il mes photos ? ».",
     "expected": "Un bon message est honnête : « Nous protégeons les données de l'entreprise dans les applications professionnelles. Nous ne voyons pas vos photos, vos messages ni vos applications personnelles. En cas de perte, nous pouvons retirer les données de l'entreprise de ces applications seulement. » Il évite le jargon et nomme une personne contact.",
     "check": "Le message dit clairement ce que l'entreprise ne voit pas."
    },
    {
     "title": "Planifier le départ d'un employé et les preuves",
     "goal": "Retirer l'accès proprement et prouver le programme.",
     "steps": "1. Procédure de **départ** : désactivation du compte, effacement sélectif, vérification, délai.\n2. Quelles **preuves** garde-t-on pour l'audit : rapport des applications protégées, journal d'effacement, couverture du programme ?\n3. Quel indicateur mesure l'adoption ?",
     "expected": "Au départ : désactiver le compte, déclencher l'effacement sélectif des applications, vérifier l'état dans le rapport, consigner. Preuves : pourcentage d'appareils personnels avec politique de protection, journal des effacements, revue trimestrielle. Indicateur d'adoption : nombre d'utilisateurs avec accès par application approuvée.",
     "check": "La procédure de départ a une vérification et les preuves ont un propriétaire."
    }
   ],
   "deliverables": [
    "La grille des niveaux et du non géré.",
    "La règle d'accès conditionnel.",
    "Le message aux employés.",
    "La procédure de départ et les preuves."
   ],
   "context": "defender-xdr"
  },
  "connected": {
   "accounts": "Un locataire de test avec Intune et un téléphone de test.",
   "permissions": "Rôle Intune adapté (par exemple Policy and Profile Manager) dans le locataire de test.",
   "costs": "Licences de test à votre charge ; vérifiez la tarification actuelle.",
   "secrets": "Aucun secret dans le dépôt.",
   "cleanup": "Supprimer les politiques de protection d'applications de test.",
   "limits": "Facultatif : n'imposez jamais une politique de protection à de vrais appareils personnels sans consentement et communication préalable."
  }
 },
 {
  "id": "if06",
  "module": "final",
  "level": "avancé",
  "title": "Politiques en conflit : détecter et arbitrer",
  "problem": "Détecter les conflits entre politiques, arbitrer avec des règles de propriété et prévenir leur retour grâce à un registre et à des contrôles de gouvernance.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Cartographier les chevauchements",
   "Arbitrer chaque conflit",
   "Retirer les chevauchements sans casser",
   "Mettre en place la gouvernance"
  ],
  "success": [
   "Chaque réglage a une seule politique propriétaire.",
   "Le nettoyage est testé sur un pilote.",
   "La gouvernance a une revue mensuelle."
  ],
  "risks": [
   "Nettoyer en masse sans test.",
   "Résoudre les conflits par l'ordre implicite.",
   "Laisser des politiques sans propriétaire."
  ],
  "extensions": [
   "Automatiser l'inventaire via l'interface de programmation.",
   "Ajouter une métrique de conflits ouverts."
  ],
  "lab": {
   "client": "Nordlys a accumulé 40 politiques Intune en trois ans, créées par quatre équipes. Des rapports montrent des « conflits » et des « erreurs » que personne n'ose toucher. Un réglage de pare-feu a été appliqué avec une valeur surprenante, et un autre a été **ignoré** pendant des semaines.\n\nVotre mandat : cartographier les chevauchements, arbitrer avec des règles de propriété, et mettre en place les contrôles pour que ça ne revienne pas.",
   "mission": "Cartographier les réglages en doublon, décider de la politique gagnante pour chaque conflit, retirer les chevauchements et définir la gouvernance des politiques.",
   "duration": "2 h",
   "mode": "simule",
   "parts": [
    {
     "title": "Cartographier les chevauchements",
     "goal": "Voir quels réglages sont fixés par plusieurs politiques.",
     "steps": "À partir du tableau « Inventaire des politiques », construisez une matrice réglage × politique. Pour chaque réglage fixé par plus d'une politique, notez les valeurs.\n\n1. Quels réglages ont des **valeurs différentes** (conflit réel) ?\n2. Quels réglages ont la **même valeur** (redondance sans conflit) ?\n3. Quels mécanismes sont impliqués (politique de sécurité des terminaux, catalogue, base de référence, modèle) ?",
     "expected": "La matrice montre généralement quelques conflits réels et beaucoup de redondances. Les redondances sans conflit sont un **risque futur** : si une valeur change dans une seule politique, un conflit apparaît. Le mécanisme impliqué indique souvent l'origine : une base de référence qui fixe le même réglage qu'une politique de sécurité.",
     "check": "La matrice identifie conflits réels et redondances."
    },
    {
     "title": "Arbitrer chaque conflit",
     "goal": "Choisir la politique gagnante selon des règles de propriété.",
     "steps": "Définissez trois **règles d'arbitrage** (par exemple : « la politique de sécurité des terminaux l'emporte sur le catalogue pour son domaine », « une base de référence ne fixe jamais un réglage déjà géré par une politique dédiée », « le propriétaire du domaine décide »). Appliquez-les à chaque conflit de la matrice et inscrivez la décision.",
     "expected": "Appliquer les règles produit des décisions cohérentes : on garde la politique du domaine et on **retire** le réglage des autres politiques plutôt que de s'appuyer sur un ordre implicite. Chaque décision nomme un propriétaire.",
     "check": "Chaque conflit a une décision, une règle appliquée et un propriétaire."
    },
    {
     "title": "Retirer les chevauchements sans casser",
     "goal": "Nettoyer les doublons sans rien casser.",
     "steps": "Pour retirer un réglage d'une politique :\n\n1. Quel risque (l'appareil retombe à une valeur par défaut ?) ?\n2. Comment testez-vous sur un groupe pilote ?\n3. Comment confirmez-vous le résultat sur l'appareil (état local) ?\n4. Quel plan de retour arrière ?",
     "expected": "Retirer un réglage peut rendre actif un autre réglage plus faible : testez sur un pilote et vérifiez **l'état local**. Le retour arrière consiste à rétablir la politique d'origine. Procédez par petits lots, jamais en masse.",
     "check": "Le nettoyage se fait par lots avec test local et retour arrière."
    },
    {
     "title": "Mettre en place la gouvernance",
     "goal": "Éviter le retour des conflits.",
     "steps": "Définissez : un **registre** des politiques (propriétaire, domaine, réglages), une **convention de nommage**, une **revue** mensuelle des rapports de conflit, une règle « **aucune politique sans propriétaire** », et un processus de création de politique (demande, vérification des chevauchements, pilote).",
     "expected": "La gouvernance tient en cinq règles simples. Le contrôle le plus efficace : avant toute nouvelle politique, une vérification des chevauchements dans le registre. La revue mensuelle des rapports de conflit détecte les dérives tôt.",
     "check": "La gouvernance a un registre, une convention et une revue mensuelle."
    }
   ],
   "deliverables": [
    "La matrice réglage par politique.",
    "Les décisions d'arbitrage.",
    "Le plan de nettoyage.",
    "Les règles de gouvernance."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Inventaire des politiques",
     "head": [
      "Politique",
      "Mécanisme",
      "Propriétaire",
      "Réglages en commun"
     ],
     "rows": [
      [
       "Pare-feu de base",
       "Politique de sécurité des terminaux",
       "Sécurité",
       "Pare-feu public : entrant bloqué"
      ],
      [
       "Socle Windows",
       "Base de référence",
       "Sécurité",
       "Pare-feu public : entrant autorisé ; SmartScreen"
      ],
      [
       "Durcissement TI",
       "Catalogue de paramètres",
       "TI",
       "Pare-feu public : désactivé ; SmartScreen"
      ],
      [
       "Modèle hérité",
       "Modèle de configuration",
       "Inconnu",
       "SmartScreen : désactivé"
      ],
      [
       "Antivirus",
       "Politique de sécurité des terminaux",
       "Sécurité",
       "Protection infonuagique : activée"
      ],
      [
       "Socle Windows (copie)",
       "Base de référence",
       "Inconnu",
       "Protection infonuagique : désactivée"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "if07",
  "module": "final",
  "level": "avancé",
  "title": "Dossier de validation du durcissement",
  "problem": "Produire le dossier qui prouve le durcissement : matrice des 21 points avec preuves par état, tests de validation, limites, statut honnête de chaque validation et plan de revue.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Construire la matrice de validation",
   "Définir les tests de validation",
   "Écrire le statut honnête des validations",
   "Planifier la revue et conclure"
  ],
  "success": [
   "Aucune validation n'est affirmée sans preuve.",
   "Simulation et validation réelle sont distinguées.",
   "Chaque point a un propriétaire et une date."
  ],
  "risks": [
   "Présenter « politique réussie » comme une preuve de protection.",
   "Affirmer un test jamais exécuté.",
   "Figer le dossier sans plan de revue."
  ],
  "extensions": [
   "Ajouter une colonne « effort pour valider ».",
   "Automatiser une partie des preuves avec les rapports."
  ],
  "lab": {
   "client": "L'assureur de Nordlys demande un **dossier de validation** du durcissement des postes. Le comité d'audit a déjà refusé un dossier précédent : il présentait des captures d'écran de politiques « réussies » comme des preuves de protection, et affirmait des validations jamais exécutées.\n\nVotre mandat : un dossier qui distingue **ce qui est prouvé**, **ce qui est reçu**, **ce qui est simulé** et **ce qui n'a pas été validé sur un vrai locataire**.",
   "mission": "Remplir la matrice de validation des 21 points avec preuves par état, définir les tests, rédiger la section sur le statut honnête des validations et le plan de revue.",
   "duration": "2 h 30",
   "mode": "simule",
   "parts": [
    {
     "title": "Construire la matrice de validation",
     "goal": "Une ligne par point, une preuve par état.",
     "steps": "Reprenez la fiche de 21 points du lab « Socle de sécurité Windows ». Pour chaque point, remplissez : **politique créée** (preuve), **assignée** (preuve), **reçue** (preuve), **opérationnelle** (preuve), **date de la preuve**, **responsable**.\n\n1. Combien de points ont les **quatre** preuves ?\n2. Combien n'ont que « reçue » ?\n3. Quels points n'ont aucune preuve opérationnelle possible aujourd'hui, et pourquoi ?",
     "expected": "Une matrice honnête révèle plusieurs lignes à moitié remplies : c'est normal et c'est précieux. Les points sans preuve opérationnelle possible doivent être **nommés** (par exemple, une fonction dont l'état local n'est pas observable) avec une compensation. Un taux de remplissage de 100 % au premier essai est suspect.",
     "check": "Chaque point a un état de preuve honnête et une date."
    },
    {
     "title": "Définir les tests de validation",
     "goal": "Prouver le fonctionnement et pas seulement la configuration.",
     "steps": "Pour **huit points**, concevez un test : **action** (par exemple tenter d'exécuter une application non autorisée en audit), **résultat attendu**, **preuve conservée**, **fréquence**.\n\n1. Quels tests sont sûrs sur un poste réel ?\n2. Quels tests doivent se faire **en laboratoire** (pas en production) ?\n3. Comment conservez-vous la preuve (journal, capture, rapport) ?",
     "expected": "Les tests sûrs sont ceux qui lisent un état (chiffrement, pare-feu, version) ; les tests d'attaque simulée se font en laboratoire. Chaque test produit une preuve datée. Un test jamais exécuté doit être marqué « non exécuté » dans le dossier, pas « réussi ».",
     "check": "Chaque test a une action, un résultat attendu, une preuve et un lieu d'exécution."
    },
    {
     "title": "Écrire le statut honnête des validations",
     "goal": "Séparer documentation, rédaction, simulation et validation réelle.",
     "steps": "Rédigez la section qui indique pour chaque point : **recherche documentaire** faite (source et date), **rédaction** faite, **simulation** faite sur le site (le cas échéant), **validation sur un vrai locataire** (oui, non, partielle).\n\n1. Quelles validations avez-vous réellement faites ?\n2. Lesquelles n'ont **pas** été faites ?\n3. Quelle phrase écrivez-vous pour qu'aucun lecteur ne confonde simulation et validation ?",
     "expected": "La section doit refuser les affirmations non prouvées : « Les procédures de ce dossier ont été **rédigées** d'après la documentation consultée aux dates indiquées et **simulées** avec des données fictives. Elles n'ont pas toutes été validées sur un locataire réel ; les lignes marquées “non validé” restent à tester. » C'est cette phrase qui rend le dossier signable.",
     "check": "Chaque point a quatre statuts distincts et aucune validation n'est affirmée sans preuve."
    },
    {
     "title": "Planifier la revue et conclure",
     "goal": "Garder le dossier vivant dans le temps.",
     "steps": "Définissez : fréquence de revue (trimestrielle et après annonce majeure), propriétaire, critères de mise à jour, et rédigez la **conclusion d'une demi-page** : ce qui est solide, ce qui est fragile, ce qui est prévu.\n\n1. Fixez les **déclencheurs** d'une revue hors calendrier (annonce majeure, incident, changement de licence).\n2. Indiquez qui signe la version finale et qui la reçoit.",
     "expected": "La conclusion hiérarchise : points solides (preuve opérationnelle), points fragiles (preuve reçue seulement), points à valider. Elle engage des dates. Un dossier vivant est préférable à un dossier parfait figé.",
     "check": "La conclusion distingue solide, fragile et à valider, avec des dates."
    }
   ],
   "deliverables": [
    "La matrice de validation des 21 points.",
    "Les huit tests de validation.",
    "La section du statut honnête.",
    "La conclusion et le plan de revue."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Rappel : les 21 points",
     "head": [
      "#",
      "Point",
      "Domaine"
     ],
     "rows": [
      [
       "1",
       "Antivirus en temps réel",
       "Antivirus"
      ],
      [
       "2",
       "Protection infonuagique et échantillons",
       "Antivirus"
      ],
      [
       "3",
       "Protection contre la falsification",
       "Antivirus"
      ],
      [
       "4",
       "Applications potentiellement indésirables",
       "Antivirus"
      ],
      [
       "5",
       "Exclusions antivirus",
       "Antivirus"
      ],
      [
       "6",
       "Règles de réduction de la surface d'attaque",
       "ASR"
      ],
      [
       "7",
       "Protection réseau",
       "ASR"
      ],
      [
       "8",
       "Accès contrôlé aux dossiers",
       "ASR"
      ],
      [
       "9",
       "Exploit Protection",
       "ASR"
      ],
      [
       "10",
       "Pare-feu (trois profils)",
       "Pare-feu"
      ],
      [
       "11",
       "Chiffrement BitLocker",
       "Chiffrement"
      ],
      [
       "12",
       "Récupération des clés",
       "Chiffrement"
      ],
      [
       "13",
       "Mot de passe administrateur local (LAPS)",
       "Comptes"
      ],
      [
       "14",
       "Groupes locaux d'administrateurs",
       "Comptes"
      ],
      [
       "15",
       "Identifiants protégés (Hello, Credential Guard)",
       "Comptes"
      ],
      [
       "16",
       "Contrôle des applications",
       "Applications"
      ],
      [
       "17",
       "Contrôle des périphériques",
       "Périphériques"
      ],
      [
       "18",
       "Anneaux de mise à jour",
       "Correctifs"
      ],
      [
       "19",
       "Conformité et actions",
       "Conformité"
      ],
      [
       "20",
       "Intégration Defender et risque",
       "Intégration"
      ],
      [
       "21",
       "Rapports et preuves",
       "Preuves"
      ]
     ]
    }
   ]
  }
 }
];
