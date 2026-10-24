# Boube SOC Académie

Plateforme d'apprentissage interactive sur Azure, Microsoft Sentinel et KQL. Progression par niveaux, exercices variés, moteur KQL local sur données fictives, enquêtes SOC et labos Azure optionnels. Application statique : aucun compte, aucun serveur, aucun service payant.

> Rien n'a été publié ni déployé. Le dépôt est prêt à l'être (voir la section Déploiement).

## Contenu actuel

Les chiffres exacts sont générés par `npm run coverage:matrix`.

| Parcours | Débutant | Intermédiaire | Avancé | Expert | Total |
| --- | --- | --- | --- | --- | --- |
| Azure : fondations | 7 | 10 | 1 | 0 | 18 |
| Azure : administration et architecture | 0 | 10 | 8 | 0 | 18 |
| Identité et sécurité | 4 | 9 | 5 | 0 | 18 |
| Observabilité et collecte | 2 | 7 | 9 | 0 | 18 |
| Microsoft Sentinel | 2 | 10 | 6 | 0 | 18 |
| Académie KQL | 30 | 21 | 47 | 19 | 117 |
| Enquêtes SOC | 0 | 2 | 8 | 1 | 11 |
| **Total** | | | | | **218** |

- 16 cours avec blocs KQL exécutables, 6 labos Azure optionnels, 3 missions, 4 évaluations.
- Types : écriture KQL (94), choix (26, soit 11,9 %), association (21), inspection de configuration (15), correction de requête (14), placement (14), remise en ordre (11), lecture de résultats (9), enquête multi-étapes (8), blocs KQL (6).
- Chaque exercice a un identifiant stable, une difficulté, des prérequis, un objectif, des indices progressifs, une explication, des erreurs courantes, des sources et une date de vérification.

## Fonctionnalités

Repères : carte « prochaine étape » sur l'accueil et sur chaque parcours (le cours d'abord, puis l'exercice suivant), choix du point de départ selon le profil, barre de position dans chaque exercice (n sur N, précédent, suivant), page verrouillée avec un chemin de sortie, et recherche globale au clavier (Ctrl+K, Cmd+K ou la touche /) dans les exercices, cours, labs et pages. Une petite célébration (XP, confettis) s'affiche à la réussite et respecte `prefers-reduced-motion`.

Accueil, catalogue filtrable, carte de progression, pages de cours, espace d'exercice avec éditeur, tableau de bord, favoris, reprise de session, indices progressifs, corrections expliquées, XP et badges liés aux compétences, mode révision (répétition espacée de 1, 3, 7, 14 et 30 jours), mode chronométré optionnel, thèmes sombre et clair, navigation au clavier, respect de `prefers-reduced-motion`. Chaque glisser-déposer a une alternative accessible (boutons et listes déroulantes).

Déblocage : le niveau L s'ouvre quand au moins 60 % du niveau L-1 du même parcours est réussi, en plus des prérequis propres à chaque exercice. Le réglage « tout débloquer » le contourne.

## Entrer dans un parcours à son niveau

- **Cours visible** : dès l'entrée d'un parcours, le bouton « Lire le cours » et la liste des cours sont au-dessus de la carte des niveaux.
- **Tester mon niveau** (`#/niveau/<parcours>`) : une vraie question par niveau (1 à 3), tirée des exercices ordinaires du parcours. Chaque réussite ouvre le niveau suivant. Un échec ou « Je ne sais pas » arrête le test. Les exercices réussis comptent dans la progression.
- **Choisir librement son niveau** : bouton « Commencer ici » sur chaque niveau de la carte. Les niveaux précédents sont ouverts et leurs prérequis ne bloquent plus. « Réinitialiser » rétablit le déverrouillage progressif.

Le niveau de départ est enregistré par parcours dans la progression locale (champ facultatif, export toujours en version 1).

## Série, défi du jour et certificats

- **Série et objectif** : la pastille de l'en-tête affiche les jours consécutifs avec au moins une réussite et l'avancement de l'objectif de la semaine (lundi à dimanche, heure locale). L'objectif se règle dans le tableau de bord. Les anciennes sauvegardes sont reconstituées à partir des dates de réussite.
- **Défi du jour** : 5 exercices déjà réussis, choisis d'abord parmi ceux à réviser, puis les échecs, puis les réussites fragiles. La liste est figée pour la journée et enregistrée localement.
- **Certificat** : disponible quand tous les exercices d'un parcours sont réussis (`#/certificat/<parcours>`). Le nom saisi reste dans la progression locale. Le bouton d'impression ouvre la boîte du navigateur : choisir « Enregistrer au format PDF », orientation paysage. Le certificat est une attestation personnelle, non officielle.

Tout reste local (aucun compte, aucun serveur). Le format d'export de la progression reste en version 1 : les nouveaux champs sont facultatifs à l'import.

## Langues (français et anglais)

Le bouton **EN / FR** de l'en-tête bascule toute l'interface et tout le contenu (parcours, cours, labs, exercices, indices, explications, messages du moteur KQL). Le choix est mémorisé dans le navigateur (clé `boreal.lang`) et l'attribut `lang` de la page suit la langue. Le français reste la langue de référence. Les traductions anglaises sont des « overlays » chargés à la demande (chunk séparé) : `src/content/en/`. Les blocs de code, les identifiants et les alias de colonnes des exercices restent identiques dans les deux langues, pour que les solutions de référence soient validées de la même façon.

Ajouter ou modifier une traduction :

