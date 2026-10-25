// Module 9 : Évaluation des vulnérabilités et approches sans agent (niveau 3).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, SH, OP, comps, P, assemble } = dsl('d09');
const c1 = { comp: 'd09-c1', lesson: 'd09-l1', tags: ['sans-agent', 'instantanes', 'couverture'] };
const c2 = { comp: 'd09-c2', lesson: 'd09-l2', tags: ['vulnerabilites', 'mdvm', 'byol', 'hybride'] };
const c3 = { comp: 'd09-c3', lesson: 'd09-l3', tags: ['conteneurs', 'registre', 'execution', 'resultats'] };

const l1 = lesson(1, {
  title: 'Analyse sans agent des machines : fonctionnement, couverture et limites', minutes: 50,
  summary: 'Comprendre comment les instantanés de disque servent à l’analyse, ce qui est couvert, ce qui ne l’est pas et comment exclure ou dépanner.',
  objectives: ['Décrire le fonctionnement de l’analyse par instantanés.', 'Énoncer les limites de couverture (machine arrêtée, taille, disques).', 'Exclure des machines par étiquette et dépanner les résultats manquants.'],
  prerequisites: ['Module 4 : déploiement et couverture', 'Module 6 : chemins d’attaque'],
  body: md(
    '## Principe',
    'L’analyse sans agent prend des **instantanés des disques** (système et données) de la machine virtuelle et en effectue une analyse approfondie hors bande. L’instantané copié **reste dans la même région** que la machine, l’analyse n’affecte pas la machine, et une fois les métadonnées obtenues, l’instantané est supprimé immédiatement : l’environnement d’analyse est régional, volatil, isolé, et seules les **métadonnées** (constats de sécurité) en sortent. Pour la détection de vulnérabilités, l’analyse est faite par Defender Vulnerability Management. Ce mécanisme ne demande aucun agent ni connectivité réseau vers la machine.',
    '## Plans et coûts',
    'Elle est active par défaut sur les machines prises en charge quand **Defender CSPM** ou **Defender for Servers plan 2** est activé, sans frais Defender for Cloud supplémentaires. Attention aux coûts **chez le fournisseur** : sur AWS, la conservation des instantanés peut entraîner des frais, brefs mais réels; ils portent la balise `CreatedBy` avec la valeur `Microsoft Defender for Cloud` (à activer dans la console de facturation pour les suivre). Un garde-fou suspend les nouvelles analyses AWS quand 250 instantanés ou plus restent non supprimés à cause d’un refus d’autorisation; il faut alors vérifier la permission `ec2:DeleteSnapshot`, les politiques IAM et les politiques de contrôle de service.',
    '## Couverture et limites',
    '**Machine arrêtée ou désallouée** pendant l’analyse planifiée : elle n’est pas analysée, ses résultats restent absents ou périmés. **Azure** : machines standards et ensembles à orchestration flexible, 14 disques au plus, taille combinée de 4 To au plus (sinon seul le disque système est analysé s’il fait moins de 4 To); clés gérées par la plateforme prises en charge, clés gérées par le client après permissions supplémentaires sur Key Vault. **AWS** : instances EC2 et groupes Auto Scaling, disques non chiffrés ou chiffrés; les images exigeant une licence tierce ne sont pas prises en charge. **GCP** : instances Compute Engine; une politique d’organisation restreignant disques, images et instantanés peut bloquer l’analyse.',
    '## Exclure et dépanner',
    'On exclut des machines à l’aide d’**étiquettes d’environnement existantes** (Environment settings, le plan, Settings, Agentless scanning for machines, Edit configuration, paires `étiquette:valeur`). Les machines exclues sont ignorées lors de la découverte continue; documentez le motif, car une exclusion est un trou de couverture. Après activation ou mise à jour des permissions du connecteur, attendez jusqu’à **24 heures** avant de dépanner. Pour GCP, corrigez la politique d’organisation `Compute Storage resource use restrictions`.',
    '| Symptôme | Première vérification |',
    '| --- | --- |',
    '| Aucun résultat sur une VM | Machine en marche pendant l’analyse? Plan et option actifs? |',
    '| Résultats obsolètes | Machine arrêtée à l’analyse planifiée |',
    '| GCP sans résultat après 24 h | Politique d’organisation sur les disques et instantanés |',
    '| AWS : analyses suspendues | Suppression des instantanés refusée |',
    '```text',
    'Fiche d\'exclusion (exemple fictif)',
    'Étiquette : analyse=exclue    Machines : appliance de scan tiers (alertes parasites)',
    'Motif    : le produit tiers déclenche des détections; compensation par EDR et revue mensuelle',
    'Revue    : trimestrielle   Propriétaire : équipe sécurité',
    '```',
    '## Erreurs fréquentes',
    '- Conclure à l’absence de vulnérabilités sur une machine arrêtée.',
    '- Ignorer les coûts de stockage d’instantanés chez AWS.',
    '- Exclure sans motif ni revue.',
  ),
  demo: { title: 'Machine sans résultat', body: md(
    'Constat **fictif** : une VM de production n’a aucun résultat 36 heures après l’activation.',
    '```text',
    'Question 1 : plan CSPM ou Servers P2 actif, option sans agent activée?  -> oui',
    'Question 2 : machine en marche pendant l’analyse planifiée?               -> non, arrêtée la nuit',
    'Question 3 : disques dans les limites (14 disques, 4 To)?                  -> oui',
    '```',
    '**Lecture commentée.** La machine est arrêtée à l’heure de l’analyse. On décale la planification d’arrêt ou on accepte l’écart documenté.',
    '**Ce que la démo ne prouve pas.** Scénario inventé.') },
  revision: md('## Fiche : sans agent', '- Instantanés, même région, supprimés après analyse, métadonnées seulement.', '- Actif avec CSPM ou Servers P2, frais fournisseur possibles (AWS).', '- Machine arrêtée : non analysée.', '- Limites Azure : 14 disques, 4 To.', '- Exclusion par étiquette, motif et revue.'),
  links: ['agentless-concept', 'agentless-enable', 'agentless-exclude', 'agentless-gcp-error', 'faq-general'], teaches: ['sans-agent', 'instantanes', 'couverture'],
});

