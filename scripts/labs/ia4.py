from _lib import *
exec(open('scripts/labs/_intcommon.py').read())
labs=[]
def F(id,level,title,**kw): return L(id,'final',level,title,**kw)
def Q(title,goal,steps,exp,chk):
    if len(steps)<=265: steps+="\n\nConsignez vos réponses dans un tableau (question, réponse, preuve ou source, responsable, date de revue) : un dossier sans traçabilité ne se défend pas devant un comité ou un auditeur."
    if len(exp)<=215: exp+=" Ce corrigé est une base de discussion, pas une vérité : comparez avec votre version, notez chaque écart et décidez s'il révèle une erreur de votre part ou un choix légitime différent. Datez la décision et nommez la personne qui l'a prise."
    if len(goal)<=27: goal+=" dans ce projet de synthèse"
    return P(title,goal,steps,exp,chk)

labs.append(F('f01','avancé','Assistant de triage SOC avec validation humaine',
 problem='Construire de bout en bout un assistant de triage : cadrage, schéma de sortie, file d\'approbation, évaluation et mise en service par modes.',
 tools=['Éditeur de texte','Tableur','Terrain de jeu KQL (contexte Sentinel)'],
 client="""Le SOC de **Nordlys** reçoit 300 alertes par jour pour trois analystes. La direction veut un assistant qui prépare le triage, mais exige que **chaque décision reste humaine**. Vous livrez le dossier complet : cadrage, conception, évaluation, plan de mise en service. Rien n'est déployé : ce projet de synthèse est entièrement simulé avec des données fictives.""",
 mission='Cadrer le périmètre, concevoir la sortie structurée et la file d\'approbation, définir l\'évaluation et le plan de mise en service par modes.',
 duration='3 h',
 parts=[
 Q('Cadrer le périmètre','Décider ce que l\'assistant fait et ne fait pas.',
 """1. Listez les alertes **dans le périmètre** et celles qui en sont exclues (par exemple les alertes de gravité élevée touchant des systèmes critiques).
2. Écrivez en une phrase le rôle de l'assistant : proposer, jamais décider.
3. Quels outils en lecture lui donnez-vous ?
4. Quelle donnée ne doit jamais lui être transmise ?""",
 """Le périmètre exclut explicitement les cas où une erreur est irréversible. Le rôle est « proposer ». Les outils sont en lecture seule. Les secrets et les données personnelles inutiles ne sont jamais transmis. Un périmètre écrit permet d'évaluer l'assistant contre ce qu'il devait faire.""",
 'Le périmètre contient des exclusions explicites et un rôle de proposition.'),
 Q('Concevoir la sortie et la file d\'approbation','Un format vérifiable et une décision humaine.',
 """1. Définissez le schéma : classification, gravité, preuves citées, prochaine action proposée, niveau de confiance.
2. Quelles validations automatiques appliquez-vous (preuves présentes dans l'entrée, valeurs permises) ?
3. Que voit l'approbateur et que peut-il faire (accepter, modifier, refuser) ?
4. Que se passe-t-il sans réponse ?""",
 """Le schéma exige des preuves citées vérifiables dans l'entrée. L'approbateur voit la proposition, les preuves et peut modifier. Sans réponse, rien n'est exécuté et l'alerte reste dans la file avec une échéance d'escalade.""",
 'Le schéma, les validations et la file d\'approbation sont décrits.'),
 Q('Définir l\'évaluation','Mesurer par rapport à une référence humaine.',
 """1. Constituez un jeu de 30 alertes étiquetées par deux analystes.
2. Définissez les métriques : accord, faux négatifs graves, preuves valides, refus appropriés.
3. Fixez les seuils avant la mesure.
4. Que dites-vous d'un échantillon de 30 cas ?""",
 """Les faux négatifs graves ont un seuil propre. Un échantillon de 30 est indicatif et son insuffisance statistique est écrite. Les désaccords entre étiqueteurs sont documentés.""",
 'Les métriques, les seuils et la limite de l\'échantillon sont écrits.'),
 Q('Planifier la mise en service','Ombre, assisté, actif limité.',
 """1. Décrivez les trois modes et les critères de passage.
2. Qui peut arrêter l'assistant et comment ?
3. Quels indicateurs surveillez-vous en continu ?
4. Quel retour arrière prévoyez-vous ?""",
 """Chaque mode a des critères mesurés et un responsable. L'arrêt est possible par un rôle désigné. La surveillance suit le taux de fermeture et les faux négatifs graves. Le retour arrière consiste à revenir au triage manuel, avec une procédure testée.""",
 'Les modes ont des critères, un arrêt et un retour arrière testés sur papier.'),
 ],
 deliverables=['Le cadrage du périmètre.','La spécification de la sortie et de la file.','Le protocole d\'évaluation.','Le plan de mise en service.'],
 success=['La décision reste humaine.','Les faux négatifs graves sont suivis à part.','Un mode ombre précède l\'assistance.'],
 risks=['Périmètre flou.','Seuil fixé après la mesure.','Aucune coupure d\'urgence.'],
 extensions=['Ajouter une métrique de temps gagné.','Étendre à une seconde source d\'alertes.'],
 context='sentinel', mode='simule'))

