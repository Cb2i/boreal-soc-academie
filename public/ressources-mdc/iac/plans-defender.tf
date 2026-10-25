# Ressource ILLUSTRATIVE : activation d'un plan Defender for Servers (Terraform, fournisseur azurerm)
# Version de portée : MDC-2026.10.25-r1 | Nature : ÉCRITURE | Permission : Security Admin ou Owner sur l'abonnement
# IMPACT : ACTIVE UN PLAN PAYANT. Exécuter terraform plan et lire le résultat avant tout apply.
# Retour arrière : tier = "Free" (retirer subplan et extensions), puis terraform apply après approbation.
# Statut : NON TESTÉ. Vérifier les arguments dans la documentation du fournisseur pour votre version.
resource "azurerm_security_center_subscription_pricing" "servers" {
  tier          = "Standard"
  resource_type = "VirtualMachines"
  subplan       = "P1"
}
