from _lib import *
exec(open('scripts/labs/_intcommon.py').read())
labs=[]
def S(n,level,title,**kw): return L('sl%02d'%n,'s%02d'%n,level,title,**kw)

labs.append(S(1,'débutant','Un hameçonnage de bout en bout : du courriel au poste',
 problem='Reconstituer une campagne d\'hameçonnage fictive en suivant le message, le clic et le poste, puis remplir la fiche de décision du scénario.',
 tools=['Terrain de jeu KQL (contexte Defender XDR)','Fiche de décision du scénario'],
 client="""**Nordlys Technologies** a reçu mercredi le 11 mars une campagne de courriels prétendant venir du service des TI. Une employée de la comptabilité dit avoir cliqué, un poste a affiché un comportement bizarre, et la direction demande : « Qui nous protège à chaque étape, et qu'est-ce qui a vraiment fonctionné ? »

Votre rôle : analyste. Vous reconstituez la chaîne avec les données fictives du parcours, puis vous remplissez la fiche de décision (qui décide, qui applique, quelle preuve).""",
 mission='Compter les messages livrés et bloqués, retrouver les clics, suivre le poste atteint, puis attribuer décision, application et preuve à chaque maillon.',
 duration='90 min',
 parts=[
 P('Compter ce qui est arrivé dans les boîtes','Séparer livré, bloqué et mis en quarantaine.',
 """1. Résumez la campagne par domaine d'expéditeur et par verdict :

```kql
EmailEvents
| where SenderFromDomain in ("n0rdlys-login.example", "invoice-nordlys.example")
| summarize Messages = count(), Destinataires = dcount(RecipientEmailAddress) by SenderFromDomain, DeliveryAction, DeliveryLocation
```

2. Notez combien de messages ont atteint une boîte de réception.
3. Quelle couche (filtrage du courriel) a laissé passer le reste, et quel mécanisme peut retirer un message **après** livraison ?""",
 """Vous devriez voir huit messages pour le premier domaine, dont six livrés et deux bloqués ou mis en quarantaine, et une seconde campagne plus petite. Le point clé : un message livré n'est pas un message sans risque. Le retrait après livraison (ZAP) agit avec un délai, et un message peut être lu avant son retrait.""",
 'Vous avez chiffré livrés et bloqués par campagne et nommé le mécanisme de retrait après livraison.'),
 P('Retrouver les clics et le poste','Passer du courriel au poste par le réseau.',
 """1. Trouvez les liens contenus dans les messages livrés :

```kql
EmailEvents
| where SenderFromDomain == "n0rdlys-login.example" and DeliveryAction == "Delivered"
| join kind=inner (EmailUrlInfo) on NetworkMessageId
| project Timestamp, RecipientEmailAddress, Url
```

2. Cherchez qui a réellement contacté ce domaine :

```kql
DeviceNetworkEvents
| where RemoteUrl == "n0rdlys-login.example"
| project Timestamp, DeviceName, InitiatingProcessAccountName, InitiatingProcessFileName, RemoteUrl
| order by Timestamp asc
```

3. Combien de destinataires ont un clic observé, et pourquoi tous les destinataires n'apparaissent-ils pas ?""",
 """Trois postes contactent le domaine, alors que six messages ont été livrés : la différence est composée de messages non ouverts, de clics hors du parc géré ou d'appareils qui n'envoient pas de signal. **Absence de signal n'est pas absence de clic.** Notez cette limite dans votre fiche.""",
 'Vous avez relié messages livrés, liens et clics observés, avec la limite des clics non observables.'),
 P('Suivre ce qui s\'est exécuté sur le poste','Voir la suite de la chaîne sur un poste précis.',
 """1. Sur le poste du clic de 9 h 12, listez les processus créés par Office ou PowerShell :

```kql
DeviceProcessEvents
| where DeviceName startswith "PC-017" and (InitiatingProcessFileName =~ "WINWORD.EXE" or FileName =~ "powershell.exe")
| project Timestamp, DeviceName, AccountName, InitiatingProcessFileName, FileName, ProcessCommandLine
| order by Timestamp asc
```

2. Regardez si les règles de réduction de la surface d'attaque ont réagi :

```kql
DeviceEvents
| where DeviceName startswith "PC-017" and ActionType startswith "Asr"
| project Timestamp, ActionType, FileName, InitiatingProcessFileName
| order by Timestamp asc
```

3. Les règles ont-elles **bloqué** ou seulement **consigné** ?""",
 """On voit Word lancer PowerShell, une commande encodée, un `whoami` puis une connexion sortante. Les événements ASR sont en **audit** (« Audited ») : la règle a vu mais n'a pas bloqué. C'est l'enseignement central : la politique existait, la protection n'était pas active. Le mode compte autant que la règle.""",
 'Vous avez distingué audit et blocage sur le poste atteint.'),
 P('Remplir la fiche de décision','Attribuer qui décide, qui applique et quelle preuve.',
 """Remplissez la fiche pour ce scénario :

1. **Besoin** et **menace** en une phrase chacun, sans nommer de produit pour le besoin.
2. **Qui décide** à l'étape du courriel et à l'étape du poste (deux produits, deux portails).
3. **Qui applique** à chaque étape.
4. **Preuve** à chaque étape, avec la requête ou le rapport qui la fournit.
5. Une phrase sur le **retour arrière** si une politique de courriel bloque un message légitime.""",
 """Courriel : la protection de la messagerie décide et applique (liens, pièces jointes, retrait après livraison) ; poste : la politique Intune décide, l'antivirus applique (règle ASR, protection réseau). La preuve du courriel est l'explorateur de menaces ; celle du poste est dans Defender for Endpoint. Retour arrière : libérer le message légitime et ajuster la politique, pas la désactiver.""",
 'Les rôles sont distincts à chaque étape et chaque preuve a sa source.'),
 ],
 deliverables=['Le décompte de la campagne.','La chaîne message, clic, poste.','La fiche de décision remplie.'],
 success=['Livré, bloqué et clic observé sont chiffrés séparément.','Audit et blocage sont distingués.','Chaque étape a un décideur, un exécutant et une preuve.'],
 risks=['Confondre message livré et message lu.','Croire qu\'une règle en audit protège.','Conclure sans mentionner les clics non observables.'],
 extensions=['Ajouter la simulation d\'attaque pour mesurer le risque humain.','Comparer avec la campagne sur le deuxième domaine.'],
 mode='simule'))

