from _lib import *
exec(open('scripts/labs/_intcommon.py').read())
labs=[]
def A(m,level,title,**kw): return L('%s-p1'%m,m,level,title,**kw)

labs.append(A('m01','débutant','Politique d\'usage responsable de l\'IA pour un SOC',
 problem='Rédiger la politique d\'usage de l\'IA générative pour une équipe SOC de 12 personnes : quelles données, quels outils, quelle validation, quels coûts.',
 tools=['Éditeur de texte','Tableur'],
 client="""**Nordlys Technologies** exploite un SOC de 12 personnes. Depuis trois mois, plusieurs analystes collent des alertes, des adresses IP et parfois des extraits de courriels dans des assistants d'IA publics. Personne n'a écrit de règle, et la direction a entendu parler de « fuites par l'IA » dans la presse.

Vous êtes la personne désignée pour écrire la **politique d'usage** : simple, applicable, et qui n'interdit pas ce qui aide vraiment.""",
 mission='Inventorier les usages réels, classer les données par sensibilité, choisir les types d\'IA permis pour chaque classe, estimer les coûts et rédiger la politique d\'une page.',
 duration='90 min',
 parts=[
 P('Inventorier les usages réels','Savoir ce que font vraiment les analystes.',
 """À partir du tableau « Usages observés », classez chaque usage en trois colonnes : **utile**, **risqué**, **à encadrer**.

1. Quels usages manipulent des données de clients ou d'employés ?
2. Quels usages transmettent des secrets (clés, jetons, mots de passe) ?
3. Quels usages se feraient très bien avec des données **anonymisées** ?
4. Quel usage mérite d'être encouragé, et pourquoi ?""",
 """La colonne « à encadrer » est la plus grande. Les usages qui manipulent des données de clients ou des secrets sont risqués par défaut ; ceux qui travaillent sur du texte public ou anonymisé sont utiles. Un inventaire honnête évite une politique qui interdit tout et que personne ne respecte.""",
 'Chaque usage est classé avec la raison et au moins un usage est explicitement encouragé.'),
 P('Classer les données et choisir les outils permis','Relier sensibilité et type de déploiement.',
 """Construisez une matrice : lignes = classes de données (publique, interne, confidentielle, secrète), colonnes = types d'IA (service public, service d'entreprise avec contrat, modèle hébergé chez vous).

1. Pour chaque case, écrivez **permis**, **permis avec anonymisation** ou **interdit**.
2. Que faites-vous des secrets ?
3. Qui valide qu'un service est « d'entreprise » ?""",
 """Règle simple : rien de confidentiel dans un service public ; les secrets jamais, dans aucun outil ; le service d'entreprise sous contrat pour l'interne et le confidentiel anonymisé. L'équipe de sécurité valide la liste des services d'entreprise, pas chaque analyste.""",
 'La matrice a une réponse par case et une personne qui valide la liste des outils.'),
 P('Estimer coûts et contexte','Ne pas découvrir le coût à la facture.',
 """Calculez pour un assistant de résumé d'alertes : 200 alertes par jour, 800 jetons d'entrée et 250 jetons de sortie en moyenne.

1. Jetons par jour, par mois (22 jours ouvrables).
2. Coût mensuel avec un tarif fictif de 3 $ par million de jetons d'entrée et 12 $ par million de sortie.
3. Que devient le coût si l'on ajoute le runbook complet (6000 jetons) à chaque appel ?
4. Quelle limite fixez-vous ?""",
 """Environ 160 000 jetons d'entrée et 50 000 de sortie par jour ; le coût mensuel reste modeste. Ajouter le runbook complet multiplie les jetons d'entrée par près de huit : le coût suit et le contexte se remplit. La leçon : mesurer avant de généraliser, fixer un plafond et une alerte.""",
 'Les calculs sont justes et un plafond avec alerte est défini.'),
 P('Rédiger la politique d\'une page','Un texte court que les gens liront.',
 """Rédigez la politique : **objet**, **ce qui est permis**, **ce qui est interdit**, **validation humaine obligatoire** pour toute décision, **qui contacter**, **revue semestrielle**.

1. Écrivez-la en moins de 350 mots.
2. Ajoutez un exemple concret de bon usage et un de mauvais.
3. Ajoutez la phrase sur les hallucinations : l'IA peut inventer, l'analyste vérifie.""",
 """Une bonne politique tient sur une page, donne des exemples et nomme un contact. La phrase sur les hallucinations est essentielle : sans elle, l'équipe traitera la sortie du modèle comme un fait. Relisez enfin la politique avec deux analystes : si l'un d'eux ne sait pas répondre à « puis-je coller cette alerte ? » en dix secondes, le texte est trop long ou trop flou.""",
 'La politique tient en une page avec exemples, contact et règle de validation humaine.'),
 ],
 deliverables=['L\'inventaire des usages classés.','La matrice données et outils.','Le calcul de coût.','La politique d\'une page.'],
 success=['Les secrets ne vont jamais dans un outil d\'IA.','Chaque classe de données a une règle.','La validation humaine est obligatoire.'],
 risks=['Interdire sans alternative.','Ignorer le coût du contexte.','Traiter la sortie du modèle comme un fait.'],
 extensions=['Ajouter un modèle de demande d\'approbation d\'un nouvel outil.','Mesurer l\'usage après un mois.'],
 facts=[('Usages observés',['Usage','Donnée manipulée','Fréquence'],[['Résumer une alerte','Extrait d\'alerte avec noms d\'hôtes','Quotidien'],['Expliquer une commande PowerShell','Ligne de commande d\'un poste','Hebdomadaire'],['Rédiger un rapport','Chronologie d\'un incident client','Hebdomadaire'],['Déboguer un script','Script contenant une clé d\'API','Occasionnel'],['Traduire un courriel suspect','Courriel complet d\'un employé','Occasionnel']])],
 mode='simule'))

