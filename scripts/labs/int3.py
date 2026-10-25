from _lib import *
exec(open('scripts/labs/_intcommon.py').read())
labs=[]

labs.append(L('il09','i09','avancé','Conformité et accès conditionnel sans verrouillage',
 'Concevoir des actions de non-conformité progressives, régler les paramètres du locataire qui changent le contrôle d\'accès et trancher le cas des appareils personnels.',
 ['Tableur','Éditeur de texte'],
 """Nordlys a décidé de **bloquer l'accès au courriel aux appareils non conformes**. La première tentative a été annulée en urgence : à 8 h un lundi, une centaine de personnes n'avaient plus accès à leur courriel parce que leurs appareils n'avaient pas encore **évalué leur conformité**. Le PDG était du lot.

Votre mandat : concevoir une conformité qui protège sans verrouiller, régler les paramètres du locataire qui causent les surprises, et trancher le cas des appareils personnels (BYOD).""",
 'Livrer le tableau des actions de non-conformité avec délais, les réglages du locataire, le plan d\'accès conditionnel progressif et la décision BYOD.',
 '90 min',
 [
 P('Concevoir les actions de non-conformité','Procéder par paliers plutôt que de bloquer immédiatement.',
 """Concevez, pour la politique « poste Windows », une séquence d'actions : **marquer non conforme**, **envoyer un courriel de rappel**, **notifier un responsable**, et éventuellement des actions plus fortes. Pour chacune : délai (en jours), destinataire, effet.

1. Quel délai de grâce pour qu'une personne règle un problème courant (mise à jour, chiffrement) ?
2. Quelle action est **dangereuse** (par exemple le retrait automatique de l'appareil) et pourquoi ?
3. Quel message la personne reçoit-elle, et ce message explique-t-il quoi faire ?""",
 """Une séquence : marquage non conforme après un court délai de grâce (quelques heures à un jour selon le motif), courriel de rappel immédiat avec l'action à faire, notification du responsable après quelques jours, et **aucune action destructive automatique** (retrait, effacement) sans décision humaine. Le message doit dire quoi faire en trois lignes, pas seulement « votre appareil n'est pas conforme ».""",
 'Votre séquence a des délais, un message utile et aucune action destructive automatique.'),
 P('Régler les paramètres du locataire','Éviter les blocages causés par un réglage global oublié.',
 """Deux réglages du locataire expliquent l'incident de lundi (tableau « Paramètres du locataire »). Pour chacun :

1. Que fait-il ?
2. Quelle valeur choisissez-vous ? Quel risque de chaque choix ?
3. Comment aviser les équipes avant de le changer ?
4. Quel rapport vérifiez-vous une semaine après le changement pour confirmer l'effet ?""",
 """Le traitement des appareils **sans politique de conformité assignée** décide s'ils sont conformes par défaut ou non : mettre « non conforme » est plus sûr mais bloque tout appareil non encore évalué. La **période de validité de l'état de conformité** détermine après combien de temps un appareil qui ne se synchronise plus est considéré non conforme. Il faut les régler en connaissance de cause, en **mode rapport d'abord**, et prévenir les équipes avant le changement.""",
 'Chaque réglage a une valeur choisie, un risque et un avis aux équipes.'),
 P('Planifier l\'accès conditionnel progressif','Déployer sans verrouiller la direction.',
 """Concevez les étapes : **rapport seulement**, pilote, vague 1, production. Pour chaque étape : population, critère de passage, **exclusions** (comptes d'urgence), indicateur de verrouillage à surveiller et plan de retour arrière.

1. Comment mesurez-vous en rapport seulement combien de personnes seraient bloquées ?
2. Comment protégez-vous le **compte d'urgence** ?
3. Quel indicateur arrête le déploiement (par exemple plus de N tickets d'accès en une heure) ?""",
 """Le rapport seulement montre qui aurait été bloqué, **sans bloquer**. Passage à l'étape suivante seulement si le nombre de personnes bloquées à tort est jugé acceptable. Compte d'urgence exclu de toute politique et surveillé. Un seuil de tickets déclenche l'arrêt. Le retour arrière : désactiver la politique d'accès conditionnel, connu et testé.""",
 'Chaque étape a un critère de passage, une exclusion et un retour arrière.'),
 P('Trancher le cas BYOD','Décider pour les appareils personnels sans surinterpréter le droit de contrôle.',
 """Les téléphones personnels des 80 employés accèdent au courriel. Choisissez entre : **exiger l'inscription complète** à Intune, **exiger la protection des applications** seulement, ou **bloquer**.

1. Que protège la protection des applications et que ne protège-t-elle pas ?
2. Comment la combinez-vous avec l'accès conditionnel (application approuvée, politique de protection exigée) ?
3. Comment l'annoncez-vous aux employés sans les inquiéter pour leur vie privée ?""",
 """Pour des appareils personnels, la protection des applications est généralement proportionnée : elle protège les **données de l'entreprise dans les applications gérées** (chiffrement, copier-coller restreint, effacement sélectif) sans gérer l'appareil. Elle ne protège pas contre un appareil compromis dans son ensemble. L'accès conditionnel peut exiger une application approuvée et une politique de protection. La communication insiste sur ce que l'entreprise **ne voit pas** (photos, applications personnelles).""",
 'Votre décision BYOD indique ce qui est protégé, ce qui ne l\'est pas, et le message aux employés.'),
 ],
 ['Le tableau des actions de non-conformité.','Les réglages du locataire.','Le plan d\'accès conditionnel progressif.','La décision BYOD.'],
 ['Aucune action destructive n\'est automatique.','Les réglages globaux sont décidés en rapport d\'abord.','Le compte d\'urgence est exclu et surveillé.'],
 ['Bloquer sans mesurer.','Oublier le réglage des appareils sans politique.','Promettre aux employés plus de confidentialité que ce que l\'architecture permet.'],
 ['Relier au scénario « Risque appareil et accès conditionnel ».','Ajouter un tableau de bord des appareils non évalués.'],
 facts=[('Paramètres du locataire',['Paramètre','Valeur actuelle'],[['Marquer les appareils sans politique de conformité assignée comme','Non conformes'],['Période de validité de l\'état de conformité','30 jours']])],
 mode='tenant', connected=conn('Un locataire de test avec Intune, Entra ID et deux comptes de test.','Supprimer la politique d\'accès conditionnel et de conformité de test.','Facultatif. Ne créez jamais de politique d\'accès conditionnel en blocage sans compte d\'urgence exclu.')))