labs.append(S(2,'débutant','Protection web et réseau : du lien suspect au blocage',
 problem='Décider comment bloquer un domaine malveillant en combinant filtrage web, indicateurs et protection réseau, en mesurant l\'effet avant le blocage.',
 tools=['Terrain de jeu KQL (contexte Defender XDR)','Tableur'],
 client="""Après l'incident d'hameçonnage, Nordlys veut bloquer l'accès aux domaines malveillants **sans casser le travail**. Le comité hésite entre un blocage par indicateur, un filtrage de catégories web et la protection réseau, et ne sait pas lequel s'applique à quel navigateur ou programme.

Votre mandat : mesurer l'exposition actuelle, choisir le mécanisme pour chaque cas et écrire la procédure de vérification et de retour arrière.""",
 mission='Mesurer les connexions aux domaines suspects, comparer les mécanismes de blocage, écrire le plan de déploiement en audit puis blocage, et la vérification.',
 duration='90 min',
 parts=[
 P('Mesurer l\'exposition actuelle','Savoir qui a déjà contacté quoi.',
 """1. Listez les connexions aux deux domaines connus :

```kql
DeviceNetworkEvents
| where RemoteUrl in ("n0rdlys-login.example", "cdn.exfil-demo.example")
| summarize Premier = min(Timestamp), Dernier = max(Timestamp), Postes = dcount(DeviceName), Evenements = count() by RemoteUrl, RemoteIP
```

2. Pour chaque domaine, quel **processus** a ouvert la connexion (navigateur ou autre) ?

```kql
DeviceNetworkEvents
| where RemoteUrl in ("n0rdlys-login.example", "cdn.exfil-demo.example")
| summarize Evenements = count() by RemoteUrl, InitiatingProcessFileName
```

3. Quel mécanisme couvre un navigateur, lequel couvre aussi PowerShell ?""",
 """Le premier domaine est contacté par un navigateur, le second par PowerShell. Le filtrage web de Defender for Endpoint concerne les navigateurs pris en charge ; la **protection réseau** étend la protection à d'autres processus. Une décision fondée sur le navigateur seul laisserait passer le second cas.""",
 'Vous avez associé chaque domaine à un processus et à un mécanisme de blocage.'),
 P('Comparer les mécanismes','Choisir le bon outil pour chaque besoin.',
 """Remplissez un tableau à quatre colonnes : **indicateur de compromission**, **filtrage de contenu web**, **protection réseau**, **filtrage par catégorie** (si applicable). Pour chacun : ce qu'il bloque, quels processus, quel prérequis, quel délai, quelle preuve.

1. Lequel est le plus rapide pour un domaine précis ?
2. Lequel exige que l'antivirus soit actif ?
3. Lequel produit une preuve de blocage visible pour l'analyste ?""",
 """L'indicateur est le plus précis et le plus rapide pour un domaine connu, mais exige la protection réseau pour couvrir les processus hors navigateur. La protection réseau dépend de l'antivirus actif et a un mode audit. Le filtrage par catégorie réduit le risque diffus mais bloque parfois du légitime. Aucun n'est suffisant seul.""",
 'Le tableau compare quatre mécanismes avec prérequis, délai et preuve.'),
 P('Écrire le plan audit puis blocage','Déployer le blocage sans casser le travail.',
 """Écrivez le plan : **audit** de la protection réseau sur un groupe pilote, mesure pendant sept jours, **blocage** progressif, exceptions documentées.

1. Quels critères de passage au blocage ?
2. Que mesurez-vous pendant l'audit ?
3. Qui valide, et qui peut demander une exception ?
4. Quel message l'utilisateur voit-il quand il est bloqué, et à qui écrit-il ?""",
 """Critères : aucun faux positif métier pendant sept jours, résumé hebdomadaire validé. Mesure : événements d'audit par destination et par processus. Les exceptions passent par un formulaire avec propriétaire et date de revue. Le message de blocage doit mener vers le soutien, sinon l'utilisateur contourne.""",
 'Le plan a un pilote, des critères chiffrés, un processus d\'exception et un message utilisateur.'),
 P('Vérifier et prévoir le retour arrière','Prouver que le blocage fonctionne.',
 """1. Décrivez le **test** de vérification : comment prouver le blocage avec un domaine de test inoffensif, depuis un poste pilote.
2. Quelle **requête** montre les blocages après coup ?
3. Quel est le retour arrière et son délai ?
4. Quelle limite écrivez-vous sur ce qui n'est **pas** couvert (appareils non gérés, réseaux hors parc) ?""",
 """Le test utilise un domaine de démonstration prévu à cet effet, jamais un vrai site malveillant. La preuve est un événement de blocage dans Defender for Endpoint. Le retour arrière est le passage au mode audit, avec un délai de propagation à mesurer. Limite : un appareil non géré ou hors parc n'est pas protégé.""",
 'La vérification utilise un domaine de test et la limite des appareils non gérés est écrite.'),
 ],
 deliverables=['Le tableau comparatif des mécanismes.','Le plan audit puis blocage.','La procédure de vérification.'],
 success=['Chaque domaine est couvert par un mécanisme adapté à son processus.','Le blocage est précédé d\'un audit.','La limite des appareils non gérés est écrite.'],
 risks=['Croire que le filtrage web couvre PowerShell.','Bloquer sans pilote.','Tester avec un vrai site malveillant.'],
 extensions=['Ajouter une règle d\'alerte sur les nouveaux domaines rares.','Comparer avec le blocage au pare-feu périmétrique.'],
 mode='simule'))

