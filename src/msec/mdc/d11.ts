// Module 11 : Defender for Containers (niveau 3).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, SH, OP, comps, P, assemble } = dsl('d11');
const c1 = { comp: 'd11-c1', lesson: 'd11-l1', tags: ['architecture', 'capteur', 'arc', 'sortant'] };
const c2 = { comp: 'd11-c2', lesson: 'd11-l2', tags: ['execution', 'detections', 'limites'] };
const c3 = { comp: 'd11-c3', lesson: 'd11-l3', tags: ['admission', 'gating', 'policy-kubernetes'] };

const l1 = lesson(1, {
  title: 'Architecture de Defender for Containers : composants et prérequis par environnement', minutes: 50,
  summary: 'Comprendre le capteur, Azure Policy pour Kubernetes, la découverte sans agent et les différences entre AKS, EKS, GKE et Arc.',
  objectives: ['Décrire les composants (capteur, politique, découverte sans agent, registre).', 'Énoncer les prérequis réseau et de rôles.', 'Distinguer AKS des clusters connectés par Azure Arc.'],
  prerequisites: ['Module 4 : déploiement et couverture', 'Module 9 : approches sans agent'],
  body: md(
    '## Les composants',
    'Pour une protection complète, Defender for Containers combine quatre éléments. Le **capteur Defender** est un DaemonSet léger sur chaque nœud qui collecte la télémétrie d’exécution (événements Kubernetes, processus, réseau) avec la technologie **eBPF**; sur AKS il se déploie comme profil de sécurité intégré au fournisseur de ressources AKS, ailleurs comme extension Azure Arc. **Azure Policy pour Kubernetes** est un pod fondé sur **Gatekeeper v3** qui s’enregistre comme webhook du contrôle d’admission et permet d’appliquer des règles de configuration à grande échelle. La **découverte sans agent** donne la visibilité sur les clusters, leur configuration et leurs déploiements par des API. Enfin, l’**intégration aux registres** (ACR, ECR, GAR, GCR) fournit l’analyse des images (module 9). Les journaux d’audit Kubernetes sont collectés nativement sur AKS, par un collecteur sans agent sur GKE.',
    '## Différences par environnement',
    'Sur **AKS**, tout passe par l’infrastructure Azure; sur **EKS, GKE et Kubernetes quelconque**, les clusters doivent être connectés par **Azure Arc** et les composants sont des extensions Arc (`microsoft.azuredefender.kubernetes` pour le capteur, `Microsoft.PolicyInsights` pour la politique). Pour la découverte sans agent sur AKS, Defender crée une identité qui reçoit le rôle intégré **Kubernetes Agentless Operator** sur l’abonnement, avec les droits de lecture et d’**accès approuvé AKS** (trusted access), puis lie un `ClusterRole` en lecture dans le plan de données. Sur GKE, un compte de service `mdc-containers-k8s-operator` reçoit un rôle personnalisé qui inclut `container.clusters.update` : une permission d’écriture à connaître avant d’approuver l’intégration.',
    '## Prérequis et réseau',
    'Il faut le plan Defender for Containers activé, la version 2.40.0 ou plus de l’interface Azure CLI, un rôle **Contributor** ou **Security Admin** pour déployer, un **émetteur OIDC** activé sur le cluster et un cluster pris en charge. Tous les composants n’utilisent que des connexions **sortantes** (aucune entrante). Le capteur doit joindre `*.cloud.defender.microsoft.com` sur le port 443; les domaines `*.ods.opinsights.azure.com` et `*.oms.opinsights.azure.com` ne sont plus requis. Pour un cluster à sortie restreinte, il faut autoriser les noms de domaine décrits dans la documentation AKS; des proxys et la connectivité privée sont pris en charge. Les limites de ressources du capteur ne sont pas configurables (environ 360 m de processeur et 296 Mi de mémoire pour le pod collecteur de nœud). Activer le capteur déclenche une **réconciliation** du cluster : comportement attendu, à planifier.',
    '```bash',
    '# ÉCRITURE (modifie le cluster) : déploie le capteur sur un cluster AKS de laboratoire. Non exécuté dans ce cours.',
    '# Rôle : Contributor ou Security Admin. Impact : réconciliation du cluster. Retour arrière : az aks update --disable-defender',
    'az aks update --resource-group <rg> --name <cluster> --enable-defender',
    '```',
    '| Environnement | Capteur | Politique | Prérequis clé |',
    '| --- | --- | --- | --- |',
    '| AKS | Profil de sécurité | Module complémentaire | OIDC, plan activé |',
    '| EKS, GKE, Arc | Extension Arc | Extension Arc | Cluster connecté à Azure Arc |',
    '## Erreurs fréquentes',
    '- Croire qu’un cluster EKS est protégé sans Azure Arc.',
    '- Bloquer la sortie vers le domaine du service et conclure que le capteur est « en erreur ».',
    '- Approuver le rôle GKE sans noter la permission d’écriture.',
  ),
  demo: { title: 'Vérifier le déploiement', body: md(
    'Constat **fictif** : un cluster EKS apparaît « sans capteur » trois jours après l’activation.',
    '```text',
    'Question 1 : le cluster est-il connecté à Azure Arc ?              -> non',
    'Question 2 : le connecteur AWS active-t-il Defender for Containers ? -> oui',
    'Question 3 : sortie 443 vers *.cloud.defender.microsoft.com ?        -> oui',
    '```',
    '**Lecture commentée.** Sans Azure Arc, aucune extension ne se déploie : on connecte le cluster à Arc.',
    '**Ce que la démo ne prouve pas.** Scénario inventé.') },
  revision: md('## Fiche : architecture', '- Capteur eBPF, politique Gatekeeper, découverte sans agent, registres.', '- AKS natif; EKS, GKE, autres via Azure Arc.', '- Sortie 443 vers le service; aucune entrée.', '- OIDC, Azure CLI 2.40+, Contributor ou Security Admin.', '- Réconciliation du cluster à l’activation.'),
  links: ['containers', 'containers-arch', 'containers-deploy-cli', 'containers-matrix', 'k8s-workload'], teaches: ['architecture', 'capteur', 'arc', 'sortant'],
});

