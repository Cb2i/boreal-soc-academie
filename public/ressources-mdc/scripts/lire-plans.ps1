# Ressource : lire (sans modifier) le niveau des plans Defender for Cloud d'un abonnement
# Version de portée : MDC-2026.10.25-r1 | Nature : LECTURE SEULE | Permission : Reader (ou Security Reader)
# Impact : aucun | Coût : sans frais propres | Nettoyage : aucun
# Statut : NON EXÉCUTÉ contre un abonnement. Nécessite le module Az.Security et une session Connect-AzAccount.
# Aucun Set-AzSecurityPricing dans ce script : il ne change rien.
Get-AzSecurityPricing | Select-Object Name, PricingTier, SubPlan | Sort-Object Name | Format-Table -AutoSize
