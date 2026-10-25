// Module 15 : Sécurité des services d'IA (niveau 3).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, SH, OP, comps, P, assemble } = dsl('d15');
const c1 = { comp: 'd15-c1', lesson: 'd15-l1', tags: ['couches', 'filtres', 'posture-ia', 'responsabilite'] };
const c2 = { comp: 'd15-c2', lesson: 'd15-l2', tags: ['menaces-ia', 'alertes-ia', 'essai', 'xdr'] };
const c3 = { comp: 'd15-c3', lesson: 'd15-l3', tags: ['agents', 'agent365', 'ai-bom', 'limites-ia'] };

const l1 = lesson(1, {
  title: 'Trois couches de sécurité pour l’IA : ne pas confondre filtre et détection', minutes: 50,
  summary: 'Distinguer les filtres de la plateforme IA (Prompt Shields), la posture IA de Defender CSPM et la protection contre les menaces des services d’IA.',
  objectives: ['Nommer les trois couches et leur responsable.', 'Dire ce que Prompt Shields fait et ne fait pas pour Defender.', 'Choisir la bonne couche selon la question posée.'],
  prerequisites: ['Module 5 : CSPM', 'Module 14 : menace et posture'],
  body: md(
    '## Trois couches, trois responsables',
    'Sécuriser une application d’IA générative mobilise trois couches qu’on confond trop souvent. **Couche 1 : les protections de la plateforme IA.** Les filtres de contenu et **Prompt Shields** sont des mécanismes d’Azure AI Content Safety et de Microsoft Foundry : ils analysent les invites et les documents, **bloquent ou annotent** selon la configuration du guardrail, et appartiennent à l’équipe qui construit l’application. **Couche 2 : la posture IA (AI SPM)**, un volet de Defender CSPM : elle découvre les charges de travail IA, établit la nomenclature (AI BOM) et signale configurations et chemins d’attaque. **Couche 3 : la protection contre les menaces des services d’IA**, plan distinct de Defender for Cloud : elle surveille l’activité et génère des **alertes** de sécurité, en s’appuyant sur Prompt Shields et sur la veille de menaces de Microsoft.',
    '## Ce que Defender ne fait pas',
    'Defender for Cloud **ne configure pas vos filtres de contenu** et ne remplace pas un guardrail : si Prompt Shields est mal assigné au déploiement ou fonctionne en mode annotation, une tentative de jailbreak peut être détectée sans être bloquée, et l’alerte correspondante le dira (« détectée » plutôt que « bloquée »). À l’inverse, un filtre actif ne produit pas de signal d’investigation pour le SOC si la couche 3 n’est pas activée. Les deux se complètent : le filtre réduit la probabilité, la détection donne la visibilité.',
    '## Qui voit quoi',
    '| Question | Couche | Résultat |',
    '| --- | --- | --- |',
    '| Cette invite est-elle une tentative de contournement ? | Plateforme IA (Prompt Shields) | Blocage ou annotation |',
    '| Quelles charges IA avons-nous et sont-elles exposées ? | Posture IA (Defender CSPM) | Inventaire, recommandations |',
    '| Quelqu’un attaque-t-il notre service d’IA ? | Protection contre les menaces | Alertes |',
    '## Faux positifs et réglages',
    'Une règle de la plateforme qui bloque trop est un réglage du guardrail (passer de bloquer à annoter pour observer, examiner les sous-types qui déclenchent). Une alerte de Defender jugée bruyante se traite par le flux d’alertes (module 21). Ne corrigez pas un problème de couche 1 en désactivant la couche 3.',
    '## Responsabilité partagée',
    'Documentez qui configure chaque couche : l’équipe de la plateforme IA pour les guardrails, l’équipe de sécurité cloud pour la posture et la détection, le SOC pour l’exploitation. Sans cette carte, chacun suppose que l’autre couvre.',
    '```text',
    'Carte de responsabilité (exemple fictif)',
    'Guardrails Prompt Shields : équipe IA        Revue : trimestrielle',
    'Posture IA (CSPM)        : sécurité cloud     Revue : mensuelle',
    'Alertes menaces IA       : SOC                Revue : continue',
    '```',
    '## Erreurs fréquentes',
    '- Croire que l’activation de Defender configure Prompt Shields.',
    '- Désactiver une couche pour corriger le bruit d’une autre.',
    '- Ne pas nommer de propriétaire pour les guardrails.',
  ),
  demo: { title: 'Même tentative, trois lectures', body: md(
    'Tentative **fictive** de contournement des consignes d’un assistant interne :',
    '```text',
    'Plateforme IA : Prompt Shields bloque l’invite (guardrail assigné au déploiement)',
    'Defender (menaces) : alerte « tentative de jailbreak bloquée » pour le SOC',
    'Defender CSPM : l’inventaire montre le déploiement et son exposition réseau',
    '```',
    '**Lecture commentée.** Le blocage vient de la couche 1, la visibilité de la couche 3, le contexte de la couche 2.',
    '**Ce que la démo ne prouve pas.** Aucun service réel.') },
  revision: md('## Fiche : trois couches', '- Prompt Shields et filtres : plateforme IA, bloquent ou annotent.', '- AI SPM : Defender CSPM, inventaire et posture.', '- Menaces IA : plan dédié, alertes.', '- Defender ne configure pas les filtres.', '- Nommer un propriétaire par couche.'),
  links: ['prompt-shields', 'ai-posture', 'ai-threat', 'ai-onboarding', 'cspm'], teaches: ['couches', 'filtres', 'posture-ia', 'responsabilite'],
});

