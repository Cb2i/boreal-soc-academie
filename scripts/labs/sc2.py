from _lib import *
labs=[]
def F(id,level,title,**kw): return L(id,'final',level,title,**kw)

labs.append(F('sc-f01','intermédiaire','Comparer trois fiches de décision',
 problem='Comparer trois scénarios du catalogue rubrique par rubrique pour dégager ce qui se répète, ce qui diffère et les pièges communs.',
 tools=['Fiches du catalogue','Tableur'],
 client="""Le comité de sécurité de **Nordlys** doit choisir lequel de trois chantiers lancer en premier : la protection contre l'hameçonnage, les règles de réduction de la surface d'attaque et l'accès conditionnel selon le risque. Chaque chantier a sa fiche, mais personne n'a comparé leurs dépendances, leurs délais et leurs échecs. Le comité demande une recommandation écrite, fondée sur les fiches, pas sur l'intuition.""",
 mission='Comparer les trois fiches rubrique par rubrique, repérer les dépendances communes, classer les risques et rédiger une recommandation d\'ordre de déploiement.',
 duration='2 h',
 parts=[
 P('Construire le tableau comparatif','Mettre les trois fiches côte à côte.',
 """Ouvrez les fiches des scénarios 1, 4 et 6 dans le catalogue. Construisez un tableau à trois colonnes et douze lignes (besoin, menace, signal, décideur, portail, exécutant, preuve, dépendances, délais, échecs, vérification, retour arrière).

1. Recopiez chaque rubrique en une phrase, sans changer le sens.
2. Surlignez les cases vides ou vagues.
3. Notez les rubriques où les trois fiches ne sont pas de même nature.""",
 """Le tableau fait ressortir que le besoin et la menace diffèrent mais que la structure décideur, exécutant, preuve est identique. Les cases vagues sont des faiblesses de la fiche, pas du produit. Comparer des rubriques de nature différente (une preuve et un délai) mène à de fausses conclusions.""",
 'Le tableau est complet et les rubriques non comparables sont signalées.'),
 P('Repérer dépendances et pièges communs','Repérer ce qui se répète entre les fiches.',
 """1. Quelles **dépendances** reviennent dans au moins deux fiches (antivirus actif, intégration de l'appareil, licence) ?
2. Quels **échecs silencieux** se ressemblent ?
3. Quel scénario dépend d'un autre, et dans quel ordre faut-il les déployer ?
4. Quel piège est propre à chacun ?""",
 """Les trois dépendent de l'intégration des appareils et de la santé du capteur. L'échec silencieux commun est « politique reçue, protection absente ». Le troisième scénario dépend de la conformité qui lit un signal du premier. Ces dépendances dictent l'ordre.""",
 'Les dépendances communes et l\'ordre de déploiement sont justifiés.'),
 P('Classer les risques de déploiement','Où l\'erreur coûte le plus cher.',
 """Notez chaque chantier de 1 à 5 sur : **risque d'interruption du travail**, **difficulté de retour arrière**, **effort de mesure préalable**, **valeur de réduction du risque**. Justifiez chaque note par une rubrique de la fiche.

1. Lequel est le plus dangereux à déployer sans pilote ?
2. Lequel apporte le plus de valeur pour le moins d'effort ?""",
 """L'accès conditionnel a le risque d'interruption le plus élevé et exige les comptes d'urgence ; les règles ASR exigent le plus de mesure ; l'hameçonnage apporte beaucoup de valeur avec un risque d'interruption plus faible. Les notes sont des jugements : chacune doit citer la fiche.""",
 'Chaque note est justifiée par une rubrique de fiche.'),
 P('Rédiger la recommandation','Rédiger une recommandation pour le comité.',
 """Rédigez la recommandation : **ordre proposé**, raison, dépendances à lever, indicateurs de succès, risques résiduels et ce que vous **ne savez pas** encore. Citez les fiches, pas des impressions.

1. Écrivez l'ordre en une phrase, puis trois raisons.
2. Listez les dépendances à lever avant de commencer.
3. Ajoutez la section « ce que nous ne savons pas ».""",
 """La recommandation nomme l'ordre, justifie par les dépendances et avoue les inconnues (par exemple le délai de propagation à mesurer). Une recommandation sans section « ce que nous ne savons pas » est suspecte.""",
 'La recommandation cite les fiches et inclut les inconnues.'),
 ],
 deliverables=['Le tableau comparatif.','La liste des dépendances communes.','La grille de risques.','La recommandation d\'une page.'],
 success=['Les trois fiches sont comparées rubrique par rubrique.','La synthèse nomme au moins deux pièges communs.','Aucune affirmation ne dépasse la fiche et ses sources.'],
 risks=['Comparer des rubriques de natures différentes.','Généraliser à partir d\'un seul cas.'],
 extensions=['Ajouter un quatrième scénario.','Proposer une rubrique supplémentaire à la fiche.'],
 mode='simule'))