const l2 = lesson(2, {
  title: 'Évaluation des vulnérabilités des machines : MDVM, capteur et licence tierce', minutes: 50,
  summary: 'Comparer les trois modes d’analyse des vulnérabilités, comprendre le comportement hybride et ses limites.',
  objectives: ['Distinguer analyse sans agent, analyse par capteur Defender for Endpoint et scanneur BYOL.', 'Prédire le résultat affiché quand plusieurs méthodes coexistent.', 'Énoncer les limites du scanneur intégré.'],
  prerequisites: ['Leçon 1', 'Module 10 à venir : Defender for Servers'],
  body: md(
    '## Trois approches',
    'L’évaluation intégrée repose sur **Defender Vulnerability Management** (MDVM) et prend deux formes. L’**analyse sans agent** fait partie des capacités sans agent et n’est offerte qu’avec **Defender for Servers plan 2** (ou Defender CSPM pour l’analyse des disques). L’**analyse par capteur** passe par l’intégration de **Defender for Endpoint** et existe dans les plans 1 et 2. Troisième voie : un scanneur **BYOL** (Qualys ou Rapid7), pour lequel aucun plan payant n’est requis : les constats remontent dans Defender for Cloud et on ouvre la console du partenaire pour les rapports. Un seul scanneur BYOL est pris en charge à la fois.',
    '## Comportement hybride',
    'Avec l’analyse sans agent activée : sans autre solution, Defender for Cloud lance automatiquement l’analyse sans agent; si la machine exécute l’agent Defender for Endpoint, la vue est **unifiée** (les machines qui utilisent les deux méthodes affichent les résultats de l’agent, plus frais); avec un scanneur BYOL, les résultats du partenaire s’affichent par défaut, et ceux de l’analyse sans agent s’affichent pour les machines sans l’agent partenaire ou qui ne rapportent pas correctement. On peut forcer l’affichage des résultats MDVM en activant l’évaluation sur l’abonnement. Cette logique veut dire que **la source d’un constat doit toujours être notée** dans un rapport.',
    '## Limites à connaître',
    'Le scanneur intégré ne trouve que les vulnérabilités **de la machine elle-même**, pas celles du réseau. Il ne remplace pas un test d’intrusion ni un scanneur réseau. Le plan 2 inclut des capacités premium (inventaires consolidés, évaluations supplémentaires, outils d’atténuation). Les mises à jour de systèmes sont interprétées toutes les 12 heures, la protection des points de terminaison sans agent toutes les 24 heures, et Defender for Cloud cherche de nouvelles données environ toutes les heures. Le message « Missing scan data » apparaît notamment sur une machine arrêtée.',
    '## Choisir',
    'Le choix suit le plan, la licence existante et la fraîcheur voulue. Un parc déjà équipé de Defender for Endpoint gagne à garder la vue unifiée. Une organisation avec une licence Qualys active peut la conserver sans plan payant, au prix d’une intégration à surveiller. Dans tous les cas, mesurez la **couverture** (module 4) avant d’interpréter les chiffres de vulnérabilités.',
    '| Approche | Plan | Fraîcheur | Remarque |',
    '| --- | --- | --- | --- |',
    '| Sans agent (MDVM) | Servers P2 (ou CSPM pour les disques) | Analyse planifiée | Machine en marche requise |',
    '| Capteur (Defender for Endpoint) | Servers P1 ou P2 | Meilleure fraîcheur | Agent requis |',
    '| BYOL (Qualys, Rapid7) | Aucun plan requis | Selon le partenaire | Un seul scanneur |',
    '## Erreurs fréquentes',
    '- Comparer deux rapports sans noter la source (MDVM, capteur, partenaire).',
    '- Croire que le scanneur trouve des vulnérabilités réseau.',
    '- Installer deux scanneurs tiers.',
  ),
  demo: { title: 'Quelle source s’affiche', body: md(
    'Trois machines **fictives** avec l’analyse sans agent activée :',
    '```text',
    'M1 : aucune solution                      -> analyse sans agent (MDVM)',
    'M2 : agent Defender for Endpoint + sans agent -> résultats de l’agent (plus frais)',
    'M3 : Qualys actif, rapporte correctement  -> résultats du partenaire',
    '```',
    '**Lecture commentée.** Le même parc affiche trois sources. Un rapport honnête indique la source par machine.',
    '**Ce que la démo ne prouve pas.** Aucun environnement réel.') },
  revision: md('## Fiche : vulnérabilités machines', '- Sans agent : Servers P2. Capteur : P1 ou P2. BYOL : sans plan.', '- Un seul scanneur BYOL.', '- Machine avec agent et sans agent : résultats de l’agent.', '- Pas de vulnérabilités réseau.', '- Noter la source dans les rapports.'),
  links: ['va-machines', 'va-byol', 'servers-faq', 'mde-integration', 'faq-general'], teaches: ['vulnerabilites', 'mdvm', 'byol', 'hybride'],
});

