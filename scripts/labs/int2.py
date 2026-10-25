from _lib import *
exec(open('scripts/labs/_intcommon.py').read())
labs=[]

labs.append(L('il05','i05','intermédiaire','Intégrer Defender : voies de gestion, seuils de risque, angles morts',
 'Cartographier les voies de gestion de la sécurité des terminaux, choisir un seuil de risque tolérable et repérer les appareils que le niveau de risque ne voit pas.',
 ['Terrain de jeu KQL (contexte Defender XDR)','Tableur'],
 """Nordlys veut que **le niveau de risque d'un appareil** (évalué par Defender for Endpoint) contrôle l'accès au courriel. Un ingénieur affirme : « Si l'appareil est à risque élevé, il est bloqué, donc on est tranquilles. » Vous soupçonnez que certains appareils ne seront **jamais** évalués : serveurs non inscrits, postes dont le capteur est inactif, appareils Linux.

Votre mandat : cartographier comment chaque catégorie d'appareils est gérée, choisir un seuil de risque, et faire la **revue des angles morts**.""",
 'Livrer la carte des voies de gestion, le plan de seuils de risque et la revue des angles morts avec mesures.',
 '75 min',
 [
 P('Cartographier les voies de gestion','Savoir par quelle voie chaque appareil reçoit sa configuration de sécurité.',
 """À partir du tableau « Catégories d'appareils », indiquez pour chaque ligne la **voie de gestion** :

1. **Inscrit à Intune** : politique d'intégration EDR via Intune ;
2. **Non inscrit mais intégré à Defender** : gestion des paramètres de sécurité par Defender for Endpoint (le paramètre autorisant Defender à appliquer les configurations de sécurité des terminaux) ;
3. **Géré autrement** (Configuration Manager, serveur) ;
4. **Aucune voie** (trou).

Notez pour chaque voie : **prérequis**, **où vérifier l'état**, **limite**.""",
 """Une carte : postes d'entreprise inscrits → politique EDR par Intune ; serveurs Windows non inscrits → gestion des paramètres par Defender (si prise en charge) ou outil de gestion existant ; postes Linux → configuration locale ou outil d'automatisation, et non par une politique Intune de poste Windows ; téléphones personnels → pas de voie EDR (protection d'application seulement). Pour chaque voie, la **vérification d'état** se fait à un endroit différent : n'en supposez pas une seule.""",
 'Chaque catégorie a une voie, un prérequis et un endroit où vérifier.'),
 P('Choisir le seuil de risque','Décider du niveau de risque qui rend un appareil non conforme.',
 """Le niveau de risque d'un appareil va de « clair » à « élevé ». La politique de conformité exige que l'appareil soit **au plus** à un niveau choisi.

1. Quel seuil choisissez-vous pour les postes de bureau ? Pour les postes de la direction ? Justifiez.
2. Quel délai de grâce avant de bloquer l'accès ?
3. Que se passe-t-il pour un appareil dont le risque est **inconnu** (pas de capteur) : conforme ou non ? Où se règle ce comportement ?""",
 """Un choix défendable : tolérer « faible » pour les postes courants, « clair » pour les postes de la direction et de la finance ; un délai de grâce court (quelques heures) pour éviter un blocage injuste pendant une remédiation. Un appareil sans évaluation de risque n'a pas de niveau : selon les réglages de conformité, il peut être traité comme conforme ou non. **Décidez-le explicitement** : c'est un angle mort classique.""",
 'Vous avez un seuil par groupe, un délai de grâce et une décision sur l\'inconnu.'),
 P('Mesurer les angles morts','Chiffrer les appareils que le risque ne voit pas.',
 """Dans le terrain de jeu, listez les appareils où l'évaluation du risque ne peut pas fonctionner correctement :

```kql
DeviceInfo
| summarize arg_max(Timestamp, *) by DeviceName
| where OnboardingStatus != "Onboarded" or SensorHealthState != "Active"
| project DeviceName, OSPlatform, OnboardingStatus, SensorHealthState, MachineGroup
| order by SensorHealthState asc
```

1. Combien d'appareils ne produisent pas de niveau de risque fiable ?
2. Parmi eux, lesquels peuvent accéder au courriel aujourd'hui ?
3. Quelle action immédiate pour chacun ?""",
 """Vous trouvez plusieurs appareils au capteur inactif, un contrôleur de domaine en communication altérée et un appareil qui n'a jamais été intégré. Aucun ne produira de niveau de risque fiable : si la conformité les traite comme conformes, ils accèdent au courriel **sans évaluation**. Actions : réparer le capteur, intégrer l'appareil, ou le traiter comme non conforme jusqu'à correction.""",
 'Vous avez la liste des appareils sans évaluation fiable et une action pour chacun.'),
 P('Rédiger la revue des angles morts','Documenter ce que la chaîne ne couvre pas.',
 """Écrivez la revue en une page : ce que la chaîne **Defender, conformité, accès conditionnel** couvre, ce qu'elle ne couvre pas, l'indicateur de santé de chaque maillon et la fréquence de contrôle.

1. Écrivez trois phrases : ce qui est couvert, ce qui ne l'est pas, ce qu'on ignore encore.
2. Choisissez un indicateur chiffré par maillon et un responsable pour chacun.""",
 """Contenu type : couvert : appareils inscrits avec capteur actif. Non couvert : appareils non inscrits, capteurs inactifs, plateformes sans évaluation de risque. Indicateurs : pourcentage de capteurs actifs, pourcentage d'appareils évalués, délai moyen de réparation. Fréquence : hebdomadaire. Cette revue est le meilleur antidote à « on est tranquilles ».""",
 'La revue a un indicateur de santé pour chaque maillon.'),
 ],
 ['La carte des voies de gestion.','Le plan de seuils de risque.','La liste des angles morts.','La revue d\'une page.'],
 ['Chaque catégorie a une voie de gestion.','Le cas « risque inconnu » est tranché.','La revue a des indicateurs de santé.'],
 ['Croire que le risque est évalué sur tous les appareils.','Laisser le traitement de l\'inconnu au hasard.','Ne jamais contrôler la santé de la chaîne.'],
 ['Relier le lab au scénario « Risque appareil et accès conditionnel ».','Ajouter une alerte quand un capteur passe inactif.'],
 facts=[('Catégories d\'appareils',['Catégorie','Quantité','Inscrit à Intune','Capteur Defender'],[['Postes Windows','410','Oui','Oui'],['Serveurs Windows','25','Non','Oui'],['Postes Linux','5','Non','Non'],['Téléphones personnels','80','Non (protection d\'application)','Non'],['Postes virtuels non persistants','20','Variable','Variable']])],
 mode='tenant', connected=conn('Un locataire de test avec Intune et Defender for Endpoint, un poste de test inscrit.','Supprimer la politique d\'intégration de test et retirer l\'appareil de test.')))