labs.append(F('f02','intermédiaire','Enrichissement d\'indicateurs avec n8n',
 problem='Concevoir un workflow n8n d\'enrichissement d\'indicateurs avec normalisation, déduplication, limite de débit, gestion d\'erreurs et revue de sécurité.',
 tools=['n8n (facultatif)','Éditeur JSON','Ressources du parcours (workflows n8n)'],
 client="""**Nordlys** veut enrichir automatiquement les indicateurs (adresses IP, domaines, hachages) provenant des alertes. Aujourd'hui, chaque analyste copie les valeurs dans un site de réputation. Le responsable veut un workflow fiable, sans doublons, qui respecte les limites du service et dont la sécurité a été revue.""",
 mission='Spécifier le contrat, le flux, la déduplication et la limite de débit, les pannes et la revue de sécurité du workflow d\'enrichissement.',
 duration='2 h 30',
 parts=[
 Q('Spécifier le contrat et le flux','Entrées, sorties et nœuds.',
 """1. Définissez le contrat d'entrée (type, valeur, source) et de sortie (valeur normalisée, verdict, raison, date).
2. Listez les nœuds : réception, secret, validation, normalisation, déduplication, enrichissement, réponse.
3. Quel nœud est le premier et pourquoi ?
4. Que répondez-vous à une entrée invalide ?""",
 """La vérification du secret est le premier nœud. Une entrée invalide reçoit une erreur claire sans enrichissement. Les nœuds forment une chaîne dont chaque maillon se teste seul.""",
 'Le contrat, les nœuds et le traitement des entrées invalides sont décrits.'),
 Q('Dédupliquer et limiter le débit','Ne pas appeler deux fois et ne pas dépasser.',
 """1. Quelle clé identifie un indicateur déjà traité ?
2. Quelle durée de cache pour un verdict ?
3. Comment espacez-vous les appels pour respecter 4 appels par seconde ?
4. Que faites-vous d'un 429 ?""",
 """Clé : type plus valeur normalisée. Cache court, car une réputation change. Les appels sont espacés et un 429 déclenche l'attente demandée par le service, avec un nombre maximal d'essais.""",
 'La clé, le cache et le traitement du 429 sont justifiés.'),
 Q('Prévoir les pannes','Un état connu quoi qu\'il arrive.',
 """1. Listez cinq pannes et leur traitement.
2. Que contient la réponse quand le service d'enrichissement est indisponible ?
3. Comment évitez-vous de perdre un lot à mi-parcours ?
4. Qui est alerté et quand ?""",
 """Le workflow renvoie « inconnu » avec la raison plutôt que d'échouer silencieusement. Le lot est repris à l'indicateur interrompu. L'alerte part après un nombre défini d'échecs consécutifs.""",
 'Chaque panne a un traitement et un état final connu.'),
 Q('Passer la revue de sécurité','Les questions de l\'équipe de sécurité.',
 """Répondez par écrit : où vivent les secrets, que contiennent les journaux, qui peut appeler le webhook, quelle taille d'entrée maximale, qui peut modifier le workflow, comment il est versionné et sauvegardé.""",
 """Chaque réponse est vérifiable : coffre de secrets, journaux sans corps complet, authentification par secret partagé, plafond de taille, accès restreint, workflow exporté et versionné.""",
 'Chaque question de la revue a une réponse vérifiable.'),
 ],
 deliverables=['Le contrat et le plan des nœuds.','La stratégie de déduplication et de débit.','Le tableau des pannes.','Le dossier de revue de sécurité.'],
 success=['Le workflow est idempotent.','Le secret est vérifié en premier.','Les pannes laissent un état connu.'],
 risks=['Cache trop long.','Pas de plafond de taille.','Secret dans le flux.'],
 extensions=['Ajouter un second fournisseur.','Ajouter un tableau de bord de volume.'],
 mode='tenant', connected=conn('Une instance n8n de test non exposée et un service de réputation fictif.','Supprimer le workflow, le webhook et les identifiants de test.','Facultatif : tout fonctionne en simulation ; n\'exposez jamais un webhook de test à Internet.')))