const l2 = lesson(2, {
  title: 'Protection à l’exécution : détections, sources et limites de prise en charge', minutes: 50,
  summary: 'Lister les détections d’exécution, leur mode d’activation et les environnements qui ne sont pas couverts.',
  objectives: ['Distinguer détections du plan de contrôle et détections de charge.', 'Associer chaque détection à son mode d’activation.', 'Énoncer les clusters non pris en charge.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Catalogue des détections d’exécution',
    'Le tableau de prise en charge distingue plusieurs détections. La **détection du plan de contrôle** analyse la piste d’audit Kubernetes pour repérer les activités suspectes, et s’active avec le plan (disponible aussi pour EKS et GKE). La **détection de charge de travail** surveille les conteneurs en cours d’exécution et alerte sur les comportements suspects : elle exige le **capteur Defender**. La **détection de dérive binaire** repère un binaire exécuté qui ne provient pas de l’image du conteneur, et peut le bloquer. L’**antimaliciel** et la **détection DNS** exigent le capteur déployé par **Helm** sur les environnements concernés. La **détection de maliciel sur les nœuds** passe par l’**analyse sans agent des machines** (plan Containers ou Servers plan 2). L’exposition de services (par exemple un service de type `LoadBalancer`) est aussi détectée.',
    '## Intégration XDR',
    'Les alertes et incidents des clusters sont visibles dans Microsoft XDR et la chasse avancée y est possible avec le capteur. Les **actions de réponse** dans XDR (par exemple restreindre l’accès d’un pod) sont en **préversion** et exigent le capteur et l’API d’accès Kubernetes : ne les présentez pas comme disponibles généralement. Nous reprendrons le travail d’investigation aux modules 21 et 22.',
    '## Limites de prise en charge',
    'Des configurations ne sont pas prises en charge pour la protection à l’exécution : les **clusters privés EKS**, les **clusters réseau privé GKE** et **GKE Autopilot**, par exemple. Toute distribution Kubernetes certifiée CNCF devrait fonctionner par Azure Arc, mais seules les distributions listées sont testées par Microsoft. Les statuts (disponibilité générale ou préversion) varient selon Linux et Windows, et ils changent : relisez le tableau à la date de mise en œuvre et consignez la date de consultation. Un cluster non pris en charge n’est pas « sans risque » : c’est un angle mort à documenter.',
    '| Détection | Mode d’activation | Remarque |',
    '| --- | --- | --- |',
    '| Plan de contrôle | Avec le plan | Journaux d’audit |',
    '| Charge de travail | Capteur Defender | Linux surtout |',
    '| Dérive binaire | Capteur Defender | Détecte et peut bloquer |',
    '| Antimaliciel, DNS | Capteur via Helm | Selon l’environnement |',
    '| Maliciel sur les nœuds | Analyse sans agent des machines | Plan Containers ou Servers P2 |',
    '| Actions de réponse XDR | Capteur et API Kubernetes | Préversion |',
    '```text',
    'Registre des limites (exemple fictif)',
    'Cluster eks-prod-priv : privé, non pris en charge pour l’exécution; compensation : journaux d’audit AWS vers Sentinel',
    'Date de consultation du tableau : 2026-10-25; prochaine revue : trimestrielle',
    '```',
    '## Erreurs fréquentes',
    '- Compter sur une détection d’exécution sur un cluster privé EKS.',
    '- Présenter les actions de réponse XDR comme disponibles généralement.',
    '- Oublier l’analyse sans agent pour la détection de maliciel sur les nœuds.',
  ),
  demo: { title: 'Quelle détection pour quel risque', body: md(
    'Risques **fictifs** :',
    '```text',
    'Binaire téléchargé et exécuté dans un conteneur  -> détection de dérive binaire (capteur)',
    'Création suspecte de rôle dans le cluster        -> détection du plan de contrôle (journaux d’audit)',
    'Requêtes DNS vers un domaine malveillant         -> détection DNS (capteur via Helm)',
    'Maliciel sur le disque d’un nœud                 -> analyse sans agent des machines',
    '```',
    '**Lecture commentée.** Chaque risque dépend d’une source de données différente.',
    '**Ce que la démo ne prouve pas.** Aucune détection déclenchée.') },
  revision: md('## Fiche : exécution', '- Plan de contrôle : journaux d’audit, avec le plan.', '- Charge, dérive, antimaliciel, DNS : capteur (Helm selon le cas).', '- Maliciel sur les nœuds : analyse sans agent.', '- Non pris en charge : EKS privé, GKE réseau privé, Autopilot.', '- Réponse XDR : préversion.'),
  links: ['containers-matrix', 'containers-arch', 'containers', 'xdr-integration'], teaches: ['execution', 'detections', 'limites'],
});