labs.append(L('il06','i06','intermédiaire','Pare-feu des postes : profils, règles et état réel',
 'Fixer les profils réseau, concevoir des règles par application sans créer de trous et distinguer ce que le pare-feu natif fait de ce qui exige un autre service.',
 ['Tableur','PowerShell sur un poste de test (facultatif)'],
 """Une ingénieure de Nordlys travaille en télétravail dans un café, et son poste est classé sur un réseau « privé » par erreur : le pare-feu est moins strict. Par ailleurs, un chef de projet demande qu'on **bloque l'accès à un site précis par son nom de domaine** depuis le pare-feu : « c'est un pare-feu, non ? »

Votre mandat : définir les profils, concevoir des règles lisibles, et expliquer clairement ce que le pare-feu natif fait et ne fait pas.""",
 'Livrer le tableau des profils réseau, le plan de règles par application et la matrice des besoins réseau (natif, autre service, non pris en charge).',
 '60 min',
 [
 P('Définir les profils réseau','Choisir le comportement pour domaine, privé et public.',
 """Remplissez, pour les trois profils, le tableau : état du pare-feu, **action entrante par défaut**, action sortante par défaut, règles locales autorisées ou non, notifications.

1. Pourquoi le profil **public** est-il le plus strict ?
2. Comment empêcher qu'un réseau de café soit traité comme privé ?
3. Comment vérifier le **profil réellement appliqué** sur le poste ?

```powershell
Get-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction, DefaultOutboundAction
```""",
 """Domaine et privé : entrant bloqué par défaut, sortant autorisé, avec règles précises pour les applications nécessaires ; public : entrant bloqué, règles locales désactivées pour éviter qu'une application s'ouvre elle-même. Le profil est déterminé par le réseau (domaine détecté, choix de l'utilisateur) : il faut limiter la possibilité de classer un réseau public en privé. La commande montre **l'état réel**, qui peut différer de la politique si un conflit ou une GPO intervient.""",
 'Chaque profil a un état, des actions par défaut et un moyen de vérification.'),
 P('Concevoir des règles par application','Écrire des règles précises plutôt qu\'une règle large « pour que ça marche ».',
 """Trois applications demandent des ouvertures (tableau « Demandes de règles ») : un outil de bureau à distance, un serveur de développement local et une application métier. Pour chaque demande, concevez une règle : **programme** (chemin), **sens**, **protocole et port**, **profils**, **adresses distantes**, et **raison**.

1. Quelle règle refuseriez-vous parce qu'elle est trop large ?
2. Comment éviter de multiplier les règles (blocs atomiques par application) ?
3. Comment documentez-vous le propriétaire d'une règle ?""",
 """Refuser une règle qui ouvre un port pour **tous** les programmes et **toutes** les adresses. Préférer une règle liée à un **programme précis**, un **port précis** et des **adresses distantes limitées**. Chaque règle a un propriétaire et une raison dans un registre ; une règle sans propriétaire est une dette de sécurité.""",
 'Chaque règle a un programme, un port, des profils, des adresses et un propriétaire.'),
 P('Dire ce que le pare-feu natif ne fait pas','Répondre à la demande de blocage par nom de domaine et à d\'autres besoins.',
 """À partir du tableau « Besoins réseau », classez chaque besoin : **natif** au pare-feu des postes, **exige un autre service** (passerelle web sécurisée, filtrage de contenu web de Defender, DNS filtrant), ou **non pris en charge ici**. Précisez pour chaque ligne une source à vérifier et une date.

1. Quelle réponse donnez-vous à « bloque ce site par son nom » ?
2. Quelle limite de visibilité y a-t-il pour du trafic chiffré ?""",
 """Un pare-feu de poste filtre surtout par **port, protocole, programme et adresse**. Le blocage par nom de domaine relève plutôt d'un service de filtrage web (par exemple le filtrage de contenu web de Defender for Endpoint ou une passerelle) ; certaines versions de Windows gèrent des règles par nom de domaine : vérifiez la documentation actuelle avant de promettre. Le trafic chiffré limite l'inspection au niveau du poste. Dites-le sans détour.""",
 'Chaque besoin est classé avec une source et une date à vérifier.'),
 P('Vérifier l\'état réel et dépanner','Distinguer politique reçue et pare-feu effectivement actif.',
 """Un poste affiche « politique réussie », mais un test montre qu'un port est ouvert. Décrivez l'enquête en cinq étapes : état de la politique dans Intune, état local des profils, règles effectives, conflits avec une autre source (GPO, logiciel tiers), et rapport de pare-feu.""",
 """Étapes : (1) politique réussie ? (2) profils réels par la commande de lecture ; (3) lister les règles actives et leur origine ; (4) chercher une autre source qui ajoute des règles (GPO, outil de sécurité tiers) ; (5) comparer avec le rapport. Le point clé : une règle locale peut rester si les règles locales sont autorisées. C'est pourquoi on les désactive sur les profils sensibles.""",
 'Votre enquête a cinq étapes, avec une vérification locale.'),
 ],
 ['Le tableau des profils.','Le plan de règles.','La matrice des besoins réseau.','La procédure de dépannage.'],
 ['Les profils ont des valeurs par défaut décidées.','Les règles sont liées à un programme et à un port.','Les limites du pare-feu natif sont écrites avec une source datée.'],
 ['Ouvrir un port pour tous les programmes.','Promettre un blocage par nom de domaine sans vérifier.','Confondre politique réussie et état local.'],
 ['Ajouter un rapport des postes où le profil public n\'est pas strict.','Relier au module protection réseau.'],
 facts=[('Demandes de règles',['Application','Besoin'],[['Outil de bureau à distance','Accepter les connexions entrantes depuis le réseau interne'],['Serveur de développement local','Accepter les connexions depuis le poste seulement'],['Application métier','Se connecter à un serveur sur un port précis']]),
 ('Besoins réseau',['Besoin','Commentaire'],[['Bloquer un site par son nom','Demande d\'un chef de projet'],['Bloquer un port entrant','Postes en télétravail'],['Inspecter le trafic chiffré','Demande de la direction'],['Limiter une application à une adresse','Application métier']])],
 mode='tenant', connected=conn('Un locataire de test avec Intune et un poste Windows de test.','Supprimer la politique et les règles de test.')))

