import type { AiProject } from '../../agentic/types.ts';

// Généré par scripts/labs/*.py : ne pas éditer à la main.
export const XDR_LABS_2: AiProject[] = [
 {
  "id": "xl05",
  "module": "x05",
  "level": "intermédiaire",
  "title": "Bloquer une campagne : indicateurs et protection web",
  "problem": "Mesurer l'exposition à un domaine malveillant, créer les bons indicateurs, comprendre qui applique le blocage et dépanner un faux positif.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Tableur"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Mesurer qui a été exposé",
   "Choisir les indicateurs",
   "Comprendre qui applique le blocage",
   "Dépanner un blocage contesté"
  ],
  "success": [
   "L'exposition est mesurée avant le blocage.",
   "Chaque indicateur a une expiration.",
   "La limite de la protection réseau est dite clairement."
  ],
  "risks": [
   "Autoriser un domaine entier pour régler un ticket.",
   "Croire qu'un indicateur protège sans protection réseau.",
   "Bloquer et oublier d'investiguer."
  ],
  "extensions": [
   "Ajouter une requête qui détecte les nouveaux domaines contactés par PowerShell.",
   "Planifier la revue trimestrielle des indicateurs."
  ],
  "lab": {
   "client": "Mercredi 11 mars, une campagne d'hameçonnage de type « vérification MFA » est arrivée chez Nordlys depuis le domaine **n0rdlys-login.example**. La messagerie en a mis une partie en quarantaine, mais plusieurs courriels ont été livrés. Une adresse inconnue, **cdn.exfil-demo.example**, apparaît aussi dans le trafic d'un poste.\n\nOn vous demande de **bloquer la campagne côté poste**, de mesurer qui a été exposé, et de documenter la procédure pour qu'un faux positif ne bloque pas la production. La direction veut savoir : « est-ce qu'on est protégés maintenant ? »",
   "mission": "Livrer l'analyse d'exposition, la liste d'indicateurs à créer (type, action, durée), la procédure de dépannage d'un blocage contesté et la réponse honnête à « est-ce qu'on est protégés ? ».",
   "duration": "75 min",
   "mode": "tenant",
   "parts": [
    {
     "title": "Mesurer qui a été exposé",
     "goal": "Savoir quels postes et quels comptes ont contacté les deux adresses, avant de bloquer.",
     "steps": "1. Qui a contacté les deux adresses, avec quel processus ?\n\n```kql\nDeviceNetworkEvents\n| where RemoteUrl in (\"n0rdlys-login.example\", \"cdn.exfil-demo.example\")\n| project Timestamp, DeviceName, InitiatingProcessAccountName, InitiatingProcessFileName, RemoteUrl, RemoteIP\n| order by Timestamp asc\n```\n\n2. Quelle adresse IP se cache derrière chaque domaine ? Un indicateur d'IP ou de domaine est-il plus pertinent ?\n\n```kql\nDeviceNetworkEvents\n| where RemoteUrl in (\"n0rdlys-login.example\", \"cdn.exfil-demo.example\")\n| summarize Premier = min(Timestamp), Dernier = max(Timestamp), Postes = dcount(DeviceName) by RemoteUrl, RemoteIP\n```\n\n3. Notez la différence de **processus initiateur** entre les deux domaines : navigateur d'un côté, PowerShell de l'autre.",
     "expected": "Lecture attendue : `n0rdlys-login.example` est contacté depuis le **navigateur** (un clic sur le courriel) par plusieurs postes ; `cdn.exfil-demo.example` est contacté par **PowerShell**, une seule fois, sur un poste qui avait déjà un événement d'audit ASR. Ce second signal est beaucoup plus grave : un script contacte une destination inconnue.\n\nConséquence : bloquer les deux adresses est utile, mais **bloquer ne remplace pas l'investigation** du poste concerné (voir le lab sur l'investigation d'un poste). Le blocage empêche la suite, pas ce qui a déjà eu lieu.",
     "check": "Vous pouvez expliquer pourquoi les deux adresses ne demandent pas la même urgence."
    },
    {
     "title": "Choisir les indicateurs",
     "goal": "Choisir le type, l'action et la portée de chaque indicateur.",
     "steps": "Dans un tableau, proposez au moins quatre indicateurs : type (URL ou domaine, adresse IP, hachage de fichier, certificat), **action** (autoriser, auditer, avertir, bloquer), portée (tous les appareils ou un groupe), **durée** (une date d'expiration) et raison.\n\n1. Pour le domaine d'hameçonnage : domaine entier ou URL précise ?\n2. Pour l'adresse de sortie : domaine, adresse IP, ou les deux ?\n3. Quelle action choisir quand vous n'êtes pas sûr (avertir plutôt que bloquer) ?\n4. Que se passe-t-il si un indicateur d'autorisation et un indicateur de blocage se contredisent ?",
     "expected": "Une proposition : blocage du **domaine entier** d'hameçonnage (le site n'a aucun usage légitime), blocage du **domaine et de l'IP** de sortie, expiration à 90 jours avec revue, raison et numéro de ticket. Pour un domaine incertain, l'action « avertir » laisse l'utilisateur continuer sciemment et produit un signal.\n\nSur les conflits, la règle générale de la documentation consultée : l'autorisation l'emporte sur le blocage, ce qui est une raison de plus de limiter les indicateurs d'autorisation. Vérifiez l'ordre de précédence actuel de la documentation avant de vous y fier.",
     "check": "Chaque indicateur a un type, une action, une durée et une raison."
    },
    {
     "title": "Comprendre qui applique le blocage",
     "goal": "Savoir si c'est SmartScreen ou la protection réseau qui bloque, et ce que ça change.",
     "steps": "Répondez à ces trois questions du directeur :\n\n1. « Si quelqu'un utilise un autre navigateur que Edge, est-ce que le blocage s'applique ? »\n2. « Si l'appareil n'a pas la protection réseau activée, est-ce que l'indicateur sert à quelque chose ? »\n3. « Le blocage empêche-t-il un script PowerShell d'appeler le domaine ? »\n\nRédigez une réponse d'une phrase pour chacune, puis la phrase de synthèse à « est-ce qu'on est protégés maintenant ? ».",
     "expected": "Éléments : dans Edge, la protection des sites est assurée par SmartScreen ; dans les autres navigateurs et pour les processus qui ne sont pas des navigateurs, c'est la **protection réseau** qui doit être activée (au moins en mode audit pour mesurer). Sans elle, un indicateur d'URL ou de domaine ne protège que partiellement. Un script qui appelle un domaine est couvert uniquement si la protection réseau est active en blocage.\n\nSynthèse honnête : « Nous sommes mieux protégés pour les appareils où la protection réseau est en blocage. Pour les autres, le blocage est partiel. À confirmer sur le parc. » C'est mieux qu'un « oui » rassurant.",
     "check": "Votre réponse au directeur distingue les appareils protégés des autres."
    },
    {
     "title": "Dépanner un blocage contesté",
     "goal": "Décider entre exclusion, indicateur d'autorisation et signalement, sans ouvrir un trou.",
     "steps": "Un employé de la comptabilité dit qu'un site de son fournisseur est bloqué par le filtrage de contenu web. Écrivez la procédure de dépannage en cinq étapes :\n\n1. comment retrouver **qui** a bloqué (SmartScreen, protection réseau, filtrage de contenu, politique de la messagerie) ;\n2. comment vérifier que le site est vraiment légitime ;\n3. quelle action choisir : signalement comme faux positif, indicateur d'autorisation limité et daté, ou exclusion ;\n4. qui approuve ;\n5. comment on le consigne et on le retire plus tard.",
     "expected": "Une procédure raisonnable : consulter l'alerte ou l'événement de blocage pour identifier la couche ; vérifier le site (propriétaire, certificat, réputation) ; privilégier le **signalement** à Microsoft pour corriger la réputation si c'est un faux positif, sinon un indicateur d'autorisation **étroit et daté** ; approbation par le responsable de la sécurité ; registre avec date de revue. Ne jamais autoriser un domaine entier juste parce qu'une page est bloquée.",
     "check": "Votre procédure a une étape de vérification, une approbation et une date de retrait."
    }
   ],
   "deliverables": [
    "Une synthèse d'exposition aux deux adresses.",
    "Un tableau d'indicateurs.",
    "Une réponse au directeur en cinq phrases.",
    "Une procédure de dépannage d'un blocage."
   ],
   "context": "defender-xdr"
  },
  "connected": {
   "accounts": "Un locataire de test avec un appareil de test intégré.",
   "permissions": "Security Administrator dans le locataire de test.",
   "costs": "Licences de test à votre charge.",
   "secrets": "Aucun secret.",
   "cleanup": "Supprimer les indicateurs de test.",
   "limits": "Facultatif. N'ajoutez jamais un indicateur réel sans validation d'un responsable."
  }
 },
 {
  "id": "xl06",
  "module": "x06",
  "level": "intermédiaire",
  "title": "Prioriser les vulnérabilités : de la liste à un plan suivi",
  "problem": "Transformer une liste de recommandations en demandes de correction priorisées, gérer les exceptions avec expiration et lire un score sans le sur-interpréter.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Tableur",
   "Terrain de jeu KQL (contexte Defender XDR)"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Lire l'exposition des appareils",
   "Prioriser les recommandations",
   "Rédiger les demandes de correction",
   "Encadrer les exceptions"
  ],
  "success": [
   "Les critères de priorisation sont écrits.",
   "Chaque demande a un test de réussite mesurable.",
   "Chaque exception expire."
  ],
  "risks": [
   "Prioriser uniquement sur la sévérité théorique.",
   "Promettre un résultat immédiat dans le portail.",
   "Laisser des exceptions sans date."
  ],
  "extensions": [
   "Ajouter un indicateur de délai moyen de correction.",
   "Relier la priorisation à la criticité des actifs du parc."
  ],
  "lab": {
   "client": "Le tableau de bord de gestion des vulnérabilités de Nordlys affiche un **score d'exposition « moyen »** et plusieurs dizaines de recommandations. L'équipe ne sait pas par où commencer : « tout est orange ». Le directeur technique veut un plan : quoi corriger cette semaine, quoi planifier, quoi accepter comme risque.\n\nVotre mandat : **prioriser** à partir de critères explicites, produire les demandes de correction avec responsable et échéance, et encadrer les exceptions.",
   "mission": "Livrer un classement priorisé des recommandations avec critères explicites, trois demandes de correction rédigées, un registre d'exceptions avec expiration et une lecture honnête du score d'exposition.",
   "duration": "75 min",
   "mode": "simule",
   "parts": [
    {
     "title": "Lire l'exposition des appareils",
     "goal": "Savoir ce que le niveau d'exposition dit et ce qu'il ne dit pas.",
     "steps": "1. Répartition de l'exposition par groupe d'appareils :\n\n```kql\nDeviceInfo\n| summarize arg_max(Timestamp, *) by DeviceName\n| summarize Appareils = count() by MachineGroup, ExposureLevel\n| order by MachineGroup asc, ExposureLevel asc\n```\n\n2. Quels appareils ont l'exposition la plus élevée, et dans quel groupe ?\n\n```kql\nDeviceInfo\n| summarize arg_max(Timestamp, *) by DeviceName\n| where ExposureLevel in (\"High\", \"Medium\")\n| project DeviceName, OSPlatform, MachineGroup, ExposureLevel, SensorHealthState\n| order by ExposureLevel asc\n```\n\n3. Un appareil à exposition « inconnue » : qu'est-ce que ça signifie pour la fiabilité du score ?",
     "expected": "Vous devriez voir surtout une exposition faible ou moyenne sur les postes, et un **serveur à exposition élevée** (le contrôleur de domaine SRV-DC01, un actif critique). Un appareil dont l'exposition est inconnue est souvent un appareil qui ne remonte pas encore de données (capteur, évaluation pas faite) : le score global est donc **calculé sur ce qui est visible**, ce qui est une limite. Le score est utile pour suivre la tendance, mais il ne remplace pas la priorisation par contexte métier.",
     "check": "Vous pouvez expliquer pourquoi un score « moyen » n'est pas rassurant."
    },
    {
     "title": "Prioriser les recommandations",
     "goal": "Classer avec des critères explicites plutôt qu'au jugé.",
     "steps": "À partir du tableau « Recommandations » (voir données fournies), classez les six lignes. Pour chacune, notez quatre critères : **criticité de l'actif**, **exposition** (Internet, interne), **exploit connu**, **effort de correction**. Puis donnez un rang et une échéance (immédiat, 30 jours, planifié, exception).",
     "expected": "Un classement possible : (1) serveur exposé à Internet avec exploit connu : immédiat, quelques jours ; (2) navigateur sans correctif sur beaucoup de postes avec exploit connu : 7 à 14 jours via une vague pilote ; (3) pilote d'imprimante : 30 jours ; (4) application interne sans correctif disponible : exception **avec mesure compensatoire** ; etc. Le principe : l'exploit connu et l'exposition priment sur la sévérité théorique ; l'effort sert à ordonner les actions de même priorité, pas à les écarter.",
     "check": "Votre classement montre les critères utilisés pour chaque rang."
    },
    {
     "title": "Rédiger les demandes de correction",
     "goal": "Faire en sorte qu'une équipe puisse agir sans vous poser de question.",
     "steps": "Rédigez trois demandes de correction pour les trois premières lignes de votre classement. Chaque demande : **résumé**, appareils concernés, **risque en une phrase**, action demandée, responsable, échéance, **test de réussite** (comment on saura que c'est corrigé), plan de retour arrière.",
     "expected": "Une demande efficace tient en dix lignes et se termine par un test mesurable, par exemple : « la recommandation disparaît dans le portail dans les 24 heures suivant le déploiement (les données se rafraîchissent avec un délai) ». Ne promettez pas un résultat immédiat : l'évaluation a une latence.",
     "check": "Chaque demande a un responsable, une échéance et un test de réussite."
    },
    {
     "title": "Encadrer les exceptions",
     "goal": "Éviter que les exceptions deviennent permanentes.",
     "steps": "Pour la ligne que vous avez mise en exception, remplissez une fiche : justification, **mesures compensatoires**, propriétaire, **date d'expiration** et critère de réévaluation. Puis décrivez comment on s'assure, chaque trimestre, qu'aucune exception n'est expirée sans décision.",
     "expected": "Une exception sans date n'est pas une exception, c'est une décision cachée. La fiche type : « Application de gestion interne, aucun correctif éditeur, réseau isolé, accès restreint à un groupe, journalisation renforcée, expire dans 90 jours, réévaluée par le responsable de l'application. » Le contrôle trimestriel : un rapport des exceptions expirées ou sans propriétaire.",
     "check": "Chaque exception a une expiration et une mesure compensatoire."
    }
   ],
   "deliverables": [
    "Un classement priorisé avec critères.",
    "Trois demandes de correction.",
    "Un registre d'exceptions.",
    "Une note de lecture du score d'exposition."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Recommandations",
     "head": [
      "#",
      "Constat",
      "Appareils",
      "Exposé Internet",
      "Exploit connu",
      "Effort"
     ],
     "rows": [
      [
       "1",
       "Serveur de fichiers : service distant sans correctif",
       "1",
       "Oui",
       "Oui",
       "Faible"
      ],
      [
       "2",
       "Navigateur en retard de deux versions",
       "340",
       "Non",
       "Oui",
       "Moyen"
      ],
      [
       "3",
       "Pilote d'imprimante vulnérable",
       "120",
       "Non",
       "Non",
       "Faible"
      ],
      [
       "4",
       "Application interne sans correctif disponible",
       "12",
       "Non",
       "Non",
       "Élevé"
      ],
      [
       "5",
       "Chiffrement faible sur un service interne",
       "3",
       "Non",
       "Non",
       "Moyen"
      ],
      [
       "6",
       "Bibliothèque obsolète sur des postes de test",
       "8",
       "Non",
       "Non",
       "Faible"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "xl07",
  "module": "x07",
  "level": "intermédiaire",
  "title": "Répondre à une campagne d'hameçonnage avec Defender for Office 365",
  "problem": "Reconstituer une campagne, décider de la remédiation, régler les politiques sans empiler d'exceptions et organiser le signalement par les utilisateurs.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Éditeur de texte"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Reconstituer la campagne",
   "Décider de la remédiation",
   "Ajuster les politiques sans empiler d'exceptions",
   "Organiser le signalement par les utilisateurs"
  ],
  "success": [
   "La reconstitution distingue livré et bloqué.",
   "La remédiation est réversible et approuvée.",
   "Aucune exception ne couvre un domaine entier sans expiration."
  ],
  "risks": [
   "Supprimer définitivement sans conserver de preuve.",
   "Autoriser un domaine entier pour un seul courriel.",
   "Considérer la remédiation automatique comme suffisante sans vérifier."
  ],
  "extensions": [
   "Transformer la requête de reconstitution en détection personnalisée.",
   "Mesurer le délai entre livraison et remédiation."
  ],
  "lab": {
   "client": "Mercredi matin, six employés de Nordlys ont reçu un courriel « Action requise : vérification MFA ». La messagerie en a bloqué deux, mais **six sont arrivés dans la boîte de réception**. Un utilisateur de la comptabilité a signalé le message. La direction demande : « combien de personnes ont reçu ça, qui a cliqué, et qu'est-ce qu'on fait ? »\n\nVotre mandat : reconstituer la campagne avec des requêtes, décider de la remédiation avec les bons niveaux d'approbation, ajuster les politiques et préparer le processus de signalement.",
   "mission": "Livrer la reconstitution de la campagne (destinataires, livraison, clics probables), la décision de remédiation justifiée, les ajustements de politique et le processus de signalement.",
   "duration": "75 min",
   "mode": "tenant",
   "parts": [
    {
     "title": "Reconstituer la campagne",
     "goal": "Trouver tous les destinataires, ce qui a été livré, et les liens contenus dans les messages.",
     "steps": "1. Tous les messages de la campagne, avec l'adresse de destination et le sort réservé :\n\n```kql\nEmailEvents\n| where SenderFromDomain == \"n0rdlys-login.example\"\n| project Timestamp, NetworkMessageId, RecipientEmailAddress, Subject, DeliveryAction, DeliveryLocation, ThreatTypes\n| order by Timestamp asc\n```\n\n2. Les liens contenus dans ces messages (jointure sur l'identifiant du message) :\n\n```kql\nEmailEvents\n| where SenderFromDomain == \"n0rdlys-login.example\"\n| join kind=inner (EmailUrlInfo) on NetworkMessageId\n| project Timestamp, RecipientEmailAddress, DeliveryAction, Url\n| order by Timestamp asc\n```\n\n3. Le même domaine a-t-il été utilisé dans une autre campagne ? Cherchez le second domaine suspect :\n\n```kql\nEmailEvents\n| where SenderFromDomain in (\"n0rdlys-login.example\", \"invoice-nordlys.example\")\n| summarize Messages = count(), Destinataires = dcount(RecipientEmailAddress) by SenderFromDomain, DeliveryAction, DeliveryLocation\n```",
     "expected": "Vous devriez trouver **huit messages** pour la campagne de MFA (six livrés, deux en quarantaine), tous avec un lien vers une page de vérification, et une seconde campagne « facture » avec quelques messages livrés. Les « clics » ne sont pas dans ces tables : dans ce jeu de données, on les infère avec les connexions réseau des postes vers le domaine (voir le lab sur les indicateurs). Dans un vrai locataire, la table des clics sur les liens existe.\n\nLecture : la protection n'est pas défaillante, elle est **partielle**. Les six messages livrés expliquent pourquoi la remédiation doit retirer les messages des boîtes.",
     "check": "Vous avez le nombre de messages livrés, bloqués et de destinataires par campagne."
    },
    {
     "title": "Décider de la remédiation",
     "goal": "Retirer les messages sans perdre de preuve et avec le bon niveau d'approbation.",
     "steps": "1. Quelle action de remédiation choisir pour les six messages livrés : mise en quarantaine, suppression douce, suppression définitive ?\n2. Qui approuve ? Que fait la remédiation automatique après livraison (ZAP) et pourquoi ne remplace-t-elle pas la décision humaine ici ?\n3. Qui prévenir (les six destinataires, le support, la direction) et quoi dire ?\n4. Quelle vérification complémentaire pour les postes qui ont contacté le domaine ?",
     "expected": "Un choix défendable : **déplacer en quarantaine** (réversible, preuve conservée) plutôt que supprimer définitivement ; approbation d'un analyste de niveau 2 ou plus ; communication courte aux six destinataires (« ne cliquez pas, voici quoi faire si vous avez déjà cliqué »). La purge automatique après livraison peut avoir traité une partie, mais elle dépend du verdict à ce moment-là : il faut **vérifier le résultat**, pas le présumer. Pour les postes qui ont contacté le domaine : réinitialisation de la session et du mot de passe de la personne, puis vérification de l'activité du compte (voir le lab sur l'identité).",
     "check": "Votre décision est réversible, approuvée par un rôle nommé et accompagnée d'une communication."
    },
    {
     "title": "Ajuster les politiques sans empiler d'exceptions",
     "goal": "Renforcer la protection sans créer un désordre de politiques contradictoires.",
     "steps": "1. Nordlys utilise-t-il les politiques prédéfinies **Standard** ou **Strict** ? Lequel pour les comptes de la direction et de la finance (comptes prioritaires) ?\n2. Que faut-il vérifier côté liens (réécriture au clic) et pièces jointes (détonation) ?\n3. Un chef de service demande d'ajouter le domaine d'un fournisseur à la liste d'autorisation parce que ses factures vont en quarantaine : que répondez-vous ?\n4. Comment éviter que deux politiques se contredisent ?",
     "expected": "Une proposition : Strict pour les comptes prioritaires (direction, finance, TI), Standard pour tous les autres ; vérifier que la protection au clic et la détonation sont actives ; pour le fournisseur, **ne pas autoriser le domaine entier** : on corrige la cause (authentification SPF/DKIM/DMARC du fournisseur, signalement comme faux positif) et, au besoin, on utilise une autorisation étroite avec expiration. Une seule source de vérité pour les politiques (les préréglages), et les exceptions consignées dans un registre.",
     "check": "Vous avez une règle pour les comptes prioritaires et une réponse claire à la demande d'exception."
    },
    {
     "title": "Organiser le signalement par les utilisateurs",
     "goal": "Faire du signalement un geste simple qui alimente l'analyse.",
     "steps": "Décrivez le processus quand un employé signale un message suspect :\n\n1. où il clique, et où va le message ;\n2. comment l'analyste le traite en moins d'une heure ;\n3. quel retour l'employé reçoit ;\n4. comment une **simulation d'hameçonnage** trimestrielle mesure l'amélioration sans humilier personne.",
     "expected": "Un processus type : bouton de signalement dans Outlook, qui envoie à l'équipe de sécurité et à Microsoft ; tri par l'analyste ; réponse à l'employé (merci, verdict, quoi faire) ; indicateurs de simulation : taux de signalement (à augmenter) plutôt que seulement taux de clic (à diminuer). Le signalement est un **signal de détection** : une personne qui signale vaut une alerte.",
     "check": "Votre processus a un retour à l'employé et un indicateur de simulation."
    }
   ],
   "deliverables": [
    "Le tableau de la campagne (messages, livraison, destinataires).",
    "La décision de remédiation justifiée.",
    "Les ajustements de politique.",
    "Le processus de signalement."
   ],
   "context": "defender-xdr"
  },
  "connected": {
   "accounts": "Un locataire de test avec Defender for Office 365 et quelques boîtes de test.",
   "permissions": "Security Administrator et accès à Threat Explorer dans le locataire de test.",
   "costs": "Licences de test à votre charge.",
   "secrets": "Aucun secret.",
   "cleanup": "Supprimer les politiques et simulations de test.",
   "limits": "Facultatif. N'envoyez jamais de simulation d'hameçonnage à de vrais employés sans accord préalable."
  }
 },
 {
  "id": "xl08",
  "module": "x08",
  "level": "avancé",
  "title": "Attaque sur les identités : du capteur à la réponse",
  "problem": "Placer les capteurs et choisir le compte de service, lire une attaque par force brute sur un serveur et décider de la réponse sur l'identité.",
  "architecture": "Voir le déroulement du lab.",
  "tools": [
   "Terrain de jeu KQL (contexte Defender XDR)",
   "Tableur"
  ],
  "data": "Données fictives de Nordlys Technologies fournies dans le lab.",
  "steps": [
   "Planifier les capteurs et le compte de service",
   "Analyser l'attaque sur SRV-FILE01",
   "Décider de la réponse",
   "Mesurer la couverture et la santé"
  ],
  "success": [
   "Les capteurs sont placés sur les contrôleurs de domaine.",
   "L'analyse distingue tentative et compromission.",
   "La limite de couverture est écrite."
  ],
  "risks": [
   "Installer des capteurs sur les serveurs membres.",
   "Conclure à une compromission sans succès observé.",
   "Laisser le compte administrateur par défaut exposé."
  ],
  "extensions": [
   "Écrire une détection personnalisée pour les échecs répétés par bureau à distance.",
   "Prévoir la rotation des mots de passe locaux."
  ],
  "lab": {
   "client": "Nordlys a trois contrôleurs de domaine : deux dans le siège social et un dans une succursale. Defender for Identity n'est **pas encore déployé**. En parallèle, le 10 mars à 5 h du matin, le serveur de fichiers **SRV-FILE01** a reçu une série d'échecs de connexion distante sur le compte **administrator**, sans qu'aucune alerte ne soit levée.\n\nVotre mandat : planifier le déploiement de Defender for Identity, expliquer pourquoi cette attaque n'a pas levé d'alerte identité, et rédiger la réponse si le compte est compromis.",
   "mission": "Livrer le plan de déploiement des capteurs, l'analyse de l'attaque par force brute avec requêtes, et la procédure de réponse à une identité compromise.",
   "duration": "90 min",
   "mode": "simule",
   "parts": [
    {
     "title": "Planifier les capteurs et le compte de service",
     "goal": "Placer les capteurs au bon endroit et choisir le compte de service adapté.",
     "steps": "À partir du tableau des contrôleurs de domaine :\n\n1. Sur quels serveurs installer le capteur, et pourquoi pas sur les serveurs membres ?\n2. Quelle **version de capteur** choisir selon le système d'exploitation de chaque contrôleur (capteur v2.x ou v3.x) ?\n3. Quel type de compte de service : compte d'annuaire (DSA), gMSA, ou compte système local ? Justifiez.\n4. Quels **paramètres d'audit Windows** doivent être activés pour que les détections fonctionnent ?",
     "expected": "Éléments attendus : un capteur par contrôleur de domaine (c'est là que passe le trafic d'authentification), pas sur les serveurs membres ; la version du capteur dépend du système et de la documentation actuelle, à vérifier au moment du déploiement ; un **gMSA** est généralement préférable à un compte à mot de passe statique, car la rotation est automatique ; l'audit des événements d'authentification et de gestion des comptes doit être activé, sinon le capteur voit moins. Notez la date de lecture de la documentation, car la matrice de versions évolue.",
     "check": "Votre plan nomme les serveurs, la version du capteur, le type de compte de service et les audits."
    },
    {
     "title": "Analyser l'attaque sur SRV-FILE01",
     "goal": "Lire l'attaque avec les données disponibles et comprendre ce qu'elles ne disent pas.",
     "steps": "1. Résumez les échecs sur le compte administrator :\n\n```kql\nDeviceLogonEvents\n| where AccountName == \"administrator\" and ActionType == \"LogonFailed\"\n| summarize Echecs = count(), Premier = min(Timestamp), Dernier = max(Timestamp), Sources = dcount(RemoteIP), Raison = any(FailureReason) by DeviceName, LogonType\n```\n\n2. D'où vient l'attaque ? Cette adresse a-t-elle réussi ailleurs ?\n\n```kql\nDeviceLogonEvents\n| where RemoteIP == \"198.51.100.23\"\n| summarize Evenements = count(), Reussites = countif(ActionType == \"LogonSuccess\") by DeviceName, AccountName, ActionType\n```\n\n3. Calculez la cadence : combien d'échecs par minute ?",
     "expected": "Vous devriez voir **25 échecs** en environ huit minutes (une tentative toutes les 20 secondes environ), de type **RemoteInteractive** (bureau à distance), depuis **une seule adresse source**, avec la raison « InvalidPassword », et aucune réussite associée dans les données. Lecture : tentative de devinette de mot de passe sur le compte administrateur local exposé en bureau à distance.\n\nPourquoi aucune alerte identité : sans capteur sur les contrôleurs de domaine, ce signal vient du **poste** (le serveur), pas de l'annuaire. Defender for Identity apporte la corrélation côté annuaire ; il ne remplace pas la nécessité de ne **pas exposer** le bureau à distance, de limiter les tentatives et de désactiver ou renommer le compte administrateur par défaut.",
     "check": "Vous pouvez dire la cadence, la source et ce que l'absence de réussite prouve (ou non)."
    },
    {
     "title": "Décider de la réponse",
     "goal": "Réagir proportionnellement, en distinguant tentative et compromission.",
     "steps": "Écrivez la réponse pour les deux cas :\n\n1. **Aucun succès observé** : quelles actions (blocage de l'adresse, verrouillage, réduction de l'exposition du bureau à distance) ?\n2. **Un succès est découvert plus tard** depuis la même adresse : quelles actions sur l'identité (réinitialisation du mot de passe, révocation des sessions, désactivation du compte, vérification des mouvements latéraux) ?\n3. Qui décide, et quel niveau d'approbation ?",
     "expected": "Cas 1 : bloquer l'adresse au pare-feu, vérifier que le bureau à distance n'est pas exposé à Internet (passer par un VPN ou un accès contrôlé), limiter les échecs avec un verrouillage, remplacer le compte administrateur par défaut par des comptes nominatifs et un coffre de mots de passe locaux. Cas 2 : traiter comme une compromission : réinitialiser le mot de passe, révoquer les sessions, désactiver temporairement le compte, chercher les autres connexions du compte, isoler le serveur si des indices le justifient. La décision d'isoler un serveur de fichiers critique se prend avec le responsable du métier.",
     "check": "Vos deux plans distinguent tentative et compromission."
    },
    {
     "title": "Mesurer la couverture et la santé",
     "goal": "Éviter de croire que « déployé » veut dire « surveillé ».",
     "steps": "Définissez trois indicateurs de santé du déploiement (par exemple : nombre de contrôleurs de domaine sans capteur actif, état de l'audit, latence des alertes) et la manière de les surveiller. Puis écrivez la phrase à dire au directeur : « Qu'est-ce qui reste découvert après le déploiement ? ».",
     "expected": "Indicateurs possibles : 100 % des contrôleurs ont un capteur sain ; alertes de santé du capteur traitées sous 24 heures ; audit vérifié chaque trimestre. Ce qui reste découvert : les identités qui s'authentifient hors annuaire (fournisseurs d'identité tiers, serveurs non joints), les comptes de service non surveillés et les attaques qui n'utilisent pas l'authentification. Mieux vaut le dire.",
     "check": "Vous avez trois indicateurs de santé et une phrase honnête sur ce qui reste découvert."
    }
   ],
   "deliverables": [
    "Le plan de déploiement des capteurs.",
    "L'analyse de l'attaque par force brute avec requêtes.",
    "Deux procédures de réponse.",
    "Trois indicateurs de santé."
   ],
   "context": "defender-xdr",
   "facts": [
    {
     "title": "Contrôleurs de domaine de Nordlys",
     "head": [
      "Serveur",
      "Site",
      "Système"
     ],
     "rows": [
      [
       "DC-01",
       "Siège social",
       "Windows Server 2022"
      ],
      [
       "DC-02",
       "Siège social",
       "Windows Server 2019"
      ],
      [
       "DC-03",
       "Succursale",
       "Windows Server 2016"
      ]
     ]
    }
   ]
  }
 }
];