const l3 = lesson(3, {
  title: 'Contrôle d’admission : déploiement contrôlé et politiques Kubernetes', minutes: 50,
  summary: 'Utiliser le déploiement contrôlé fondé sur les vulnérabilités et Azure Policy pour Kubernetes sans interrompre la production.',
  objectives: ['Énoncer les prérequis du déploiement contrôlé.', 'Choisir entre audit et refus et tester avant d’appliquer.', 'Dépanner une règle qui ne se déclenche pas.'],
  prerequisites: ['Leçons 1 et 2', 'Module 9'],
  body: md(
    '## Principe du déploiement contrôlé',
    'Le **déploiement contrôlé** (gated deployment) utilise un contrôleur d’admission pour évaluer les images **avant** qu’elles entrent dans le cluster. Il s’appuie sur les résultats d’analyse de vulnérabilités des registres pris en charge pour **auditer** ou **refuser** les déploiements dont les images ne respectent pas la politique de vulnérabilités de l’organisation. Prérequis : le plan Defender for Containers avec les composants **capteur Defender avec Security Gating** et **Registry access avec Security findings**, un émetteur **OIDC** sur AKS, un environnement et un registre pris en charge, des résultats d’analyse disponibles pour l’image, et le rôle **Security Admin** (ou plus) pour créer des règles; **Security Reader** suffit pour les consulter. Des conditions plus fines, comme une version Kubernetes 1.31 ou plus, sont documentées dans le dépannage.',
    '## Audit avant refus',
    'Une règle en mode **refus** peut bloquer un déploiement légitime, y compris un correctif urgent. La démarche sûre : créer la règle en **audit**, observer les images touchées pendant un cycle de livraison complet, corriger les causes (images obsolètes, résultats manquants), puis passer au refus sur un espace de noms pilote avant d’étendre. Prévoyez une **procédure de contournement** documentée (exception limitée dans le temps) et la propriété de la règle.',
    '## Quand la règle ne se déclenche pas',
    'Les causes documentées : la portée de la règle ne correspond pas à la ressource déployée; aucune vulnérabilité ne correspond aux conditions; l’image est déployée avant la fin de l’analyse (une image d’un registre pris en charge est analysée **quelques heures après** le dépôt initial); l’artefact des constats n’est pas disponible pour l’image; les extensions du plan sont désactivées dans la portée du registre. Une image non analysée n’est **pas** contrôlée : la règle n’est pas une preuve d’innocuité.',
    '## Azure Policy pour Kubernetes',
    'Le même mécanisme d’admission applique des règles de configuration (conteneurs privilégiés, images de registres approuvés, etc.) : les recommandations de durcissement du plan de données viennent de là. Comme pour toute politique en mode refus, testez en audit, versionnez les paramètres et limitez la portée.',
    '```text',
    'Plan de déploiement de la règle (exemple fictif)',
    'Semaine 1-2 : règle en audit sur tous les espaces de noms; mesurer les images touchées',
    'Semaine 3   : correction des images obsolètes; vérifier la disponibilité des résultats d’analyse',
    'Semaine 4   : refus sur l’espace de noms pilote; contournement documenté (7 jours, approbation)',
    'Ensuite     : extension par vagues; revue mensuelle des exceptions',
    '```',
    '## Erreurs fréquentes',
    '- Activer le refus sans période d’audit.',
    '- Supposer qu’une image non analysée est conforme.',
    '- Ne prévoir aucune procédure de contournement.',
  ),
  demo: { title: 'Une règle muette', body: md(
    'Constat **fictif** : une image avec une vulnérabilité critique passe sans alerte.',
    '```text',
    'Question 1 : la portée de la règle couvre-t-elle l’espace de noms ?   -> oui',
    'Question 2 : l’image a-t-elle des résultats d’analyse ?              -> non, déployée 20 minutes après le dépôt',
    'Question 3 : registre pris en charge avec Security findings activé ? -> oui',
    '```',
    '**Lecture commentée.** L’image a été déployée avant la fin de l’analyse. On ajoute une étape de pipeline qui attend les résultats.',
    '**Ce que la démo ne prouve pas.** Scénario inventé.') },
  revision: md('## Fiche : admission', '- Capteur avec Security Gating et Registry access avec Security findings.', '- Security Admin pour créer, Security Reader pour lire.', '- Audit d’abord, refus ensuite, contournement documenté.', '- Image non analysée : non contrôlée.', '- Analyse quelques heures après le dépôt.'),
  links: ['containers-gated', 'containers-gated-trouble', 'k8s-workload', 'va-containers'], teaches: ['admission', 'gating', 'policy-kubernetes'],
});

