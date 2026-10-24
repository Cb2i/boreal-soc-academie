// Module 1 : Comprendre l’IA (niveau 1, Fondations).
import type { AiCompetency, AiLesson, AiModule, AiProject, ModuleContent } from '../types.ts';
import { author, src } from './helpers.ts';

const md = (...lines: string[]) => lines.join('\n');
const a = author('m01');

const SRC_PRIVACY = src('Data, privacy, and security for Models sold by Azure in Microsoft Foundry', 'https://learn.microsoft.com/azure/foundry/responsible-ai/openai/data-privacy');
const SRC_CTX = src('Anthropic : Understanding the context window', 'https://docs.claude.com/en/docs/build-with-claude/context-windows');
const SRC_OWASP = src('OWASP GenAI Security Project : Top 10 for LLM Applications 2025', 'https://genai.owasp.org/2024/11/17/owasp-reveals-updated-2025-top-10-risks-for-llms-announces-new-llm-project-sponsorship-program-and-inaugural-sponsors/');
const SRC_NIST = src('NIST : AI Risk Management Framework (AI RMF 1.0)', 'https://www.nist.gov/itl/ai-risk-management-framework');
const SRC_FAQ = src('Microsoft Learn : Azure OpenAI frequently asked questions', 'https://learn.microsoft.com/azure/ai-foundry/openai/faq');

// ---------------------------------------------------------------------------------------------------------------
// Leçons
// ---------------------------------------------------------------------------------------------------------------

const l1: AiLesson = {
  id: 'm01-l1',
  module: 'm01',
  title: 'IA, apprentissage automatique, apprentissage profond et IA générative',
  summary: 'Quatre termes qu’on mélange tout le temps. Voici comment les distinguer, et ce qu’un grand modèle de langage fait vraiment.',
  minutes: 25,
  objectives: [
    'Distinguer intelligence artificielle, apprentissage automatique, apprentissage profond et IA générative.',
    'Expliquer en mots simples ce qu’est un grand modèle de langage (LLM) et ce qu’il produit.',
    'Reconnaître une tâche d’un SOC qui relève de l’apprentissage automatique classique et une autre qui relève d’un LLM.',
  ],
  prerequisites: [],
  body: md(
    '## Quatre termes, quatre niveaux',
    'Dans les présentations commerciales, « IA » désigne tout et n’importe quoi. Pour travailler sérieusement, il faut séparer quatre notions qui s’emboîtent comme des poupées russes.',
    '- **Intelligence artificielle (IA)** : le champ le plus large. Tout système informatique qui accomplit une tâche qui demanderait de l’intelligence à un humain. Une règle de détection écrite à la main peut déjà être vue comme de l’IA « symbolique ». Ce n’est pas ce dont on parle dans ce cours.',
    '- **Apprentissage automatique (machine learning, ML)** : au lieu d’écrire les règles, on fournit des exemples et un algorithme **apprend** les règles. Exemple : un modèle qui apprend à repérer des connexions inhabituelles à partir de milliers de connexions passées.',
    '- **Apprentissage profond (deep learning, DL)** : une famille de techniques de ML qui utilise des **réseaux de neurones** à plusieurs couches. C’est ce qui a rendu possible la reconnaissance d’images, la traduction et les modèles de langage actuels.',
    '- **IA générative (GenAI)** : des modèles, presque toujours issus de l’apprentissage profond, qui **produisent du contenu nouveau** (texte, code, image, audio) plutôt que seulement classer ou prédire.',
    '> Retenez l’emboîtement : GenAI est un sous-ensemble du DL, qui est un sous-ensemble du ML, qui est un sous-ensemble de l’IA. L’inverse est faux : tout ML n’est pas génératif.',
    '## Prédire ou générer : la différence qui compte pour un SOC',
    'Un modèle de ML **classique** reçoit des variables structurées (nombre d’échecs de connexion, pays, heure) et sort une étiquette ou un score : « suspect : 0,93 ». Son champ de sortie est fixe et étroit. Il est entraîné pour une seule tâche.',
    'Un modèle **génératif** de type LLM reçoit du texte (et parfois des images) et produit du texte, mot après mot. Son champ de sortie est ouvert : il peut résumer une alerte, écrire une requête KQL, rédiger un courriel ou inventer une réponse plausible. C’est cette ouverture qui le rend utile et risqué à la fois.',
    '## Ce qu’est un grand modèle de langage',
    'Un **LLM** (large language model) est un réseau de neurones entraîné sur d’énormes quantités de texte pour une tâche très simple en apparence : **prédire la suite la plus probable d’un texte**. À force de s’entraîner sur cette tâche, le modèle capte la grammaire, des faits, des styles, des formats de code et des enchaînements de raisonnement.',
    'Trois idées à garder en tête :',
    '- Le modèle **ne consulte pas une base de faits**. Il génère une suite plausible à partir de ce qu’il a appris dans ses paramètres (les « poids » du réseau). Sans source fournie, il ne peut pas vérifier ce qu’il avance.',
    '- Le modèle **ne se souvient pas** de vos conversations passées par lui-même. Ce qu’il « sait » de la discussion en cours, c’est uniquement le texte qu’on lui renvoie à chaque appel (nous y reviendrons avec la fenêtre de contexte).',
    '- Le modèle a une **date limite de connaissances** : ce qui s’est passé après son entraînement ne figure pas dans ses paramètres.',
    '## Exemples dans le travail d’un analyste SOC',
    '- Détection d’anomalies sur des sessions de connexion (ML classique) : entrée structurée, sortie en score. Pas de langage naturel.',
    '- Classification d’un courriel en hameçonnage ou légitime (ML classique ou LLM, selon la solution).',
    '- Résumer en français les cinq alertes d’un incident Microsoft Sentinel (LLM).',
    '- Proposer une requête KQL à partir d’une question (LLM). La requête reste à **vérifier** contre le schéma réel des tables.',
    '## Vocabulaire à connaître',
    '- **Modèle** : le fichier de paramètres appris, plus l’architecture qui les utilise.',
    '- **Entraînement** : la phase, coûteuse, où le modèle apprend. Vous ne la faites presque jamais.',
    '- **Inférence** : l’utilisation du modèle déjà entraîné pour produire une réponse. C’est ce que vous payez à l’appel.',
    '- **Invite (prompt)** : le texte qu’on envoie au modèle.',
    '- **Complétion** : le texte que le modèle renvoie.',
  ),
  demo: {
    title: 'Trois outils, trois natures',
    body: md(
      'Prenons trois outils qu’un analyste rencontre et classons-les. Pour chacun, posons deux questions : **est-ce qu’il a appris à partir d’exemples ?** et **est-ce qu’il produit du contenu nouveau ?**',
      '```text',
      'Outil A : règle d’analyse Sentinel "plus de 10 échecs de connexion en 5 min"',
      '  Appris sur des exemples ? Non, un humain a écrit le seuil.      -> pas du ML',
      '  Produit du contenu nouveau ? Non, il déclenche ou non.           -> pas de la GenAI',
      '',
      'Outil B : modèle qui attribue un score de risque à chaque connexion',
      '  Appris sur des exemples ? Oui (historique étiqueté).             -> ML',
      '  Produit du contenu nouveau ? Non, il sort un nombre.             -> pas de la GenAI',
      '',
      'Outil C : assistant qui rédige le résumé d’un incident en français',
      '  Appris sur des exemples ? Oui (réseau profond, très grand).      -> ML / DL',
      '  Produit du contenu nouveau ? Oui, du texte.                      -> GenAI (LLM)',
      '```',
      'Observez que l’outil A reste très utile : une règle déterministe est souvent la meilleure réponse. Un LLM n’est pas un « meilleur » outil, c’est un outil **différent**, adapté aux tâches de langage où les règles fixes échouent.',
    ),
  },
  guided: 'm01-g1',
  autonomous: 'm01-a1',
  quiz: ['m01-q1a', 'm01-q1b', 'm01-q1c'],
  revision: md(
    '## Fiche : IA, ML, DL, GenAI',
    '- IA ⊃ ML ⊃ DL ⊃ GenAI (poupées russes).',
    '- ML : apprend des règles à partir d’exemples. Sortie étroite (score, étiquette).',
    '- GenAI / LLM : produit du contenu ouvert en prédisant la suite d’un texte.',
    '- Inférence = utiliser le modèle ; entraînement = le construire.',
    '- Un LLM ne vérifie pas les faits, n’a pas de mémoire propre, a une date limite de connaissances.',
    '- Une règle déterministe reste souvent préférable à un LLM quand la tâche est bien définie.',
  ),
  links: [SRC_NIST, SRC_OWASP],
  teaches: ['definitions', 'llm', 'ml-vs-genai'],
};