const l2 = lesson(2, {
  title: 'Protection contre les menaces des services d’IA : activation, alertes et preuves', minutes: 50,
  summary: 'Activer le plan, comprendre sa couverture et ses limites, lire les alertes et décider de l’exposition des invites comme preuves.',
  objectives: ['Énoncer la couverture, les clouds et le rôle requis.', 'Nommer des alertes IA et leur sens.', 'Décider de la collecte des invites comme preuves en connaissant l’effet sur la confidentialité.'],
  prerequisites: ['Leçon 1', 'Module 21 (aperçu) : alertes'],
  body: md(
    '## Couverture et prérequis',
    'La protection contre les menaces pour les services d’IA est en disponibilité générale. Elle couvre **Azure OpenAI** et le **service d’inférence de modèles Azure AI**, et analyse seulement les **jetons de texte** : images et audio ne sont pas analysés. Elle est disponible dans les clouds commerciaux, **pas** dans Azure Government, ni 21Vianet, ni pour les comptes AWS connectés. Pour l’activer à l’échelle de l’abonnement, il faut le rôle **Owner** sur l’abonnement (ou des rôles précis avec les actions de données correspondantes). L’essai gratuit dure 30 jours et est plafonné à **75 milliards de jetons** analysés; la facturation commence si le plafond est atteint avant la fin de la période. Estimez les coûts avec le calculateur, car ils dépendent des jetons.',
    '## Alertes typiques',
    'Les alertes décrivent des menaces propres à l’IA générative. **Tentative de jailbreak** : deux variantes selon que Prompt Shields a **bloqué** ou seulement **détecté** la tentative (filtre en annotation ou confiance faible). **Tentative de vol d’identifiants** : des identifiants apparaissent dans la réponse d’un modèle à une invite, ce qui suggère une fuite. **Anomalie d’accès** à une ressource d’IA : changement de paramètres comme l’agent utilisateur, les plages d’adresses IP ou la méthode d’authentification. **Invocation anormale d’un outil** par une application connectée au modèle. **Reconnaissance du modèle (préversion)** : des invites cherchent à extraire les instructions système, souvent avant un jailbreak. Une opération à haut risque d’« accès initial » par un principal de service peut indiquer un principal compromis.',
    '## Preuve des invites : un choix de confidentialité',
    'Le composant de **preuve des invites suspectes** ajoute à l’alerte l’extrait qui a déclenché la détection. S’il est désactivé, le contenu est masqué dans l’alerte. Pour le SOC, la preuve accélère le tri; pour la protection de la vie privée, elle copie du contenu d’utilisateur dans des alertes qui peuvent être exportées vers un SIEM. Décidez avec la conformité, limitez l’accès aux alertes et documentez la rétention. Les composants de sécurité des données pour les interactions IA (Purview, payant, en préversion) et de sécurité des modèles (registres Azure ML, préversion) sont des options distinctes.',
    '## Intégration XDR et investigation',
    'Les alertes IA se centralisent dans le portail Defender XDR et se corrèlent avec d’autres alertes pour comprendre l’étendue d’une attaque, y compris l’activité malveillante liée aux applications d’IA générative. Pour enquêter, rassemblez le contexte : qui est l’appelant, quelle ressource, quelles requêtes précédentes, quels outils invoqués. Une alerte isolée est un indice, pas un verdict.',
    '```text',
    'Fiche d’alerte (exemple fictif)',
    'Alerte : Jailbreak détecté, non bloqué     Gravité : moyenne',
    'Cause probable : guardrail en mode annotation sur le déploiement "assistant-rh"',
    'Actions : revoir le guardrail avec l’équipe IA; conserver l’alerte; vérifier les invites voisines',
    '```',
    '## Erreurs fréquentes',
    '- Croire que l’absence d’alerte prouve l’absence d’abus.',
    '- Activer la preuve des invites sans cadrer l’accès aux alertes.',
    '- Supposer que les images et l’audio sont analysés.',
  ),
  demo: { title: 'Bloquée ou détectée', body: md(
    'Deux alertes **fictives** :',
    '```text',
    'A : Jailbreak bloqué par Prompt Shields    -> informatif; confirmer que le guardrail reste actif',
    'B : Jailbreak détecté, non bloqué          -> action : corriger le guardrail (mode, seuil)',
    '```',
    '**Lecture commentée.** Le mot « bloqué » ou « détecté » oriente l’action vers l’équipe IA.',
    '**Ce que la démo ne prouve pas.** Aucune alerte réelle.') },
  revision: md('## Fiche : menaces IA', '- Azure OpenAI et inférence de modèles; texte seulement.', '- Clouds commerciaux; pas Gov, 21Vianet, AWS.', '- Rôle Owner; essai 30 jours, 75 milliards de jetons.', '- Bloquée ou détectée oriente l’action.', '- Preuve des invites : choix de confidentialité.'),
  links: ['ai-threat', 'ai-alerts', 'ai-onboarding', 'prompt-shields', 'xdr-integration'], teaches: ['menaces-ia', 'alertes-ia', 'essai', 'xdr'],
});