const exercises = [
  MT('d11-g1', 'guided', 'comprendre', c1, 'Composants', 'Associez chaque composant à son rôle.', [['Capteur Defender', 'Télémétrie d’exécution par eBPF'], ['Azure Policy pour Kubernetes', 'Contrôle d’admission fondé sur Gatekeeper'], ['Découverte sans agent', 'Visibilité des clusters par API'], ['Intégration aux registres', 'Analyse des images']], 'Chaque composant a un rôle précis.'),
  WF('d11-a1', 'autonomous', 'fonctionner', c1, 'Déployer sur un cluster', 'Ordonnez le déploiement sur un cluster AKS de laboratoire.', ['Vérifier le plan et les prérequis (OIDC, rôle)', 'Vérifier si le capteur est déjà déployé', 'Autoriser la sortie 443 vers le service', 'Déployer le capteur', 'Vérifier le déploiement et la réconciliation'], [['Déployer sans vérifier', 'Risque de doublon.']], 'Vérifier, autoriser, déployer, confirmer.'),
  Q('d11-q1a', 'quiz', 'comprendre', c1, 'Technologie du capteur', 'Quelle technologie le capteur utilise-t-il ?', ['eBPF.', 'Documenté.'], [['Un agent kernel propriétaire.', 'Faux.'], ['Syslog.', 'Faux.'], ['SNMP.', 'Faux.']], 'eBPF.'),
  Q('d11-q1b', 'quiz', 'fonctionner', c1, 'EKS', 'Que faut-il pour protéger un cluster EKS ?', ['Le connecter à Azure Arc.', 'Extensions Arc.'], [['Rien.', 'Faux.'], ['Un VPN.', 'Faux.'], ['Un plan Storage.', 'Faux.']], 'Azure Arc.'),
  Q('d11-q1c', 'quiz', 'securiser', c1, 'Connexions', 'Quel type de connexions les composants utilisent-ils ?', ['Sortantes seulement.', 'Aucune entrante.'], [['Entrantes.', 'Faux.'], ['Les deux.', 'Faux.'], ['Aucune.', 'Faux.']], 'Sortantes.'),

  MT('d11-g2', 'guided', 'comprendre', c2, 'Détections', 'Associez chaque détection à sa source.', [['Plan de contrôle', 'Journaux d’audit Kubernetes'], ['Charge de travail', 'Capteur Defender'], ['Maliciel sur les nœuds', 'Analyse sans agent des machines']], 'Chaque détection dépend d’une source.'),
  IN('d11-a2', 'autonomous', 'verifier', c2, 'Registre des limites', 'Registre fictif : repérez les défauts.', 'text', [['« Cluster privé EKS : couvert à l’exécution. »', 'Non pris en charge : documenter la compensation', 'Garder tel quel'], ['« Actions de réponse XDR : disponibles. »', 'En préversion', 'Garder tel quel'], ['« Date de consultation : inconnue. »', 'Consigner la date', 'Garder tel quel']], 'Chaque ligne est corrigée.'),
  Q('d11-q2a', 'quiz', 'securiser', c2, 'Cluster privé', 'Un cluster privé EKS est-il pris en charge pour la protection à l’exécution ?', ['Non.', 'Limite documentée.'], [['Oui.', 'Faux.'], ['Si Arc.', 'Faux.'], ['Si Helm.', 'Faux.']], 'Non.'),
  Q('d11-q2b', 'quiz', 'comprendre', c2, 'Dérive binaire', 'Que détecte la dérive binaire ?', ['Un binaire exécuté qui ne vient pas de l’image.', 'Documenté.'], [['Un certificat expiré.', 'Faux.'], ['Une règle NSG.', 'Faux.'], ['Un secret.', 'Faux.']], 'Un binaire hors image.'),
  Q('d11-q2c', 'quiz', 'verifier', c2, 'Réponse XDR', 'Quel est le statut des actions de réponse XDR ?', ['Préversion.', 'Ne pas promettre.'], [['Disponibilité générale.', 'Faux.'], ['Retirées.', 'Faux.'], ['Facturées seulement.', 'Faux.']], 'Préversion.'),

  MT('d11-g3', 'guided', 'comprendre', c3, 'Déploiement contrôlé', 'Associez chaque exigence à sa raison.', [['Security Gating', 'Active le contrôle d’admission'], ['Security findings', 'Fournit les résultats de vulnérabilités'], ['OIDC', 'Authentification du cluster AKS']], 'Chaque exigence a une raison.'),
  CF('d11-a3', 'autonomous', 'securiser', c3, 'Règle de déploiement', 'Paramétrez le lancement de la règle.', [['Commencer en mode audit', 'on', 'Mesure l’impact sans bloquer.'], ['Refus immédiat sur tous les espaces de noms', 'off', 'Risque d’interruption.'], ['Procédure de contournement documentée', 'on', 'Permet un correctif urgent.']], 'Audit d’abord, contournement prévu.'),
  Q('d11-q3a', 'quiz', 'securiser', c3, 'Image non analysée', 'Une image non analysée est-elle contrôlée par la règle ?', ['Non.', 'Pas de résultats, pas de contrôle.'], [['Oui.', 'Faux.'], ['Seulement en refus.', 'Faux.'], ['Seulement Linux.', 'Faux.']], 'Non.'),
  Q('d11-q3b', 'quiz', 'maintenir', c3, 'Rôle de création', 'Quel rôle minimum pour créer une règle ?', ['Security Admin.', 'Security Reader consulte.'], [['Reader.', 'Faux.'], ['Security Reader.', 'Consultation.'], ['Aucun.', 'Faux.']], 'Security Admin.'),
  Q('d11-q3c', 'quiz', 'verifier', c3, 'Délai d\'analyse', 'Quand une image d\'un registre pris en charge est-elle analysée ?', ['Quelques heures après le dépôt.', 'Documenté.'], [['Instantanément.', 'Faux.'], ['Jamais.', 'Faux.'], ['Chaque mois.', 'Faux.']], 'Quelques heures.'),

  Q('d11-ev1', 'eval', 'comprendre', c1, 'Port de sortie', 'Quel port le capteur utilise-t-il vers le service ?', ['443.', 'HTTPS.'], [['22.', 'Faux.'], ['80.', 'Faux.'], ['3389.', 'Faux.']], '443.'),
  M('d11-ev2', 'eval', 'verifier', c3, 'Causes d\'une règle muette', 'Cochez les causes possibles.', [['Portée non correspondante.', 'Oui.'], ['Image déployée avant l’analyse.', 'Oui.'], ['Extensions du plan désactivées.', 'Oui.']], [['Le portail est en français.', 'Faux.']], 'Trois causes documentées.'),
  FX('d11-ev3', 'eval', 'securiser', c3, 'Corriger un plan de règle', 'Corrigez le plan fictif.', { mode: 'refus', portee: 'tous', contournement: '', revue: '' }, { mode: 'audit puis refus par vagues', portee: 'espace de noms pilote', contournement: '7 jours, avec approbation', revue: 'mensuelle' }, [['mode', 'audit puis refus par vagues', 'Audit d’abord.', 'securiser'], ['portee', 'espace de noms pilote', 'Commencer petit.', 'securiser'], ['contournement', '7 jours, avec approbation', 'Contournement borné.', 'maintenir'], ['revue', 'mensuelle', 'Revue des exceptions.', 'maintenir']], 'Audit, pilote, contournement et revue.'),
  OR('d11-ev4', 'eval', 'fonctionner', c3, 'Activer le contrôle', 'Ordonnez l’activation du déploiement contrôlé.', ['Vérifier le plan, le capteur et Registry access', 'Vérifier les résultats d’analyse', 'Créer la règle en audit', 'Observer un cycle', 'Passer en refus sur un pilote'], 'Prérequis, résultats, audit, observation, refus pilote.'),
  CF('d11-ev5', 'eval', 'cout', c1, 'Ressources du capteur', 'Paramétrez la planification des ressources.', [['Prévoir environ 360 m de processeur et 296 Mi par nœud pour le collecteur', 'on', 'Les limites ne sont pas configurables.'], ['Compter sur des limites personnalisées', 'off', 'Non configurables.']], 'On planifie les ressources fixes.'),
  WF('d11-ev6', 'eval', 'maintenir', c2, 'Revue des limites', 'Ordonnez la revue trimestrielle des limites.', ['Relire le tableau de prise en charge', 'Comparer aux clusters', 'Mettre à jour le registre des limites', 'Définir les compensations', 'Dater la consultation'], [['Ne rien dater', 'Perte de traçabilité.']], 'Lire, comparer, mettre à jour, compenser, dater.'),
  SH('d11-ev7', 'eval', 'verifier', c1, 'Version d\'Azure CLI', 'Quelle version majeure minimale de la CLI Azure est requise (2.x, donner x) ? (nombre)', ['40'], 'La version 2.40.0.', 40),
  Q('d11-ev8', 'eval', 'comprendre', c2, 'Antimaliciel', 'Comment l\'antimaliciel conteneurs s\'active-t-il ?', ['Par le capteur déployé via Helm.', 'Selon l’environnement.'], [['Avec le plan seulement.', 'Faux.'], ['Par NSG.', 'Faux.'], ['Par Entra ID.', 'Faux.']], 'Capteur via Helm.'),

  IN('d11-cs1', 'case', 'securiser', c3, 'Cas : politique de déploiement de Nordlys', 'Politique fictive : repérez les défauts.', 'text', [['« Refus immédiat partout dès demain. »', 'Audit d’abord, vagues', 'Garder tel quel'], ['« Aucun contournement. »', 'Prévoir un contournement borné', 'Garder tel quel']], 'Chaque défaut est corrigé.'),
  MT('d11-cs2', 'case', 'fonctionner', c1, 'Cas : environnements', 'Associez chaque environnement à son mode de déploiement.', [['AKS', 'Profil de sécurité natif'], ['EKS', 'Extension Azure Arc'], ['GKE', 'Extension Azure Arc']], 'Chaque environnement a son mode.'),
  WF('d11-cs3', 'case', 'maintenir', c2, 'Cas : cluster privé', 'Ordonnez le traitement d\'un cluster privé non pris en charge.', ['Confirmer l’absence de prise en charge', 'Documenter l’angle mort', 'Mettre en place une compensation', 'Planifier la revue', 'Informer le propriétaire'], [['L\'ignorer', 'Angle mort non documenté.']], 'Confirmer, documenter, compenser, planifier, informer.'),
  OP('d11-cs-open', 'case', 'verifier', c1, 'Cas : programme conteneurs de Nordlys', 'Rédigez le programme de protection des conteneurs d\'une organisation fictive.', 'Une page : environnements, composants, détections, limites, admission, revue.', [['Les environnements sont couverts.', 'comprendre'], ['Les limites sont documentées.', 'verifier'], ['L\'admission est déployée par vagues.', 'securiser'], ['La revue est planifiée.', 'maintenir']], 'Le programme relie composants, détections, limites et admission.'),

  Q('d11-rm1', 'remediation', 'comprendre', c1, 'Remédiation : EKS', 'EKS exige-t-il Azure Arc ?', ['Oui.', 'Extensions Arc.'], [['Non.', 'Faux.'], ['Parfois.', 'Faux.'], ['Seulement privé.', 'Faux.']], 'Oui.'),
  Q('d11-rm2', 'remediation', 'securiser', c2, 'Remédiation : dérive', 'Quelle détection repère un binaire hors image ?', ['La dérive binaire.', 'Capteur.'], [['DNS.', 'Faux.'], ['Plan de contrôle.', 'Faux.'], ['FIM.', 'Faux.']], 'Dérive binaire.'),
  Q('d11-rm3', 'remediation', 'securiser', c3, 'Remédiation : mode', 'Quel mode utiliser en premier ?', ['Audit.', 'Mesurer avant de bloquer.'], [['Refus.', 'Risqué.'], ['Aucun.', 'Faux.'], ['Les deux.', 'Faux.']], 'Audit.'),
];