labs.append(F('f03','avancé','Assistant KQL avec schéma vérifié',
 problem='Spécifier un assistant KQL avec schéma généré, garde-fou, banc d\'essai de 20 questions et exigences de mise en service.',
 tools=['Terrain de jeu KQL (contexte Sentinel)','Tableur'],
 client="""Les analystes de **Nordlys** écrivent beaucoup de KQL, souvent sous pression. Un assistant pourrait accélérer le travail, mais il invente des colonnes et oublie les filtres de temps. Vous spécifiez un assistant dont **chaque requête est vérifiée contre le schéma réel** avant exécution. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.""",
 mission='Définir la source du schéma, les règles du garde-fou, le banc d\'essai et les critères de mise en service.',
 duration='3 h',
 parts=[
 Q('Générer et fournir le schéma','La vérité vient de la source.',
 """Exécutez pour inspecter les données :

```kql
SigninLogs
| summarize Connexions = count() by ResultType
| order by Connexions desc
```

1. Quelles tables et colonnes l'assistant doit-il connaître ?
2. Comment générez-vous le schéma automatiquement ?
3. Combien de tables donnez-vous par question ?
4. Que répond-il si la donnée n'existe pas ?""",
 """Le schéma est généré depuis la source réelle et limité aux tables pertinentes. Si la donnée n'existe pas, l'assistant le dit. Copier le schéma à la main garantit une dérive.""",
 'Le schéma est généré et le cas de donnée absente est prévu.'),
 Q('Écrire le garde-fou','Refuser avant d\'exécuter.',
 """Écrivez dix règles : table existante, colonnes existantes, filtre de temps, plafond de lignes, pas de jointure sans filtre, pas de fonctions interdites, longueur maximale, lecture seule, nombre de jointures, résultat vide signalé.

1. Écrivez le message d'erreur de chaque règle.
2. Quelle règle protège le coût ?""",
 """Les messages d'erreur sont actionnables pour que l'assistant se corrige. Le filtre de temps et le plafond protègent le coût. Le garde-fou ne vérifie pas la justesse sémantique.""",
 'Dix règles ont chacune un message d\'erreur.'),
 Q('Bâtir le banc de 20 questions','Mesurer validité et justesse.',
 """Écrivez 20 questions : 8 simples, 6 moyennes, 6 pièges. Pour chacune : requête de référence, résultat attendu, propriété à vérifier.

1. Comment comparez-vous le résultat à la référence ?
2. Quel seuil avant la mise en service ?
3. Comment mesurez-vous la variabilité ?""",
 """On compare les résultats, pas le texte de la requête. Plusieurs requêtes différentes peuvent être correctes. Le seuil est fixé avant, et la variabilité est mesurée sur plusieurs exécutions.""",
 'Les 20 questions ont une référence, un seuil et une mesure de variabilité.'),
 Q('Critères de mise en service','Qui l\'utilise, avec quoi.',
 """1. Qui y a accès et avec quelles permissions de lecture ?
2. Comment affichez-vous la requête avant exécution ?
3. Quel journal gardez-vous ?
4. Quand réévaluez-vous ?""",
 """L'analyste voit toujours la requête avant l'exécution. Les permissions de lecture sont limitées aux tables autorisées. Le journal permet d'auditer. La réévaluation suit chaque changement de modèle ou de schéma.""",
 'Les critères de mise en service sont écrits avec journal et réévaluation.'),
 ],
 deliverables=['La spécification du schéma.','Les dix règles du garde-fou.','Le banc de 20 questions.','Les critères de mise en service.'],
 success=['Aucune requête sans validation.','Le schéma est généré.','Les pièges sont dans le banc.'],
 risks=['Schéma copié à la main.','Comparer le texte au lieu du résultat.','Oublier la variabilité.'],
 extensions=['Ajouter l\'explication en langage clair.','Ajouter une estimation de coût.'],
 context='sentinel', mode='simule'))