labs.append(A('m02','débutant','Workflow ou agent : choisir sans se tromper',
 problem='Analyser cinq tâches d\'un SOC et décider, pour chacune, entre workflow fixe, assistant ou agent, en justifiant par autonomie, outils et risques.',
 tools=['Tableur','Éditeur de texte'],
 client="""Le responsable du SOC de **Nordlys** veut « un agent pour tout ». Vous devez lui montrer, tâche par tâche, quand un **workflow fixe** suffit, quand un **assistant** aide, et quand seulement un **agent** se justifie, avec les garde-fous correspondants. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.""",
 mission='Classer cinq tâches selon la prévisibilité, le risque et l\'autonomie nécessaire, puis définir pour la tâche retenue le périmètre, les outils et la limite de l\'agent.',
 duration='90 min',
 parts=[
 P('Décrire cinq tâches avec les mêmes critères','Comparer des choses comparables.',
 """Pour les cinq tâches du tableau « Tâches candidates », remplissez : **entrées**, **étapes connues d\'avance ?**, **décisions à prendre**, **effet d\'une erreur**, **fréquence**.

1. Quelles tâches ont des étapes totalement prévisibles ?
2. Quelles tâches exigent un jugement sur des données variables ?
3. Quelles tâches ont un effet irréversible si elles se trompent ?""",
 """Les tâches à étapes connues (normaliser un indicateur) sont des workflows. Celles qui demandent de résumer ou d'expliquer sont des assistants. Seule une tâche à étapes variables et à exploration peut justifier un agent, et seulement si l'erreur est réversible ou approuvée par un humain.""",
 'Les cinq tâches ont les mêmes critères remplis et les effets irréversibles sont identifiés.'),
 P('Décider et justifier','Faire un choix par tâche avec sa raison.',
 """Choisissez pour chaque tâche : **workflow**, **assistant** ou **agent**. Écrivez en une phrase pourquoi, et ce que vous perdez avec le choix plus simple.

1. Quelle tâche tentera le plus d'utiliser un agent à tort ?
2. Quelle est la règle de décision générale que vous en tirez ?""",
 """Règle utile : choisir le plus simple qui accomplit la tâche. Un agent ajoute de l'imprévisibilité, des coûts et une surface d'attaque. On le garde pour les cas où le chemin ne peut pas être écrit d'avance.""",
 'Chaque choix a une raison et la règle générale est écrite.'),
 P('Définir le périmètre de la tâche retenue','Fixer outils, mémoire et limites de l\'agent.',
 """Pour la seule tâche qui justifie un agent, écrivez : **outils permis** (lecture seulement ?), **outils interdits**, **mémoire** (aucune, session, persistante), **nombre maximal d'étapes**, **budget**, **actions qui exigent une approbation**.

1. Quel outil ne donnerez-vous jamais à l'agent ?
2. Que se passe-t-il quand il atteint la limite d'étapes ?""",
 """Un agent de triage reçoit des outils de lecture, jamais d'isolement ou de suppression sans approbation. À la limite d'étapes, il s'arrête et transmet un état à un humain, il ne continue pas « pour finir ».""",
 'Le périmètre liste outils permis, interdits, limites et approbations.'),
 P('Écrire la carte de décision','Un outil pour les collègues.',
 """Rédigez une carte d'une page : trois questions que l'on pose avant de construire (les étapes sont-elles connues ? l'erreur est-elle réversible ? qui approuve ?), et le choix correspondant. Ajoutez un exemple pour chaque réponse.

1. Testez la carte sur une tâche que vous n'avez pas utilisée.
2. Ajoutez la mention de la personne qui approuve les agents.""",
 """La carte tient en un arbre à trois questions. Les exemples la rendent utilisable. Elle sert de porte d'entrée pour toute demande d'automatisation à venir. Chaque demande passe par les trois questions, et la réponse est consignée avec la date : au bout de quelques mois, la liste des décisions devient un historique utile pour la revue des agents.""",
 'La carte utilise trois questions et un exemple par résultat.'),
 ],
 deliverables=['La grille des cinq tâches.','Les décisions justifiées.','Le périmètre de l\'agent retenu.','La carte de décision.'],
 success=['Le choix le plus simple est préféré.','Les actions irréversibles exigent une approbation.','Le périmètre est écrit avant la construction.'],
 risks=['Choisir un agent par enthousiasme.','Donner des outils d\'écriture sans approbation.','Oublier la limite d\'étapes.'],
 extensions=['Appliquer la carte à vos propres tâches.','Ajouter une colonne coût estimé.'],
 facts=[('Tâches candidates',['Tâche','Description'],[['Normaliser un indicateur','Mettre une adresse IP, un domaine ou un hachage dans un format commun'],['Résumer une alerte','Produire trois phrases à partir d\'une alerte'],['Enquêter sur un incident','Chercher dans plusieurs sources selon ce qu\'on trouve'],['Créer un billet','Remplir un formulaire de billet à partir d\'une alerte'],['Isoler un poste','Retirer un poste du réseau après détection']])],
 mode='simule'))

