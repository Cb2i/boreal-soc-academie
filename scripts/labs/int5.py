from _lib import *
exec(open('scripts/labs/_intcommon.py').read())
labs=[]
def F(id, level, title, **kw): return L(id,'final',level,title,**kw)

POINTS=[
 ['1','Antivirus en temps réel','Valeur et mécanisme','Antivirus'],
 ['2','Protection infonuagique et échantillons','Valeur et décision de confidentialité','Antivirus'],
 ['3','Protection contre la falsification','Activée, tolérance aux changements','Antivirus'],
 ['4','Applications potentiellement indésirables','Mode (audit ou blocage)','Antivirus'],
 ['5','Exclusions antivirus','Registre, portée, revue','Antivirus'],
 ['6','Règles de réduction de la surface d\'attaque','Mode par règle et anneaux','ASR'],
 ['7','Protection réseau','Audit puis blocage','ASR'],
 ['8','Accès contrôlé aux dossiers','Dossiers et applications approuvées','ASR'],
 ['9','Exploit Protection','Réglages par application','ASR'],
 ['10','Pare-feu (trois profils)','Valeurs par défaut et règles','Pare-feu'],
 ['11','Chiffrement BitLocker','Méthode, prérequis, dépôt des clés','Chiffrement'],
 ['12','Récupération des clés','Qui lit, trace, rotation','Chiffrement'],
 ['13','Mot de passe administrateur local (LAPS)','Rotation, lecture tracée','Comptes'],
 ['14','Groupes locaux d\'administrateurs','Verrouillage et exceptions','Comptes'],
 ['15','Identifiants protégés (Hello, Credential Guard)','Prérequis matériels','Comptes'],
 ['16','Contrôle des applications','Audit puis application','Applications'],
 ['17','Contrôle des périphériques','Groupes et action par défaut','Périphériques'],
 ['18','Anneaux de mise à jour','Reports et échéances','Correctifs'],
 ['19','Conformité et actions','Délais et paliers','Conformité'],
 ['20','Intégration Defender et risque','EDR et seuil de risque','Intégration'],
 ['21','Rapports et preuves','Quatre états par politique','Preuves'],
]

labs.append(F('if01','intermédiaire','Socle de sécurité Windows pour un parc fictif',
 problem='Concevoir le socle de sécurité d\'un parc Windows de 300 postes avec la fiche de configuration en 21 points, en distinguant politique créée, assignée, reçue et protection opérationnelle.',
 tools=['Tableur','Fiche de configuration en 21 points (fournie dans ce lab)'],
 client="""**Nordlys Technologies** a 300 postes Windows répartis en trois groupes : TI (25), bureau (230) et finance et direction (45). La direction demande un **socle de sécurité** unique et démontrable avant l'audit de l'assureur dans huit semaines. L'assureur demandera pour chaque contrôle : « montrez-moi la politique, montrez-moi que le poste l'a reçue, montrez-moi que la protection fonctionne ».

Votre mandat : remplir la **fiche de configuration en 21 points** : un mécanisme, un ciblage, une preuve pour chaque point, et distinguer systématiquement les **quatre états** d'une politique.""",
 mission='Remplir la fiche de 21 points (mécanisme, cible, valeur, preuve), répartir en trois vagues, écrire la preuve par état et nommer les risques résiduels.',
 duration='2 h 30',
 parts=[
 P('Choisir le mécanisme de chaque point','Un seul mécanisme par point, selon l\'ordre de préférence.',
 """Pour chacun des 21 points du tableau « Fiche de configuration », écrivez le **mécanisme** (politique de sécurité des terminaux, catalogue de paramètres, base de référence, mécanisme avancé) et le **propriétaire**.

1. Commencez par les points pour lesquels un modèle de sécurité des terminaux existe.
2. Pour les autres, cherchez d'abord dans le catalogue de paramètres.
3. Notez les points où **aucun mécanisme Intune** n'existe ou n'est connu : ne les remplissez pas par habitude, écrivez « à vérifier ».
4. Vérifiez qu'aucun point n'est couvert par deux mécanismes à la fois.""",
 """Une fiche remplie montre : antivirus, ASR, pare-feu, chiffrement, comptes (LAPS) et intégration Defender via les politiques de sécurité des terminaux ; durcissements particuliers via le catalogue ; socle global via une base de référence si utile ; anneaux de mise à jour via leur propre type de politique ; conformité via sa politique. **Un seul mécanisme par point** : c'est ce qui évite les conflits. Les « à vérifier » sont des engagements honnêtes à lever avant l'audit.""",
 'Chaque point a un mécanisme unique, un propriétaire et au plus quelques « à vérifier » nommés.'),
 P('Définir le ciblage et les vagues','Répartir le déploiement en trois vagues avec des critères de passage.',
 """Définissez trois vagues : **TI** (25), **bureau** (230) et **finance et direction** (45). Pour chaque point, indiquez : groupe ciblé, **filtre** éventuel, ordre de déploiement, durée d'observation et critère de passage.

1. Quels points se déploient en **audit d'abord** (ASR, protection réseau, contrôle des applications) ?
2. Quels points ne se testent pas en audit (pare-feu, antivirus) mais exigent un pilote ?
3. Quel groupe reçoit en dernier les contrôles les plus perturbateurs ?""",
 """Un plan : TI reçoit tout en premier (audit ou application selon le point) ; bureau reçoit après sept jours sans incident ; finance et direction reçoit en dernier pour les contrôles perturbateurs (contrôle des applications, ASR en blocage), avec des revues avec les métiers. Les points d'audit exigent une mesure avant le blocage ; les autres un pilote et un retour arrière.""",
 'Chaque point a un groupe, une vague, une durée et un critère de passage.'),
 P('Écrire la preuve des quatre états','Distinguer créée, assignée, reçue, opérationnelle pour chaque politique.',
 """Pour **cinq points de votre choix** (par exemple antivirus, chiffrement, LAPS, pare-feu, ASR), remplissez quatre colonnes :

1. **Créée** : où voir qu'elle existe ?
2. **Assignée** : où voir qu'elle cible les bons appareils ?
3. **Reçue** : où voir l'état par appareil ?
4. **Opérationnelle** : quelle **preuve locale ou dans Defender** montre que la protection fonctionne ?

Indiquez ce qui **manque** quand seule la colonne 3 est remplie.""",
 """Exemple pour le chiffrement : créée (politique dans Intune), assignée (groupe et filtre), reçue (état par appareil), opérationnelle (rapport de chiffrement **et** statut local, avec clé déposée). Un état « Réussi » sans preuve de la colonne 4 est un **faux sentiment de sécurité** : c'est la phrase à dire à l'assureur.""",
 'Pour chacun des cinq points, les quatre états ont une source de preuve distincte.'),
 P('Nommer les risques résiduels et les écarts','Dire clairement ce qui reste exposé.',
 """Écrivez une page : **écarts** (points sans mécanisme ou en « à vérifier »), **alternatives** ou **risques acceptés** avec un propriétaire, **dépendances** (licences, Defender), et le plan de revue après une mise à jour de Microsoft.

1. Classez chaque écart par gravité (élevée, moyenne, faible) et par échéance de correction.
2. Indiquez pour chacun la personne qui accepte le risque, par son nom.
3. Fixez la date de la prochaine revue.""",
 """Chaque écart est soit corrigé, soit accepté par une personne nommée avec une date de revue. Les dépendances (licence supplémentaire, intégration Defender) apparaissent explicitement. Le plan de revue prévoit une relecture de la documentation à chaque annonce importante.""",
 'Chaque écart est corrigé ou accepté par une personne nommée.'),
 ],
 deliverables=['La fiche de configuration en 21 points remplie.','Le plan des trois vagues.','La preuve par état pour cinq points.','La page des risques résiduels.'],
 success=['Chaque domaine a un mécanisme, un ciblage et une preuve.','Les quatre états sont distingués pour chaque politique.','Les écarts sont nommés avec une alternative ou un risque accepté.'],
 risks=['Prendre un tableau de bord vert pour une protection.','Empiler des politiques en conflit.','Oublier le pilote.'],
 extensions=['Ajouter la couverture macOS et mobile du module 14.','Ajouter un plan de revue après une mise à jour de la documentation.'],
 facts=[('Fiche de configuration',['#','Point','À décider','Domaine'],POINTS)],
 mode='simule'))

