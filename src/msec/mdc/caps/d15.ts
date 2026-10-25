import { cap } from '../model.ts';

export const CAPS_D15 = [
  cap('d15.menaces', 'Protection contre les menaces des services d’IA', {
    plan: 'Defender for AI Services', obj: 'Détecter jailbreak, fuite d’identifiants, accès anormal et reconnaissance sur les déploiements d’IA.', risk: 'Confondre détection et blocage.',
    clouds: 'Azure commercial', scope: 'Abonnement', req: 'Azure OpenAI ou service d’inférence de modèles Azure AI', perm: 'Owner sur l’abonnement', cost: 'Facturé selon les jetons analysés; essai de 30 jours plafonné à 75 milliards de jetons',
    collect: 'Texte des échanges et activité', compat: 'Portail Defender XDR', limits: 'Texte seulement; pas Azure Government, 21Vianet ni AWS.', nature: 'native', src: ['ai-threat', 'ai-onboarding', 'ai-alerts'], lessons: ['d15-l2'],
  }),
  cap('d15.preuve', 'Preuve des invites suspectes', {
    plan: 'Defender for AI Services', obj: 'Ajouter l’extrait déclencheur aux alertes.', risk: 'Copie de contenu d’utilisateurs dans les alertes et le SIEM.',
    clouds: 'Azure commercial', scope: 'Abonnement', req: 'Plan activé', perm: 'Owner pour configurer', cost: 'Inclus au plan',
    collect: 'Extraits d’invites', compat: 'Alertes et export SIEM', limits: 'Désactivé : contenu masqué dans l’alerte.', nature: 'native', src: ['ai-threat', 'ai-onboarding'], lessons: ['d15-l2'],
  }),
  cap('d15.posture', 'Posture de sécurité IA (AI SPM)', {
    plan: 'Defender CSPM', obj: 'Découvrir les charges IA et dresser la nomenclature AI BOM.', risk: 'Promettre une couverture GCP malgré le conflit documentaire.',
    clouds: 'Azure, AWS', scope: 'Abonnement ou connecteur', req: 'Plan Defender CSPM', perm: 'Security Admin ou Owner', cost: 'Inclus au plan Defender CSPM',
    collect: 'Configuration des charges IA', compat: 'Azure OpenAI, Foundry, Azure ML, Bedrock', limits: 'Vertex AI cité mais AI SPM non pris en charge sur GCP selon la matrice; à revérifier.', nature: 'native', src: ['ai-posture', 'multicloud-matrix', 'cspm'], lessons: ['d15-l1', 'd15-l3'],
  }),
  cap('d15.agents', 'Sécurité des agents IA', {
    plan: 'Microsoft Agent 365', obj: 'Découvrir et protéger les agents (Foundry et tiers).', risk: 'Perdre la visibilité des agents sans licence.',
    clouds: 'Azure commercial', scope: 'Locataire', req: 'Licence Agent 365 admissible', perm: 'Rôles Defender XDR', cost: 'Licence par utilisateur distincte de Defender for Cloud',
    collect: 'Observabilité des agents', compat: 'Portail Defender', limits: 'Détections en préversion; licence requise depuis 2026-07-01.', nature: 'licence-supplementaire', src: ['agent365-transition', 'agent-detection'], lessons: ['d15-l3'],
  }),
  cap('d15.filtres', 'Prompt Shields et filtres de contenu', {
    plan: 'Azure AI Content Safety et Foundry', obj: 'Bloquer ou annoter les invites de contournement.', risk: 'Supposer que Defender les configure.',
    clouds: 'Azure', scope: 'Déploiement de modèle', req: 'Guardrail assigné au déploiement', perm: 'Rôles de la plateforme IA', cost: 'Selon la tarification de la plateforme IA',
    collect: 'Invites et documents', compat: 'Alimente les alertes de la protection contre les menaces', limits: 'Mécanisme de la plateforme, pas de Defender for Cloud.', nature: 'dependance', src: ['prompt-shields'], lessons: ['d15-l1'],
  }),
];