labs.append(F('sc-f02','avancé','Un incident, de la détection à la restauration',
 problem='Enchaîner hameçonnage, risque d\'appareil, confinement et restauration sur un incident fictif, avec qui décide, qui applique et quelle preuve à chaque maillon.',
 tools=['Terrain de jeu KQL (contexte Defender XDR)','Fiches du catalogue','Éditeur de texte'],
 client="""**Nordlys** a vécu mercredi le 11 mars un incident en chaîne : un courriel d'hameçonnage, un clic, une exécution sur un poste, une connexion sortante. Le conseil d'administration veut un compte rendu **chronologique** : qu'est-ce qui a détecté quoi, qu'est-ce qui aurait dû bloquer, qui a décidé quoi, et ce qu'on change.""",
 mission='Reconstituer la chronologie à partir des données, relier chaque étape à une fiche de scénario, identifier les protections manquées et rédiger le plan d\'amélioration.',
 duration='2 h 30',
 parts=[
 P('Reconstituer la chronologie','Un seul fil de l\'arrivée du message à la sortie de données.',
 """```kql
EmailEvents
| where SenderFromDomain == "n0rdlys-login.example" and DeliveryAction == "Delivered"
| project Timestamp, RecipientEmailAddress, Subject
| order by Timestamp asc
```

```kql
DeviceProcessEvents
| where DeviceName startswith "PC-017" and Timestamp between (datetime(2026-03-11T10:00:00Z) .. datetime(2026-03-11T10:30:00Z))
| project Timestamp, InitiatingProcessFileName, FileName, ProcessCommandLine
| order by Timestamp asc
```

1. Écrivez la chronologie en une liste horodatée de huit lignes.
2. Quel intervalle sépare le clic de l'exécution ?
3. Quel est le dernier événement observé ?""",
 """La chronologie montre le message livré, le clic, puis l'exécution du document, la reconnaissance et la connexion sortante en quelques minutes. L'intervalle court est le point : la réponse humaine n'a pas pu intervenir, seule une protection automatique aurait pu.""",
 'La chronologie est horodatée et l\'intervalle clic-exécution est calculé.'),
 P('Relier chaque étape à une fiche','Qui devait protéger à chaque maillon.',
 """Pour chaque étape, indiquez la fiche concernée (hameçonnage, protection web et réseau, règles ASR, risque et accès, télémétrie, confinement) et remplissez : **ce qui devait arriver**, **ce qui est arrivé**, **la preuve**.

1. À quel maillon la chaîne aurait-elle dû s'interrompre ?
2. Quelle protection existait mais n'était qu'en audit ?
3. Quelle protection n'existait pas du tout ?""",
 """Plusieurs maillons existaient mais en mode audit : la règle sur Word et PowerShell consignait sans bloquer. La protection réseau ne couvrait pas le processus de la connexion sortante. Ce sont des **écarts de configuration**, pas des pannes de produit.""",
 'Chaque étape a une fiche, un attendu, un observé et une preuve.'),
 P('Évaluer la réponse','Détection, décision, confinement.',
 """1. Qui a détecté en premier, et après combien de temps ?
2. Quelle décision a été prise et par qui ?
3. Le confinement a-t-il préservé la preuve ?
4. Qu'est-ce qui a manqué dans la réponse (rôle, procédure, outil) ?
5. Quelle donnée manque pour répondre à la question 1 avec certitude ?
6. Qui devait être prévenu et l'a-t-il été ?""",
 """Une évaluation honnête distingue ce que les données prouvent de ce qu'on suppose. Si le moment exact de la détection n'est pas dans les données, on l'écrit comme inconnu. Les lacunes de procédure sont aussi importantes que les lacunes techniques.""",
 'Chaque affirmation est soit prouvée par les données, soit marquée comme inconnue.'),
 P('Écrire le plan d\'amélioration','Ce qu\'on change et dans quel ordre.',
 """Proposez cinq améliorations classées : action, scénario concerné, effort, effet attendu, responsable, indicateur. Ajoutez le **plan de restauration** et sa vérification, et les limites de votre analyse.

1. Triez les améliorations par effort croissant.
2. Indiquez pour chacune la preuve qui montrera qu'elle est faite.
3. Fixez une date de revue.""",
 """Un bon plan commence par les changements de configuration à faible effort (passer une règle en blocage après mesure, couvrir le processus réseau) puis les chantiers plus lourds. Chaque amélioration a un indicateur mesurable, pas seulement « renforcer ».""",
 'Chaque amélioration a un responsable, un effet attendu et un indicateur.'),
 ],
 deliverables=['La chronologie horodatée.','La table scénario, attendu, observé, preuve.','L\'évaluation de la réponse.','Le plan d\'amélioration.'],
 success=['Chaque étape a une fiche et une preuve.','Les délais sont discutés.','Le plan de restauration a une vérification et un retour arrière.'],
 risks=['Présenter la simulation comme une exécution réelle.','Oublier la restauration.'],
 extensions=['Ajouter la perte de télémétrie comme complication.','Présenter le compte rendu en dix minutes.'],
 mode='simule'))