labs.append(F('if02','avancé','Règles ASR déployées par vagues',
 problem='Planifier sur huit semaines le passage des règles ASR de l\'audit au blocage pour trois groupes d\'appareils, avec mesure du bruit, exclusions documentées et retour arrière.',
 tools=['Terrain de jeu KQL (contexte Defender XDR)','Tableur'],
 client="""Nordlys déploie huit règles de réduction de la surface d'attaque pour **trois groupes** : TI, bureau et comptabilité. Le comité de sécurité a posé trois conditions : **aucune règle en blocage sans mesure**, **aucune exclusion sans propriétaire** et **un retour arrière testé**. Le service de la comptabilité exige de ne pas perdre ses macros.

Vous disposez de deux semaines d'événements d'audit (jeu de données fictif). Votre mandat : bâtir le **calendrier de huit semaines**, mesurer, décider règle par règle et préparer la communication.""",
 mission='Mesurer le bruit par règle et par appareil, construire le calendrier de passage en blocage par groupe, documenter les exclusions et rédiger le plan de retour arrière.',
 duration='2 h',
 parts=[
 P('Mesurer le bruit d\'audit par règle et par appareil','Distinguer bruit diffus et bruit concentré.',
 """1. Vue par règle :

```kql
DeviceEvents
| where ActionType startswith "Asr"
| summarize Evenements = count(), Appareils = dcount(DeviceName), Premier = min(Timestamp), Dernier = max(Timestamp) by ActionType
| order by Evenements desc
```

2. Vue par appareil et processus pour la règle la plus sensible :

```kql
DeviceEvents
| where ActionType == "AsrOfficeChildProcessAudited"
| summarize Evenements = count() by DeviceName, InitiatingProcessFileName, FileName
| order by Evenements desc
```

3. Classez chaque règle : **bruit expliqué**, **bruit inexpliqué**, **signal préoccupant**.""",
 """Le bruit des deux premières règles est expliqué par des applications métier connues ; la règle Office montre toutefois **un appareil avec un enchaînement Word vers PowerShell** qui n'est pas du bruit de macro métier : c'est un **signal préoccupant** à investiguer avant de passer cette règle en blocage pour quiconque. Une mesure par règle seule masquerait cet appareil.""",
 'Chaque règle est classée et l\'appareil atypique est signalé.'),
 P('Construire le calendrier de huit semaines','Passer par anneaux avec critères de passage chiffrés.',
 """Construisez le calendrier : pour chaque règle et chaque groupe, indiquez le **mode** par semaine (audit, avertissement si disponible, blocage), le critère de passage et le responsable.

1. TI : quelles règles passent en blocage dès la semaine 1 ?
2. Bureau : quelles règles passent en blocage à partir de la semaine 3 ?
3. Comptabilité : quelles règles restent en audit jusqu'à la revue des macros ?
4. Que fait-on de la règle dont un appareil montre un signal préoccupant ?""",
 """Un calendrier : TI en blocage semaines 1 à 2 pour les règles à bruit expliqué ; bureau semaines 3 à 5 ; comptabilité semaines 6 à 8 après revue ; la règle Office reste en **audit** partout tant que l'appareil atypique n'est pas investigué. Critère type : zéro événement non expliqué pendant sept jours consécutifs.""",
 'Le calendrier a un mode par semaine et par groupe, avec critère et responsable.'),
 P('Documenter les exclusions','Garder chaque exclusion étroite et datée.',
 """Remplissez le registre pour les exclusions proposées : règle, **chemin ou processus précis**, groupe, raison, **propriétaire**, date de revue, **condition de retrait**.

1. Quelle exclusion refusez-vous d'emblée ?
2. Comment vérifiez-vous chaque trimestre qu'elle est encore utile ?""",
 """Refuser : toute exclusion qui désactive la règle pour un interpréteur de commandes. Accepter : un fichier précis d'une application métier pour un groupe précis. Vérification trimestrielle : une requête sur les déclenchements concernés ; sans déclenchement, on retire.""",
 'Chaque exclusion a une portée étroite, un propriétaire et une condition de retrait.'),
 P('Préparer le retour arrière et la communication','Pouvoir revenir à l\'audit rapidement et prévenir.',
 """1. Décrivez le **retour arrière** : qui, comment, délai de propagation, vérification.
2. Rédigez le message à la comptabilité (6 lignes).
3. Quels **indicateurs** surveillez-vous la première semaine de blocage (tickets, événements de blocage) ?
4. Testez le retour arrière sur le groupe TI avant la production : quelle preuve conservez-vous ?""",
 """Retour arrière : repasser la règle en audit via la politique avec un responsable de garde ; le délai de propagation dépend de la synchronisation des appareils et doit être **connu** par un test. Indicateurs : tickets liés à des blocages, volume d'événements de blocage par règle. Preuve du test : capture de l'état avant et après sur un appareil TI et le délai observé.""",
 'Le retour arrière est testé sur TI avant la production.'),
 ],
 deliverables=['La synthèse chiffrée du bruit.','Le calendrier de huit semaines.','Le registre des exclusions.','Le retour arrière et le message aux utilisateurs.'],
 success=['Aucune règle ne passe en blocage sans mesure en audit.','Chaque exclusion a un propriétaire et une date de revue.','Le retour arrière est décrit et testable.'],
 risks=['Passer en blocage trop tôt.','Exclusions trop larges.','Confondre événement d\'audit et blocage réel.'],
 extensions=['Relier la mesure à un tableau de bord.','Ajouter la gouvernance d\'un cas comme WSL.'],
 mode='tenant', connected=conn('Un locataire de test avec Intune et un poste Windows de test intégré à Defender for Endpoint.','Retirer la politique ASR de test et réinitialiser le poste.','Facultatif : ne mettez jamais une règle en blocage sur un poste de production pour ce lab.')))