const competencies = comps([
  ['Comprendre l’architecture conteneurs', 'Composants, Arc, réseau.', ['Je décris les composants.', 'Je connais les prérequis.', 'Je distingue AKS et Arc.']],
  ['Cartographier les détections d’exécution', 'Sources et limites.', ['J’associe détection et source.', 'Je documente les limites.', 'Je ne promets pas la préversion.']],
  ['Déployer l’admission en sécurité', 'Gating et politiques.', ['Je commence en audit.', 'Je prévois le contournement.', 'Je dépanne une règle muette.']],
]);

const projects = [
  P(1, 'débutant', 'Inventaire des clusters et de leur prise en charge', 'Dresser l\'inventaire des clusters avec environnement, Arc et prise en charge.', 'Tableau cluster, environnement, statut.', ['Lister les clusters.', 'Vérifier Arc.', 'Noter les limites.'], ['Chaque cluster a un statut.'], ['Clusters privés oubliés.'], ['Ajouter les coûts.']),
  P(2, 'intermédiaire', 'Déploiement du capteur sur un cluster de laboratoire', 'Concevoir le déploiement du capteur avec vérifications et retour arrière.', 'Plan de déploiement et de vérification.', ['Vérifier les prérequis.', 'Déployer.', 'Vérifier.', 'Retour arrière.'], ['Le capteur est vérifié.'], ['Sortie bloquée.'], ['Ajouter Helm.'],
    { connected: { accounts: 'Un abonnement Azure de test avec un petit cluster AKS de laboratoire.', permissions: 'Contributor limité au groupe de ressources du laboratoire.', costs: 'Defender for Containers est payant par nœud; le cluster AKS a un coût: estimer et approuver avant.', secrets: 'Aucun secret.', cleanup: 'Désactiver le capteur (az aks update --disable-defender) et supprimer le cluster et le groupe de ressources.', limits: 'Un seul cluster de laboratoire, aucune production. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Déploiement contrôlé par vagues', 'Concevoir le déploiement par vagues d\'une règle de déploiement contrôlé.', 'Plan par vagues avec mesures.', ['Auditer.', 'Corriger.', 'Pilote en refus.', 'Étendre.'], ['Aucune interruption non planifiée.'], ['Images non analysées.'], ['Ajouter une étape de pipeline.']),
];

export const d11 = assemble({ id: 'd11', level: 3, n: 11, title: 'Defender for Containers',
  summary: 'Architecture et composants, déploiement sur AKS, EKS, GKE et Arc, détections d’exécution et limites, déploiement contrôlé et politiques Kubernetes.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Protéger les clusters de Nordlys Technologies',
  caseScenario: 'Vous déployez le capteur, documentez les limites et lancez un contrôle d’admission. Données simulées.', caseMinutes: 50 });