const l2: AiLesson = {
  id: 'm01-l2',
  module: 'm01',
  title: 'Jetons, fenêtre de contexte, inférence et paramètres',
  summary: 'Comment un modèle lit votre texte, pourquoi la longueur compte, et ce que changent la température et les autres réglages.',
  minutes: 30,
  objectives: [
    'Expliquer ce qu’est un jeton (token) et pourquoi les coûts et les limites se comptent en jetons.',
    'Décrire la fenêtre de contexte et en tirer les conséquences pratiques sur un long journal ou un long incident.',
    'Choisir une valeur raisonnable de température et de longueur maximale selon la tâche.',
  ],
  prerequisites: ['Leçon 1 : IA, ML, DL et IA générative'],
  body: md(
    '## Le jeton : l’unité de lecture du modèle',
    'Le modèle ne lit pas des lettres ni des mots entiers. Un **tokenizer** découpe d’abord le texte en morceaux appelés **jetons**. Un jeton peut être un mot courant, un morceau de mot, un signe de ponctuation ou même un espace. En anglais, on retient souvent l’ordre de grandeur « un jeton ≈ quatre caractères ≈ trois quarts de mot ». En français, les textes consomment en général **un peu plus** de jetons pour la même quantité d’information, à cause des accents et des mots plus longs. L’ordre de grandeur varie selon le modèle : ce ne sont **pas** des règles exactes.',
    'Pourquoi c’est important : **tout se compte en jetons**. Le prix d’un appel, la durée de la réponse et la taille maximale de ce que vous pouvez envoyer.',
    '```text',
    'Texte      : "Connexion échouée depuis 203.0.113.45"',
    'Jetons (ex.): ["Con", "nexion", " é", "chou", "ée", " depuis", " ", "203", ".", "0", ".", "113", ".", "45"]',
    '```',
    'Cet exemple est **illustratif** : le découpage réel dépend du tokenizer du modèle utilisé. Retenez que les adresses IP, les identifiants et le JSON consomment beaucoup de jetons, car ils sont pleins de chiffres et de symboles.',
    '## La fenêtre de contexte',
    'La **fenêtre de contexte** est la quantité maximale de jetons que le modèle peut prendre en compte en un appel : votre invite, l’historique de la conversation, les documents fournis **et** la réponse qu’il génère. La documentation d’Anthropic la compare à la « mémoire de travail » du modèle, à ne pas confondre avec les données d’entraînement.',
    'Conséquences concrètes pour un SOC :',
    '- Vous ne pouvez pas coller un mois de journaux d’un coup. Il faut **filtrer et résumer avant** d’envoyer (par exemple avec une requête KQL qui garde les champs utiles).',
    '- Dans une longue conversation, tout l’historique est renvoyé à chaque tour. Plus la conversation s’allonge, plus **chaque appel coûte** et plus on approche de la limite.',
    '- Quand la fenêtre est pleine, il faut tronquer, résumer ou changer de stratégie. Un modèle ne « sait » pas ce qui a été coupé.',
    '- Un contexte très long ne garantit pas une attention égale à tout : l’information importante vaut mieux placée de façon claire, pas noyée dans 50 pages.',
    '> Les tailles de fenêtre changent d’un modèle et d’une version à l’autre. Ne mémorisez pas un chiffre : lisez la page du modèle que vous utilisez au moment de concevoir votre workflow.',
    '## L’inférence : ce qui se passe à chaque appel',
    'L’**inférence** est l’exécution du modèle. Il génère la réponse **un jeton à la fois** : à chaque étape il calcule une distribution de probabilités sur le jeton suivant, en choisit un, l’ajoute au texte, puis recommence. Conséquences :',
    '- La réponse est plus lente quand elle est longue (la durée suit le nombre de jetons générés).',
    '- Les jetons de sortie sont souvent facturés plus cher que les jetons d’entrée chez les fournisseurs hébergés. Vérifiez la grille de prix du fournisseur.',
    '- Le modèle est **sans état** : il ne garde rien entre deux appels. C’est votre code qui renvoie l’historique.',
    '## Les paramètres de génération',
    'Quatre réglages reviennent presque partout. Leur nom exact varie selon le fournisseur.',
    '- **Température** : contrôle le caractère aléatoire du choix du jeton suivant. Valeur basse (proche de 0) : réponses plus prévisibles et plus stables. Valeur haute : plus variées, plus créatives, plus d’erreurs. Pour de l’extraction de données ou de la classification, on vise bas. Pour du brainstorming, plus haut.',
    '- **Top-p** (échantillonnage par noyau) : limite le choix aux jetons les plus probables dont la probabilité cumulée atteint p. On règle en général température **ou** top-p, pas les deux à la fois.',
    '- **Longueur maximale de sortie** (max tokens) : plafonne la réponse. Trop bas, la réponse est coupée au milieu (un JSON tronqué devient invalide). Trop haut, vous payez et attendez pour rien.',
    '- **Séquences d’arrêt** : texte qui, une fois généré, termine la réponse.',
    '> Même avec une température à 0, certains services ne garantissent pas une réponse identique à chaque appel. Ne construisez pas un contrôle de sécurité qui dépend d’un résultat parfaitement reproductible : validez la **forme** et le **contenu** de la sortie par du code.',
    '## Estimer un coût',
    'Un calcul simple vous évite les mauvaises surprises : `coût ≈ (jetons d’entrée × prix entrée) + (jetons de sortie × prix sortie)`, multiplié par le nombre d’appels. Un workflow qui traite 2 000 alertes par jour avec 3 000 jetons d’entrée chacune envoie 6 millions de jetons d’entrée par jour, avant même la sortie. Estimez toujours avant de déployer, avec les prix **actuels** du fournisseur.',
  ),
  demo: {
    title: 'Pourquoi le JSON a été coupé',
    body: md(
      'Un analyste demande à un modèle de renvoyer un incident en JSON avec une limite de sortie fixée à 60 jetons. Voici ce qui revient :',
      '```json',
      '{"incident": "INC-1042", "severite": "Elevee", "entites": ["jdupont@exemple.test", "SRV-FICHIERS-01"], "resume": "Plusieurs connexions échouées suivies d’une connexion réuss',
      '```',
      '**Lecture commentée.** La phrase s’arrête au milieu d’un mot, il manque les guillemets, l’accolade et le reste des champs. Le modèle n’a pas « mal répondu » : il a atteint la **longueur maximale de sortie**, la génération s’est arrêtée net.',
      '**Corrections possibles.** Augmenter la limite de sortie, demander un résumé plus court, ou vérifier le motif d’arrêt renvoyé par l’API (la plupart des API indiquent si la réponse a été coupée par la limite). Dans tous les cas, le code qui reçoit la réponse doit **valider le JSON** avant de s’en servir, et refuser un JSON invalide plutôt que de deviner.',
    ),
  },
  guided: 'm01-g2',
  autonomous: 'm01-a2',
  quiz: ['m01-q2a', 'm01-q2b', 'm01-q2c'],
  revision: md(
    '## Fiche : jetons, contexte, paramètres',
    '- Tout se compte en jetons : prix, vitesse, limites.',
    '- Fenêtre de contexte = entrée + historique + documents + sortie.',
    '- Le modèle est sans état : votre code renvoie l’historique, donc le coût grimpe avec la conversation.',
    '- Température basse pour extraire et classer ; plus haute pour explorer.',
    '- Max tokens trop bas = sortie coupée = JSON invalide.',
    '- Toujours valider la sortie par du code. Ne jamais supposer une sortie reproductible.',
    '- Estimer le coût : entrée + sortie, multipliée par le volume, aux prix actuels.',
  ),
  links: [SRC_CTX, SRC_FAQ],
  teaches: ['tokens', 'contexte', 'parametres', 'cout'],
};

