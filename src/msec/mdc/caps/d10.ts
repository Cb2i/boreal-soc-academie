import { cap } from '../model.ts';

export const CAPS_D10 = [
  cap('d10.servers.plans', 'Plans Defender for Servers 1 et 2', {
    plan: 'Defender for Servers plan 1 ou 2', obj: 'Protéger les serveurs avec EDR et capacités de posture.', risk: 'Choisir le mauvais plan ou l’étendue impossible.',
    clouds: 'Azure, AWS, GCP, sur site avec Arc', scope: 'Abonnement; ressource pour le plan 1', req: 'Azure Arc pour les machines hors Azure', perm: 'Security Admin ou Owner pour activer', cost: 'Facturation par serveur; estimer avec le calculateur; rabais possible avec licences Defender for Endpoint',
    collect: 'Agent Defender for Endpoint, analyse sans agent', compat: 'Un plan Servers par abonnement', limits: 'Plan 2 non activable par ressource; agent seul donne les fonctions du plan 1.', nature: 'native', src: ['servers', 'servers-plan', 'servers-select', 'servers-faq'], lessons: ['d10-l1'],
  }),
  cap('d10.servers.espace-de-travail', 'Espace de travail et franchise d’ingestion', {
    plan: 'Defender for Servers plan 2', obj: 'Stocker les événements FIM et bénéficier de 500 Mo par jour par machine.', risk: 'Oublier d’activer le plan 2 sur l’espace de travail.',
    clouds: 'Azure principalement', scope: 'Espace de travail Log Analytics', req: 'Plan 2 activé sur l’espace de travail', perm: 'Owner de l’abonnement de l’espace de travail', cost: 'Franchise de 500 Mo par jour et par machine; au-delà, tarif Log Analytics',
    collect: 'Événements FIM et types de données couverts', compat: 'Types de données couverts à revérifier', limits: 'Désactiver le plan sur l’abonnement ne le désactive pas sur l’espace de travail.', nature: 'dependance', src: ['servers-data-workspace', 'ingestion-benefit'], lessons: ['d10-l1', 'd10-l3'],
  }),
  cap('d10.servers.jit', 'Accès juste-à-temps aux machines', {
    plan: 'Defender for Servers plan 2', obj: 'Fermer les ports de gestion et accorder un accès borné.', risk: 'Défauts de 3 heures et sources Any en production.',
    clouds: 'Azure et AWS (préversion pour EC2); pas GCP', scope: 'Machine virtuelle', req: 'NSG ou Azure Firewall classique; VM Resource Manager', perm: 'Écriture sur les politiques JIT et la VM pour configurer; initiate pour demander', cost: 'Inclus au plan 2',
    collect: 'Aucune', compat: 'Azure Firewall en règles classiques seulement', limits: 'VM classiques et Firewall Manager non pris en charge; nom de politique et de VM de 56 caractères au plus.', nature: 'native', src: ['jit-overview', 'jit-enable'], lessons: ['d10-l2'],
  }),
  cap('d10.servers.fim', 'Surveillance de l’intégrité des fichiers', {
    plan: 'Defender for Servers plan 2', obj: 'Détecter les changements suspects de fichiers et du registre.', risk: 'Bruit excessif ou agents obsolètes.',
    clouds: 'Azure, AWS, GCP avec Arc', scope: 'Machines avec l’agent Defender for Endpoint', req: 'Espace de travail, agent à version minimale', perm: 'Security Admin et Owner pour configurer; Security Reader pour lire', cost: 'Données dans la franchise de 500 Mo puis tarif Log Analytics',
    collect: 'Agent Defender for Endpoint (quasi temps réel) et analyse sans agent (24 heures)', compat: 'Chemins personnalisés via l’analyse sans agent', limits: 'Non activée par défaut; support de MMA terminé en novembre 2024.', nature: 'native', src: ['fim', 'fim-enable', 'fim-migrate'], lessons: ['d10-l3'],
  }),
];
