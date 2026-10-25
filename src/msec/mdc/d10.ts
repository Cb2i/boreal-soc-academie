// Module 10 : Defender for Servers (niveau 3).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, SH, OP, comps, P, assemble } = dsl('d10');
const c1 = { comp: 'd10-c1', lesson: 'd10-l1', tags: ['plan-1', 'plan-2', 'etendue', 'arc'] };
const c2 = { comp: 'd10-c2', lesson: 'd10-l2', tags: ['jit', 'ports-gestion', 'nsg', 'permissions'] };
const c3 = { comp: 'd10-c3', lesson: 'd10-l3', tags: ['fim', 'integrite', 'espace-de-travail'] };

const l1 = lesson(1, {
  title: 'Defender for Servers : plan 1 ou plan 2, étendue et prérequis', minutes: 50,
  summary: 'Choisir le plan et l’étendue de déploiement selon les besoins, comprendre le rôle d’Azure Arc, de l’espace de travail et les effets sur le coût.',
  objectives: ['Comparer les fonctions du plan 1 et du plan 2.', 'Choisir l’étendue (abonnement ou ressource) et en connaître les limites.', 'Énoncer les prérequis pour les machines hors Azure et pour l’espace de travail.'],
  prerequisites: ['Module 2 : plans, licences et coûts', 'Module 4 : déploiement et couverture', 'Module 9 : approches sans agent'],
  body: md(
    '## Deux plans, deux profils',
    'Le **plan 1** est l’offre d’entrée, centrée sur la détection et réponse sur les points de terminaison (EDR) fournie par l’intégration de **Defender for Endpoint** : intégration automatique, alertes et incidents intégrés, inventaire des logiciels, évaluation des vulnérabilités par capteur et évaluation de conformité. Le **plan 2** reprend tout cela et ajoute l’analyse sans agent (vulnérabilités, maliciels, secrets), les capacités premium de Defender Vulnerability Management, l’évaluation de la configuration du système d’exploitation selon le MCSB, l’évaluation des mises à jour, la **surveillance de l’intégrité des fichiers**, l’**accès juste-à-temps**, la carte réseau et une **franchise d’ingestion de 500 Mo par jour et par machine**. Pour la plupart des organisations, Microsoft recommande le plan 2.',
    '## Étendue de déploiement',
    'On active le plan au niveau de l’**abonnement**. Un seul plan Servers (1 ou 2) s’applique par abonnement; pour utiliser les deux, il faut des abonnements dans des groupes de gestion distincts. Au niveau de la **ressource** : le plan 1 s’active et se désactive par serveur, le plan 2 ne s’active **pas** sur une seule ressource mais peut s’y désactiver (tant que le plan 2 reste actif sur l’abonnement). Cette granularité sert aux exclusions justifiées, et elle se perd si l’on migre vers d’autres modes de gestion des plans : documentez-la.',
    '## Machines hors Azure',
    'Les machines AWS et GCP passent par **Azure Arc** : le connecteur les intègre par défaut comme machines activées par Arc, et certaines fonctions, comme la surveillance de l’intégrité, en dépendent. Les machines sur site s’intègrent comme machines Arc pour une fonctionnalité complète. Si l’on installe seulement l’agent Defender for Endpoint directement, on n’obtient que les fonctions du plan 1 (et avec le plan 2, seules les fonctions premium de Defender Vulnerability Management s’ajoutent). Le **plan 1 ne dépend pas de Log Analytics**; le plan 2 exige un **espace de travail** pour la franchise d’ingestion et pour la surveillance de l’intégrité, et le plan 2 doit y être activé directement.',
    '## Coûts et licences',
    'Si vous détenez déjà des licences **Defender for Endpoint pour serveurs**, vous ne payez pas cette partie du plan 1 ou 2; le rabais se demande par un billet de support (avec identifiant de locataire, nombre de licences et date d’expiration) et **n’est pas rétroactif**. Estimez avec le calculateur (module 2) et datez l’estimation. Désactiver le plan sur l’abonnement ne le désactive pas sur l’espace de travail.',
    '| Besoin | Plan | Remarque |',
    '| --- | --- | --- |',
    '| EDR et alertes intégrées seulement | 1 | Pas de Log Analytics requis |',
    '| Analyse sans agent, FIM, JIT | 2 | Espace de travail pour FIM |',
    '| Conformité réglementaire | 2 (ou autre plan payant) | Le plan 1 ne l’ouvre pas |',
    '| Machine AWS ou GCP | 1 ou 2 | Azure Arc requis |',
    '```text',
    'Décision (exemple fictif)',
    'Abonnement production : plan 2 (FIM, JIT, sans agent); abonnement développement : plan 1 (EDR)',
    'Exclusion : serveur de laboratoire désactivé au niveau ressource (motif et revue trimestrielle)',
    'Espace de travail : plan 2 activé directement sur l’espace de travail',
    '```',
    '## Erreurs fréquentes',
    '- Vouloir le plan 2 sur une seule ressource d’un abonnement au plan 1.',
    '- Installer seulement l’agent Defender for Endpoint et attendre des fonctions du plan 2.',
    '- Oublier d’activer le plan 2 sur l’espace de travail.',
  ),
  demo: { title: 'Choisir par abonnement', body: md(
    'Parc **fictif** : 80 serveurs en production, 25 en développement, 12 machines AWS.',
    '```text',
    'Production : plan 2 (conformité, FIM, JIT, sans agent)',
    'Développement : plan 1 (EDR) par coût; accepté : pas de FIM ni de JIT',
    'AWS : connecteur avec Azure Arc; vérifier que les 12 machines sont activées par Arc',
    '```',
    '**Lecture commentée.** Deux abonnements, deux plans, un écart assumé et documenté.',
    '**Ce que la démo ne prouve pas.** Aucun coût chiffré; chiffres inventés.') },
  revision: md('## Fiche : Servers', '- P1 : EDR et intégration. P2 : sans agent, FIM, JIT, conformité, 500 Mo.', '- Un plan par abonnement; P2 non activable par ressource.', '- AWS et GCP : Azure Arc.', '- Agent seul : fonctions du plan 1.', '- Espace de travail requis pour le plan 2 (FIM, franchise).'),
  links: ['servers', 'servers-plan', 'servers-select', 'servers-data-workspace', 'servers-faq', 'ingestion-benefit'], teaches: ['plan-1', 'plan-2', 'etendue', 'arc'],
});