labs.append(L('il07','i07','avancé','Chiffrement des disques et récupération de clés sans impasse',
 'Vérifier les prérequis de chiffrement, concevoir la procédure de récupération avec double contrôle et la reprise de gestion d\'un appareil.',
 ['Tableur','PowerShell sur un poste de test (facultatif)'],
 """Nordlys déploie BitLocker sur 300 postes. Pendant le pilote, trois postes ne se chiffrent pas, un poste affiche une demande de clé de récupération au démarrage, et un employé a perdu l'accès à son disque après un changement de carte mère. Personne ne sait qui est autorisé à lire une clé de récupération, ni comment on s'assure que la clé est tournée après usage.

Votre mandat : fiabiliser les prérequis, écrire la **procédure de récupération** avec contrôle, et préparer la reprise de gestion.""",
 'Livrer la fiche de prérequis, la procédure de récupération de clé avec double contrôle et le plan de reprise de gestion.',
 '75 min',
 [
 P('Établir la fiche de prérequis','Savoir à l\'avance quels appareils ne se chiffreront pas en silence.',
 """À partir du tableau « Postes du pilote », vérifiez pour chaque poste : **TPM** présent et activé, **UEFI avec démarrage sécurisé**, version de Windows, présence d'un **autre produit de chiffrement**, et état actuel.

1. Quelle combinaison empêche un chiffrement silencieux ?
2. Pour les trois postes qui ne se chiffrent pas, quelle est la cause la plus probable ?
3. Quel avertissement surveillez-vous dans la politique avant de forcer le chiffrement ?

```powershell
manage-bde -status
```

Que vous indique chaque champ de la sortie ?""",
 """Un chiffrement silencieux exige notamment un **TPM** utilisable, un démarrage **UEFI** et l'absence d'un autre produit de chiffrement ; sans cela, l'utilisateur voit une invite ou le chiffrement échoue. Les causes probables pour les postes en échec : TPM désactivé dans le microprogramme, mode hérité, ou outil de chiffrement tiers. La commande indique le **statut de conversion**, la **méthode de chiffrement** et les **protecteurs** : lisez-les avant de conclure. Ne forcez jamais un chiffrement sans dépôt de clé garanti.""",
 'Chaque poste du pilote a un diagnostic et une action.'),
 P('Concevoir la procédure de récupération','Permettre l\'accès à une clé tout en le contrôlant.',
 """Écrivez la procédure quand un employé appelle : « j'ai l'écran de récupération BitLocker ».

1. Comment **vérifie-t-on l'identité** de la personne ?
2. Qui peut lire la clé (rôle précis) et comment l'accès est-il **tracé** ?
3. Que fait-on **après l'usage** de la clé (rotation) ?
4. Qui approuve en cas d'appareil de la direction ?
5. Où se trouve la clé (service d'annuaire) et que se passe-t-il si elle n'a jamais été déposée ?""",
 """Procédure type : vérification d'identité par un second canal ; lecture de la clé par un rôle de soutien désigné (avec journalisation) ; **rotation de la clé après usage** via l'action prévue pour que la clé exposée ne serve plus ; approbation supplémentaire pour les profils sensibles (double contrôle). Si la clé n'a jamais été déposée, c'est un échec de conception : le dépôt de la clé doit être une condition **avant** le chiffrement.""",
 'La procédure a une vérification d\'identité, une trace et une rotation.'),
 P('Planifier la reprise de gestion','Savoir quoi faire quand un appareil est réinitialisé ou réinscrit.',
 """Un poste est réinstallé après une panne de disque et réinscrit dans Intune.

1. Que devient la clé de récupération de l'ancien chiffrement ?
2. Comment l'appareil retrouve-t-il ses politiques ?
3. Comment éviter un appareil en double dans l'inventaire ?
4. Quel contrôle confirme que le disque est de nouveau chiffré et que la nouvelle clé est déposée ?""",
 """Un nouveau chiffrement crée une **nouvelle clé** qui doit être déposée ; l'ancienne clé ne sert plus à rien pour le disque réinstallé. Pour éviter les doublons : nettoyer l'ancien enregistrement ou réutiliser l'identité de l'appareil selon la méthode. Contrôle : rapport de chiffrement dans Intune **et** vérification locale du statut.""",
 'Vous avez décrit le sort de la clé et de l\'inventaire après réinscription.'),
 P('Aborder macOS et les limites par plateforme','Ne pas transposer Windows sans preuve.',
 """Pour les Mac de Nordlys, écrivez ce qui change : **FileVault** à la place de BitLocker, où est déposée la clé, ce que le rapport de chiffrement montre, et ce qui diffère du modèle Windows.

1. Comment vérifiez-vous que la clé a bien été déposée dans le service de gestion ?
2. Qui, chez Nordlys, a le droit de la lire pour un Mac ?
3. Quelle limite de la gestion à distance notez-vous dans la fiche de plateformes ?""",
 """Sur macOS, FileVault se configure par une politique de chiffrement, la clé personnelle de récupération est entiercée dans Intune, et le rapport indique l'état de chiffrement. Les prérequis et la façon d'accéder à la clé diffèrent de BitLocker : n'appliquez pas la procédure Windows telle quelle. Documentez les différences dans la fiche de plateformes.""",
 'Votre note distingue FileVault de BitLocker.'),
 ],
 ['La fiche de prérequis.','La procédure de récupération.','Le plan de reprise de gestion.','La note macOS.'],
 ['Aucun chiffrement n\'est forcé sans dépôt de clé.','L\'accès à une clé est tracé et suivi d\'une rotation.','Les différences de plateformes sont écrites.'],
 ['Chiffrer sans dépôt de clé.','Laisser la clé exposée utilisable après usage.','Appliquer la procédure Windows à un Mac.'],
 ['Ajouter une alerte sur les lectures de clés de récupération.','Relier au scénario de perte de télémétrie.'],
 facts=[('Postes du pilote',['Poste','TPM','UEFI et démarrage sécurisé','Autre chiffrement','État'],[['PC-101','Oui','Oui','Non','Chiffré'],['PC-102','Désactivé','Oui','Non','Invite à l\'utilisateur'],['PC-103','Oui','Mode hérité','Non','Échec'],['PC-104','Oui','Oui','Produit tiers','Conflit'],['PC-105','Oui','Oui','Non','Demande de clé au démarrage']])],
 mode='tenant', connected=conn('Un locataire de test avec Intune et une machine virtuelle de test avec TPM virtuel.','Déchiffrer ou supprimer la machine virtuelle de test et supprimer la politique.','Facultatif. Ne chiffrez jamais un poste réel sans avoir testé la récupération.')))