const l3 = lesson(3, {
  title: 'Posture IA, agents et licence Agent 365 : lire les changements de juillet 2026', minutes: 45,
  summary: 'Comprendre l’AI SPM, ce qui a changé pour les agents depuis le 1er juillet 2026 et les limites de couverture, avec un lien vers le cours sur l’IA agentique.',
  objectives: ['Décrire ce que l’AI SPM découvre.', 'Énoncer le changement de licence pour les agents.', 'Relever les contradictions documentaires à revérifier.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Posture IA (AI SPM)',
    'La posture IA de Defender CSPM découvre en continu les charges de travail IA déployées : Azure OpenAI, Azure AI Foundry, Azure Machine Learning, Amazon Bedrock et Google Vertex AI, et en dresse la **nomenclature (AI BOM)**. Elle peut aussi analyser le code et les images de conteneurs pour trouver des vulnérabilités ou des erreurs d’IaC dans les bibliothèques d’IA (par exemple TensorFlow, PyTorch, Langchain), et alimente des chemins d’attaque comme des données de référence exposées. Elle est prise en charge dans Azure et AWS.',
    '**Contradiction à revérifier.** La page de posture IA cite Vertex AI parmi les services découverts alors que la matrice de prise en charge multicloud indique l’AI SPM non pris en charge sur GCP. Notez le conflit dans votre registre et testez dans votre environnement avant de promettre une couverture GCP.',
    '## Agents IA : le changement du 1er juillet 2026',
    'À compter du **1er juillet 2026**, la découverte et la posture des **agents** (Microsoft Foundry et agents infonuagiques tiers) exigent une licence **Microsoft Agent 365**; elles étaient auparavant offertes via le plan Defender CSPM, et la protection contre les menaces des agents via le plan Defender for AI Services. Les locataires sans licence admissible perdent l’accès à ces fonctions agent. Defender CSPM **continue de découvrir les comptes et projets Foundry**, mais pas le niveau agent. Les détections sur les agents (tentatives de jailbreak, injection indirecte d’invite, fuite de secrets, reconnaissance de modèle) s’appuient sur les données d’observabilité d’Agent 365 et sont en préversion dans la documentation consultée.',
    '## Conséquences pratiques',
    'Pour un client : un inventaire qui comptait des agents avant juillet peut les perdre sans licence; la facture ne baisse pas forcément; la gouvernance des agents (identité, accès conditionnel, Purview) relève d’Agent 365. Pour la formation : ce module traite le côté infrastructure et services de modèles; la sécurité des agents et du protocole d’outils est approfondie dans le cours sur l’IA agentique de la plateforme.',
    '## Limites à écrire dans le livrable',
    '- Texte seulement pour la protection contre les menaces.',
    '- Pas de couverture AWS pour la protection contre les menaces des services d’IA.',
    '- Agents : licence distincte, fonctions en préversion.',
    '- Les fonctions et licences IA évoluent vite : dater chaque affirmation.',
    '```text',
    'Fiche de changement (exemple fictif)',
    'Avant 2026-07-01 : agents Foundry découverts par Defender CSPM',
    'Depuis : comptes et projets Foundry seulement; agents via Agent 365',
    'Décision : évaluer la licence ou documenter la perte de visibilité',
    '```',
    '## Erreurs fréquentes',
    '- Annoncer la découverte d’agents sans vérifier la licence.',
    '- Promettre l’AI SPM sur GCP malgré le conflit documentaire.',
    '- Présenter une préversion comme un service de production.',
  ),
  demo: { title: 'Avant et après juillet 2026', body: md(
    'Inventaire **fictif** :',
    '```text',
    'Comptes Foundry : 4 découverts (inchangé)',
    'Agents          : 12 avant juillet -> 0 sans licence Agent 365',
    '```',
    '**Lecture commentée.** Le chiffre qui baisse reflète la licence, pas une amélioration de la sécurité.',
    '**Ce que la démo ne prouve pas.** Données inventées.') },
  revision: md('## Fiche : posture IA et agents', '- AI SPM : Azure OpenAI, Foundry, Azure ML, Bedrock, Vertex AI (conflit GCP).', '- 2026-07-01 : agents exigent Agent 365.', '- Comptes et projets Foundry restent découverts.', '- Détections agents en préversion.', '- Approfondir dans le cours IA agentique.'),
  links: ['ai-posture', 'agent365-transition', 'agent-detection', 'multicloud-matrix', 'ai-threat'], teaches: ['agents', 'agent365', 'ai-bom', 'limites-ia'],
});