labs.append(S(3,'intermédiaire','WSL chez les développeurs : gouverner sans interdire',
 problem='Concevoir une politique d\'usage de WSL pour 25 développeurs, avec visibilité, contrôle et exceptions, en acceptant les limites de ce qui est observable.',
 tools=['Tableur','Éditeur de texte'],
 client="""Nordlys compte 25 développeurs qui utilisent le sous-système Windows pour Linux (WSL). La sécurité craint des outils non surveillés dans un environnement Linux dans le poste ; les développeurs menacent de « trouver un contournement » si WSL est interdit.

Votre mandat : une politique **proportionnée** qui dit ce qu'on autorise, ce qu'on voit, ce qu'on ne voit pas, et comment on gère les exceptions.""",
 mission='Cartographier les risques de WSL, choisir les contrôles possibles sur Windows, définir la visibilité et ses limites, et rédiger la politique d\'usage avec un processus d\'exception.',
 duration='90 min',
 parts=[
 P('Cartographier les usages et les risques','Comprendre avant de contrôler.',
 """À partir du tableau « Usages déclarés », classez chaque usage en **risque faible**, **moyen** ou **élevé** et dites pourquoi.

1. Quels usages exigent un accès réseau sortant large ?
2. Quels usages manipulent des secrets ou du code de production ?
3. Quels usages sont des outils standard et lesquels sont des programmes téléchargés ?
4. Quelles décisions peuvent attendre et lesquelles sont urgentes ?""",
 """Les usages de développement standard (compilation, conteneurs de test) sont de risque moyen ; les outils d'analyse réseau et les programmes téléchargés hors des dépôts approuvés sont de risque élevé. Les secrets stockés dans l'environnement Linux sont un risque propre à WSL, car les outils Windows ne les voient pas toujours.""",
 'Chaque usage a un niveau de risque et une raison.'),
 P('Choisir les contrôles côté Windows','Savoir ce qu\'on peut contrôler et ce qu\'on ne peut pas.',
 """Pour chaque contrôle candidat (désactiver la fonctionnalité, limiter aux développeurs, gérer les distributions autorisées, imposer la protection de la plateforme, surveiller par Defender), écrivez : **ce qu'il contrôle**, **ce qu'il ne contrôle pas**, **prérequis**, **effet sur les développeurs**.

1. Quel contrôle est un tout-ou-rien ?
2. Lequel donne de la visibilité sans bloquer ?
3. Où la visibilité s'arrête-t-elle (à l'intérieur de la distribution) ?""",
 """Désactiver la fonctionnalité est tout-ou-rien. Limiter à un groupe est le contrôle le plus proportionné. La visibilité côté Windows existe pour certains comportements, mais ce qui se passe à l'intérieur de la distribution Linux peut rester hors de vue selon la configuration et la version : **à vérifier dans la documentation actuelle** avant de promettre une couverture.""",
 'Chaque contrôle a une portée et une limite écrites.'),
 P('Définir la visibilité et ses limites','Dire clairement ce qu\'on voit et ce qu\'on ne voit pas.',
 """Rédigez une demi-page « visibilité » : ce qui est observé (événements Windows, réseau sortant), ce qui est **incertain** et ce qui est **hors de portée**. Ajoutez la mesure de contrôle : comment vérifier trimestriellement que la visibilité fonctionne encore.

1. Quelle phrase évite de promettre une couverture complète ?
2. Quel indicateur montre que les développeurs ne contournent pas la politique ?""",
 """La page doit contenir la phrase « la couverture de ce qui s'exécute à l'intérieur de la distribution est partielle et dépend de la configuration », sans l'enjoliver. L'indicateur de contournement peut être le nombre d'installations de virtualisation non approuvée détectées.""",
 'La page distingue vu, incertain et hors de portée.'),
 P('Rédiger la politique et le processus d\'exception','Un texte que les développeurs acceptent.',
 """Rédigez la politique en une page : **qui** peut utiliser WSL, **quelles distributions**, **quelles règles** (secrets, dépôts approuvés), **comment demander une exception**, **qui décide** et **délai de réponse**.

1. Qu'offrez-vous en échange des contraintes (support, image de base, outils approuvés) ?
2. Comment la politique sera-t-elle revue ?""",
 """Une politique acceptée offre quelque chose : une image approuvée, un canal de soutien, un délai d'exception de deux jours. Sans contrepartie, le contournement est presque garanti. La revue semestrielle tient compte du retour des développeurs.""",
 'La politique offre une contrepartie et fixe un délai de réponse aux exceptions.'),
 ],
 deliverables=['La grille risques par usage.','Le tableau des contrôles et limites.','La page de visibilité.','La politique et le processus d\'exception.'],
 success=['La politique n\'interdit pas par réflexe.','Les limites de visibilité sont écrites.','Les exceptions ont un délai et un décideur.'],
 risks=['Promettre une visibilité complète.','Interdire sans alternative.','Oublier les secrets dans la distribution.'],
 extensions=['Ajouter un test trimestriel de la visibilité.','Étendre aux conteneurs de poste.'],
 facts=[('Usages déclarés',['Usage','Équipe','Détail'],[['Compilation de bibliothèques','Backend','Outils standard des dépôts approuvés'],['Conteneurs de test','Plateforme','Images tirées d\'un registre interne'],['Analyse réseau','Sécurité applicative','Outils téléchargés depuis Internet'],['Scripts d\'automatisation','Opérations','Accès à des secrets de préproduction'],['Expérimentation personnelle','Divers','Programmes de sources variées']])],
 mode='simule'))

