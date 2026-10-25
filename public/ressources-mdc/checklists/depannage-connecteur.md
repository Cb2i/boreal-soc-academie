# Dépannage d'un connecteur muet

Version de portée : MDC-2026.10.25-r1 | Nature : lecture, puis changements uniques et consignés | Statut : modèle, non éprouvé en laboratoire réel.

1. Énoncer le symptôme (ressource, portée, heure).
2. Abonnement du connecteur sélectionné dans le filtre Directories + subscriptions.
3. Standards assignés au connecteur.
4. Ressource microsoft.security/securityconnectors présente dans Resource Graph.
5. AWS : déploiement CloudFormation terminé; au moins 12 h écoulées depuis la création du compte racine.
6. Compte déjà connecté à Sentinel d'abord : suivre la procédure dédiée.
7. EKS : rôle recréé, plages réseau retirées, ancienne inscription Arc.
8. Suppression impossible : chercher un verrou de ressource dans le journal d'activité.
9. Changer une seule chose à la fois, noter le résultat, revenir à l'état initial si inutile.
10. Escalader avec un dossier caviardé (aucun secret ni jeton).