labs.append(F('if03','avancé','BitLocker, LAPS et récupération',
 problem='Concevoir le chiffrement des disques et la gestion du compte administrateur local, avec dépôt des clés, rotation, accès délégué, procédure de récupération testée en simulation et preuves.',
 tools=['Tableur','Éditeur de texte'],
 client="""Nordlys veut passer l'audit de l'assureur sur deux contrôles : « **tous les postes sont chiffrés avec des clés récupérables** » et « **aucun mot de passe d'administrateur local n'est partagé** ». Le parc comprend des postes sans TPM, des postes en mode hérité et des comptes partagés historiques. Un exercice de récupération n'a jamais été fait.

Votre mandat : concevoir les deux politiques, prévoir les accès aux secrets, écrire et **simuler** la procédure de récupération et choisir les preuves.""",
 mission='Concevoir les politiques BitLocker et LAPS, définir qui lit les secrets, rédiger et simuler la procédure de récupération avec double contrôle et choisir les preuves pour l\'audit.',
 duration='2 h',
 parts=[
 P('Concevoir la politique de chiffrement','Choisir méthode, prérequis et dépôt des clés.',
 """À partir du tableau « Parc à chiffrer », décidez par catégorie : **méthode et taille de clé**, chiffrement silencieux ou non, traitement des postes **sans TPM**, des postes **en mode hérité** et des postes avec un autre chiffrement.

1. Que faire d'un poste sans TPM : exclure, utiliser un autre protecteur, remplacer ?
2. Comment garantir le **dépôt de la clé avant** le chiffrement ?
3. Quel avertissement refusez-vous de contourner ?""",
 """Postes sans TPM : protecteur par mot de passe de démarrage ou remplacement planifié, avec **exception approuvée** et risque documenté ; postes en mode hérité : conversion préalable ; poste avec un autre chiffrement : décision d'arbitrage. Le dépôt de la clé doit être une **condition** du chiffrement, pas une étape après. Ne chiffrez pas un poste dont vous ne pouvez pas récupérer la clé.""",
 'Chaque catégorie de poste a un traitement et la clé est déposée avant chiffrement.'),
 P('Concevoir LAPS et l\'accès aux secrets','Un mot de passe par poste, une lecture tracée.',
 """1. Où sauvegarder les mots de passe ? Quelle rotation ? Quelle complexité ?
2. **Qui lit** quoi (matrice rôles et groupes d'appareils) ? Quel rôle personnalisé évite d'accorder trop ?
3. Comment la lecture est-elle **journalisée** et qui relit le journal ?
4. Que devient le compte administrateur historique partagé ?""",
 """Un mot de passe unique par poste, tourné régulièrement et après usage. La lecture est accordée à un petit groupe de soutien avec un rôle limité ; chaque lecture est consignée et relue par une personne qui ne lit pas elle-même les secrets. Le compte administrateur historique est désactivé ou renommé après migration, et les groupes locaux d'administrateurs sont verrouillés par politique.""",
 'La matrice dit qui lit quoi, avec journalisation relue par un tiers.'),
 P('Écrire et simuler la récupération','Prouver que la procédure fonctionne avant le jour où elle sera nécessaire.',
 """Rédigez la procédure pour trois scénarios : **clé BitLocker demandée au démarrage**, **mot de passe administrateur local à lire**, **poste réinstallé**. Pour chacun : vérification d'identité, rôle, double contrôle, rotation après usage, trace.

Ensuite, **simulez** : sur papier, déroulez chaque scénario avec un collègue qui joue l'employé et notez : temps total, étapes ambiguës, preuves produites.""",
 """La procédure doit nommer des personnes ou des rôles, pas des équipes. La simulation révèle presque toujours une ambiguïté (« qui approuve quand le responsable est absent ? »). Notez le **temps total** : si la récupération prend quatre heures, c'est une perte pour l'employé et un risque pour l'entreprise. La simulation est un **exercice sur papier** : elle ne remplace pas un test sur un appareil réel.""",
 'Les trois scénarios ont été déroulés et les ambiguïtés notées.'),
 P('Choisir les preuves d\'audit','Donner à l\'assureur ce qu\'il demandera.',
 """Pour chaque contrôle, choisissez les **preuves** : rapport de chiffrement, rapport d'état LAPS, journal d'audit des lectures, compte rendu d'exercice de récupération. Indiquez la fréquence de production et le propriétaire.

1. Précisez l'**emplacement** où la preuve est conservée et qui y a accès.
2. Précisez la **durée de conservation** de chaque preuve.
3. Indiquez comment la preuve est **horodatée** pour ne pas pouvoir être refaite après coup.""",
 """Pour « tous les postes sont chiffrés avec des clés récupérables » : rapport de chiffrement et contrôle d'échantillon de dépôt de clés, plus compte rendu de l'exercice. Pour « aucun mot de passe partagé » : rapport LAPS (appareils couverts) et journal d'audit des lectures. Chaque preuve a une date et un propriétaire.""",
 'Chaque contrôle a une preuve datée et un propriétaire.'),
 ],
 deliverables=['La politique de chiffrement.','La matrice d\'accès LAPS.','Les procédures de récupération avec compte rendu de simulation.','La liste des preuves d\'audit.'],
 success=['Aucun secret n\'est stocké hors du service prévu.','L\'accès aux secrets est délégué et journalisé.','La procédure de récupération est testée en simulation.'],
 risks=['Chiffrer sans dépôt de clé.','Accès trop large aux mots de passe locaux.','Oublier les postes sans TPM.'],
 extensions=['Ajouter Windows Hello et Credential Guard.','Ajouter un contrôle d\'audit sur les lectures de secrets.'],
 facts=[('Parc à chiffrer',['Catégorie','Quantité','Particularité'],[['Portables récents','180','TPM 2.0, UEFI'],['Postes fixes anciens','30','Sans TPM'],['Postes en mode hérité','20','BIOS hérité'],['Postes avec chiffrement tiers','10','Produit installé par un ancien fournisseur'],['Comptes administrateurs partagés','1','Un mot de passe partagé par tous']])],
 mode='simule'))