labs.append(F('f04','avancé','Pipeline de priorisation des vulnérabilités',
 problem='Concevoir un pipeline qui priorise les vulnérabilités avec contexte, règle lisible, jeux de test et billets validés.',
 tools=['Tableur','Python 3 facultatif'],
 client="""**Nordlys** a des centaines de constats ouverts. La priorisation par gravité seule envoie l'équipe sur de fausses pistes. Vous spécifiez un pipeline qui combine gravité, exploitation, exposition et valeur de l'actif, dont chaque rang s'explique en une phrase. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.""",
 mission='Définir les sources et la validation des données, la règle de score, les tests et le traitement des billets de correction.',
 duration='3 h',
 parts=[
 Q('Définir sources et validation','Des données propres avant le score.',
 """1. Listez les sources : export des constats, inventaire des actifs, liste d'exploitation connue.
2. Définissez les validations : colonnes obligatoires, valeurs permises, doublons.
3. Que faites-vous d'un actif absent de l'inventaire ?
4. Que faites-vous d'une gravité manquante ?""",
 """Chaque anomalie reçoit un traitement explicite et visible dans le rapport. Un actif inconnu est signalé, pas ignoré. Une gravité manquante n'est jamais remplacée par une valeur faible.""",
 'Chaque anomalie de données a un traitement explicite.'),
 Q('Écrire la règle de score','Lisible et explicable.',
 """1. Définissez le score : gravité de base, multiplicateur d'exploitation, d'exposition, ajustement de valeur.
2. Testez sur cinq constats et écrivez l'explication d'une phrase de chaque rang.
3. Que faites-vous des égalités ?""",
 """La règle est simple et chaque rang est justifié. Les égalités se départagent par un critère documenté (exposition, puis ancienneté).""",
 'La règle produit une explication d\'une phrase par rang.'),
 Q('Concevoir les tests','Protéger contre les régressions.',
 """1. Écrivez un jeu de 10 constats avec classement attendu.
2. Écrivez trois cas limites (donnée manquante, égalité, valeur inconnue).
3. Que testez-vous après un changement de règle ?""",
 """Un changement de règle doit modifier les rangs de façon prévue et expliquée. Les cas limites évitent les surprises. Le jeu de test est versionné avec la règle.""",
 'Le jeu de test couvre les cas limites et suit la version de la règle.'),
 Q('Valider les billets de correction','L\'assistant rédige, le code vérifie.',
 """1. Quels faits d'un billet doivent être retrouvés dans les données ?
2. Que faites-vous d'un billet qui cite un correctif inexistant ?
3. Qui approuve l'envoi ?
4. Quel indicateur de suivi proposez-vous (délai de correction par priorité) ?""",
 """Chaque fait est vérifié contre la source. Un billet invalide est rejeté et consigné. L'envoi est approuvé par une personne. Le délai par priorité sert à ajuster la règle avec l'expérience.""",
 'Les billets sont vérifiés et approuvés, avec un indicateur de suivi.'),
 ],
 deliverables=['Les sources et validations.','La règle de score.','Le jeu de test.','Les contrôles des billets.'],
 success=['Aucune donnée manquante n\'est masquée.','Chaque rang est explicable.','Aucun billet ne contient un fait non vérifié.'],
 risks=['Formule opaque.','Valeur par défaut rassurante.','Règle modifiée sans test.'],
 extensions=['Ajouter un délai cible.','Lier au suivi de correction.'],
 mode='simule'))

