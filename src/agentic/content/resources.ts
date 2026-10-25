import type { ResourceDef } from '../types.ts';

/**
 * Ressources téléchargeables. Statut « teste » : le contrôle décrit dans « how » a réellement été exécuté
 * pendant la rédaction (Python 3 en mode isolé, ou Node pour la logique JavaScript). Statut « a-verifier » :
 * jamais importé ni exécuté dans l'outil cible (n8n, Azure), à confirmer dans votre environnement.
 */
export const RESOURCES: ResourceDef[] = [
  {
    id: 'r-boucle-outils', title: 'Boucle d’outils avec liste blanche (simulation)', file: 'scripts/boucle-outils.py', kind: 'python', module: 'm08', status: 'teste',
    description: 'Un modèle simulé demande deux outils ; la boucle exécute celui qui est autorisé et refuse l’autre, avec journal.',
    how: 'Exécuté avec python3 -I : sortie sans erreur, un appel autorisé et un refusé.', lessons: ['m08-l1'],
  },
  {
    id: 'r-rag-mini', title: 'Mini RAG par mots-clés avec citations', file: 'scripts/rag-mini.py', kind: 'python', module: 'm09', status: 'teste',
    description: 'Recherche par mots-clés dans de petits runbooks fictifs et réponse avec identifiant de source.',
    how: 'Exécuté avec python3 -I : exactitude top-1 de 3 sur 4. Le quatrième cas (question hors corpus) renvoie à tort un document : l’échec est volontairement conservé pour montrer pourquoi il faut un seuil de refus.', lessons: ['m09-l2', 'm09-l3'],
  },
  {
    id: 'r-orchestrateur', title: 'Routage et chaîne d’étapes avec budget', file: 'scripts/orchestrateur.py', kind: 'python', module: 'm10', status: 'teste',
    description: 'Route phishing, identité et vulnérabilité vers des chaînes déterministes ; escalade humaine pour un type inconnu.',
    how: 'Exécuté avec python3 -I : trois routes terminées, un type inconnu escaladé.', lessons: ['m10-l1'],
  },
  {
    id: 'r-triage-sim', title: 'Simulateur de triage avec validation humaine', file: 'scripts/triage-sim.py', kind: 'python', module: 'm11', status: 'teste',
    description: 'Règles déterministes sur quatre alertes fictives ; toute action reste une proposition soumise à approbation.',
    how: 'Exécuté avec python3 -I : propositions produites, aucune action exécutée par le code.', lessons: ['m11-l2'], projects: ['m11-p1'],
  },
  {
    id: 'r-kql-schema', title: 'Schéma vérifié pour le garde-fou KQL', file: 'kql/schema-kql.json', kind: 'schema', module: 'm12', status: 'teste',
    description: 'Tables et colonnes utilisées par le garde-fou, issues de la documentation Microsoft à la date de vérification.',
    how: 'Lu par kql-garde-fou.py lors de son exécution. Le schéma de votre espace peut différer : vérifiez avec getschema.', lessons: ['m12-l3'],
  },
  {
    id: 'r-kql-garde-fou', title: 'Garde-fou heuristique pour KQL proposé', file: 'kql/kql-garde-fou.py', kind: 'python', module: 'm12', status: 'teste',
    description: 'Refuse les commandes de gestion, les noms inconnus du schéma et les requêtes sans borne ; ne comprend pas le KQL.',
    how: 'Exécuté avec python3 -I kql-garde-fou.py schema-kql.json : cas de démonstration acceptés et refusés comme attendu. Aucune requête n’a été exécutée sur un espace réel.', lessons: ['m12-l3'],
  },
  {
    id: 'r-vulns-donnees', title: 'Vulnérabilités fictives', file: 'vulnerabilites/vulns-fictives.csv', kind: 'donnees', module: 'm13', status: 'teste',
    description: 'Jeu de vulnérabilités fictives avec CVSS, EPSS, VPR, exposition et criticité.',
    how: 'Lu par priorisation-vuln.py lors de son exécution. Données inventées.', lessons: ['m13-l2'],
  },
  {
    id: 'r-vulns-script', title: 'Priorisation transparente des vulnérabilités', file: 'vulnerabilites/priorisation-vuln.py', kind: 'python', module: 'm13', status: 'teste',
    description: 'Règles explicites P1 à P4 ; les données manquantes ne donnent jamais P4 ; un actif critique sans correctif remonte au moins à P3.',
    how: 'Exécuté avec python3 -I sur le CSV fictif : classement affiché avec la raison de chaque rang.', lessons: ['m13-l2'], projects: ['m13-p1'],
  },
  {
    id: 'r-phishing-script', title: 'Triage de courriel avec garde-fous', file: 'phishing/triage-courriel.py', kind: 'python', module: 'm14', status: 'teste',
    description: 'Extrait des indicateurs d’un courriel fictif (authentification, liens défangués) et propose un verdict ; l’absence d’indicateur donne « aucun_indicateur », jamais « bénin ».',
    how: 'Exécuté avec python3 -I : le courriel 1 donne « suspect_fort », le courriel 2 donne « aucun_indicateur ».', lessons: ['m14-l1'],
  },
  {
    id: 'r-phishing-eml1', title: 'Courriel fictif 1', file: 'phishing/courriel-fictif-1.eml', kind: 'donnees', module: 'm14', status: 'teste',
    description: 'Courriel d’hameçonnage fictif. Ne cliquez sur aucun lien : les domaines sont réservés aux exemples.',
    how: 'Lu par triage-courriel.py lors de son exécution.', lessons: ['m14-l1'],
  },
  {
    id: 'r-phishing-eml2', title: 'Courriel fictif 2', file: 'phishing/courriel-fictif-2.eml', kind: 'donnees', module: 'm14', status: 'teste',
    description: 'Courriel légitime fictif pour mesurer les faux positifs.',
    how: 'Lu par triage-courriel.py lors de son exécution.', lessons: ['m14-l1'],
  },
  {
    id: 'r-incident-json', title: 'Enregistrement d’incident fictif', file: 'rapports/incident-fictif.json', kind: 'json', module: 'm15', status: 'teste',
    description: 'Chronologie, preuves, actions et limites d’un incident fictif ; une ligne sans preuve y est volontairement incluse.',
    how: 'Lu par rapport-incident.py lors de son exécution.', lessons: ['m15-l1'],
  },
  {
    id: 'r-rapport-script', title: 'Générateur de rapport fidèle aux preuves', file: 'rapports/rapport-incident.py', kind: 'python', module: 'm15', status: 'teste',
    description: 'Produit un rapport Markdown, marque toute ligne sans preuve et pseudonymise sur demande.',
    how: 'Exécuté avec python3 -I et l’option de pseudonymisation : la ligne sans preuve est marquée « NON SOUTENUE ». La pseudonymisation est simple et n’est pas de l’anonymisation.', lessons: ['m15-l1'], projects: ['m15-p1'],
  },
  {
    id: 'r-kb-script', title: 'Contrôle d’hygiène de la base de runbooks', file: 'rapports/kb-hygiene.py', kind: 'python', module: 'm15', status: 'teste',
    description: 'Vérifie propriétaire, dates de révision et statut des runbooks ; signale les revues dépassées.',
    how: 'Exécuté avec python3 -I sur trois runbooks fictifs : trois problèmes détectés. Contrôle de forme seulement.', lessons: ['m15-l2'], projects: ['m15-p1'],
  },
  {
    id: 'r-runbook-compromis', title: 'Runbook fictif : compte compromis', file: 'rapports/runbooks/rb-compte-compromis.md', kind: 'markdown', module: 'm15', status: 'teste',
    description: 'Exemple de runbook conforme avec en-tête de métadonnées.', how: 'Passe le contrôle kb-hygiene.py.', lessons: ['m15-l2'],
  },
  {
    id: 'r-garde-outils', title: 'Garde-fou d’appels d’outils', file: 'securite/garde-outils.py', kind: 'python', module: 'm16', status: 'teste',
    description: 'Liste blanche, validation stricte des paramètres, niveaux d’effet, approbation et limite d’appels.',
    how: 'Exécuté avec python3 -I sur six appels fictifs : lectures autorisées, outil inconnu et paramètre piégé refusés, isolement envoyé en approbation.', lessons: ['m16-l2'], projects: ['m16-p1'],
  },
  {
    id: 'r-appels-fictifs', title: 'Appels d’outils fictifs', file: 'securite/appels-fictifs.json', kind: 'donnees', module: 'm16', status: 'teste',
    description: 'Appels de test pour le garde-fou, dont un outil interdit et un paramètre piégé.', how: 'Lu par garde-outils.py lors de son exécution.', lessons: ['m16-l2'],
  },
  {
    id: 'r-cas-triage', title: 'Jeu de cas de triage (8 cas)', file: 'evaluation/cas-triage.json', kind: 'donnees', module: 'm17', status: 'teste',
    description: 'Cas fictifs avec décision attendue, pour apprendre à lire rappel et précision.', how: 'Lu par banc-eval.py lors de son exécution. Huit cas : échantillon trop petit pour généraliser.', lessons: ['m17-l1'],
  },
  {
    id: 'r-banc-eval', title: 'Banc d’évaluation minimal', file: 'evaluation/banc-eval.py', kind: 'python', module: 'm17', status: 'teste',
    description: 'Calcule rappel et précision et liste les erreurs, en signalant la taille de l’échantillon.',
    how: 'Exécuté avec python3 -I : rappel 0,60, précision 1,00, deux menaces manquées signalées.', lessons: ['m17-l1'], projects: ['m17-p1'],
  },
  {
    id: 'r-config-fictive', title: 'Configuration d’agent fautive (point de départ)', file: 'deploiement/config-agent-fictive.json', kind: 'config', module: 'm18', status: 'teste',
    description: 'Configuration volontairement mauvaise à corriger. La valeur de secret est factice.', how: 'Lue par preflight-deploiement.py : quatre bloquants.', lessons: ['m18-l1'],
  },
  {
    id: 'r-preflight', title: 'Contrôle pré-déploiement', file: 'deploiement/preflight-deploiement.py', kind: 'python', module: 'm18', status: 'teste',
    description: 'Vérifie la forme d’une configuration d’agent : propriétaire, secrets, identité, approbation, budget, journalisation.',
    how: 'Exécuté avec python3 -I : quatre bloquants, code de sortie 1. Ne vérifie pas l’état réel d’un déploiement.', lessons: ['m18-l1'], projects: ['m18-p1'],
  },
  {
    id: 'r-prompt-triage', title: 'Gabarit de prompt de triage', file: 'prompts/prompt-triage.md', kind: 'prompt', module: 'm07', status: 'a-verifier',
    description: 'Consigne système avec données délimitées, sortie JSON, preuves obligatoires et actions limitées.',
    how: 'Gabarit non exécuté contre un modèle réel dans ce projet : testez-le avec votre jeu de cas (module 17).', needs: 'Un modèle de votre choix et le schéma sortie-triage.schema.json.', lessons: ['m07-l1'], projects: ['m11-p1'],
  },
  {
    id: 'r-prompt-rapport', title: 'Gabarit de prompt de reformulation de rapport', file: 'prompts/prompt-rapport.md', kind: 'prompt', module: 'm15', status: 'a-verifier',
    description: 'Reformulation sans ajout de fait, avec identifiants de preuve conservés.',
    how: 'Gabarit non exécuté contre un modèle réel dans ce projet.', needs: 'Un modèle de votre choix ; le code doit revérifier preuves et nombres.', lessons: ['m15-l1'],
  },
  {
    id: 'r-schema-triage', title: 'Schéma JSON de la sortie de triage', file: 'schemas/sortie-triage.schema.json', kind: 'schema', module: 'm07', status: 'teste',
    description: 'Schéma strict : classification, gravité, justification, preuves, action proposée parmi une liste, anomalies.',
    how: 'Validé avec le paquet Python jsonschema (valider-sortie.py) : une sortie valide acceptée, deux sorties invalides refusées.', lessons: ['m07-l2'],
  },
  {
    id: 'r-valider-sortie', title: 'Validation de sorties contre le schéma', file: 'schemas/valider-sortie.py', kind: 'python', module: 'm07', status: 'teste',
    description: 'Petit script de validation avec trois exemples.', how: 'Exécuté avec python3 -I (paquet jsonschema requis) : valide, action hors liste et sans preuve.', needs: 'pip install jsonschema', lessons: ['m07-l2'],
  },
  {
    id: 'r-n8n-ioc', title: 'Workflow n8n : validation et normalisation d’IOC (simulé)', file: 'n8n/enrichissement-ioc.n8n.json', kind: 'n8n', module: 'm05', status: 'a-verifier',
    description: 'Trois nœuds : démarrage manuel, données fictives, validation par expressions régulières et défanging. Aucun appel externe.',
    how: 'La logique JavaScript du dernier nœud a été exécutée avec Node sur quatre valeurs (domaine, IPv4, valeur piégée, SHA-256). Le fichier n’a PAS été importé dans n8n : l’import reste à vérifier.', needs: 'Aucun credential. Importez le fichier via le menu de n8n, puis exécutez manuellement. Si l’import échoue, recréez les trois nœuds en collant le code.', lessons: ['m05-l1'],
  },
  {
    id: 'r-logicapps-billet', title: 'Logic Apps : préparer un billet d’incident (instructions)', file: 'logicapps/preparation-billet.md', kind: 'logicapps', module: 'm06', status: 'a-verifier',
    description: 'Conception pas à pas avec identité managée, portée de traitement et branche d’échec ; aucun flux importable.',
    how: 'Instructions non exécutées dans un compte Azure. Rien n’est déployé.', needs: 'Un abonnement de test, une identité managée avec rôle minimal, un budget avec alerte et la recette de nettoyage.', lessons: ['m06-l1'],
  },
  {
    id: 'r-grille-agent', title: 'Grille d’évaluation d’un agent', file: 'grilles/grille-evaluation-agent.md', kind: 'grille', module: 'm17', status: 'teste',
    description: 'Dix critères à noter 0, 1 ou 2 avec preuve, pour l’auto-évaluation et la relecture par un pair.',
    how: 'Document de travail sans exécution ; aucune note automatique.', lessons: ['m17-l3'],
  },
];