labs.append(F('if04','avancé','Risque Defender et accès conditionnel sans verrouillage',
 problem='Relier le niveau de risque de Defender à la conformité et à l\'accès conditionnel, avec compte d\'urgence, période de grâce, mode rapport seulement et indicateurs de verrouillage.',
 tools=['Terrain de jeu KQL (contexte Defender XDR)','Éditeur de texte'],
 client="""Nordlys veut exiger que l'accès aux applications ne soit possible que depuis des appareils dont le niveau de risque Defender est acceptable. Le directeur technique précise : « Si on verrouille le PDG un vendredi soir, c'est vous qui répondrez. »

Vous devez concevoir la **chaîne complète** : signal Defender, conformité Intune, accès conditionnel Entra, avec exclusions d'urgence, mode rapport seulement, fenêtre de grâce et **indicateurs de verrouillage** qui arrêtent le déploiement.""",
 mission='Décrire la chaîne et ses dépendances, estimer qui serait verrouillé, choisir le seuil, concevoir le compte d\'urgence et rédiger le plan de retour arrière.',
 duration='2 h',
 parts=[
 P('Décrire la chaîne et ses dépendances','Savoir où le signal peut se perdre.',
 """Dessinez (en texte) la chaîne : **capteur Defender** → **niveau de risque** → **connecteur Intune-Defender** → **politique de conformité** → **accès conditionnel** → **accès à l'application**.

1. Quelles sont les **dépendances** de chaque maillon (licence, intégration, inscription) ?
2. Où le signal peut-il **se perdre** silencieusement ?
3. Quel **indicateur de santé** surveille chaque maillon ?""",
 """Maillons et risques : capteur inactif (pas de risque évalué), connecteur désactivé (le niveau n'arrive pas à Intune), appareil non inscrit (pas de conformité), politique sans règle de risque, accès conditionnel qui n'exige pas la conformité. Chaque maillon a un indicateur : pourcentage de capteurs actifs, état du connecteur, appareils non évalués, rapport de conformité, journal d'accès conditionnel.""",
 'Chaque maillon a une dépendance, une panne possible et un indicateur.'),
 P('Estimer qui serait verrouillé','Mesurer l\'effet avant d\'activer.',
 """1. Estimez les appareils qui poseraient problème **dès le premier jour** :

```kql
DeviceInfo
| summarize arg_max(Timestamp, *) by DeviceName
| summarize Appareils = count(), SansCapteurActif = countif(SensorHealthState != "Active"), NonIntegres = countif(OnboardingStatus != "Onboarded"), ExpositionElevee = countif(ExposureLevel == "High")
```

2. Quelle proportion du parc serait affectée si « risque inconnu » signifiait « non conforme » ?
3. Quelle décision prenez-vous sur l'**inconnu** pour la première semaine ?""",
 """Vous verrez une minorité d'appareils sans capteur actif ou non intégrés : si « inconnu » est traité comme non conforme, ils perdent l'accès dès le jour 1. Décision prudente : **rapport seulement** pendant deux semaines pour mesurer, réparer les capteurs, puis traiter l'inconnu comme non conforme avec une fenêtre de grâce.""",
 'Vous avez chiffré la population touchée et décidé du traitement de l\'inconnu.'),
 P('Choisir le seuil et le délai de grâce','Équilibrer protection et continuité.',
 """1. Seuil de risque toléré pour chaque groupe (courant, direction et finance, TI) ?
2. **Période de grâce** avant blocage ? Pourquoi ?
3. Quelle action propose-t-on à la personne bloquée (message, lien, soutien) ?
4. Qui peut accorder une **exception temporaire** et pour combien de temps ?
5. Comment mesurez-vous le nombre de personnes bloquées chaque jour ?""",
 """Seuil plus strict pour la direction et la finance ; grâce courte (heures) pour laisser la remédiation automatique agir ; message clair avec le contact du soutien. Les seuils se décident avec les propriétaires des données, pas seulement la sécurité.""",
 'Chaque groupe a un seuil, une grâce et un message.'),
 P('Concevoir le compte d\'urgence et le retour arrière','Garder une porte de secours surveillée.',
 """1. Combien de comptes d'urgence ? Quelle authentification ? Où sont les identifiants ?
2. Comment sont-ils **surveillés** (alerte à chaque connexion) ?
3. Décrivez le **retour arrière** : qui désactive la politique, en combien de minutes, comment on le vérifie ?
4. Quels **indicateurs de verrouillage** arrêtent le déploiement ?""",
 """Au moins deux comptes d'urgence exclus, avec méthode d'authentification résistante à l'hameçonnage et alerte à chaque usage. Retour arrière : désactivation de la politique d'accès conditionnel par un rôle désigné, testée. Indicateurs d'arrêt : nombre de tickets d'accès par heure au-dessus d'un seuil, ou utilisation d'un compte d'urgence.""",
 'Vous avez deux comptes d\'urgence surveillés et un seuil d\'arrêt.'),
 ],
 deliverables=['La chaîne et ses indicateurs de santé.','L\'estimation des appareils touchés.','Les seuils et délais de grâce.','Le plan du compte d\'urgence et de retour arrière.'],
 success=['Un verrouillage massif est impossible par conception.','Chaque maillon a un indicateur de santé.','Le compte d\'urgence est exclu et surveillé.'],
 risks=['Traiter l\'inconnu comme conforme sans le dire.','Exclure un groupe entier.','Oublier de surveiller le compte d\'urgence.'],
 extensions=['Ajouter une alerte sur les capteurs qui passent inactifs.','Relier au scénario « Risque appareil et accès conditionnel ».'],
 mode='tenant', connected=conn('Un locataire de test avec Intune, Entra ID P1 et Defender for Endpoint.','Supprimer la politique d\'accès conditionnel et la conformité de test.','Facultatif : ne créez jamais une politique d\'accès conditionnel sans compte d\'urgence exclu.')))