labs.append(F('f05','avancé','Assistant documentaire RAG avec citations',
 problem='Spécifier un assistant documentaire qui répond avec citations vérifiées, résiste à l\'empoisonnement et se réévalue à chaque changement de document.',
 tools=['Éditeur de texte','Python 3 facultatif'],
 client="""**Nordlys** a une centaine de documents (runbooks, politiques, procédures). Les analystes veulent poser des questions et obtenir des réponses **avec la source**. Un test a montré qu'un document modifié par erreur pouvait faire recommander une action dangereuse. Vous spécifiez un assistant résistant à ce problème.""",
 mission='Définir la préparation des documents, la consigne de citation, les défenses contre l\'empoisonnement et le protocole d\'évaluation.',
 duration='3 h',
 parts=[
 Q('Préparer les documents','Des morceaux fiables et datés.',
 """1. Définissez le découpage (taille, respect des titres).
2. Listez les métadonnées par morceau : document, section, version, date, propriétaire.
3. Que faites-vous des versions obsolètes ?
4. Qui peut ajouter un document à l'index ?""",
 """Les métadonnées permettent de citer précisément. Les versions obsolètes sont retirées. L'ajout passe par une revue : c'est la défense principale contre l'empoisonnement.""",
 'Le découpage, les métadonnées et la revue d\'ajout sont décrits.'),
 Q('Exiger et vérifier les citations','Pas de réponse sans source.',
 """1. Rédigez la consigne : répondre seulement d'après les morceaux, citer, dire « je ne sais pas ».
2. Comment vérifiez-vous l'existence d'une citation ?
3. Comment échantillonnez-vous le soutien réel ?
4. Que faites-vous d'une réponse sans citation ?""",
 """L'existence se vérifie automatiquement ; le soutien par échantillonnage humain. Une réponse sans citation est refusée ou marquée non vérifiée.""",
 'La vérification d\'existence est automatique et celle du soutien est échantillonnée.'),
 Q('Se défendre contre l\'empoisonnement','Une source n\'est pas une instruction.',
 """1. Comment délimitez-vous les morceaux dans la requête ?
2. Quelle phrase de la consigne indique que le contenu est de la donnée ?
3. Quels signaux cherchez-vous dans les nouveaux documents (impératifs adressés au modèle) ?
4. Que se passe-t-il si une recommandation dangereuse apparaît ?""",
 """Les morceaux sont délimités et traités comme données. Une recommandation dangereuse déclenche une revue humaine et une alerte. Les contrôles de contenu aident, mais la gouvernance de l'index reste la défense principale.""",
 'Les morceaux sont des données et une recommandation dangereuse déclenche une revue.'),
 Q('Évaluer et surveiller','Rejouer à chaque changement.',
 """1. Constituez 20 questions avec réponse et source attendues, dont 4 pièges.
2. Définissez les métriques : bonne réponse, bonne citation, refus approprié.
3. Fixez le seuil avant.
4. Quand rejouez-vous le banc ?""",
 """Le banc est rejoué à chaque changement de document, de modèle ou de consigne. Les pièges incluent un document empoisonné de test. Le seuil précède la mesure.""",
 'Le banc de 20 questions est rejoué à chaque changement.'),
 ],
 deliverables=['Le plan de préparation.','La consigne de citation.','Les défenses contre l\'empoisonnement.','Le banc d\'évaluation.'],
 success=['Aucune réponse sans citation.','Les documents sont des données.','Le banc est rejoué à chaque changement.'],
 risks=['Index ouvert à tous.','Version obsolète citée.','Citation non vérifiée.'],
 extensions=['Ajouter un score de fraîcheur.','Ajouter un retour des utilisateurs.'],
 mode='simule'))