labs.append(A('m03','débutant','Les erreurs HTTP et JSON qui cassent les automatisations',
 problem='Diagnostiquer six appels d\'API qui échouent, corriger les requêtes et les réponses JSON, et écrire le dictionnaire de codes de l\'équipe.',
 tools=['Éditeur de texte','Python 3 facultatif'],
 client="""Les automatisations du SOC de **Nordlys** échouent plusieurs fois par semaine avec des messages obscurs : « 401 », « 429 », « JSON invalide ». Personne ne sait lire ces erreurs. Vous recevez six cas réels (fictifs) et devez en tirer un **dictionnaire** que toute l'équipe pourra utiliser. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.""",
 mission='Diagnostiquer six échecs, corriger la requête ou la lecture de la réponse, et rédiger le dictionnaire de codes avec la première action à faire.',
 duration='90 min',
 parts=[
 P('Lire les six cas','Distinguer l\'erreur du client, du serveur et du réseau.',
 """Pour chaque cas du tableau « Cas d\'échec », écrivez : **qui est en faute** (nous, le service, le réseau), **la cause probable**, **ce qu\'on vérifie en premier**.

1. Quels codes indiquent que *nous* avons mal formulé la demande ?
2. Quels codes invitent à réessayer plus tard ?
3. Quel code ne doit jamais être réessayé tel quel ?""",
 """Les codes 4xx indiquent en général une demande à corriger (401 authentification, 403 permission, 404 ressource, 429 trop de demandes). Les 5xx invitent à réessayer avec délai. Réessayer un 401 ou un 400 sans changement est inutile et peut bloquer un compte.""",
 'Chaque cas a une cause, un responsable et une première vérification.'),
 P('Corriger les requêtes','Du JSON et des en-têtes valides.',
 """Voici une requête fautive :

```json
{
  "indicateur": "203.0.113.45",
  "type": "ip",
  "priorite": haute,
}
```

1. Trouvez les **deux** erreurs de syntaxe JSON.
2. Quel en-tête indique le type de contenu envoyé ?
3. Où met-on la clé d'API (jamais dans l'URL) ?
4. Écrivez la version corrigée.""",
 """Les erreurs : `haute` doit être entre guillemets et la virgule finale est interdite en JSON. L'en-tête de type de contenu déclare le format. La clé d'API va dans un en-tête d'autorisation, pas dans l'URL, car les URL se retrouvent dans les journaux.""",
 'La requête corrigée est un JSON valide et la clé n\'est pas dans l\'URL.'),
 P('Lire une réponse sans la supposer','Vérifier avant d\'utiliser.',
 """Une réponse arrive :

```json
{"statut": "ok", "resultat": {"score": "87", "etiquettes": []}}
```

1. Le score est-il un nombre ou du texte ? Quelle conséquence si vous comparez `score > 80` ?
2. Que faites-vous d'une liste d'étiquettes vide ?
3. Quel champ pourrait être absent la prochaine fois ?
4. Quelles vérifications écrivez-vous avant d'utiliser la réponse ?""",
 """Le score est du texte : une comparaison peut donner un résultat faux selon le langage. Une liste vide est une valeur valide, pas une erreur. Il faut tester la présence des champs, leur type, et prévoir un comportement par défaut explicite.""",
 'Vous avez listé les vérifications de présence, de type et de valeur par défaut.'),
 P('Écrire le dictionnaire de l\'équipe','Un outil de référence d\'une page.',
 """Rédigez le dictionnaire : pour chaque code (200, 201, 400, 401, 403, 404, 429, 500, 503), écrivez **sens**, **première action**, **réessayer ou non**.

1. Ajoutez la règle du délai croissant pour les réessais.
2. Ajoutez où trouver la limite de débit dans la réponse.""",
 """Le dictionnaire donne une action par code. Pour 429, on respecte l'en-tête qui indique l'attente. Les réessais avec délai croissant et plafond évitent d'aggraver une panne. Le dictionnaire précise aussi que 401 et 403 ne se réessayent jamais tels quels, qu'une erreur 500 inexpliquée se signale après trois essais, et qu'on note la date de la dernière révision du document.""",
 'Le dictionnaire couvre neuf codes avec action et règle de réessai.'),
 ],
 deliverables=['Le diagnostic des six cas.','La requête corrigée.','La liste des vérifications de réponse.','Le dictionnaire de codes.'],
 success=['Aucune clé dans une URL.','Les réessais sont bornés.','Chaque code a une première action.'],
 risks=['Réessayer sans limite.','Supposer qu\'un champ existe.','Journaliser des secrets.'],
 extensions=['Écrire un validateur Python.','Ajouter la gestion de la pagination.'],
 facts=[('Cas d\'échec',['Cas','Observation'],[['A','Réponse 401 après un changement de clé'],['B','Réponse 429 lors d\'un lot de 500 indicateurs'],['C','Réponse 200 mais corps vide'],['D','Réponse 500 une fois sur dix'],['E','JSON invalide : guillemets simples'],['F','Délai d\'attente dépassé après 30 secondes']])],
 mode='simule'))