labs.append(F('if05','intermédiaire','Sécurité des appareils personnels (BYOD)',
 problem='Concevoir un programme complet pour appareils personnels : niveaux de protection des applications, conditions d\'accès, communication aux employés, départ d\'un employé et preuves.',
 tools=['Tableur','Éditeur de texte'],
 client="""Les 80 employés de Nordlys qui utilisent leur téléphone personnel pour le courriel et Teams ne sont pas inscrits à Intune. Le service juridique s'inquiète des données de l'entreprise sur ces appareils, les employés craignent que l'entreprise « regarde leurs photos », et le responsable de la sécurité veut un programme **proportionné**.

Votre mandat : concevoir le programme complet : ce qu'on protège, ce qu'on ne voit pas, comment on l'explique, ce qui se passe à un départ, et les preuves pour l'audit.""",
 mission='Définir les niveaux de protection, les conditions d\'accès, le message aux employés, la procédure de départ et les preuves du programme BYOD.',
 duration='90 min',
 parts=[
 P('Définir le périmètre et les niveaux','Protéger les données, pas l\'appareil.',
 """1. Quelles **applications** sont dans le périmètre (courriel, Teams, stockage de fichiers) ?
2. Quels **niveaux de protection** (base, amélioré, élevé) pour quelles personnes ?
3. Quelles **conditions préalables** (version minimale du système, code d'accès) ?
4. Qu'est-ce que l'entreprise **ne gère pas** : listez-le explicitement.""",
 """Périmètre : courriel, Teams et applications de fichiers approuvées. Niveaux proportionnés à la donnée. Conditions : système à jour et code d'accès. **Non géré** : photos, messages personnels, applications personnelles, localisation de l'appareil. Cette liste est la **promesse de confidentialité** à écrire noir sur blanc.""",
 'Le périmètre est défini et la liste du non géré est écrite.'),
 P('Concevoir les conditions d\'accès','Exiger une application approuvée et une politique de protection.',
 """Concevez la règle d'accès : **application cliente approuvée** exigée, **politique de protection** appliquée, blocage des clients non approuvés, comportement quand l'utilisateur refuse.

1. Quel est l'effet sur un employé qui utilise l'application de courriel native du téléphone ?
2. Comment gérez-vous la période de transition ?
3. Que se passe-t-il si l'appareil est jailbreaké ou débridé ?""",
 """Un accès conditionnel peut exiger une application approuvée avec une politique de protection : l'application native non approuvée n'aurait plus accès. Prévoir une transition (rapport seulement, messages, soutien). Un appareil débridé peut être traité par une condition de conformité mobile ou par la défense contre les menaces mobiles, selon la licence.""",
 'La règle d\'accès a une transition et un traitement de l\'appareil débridé.'),
 P('Écrire le message aux employés','Expliquer sans inquiéter ni mentir.',
 """Rédigez la communication (une page) : **ce que nous protégeons**, **ce que nous ne voyons pas**, **ce que nous pouvons effacer** (données de l'entreprise seulement), **ce que vous devez faire**, **qui contacter**.

1. Relisez le texte à voix haute : y a-t-il un mot que votre mère ne comprendrait pas ?
2. Retirez toute phrase qui promet plus que l'architecture ne permet.
3. Ajoutez une question fréquente : « Mon employeur voit-il mes photos ? ».""",
 """Un bon message est honnête : « Nous protégeons les données de l'entreprise dans les applications professionnelles. Nous ne voyons pas vos photos, vos messages ni vos applications personnelles. En cas de perte, nous pouvons retirer les données de l'entreprise de ces applications seulement. » Il évite le jargon et nomme une personne contact.""",
 'Le message dit clairement ce que l\'entreprise ne voit pas.'),
 P('Planifier le départ d\'un employé et les preuves','Retirer l\'accès proprement et prouver le programme.',
 """1. Procédure de **départ** : désactivation du compte, effacement sélectif, vérification, délai.
2. Quelles **preuves** garde-t-on pour l'audit : rapport des applications protégées, journal d'effacement, couverture du programme ?
3. Quel indicateur mesure l'adoption ?""",
 """Au départ : désactiver le compte, déclencher l'effacement sélectif des applications, vérifier l'état dans le rapport, consigner. Preuves : pourcentage d'appareils personnels avec politique de protection, journal des effacements, revue trimestrielle. Indicateur d'adoption : nombre d'utilisateurs avec accès par application approuvée.""",
 'La procédure de départ a une vérification et les preuves ont un propriétaire.'),
 ],
 deliverables=['La grille des niveaux et du non géré.','La règle d\'accès conditionnel.','Le message aux employés.','La procédure de départ et les preuves.'],
 success=['La liste du non géré est publiée aux employés.','L\'effacement est sélectif seulement.','Les preuves sont datées et ont un propriétaire.'],
 risks=['Promettre une confidentialité que l\'architecture ne permet pas.','Gérer un appareil personnel comme un appareil d\'entreprise.','Oublier le départ des employés.'],
 extensions=['Ajouter la défense contre les menaces mobiles.','Mesurer la satisfaction des employés après trois mois.'],
 mode='tenant', connected=conn('Un locataire de test avec Intune et un téléphone de test.','Supprimer les politiques de protection d\'applications de test.','Facultatif : n\'imposez jamais une politique de protection à de vrais appareils personnels sans consentement et communication préalable.')))

