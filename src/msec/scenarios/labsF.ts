import type { AiProject } from '../../agentic/types.ts';

// Généré par scripts/labs/*.py : ne pas éditer à la main.
export const SCENARIO_FINAL_LABS: AiProject[] = [
 {
  "id": "sc-f01",
  "module": "final",
  "level": "intermédiaire",
  "title": "Comparer trois fiches de décision",
  "problem": "Comparer trois scénarios du catalogue rubrique par rubrique pour dégager ce qui se répète, ce qui diffère et les pièges communs.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Fiches du catalogue",
   "Tableur"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Construire le tableau comparatif",
   "Repérer dépendances et pièges communs",
   "Classer les risques de déploiement",
   "Rédiger la recommandation"
  ],
  "success": [
   "Les trois fiches sont comparées rubrique par rubrique.",
   "La synthèse nomme au moins deux pièges communs.",
   "Aucune affirmation ne dépasse la fiche et ses sources."
  ],
  "risks": [
   "Comparer des rubriques de natures différentes.",
   "Généraliser à partir d'un seul cas."
  ],
  "extensions": [
   "Ajouter un quatrième scénario.",
   "Proposer une rubrique supplémentaire à la fiche."
  ],
  "lab": {
   "client": "Le comité de sécurité de **Nordlys** doit choisir lequel de trois chantiers lancer en premier : la protection contre l'hameçonnage, les règles de réduction de la surface d'attaque et l'accès conditionnel selon le risque. Chaque chantier a sa fiche, mais personne n'a comparé leurs dépendances, leurs délais et leurs échecs. Le comité demande une recommandation écrite, fondée sur les fiches, pas sur l'intuition.",
   "mission": "Comparer les trois fiches rubrique par rubrique, repérer les dépendances communes, classer les risques et rédiger une recommandation d'ordre de déploiement.",
   "duration": "2 h",
   "mode": "simule",
   "parts": [
    {
     "title": "Construire le tableau comparatif",
     "goal": "Mettre les trois fiches côte à côte.",
     "steps": "Ouvrez les fiches des scénarios 1, 4 et 6 dans le catalogue. Construisez un tableau à trois colonnes et douze lignes (besoin, menace, signal, décideur, portail, exécutant, preuve, dépendances, délais, échecs, vérification, retour arrière).\n\n1. Recopiez chaque rubrique en une phrase, sans changer le sens.\n2. Surlignez les cases vides ou vagues.\n3. Notez les rubriques où les trois fiches ne sont pas de même nature.",
     "expected": "Le tableau fait ressortir que le besoin et la menace diffèrent mais que la structure décideur, exécutant, preuve est identique. Les cases vagues sont des faiblesses de la fiche, pas du produit. Comparer des rubriques de nature différente (une preuve et un délai) mène à de fausses conclusions.",
     "check": "Le tableau est complet et les rubriques non comparables sont signalées."
    },
    {
     "title": "Repérer dépendances et pièges communs",
     "goal": "Repérer ce qui se répète entre les fiches.",
     "steps": "1. Quelles **dépendances** reviennent dans au moins deux fiches (antivirus actif, intégration de l'appareil, licence) ?\n2. Quels **échecs silencieux** se ressemblent ?\n3. Quel scénario dépend d'un autre, et dans quel ordre faut-il les déployer ?\n4. Quel piège est propre à chacun ?",
     "expected": "Les trois dépendent de l'intégration des appareils et de la santé du capteur. L'échec silencieux commun est « politique reçue, protection absente ». Le troisième scénario dépend de la conformité qui lit un signal du premier. Ces dépendances dictent l'ordre.",
     "check": "Les dépendances communes et l'ordre de déploiement sont justifiés."
    },
    {
     "title": "Classer les risques de déploiement",
     "goal": "Où l'erreur coûte le plus cher.",
     "steps": "Notez chaque chantier de 1 à 5 sur : **risque d'interruption du travail**, **difficulté de retour arrière**, **effort de mesure préalable**, **valeur de réduction du risque**. Justifiez chaque note par une rubrique de la fiche.\n\n1. Lequel est le plus dangereux à déployer sans pilote ?\n2. Lequel apporte le plus de valeur pour le moins d'effort ?",
     "expected": "L'accès conditionnel a le risque d'interruption le plus élevé et exige les comptes d'urgence ; les règles ASR exigent le plus de mesure ; l'hameçonnage apporte beaucoup de valeur avec un risque d'interruption plus faible. Les notes sont des jugements : chacune doit citer la fiche.",
     "check": "Chaque note est justifiée par une rubrique de fiche."
    },
    {
     "title": "Rédiger la recommandation",
     "goal": "Rédiger une recommandation pour le comité.",
     "steps": "Rédigez la recommandation : **ordre proposé**, raison, dépendances à lever, indicateurs de succès, risques résiduels et ce que vous **ne savez pas** encore. Citez les fiches, pas des impressions.\n\n1. Écrivez l'ordre en une phrase, puis trois raisons.\n2. Listez les dépendances à lever avant de commencer.\n3. Ajoutez la section « ce que nous ne savons pas ».",
     "expected": "La recommandation nomme l'ordre, justifie par les dépendances et avoue les inconnues (par exemple le délai de propagation à mesurer). Une recommandation sans section « ce que nous ne savons pas » est suspecte.",
     "check": "La recommandation cite les fiches et inclut les inconnues."
    }
   ],
   "deliverables": [
    "Le tableau comparatif.",
    "La liste des dépendances communes.",
    "La grille de risques.",
    "La recommandation d'une page."
   ],
   "context": "defender-xdr"
  }
 },
 {
  "id": "sc-f02",
  "module": "final",
  "level": "avancé",
  "title": "Un incident, de la détection à la restauration",
  "problem": "Enchaîner hameçonnage, risque d'appareil, confinement et restauration sur un incident fictif, avec qui décide, qui applique et quelle preuve à chaque maillon.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Fiches du catalogue",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Reconstituer la chronologie",
   "Relier chaque étape à une fiche",
   "Évaluer la réponse",
   "Écrire le plan d'amélioration"
  ],
  "success": [
   "Chaque étape a une fiche et une preuve.",
   "Les délais sont discutés.",
   "Le plan de restauration a une vérification et un retour arrière."
  ],
  "risks": [
   "Présenter la simulation comme une exécution réelle.",
   "Oublier la restauration."
  ],
  "extensions": [
   "Ajouter la perte de télémétrie comme complication.",
   "Présenter le compte rendu en dix minutes."
  ],
  "lab": {
   "client": "**Nordlys** a vécu mercredi le 11 mars un incident en chaîne : un courriel d'hameçonnage, un clic, une exécution sur un poste, une connexion sortante. Le conseil d'administration veut un compte rendu **chronologique** : qu'est-ce qui a détecté quoi, qu'est-ce qui aurait dû bloquer, qui a décidé quoi, et ce qu'on change.",
   "mission": "Reconstituer la chronologie à partir des données, relier chaque étape à une fiche de scénario, identifier les protections manquées et rédiger le plan d'amélioration.",
   "duration": "2 h 30",
   "mode": "simule",
   "parts": [
    {
     "title": "Reconstituer la chronologie",
     "goal": "Un seul fil de l'arrivée du message à la sortie de données.",
     "steps": "```kql\nEmailEvents\n| where SenderFromDomain == \"n0rdlys-login.example\" and DeliveryAction == \"Delivered\"\n| project Timestamp, RecipientEmailAddress, Subject\n| order by Timestamp asc\n```\n\n```kql\nDeviceProcessEvents\n| where DeviceName startswith \"PC-017\" and Timestamp between (datetime(2026-03-11T10:00:00Z) .. datetime(2026-03-11T10:30:00Z))\n| project Timestamp, InitiatingProcessFileName, FileName, ProcessCommandLine\n| order by Timestamp asc\n```\n\n1. Écrivez la chronologie en une liste horodatée de huit lignes.\n2. Quel intervalle sépare le clic de l'exécution ?\n3. Quel est le dernier événement observé ?",
     "expected": "La chronologie montre le message livré, le clic, puis l'exécution du document, la reconnaissance et la connexion sortante en quelques minutes. L'intervalle court est le point : la réponse humaine n'a pas pu intervenir, seule une protection automatique aurait pu.",
     "check": "La chronologie est horodatée et l'intervalle clic-exécution est calculé."
    },
    {
     "title": "Relier chaque étape à une fiche",
     "goal": "Qui devait protéger à chaque maillon.",
     "steps": "Pour chaque étape, indiquez la fiche concernée (hameçonnage, protection web et réseau, règles ASR, risque et accès, télémétrie, confinement) et remplissez : **ce qui devait arriver**, **ce qui est arrivé**, **la preuve**.\n\n1. À quel maillon la chaîne aurait-elle dû s'interrompre ?\n2. Quelle protection existait mais n'était qu'en audit ?\n3. Quelle protection n'existait pas du tout ?",
     "expected": "Plusieurs maillons existaient mais en mode audit : la règle sur Word et PowerShell consignait sans bloquer. La protection réseau ne couvrait pas le processus de la connexion sortante. Ce sont des **écarts de configuration**, pas des pannes de produit.",
     "check": "Chaque étape a une fiche, un attendu, un observé et une preuve."
    },
    {
     "title": "Évaluer la réponse",
     "goal": "Détection, décision, confinement.",
     "steps": "1. Qui a détecté en premier, et après combien de temps ?\n2. Quelle décision a été prise et par qui ?\n3. Le confinement a-t-il préservé la preuve ?\n4. Qu'est-ce qui a manqué dans la réponse (rôle, procédure, outil) ?\n5. Quelle donnée manque pour répondre à la question 1 avec certitude ?\n6. Qui devait être prévenu et l'a-t-il été ?",
     "expected": "Une évaluation honnête distingue ce que les données prouvent de ce qu'on suppose. Si le moment exact de la détection n'est pas dans les données, on l'écrit comme inconnu. Les lacunes de procédure sont aussi importantes que les lacunes techniques.",
     "check": "Chaque affirmation est soit prouvée par les données, soit marquée comme inconnue."
    },
    {
     "title": "Écrire le plan d'amélioration",
     "goal": "Ce qu'on change et dans quel ordre.",
     "steps": "Proposez cinq améliorations classées : action, scénario concerné, effort, effet attendu, responsable, indicateur. Ajoutez le **plan de restauration** et sa vérification, et les limites de votre analyse.\n\n1. Triez les améliorations par effort croissant.\n2. Indiquez pour chacune la preuve qui montrera qu'elle est faite.\n3. Fixez une date de revue.",
     "expected": "Un bon plan commence par les changements de configuration à faible effort (passer une règle en blocage après mesure, couvrir le processus réseau) puis les chantiers plus lourds. Chaque amélioration a un indicateur mesurable, pas seulement « renforcer ».",
     "check": "Chaque amélioration a un responsable, un effet attendu et un indicateur."
    }
   ],
   "deliverables": [
    "La chronologie horodatée.",
    "La table scénario, attendu, observé, preuve.",
    "L'évaluation de la réponse.",
    "Le plan d'amélioration."
   ],
   "context": "defender-xdr"
  }
 },
 {
  "id": "sc-f03",
  "module": "final",
  "level": "avancé",
  "title": "Audit de cohérence Defender et Intune",
  "problem": "Auditer la cohérence entre les politiques Intune et les paramètres Defender d'un parc fictif : conflits, doublons, trous de couverture et preuves manquantes.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Terrain de jeu KQL (contexte Defender XDR)"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Construire la matrice domaine par source",
   "Mesurer la couverture réelle",
   "Classer les écarts par risque",
   "Planifier la correction par vagues et les preuves"
  ],
  "success": [
   "Aucune affirmation ne dépasse les données ou les sources.",
   "Chaque écart a un propriétaire.",
   "Le plan a des preuves et une revue périodique."
  ],
  "risks": [
   "Compter seulement les appareils gérés.",
   "Corriger en masse sans pilote."
  ],
  "extensions": [
   "Automatiser l'inventaire des politiques.",
   "Ajouter un indicateur de dérive mensuel."
  ],
  "lab": {
   "client": "L'assureur de **Nordlys** demande une preuve de cohérence : les politiques de sécurité de gestion des appareils et les paramètres de Defender disent-ils la même chose ? L'équipe sait que plusieurs administrateurs ont créé des politiques sur trois ans et soupçonne des chevauchements, des trous et des preuves qui ne prouvent rien.\n\nVotre mandat : un audit de cohérence avec un plan de correction par vagues.",
   "mission": "Construire la matrice domaine par source de configuration, mesurer la couverture réelle, classer les écarts par risque et proposer un plan de correction vérifiable.",
   "duration": "2 h 30",
   "mode": "simule",
   "parts": [
    {
     "title": "Construire la matrice domaine par source",
     "goal": "Savoir quelle source configure quel domaine.",
     "steps": "Listez les domaines (antivirus, ASR, protection réseau, pare-feu, chiffrement, comptes locaux, contrôle des appareils, intégration Defender). Pour chacun, indiquez les **sources de configuration** (politique de sécurité des terminaux, catalogue de paramètres, base de référence, portail Defender, stratégie de groupe héritée).\n\n1. Quels domaines ont plus d'une source ?\n2. Quels domaines n'ont aucune source identifiée ?\n3. Quelle source a la priorité en cas de conflit ?",
     "expected": "La matrice révèle des domaines à plusieurs sources (conflit potentiel) et d'autres sans source (trou). Une stratégie de groupe héritée sur des appareils maintenant gérés est une source de conflit fréquente. La priorité dépend de la source : il faut la documenter, pas la supposer.",
     "check": "Chaque domaine a ses sources et ses conflits potentiels."
    },
    {
     "title": "Mesurer la couverture réelle",
     "goal": "Ce que disent les appareils.",
     "steps": "```kql\nDeviceInfo\n| summarize arg_max(Timestamp, *) by DeviceName\n| summarize Appareils = count(), CapteurActif = countif(SensorHealthState == \"Active\"), Integres = countif(OnboardingStatus == \"Onboarded\") by MachineGroup\n```\n\n1. Quelle part des appareils est réellement visible par Defender ?\n2. Quels groupes sont les moins couverts ?\n3. Comment cet écart modifie-t-il la valeur des preuves de politique ?",
     "expected": "La couverture réelle est inférieure au nombre d'appareils gérés : un rapport de politique « réussie » ne couvre pas les appareils silencieux. Cette mesure sert de **dénominateur honnête** à toutes les statistiques du dossier.",
     "check": "La couverture est chiffrée par groupe et utilisée comme dénominateur."
    },
    {
     "title": "Classer les écarts par risque",
     "goal": "Prioriser les écarts selon le risque.",
     "steps": "Listez les écarts trouvés (conflit, doublon, trou, preuve manquante). Pour chacun : **domaine**, **risque**, **probabilité**, **effort de correction**, **propriétaire**.\n\n1. Quels écarts sont à corriger avant l'audit ?\n2. Lesquels sont acceptés avec une personne responsable ?\n3. Lesquels dépendent d'une licence ou d'une décision d'affaires ?",
     "expected": "Les trous de couverture sur des serveurs critiques passent avant les doublons inoffensifs. Un risque accepté nomme la personne et la date de revue. Les dépendances de licence sont signalées comme décision, pas comme défaut technique.",
     "check": "Chaque écart a un risque, un effort, un propriétaire et un statut."
    },
    {
     "title": "Planifier la correction par vagues et les preuves",
     "goal": "Corriger sans créer de nouveaux conflits.",
     "steps": "Proposez trois vagues de correction avec pilote, critère de passage et retour arrière. Pour chaque correction, décrivez la **preuve** après coup (rapport, requête, état local) et la date de contrôle.\n\n1. Comment évitez-vous de réintroduire des conflits ?\n2. Quelle revue périodique proposez-vous ?",
     "expected": "Chaque correction retire un réglage d'une source avant d'en renforcer une autre, par petits lots. La revue trimestrielle contrôle les rapports de conflit et la couverture. La preuve après coup est locale ou dans Defender, pas seulement le tableau de bord de gestion.",
     "check": "Chaque correction a une preuve datée et une revue périodique."
    }
   ],
   "deliverables": [
    "La matrice domaine par source.",
    "La mesure de couverture.",
    "La liste d'écarts classés.",
    "Le plan de correction par vagues."
   ],
   "context": "defender-xdr"
  }
 }
];