labs.append(F('f06','intermédiaire','Générateur de rapport d\'incident',
 problem='Concevoir un générateur de rapport d\'incident où chaque affirmation est rattachée à une preuve et où les chiffres sont calculés par le code.',
 tools=['Éditeur de texte','Terrain de jeu KQL (contexte Defender XDR)'],
 client="""Après chaque incident, **Nordlys** passe des heures à rédiger le rapport, souvent avec des affirmations sans preuve. Vous spécifiez un générateur qui assemble les faits, laisse un assistant proposer la rédaction, et refuse toute affirmation non rattachée à une preuve. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.""",
 mission='Définir la structure du rapport, la collecte des preuves, les contrôles de fidélité et le processus de relecture.',
 duration='2 h 30',
 parts=[
 Q('Définir la structure','Un rapport lisible et vérifiable.',
 """1. Listez les sections : résumé, chronologie, impact, confiance, actions, inconnues.
2. Pour chaque section, quelle donnée est calculée par le code et laquelle est rédigée ?
3. Comment numérotez-vous les preuves ?""",
 """Les chiffres et les heures viennent du code. La rédaction vient de l'assistant ou de l'analyste. Les preuves sont numérotées et citées dans le texte.""",
 'Chaque section distingue le calculé du rédigé.'),
 Q('Collecter les preuves','Des requêtes documentées.',
 """```kql
DeviceNetworkEvents
| where RemoteUrl == "cdn.exfil-demo.example"
| project Timestamp, DeviceName, InitiatingProcessFileName, RemoteUrl, RemoteIP
| order by Timestamp asc
```

1. Quelle preuve cette requête fournit-elle ?
2. Qu'est-ce qu'elle ne prouve pas ?
3. Comment conservez-vous la requête et sa date d'exécution ?""",
 """Elle prouve une connexion sortante datée depuis un poste. Elle ne prouve pas le contenu transféré. La requête et la date accompagnent la preuve pour qu'on puisse la rejouer.""",
 'Chaque preuve garde sa requête, sa date et ses limites.'),
 Q('Contrôler la fidélité','Aucune affirmation orpheline.',
 """1. Comment vérifiez-vous que chaque phrase factuelle cite une preuve ?
2. Comment vérifiez-vous que les nombres du texte existent dans les chiffres calculés ?
3. Que faites-vous d'une affirmation non soutenue ?
4. Comment signalez-vous les inconnues ?""",
 """Un contrôle automatique repère les nombres absents du tableau de chiffres et les phrases sans citation. Une affirmation non soutenue est supprimée ou déplacée vers les inconnues.""",
 'Les nombres et affirmations sont contrôlés et les inconnues sont explicites.'),
 Q('Relecture et diffusion','Un humain signe.',
 """1. Qui relit et qui signe ?
2. À qui diffuse-t-on et sous quelle forme ?
3. Comment conservez-vous les versions ?
4. Quel retour d'expérience ajoutez-vous après l'incident ?""",
 """Une personne identifiée signe le rapport. La diffusion respecte la confidentialité. Les versions sont conservées. Le retour d'expérience alimente les améliorations.""",
 'La relecture, la signature et la diffusion sont attribuées.'),
 ],
 deliverables=['Le modèle de rapport.','Les requêtes de preuve.','Les contrôles de fidélité.','Le processus de relecture.'],
 success=['Aucune affirmation sans preuve.','Les chiffres sont calculés.','Les inconnues sont déclarées.'],
 risks=['Laisser le modèle calculer.','Affirmer une absence sans preuve.','Pas de signature.'],
 extensions=['Ajouter un résumé exécutif.','Ajouter une version anglaise.'],
 mode='simule'))

labs.append(F('f07','intermédiaire','Préparation de billets avec Logic Apps',
 problem='Concevoir un flux Logic Apps qui prépare des billets à partir d\'alertes, avec identité dédiée, approbation, déduplication et journalisation.',
 tools=['Éditeur de texte','Tableur'],
 client="""Les analystes de **Nordlys** perdent du temps à créer des billets à la main. Un flux Logic Apps pourrait **préparer** le billet, mais l'équipe de sécurité veut que l'envoi reste approuvé par une personne, que l'identité soit dédiée et que les doublons soient évités. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.""",
 mission='Spécifier le déclencheur, le flux, l\'identité et les permissions, l\'approbation et la journalisation.',
 duration='2 h 30',
 parts=[
 Q('Spécifier déclencheur et flux','De l\'alerte au brouillon de billet.',
 """1. Quel déclencheur (nouvel incident, étiquette) ?
2. Listez les étapes : lecture de l'alerte, déduplication, rédaction du brouillon, approbation, création.
3. Que contient le brouillon (titre, résumé, preuves, gravité) ?
4. Que faites-vous si une alerte est déjà liée à un billet ?""",
 """Le flux ne crée le billet qu'après l'approbation. La déduplication utilise l'identifiant de l'incident. Le brouillon contient uniquement des faits retrouvables dans l'alerte.""",
 'Le flux est séquentiel, dédupliqué et approuvé avant la création.'),
 Q('Définir identité et permissions','Le moins de pouvoir possible.',
 """1. Quelle identité utilise le flux (dédiée) ?
2. Quelles permissions : lire les incidents, créer des billets, rien d'autre.
3. Où vivent les connexions et secrets ?
4. Qui peut modifier le flux ?""",
 """Identité dédiée à lecture et création de billets. Les connexions sont gérées par la plateforme, pas écrites dans le flux. Les modifications passent par une revue.""",
 'L\'identité est dédiée, minimale et les secrets ne sont pas dans le flux.'),
 Q('Concevoir l\'approbation','Une personne décide.',
 """1. Qui approuve et dans quel délai ?
2. Que voit l'approbateur ?
3. Que se passe-t-il sans réponse ?
4. Comment conservez-vous la trace de l'approbation ?""",
 """L'approbateur voit le brouillon et les preuves. Sans réponse, le brouillon expire et l'alerte reste visible. La trace contient l'identité de l'approbateur et l'heure.""",
 'L\'approbation a un approbateur, un délai, une expiration et une trace.'),
 Q('Journaliser et surveiller','Savoir ce que le flux a fait.',
 """1. Que journalisez-vous (identifiants, décisions, erreurs) ?
2. Que ne journalisez-vous pas ?
3. Quelles alertes créez-vous (échecs répétés, volume anormal) ?
4. Comment mesurez-vous le temps gagné ?""",
 """Le journal permet de retrouver chaque billet et sa décision. Les alertes détectent les échecs répétés et les rafales. Le temps gagné se mesure avant et après sur un échantillon.""",
 'Le journal et les alertes sont définis sans données sensibles inutiles.'),
 ],
 deliverables=['Le schéma du flux.','La fiche d\'identité et de permissions.','La conception de l\'approbation.','Le plan de journal et d\'alertes.'],
 success=['Aucun billet sans approbation.','Les doublons sont évités.','Aucun secret dans le flux.'],
 risks=['Création automatique sans approbation.','Identité partagée.','Aucun suivi des échecs.'],
 extensions=['Ajouter une priorité suggérée.','Ajouter un rapport mensuel.'],
 mode='simule'))

