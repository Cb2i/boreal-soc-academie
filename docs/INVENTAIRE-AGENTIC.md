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

| Module | Niveau | Leçons | Exercices (dont évaluation, cas, remédiation) | Projets | État |
|---|---|---|---|---|---|
| M1 à M18 | 1 à 5 | 3 chacun (54) | 558 au total | 3 chacun (54) | Livré |
| Projets de synthèse (niveau 6) | 6 | | | 9 | Livré |

Chaque module respecte le test d'intégrité (`tests/agentic-content.test.ts`) : évaluation de 8 questions, au moins deux compétences avec preuves, cas pratique, remédiation, trois projets, leçons d'au moins 2 500 caractères, quiz de 3 questions, réponses de référence acceptées, mauvaises réponses refusées.

## Ressources téléchargeables (28, voir `src/agentic/content/resources.ts`)

- **Testées** (exécutées pendant la rédaction avec Python 3 en mode isolé, ou Node) : boucle d'outils, mini RAG (exactitude top-1 3 sur 4, échec conservé volontairement), orchestrateur, simulateur de triage, schéma et garde-fou KQL, priorisation de vulnérabilités, triage de courriel, générateur de rapport, contrôle d'hygiène des runbooks, garde-fou d'appels d'outils, banc d'évaluation (rappel 0,60, précision 1,00), contrôle pré-déploiement (4 bloquants sur la configuration fautive), validation de schéma JSON.
- **À vérifier** : workflow n8n (logique JavaScript exécutée avec Node, import dans n8n non testé), instructions Logic Apps (non exécutées dans Azure), gabarits de prompt (non exécutés contre un modèle réel).

## Vérifications faites

- `npm run check` : typecheck, 349 tests Vitest (dont l'intégrité du contenu IA), validation du contenu Azure, validation i18n, `validate:agentic`, build.
- Test de bout en bout Playwright : 97 vérifications sur le build local, 96 sur 96 sur le build en sous-chemin (la génération du PDF de certificat n'est pas exécutée dans cette variante). Une vérification est instable de temps en temps (voir README).
- Captures mobile (375 px) et bureau (1280 px) de cinq pages de la section prises ; deux ont été regardées (leçon en mobile, ressources en bureau) et n'ont montré aucun défaut visible.
- Le site publié (GitHub Pages) n'est pas joignable depuis l'environnement de travail : il n'a pas été testé en ligne.

## Limites connues

- Section IA en français seulement (le bouton EN affiche un avis).
- Les sources officielles sont vérifiées à une date précise (`VERIFIED` dans `helpers.ts`) ; les fonctionnalités des produits changent vite.
- Les agents sont simulés (règles déterministes) : aucune évaluation d'un vrai modèle de langage n'a été réalisée.
- Les requêtes KQL du contenu n'ont pas été exécutées sur un espace réel.
- Le workflow n8n et les instructions Logic Apps n'ont pas été éprouvés dans leur outil cible.
- Les pages tierces (CISA, FIRST, RoboShadow, certaines pages de Microsoft Learn) n'étaient pas toutes joignables depuis l'environnement de travail ; seules les affirmations vérifiées sont énoncées comme telles.
- Les captures d'écran n'ont pas été revues pour tous les modules.
