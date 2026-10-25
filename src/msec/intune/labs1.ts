import type { AiProject } from '../../agentic/types.ts';

// Généré par scripts/labs/*.py : ne pas éditer à la main.
export const INTUNE_LABS_1: AiProject[] = [
 {
  "id": "il01",
  "module": "i01",
  "level": "débutant",
  "title": "Choisir le mode de gestion de chaque population d'appareils",
  "problem": "Associer chaque population d'appareils au bon mode de gestion, répartir les rôles d'administration avec étiquettes d'étendue et dresser le dossier des licences et dépendances.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Remplir la table de décision des modes de gestion",
   "Dire qui décide, qui applique, qui prouve",
   "Répartir les rôles avec étiquettes d'étendue",
   "Dresser le dossier de licences et de dépendances"
  ],
  "success": [
   "Chaque population a un mode justifié.",
   "Décision, application et preuve sont distinguées.",
   "Aucun administrateur quotidien n'a un rôle général."
  ],
  "risks": [
   "Gérer un téléphone personnel comme un appareil d'entreprise.",
   "Confondre politique réussie et protection active.",
   "Promettre une fonction sans vérifier la licence."
  ],
  "extensions": [
   "Ajouter une colonne de coût par appareil après consultation des tarifs actuels.",
   "Planifier la revue trimestrielle des rôles."
  ],
  "lab": {
   "client": "**Nordlys Technologies** (450 personnes) migre sa gestion des appareils vers Intune. Le directeur des TI a une liste de populations très différentes : des postes d'entreprise, des postes partagés en atelier, des téléphones personnels utilisés pour le courriel, des tablettes sur le terrain, un kiosque d'accueil et trois ingénieurs qui travaillent sur Linux.\n\nIl vous demande trois choses : **quel niveau de contrôle** pour chaque population (et pourquoi), **qui peut administrer quoi** sans donner des droits excessifs, et **ce que les licences couvrent vraiment**. Il ne veut pas découvrir en production qu'une fonction demande un achat supplémentaire.",
   "mission": "Produire la table de décision des modes de gestion, le plan de rôles avec étendues, et le dossier de licences et de dépendances.",
   "duration": "75 min",
   "mode": "tenant",
   "parts": [
    {
     "title": "Remplir la table de décision des modes de gestion",
     "goal": "Relier propriété, risque et type d'appareil au niveau de contrôle.",
     "steps": "Pour chacune des six populations du tableau « Populations d'appareils », choisissez : **appareil enrôlé** (MDM), **protection des applications seulement** (MAM sans enrôlement), **les deux**, ou **hors périmètre Intune pour l'instant**. Justifiez en une ligne.\n\n1. Quelle propriété de l'appareil (entreprise ou personnelle) limite ce que vous avez le droit de contrôler ?\n2. Quelle donnée doit être protégée (courriel, documents, aucune) ?\n3. Qu'est-ce qui rend la gestion complète impossible ou disproportionnée ?\n4. Où écrivez-vous les cas où vous ne savez pas encore ?",
     "expected": "Une proposition : postes d'entreprise → **enrôlés** avec politiques complètes ; postes partagés → enrôlés avec profil adapté (comptes multiples, effacement à la déconnexion) ; téléphones personnels → **protection des applications seulement** (on protège les données de l'entreprise, pas l'appareil de la personne) ; tablettes de terrain → enrôlées (appareils d'entreprise) ; kiosque → enrôlé en mode dédié ; Linux → **à valider** selon les capacités prises en charge (distribution et type de contrôle).\n\nLe principe : plus l'appareil est personnel, moins on le contrôle, plus on protège **l'application et la donnée**. Les lignes « à valider » sont des engagements honnêtes, pas des lacunes cachées.",
     "check": "Chaque population a un mode, une justification et, au besoin, une mention « à valider »."
    },
    {
     "title": "Dire qui décide, qui applique, qui prouve",
     "goal": "Distinguer le rôle d'Intune, d'Entra et de Defender dans une exigence concrète.",
     "steps": "Pour les quatre exigences ci-dessous, remplissez trois colonnes : **qui décide** (la politique qui exprime la règle), **qui applique** (le composant qui l'impose) et **qui prouve** (la source du rapport qui démontre l'état).\n\n1. « Seuls les appareils chiffrés accèdent au courriel. »\n2. « Les appareils à risque élevé sont bloqués. »\n3. « Le pare-feu est actif sur tous les postes. »\n4. « Un poste volé doit être effaçable à distance. »",
     "expected": "Exemples : (1) décide : politique de conformité Intune + accès conditionnel (Entra) ; applique : accès conditionnel au moment de la connexion ; prouve : rapport de conformité et journal de connexions ; (2) décide : seuil de risque dans la conformité ; le niveau de risque est **évalué par Defender for Endpoint** ; applique : accès conditionnel ; prouve : état du capteur et rapport de conformité ; (3) décide et applique : politique de pare-feu Intune, appliquée par le poste ; prouve : état réel du pare-feu sur l'appareil, pas seulement « politique réussie » ; (4) décide : le rôle autorisé ; applique : l'action d'effacement distante d'Intune ; prouve : l'état de l'action dans l'appareil.\n\nNe confondez jamais « la politique est réussie » et « la protection est active » : ce sont deux preuves différentes.",
     "check": "Chaque exigence a un décideur, un exécutant et une source de preuve distincts."
    },
    {
     "title": "Répartir les rôles avec étiquettes d'étendue",
     "goal": "Donner à chaque administrateur le moindre privilège utile.",
     "steps": "Nordlys a trois sites (Québec, Montréal, Sherbrooke) et quatre profils d'administration : soutien technique, gestionnaire de politiques, responsable de la sécurité des terminaux, auditeur en lecture seule.\n\n1. Quel **rôle intégré** pour chaque profil ?\n2. Comment utilisez-vous les **étiquettes d'étendue** (scope tags) pour que le soutien de Montréal ne voie que les appareils de Montréal ?\n3. Quels profils ne devraient **jamais** avoir un rôle d'administrateur général ?\n4. Quel contrôle périodique garde cette répartition propre ?",
     "expected": "Une répartition : soutien technique → rôle de soutien (Help Desk Operator) avec étiquette de site ; gestionnaire de politiques → Policy and Profile Manager ; sécurité des terminaux → Endpoint Security Manager ; auditeur → Read Only Operator. Chaque site a une **étiquette d'étendue** appliquée aux appareils et aux affectations de rôle. Personne n'a besoin du rôle d'administrateur général pour travailler ; réservez-le à un petit groupe à accès temporaire. Contrôle : revue trimestrielle des affectations de rôles et des étiquettes.",
     "check": "Chaque profil a un rôle intégré, une étendue et aucun n'a de droit général inutile."
    },
    {
     "title": "Dresser le dossier de licences et de dépendances",
     "goal": "Ne rien promettre qui exige un achat ou un prérequis inconnu.",
     "steps": "À partir du tableau « Fonctions demandées », indiquez pour chacune : **incluse dans la licence Intune de base**, **exige un module complémentaire**, **dépend d'un autre service** (Entra, Defender), ou **à vérifier**. Notez la source et la date de lecture.\n\n1. Quelle fonction ne peut pas être livrée tant qu'un autre service n'est pas configuré ?\n2. Quelle fonction a une incertitude que vous devez lever avant d'engager une date ?\n3. Quelle phrase donnez-vous au directeur pour résumer ?",
     "expected": "Typiquement : le chiffrement et la conformité sont inclus dans la licence de gestion de base ; le **moindre privilège pour les administrateurs locaux (gestion des élévations)** exige un module complémentaire de la suite Intune ; l'**accès conditionnel** dépend d'Entra (licence adaptée) ; le **niveau de risque de l'appareil** dépend de Defender for Endpoint ; la défense mobile dépend d'un service tiers ou de Defender. Vérifiez chaque ligne dans la documentation actuelle, car les regroupements de licences changent.\n\nPhrase au directeur : « Voici ce qui est couvert par la licence actuelle, ce qui demande un achat, et ce qui dépend d'un autre service que nous devons d'abord configurer. »",
     "check": "Chaque fonction a une catégorie, une source et une date de lecture."
    }
   ],
   "deliverables": [
    "La table de décision des modes de gestion.",
    "Le tableau décideur, exécutant, preuve.",
    "Le plan de rôles et d'étendues.",
    "Le dossier de licences et de dépendances."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Populations d'appareils",
     "head": [
      "Population",
      "Quantité",
      "Propriété",
      "Donnée"
     ],
     "rows": [
      [
       "Postes d'entreprise",
       "300",
       "Entreprise",
       "Documents et courriel"
      ],
      [
       "Postes partagés en atelier",
       "25",
       "Entreprise",
       "Peu de données, comptes multiples"
      ],
      [
       "Téléphones personnels",
       "80",
       "Personnelle",
       "Courriel et calendrier"
      ],
      [
       "Tablettes de terrain",
       "20",
       "Entreprise",
       "Formulaires et photos"
      ],
      [
       "Kiosque d'accueil",
       "1",
       "Entreprise",
       "Aucune"
      ],
      [
       "Postes Linux d'ingénierie",
       "3",
       "Entreprise",
       "Code source"
      ]
     ]
    },
    {
     "title": "Fonctions demandées",
     "head": [
      "Fonction",
      "Commentaire"
     ],
     "rows": [
      [
       "Chiffrement des disques",
       "Tous les postes"
      ],
      [
       "Conformité et accès conditionnel",
       "Courriel bloqué si non conforme"
      ],
      [
       "Gestion des élévations de privilèges",
       "Remplacer les comptes administrateurs locaux"
      ],
      [
       "Niveau de risque de l'appareil",
       "Venant de Defender"
      ],
      [
       "Défense contre les menaces mobiles",
       "Téléphones"
      ]
     ]
    }
   ]
  },
  "connected": {
   "accounts": "Un locataire de test avec Intune et deux appareils de test.",
   "permissions": "Rôle Intune adapté (par exemple Policy and Profile Manager) dans le locataire de test.",
   "costs": "Licences de test à votre charge ; vérifiez la tarification actuelle.",
   "secrets": "Aucun secret dans le dépôt.",
   "cleanup": "Supprimer les appareils, groupes, étiquettes et rôles de test.",
   "limits": "Facultatif. Utilisez uniquement un locataire de test, jamais un locataire de production."
  }
 },
 {
  "id": "il02",
  "module": "i02",
  "level": "débutant",
  "title": "Concevoir les politiques : bon type, bon ciblage, déploiement par vagues",
  "problem": "Choisir le bon type de politique pour huit réglages, planifier un déploiement par vagues avec filtres et arbitrer des conflits entre politiques et objets de stratégie de groupe.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Choisir le mécanisme pour chaque réglage",
   "Planifier le déploiement par vagues",
   "Arbitrer un conflit de politiques",
   "Coexister avec les GPO et prévoir le retour arrière"
  ],
  "success": [
   "Un seul mécanisme par réglage.",
   "Chaque vague a un critère de passage chiffré.",
   "Le conflit est résolu par la politique du propriétaire."
  ],
  "risks": [
   "Empiler des politiques contradictoires.",
   "Mélanger groupes d'utilisateurs et d'appareils.",
   "Laisser un réglage à la fois dans une GPO et dans Intune."
  ],
  "extensions": [
   "Ajouter un rapport hebdomadaire des conflits.",
   "Documenter la migration progressive des GPO restantes."
  ],
  "lab": {
   "client": "Nordlys gère encore une partie de ses postes avec des **objets de stratégie de groupe** (GPO) et Configuration Manager, et migre vers Intune. Le premier essai a mal tourné : trois politiques contradictoires ont été assignées au même groupe et personne ne savait laquelle gagnait. Un réglage de sécurité n'a **pas été appliqué** pendant deux semaines.\n\nVotre mandat : concevoir la bonne méthode, déployer par vagues, et définir comment on repère et arbitre les conflits.",
   "mission": "Livrer le registre des réglages avec mécanisme et propriétaire, le plan de déploiement par vagues, et l'étude de conflit avec arbitrage.",
   "duration": "75 min",
   "mode": "tenant",
   "parts": [
    {
     "title": "Choisir le mécanisme pour chaque réglage",
     "goal": "Utiliser le bon type de politique plutôt que le premier venu.",
     "steps": "Pour chacun des huit réglages du tableau « Réglages à déployer », choisissez le mécanisme :\n\n1. **Politique de sécurité des terminaux** (Endpoint security) quand elle existe pour le domaine ;\n2. **Catalogue de paramètres** pour un réglage précis non couvert ;\n3. **Base de référence de sécurité** (security baseline) pour un socle recommandé ;\n4. **Modèle ou OMA-URI/ADMX** en dernier recours.\n\nNotez aussi le **propriétaire** (qui est responsable de la valeur) et l'ordre de préférence.",
     "expected": "Règle de préférence : d'abord la politique de sécurité des terminaux (modèle propre à un domaine : antivirus, pare-feu, chiffrement), ensuite le catalogue de paramètres, ensuite la base de référence pour un socle, enfin les mécanismes avancés. Un registre propre donne **un seul mécanisme par réglage** et un propriétaire : la moitié des conflits disparaissent à cette étape.",
     "check": "Chaque réglage a un mécanisme unique et un propriétaire nommé."
    },
    {
     "title": "Planifier le déploiement par vagues",
     "goal": "Déployer progressivement avec des groupes, des filtres et des critères de passage.",
     "steps": "1. Définissez trois vagues : **pilote** (TI et volontaires, 5 %), **vague 1** (20 %), **production** (le reste).\n2. Utilisez-vous des **groupes** ou des **filtres d'affectation** pour cibler (par exemple, exclure les serveurs ou les postes partagés) ? Quelle différence ?\n3. Mélangez-vous des groupes d'utilisateurs et d'appareils ? Pourquoi est-ce risqué ?\n4. Quels **critères de passage** d'une vague à l'autre (rapport de succès des politiques, tickets) ?",
     "expected": "Un plan : trois vagues avec des groupes d'appareils dynamiques ; **filtres** pour exclure des catégories (serveurs, kiosques) sans multiplier les groupes ; ne mélangez pas groupes d'utilisateurs et d'appareils dans une même exclusion (le comportement devient difficile à prédire). Critères : au moins 95 % de succès dans le rapport de la politique et aucun incident bloquant pendant sept jours.",
     "check": "Votre plan a trois vagues, des critères chiffrés et des filtres."
    },
    {
     "title": "Arbitrer un conflit de politiques",
     "goal": "Retrouver la cause d'un réglage non appliqué.",
     "steps": "Voici la situation (tableau « Politiques en conflit ») : trois politiques assignées au même groupe fixent la même option de pare-feu à des valeurs différentes. Le rapport de l'appareil affiche « Conflit ».\n\n1. Que fait Intune quand deux politiques fixent **la même valeur** ? Et quand elles fixent des **valeurs différentes** ?\n2. Quelle politique gardez-vous, et comment décidez-vous ?\n3. Comment s'assurer que le conflit ne revient pas ?",
     "expected": "Quand deux politiques fixent la même valeur, il n'y a généralement pas de conflit ; quand les valeurs diffèrent, le réglage est signalé en conflit et la valeur n'est pas appliquée comme voulu. On garde la politique du **propriétaire du domaine** (la sécurité des terminaux pour le pare-feu), on retire les autres de l'affectation, et on met à jour le registre des réglages. Prévention : un registre avec un propriétaire par réglage et une revue des rapports de conflit chaque semaine.",
     "check": "Vous avez gardé une politique, retiré les autres et mis à jour le registre."
    },
    {
     "title": "Coexister avec les GPO et prévoir le retour arrière",
     "goal": "Éviter qu'une GPO et Intune se battent, et savoir revenir en arrière.",
     "steps": "1. Quelle règle de précédence entre GPO et Intune sur un poste hybride, et comment la rendre explicite ?\n2. Quelle méthode pour migrer un réglage de GPO vers Intune sans interruption ?\n3. Comment annuler une politique qui casse quelque chose ? (retirer l'affectation, changer la valeur, effet sur les appareils hors ligne)\n4. Quel test faites-vous avant la vague de production ?",
     "expected": "Il faut décider qui l'emporte et le consigner : la plupart du temps, le réglage est retiré de la GPO au moment de passer à Intune, **jamais laissé aux deux**. Un retour arrière : retirer l'affectation ou passer la valeur à l'état précédent ; les appareils hors ligne reçoivent le changement à leur prochaine synchronisation. Test : un poste pilote par type de configuration matérielle avant la production.",
     "check": "Vous avez une règle de précédence écrite et un plan de retour arrière."
    }
   ],
   "deliverables": [
    "Le registre des réglages.",
    "Le plan de vagues.",
    "L'étude de conflit.",
    "Le plan de coexistence et de retour arrière."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Réglages à déployer",
     "head": [
      "Réglage",
      "Domaine",
      "Propriétaire pressenti"
     ],
     "rows": [
      [
       "Protection antivirus en temps réel",
       "Antivirus",
       "Sécurité"
      ],
      [
       "Pare-feu : profil public",
       "Pare-feu",
       "Sécurité"
      ],
      [
       "Chiffrement BitLocker",
       "Chiffrement",
       "Sécurité"
      ],
      [
       "Délai de verrouillage de l'écran",
       "Configuration générale",
       "TI"
      ],
      [
       "Désactiver un service hérité",
       "Durcissement",
       "TI"
      ],
      [
       "Règle de mot de passe local",
       "Comptes",
       "Sécurité"
      ],
      [
       "Paramètre de mise à jour",
       "Correctifs",
       "TI"
      ],
      [
       "Blocage des macros de source Internet",
       "Durcissement Office",
       "Sécurité"
      ]
     ]
    },
    {
     "title": "Politiques en conflit",
     "head": [
      "Politique",
      "Mécanisme",
      "Valeur du pare-feu public"
     ],
     "rows": [
      [
       "Pare-feu de base",
       "Politique de sécurité des terminaux",
       "Activé, entrant bloqué"
      ],
      [
       "Socle de sécurité",
       "Base de référence",
       "Activé, entrant autorisé"
      ],
      [
       "Réglage TI hérité",
       "Catalogue de paramètres",
       "Désactivé"
      ]
     ]
    }
   ]
  },
  "connected": {
   "accounts": "Un locataire de test avec Intune et deux appareils de test.",
   "permissions": "Rôle Intune adapté (par exemple Policy and Profile Manager) dans le locataire de test.",
   "costs": "Licences de test à votre charge ; vérifiez la tarification actuelle.",
   "secrets": "Aucun secret dans le dépôt.",
   "cleanup": "Supprimer les politiques, groupes et filtres de test.",
   "limits": "Facultatif. Utilisez uniquement un locataire de test, jamais un locataire de production."
  }
 },
 {
  "id": "il03",
  "module": "i03",
  "level": "intermédiaire",
  "title": "Construire le socle antivirus et prouver qu'il est actif",
  "problem": "Bâtir une politique Defender Antivirus lisible, trancher des demandes d'exclusion et prouver la protection contre la falsification sur le poste.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "PowerShell sur un poste de test (facultatif)"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Définir le socle antivirus",
   "Trancher les demandes d'exclusion",
   "Préparer la preuve de protection contre la falsification",
   "Rédiger la fiche de socle et la tolérance aux changements"
  ],
  "success": [
   "Aucun réglage n'est laissé à « Non configuré » sans décision.",
   "Chaque exclusion est étroite et datée.",
   "La preuve distingue reçu, local et visible."
  ],
  "risks": [
   "Exclure un interpréteur de commandes.",
   "Prendre « politique réussie » pour « protégé ».",
   "Désactiver la protection contre la falsification pour dépanner."
  ],
  "extensions": [
   "Ajouter une requête qui détecte les appareils sans protection active.",
   "Relier le lab au module Defender for Endpoint."
  ],
  "lab": {
   "client": "Nordlys a une politique antivirus « minimale » créée il y a un an. Un audit interne relève que de nombreux réglages sont **« Non configuré »** et que personne ne sait ce que cela signifie réellement. Trois équipes ont de plus demandé des exclusions « pour que ça roule plus vite ».\n\nVotre mandat : définir le **socle antivirus**, décider des exclusions avec rigueur, et préparer la **preuve** que la protection est active et protégée contre la falsification.",
   "mission": "Livrer la fiche du socle antivirus (valeur de chaque réglage), la décision sur les exclusions et la procédure de preuve de protection.",
   "duration": "75 min",
   "mode": "tenant",
   "parts": [
    {
     "title": "Définir le socle antivirus",
     "goal": "Remplacer les « Non configuré » par des valeurs décidées.",
     "steps": "À partir du tableau « Politique actuelle », décidez pour chaque réglage : **valeur voulue**, **raison** et **risque si on laisse « Non configuré »**.\n\n1. Que signifie « Non configuré » : la valeur de Microsoft par défaut, ou celle qui était là avant ? Quelle différence pratique ?\n2. Quels réglages gardez-vous en **configuré** pour qu'ils soient auditables ?\n3. Quelle valeur pour la protection infonuagique et l'envoi d'échantillons ? Quel arbitrage avec la confidentialité ?",
     "expected": "« Non configuré » signifie que la politique **ne fixe rien** : le comportement dépend de ce qui existe déjà localement (valeurs par défaut, autre outil, autre politique). Ce n'est donc ni « activé » ni « désactivé » dans une preuve d'audit. Pour qu'un réglage soit **démontrable**, fixez-le explicitement. Une valeur typique : protection en temps réel activée, protection infonuagique activée, envoi automatique d'échantillons sûrs (avec décision écrite sur la confidentialité).",
     "check": "Chaque réglage a une valeur décidée, une raison et un risque."
    },
    {
     "title": "Trancher les demandes d'exclusion",
     "goal": "Refuser, accepter ou limiter chaque exclusion.",
     "steps": "Pour chaque demande du tableau « Demandes d'exclusion », décidez : **refuser**, **accepter étroitement** ou **accepter avec condition**. Écrivez la portée la plus étroite et la date de revue.\n\n1. Quelles demandes sont **dangereuses par nature** (dossier utilisateur, interpréteur de commandes) ?\n2. Que proposez-vous à la place (signer l'exécutable, déplacer le dossier, exclure un fichier précis) ?\n3. Comment documentez-vous chaque exclusion ?",
     "expected": "Refuser : exclure `C:\\Users` ou `powershell.exe` (donne un angle mort énorme). Accepter étroitement : un fichier précis d'un éditeur reconnu à un emplacement contrôlé, avec une date de revue. Accepter avec condition : un dossier de données d'une application métier, après avoir vérifié que l'éditeur ne recommande pas autre chose. Chaque exclusion va au **registre** (propriétaire, raison, date) : sans registre, l'exclusion devient permanente.",
     "check": "Chaque demande a une décision, une portée étroite et une date de revue."
    },
    {
     "title": "Préparer la preuve de protection contre la falsification",
     "goal": "Démontrer que la protection n'est pas seulement « créée » mais « active ».",
     "steps": "Pour un poste de test, listez ce que vous vérifiez, dans l'ordre :\n\n1. l'état de la politique dans Intune (réussite ou conflit) ;\n2. l'état **sur le poste** : exécutez la commande suivante et lisez chaque valeur.\n\n```powershell\nGet-MpComputerStatus | Select-Object AMServiceEnabled, RealTimeProtectionEnabled, IsTamperProtected, AntivirusSignatureLastUpdated\n```\n\n3. l'état dans le portail Defender (appareil actif, protection contre la falsification vue comme activée).\n\nDites ce qui prouve « politique reçue », ce qui prouve « protection opérationnelle », et ce qui manque pour conclure.",
     "expected": "La politique réussie dans Intune prouve seulement que le réglage a été **reçu** (état de politique). Les valeurs retournées par la commande prouvent l'état **local** : service actif, protection en temps réel, protection contre la falsification et date des signatures. Le portail Defender prouve que le capteur **communique**. Pour conclure à « protection opérationnelle », il faut les trois. Notez que la protection contre la falsification peut empêcher de modifier un réglage localement : c'est voulu.",
     "check": "Vous avez distingué politique reçue, protection locale et visibilité dans le portail."
    },
    {
     "title": "Rédiger la fiche de socle et la tolérance aux changements",
     "goal": "Documenter pour que quelqu'un puisse maintenir le socle.",
     "steps": "Rédigez une fiche d'une page : valeurs retenues, propriétaires, exclusions acceptées, comment on gère **un changement légitime** quand la protection contre la falsification bloque (par exemple un outil de support), et le contrôle trimestriel.\n\n1. Utilisez une seule page : si la fiche déborde, personne ne la lira.\n2. Placez en haut les trois valeurs les plus importantes et leur raison.",
     "expected": "La fiche liste les valeurs et leur raison, renvoie au registre d'exclusions, et décrit la procédure de changement : passer par la politique centrale plutôt que de désactiver localement, avec une approbation et une trace. Contrôle : un rapport mensuel des appareils où la protection contre la falsification n'est pas active.",
     "check": "La fiche permet à un collègue de modifier une valeur sans désactiver la protection."
    }
   ],
   "deliverables": [
    "La fiche du socle antivirus.",
    "Le registre des exclusions décidées.",
    "La procédure de preuve."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Politique actuelle",
     "head": [
      "Réglage",
      "Valeur actuelle"
     ],
     "rows": [
      [
       "Protection en temps réel",
       "Non configuré"
      ],
      [
       "Protection infonuagique",
       "Non configuré"
      ],
      [
       "Envoi d'échantillons",
       "Non configuré"
      ],
      [
       "Applications potentiellement indésirables",
       "Non configuré"
      ],
      [
       "Analyse planifiée",
       "Non configuré"
      ],
      [
       "Protection contre la falsification",
       "Non configuré"
      ]
     ]
    },
    {
     "title": "Demandes d'exclusion",
     "head": [
      "Demandeur",
      "Demande",
      "Raison invoquée"
     ],
     "rows": [
      [
       "Développement",
       "Exclure le dossier C:\\Users",
       "Compilations lentes"
      ],
      [
       "Comptabilité",
       "Exclure un fichier précis d'un éditeur",
       "Lenteur à l'ouverture"
      ],
      [
       "TI",
       "Exclure powershell.exe",
       "Scripts d'inventaire bloqués"
      ],
      [
       "Ingénierie",
       "Exclure le dossier des données de l'application métier",
       "Fichiers volumineux"
      ]
     ]
    }
   ]
  },
  "connected": {
   "accounts": "Un locataire de test avec un poste Windows de test enrôlé.",
   "permissions": "Rôle Intune adapté (par exemple Policy and Profile Manager) dans le locataire de test.",
   "costs": "Licences de test à votre charge ; vérifiez la tarification actuelle.",
   "secrets": "Aucun secret dans le dépôt.",
   "cleanup": "Retirer la politique de test et réinitialiser le poste.",
   "limits": "Facultatif. Utilisez uniquement un locataire de test, jamais un locataire de production."
  }
 },
 {
  "id": "il04",
  "module": "i04",
  "level": "intermédiaire",
  "title": "Passer les règles ASR en blocage en trois temps",
  "problem": "Planifier modes, mesure en audit et exclusions des règles ASR, puis cadrer la protection réseau, l'accès contrôlé aux dossiers et Exploit Protection.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Tableur"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Lire les preuves d'audit",
   "Décider des modes et des critères de passage",
   "Documenter les exclusions et le retour arrière",
   "Cadrer les trois autres protections"
  ],
  "success": [
   "Aucune règle ne passe en blocage sans mesure.",
   "Chaque exclusion est étroite et datée.",
   "L'appareil atypique est investigué avant de décider."
  ],
  "risks": [
   "Passer toutes les règles en blocage lundi.",
   "Exclure un interpréteur de commandes.",
   "Oublier de prévenir un service concerné."
  ],
  "extensions": [
   "Relier le lab au scénario « Règles ASR par vagues » du parcours Scénarios.",
   "Ajouter un rapport hebdomadaire des événements de blocage."
  ],
  "lab": {
   "client": "Nordlys a déployé via Intune huit règles de réduction de la surface d'attaque en **audit** il y a deux semaines. L'équipe de sécurité veut passer en blocage dès lundi. La comptabilité, qui utilise des macros, est inquiète.\n\nVotre mandat : lire les preuves d'audit, décider quelles règles passent en blocage et quand, documenter les exclusions et préparer la communication, puis encadrer trois autres protections (protection réseau, accès contrôlé aux dossiers, Exploit Protection).",
   "mission": "Livrer le tableau des modes par règle, le plan d'audit à blocage avec critères, le registre d'exclusions et le plan des trois autres protections.",
   "duration": "90 min",
   "mode": "tenant",
   "parts": [
    {
     "title": "Lire les preuves d'audit",
     "goal": "Mesurer ce que chaque règle ferait en blocage.",
     "steps": "Les événements d'audit sont dans Defender (table `DeviceEvents`). Dans le terrain de jeu :\n\n```kql\nDeviceEvents\n| where ActionType startswith \"Asr\"\n| summarize Evenements = count(), Appareils = dcount(DeviceName), Premier = min(Timestamp), Dernier = max(Timestamp) by ActionType\n| order by Evenements desc\n```\n\n1. Quelle règle fait le plus de bruit ? Sur combien d'appareils ?\n2. Regardez le détail de la règle « Office lance un processus enfant » :\n\n```kql\nDeviceEvents\n| where ActionType == \"AsrOfficeChildProcessAudited\"\n| summarize Evenements = count() by DeviceName, InitiatingProcessFileName, FileName\n| order by Evenements desc\n```\n\n3. Un appareil sort-il du lot ? Que cela suggère-t-il ?",
     "expected": "Vous devriez voir trois règles avec des volumes différents. Le bruit de la règle Office est réparti sur plusieurs appareils avec des processus comme `cmd.exe`, mais **un appareil se distingue** avec des enchaînements de `WINWORD.EXE` vers `powershell.exe`, ce qui n'est pas du bruit de macro métier. Lecture : on passe en blocage les règles dont le bruit est **expliqué**, et on enquête sur l'appareil atypique avant de décider.",
     "check": "Vous avez classé chaque règle et repéré l'appareil atypique."
    },
    {
     "title": "Décider des modes et des critères de passage",
     "goal": "Décider règle par règle : audit, avertissement ou blocage.",
     "steps": "À partir du tableau « Règles en audit », remplissez pour chaque règle : mode cible, **critère de passage chiffré**, date, responsable. Utilisez trois anneaux : TI (blocage tout de suite), pilote, tous.\n\n1. Quelle règle est assez bien comprise pour passer en blocage au premier anneau ?\n2. Quelle règle exige une revue de la comptabilité avant tout blocage ?\n3. Quel mode intermédiaire (avertissement) offre un compromis quand il est disponible pour la règle ?",
     "expected": "Un exemple : la règle « contenu exécutable du courriel » passe en blocage au premier anneau (peu de faux positifs) ; la règle « Office lance un processus enfant » reste en audit pour la comptabilité jusqu'à la revue des macros ; le mode avertissement permet à une personne de passer outre en connaissance de cause quand la règle le prend en charge. Critère type : « zéro événement non expliqué pendant sept jours ».",
     "check": "Chaque règle a un mode, un critère chiffré, une date et un responsable."
    },
    {
     "title": "Documenter les exclusions et le retour arrière",
     "goal": "Éviter que les exclusions deviennent des trous.",
     "steps": "Rédigez le registre d'exclusions de la règle Office pour la macro de la comptabilité : **portée étroite** (fichier ou chemin précis), raison, propriétaire, date de revue.\n\n1. Quelle exclusion refuseriez-vous automatiquement ?\n2. Comment annulez-vous une règle en blocage qui casse une application métier un lundi matin ?\n3. Quel message envoyez-vous à la comptabilité ?",
     "expected": "Refuser : toute exclusion qui désactive la règle pour un interpréteur de commandes ou un dossier utilisateur. Retour arrière : repasser la règle en audit par la politique, avec un responsable de garde et un délai de propagation connu. Message : court, avec la date, l'effet attendu et la personne à joindre.",
     "check": "Le registre a une portée étroite et le retour arrière est décrit."
    },
    {
     "title": "Cadrer les trois autres protections",
     "goal": "Auditer avant d'imposer pour protection réseau, accès contrôlé aux dossiers et Exploit Protection.",
     "steps": "Pour chaque protection, écrivez : **mode d'audit**, **comment mesurer l'effet**, **risque de compatibilité**, **critère de passage en blocage**.\n\n1. Protection réseau : que mesure-t-on avant de bloquer ?\n2. Accès contrôlé aux dossiers : quels dossiers protégés, quelles applications autorisées ?\n3. Exploit Protection : pourquoi faut-il tester par application, et comment éviter de casser une application ancienne ?",
     "expected": "Ces trois protections ont toutes un **mode d'audit**. Pour la protection réseau : événements d'audit des connexions qui auraient été bloquées. Pour l'accès contrôlé aux dossiers : dossiers de documents et liste d'applications approuvées. Pour Exploit Protection : réglages par application, testés avec les applications métier, car une atténuation peut empêcher le démarrage d'un vieux logiciel. Dans les trois cas : audit, mesure, anneaux, puis blocage.",
     "check": "Chaque protection a un audit, une mesure et un critère de passage."
    }
   ],
   "deliverables": [
    "Le tableau des modes par règle.",
    "Le plan de passage en blocage avec critères.",
    "Le registre d'exclusions.",
    "Le plan des trois protections."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Règles en audit",
     "head": [
      "Règle",
      "Événements (14 jours)",
      "Appareils",
      "Impression"
     ],
     "rows": [
      [
       "Contenu exécutable du courriel",
       "14",
       "12",
       "Faible risque métier"
      ],
      [
       "Office lance un processus enfant",
       "14",
       "8",
       "Macros de la comptabilité"
      ],
      [
       "Téléchargement de script exécutable",
       "11",
       "9",
       "Scripts d'inventaire"
      ]
     ]
    }
   ]
  },
  "connected": {
   "accounts": "Un locataire de test avec Intune et un poste Windows de test intégré à Defender for Endpoint.",
   "permissions": "Rôle Intune adapté (par exemple Policy and Profile Manager) dans le locataire de test.",
   "costs": "Licences de test à votre charge ; vérifiez la tarification actuelle.",
   "secrets": "Aucun secret dans le dépôt.",
   "cleanup": "Remettre les règles à leur mode par défaut et supprimer la politique de test.",
   "limits": "Facultatif. Ne passez jamais une règle en blocage sur un poste de production pour un exercice."
  }
 }
];
