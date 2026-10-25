from _lib import *
exec(open('scripts/labs/_intcommon.py').read())
labs=[]

labs.append(L('il13','i13','avancé','Gouverner WSL au lieu de l\'interdire par réflexe',
 'Décider qui peut utiliser WSL et sous quelles conditions, choisir le bon mécanisme de configuration et tenir un registre honnête des exigences non prises en charge.',
 ['Tableur','Éditeur de texte'],
 """Les développeurs de Nordlys utilisent le **sous-système Windows pour Linux** (WSL) pour leurs outils. Le responsable de la sécurité veut « l'interdire parce qu'on ne voit rien dedans ». Les développeurs répondent que sans WSL, leur productivité s'effondre. Vous devez trancher avec des faits : ce que l'on peut contrôler, ce que l'on voit, ce qui reste hors de portée.

Votre mandat : une **décision de gouvernance** documentée, un plan de contrôle et un registre des exigences qu'on ne sait pas encore satisfaire.""",
 'Livrer le tableau de décision WSL par population, le plan de gouvernance, le choix de mécanisme pour trois réglages et le registre des exigences non prises en charge.',
 '90 min',
 [
 P('Décider par population','Autoriser, restreindre ou interdire selon le risque, pas selon la peur.',
 """À partir du tableau « Populations », décidez pour chacune : **autoriser avec contrôles**, **autoriser avec exception approuvée**, ou **interdire**. Justifiez.

1. Quels risques propres à WSL (visibilité réduite, outils installés hors inventaire, accès aux fichiers Windows) ?
2. Quelle population a un besoin professionnel démontré ?
3. Quelles conditions préalables (mise à jour, distributions autorisées, protection antivirus) ?""",
 """Un choix : développeurs → autoriser avec contrôles ; ingénierie de données → autoriser avec exception approuvée et revue ; comptabilité et direction → interdire (aucun besoin). Les risques sont réels (le contenu d'une distribution est moins visible pour les outils classiques), mais ils se **réduisent** par des contrôles : version contrôlée, distributions limitées, plugiciel de sécurité, journalisation. Interdire par réflexe pousse les gens à contourner.""",
 'Chaque population a une décision et une condition.'),
 P('Concevoir le plan de gouvernance','Définir ce qu\'on contrôle et comment on le vérifie.',
 """Rédigez le plan : **qui** peut l'activer, **quelles distributions** sont permises, **mises à jour** de WSL et des distributions, **protection** (plugiciel Defender pour WSL, quand disponible), **journalisation**, **conformité** (un appareil avec WSL non conforme est-il traité comme non conforme ?).

1. Quelle preuve montre qu'une distribution est à jour ?
2. Que voit Defender dans WSL, et que ne voit-il pas ?
3. Quel est le plan si un développeur installe une distribution non approuvée ?""",
 """Éléments : activation par exception ou par groupe, distributions listées, mise à jour régulière vérifiée, plugiciel de sécurité activé quand disponible, conformité qui peut tenir compte du composant. **Visibilité limitée** : même avec le plugiciel, certaines activités internes restent moins visibles : notez-le dans le plan comme une limite connue. Pour une distribution non approuvée : détection par inventaire, discussion, alternative approuvée.""",
 'Votre plan a des conditions vérifiables et une limite de visibilité écrite.'),
 P('Choisir le mécanisme de configuration','Utiliser le catalogue de paramètres, OMA-URI ou ADMX selon le cas.',
 """Pour trois réglages (tableau « Réglages à gouverner »), choisissez le mécanisme : **catalogue de paramètres**, **OMA-URI personnalisé**, **modèle ADMX importé** ou **aucun mécanisme disponible**.

1. Quel est l'ordre de préférence et pourquoi ?
2. Comment vérifiez-vous qu'un paramètre existe dans le catalogue avant de recourir à OMA-URI ?
3. Quel risque pose OMA-URI (erreur de syntaxe, dérive, aucune validation) ?""",
 """Préférer le catalogue (validé, lisible), puis ADMX importé, puis OMA-URI en dernier recours. Avant d'écrire un OMA-URI, cherchez dans le catalogue : de nouveaux paramètres y arrivent régulièrement. Un OMA-URI mal formé peut échouer silencieusement : testez sur un poste pilote et vérifiez l'**état réel**.""",
 'Chaque réglage a un mécanisme et une vérification.'),
 P('Tenir le registre des exigences non prises en charge','Dire honnêtement ce qu\'on ne peut pas faire.',
 """À partir des exigences de l'équipe de sécurité (tableau « Exigences »), classez-les : **réalisable**, **réalisable avec compensation**, **non réalisable aujourd'hui**. Pour chaque exigence non réalisable, notez : raison, compensation, **date de revue**.""",
 """Exemple : « inspecter chaque commande dans WSL » est **non réalisable** aujourd'hui ; compensation : limiter l'usage, journaliser l'accès aux fichiers Windows, revue trimestrielle. Un registre honnête protège la crédibilité de l'équipe : mieux vaut écrire « pas encore » que promettre un contrôle qui n'existe pas.""",
 'Chaque exigence non réalisable a une raison, une compensation et une date de revue.'),
 ],
 ['Le tableau de décision WSL.','Le plan de gouvernance.','Le choix des mécanismes.','Le registre des exigences non prises en charge.'],
 ['La décision n\'est pas un interdit par réflexe.','La limite de visibilité est écrite.','Chaque exigence non réalisable a une compensation.'],
 ['Interdire sans offrir d\'alternative.','Promettre une inspection impossible.','Utiliser OMA-URI sans chercher dans le catalogue.'],
 ['Relier au scénario WSL du parcours Scénarios.','Ajouter un inventaire des distributions installées.'],
 facts=[('Populations',['Population','Quantité','Besoin déclaré'],[['Développeurs','25','Outils de compilation Linux'],['Ingénierie de données','6','Bibliothèques spécialisées'],['Comptabilité','20','Aucun'],['Direction','8','Aucun']]),
 ('Réglages à gouverner',['Réglage','Objectif'],[['Activer ou non le composant','Réserver aux groupes autorisés'],['Version du composant','Obtenir les correctifs'],['Accès aux fichiers Windows depuis la distribution','Limiter l\'exposition']]),
 ('Exigences',['Exigence'],[['Inspecter chaque commande exécutée dans WSL'],['Empêcher l\'installation de distributions non approuvées'],['Voir les distributions installées sur chaque poste'],['Appliquer la protection antivirus aux fichiers de la distribution']])],
 mode='tenant', connected=conn('Un locataire de test avec Intune et un poste Windows de test avec WSL.','Supprimer la politique de test et désinstaller la distribution de test.')))