labs.append(S(4,'intermédiaire','Règles ASR par vagues : mesurer avant de bloquer',
 problem='Planifier le passage de règles ASR de l\'audit au blocage par vagues, à partir du bruit réellement observé, avec exclusions et retour arrière.',
 tools=['Terrain de jeu KQL (contexte Defender XDR)','Tableur'],
 client="""Nordlys veut passer plusieurs règles de réduction de la surface d'attaque en blocage. L'équipe de la comptabilité utilise des macros métier ; la direction craint les appels au soutien. La sécurité, elle, a vu un enchaînement Word vers PowerShell sur un poste et veut avancer vite.

Votre mandat : bâtir le plan en vagues à partir des événements d'audit, **sans bloquer sans mesure**.""",
 mission='Mesurer le bruit d\'audit par règle, classer les événements, construire trois vagues avec critères, rédiger les exclusions et le retour arrière.',
 duration='90 min',
 parts=[
 P('Mesurer le bruit d\'audit','Savoir quelles règles déclenchent et où.',
 """1. Comptez les événements par règle :

```kql
DeviceEvents
| where ActionType startswith "Asr"
| summarize Evenements = count(), Appareils = dcount(DeviceName), Dernier = max(Timestamp) by ActionType
| order by Evenements desc
```

2. Pour la règle la plus active, quels processus déclenchent ?

```kql
DeviceEvents
| where ActionType startswith "Asr"
| summarize Evenements = count() by ActionType, DeviceName, InitiatingProcessFileName
| order by Evenements desc
```

3. Les événements viennent-ils d'applications connues ou d'un enchaînement inhabituel ?""",
 """Vous verrez peu d'événements mais très concentrés : un seul poste concentre l'enchaînement Word vers PowerShell, ce qui ressemble à un **vrai signal** plutôt qu'à du bruit métier. Avec si peu de volume, un passage en blocage « pour tous » ne serait pas fondé sur une mesure solide.""",
 'Chaque règle a un volume, des appareils concernés et une classification.'),
 P('Classer les événements','Vrai positif, faux positif à exclure, faux positif à corriger.',
 """Pour chaque groupe d'événements, choisissez une catégorie et justifiez :

1. **Vrai positif** (comportement à bloquer),
2. **Faux positif à exclure** (application métier, exclusion étroite),
3. **Faux positif à corriger à la source** (macro à réécrire).

Dites quel événement demande d'abord une **investigation** plutôt qu'une classification.""",
 """L'enchaînement Word vers PowerShell encodé suivi d'une connexion sortante est à investiguer d'abord : le classer en « bruit » serait une erreur grave. Les macros métier de la comptabilité relèvent de la correction à la source ou d'une exclusion étroite documentée.""",
 'Chaque groupe est classé et l\'événement à investiguer en priorité est nommé.'),
 P('Construire les trois vagues','Pilote, bureau, comptabilité.',
 """Construisez le calendrier : **vague 1** (TI), **vague 2** (bureau), **vague 3** (comptabilité). Pour chaque vague : règles en blocage, règles en audit, durée, critère de passage, responsable.

1. Quelle règle reste en audit partout tant que l'investigation n'est pas close ?
2. Quand annoncez-vous le changement aux utilisateurs ?
3. Quel indicateur arrête la vague ?""",
 """La règle liée à l'enchaînement suspect reste en audit en attendant l'investigation. Les annonces précèdent la vague. L'indicateur d'arrêt est le nombre de tickets de blocage par jour au-dessus d'un seuil fixé d'avance.""",
 'Chaque vague a des règles, une durée, un critère de passage et un arrêt.'),
 P('Documenter exclusions et retour arrière','Garder les exceptions étroites et réversibles.',
 """1. Écrivez le **registre d'exclusions** : règle, chemin précis, groupe, raison, propriétaire, date de revue.
2. Écrivez le **retour arrière** : qui, comment, délai de propagation, vérification.
3. Quelle exclusion refusez-vous d'office ?
4. Comment prouvez-vous après coup que le blocage fonctionne ?""",
 """Refuser : toute exclusion de dossier entier ou d'interpréteur de commandes. La preuve du blocage est un événement de type « bloqué » dans les rapports, pas seulement la politique reçue. Le retour arrière est le passage de la règle en audit pour le groupe.""",
 'Le registre a un propriétaire par exclusion et le retour arrière est testable.'),
 ],
 deliverables=['La synthèse du bruit par règle.','La classification des événements.','Le calendrier en trois vagues.','Le registre d\'exclusions et le retour arrière.'],
 success=['Aucune règle en blocage sans mesure.','Le signal préoccupant est investigué avant tout blocage.','Les exclusions sont étroites et attribuées.'],
 risks=['Traiter un vrai signal comme du bruit.','Exclusions trop larges.','Aucun message aux utilisateurs.'],
 extensions=['Ajouter un tableau de bord de suivi des vagues.','Lier le plan au lab Intune sur les règles ASR.'],
 mode='tenant', connected=conn('Un locataire de test avec Intune et un poste Windows de test intégré à Defender for Endpoint.','Retirer la politique ASR de test et réinitialiser le poste.','Facultatif : ne mettez jamais une règle en blocage sur un poste de production.')))