const l2 = lesson(2, {
  title: 'Accès juste-à-temps : réduire l’exposition des ports de gestion', minutes: 50,
  summary: 'Configurer l’accès juste-à-temps, en comprendre le mécanisme réseau, les permissions et les limites.',
  objectives: ['Décrire comment le juste-à-temps modifie les NSG et Azure Firewall.', 'Configurer ports, durées et adresses sources raisonnables.', 'Énoncer les VM non prises en charge et les alternatives.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Mécanisme',
    'Les ports de gestion (SSH, RDP, WinRM) n’ont pas besoin d’être ouverts en permanence. L’accès **juste-à-temps** (JIT) y fait respecter des règles **« refuser tout le trafic entrant »** dans le groupe de sécurité réseau (NSG) et dans Azure Firewall. Quand un utilisateur demande l’accès, Defender for Cloud vérifie ses **permissions RBAC** sur la machine; si la demande est approuvée, il ajoute temporairement une règle d’autorisation pour l’adresse source et la durée demandées, puis **restaure** l’état précédent. Les connexions déjà établies ne sont pas interrompues, mais les nouvelles sont bloquées après expiration. Si des règles existent déjà sur les ports choisis, elles ont priorité sur les nouvelles règles de refus. Sur AWS, le JIT retire les règles pertinentes des groupes de sécurité EC2 et en crée un nouveau pour l’accès temporaire; GCP n’est pas pris en charge.',
    '## Prérequis et exclusions',
    'Il faut le plan 2. Sont pris en charge les VM déployées par Resource Manager et les VM protégées par Azure Firewall sur le même réseau virtuel, plus les instances EC2. **Non pris en charge** : les VM de l’ancien modèle de déploiement classique, et les VM derrière un Azure Firewall géré par **Firewall Manager** (le pare-feu doit utiliser les règles classiques, pas les politiques). La page JIT regroupe les VM en Configured, Not configured et Unsupported (pas de NSG ni de pare-feu, VM classique ou JIT désactivé par la politique de sécurité). Le nom de la politique JIT avec le nom de la VM ne doit pas dépasser 56 caractères.',
    '## Réglages à ne pas laisser par défaut',
    'Les ports recommandés sont 22, 3389, 5985 et 5986. Les valeurs par défaut activées depuis la page de la machine virtuelle sont un accès maximal de **3 heures** et des **adresses sources « Any »** : laissez ces valeurs seulement en laboratoire. En production, réduisez la durée, restreignez les adresses sources et ne créez jamais de règle NSG qui ouvre RDP ou SSH depuis `0.0.0.0/0`. Le JIT n’est pas la seule voie : **Azure Bastion** ou un VPN point à site avec authentification multifacteur gardent le trafic de gestion hors d’Internet et retirent l’adresse IP publique.',
    '## Permissions',
    'Lire l’état du JIT : **Reader** et **Security Reader**. Configurer une politique : droit d’écriture sur les politiques JIT (`Microsoft.Security/locations/jitNetworkAccessPolicies/write`) et sur la machine virtuelle. Demander l’accès : l’action `initiate` sur les politiques JIT et des lectures sur la VM, les interfaces réseau et les adresses IP publiques. Un script de rôle de moindre privilège est fourni par Microsoft pour les utilisateurs qui ne font que demander l’accès.',
    '```powershell',
    '# ÉCRITURE : exemple de configuration JIT (Set-AzJitNetworkAccessPolicy). Non exécuté dans ce cours.',
    '# Impact : ajoute des règles NSG de refus sur 22 et 3389. Tester sur une VM de laboratoire.',
    '# Remplacer les valeurs entre chevrons; durée maximale réduite à 1 heure.',
    '$regle = @{ id = "<id-ressource-vm>"; ports = @(',
    '  @{ number = 22;   protocol = "*"; allowedSourceAddressPrefix = @("*"); maxRequestAccessDuration = "PT1H" },',
    '  @{ number = 3389; protocol = "*"; allowedSourceAddressPrefix = @("*"); maxRequestAccessDuration = "PT1H" }) }',
    'Set-AzJitNetworkAccessPolicy -Kind "Basic" -Location "<region>" -Name "default" -ResourceGroupName "<rg>" -VirtualMachine @($regle)',
    '```',
    '## Erreurs fréquentes',
    '- Laisser 3 heures et « Any » en production.',
    '- Supposer le JIT actif sur une VM classique ou derrière Firewall Manager.',
    '- Donner Contributor à tous pour qu’ils demandent l’accès.',
  ),
  demo: { title: 'Demander l\'accès', body: md(
    'Séquence **fictive** pour une VM Linux protégée par JIT :',
    '```text',
    '1. L’administrateur ouvre Connect > Request access (IP source, port 22, 1 heure)',
    '2. Defender for Cloud vérifie les permissions RBAC de l’administrateur',
    '3. Une règle d’autorisation temporaire est ajoutée au NSG',
    '4. Après 1 heure, la règle est retirée; la session ouverte continue, pas les nouvelles',
    '5. L’audit de l’activité JIT (dernière connexion, utilisateur) est consigné',
    '```',
    '**Lecture commentée.** L’exposition est bornée dans le temps et attribuée à une personne.',
    '**Ce que la démo ne prouve pas.** Aucune demande réelle exécutée.') },
  revision: md('## Fiche : JIT', '- Plan 2; NSG et Azure Firewall (règles classiques).', '- Ports 22, 3389, 5985, 5986.', '- Par défaut 3 heures et Any : à durcir.', '- Non pris en charge : VM classique, Firewall Manager, GCP.', '- Alternatives : Bastion, VPN point à site avec MFA.'),
  links: ['jit-overview', 'jit-enable', 'servers-select', 'servers-matrix'], teaches: ['jit', 'ports-gestion', 'nsg', 'permissions'],
});