labs.append(A('m04','débutant','Cartographier une tâche répétitive à automatiser',
 problem='Décomposer une tâche répétitive du SOC en déclencheur, étapes, données et erreurs, puis décider ce qui s\'automatise et ce qui reste humain.',
 tools=['Tableur','Éditeur de texte'],
 client="""Chaque matin, un analyste de **Nordlys** passe 40 minutes à copier des indicateurs d'un courriel de veille vers un tableur, à les vérifier un par un et à créer des billets. Le gestionnaire veut automatiser, mais ne sait pas par où commencer et craint de créer 200 faux billets. Vous livrez un dossier que le comité pourra relire sans vous : chaque décision y est justifiée, datée et attribuée à une personne nommée.""",
 mission='Cartographier la tâche, identifier déclencheur, données et décisions, concevoir la déduplication et les réessais et planifier le test des pannes.',
 duration='90 min',
 parts=[
 P('Décrire la tâche telle qu\'elle est faite','Observer le travail réel avant de concevoir.',
 """Notez chaque étape que fait l'analyste, avec : **action**, **donnée utilisée**, **décision éventuelle**, **durée**.

1. Quelles étapes sont purement mécaniques ?
2. Quelles étapes demandent un jugement ?
3. Où l'analyste corrige-t-il des erreurs de la source ?
4. Quel est le **déclencheur** réel (heure, arrivée d'un courriel) ?""",
 """On trouve typiquement : lire le courriel, extraire les indicateurs, retirer les doublons, vérifier chaque indicateur, décider d'un billet. Les étapes d'extraction et de dédoublonnage sont mécaniques ; la décision de créer un billet demande du jugement, ou une règle claire.""",
 'Chaque étape est classée mécanique ou jugement.'),
 P('Concevoir les données et la déduplication','Éviter les doublons et les pertes de données.',
 """1. Quelle **clé unique** identifie un indicateur (type + valeur normalisée) ?
2. Comment normalisez-vous (minuscules, retrait des points d'inactivation) ?
3. Où gardez-vous la liste des indicateurs déjà traités ?
4. Que fait le workflow s'il est lancé deux fois ?""",
 """La clé combine le type et la valeur normalisée. Une table des indicateurs traités avec date évite de recréer des billets. Un workflow qui peut être lancé deux fois sans effet double est dit **idempotent** : c'est la propriété à viser.""",
 'La clé unique et le comportement en cas de double exécution sont définis.'),
 P('Prévoir erreurs et réessais','Prévoir les pannes qui arriveront forcément.',
 """Listez cinq pannes (source indisponible, limite de débit, indicateur mal formé, billet déjà existant, outil de billets en panne). Pour chacune : **détection**, **réessai ou non**, **qui est alerté**, **état laissé**.

1. Quelle panne doit arrêter le lot entier ?
2. Laquelle peut être sautée avec une note ?""",
 """Une source indisponible reporte le lot ; un indicateur mal formé est mis de côté avec une note ; un outil de billets en panne arrête la création mais conserve la file. Toute erreur laisse un état connu et une trace.""",
 'Chaque panne a une détection, une décision et un état final.'),
 P('Planifier les tests de panne','Prouver la robustesse avant la production.',
 """Concevez un jeu de huit cas de test : indicateur valide, doublon, valeur vide, adresse privée, domaine très long, source qui répond lentement, lot de 500, panne à mi-parcours. Écrivez le résultat attendu de chacun.

1. Marquez les cas qui doivent échouer proprement (entrée vide, valeur trop longue).
2. Marquez ceux qui doivent réussir sans doublon (deux exécutions successives).
3. Précisez comment vous contrôlez l'état final : nombre de billets créés, journal.""",
 """Un jeu de tests pour un workflow est un tableau d'entrées et de résultats attendus. Le cas « panne à mi-parcours » vérifie qu'on reprend sans doublon ni perte. Le cas du lot de 500 vérifie le débit, et le cas de l'adresse privée vérifie qu'on ne soumet pas à un service externe une donnée interne. Écrire ces résultats avant le développement évite d'ajuster les attentes au comportement observé.""",
 'Les huit cas ont une entrée et un résultat attendu écrits avant le développement.'),
 ],
 deliverables=['La cartographie de la tâche.','Le schéma de données et de déduplication.','Le tableau des pannes.','Le jeu de huit cas de test.'],
 success=['Le workflow est idempotent par conception.','Chaque panne a un traitement.','Les cas de test précèdent le développement.'],
 risks=['Automatiser sans normaliser.','Créer des doublons.','Ignorer les pannes partielles.'],
 extensions=['Ajouter un tableau de bord du temps économisé.','Ajouter une approbation humaine avant la création de billets.'],
 mode='simule'))