labs.append(L('il08','i08','avancé','LAPS, Credential Guard et élévations : maîtriser les comptes locaux',
 'Contrôler qui lit les mots de passe locaux, planifier Credential Guard avec ses prérequis matériels et préparer le dossier du moindre privilège avec une licence supplémentaire.',
 ['Tableur','PowerShell sur un poste de test (facultatif)'],
 """Chez Nordlys, tous les postes partagent le **même mot de passe d'administrateur local**, écrit dans un document de l'équipe TI. Un technicien a quitté l'entreprise le mois dernier. La direction demande de régler ça vite. De plus, trois chefs d'équipe veulent être « administrateurs locaux » pour installer leurs outils.

Votre mandat : déployer un mot de passe unique par poste avec accès tracé, protéger les identifiants en mémoire, et proposer une alternative aux droits d'administration permanents.""",
 'Livrer la matrice des rôles de lecture LAPS, le plan de déploiement de Credential Guard et le dossier d\'élévation des privilèges.',
 '75 min',
 [
 P('Concevoir l\'accès aux mots de passe locaux','Décider qui lit quoi, comment c\'est tracé et comment c\'est tourné.',
 """1. Où est sauvegardé le mot de passe (annuaire en nuage ou annuaire local) et pourquoi ?
2. Quelles personnes ont le droit de **lire** un mot de passe (rôles) ? Quel rôle personnalisé réduit l'accès au minimum ?
3. Comment les **lectures** sont-elles journalisées ?
4. Quand le mot de passe est-il **tourné** (après usage, après un délai) ?
5. Que fait-on du compte administrateur par défaut (le désactiver, le renommer) ?""",
 """Le mot de passe est sauvegardé dans le répertoire choisi par la politique, un par poste, avec une complexité et une rotation définies. La lecture exige un rôle précis ; un rôle personnalisé limité à cette permission réduit l'exposition. Chaque lecture produit une **entrée de journal** : on s'en sert pour auditer. Après usage, on **tourne** le mot de passe. Le compte par défaut est désactivé ou renommé selon la stratégie, et les groupes locaux d'administrateurs sont **verrouillés** par politique.""",
 'Votre matrice nomme les rôles de lecture, la journalisation et la rotation.'),
 P('Planifier Credential Guard','Déployer la protection des identifiants en mémoire sans surprise matérielle.',
 """À partir du tableau « Parc matériel », indiquez pour chaque modèle : **virtualisation et démarrage sécurisé disponibles**, **TPM**, compatibilité système, et décision (déployer, reporter, exclure).

1. Quels protocoles hérités peuvent casser avec cette protection ?
2. Quel pilote de **trois vagues** proposez-vous ?
3. Comment vérifiez-vous sur le poste que la protection est **en cours d'exécution** ?

```powershell
Get-ComputerInfo -Property DeviceGuardSecurityServicesRunning
```""",
 """Credential Guard repose sur la sécurité basée sur la virtualisation : sans le matériel et le démarrage adéquats, elle ne démarre pas. Des protocoles d'authentification anciens peuvent poser problème : testez avec les applications métier. Trois vagues : TI, pilote, production. La commande liste les services de sécurité en cours d'exécution : une valeur attendue prouve que la protection tourne, **la politique seule ne le prouve pas**.""",
 'Chaque modèle de poste a une décision et une vérification locale.'),
 P('Préparer le dossier du moindre privilège','Remplacer les droits d\'administration permanents par des élévations contrôlées.',
 """Pour les trois chefs d'équipe : proposez une solution de **gestion des élévations** (règles d'élévation, confirmation de l'utilisateur, approbation du soutien) et rédigez le dossier :

1. **Licence** requise (module complémentaire de la suite Intune) : quelles vérifications avant l'achat ?
2. Quelles **règles d'élévation** : automatique, avec confirmation, avec approbation ?
3. Quels **rapports** prouvent l'usage des élévations ?
4. Que répondez-vous si on vous dit : « donne-nous simplement le groupe administrateur » ?""",
 """La gestion des élévations évite les administrateurs permanents : l'utilisateur demande l'élévation pour un programme précis, avec confirmation, justification ou approbation. Elle exige une **licence complémentaire** : confirmez la tarification et la disponibilité avant de promettre. Les rapports d'élévation prouvent qui a élevé quoi et quand. À « donne-nous le groupe administrateur », la réponse : les droits permanents multiplient la surface d'attaque, l'alternative offre le même besoin avec une trace.""",
 'Le dossier mentionne la licence à vérifier, les règles d\'élévation et les rapports.'),
 P('Synthétiser les risques résiduels','Dire clairement ce qui reste exposé après les trois chantiers.',
 """Écrivez une demi-page : risques résiduels (comptes de service partagés, postes sans matériel compatible, personnes en dehors du processus), mesures compensatoires et prochaines étapes. Nommez un propriétaire pour chaque risque.

1. Classez chaque risque par probabilité et par impact avant de proposer une mesure.
2. Précisez ce que vous acceptez de laisser ouvert et jusqu'à quand.""",
 """Un risque résiduel typique : des postes plus anciens sans matériel compatible pour Credential Guard. Mesure compensatoire : accès limité et remplacement planifié. Autre risque : mots de passe de comptes de service gérés hors de ces mécanismes. Un propriétaire nommé transforme un risque en tâche.""",
 'Chaque risque résiduel a un propriétaire et une mesure compensatoire.'),
 ],
 ['La matrice des rôles de lecture LAPS.','Le plan de déploiement de Credential Guard.','Le dossier d\'élévation des privilèges.','La synthèse des risques résiduels.'],
 ['Un mot de passe unique par poste avec lecture tracée.','Chaque modèle a une décision matérielle.','Le dossier signale la licence à vérifier.'],
 ['Garder un mot de passe partagé « pour dépanner ».','Déployer Credential Guard sans vérifier le matériel.','Promettre un module sans vérifier la licence.'],
 ['Ajouter une détection des lectures de mots de passe locaux.','Planifier la désactivation du compte administrateur par défaut.'],
 facts=[('Parc matériel',['Modèle','Quantité','Virtualisation et démarrage sécurisé','TPM'],[['Portable 2023','180','Oui','2.0'],['Portable 2020','90','Oui','2.0'],['Poste fixe 2017','30','Partiel','1.2'],['Poste fixe 2015','10','Non','Aucun']])],
 mode='tenant', connected=conn('Un locataire de test avec Intune et une machine virtuelle de test.','Supprimer la politique de test et réinitialiser le mot de passe local.','Facultatif. N\'appliquez jamais une politique de comptes locaux à un poste de production pour un exercice.')))

emit('src/msec/intune/labs2.ts','INTUNE_LABS_2',labs)