const l3 = lesson(3, {
  title: 'Surveillance de l’intégrité des fichiers et durcissement des serveurs', minutes: 50,
  summary: 'Activer et lire la surveillance de l’intégrité, comprendre sa collecte, ses rôles et sa migration depuis les anciens agents.',
  objectives: ['Expliquer ce que détecte la surveillance de l’intégrité des fichiers.', 'Énoncer collecte, cadence, espace de travail et rôles.', 'Planifier la migration depuis MMA ou AMA.'],
  prerequisites: ['Leçons 1 et 2', 'Module 9'],
  body: md(
    '## Ce que la fonction surveille',
    'La **surveillance de l’intégrité des fichiers** (FIM), du plan 2, analyse les fichiers du système d’exploitation, le registre Windows, les logiciels d’application et les fichiers système Linux, et compare leur état aux analyses précédentes. Elle détecte la création ou la suppression de fichiers et de clés de registre, les modifications de fichiers (taille, listes de contrôle d’accès, empreinte du contenu) et du registre. Elle aide à satisfaire des exigences de conformité qui demandent la FIM, comme certaines normes de cartes de paiement. Les changements indiquent la **source**, les détails du compte, l’auteur probable et le processus déclencheur.',
    '## Collecte et cadence',
    'La FIM utilise l’agent **Defender for Endpoint** et l’**analyse sans agent**. Les événements de l’agent sont diffusés à l’espace de travail Log Analytics en **quasi temps réel**; ceux de l’analyse sans agent selon un rythme de **24 heures**. L’analyse sans agent permet aussi de définir des **chemins personnalisés**. Les données collectées entrent dans la franchise de 500 Mo du plan 2. La FIM **n’est pas activée par défaut** : il faut l’activer, choisir l’espace de travail et accepter ou ajuster les ressources recommandées.',
    '## Rôles et versions',
    'Pour activer, désactiver ou modifier la configuration : **Security Admin** et **Owner** sur l’abonnement contenant l’espace de travail. **Security Reader** peut consulter les résultats. Des versions minimales de l’agent s’appliquent (par exemple 10.8799 pour les clients Windows hérités, et une version minimale pour Linux), sans quoi les données cessent d’arriver. Les anciennes méthodes fondées sur MMA et AMA doivent être **migrées** : le support de MMA a pris fin en novembre 2024.',
    '## Bruit et pertinence',
    'Une FIM sans règle ciblée produit du bruit. Limitez la surveillance aux chemins critiques (répertoires de configuration, binaires système, clés de démarrage), établissez les changements attendus (fenêtres de maintenance) et reliez les alertes à un processus de revue. La FIM détecte un changement, elle n’établit pas son innocuité.',
    '```text',
    'Plan FIM (exemple fictif)',
    'Chemins : /etc/ssh, /etc/sudoers.d, C:\\Windows\\System32\\drivers\\etc, clés Run du registre',
    'Collecte : agent Defender for Endpoint + chemins personnalisés via analyse sans agent',
    'Revue : changements hors fenêtre de maintenance examinés sous 1 jour ouvrable',
    '```',
    '## Erreurs fréquentes',
    '- Croire la FIM active par défaut.',
    '- Surveiller tout le disque et ignorer ensuite les alertes.',
    '- Laisser des déploiements MMA qui ne sont plus pris en charge.',
  ),
  demo: { title: 'Un changement suspect', body: md(
    'Événement **fictif** détecté par la FIM :',
    '```text',
    'Fichier : /etc/ssh/sshd_config   Changement : empreinte modifiée à 03:12',
    'Compte  : svc-deploy   Processus : bash   Fenêtre de maintenance : non',
    '```',
    '**Lecture commentée.** Un compte de service modifie la configuration SSH hors fenêtre. On compare à la demande de changement, puis on investigue (module 21).',
    '**Ce que la démo ne prouve pas.** Événement inventé.') },
  revision: md('## Fiche : FIM', '- Plan 2, non activée par défaut.', '- Agent : quasi temps réel; sans agent : 24 heures.', '- Security Admin et Owner pour configurer; Security Reader pour lire.', '- Versions minimales de l’agent; MMA fin de support nov. 2024.', '- Cibler les chemins critiques.'),
  links: ['fim', 'fim-enable', 'fim-migrate', 'servers-data-workspace', 'ingestion-benefit'], teaches: ['fim', 'integrite', 'espace-de-travail'],
});