const l3 = lesson(3, {
  title: 'Vulnérabilités des conteneurs : registres, exécution et lecture des résultats', minutes: 50,
  summary: 'Distinguer l’analyse des images de registre et des conteneurs en exécution, interroger les résultats et gérer les cas particuliers.',
  objectives: ['Énoncer les registres pris en charge et ceux qui ne le sont pas.', 'Expliquer l’analyse des conteneurs en exécution.', 'Interroger les résultats par Resource Graph ou API.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Deux angles',
    'Defender for Containers analyse les **images de registre** (Azure Container Registry, Amazon ECR, Google Artifact Registry et Container Registry, et des registres externes pris en charge) ainsi que les systèmes d’exploitation et logiciels des **nœuds de cluster**. À cela s’ajoute l’analyse des **conteneurs en exécution**, quel que soit leur registre d’origine : des instantanés des disques des machines sont pris toutes les 24 heures et les conteneurs du plan de données qui s’y trouvent sont évalués par MDVM. Les deux analyses alimentent le **graphe de sécurité** (contexte de risque, chemins d’attaque, chasse). Pour que l’analyse des conteneurs en exécution fonctionne, l’**analyse sans agent des machines** doit être activée, ce qui relie cette leçon à la première.',
    '## Ce qui n’est pas couvert',
    'Les images du **Microsoft Container Registry / Artifact Registry** et le registre intégré d’Azure Red Hat OpenShift ne sont pas pris en charge. L’ancien plan **Defender for container registries** est déprécié : il n’est plus disponible sur les abonnements où il n’était pas déjà activé, et Defender for Kubernetes l’est aussi. La migration vers **Defender for Containers** est la voie recommandée. Sur AWS, l’ancienne évaluation fondée sur Trivy est retirée; la migration crée de nouvelles recommandations de registre et d’exécution, et des ressources d’intégration de l’ancienne méthode (compartiment S3, grappe ECS, réseau) doivent être **supprimées manuellement**, ce qui est une opération d’écriture à planifier.',
    '## Pourquoi une alerte sur une image absente',
    'Des étiquettes réutilisées (par exemple `latest`) laissent l’ancienne image présente dans le registre par son condensé : elle peut encore être tirée et exposer ses vulnérabilités. Une alerte sur une image « absente » peut donc être légitime. Corriger consiste à reconstruire, à publier et à retirer l’ancienne image par condensé, pas seulement à déplacer l’étiquette.',
    '## Interroger les résultats',
    'Les résultats sont disponibles par l’**API REST des sous-évaluations** et par **Azure Resource Graph**. La requête suivante est une **lecture seule** à valider dans votre environnement; elle n’a pas été exécutée ici.',
    '```kusto',
    '// Lecture seule : sous-évaluations de vulnérabilités (Resource Graph). À valider avant usage.',
    'securityresources',
    '| where type == "microsoft.security/assessments/subassessments"',
    '| extend severity = tostring(properties.status.severity), nom = tostring(properties.displayName)',
    '| summarize total = count() by severity',
    '| order by total desc',
    '```',
    '## Erreurs fréquentes',
    '- Croire qu’un registre non pris en charge est analysé.',
    '- Réactiver un plan déprécié au lieu de migrer vers Defender for Containers.',
    '- Supprimer des ressources d’intégration AWS sans changement approuvé.',
  ),
  demo: { title: 'Priorité de correction d\'images', body: md(
    'Constat **fictif** : 120 images avec vulnérabilités, 18 en exécution.',
    '```text',
    'Étape 1 : filtrer sur les images en exécution (risque réel) -> 18',
    'Étape 2 : croiser avec exposition à Internet et chemins d’attaque -> 4',
    'Étape 3 : corriger en reconstruisant, retirer l’ancienne image par condensé',
    '```',
    '**Lecture commentée.** L’exécution et l’exposition ordonnent le travail, pas le total brut.',
    '**Ce que la démo ne prouve pas.** Chiffres inventés.') },
  revision: md('## Fiche : conteneurs', '- Registre : ACR, ECR, GAR, GCR, registres externes pris en charge.', '- Exécution : instantanés toutes les 24 heures, MDVM.', '- Pas de Microsoft Artifact Registry ni de registre intégré ARO.', '- Plans dépréciés : migrer vers Defender for Containers.', '- Résultats : API sous-évaluations et Resource Graph.'),
  links: ['va-containers', 'containers-faq', 'containers', 'agentless-concept', 'resource-graph'], teaches: ['conteneurs', 'registre', 'execution', 'resultats'],
});

