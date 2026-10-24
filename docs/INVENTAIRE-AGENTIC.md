# Inventaire de livraison : section « Agentic AI for Cybersecurity »

Ce document définit ce qui doit être livré et indique, module par module, ce qui l'est réellement. Il est mis à jour à chaque jalon.
Dernière mise à jour : voir l'historique Git.

## Engagements (périmètre)

- 18 modules en 6 niveaux (le niveau 6 regroupe 9 projets de synthèse).
- Chaque module : au moins 3 leçons ou plus selon le sujet, évaluation de 8 questions, un cas pratique noté, 2 à 4 compétences avec grille, remédiation par notion, 3 projets (débutant, intermédiaire, avancé).
- Chaque leçon : objectifs et prérequis, explication, démonstration commentée, exercice guidé, exercice autonome, évaluation courte de 3 questions, fiche de révision, liens officiels vérifiés.
- Exercices : QCM avec explication de chaque choix, réponse courte, remise en ordre, association, placement (avec alternative clavier), analyse, correction de JSON ou de code, configuration de paramètres, construction de workflow, travail ouvert en autoévaluation.
- Aucune API d'IA payante. Tout fonctionne avec des données fictives, dans le navigateur. Les laboratoires connectés sont facultatifs et documentés (comptes, permissions, coûts, secrets, nettoyage).
- Progression séparée de la section Azure (`boube.agentic.v1`), distinction « contenu consulté » et « compétence validée ».

## État d'avancement

| Module | Niveau | Leçons | Exercices | Évaluation | Cas | Projets | État |
|---|---|---|---|---|---|---|---|
| M1 Comprendre l'IA | 1 | 3 | 25 | 8 | oui | 3 | Livré |
| M2 à M18 | 1 à 5 | | | | | | À écrire |
| Projets de synthèse (niveau 6) | 6 | | | | | 9 | À écrire |

Ressources téléchargeables : aucune livrée pour l'instant (voir `src/agentic/content/resources.ts`, statuts « testé » ou « à vérifier » obligatoires).

## Vérifications faites

- `npm run check` (typecheck, 348 tests Vitest dont l'intégrité du contenu IA, validation du contenu Azure et i18n, build).
- Test de bout en bout Playwright : 83 vérifications sur le build local (une vérification est instable de temps en temps, voir la note dans README).
- Le site publié (GitHub Pages) n'est pas joignable depuis l'environnement de travail : il n'a pas été testé en ligne.

## Limites connues

- Section IA en français seulement (le bouton EN affiche un avis).
- Les sources officielles sont vérifiées à une date précise (`VERIFIED` dans `helpers.ts`) ; les fonctionnalités des produits changent vite.
