import type { AiProject } from '../../agentic/types.ts';

// Généré par scripts/labs/*.py : ne pas éditer à la main.
export const XDR_FINAL_LABS: AiProject[] = [
 {
  "id": "xf01",
  "module": "final",
  "level": "intermédiaire",
  "title": "Hameçonnage suivi d'une compromission de poste",
  "problem": "Reconstituer de bout en bout une chaîne courriel, clic, exécution et appel sortant, délimiter la portée et proposer une réponse proportionnée avec niveaux d'approbation.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Établir la chronologie",
   "Délimiter la portée",
   "Proposer la réponse et les approbations",
   "Rédiger la première page du rapport"
  ],
  "success": [
   "La chronologie sépare observé et déduit.",
   "La portée est chiffrée par requêtes.",
   "Chaque action a un approbateur proportionné.",
   "Les inconnues sont écrites."
  ],
  "risks": [
   "Conclure à une exfiltration sans preuve.",
   "Oublier de réinitialiser les sessions des personnes qui ont cliqué.",
   "Présenter une simulation comme une exécution réelle."
  ],
  "extensions": [
   "Transformer la chaîne en détection personnalisée.",
   "Chiffrer le coût d'une journée de non-détection."
  ],
  "lab": {
   "client": "**Mercredi 11 mars, 13 h.** Le responsable de la sécurité de Nordlys reçoit un signalement d'une employée de la comptabilité : un courriel « vérification MFA » lui a semblé étrange. Au même moment, une alerte d'audit signale Word qui lance PowerShell sur un poste.\n\nVous êtes l'analyste désigné. Vous avez deux heures pour produire un **rapport d'incident préliminaire** : ce qui s'est passé, jusqu'où ça s'est étendu, ce qu'il faut faire maintenant, et ce que vous ne savez pas encore. La direction lira la première page uniquement.",
   "mission": "Reconstituer la chaîne d'attaque avec des requêtes, délimiter la portée (qui, quels postes), proposer la réponse avec les niveaux d'approbation et rédiger la première page du rapport.",
   "duration": "2 h",
   "mode": "simule",
   "parts": [
    {
     "title": "Établir la chronologie",
     "goal": "Reconstituer la séquence à partir des trois sources de données.",
     "steps": "1. Fusionnez courriel, réseau et audit du poste de la personne touchée :\n\n```kql\nunion\n (EmailEvents\n  | where RecipientEmailAddress startswith \"c.ouellet\" and Timestamp > datetime(2026-03-11)\n  | project Timestamp, Source = \"Courriel\", Detail = strcat(DeliveryAction, \" : \", Subject)),\n (DeviceNetworkEvents\n  | where InitiatingProcessAccountName == \"c.ouellet\" and Timestamp > datetime(2026-03-11)\n  | where RemoteUrl !in (\"login.microsoftonline.com\", \"teams.microsoft.com\", \"outlook.office365.com\", \"www.google.com\", \"github.com\", \"cdn.jsdelivr.net\")\n  | project Timestamp, Source = \"Réseau\", Detail = strcat(InitiatingProcessFileName, \" vers \", RemoteUrl)),\n (DeviceProcessEvents\n  | where DeviceName startswith \"PC-017\" and Timestamp > datetime(2026-03-11) and InitiatingProcessFileName in~ (\"WINWORD.EXE\", \"powershell.exe\")\n  | project Timestamp, Source = \"Processus\", Detail = strcat(InitiatingProcessFileName, \" lance \", FileName))\n| order by Timestamp asc\n```\n\n2. Écrivez la chronologie en six lignes maximum. Marquez ce qui est **observé** et ce qui est **déduit**.",
     "expected": "Séquence attendue : courriel livré (9 h), connexion du navigateur au domaine (9 h 12), Word lance PowerShell (10 h 05), PowerShell lance `whoami` (reconnaissance), puis PowerShell contacte une destination inconnue (10 h 06). **Observé** : chaque ligne. **Déduit** : que le document ouvert est celui du courriel (aucun lien direct n'est visible dans les données). Dans un vrai locataire, la ligne de commande encodée (`-enc`) se décode pour confirmer l'intention.",
     "check": "Votre chronologie sépare observé et déduit et contient au moins cinq événements."
    },
    {
     "title": "Délimiter la portée",
     "goal": "Savoir qui d'autre est touché, avec des requêtes bornées.",
     "steps": "1. Qui a reçu, qui a été bloqué, qui a cliqué ?\n\n```kql\nEmailEvents\n| where SenderFromDomain == \"n0rdlys-login.example\"\n| summarize Messages = count(), Livres = countif(DeliveryAction == \"Delivered\"), Destinataires = dcount(RecipientEmailAddress)\n```\n\n2. Qui a contacté le domaine ou la destination de sortie ?\n\n```kql\nDeviceNetworkEvents\n| where RemoteUrl in (\"n0rdlys-login.example\", \"cdn.exfil-demo.example\")\n| summarize Premier = min(Timestamp), Dernier = max(Timestamp) by DeviceName, InitiatingProcessAccountName, RemoteUrl, InitiatingProcessFileName\n| order by Premier asc\n```\n\n3. Combien de postes ont **seulement** contacté le domaine, et combien ont aussi exécuté du code ?",
     "expected": "Résultat : huit messages (six livrés), trois postes qui ont contacté le domaine, dont **un seul** (PC-017) avec exécution de script et appel sortant. Portée : trois comptes à traiter (réinitialisation de session), un poste à investiguer en profondeur. Les trois autres destinataires livrés sans clic restent à surveiller. Ce que ces données ne montrent pas : la saisie éventuelle d'un mot de passe sur la fausse page.",
     "check": "Vous avez les nombres de destinataires, de postes et de comptes à traiter."
    },
    {
     "title": "Proposer la réponse et les approbations",
     "goal": "Choisir des actions proportionnées avec le bon niveau d'approbation.",
     "steps": "Dans un tableau, proposez au minimum huit actions : retirer les courriels, bloquer le domaine et la destination, réinitialiser les sessions et mots de passe des trois comptes, collecter un paquet d'investigation, isoler PC-017, rechercher d'autres postes, prévenir les utilisateurs, ouvrir un ticket.\n\nPour chacune : **qui approuve**, urgence, réversibilité.",
     "expected": "Un tableau défendable : actions réversibles et immédiates (retirer les courriels, bloquer, réinitialiser les sessions) approuvées par l'analyste de niveau 2 ; isolement de PC-017 approuvé par le responsable de la sécurité (activité en cours et appel sortant : justifié) ; communication aux utilisateurs approuvée par la direction de la sécurité. Principe : la **réversibilité** guide le niveau d'approbation.",
     "check": "Chaque action a un approbateur, une urgence et une réversibilité."
    },
    {
     "title": "Rédiger la première page du rapport",
     "goal": "Dire l'essentiel en une page, sans survendre.",
     "steps": "Rédigez la première page : **résumé en trois phrases**, impact connu, impact possible, actions menées, actions à venir, **ce que nous ne savons pas**, prochaine mise à jour.\n\n1. Écrivez le résumé en dernier, mais placez-le en premier : la direction ne lira que lui.\n2. Utilisez des verbes précis (« a contacté », « a exécuté ») plutôt que « a été compromis ».\n3. Terminez par une heure de prochaine mise à jour, pour que personne n'ait à vous relancer.",
     "expected": "Un bon résumé : « Une campagne d'hameçonnage a atteint huit personnes ; trois ont contacté le site frauduleux ; un poste a ensuite exécuté un script qui a contacté une destination externe. Le poste est isolé, les sessions sont réinitialisées. Nous ne savons pas encore si des données ont été exfiltrées ni si un mot de passe a été saisi. Prochaine mise à jour à 16 h. » Le rapport qui ose écrire « nous ne savons pas » est plus crédible.",
     "check": "Votre première page contient une section « ce que nous ne savons pas »."
    }
   ],
   "deliverables": [
    "La chronologie sourcée.",
    "Le tableau de portée.",
    "Le tableau d'actions avec approbateurs.",
    "La première page du rapport."
   ],
   "context": "defender-xdr"
  }
 },
 {
  "id": "xf02",
  "module": "final",
  "level": "avancé",
  "title": "Corrélation identité, appareil et messagerie",
  "problem": "Écrire des requêtes qui relient comptes, appareils et courriels, mesurer la qualité des clés de jointure et documenter les limites de chaque corrélation.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Tableur"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Normaliser la clé de jointure",
   "Corréler courriel, poste et connexions",
   "Mesurer les limites de chaque jointure",
   "Documenter les requêtes"
  ],
  "success": [
   "Chaque jointure est justifiée et limitée.",
   "La couverture est mesurée, pas supposée.",
   "Les échecs de corrélation sont documentés."
  ],
  "risks": [
   "Jointure sur une clé instable.",
   "Absence de filtre de temps.",
   "Confondre absence de données et absence d'activité."
  ],
  "extensions": [
   "Transformer la requête la plus utile en détection personnalisée.",
   "Ajouter un indicateur de qualité de la corrélation dans un tableau de bord."
  ],
  "lab": {
   "client": "Le responsable de la détection de Nordlys veut un tableau de bord « qui a fait quoi, sur quel appareil, après quel courriel ». Il y a un problème : les trois sources n'utilisent **pas les mêmes noms** pour désigner une personne : l'adresse de courriel côté messagerie, le nom de compte côté poste.\n\nVotre mandat : construire les corrélations, **mesurer** combien de lignes se rejoignent réellement, et documenter les cas où la jointure échoue. Un tableau de bord qui joint mal est pire que pas de tableau de bord.",
   "mission": "Concevoir trois requêtes de corrélation, mesurer la couverture de chaque clé de jointure et rédiger la fiche des limites.",
   "duration": "90 min",
   "mode": "simule",
   "parts": [
    {
     "title": "Normaliser la clé de jointure",
     "goal": "Créer une clé commune fiable entre messagerie et poste.",
     "steps": "L'adresse de courriel est de la forme `compte@nordlys.example`, le compte du poste est `compte`.\n\n1. Extrayez le compte de l'adresse et comptez les messages par compte :\n\n```kql\nEmailEvents\n| extend Compte = tostring(split(RecipientEmailAddress, \"@\")[0])\n| summarize Messages = count(), Livres = countif(DeliveryAction == \"Delivered\") by Compte\n| order by Messages desc\n| take 10\n```\n\n2. Quels cas casseraient cette normalisation dans un vrai locataire (alias, comptes à plusieurs courriels, majuscules, boîtes partagées) ?",
     "expected": "La normalisation par le préfixe fonctionne pour ce jeu de données. Dans un vrai locataire, elle échoue pour les alias, les boîtes partagées, les comptes d'administration distincts et les différences de casse : il faut une **clé stable** (identifiant d'objet de l'identité) plutôt qu'une adresse. Notez-le dans la fiche des limites.",
     "check": "Vous avez une clé normalisée et trois cas où elle échouerait."
    },
    {
     "title": "Corréler courriel, poste et connexions",
     "goal": "Écrire une requête qui relie les trois sources et mesurer sa couverture.",
     "steps": "1. Mesurez la couverture : quelle part des destinataires a au moins une connexion de poste ?\n\n```kql\nlet connexions = DeviceLogonEvents\n| where ActionType == \"LogonSuccess\"\n| summarize Appareils = dcount(DeviceName), Connexions = count() by Compte = AccountName;\nEmailEvents\n| extend Compte = tostring(split(RecipientEmailAddress, \"@\")[0])\n| summarize Messages = count() by Compte\n| join kind=leftouter connexions on Compte\n| summarize Comptes = count(), AvecConnexion = countif(isnotempty(Connexions))\n```\n\n2. Écrivez la corrélation métier : pour chaque personne qui a reçu un message livré de la campagne, quels appareils a-t-elle utilisés après la livraison ?\n\n```kql\nlet cibles = EmailEvents\n| where SenderFromDomain == \"n0rdlys-login.example\" and DeliveryAction == \"Delivered\"\n| extend Compte = tostring(split(RecipientEmailAddress, \"@\")[0])\n| project Compte, HeureCourriel = Timestamp;\nDeviceLogonEvents\n| where ActionType == \"LogonSuccess\"\n| join kind=inner cibles on $left.AccountName == $right.Compte\n| where Timestamp > HeureCourriel\n| summarize Appareils = make_set(DeviceName), Premiere = min(Timestamp) by AccountName\n```",
     "expected": "La mesure de couverture indique que **tous les comptes** du jeu de données ont une connexion : ce qui est rassurant dans un jeu de données propre, mais ne l'est pas dans un vrai locataire. La corrélation métier donne, pour chaque personne ciblée, les appareils utilisés après la livraison. Lecture : ces appareils sont les candidats à l'examen, pas des appareils compromis.",
     "check": "Vous avez mesuré la couverture et obtenu la liste des appareils par personne."
    },
    {
     "title": "Mesurer les limites de chaque jointure",
     "goal": "Savoir quand la corrélation est fiable et quand elle ment.",
     "steps": "Remplissez la fiche des limites : une ligne par jointure (courriel vers compte, compte vers appareil, appareil vers identité de session). Colonnes : clé utilisée, **fiabilité** (haute, moyenne, basse), cas d'échec, effet sur la décision, test de qualité.\n\n1. Quel test mesurerait automatiquement la qualité de la clé chaque semaine ?\n2. Que faire quand la clé échoue : ignorer ou signaler ?",
     "expected": "Un test hebdomadaire : part des destinataires pour lesquels la jointure trouve un compte, avec un seuil d'alerte (par exemple moins de 95 %). Quand la clé échoue, on **signale** (ligne « non corrélée ») plutôt que d'ignorer, car l'absence de corrélation est une information : « non corrélé » n'est pas « innocent ».",
     "check": "Votre fiche a un test de qualité et une règle « signaler plutôt qu'ignorer »."
    },
    {
     "title": "Documenter les requêtes",
     "goal": "Permettre à un collègue de reprendre sans vous.",
     "steps": "Rédigez, pour la requête de la partie 2, une fiche en dix lignes : question, tables, clé, volume attendu, limite connue, propriétaire, fréquence. Ajoutez la condition pour laquelle vous **refuseriez** de l'utiliser dans un rapport officiel.\n\n1. Précisez le volume attendu de lignes pour que quelqu'un remarque une dérive.\n2. Nommez la personne qui reçoit l'alerte si le test de qualité échoue.",
     "expected": "Condition de refus : « si la couverture de la clé passe sous 95 %, ne pas publier de conclusions fondées sur cette corrélation ». Cette phrase protège la crédibilité de l'équipe. Une bonne fiche contient aussi la fréquence d'exécution (hebdomadaire suffit pour un tableau de bord), le volume habituel de lignes pour détecter une dérive et le nom d'une personne de remplacement si le propriétaire est absent.",
     "check": "La fiche a une condition de refus explicite."
    }
   ],
   "deliverables": [
    "Les trois requêtes.",
    "La mesure de couverture.",
    "La fiche des limites.",
    "La fiche de documentation."
   ],
   "context": "defender-xdr"
  }
 },
 {
  "id": "xf03",
  "module": "final",
  "level": "avancé",
  "title": "Détection personnalisée de bout en bout",
  "problem": "Concevoir, tester sur l'historique, régler et documenter une détection personnalisée, avec ses faux positifs, sa cadence, ses actions et son plan de révision.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Écrire la requête de base",
   "Régler le seuil avec des chiffres",
   "Rédiger l'alerte et les actions",
   "Planifier la révision"
  ],
  "success": [
   "Le seuil est choisi sur des chiffres.",
   "Aucune action destructrice n'est automatique.",
   "La règle a un propriétaire et une revue."
  ],
  "risks": [
   "Seuil unique pour tous les cas.",
   "Action automatique sur un seul signal.",
   "Règle sans propriétaire."
  ],
  "extensions": [
   "Ajouter la règle « succès après une rafale ».",
   "Mesurer le temps entre la rafale et la prise en charge."
  ],
  "lab": {
   "client": "Le 10 mars à 5 h, 25 échecs de connexion distante sur le compte **administrator** de SRV-FILE01 ne sont passés inaperçus que parce qu'une personne les a vus par hasard. Votre responsable demande une **détection** : « je veux une alerte quand quelqu'un martèle un compte par bureau à distance ».\n\nUne détection sans réglage inonde la file ou rate tout. Votre mandat : concevoir la règle, la **tester sur l'historique**, régler le seuil avec des chiffres, définir la réponse et planifier la révision.",
   "mission": "Écrire la requête de détection, mesurer l'effet de trois seuils sur l'historique, rédiger l'alerte et le plan d'actions, et décrire l'entretien de la règle.",
   "duration": "90 min",
   "mode": "tenant",
   "parts": [
    {
     "title": "Écrire la requête de base",
     "goal": "Détecter une rafale d'échecs de connexion distante par adresse source.",
     "steps": "```kql\nDeviceLogonEvents\n| where Timestamp > ago(30d)\n| where ActionType == \"LogonFailed\" and LogonType == \"RemoteInteractive\"\n| summarize Echecs = count(), Premier = min(Timestamp), Dernier = max(Timestamp) by RemoteIP, DeviceName, AccountName, Fenetre = bin(Timestamp, 10m)\n| where Echecs >= 5\n```\n\n1. Que fait chaque ligne ? Pourquoi `bin(Timestamp, 10m)` ?\n2. Quelle fenêtre de recherche donner à la règle pour une exécution toutes les heures ?\n3. Quelle colonne manque pour lier l'alerte à un appareil dans un vrai locataire ?",
     "expected": "La requête regroupe les échecs en fenêtres de dix minutes par adresse, appareil et compte, et ne garde que les rafales. Elle retrouve **l'événement du 10 mars** : 25 échecs depuis une même adresse. Pour une exécution horaire, une fenêtre de recherche d'au moins 1 h 10 évite de rater une rafale à cheval sur deux exécutions. En production, ajoutez l'identifiant d'appareil et l'identifiant de l'événement pour que la règle puisse mapper les entités.",
     "check": "Votre requête retrouve la rafale du 10 mars."
    },
    {
     "title": "Régler le seuil avec des chiffres",
     "goal": "Mesurer le bruit à différents seuils avant de choisir.",
     "steps": "1. Combien de rafales pour des seuils de 3, 5 et 10 échecs ? Exécutez la requête avec chaque seuil.\n\n```kql\nDeviceLogonEvents\n| where Timestamp > ago(30d)\n| where ActionType == \"LogonFailed\"\n| summarize Echecs = count() by AccountName, DeviceName, LogonType, Fenetre = bin(Timestamp, 10m)\n| where Echecs >= 3\n| order by Echecs desc\n```\n\n2. Quelles rafales à seuil bas sont probablement **légitimes** (oubli de mot de passe) ?\n3. Quel seuil et quelle exclusion choisissez-vous, et pourquoi ?",
     "expected": "Le seuil de 3 attrape des erreurs humaines (quelques essais d'un utilisateur) ; le seuil de 10 conserve la rafale de 25 mais risquerait de rater des attaques lentes. Un choix défendable : **5 échecs en 10 minutes pour les connexions distantes**, plus une seconde règle sur les échecs répétés à faible cadence, plutôt qu'un seuil unique qui sert à tout. Le principe : le seuil se choisit **en regardant les données**.",
     "check": "Vous avez comparé trois seuils avec des chiffres."
    },
    {
     "title": "Rédiger l'alerte et les actions",
     "goal": "Rendre l'alerte exploitable et limiter l'automatisation.",
     "steps": "Rédigez : titre, description avec les champs dynamiques (adresse, compte, appareil, nombre d'échecs), gravité, catégorie, technique d'attaque probable (accès aux identifiants par force brute), **actions recommandées** (trois étapes) et décision sur les **actions automatiques** (aucune, ou lesquelles ?).",
     "expected": "Gravité moyenne si aucun succès ; élevée si un succès suit la rafale depuis la même adresse (c'est une **règle séparée** à prévoir). Actions automatiques : aucune sur un seul signal ; recommandation : bloquer l'adresse, vérifier l'exposition du bureau à distance, vérifier si un succès suit. Un blocage automatique d'adresse sans validation risque de couper un partenaire légitime.",
     "check": "Votre alerte distingue l'échec de la compromission possible et n'automatise rien de destructeur."
    },
    {
     "title": "Planifier la révision",
     "goal": "Éviter qu'une règle devienne un bruit permanent.",
     "steps": "Écrivez le plan : propriétaire, fréquence de révision, indicateurs (nombre d'alertes, vrais positifs, temps de traitement), conditions de **désactivation** ou de réglage, et la façon de tester après une modification.\n\n1. Qui décide de désactiver une règle, et sur quelle base ?\n2. Où consigne-t-on chaque modification pour l'audit ?\n3. Comment saura-t-on que la règle fonctionne encore (test de bon fonctionnement) ?",
     "expected": "Révision trimestrielle : si moins de 10 % des alertes sont des vrais positifs sur un trimestre, on règle ou on désactive avec décision documentée. Après toute modification, on rejoue la requête sur l'historique pour comparer avant et après.",
     "check": "Votre plan a un propriétaire, un indicateur et une condition de désactivation."
    }
   ],
   "deliverables": [
    "La requête de détection.",
    "Un tableau de comparaison de trois seuils.",
    "Le gabarit d'alerte.",
    "Le plan de révision."
   ],
   "context": "defender-xdr"
  },
  "connected": {
   "accounts": "Un locataire de test avec Defender XDR.",
   "permissions": "Un rôle de gestion des règles de détection dans le locataire de test.",
   "costs": "Licences de test à votre charge.",
   "secrets": "Aucun secret.",
   "cleanup": "Désactiver puis supprimer la règle de test.",
   "limits": "Facultatif. N'activez jamais de blocage automatique en production pour un exercice."
  }
 },
 {
  "id": "xf04",
  "module": "final",
  "level": "intermédiaire",
  "title": "Diagnostic d'une perte de visibilité",
  "problem": "Enquêter sur des appareils qui ne remontent plus rien, distinguer panne, changement de configuration et absence d'activité, puis proposer des contrôles de santé.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Tableur"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Mesurer l'état réel",
   "Classer chaque appareil à problème",
   "Détecter la perte silencieuse automatiquement",
   "Mettre en place trois contrôles de santé"
  ],
  "success": [
   "La couverture réelle est distinguée de l'intégration.",
   "Chaque appareil est classé avec une vérification.",
   "Les contrôles ont un responsable."
  ],
  "risks": [
   "Compter les appareils intégrés comme protégés.",
   "Conclure à l'absence d'activité à partir d'une absence de données.",
   "Oublier le contrôleur de domaine."
  ],
  "extensions": [
   "Ajouter un tableau de bord de santé des capteurs.",
   "Relier ce lab au scénario « Perte de télémétrie » du parcours Scénarios."
  ],
  "lab": {
   "client": "Le tableau de bord de Nordlys affiche **22 appareils sur 23 intégrés**, donc « presque tout va bien ». Un analyste doute : plusieurs postes n'apparaissent presque jamais dans les alertes, et un contrôleur de domaine est signalé « communication altérée ».\n\nVotre mandat : **mesurer** la visibilité réelle, classer chaque appareil problématique (panne, configuration, absence d'activité, non intégré), et mettre en place des contrôles qui préviennent la prochaine perte silencieuse.",
   "mission": "Produire l'état réel de la visibilité, la classification de chaque appareil à problème avec sa première vérification, et trois contrôles de santé.",
   "duration": "75 min",
   "mode": "simule",
   "parts": [
    {
     "title": "Mesurer l'état réel",
     "goal": "Distinguer « intégré » de « actif ».",
     "steps": "```kql\nDeviceInfo\n| summarize arg_max(Timestamp, *) by DeviceName\n| summarize Total = count(), Integres = countif(OnboardingStatus == \"Onboarded\"), Actifs = countif(SensorHealthState == \"Active\")\n```\n\n1. Quelle est la différence entre le chiffre « intégrés » et le chiffre « actifs » ?\n2. Quel est le pourcentage de couverture **réelle** ?\n3. Que répondez-vous à « presque tout va bien » ?",
     "expected": "Vous devriez obtenir environ 22 intégrés pour 18 actifs sur 23 : la couverture réelle est de l'ordre de 78 %, pas de 96 %. Réponse : « Intégrer n'est pas protéger. Un capteur inactif ou en communication altérée ne remonte rien : ces appareils sont des angles morts. » Un tableau de bord qui compte les intégrés sans lire l'état du capteur donne un faux sentiment de sécurité.",
     "check": "Vous avez la couverture réelle en pourcentage."
    },
    {
     "title": "Classer chaque appareil à problème",
     "goal": "Savoir quoi vérifier en premier selon la nature de la panne.",
     "steps": "1. Listez les appareils à problème avec leur dernière activité observée :\n\n```kql\nDeviceProcessEvents\n| summarize Dernier = max(Timestamp) by DeviceName\n| join kind=leftouter (DeviceInfo | summarize arg_max(Timestamp, *) by DeviceName) on DeviceName\n| where SensorHealthState != \"Active\"\n| project DeviceName, Dernier, SensorHealthState, OnboardingStatus\n| order by Dernier asc\n```\n\n2. Pour chaque appareil, classez : **panne du capteur**, **changement de configuration**, **absence d'activité normale** (poste éteint), **non intégré**.\n3. Quelle est la première vérification pour chaque catégorie ?",
     "expected": "Pour les trois appareils au capteur inactif, la dernière activité est ancienne : c'est une **perte silencieuse** (capteur arrêté ou service désactivé) ; vérifiez le service, puis la connectivité, puis un changement récent de politique. Le contrôleur de domaine en communication altérée est un actif critique à traiter en priorité (réseau, proxy). L'appareil « peut être intégré » sans données n'a jamais été protégé. Principe : **l'absence de données n'est pas l'absence d'activité** : on ne peut pas conclure qu'un poste est « propre » parce qu'il ne dit rien.",
     "check": "Chaque appareil est classé avec sa première vérification."
    },
    {
     "title": "Détecter la perte silencieuse automatiquement",
     "goal": "Concevoir une requête de santé réutilisable.",
     "steps": "Concevez une requête qui liste les appareils actifs selon l'inventaire mais **sans événements récents** :\n\n```kql\nDeviceInfo\n| summarize arg_max(Timestamp, *) by DeviceName\n| join kind=leftouter (DeviceProcessEvents | where Timestamp > ago(2d) | summarize Evenements = count() by DeviceName) on DeviceName\n| project DeviceName, SensorHealthState, OnboardingStatus, Evenements\n| order by Evenements asc\n```\n\n1. Quelles lignes sont « normales » et lesquelles sont anormales ?\n2. Pourquoi une valeur vide (null) n'est-elle pas la même chose que zéro événement ?\n3. Quel seuil d'événements par jour considérez-vous « silencieux » pour un poste de bureau ?",
     "expected": "Les lignes avec événements nuls sont celles à investiguer ; un « null » signifie qu'aucune ligne ne correspond (l'appareil n'a **jamais** envoyé d'événements dans la fenêtre), alors que zéro serait un décompte. Pour un poste de bureau, aucun événement pendant une journée ouvrable est suspect ; le week-end, il faut tenir compte de l'absence d'activité. Ce raisonnement alimente la détection de silence du capteur.",
     "check": "Vous savez expliquer null contre zéro et un seuil de silence."
    },
    {
     "title": "Mettre en place trois contrôles de santé",
     "goal": "Prévenir la prochaine perte silencieuse.",
     "steps": "Proposez trois contrôles : requête, fréquence, seuil d'alerte, responsable, action quand il se déclenche. Par exemple : appareils sans événements depuis 24 heures, capteurs inactifs depuis plus de 3 jours, nombre d'appareils intégrés contre appareils actifs.",
     "expected": "Contrôles possibles : quotidien, avec un responsable nommé de l'infrastructure, une alerte à l'équipe de sécurité si la couverture réelle passe sous un seuil (par exemple 95 %) et un tableau de suivi des écarts. L'action : ticket assigné avec délai, pas un courriel ignoré.",
     "check": "Chaque contrôle a une fréquence, un seuil, un responsable et une action."
    }
   ],
   "deliverables": [
    "La couverture réelle en pourcentage.",
    "La classification de chaque appareil à problème.",
    "La requête de santé.",
    "Les trois contrôles."
   ],
   "context": "defender-xdr"
  }
 },
 {
  "id": "xf05",
  "module": "final",
  "level": "avancé",
  "title": "Rapport d'incident sourcé",
  "problem": "Rédiger un rapport d'incident complet où chaque fait est relié à une requête ou une preuve et chaque affirmation sur un produit à une source du registre.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Construire le tableau de preuves",
   "Sourcer les affirmations sur les produits",
   "Rédiger l'impact et les recommandations",
   "Écrire les limites et relire"
  ],
  "success": [
   "Chaque fait renvoie à une requête.",
   "Chaque affirmation de produit renvoie à une source datée.",
   "Les inconnues sont explicites."
  ],
  "risks": [
   "Écrire « aucune exfiltration » sans preuve.",
   "Citer une documentation sans date.",
   "Présenter la simulation comme un incident réel."
  ],
  "extensions": [
   "Ajouter un résumé d'une page pour la direction.",
   "Ajouter une ligne de temps des décisions."
  ],
  "lab": {
   "client": "Après l'incident d'hameçonnage de Nordlys, la direction et l'assureur demandent un **rapport d'incident** formel. Le dernier rapport de l'équipe contenait des affirmations non vérifiables (« Microsoft garantit que ... ») et des chiffres sans source. Le comité d'audit a refusé de le signer.\n\nVotre mandat : rédiger un rapport où **chaque fait important** renvoie à une preuve (requête et résultat) et **chaque affirmation sur un produit** renvoie à une source datée du registre de sources du parcours.",
   "mission": "Rédiger un rapport de deux pages avec tableau de preuves, section d'affirmations sourcées, impact, recommandations et limites.",
   "duration": "2 h",
   "mode": "simule",
   "parts": [
    {
     "title": "Construire le tableau de preuves",
     "goal": "Relier chaque fait à une requête et à son résultat.",
     "steps": "Construisez un tableau à quatre colonnes : **fait**, **preuve** (requête), **résultat**, **confiance** (haute, moyenne, basse). Au minimum six faits. Utilisez ces requêtes :\n\n```kql\nEmailEvents\n| where SenderFromDomain == \"n0rdlys-login.example\"\n| summarize Messages = count(), Livres = countif(DeliveryAction == \"Delivered\"), Bloques = countif(DeliveryAction == \"Blocked\")\n```\n\n```kql\nDeviceNetworkEvents\n| where RemoteUrl in (\"n0rdlys-login.example\", \"cdn.exfil-demo.example\")\n| summarize Postes = dcount(DeviceName), Comptes = dcount(InitiatingProcessAccountName) by RemoteUrl\n```\n\n```kql\nDeviceProcessEvents\n| where DeviceName startswith \"PC-017\" and InitiatingProcessFileName == \"WINWORD.EXE\"\n| project Timestamp, FileName, ProcessCommandLine\n```",
     "expected": "Exemples de lignes : « Huit messages ont été envoyés, six livrés, deux bloqués » (requête 1, confiance haute) ; « Trois postes ont contacté le domaine » (requête 2, haute) ; « Word a lancé un PowerShell encodé sur PC-017 » (requête 3, haute, avec l'horodatage) ; « Aucune donnée n'a été exfiltrée » : **non établi**, confiance basse : il ne faut pas l'écrire comme un fait. Chaque ligne doit pouvoir être rejouée par un auditeur.",
     "check": "Chaque fait est relié à une requête et une confiance."
    },
    {
     "title": "Sourcer les affirmations sur les produits",
     "goal": "Éviter les affirmations non vérifiables sur ce que Microsoft garantit.",
     "steps": "Le rapport contient trois affirmations sur Defender :\n\n1. « La protection bloque tout courriel malveillant. »\n2. « Les données de chasse avancée sont conservées 30 jours. »\n3. « L'isolement d'un appareil coupe toutes les connexions. »\n\nPour chacune : est-elle **exacte**, **partielle** ou **à reformuler** ? Retrouvez dans le **registre de sources** du parcours (page Sources) la page de documentation correspondante et notez-la avec sa date de consultation.\n\n4. Si vous ne trouvez aucune source pour une affirmation, que faites-vous : la retirer, la reformuler ou la marquer « non vérifiée » ?",
     "expected": "1 est fausse : aucune protection ne bloque tout ; reformuler : « la protection a bloqué deux des huit messages ». 2 est exacte selon la documentation consultée, mais la rétention peut évoluer : citer la source et la date. 3 est partielle : l'isolement complet coupe les connexions réseau sauf vers le service de Defender, mais il existe une variante **sélective** qui conserve certaines applications. Règle : une affirmation sur un produit **sans source datée** n'entre pas dans le rapport.",
     "check": "Chaque affirmation sur un produit a une source du registre et une date."
    },
    {
     "title": "Rédiger l'impact et les recommandations",
     "goal": "Distinguer impact connu, possible et inconnu.",
     "steps": "Rédigez : **impact connu** (ce qui est prouvé), **impact possible** (ce qui est plausible, avec le raisonnement), **impact inconnu** (ce qu'on n'a pas pu vérifier), puis cinq recommandations priorisées avec responsable et échéance.\n\n1. Pour chaque élément de « impact possible », écrivez ce qui le rendrait plausible et ce qui le confirmerait.\n2. Chaque recommandation doit répondre à une lacune observée dans l'incident, pas à une préférence générale.",
     "expected": "Impact connu : trois comptes exposés, un poste avec exécution de script. Possible : saisie d'identifiants, exfiltration (non prouvée). Inconnu : l'usage du compte après la compromission hors de la période observable. Les recommandations viennent de ce qui a manqué : protection réseau en blocage, règle ASR en blocage pour Office, détection de la chaîne, simulation d'hameçonnage ciblée.",
     "check": "Votre rapport sépare connu, possible et inconnu."
    },
    {
     "title": "Écrire les limites et relire",
     "goal": "Terminer par ce qui limite la confiance dans le rapport.",
     "steps": "Rédigez une section « Limites » de dix lignes : sources de données, fenêtre de rétention, clés de jointure approximatives, et le fait que le jeu de données est simulé dans ce lab. Puis relisez le rapport avec une grille : toute phrase affirmative a-t-elle une preuve ou une source ?",
     "expected": "Une section honnête : « Les données couvrent 30 jours. Les jointures reposent sur des noms de compte déduits des adresses. Aucune analyse de mémoire ni de disque n'a été faite. » La grille de relecture élimine les phrases sans preuve ; c'est ce qui rend le rapport signable.",
     "check": "Chaque phrase affirmative a une preuve ou une source."
    }
   ],
   "deliverables": [
    "Le tableau de preuves.",
    "Les affirmations sourcées.",
    "La section impact et recommandations.",
    "La section limites."
   ],
   "context": "defender-xdr"
  }
 },
 {
  "id": "xf06",
  "module": "final",
  "level": "avancé",
  "title": "Plan d'amélioration XDR",
  "problem": "Évaluer la maturité d'un déploiement fictif, prioriser les lacunes par risque et effort, et produire une feuille de route de 90 jours avec indicateurs.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Terrain de jeu KQL (contexte Defender XDR)"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Mesurer la couverture de base",
   "Évaluer huit domaines",
   "Prioriser par risque et effort",
   "Rédiger la feuille de route de 90 jours"
  ],
  "success": [
   "Aucune note sans preuve.",
   "Chaque priorité a un propriétaire.",
   "Chaque bloc a un indicateur chiffré."
  ],
  "risks": [
   "Évaluer à l'impression.",
   "Prioriser uniquement par effort.",
   "Promettre sans propriétaire."
  ],
  "extensions": [
   "Ajouter une revue après chaque mise à jour de la documentation.",
   "Relier la feuille de route à un budget chiffré."
  ],
  "lab": {
   "client": "Un an après le déploiement de Defender XDR chez Nordlys, le directeur de la sécurité demande : « Où en sommes-nous, vraiment ? et qu'est-ce qu'on fait ensuite avec le budget qu'il reste ? » Il veut un **plan d'amélioration** sur 90 jours, pas une liste de souhaits.\n\nVous disposez d'une grille d'évaluation de huit domaines et de quelques mesures issues du terrain de jeu.",
   "mission": "Noter la maturité de huit domaines avec des preuves, prioriser les lacunes par risque et effort et rédiger une feuille de route de 90 jours avec indicateurs de réussite.",
   "duration": "2 h",
   "mode": "simule",
   "parts": [
    {
     "title": "Mesurer la couverture de base",
     "goal": "Appuyer l'évaluation sur des mesures et non sur des impressions.",
     "steps": "```kql\nDeviceInfo\n| summarize arg_max(Timestamp, *) by DeviceName\n| summarize Total = count(), Integres = countif(OnboardingStatus == \"Onboarded\"), Actifs = countif(SensorHealthState == \"Active\"), ExpositionElevee = countif(ExposureLevel == \"High\")\n```\n\n```kql\nDeviceEvents\n| where ActionType startswith \"Asr\"\n| summarize Evenements = count(), Appareils = dcount(DeviceName) by ActionType\n```\n\nNotez les trois mesures qui reflètent le mieux la maturité.\n\n1. Pourquoi un pourcentage d'appareils intégrés ne suffit-il pas comme mesure de maturité ?\n2. Qu'est-ce qu'une règle ASR en audit apprend sur le niveau de protection réel ?",
     "expected": "Mesures utiles : couverture réelle des capteurs (actifs sur total), nombre d'appareils à exposition élevée, volume de règles ASR encore en **audit** (donc pas en blocage). Chacune se chiffre et se suit dans le temps.",
     "check": "Vous avez trois mesures chiffrées."
    },
    {
     "title": "Évaluer huit domaines",
     "goal": "Noter chaque domaine avec une preuve.",
     "steps": "Complétez la grille « Domaines à évaluer » (voir données fournies) : note de 0 à 3 (0 absent, 1 partiel, 2 en place, 3 mesuré et revu) et **preuve** pour chaque note. Ne mettez pas de 3 sans mesure.\n\n1. Notez d'abord sans regarder les mesures, puis comparez : où votre impression diffère-t-elle des chiffres ?\n2. Pour chaque 0 ou 1, écrivez ce qu'il faudrait pour passer au niveau suivant.",
     "expected": "Une évaluation honnête donne beaucoup de 1 et de 2, et quelques 0. Un 3 exige une mesure et une revue : par exemple, la couverture des capteurs mesurée chaque semaine. Une note sans preuve vaut zéro. Cette grille sert à comparer d'une année à l'autre : ne la changez pas en cours de route, ou vous perdrez la comparaison.",
     "check": "Chaque note a une preuve, et aucun 3 sans mesure."
    },
    {
     "title": "Prioriser par risque et effort",
     "goal": "Choisir ce qui rapporte le plus de réduction de risque pour le moins d'effort.",
     "steps": "Pour les cinq lacunes les plus importantes, notez : **risque** (1 à 5), **effort** (1 à 5), **dépendances** (licence, déploiement), **réduction de risque attendue**. Classez par rapport risque sur effort, puis ajustez pour les dépendances.\n\n1. Quelle lacune dépend d'une licence que Nordlys n'a pas encore ?\n2. Quelle lacune dépend d'un déploiement préalable (capteurs, politique) ?\n3. Quel propriétaire nommez-vous pour chacune ?",
     "expected": "Des gains rapides typiques : passer les règles ASR validées en blocage, activer la protection réseau en blocage, corriger les capteurs silencieux. Des chantiers plus lourds : détection des identités, gestion des vulnérabilités avancée. Une lacune sans propriétaire ne se fait pas : chaque ligne reçoit un nom.",
     "check": "Vos cinq lacunes sont classées avec risque, effort, dépendances et propriétaire."
    },
    {
     "title": "Rédiger la feuille de route de 90 jours",
     "goal": "Transformer le classement en engagements mesurables.",
     "steps": "Découpez en trois blocs de 30 jours. Pour chaque bloc : objectifs, livrables, **indicateur de réussite chiffré**, risque, besoin de ressources. Terminez par la page de décision demandée au directeur : ce que vous lui demandez d'approuver.\n\n1. Quel risque acceptez-vous de laisser ouvert pendant ces 90 jours, et pourquoi ?\n2. Qu'arrive-t-il si le budget n'est pas approuvé : quel plan réduit ?",
     "expected": "Exemple d'indicateur : « couverture réelle des capteurs de 78 % à 97 % en 30 jours » ; « six règles ASR en blocage à 60 jours » ; « une détection d'identité en place à 90 jours ». La page de décision tient en dix lignes : budget, personnes, risques acceptés.",
     "check": "Chaque bloc a un indicateur chiffré et une demande de décision claire."
    }
   ],
   "deliverables": [
    "La grille d'évaluation complétée.",
    "Le classement des cinq lacunes.",
    "La feuille de route de 90 jours.",
    "La page de décision."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Domaines à évaluer",
     "head": [
      "Domaine",
      "Question à se poser"
     ],
     "rows": [
      [
       "Couverture des appareils",
       "Tous les appareils sont-ils intégrés et actifs ?"
      ],
      [
       "Réduction de la surface d'attaque",
       "Les règles validées sont-elles en blocage ?"
      ],
      [
       "Protection web et réseau",
       "La protection réseau est-elle en blocage ?"
      ],
      [
       "Messagerie",
       "Les politiques Standard ou Strict sont-elles appliquées ?"
      ],
      [
       "Identités",
       "Les attaques sur l'annuaire sont-elles détectées ?"
      ],
      [
       "Vulnérabilités",
       "Les correctifs sont-ils suivis avec des échéances ?"
      ],
      [
       "Détection et réponse",
       "Y a-t-il des détections personnalisées entretenues ?"
      ],
      [
       "Administration",
       "Les accès sont-ils revus chaque trimestre ?"
      ]
     ]
    }
   ]
  }
 }
];