const exercises = [
  MT('d09-g1', 'guided', 'comprendre', c1, 'Sans agent', 'Associez chaque élément à son rôle.', [['Instantané de disque', 'Source d’analyse hors bande'], ['Même région', 'Pas de transfert hors région'], ['Métadonnées', 'Seules données qui sortent']], 'Chaque élément a un rôle précis.'),
  WF('d09-a1', 'autonomous', 'verifier', c1, 'Dépanner un résultat manquant', 'Ordonnez le diagnostic.', ['Vérifier le plan et l’option sans agent', 'Vérifier que la machine est en marche à l’analyse', 'Vérifier les limites de disques', 'Vérifier les exclusions par étiquette', 'Attendre jusqu’à 24 heures après correction'], [['Réinstaller un agent', 'Hors sujet pour l’analyse sans agent.']], 'On vérifie plan, état, limites, exclusions, puis on attend.'),
  Q('d09-q1a', 'quiz', 'comprendre', c1, 'Où va l’instantané', 'Où reste l’instantané analysé ?', ['Dans la même région que la machine.', 'Documenté.'], [['Dans une autre région.', 'Faux.'], ['Dans un autre nuage.', 'Faux.'], ['Il est conservé un an.', 'Faux.']], 'Même région, supprimé après analyse.'),
  Q('d09-q1b', 'quiz', 'verifier', c1, 'Machine arrêtée', 'Une machine arrêtée à l’heure de l’analyse est :', ['Non analysée pour ce cycle.', 'Résultats absents ou périmés.'], [['Analysée.', 'Faux.'], ['Supprimée.', 'Faux.'], ['Exemptée.', 'Faux.']], 'Elle n’est pas analysée.'),
  Q('d09-q1c', 'quiz', 'cout', c1, 'Coûts AWS', 'Quel coût peut apparaître chez AWS ?', ['Le stockage temporaire des instantanés.', 'Frais du fournisseur.'], [['Aucun.', 'Faux.'], ['Une licence Defender supplémentaire.', 'Faux.'], ['Des frais d’agent.', 'Faux.']], 'Le stockage des instantanés.'),

  MT('d09-g2', 'guided', 'comprendre', c2, 'Trois approches', 'Associez chaque approche à son plan.', [['Sans agent MDVM', 'Servers plan 2'], ['Capteur Defender for Endpoint', 'Servers plan 1 ou 2'], ['BYOL', 'Aucun plan payant requis']], 'Chaque approche a ses conditions.'),
  CF('d09-a2', 'autonomous', 'securiser', c2, 'Configurer l’évaluation', 'Paramétrez la stratégie de scanneur d’un parc.', [['Un seul scanneur BYOL', 'on', 'Plusieurs scanneurs tiers ne sont pas pris en charge.'], ['Noter la source des constats dans les rapports', 'on', 'Évite les comparaisons trompeuses.'], ['Présenter le scanneur intégré comme un scanneur réseau', 'off', 'Il ne trouve que les vulnérabilités de la machine.']], 'Un scanneur, source notée, limites honnêtes.'),
  Q('d09-q2a', 'quiz', 'comprendre', c2, 'Agent et sans agent', 'Une machine avec les deux méthodes affiche :', ['Les résultats de l’agent.', 'Meilleure fraîcheur.'], [['Ceux de l’analyse sans agent.', 'Faux.'], ['Aucun.', 'Faux.'], ['Les deux additionnés.', 'Faux.']], 'Résultats de l’agent.'),
  Q('d09-q2b', 'quiz', 'securiser', c2, 'Vulnérabilités réseau', 'Le scanneur intégré trouve-t-il des vulnérabilités réseau ?', ['Non, seulement celles de la machine.', 'Limite documentée.'], [['Oui.', 'Faux.'], ['Seulement sur AWS.', 'Faux.'], ['Seulement avec BYOL.', 'Faux.']], 'Seulement la machine.'),
  Q('d09-q2c', 'quiz', 'cout', c2, 'BYOL et plan', 'Faut-il un plan payant pour un scanneur BYOL ?', ['Non, aucun plan payant requis.', 'Documenté.'], [['Oui Servers P2.', 'Faux.'], ['Oui CSPM.', 'Faux.'], ['Oui Containers.', 'Faux.']], 'Aucun plan payant requis.'),

  MT('d09-g3', 'guided', 'comprendre', c3, 'Registres', 'Associez chaque registre à son statut.', [['Azure Container Registry', 'Pris en charge'], ['Microsoft Artifact Registry', 'Non pris en charge'], ['Registre intégré ARO', 'Non pris en charge']], 'Statuts documentés.'),
  IN('d09-a3', 'autonomous', 'verifier', c3, 'Relire une requête', 'Requête fictive : repérez les défauts.', 'kql', [['securityresources'], ['| where type == "microsoft.security/assessments/subassessments"'], ['| summarize total = count() by severity']], 'La requête lit les sous-évaluations par gravité.'),
  Q('d09-q3a', 'quiz', 'comprendre', c3, 'Conteneurs en exécution', 'À quel rythme les instantanés servent-ils à l’analyse des conteneurs en exécution ?', ['Toutes les 24 heures.', 'Documenté.'], [['Chaque minute.', 'Faux.'], ['Chaque mois.', 'Faux.'], ['Jamais.', 'Faux.']], 'Toutes les 24 heures.'),
  Q('d09-q3b', 'quiz', 'maintenir', c3, 'Plan déprécié', 'Que faire d’un plan déprécié comme Defender for container registries ?', ['Migrer vers Defender for Containers.', 'Voie recommandée.'], [['Le réactiver.', 'Impossible ailleurs.'], ['L’ignorer.', 'Pas de nouveautés.'], ['Le doubler.', 'Faux.']], 'Migrer.'),
  Q('d09-q3c', 'quiz', 'securiser', c3, 'Étiquette réutilisée', 'Pourquoi une alerte sur une image absente peut-elle être légitime ?', ['L’ancienne image reste tirable par son condensé.', 'Étiquette réutilisée.'], [['Le portail se trompe.', 'Pas nécessairement.'], ['Le registre est public.', 'Hors sujet.'], ['Elle est en cache local.', 'Hors sujet.']], 'Condensé encore tirable.'),

  Q('d09-ev1', 'eval', 'comprendre', c1, 'Plans sans agent', 'Quels plans activent l’analyse sans agent par défaut ?', ['Defender CSPM ou Defender for Servers plan 2.', 'Documenté.'], [['Servers P1.', 'Faux.'], ['Aucun.', 'Faux.'], ['Storage.', 'Faux.']], 'CSPM ou Servers P2.'),
  M('d09-ev2', 'eval', 'verifier', c1, 'Causes de résultats manquants', 'Cochez les causes possibles d’un résultat manquant.', [['Machine arrêtée à l’analyse.', 'Oui.'], ['Plus de 14 disques.', 'Oui.'], ['Politique d’organisation GCP bloquante.', 'Oui.']], [['Le portail est en français.', 'Faux.']], 'Trois causes documentées.'),
  FX('d09-ev3', 'eval', 'securiser', c1, 'Fiche d\'exclusion', 'Corrigez la fiche fictive.', { etiquette: 'x', motif: '', revue: 'jamais', proprietaire: '' }, { etiquette: 'analyse=exclue', motif: 'appliance tierce, compensation par EDR', revue: 'trimestrielle', proprietaire: 'équipe sécurité' }, [['etiquette', 'analyse=exclue', 'Étiquette explicite.', 'maintenir'], ['motif', 'appliance tierce, compensation par EDR', 'Motif et compensation.', 'securiser'], ['revue', 'trimestrielle', 'Revue périodique.', 'maintenir'], ['proprietaire', 'équipe sécurité', 'Propriétaire nommé.', 'maintenir']], 'Une exclusion a étiquette, motif, revue et propriétaire.'),
  OR('d09-ev4', 'eval', 'fonctionner', c2, 'Choisir le scanneur', 'Ordonnez le choix d’une approche d’analyse.', ['Inventorier les machines et leurs agents', 'Vérifier les plans et licences existants', 'Choisir l’approche par segment', 'Activer et vérifier la source affichée', 'Mesurer la couverture'], 'Inventaire, licences, choix, vérification, mesure.'),
  CF('d09-ev5', 'eval', 'cout', c1, 'Coûts d\'analyse', 'Paramétrez le suivi des coûts AWS.', [['Activer la balise CreatedBy dans la facturation', 'on', 'Permet de suivre les instantanés.'], ['Ignorer les instantanés non supprimés', 'off', 'Ils continuent de coûter.']], 'On suit la balise et on surveille les instantanés.'),
  WF('d09-ev6', 'eval', 'maintenir', c3, 'Migrer un plan déprécié', 'Ordonnez la migration vers Defender for Containers.', ['Inventorier les abonnements concernés', 'Évaluer les coûts de Defender for Containers', 'Planifier le changement', 'Activer le plan', 'Vérifier les recommandations de registre et d’exécution'], [['Réactiver l’ancien plan', 'Plus disponible sur les nouveaux abonnements.']], 'Inventaire, coût, planification, activation, vérification.'),
  SH('d09-ev7', 'eval', 'verifier', c3, 'Rythme des instantanés', 'Toutes les combien d’heures les instantanés servent-ils à l’analyse des conteneurs en exécution ? (nombre)', ['24'], 'Toutes les vingt-quatre heures.', 24),
  Q('d09-ev8', 'eval', 'cout', c2, 'BYOL et coûts', 'Quel est un avantage du scanneur BYOL ?', ['Il ne demande aucun plan payant dans Defender for Cloud.', 'Mais une licence tierce.'], [['Il est gratuit.', 'Licence tierce.'], ['Il trouve le réseau.', 'Non précisé.'], ['Il remplace le plan 2.', 'Faux.']], 'Pas de plan payant requis.'),

  IN('d09-cs1', 'case', 'verifier', c2, 'Cas : rapport de vulnérabilités chez Nordlys', 'Rapport fictif : repérez les affirmations à corriger.', 'text', [['« Aucune vulnérabilité réseau détectée. »', 'Le scanneur intégré ne couvre pas le réseau', 'Garder tel quel'], ['« 0 vulnérabilité sur la machine M7. »', 'Vérifier que M7 était en marche à l’analyse', 'Garder tel quel'], ['« Source : Defender. »', 'Préciser MDVM, capteur ou partenaire', 'Garder tel quel']], 'Chaque affirmation est corrigée.'),
  MT('d09-cs2', 'case', 'fonctionner', c3, 'Cas : conteneurs', 'Associez chaque besoin à la capacité.', [['Images du registre ECR', 'Analyse des images de registre'], ['Conteneurs hors registre pris en charge', 'Analyse des conteneurs en exécution'], ['Nœuds de cluster', 'Analyse des nœuds']], 'Chaque besoin a sa capacité.'),
  WF('d09-cs3', 'case', 'securiser', c1, 'Cas : GCP sans résultat', 'Ordonnez le dépannage d’un projet GCP sans résultats.', ['Confirmer que le projet est connecté', 'Confirmer que l’option sans agent est active', 'Exécuter le script d’intégration courant', 'Vérifier la politique d’organisation sur disques et instantanés', 'Attendre un cycle de 24 heures'], [['Désactiver la politique d’organisation entière', 'Excessif.']], 'Connexion, option, script, politique, attente.'),
  OP('d09-cs-open', 'case', 'verifier', c2, 'Cas : stratégie d\'analyse de Nordlys', 'Rédigez la stratégie d’analyse des vulnérabilités d’une organisation fictive.', 'Une page : approches par segment, couverture, exclusions, sources, limites, coûts.', [['Les approches suivent plans et licences.', 'comprendre'], ['Les exclusions sont justifiées.', 'securiser'], ['Les limites sont énoncées.', 'verifier'], ['Les coûts sont estimés.', 'cout']], 'La stratégie relie approches, couverture, limites et coûts.'),

  Q('d09-rm1', 'remediation', 'comprendre', c1, 'Remédiation : instantanés', 'Les instantanés restent-ils dans la région de la machine ?', ['Oui.', 'Documenté.'], [['Non.', 'Faux.'], ['Parfois.', 'Faux.'], ['Seulement Azure.', 'Faux.']], 'Oui.'),
  Q('d09-rm2', 'remediation', 'securiser', c2, 'Remédiation : réseau', 'Le scanneur intégré couvre-t-il le réseau ?', ['Non.', 'Machine seulement.'], [['Oui.', 'Faux.'], ['Si Servers P2.', 'Faux.'], ['Si BYOL.', 'Faux.']], 'Non.'),
  Q('d09-rm3', 'remediation', 'maintenir', c3, 'Remédiation : plan déprécié', 'Vers quoi migrer depuis Defender for container registries ?', ['Defender for Containers.', 'Recommandé.'], [['Defender for Storage.', 'Faux.'], ['Defender for DNS.', 'Faux.'], ['Rien.', 'Faux.']], 'Defender for Containers.'),
];