const exercises = [
  MT('d10-g1', 'guided', 'comprendre', c1, 'Plans', 'Associez chaque fonction au plan qui la fournit.', [['EDR Defender for Endpoint', 'Plan 1 et 2'], ['Accès juste-à-temps', 'Plan 2'], ['Surveillance de l’intégrité', 'Plan 2'], ['Franchise de 500 Mo', 'Plan 2']], 'Les fonctions avancées sont dans le plan 2.'),
  WF('d10-a1', 'autonomous', 'fonctionner', c1, 'Choisir le plan', 'Ordonnez le choix du plan d’un abonnement.', ['Lister les besoins fonctionnels', 'Vérifier la conformité exigée', 'Choisir le plan par abonnement', 'Estimer le coût avec le calculateur', 'Documenter les écarts assumés'], [['Activer le plan 2 sur une seule ressource', 'Impossible.']], 'On part des besoins, du coût et de la documentation.'),
  Q('d10-q1a', 'quiz', 'comprendre', c1, 'Plan par ressource', 'Peut-on activer le plan 2 sur une seule ressource ?', ['Non, seulement la désactiver au niveau ressource.', 'Documenté.'], [['Oui.', 'Faux.'], ['Seulement Linux.', 'Faux.'], ['Seulement AWS.', 'Faux.']], 'Le plan 2 ne s’active pas par ressource.'),
  Q('d10-q1b', 'quiz', 'fonctionner', c1, 'AWS et GCP', 'Que faut-il pour protéger des machines AWS ?', ['Azure Arc via le connecteur.', 'Intégration par défaut.'], [['Rien.', 'Faux.'], ['Un VPN.', 'Faux.'], ['Une licence Office.', 'Faux.']], 'Azure Arc.'),
  Q('d10-q1c', 'quiz', 'cout', c1, 'Licence existante', 'Que faire si vous avez des licences Defender for Endpoint pour serveurs ?', ['Demander le rabais par billet de support, non rétroactif.', 'Documenté.'], [['Rien, remise automatique.', 'Faux.'], ['Désactiver le plan.', 'Faux.'], ['Doubler les licences.', 'Faux.']], 'Rabais sur demande, non rétroactif.'),

  MT('d10-g2', 'guided', 'comprendre', c2, 'JIT', 'Associez chaque élément à son rôle.', [['NSG', 'Règles de refus et d’autorisation temporaire'], ['Port 3389', 'RDP'], ['Port 22', 'SSH']], 'Chaque élément a son rôle.'),
  CF('d10-a2', 'autonomous', 'securiser', c2, 'Politique JIT', 'Paramétrez la politique JIT de production.', [['Durée maximale de 1 heure', 'on', 'Réduit la fenêtre d’exposition.'], ['Adresses sources Any', 'off', 'Restreindre aux plages d’administration.'], ['Règle NSG RDP depuis 0.0.0.0/0', 'off', 'Jamais.']], 'Durée courte, sources restreintes, aucune ouverture générale.'),
  Q('d10-q2a', 'quiz', 'securiser', c2, 'Après expiration', 'Que devient une session ouverte à l’expiration ?', ['Elle continue; les nouvelles connexions sont bloquées.', 'Documenté.'], [['Elle est coupée.', 'Faux.'], ['Elle est dupliquée.', 'Faux.'], ['Elle devient permanente.', 'Faux.']], 'Les sessions établies continuent.'),
  Q('d10-q2b', 'quiz', 'fonctionner', c2, 'VM non prise en charge', 'Quelle VM n’est pas prise en charge ?', ['Une VM classique.', 'Doit être Resource Manager.'], [['Une VM Resource Manager.', 'Prise en charge.'], ['Une EC2.', 'Prise en charge.'], ['Une VM avec NSG.', 'Prise en charge.']], 'Modèle classique non pris en charge.'),
  Q('d10-q2c', 'quiz', 'securiser', c2, 'Alternative', 'Quelle alternative garde la gestion hors d’Internet ?', ['Azure Bastion ou VPN point à site avec MFA.', 'Sans IP publique.'], [['Ouvrir RDP à tous.', 'Dangereux.'], ['Désactiver le NSG.', 'Dangereux.'], ['Ajouter une IP publique.', 'Dangereux.']], 'Bastion ou VPN avec MFA.'),

  MT('d10-g3', 'guided', 'comprendre', c3, 'FIM', 'Associez la méthode de collecte à sa cadence.', [['Agent Defender for Endpoint', 'Quasi temps réel'], ['Analyse sans agent', '24 heures']], 'Deux méthodes, deux cadences.'),
  IN('d10-a3', 'autonomous', 'verifier', c3, 'Plan FIM', 'Plan FIM fictif : repérez les défauts.', 'text', [['« Surveiller tout le disque. »', 'Cibler les chemins critiques', 'Garder tel quel'], ['« Aucune revue prévue. »', 'Prévoir une revue sous un jour ouvrable', 'Garder tel quel'], ['« FIM active par défaut. »', 'Elle doit être activée et configurée', 'Garder tel quel']], 'Chaque défaut est corrigé.'),
  Q('d10-q3a', 'quiz', 'securiser', c3, 'Rôles FIM', 'Quels rôles pour configurer la FIM ?', ['Security Admin et Owner.', 'Sur l’abonnement de l’espace de travail.'], [['Reader.', 'Lecture.'], ['Security Reader.', 'Lecture.'], ['Aucun.', 'Faux.']], 'Security Admin et Owner.'),
  Q('d10-q3b', 'quiz', 'maintenir', c3, 'MMA', 'Que faire des déploiements FIM sur MMA ?', ['Migrer vers la FIM fondée sur Defender for Endpoint.', 'Support terminé.'], [['Les conserver.', 'Non pris en charge.'], ['Les doubler.', 'Faux.'], ['Les ignorer.', 'Faux.']], 'Migrer.'),
  Q('d10-q3c', 'quiz', 'verifier', c3, 'Espace de travail', 'Où sont stockés les événements de la FIM ?', ['Dans un espace de travail Log Analytics.', 'Choisi à l’activation.'], [['Dans le NSG.', 'Faux.'], ['Dans Entra ID.', 'Faux.'], ['Nulle part.', 'Faux.']], 'Log Analytics.'),

  Q('d10-ev1', 'eval', 'comprendre', c1, 'Conformité et P1', 'Le plan 1 ouvre-t-il la conformité réglementaire ?', ['Non.', 'Il faut le plan 2 ou un autre plan payant.'], [['Oui.', 'Faux.'], ['Seulement sur AWS.', 'Faux.'], ['Seulement avec JIT.', 'Faux.']], 'Non.'),
  M('d10-ev2', 'eval', 'securiser', c2, 'Ports recommandés', 'Cochez les ports recommandés pour le JIT.', [['22.', 'SSH.'], ['3389.', 'RDP.'], ['5985.', 'WinRM.'], ['5986.', 'WinRM.']], [['80.', 'Non listé.']], 'Quatre ports recommandés.'),
  FX('d10-ev3', 'eval', 'securiser', c2, 'Corriger une politique JIT', 'Corrigez la politique fictive.', { duree: '24h', sources: 'Any', ports: '3389', revue: '' }, { duree: '1h', sources: 'plages d’administration', ports: '22, 3389', revue: 'trimestrielle' }, [['duree', '1h', 'Durée courte.', 'securiser'], ['sources', 'plages d’administration', 'Restreindre les sources.', 'securiser'], ['ports', '22, 3389', 'Couvrir SSH et RDP.', 'fonctionner'], ['revue', 'trimestrielle', 'Revue périodique.', 'maintenir']], 'Durée courte, sources restreintes, ports couverts, revue.'),
  OR('d10-ev4', 'eval', 'fonctionner', c3, 'Activer la FIM', 'Ordonnez l’activation de la FIM.', ['Activer le plan 2 et sur l’espace de travail', 'Vérifier l’agent Defender for Endpoint', 'Activer la FIM et choisir l’espace de travail', 'Cibler les chemins', 'Planifier la revue'], 'Plan, agent, activation, chemins, revue.'),
  CF('d10-ev5', 'eval', 'cout', c1, 'Coût des serveurs', 'Paramétrez la stratégie de coût.', [['Plan 2 en production', 'on', 'Fonctions requises.'], ['Plan 2 en laboratoire sans besoin', 'off', 'Coût inutile.'], ['Demander le rabais Defender for Endpoint', 'on', 'Évite de payer deux fois.']], 'Plan 2 où utile, rabais demandé.'),
  WF('d10-ev6', 'eval', 'maintenir', c3, 'Revue des changements FIM', 'Ordonnez la revue d’un changement FIM.', ['Lire le changement et le compte', 'Comparer à la demande de changement', 'Escalader si inexpliqué', 'Documenter la décision', 'Ajuster les règles'], [['Ignorer', 'Perte de détection.']], 'Lire, comparer, escalader, documenter, ajuster.'),
  SH('d10-ev7', 'eval', 'comprendre', c1, 'Franchise', 'Combien de Mo par jour et par machine la franchise du plan 2 couvre-t-elle ? (nombre)', ['500'], 'Cinq cents Mo.', 500),
  Q('d10-ev8', 'eval', 'cout', c1, 'Log Analytics', 'Le plan 1 dépend-il de Log Analytics ?', ['Non.', 'Le plan 2 en a besoin pour FIM et franchise.'], [['Oui.', 'Faux.'], ['Seulement Linux.', 'Faux.'], ['Seulement AWS.', 'Faux.']], 'Non.'),

  IN('d10-cs1', 'case', 'securiser', c2, 'Cas : accès d\'administration chez Nordlys', 'Pratiques fictives : repérez les défauts.', 'text', [['« RDP ouvert à tous pour les fournisseurs. »', 'Remplacer par JIT ou Bastion', 'Garder tel quel'], ['« JIT 3 heures, sources Any. »', 'Réduire durée et sources', 'Garder tel quel']], 'Chaque pratique est corrigée.'),
  MT('d10-cs2', 'case', 'fonctionner', c1, 'Cas : déploiement', 'Associez chaque machine à sa voie d\'intégration.', [['Serveur sur site', 'Azure Arc'], ['Instance EC2', 'Connecteur AWS avec Arc'], ['VM Azure', 'Extension Defender for Endpoint automatique']], 'Chaque machine a sa voie.'),
  WF('d10-cs3', 'case', 'maintenir', c3, 'Cas : migration de la FIM', 'Ordonnez la migration d\'une FIM MMA.', ['Inventorier les machines en FIM MMA', 'Vérifier la version de l’agent Defender for Endpoint', 'Activer la FIM fondée sur Defender for Endpoint', 'Comparer les événements', 'Retirer l’ancienne configuration'], [['Retirer d’abord l’ancienne configuration', 'Perte de visibilité.']], 'Inventaire, version, activation, comparaison, retrait.'),
  OP('d10-cs-open', 'case', 'verifier', c1, 'Cas : stratégie Servers de Nordlys', 'Rédigez la stratégie Defender for Servers d’une organisation fictive.', 'Une page : plans par abonnement, Arc, JIT, FIM, coûts, exclusions et revue.', [['Les plans suivent les besoins.', 'comprendre'], ['JIT et FIM sont durcis.', 'securiser'], ['Les coûts sont estimés.', 'cout'], ['Les exclusions sont revues.', 'maintenir']], 'La stratégie relie plans, exposition, intégrité et coûts.'),

  Q('d10-rm1', 'remediation', 'comprendre', c1, 'Remédiation : P2 par ressource', 'Le plan 2 peut-il s\'activer sur une ressource ?', ['Non.', 'Seulement se désactiver.'], [['Oui.', 'Faux.'], ['Parfois.', 'Faux.'], ['Seulement AWS.', 'Faux.']], 'Non.'),
  Q('d10-rm2', 'remediation', 'securiser', c2, 'Remédiation : RDP', 'Peut-on ouvrir RDP depuis 0.0.0.0/0 ?', ['Non, jamais.', 'Utiliser JIT ou Bastion.'], [['Oui.', 'Faux.'], ['Si MFA.', 'Faux.'], ['Si temporaire.', 'Faux.']], 'Jamais.'),
  Q('d10-rm3', 'remediation', 'maintenir', c3, 'Remédiation : MMA', 'MMA est-il encore pris en charge pour la FIM ?', ['Non, fin en novembre 2024.', 'Migrer.'], [['Oui.', 'Faux.'], ['Seulement Windows.', 'Faux.'], ['Seulement Linux.', 'Faux.']], 'Non.'),
];