const l3: AiLesson = {
  id: 'm01-l3',
  module: 'm01',
  title: 'Hallucinations, modèles locaux ou hébergés, multimodal, coûts et vie privée',
  summary: 'Les limites réelles des LLM, comment choisir où le modèle s’exécute et quelles données y envoyer.',
  minutes: 30,
  objectives: [
    'Expliquer pourquoi un LLM hallucine et nommer trois pratiques qui réduisent le risque.',
    'Comparer un modèle hébergé et un modèle local selon la confidentialité, le coût, la qualité et la maintenance.',
    'Décider quelles données d’un SOC peuvent être envoyées à un modèle, et lesquelles doivent être masquées ou exclues.',
  ],
  prerequisites: ['Leçon 2 : jetons, fenêtre de contexte, paramètres'],
  body: md(
    '## Pourquoi un modèle hallucine',
    'Une **hallucination** est une sortie fluide et sûre d’elle qui est fausse ou sans fondement : un identifiant d’incident inventé, une fonction KQL qui n’existe pas, un faux numéro CVE, une citation qu’aucune source ne contient. Ce n’est pas un bogue rare : c’est la conséquence directe du fonctionnement. Le modèle produit la suite **plausible**, pas la suite **vraie**.',
    'Les situations les plus risquées :',
    '- Une question sur un fait précis qui n’est pas dans le contexte (un numéro, une date, une version, un schéma de table).',
    '- Un sujet récent, postérieur à la date limite de connaissances.',
    '- Une consigne qui pousse à répondre à tout prix (« ne dis jamais que tu ne sais pas »).',
    '- Un nom de fonction, de table ou de champ propre à votre environnement.',
    '### Pratiques qui réduisent le risque (sans l’éliminer)',
    '- **Fournir la source** dans le contexte (le schéma réel de la table, l’extrait de la politique) et demander de répondre **uniquement** à partir de cette source. C’est le principe du RAG que vous verrez au module 9.',
    '- **Autoriser l’abstention** : « Si l’information n’est pas dans le contexte, réponds exactement : INCONNU. »',
    '- **Demander des citations** vérifiables (identifiant de ligne, extrait) et les contrôler par du code.',
    '- **Vérifier par un moyen déterministe** : exécuter la requête KQL dans un espace de travail de test, valider le JSON contre un schéma, comparer l’identifiant à la base.',
    '- **Garder un humain** sur toute décision qui a un effet (isoler un poste, désactiver un compte).',
    '> Règle de travail : la sortie d’un LLM est une **proposition**, jamais une preuve.',
    '## Modèle hébergé ou modèle local',
    'Un modèle **hébergé** tourne chez un fournisseur et s’appelle par API. Un modèle **local** tourne sur votre propre machine ou serveur (on parle souvent de modèles à poids ouverts). Aucun des deux n’est « le bon » : cela dépend de la tâche.',
    '```text',
    'Critère            Hébergé                               Local',
    'Confidentialité    Données envoyées au fournisseur,       Les données restent chez vous,',
    '                   encadrées par contrat et par           mais vous devenez responsable',
    '                   les paramètres du service              de la sécurité du serveur',
    'Qualité            Souvent les modèles les plus forts     Souvent plus petits, parfois',
    '                                                          suffisants pour une tâche étroite',
    'Coût               À l’usage (jetons)                     Matériel et exploitation fixes',
    'Maintenance        Gérée par le fournisseur               À votre charge (mises à jour, GPU)',
    '```',
    'Pour un SOC qui exploite la pile Microsoft, un cas courant est un modèle déployé dans **Azure** (Microsoft Foundry, Azure OpenAI). La documentation de Microsoft indique que, pour ces modèles, vos invites, vos complétions, vos vecteurs d’embeddings et vos données d’entraînement ne sont pas accessibles aux autres clients, ne sont pas accessibles à OpenAI et ne servent pas à entraîner les modèles de fondation sans votre permission. Elle précise aussi que le comportement de conservation dépend de la **fonctionnalité** utilisée (par exemple les API avec état, les fichiers téléversés ou la surveillance des abus). Lisez la page officielle avant de traiter des données sensibles, et vérifiez le type de déploiement (régional, par zone de données ou global), car il détermine où le traitement peut avoir lieu.',
    '## Modèles multimodaux',
    'Un modèle **multimodal** accepte ou produit plus que du texte : images, audio, parfois PDF ou vidéo. En sécurité, cela sert par exemple à lire une capture d’écran d’alerte ou un courriel en image. Deux précautions : le texte caché dans une image est lui aussi une **entrée** (une injection d’invite peut s’y trouver, voir le module 16), et les images contiennent souvent des données sensibles que vous ne pensiez pas envoyer (noms, adresses, jetons visibles).',
    '## Vie privée et classification des données',
    'Avant d’envoyer quoi que ce soit à un modèle, posez-vous quatre questions :',
    '- **Quelles données** contient ce texte (noms, courriels, adresses IP internes, secrets, données clients) ?',
    '- **Où** le modèle s’exécute-t-il et qui peut lire l’invite ou la journaliser ?',
    '- **Combien de temps** les données sont-elles conservées ?',
    '- **Ai-je besoin** de ces champs pour la tâche ? Sinon, on les retire ou on les remplace par un pseudonyme.',
    'Règle simple : envoyez le **minimum nécessaire**. Un résumé d’incident peut très bien se faire avec « utilisateur-A » et « poste-17 » plutôt qu’avec le vrai nom et le vrai nom d’hôte, puis une étape de code remet les vrais noms dans le résultat. Les secrets (mots de passe, clés d’API, jetons) ne sont **jamais** envoyés à un modèle.',
    '## Coûts : ce qui s’additionne',
    '- Jetons d’entrée et de sortie, multipliés par le volume d’appels.',
    '- Appels répétés par un agent qui boucle (module 10).',
    '- Journalisation, stockage et recherche (bases vectorielles, module 9).',
    '- Temps humain de revue, qui est souvent le coût dominant et qu’il ne faut pas oublier.',
    'Une bonne pratique : fixer dès le départ un **budget maximal** par exécution et un plafond quotidien, avec arrêt automatique.',
  ),
  demo: {
    title: 'Pseudonymiser avant d’envoyer',
    body: md(
      'Un analyste veut un résumé d’un incident. Le texte brut contient des données qu’il vaut mieux ne pas envoyer :',
      '```text',
      'Brut : jean.tremblay@exemple.test a ouvert un fichier depuis 10.20.30.40 sur SRV-PAIE-02.',
      '       Jeton trouvé dans le journal : eyJhbGciOi...',
      '```',
      'Version préparée par le code **avant** l’appel au modèle :',
      '```text',
      'Envoyé : [UTILISATEUR_1] a ouvert un fichier depuis [IP_INTERNE_1] sur [SERVEUR_1].',
      '         (jeton supprimé)',
      'Table de correspondance gardée localement : UTILISATEUR_1 = jean.tremblay@exemple.test, etc.',
      '```',
      '**Lecture commentée.** Le nom, l’adresse IP et le serveur sont remplacés par des marqueurs. Le jeton est supprimé : un secret ne doit jamais quitter votre périmètre. Le modèle produit un résumé avec les marqueurs, puis le code remet les vrais noms dans le texte final avant de l’afficher à l’analyste. Les données fictives de ce cours utilisent des domaines réservés aux exemples (exemple.test, plages 203.0.113.0/24 et 192.0.2.0/24) pour la même raison.',
    ),
  },
  guided: 'm01-g3',
  autonomous: 'm01-a3',
  quiz: ['m01-q3a', 'm01-q3b', 'm01-q3c'],
  revision: md(
    '## Fiche : limites, déploiement, vie privée',
    '- Hallucination = suite plausible, pas vraie. Inévitable, donc à encadrer.',
    '- Réduire : fournir la source, autoriser l’abstention, citer, vérifier par du code, garder l’humain.',
    '- Hébergé : puissant, contractuel. Local : données chez soi, maintenance à soi.',
    '- Sur Azure : lire la page officielle de confidentialité et le type de déploiement.',
    '- Multimodal : une image est une entrée non fiable et peut contenir des données sensibles.',
    '- Envoyer le minimum, pseudonymiser, jamais de secrets.',
    '- Fixer un budget maximal par exécution.',
  ),
  links: [SRC_PRIVACY, SRC_OWASP, SRC_NIST],
  teaches: ['hallucination', 'deploiement', 'vie-privee', 'cout', 'multimodal'],
};

// ---------------------------------------------------------------------------------------------------------------
// Exercices
// ---------------------------------------------------------------------------------------------------------------