const exercises = [
  MT('d15-g1', 'guided', 'comprendre', c1, 'Trois couches', 'Associez chaque question à la couche.', [['Cette invite contourne-t-elle les consignes ?', 'Prompt Shields (plateforme IA)'], ['Quelles charges IA avons-nous ?', 'Posture IA (CSPM)'], ['Quelqu\'un attaque-t-il le service ?', 'Protection contre les menaces']], 'Chaque question a sa couche.'),
  CF('d15-a1', 'autonomous', 'securiser', c1, 'Responsabilité', 'Paramétrez la carte de responsabilité.', [['Nommer un propriétaire par couche', 'on', 'Évite les angles morts.'], ['Supposer que Defender configure Prompt Shields', 'off', 'Faux.'], ['Revoir les guardrails périodiquement', 'on', 'Les réglages dérivent.']], 'Propriétaires et revues.'),
  Q('d15-q1a', 'quiz', 'comprendre', c1, 'Prompt Shields', 'Qui configure Prompt Shields ?', ['L\'équipe de la plateforme IA.', 'Mécanisme de la plateforme.'], [['Defender for Cloud.', 'Faux.'], ['Le SOC.', 'Faux.'], ['Microsoft seule.', 'Faux.']], 'Équipe IA.'),
  Q('d15-q1b', 'quiz', 'securiser', c1, 'Filtre seul', 'Un filtre actif suffit-il à la visibilité du SOC ?', ['Non, il faut la détection.', 'Couches complémentaires.'], [['Oui.', 'Faux.'], ['Seulement la nuit.', 'Faux.'], ['Oui si bloqué.', 'Faux.']], 'Non.'),
  Q('d15-q1c', 'quiz', 'verifier', c1, 'AI SPM', 'Dans quel plan se trouve l\'AI SPM ?', ['Defender CSPM.', 'Posture.'], [['Defender for Storage.', 'Faux.'], ['Defender for Key Vault.', 'Faux.'], ['Aucun.', 'Faux.']], 'Defender CSPM.'),

  MT('d15-g2', 'guided', 'comprendre', c2, 'Alertes IA', 'Associez chaque alerte à sa lecture.', [['Jailbreak bloqué', 'Informatif; vérifier le guardrail'], ['Jailbreak détecté non bloqué', 'Corriger le guardrail'], ['Vol d\'identifiants', 'Fuite dans une réponse de modèle'], ['Reconnaissance du modèle', 'Précède souvent un jailbreak']], 'Chaque alerte oriente l\'action.'),
  WF('d15-a2', 'autonomous', 'fonctionner', c2, 'Activer la protection', 'Ordonnez l\'activation de la protection des services d\'IA.', ['Confirmer le rôle Owner', 'Estimer le coût en jetons', 'Activer le plan', 'Décider de la preuve des invites', 'Vérifier les alertes dans le portail'], [['Activer sans estimer les jetons', 'Coût imprévu.']], 'Rôle, coût, activation, preuve, vérification.'),
  Q('d15-q2a', 'quiz', 'comprendre', c2, 'Contenu analysé', 'Quels jetons sont analysés ?', ['Le texte.', 'Pas image ni audio.'], [['Images.', 'Faux.'], ['Audio.', 'Faux.'], ['Tous.', 'Faux.']], 'Texte.'),
  Q('d15-q2b', 'quiz', 'cout', c2, 'Essai', 'Quel est le plafond de l\'essai ?', ['75 milliards de jetons sur 30 jours.', 'Au-delà, facturation.'], [['Illimité.', 'Faux.'], ['1 million.', 'Faux.'], ['7 jours.', 'Faux.']], '75 milliards.'),
  Q('d15-q2c', 'quiz', 'securiser', c2, 'Preuve des invites', 'Que fait la preuve des invites ?', ['Ajoute l\'extrait déclencheur à l\'alerte.', 'Choix de confidentialité.'], [['Chiffre le modèle.', 'Faux.'], ['Bloque l\'utilisateur.', 'Faux.'], ['Supprime les alertes.', 'Faux.']], 'Ajoute l\'extrait.'),

  MT('d15-g3', 'guided', 'comprendre', c3, 'Après juillet', 'Associez chaque élément à son statut.', [['Comptes et projets Foundry', 'Toujours découverts par CSPM'], ['Agents Foundry', 'Licence Agent 365'], ['Détections d\'agents', 'Préversion']], 'Statuts à dater.'),
  IN('d15-a3', 'autonomous', 'verifier', c3, 'Promesses IA', 'Promesses fictives : repérez celles à corriger.', 'text', [['« L\'AI SPM couvre GCP à coup sûr. »', 'Conflit documentaire; tester avant de promettre', 'Garder tel quel'], ['« Les agents restent visibles sans licence. »', 'Agent 365 requis depuis 2026-07-01', 'Garder tel quel']], 'Chaque promesse est corrigée.'),
  Q('d15-q3a', 'quiz', 'verifier', c3, 'Date', 'Quelle date marque le changement de licence agents ?', ['2026-07-01.', 'Agent 365.'], [['2026-04-01.', 'Serverless.'], ['2026-07-05.', 'Plans dépréciés.'], ['2025-01-01.', 'Faux.']], '2026-07-01.'),
  Q('d15-q3b', 'quiz', 'comprendre', c3, 'AI BOM', 'Que dresse l\'AI SPM ?', ['La nomenclature des charges IA.', 'AI BOM.'], [['Une facture.', 'Faux.'], ['Un pare-feu.', 'Faux.'], ['Un journal d\'audit.', 'Faux.']], 'AI BOM.'),
  Q('d15-q3c', 'quiz', 'securiser', c3, 'Cours', 'Où approfondir la sécurité des agents et des outils ?', ['Dans le cours IA agentique.', 'Lien de la plateforme.'], [['Dans ce module seulement.', 'Hors sujet ici.'], ['Nulle part.', 'Faux.'], ['Dans Storage.', 'Faux.']], 'Cours IA agentique.'),

  Q('d15-ev1', 'eval', 'comprendre', c1, 'Configurer les filtres', 'Defender for Cloud configure-t-il les filtres de contenu ?', ['Non.', 'C\'est la plateforme IA.'], [['Oui.', 'Faux.'], ['Seulement en production.', 'Faux.'], ['Seulement avec Owner.', 'Faux.']], 'Non.'),
  M('d15-ev2', 'eval', 'securiser', c2, 'Clouds non couverts', 'Cochez les environnements où la protection n\'est pas disponible.', [['Azure Government.', 'Oui.'], ['21Vianet.', 'Oui.'], ['Comptes AWS connectés.', 'Oui.']], [['Clouds commerciaux Azure.', 'Disponible.']], 'Trois exclusions.'),
  FX('d15-ev3', 'eval', 'securiser', c2, 'Corriger une alerte', 'Complétez la fiche d\'alerte fictive.', { alerte: '', cause: '', action: '', suivi: '' }, { alerte: 'jailbreak détecté non bloqué', cause: 'guardrail en annotation', action: 'corriger le guardrail avec l\'équipe IA', suivi: 'vérifier les invites voisines' }, [['alerte', 'jailbreak détecté non bloqué', 'Nommer l\'alerte.', 'comprendre'], ['cause', 'guardrail en annotation', 'Identifier la cause probable.', 'verifier'], ['action', 'corriger le guardrail avec l\'équipe IA', 'Désigner l\'action.', 'securiser'], ['suivi', 'vérifier les invites voisines', 'Prévoir le suivi.', 'maintenir']], 'Alerte, cause, action, suivi.'),
  OR('d15-ev4', 'eval', 'fonctionner', c2, 'Traiter une alerte IA', 'Ordonnez le traitement d\'une alerte IA.', ['Lire le type et l\'état (bloquée ou détectée)', 'Identifier la ressource et l\'appelant', 'Corréler avec les alertes voisines', 'Décider l\'action avec l\'équipe IA', 'Documenter'], 'Lire, identifier, corréler, décider, documenter.'),
  CF('d15-ev5', 'eval', 'cout', c2, 'Coût en jetons', 'Paramétrez la stratégie de coûts IA.', [['Estimer en jetons avant activation', 'on', 'Facturation par jetons.'], ['Activer sans essai ni estimation', 'off', 'Coût imprévu.'], ['Suivre le plafond de l\'essai', 'on', 'Facturation si dépassé.']], 'Estimation et suivi.'),
  WF('d15-ev6', 'eval', 'verifier', c3, 'Revue de licence', 'Ordonnez la revue de visibilité des agents.', ['Lister les agents attendus', 'Vérifier la licence Agent 365', 'Comparer l\'inventaire', 'Documenter l\'écart', 'Décider licence ou perte de visibilité'], [['Conclure à l\'absence d\'agents', 'Peut être un effet de licence.']], 'Lister, vérifier, comparer, documenter, décider.'),
  SH('d15-ev7', 'eval', 'verifier', c2, 'Essai en jours', 'Combien de jours dure l\'essai de la protection IA ? (nombre)', ['30'], '30 jours.', 30),
  Q('d15-ev8', 'eval', 'comprendre', c3, 'Foundry', 'Que découvre encore CSPM pour Foundry ?', ['Les comptes et projets.', 'Pas le niveau agent.'], [['Les agents.', 'Licence requise.'], ['Rien.', 'Faux.'], ['Les invites.', 'Faux.']], 'Comptes et projets.'),

  IN('d15-cs1', 'case', 'verifier', c1, 'Cas : promesses chez Nordlys', 'Promesses fictives : repérez celles à corriger.', 'text', [['« Defender bloque les jailbreaks, pas besoin de guardrail. »', 'Le blocage vient de la plateforme IA', 'Garder tel quel'], ['« Activer Defender configure les filtres. »', 'Aucune configuration des filtres', 'Garder tel quel']], 'Chaque promesse est corrigée.'),
  MT('d15-cs2', 'case', 'securiser', c2, 'Cas : alertes et actions', 'Associez chaque alerte à l\'action.', [['Jailbreak non bloqué', 'Corriger le guardrail'], ['Accès anormal à la ressource', 'Vérifier l\'appelant et les clés'], ['Reconnaissance du modèle', 'Surveiller les invites suivantes']], 'Chaque alerte a son action.'),
  WF('d15-cs3', 'case', 'verifier', c3, 'Cas : agents disparus', 'Ordonnez la réaction à une baisse d\'agents dans l\'inventaire.', ['Constater la baisse', 'Vérifier la date et la licence', 'Confirmer la découverte des comptes Foundry', 'Documenter la cause', 'Décider la suite'], [['Conclure que les agents ont été supprimés', 'Hypothèse non vérifiée.']], 'Constater, vérifier, confirmer, documenter, décider.'),
  OP('d15-cs-open', 'case', 'verifier', c1, 'Cas : sécurité IA de Nordlys', 'Rédigez la stratégie de sécurité IA d\'une organisation fictive.', 'Une page : couches, propriétaires, alertes, preuves, licences.', [['Les trois couches sont distinguées.', 'comprendre'], ['Les propriétaires sont nommés.', 'maintenir'], ['Les limites et licences sont énoncées.', 'verifier'], ['Les coûts en jetons sont estimés.', 'cout']], 'La stratégie relie couches, propriétaires, limites et coûts.'),

  Q('d15-rm1', 'remediation', 'comprendre', c1, 'Remédiation : couches', 'Qui bloque une invite malveillante ?', ['Le filtre de la plateforme IA.', 'Prompt Shields.'], [['Defender CSPM.', 'Non.'], ['Le SOC.', 'Non.'], ['Le pare-feu.', 'Non.']], 'Le filtre.'),
  Q('d15-rm2', 'remediation', 'securiser', c2, 'Remédiation : alerte', 'Que signifie « détectée, non bloquée » ?', ['Le filtre n\'a pas bloqué (mode ou confiance).', 'Revoir le guardrail.'], [['Aucun risque.', 'Faux.'], ['Faux positif sûr.', 'Faux.'], ['Attaque réussie certaine.', 'Non prouvé.']], 'Revoir le guardrail.'),
  Q('d15-rm3', 'remediation', 'verifier', c3, 'Remédiation : agents', 'Que faut-il pour la posture des agents Foundry ?', ['Une licence Agent 365.', 'Depuis 2026-07-01.'], [['Le plan Storage.', 'Faux.'], ['Rien.', 'Faux.'], ['Defender for DNS.', 'Faux.']], 'Agent 365.'),
];