labs.append(S(5,'intermédiaire','Supports amovibles : protéger sans paralyser',
 problem='Concevoir le contrôle des supports USB pour un parc, avec exceptions, chiffrement et preuves, à partir des événements observés.',
 tools=['Terrain de jeu KQL (contexte Defender XDR)','Tableur'],
 client="""Un poste de la comptabilité a vu une clé USB branchée à la fin d'un après-midi, quelques jours avant le départ d'un employé. Rien n'indique une fuite, mais la direction demande : « Pouvons-nous empêcher cela, et si non, le voir ? ». Les équipes de chantier, elles, ont besoin de clés pour transporter des plans.

Votre mandat : une politique de supports amovibles **qui permet le travail** et laisse une trace.""",
 mission='Mesurer les usages actuels, choisir entre blocage, lecture seule et audit par groupe, prévoir les exceptions et la preuve, et rédiger la communication.',
 duration='90 min',
 parts=[
 P('Mesurer les usages observés','Voir ce qui se passe avant de décider.',
 """1. Listez les événements de supports amovibles :

```kql
DeviceEvents
| where ActionType startswith "RemovableStorage"
| project Timestamp, DeviceName, ActionType, InitiatingProcessAccountName, FileName
| order by Timestamp asc
```

2. Combien d'appareils et de comptes sont concernés ?
3. Avec ces seules données, pouvez-vous dire si des fichiers ont été copiés ? Pourquoi ?""",
 """Un seul événement d'accès à un support amovible apparaît, sur un poste de la comptabilité. **Un accès n'est pas une copie** : les données fournies montrent l'événement, pas ce qui a été transféré. Il faut connaître la différence entre la visibilité de l'événement et la visibilité du contenu copié, qui dépend d'autres outils.""",
 'Vous avez chiffré les événements et nommé ce que les données ne montrent pas.'),
 P('Choisir le contrôle par groupe','Blocage, lecture seule ou audit.',
 """Pour chaque groupe (comptabilité, chantier, TI, direction), choisissez : **blocage**, **lecture seule**, **autorisation par liste d'appareils approuvés** ou **audit**. Justifiez par la donnée manipulée et le besoin d'affaires.

1. Quel groupe a besoin d'écriture ?
2. Quelle liste d'appareils approuvés peut-on tenir à jour réalistement ?
3. Quel contrôle complémentaire (chiffrement du support) proposez-vous ?""",
 """Comptabilité : lecture seule ou blocage ; chantier : autorisation par liste d'appareils approuvés avec chiffrement ; TI : audit. Une liste d'appareils approuvés qui n'est pas tenue à jour devient un contournement. Le chiffrement du support protège la perte, pas l'exfiltration volontaire.""",
 'Chaque groupe a un contrôle justifié et un complément.'),
 P('Prévoir exceptions et preuves','Un processus qui ne bloque pas le travail.',
 """1. Écrivez le **processus d'exception** : demande, approbation, durée, journal.
2. Quelles **preuves** conservez-vous (événements, rapport de la politique, liste d'appareils) et combien de temps ?
3. Quelle **requête** montre les accès non autorisés après la mise en place ?
4. Qui relit le journal ?""",
 """L'exception est limitée dans le temps et approuvée par le gestionnaire du demandeur. Une requête sur les événements de supports amovibles par groupe montre les dérives. La relecture est faite par une personne distincte de celles qui reçoivent les exceptions.""",
 'Le processus d\'exception a une durée, un approbateur et un relecteur indépendant.'),
 P('Communiquer et mesurer','Faire accepter la politique.',
 """Rédigez le message (8 lignes) aux équipes concernées : ce qui change, pourquoi, quoi faire, qui contacter. Définissez deux indicateurs de succès (par exemple tickets d'exception et événements non autorisés) et la date de la première revue.

1. Précisez le canal de diffusion et la date d'envoi, avant la mise en application.
2. Prévoyez une séance de questions pour les équipes de chantier.""",
 """Le message nomme la raison sans accuser, donne un contact, une date et une alternative (par exemple un partage de fichiers approuvé). Deux indicateurs suffisent pour une première revue après un mois. Une séance de questions avant l'application réduit les contournements, car les équipes voient que leur besoin a été entendu et que l'alternative proposée fonctionne vraiment.""",
 'Le message offre une alternative et les indicateurs ont une date de revue.'),
 ],
 deliverables=['Le décompte des événements.','La grille contrôle par groupe.','Le processus d\'exception.','Le message aux équipes.'],
 success=['Aucune promesse de visibilité du contenu copié.','Chaque groupe a un contrôle adapté.','Les exceptions sont bornées dans le temps.'],
 risks=['Confondre accès et copie.','Bloquer le chantier sans alternative.','Liste d\'appareils non entretenue.'],
 extensions=['Ajouter une alerte sur les accès hors horaires.','Relier au scénario de départ d\'un employé.'],
 mode='simule'))