labs.append(F('f08','avancé','Agent d\'examen de posture Azure en lecture seule',
 problem='Cadrer un agent qui examine la posture Azure en lecture seule, produit un rapport de constats et ne peut rien modifier.',
 tools=['Éditeur de texte','Tableur'],
 client="""**Nordlys** veut un examen régulier de sa posture Azure : comptes sans MFA, rôles trop larges, ressources exposées. La direction accepte un agent qui **lit et rapporte**, mais refuse catégoriquement qu'il modifie quoi que ce soit. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.""",
 mission='Définir les lectures permises, prouver l\'absence de permission d\'écriture, structurer le rapport et cadrer les limites.',
 duration='3 h',
 parts=[
 Q('Définir les lectures permises','Un inventaire de ce qu\'on regarde.',
 """1. Listez les domaines examinés : identités, rôles, stockage, réseau, journaux.
2. Pour chacun, la lecture exacte et le rôle de lecture requis.
3. Quelles données personnelles pourraient apparaître et comment les réduisez-vous ?
4. Quelle périodicité ?""",
 """On liste des lectures précises, avec le rôle minimal. Les données personnelles sont minimisées dans le rapport. La périodicité équilibre fraîcheur et coût.""",
 'Chaque domaine a une lecture précise et un rôle minimal.'),
 Q('Prouver l\'absence d\'écriture','Un test d\'échec attendu.',
 """1. Quelle identité utilise l'agent ?
2. Écrivez cinq tests de permission qui doivent échouer (créer, modifier, supprimer, assigner un rôle, lire un secret).
3. Comment conservez-vous la preuve ?
4. À quelle fréquence rejouez-vous ?""",
 """Le refus est la preuve. Les tests sont rejoués à chaque changement de rôle et chaque trimestre. Un test non exécuté est marqué ainsi.""",
 'Cinq tests d\'échec attendu prouvent l\'absence d\'écriture.'),
 Q('Structurer le rapport','Constat, preuve, risque, correction.',
 """1. Définissez le format d'un constat : titre, ressource, preuve, risque, correction suggérée, niveau de confiance.
2. Comment priorisez-vous ?
3. Comment évitez-vous les faux positifs répétés (exceptions datées) ?
4. À qui le rapport est-il envoyé ?""",
 """Chaque constat cite la preuve. Les exceptions ont un propriétaire et une date. Le rapport propose des corrections, qu'une personne applique par le processus normal.""",
 'Le format du constat contient preuve, risque et niveau de confiance.'),
 Q('Cadrer les limites','Ce que l\'agent ne sait pas.',
 """1. Que ne voit-il pas (ressources hors périmètre, données hors lecture) ?
2. Comment gérez-vous une hallucination possible dans le rapport ?
3. Qui valide avant diffusion ?
4. Quelle revue périodique de l'agent lui-même ?""",
 """Le rapport indique son périmètre et ses angles morts. Les constats sont vérifiables dans la source. Une personne valide avant diffusion. L'agent lui-même est revu semestriellement.""",
 'Les limites du rapport sont écrites et un validateur humain est nommé.'),
 ],
 deliverables=['L\'inventaire des lectures.','Les cinq tests de permission.','Le format de rapport.','Les limites et la revue.'],
 success=['Aucune permission d\'écriture, prouvée par un test.','Chaque constat a une preuve.','Les angles morts sont déclarés.'],
 risks=['Rôle trop large par commodité.','Constat sans preuve.','Rapport diffusé sans validation.'],
 extensions=['Ajouter un score de posture.','Comparer avec le rapport du mois précédent.'],
 mode='tenant', connected=conn('Un abonnement de laboratoire avec quelques ressources de test.','Retirer l\'identité de lecture et supprimer les ressources de test.','Facultatif : ne donnez jamais à l\'agent un rôle autre que lecteur et n\'utilisez jamais un abonnement de production.')))

