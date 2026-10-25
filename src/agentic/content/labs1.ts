import type { AiProject } from '../../agentic/types.ts';

// Généré par scripts/labs/*.py : ne pas éditer à la main.
export const IA_LABS_1: AiProject[] = [
 {
  "id": "m01-p1",
  "module": "m01",
  "level": "débutant",
  "title": "Politique d'usage responsable de l'IA pour un SOC",
  "problem": "Rédiger la politique d'usage de l'IA générative pour une équipe SOC de 12 personnes : quelles données, quels outils, quelle validation, quels coûts.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Éditeur de texte",
   "Tableur"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Inventorier les usages réels",
   "Classer les données et choisir les outils permis",
   "Estimer coûts et contexte",
   "Rédiger la politique d'une page"
  ],
  "success": [
   "Les secrets ne vont jamais dans un outil d'IA.",
   "Chaque classe de données a une règle.",
   "La validation humaine est obligatoire."
  ],
  "risks": [
   "Interdire sans alternative.",
   "Ignorer le coût du contexte.",
   "Traiter la sortie du modèle comme un fait."
  ],
  "extensions": [
   "Ajouter un modèle de demande d'approbation d'un nouvel outil.",
   "Mesurer l'usage après un mois."
  ],
  "lab": {
   "client": "**Nordlys Technologies** exploite un SOC de 12 personnes. Depuis trois mois, plusieurs analystes collent des alertes, des adresses IP et parfois des extraits de courriels dans des assistants d'IA publics. Personne n'a écrit de règle, et la direction a entendu parler de « fuites par l'IA » dans la presse.\n\nVous êtes la personne désignée pour écrire la **politique d'usage** : simple, applicable, et qui n'interdit pas ce qui aide vraiment.",
   "mission": "Inventorier les usages réels, classer les données par sensibilité, choisir les types d'IA permis pour chaque classe, estimer les coûts et rédiger la politique d'une page.",
   "duration": "90 min",
   "mode": "simule",
   "parts": [
    {
     "title": "Inventorier les usages réels",
     "goal": "Savoir ce que font vraiment les analystes.",
     "steps": "À partir du tableau « Usages observés », classez chaque usage en trois colonnes : **utile**, **risqué**, **à encadrer**.\n\n1. Quels usages manipulent des données de clients ou d'employés ?\n2. Quels usages transmettent des secrets (clés, jetons, mots de passe) ?\n3. Quels usages se feraient très bien avec des données **anonymisées** ?\n4. Quel usage mérite d'être encouragé, et pourquoi ?",
     "expected": "La colonne « à encadrer » est la plus grande. Les usages qui manipulent des données de clients ou des secrets sont risqués par défaut ; ceux qui travaillent sur du texte public ou anonymisé sont utiles. Un inventaire honnête évite une politique qui interdit tout et que personne ne respecte.",
     "check": "Chaque usage est classé avec la raison et au moins un usage est explicitement encouragé."
    },
    {
     "title": "Classer les données et choisir les outils permis",
     "goal": "Relier sensibilité et type de déploiement.",
     "steps": "Construisez une matrice : lignes = classes de données (publique, interne, confidentielle, secrète), colonnes = types d'IA (service public, service d'entreprise avec contrat, modèle hébergé chez vous).\n\n1. Pour chaque case, écrivez **permis**, **permis avec anonymisation** ou **interdit**.\n2. Que faites-vous des secrets ?\n3. Qui valide qu'un service est « d'entreprise » ?",
     "expected": "Règle simple : rien de confidentiel dans un service public ; les secrets jamais, dans aucun outil ; le service d'entreprise sous contrat pour l'interne et le confidentiel anonymisé. L'équipe de sécurité valide la liste des services d'entreprise, pas chaque analyste.",
     "check": "La matrice a une réponse par case et une personne qui valide la liste des outils."
    },
    {
     "title": "Estimer coûts et contexte",
     "goal": "Ne pas découvrir le coût à la facture.",
     "steps": "Calculez pour un assistant de résumé d'alertes : 200 alertes par jour, 800 jetons d'entrée et 250 jetons de sortie en moyenne.\n\n1. Jetons par jour, par mois (22 jours ouvrables).\n2. Coût mensuel avec un tarif fictif de 3 $ par million de jetons d'entrée et 12 $ par million de sortie.\n3. Que devient le coût si l'on ajoute le runbook complet (6000 jetons) à chaque appel ?\n4. Quelle limite fixez-vous ?",
     "expected": "Environ 160 000 jetons d'entrée et 50 000 de sortie par jour ; le coût mensuel reste modeste. Ajouter le runbook complet multiplie les jetons d'entrée par près de huit : le coût suit et le contexte se remplit. La leçon : mesurer avant de généraliser, fixer un plafond et une alerte.",
     "check": "Les calculs sont justes et un plafond avec alerte est défini."
    },
    {
     "title": "Rédiger la politique d'une page",
     "goal": "Un texte court que les gens liront.",
     "steps": "Rédigez la politique : **objet**, **ce qui est permis**, **ce qui est interdit**, **validation humaine obligatoire** pour toute décision, **qui contacter**, **revue semestrielle**.\n\n1. Écrivez-la en moins de 350 mots.\n2. Ajoutez un exemple concret de bon usage et un de mauvais.\n3. Ajoutez la phrase sur les hallucinations : l'IA peut inventer, l'analyste vérifie.",
     "expected": "Une bonne politique tient sur une page, donne des exemples et nomme un contact. La phrase sur les hallucinations est essentielle : sans elle, l'équipe traitera la sortie du modèle comme un fait. Relisez enfin la politique avec deux analystes : si l'un d'eux ne sait pas répondre à « puis-je coller cette alerte ? » en dix secondes, le texte est trop long ou trop flou.",
     "check": "La politique tient en une page avec exemples, contact et règle de validation humaine."
    }
   ],
   "deliverables": [
    "L'inventaire des usages classés.",
    "La matrice données et outils.",
    "Le calcul de coût.",
    "La politique d'une page."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Usages observés",
     "head": [
      "Usage",
      "Donnée manipulée",
      "Fréquence"
     ],
     "rows": [
      [
       "Résumer une alerte",
       "Extrait d'alerte avec noms d'hôtes",
       "Quotidien"
      ],
      [
       "Expliquer une commande PowerShell",
       "Ligne de commande d'un poste",
       "Hebdomadaire"
      ],
      [
       "Rédiger un rapport",
       "Chronologie d'un incident client",
       "Hebdomadaire"
      ],
      [
       "Déboguer un script",
       "Script contenant une clé d'API",
       "Occasionnel"
      ],
      [
       "Traduire un courriel suspect",
       "Courriel complet d'un employé",
       "Occasionnel"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "m02-p1",
  "module": "m02",
  "level": "débutant",
  "title": "Workflow ou agent : choisir sans se tromper",
  "problem": "Analyser cinq tâches d'un SOC et décider, pour chacune, entre workflow fixe, assistant ou agent, en justifiant par autonomie, outils et risques.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Décrire cinq tâches avec les mêmes critères",
   "Décider et justifier",
   "Définir le périmètre de la tâche retenue",
   "Écrire la carte de décision"
  ],
  "success": [
   "Le choix le plus simple est préféré.",
   "Les actions irréversibles exigent une approbation.",
   "Le périmètre est écrit avant la construction."
  ],
  "risks": [
   "Choisir un agent par enthousiasme.",
   "Donner des outils d'écriture sans approbation.",
   "Oublier la limite d'étapes."
  ],
  "extensions": [
   "Appliquer la carte à vos propres tâches.",
   "Ajouter une colonne coût estimé."
  ],
  "lab": {
   "client": "Le responsable du SOC de **Nordlys** veut « un agent pour tout ». Vous devez lui montrer, tâche par tâche, quand un **workflow fixe** suffit, quand un **assistant** aide, et quand seulement un **agent** se justifie, avec les garde-fous correspondants. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.",
   "mission": "Classer cinq tâches selon la prévisibilité, le risque et l'autonomie nécessaire, puis définir pour la tâche retenue le périmètre, les outils et la limite de l'agent.",
   "duration": "90 min",
   "mode": "simule",
   "parts": [
    {
     "title": "Décrire cinq tâches avec les mêmes critères",
     "goal": "Comparer des choses comparables.",
     "steps": "Pour les cinq tâches du tableau « Tâches candidates », remplissez : **entrées**, **étapes connues d'avance ?**, **décisions à prendre**, **effet d'une erreur**, **fréquence**.\n\n1. Quelles tâches ont des étapes totalement prévisibles ?\n2. Quelles tâches exigent un jugement sur des données variables ?\n3. Quelles tâches ont un effet irréversible si elles se trompent ?",
     "expected": "Les tâches à étapes connues (normaliser un indicateur) sont des workflows. Celles qui demandent de résumer ou d'expliquer sont des assistants. Seule une tâche à étapes variables et à exploration peut justifier un agent, et seulement si l'erreur est réversible ou approuvée par un humain.",
     "check": "Les cinq tâches ont les mêmes critères remplis et les effets irréversibles sont identifiés."
    },
    {
     "title": "Décider et justifier",
     "goal": "Faire un choix par tâche avec sa raison.",
     "steps": "Choisissez pour chaque tâche : **workflow**, **assistant** ou **agent**. Écrivez en une phrase pourquoi, et ce que vous perdez avec le choix plus simple.\n\n1. Quelle tâche tentera le plus d'utiliser un agent à tort ?\n2. Quelle est la règle de décision générale que vous en tirez ?",
     "expected": "Règle utile : choisir le plus simple qui accomplit la tâche. Un agent ajoute de l'imprévisibilité, des coûts et une surface d'attaque. On le garde pour les cas où le chemin ne peut pas être écrit d'avance.",
     "check": "Chaque choix a une raison et la règle générale est écrite."
    },
    {
     "title": "Définir le périmètre de la tâche retenue",
     "goal": "Fixer outils, mémoire et limites de l'agent.",
     "steps": "Pour la seule tâche qui justifie un agent, écrivez : **outils permis** (lecture seulement ?), **outils interdits**, **mémoire** (aucune, session, persistante), **nombre maximal d'étapes**, **budget**, **actions qui exigent une approbation**.\n\n1. Quel outil ne donnerez-vous jamais à l'agent ?\n2. Que se passe-t-il quand il atteint la limite d'étapes ?",
     "expected": "Un agent de triage reçoit des outils de lecture, jamais d'isolement ou de suppression sans approbation. À la limite d'étapes, il s'arrête et transmet un état à un humain, il ne continue pas « pour finir ».",
     "check": "Le périmètre liste outils permis, interdits, limites et approbations."
    },
    {
     "title": "Écrire la carte de décision",
     "goal": "Un outil pour les collègues.",
     "steps": "Rédigez une carte d'une page : trois questions que l'on pose avant de construire (les étapes sont-elles connues ? l'erreur est-elle réversible ? qui approuve ?), et le choix correspondant. Ajoutez un exemple pour chaque réponse.\n\n1. Testez la carte sur une tâche que vous n'avez pas utilisée.\n2. Ajoutez la mention de la personne qui approuve les agents.",
     "expected": "La carte tient en un arbre à trois questions. Les exemples la rendent utilisable. Elle sert de porte d'entrée pour toute demande d'automatisation à venir. Chaque demande passe par les trois questions, et la réponse est consignée avec la date : au bout de quelques mois, la liste des décisions devient un historique utile pour la revue des agents.",
     "check": "La carte utilise trois questions et un exemple par résultat."
    }
   ],
   "deliverables": [
    "La grille des cinq tâches.",
    "Les décisions justifiées.",
    "Le périmètre de l'agent retenu.",
    "La carte de décision."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Tâches candidates",
     "head": [
      "Tâche",
      "Description"
     ],
     "rows": [
      [
       "Normaliser un indicateur",
       "Mettre une adresse IP, un domaine ou un hachage dans un format commun"
      ],
      [
       "Résumer une alerte",
       "Produire trois phrases à partir d'une alerte"
      ],
      [
       "Enquêter sur un incident",
       "Chercher dans plusieurs sources selon ce qu'on trouve"
      ],
      [
       "Créer un billet",
       "Remplir un formulaire de billet à partir d'une alerte"
      ],
      [
       "Isoler un poste",
       "Retirer un poste du réseau après détection"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "m03-p1",
  "module": "m03",
  "level": "débutant",
  "title": "Les erreurs HTTP et JSON qui cassent les automatisations",
  "problem": "Diagnostiquer six appels d'API qui échouent, corriger les requêtes et les réponses JSON, et écrire le dictionnaire de codes de l'équipe.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Éditeur de texte",
   "Python 3 facultatif"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Lire les six cas",
   "Corriger les requêtes",
   "Lire une réponse sans la supposer",
   "Écrire le dictionnaire de l'équipe"
  ],
  "success": [
   "Aucune clé dans une URL.",
   "Les réessais sont bornés.",
   "Chaque code a une première action."
  ],
  "risks": [
   "Réessayer sans limite.",
   "Supposer qu'un champ existe.",
   "Journaliser des secrets."
  ],
  "extensions": [
   "Écrire un validateur Python.",
   "Ajouter la gestion de la pagination."
  ],
  "lab": {
   "client": "Les automatisations du SOC de **Nordlys** échouent plusieurs fois par semaine avec des messages obscurs : « 401 », « 429 », « JSON invalide ». Personne ne sait lire ces erreurs. Vous recevez six cas réels (fictifs) et devez en tirer un **dictionnaire** que toute l'équipe pourra utiliser. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.",
   "mission": "Diagnostiquer six échecs, corriger la requête ou la lecture de la réponse, et rédiger le dictionnaire de codes avec la première action à faire.",
   "duration": "90 min",
   "mode": "simule",
   "parts": [
    {
     "title": "Lire les six cas",
     "goal": "Distinguer l'erreur du client, du serveur et du réseau.",
     "steps": "Pour chaque cas du tableau « Cas d'échec », écrivez : **qui est en faute** (nous, le service, le réseau), **la cause probable**, **ce qu'on vérifie en premier**.\n\n1. Quels codes indiquent que *nous* avons mal formulé la demande ?\n2. Quels codes invitent à réessayer plus tard ?\n3. Quel code ne doit jamais être réessayé tel quel ?",
     "expected": "Les codes 4xx indiquent en général une demande à corriger (401 authentification, 403 permission, 404 ressource, 429 trop de demandes). Les 5xx invitent à réessayer avec délai. Réessayer un 401 ou un 400 sans changement est inutile et peut bloquer un compte.",
     "check": "Chaque cas a une cause, un responsable et une première vérification."
    },
    {
     "title": "Corriger les requêtes",
     "goal": "Du JSON et des en-têtes valides.",
     "steps": "Voici une requête fautive :\n\n```json\n{\n  \"indicateur\": \"203.0.113.45\",\n  \"type\": \"ip\",\n  \"priorite\": haute,\n}\n```\n\n1. Trouvez les **deux** erreurs de syntaxe JSON.\n2. Quel en-tête indique le type de contenu envoyé ?\n3. Où met-on la clé d'API (jamais dans l'URL) ?\n4. Écrivez la version corrigée.",
     "expected": "Les erreurs : `haute` doit être entre guillemets et la virgule finale est interdite en JSON. L'en-tête de type de contenu déclare le format. La clé d'API va dans un en-tête d'autorisation, pas dans l'URL, car les URL se retrouvent dans les journaux.",
     "check": "La requête corrigée est un JSON valide et la clé n'est pas dans l'URL."
    },
    {
     "title": "Lire une réponse sans la supposer",
     "goal": "Vérifier avant d'utiliser.",
     "steps": "Une réponse arrive :\n\n```json\n{\"statut\": \"ok\", \"resultat\": {\"score\": \"87\", \"etiquettes\": []}}\n```\n\n1. Le score est-il un nombre ou du texte ? Quelle conséquence si vous comparez `score > 80` ?\n2. Que faites-vous d'une liste d'étiquettes vide ?\n3. Quel champ pourrait être absent la prochaine fois ?\n4. Quelles vérifications écrivez-vous avant d'utiliser la réponse ?",
     "expected": "Le score est du texte : une comparaison peut donner un résultat faux selon le langage. Une liste vide est une valeur valide, pas une erreur. Il faut tester la présence des champs, leur type, et prévoir un comportement par défaut explicite.",
     "check": "Vous avez listé les vérifications de présence, de type et de valeur par défaut."
    },
    {
     "title": "Écrire le dictionnaire de l'équipe",
     "goal": "Un outil de référence d'une page.",
     "steps": "Rédigez le dictionnaire : pour chaque code (200, 201, 400, 401, 403, 404, 429, 500, 503), écrivez **sens**, **première action**, **réessayer ou non**.\n\n1. Ajoutez la règle du délai croissant pour les réessais.\n2. Ajoutez où trouver la limite de débit dans la réponse.",
     "expected": "Le dictionnaire donne une action par code. Pour 429, on respecte l'en-tête qui indique l'attente. Les réessais avec délai croissant et plafond évitent d'aggraver une panne. Le dictionnaire précise aussi que 401 et 403 ne se réessayent jamais tels quels, qu'une erreur 500 inexpliquée se signale après trois essais, et qu'on note la date de la dernière révision du document.",
     "check": "Le dictionnaire couvre neuf codes avec action et règle de réessai."
    }
   ],
   "deliverables": [
    "Le diagnostic des six cas.",
    "La requête corrigée.",
    "La liste des vérifications de réponse.",
    "Le dictionnaire de codes."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Cas d'échec",
     "head": [
      "Cas",
      "Observation"
     ],
     "rows": [
      [
       "A",
       "Réponse 401 après un changement de clé"
      ],
      [
       "B",
       "Réponse 429 lors d'un lot de 500 indicateurs"
      ],
      [
       "C",
       "Réponse 200 mais corps vide"
      ],
      [
       "D",
       "Réponse 500 une fois sur dix"
      ],
      [
       "E",
       "JSON invalide : guillemets simples"
      ],
      [
       "F",
       "Délai d'attente dépassé après 30 secondes"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "m04-p1",
  "module": "m04",
  "level": "débutant",
  "title": "Cartographier une tâche répétitive à automatiser",
  "problem": "Décomposer une tâche répétitive du SOC en déclencheur, étapes, données et erreurs, puis décider ce qui s'automatise et ce qui reste humain.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Décrire la tâche telle qu'elle est faite",
   "Concevoir les données et la déduplication",
   "Prévoir erreurs et réessais",
   "Planifier les tests de panne"
  ],
  "success": [
   "Le workflow est idempotent par conception.",
   "Chaque panne a un traitement.",
   "Les cas de test précèdent le développement."
  ],
  "risks": [
   "Automatiser sans normaliser.",
   "Créer des doublons.",
   "Ignorer les pannes partielles."
  ],
  "extensions": [
   "Ajouter un tableau de bord du temps économisé.",
   "Ajouter une approbation humaine avant la création de billets."
  ],
  "lab": {
   "client": "Chaque matin, un analyste de **Nordlys** passe 40 minutes à copier des indicateurs d'un courriel de veille vers un tableur, à les vérifier un par un et à créer des billets. Le gestionnaire veut automatiser, mais ne sait pas par où commencer et craint de créer 200 faux billets. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.",
   "mission": "Cartographier la tâche, identifier déclencheur, données et décisions, concevoir la déduplication et les réessais et planifier le test des pannes.",
   "duration": "90 min",
   "mode": "simule",
   "parts": [
    {
     "title": "Décrire la tâche telle qu'elle est faite",
     "goal": "Observer le travail réel avant de concevoir.",
     "steps": "Notez chaque étape que fait l'analyste, avec : **action**, **donnée utilisée**, **décision éventuelle**, **durée**.\n\n1. Quelles étapes sont purement mécaniques ?\n2. Quelles étapes demandent un jugement ?\n3. Où l'analyste corrige-t-il des erreurs de la source ?\n4. Quel est le **déclencheur** réel (heure, arrivée d'un courriel) ?",
     "expected": "On trouve typiquement : lire le courriel, extraire les indicateurs, retirer les doublons, vérifier chaque indicateur, décider d'un billet. Les étapes d'extraction et de dédoublonnage sont mécaniques ; la décision de créer un billet demande du jugement, ou une règle claire.",
     "check": "Chaque étape est classée mécanique ou jugement."
    },
    {
     "title": "Concevoir les données et la déduplication",
     "goal": "Éviter les doublons et les pertes de données.",
     "steps": "1. Quelle **clé unique** identifie un indicateur (type + valeur normalisée) ?\n2. Comment normalisez-vous (minuscules, retrait des points d'inactivation) ?\n3. Où gardez-vous la liste des indicateurs déjà traités ?\n4. Que fait le workflow s'il est lancé deux fois ?",
     "expected": "La clé combine le type et la valeur normalisée. Une table des indicateurs traités avec date évite de recréer des billets. Un workflow qui peut être lancé deux fois sans effet double est dit **idempotent** : c'est la propriété à viser.",
     "check": "La clé unique et le comportement en cas de double exécution sont définis."
    },
    {
     "title": "Prévoir erreurs et réessais",
     "goal": "Prévoir les pannes qui arriveront forcément.",
     "steps": "Listez cinq pannes (source indisponible, limite de débit, indicateur mal formé, billet déjà existant, outil de billets en panne). Pour chacune : **détection**, **réessai ou non**, **qui est alerté**, **état laissé**.\n\n1. Quelle panne doit arrêter le lot entier ?\n2. Laquelle peut être sautée avec une note ?",
     "expected": "Une source indisponible reporte le lot ; un indicateur mal formé est mis de côté avec une note ; un outil de billets en panne arrête la création mais conserve la file. Toute erreur laisse un état connu et une trace.",
     "check": "Chaque panne a une détection, une décision et un état final."
    },
    {
     "title": "Planifier les tests de panne",
     "goal": "Prouver la robustesse avant la production.",
     "steps": "Concevez un jeu de huit cas de test : indicateur valide, doublon, valeur vide, adresse privée, domaine très long, source qui répond lentement, lot de 500, panne à mi-parcours. Écrivez le résultat attendu de chacun.\n\n1. Marquez les cas qui doivent échouer proprement (entrée vide, valeur trop longue).\n2. Marquez ceux qui doivent réussir sans doublon (deux exécutions successives).\n3. Précisez comment vous contrôlez l'état final : nombre de billets créés, journal.",
     "expected": "Un jeu de tests pour un workflow est un tableau d'entrées et de résultats attendus. Le cas « panne à mi-parcours » vérifie qu'on reprend sans doublon ni perte. Le cas du lot de 500 vérifie le débit, et le cas de l'adresse privée vérifie qu'on ne soumet pas à un service externe une donnée interne. Écrire ces résultats avant le développement évite d'ajuster les attentes au comportement observé.",
     "check": "Les huit cas ont une entrée et un résultat attendu écrits avant le développement."
    }
   ],
   "deliverables": [
    "La cartographie de la tâche.",
    "Le schéma de données et de déduplication.",
    "Le tableau des pannes.",
    "Le jeu de huit cas de test."
   ],
   "context": "defender-xdr"
  }
 },
 {
  "id": "m05-p1",
  "module": "m05",
  "level": "intermédiaire",
  "title": "Un webhook n8n qui normalise et enrichit un indicateur",
  "problem": "Concevoir un workflow n8n recevant un webhook, normalisant un indicateur, l'enrichissant (simulé) avec limite de débit et validation, avec revue de sécurité.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "n8n (facultatif)",
   "Éditeur JSON",
   "Ressources du parcours (workflows n8n)"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Définir le contrat d'entrée et de sortie",
   "Concevoir le flux nœud par nœud",
   "Gérer la limite de débit et les réessais",
   "Passer la revue de sécurité"
  ],
  "success": [
   "Le secret est vérifié en premier.",
   "Les entrées sont plafonnées et validées.",
   "Aucun secret n'apparaît dans les journaux."
  ],
  "risks": [
   "Secret dans le flux.",
   "Aucune limite de taille.",
   "Cache trop long."
  ],
  "extensions": [
   "Ajouter un second fournisseur de réputation.",
   "Versionner le flux dans un dépôt."
  ],
  "lab": {
   "client": "Le SOC de **Nordlys** veut un point d'entrée unique : un outil de détection envoie un indicateur par webhook, le workflow le normalise, interroge un service de réputation (simulé), puis renvoie un verdict structuré. L'équipe de sécurité exige une revue avant tout usage : authentification du webhook, aucune donnée sensible dans les journaux, limite de débit.",
   "mission": "Concevoir le flux nœud par nœud, définir le schéma d'entrée et de sortie, gérer la limite de débit et les erreurs, et passer la revue de sécurité.",
   "duration": "2 h",
   "mode": "tenant",
   "parts": [
    {
     "title": "Définir le contrat d'entrée et de sortie",
     "goal": "Définir un schéma avant de poser les nœuds.",
     "steps": "Écrivez le contrat :\n\n```json\n{\n  \"entree\": {\"type\": \"ip|domaine|hachage\", \"valeur\": \"texte\", \"source\": \"texte\"},\n  \"sortie\": {\"type\": \"texte\", \"valeur_normalisee\": \"texte\", \"verdict\": \"inconnu|bénin|suspect\", \"raison\": \"texte\"}\n}\n```\n\n1. Quels champs sont obligatoires ?\n2. Que répond-on à une entrée invalide, et avec quel code HTTP ?\n3. Comment authentifiez-vous l'appelant ?",
     "expected": "Type et valeur sont obligatoires. Une entrée invalide reçoit un 400 avec une raison, sans exécuter la suite. L'appelant s'authentifie par un secret partagé dans un en-tête, vérifié dès le premier nœud, et le secret vit dans le coffre d'identifiants du système, pas dans le flux.",
     "check": "Le contrat distingue champs obligatoires, erreurs et authentification."
    },
    {
     "title": "Concevoir le flux nœud par nœud",
     "goal": "Suivre le chemin du webhook à la réponse.",
     "steps": "Listez les nœuds dans l'ordre : réception, vérification du secret, validation du schéma, normalisation, vérification de doublon, enrichissement, construction du verdict, réponse.\n\n1. Pour chacun, précisez l'entrée et la sortie.\n2. Où placez-vous le nœud de gestion d'erreur ?\n3. Quel nœud ne doit pas pouvoir être contourné ?",
     "expected": "La vérification du secret est le premier nœud et rien ne s'exécute avant. La gestion d'erreur renvoie toujours une réponse structurée. Chaque nœud ne dépend que de la sortie du précédent, ce qui facilite les tests.",
     "check": "Chaque nœud a une entrée, une sortie et la vérification du secret est en premier."
    },
    {
     "title": "Gérer la limite de débit et les réessais",
     "goal": "Respecter le service externe.",
     "steps": "Le service de réputation (simulé) permet 4 appels par seconde.\n\n1. Comment espacez-vous les appels dans un lot de 100 indicateurs ?\n2. Que faites-vous d'une réponse 429 ?\n3. Comment mettre en cache un verdict récent pour éviter un appel ?\n4. Quelle durée de cache choisissez-vous et pourquoi ?",
     "expected": "On espace les appels à 250 millisecondes ou moins, on respecte l'attente demandée en cas de 429 et on garde un cache court (quelques heures) : une réputation change. Un cache trop long fait manquer un indicateur devenu malveillant.",
     "check": "Le débit, le traitement du 429 et la durée du cache sont justifiés."
    },
    {
     "title": "Passer la revue de sécurité",
     "goal": "Ce que l'équipe de sécurité va demander.",
     "steps": "Répondez par écrit à ces questions : **où vivent les secrets**, **que contiennent les journaux**, **qui peut appeler le webhook**, **que se passe-t-il en cas d'entrée malveillante** (valeur de 10 Mo, caractères de contrôle), **qui a accès au flux**, **comment on le met à jour**.",
     "expected": "Les journaux ne contiennent ni secret ni corps complet. La taille d'entrée est plafonnée. L'accès au flux est limité et les modifications sont versionnées. Chaque réponse est une affirmation que quelqu'un peut vérifier.",
     "check": "Chaque question de la revue a une réponse vérifiable."
    }
   ],
   "deliverables": [
    "Le contrat d'entrée et de sortie.",
    "Le plan de nœuds.",
    "La stratégie de débit et de cache.",
    "Le dossier de revue de sécurité."
   ],
   "context": "defender-xdr"
  },
  "connected": {
   "accounts": "Une instance n8n de test, non exposée à Internet, et un service de réputation fictif.",
   "permissions": "Rôle Intune adapté (par exemple Policy and Profile Manager) dans le locataire de test.",
   "costs": "Licences de test à votre charge ; vérifiez la tarification actuelle.",
   "secrets": "Aucun secret dans le dépôt.",
   "cleanup": "Supprimer le workflow, le webhook et les identifiants de test.",
   "limits": "Facultatif : tout le lab fonctionne en simulation ; n'exposez jamais un webhook de test à Internet."
  }
 },
 {
  "id": "m06-p1",
  "module": "m06",
  "level": "intermédiaire",
  "title": "Choisir et sécuriser l'outil d'automatisation",
  "problem": "Comparer Logic Apps, Power Automate, Functions et n8n pour trois besoins, et rédiger la fiche d'identité et de permissions du playbook retenu.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Définir les critères",
   "Noter et choisir",
   "Rédiger la fiche d'identité et de permissions",
   "Vérifier avec un test de permissions"
  ],
  "success": [
   "Les critères sont écrits avant les notes.",
   "L'identité est dédiée et minimale.",
   "Les tests de permission ont des résultats attendus."
  ],
  "risks": [
   "Choisir l'outil connu par habitude.",
   "Compte personnel pour un playbook.",
   "Permissions larges par commodité."
  ],
  "extensions": [
   "Ajouter le coût total sur trois ans.",
   "Automatiser les tests de permission."
  ],
  "lab": {
   "client": "**Nordlys** a trois besoins d'automatisation : enrichir des indicateurs, créer des billets, et envoyer un résumé quotidien à la direction. Quatre outils sont disponibles et chaque équipe a son favori. Le responsable de la sécurité demande que le choix soit fondé sur des critères écrits et que l'outil retenu ait une **identité dédiée** avec le moins de permissions possible.",
   "mission": "Définir les critères, noter les outils pour chaque besoin, choisir et écrire la fiche d'identité et de permissions du playbook retenu.",
   "duration": "2 h",
   "mode": "simule",
   "parts": [
    {
     "title": "Définir les critères",
     "goal": "Mesurer la même chose pour chaque outil.",
     "steps": "Choisissez six critères et leur poids : intégration avec les outils du SOC, coût, compétences de l'équipe, sécurité et gestion des secrets, journalisation et audit, souplesse.\n\n1. Justifiez le poids de chaque critère.\n2. Lequel est éliminatoire (par exemple : pas de gestion centralisée des secrets) ?\n3. Comment évitez-vous que le critère « compétences » favorise toujours l'outil connu ?",
     "expected": "Les critères de sécurité et d'audit sont souvent éliminatoires. Le critère « compétences » doit être pondéré avec prudence : un outil connu mal sécurisé reste un mauvais choix. Les poids sont écrits avant les notes pour éviter de les ajuster au résultat voulu.",
     "check": "Les critères et leurs poids sont écrits avant toute notation."
    },
    {
     "title": "Noter et choisir",
     "goal": "Prendre une décision défendable.",
     "steps": "Notez chaque outil de 1 à 5 pour chaque besoin, avec une phrase de justification. Calculez le total pondéré.\n\n1. Un outil peut-il gagner pour un besoin et perdre pour un autre ?\n2. Le résultat vous surprend-il ? Que vérifiez-vous alors ?\n3. Quelle est la décision finale pour chaque besoin ?",
     "expected": "Il est normal qu'un seul outil ne gagne pas partout. Un résultat surprenant doit mener à vérifier le critère ou la note, pas à les ajuster. Limiter le nombre d'outils réduit le coût de maintenance : c'est un critère à discuter.",
     "check": "Chaque note a une phrase et la décision par besoin est écrite."
    },
    {
     "title": "Rédiger la fiche d'identité et de permissions",
     "goal": "Le moins de pouvoir possible.",
     "steps": "Pour le playbook de création de billets, remplissez : **identité utilisée** (dédiée, jamais un compte personnel), **permissions** (lire les alertes, créer des billets, rien d'autre), **où vivent les secrets**, **qui peut modifier le playbook**, **journalisation**, **procédure de révocation**.\n\n1. Quelle permission refusez-vous de donner pour des raisons de commodité ?\n2. Comment révoquez-vous l'accès en cas d'incident ?",
     "expected": "Une identité dédiée avec lecture des alertes et création de billets. Refuser toute permission de suppression ou d'administration. La révocation passe par la désactivation de l'identité, testée à l'avance.",
     "check": "La fiche liste identité, permissions minimales, secrets, modifications et révocation."
    },
    {
     "title": "Vérifier avec un test de permissions",
     "goal": "Prouver que les limites tiennent.",
     "steps": "Écrivez cinq tests de permission : le playbook tente de lire une alerte (doit réussir), de créer un billet (doit réussir), de supprimer un billet (doit échouer), de lire un secret d'une autre application (doit échouer), de modifier sa propre configuration (doit échouer).\n\n1. Comment conservez-vous la preuve ?\n2. À quelle fréquence refaites-vous ces tests ?",
     "expected": "Un test de permission est un test d'échec attendu : la preuve est le refus. On les rejoue à chaque changement de rôle et chaque trimestre. Un test jamais exécuté est marqué « non exécuté ». La preuve est une capture ou un journal daté, rangé avec la fiche, de sorte que l'auditeur puisse la retrouver sans vous demander.",
     "check": "Les cinq tests ont un résultat attendu et une fréquence."
    }
   ],
   "deliverables": [
    "La grille de critères pondérés.",
    "Le tableau de notes et la décision.",
    "La fiche d'identité et de permissions.",
    "Les cinq tests de permission."
   ],
   "context": "defender-xdr"
  }
 }
];