labs.append(A('m05','intermédiaire','Un webhook n8n qui normalise et enrichit un indicateur',
 problem='Concevoir un workflow n8n recevant un webhook, normalisant un indicateur, l\'enrichissant (simulé) avec limite de débit et validation, avec revue de sécurité.',
 tools=['n8n (facultatif)','Éditeur JSON','Ressources du parcours (workflows n8n)'],
 client="""Le SOC de **Nordlys** veut un point d'entrée unique : un outil de détection envoie un indicateur par webhook, le workflow le normalise, interroge un service de réputation (simulé), puis renvoie un verdict structuré. L'équipe de sécurité exige une revue avant tout usage : authentification du webhook, aucune donnée sensible dans les journaux, limite de débit.""",
 mission='Concevoir le flux nœud par nœud, définir le schéma d\'entrée et de sortie, gérer la limite de débit et les erreurs, et passer la revue de sécurité.',
 duration='2 h',
 parts=[
 P('Définir le contrat d\'entrée et de sortie','Définir un schéma avant de poser les nœuds.',
 """Écrivez le contrat :

```json
{
  "entree": {"type": "ip|domaine|hachage", "valeur": "texte", "source": "texte"},
  "sortie": {"type": "texte", "valeur_normalisee": "texte", "verdict": "inconnu|bénin|suspect", "raison": "texte"}
}
```

1. Quels champs sont obligatoires ?
2. Que répond-on à une entrée invalide, et avec quel code HTTP ?
3. Comment authentifiez-vous l'appelant ?""",
 """Type et valeur sont obligatoires. Une entrée invalide reçoit un 400 avec une raison, sans exécuter la suite. L'appelant s'authentifie par un secret partagé dans un en-tête, vérifié dès le premier nœud, et le secret vit dans le coffre d'identifiants du système, pas dans le flux.""",
 'Le contrat distingue champs obligatoires, erreurs et authentification.'),
 P('Concevoir le flux nœud par nœud','Suivre le chemin du webhook à la réponse.',
 """Listez les nœuds dans l'ordre : réception, vérification du secret, validation du schéma, normalisation, vérification de doublon, enrichissement, construction du verdict, réponse.

1. Pour chacun, précisez l'entrée et la sortie.
2. Où placez-vous le nœud de gestion d'erreur ?
3. Quel nœud ne doit pas pouvoir être contourné ?""",
 """La vérification du secret est le premier nœud et rien ne s'exécute avant. La gestion d'erreur renvoie toujours une réponse structurée. Chaque nœud ne dépend que de la sortie du précédent, ce qui facilite les tests.""",
 'Chaque nœud a une entrée, une sortie et la vérification du secret est en premier.'),
 P('Gérer la limite de débit et les réessais','Respecter le service externe.',
 """Le service de réputation (simulé) permet 4 appels par seconde.

1. Comment espacez-vous les appels dans un lot de 100 indicateurs ?
2. Que faites-vous d'une réponse 429 ?
3. Comment mettre en cache un verdict récent pour éviter un appel ?
4. Quelle durée de cache choisissez-vous et pourquoi ?""",
 """On espace les appels à 250 millisecondes ou moins, on respecte l'attente demandée en cas de 429 et on garde un cache court (quelques heures) : une réputation change. Un cache trop long fait manquer un indicateur devenu malveillant.""",
 'Le débit, le traitement du 429 et la durée du cache sont justifiés.'),
 P('Passer la revue de sécurité','Ce que l\'équipe de sécurité va demander.',
 """Répondez par écrit à ces questions : **où vivent les secrets**, **que contiennent les journaux**, **qui peut appeler le webhook**, **que se passe-t-il en cas d'entrée malveillante** (valeur de 10 Mo, caractères de contrôle), **qui a accès au flux**, **comment on le met à jour**.""",
 """Les journaux ne contiennent ni secret ni corps complet. La taille d'entrée est plafonnée. L'accès au flux est limité et les modifications sont versionnées. Chaque réponse est une affirmation que quelqu'un peut vérifier.""",
 'Chaque question de la revue a une réponse vérifiable.'),
 ],
 deliverables=['Le contrat d\'entrée et de sortie.','Le plan de nœuds.','La stratégie de débit et de cache.','Le dossier de revue de sécurité.'],
 success=['Le secret est vérifié en premier.','Les entrées sont plafonnées et validées.','Aucun secret n\'apparaît dans les journaux.'],
 risks=['Secret dans le flux.','Aucune limite de taille.','Cache trop long.'],
 extensions=['Ajouter un second fournisseur de réputation.','Versionner le flux dans un dépôt.'],
 mode='tenant', connected=conn('Une instance n8n de test, non exposée à Internet, et un service de réputation fictif.','Supprimer le workflow, le webhook et les identifiants de test.','Facultatif : tout le lab fonctionne en simulation ; n\'exposez jamais un webhook de test à Internet.')))

