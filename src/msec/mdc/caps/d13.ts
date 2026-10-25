import { cap } from '../model.ts';

export const CAPS_D13 = [
  cap('d13.sql.azure', 'Defender for Azure SQL Databases', {
    plan: 'Defender for Databases (Azure SQL)', obj: 'Évaluer les vulnérabilités et détecter les menaces sur les bases Azure SQL.', risk: 'Supposer que la couverture s’étend à Synapse serverless ou Spark.',
    clouds: 'Azure', scope: 'Serveur ou base', req: 'Plan activé', perm: 'SQL Security Manager ou admin de base ou de serveur', cost: 'Tarifé par instance; évaluation express sans frais supplémentaires selon la documentation consultée',
    collect: 'Configuration et activité des bases', compat: 'Bases uniques, pools élastiques, MI, pools dédiés Synapse', limits: 'Pools serverless et Spark non couverts.', nature: 'native', src: ['databases', 'databases-enable', 'sql-intro'], lessons: ['d13-l1'],
  }),
  cap('d13.sql.machines', 'SQL Servers on Machines', {
    plan: 'Defender for Databases (SQL sur machines)', obj: 'Protéger SQL Server hébergé sur machines Azure, AWS, GCP et sur site.', risk: 'Prérequis oubliés : Arc, sysadmin, sortie 443.',
    clouds: 'Azure, AWS, GCP, site', scope: 'Machine', req: 'SQL 2012+, Arc hors Azure, extensions de protection, HTTPS 443 vers arcdataservices', perm: 'Owner sur l’abonnement; compte de service sysadmin', cost: 'Tarifé par instance SQL',
    collect: 'Configuration SQL et télémétrie via agent', compat: 'Agent AMA ou agent amélioré', limits: 'Proxy Azure Arc non pris en charge pour ce flux.', nature: 'dependance', src: ['sql-machines', 'sql-troubleshoot', 'sql-intro'], lessons: ['d13-l1'],
  }),
  cap('d13.sql.va', 'Évaluation des vulnérabilités SQL', {
    plan: 'Defender for Databases', obj: 'Identifier les écarts de configuration SQL et gérer les références.', risk: 'Références approuvées sans échéance.',
    clouds: 'Azure', scope: 'Base de données', req: 'Plan activé', perm: 'SQL Security Manager', cost: 'Express sans frais supplémentaires; classique avec compte de stockage',
    collect: 'Configuration SQL', compat: 'Express (recommandé) et classique', limits: 'Impact sur le score basé sur le risque seulement; API unifiée en préversion.', nature: 'native', src: ['sql-va', 'exemptions'], lessons: ['d13-l2'],
  }),
  cap('d13.sql.atp', 'Protection avancée contre les menaces SQL', {
    plan: 'Defender for Databases', obj: 'Alerter sur injection, accès inhabituel, principal inconnu et force brute.', risk: 'Enquête incomplète sans audit.',
    clouds: 'Azure', scope: 'Serveur ou base', req: 'Plan activé; audit recommandé', perm: 'Security Reader pour les alertes', cost: 'Inclus au plan; stockage d’audit en sus',
    collect: 'Activité des bases', compat: 'Alertes dans Defender for Cloud et SIEM', limits: 'Aucune alerte ne prouve l’absence d’attaque.', nature: 'native', src: ['sql-atp', 'sql-intro', 'siem-export'], lessons: ['d13-l2'],
  }),
  cap('d13.cosmos', 'Defender for Azure Cosmos DB', {
    plan: 'Defender for Databases (Cosmos DB)', obj: 'Détecter injections, accès anormaux et extraction de clés.', risk: 'Croire MongoDB ou Cassandra couverts.',
    clouds: 'Azure', scope: 'Compte Cosmos DB', req: 'Plan activé', perm: 'Security Admin pour activer', cost: 'Tarifé par compte ou débit selon la documentation à confirmer',
    collect: 'Télémétrie d’activité sans lire les données', compat: 'API NoSQL seulement', limits: 'Cassandra, MongoDB, Table et Gremlin non pris en charge.', nature: 'native', src: ['cosmos', 'cosmos-alerts'], lessons: ['d13-l3'],
  }),
  cap('d13.osrdb', 'Bases relationnelles libres', {
    plan: 'Defender for Databases (libres)', obj: 'Détecter les menaces sur PostgreSQL, MySQL et MariaDB.', risk: 'Compter sur AWS en préversion pour un engagement ferme.',
    clouds: 'Azure, AWS (préversion)', scope: 'Serveur de base', req: 'Plan activé', perm: 'Security Admin pour activer', cost: 'Tarifé par instance',
    collect: 'Activité des serveurs', compat: 'Azure GA; AWS préversion; GCP non pris en charge selon les notes', limits: 'Disponibilité à revérifier à la date de mise en œuvre.', nature: 'native', src: ['osrdb', 'databases'], lessons: ['d13-l3'],
  }),
];