labs.append(S(6,'avancé','Risque appareil et accès conditionnel sans verrouillage',
 problem='Concevoir la chaîne Defender, conformité et accès conditionnel avec estimation de l\'effet, comptes d\'urgence et indicateurs d\'arrêt.',
 tools=['Terrain de jeu KQL (contexte Defender XDR)','Éditeur de texte'],
 client="""Nordlys veut refuser l'accès aux ressources depuis les appareils à risque. Un incident récent a montré qu'un compte valide sur un appareil compromis suffit à lire des courriels. La direction exige aussi : « Personne ne doit être verrouillé un vendredi soir sans pouvoir se rétablir. »

Votre mandat : concevoir la chaîne et le plan de déploiement **en commençant par mesurer l'impact**.""",
 mission='Décrire la chaîne, estimer la population affectée, choisir seuil et période de grâce, concevoir comptes d\'urgence et retour arrière.',
 duration='2 h',
 parts=[
 P('Décrire la chaîne et ses points de rupture','Savoir où le signal se perd.',
 """Écrivez la chaîne : signal de risque de l'appareil, connecteur, politique de conformité, accès conditionnel, jeton d'accès. Pour chaque maillon : **prérequis**, **panne silencieuse possible**, **indicateur de santé**.

1. Que se passe-t-il si le connecteur est désactivé ?
2. Que se passe-t-il pour un appareil non inscrit ?
3. Quel maillon est le plus facile à oublier ?""",
 """Si le connecteur est désactivé, le risque n'arrive jamais à la conformité et la politique d'accès semble fonctionner sans tenir compte du risque : **échec silencieux**. Un appareil non inscrit n'a pas d'état de conformité. Le connecteur est le maillon le plus oublié.""",
 'Chaque maillon a une panne possible et un indicateur de santé.'),
 P('Estimer la population affectée','Mesurer l\'effet avant d\'activer la politique.',
 """```kql
DeviceInfo
| summarize arg_max(Timestamp, *) by DeviceName
| summarize Appareils = count(), SansCapteurActif = countif(SensorHealthState != "Active"), NonIntegres = countif(OnboardingStatus != "Onboarded"), ExpositionElevee = countif(ExposureLevel == "High")
```

1. Quelle part du parc serait touchée si « inconnu » comptait comme non conforme ?
2. Quels appareils nommés sont dans ce cas ?
3. Que décidez-vous pour la première semaine ?""",
 """Plusieurs appareils sans capteur actif ou non intégrés seraient touchés dès le jour 1. Décision prudente : rapport seulement pendant deux semaines, réparer les capteurs, puis exiger la conformité avec une grâce. Verrouiller sur la foi d'une chaîne qu'on n'a pas mesurée est un risque d'incident.""",
 'La population touchée est chiffrée et la première semaine est décidée.'),
 P('Choisir seuil, grâce et ciblage','Proportionner seuil et grâce par groupe.',
 """1. Seuil de risque toléré par groupe (courant, finance et direction, TI).
2. Période de grâce avant blocage et sa justification.
3. Premier groupe ciblé et pourquoi.
4. Message à l'utilisateur bloqué et contact du soutien.
5. Combien de temps la grâce laisse-t-elle à la remédiation automatique avant le premier blocage ?
6. Quel indicateur confirme après une semaine que le seuil est bien calibré ?""",
 """On commence par TI en application, puis le courant, puis la finance avec un seuil plus strict. Grâce courte pour laisser agir la remédiation automatique, par exemple quelques heures plutôt que plusieurs jours. Le message dit quoi faire et à qui parler. Après une semaine, le nombre de tickets et de personnes bloquées par jour indique si le seuil est bien calibré ou s'il faut l'assouplir avant d'élargir.""",
 'Chaque groupe a un seuil et une grâce justifiés.'),
 P('Comptes d\'urgence, arrêt et retour arrière','Garder une porte de secours.',
 """1. Nombre de comptes d'urgence, authentification, surveillance.
2. Indicateurs qui **arrêtent** le déploiement (tickets par heure, utilisation d'un compte d'urgence).
3. Retour arrière : qui, comment, délai, vérification.
4. Qui décide d'arrêter, un vendredi soir ?""",
 """Au moins deux comptes d'urgence exclus avec alerte à chaque usage. Le retour arrière est la désactivation de la politique par un rôle désigné, testée à l'avance. La personne qui décide d'arrêter est nommée d'avance, avec un remplaçant.""",
 'Il y a deux comptes d\'urgence, un seuil d\'arrêt et un décideur nommé.'),
 ],
 deliverables=['La chaîne et ses indicateurs.','L\'estimation de la population affectée.','Seuils, grâce et ciblage.','Plan du compte d\'urgence et de retour arrière.'],
 success=['Aucun verrouillage massif possible par conception.','Chaque maillon a un indicateur de santé.','Le compte d\'urgence est exclu et surveillé.'],
 risks=['Traiter l\'inconnu comme conforme sans le dire.','Oublier le connecteur.','Pas de décideur le vendredi soir.'],
 extensions=['Ajouter une alerte sur les capteurs qui deviennent inactifs.','Lier au lab Intune sur le risque et l\'accès conditionnel.'],
 mode='tenant', connected=conn('Un locataire de test avec Intune, Entra ID P1 et Defender for Endpoint.','Supprimer la politique d\'accès conditionnel et la conformité de test.','Facultatif : ne créez jamais une politique d\'accès conditionnel sans compte d\'urgence exclu.')))