labs.append(A('m06','intermédiaire','Choisir et sécuriser l\'outil d\'automatisation',
 problem='Comparer Logic Apps, Power Automate, Functions et n8n pour trois besoins, et rédiger la fiche d\'identité et de permissions du playbook retenu.',
 tools=['Tableur','Éditeur de texte'],
 client="""**Nordlys** a trois besoins d'automatisation : enrichir des indicateurs, créer des billets, et envoyer un résumé quotidien à la direction. Quatre outils sont disponibles et chaque équipe a son favori. Le responsable de la sécurité demande que le choix soit fondé sur des critères écrits et que l'outil retenu ait une **identité dédiée** avec le moins de permissions possible.""",
 mission='Définir les critères, noter les outils pour chaque besoin, choisir et écrire la fiche d\'identité et de permissions du playbook retenu.',
 duration='2 h',
 parts=[
 P('Définir les critères','Mesurer la même chose pour chaque outil.',
 """Choisissez six critères et leur poids : intégration avec les outils du SOC, coût, compétences de l'équipe, sécurité et gestion des secrets, journalisation et audit, souplesse.

1. Justifiez le poids de chaque critère.
2. Lequel est éliminatoire (par exemple : pas de gestion centralisée des secrets) ?
3. Comment évitez-vous que le critère « compétences » favorise toujours l'outil connu ?""",
 """Les critères de sécurité et d'audit sont souvent éliminatoires. Le critère « compétences » doit être pondéré avec prudence : un outil connu mal sécurisé reste un mauvais choix. Les poids sont écrits avant les notes pour éviter de les ajuster au résultat voulu.""",
 'Les critères et leurs poids sont écrits avant toute notation.'),
 P('Noter et choisir','Prendre une décision défendable.',
 """Notez chaque outil de 1 à 5 pour chaque besoin, avec une phrase de justification. Calculez le total pondéré.

1. Un outil peut-il gagner pour un besoin et perdre pour un autre ?
2. Le résultat vous surprend-il ? Que vérifiez-vous alors ?
3. Quelle est la décision finale pour chaque besoin ?""",
 """Il est normal qu'un seul outil ne gagne pas partout. Un résultat surprenant doit mener à vérifier le critère ou la note, pas à les ajuster. Limiter le nombre d'outils réduit le coût de maintenance : c'est un critère à discuter.""",
 'Chaque note a une phrase et la décision par besoin est écrite.'),
 P('Rédiger la fiche d\'identité et de permissions','Le moins de pouvoir possible.',
 """Pour le playbook de création de billets, remplissez : **identité utilisée** (dédiée, jamais un compte personnel), **permissions** (lire les alertes, créer des billets, rien d'autre), **où vivent les secrets**, **qui peut modifier le playbook**, **journalisation**, **procédure de révocation**.

1. Quelle permission refusez-vous de donner pour des raisons de commodité ?
2. Comment révoquez-vous l'accès en cas d'incident ?""",
 """Une identité dédiée avec lecture des alertes et création de billets. Refuser toute permission de suppression ou d'administration. La révocation passe par la désactivation de l'identité, testée à l'avance.""",
 'La fiche liste identité, permissions minimales, secrets, modifications et révocation.'),
 P('Vérifier avec un test de permissions','Prouver que les limites tiennent.',
 """Écrivez cinq tests de permission : le playbook tente de lire une alerte (doit réussir), de créer un billet (doit réussir), de supprimer un billet (doit échouer), de lire un secret d'une autre application (doit échouer), de modifier sa propre configuration (doit échouer).

1. Comment conservez-vous la preuve ?
2. À quelle fréquence refaites-vous ces tests ?""",
 """Un test de permission est un test d'échec attendu : la preuve est le refus. On les rejoue à chaque changement de rôle et chaque trimestre. Un test jamais exécuté est marqué « non exécuté ». La preuve est une capture ou un journal daté, rangé avec la fiche, de sorte que l'auditeur puisse la retrouver sans vous demander.""",
 'Les cinq tests ont un résultat attendu et une fréquence.'),
 ],
 deliverables=['La grille de critères pondérés.','Le tableau de notes et la décision.','La fiche d\'identité et de permissions.','Les cinq tests de permission.'],
 success=['Les critères sont écrits avant les notes.','L\'identité est dédiée et minimale.','Les tests de permission ont des résultats attendus.'],
 risks=['Choisir l\'outil connu par habitude.','Compte personnel pour un playbook.','Permissions larges par commodité.'],
 extensions=['Ajouter le coût total sur trois ans.','Automatiser les tests de permission.'],
 mode='simule'))

emit('src/agentic/content/labs1.ts','IA_LABS_1',labs)