labs.append(L('il14','i14','avancé','Sécurité par plateforme : Mac, mobiles et Linux sans copier Windows',
 'Comparer les contrôles disponibles sur macOS, iOS, Android et Linux, concevoir la sécurité d\'une flotte mobile et tenir une matrice de plateformes honnête.',
 ['Tableur','Éditeur de texte'],
 """Nordlys équipe maintenant ses commerciaux de **iPhone**, ses livreurs de **tablettes Android**, ses designers de **Mac** et trois ingénieurs de **postes Linux**. L'équipe a copié la politique Windows « telle quelle » sur ces plateformes, et la moitié des réglages n'existent pas. Résultat : des tableaux de bord verts qui ne prouvent rien.

Votre mandat : un tableau comparatif honnête, un plan de sécurité de la flotte mobile, et une **matrice de plateformes** maintenue, qui dit clairement ce qui est disponible, ce qui diffère, ce qu'on ne sait pas.""",
 'Livrer le tableau comparatif des contrôles, le plan de sécurité de la flotte mobile et la matrice de plateformes avec certitude et dates.',
 '90 min',
 [
 P('Construire le tableau comparatif','Associer chaque exigence aux leviers réels de chaque plateforme.',
 """Pour les six exigences du tableau « Exigences de sécurité », remplissez les colonnes macOS, iOS/iPadOS, Android Enterprise et Linux : **mécanisme** disponible, **limite** ou « non disponible », et **source à vérifier**.

1. Quelles exigences Windows n'ont **aucun équivalent direct** ailleurs ?
2. Quelles exigences existent sous une autre forme (par exemple, chiffrement par FileVault sur Mac, chiffrement natif sur iOS) ?
3. Quelle ligne exige le plus de prudence avant de promettre ?""",
 """Quelques points : le chiffrement est natif et vérifiable sur iOS et configurable sur macOS (FileVault) ; la **détection de jailbreak ou de débridage** relève de la conformité mobile et d'indicateurs d'intégrité ; les règles ASR n'ont pas d'équivalent direct sur les autres plateformes ; Linux a des capacités de conformité propres, limitées à certaines distributions. Ne promettez rien sans vérification dans la documentation de la plateforme.""",
 'Chaque cellule a un mécanisme, une limite ou « non disponible ».'),
 P('Concevoir la sécurité de la flotte mobile','Choisir les modes de gestion et les contrôles sur iPhone et Android.',
 """1. iPhone d'entreprise : inscription **supervisée** (inscription automatisée) ou non ? Que cela débloque-t-il ?
2. Android : quel mode (**entièrement géré**, **profil professionnel**, **dédié**) pour les tablettes de livraison, et pour les téléphones personnels ?
3. Comment utilisez-vous **Play Integrity** (niveaux de vérification d'intégrité) pour la conformité ?
4. Que fait la **défense contre les menaces mobiles** et quel service ou licence exige-t-elle ?""",
 """Supervision sur iOS : permet des restrictions plus étendues qu'une inscription simple. Android : tablettes de livraison en mode entièrement géré ou dédié ; téléphones personnels en profil professionnel. Play Integrity : plusieurs niveaux de vérification (de base, appareil, forte) qui s'ajoutent à la conformité. La défense mobile est un service distinct (Defender ou un partenaire) : il faut une licence et une intégration, et elle n'élimine pas le risque d'un appareil compromis.""",
 'Chaque population mobile a un mode de gestion et un contrôle d\'intégrité.'),
 P('Évaluer les limites de Linux','Ne rien transposer sans preuve.',
 """Pour les trois postes Linux : 

1. Quelle **distribution et version** sont prises en charge pour la conformité et l'intégration Defender ?
2. Quelles exigences de la matrice sont **non réalisables** aujourd'hui ?
3. Quelle alternative (outil d'automatisation, durcissement par configuration) ?
4. Comment prouvez-vous l'état de conformité d'un poste Linux ?""",
 """La prise en charge Linux dans Intune est limitée à certaines distributions et versions ; vérifiez la documentation. Les exigences non couvertes sont notées avec une compensation (configuration gérée par un outil d'automatisation, accès restreint). La preuve vient du rapport de conformité Linux **s'il existe pour la distribution**, sinon d'une vérification locale scriptée. Ne mettez pas ces postes dans un tableau « conforme » global sans le préciser.""",
 'Vous avez distingué ce qui est géré par Intune de ce qui est géré autrement.'),
 P('Maintenir la matrice de plateformes','Garder la matrice à jour et honnête.',
 """Concevez la matrice : lignes = capacités, colonnes = plateformes, cellules = **disponible**, **limité**, **non disponible**, **non vérifié**, avec la **date** et la **source**. Définissez la fréquence de revue et le propriétaire.

1. Quand déclenchez-vous une revue en dehors du calendrier (nouvelle version majeure d'un système, annonce de Microsoft) ?
2. Comment empêchez-vous une cellule « non vérifié » de devenir un « oui » par habitude ?""",
 """Une matrice vivante : revue trimestrielle plus revue sur annonce ; une cellule « non vérifié » ne passe à « disponible » qu'avec une **source datée**. Le propriétaire est nommé. La matrice sert de réponse à « est-ce qu'on couvre tout comme sur Windows ? » : la réponse honnête est dans les cellules.""",
 'La matrice a des dates, des sources, un propriétaire et une règle sur les cellules non vérifiées.'),
 ],
 ['Le tableau comparatif.','Le plan de sécurité de la flotte mobile.','L\'évaluation Linux.','La matrice de plateformes.'],
 ['Aucune exigence n\'est copiée de Windows sans vérification.','Chaque cellule de la matrice a une date et une source.','Les postes Linux ne sont pas comptés comme conformes sans preuve.'],
 ['Copier la politique Windows ailleurs.','Promettre la détection d\'un appareil débridé sans vérifier.','Laisser une cellule « non vérifié » sans suivi.'],
 ['Ajouter la colonne « effort de déploiement ».','Planifier la revue de la matrice après chaque version majeure.'],
 facts=[('Exigences de sécurité',['#','Exigence'],[['1','Disque chiffré'],['2','Pare-feu actif'],['3','Détection d\'un appareil débridé ou compromis'],['4','Protection antivirus avec preuve d\'état'],['5','Effacement à distance'],['6','Contrôle des logiciels autorisés']])],
 mode='tenant', connected=conn('Un locataire de test avec Intune, un appareil Apple ou Android de test.','Retirer l\'appareil et supprimer les politiques de test.','Facultatif. N\'inscrivez jamais un appareil personnel réel pour un exercice.')))