labs.append(L('il10','i10','avancé','Protéger les applications et les données sur mobile',
 'Concevoir des niveaux de protection des applications, décider ce que retire un effacement sélectif et cadrer la relation entre Intune et la protection des données de Purview.',
 ['Tableur','Éditeur de texte'],
 """Nordlys autorise le courriel et Teams sur les téléphones personnels des employés. Un directeur a perdu son téléphone et demande : « Vous pouvez tout effacer à distance ? » Vous savez que sur un appareil personnel, ce n'est ni possible ni souhaitable. Par ailleurs, le service juridique veut empêcher l'envoi de numéros de carte de crédit par courriel depuis les postes, et croit qu'Intune le fait déjà.

Votre mandat : concevoir les niveaux de protection, expliquer l'effacement sélectif et clarifier ce qui relève de Purview.""",
 'Livrer la grille des niveaux de protection, la politique mobile avec effacement sélectif et le dossier d\'architecture de la protection des données.',
 '75 min',
 [
 P('Concevoir les niveaux de protection','Proportionner les contrôles à la sensibilité des données.',
 """Concevez trois niveaux pour les applications de Nordlys : **de base**, **amélioré** et **élevé**. Pour chaque niveau : exigences (code d'accès, chiffrement, restrictions de copier-coller, enregistrement des sauvegardes, version minimale du système), population concernée, impact sur l'utilisateur.

1. Quelle population obtient quel niveau (employés, direction, sous-traitants) ?
2. Quel réglage est le plus sensible pour l'expérience utilisateur ?
3. Comment justifiez-vous un niveau élevé pour la direction ?""",
 """Un modèle courant : niveau de base (code d'accès, chiffrement des données de l'application) pour tous ; niveau amélioré (restriction du copier-coller vers des applications non gérées, enregistrements restreints) pour les employés qui manipulent des données internes ; niveau élevé (version minimale du système, évaluation de la menace mobile) pour la direction et les données sensibles. Plus le niveau est élevé, plus la friction l'est : justifiez par la **donnée**, non par la hiérarchie.""",
 'Chaque niveau a des exigences, une population et un impact utilisateur.'),
 P('Décider de l\'effacement sélectif','Savoir exactement ce qui est retiré et ce qui reste.',
 """Rédigez la réponse au directeur qui a perdu son téléphone.

1. Que retire un **effacement sélectif** d'une application protégée ?
2. Que **ne retire-t-il pas** (photos, applications personnelles, comptes personnels) ?
3. Quand est-il déclenché (action manuelle, non-conformité prolongée, délai d'inactivité) ?
4. Dans quel cas un effacement **complet** est-il justifié, et pour quels appareils ?""",
 """L'effacement sélectif retire **les données de l'entreprise** des applications gérées sur l'appareil personnel. Il ne touche pas aux données personnelles. Un effacement complet est réservé aux **appareils d'entreprise** (inscrits). Réponse type : « Nous retirons les données de l'entreprise de votre téléphone. Vos photos et applications personnelles ne sont pas touchées. »""",
 'Votre réponse dit ce qui est retiré et ce qui ne l\'est pas.'),
 P('Choisir entre gestion de l\'appareil et des applications','Ne pas promettre ce qu\'on ne peut pas faire.',
 """Pour les quatre cas du tableau « Cas mobiles », choisissez : **gestion de l'appareil**, **protection des applications**, ou **les deux**. Dites ce que vous promettez et ce que vous ne promettez pas.

1. Pour chaque cas, nommez la donnée que vous protégez et celle que vous ne voyez pas.
2. Écrivez la phrase exacte que vous diriez à la personne concernée.""",
 """Appareil d'entreprise perdu : gestion de l'appareil (effacement complet possible). Téléphone personnel : protection des applications. Tablette partagée de terrain : gestion de l'appareil. Appareil d'un sous-traitant : protection des applications avec accès limité. Ne promettez jamais « tout effacer » sur un appareil personnel.""",
 'Chaque cas a un choix et une promesse limitée.'),
 P('Cadrer la protection des données avec Purview','Dire ce qui relève de Purview, ce qui relève d\'Intune et de Defender.',
 """Le service juridique veut empêcher l'envoi de numéros de carte de crédit.

1. Quel produit applique une règle de **prévention de perte de données** sur les terminaux et dans le courriel ?
2. Quel est le **rôle d'Intune et de Defender** dans cette chaîne (inscription, intégration des appareils, signaux) ?
3. Quelles licences et quel travail (types d'information sensible, étiquettes) sont nécessaires ?
4. Comment formulez-vous la réponse au juridique : « ce que nous pouvons faire, quand, avec quelles limites » ?""",
 """La prévention de perte de données est un produit distinct (Purview) : Intune et Defender **préparent les appareils** (intégration, signaux), mais ne définissent pas les règles de contenu. Il faut une licence adaptée, définir les types d'information sensible, choisir un mode (audit puis blocage), et former les utilisateurs. Réponse au juridique : « C'est faisable avec Purview ; voici l'ordre : audit, mesure, blocage ; voici la licence nécessaire ; voici les limites (contenu chiffré, appareils non gérés). »""",
 'Votre réponse au juridique distingue Purview d\'Intune et indique un ordre de déploiement.'),
 ],
 ['La grille des niveaux de protection.','La réponse sur l\'effacement sélectif.','Les choix mobiles.','Le dossier d\'architecture des données.'],
 ['Les niveaux sont justifiés par la donnée.','L\'effacement sélectif est expliqué honnêtement.','Purview est identifié comme un produit distinct.'],
 ['Promettre un effacement complet sur un appareil personnel.','Croire qu\'Intune fait de la prévention de perte de données.','Imposer le niveau élevé à tous sans justification.'],
 ['Ajouter un rapport des applications sans politique de protection.','Planifier une simulation d\'effacement sélectif.'],
 facts=[('Cas mobiles',['Cas','Propriété','Données'],[['Téléphone de l\'entreprise d\'un commercial','Entreprise','Courriel et contacts clients'],['Téléphone personnel d\'un employé','Personnelle','Courriel'],['Tablette partagée de terrain','Entreprise','Formulaires'],['Appareil d\'un sous-traitant','Personnelle','Un seul dossier partagé']])],
 mode='tenant', connected=conn('Un locataire de test avec Intune et un téléphone de test.','Supprimer les politiques de protection et d\'effacement de test.','Facultatif. Ne déclenchez jamais d\'effacement sur un appareil réel.')))