1. Éditer le fichier concerné dans `src/content/en/` (une entrée par identifiant, mêmes `id` internes que le français).
2. Lancer `npm run validate:i18n`. Le script vérifie que chaque champ traduisible existe, que les tableaux ont la même longueur, que le code est identique au français, qu'aucun mot français ne subsiste et qu'aucun tiret cadratin n'est utilisé.

## Démarrage

Prérequis : Node.js 22 ou plus.

```bash
npm install
npm run dev        # serveur de développement
npm run check      # types, tests, validation du contenu, build
npm run build      # production dans dist/
npm run preview    # prévisualiser dist/
```

Autres commandes : `npm test`, `npm run validate:content`, `npm run coverage:matrix`, `npm run e2e`.

## Structure

```
src/kql/           lexer, parser, interpréteur et analyseur du moteur KQL local (sans eval)
src/engine/        validation des réponses, XP, comparaison de résultats
src/data/          jeu de données fictif (Nordlys Technologies)
src/content/       parcours, compétences, cours, labos, sources, exercices
src/pages/         pages de l'application (routage par hash)
scripts/           validation du contenu, matrice de couverture
tests/             tests Vitest
e2e/               scénario Playwright de bout en bout
```

## Ajouter du contenu

1. Un exercice : ajouter un objet dans un fichier de `src/content/exercises/` avec les constructeurs de `src/content/build.ts` (`kw`, `kfix`, `kb`, `kr`, `ord`, `mat`, `plc`, `ins`, `cho`, `inv`). Utiliser un identifiant unique et stable (par exemple `kql-121`).
2. Un cours : ajouter une entrée dans `src/content/lessons.ts` et lister les exercices associés.
3. Lancer `npm run validate:content`. Le script vérifie les identifiants, les prérequis, les indices, les sources, les doublons, la cohérence par type, l'exécution de chaque solution de référence sur deux jeux de données et de chaque bloc KQL des cours.

## Moteur KQL local

Le moteur interprète un sous-ensemble documenté de KQL sur des tables fictives. Il compare les résultats et non le texte des requêtes, sur deux jeux de données (un visible, un caché). Verdicts possibles : correcte, correcte mais optimisable, résultat bon avec raisonnement fragile, résultat incorrect, erreur de syntaxe, fonction non prise en charge. Les contextes Log Analytics / Sentinel et Defender XDR (Advanced Hunting) sont séparés (colonne temporelle `TimeGenerated` contre `Timestamp`).

Limites connues : pas de `make-series`, `row_number`, `parse`, ni de plusieurs fonctionnalités avancées. La page « Limites » de l'application les liste à partir du code.

## Confidentialité

La progression est stockée uniquement dans le `localStorage` du navigateur (clé `boreal.progress.v1`), avec export et import JSON. Aucune donnée n'est envoyée ailleurs. Aucun secret ni accès à un locataire n'est demandé, y compris dans les labos.

## Déploiement

Le routage utilise le hash (`#/...`), donc aucune règle de réécriture serveur n'est nécessaire.

### GitHub Pages

1. Créer le dépôt et y pousser le code (action à faire par vous).
2. Dans Settings > Pages, choisir Source : GitHub Actions.
3. Le flux `.github/workflows/deploy.yml` exécute types, tests, validation et build avec `VITE_BASE=/<nom-du-dépôt>/`, puis déploie lors d'une poussée sur `main` ou d'un déclenchement manuel. Les demandes de tirage construisent seulement.

### Autre hébergeur statique

```bash
npm ci
npm run build                      # base relative par défaut (./)
VITE_BASE=/mon-sous-dossier/ npm run build   # si servi dans un sous-chemin absolu
```

Publier le contenu de `dist/` (Netlify, Cloudflare Pages, Azure Static Web Apps, serveur web quelconque). Voir `.env.example`.

## Tests

- `npm test` : tests unitaires (moteur KQL, jeu de données, validation, progression, contenu, bascule de langue).
- `npm run validate:i18n` : complétude et cohérence des traductions anglaises.
- `npm run e2e` : scénario Playwright (navigation, verrouillage, KQL incorrect puis correct, persistance, glisser-déposer natif et alternatives, enquête, thèmes, mobile 375 px). Playwright n'est pas une dépendance du projet : l'installer globalement (`npm i -g playwright`, puis `npx playwright install chromium`) et construire d'abord avec `npm run build`. Pour le sous-chemin : `VITE_BASE=/soc-academy/ npx vite build --outDir dist-sub` puis `E2E_SUBPATH=1 npm run e2e`.

## Sources et vérification

Les faits techniques ont été vérifiés dans la documentation officielle Microsoft Learn le 2026-10-24 (voir `src/content/sources.ts`). Ce qui n'a PAS été vérifié ou reste incertain :

- Les labos n'ont jamais été exécutés sur un abonnement Azure réel; ils sont fondés sur la documentation.
- Licences, tarifs et prérequis de licence (par exemple le connecteur Entra) sont marqués « à vérifier » dans le contenu.
- La date de bascule vers le portail Defender seul (2027-03-31) cite une source voisine; confirmer sur la page officielle de transition.
- Les fonctionnalités en préversion sont signalées comme telles dans les exercices concernés.
- Les exercices hors KQL sont validés pour leur cohérence interne, pas contre un environnement Azure.

## Limites connues

- Le niveau expert n'existe presque qu'en KQL (19 exercices; 1 en SOC). Azure : fondations n'a qu'un exercice avancé; Azure : administration et Identité n'ont pas de niveau débutant.
- Bundle de 710 kB sans découpage du code.
- Aucun test de composants jsdom; la couverture UI repose sur le scénario e2e.

## Licence

MIT, voir `LICENSE` et `LICENSES.md`.