labs.append(L('il15','i15','avancé','Lire les rapports, dépanner et surveiller la gestion des appareils',
 'Distinguer les quatre états d\'une politique à partir d\'un extrait de rapport, dépanner un appareil qui ne reçoit pas sa politique et organiser la revue après une mise à jour de Microsoft.',
 ['Tableur','Éditeur de texte'],
 """Au comité de sécurité, un tableau de bord Intune affiche « 96 % de réussite ». Un membre demande : « Donc 96 % de nos postes sont protégés ? » Vous savez que ce chiffre mesure seulement que la politique a été **reçue**, pas que la protection est **opérationnelle**. De plus, un technicien dit qu'un poste « ne prend pas la politique » sans savoir par où commencer.

Votre mandat : apprendre à lire les rapports, écrire une procédure de dépannage, et mettre en place la surveillance et la revue après les mises à jour de Microsoft.""",
 'Livrer la fiche de lecture des quatre états, la procédure de dépannage et le plan de surveillance et de revue.',
 '75 min',
 [
 P('Lire les quatre états','Distinguer politique créée, assignée, reçue et protection opérationnelle.',
 """À partir de l'extrait « Rapport de la politique antivirus », classez chaque appareil dans l'état qui correspond à la **dernière preuve que vous avez** :

1. **créée** (la politique existe) ;
2. **assignée** (ciblée vers l'appareil) ;
3. **reçue** (l'appareil l'a appliquée) ;
4. **opérationnelle** (la protection est vérifiée sur l'appareil, le capteur communique).

Pour chaque appareil, écrivez ce qui **manque** pour passer à l'état suivant.""",
 """Un état « Réussi » dans le rapport prouve **reçue**, pas **opérationnelle**. Pour atteindre le quatrième état, il faut une preuve complémentaire : état local, capteur actif dans Defender, signatures récentes. Les appareils « En attente » sont assignés mais pas reçus (hors ligne, pas de synchronisation) ; un « Conflit » n'a pas reçu la valeur voulue ; un « Non applicable » n'est pas ciblé comme vous pensiez. Le chiffre de 96 % ne dit rien sur les trois autres états.""",
 'Chaque appareil est classé et la preuve manquante est nommée.'),
 P('Écrire la procédure de dépannage','Trouver rapidement où une politique s\'arrête.',
 """Rédigez la procédure en étapes ordonnées pour « un poste ne prend pas la politique » :

1. vérifier l'**assignation** (groupe, filtre, exclusion) ;
2. vérifier la **dernière synchronisation** et lancer une synchronisation à distance ;
3. lire l'**état par réglage** (réussi, erreur, conflit, non applicable) ;
4. **collecter un diagnostic** de l'appareil ; que contient-il ?
5. quand escalader.

Précisez pour chaque étape l'outil utilisé et la durée acceptable.""",
 """Ordre efficace : l'assignation et les filtres d'abord (cause fréquente), puis la synchronisation (action à distance), puis l'état par réglage, puis la collecte de diagnostic (journaux de gestion de l'appareil) pour les cas obscurs. Le diagnostic collecté contient les journaux de gestion utiles pour comprendre une erreur de configuration. Escalade si aucun changement après deux synchronisations et un diagnostic.""",
 'Votre procédure a un ordre, un outil par étape et un critère d\'escalade.'),
 P('Utiliser l\'audit et les interfaces de programmation','Savoir qui a changé quoi et automatiser le suivi.',
 """1. Où retrouvez-vous **qui a modifié** une politique et quand ?
2. Comment une **interface de programmation** (Microsoft Graph) peut-elle alimenter un tableau de bord de conformité ?
3. Quelle permission **minimale** donneriez-vous à une application de suivi, et comment protégeriez-vous son secret ?
4. Quelle limite connaissez-vous (délai des données, périmètre des rapports) ?""",
 """Le **journal d'audit** d'Intune consigne les modifications de politiques (qui, quoi, quand). Graph permet d'extraire des rapports et de les assembler dans un tableau de bord ; une application de suivi n'a besoin que de **lecture** sur les rapports, avec un certificat ou un secret conservé dans un coffre. Limites : les données ont un délai et certains rapports exigent des permissions particulières.""",
 'Vous avez nommé le journal d\'audit, la permission minimale et une limite des données.'),
 P('Mettre en place la revue après les mises à jour de Microsoft','Détecter qu\'une fonction a changé avant qu\'elle ne vous surprenne.',
 """Concevez la revue : **sources à surveiller** (documentation, annonces), **fréquence**, **qui lit**, comment vous mettez à jour les **fiches de configuration** et la **matrice de plateformes**, comment vous consignez un changement (date, source, effet).

1. Quel déclencheur provoque une revue immédiate ?
2. Comment évitez-vous que la revue soit oubliée ?""",
 """Une revue mensuelle des annonces et de la documentation de chaque domaine (antivirus, ASR, chiffrement, conformité), avec un propriétaire par domaine et un registre de modifications. Déclencheur immédiat : annonce de retrait ou de changement de comportement d'une fonction que vous utilisez. La revue est planifiée dans un calendrier d'équipe avec un suivi des actions.""",
 'Votre revue a des sources, un propriétaire, une fréquence et un registre.'),
 ],
 ['La fiche de lecture des quatre états.','La procédure de dépannage.','Le plan de surveillance.','Le plan de revue après mise à jour.'],
 ['Chaque appareil est classé dans un des quatre états.','La procédure de dépannage a un ordre.','La revue a un propriétaire et un registre.'],
 ['Interpréter 96 % comme 96 % protégés.','Collecter un diagnostic avant de vérifier l\'assignation.','Oublier la revue après une mise à jour.'],
 ['Créer un tableau de bord des quatre états.','Planifier un test trimestriel de bon fonctionnement.'],
 facts=[('Rapport de la politique antivirus',['Appareil','État dans le rapport','Dernière synchronisation','Capteur Defender'],[['PC-201','Réussi','Aujourd\'hui','Actif'],['PC-202','Réussi','Aujourd\'hui','Inactif'],['PC-203','En attente','Il y a 12 jours','Actif'],['PC-204','Conflit','Hier','Actif'],['PC-205','Non applicable','Hier','Actif'],['PC-206','Erreur','Aujourd\'hui','Non intégré']])],
 mode='tenant', connected=conn('Un locataire de test avec Intune et un poste de test.','Supprimer la politique de test et l\'application de suivi.','Facultatif. Ne donnez jamais plus de permissions de lecture que nécessaire à une application de suivi.')))

emit('src/msec/intune/labs4.ts','INTUNE_LABS_4',labs)