const competencies = comps([
  ['Comprendre l’analyse sans agent', 'Instantanés, couverture, exclusions.', ['Je décris le mécanisme.', 'Je cite les limites de couverture.', 'Je documente les exclusions.']],
  ['Choisir l’évaluation de vulnérabilités', 'MDVM, capteur, BYOL.', ['Je distingue les trois approches.', 'Je prédis la source affichée.', 'Je note les limites.']],
  ['Analyser les conteneurs', 'Registre et exécution.', ['Je connais les registres pris en charge.', 'Je migre les plans dépréciés.', 'J’interroge les résultats.']],
]);

const projects = [
  P(1, 'débutant', 'Tableau de couverture sans agent', 'Concevoir un tableau de couverture des machines selon leur état et leurs limites.', 'Tableau machine, état, disques, étiquette.', ['Lister les machines.', 'Noter les limites.', 'Repérer les exclusions.'], ['Chaque écart a une cause.'], ['Machines arrêtées oubliées.'], ['Ajouter AWS et GCP.']),
  P(2, 'intermédiaire', 'Rapport de vulnérabilités avec sources', 'Concevoir un rapport qui indique la source de chaque constat.', 'Rapport avec colonne source.', ['Définir les sources.', 'Définir les colonnes.', 'Rédiger les limites.'], ['La source est notée partout.'], ['Comparer des sources différentes.'], ['Ajouter une requête Resource Graph.'],
    { connected: { accounts: 'Un abonnement Azure de test avec Defender CSPM en essai si approuvé.', permissions: 'Security Reader pour lire ; aucune écriture.', costs: 'Defender CSPM est payant : ne pas l’activer sans estimation et approbation.', secrets: 'Aucun secret.', cleanup: 'Aucune ressource créée en lecture seule.', limits: 'Lecture des recommandations de vulnérabilités. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Plan de migration d\'un plan déprécié', 'Concevoir la migration vers Defender for Containers avec chiffrage et retour arrière.', 'Plan de migration par abonnement.', ['Inventorier.', 'Chiffrer.', 'Planifier.', 'Prévoir le retour arrière.'], ['La migration est approuvée et chiffrée.'], ['Perte de couverture.'], ['Ajouter le nettoyage AWS.']),
];

export const d09 = assemble({ id: 'd09', level: 2, n: 9, title: 'Évaluation des vulnérabilités et approches sans agent',
  summary: 'Analyse par instantanés, couverture et limites, MDVM, capteur et licence tierce, vulnérabilités des conteneurs en registre et en exécution, et lecture des résultats.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Piloter l’analyse des vulnérabilités chez Nordlys Technologies',
  caseScenario: 'Vous dépannez un résultat manquant, choisissez un scanneur et priorisez des images. Données simulées.', caseMinutes: 50 });