labs.append(S(7,'avancé','Perte de télémétrie : détecter ce qui ne parle plus',
 problem='Détecter les appareils silencieux, en trouver la cause par couche et prévoir la surveillance continue de la santé des capteurs.',
 tools=['Terrain de jeu KQL (contexte Defender XDR)','Tableur'],
 client="""Un audit a révélé qu'une partie du parc n'envoie plus de signal à Defender for Endpoint, sans alerte. Le contrôleur de domaine est parmi les appareils concernés. La direction demande : « Combien d'appareils sont aveugles aujourd'hui, pourquoi, et comment le saurons-nous la prochaine fois ? »

Votre mandat : mesurer, expliquer par couche, et installer une surveillance.""",
 mission='Lister les appareils silencieux, classer les causes probables par couche, prioriser la remédiation selon le risque et créer des requêtes de surveillance.',
 duration='2 h',
 parts=[
 P('Lister les appareils silencieux','Voir ce qu\'on ne voit plus.',
 """```kql
DeviceInfo
| summarize arg_max(Timestamp, *) by DeviceName
| where SensorHealthState != "Active" or OnboardingStatus != "Onboarded"
| project DeviceName, OSPlatform, SensorHealthState, OnboardingStatus, ExposureLevel, MachineGroup
| order by ExposureLevel asc
```

1. Combien d'appareils sont silencieux ou non intégrés ?
2. Lequel est un serveur critique ?
3. Quelle différence entre « inactif » et « communication altérée » ?""",
 """Vous verrez des postes inactifs, un contrôleur de domaine en communication altérée avec une exposition élevée, et un poste qui peut encore être intégré. Un serveur critique en communication altérée est une **priorité absolue**, car on perd la visibilité là où l'attaquant veut aller.""",
 'La liste distingue inactifs, communication altérée et non intégrés.'),
 P('Expliquer par couche','Localiser la cause du silence par couche.',
 """Pour chaque catégorie, listez les causes possibles par couche : **appareil** (éteint, hors réseau), **service** (capteur arrêté), **réseau** (point de terminaison bloqué par un pare-feu ou un proxy), **identité ou inscription** (intégration perdue), **plateforme** (panne du service).

1. Quelles vérifications locales faites-vous en premier ?
2. Quelle cause est la plus probable pour un serveur dont la communication est altérée ?
3. Que ne devez-vous pas faire (réinstaller sans diagnostic) ?""",
 """Pour la communication altérée, le réseau (proxy, pare-feu, certificat) est souvent en cause. Les vérifications locales commencent par l'état du service du capteur et la connectivité vers les points de terminaison. Réinstaller sans diagnostic efface la preuve de la cause.""",
 'Chaque catégorie a une cause probable par couche et une première vérification.'),
 P('Prioriser la remédiation','Commencer par ce qui coûte le plus cher en cécité.',
 """Classez les appareils selon **rôle**, **exposition** et **donnée manipulée**. Proposez un ordre de remédiation avec responsable et délai.

1. Que faites-vous du poste qui peut être intégré ?
2. Comment protégez-vous le serveur critique en attendant (surveillance compensatoire) ?
3. Qui est notifié ?""",
 """Serveur critique d'abord, avec une surveillance compensatoire (journaux locaux, alertes d'identité) pendant la réparation. Le poste à intégrer est une action simple de déploiement. Le responsable de chaque appareil est nommé.""",
 'Chaque appareil a un ordre, un responsable, un délai et une mesure compensatoire si nécessaire.'),
 P('Installer la surveillance de santé','Ne plus apprendre la perte d\'un capteur par audit.',
 """Écrivez deux requêtes de surveillance et la règle d'alerte :

```kql
DeviceInfo
| summarize arg_max(Timestamp, *) by DeviceName
| where SensorHealthState != "Active"
| project DeviceName, SensorHealthState, ExposureLevel, Timestamp
```

1. À quelle fréquence l'exécutez-vous et qui reçoit l'alerte ?
2. Quel seuil déclenche une escalade ?
3. Comment distinguer un poste éteint pour congé d'un vrai problème ?""",
 """Une exécution quotidienne avec escalade si un serveur est concerné. Les appareils en congé se gèrent par une liste d'exceptions datée. La surveillance du silence est elle-même un contrôle à vérifier trimestriellement.""",
 'La surveillance a une fréquence, un destinataire, un seuil et une gestion des exceptions.'),
 ],
 deliverables=['La liste des appareils silencieux.','La grille des causes par couche.','L\'ordre de remédiation.','Les requêtes et règles de surveillance.'],
 success=['Le serveur critique est traité en priorité.','Chaque appareil a un responsable et un délai.','La surveillance de santé est en place.'],
 risks=['Réinstaller sans diagnostic.','Ignorer le serveur silencieux.','Aucune détection du prochain silence.'],
 extensions=['Ajouter une métrique de couverture hebdomadaire.','Lier la surveillance au rapport d\'audit.'],
 mode='simule'))