const competencies = comps([
  ['Distinguer les couches de sécurité IA', 'Filtres, posture, menaces.', ['Je nomme les trois couches.', 'Je sais ce que Defender ne configure pas.', 'Je nomme les propriétaires.']],
  ['Exploiter la protection contre les menaces IA', 'Activation, alertes, preuves.', ['J’énonce couverture et clouds.', 'Je lis bloquée ou détectée.', 'Je cadre la preuve des invites.']],
  ['Lire la posture IA et les agents', 'AI SPM, Agent 365, limites.', ['Je décris l’AI BOM.', 'Je cite le changement de licence.', 'Je note les conflits documentaires.']],
]);

const projects = [
  P(1, 'débutant', 'Carte de responsabilité IA', 'Cartographier couches, propriétaires et revues pour une application d\'IA.', 'Tableau couche, propriétaire, revue, preuve.', ['Lister les couches.', 'Nommer les propriétaires.', 'Fixer les revues.'], ['Chaque couche a un propriétaire.'], ['Angles morts.'], ['Ajouter les alertes.']),
  P(2, 'intermédiaire', 'Plan d\'activation de la protection des services d\'IA', 'Concevoir l\'activation avec estimation en jetons et décision sur la preuve des invites.', 'Plan d\'activation et de revue des alertes.', ['Estimer les jetons.', 'Décider la preuve.', 'Définir le tri.'], ['Coûts maîtrisés.'], ['Fuite de contenu dans les alertes.'], ['Exporter vers le SIEM.'],
    { connected: { accounts: 'Un abonnement Azure de test avec un déploiement Azure OpenAI de laboratoire.', permissions: 'Owner sur l\'abonnement de test seulement.', costs: 'L\'essai gratuit de 30 jours est plafonné à 75 milliards de jetons; confirmer le coût au calculateur avant activation. Aucune activation payante automatique.', secrets: 'Aucune clé dans le dépôt; invites de test inoffensives.', cleanup: 'Désactiver le plan et supprimer le déploiement de laboratoire.', limits: 'Invites de test inoffensives, sans contenu réel. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Registre des changements de licence IA', 'Maintenir un registre daté des fonctions IA, licences et statuts.', 'Registre fonction, licence, statut, source, revue.', ['Lister les fonctions.', 'Dater les sources.', 'Planifier la revue.'], ['Aucune affirmation sans date.'], ['Statuts périmés.'], ['Relier au cours IA agentique.']),
];

export const d15 = assemble({ id: 'd15', level: 3, n: 15, title: 'Sécurité des services d’IA',
  summary: 'Trois couches de sécurité IA, protection contre les menaces des services d’IA, posture IA, agents et licence Agent 365, avec limites et conflits documentaires.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Sécuriser l’assistant interne de Nordlys Technologies',
  caseScenario: 'Vous cadrez les couches de sécurité d’un assistant d’IA, traitez des alertes et lisez les changements de licence. Données simulées.', caseMinutes: 50 });