labs.append(F('f09','avancé','Banc d\'évaluation et de sécurité d\'agents',
 problem='Concevoir un banc commun d\'évaluation et de tests de sécurité réutilisable pour tous les agents du SOC, avec seuils et rapports.',
 tools=['Tableur','Éditeur de texte'],
 client="""**Nordlys** prévoit plusieurs agents (triage, KQL, documents, posture). Chaque équipe évalue à sa façon, avec des seuils différents. La direction demande un **banc commun** : mêmes catégories de tests, mêmes seuils minimaux, mêmes rapports, pour que « évalué » signifie la même chose partout. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.""",
 mission='Définir les catégories de tests, les seuils, le format de rapport et la gouvernance du banc.',
 duration='3 h',
 parts=[
 Q('Définir les catégories de tests','Ce que tout agent doit passer.',
 """1. Listez les catégories : exactitude, citations, refus appropriés, injection, détournement d'outils, fuite de données, coût, variabilité.
2. Pour chacune, trois cas types.
3. Quelles catégories sont communes et lesquelles propres à un agent ?""",
 """Un noyau commun (injection, détournement d'outils, fuite) s'applique à tous. Les catégories propres (exactitude KQL, citations) s'ajoutent. Chaque catégorie a des cas écrits.""",
 'Le noyau commun et les catégories propres sont distingués.'),
 Q('Fixer les seuils','Avant toute mesure.',
 """1. Fixez un seuil par catégorie (par exemple zéro faux négatif grave en injection sur le jeu).
2. Comment justifiez-vous chaque seuil ?
3. Que faites-vous d'un jeu trop petit pour conclure ?
4. Qui peut modifier un seuil ?""",
 """Les seuils sont écrits, justifiés et modifiés par une personne désignée avec trace. Un jeu trop petit se déclare comme tel : on ne conclut pas à la sécurité.""",
 'Chaque seuil est justifié et sa modification est tracée.'),
 Q('Définir le rapport','Honnête et comparable.',
 """1. Format : version du jeu, version de l'agent, résultats par catégorie, taux et intervalles, cas échoués.
2. Comment présentez-vous les résultats sans écrire « sécurisé » ?
3. Où archivez-vous les rapports ?""",
 """Le rapport présente des taux observés sur un échantillon et liste les échecs. Il n'emploie jamais « sécurisé » sans qualification. Les rapports sont archivés avec les versions.""",
 'Le rapport présente des taux, des échecs et les versions utilisées.'),
 Q('Gouverner le banc','Le garder vivant.',
 """1. Qui entretient le banc ?
2. Comment ajoutez-vous un cas après un incident ?
3. À quelle fréquence rejouez-vous ?
4. Quel lien avec la décision de mise en service ?""",
 """Chaque incident ajoute un cas de test. Le banc est rejoué à chaque changement. La mise en service exige un rapport à jour au-dessus des seuils.""",
 'Le banc a un propriétaire, un rythme de rejeu et un lien avec la mise en service.'),
 ],
 deliverables=['Le catalogue de catégories.','Les seuils justifiés.','Le modèle de rapport.','La gouvernance du banc.'],
 success=['Les seuils précèdent les mesures.','Le rapport ne conclut jamais « sécurisé ».','Chaque incident ajoute un cas.'],
 risks=['Seuils ajustés après coup.','Jeu trop petit pour conclure.','Banc jamais mis à jour.'],
 extensions=['Automatiser le rejeu.','Ajouter une comparaison entre agents.'],
 mode='simule'))

emit('src/agentic/content/labsF.ts','IA_FINAL_LABS',labs)