const competencies = comps([
  ['Choisir plan et étendue Servers', 'Plan 1 et 2, Arc, espace de travail.', ['Je compare P1 et P2.', 'Je connais les limites d’étendue.', 'Je chiffre le coût.']],
  ['Réduire l’exposition des ports', 'JIT et alternatives.', ['Je configure le JIT.', 'Je durcis durée et sources.', 'Je connais les VM non prises en charge.']],
  ['Surveiller l’intégrité', 'FIM.', ['Je décris la collecte.', 'Je cible les chemins.', 'Je planifie la migration.']],
]);

const projects = [
  P(1, 'débutant', 'Matrice des plans par abonnement', 'Dresser la matrice plan, abonnement et justification.', 'Tableau abonnement, plan, besoin, coût.', ['Lister les abonnements.', 'Choisir les plans.', 'Justifier.'], ['Chaque choix est justifié.'], ['Plan 2 inutile.'], ['Ajouter AWS.']),
  P(2, 'intermédiaire', 'Politique JIT de production', 'Concevoir la politique JIT et le processus de demande d\'accès.', 'Politique, rôle de moindre privilège, audit.', ['Choisir ports et durées.', 'Définir le rôle.', 'Définir l\'audit.'], ['Aucune exposition permanente.'], ['Sources Any.'], ['Comparer à Bastion.'],
    { connected: { accounts: 'Un abonnement Azure de test avec une VM de laboratoire et le plan 2 en essai si approuvé.', permissions: 'Droits d\'écriture JIT sur la VM de laboratoire uniquement.', costs: 'Le plan 2 est payant; l\'essai gratuit doit être confirmé avant activation.', secrets: 'Aucun secret.', cleanup: 'Désactiver le JIT, supprimer la VM de laboratoire et rétablir le plan.', limits: 'Une seule VM de laboratoire; ne pas modifier la production. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Programme FIM ciblé', 'Concevoir un programme FIM avec chemins, revue et migration des anciens agents.', 'Programme avec calendrier de revue.', ['Choisir les chemins.', 'Définir la revue.', 'Planifier la migration.', 'Estimer le coût d\'ingestion.'], ['Les alertes sont traitables.'], ['Bruit excessif.'], ['Intégrer à Sentinel.']),
];

export const d10 = assemble({ id: 'd10', level: 3, n: 10, title: 'Defender for Servers',
  summary: 'Plans 1 et 2, étendue et Azure Arc, accès juste-à-temps, surveillance de l’intégrité des fichiers, espace de travail et coûts.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Protéger les serveurs de Nordlys Technologies',
  caseScenario: 'Vous choisissez les plans, durcissez le JIT et planifiez la FIM. Données simulées.', caseMinutes: 50 });
