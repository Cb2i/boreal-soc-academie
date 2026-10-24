# Logic Apps : préparer un billet d'incident (instructions, rien n'est déployé)

Statut : à vérifier. Ces instructions décrivent la conception ; elles n'ont pas été exécutées dans un compte Azure pour ce projet. Rien n'est déployé tant que vous ne le décidez pas.

## Objectif
À la création d'un incident, préparer un brouillon de billet (résumé, preuves, action proposée) que l'analyste approuve. Le flux ne ferme rien et n'exécute aucune action réelle.

## Conception
1. Déclencheur : incident Microsoft Sentinel créé (ou une règle d'automatisation qui appelle le flux).
2. Action : lire les entités et les alertes de l'incident (lecture seule).
3. Portée « Traitement » : normaliser et valider les champs (formats stricts), pseudonymiser selon le public.
4. Action : appeler la fonction ou le modèle de rédaction (facultatif) avec un plafond de longueur et de délai.
5. Action : valider la sortie contre le schéma (schemas/sortie-triage.schema.json).
6. Action : ajouter le brouillon comme commentaire de l'incident, étiqueté « brouillon, à approuver ».
7. Portée « En cas d'échec » (configurée selon le résultat de la portée Traitement) : ajouter un commentaire d'échec et laisser l'incident dans la file humaine. Ne jamais fermer par défaut.

## Compte, permissions, coûts, secrets, nettoyage
- Compte : un abonnement ou locataire de test appartenant à la personne qui exécute la recette.
- Permissions : identité managée du flux avec un rôle minimal sur l'espace de travail (lecture et ajout de commentaires). Pas de droit d'administration.
- Coûts : facturés selon le niveau (Consommation ou Standard) et le volume d'exécutions ; lire la tarification à jour avant de commencer et créer un budget avec alerte (une alerte n'arrête pas la consommation : ajoutez des limites dans le flux).
- Secrets : aucun dans la définition ; identité managée ou coffre de secrets.
- Nettoyage : supprimer le groupe de ressources du laboratoire, l'identité et les règles d'automatisation, puis vérifier qu'il ne reste rien.

## Limites
Les noms exacts des actions et des connecteurs changent : suivez la documentation Microsoft à jour. Ce document ne contient pas de définition de flux importable.
