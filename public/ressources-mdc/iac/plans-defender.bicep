// Ressource ILLUSTRATIVE : activation d'un plan Defender for Servers (Bicep)
// Version de portée : MDC-2026.10.25-r1 | Nature : ÉCRITURE | Permission : Security Admin ou Owner sur l'abonnement
// IMPACT : ACTIVE UN PLAN PAYANT. Coût : estimer avec le calculateur officiel et dater l'estimation.
// NE PAS DÉPLOYER sans approbation du propriétaire du budget. Exécuter d'abord :
//   az deployment sub what-if --location canadacentral --template-file plans-defender.bicep
// Nettoyage / retour arrière : remettre pricingTier à 'Free' (sans subPlan ni extensions).
// Statut : NON TESTÉ (ni simulation ni déploiement exécutés dans ce parcours).
targetScope = 'subscription'

resource servers 'Microsoft.Security/pricings@2024-01-01' = {
  name: 'VirtualMachines'
  properties: {
    pricingTier: 'Standard'
    subPlan: 'P1'
  }
}