const exercises = [
  // ----- Leçon 1 -----
  a.match({
    id: 'm01-g1', title: 'Classer cinq outils', comp: 'm01-c1', tags: ['definitions', 'ml-vs-genai'], role: 'guided', dim: 'comprendre', lesson: 'm01-l1',
    st: 'Associez chaque outil à la catégorie qui le décrit **le mieux**. Une catégorie peut servir plusieurs fois.',
    hints: ['Posez deux questions : cet outil a-t-il appris à partir d’exemples ? Produit-il du contenu nouveau ?'],
    items: [['i1', 'Règle Sentinel : alerter si plus de 10 échecs de connexion en 5 minutes'], ['i2', 'Modèle entraîné sur des connexions passées qui sort un score de risque'], ['i3', 'Assistant qui rédige un résumé d’incident en français'], ['i4', 'Détecteur de visages d’une caméra (réseau de neurones à plusieurs couches, sortie : visage oui ou non)'], ['i5', 'Outil qui écrit une requête KQL à partir d’une question']],
    options: [['regle', 'Règle écrite à la main (ni ML, ni GenAI)'], ['ml', 'ML classique (prédit ou classe)'], ['dl', 'Apprentissage profond non génératif'], ['gen', 'IA générative (LLM)']],
    answer: { i1: 'regle', i2: 'ml', i3: 'gen', i4: 'dl', i5: 'gen' },
    exp: 'La règle avec un seuil fixe est écrite par un humain : aucun apprentissage. Le score de risque vient d’un modèle entraîné qui prédit, sans produire de contenu. Le détecteur de visages est un réseau profond mais il classe seulement. Le résumé et la requête KQL sont du texte nouveau produit par un LLM, donc de l’IA générative.',
    bad: ['Croire que tout ce qui est « intelligent » est de l’IA générative.', 'Confondre « réseau profond » et « génératif » : le profond peut seulement classer.'],
  }),
  a.short({
    id: 'm01-a1', title: 'Nommer l’opération', comp: 'm01-c1', tags: ['definitions', 'llm'], role: 'autonomous', dim: 'comprendre', lesson: 'm01-l1',
    st: 'Comment appelle-t-on, en un mot, l’utilisation d’un modèle déjà entraîné pour produire une réponse à votre invite (par opposition à son entraînement) ?',
    ph: 'un mot',
    accepted: ['inférence', 'inference'], patterns: ['l ?inference', 'une inference', 'inference du modele'],
    exp: 'C’est l’**inférence**. C’est ce que vous faites à chaque appel d’API et ce qui est facturé à l’usage. L’**entraînement** est la phase, très coûteuse, où le modèle apprend ses paramètres ; presque personne ne la refait.',
    bad: ['Répondre « entraînement » : c’est l’autre phase.', 'Répondre « prompt » : c’est l’entrée, pas l’opération.'],
  }),
  a.qcm({
    id: 'm01-q1a', title: 'Ce que fait un LLM', comp: 'm01-c1', tags: ['llm'], role: 'quiz', dim: 'comprendre', lesson: 'm01-l1',
    st: 'Quelle phrase décrit le mieux ce que fait un grand modèle de langage lorsqu’il répond ?',
    exp: 'Un LLM génère la suite la plus plausible d’un texte, jeton par jeton, à partir de ce qu’il a appris et de ce qui est dans l’invite. Il ne consulte pas de base de faits ni ne vérifie ce qu’il écrit.',
  }, [
    ['Il génère la suite plausible du texte, jeton par jeton.', true, 'Exact : c’est la tâche d’entraînement et le mécanisme d’inférence.'],
    ['Il cherche la réponse dans une base de faits vérifiés.', false, 'Faux : sans source fournie (comme le RAG), il n’interroge aucune base.'],
    ['Il exécute le code qu’il écrit pour confirmer qu’il fonctionne.', false, 'Faux : par défaut un LLM n’exécute rien ; il faut lui donner un outil pour cela.'],
    ['Il mémorise vos conversations précédentes et les relit.', false, 'Faux : il est sans état ; votre application renvoie l’historique à chaque appel.'],
  ]),
  a.qcm({
    id: 'm01-q1b', title: 'L’emboîtement', comp: 'm01-c1', tags: ['definitions'], role: 'quiz', dim: 'comprendre', lesson: 'm01-l1',
    st: 'Laquelle de ces affirmations est **vraie** ?',
    exp: 'L’IA générative est un sous-ensemble de l’apprentissage profond, lui-même un sous-ensemble de l’apprentissage automatique. Un modèle de ML classique n’est pas génératif.',
  }, [
    ['Toute IA générative repose sur de l’apprentissage automatique.', true, 'Vrai : la GenAI moderne est du ML, presque toujours profond.'],
    ['Tout apprentissage automatique est génératif.', false, 'Faux : un modèle qui sort un score ou une étiquette ne génère pas de contenu.'],
    ['L’apprentissage profond est plus large que l’IA.', false, 'Faux : l’IA est le champ le plus large.'],
    ['Une règle de détection à seuil fixe est de l’apprentissage profond.', false, 'Faux : elle est écrite par un humain, sans apprentissage.'],
  ]),
  a.qcm({
    id: 'm01-q1c', title: 'Bon outil pour la tâche', comp: 'm01-c1', tags: ['ml-vs-genai'], role: 'quiz', dim: 'comprendre', lesson: 'm01-l1',
    st: 'Dans quel cas un LLM est-il **le moins** justifié ?',
    exp: 'Quand la tâche est parfaitement définie par un seuil simple et que la sortie doit être déterministe, une règle classique est plus fiable, moins chère et auditable. Le LLM brille quand l’entrée est du langage libre.',
  }, [
    ['Alerter quand un compte dépasse exactement 10 échecs de connexion en 5 minutes.', true, 'C’est un seuil exact : une règle déterministe est meilleure.'],
    ['Résumer en français une chaîne de cinq alertes.', false, 'Texte libre en entrée, texte en sortie : bon cas d’usage.'],
    ['Reformuler le rapport d’un analyste pour un lecteur non technique.', false, 'Reformulation de langage : bon cas d’usage.'],
    ['Extraire les entités d’un courriel d’hameçonnage rédigé librement.', false, 'Entrée non structurée : bon cas d’usage, avec validation de la sortie.'],
  ]),

  // ----- Leçon 2 -----
  a.short({
    id: 'm01-g2', title: 'Compter les jetons d’entrée d’une journée', comp: 'm01-c2', tags: ['tokens', 'cout'], role: 'guided', dim: 'fonctionner', lesson: 'm01-l2',
    st: md('Un workflow traite **1 500 alertes par jour**. Chaque appel envoie en moyenne **2 400 jetons** d’entrée.', '', 'Combien de jetons d’entrée sont envoyés par jour ? Répondez par un nombre entier (sans espace).'),
    hints: ['Multipliez le nombre d’appels par les jetons par appel.'],
    ph: 'nombre de jetons', accepted: ['3600000', '3 600 000'], numeric: { value: 3600000, tol: 0 },
    exp: '1 500 × 2 400 = 3 600 000 jetons d’entrée par jour, avant même de compter la sortie. C’est ce genre de calcul, fait **avant** le déploiement avec les prix actuels du fournisseur, qui évite les mauvaises surprises.',
    bad: ['Oublier de multiplier par le volume d’appels.', 'Ne pas compter la sortie (ici non demandée, mais à ajouter dans un vrai budget).'],
  }),
  a.config({
    id: 'm01-a2', title: 'Régler la génération pour trois tâches', comp: 'm01-c2', tags: ['parametres', 'tokens'], role: 'autonomous', dim: 'fonctionner', lesson: 'm01-l2',
    st: md('Vous configurez l’appel d’un modèle pour la tâche suivante : **extraire du texte d’un courriel un objet JSON de six champs (expéditeur, domaine, URL, pièce jointe, urgence, langue)**, utilisé ensuite par du code.', '', 'Choisissez les réglages les plus raisonnables.'),
    hints: ['L’extraction doit être stable. Un JSON de six champs tient en quelques centaines de jetons.'],
    fields: [
      { id: 'temperature', label: 'Température', kind: 'select', options: [{ id: 'basse', label: 'Basse (0 à 0,2)' }, { id: 'moyenne', label: 'Moyenne (0,5 à 0,7)' }, { id: 'haute', label: 'Haute (1 ou plus)' }], accept: ['basse'], why: 'Pour une extraction, on veut une sortie stable et prévisible, donc une température basse.' },
      { id: 'max', label: 'Longueur maximale de sortie (jetons)', kind: 'number', unit: 'jetons', accept: { min: 300, max: 1000 }, why: 'Assez grand pour contenir tout le JSON sans le couper, assez petit pour ne pas payer ni attendre pour rien.' },
      { id: 'valide', label: 'Valider le JSON par du code avant usage', kind: 'toggle', accept: ['on'], why: 'Même réglé bas, le modèle peut produire un JSON invalide ou tronqué : le code doit le valider.' },
    ],
    solution: { temperature: 'basse', max: 500, valide: 'on' },
    exp: 'Température basse (sortie stable), longueur de sortie de quelques centaines de jetons (JSON complet, pas de gaspillage) et validation par du code (la sortie du modèle n’est jamais une preuve de validité). Plusieurs valeurs numériques sont acceptées dans la plage 300 à 1 000.',
    bad: ['Régler la température haute « pour de meilleurs résultats » : c’est l’inverse pour l’extraction.', 'Fixer une limite de 50 jetons : le JSON sera coupé.'],
  }),
  a.qcm({
    id: 'm01-q2a', title: 'Qu’est-ce qui compte dans la fenêtre ?', comp: 'm01-c2', tags: ['contexte'], role: 'quiz', dim: 'comprendre', lesson: 'm01-l2',
    st: 'Que contient la **fenêtre de contexte** lors d’un appel ? Plusieurs réponses possibles.',
    multi: true,
    exp: 'La fenêtre contient tout ce que le modèle prend en compte : votre invite, l’historique renvoyé, les documents fournis et la réponse générée. Les données d’entraînement ne sont pas dans la fenêtre : elles sont dans les paramètres.',
  }, [
    ['L’invite et les consignes envoyées.', true, 'Oui : ce sont des jetons d’entrée.'],
    ['L’historique de la conversation renvoyé par l’application.', true, 'Oui : le modèle est sans état, donc l’historique compte à chaque appel.'],
    ['La réponse en cours de génération.', true, 'Oui : la sortie occupe aussi la fenêtre.'],
    ['Les milliards de textes utilisés à l’entraînement.', false, 'Non : ils ont servi à fixer les paramètres, ils ne sont pas relus à l’appel.'],
  ]),
  a.qcm({
    id: 'm01-q2b', title: 'JSON coupé', comp: 'm01-c2', tags: ['parametres', 'tokens'], role: 'quiz', dim: 'fonctionner', lesson: 'm01-l2',
    st: 'Un JSON renvoyé par un modèle se termine au milieu d’une phrase, sans accolade fermante. Quelle est la cause **la plus probable** ?',
    exp: 'Une coupure nette en plein mot est la signature d’une limite de longueur de sortie atteinte. Il faut augmenter la limite ou raccourcir la demande, et valider le JSON avant usage.',
  }, [
    ['La longueur maximale de sortie a été atteinte.', true, 'Oui : la génération s’arrête net quand le plafond est atteint.'],
    ['La température était trop basse.', false, 'La température change le choix des mots, pas la longueur maximale.'],
    ['Le modèle a décidé de désobéir.', false, 'Un modèle ne « désobéit » pas ainsi ; cherchez d’abord une cause technique.'],
    ['La fenêtre de contexte est toujours infinie, donc c’est un bogue du réseau.', false, 'La fenêtre est limitée, et ce symptôme précis pointe vers la limite de sortie.'],
  ]),
  a.short({
    id: 'm01-q2c', title: 'Mot manquant', comp: 'm01-c2', tags: ['tokens'], role: 'quiz', dim: 'comprendre', lesson: 'm01-l2',
    st: 'Le modèle ne lit pas des lettres ni des mots entiers : le texte est d’abord découpé en petites unités appelées…',
    ph: 'un mot', accepted: ['jetons', 'jeton', 'tokens', 'token'], patterns: ['des jetons', 'des tokens', 'les jetons', 'les tokens'],
    exp: 'Ce sont des **jetons** (tokens). Les coûts, les limites de contexte et la longueur des réponses se mesurent en jetons.',
  }),

  // ----- Leçon 3 -----
  a.workflow({
    id: 'm01-g3', title: 'Préparer un résumé d’incident sans fuite', comp: 'm01-c3', tags: ['vie-privee', 'hallucination'], role: 'guided', dim: 'securiser', lesson: 'm01-l3',
    st: md('Construisez les étapes d’un petit flux qui **résume un incident** avec un modèle hébergé, en protégeant les données.', '', 'Glissez les blocs nécessaires dans l’ordre. Certains blocs sont à éviter.'),
    hints: ['Le résumé se prépare avant l’appel, et se contrôle après.'],
    blocks: [['b1', 'Récupérer les alertes de l’incident'], ['b2', 'Retirer les secrets et pseudonymiser les identités'], ['b3', 'Appeler le modèle avec la consigne de résumer'], ['b4', 'Vérifier le résultat (format, entités connues)'], ['b5', 'Remettre les vrais noms'], ['b6', 'Envoyer l’incident brut complet au modèle, secrets compris'], ['b7', 'Présenter le brouillon à l’analyste pour validation']],
    required: ['b1', 'b2', 'b3', 'b4', 'b5', 'b7'], forbidden: ['b6'],
    before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4'], ['b4', 'b5'], ['b5', 'b7']],
    notes: { b6: 'Envoyer les secrets et les identités sans nécessité viole le principe du minimum nécessaire.', b4: 'Le contrôle après l’appel est obligatoire : la sortie n’est pas une preuve.' },
    solution: ['b1', 'b2', 'b3', 'b4', 'b5', 'b7'],
    exp: 'On prélève les données, on retire secrets et identités, on appelle le modèle, on contrôle la sortie, on remet les vrais noms, et on soumet le brouillon à l’analyste. Plusieurs ordres équivalents de remise des noms et de vérification sont possibles, mais jamais d’envoi brut.',
  }),
  a.inspect({
    id: 'm01-a3', title: 'Trouver ce qui ne devrait pas partir', comp: 'm01-c3', tags: ['vie-privee'], role: 'autonomous', dim: 'securiser', lesson: 'm01-l3', language: 'text',
    st: 'Voici l’invite qu’un workflow s’apprête à envoyer à un modèle hébergé. Repérez les lignes qui contiennent des données à ne pas envoyer, et choisissez le bon correctif.',
    lines: [
      ['l1', 'Résume l’incident suivant pour la direction, en trois phrases.'],
      ['l2', 'Utilisateur : marie.gagnon@exemple.test', { ok: 'r1', fixes: [['r1', 'Remplacer par [UTILISATEUR_1] et garder la table de correspondance localement'], ['r2', 'Laisser tel quel, c’est un domaine fictif']] }],
      ['l3', 'Poste : PC-COMPTA-07, adresse 10.0.4.17'],
      ['l4', 'Clé d’API trouvée dans le journal : sk_live_EXEMPLE_NE_PAS_UTILISER', { ok: 's1', fixes: [['s1', 'Supprimer la clé : un secret ne part jamais vers un modèle'], ['s2', 'La masquer à moitié et l’envoyer']] }],
      ['l5', 'Action observée : téléchargement de 4 fichiers à 02 h 14.'],
    ],
    exp: 'La ligne 2 contient une identité : on la remplace par un marqueur. La ligne 4 contient un secret : on la supprime entièrement, car un secret partiellement masqué reste un secret. Les lignes 3 et 5 pourraient aussi être pseudonymisées selon la politique, mais elles ne sont pas les défauts les plus graves. Ici les défauts à corriger sont ceux marqués par les lignes 2 et 4.',
    bad: ['Masquer à moitié un secret et l’envoyer quand même.'],
  }),
  a.qcm({
    id: 'm01-q3a', title: 'Cause d’une hallucination', comp: 'm01-c3', tags: ['hallucination'], role: 'quiz', dim: 'comprendre', lesson: 'm01-l3',
    st: 'Pourquoi un LLM peut-il inventer un nom de fonction KQL qui n’existe pas ?',
    exp: 'Le modèle produit la suite plausible, pas nécessairement vraie. Sans schéma ou documentation fournie, il peut générer un nom qui « sonne juste ».',
  }, [
    ['Parce qu’il génère la suite plausible, sans vérifier l’existence de la fonction.', true, 'Exact : plausibilité n’est pas vérité.'],
    ['Parce que KQL est un langage secret que les modèles ne peuvent pas apprendre.', false, 'Faux : les modèles connaissent beaucoup de KQL, mais peuvent se tromper.'],
    ['Parce que sa température est toujours trop élevée.', false, 'Faux : même à température basse il peut halluciner.'],
    ['Parce qu’il refuse de répondre sans connexion à Internet.', false, 'Faux : il répond sans Internet, et c’est le problème.'],
  ]),
  a.qcm({
    id: 'm01-q3b', title: 'Hébergé ou local', comp: 'm01-c3', tags: ['deploiement'], role: 'quiz', dim: 'securiser', lesson: 'm01-l3',
    st: 'Une équipe veut un modèle dont les données ne quittent jamais son propre réseau et accepte d’exploiter elle-même le serveur. Quelle option correspond **le mieux** ?',
    exp: 'Un modèle local garde les données chez vous mais déplace sur vous la sécurité, les mises à jour et le matériel. Un modèle hébergé sur Azure offre des engagements contractuels, mais les données sortent du réseau interne.',
  }, [
    ['Un modèle local exploité par l’équipe.', true, 'Cohérent avec le critère : les données restent chez eux, la maintenance aussi.'],
    ['Un modèle hébergé public sans contrat.', false, 'Les données sortent et rien ne les encadre : contraire au besoin.'],
    ['Aucun modèle n’est possible dans ce cas.', false, 'Faux : un modèle local ou un déploiement privé est justement possible.'],
    ['Un modèle hébergé, car « hébergé » veut dire « local ».', false, 'Faux : hébergé signifie exécuté chez le fournisseur.'],
  ]),
  a.qcm({
    id: 'm01-q3c', title: 'Que peut-on envoyer ?', comp: 'm01-c3', tags: ['vie-privee'], role: 'quiz', dim: 'securiser', lesson: 'm01-l3',
    st: 'Parmi ces éléments, lequel ne doit **jamais** être envoyé à un modèle, même hébergé dans votre abonnement Azure ?',
    exp: 'Les secrets (mots de passe, clés d’API, jetons) n’ont aucune raison d’être lus par un modèle : le risque de journalisation, de fuite ou de réutilisation est inutile.',
  }, [
    ['Une clé d’API trouvée dans un journal.', true, 'Un secret reste un secret : il est retiré avant tout envoi.'],
    ['Un résumé d’alerte pseudonymisé.', false, 'Acceptable : les identités sont remplacées.'],
    ['La description publique d’une technique d’attaque.', false, 'Acceptable : information publique.'],
    ['Le schéma d’une table de test avec des données fictives.', false, 'Acceptable : aucune donnée réelle.'],
  ]),

  // ----- Évaluation du module (8) -----
  a.qcm({
    id: 'm01-ev1', title: 'Définir la GenAI', comp: 'm01-c1', tags: ['definitions'], role: 'eval', dim: 'comprendre', lesson: 'm01-l1',
    st: 'Quelle définition de l’IA générative est la plus exacte ?',
    exp: 'L’IA générative produit du contenu nouveau (texte, code, image) à partir de ce qu’elle a appris, par opposition à un modèle qui classe ou prédit une valeur.',
  }, [
    ['Des modèles qui produisent du contenu nouveau comme du texte ou du code.', true, 'Exact.'],
    ['Tout programme qui contient des règles « si... alors ».', false, 'C’est de la programmation classique.'],
    ['Un modèle qui ne fait que classer des courriels en deux catégories.', false, 'C’est une classification : pas générative par nature.'],
    ['Un moteur de recherche qui renvoie des liens.', false, 'Il retrouve des documents existants, il ne génère pas.'],
  ]),
  a.short({
    id: 'm01-ev2', title: 'Phase d’apprentissage', comp: 'm01-c1', tags: ['definitions'], role: 'eval', dim: 'comprendre', lesson: 'm01-l1',
    st: 'Comment nomme-t-on la phase où un modèle apprend ses paramètres à partir de grandes quantités de données (par opposition à l’inférence) ?',
    ph: 'un mot', accepted: ['entrainement', 'entraînement', 'apprentissage'], patterns: ['l ?entrainement', 'phase d entrainement', 'training'],
    exp: 'C’est l’**entraînement**. Il est coûteux et rarement refait par un SOC, qui utilise l’inférence sur un modèle déjà entraîné.',
  }),
  a.config({
    id: 'm01-ev3', title: 'Réglages pour un brainstorming de scénarios', comp: 'm01-c2', tags: ['parametres'], role: 'eval', dim: 'fonctionner', lesson: 'm01-l2',
    st: 'Vous voulez qu’un modèle propose **plusieurs scénarios d’attaque variés** pour un exercice de table (sans conséquence si l’un est faux). Choisissez les réglages.',
    fields: [
      { id: 'temperature', label: 'Température', kind: 'select', options: [{ id: 'basse', label: 'Basse' }, { id: 'moyenne', label: 'Moyenne à haute' }], accept: ['moyenne'], why: 'On veut de la variété : une température plus élevée convient à l’exploration.' },
      { id: 'max', label: 'Longueur maximale de sortie (jetons)', kind: 'number', unit: 'jetons', accept: { min: 400, max: 2000 }, why: 'Des scénarios détaillés demandent de la place, sans excès.' },
      { id: 'valide', label: 'Un humain relit les scénarios avant usage', kind: 'toggle', accept: ['on'], why: 'Le contenu généré reste une proposition à relire.' },
    ],
    solution: { temperature: 'moyenne', max: 800, valide: 'on' },
    exp: 'Pour explorer, une température plus élevée ajoute de la variété. La limite de sortie doit laisser de la place. La relecture humaine reste de mise car la sortie n’est pas garantie.',
  }),
  a.fix({
    id: 'm01-ev4', title: 'Corriger une sortie JSON invalide', comp: 'm01-c2', tags: ['tokens', 'parametres'], role: 'eval', dim: 'fonctionner', lesson: 'm01-l2', language: 'json',
    st: 'Ce JSON, renvoyé par un modèle, a été coupé et contient une erreur de syntaxe. Réparez-le pour qu’il soit **valide**, avec `severite` égale à `"Elevee"` et `entites` contenant les deux éléments.',
    starter: '{\n  "incident": "INC-1042",\n  "severite": "Elevee"\n  "entites": ["utilisateur_1", "serveur_1"],\n  "resume": "Plusieurs connexions échouées suivies d’une connexion réuss',
    rules: [
      { kind: 'parses', message: 'Le JSON doit être valide (virgules, guillemets et accolade fermante).', dim: 'fonctionner' },
      { kind: 'equals', path: 'severite', value: 'Elevee', message: 'severite doit valoir "Elevee".' },
      { kind: 'type', path: 'entites', type: 'array', message: 'entites doit être un tableau.' },
      { kind: 'contains', path: 'entites', value: 'serveur_1', message: 'entites doit contenir "serveur_1".' },
      { kind: 'contains', path: 'entites', value: 'utilisateur_1', message: 'entites doit contenir "utilisateur_1".' },
      { kind: 'type', path: 'resume', type: 'string', message: 'resume doit être une chaîne complète.' },
    ],
    solution: '{\n  "incident": "INC-1042",\n  "severite": "Elevee",\n  "entites": ["utilisateur_1", "serveur_1"],\n  "resume": "Plusieurs connexions échouées suivies d’une connexion réussie."\n}',
    exp: 'Il manquait une virgule après `"Elevee"`, la chaîne de `resume` n’était pas fermée, et l’accolade finale manquait. En production, le vrai correctif est de **valider** la sortie et de relancer l’appel avec une limite plus haute, plutôt que de réparer à la main.',
  }),
  a.qcm({
    id: 'm01-ev5', title: 'Réponse à une question sans source', comp: 'm01-c3', tags: ['hallucination'], role: 'eval', dim: 'securiser', lesson: 'm01-l3',
    st: 'Un assistant affirme avec assurance : « La table `DeviceFileCertificateInfoExtra` contient la colonne `RiskScore`. » Vous n’avez fourni aucun schéma. Que faites-vous ?',
    exp: 'Sans source, l’affirmation est une proposition. On vérifie dans la documentation officielle ou par une requête de test dans un espace de travail, au lieu de lui faire confiance.',
  }, [
    ['Je vérifie le schéma réel avant d’utiliser la colonne.', true, 'Réflexe correct : vérification déterministe.'],
    ['Je l’utilise : le ton assuré prouve que c’est exact.', false, 'L’assurance du ton ne prouve rien.'],
    ['Je redemande trois fois et je prends la réponse majoritaire.', false, 'La répétition ne vérifie pas un fait ; trois erreurs identiques restent des erreurs.'],
    ['Je baisse la température à 0 et je considère la réponse fiable.', false, 'La température ne garantit pas l’exactitude.'],
  ]),
  a.place({
    id: 'm01-ev6', title: 'Classer les données avant envoi', comp: 'm01-c3', tags: ['vie-privee'], role: 'eval', dim: 'securiser', lesson: 'm01-l3',
    st: 'Placez chaque élément dans la zone appropriée avant un appel à un modèle hébergé.',
    items: [['d1', 'Mot de passe d’un compte de service'], ['d2', 'Nom complet d’un employé'], ['d3', 'Description publique d’une technique MITRE ATT&CK'], ['d4', 'Adresse IP interne d’un serveur'], ['d5', 'Jeton d’accès JWT trouvé dans un journal']],
    zones: [['z1', 'Ne jamais envoyer', 'Secrets et identifiants'], ['z2', 'Pseudonymiser ou retirer si possible', 'Identités et infrastructure'], ['z3', 'Peut être envoyé', 'Information publique']],
    answer: { d1: 'z1', d5: 'z1', d2: 'z2', d4: 'z2', d3: 'z3' },
    exp: 'Mot de passe et jeton sont des secrets : jamais. Nom d’employé et adresse IP interne sont des identités et de l’infrastructure : on pseudonymise ou on retire si la tâche n’en a pas besoin. La description d’une technique publique peut être envoyée.',
  }),
  a.qcm({
    id: 'm01-ev7', title: 'Raisonner sur un coût', comp: 'm01-c2', tags: ['cout'], role: 'eval', dim: 'maintenir', lesson: 'm01-l2',
    st: 'Votre workflow fonctionne bien en test avec 20 alertes. Que faites-vous **avant** de l’activer pour 3 000 alertes par jour ? Plusieurs réponses possibles.',
    multi: true,
    exp: 'Estimer les jetons et le coût au volume réel, fixer un plafond avec arrêt automatique et prévoir un suivi permettent d’éviter une facture ou un blocage inattendu. Le succès à petite échelle ne prouve ni le coût ni les limites à grande échelle.',
  }, [
    ['Estimer les jetons d’entrée et de sortie au volume réel.', true, 'Oui : le coût et les limites dépendent du volume.'],
    ['Fixer un plafond quotidien avec arrêt automatique.', true, 'Oui : un garde-fou contre les boucles ou les pics.'],
    ['Prévoir un suivi du nombre d’appels et du coût.', true, 'Oui : sans mesure, on ne voit pas la dérive.'],
    ['Ne rien faire : si 20 alertes passent, 3 000 passeront aussi.', false, 'Faux : le volume change les coûts, les limites de débit et les pannes.'],
  ]),
  a.qcm({
    id: 'm01-ev8', title: 'Choisir où s’exécute le modèle', comp: 'm01-c3', tags: ['deploiement', 'vie-privee'], role: 'eval', dim: 'securiser', lesson: 'm01-l3',
    st: 'Une équipe veut résumer des incidents contenant des données internes avec un modèle déployé dans son abonnement Azure. Quelle démarche est la plus responsable ?',
    exp: 'La documentation de Microsoft décrit des engagements de confidentialité, mais précise que la conservation dépend des fonctionnalités et du type de déploiement. On lit la page officielle, on choisit le déploiement adapté, on minimise les données et on garde un humain.',
  }, [
    ['Lire la page officielle sur les données, choisir le type de déploiement, minimiser les données et garder une validation humaine.', true, 'Démarche complète et vérifiable.'],
    ['Considérer que « c’est dans Azure », donc tout est permis.', false, 'Faux : les fonctionnalités avec état et le type de déploiement changent la conservation et le lieu de traitement.'],
    ['Désactiver toute surveillance sans lire les conditions.', false, 'Faux : certaines options exigent une approbation et ont des conséquences.'],
    ['Envoyer d’abord les vraies données, puis lire la documentation.', false, 'Faux : l’ordre est inversé ; on évalue avant d’envoyer.'],
  ]),

  // ----- Cas pratique -----
  a.qcm({
    id: 'm01-cs1', title: 'Cas : le premier prototype', comp: 'm01-c3', tags: ['hallucination', 'vie-privee'], role: 'case', dim: 'securiser', lesson: 'm01-l3',
    st: 'Un collègue a collé dans un assistant public le courriel d’un employé et deux extraits de journaux contenant un jeton. L’assistant a répondu : « Il s’agit certainement de l’acteur APT-99. » Quelle est votre **première** réaction ?',
    exp: 'Il y a deux problèmes distincts : une fuite potentielle de données et de secret (à traiter comme un incident de confidentialité, jeton à révoquer) et une attribution inventée sans preuve (une hallucination plausible). Les deux demandent une action, mais la révocation du jeton est urgente.',
  }, [
    ['Révoquer le jeton exposé, signaler la fuite potentielle et traiter l’attribution comme non vérifiée.', true, 'Réponse complète : sécurité d’abord, puis vérification.'],
    ['Noter l’attribution à l’acteur dans le rapport, puisque l’outil l’affirme.', false, 'Aucune preuve ne soutient l’attribution.'],
    ['Ne rien faire : l’assistant est public donc les données sont déjà publiques.', false, 'Faux et dangereux : on doit évaluer l’exposition et révoquer le secret.'],
    ['Demander à l’assistant de supprimer la conversation et considérer le dossier clos.', false, 'La suppression ne prouve pas l’absence de fuite et n’annule pas le risque du jeton.'],
  ]),
  a.config({
    id: 'm01-cs2', title: 'Cas : concevoir l’appel du modèle', comp: 'm01-c2', tags: ['parametres', 'cout', 'deploiement'], role: 'case', dim: 'fonctionner', lesson: 'm01-l2',
    st: 'Vous préparez un pilote : résumer chaque incident en 120 mots au plus pour environ 40 incidents par jour (800 jetons d’entrée chacun après filtrage). Choisissez une configuration prudente.',
    fields: [
      { id: 'temperature', label: 'Température', kind: 'select', options: [{ id: 'basse', label: 'Basse' }, { id: 'haute', label: 'Haute' }], accept: ['basse'], why: 'Un résumé factuel doit rester stable.' },
      { id: 'max', label: 'Longueur maximale de sortie (jetons)', kind: 'number', unit: 'jetons', accept: { min: 200, max: 400 }, why: '120 mots en français représentent environ 200 à 250 jetons ; une marge raisonnable évite la coupure.' },
      { id: 'plafond', label: 'Plafond quotidien d’appels', kind: 'number', unit: 'appels', accept: { min: 50, max: 200 }, why: 'Environ 40 incidents par jour : un plafond au-dessus avec de la marge arrête une boucle sans bloquer l’usage normal.' },
      { id: 'humain', label: 'Validation humaine avant diffusion', kind: 'toggle', accept: ['on'], why: 'Un résumé généré peut contenir une erreur ou une invention.' },
    ],
    solution: { temperature: 'basse', max: 300, plafond: 100, humain: 'on' },
    exp: 'Température basse, sortie plafonnée avec marge, plafond d’appels proche du volume attendu et validation humaine. Les valeurs numériques acceptées couvrent plusieurs choix raisonnables.',
  }),
  a.workflow({
    id: 'm01-cs3', title: 'Cas : le flux final du pilote', comp: 'm01-c3', tags: ['vie-privee', 'hallucination', 'cout'], role: 'case', dim: 'securiser', lesson: 'm01-l3',
    st: 'Assemblez le flux du pilote de résumé d’incidents, de l’alerte jusqu’à la diffusion. Incluez les garde-fous appris dans ce module.',
    blocks: [['p1', 'Lire l’incident dans Sentinel'], ['p2', 'Pseudonymiser et retirer les secrets'], ['p3', 'Vérifier le budget restant du jour'], ['p4', 'Appeler le modèle (température basse)'], ['p5', 'Valider le format et les entités citées'], ['p6', 'Remettre les vrais noms'], ['p7', 'Validation par l’analyste'], ['p8', 'Diffuser automatiquement à la direction sans relecture'], ['p9', 'Envoyer les journaux bruts au modèle']],
    required: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'], forbidden: ['p8', 'p9'],
    before: [['p1', 'p2'], ['p2', 'p4'], ['p3', 'p4'], ['p4', 'p5'], ['p5', 'p6'], ['p6', 'p7']],
    notes: { p8: 'Aucune diffusion sans relecture : la sortie du modèle est une proposition.', p9: 'Les journaux bruts contiennent des secrets et des identités.' },
    solution: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'],
    exp: 'Le budget peut se vérifier avant ou après la pseudonymisation, mais toujours avant l’appel. Les contraintes essentielles : pseudonymiser avant l’appel, valider après, remettre les noms puis faire valider par l’analyste.',
  }),
  a.open({
    id: 'm01-cs-open', title: 'Cas : note de cadrage d’un pilote', comp: 'm01-c3', tags: ['deploiement', 'vie-privee', 'cout'], role: 'case', dim: 'maintenir', lesson: 'm01-l3',
    st: 'Rédigez une note de cadrage d’une demi-page pour le pilote de résumé d’incidents. Elle doit permettre à votre gestionnaire de décider si le pilote peut démarrer.',
    deliverable: 'Une note d’une demi-page : objectif, données utilisées, où s’exécute le modèle, garde-fous, coût estimé, critères de succès et d’arrêt.',
    rubric: [
      ['r1', 'L’objectif est précis et mesurable (par exemple temps gagné par incident).', 'comprendre'],
      ['r2', 'Les données envoyées au modèle sont listées, avec celles qui sont retirées ou pseudonymisées.', 'securiser'],
      ['r3', 'Le lieu d’exécution est indiqué et la page officielle de confidentialité du fournisseur est citée.', 'securiser'],
      ['r4', 'Les garde-fous sont décrits : validation de la sortie, relecture humaine, plafond de coût.', 'securiser'],
      ['r5', 'Le coût est estimé avec le volume réel et des prix à jour.', 'maintenir'],
      ['r6', 'Des critères de succès et d’arrêt sont définis.', 'maintenir'],
    ],
    exp: 'Il n’y a pas de note automatique : comparez votre note à la grille. Une bonne note permet de dire oui ou non sans poser de question de plus.',
  }),

  // ----- Remédiation -----
  a.qcm({
    id: 'm01-rm1', title: 'Remédiation : ML ou GenAI ?', comp: 'm01-c1', tags: ['definitions', 'ml-vs-genai'], role: 'remediation', dim: 'comprendre', lesson: 'm01-l1',
    st: 'Un modèle reçoit le nombre de connexions échouées, l’heure et le pays, et renvoie un score entre 0 et 1. De quelle catégorie relève-t-il ?',
    exp: 'Entrée structurée, sortie étroite (un score), entraîné sur des exemples : c’est du ML classique, pas de l’IA générative.',
  }, [
    ['ML classique (prédiction).', true, 'Il prédit un score à partir de variables.'],
    ['IA générative.', false, 'Il ne produit pas de contenu nouveau.'],
    ['Une règle écrite à la main.', false, 'Il a appris sur des exemples.'],
    ['Un moteur de recherche.', false, 'Il ne retrouve pas de documents.'],
  ]),
  a.short({
    id: 'm01-rm2', title: 'Remédiation : tokens et coûts', comp: 'm01-c2', tags: ['tokens', 'cout', 'contexte'], role: 'remediation', dim: 'fonctionner', lesson: 'm01-l2',
    st: 'Un appel envoie 5 000 jetons d’entrée et reçoit 500 jetons de sortie. Combien de jetons l’appel manipule-t-il au total dans la fenêtre de contexte ?',
    ph: 'nombre', accepted: ['5500'], numeric: { value: 5500, tol: 0 },
    exp: 'La fenêtre contient l’entrée **et** la sortie : 5 000 + 500 = 5 500 jetons.',
  }),
  a.qcm({
    id: 'm01-rm3', title: 'Remédiation : réduire les hallucinations', comp: 'm01-c3', tags: ['hallucination'], role: 'remediation', dim: 'securiser', lesson: 'm01-l3',
    st: 'Quelles pratiques réduisent le risque d’hallucination ? Plusieurs réponses possibles.',
    multi: true,
    exp: 'Fournir la source, autoriser l’abstention, citer et vérifier par du code réduisent le risque. Demander plus fort de « ne pas se tromper » ne suffit pas.',
  }, [
    ['Fournir le schéma réel et demander de répondre uniquement à partir de lui.', true, 'Ancre la réponse dans une source.'],
    ['Autoriser la réponse « INCONNU » quand l’information manque.', true, 'Évite de forcer une invention.'],
    ['Vérifier la requête dans un espace de test.', true, 'Contrôle déterministe.'],
    ['Écrire « ne te trompe pas » en majuscules.', false, 'Une consigne d’intention n’est pas un contrôle.'],
  ]),
  a.inspect({
    id: 'm01-rm4', title: 'Remédiation : repérer le secret', comp: 'm01-c3', tags: ['vie-privee'], role: 'remediation', dim: 'securiser', lesson: 'm01-l3', language: 'text',
    st: 'Ce texte s’apprête à être envoyé à un modèle. Repérez la ligne qui ne doit jamais partir.',
    lines: [
      ['x1', 'Contexte : tentative de connexion inhabituelle à 02 h 14.'],
      ['x2', 'Mot de passe du compte de service : Printemps2024!', { ok: 'y1', fixes: [['y1', 'Supprimer la ligne : un mot de passe ne part jamais'], ['y2', 'Remplacer par des étoiles et l’envoyer']] }],
      ['x3', 'Résultat attendu : un résumé de deux phrases.'],
    ],
    exp: 'Le mot de passe doit être supprimé du texte. Remplacer par des étoiles et envoyer n’apporte rien de plus et laisse planer un risque : si le secret a été exposé, il doit aussi être changé.',
  }),
];