labs.append(F('sc-f03','avancé','Audit de cohérence Defender et Intune',
 problem='Auditer la cohérence entre les politiques Intune et les paramètres Defender d\'un parc fictif : conflits, doublons, trous de couverture et preuves manquantes.',
 tools=['Tableur','Terrain de jeu KQL (contexte Defender XDR)'],
 client="""L'assureur de **Nordlys** demande une preuve de cohérence : les politiques de sécurité de gestion des appareils et les paramètres de Defender disent-ils la même chose ? L'équipe sait que plusieurs administrateurs ont créé des politiques sur trois ans et soupçonne des chevauchements, des trous et des preuves qui ne prouvent rien.

Votre mandat : un audit de cohérence avec un plan de correction par vagues.""",
 mission='Construire la matrice domaine par source de configuration, mesurer la couverture réelle, classer les écarts par risque et proposer un plan de correction vérifiable.',
 duration='2 h 30',
 parts=[
 P('Construire la matrice domaine par source','Savoir quelle source configure quel domaine.',
 """Listez les domaines (antivirus, ASR, protection réseau, pare-feu, chiffrement, comptes locaux, contrôle des appareils, intégration Defender). Pour chacun, indiquez les **sources de configuration** (politique de sécurité des terminaux, catalogue de paramètres, base de référence, portail Defender, stratégie de groupe héritée).

1. Quels domaines ont plus d'une source ?
2. Quels domaines n'ont aucune source identifiée ?
3. Quelle source a la priorité en cas de conflit ?""",
 """La matrice révèle des domaines à plusieurs sources (conflit potentiel) et d'autres sans source (trou). Une stratégie de groupe héritée sur des appareils maintenant gérés est une source de conflit fréquente. La priorité dépend de la source : il faut la documenter, pas la supposer.""",
 'Chaque domaine a ses sources et ses conflits potentiels.'),
 P('Mesurer la couverture réelle','Ce que disent les appareils.',
 """```kql
DeviceInfo
| summarize arg_max(Timestamp, *) by DeviceName
| summarize Appareils = count(), CapteurActif = countif(SensorHealthState == "Active"), Integres = countif(OnboardingStatus == "Onboarded") by MachineGroup
```

1. Quelle part des appareils est réellement visible par Defender ?
2. Quels groupes sont les moins couverts ?
3. Comment cet écart modifie-t-il la valeur des preuves de politique ?""",
 """La couverture réelle est inférieure au nombre d'appareils gérés : un rapport de politique « réussie » ne couvre pas les appareils silencieux. Cette mesure sert de **dénominateur honnête** à toutes les statistiques du dossier.""",
 'La couverture est chiffrée par groupe et utilisée comme dénominateur.'),
 P('Classer les écarts par risque','Prioriser les écarts selon le risque.',
 """Listez les écarts trouvés (conflit, doublon, trou, preuve manquante). Pour chacun : **domaine**, **risque**, **probabilité**, **effort de correction**, **propriétaire**.

1. Quels écarts sont à corriger avant l'audit ?
2. Lesquels sont acceptés avec une personne responsable ?
3. Lesquels dépendent d'une licence ou d'une décision d'affaires ?""",
 """Les trous de couverture sur des serveurs critiques passent avant les doublons inoffensifs. Un risque accepté nomme la personne et la date de revue. Les dépendances de licence sont signalées comme décision, pas comme défaut technique.""",
 'Chaque écart a un risque, un effort, un propriétaire et un statut.'),
 P('Planifier la correction par vagues et les preuves','Corriger sans créer de nouveaux conflits.',
 """Proposez trois vagues de correction avec pilote, critère de passage et retour arrière. Pour chaque correction, décrivez la **preuve** après coup (rapport, requête, état local) et la date de contrôle.

1. Comment évitez-vous de réintroduire des conflits ?
2. Quelle revue périodique proposez-vous ?""",
 """Chaque correction retire un réglage d'une source avant d'en renforcer une autre, par petits lots. La revue trimestrielle contrôle les rapports de conflit et la couverture. La preuve après coup est locale ou dans Defender, pas seulement le tableau de bord de gestion.""",
 'Chaque correction a une preuve datée et une revue périodique.'),
 ],
 deliverables=['La matrice domaine par source.','La mesure de couverture.','La liste d\'écarts classés.','Le plan de correction par vagues.'],
 success=['Aucune affirmation ne dépasse les données ou les sources.','Chaque écart a un propriétaire.','Le plan a des preuves et une revue périodique.'],
 risks=['Compter seulement les appareils gérés.','Corriger en masse sans pilote.'],
 extensions=['Automatiser l\'inventaire des politiques.','Ajouter un indicateur de dérive mensuel.'],
 mode='simule'))

emit('src/msec/scenarios/labsF.ts','SCENARIO_FINAL_LABS',labs)
