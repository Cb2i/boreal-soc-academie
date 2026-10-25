import type { AiProject } from '../../agentic/types.ts';

// Généré par scripts/labs/*.py : ne pas éditer à la main.
export const IA_FINAL_LABS: AiProject[] = [
 {
  "id": "f01",
  "module": "final",
  "level": "avancé",
  "title": "Assistant de triage SOC avec validation humaine",
  "problem": "Construire de bout en bout un assistant de triage : cadrage, schéma de sortie, file d'approbation, évaluation et mise en service par modes.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Éditeur de texte",
   "Tableur",
   "Terrain de jeu KQL (contexte Sentinel)"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Cadrer le périmètre",
   "Concevoir la sortie et la file d'approbation",
   "Définir l'évaluation",
   "Planifier la mise en service"
  ],
  "success": [
   "La décision reste humaine.",
   "Les faux négatifs graves sont suivis à part.",
   "Un mode ombre précède l'assistance."
  ],
  "risks": [
   "Périmètre flou.",
   "Seuil fixé après la mesure.",
   "Aucune coupure d'urgence."
  ],
  "extensions": [
   "Ajouter une métrique de temps gagné.",
   "Étendre à une seconde source d'alertes."
  ],
  "lab": {
   "client": "Le SOC de **Nordlys** reçoit 300 alertes par jour pour trois analystes. La direction veut un assistant qui prépare le triage, mais exige que **chaque décision reste humaine**. Vous livrez le dossier complet : cadrage, conception, évaluation, plan de mise en service. Rien n'est déployé : ce projet de synthèse est entièrement simulé avec des données fictives.",
   "mission": "Cadrer le périmètre, concevoir la sortie structurée et la file d'approbation, définir l'évaluation et le plan de mise en service par modes.",
   "duration": "3 h",
   "mode": "simule",
   "parts": [
    {
     "title": "Cadrer le périmètre",
     "goal": "Décider ce que l'assistant fait et ne fait pas.",
     "steps": "1. Listez les alertes **dans le périmètre** et celles qui en sont exclues (par exemple les alertes de gravité élevée touchant des systèmes critiques).\n2. Écrivez en une phrase le rôle de l'assistant : proposer, jamais décider.\n3. Quels outils en lecture lui donnez-vous ?\n4. Quelle donnée ne doit jamais lui être transmise ?",
     "expected": "Le périmètre exclut explicitement les cas où une erreur est irréversible. Le rôle est « proposer ». Les outils sont en lecture seule. Les secrets et les données personnelles inutiles ne sont jamais transmis. Un périmètre écrit permet d'évaluer l'assistant contre ce qu'il devait faire.",
     "check": "Le périmètre contient des exclusions explicites et un rôle de proposition."
    },
    {
     "title": "Concevoir la sortie et la file d'approbation",
     "goal": "Un format vérifiable et une décision humaine.",
     "steps": "1. Définissez le schéma : classification, gravité, preuves citées, prochaine action proposée, niveau de confiance.\n2. Quelles validations automatiques appliquez-vous (preuves présentes dans l'entrée, valeurs permises) ?\n3. Que voit l'approbateur et que peut-il faire (accepter, modifier, refuser) ?\n4. Que se passe-t-il sans réponse ?",
     "expected": "Le schéma exige des preuves citées vérifiables dans l'entrée. L'approbateur voit la proposition, les preuves et peut modifier. Sans réponse, rien n'est exécuté et l'alerte reste dans la file avec une échéance d'escalade.",
     "check": "Le schéma, les validations et la file d'approbation sont décrits."
    },
    {
     "title": "Définir l'évaluation",
     "goal": "Mesurer par rapport à une référence humaine.",
     "steps": "1. Constituez un jeu de 30 alertes étiquetées par deux analystes.\n2. Définissez les métriques : accord, faux négatifs graves, preuves valides, refus appropriés.\n3. Fixez les seuils avant la mesure.\n4. Que dites-vous d'un échantillon de 30 cas ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Les faux négatifs graves ont un seuil propre. Un échantillon de 30 est indicatif et son insuffisance statistique est écrite. Les désaccords entre étiqueteurs sont documentés. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Les métriques, les seuils et la limite de l'échantillon sont écrits."
    },
    {
     "title": "Planifier la mise en service",
     "goal": "Ombre, assisté, actif limité.",
     "steps": "1. Décrivez les trois modes et les critères de passage.\n2. Qui peut arrêter l'assistant et comment ?\n3. Quels indicateurs surveillez-vous en continu ?\n4. Quel retour arrière prévoyez-vous ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Chaque mode a des critères mesurés et un responsable. L'arrêt est possible par un rôle désigné. La surveillance suit le taux de fermeture et les faux négatifs graves. Le retour arrière consiste à revenir au triage manuel, avec une procédure testée.",
     "check": "Les modes ont des critères, un arrêt et un retour arrière testés sur papier."
    }
   ],
   "deliverables": [
    "Le cadrage du périmètre.",
    "La spécification de la sortie et de la file.",
    "Le protocole d'évaluation.",
    "Le plan de mise en service."
   ],
   "context": "sentinel"
  }
 },
 {
  "id": "f02",
  "module": "final",
  "level": "intermédiaire",
  "title": "Enrichissement d'indicateurs avec n8n",
  "problem": "Concevoir un workflow n8n d'enrichissement d'indicateurs avec normalisation, déduplication, limite de débit, gestion d'erreurs et revue de sécurité.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "n8n (facultatif)",
   "Éditeur JSON",
   "Ressources du parcours (workflows n8n)"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Spécifier le contrat et le flux",
   "Dédupliquer et limiter le débit",
   "Prévoir les pannes",
   "Passer la revue de sécurité"
  ],
  "success": [
   "Le workflow est idempotent.",
   "Le secret est vérifié en premier.",
   "Les pannes laissent un état connu."
  ],
  "risks": [
   "Cache trop long.",
   "Pas de plafond de taille.",
   "Secret dans le flux."
  ],
  "extensions": [
   "Ajouter un second fournisseur.",
   "Ajouter un tableau de bord de volume."
  ],
  "lab": {
   "client": "**Nordlys** veut enrichir automatiquement les indicateurs (adresses IP, domaines, hachages) provenant des alertes. Aujourd'hui, chaque analyste copie les valeurs dans un site de réputation. Le responsable veut un workflow fiable, sans doublons, qui respecte les limites du service et dont la sécurité a été revue.",
   "mission": "Spécifier le contrat, le flux, la déduplication et la limite de débit, les pannes et la revue de sécurité du workflow d'enrichissement.",
   "duration": "2 h 30",
   "mode": "tenant",
   "parts": [
    {
     "title": "Spécifier le contrat et le flux",
     "goal": "Entrées, sorties et nœuds. dans ce projet de synthèse",
     "steps": "1. Définissez le contrat d'entrée (type, valeur, source) et de sortie (valeur normalisée, verdict, raison, date).\n2. Listez les nœuds : réception, secret, validation, normalisation, déduplication, enrichissement, réponse.\n3. Quel nœud est le premier et pourquoi ?\n4. Que répondez-vous à une entrée invalide ?",
     "expected": "La vérification du secret est le premier nœud. Une entrée invalide reçoit une erreur claire sans enrichissement. Les nœuds forment une chaîne dont chaque maillon se teste seul. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Le contrat, les nœuds et le traitement des entrées invalides sont décrits."
    },
    {
     "title": "Dédupliquer et limiter le débit",
     "goal": "Ne pas appeler deux fois et ne pas dépasser.",
     "steps": "1. Quelle clé identifie un indicateur déjà traité ?\n2. Quelle durée de cache pour un verdict ?\n3. Comment espacez-vous les appels pour respecter 4 appels par seconde ?\n4. Que faites-vous d'un 429 ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Clé : type plus valeur normalisée. Cache court, car une réputation change. Les appels sont espacés et un 429 déclenche l'attente demandée par le service, avec un nombre maximal d'essais. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "La clé, le cache et le traitement du 429 sont justifiés."
    },
    {
     "title": "Prévoir les pannes",
     "goal": "Un état connu quoi qu'il arrive.",
     "steps": "1. Listez cinq pannes et leur traitement.\n2. Que contient la réponse quand le service d'enrichissement est indisponible ?\n3. Comment évitez-vous de perdre un lot à mi-parcours ?\n4. Qui est alerté et quand ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Le workflow renvoie « inconnu » avec la raison plutôt que d'échouer silencieusement. Le lot est repris à l'indicateur interrompu. L'alerte part après un nombre défini d'échecs consécutifs. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Chaque panne a un traitement et un état final connu."
    },
    {
     "title": "Passer la revue de sécurité",
     "goal": "Les questions de l'équipe de sécurité.",
     "steps": "Répondez par écrit : où vivent les secrets, que contiennent les journaux, qui peut appeler le webhook, quelle taille d'entrée maximale, qui peut modifier le workflow, comment il est versionné et sauvegardé.\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Chaque réponse est vérifiable : coffre de secrets, journaux sans corps complet, authentification par secret partagé, plafond de taille, accès restreint, workflow exporté et versionné. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Chaque question de la revue a une réponse vérifiable."
    }
   ],
   "deliverables": [
    "Le contrat et le plan des nœuds.",
    "La stratégie de déduplication et de débit.",
    "Le tableau des pannes.",
    "Le dossier de revue de sécurité."
   ],
   "context": "defender-xdr"
  },
  "connected": {
   "accounts": "Une instance n8n de test non exposée et un service de réputation fictif.",
   "permissions": "Rôle Intune adapté (par exemple Policy and Profile Manager) dans le locataire de test.",
   "costs": "Licences de test à votre charge ; vérifiez la tarification actuelle.",
   "secrets": "Aucun secret dans le dépôt.",
   "cleanup": "Supprimer le workflow, le webhook et les identifiants de test.",
   "limits": "Facultatif : tout fonctionne en simulation ; n'exposez jamais un webhook de test à Internet."
  }
 },
 {
  "id": "f03",
  "module": "final",
  "level": "avancé",
  "title": "Assistant KQL avec schéma vérifié",
  "problem": "Spécifier un assistant KQL avec schéma généré, garde-fou, banc d'essai de 20 questions et exigences de mise en service.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Sentinel)",
   "Tableur"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Générer et fournir le schéma",
   "Écrire le garde-fou",
   "Bâtir le banc de 20 questions",
   "Critères de mise en service"
  ],
  "success": [
   "Aucune requête sans validation.",
   "Le schéma est généré.",
   "Les pièges sont dans le banc."
  ],
  "risks": [
   "Schéma copié à la main.",
   "Comparer le texte au lieu du résultat.",
   "Oublier la variabilité."
  ],
  "extensions": [
   "Ajouter l'explication en langage clair.",
   "Ajouter une estimation de coût."
  ],
  "lab": {
   "client": "Les analystes de **Nordlys** écrivent beaucoup de KQL, souvent sous pression. Un assistant pourrait accélérer le travail, mais il invente des colonnes et oublie les filtres de temps. Vous spécifiez un assistant dont **chaque requête est vérifiée contre le schéma réel** avant exécution. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.",
   "mission": "Définir la source du schéma, les règles du garde-fou, le banc d'essai et les critères de mise en service.",
   "duration": "3 h",
   "mode": "simule",
   "parts": [
    {
     "title": "Générer et fournir le schéma",
     "goal": "La vérité vient de la source.",
     "steps": "Exécutez pour inspecter les données :\n\n```kql\nSigninLogs\n| summarize Connexions = count() by ResultType\n| order by Connexions desc\n```\n\n1. Quelles tables et colonnes l'assistant doit-il connaître ?\n2. Comment générez-vous le schéma automatiquement ?\n3. Combien de tables donnez-vous par question ?\n4. Que répond-il si la donnée n'existe pas ?",
     "expected": "Le schéma est généré depuis la source réelle et limité aux tables pertinentes. Si la donnée n'existe pas, l'assistant le dit. Copier le schéma à la main garantit une dérive. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Le schéma est généré et le cas de donnée absente est prévu."
    },
    {
     "title": "Écrire le garde-fou",
     "goal": "Refuser avant d'exécuter. dans ce projet de synthèse",
     "steps": "Écrivez dix règles : table existante, colonnes existantes, filtre de temps, plafond de lignes, pas de jointure sans filtre, pas de fonctions interdites, longueur maximale, lecture seule, nombre de jointures, résultat vide signalé.\n\n1. Écrivez le message d'erreur de chaque règle.\n2. Quelle règle protège le coût ?",
     "expected": "Les messages d'erreur sont actionnables pour que l'assistant se corrige. Le filtre de temps et le plafond protègent le coût. Le garde-fou ne vérifie pas la justesse sémantique. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Dix règles ont chacune un message d'erreur."
    },
    {
     "title": "Bâtir le banc de 20 questions",
     "goal": "Mesurer validité et justesse.",
     "steps": "Écrivez 20 questions : 8 simples, 6 moyennes, 6 pièges. Pour chacune : requête de référence, résultat attendu, propriété à vérifier.\n\n1. Comment comparez-vous le résultat à la référence ?\n2. Quel seuil avant la mise en service ?\n3. Comment mesurez-vous la variabilité ?",
     "expected": "On compare les résultats, pas le texte de la requête. Plusieurs requêtes différentes peuvent être correctes. Le seuil est fixé avant, et la variabilité est mesurée sur plusieurs exécutions. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Les 20 questions ont une référence, un seuil et une mesure de variabilité."
    },
    {
     "title": "Critères de mise en service",
     "goal": "Qui l'utilise, avec quoi. dans ce projet de synthèse",
     "steps": "1. Qui y a accès et avec quelles permissions de lecture ?\n2. Comment affichez-vous la requête avant exécution ?\n3. Quel journal gardez-vous ?\n4. Quand réévaluez-vous ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "L'analyste voit toujours la requête avant l'exécution. Les permissions de lecture sont limitées aux tables autorisées. Le journal permet d'auditer. La réévaluation suit chaque changement de modèle ou de schéma. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Les critères de mise en service sont écrits avec journal et réévaluation."
    }
   ],
   "deliverables": [
    "La spécification du schéma.",
    "Les dix règles du garde-fou.",
    "Le banc de 20 questions.",
    "Les critères de mise en service."
   ],
   "context": "sentinel"
  }
 },
 {
  "id": "f04",
  "module": "final",
  "level": "avancé",
  "title": "Pipeline de priorisation des vulnérabilités",
  "problem": "Concevoir un pipeline qui priorise les vulnérabilités avec contexte, règle lisible, jeux de test et billets validés.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Python 3 facultatif"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Définir sources et validation",
   "Écrire la règle de score",
   "Concevoir les tests",
   "Valider les billets de correction"
  ],
  "success": [
   "Aucune donnée manquante n'est masquée.",
   "Chaque rang est explicable.",
   "Aucun billet ne contient un fait non vérifié."
  ],
  "risks": [
   "Formule opaque.",
   "Valeur par défaut rassurante.",
   "Règle modifiée sans test."
  ],
  "extensions": [
   "Ajouter un délai cible.",
   "Lier au suivi de correction."
  ],
  "lab": {
   "client": "**Nordlys** a des centaines de constats ouverts. La priorisation par gravité seule envoie l'équipe sur de fausses pistes. Vous spécifiez un pipeline qui combine gravité, exploitation, exposition et valeur de l'actif, dont chaque rang s'explique en une phrase. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.",
   "mission": "Définir les sources et la validation des données, la règle de score, les tests et le traitement des billets de correction.",
   "duration": "3 h",
   "mode": "simule",
   "parts": [
    {
     "title": "Définir sources et validation",
     "goal": "Des données propres avant le score.",
     "steps": "1. Listez les sources : export des constats, inventaire des actifs, liste d'exploitation connue.\n2. Définissez les validations : colonnes obligatoires, valeurs permises, doublons.\n3. Que faites-vous d'un actif absent de l'inventaire ?\n4. Que faites-vous d'une gravité manquante ?",
     "expected": "Chaque anomalie reçoit un traitement explicite et visible dans le rapport. Un actif inconnu est signalé, pas ignoré. Une gravité manquante n'est jamais remplacée par une valeur faible. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Chaque anomalie de données a un traitement explicite."
    },
    {
     "title": "Écrire la règle de score",
     "goal": "Lisible et explicable. dans ce projet de synthèse",
     "steps": "1. Définissez le score : gravité de base, multiplicateur d'exploitation, d'exposition, ajustement de valeur.\n2. Testez sur cinq constats et écrivez l'explication d'une phrase de chaque rang.\n3. Que faites-vous des égalités ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "La règle est simple et chaque rang est justifié. Les égalités se départagent par un critère documenté (exposition, puis ancienneté). Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "La règle produit une explication d'une phrase par rang."
    },
    {
     "title": "Concevoir les tests",
     "goal": "Protéger contre les régressions.",
     "steps": "1. Écrivez un jeu de 10 constats avec classement attendu.\n2. Écrivez trois cas limites (donnée manquante, égalité, valeur inconnue).\n3. Que testez-vous après un changement de règle ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Un changement de règle doit modifier les rangs de façon prévue et expliquée. Les cas limites évitent les surprises. Le jeu de test est versionné avec la règle. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Le jeu de test couvre les cas limites et suit la version de la règle."
    },
    {
     "title": "Valider les billets de correction",
     "goal": "L'assistant rédige, le code vérifie.",
     "steps": "1. Quels faits d'un billet doivent être retrouvés dans les données ?\n2. Que faites-vous d'un billet qui cite un correctif inexistant ?\n3. Qui approuve l'envoi ?\n4. Quel indicateur de suivi proposez-vous (délai de correction par priorité) ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Chaque fait est vérifié contre la source. Un billet invalide est rejeté et consigné. L'envoi est approuvé par une personne. Le délai par priorité sert à ajuster la règle avec l'expérience. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Les billets sont vérifiés et approuvés, avec un indicateur de suivi."
    }
   ],
   "deliverables": [
    "Les sources et validations.",
    "La règle de score.",
    "Le jeu de test.",
    "Les contrôles des billets."
   ],
   "context": "defender-xdr"
  }
 },
 {
  "id": "f05",
  "module": "final",
  "level": "avancé",
  "title": "Assistant documentaire RAG avec citations",
  "problem": "Spécifier un assistant documentaire qui répond avec citations vérifiées, résiste à l'empoisonnement et se réévalue à chaque changement de document.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Éditeur de texte",
   "Python 3 facultatif"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Préparer les documents",
   "Exiger et vérifier les citations",
   "Se défendre contre l'empoisonnement",
   "Évaluer et surveiller"
  ],
  "success": [
   "Aucune réponse sans citation.",
   "Les documents sont des données.",
   "Le banc est rejoué à chaque changement."
  ],
  "risks": [
   "Index ouvert à tous.",
   "Version obsolète citée.",
   "Citation non vérifiée."
  ],
  "extensions": [
   "Ajouter un score de fraîcheur.",
   "Ajouter un retour des utilisateurs."
  ],
  "lab": {
   "client": "**Nordlys** a une centaine de documents (runbooks, politiques, procédures). Les analystes veulent poser des questions et obtenir des réponses **avec la source**. Un test a montré qu'un document modifié par erreur pouvait faire recommander une action dangereuse. Vous spécifiez un assistant résistant à ce problème.",
   "mission": "Définir la préparation des documents, la consigne de citation, les défenses contre l'empoisonnement et le protocole d'évaluation.",
   "duration": "3 h",
   "mode": "simule",
   "parts": [
    {
     "title": "Préparer les documents",
     "goal": "Des morceaux fiables et datés.",
     "steps": "1. Définissez le découpage (taille, respect des titres).\n2. Listez les métadonnées par morceau : document, section, version, date, propriétaire.\n3. Que faites-vous des versions obsolètes ?\n4. Qui peut ajouter un document à l'index ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Les métadonnées permettent de citer précisément. Les versions obsolètes sont retirées. L'ajout passe par une revue : c'est la défense principale contre l'empoisonnement. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Le découpage, les métadonnées et la revue d'ajout sont décrits."
    },
    {
     "title": "Exiger et vérifier les citations",
     "goal": "Pas de réponse sans source. dans ce projet de synthèse",
     "steps": "1. Rédigez la consigne : répondre seulement d'après les morceaux, citer, dire « je ne sais pas ».\n2. Comment vérifiez-vous l'existence d'une citation ?\n3. Comment échantillonnez-vous le soutien réel ?\n4. Que faites-vous d'une réponse sans citation ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "L'existence se vérifie automatiquement ; le soutien par échantillonnage humain. Une réponse sans citation est refusée ou marquée non vérifiée. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "La vérification d'existence est automatique et celle du soutien est échantillonnée."
    },
    {
     "title": "Se défendre contre l'empoisonnement",
     "goal": "Une source n'est pas une instruction.",
     "steps": "1. Comment délimitez-vous les morceaux dans la requête ?\n2. Quelle phrase de la consigne indique que le contenu est de la donnée ?\n3. Quels signaux cherchez-vous dans les nouveaux documents (impératifs adressés au modèle) ?\n4. Que se passe-t-il si une recommandation dangereuse apparaît ?",
     "expected": "Les morceaux sont délimités et traités comme données. Une recommandation dangereuse déclenche une revue humaine et une alerte. Les contrôles de contenu aident, mais la gouvernance de l'index reste la défense principale.",
     "check": "Les morceaux sont des données et une recommandation dangereuse déclenche une revue."
    },
    {
     "title": "Évaluer et surveiller",
     "goal": "Rejouer à chaque changement.",
     "steps": "1. Constituez 20 questions avec réponse et source attendues, dont 4 pièges.\n2. Définissez les métriques : bonne réponse, bonne citation, refus approprié.\n3. Fixez le seuil avant.\n4. Quand rejouez-vous le banc ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Le banc est rejoué à chaque changement de document, de modèle ou de consigne. Les pièges incluent un document empoisonné de test. Le seuil précède la mesure. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Le banc de 20 questions est rejoué à chaque changement."
    }
   ],
   "deliverables": [
    "Le plan de préparation.",
    "La consigne de citation.",
    "Les défenses contre l'empoisonnement.",
    "Le banc d'évaluation."
   ],
   "context": "defender-xdr"
  }
 },
 {
  "id": "f06",
  "module": "final",
  "level": "intermédiaire",
  "title": "Générateur de rapport d'incident",
  "problem": "Concevoir un générateur de rapport d'incident où chaque affirmation est rattachée à une preuve et où les chiffres sont calculés par le code.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Éditeur de texte",
   "Terrain de jeu KQL (contexte Defender XDR)"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Définir la structure",
   "Collecter les preuves",
   "Contrôler la fidélité",
   "Relecture et diffusion"
  ],
  "success": [
   "Aucune affirmation sans preuve.",
   "Les chiffres sont calculés.",
   "Les inconnues sont déclarées."
  ],
  "risks": [
   "Laisser le modèle calculer.",
   "Affirmer une absence sans preuve.",
   "Pas de signature."
  ],
  "extensions": [
   "Ajouter un résumé exécutif.",
   "Ajouter une version anglaise."
  ],
  "lab": {
   "client": "Après chaque incident, **Nordlys** passe des heures à rédiger le rapport, souvent avec des affirmations sans preuve. Vous spécifiez un générateur qui assemble les faits, laisse un assistant proposer la rédaction, et refuse toute affirmation non rattachée à une preuve. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.",
   "mission": "Définir la structure du rapport, la collecte des preuves, les contrôles de fidélité et le processus de relecture.",
   "duration": "2 h 30",
   "mode": "simule",
   "parts": [
    {
     "title": "Définir la structure",
     "goal": "Un rapport lisible et vérifiable.",
     "steps": "1. Listez les sections : résumé, chronologie, impact, confiance, actions, inconnues.\n2. Pour chaque section, quelle donnée est calculée par le code et laquelle est rédigée ?\n3. Comment numérotez-vous les preuves ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Les chiffres et les heures viennent du code. La rédaction vient de l'assistant ou de l'analyste. Les preuves sont numérotées et citées dans le texte. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Chaque section distingue le calculé du rédigé."
    },
    {
     "title": "Collecter les preuves",
     "goal": "Des requêtes documentées. dans ce projet de synthèse",
     "steps": "```kql\nDeviceNetworkEvents\n| where RemoteUrl == \"cdn.exfil-demo.example\"\n| project Timestamp, DeviceName, InitiatingProcessFileName, RemoteUrl, RemoteIP\n| order by Timestamp asc\n```\n\n1. Quelle preuve cette requête fournit-elle ?\n2. Qu'est-ce qu'elle ne prouve pas ?\n3. Comment conservez-vous la requête et sa date d'exécution ?",
     "expected": "Elle prouve une connexion sortante datée depuis un poste. Elle ne prouve pas le contenu transféré. La requête et la date accompagnent la preuve pour qu'on puisse la rejouer. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Chaque preuve garde sa requête, sa date et ses limites."
    },
    {
     "title": "Contrôler la fidélité",
     "goal": "Aucune affirmation orpheline.",
     "steps": "1. Comment vérifiez-vous que chaque phrase factuelle cite une preuve ?\n2. Comment vérifiez-vous que les nombres du texte existent dans les chiffres calculés ?\n3. Que faites-vous d'une affirmation non soutenue ?\n4. Comment signalez-vous les inconnues ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Un contrôle automatique repère les nombres absents du tableau de chiffres et les phrases sans citation. Une affirmation non soutenue est supprimée ou déplacée vers les inconnues. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Les nombres et affirmations sont contrôlés et les inconnues sont explicites."
    },
    {
     "title": "Relecture et diffusion",
     "goal": "Un humain signe. dans ce projet de synthèse",
     "steps": "1. Qui relit et qui signe ?\n2. À qui diffuse-t-on et sous quelle forme ?\n3. Comment conservez-vous les versions ?\n4. Quel retour d'expérience ajoutez-vous après l'incident ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Une personne identifiée signe le rapport. La diffusion respecte la confidentialité. Les versions sont conservées. Le retour d'expérience alimente les améliorations. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "La relecture, la signature et la diffusion sont attribuées."
    }
   ],
   "deliverables": [
    "Le modèle de rapport.",
    "Les requêtes de preuve.",
    "Les contrôles de fidélité.",
    "Le processus de relecture."
   ],
   "context": "defender-xdr"
  }
 },
 {
  "id": "f07",
  "module": "final",
  "level": "intermédiaire",
  "title": "Préparation de billets avec Logic Apps",
  "problem": "Concevoir un flux Logic Apps qui prépare des billets à partir d'alertes, avec identité dédiée, approbation, déduplication et journalisation.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Éditeur de texte",
   "Tableur"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Spécifier déclencheur et flux",
   "Définir identité et permissions",
   "Concevoir l'approbation",
   "Journaliser et surveiller"
  ],
  "success": [
   "Aucun billet sans approbation.",
   "Les doublons sont évités.",
   "Aucun secret dans le flux."
  ],
  "risks": [
   "Création automatique sans approbation.",
   "Identité partagée.",
   "Aucun suivi des échecs."
  ],
  "extensions": [
   "Ajouter une priorité suggérée.",
   "Ajouter un rapport mensuel."
  ],
  "lab": {
   "client": "Les analystes de **Nordlys** perdent du temps à créer des billets à la main. Un flux Logic Apps pourrait **préparer** le billet, mais l'équipe de sécurité veut que l'envoi reste approuvé par une personne, que l'identité soit dédiée et que les doublons soient évités. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.",
   "mission": "Spécifier le déclencheur, le flux, l'identité et les permissions, l'approbation et la journalisation.",
   "duration": "2 h 30",
   "mode": "simule",
   "parts": [
    {
     "title": "Spécifier déclencheur et flux",
     "goal": "De l'alerte au brouillon de billet.",
     "steps": "1. Quel déclencheur (nouvel incident, étiquette) ?\n2. Listez les étapes : lecture de l'alerte, déduplication, rédaction du brouillon, approbation, création.\n3. Que contient le brouillon (titre, résumé, preuves, gravité) ?\n4. Que faites-vous si une alerte est déjà liée à un billet ?",
     "expected": "Le flux ne crée le billet qu'après l'approbation. La déduplication utilise l'identifiant de l'incident. Le brouillon contient uniquement des faits retrouvables dans l'alerte. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Le flux est séquentiel, dédupliqué et approuvé avant la création."
    },
    {
     "title": "Définir identité et permissions",
     "goal": "Le moins de pouvoir possible.",
     "steps": "1. Quelle identité utilise le flux (dédiée) ?\n2. Quelles permissions : lire les incidents, créer des billets, rien d'autre.\n3. Où vivent les connexions et secrets ?\n4. Qui peut modifier le flux ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Identité dédiée à lecture et création de billets. Les connexions sont gérées par la plateforme, pas écrites dans le flux. Les modifications passent par une revue. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "L'identité est dédiée, minimale et les secrets ne sont pas dans le flux."
    },
    {
     "title": "Concevoir l'approbation",
     "goal": "Une personne décide. dans ce projet de synthèse",
     "steps": "1. Qui approuve et dans quel délai ?\n2. Que voit l'approbateur ?\n3. Que se passe-t-il sans réponse ?\n4. Comment conservez-vous la trace de l'approbation ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "L'approbateur voit le brouillon et les preuves. Sans réponse, le brouillon expire et l'alerte reste visible. La trace contient l'identité de l'approbateur et l'heure. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "L'approbation a un approbateur, un délai, une expiration et une trace."
    },
    {
     "title": "Journaliser et surveiller",
     "goal": "Savoir ce que le flux a fait.",
     "steps": "1. Que journalisez-vous (identifiants, décisions, erreurs) ?\n2. Que ne journalisez-vous pas ?\n3. Quelles alertes créez-vous (échecs répétés, volume anormal) ?\n4. Comment mesurez-vous le temps gagné ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Le journal permet de retrouver chaque billet et sa décision. Les alertes détectent les échecs répétés et les rafales. Le temps gagné se mesure avant et après sur un échantillon. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Le journal et les alertes sont définis sans données sensibles inutiles."
    }
   ],
   "deliverables": [
    "Le schéma du flux.",
    "La fiche d'identité et de permissions.",
    "La conception de l'approbation.",
    "Le plan de journal et d'alertes."
   ],
   "context": "defender-xdr"
  }
 },
 {
  "id": "f08",
  "module": "final",
  "level": "avancé",
  "title": "Agent d'examen de posture Azure en lecture seule",
  "problem": "Cadrer un agent qui examine la posture Azure en lecture seule, produit un rapport de constats et ne peut rien modifier.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Éditeur de texte",
   "Tableur"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Définir les lectures permises",
   "Prouver l'absence d'écriture",
   "Structurer le rapport",
   "Cadrer les limites"
  ],
  "success": [
   "Aucune permission d'écriture, prouvée par un test.",
   "Chaque constat a une preuve.",
   "Les angles morts sont déclarés."
  ],
  "risks": [
   "Rôle trop large par commodité.",
   "Constat sans preuve.",
   "Rapport diffusé sans validation."
  ],
  "extensions": [
   "Ajouter un score de posture.",
   "Comparer avec le rapport du mois précédent."
  ],
  "lab": {
   "client": "**Nordlys** veut un examen régulier de sa posture Azure : comptes sans MFA, rôles trop larges, ressources exposées. La direction accepte un agent qui **lit et rapporte**, mais refuse catégoriquement qu'il modifie quoi que ce soit. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.",
   "mission": "Définir les lectures permises, prouver l'absence de permission d'écriture, structurer le rapport et cadrer les limites.",
   "duration": "3 h",
   "mode": "tenant",
   "parts": [
    {
     "title": "Définir les lectures permises",
     "goal": "Un inventaire de ce qu'on regarde.",
     "steps": "1. Listez les domaines examinés : identités, rôles, stockage, réseau, journaux.\n2. Pour chacun, la lecture exacte et le rôle de lecture requis.\n3. Quelles données personnelles pourraient apparaître et comment les réduisez-vous ?\n4. Quelle périodicité ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "On liste des lectures précises, avec le rôle minimal. Les données personnelles sont minimisées dans le rapport. La périodicité équilibre fraîcheur et coût. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Chaque domaine a une lecture précise et un rôle minimal."
    },
    {
     "title": "Prouver l'absence d'écriture",
     "goal": "Un test d'échec attendu. dans ce projet de synthèse",
     "steps": "1. Quelle identité utilise l'agent ?\n2. Écrivez cinq tests de permission qui doivent échouer (créer, modifier, supprimer, assigner un rôle, lire un secret).\n3. Comment conservez-vous la preuve ?\n4. À quelle fréquence rejouez-vous ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Le refus est la preuve. Les tests sont rejoués à chaque changement de rôle et chaque trimestre. Un test non exécuté est marqué ainsi. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Cinq tests d'échec attendu prouvent l'absence d'écriture."
    },
    {
     "title": "Structurer le rapport",
     "goal": "Constat, preuve, risque, correction.",
     "steps": "1. Définissez le format d'un constat : titre, ressource, preuve, risque, correction suggérée, niveau de confiance.\n2. Comment priorisez-vous ?\n3. Comment évitez-vous les faux positifs répétés (exceptions datées) ?\n4. À qui le rapport est-il envoyé ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Chaque constat cite la preuve. Les exceptions ont un propriétaire et une date. Le rapport propose des corrections, qu'une personne applique par le processus normal. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Le format du constat contient preuve, risque et niveau de confiance."
    },
    {
     "title": "Cadrer les limites",
     "goal": "Ce que l'agent ne sait pas. dans ce projet de synthèse",
     "steps": "1. Que ne voit-il pas (ressources hors périmètre, données hors lecture) ?\n2. Comment gérez-vous une hallucination possible dans le rapport ?\n3. Qui valide avant diffusion ?\n4. Quelle revue périodique de l'agent lui-même ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Le rapport indique son périmètre et ses angles morts. Les constats sont vérifiables dans la source. Une personne valide avant diffusion. L'agent lui-même est revu semestriellement. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Les limites du rapport sont écrites et un validateur humain est nommé."
    }
   ],
   "deliverables": [
    "L'inventaire des lectures.",
    "Les cinq tests de permission.",
    "Le format de rapport.",
    "Les limites et la revue."
   ],
   "context": "defender-xdr"
  },
  "connected": {
   "accounts": "Un abonnement de laboratoire avec quelques ressources de test.",
   "permissions": "Rôle Intune adapté (par exemple Policy and Profile Manager) dans le locataire de test.",
   "costs": "Licences de test à votre charge ; vérifiez la tarification actuelle.",
   "secrets": "Aucun secret dans le dépôt.",
   "cleanup": "Retirer l'identité de lecture et supprimer les ressources de test.",
   "limits": "Facultatif : ne donnez jamais à l'agent un rôle autre que lecteur et n'utilisez jamais un abonnement de production."
  }
 },
 {
  "id": "f09",
  "module": "final",
  "level": "avancé",
  "title": "Banc d'évaluation et de sécurité d'agents",
  "problem": "Concevoir un banc commun d'évaluation et de tests de sécurité réutilisable pour tous les agents du SOC, avec seuils et rapports.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Définir les catégories de tests",
   "Fixer les seuils",
   "Définir le rapport",
   "Gouverner le banc"
  ],
  "success": [
   "Les seuils précèdent les mesures.",
   "Le rapport ne conclut jamais « sécurisé ».",
   "Chaque incident ajoute un cas."
  ],
  "risks": [
   "Seuils ajustés après coup.",
   "Jeu trop petit pour conclure.",
   "Banc jamais mis à jour."
  ],
  "extensions": [
   "Automatiser le rejeu.",
   "Ajouter une comparaison entre agents."
  ],
  "lab": {
   "client": "**Nordlys** prévoit plusieurs agents (triage, KQL, documents, posture). Chaque équipe évalue à sa façon, avec des seuils différents. La direction demande un **banc commun** : mêmes catégories de tests, mêmes seuils minimaux, mêmes rapports, pour que « évalué » signifie la même chose partout. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.",
   "mission": "Définir les catégories de tests, les seuils, le format de rapport et la gouvernance du banc.",
   "duration": "3 h",
   "mode": "simule",
   "parts": [
    {
     "title": "Définir les catégories de tests",
     "goal": "Ce que tout agent doit passer.",
     "steps": "1. Listez les catégories : exactitude, citations, refus appropriés, injection, détournement d'outils, fuite de données, coût, variabilité.\n2. Pour chacune, trois cas types.\n3. Quelles catégories sont communes et lesquelles propres à un agent ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Un noyau commun (injection, détournement d'outils, fuite) s'applique à tous. Les catégories propres (exactitude KQL, citations) s'ajoutent. Chaque catégorie a des cas écrits. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Le noyau commun et les catégories propres sont distingués."
    },
    {
     "title": "Fixer les seuils",
     "goal": "Avant toute mesure. dans ce projet de synthèse",
     "steps": "1. Fixez un seuil par catégorie (par exemple zéro faux négatif grave en injection sur le jeu).\n2. Comment justifiez-vous chaque seuil ?\n3. Que faites-vous d'un jeu trop petit pour conclure ?\n4. Qui peut modifier un seuil ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Les seuils sont écrits, justifiés et modifiés par une personne désignée avec trace. Un jeu trop petit se déclare comme tel : on ne conclut pas à la sécurité. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Chaque seuil est justifié et sa modification est tracée."
    },
    {
     "title": "Définir le rapport",
     "goal": "Honnête et comparable. dans ce projet de synthèse",
     "steps": "1. Format : version du jeu, version de l'agent, résultats par catégorie, taux et intervalles, cas échoués.\n2. Comment présentez-vous les résultats sans écrire « sécurisé » ?\n3. Où archivez-vous les rapports ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Le rapport présente des taux observés sur un échantillon et liste les échecs. Il n'emploie jamais « sécurisé » sans qualification. Les rapports sont archivés avec les versions. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Le rapport présente des taux, des échecs et les versions utilisées."
    },
    {
     "title": "Gouverner le banc",
     "goal": "Le garder vivant. dans ce projet de synthèse",
     "steps": "1. Qui entretient le banc ?\n2. Comment ajoutez-vous un cas après un incident ?\n3. À quelle fréquence rejouez-vous ?\n4. Quel lien avec la décision de mise en service ?\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur.",
     "expected": "Chaque incident ajoute un cas de test. Le banc est rejoué à chaque changement. La mise en service exige un rapport à jour au-dessus des seuils. Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise.",
     "check": "Le banc a un propriétaire, un rythme de rejeu et un lien avec la mise en service."
    }
   ],
   "deliverables": [
    "Le catalogue de catégories.",
    "Les seuils justifiés.",
    "Le modèle de rapport.",
    "La gouvernance du banc."
   ],
   "context": "defender-xdr"
  }
 }
];
