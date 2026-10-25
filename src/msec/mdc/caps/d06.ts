import { cap } from '../model.ts';

export const CAPS_D06 = [
  cap('d06.attack-path.analyse', 'Analyse des chemins d’attaque', {
    plan: 'Defender CSPM', obj: 'Identifier les scénarios externes exploitables vers les actifs critiques.', risk: 'Page vide interprétée comme absence de risque.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement, compte ou projet', req: 'Defender CSPM et analyse sans agent ; extension de conteneurs pour les chemins conteneurs', perm: 'Security Reader, Security Admin, Reader, Contributor ou Owner pour lire ; Owner pour activer l’analyse sans agent', cost: 'Inclus au plan Defender CSPM (payant)',
    collect: 'Sans agent, graphe de sécurité du cloud', compat: 'Portail Azure et portail Defender (Exposure Management)', limits: 'La page peut être vide ; un chemin résolu peut rester jusqu’à 24 heures.', nature: 'native', src: ['attack-path-concept', 'attack-path'], lessons: ['d06-l1', 'd06-l2'],
  }),
  cap('d06.attack-path.points-etranglement', 'Points d’étranglement et rayon d’impact', {
    plan: 'Defender CSPM', obj: 'Prioriser les corrections qui brisent plusieurs chemins.', risk: 'Corriger des nœuds isolés au lieu des convergences.',
    clouds: 'Azure, AWS, GCP', scope: 'Locataire', req: 'Chemins d’attaque disponibles', perm: 'Lecture des chemins d’attaque', cost: 'Inclus au plan Defender CSPM',
    collect: 'Graphe de sécurité du cloud', compat: 'Exposure Management du portail Defender', limits: 'Expérience décrite pour le portail Defender ; vérifier la disponibilité à la date de mise en œuvre.', nature: 'integration', src: ['attack-path-defender', 'attack-path'], lessons: ['d06-l2'],
  }),
  cap('d06.explorer.requetes', 'Explorateur de sécurité du cloud', {
    plan: 'Defender CSPM', obj: 'Chasser les risques par modèles et requêtes personnalisées.', risk: 'Promettre l’explorateur dans le portail Defender.',
    clouds: 'Azure, AWS, GCP', scope: 'Graphe du locataire', req: 'Defender CSPM ; Defender for Containers pour la couche de données des conteneurs', perm: 'Security Reader et rôles de lecture', cost: 'Inclus au plan Defender CSPM',
    collect: 'Graphe de sécurité du cloud', compat: 'Portail Azure', limits: 'La chasse aux risques par l’explorateur n’est pas disponible dans le portail Defender selon la comparaison officielle.', nature: 'native', src: ['explorer', 'explorer-howto', 'portal-compare'], lessons: ['d06-l3'],
  }),
  cap('d06.exposition.internet', 'Analyse de l’exposition à Internet', {
    plan: 'Defender CSPM', obj: 'Déterminer quelles ressources sont accessibles de l’extérieur.', risk: 'Ignorer une exposition indirecte derrière un répartiteur de charge.',
    clouds: 'Azure, AWS, GCP', scope: 'Ressources évaluées', req: 'Defender CSPM', perm: 'Lecture', cost: 'Inclus au plan Defender CSPM',
    collect: 'Configuration du plan de contrôle et joignabilité réseau', compat: 'Ressources évaluées listées dans la documentation', limits: 'Seuls les types de ressources documentés sont évalués.', nature: 'native', src: ['internet-exposure'], lessons: ['d06-l3'],
  }),
  cap('d06.secrets.machines', 'Découverte de secrets en clair sur les machines', {
    plan: 'Defender CSPM ou Defender for Servers plan 2', obj: 'Repérer les secrets exposés et les relier aux chemins d’attaque.', risk: 'Retirer un secret du disque sans le révoquer.',
    clouds: 'Azure, AWS, GCP', scope: 'Machines', req: 'Analyse sans agent', perm: 'Security Reader pour lire', cost: 'Selon le plan',
    collect: 'Analyse sans agent des disques', compat: 'Variable selon le cloud', limits: 'La liste des types de secrets détectés évolue : vérifier la documentation.', nature: 'native', src: ['secrets-vm', 'secrets'], lessons: ['d06-l3'],
  }),
];
