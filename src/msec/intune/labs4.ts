import type { AiProject } from '../../agentic/types.ts';

// Généré par scripts/labs/*.py : ne pas éditer à la main.
export const INTUNE_LABS_4: AiProject[] = [
 {
  "id": "il13",
  "module": "i13",
  "level": "avancé",
  "title": "Gouverner WSL au lieu de l'interdire par réflexe",
  "problem": "Décider qui peut utiliser WSL et sous quelles conditions, choisir le bon mécanisme de configuration et tenir un registre honnête des exigences non prises en charge.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Décider par population",
   "Concevoir le plan de gouvernance",
   "Choisir le mécanisme de configuration",
   "Tenir le registre des exigences non prises en charge"
  ],
  "success": [
   "La décision n'est pas un interdit par réflexe.",
   "La limite de visibilité est écrite.",
   "Chaque exigence non réalisable a une compensation."
  ],
  "risks": [
   "Interdire sans offrir d'alternative.",
   "Promettre une inspection impossible.",
   "Utiliser OMA-URI sans chercher dans le catalogue."
  ],
  "extensions": [
   "Relier au scénario WSL du parcours Scénarios.",
   "Ajouter un inventaire des distributions installées."
  ],
  "lab": {
   "client": "Les développeurs de Nordlys utilisent le **sous-système Windows pour Linux** (WSL) pour leurs outils. Le responsable de la sécurité veut « l'interdire parce qu'on ne voit rien dedans ». Les développeurs répondent que sans WSL, leur productivité s'effondre. Vous devez trancher avec des faits : ce que l'on peut contrôler, ce que l'on voit, ce qui reste hors de portée.\n\nVotre mandat : une **décision de gouvernance** documentée, un plan de contrôle et un registre des exigences qu'on ne sait pas encore satisfaire.",
   "mission": "Livrer le tableau de décision WSL par population, le plan de gouvernance, le choix de mécanisme pour trois réglages et le registre des exigences non prises en charge.",
   "duration": "90 min",
   "mode": "tenant",
   "parts": [
    {
     "title": "Décider par population",
     "goal": "Autoriser, restreindre ou interdire selon le risque, pas selon la peur.",
     "steps": "À partir du tableau « Populations », décidez pour chacune : **autoriser avec contrôles**, **autoriser avec exception approuvée**, ou **interdire**. Justifiez.\n\n1. Quels risques propres à WSL (visibilité réduite, outils installés hors inventaire, accès aux fichiers Windows) ?\n2. Quelle population a un besoin professionnel démontré ?\n3. Quelles conditions préalables (mise à jour, distributions autorisées, protection antivirus) ?",
     "expected": "Un choix : développeurs → autoriser avec contrôles ; ingénierie de données → autoriser avec exception approuvée et revue ; comptabilité et direction → interdire (aucun besoin). Les risques sont réels (le contenu d'une distribution est moins visible pour les outils classiques), mais ils se **réduisent** par des contrôles : version contrôlée, distributions limitées, plugiciel de sécurité, journalisation. Interdire par réflexe pousse les gens à contourner.",
     "check": "Chaque population a une décision et une condition."
    },
    {
     "title": "Concevoir le plan de gouvernance",
     "goal": "Définir ce qu'on contrôle et comment on le vérifie.",
     "steps": "Rédigez le plan : **qui** peut l'activer, **quelles distributions** sont permises, **mises à jour** de WSL et des distributions, **protection** (plugiciel Defender pour WSL, quand disponible), **journalisation**, **conformité** (un appareil avec WSL non conforme est-il traité comme non conforme ?).\n\n1. Quelle preuve montre qu'une distribution est à jour ?\n2. Que voit Defender dans WSL, et que ne voit-il pas ?\n3. Quel est le plan si un développeur installe une distribution non approuvée ?",
     "expected": "Éléments : activation par exception ou par groupe, distributions listées, mise à jour régulière vérifiée, plugiciel de sécurité activé quand disponible, conformité qui peut tenir compte du composant. **Visibilité limitée** : même avec le plugiciel, certaines activités internes restent moins visibles : notez-le dans le plan comme une limite connue. Pour une distribution non approuvée : détection par inventaire, discussion, alternative approuvée.",
     "check": "Votre plan a des conditions vérifiables et une limite de visibilité écrite."
    },
    {
     "title": "Choisir le mécanisme de configuration",
     "goal": "Utiliser le catalogue de paramètres, OMA-URI ou ADMX selon le cas.",
     "steps": "Pour trois réglages (tableau « Réglages à gouverner »), choisissez le mécanisme : **catalogue de paramètres**, **OMA-URI personnalisé**, **modèle ADMX importé** ou **aucun mécanisme disponible**.\n\n1. Quel est l'ordre de préférence et pourquoi ?\n2. Comment vérifiez-vous qu'un paramètre existe dans le catalogue avant de recourir à OMA-URI ?\n3. Quel risque pose OMA-URI (erreur de syntaxe, dérive, aucune validation) ?",
     "expected": "Préférer le catalogue (validé, lisible), puis ADMX importé, puis OMA-URI en dernier recours. Avant d'écrire un OMA-URI, cherchez dans le catalogue : de nouveaux paramètres y arrivent régulièrement. Un OMA-URI mal formé peut échouer silencieusement : testez sur un poste pilote et vérifiez l'**état réel**.",
     "check": "Chaque réglage a un mécanisme et une vérification."
    },
    {
     "title": "Tenir le registre des exigences non prises en charge",
     "goal": "Dire honnêtement ce qu'on ne peut pas faire.",
     "steps": "À partir des exigences de l'équipe de sécurité (tableau « Exigences »), classez-les : **réalisable**, **réalisable avec compensation**, **non réalisable aujourd'hui**. Pour chaque exigence non réalisable, notez : raison, compensation, **date de revue**.",
     "expected": "Exemple : « inspecter chaque commande dans WSL » est **non réalisable** aujourd'hui ; compensation : limiter l'usage, journaliser l'accès aux fichiers Windows, revue trimestrielle. Un registre honnête protège la crédibilité de l'équipe : mieux vaut écrire « pas encore » que promettre un contrôle qui n'existe pas.",
     "check": "Chaque exigence non réalisable a une raison, une compensation et une date de revue."
    }
   ],
   "deliverables": [
    "Le tableau de décision WSL.",
    "Le plan de gouvernance.",
    "Le choix des mécanismes.",
    "Le registre des exigences non prises en charge."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Populations",
     "head": [
      "Population",
      "Quantité",
      "Besoin déclaré"
     ],
     "rows": [
      [
       "Développeurs",
       "25",
       "Outils de compilation Linux"
      ],
      [
       "Ingénierie de données",
       "6",
       "Bibliothèques spécialisées"
      ],
      [
       "Comptabilité",
       "20",
       "Aucun"
      ],
      [
       "Direction",
       "8",
       "Aucun"
      ]
     ]
    },
    {
     "title": "Réglages à gouverner",
     "head": [
      "Réglage",
      "Objectif"
     ],
     "rows": [
      [
       "Activer ou non le composant",
       "Réserver aux groupes autorisés"
      ],
      [
       "Version du composant",
       "Obtenir les correctifs"
      ],
      [
       "Accès aux fichiers Windows depuis la distribution",
       "Limiter l'exposition"
      ]
     ]
    },
    {
     "title": "Exigences",
     "head": [
      "Exigence"
     ],
     "rows": [
      [
       "Inspecter chaque commande exécutée dans WSL"
      ],
      [
       "Empêcher l'installation de distributions non approuvées"
      ],
      [
       "Voir les distributions installées sur chaque poste"
      ],
      [
       "Appliquer la protection antivirus aux fichiers de la distribution"
      ]
     ]
    }
   ]
  },
  "connected": {
   "accounts": "Un locataire de test avec Intune et un poste Windows de test avec WSL.",
   "permissions": "Rôle Intune adapté (par exemple Policy and Profile Manager) dans le locataire de test.",
   "costs": "Licences de test à votre charge ; vérifiez la tarification actuelle.",
   "secrets": "Aucun secret dans le dépôt.",
   "cleanup": "Supprimer la politique de test et désinstaller la distribution de test.",
   "limits": "Facultatif. Utilisez uniquement un locataire de test, jamais un locataire de production."
  }
 },
 {
  "id": "il14",
  "module": "i14",
  "level": "avancé",
  "title": "Sécurité par plateforme : Mac, mobiles et Linux sans copier Windows",
  "problem": "Comparer les contrôles disponibles sur macOS, iOS, Android et Linux, concevoir la sécurité d'une flotte mobile et tenir une matrice de plateformes honnête.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Construire le tableau comparatif",
   "Concevoir la sécurité de la flotte mobile",
   "Évaluer les limites de Linux",
   "Maintenir la matrice de plateformes"
  ],
  "success": [
   "Aucune exigence n'est copiée de Windows sans vérification.",
   "Chaque cellule de la matrice a une date et une source.",
   "Les postes Linux ne sont pas comptés comme conformes sans preuve."
  ],
  "risks": [
   "Copier la politique Windows ailleurs.",
   "Promettre la détection d'un appareil débridé sans vérifier.",
   "Laisser une cellule « non vérifié » sans suivi."
  ],
  "extensions": [
   "Ajouter la colonne « effort de déploiement ».",
   "Planifier la revue de la matrice après chaque version majeure."
  ],
  "lab": {
   "client": "Nordlys équipe maintenant ses commerciaux de **iPhone**, ses livreurs de **tablettes Android**, ses designers de **Mac** et trois ingénieurs de **postes Linux**. L'équipe a copié la politique Windows « telle quelle » sur ces plateformes, et la moitié des réglages n'existent pas. Résultat : des tableaux de bord verts qui ne prouvent rien.\n\nVotre mandat : un tableau comparatif honnête, un plan de sécurité de la flotte mobile, et une **matrice de plateformes** maintenue, qui dit clairement ce qui est disponible, ce qui diffère, ce qu'on ne sait pas.",
   "mission": "Livrer le tableau comparatif des contrôles, le plan de sécurité de la flotte mobile et la matrice de plateformes avec certitude et dates.",
   "duration": "90 min",
   "mode": "tenant",
   "parts": [
    {
     "title": "Construire le tableau comparatif",
     "goal": "Associer chaque exigence aux leviers réels de chaque plateforme.",
     "steps": "Pour les six exigences du tableau « Exigences de sécurité », remplissez les colonnes macOS, iOS/iPadOS, Android Enterprise et Linux : **mécanisme** disponible, **limite** ou « non disponible », et **source à vérifier**.\n\n1. Quelles exigences Windows n'ont **aucun équivalent direct** ailleurs ?\n2. Quelles exigences existent sous une autre forme (par exemple, chiffrement par FileVault sur Mac, chiffrement natif sur iOS) ?\n3. Quelle ligne exige le plus de prudence avant de promettre ?",
     "expected": "Quelques points : le chiffrement est natif et vérifiable sur iOS et configurable sur macOS (FileVault) ; la **détection de jailbreak ou de débridage** relève de la conformité mobile et d'indicateurs d'intégrité ; les règles ASR n'ont pas d'équivalent direct sur les autres plateformes ; Linux a des capacités de conformité propres, limitées à certaines distributions. Ne promettez rien sans vérification dans la documentation de la plateforme.",
     "check": "Chaque cellule a un mécanisme, une limite ou « non disponible »."
    },
    {
     "title": "Concevoir la sécurité de la flotte mobile",
     "goal": "Choisir les modes de gestion et les contrôles sur iPhone et Android.",
     "steps": "1. iPhone d'entreprise : inscription **supervisée** (inscription automatisée) ou non ? Que cela débloque-t-il ?\n2. Android : quel mode (**entièrement géré**, **profil professionnel**, **dédié**) pour les tablettes de livraison, et pour les téléphones personnels ?\n3. Comment utilisez-vous **Play Integrity** (niveaux de vérification d'intégrité) pour la conformité ?\n4. Que fait la **défense contre les menaces mobiles** et quel service ou licence exige-t-elle ?",
     "expected": "Supervision sur iOS : permet des restrictions plus étendues qu'une inscription simple. Android : tablettes de livraison en mode entièrement géré ou dédié ; téléphones personnels en profil professionnel. Play Integrity : plusieurs niveaux de vérification (de base, appareil, forte) qui s'ajoutent à la conformité. La défense mobile est un service distinct (Defender ou un partenaire) : il faut une licence et une intégration, et elle n'élimine pas le risque d'un appareil compromis.",
     "check": "Chaque population mobile a un mode de gestion et un contrôle d'intégrité."
    },
    {
     "title": "Évaluer les limites de Linux",
     "goal": "Ne rien transposer sans preuve.",
     "steps": "Pour les trois postes Linux : \n\n1. Quelle **distribution et version** sont prises en charge pour la conformité et l'intégration Defender ?\n2. Quelles exigences de la matrice sont **non réalisables** aujourd'hui ?\n3. Quelle alternative (outil d'automatisation, durcissement par configuration) ?\n4. Comment prouvez-vous l'état de conformité d'un poste Linux ?",
     "expected": "La prise en charge Linux dans Intune est limitée à certaines distributions et versions ; vérifiez la documentation. Les exigences non couvertes sont notées avec une compensation (configuration gérée par un outil d'automatisation, accès restreint). La preuve vient du rapport de conformité Linux **s'il existe pour la distribution**, sinon d'une vérification locale scriptée. Ne mettez pas ces postes dans un tableau « conforme » global sans le préciser.",
     "check": "Vous avez distingué ce qui est géré par Intune de ce qui est géré autrement."
    },
    {
     "title": "Maintenir la matrice de plateformes",
     "goal": "Garder la matrice à jour et honnête.",
     "steps": "Concevez la matrice : lignes = capacités, colonnes = plateformes, cellules = **disponible**, **limité**, **non disponible**, **non vérifié**, avec la **date** et la **source**. Définissez la fréquence de revue et le propriétaire.\n\n1. Quand déclenchez-vous une revue en dehors du calendrier (nouvelle version majeure d'un système, annonce de Microsoft) ?\n2. Comment empêchez-vous une cellule « non vérifié » de devenir un « oui » par habitude ?",
     "expected": "Une matrice vivante : revue trimestrielle plus revue sur annonce ; une cellule « non vérifié » ne passe à « disponible » qu'avec une **source datée**. Le propriétaire est nommé. La matrice sert de réponse à « est-ce qu'on couvre tout comme sur Windows ? » : la réponse honnête est dans les cellules.",
     "check": "La matrice a des dates, des sources, un propriétaire et une règle sur les cellules non vérifiées."
    }
   ],
   "deliverables": [
    "Le tableau comparatif.",
    "Le plan de sécurité de la flotte mobile.",
    "L'évaluation Linux.",
    "La matrice de plateformes."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Exigences de sécurité",
     "head": [
      "#",
      "Exigence"
     ],
     "rows": [
      [
       "1",
       "Disque chiffré"
      ],
      [
       "2",
       "Pare-feu actif"
      ],
      [
       "3",
       "Détection d'un appareil débridé ou compromis"
      ],
      [
       "4",
       "Protection antivirus avec preuve d'état"
      ],
      [
       "5",
       "Effacement à distance"
      ],
      [
       "6",
       "Contrôle des logiciels autorisés"
      ]
     ]
    }
   ]
  },
  "connected": {
   "accounts": "Un locataire de test avec Intune, un appareil Apple ou Android de test.",
   "permissions": "Rôle Intune adapté (par exemple Policy and Profile Manager) dans le locataire de test.",
   "costs": "Licences de test à votre charge ; vérifiez la tarification actuelle.",
   "secrets": "Aucun secret dans le dépôt.",
   "cleanup": "Retirer l'appareil et supprimer les politiques de test.",
   "limits": "Facultatif. N'inscrivez jamais un appareil personnel réel pour un exercice."
  }
 },
 {
  "id": "il15",
  "module": "i15",
  "level": "avancé",
  "title": "Lire les rapports, dépanner et surveiller la gestion des appareils",
  "problem": "Distinguer les quatre états d'une politique à partir d'un extrait de rapport, dépanner un appareil qui ne reçoit pas sa politique et organiser la revue après une mise à jour de Microsoft.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Lire les quatre états",
   "Écrire la procédure de dépannage",
   "Utiliser l'audit et les interfaces de programmation",
   "Mettre en place la revue après les mises à jour de Microsoft"
  ],
  "success": [
   "Chaque appareil est classé dans un des quatre états.",
   "La procédure de dépannage a un ordre.",
   "La revue a un propriétaire et un registre."
  ],
  "risks": [
   "Interpréter 96 % comme 96 % protégés.",
   "Collecter un diagnostic avant de vérifier l'assignation.",
   "Oublier la revue après une mise à jour."
  ],
  "extensions": [
   "Créer un tableau de bord des quatre états.",
   "Planifier un test trimestriel de bon fonctionnement."
  ],
  "lab": {
   "client": "Au comité de sécurité, un tableau de bord Intune affiche « 96 % de réussite ». Un membre demande : « Donc 96 % de nos postes sont protégés ? » Vous savez que ce chiffre mesure seulement que la politique a été **reçue**, pas que la protection est **opérationnelle**. De plus, un technicien dit qu'un poste « ne prend pas la politique » sans savoir par où commencer.\n\nVotre mandat : apprendre à lire les rapports, écrire une procédure de dépannage, et mettre en place la surveillance et la revue après les mises à jour de Microsoft.",
   "mission": "Livrer la fiche de lecture des quatre états, la procédure de dépannage et le plan de surveillance et de revue.",
   "duration": "75 min",
   "mode": "tenant",
   "parts": [
    {
     "title": "Lire les quatre états",
     "goal": "Distinguer politique créée, assignée, reçue et protection opérationnelle.",
     "steps": "À partir de l'extrait « Rapport de la politique antivirus », classez chaque appareil dans l'état qui correspond à la **dernière preuve que vous avez** :\n\n1. **créée** (la politique existe) ;\n2. **assignée** (ciblée vers l'appareil) ;\n3. **reçue** (l'appareil l'a appliquée) ;\n4. **opérationnelle** (la protection est vérifiée sur l'appareil, le capteur communique).\n\nPour chaque appareil, écrivez ce qui **manque** pour passer à l'état suivant.",
     "expected": "Un état « Réussi » dans le rapport prouve **reçue**, pas **opérationnelle**. Pour atteindre le quatrième état, il faut une preuve complémentaire : état local, capteur actif dans Defender, signatures récentes. Les appareils « En attente » sont assignés mais pas reçus (hors ligne, pas de synchronisation) ; un « Conflit » n'a pas reçu la valeur voulue ; un « Non applicable » n'est pas ciblé comme vous pensiez. Le chiffre de 96 % ne dit rien sur les trois autres états.",
     "check": "Chaque appareil est classé et la preuve manquante est nommée."
    },
    {
     "title": "Écrire la procédure de dépannage",
     "goal": "Trouver rapidement où une politique s'arrête.",
     "steps": "Rédigez la procédure en étapes ordonnées pour « un poste ne prend pas la politique » :\n\n1. vérifier l'**assignation** (groupe, filtre, exclusion) ;\n2. vérifier la **dernière synchronisation** et lancer une synchronisation à distance ;\n3. lire l'**état par réglage** (réussi, erreur, conflit, non applicable) ;\n4. **collecter un diagnostic** de l'appareil ; que contient-il ?\n5. quand escalader.\n\nPrécisez pour chaque étape l'outil utilisé et la durée acceptable.",
     "expected": "Ordre efficace : l'assignation et les filtres d'abord (cause fréquente), puis la synchronisation (action à distance), puis l'état par réglage, puis la collecte de diagnostic (journaux de gestion de l'appareil) pour les cas obscurs. Le diagnostic collecté contient les journaux de gestion utiles pour comprendre une erreur de configuration. Escalade si aucun changement après deux synchronisations et un diagnostic.",
     "check": "Votre procédure a un ordre, un outil par étape et un critère d'escalade."
    },
    {
     "title": "Utiliser l'audit et les interfaces de programmation",
     "goal": "Savoir qui a changé quoi et automatiser le suivi.",
     "steps": "1. Où retrouvez-vous **qui a modifié** une politique et quand ?\n2. Comment une **interface de programmation** (Microsoft Graph) peut-elle alimenter un tableau de bord de conformité ?\n3. Quelle permission **minimale** donneriez-vous à une application de suivi, et comment protégeriez-vous son secret ?\n4. Quelle limite connaissez-vous (délai des données, périmètre des rapports) ?",
     "expected": "Le **journal d'audit** d'Intune consigne les modifications de politiques (qui, quoi, quand). Graph permet d'extraire des rapports et de les assembler dans un tableau de bord ; une application de suivi n'a besoin que de **lecture** sur les rapports, avec un certificat ou un secret conservé dans un coffre. Limites : les données ont un délai et certains rapports exigent des permissions particulières.",
     "check": "Vous avez nommé le journal d'audit, la permission minimale et une limite des données."
    },
    {
     "title": "Mettre en place la revue après les mises à jour de Microsoft",
     "goal": "Détecter qu'une fonction a changé avant qu'elle ne vous surprenne.",
     "steps": "Concevez la revue : **sources à surveiller** (documentation, annonces), **fréquence**, **qui lit**, comment vous mettez à jour les **fiches de configuration** et la **matrice de plateformes**, comment vous consignez un changement (date, source, effet).\n\n1. Quel déclencheur provoque une revue immédiate ?\n2. Comment évitez-vous que la revue soit oubliée ?",
     "expected": "Une revue mensuelle des annonces et de la documentation de chaque domaine (antivirus, ASR, chiffrement, conformité), avec un propriétaire par domaine et un registre de modifications. Déclencheur immédiat : annonce de retrait ou de changement de comportement d'une fonction que vous utilisez. La revue est planifiée dans un calendrier d'équipe avec un suivi des actions.",
     "check": "Votre revue a des sources, un propriétaire, une fréquence et un registre."
    }
   ],
   "deliverables": [
    "La fiche de lecture des quatre états.",
    "La procédure de dépannage.",
    "Le plan de surveillance.",
    "Le plan de revue après mise à jour."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Rapport de la politique antivirus",
     "head": [
      "Appareil",
      "État dans le rapport",
      "Dernière synchronisation",
      "Capteur Defender"
     ],
     "rows": [
      [
       "PC-201",
       "Réussi",
       "Aujourd'hui",
       "Actif"
      ],
      [
       "PC-202",
       "Réussi",
       "Aujourd'hui",
       "Inactif"
      ],
      [
       "PC-203",
       "En attente",
       "Il y a 12 jours",
       "Actif"
      ],
      [
       "PC-204",
       "Conflit",
       "Hier",
       "Actif"
      ],
      [
       "PC-205",
       "Non applicable",
       "Hier",
       "Actif"
      ],
      [
       "PC-206",
       "Erreur",
       "Aujourd'hui",
       "Non intégré"
      ]
     ]
    }
   ]
  },
  "connected": {
   "accounts": "Un locataire de test avec Intune et un poste de test.",
   "permissions": "Rôle Intune adapté (par exemple Policy and Profile Manager) dans le locataire de test.",
   "costs": "Licences de test à votre charge ; vérifiez la tarification actuelle.",
   "secrets": "Aucun secret dans le dépôt.",
   "cleanup": "Supprimer la politique de test et l'application de suivi.",
   "limits": "Facultatif. Ne donnez jamais plus de permissions de lecture que nécessaire à une application de suivi."
  }
 }
];