// ---------------------------------------------------------------------------------------------------------------
// Compétences, projets, module
// ---------------------------------------------------------------------------------------------------------------

const competencies: AiCompetency[] = [
  {
    id: 'm01-c1', module: 'm01', name: 'Situer chaque type d’IA et son rôle',
    description: 'Distinguer IA, ML, DL et GenAI, expliquer ce qu’est un LLM et choisir entre une règle, un modèle de ML et un LLM.',
    criteria: [
      { id: 'm01-c1-1', text: 'Je peux expliquer l’emboîtement IA, ML, DL, GenAI avec un exemple de SOC pour chaque niveau.' },
      { id: 'm01-c1-2', text: 'Je peux dire pourquoi un LLM ne vérifie pas les faits et n’a pas de mémoire propre.' },
      { id: 'm01-c1-3', text: 'Je peux justifier un cas où une règle déterministe est préférable à un LLM.' },
    ],
  },
  {
    id: 'm01-c2', module: 'm01', name: 'Raisonner sur jetons, contexte, paramètres et coûts',
    description: 'Estimer des jetons, anticiper la fenêtre de contexte, régler la génération et chiffrer un volume.',
    criteria: [
      { id: 'm01-c2-1', text: 'Je peux estimer les jetons et le coût d’un workflow à partir du volume réel.' },
      { id: 'm01-c2-2', text: 'Je choisis température et longueur de sortie selon la tâche et je sais pourquoi une sortie est coupée.' },
      { id: 'm01-c2-3', text: 'Je valide la sortie par du code au lieu de supposer qu’elle est reproductible.' },
    ],
  },
  {
    id: 'm01-c3', module: 'm01', name: 'Évaluer risques, déploiement et vie privée',
    description: 'Gérer les hallucinations, choisir où le modèle s’exécute et décider quelles données lui envoyer.',
    criteria: [
      { id: 'm01-c3-1', text: 'Je peux citer au moins quatre pratiques qui réduisent le risque d’hallucination.' },
      { id: 'm01-c3-2', text: 'Je compare modèle hébergé et local sur confidentialité, coût, qualité et maintenance.' },
      { id: 'm01-c3-3', text: 'Je pseudonymise, je retire les secrets et je fixe un budget avant un pilote.' },
    ],
  },
];

