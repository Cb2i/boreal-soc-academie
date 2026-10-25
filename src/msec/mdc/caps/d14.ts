import { cap } from '../model.ts';

export const CAPS_D14 = [
  cap('d14.appservice', 'Defender for App Service', {
    plan: 'Defender for App Service', obj: 'Détecter les attaques contre les applications et API hébergées dans App Service.', risk: 'Enquête limitée sans journaux de diagnostic.',
    clouds: 'Azure', scope: 'Abonnement', req: 'Plan App Service de tout niveau; plan activé', perm: 'Security Admin ou Owner pour activer', cost: 'Facturé selon les instances de calcul des plans App Service',
    collect: 'Télémétrie native sans agent', compat: 'Windows et Linux', limits: 'Azure seulement; non disponible dans Azure Government selon la matrice consultée.', nature: 'native', src: ['app-service', 'app-service-enable', 'multicloud-matrix'], lessons: ['d14-l1'],
  }),
  cap('d14.serverless', 'Protection serverless dans Defender CSPM', {
    plan: 'Defender CSPM', obj: 'Évaluer la posture des Web Apps, Functions et Lambda sans agent.', risk: 'La confondre avec la détection de menaces.',
    clouds: 'Azure, AWS', scope: 'Abonnement ou connecteur', req: 'Plan Defender CSPM et composant serverless activé', perm: 'Security Admin ou Owner', cost: 'Facturation du composant en vigueur depuis 2026-04-01 selon la documentation',
    collect: 'Configuration et dépendances', compat: 'Inventaire, recommandations, chemins d’attaque', limits: 'Disponibilité des fonctions variable selon le portail.', nature: 'licence-supplementaire', src: ['serverless', 'cspm-components'], lessons: ['d14-l1'],
  }),
  cap('d14.apis.plan', 'Defender for APIs : plan et intégration', {
    plan: 'Defender for APIs', obj: 'Protéger les API REST publiées dans Azure API Management.', risk: 'Croire que l’activation du plan protège toutes les API.',
    clouds: 'Azure', scope: 'Abonnement puis API', req: 'Instance APIM et API REST importées', perm: 'API Management Service Contributor et Contributor ou Owner', cost: 'Par abonnement selon le trafic mensuel surveillé; dépassements possibles',
    collect: 'Trafic d’API', compat: 'Portails Azure et Defender', limits: 'REST seulement; pas de passerelle auto-hébergée ni d’espaces de travail.', nature: 'native', src: ['apis', 'apis-deploy', 'apis-prepare', 'apim-defender'], lessons: ['d14-l2'],
  }),
  cap('d14.apis.recos', 'Recommandations API et APIM', {
    plan: 'Defender for APIs', obj: 'Renforcer la posture des API et de l’instance APIM.', risk: 'Ignorer les API non authentifiées.',
    clouds: 'Azure', scope: 'API et instance APIM', req: 'API intégrées', perm: 'Security Reader pour lire', cost: 'Inclus au plan',
    collect: 'Configuration APIM et trafic', compat: 'Defender CSPM pour la posture', limits: 'Posture API : Azure seulement.', nature: 'native', src: ['apis-recos', 'apis-alerts'], lessons: ['d14-l2'],
  }),
  cap('d14.keyvault', 'Defender for Key Vault (déprécié)', {
    plan: 'Defender for Key Vault', obj: 'Détecter les accès ou exploitations inhabituels de coffres.', risk: 'Le proposer pour un nouveau déploiement.',
    clouds: 'Azure', scope: 'Abonnement', req: 'Abonnement existant déjà enrôlé', perm: 'Security Admin', cost: 'Modèle de tarification fixe pour la voie de migration à confirmer',
    collect: 'Opérations des coffres', compat: 'Alertes Defender for Cloud', limits: 'Enrôlement bloqué par API depuis 2026-07-05; aucune date de retrait annoncée.', nature: 'native', src: ['keyvault', 'plan-mgmt-changes', 'release-notes'], lessons: ['d14-l3'],
  }),
  cap('d14.arm', 'Defender for Resource Manager (déprécié)', {
    plan: 'Defender for Resource Manager', obj: 'Détecter des opérations de gestion Azure suspectes.', risk: 'Compter dessus pour un nouveau déploiement.',
    clouds: 'Azure', scope: 'Abonnement', req: 'Abonnement existant déjà enrôlé', perm: 'Security Admin', cost: 'Modèle de tarification fixe pour la voie de migration à confirmer',
    collect: 'Opérations de gestion', compat: 'Alertes Defender for Cloud', limits: 'Enrôlement bloqué par API depuis 2026-07-05; aucune date de retrait annoncée.', nature: 'native', src: ['arm', 'arm-alerts', 'plan-mgmt-changes'], lessons: ['d14-l3'],
  }),
  cap('d14.dns', 'Détection DNS via Defender for Servers P2', {
    plan: 'Defender for Servers P2', obj: 'Alerter sur des activités DNS anormales.', risk: 'Chercher un plan DNS autonome.',
    clouds: 'Azure', scope: 'Ressources utilisant les résolveurs Azure par défaut', req: 'Servers P2 activé', perm: 'Security Admin', cost: 'Inclus dans Servers P2 pour les nouveaux abonnements',
    collect: 'Requêtes DNS', compat: 'Alertes Defender for Cloud', limits: 'Plan DNS autonome déprécié; non reporté automatiquement dans le portail Defender.', nature: 'licence-supplementaire', src: ['dns', 'plan-mgmt-changes'], lessons: ['d14-l3'],
  }),
];