labs.append(F('if06','avancé','Politiques en conflit : détecter et arbitrer',
 problem='Détecter les conflits entre politiques, arbitrer avec des règles de propriété et prévenir leur retour grâce à un registre et à des contrôles de gouvernance.',
 tools=['Tableur','Éditeur de texte'],
 client="""Nordlys a accumulé 40 politiques Intune en trois ans, créées par quatre équipes. Des rapports montrent des « conflits » et des « erreurs » que personne n'ose toucher. Un réglage de pare-feu a été appliqué avec une valeur surprenante, et un autre a été **ignoré** pendant des semaines.

Votre mandat : cartographier les chevauchements, arbitrer avec des règles de propriété, et mettre en place les contrôles pour que ça ne revienne pas.""",
 mission='Cartographier les réglages en doublon, décider de la politique gagnante pour chaque conflit, retirer les chevauchements et définir la gouvernance des politiques.',
 duration='2 h',
 parts=[
 P('Cartographier les chevauchements','Voir quels réglages sont fixés par plusieurs politiques.',
 """À partir du tableau « Inventaire des politiques », construisez une matrice réglage × politique. Pour chaque réglage fixé par plus d'une politique, notez les valeurs.

1. Quels réglages ont des **valeurs différentes** (conflit réel) ?
2. Quels réglages ont la **même valeur** (redondance sans conflit) ?
3. Quels mécanismes sont impliqués (politique de sécurité des terminaux, catalogue, base de référence, modèle) ?""",
 """La matrice montre généralement quelques conflits réels et beaucoup de redondances. Les redondances sans conflit sont un **risque futur** : si une valeur change dans une seule politique, un conflit apparaît. Le mécanisme impliqué indique souvent l'origine : une base de référence qui fixe le même réglage qu'une politique de sécurité.""",
 'La matrice identifie conflits réels et redondances.'),
 P('Arbitrer chaque conflit','Choisir la politique gagnante selon des règles de propriété.',
 """Définissez trois **règles d'arbitrage** (par exemple : « la politique de sécurité des terminaux l'emporte sur le catalogue pour son domaine », « une base de référence ne fixe jamais un réglage déjà géré par une politique dédiée », « le propriétaire du domaine décide »). Appliquez-les à chaque conflit de la matrice et inscrivez la décision.""",
 """Appliquer les règles produit des décisions cohérentes : on garde la politique du domaine et on **retire** le réglage des autres politiques plutôt que de s'appuyer sur un ordre implicite. Chaque décision nomme un propriétaire.""",
 'Chaque conflit a une décision, une règle appliquée et un propriétaire.'),
 P('Retirer les chevauchements sans casser','Nettoyer les doublons sans rien casser.',
 """Pour retirer un réglage d'une politique :

1. Quel risque (l'appareil retombe à une valeur par défaut ?) ?
2. Comment testez-vous sur un groupe pilote ?
3. Comment confirmez-vous le résultat sur l'appareil (état local) ?
4. Quel plan de retour arrière ?""",
 """Retirer un réglage peut rendre actif un autre réglage plus faible : testez sur un pilote et vérifiez **l'état local**. Le retour arrière consiste à rétablir la politique d'origine. Procédez par petits lots, jamais en masse.""",
 'Le nettoyage se fait par lots avec test local et retour arrière.'),
 P('Mettre en place la gouvernance','Éviter le retour des conflits.',
 """Définissez : un **registre** des politiques (propriétaire, domaine, réglages), une **convention de nommage**, une **revue** mensuelle des rapports de conflit, une règle « **aucune politique sans propriétaire** », et un processus de création de politique (demande, vérification des chevauchements, pilote).""",
 """La gouvernance tient en cinq règles simples. Le contrôle le plus efficace : avant toute nouvelle politique, une vérification des chevauchements dans le registre. La revue mensuelle des rapports de conflit détecte les dérives tôt.""",
 'La gouvernance a un registre, une convention et une revue mensuelle.'),
 ],
 deliverables=['La matrice réglage par politique.','Les décisions d\'arbitrage.','Le plan de nettoyage.','Les règles de gouvernance.'],
 success=['Chaque réglage a une seule politique propriétaire.','Le nettoyage est testé sur un pilote.','La gouvernance a une revue mensuelle.'],
 risks=['Nettoyer en masse sans test.','Résoudre les conflits par l\'ordre implicite.','Laisser des politiques sans propriétaire.'],
 extensions=['Automatiser l\'inventaire via l\'interface de programmation.','Ajouter une métrique de conflits ouverts.'],
 facts=[('Inventaire des politiques',['Politique','Mécanisme','Propriétaire','Réglages en commun'],[['Pare-feu de base','Politique de sécurité des terminaux','Sécurité','Pare-feu public : entrant bloqué'],['Socle Windows','Base de référence','Sécurité','Pare-feu public : entrant autorisé ; SmartScreen'],['Durcissement TI','Catalogue de paramètres','TI','Pare-feu public : désactivé ; SmartScreen'],['Modèle hérité','Modèle de configuration','Inconnu','SmartScreen : désactivé'],['Antivirus','Politique de sécurité des terminaux','Sécurité','Protection infonuagique : activée'],['Socle Windows (copie)','Base de référence','Inconnu','Protection infonuagique : désactivée']])],
 mode='simule'))