const projects: AiProject[] = [
  {
    id: 'm01-p1', module: 'm01', level: 'débutant', title: 'Fiche d’usage responsable de l’IA pour un SOC',
    problem: 'Votre équipe utilise des assistants IA sans règles communes. Vous produisez une fiche d’une page qui dit quoi envoyer, quoi ne jamais envoyer et comment vérifier.',
    architecture: 'Aucun logiciel : un document à partir de la classification des données du module et de la page officielle de confidentialité de votre fournisseur.',
    tools: ['Un éditeur de texte ou de documents', 'Page de confidentialité du fournisseur utilisé'],
    data: 'Aucune donnée réelle. Exemples fictifs seulement.',
    steps: ['Lister les types de données manipulés dans votre SOC.', 'Les classer en « jamais », « pseudonymiser » et « permis ».', 'Écrire trois règles de vérification des réponses du modèle.', 'Ajouter un exemple avant et après pseudonymisation.', 'Faire relire par un collègue.'],
    success: ['Un lecteur peut décider seul d’envoyer ou non un texte.', 'Les secrets sont explicitement interdits.', 'La fiche cite une source officielle.'],
    risks: ['Fiche trop longue et jamais lue.', 'Règles qui ne reflètent pas l’outil réellement approuvé.'],
    extensions: ['Version courte affichée comme aide-mémoire.', 'Ajout d’un contrôle automatique des secrets (module 16).'],
  },
  {
    id: 'm01-p2', module: 'm01', level: 'intermédiaire', title: 'Calculateur de coût et de contexte',
    problem: 'Avant un pilote, il faut chiffrer le coût et vérifier que les textes tiennent dans la fenêtre de contexte.',
    architecture: 'Un petit script Python qui reçoit le nombre d’appels, les jetons moyens d’entrée et de sortie et les prix, puis calcule coût quotidien, mensuel et marge de la fenêtre.',
    tools: ['Python 3', 'Un tableur pour comparer des scénarios'],
    data: 'Paramètres saisis à la main (prix à jour du fournisseur, volumes estimés).',
    steps: ['Définir les variables du calcul.', 'Écrire une fonction qui calcule le coût.', 'Ajouter un contrôle : entrée plus sortie inférieure à la fenêtre.', 'Tester avec trois scénarios (petit, nominal, pic).', 'Documenter les hypothèses.'],
    success: ['Les trois scénarios sont calculés et comparés.', 'Une alerte apparaît quand la fenêtre est dépassée.', 'Les prix sont une entrée, jamais codés en dur sans date.'],
    risks: ['Utiliser des prix périmés.', 'Oublier que les jetons de sortie coûtent souvent plus cher.'],
    extensions: ['Lire les volumes d’un fichier CSV.', 'Ajouter un plafond quotidien avec avertissement.'],
  },
  {
    id: 'm01-p3', module: 'm01', level: 'avancé', title: 'Banc de tests d’hallucinations sur un schéma KQL',
    problem: 'Vous voulez mesurer à quelle fréquence un assistant invente des colonnes ou des fonctions KQL, avec et sans schéma fourni.',
    architecture: 'Un jeu de 20 questions fictives, un schéma de référence (fichier JSON), deux conditions de test (sans schéma, avec schéma) et un vérificateur déterministe qui compare les colonnes citées au schéma.',
    tools: ['Un assistant IA accessible à votre équipe', 'Python 3', 'Fichier JSON du schéma'],
    data: 'Schéma de tables fictives. Aucune donnée réelle.',
    steps: ['Écrire les 20 questions avec la réponse attendue.', 'Obtenir les réponses dans les deux conditions.', 'Extraire les colonnes et fonctions citées par un script.', 'Comparer au schéma et compter les invention.', 'Rédiger une conclusion avec limites (taille de l’échantillon, variabilité).'],
    success: ['Les deux conditions sont comparées sur les mêmes questions.', 'Le vérificateur est déterministe et documenté.', 'La conclusion ne prétend pas à plus que 20 questions ne permettent.'],
    risks: ['Conclure à partir d’un petit échantillon.', 'Biais si les questions sont écrites après avoir vu les réponses.'],
    extensions: ['Répéter à intervalles réguliers pour voir la dérive après une mise à jour du modèle.', 'Réutiliser le banc dans le module 17.'],
  },
];