labs.append(S(8,'avancé','Confinement et restauration : isoler sans perdre la preuve',
 problem='Mener un confinement fictif d\'un poste compromis : décider d\'isoler, préserver la preuve, remédier, restaurer et vérifier.',
 tools=['Terrain de jeu KQL (contexte Defender XDR)','Éditeur de texte'],
 client="""Mercredi à 10 h 05, un poste de la comptabilité exécute PowerShell encodé depuis Word, puis contacte un domaine inconnu à 10 h 06. Le responsable de la sécurité demande une décision en 15 minutes : isoler ou observer ? Et si on isole, comment restaurer ensuite sans retomber ?

Votre mandat : décider, agir (en simulation), préserver la preuve et planifier la restauration.""",
 mission='Reconstituer la chaîne sur le poste, décider du confinement avec ses compromis, lister les actions de réponse et de preuve, planifier et vérifier la restauration.',
 duration='2 h',
 parts=[
 P('Reconstituer la chaîne sur le poste','Savoir ce qui s\'est passé avant d\'agir.',
 """```kql
DeviceProcessEvents
| where DeviceName startswith "PC-017" and Timestamp between (datetime(2026-03-11T10:00:00Z) .. datetime(2026-03-11T10:30:00Z))
| project Timestamp, AccountName, InitiatingProcessFileName, FileName, ProcessCommandLine
| order by Timestamp asc
```

1. Quel est le premier événement anormal ?
2. Quelles commandes de reconnaissance voit-on ?
3. Quelle connexion sortante suit, et avec quel processus ?""",
 """La chaîne : Word, PowerShell encodé, reconnaissance (`whoami`), puis connexion sortante vers un domaine inconnu. L'ordre est important : l'exécution a **précédé** la connexion sortante, ce qui indique un téléchargement ou une exfiltration potentielle.""",
 'Vous avez la chronologie du poste, de l\'exécution à la connexion sortante.'),
 P('Décider du confinement','Décider entre isoler ou observer le poste.',
 """Écrivez la décision en trois colonnes : **raisons d'isoler**, **raisons d'observer**, **décision**.

1. Que perd-on en isolant (accès pour enquêter, utilisateur bloqué) ?
2. Que risque-t-on en n'isolant pas ?
3. Quelle option d'isolement conserve l'accès de l'analyste ?
4. Qui approuve, et qui prévient l'utilisateur ?""",
 """L'indice d'exécution encodée suivie d'une connexion sortante justifie l'isolement. On choisit un isolement qui garde la connexion avec le service de sécurité pour continuer l'enquête. La décision est consignée avec l'heure, l'approbateur et l'utilisateur est informé avec un contact.""",
 'La décision est justifiée, approuvée et l\'utilisateur est prévenu.'),
 P('Réponse et préservation de la preuve','Agir en préservant la preuve utile.',
 """Listez les actions dans l'ordre : isolement, collecte d'un paquet d'investigation, blocage d'indicateurs, réinitialisation du compte, vérification des autres postes ayant contacté le domaine.

```kql
DeviceNetworkEvents
| where RemoteUrl == "cdn.exfil-demo.example"
| summarize Premier = min(Timestamp), Postes = dcount(DeviceName) by RemoteUrl, RemoteIP
```

1. Quelle action détruit de la preuve si elle est faite trop tôt ?
2. Quels autres postes sont concernés ?""",
 """Réinitialiser le poste avant la collecte détruit de la preuve. La requête montre qu'un seul poste a contacté le domaine, ce qui limite la portée mais n'exclut pas d'autres vecteurs. La réinitialisation du compte suit l'isolement.""",
 'Les actions sont ordonnées et la portée est mesurée.'),
 P('Restaurer et vérifier','Remettre en service avec confiance.',
 """Écrivez le plan : **critères de sortie d'isolement**, **restauration** (réinstallation ou nettoyage), **vérification** (requêtes et signaux), **surveillance renforcée** pendant 14 jours, **retour d'expérience**.

1. Qu'est-ce qui prouve que le poste est propre ?
2. Quelle règle ASR passez-vous en blocage après l'incident ?
3. Que dites-vous à l'utilisateur ?""",
 """Un poste est réinstallé plutôt que « nettoyé » lorsque l'exécution a été confirmée. La vérification combine l'absence de signaux pendant la surveillance renforcée et l'état de la protection. L'incident alimente une amélioration : passage de la règle en blocage pour le groupe concerné.""",
 'Le plan a des critères de sortie, une vérification et une amélioration.'),
 ],
 deliverables=['La chronologie du poste.','La décision de confinement.','La liste ordonnée des actions.','Le plan de restauration et de vérification.'],
 success=['La décision est justifiée et consignée.','La preuve est préservée avant la réinitialisation.','La restauration a des critères de sortie.'],
 risks=['Réinitialiser avant la collecte.','Isoler sans prévenir.','Restaurer sans vérification.'],
 extensions=['Ajouter un exercice de table avec la direction.','Relier au lab de chasse avancée.'],
 mode='simule'))

emit('src/msec/scenarios/labs1.ts','SCENARIO_LABS',labs)