labs.append(F('if07','avancé','Dossier de validation du durcissement',
 problem='Produire le dossier qui prouve le durcissement : matrice des 21 points avec preuves par état, tests de validation, limites, statut honnête de chaque validation et plan de revue.',
 tools=['Tableur','Éditeur de texte'],
 client="""L'assureur de Nordlys demande un **dossier de validation** du durcissement des postes. Le comité d'audit a déjà refusé un dossier précédent : il présentait des captures d'écran de politiques « réussies » comme des preuves de protection, et affirmait des validations jamais exécutées.

Votre mandat : un dossier qui distingue **ce qui est prouvé**, **ce qui est reçu**, **ce qui est simulé** et **ce qui n'a pas été validé sur un vrai locataire**.""",
 mission='Remplir la matrice de validation des 21 points avec preuves par état, définir les tests, rédiger la section sur le statut honnête des validations et le plan de revue.',
 duration='2 h 30',
 parts=[
 P('Construire la matrice de validation','Une ligne par point, une preuve par état.',
 """Reprenez la fiche de 21 points du lab « Socle de sécurité Windows ». Pour chaque point, remplissez : **politique créée** (preuve), **assignée** (preuve), **reçue** (preuve), **opérationnelle** (preuve), **date de la preuve**, **responsable**.

1. Combien de points ont les **quatre** preuves ?
2. Combien n'ont que « reçue » ?
3. Quels points n'ont aucune preuve opérationnelle possible aujourd'hui, et pourquoi ?""",
 """Une matrice honnête révèle plusieurs lignes à moitié remplies : c'est normal et c'est précieux. Les points sans preuve opérationnelle possible doivent être **nommés** (par exemple, une fonction dont l'état local n'est pas observable) avec une compensation. Un taux de remplissage de 100 % au premier essai est suspect.""",
 'Chaque point a un état de preuve honnête et une date.'),
 P('Définir les tests de validation','Prouver le fonctionnement et pas seulement la configuration.',
 """Pour **huit points**, concevez un test : **action** (par exemple tenter d'exécuter une application non autorisée en audit), **résultat attendu**, **preuve conservée**, **fréquence**.

1. Quels tests sont sûrs sur un poste réel ?
2. Quels tests doivent se faire **en laboratoire** (pas en production) ?
3. Comment conservez-vous la preuve (journal, capture, rapport) ?""",
 """Les tests sûrs sont ceux qui lisent un état (chiffrement, pare-feu, version) ; les tests d'attaque simulée se font en laboratoire. Chaque test produit une preuve datée. Un test jamais exécuté doit être marqué « non exécuté » dans le dossier, pas « réussi ».""",
 'Chaque test a une action, un résultat attendu, une preuve et un lieu d\'exécution.'),
 P('Écrire le statut honnête des validations','Séparer documentation, rédaction, simulation et validation réelle.',
 """Rédigez la section qui indique pour chaque point : **recherche documentaire** faite (source et date), **rédaction** faite, **simulation** faite sur le site (le cas échéant), **validation sur un vrai locataire** (oui, non, partielle).

1. Quelles validations avez-vous réellement faites ?
2. Lesquelles n'ont **pas** été faites ?
3. Quelle phrase écrivez-vous pour qu'aucun lecteur ne confonde simulation et validation ?""",
 """La section doit refuser les affirmations non prouvées : « Les procédures de ce dossier ont été **rédigées** d'après la documentation consultée aux dates indiquées et **simulées** avec des données fictives. Elles n'ont pas toutes été validées sur un locataire réel ; les lignes marquées “non validé” restent à tester. » C'est cette phrase qui rend le dossier signable.""",
 'Chaque point a quatre statuts distincts et aucune validation n\'est affirmée sans preuve.'),
 P('Planifier la revue et conclure','Garder le dossier vivant dans le temps.',
 """Définissez : fréquence de revue (trimestrielle et après annonce majeure), propriétaire, critères de mise à jour, et rédigez la **conclusion d'une demi-page** : ce qui est solide, ce qui est fragile, ce qui est prévu.

1. Fixez les **déclencheurs** d'une revue hors calendrier (annonce majeure, incident, changement de licence).
2. Indiquez qui signe la version finale et qui la reçoit.""",
 """La conclusion hiérarchise : points solides (preuve opérationnelle), points fragiles (preuve reçue seulement), points à valider. Elle engage des dates. Un dossier vivant est préférable à un dossier parfait figé.""",
 'La conclusion distingue solide, fragile et à valider, avec des dates.'),
 ],
 deliverables=['La matrice de validation des 21 points.','Les huit tests de validation.','La section du statut honnête.','La conclusion et le plan de revue.'],
 success=['Aucune validation n\'est affirmée sans preuve.','Simulation et validation réelle sont distinguées.','Chaque point a un propriétaire et une date.'],
 risks=['Présenter « politique réussie » comme une preuve de protection.','Affirmer un test jamais exécuté.','Figer le dossier sans plan de revue.'],
 extensions=['Ajouter une colonne « effort pour valider ».','Automatiser une partie des preuves avec les rapports.'],
 facts=[('Rappel : les 21 points',['#','Point','Domaine'],[[p[0],p[1],p[3]] for p in POINTS])],
 mode='simule'))

emit('src/msec/intune/labsF.ts','INTUNE_FINAL_LABS',labs)