const module_: AiModule = {
  id: 'm01',
  level: 1,
  n: 1,
  title: 'Comprendre l’IA',
  summary: 'IA, apprentissage automatique, apprentissage profond et IA générative. Jetons, contexte, paramètres, hallucinations, déploiement et vie privée.',
  lessons: ['m01-l1', 'm01-l2', 'm01-l3'],
  evaluation: ['m01-ev1', 'm01-ev2', 'm01-ev3', 'm01-ev4', 'm01-ev5', 'm01-ev6', 'm01-ev7', 'm01-ev8'],
  caseStudy: 'm01-case',
  competencies: ['m01-c1', 'm01-c2', 'm01-c3'],
  projects: ['m01-p1', 'm01-p2', 'm01-p3'],
  remediation: ['m01-rm1', 'm01-rm2', 'm01-rm3', 'm01-rm4'],
};

export const m01: ModuleContent = {
  module: module_,
  lessons: [l1, l2, l3],
  exercises,
  competencies,
  caseStudy: {
    id: 'm01-case',
    module: 'm01',
    title: 'Premier pilote d’IA : de l’incident à la note de cadrage',
    scenario: 'Votre équipe veut piloter un résumé automatique d’incidents. Un collègue a déjà tenté l’expérience avec un assistant public, avec des données réelles. Vous devez traiter l’incident de confidentialité, régler l’appel au modèle, assembler le flux protégé, puis écrire la note de cadrage.',
    steps: ['m01-cs1', 'm01-cs2', 'm01-cs3'],
    deliverable: 'm01-cs-open',
    minutes: 35,
  },
  projects,
};