labs.append(L('il11','i11','avancé','Contrôler applications, scripts et périphériques sans bloquer le métier',
 'Choisir la technologie de contrôle des applications, passer de l\'audit à l\'application, cadrer le contrôle des scripts et concevoir des règles de contrôle des supports amovibles.',
 ['Terrain de jeu KQL (contexte Defender XDR)','Tableur'],
 """Nordlys veut « interdire les applications non autorisées ». L'équipe n'a jamais inventorié ses logiciels, et un employé a copié des plans clients sur une clé USB. Un autre veut exécuter des scripts PowerShell pour son travail.

Votre mandat : choisir la technologie de contrôle des applications, la déployer **d'abord en audit**, cadrer les scripts et concevoir les règles de contrôle des périphériques sans doublons.""",
 'Livrer le choix technologique justifié, le plan d\'audit à application, la note sur les scripts et la politique de contrôle des périphériques.',
 '90 min',
 [
 P('Choisir la technologie','Comparer App Control for Business et AppLocker sans choix idéologique.',
 """Pour les besoins du tableau « Besoins de contrôle », choisissez **App Control for Business** ou **AppLocker** et justifiez.

1. Quelle technologie est recommandée pour de nouveaux déploiements et pourquoi ?
2. Quel est le rôle du **programme d'installation géré** (managed installer) ?
3. Quelles limites connaissez-vous (compatibilité, effort de maintenance, scripts) ?""",
 """La documentation actuelle recommande généralement App Control for Business pour les nouveaux déploiements ; AppLocker reste utile pour des besoins précis (par utilisateur, par exemple) et ne reçoit plus d'évolutions majeures selon la documentation consultée : vérifiez ce point. Le **programme d'installation géré** (par exemple l'outil de distribution de logiciels) autorise automatiquement les applications qu'il installe, ce qui réduit la maintenance. La limite principale : l'effort initial d'inventaire.""",
 'Chaque besoin a une technologie et une limite nommée.'),
 P('Planifier l\'audit vers l\'application','Mesurer avant de bloquer, avec des critères de passage.',
 """Concevez le plan en quatre temps : **inventaire**, **audit** (journalisation sans blocage), **analyse** des événements, **application** par anneaux.

1. Quel événement du journal indique ce qui **aurait été bloqué** en audit (identifiant d'événement du journal d'intégrité du code) ?
2. Quel est le critère pour passer en application ?
3. Comment gérez-vous une application légitime qui aurait été bloquée ?""",
 """En mode audit, le journal d'intégrité du code consigne les exécutions qui auraient été bloquées (l'identifiant d'événement 3076 pour l'audit et 3077 pour un blocage effectif, selon la documentation). Critère : plus aucun événement d'audit non expliqué pendant la durée d'observation. Une application légitime qui aurait été bloquée est ajoutée par signature, éditeur ou installateur géré, avec un propriétaire.""",
 'Votre plan a un critère de passage et une règle pour les applications légitimes.'),
 P('Cadrer le contrôle des scripts','Dire la vérité sur ce que le contrôle des scripts peut faire.',
 """L'employé veut exécuter des scripts PowerShell. 

1. Que permet le **mode de langage contraint** de PowerShell, et que bloque-t-il ?
2. Comment un contrôle des applications **force-t-il** ce mode ? Qu'est-ce qui reste hors de portée ?
3. Quelle solution pour un besoin légitime : script signé, exécution par un compte de service, outil approuvé ?
4. Comment surveillez-vous les exécutions de scripts ?""",
 """Le langage contraint limite l'accès aux types et appels dangereux. Un contrôle des applications peut l'imposer aux scripts non approuvés, mais ce n'est **pas une barrière absolue** : documentez les contournements possibles et les compensations. Pour un besoin légitime : script **signé** par un éditeur approuvé, exécuté dans un contexte contrôlé. La surveillance se fait par les journaux de blocs de script et par Defender.""",
 'Votre note distingue ce que le contrôle fait de ce qu\'il ne garantit pas.'),
 P('Concevoir le contrôle des périphériques','Contrôler les supports amovibles avec des règles sans recoupement.',
 """Concevez la politique : groupes de supports (clés approuvées, clés non approuvées), règles (lecture, écriture, exécution), **action par défaut**, exceptions par groupe d'utilisateurs, et journalisation.

1. Comment éviter des règles qui se chevauchent et dont l'effet est ambigu ?
2. Quelle action par défaut (autoriser, refuser) choisissez-vous au début ?
3. Comment retrouvez-vous un incident : cherchez dans les événements qui s'est branché et qui a copié.

```kql
DeviceEvents
| where ActionType in ("UsbDriveMounted", "PnpDeviceConnected", "RemovableStorageAccessTriggered")
| project Timestamp, DeviceName, ActionType, FileName, InitiatingProcessAccountName
| order by Timestamp asc
```""",
 """Une règle simple : par défaut **auditer** au début, puis refuser l'écriture sur les supports non approuvés, avec un groupe d'exception justifié. Évitez les règles qui se recoupent : un support appartient à **un seul groupe**. Les événements montrent des branchements de supports et un accès à un fichier de plans clients : l'événement `RemovableStorageAccessTriggered` désigne la personne et le poste. Ce n'est pas une preuve d'exfiltration, mais c'est la **piste** à investiguer.""",
 'Votre politique a une action par défaut, des groupes sans chevauchement et une journalisation.'),
 ],
 ['Le choix de technologie.','Le plan audit vers application.','La note sur les scripts.','La politique de contrôle des périphériques.'],
 ['Le déploiement commence en audit.','Les règles de supports ne se chevauchent pas.','Les limites du contrôle des scripts sont écrites.'],
 ['Appliquer sans audit.','Promettre que le langage contraint est une barrière absolue.','Créer des règles de périphériques ambiguës.'],
 ['Relier au scénario « Supports amovibles » du parcours Scénarios.','Ajouter un rapport des événements d\'audit non résolus.'],
 facts=[('Besoins de contrôle',['Besoin','Détail'],[['Empêcher l\'exécution de logiciels inconnus','Postes de la comptabilité'],['Autoriser un outil précis aux ingénieurs','Signé par l\'éditeur'],['Limiter les scripts de bureautique','Tous les postes'],['Contrôler les clés USB','Tous les postes']])],
 mode='tenant', connected=conn('Un locataire de test avec Intune et un poste Windows de test.','Retirer la politique de contrôle et réinitialiser le poste.','Facultatif. N\'appliquez jamais une politique de contrôle des applications en mode application sur un poste réel sans audit.')))

