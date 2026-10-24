import type { Lesson } from './types.ts';
import { SRC, SRC2, SRC3 } from './sources.ts';

// Cours : chaque cours est court, concret et mène à des exercices. Les blocs ```kql sont exécutables dans le terrain de jeu.
export const LESSONS: Lesson[] = [
  {
    id: 'cours-az-hierarchie',
    path: 'azure-foundations',
    title: 'La hiérarchie Azure et les portées',
    summary: 'Groupes d’administration, abonnements, groupes de ressources, ressources : où poser un rôle, une politique ou un verrou.',
    minutes: 8,
    level: 1,
    competency: 'az-hierarchy',
    body: `Tout dans Azure vit dans une hiérarchie à quatre niveaux. Un réglage posé à un niveau est **hérité** par tous les niveaux en dessous. C'est la base de la gouvernance : on pose une règle une fois, au bon endroit.

## Les quatre portées

- **Groupe d'administration** : regroupe des abonnements. Chaque groupe a un seul parent, et on peut empiler jusqu'à six niveaux.
- **Abonnement** : la frontière de facturation et d'accès.
- **Groupe de ressources** : un conteneur logique. Une ressource appartient à un seul groupe et peut être déplacée.
- **Ressource** : une machine virtuelle, un compte de stockage, un coffre de clés.

## Ce qui se transmet, et ce qui ne se transmet pas

Les attributions de rôles, les politiques et les verrous sont hérités vers le bas. Les **étiquettes d'un groupe de ressources ne le sont pas** : une ressource ne reçoit pas automatiquement les étiquettes de son groupe, il faut une politique pour le faire.

Supprimer un groupe de ressources supprime tout son contenu. C'est pratique pour nettoyer un laboratoire, dangereux si on se trompe de groupe.

> Règle pratique : posez l'accès au plus petit périmètre qui répond au besoin, et les règles de conformité au niveau le plus large qui les justifie.

## Le chemin d'une demande

Toute demande (portail, CLI, modèle) passe par Azure Resource Manager. Il authentifie, vérifie les autorisations, puis transmet la demande au fournisseur de ressources concerné. C'est pourquoi le portail et la CLI donnent les mêmes résultats : ils parlent à la même interface.`,
    exercises: ['az-001', 'az-002', 'az-003', 'az-005', 'az-010', 'az-017', 'az-018'],
    sources: [SRC.mgmtGroups, SRC.organize, SRC.rbacScope, SRC.locks],
  },
  {
    id: 'cours-az-outils',
    path: 'azure-foundations',
    title: 'Outils, modèles déclaratifs et zones de disponibilité',
    summary: 'Portail, CLI, PowerShell, Bicep, et la différence entre zonal, redondant interzones et non zonal.',
    minutes: 8,
    level: 1,
    competency: 'az-tools',
    body: `Le choix de l'outil n'est pas une affaire de goût seulement : il détermine ce qui est **reproductible**.

## Outils

- **Portail Azure** : exploration et diagnostic.
- **Azure CLI et Azure PowerShell** : actions scriptables, utiles dans un pipeline.
- **Modèles ARM et Bicep** : approche **déclarative**. On décrit l'état voulu, Azure fait le nécessaire pour y arriver. Rejouer le même modèle donne le même résultat.

## Zones de disponibilité

Une région Azure peut avoir plusieurs zones, des emplacements physiquement séparés. Une ressource peut être :

- **zonale** : épinglée dans une zone, et c'est vous qui gérez la réplication et le basculement;
- **redondante interzones** : Microsoft gère la distribution, la réplication et le basculement;
- **non zonale** : placée dans n'importe quelle zone, ce qui veut dire qu'une panne de zone peut la rendre indisponible.

Les numéros de zones logiques sont associés aux zones physiques de façon différente pour chaque abonnement. Ne supposez pas que la zone 1 de deux abonnements est le même bâtiment.

> Un déploiement qui ne précise rien sur les zones n'est pas protégé contre une panne de zone. La résilience est un choix de conception.`,
    exercises: ['az-004', 'az-007', 'az-008', 'az-009', 'az-011', 'az-012', 'az-013', 'az-014', 'az-015', 'az-016'],
    sources: [SRC2.zones, SRC2.zonesDesign, SRC.organize],
  },
  {
    id: 'cours-az-reseau',
    path: 'azure-admin',
    title: 'Réseau Azure : NSG, Bastion et peering',
    summary: 'Règles de sécurité réseau, accès d’administration sans exposition, hub-and-spoke et liaison privée.',
    minutes: 10,
    level: 2,
    competency: 'az-network',
    body: `## Les groupes de sécurité réseau (NSG)

Un NSG est une liste de règles évaluées par **priorité croissante** (de 100 à 4096). Dès qu'une règle correspond, le traitement s'arrête. Chaque NSG contient des règles par défaut avec des priorités élevées (65000 et plus) qui ne se suppriment pas, mais qu'on peut **surcharger** avec une règle de priorité plus basse.

- Entrant : le trafic du réseau virtuel et de l'équilibreur de charge Azure est autorisé, le reste est refusé.
- Sortant : le trafic du réseau virtuel et vers Internet est autorisé, le reste est refusé.

> N'exposez jamais 22 ou 3389 à 0.0.0.0/0. Passez par Azure Bastion ou un VPN.

## Azure Bastion

Bastion offre RDP et SSH sur TLS (port 443) directement depuis le portail, **sans adresse IP publique** sur la machine virtuelle. Il se déploie dans un sous-réseau nommé \`AzureBastionSubnet\` d'au moins /26.

## Hub-and-spoke et passerelle partagée

Le réseau « hub » héberge les services communs. Les réseaux « spoke » s'y connectent par peering. Pour partager la passerelle VPN du hub : **Allow gateway transit** côté hub, **Use remote gateways** côté spoke. Un spoke ne peut utiliser qu'une passerelle distante, et le niveau Basic n'est pas pris en charge.

## Accès privé aux services PaaS

Un **point de terminaison de service** reste une adresse publique, gratuit. Un **point de terminaison privé** crée une interface avec une adresse privée dans votre réseau, vise une instance précise, exige le DNS et a un coût. Pour une nouvelle conception en production, le point de terminaison privé est généralement préféré.

## Redondance du stockage

LRS : trois copies dans un centre de données. ZRS : trois zones. GRS et GZRS : ajoutent une région secondaire en copie asynchrone. La redondance protège contre une panne, **pas contre une suppression** : toutes les copies reflètent l'état courant.`,
    exercises: ['az-019', 'az-020', 'az-021', 'az-022', 'az-023', 'az-024', 'az-025', 'az-026', 'az-027', 'az-028'],
    sources: [SRC2.nsg, SRC2.nsgManage, SRC3.bastion, SRC3.gatewayTransit, SRC3.privateLinkFaq, SRC3.storageRedundancy],
  },
  {
    id: 'cours-az-gouvernance',
    path: 'azure-admin',
    title: 'Gouvernance : Azure Policy, verrous et RBAC',
    summary: 'Trois outils, trois questions : qui peut agir, que doit-on respecter, que doit-on protéger.',
    minutes: 9,
    level: 2,
    competency: 'az-governance',
    body: `Trois outils se confondent facilement. Posez-vous la bonne question :

- **RBAC** : qui peut faire quoi?
- **Azure Policy** : que doit-on respecter?
- **Verrou** : que doit-on protéger contre une action accidentelle?

## Azure Policy

Chaque définition a un effet. L'ordre d'évaluation est : \`disabled\`, \`append\` et \`modify\`, \`deny\`, \`audit\`, puis les effets de ressources liées comme \`auditIfNotExists\`. Pour introduire une politique dans un environnement existant, commencez par **audit** : vous mesurez l'impact sans rien casser.

- \`deployIfNotExists\` et \`modify\` ont besoin d'une **identité managée** avec les droits requis.
- L'attribution ne corrige pas l'existant : il faut une **tâche de correction**.
- \`enforcementMode = DoNotEnforce\` évalue sans appliquer l'effet, utile pour tester.
- Une **exclusion** (\`notScopes\`) sort des ressources du calcul; une **exemption** les dispense tout en les gardant visibles, avec une expiration possible.

## Verrous

\`CanNotDelete\` empêche la suppression, \`ReadOnly\` empêche aussi la modification. Ils sont hérités, le plus restrictif gagne, et ils visent le **plan de gestion** seulement : ils ne protègent pas le contenu d'un compte de stockage.

> Un verrou ReadOnly posé « par prudence » peut bloquer des opérations légitimes, comme une mise à l'échelle. Choisissez le plus léger qui répond au besoin.`,
    exercises: ['az-029', 'az-030', 'az-031', 'az-032', 'az-033', 'az-034', 'az-035', 'az-036'],
    sources: [SRC2.policyEffects, SRC2.policyOverview, SRC3.policyAssignment, SRC3.policyRemediate, SRC.locks],
  },
  {
    id: 'cours-id-rbac',
    path: 'identity-security',
    title: 'RBAC et moindre privilège',
    summary: 'Principal, rôle, portée : comment attribuer l’accès minimal et le garder lisible.',
    minutes: 8,
    level: 1,
    competency: 'id-rbac',
    body: `Une attribution de rôle Azure combine trois éléments : **qui** (le principal de sécurité), **quoi** (la définition de rôle) et **où** (la portée).

## Les rôles de base

- **Owner** : tout, y compris attribuer des rôles.
- **Contributor** : crée et gère les ressources, mais **ne peut pas attribuer de rôles**.
- **Reader** : consulte seulement.
- **User Access Administrator** : gère les accès sans gérer les ressources.

Cette séparation limite l'escalade de privilèges : un Contributor compromis ne peut pas se donner Owner.

## Appliquer le moindre privilège

1. Partez du besoin réel, pas du rôle le plus pratique.
2. Choisissez le rôle le plus étroit qui le couvre, y compris les rôles de données (par exemple lire des blobs).
3. Attribuez à la **portée la plus basse** qui suffit : l'attribution est héritée.
4. Attribuez à des **groupes**, pas à des individus : les arrivées et les départs se gèrent par l'appartenance.

## Rôles Microsoft Sentinel

Reader lit, Responder gère les incidents, Contributor construit les règles et les classeurs, Playbook Operator exécute des playbooks. Donnez Responder à l'analyste de niveau 1, pas Contributor Azure.

> Une commande d'attribution avec \`--role "Owner"\` sur un abonnement entier est presque toujours un signal d'alarme en revue de code.`,
    exercises: ['id-001', 'id-002', 'id-003', 'id-004', 'id-005', 'id-006', 'id-007', 'id-008', 'id-009', 'id-018'],
    sources: [SRC.rbacOverview, SRC.rbacScope, SRC.rbacSteps, SRC2.playbooks],
  },
  {
    id: 'cours-id-acces-conditionnel-pim',
    path: 'identity-security',
    title: 'Accès conditionnel et accès privilégié',
    summary: 'Déployer une politique sans se verrouiller, protéger les comptes d’urgence et réduire les privilèges permanents avec PIM.',
    minutes: 9,
    level: 2,
    competency: 'id-privileged',
    body: `## Accès conditionnel

Une politique d'accès conditionnel est évaluée **après** l'authentification de premier facteur. Pour déployer sans risque :

1. définissez la politique et ses **exclusions pour les comptes d'urgence**;
2. activez-la en mode **rapport seulement**;
3. analysez l'impact dans les rapports;
4. activez-la.

Un compte d'urgence (break-glass) est la dernière porte de secours si une politique mal configurée verrouille tout le monde. Il est exclu des politiques bloquantes, très protégé, rarement utilisé, et **chaque utilisation déclenche une alerte**.

Les politiques destinées aux utilisateurs **ne couvrent pas** les principaux de service. Les identités de charge de travail ont leur propre accès conditionnel.

## Privileged Identity Management (PIM)

PIM exige Microsoft Entra ID P2 ou ID Governance. Il remplace le privilège permanent par du privilège **à la demande** :

- **éligible** : l'utilisateur peut activer le rôle;
- **actif** : le rôle est disponible sans activation;
- l'**activation** peut exiger MFA, justification et approbation, et elle est limitée dans le temps.

Pour les rôles de ressources Azure, seuls **Owner** et **User Access Administrator** peuvent gérer les attributions dans PIM.

> Les contrôles se complètent : RBAC fixe le périmètre, PIM limite dans le temps, l'accès conditionnel encadre la connexion, et le compte d'urgence garantit un recours.`,
    exercises: ['id-010', 'id-011', 'id-012', 'id-013', 'id-014', 'id-015', 'id-016', 'id-017'],
    sources: [SRC2.caReportOnly, SRC2.caBlock, SRC2.pimStart, SRC2.pimRbac],
  },
  {
    id: 'cours-obs-collecte',
    path: 'observability',
    title: 'Collecte de journaux : diagnostics, AMA et règles de collecte',
    summary: 'D’où viennent les journaux, comment ils arrivent dans Log Analytics et comment diagnostiquer une collecte silencieuse.',
    minutes: 10,
    level: 2,
    competency: 'obs-collection',
    body: `## Trois familles de journaux

- **Journal d'activité Azure** : les opérations du plan de gestion d'un abonnement (qui a créé, modifié, supprimé quoi).
- **Journaux de ressources** : ce que fait une ressource, collectés **seulement** si vous créez un paramètre de diagnostic.
- **Journaux Microsoft Entra** : connexions et audit de l'annuaire.

Un paramètre de diagnostic envoie vers un espace de travail Log Analytics (requêtes, alertes, Sentinel), un compte de stockage (archivage) ou un Event Hub (flux vers un outil externe).

## Machines : l'agent et la règle

L'**Azure Monitor Agent (AMA)** collecte sur la machine. Une **règle de collecte de données (DCR)** décrit quoi collecter, comment transformer et où envoyer. Une **association** lie la règle à la machine. Sans association, l'agent ne collecte rien.

Une transformation d'ingestion permet de **filtrer des lignes**, de retirer des colonnes sensibles ou de normaliser, avant le stockage. Elle ne modifie jamais ce qui est déjà stocké.

## Diagnostiquer une collecte silencieuse

Vérifiez d'abord que l'agent communique avec la table \`Heartbeat\`.

\`\`\`kql
Heartbeat
| summarize DernierePulsation = max(TimeGenerated) by Computer
| where DernierePulsation < ago(30m)
| order by DernierePulsation asc
\`\`\`

Si les pulsations arrivent mais que \`SecurityEvent\` reste vide, regardez la règle, ses filtres XPath et l'association.

> La suppression d'un paramètre de diagnostic crée un angle mort. Créez une alerte sur les opérations \`DIAGNOSTICSETTINGS/DELETE\` du journal d'activité.`,
    exercises: ['obs-001', 'obs-002', 'obs-003', 'obs-004', 'obs-005', 'obs-006', 'obs-007', 'obs-008', 'obs-016', 'obs-017'],
    sources: [SRC.ama, SRC.dcr, SRC2.logsOverview],
    context: 'sentinel',
  },
  {
    id: 'cours-obs-espace-travail',
    path: 'observability',
    title: 'Espaces de travail : plans de table et rétention',
    summary: 'Choisir un plan par table, dimensionner la rétention interactive et totale, et savoir quand séparer les espaces de travail.',
    minutes: 8,
    level: 2,
    competency: 'obs-workspace',
    body: `## Plans de table

Le plan se choisit **table par table** :

- **Analytics** : analyse complète, alertes et détections.
- **Basic** : haut volume, coût réduit, requêtes limitées (fenêtre de 30 jours).
- **Auxiliary** : très bas coût pour des données rarement utilisées; les **alertes ne fonctionnent pas**.

Une table qui alimente une règle de détection reste en Analytics. Le changement de plan est limité à une fois par semaine par table.

## Rétention

- Valeur par défaut : 30 jours (90 avec Sentinel).
- Rétention interactive Analytics : de 4 à 730 jours.
- Rétention totale : jusqu'à 12 ans. La partie au-delà de l'interactive est à long terme, moins chère, accessible par une **recherche** (search job).

Exemple : 90 jours de recherche rapide et 2 ans de conservation pour \`SigninLogs\` se règlent à 90 jours interactifs et 730 jours au total.

## Un espace de travail ou plusieurs ?

Un seul espace simplifie la détection et la chasse. Séparez pour la résidence des données, la séparation stricte des accès ou des contraintes de gouvernance, pas par habitude.

> Avant de bâtir une règle sur une table : les données arrivent, la table est en Analytics, la rétention couvre la période de recherche.`,
    exercises: ['obs-009', 'obs-010', 'obs-011', 'obs-012', 'obs-013', 'obs-014', 'obs-015', 'obs-018'],
    sources: [SRC2.tablePlans, SRC2.retention, SRC2.logsOverview],
  },
  {
    id: 'cours-sen-detection',
    path: 'sentinel',
    title: 'Sentinel : composants, règles planifiées et triage',
    summary: 'De la collecte à l’incident, comment dimensionner une règle planifiée et classer la fermeture d’un incident.',
    minutes: 10,
    level: 2,
    competency: 'sen-detection',
    body: `## La chaîne

Un **connecteur** fait entrer les journaux, une **règle analytique** exécute une requête et génère des alertes, un **incident** regroupe alertes et entités, la réponse passe par une **règle d'automatisation** ou un **playbook**.

## Règle planifiée : les paramètres qui comptent

- La fréquence et la période de recherche vont de 5 minutes à 14 jours.
- Les événements sont évalués selon leur horodatage mais peuvent **arriver en retard** : la documentation signale un délai d'ingestion pouvant atteindre 5 minutes. Une période de recherche égale à la fréquence laisse échapper des événements.
- Une marge de recherche crée des chevauchements, absorbés par le regroupement des alertes en incidents.

Exemple de requête de règle, une ligne par adresse à signaler :

\`\`\`kql
SigninLogs
| where ResultType != "0"
| summarize Echecs = count() by IPAddress
| where Echecs >= 20
| project IPAddress, Echecs
\`\`\`

## Triage et fermeture

Aperçu (gravité, tactiques, alertes), entités, chronologie dans les journaux, décision, réponse, fermeture. Classez toujours :

- **vrai positif** : activité malveillante réelle;
- **positif bénin** : réelle mais autorisée (test de pénétration);
- **faux positif** : la règle s'est trompée;
- **indéterminé** : preuves insuffisantes.

Ces classifications guident le réglage des règles.

> Après le 31 mars 2027, Sentinel n'est plus disponible dans le portail Azure : la gestion se fait dans le portail Defender. Planifiez la transition.`,
    exercises: ['sen-001', 'sen-002', 'sen-003', 'sen-004', 'sen-005', 'sen-006', 'sen-007', 'sen-014', 'sen-016', 'sen-017', 'sen-018'],
    sources: [SRC.scheduledRules, SRC.createRules, SRC.incidents, SRC.incidentOverview],
    context: 'sentinel',
  },
  {
    id: 'cours-sen-automatisation',
    path: 'sentinel',
    title: 'Automatisation et listes de surveillance',
    summary: 'Règle d’automatisation ou playbook, mise en sourdine avec expiration, et enrichissement par liste de référence.',
    minutes: 8,
    level: 2,
    competency: 'sen-automation',
    body: `## Règle d'automatisation ou playbook

Une **règle d'automatisation** agit sur l'incident lui-même : assigner, étiqueter, changer la gravité, fermer. Elle peut aussi lancer un playbook. Un **playbook** est un flux Logic Apps pour les réponses complexes : appeler une API externe, demander une approbation dans une messagerie, désactiver un compte.

- Préférez le déclencheur **création d'incident** : l'incident regroupe les alertes et offre plus d'actions.
- Les règles s'exécutent dans l'**ordre** défini.
- Une règle peut avoir une **date d'expiration** : parfait pour une mise en sourdine temporaire pendant une maintenance, qui ne devient pas permanente par oubli.

## Listes de surveillance

Une liste de surveillance est une **donnée de référence** (VIP, actifs critiques, plages IP connues) accessible en KQL avec \`_GetWatchlist('alias')\`. La colonne **SearchKey** optimise les jointures. Jusqu'à 10 millions d'éléments, et ce n'est pas un stockage de télémétrie.

\`\`\`kql
let vip = _GetWatchlist('VIP') | project SearchKey;
SigninLogs
| where UserPrincipalName in (vip)
| where ResultType == "0"
\`\`\`

(Ce bloc n'est pas exécutable dans notre terrain de jeu, qui ne contient pas de liste de surveillance : il illustre la forme.)

## Deux contextes de données

Dans Log Analytics et Sentinel, la colonne de temps est \`TimeGenerated\`. Dans les tables d'Advanced Hunting de Defender XDR, c'est \`Timestamp\`. Le portail Defender affiche les deux : connaissez la table que vous interrogez.`,
    exercises: ['sen-008', 'sen-009', 'sen-010', 'sen-011', 'sen-012', 'sen-013', 'sen-015'],
    sources: [SRC2.automationRules, SRC2.playbooks, SRC2.sentinelAutomation, SRC2.watchlists, SRC2.watchlistsQueries, SRC.ahSchema],
  },
  {
    id: 'cours-kql-bases',
    path: 'kql',
    title: 'KQL : lire, filtrer et projeter',
    summary: 'Le modèle de tuyau, where, project, take, sort et ago : les gestes de base de toute requête.',
    minutes: 8,
    level: 1,
    competency: 'kql-filter',
    body: `Une requête KQL est un **tuyau** : une table à gauche, des opérateurs séparés par \`|\`, chacun reçoit le résultat du précédent.

\`\`\`kql
SigninLogs
| where ResultType != "0"
| project TimeGenerated, UserPrincipalName, IPAddress, ResultType
| order by TimeGenerated desc
| take 10
\`\`\`

## Les opérateurs de départ

- \`where\` filtre. Combinez avec \`and\` et \`or\`. Comparez avec \`==\` (pas \`=\`).
- \`project\` garde ou crée des colonnes et retire les autres.
- \`take N\` prend N lignes **quelconques**; pour les N plus récentes ou plus grandes, utilisez \`top N by colonne\` ou \`sort\` puis \`take\`.
- \`distinct\`, \`count\` et \`extend\` complètent la trousse.

## Texte : \`==\`, \`has\`, \`contains\`

\`==\` compare exactement. \`has\` cherche un **terme entier** et est plus rapide que \`contains\`, qui cherche n'importe quelle sous-chaîne. \`=~\` ignore la casse.

## Le temps

\`ago(24h)\` donne l'instant situé 24 heures avant maintenant. Dans notre terrain de jeu, l'horloge est simulée au 12 mars 2026 à 12:00 UTC. Mettez la condition de temps **en premier** : dans Log Analytics elle réduit les données lues.

## Types : un piège fréquent

\`ResultType\` est une **chaîne** dans SigninLogs : écrivez \`"0"\`, pas \`0\`. Dans SecurityEvent, \`EventID\` est un entier.

> Filtrez d'abord, projetez ensuite. Après un \`project\`, les colonnes non gardées n'existent plus.`,
    exercises: ['kql-001', 'kql-005', 'kql-006', 'kql-007', 'kql-008', 'kql-011', 'kql-012', 'kql-013', 'kql-016', 'kql-024', 'kql-025', 'kql-027', 'kql-094'],
    sources: [SRC.where, SRC.project, SRC.take, SRC.ago, SRC.stringOps, SRC.has],
    context: 'sentinel',
  },
  {
    id: 'cours-kql-agreger',
    path: 'kql',
    title: 'KQL : agréger avec summarize',
    summary: 'count, dcount, countif, min, max, make_set, bin et top : transformer des événements en indicateurs.',
    minutes: 10,
    level: 1,
    competency: 'kql-aggregate',
    body: `\`summarize\` transforme beaucoup de lignes en peu de lignes : une par groupe.

\`\`\`kql
SigninLogs
| where ResultType != "0"
| summarize Echecs = count(), Comptes = dcount(UserPrincipalName) by IPAddress
| order by Echecs desc
\`\`\`

## Les agrégations utiles

- \`count()\` : nombre de lignes; \`countif(condition)\` : nombre de lignes qui respectent une condition.
- \`dcount(col)\` : valeurs **distinctes**. C'est ce qui sépare un spray (beaucoup de comptes) d'une force brute (un compte, beaucoup d'essais).
- \`min\`, \`max\`, \`sum\`, \`avg\`, \`percentile(col, 95)\`.
- \`make_set(col)\` : liste des valeurs distinctes.
- \`arg_max(TimeGenerated, *)\` : la ligne la plus récente de chaque groupe.

## Regrouper par temps

\`bin(TimeGenerated, 1h)\` arrondit une date à l'heure. Regroupez dessus pour obtenir une série horaire.

\`\`\`kql
SigninLogs
| where ResultType != "0"
| summarize Echecs = count() by Heure = bin(TimeGenerated, 1h)
| order by Heure asc
\`\`\`

## L'ordre compte

Filtrez **avant** de résumer : \`summarize\` traite moins de lignes. Appliquez un seuil sur un agrégat **après** le \`summarize\` (\`where Echecs >= 20\`), pas avant.

> Le nom de colonne de \`count()\` sans alias est \`count_\`; celui de l'opérateur \`| count\` est \`Count\`.`,
    exercises: ['kql-002', 'kql-003', 'kql-004', 'kql-009', 'kql-019', 'kql-020', 'kql-021', 'kql-022', 'kql-023', 'kql-026', 'kql-028', 'kql-029', 'kql-030', 'kql-034', 'kql-035', 'kql-075', 'kql-117'],
    sources: [SRC.summarize, SRC.makeSet, SRC.argMax, SRC.bin, SRC.top],
    context: 'sentinel',
  },
  {
    id: 'cours-kql-jointures',
    path: 'kql',
    title: 'KQL : let, join, union et listes de référence',
    summary: 'Réutiliser des résultats intermédiaires, relier des sources et comparer l’attendu à l’observé.',
    minutes: 12,
    level: 2,
    competency: 'kql-join',
    body: `## let : nommer un résultat

\`\`\`kql
let sources = SigninLogs
| where ResultType == "50126"
| summarize Comptes = dcount(UserPrincipalName) by IPAddress
| where Comptes > 10
| project IPAddress;
SigninLogs
| where IPAddress in (sources)
| where ResultType == "0"
| project TimeGenerated, UserPrincipalName, IPAddress
\`\`\`

\`in (nom)\` accepte une table à **une seule colonne**. C'est la forme la plus lisible pour « un succès depuis une adresse qui a fait un spray ».

## join : relier deux tables

Choisissez le **type** selon la question :

- \`inner\` : lignes qui ont une correspondance des deux côtés;
- \`leftanti\` : lignes de gauche **sans** correspondance (machines sans pulsation);
- \`leftouter\` : toutes les lignes de gauche, avec ou sans correspondance.

Réduisez et **agrégez le côté droit** avant de joindre : une clé non unique multiplie les lignes. Quand les noms de colonnes diffèrent, écrivez \`on $left.Caller == $right.UserPrincipalName\`.

## union : empiler des sources

Faites correspondre les noms de colonnes avant l'\`union\`.

\`\`\`kql
union
  (SecurityEvent | where EventID == 4625 | project Machine = Computer),
  (Syslog | where SyslogMessage has "Failed password" | project Machine = Computer)
| summarize Echecs = count() by Machine
| order by Echecs desc
\`\`\`

## datatable : une liste en ligne

\`datatable(Computer:string)["SRV-DC01", "SRV-FILE01"]\` crée une petite table de référence. Les colonnes ont toujours un **type**. C'est l'équivalent d'une liste de surveillance, directement dans la requête.

> Comparer un inventaire attendu aux machines observées avec \`leftanti\` est une des vérifications les plus rentables de couverture de journalisation.`,
    exercises: ['kql-036', 'kql-037', 'kql-038', 'kql-039', 'kql-040', 'kql-050', 'kql-053', 'kql-071', 'kql-080', 'kql-091', 'kql-096', 'kql-106', 'kql-108', 'kql-115', 'kql-116'],
    sources: [SRC.let, SRC.join, SRC.union, SRC.datatable],
    context: 'sentinel',
  },
  {
    id: 'cours-kql-temps',
    path: 'kql',
    title: 'KQL : temps, séquences et corrélation',
    summary: 'Bornes de temps, écarts avec datetime_diff, fenêtres horaires et enchaînements d’événements.',
    minutes: 10,
    level: 3,
    competency: 'kql-time',
    body: `La détection est surtout une question de **séquence** : un succès après des échecs, une création de compte suivie d'un ajout à un groupe, un silence après une activité.

## Écart entre deux événements

\`\`\`kql
let creations = SecurityEvent
| where EventID == 4720
| project Computer, Creation = TimeGenerated;
SecurityEvent
| where EventID == 4732
| project Computer, Ajout = TimeGenerated
| join kind=inner creations on Computer
| extend Minutes = datetime_diff("minute", Ajout, Creation)
| where Minutes between (0 .. 10)
\`\`\`

Deux règles : **renommez** les colonnes de temps des deux côtés pour ne pas les écraser, et **bornez l'écart** (ici de 0 à 10 minutes) pour ne pas joindre des événements éloignés. \`datetime_diff(unité, fin, début)\` : inverser les dates donne un nombre négatif.

## Fenêtres horaires

Un spray se détecte dans une fenêtre : regroupez par adresse **et** par \`bin(TimeGenerated, 1h)\`, puis appliquez le seuil de comptes distincts. Sans fenêtre, des échecs sur plusieurs jours s'additionnent à tort.

## Comparer à la normale

\`toscalar\` transforme un résultat d'une seule valeur en scalaire. On calcule la moyenne dans un \`let\`, puis on garde les heures au-dessus de trois fois cette moyenne.

## Machines silencieuses

Résumez la dernière pulsation par machine **puis** filtrez : filtrer avant de résumer ferait disparaître les machines qui se sont tues.

> Dans ce terrain de jeu, l'horloge est fixe (12 mars 2026, 12:00 UTC). En production, \`ago()\` est relatif à l'exécution : une règle planifiée doit toujours être bornée dans le temps.`,
    exercises: ['kql-056', 'kql-057', 'kql-059', 'kql-064', 'kql-090', 'kql-093', 'kql-098', 'kql-101', 'kql-102', 'kql-107', 'kql-114'],
    sources: [SRC.ago, SRC.bin, SRC.let, SRC.join],
    context: 'sentinel',
  },
  {
    id: 'cours-kql-contextes',
    path: 'kql',
    title: 'KQL : Sentinel et Defender XDR, deux contextes distincts',
    summary: 'Tables, colonne de temps et usages propres à Log Analytics et à Advanced Hunting.',
    minutes: 6,
    level: 2,
    competency: 'kql-filter',
    body: `Le même langage sert deux plateformes, avec des **schémas différents**. Mélanger les deux est une erreur courante.

## Log Analytics et Microsoft Sentinel

Tables comme \`SigninLogs\`, \`AuditLogs\`, \`AzureActivity\`, \`SecurityEvent\`, \`Syslog\`, \`Heartbeat\` et \`CommonSecurityLog\`. Colonne de temps : **\`TimeGenerated\`**.

## Advanced Hunting (Defender XDR)

Tables comme \`DeviceProcessEvents\`, \`DeviceNetworkEvents\`, \`DeviceLogonEvents\`, \`EmailEvents\` et \`EmailUrlInfo\`. Colonne de temps : **\`Timestamp\`**.

\`\`\`kql
DeviceProcessEvents
| where InitiatingProcessFileName =~ "WINWORD.EXE"
| where FileName =~ "powershell.exe"
| project Timestamp, DeviceName, AccountName, ProcessCommandLine
\`\`\`

## Conséquences pratiques

- Une requête qui utilise \`TimeGenerated\` sur une table Advanced Hunting échoue (et inversement).
- Le portail Defender affiche les deux univers. Savoir d'où vient la table évite de chercher la mauvaise colonne.
- Les données de Sentinel peuvent être interrogées depuis le portail Defender dans la chasse avancée; l'inverse dépend de la configuration de l'intégration.

> Notre terrain de jeu sépare les deux contextes : choisissez le contexte avant d'écrire la requête.`,
    exercises: ['kql-047', 'kql-049', 'soc-001', 'kql-078', 'kql-079', 'kql-083'],
    sources: [SRC.ahSchema, SRC.ahSentinel, SRC.ahProcess],
    context: 'defender-xdr',
  },
  {
    id: 'cours-soc-methode',
    path: 'soc',
    title: 'Méthode d’enquête SOC',
    summary: 'Hypothèse, preuve, corrélation, contention et classification : un cadre simple pour toute enquête.',
    minutes: 8,
    level: 2,
    competency: 'soc-investigation',
    body: `Une bonne enquête suit le même mouvement, quelle que soit l'alerte.

## 1. Qualifier

Que dit l'alerte, sur quelle source, avec quelle entité (compte, adresse, machine)? Mesurez l'ampleur avant de conclure : combien de comptes, combien d'essais.

## 2. Chercher le succès

Un spray ou une force brute **sans succès** est du bruit à surveiller. Un succès depuis la même source est un incident.

\`\`\`kql
SigninLogs
| where IPAddress == "203.0.113.45"
| summarize Echecs = countif(ResultType != "0"), Succes = countif(ResultType == "0")
\`\`\`

## 3. Suivre l'attaquant

Une fois un compte compromis, suivez-le : élévations de privilèges dans l'annuaire, créations de comptes de service, opérations de gestion, suppression de la journalisation, transferts sortants. Reliez les sources avec **l'adresse de l'attaquant** et les **comptes créés**.

## 4. Contenir sans détruire les preuves

Réinitialisez les identifiants, révoquez les sessions, désactivez les comptes créés, isolez les machines, bloquez les destinations. **Ne supprimez pas** les comptes ni l'espace de travail : vous perdriez des preuves.

## 5. Distinguer

Un déplacement impossible peut être un VPN. Un PowerShell encodé lancé par un agent de gestion de configuration n'est pas un PowerShell encodé lancé par Word. Le **contexte** départage; corroborez avant de conclure.

## 6. Classer et améliorer

Fermez avec la bonne classification, puis demandez-vous quelle détection aurait coupé la chaîne plus tôt : succès après spray, rôle privilégié hors PIM, suppression d'un paramètre de diagnostic, volume sortant croissant vers une destination rare.

> Évitez d'alerter sur chaque échec individuel : le bruit noie l'équipe sans l'aider.`,
    exercises: ['soc-001', 'soc-002', 'soc-003', 'soc-004', 'soc-005', 'soc-006', 'soc-007', 'soc-008', 'soc-009'],
    sources: [SRC.incidents, SRC.incidentOverview, SRC.summarize],
    context: 'sentinel',
  },
];