labs.append(L('il12','i12','avancé','Concevoir les anneaux de mise à jour et l\'accélération d\'urgence',
 'Définir des anneaux de correctifs avec échéances défendables, planifier l\'accélération d\'une mise à jour critique et reconnaître ce que Windows Update ne couvre pas.',
 ['Tableur','Éditeur de texte'],
 """Vendredi 15 h, un correctif de sécurité est annoncé pour une vulnérabilité **déjà exploitée**. La direction demande : « Combien de temps pour que tous les postes soient corrigés ? » La réponse actuelle est « on ne sait pas », parce que les mises à jour sont déployées avec un seul anneau et aucune échéance. De plus, un employé s'est plaint d'un redémarrage forcé en pleine présentation.

Votre mandat : concevoir des anneaux, une **procédure d'accélération**, et un registre de ce que le canal Windows ne couvre pas.""",
 'Livrer le gabarit d\'anneaux avec échéances, la procédure d\'accélération et le registre des limites de correction.',
 '75 min',
 [
 P('Concevoir le gabarit d\'anneaux','Équilibrer vitesse de correction et stabilité.',
 """Concevez quatre anneaux : **TI**, **pilote**, **large**, **systèmes critiques**. Pour chacun : report de la mise à jour qualité, **échéance** (jours), **période de grâce** avant redémarrage forcé, heures actives.

1. Quel report pour chaque anneau ? Pourquoi les systèmes critiques passent-ils en dernier ?
2. Quelle échéance maximale pouvez-vous défendre devant la direction ?
3. Comment évitez-vous un redémarrage en pleine présentation ?""",
 """Un gabarit : TI sans report ; pilote avec 2 à 3 jours ; large avec 5 à 7 jours ; systèmes critiques avec 10 à 14 jours après validation. Les échéances sont défendables si elles sont **courtes et connues** ; la période de grâce laisse la personne choisir un moment ; les heures actives réduisent les redémarrages inopportuns. Plus la vulnérabilité est exploitée, plus on raccourcit.""",
 'Chaque anneau a un report, une échéance et une période de grâce.'),
 P('Planifier l\'accélération','Corriger vite sans improviser.',
 """Pour la vulnérabilité exploitée, rédigez la procédure :

1. **Critères** pour accélérer (exploit actif, actif exposé, sévérité) ;
2. Quel mécanisme déploie une mise à jour **hors du calendrier normal** (politique d'accélération des mises à jour qualité) ?
3. Qui approuve, et comment prévenez-vous les utilisateurs ?
4. Quel **plan de repli** si la mise à jour casse quelque chose ?
5. Comment mesurez-vous la progression (rapports de conformité de la mise à jour) ?""",
 """Critères : exploitation active ou actif exposé. Mécanisme : politique d'accélération qui force la mise à jour qualité à une date et un redémarrage raisonnables. Approbation : responsable de la sécurité et responsable TI. Message : court, avec l'heure du redémarrage. Repli : suspendre l'anneau suivant et désinstaller si nécessaire. Mesure : pourcentage d'appareils corrigés par anneau toutes les quatre heures.""",
 'Votre procédure a des critères, un approbateur, un repli et une mesure.'),
 P('Identifier ce que le canal Windows ne couvre pas','Ne pas confondre « Windows est à jour » et « tout est corrigé ».',
 """Dressez le **registre des limites** : applications tierces (navigateurs, lecteurs), microprogrammes et pilotes, serveurs et systèmes hors du canal, appareils hors ligne ou hors du parc géré. Pour chaque ligne : **comment on les corrige**, qui est responsable, comment on le mesure.""",
 """Un registre honnête : les applications tierces exigent un autre canal de déploiement (catalogue d'applications, outil de gestion de logiciels) ; les microprogrammes passent par le fabricant ; les appareils hors ligne reçoivent le correctif à leur retour, d'où la nécessité d'une **échéance de rattrapage**. Une mise à jour Windows complète ne rend pas le parc sûr si les navigateurs ont trois versions de retard.""",
 'Chaque limite a une méthode de correction, un responsable et une mesure.'),
 P('Rédiger la réponse à la direction','Donner un délai honnête et chiffré à la direction.',
 """Écrivez la réponse en cinq lignes : **combien de temps**, pour quel pourcentage d'appareils, ce qui n'est pas couvert, quel risque résiduel, prochaine mise à jour.

1. Écrivez d'abord le pourcentage visé et le délai, avant toute explication.
2. Nommez séparément ce qui ne suit pas le calendrier normal (serveurs, appareils hors ligne).
3. Terminez par l'heure du prochain point de situation.""",
 """Un exemple : « Avec la procédure d'accélération, nous visons 95 % des postes corrigés en 72 heures et 100 % des postes connectés en 7 jours. Les serveurs critiques suivent un calendrier distinct. Les appareils hors ligne reçoivent le correctif à leur retour. » Une réponse chiffrée vaut mieux qu'un « bientôt ».""",
 'Votre réponse donne un délai chiffré, un périmètre et un risque résiduel.'),
 ],
 ['Le gabarit d\'anneaux.','La procédure d\'accélération.','Le registre des limites.','La réponse à la direction.'],
 ['Chaque anneau a une échéance chiffrée.','La procédure d\'accélération a un repli.','Les limites sont nommées avec un responsable.'],
 ['Un seul anneau pour tout le parc.','Corriger Windows et oublier les navigateurs.','Promettre un délai sans mesure.'],
 ['Ajouter un tableau de bord de conformité des correctifs.','Intégrer les mises à jour d\'applications tierces.'],
 facts=[('Parc à corriger',['Catégorie','Quantité'],[['Postes TI et volontaires','25'],['Postes courants','330'],['Postes de la direction et finance','55'],['Serveurs critiques','25'],['Appareils hors ligne en moyenne','15']])],
 mode='tenant', connected=conn('Un locataire de test avec Intune et un poste de test.','Supprimer les anneaux de test.','Facultatif. N\'accélérez jamais une mise à jour sur un parc réel pour un exercice.')))

emit('src/msec/intune/labs3.ts','INTUNE_LABS_3',labs)
