import { registerTrackI18n } from '../../i18n/trackLang.ts';
import { loadDict } from '../../i18n/dicts.ts';
import { buildContent } from '../../agentic/content/build.ts';
import type { AiProject, ModuleContent, ResourceDef } from '../../agentic/types.ts';
import { MDC_LEVELS } from './levels.ts';
import { d01 } from './d01.ts';
import { d02 } from './d02.ts';
import { d03 } from './d03.ts';
import { d04 } from './d04.ts';
import { d05 } from './d05.ts';
import { d06 } from './d06.ts';
import { d07 } from './d07.ts';
import { d08 } from './d08.ts';
import { d09 } from './d09.ts';
import { d10 } from './d10.ts';
import { d11 } from './d11.ts';
import { d12 } from './d12.ts';
import { d13 } from './d13.ts';
import { d14 } from './d14.ts';
import { d15 } from './d15.ts';
import { d16 } from './d16.ts';
import { d17 } from './d17.ts';
import { d18 } from './d18.ts';
import { d19 } from './d19.ts';
import { d20 } from './d20.ts';
import { d21 } from './d21.ts';
import { d22 } from './d22.ts';
import { d23 } from './d23.ts';
import { d24 } from './d24.ts';
import { d25 } from './d25.ts';
import { d26 } from './d26.ts';
import { MDC_FINAL_PROJECTS } from './finalProjects.ts';

export const MDC_MODULES: ModuleContent[] = [d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26];
const finalProjects: AiProject[] = MDC_FINAL_PROJECTS;
const resources: ResourceDef[] = [
  { id: 'r-kql-connecteurs', title: 'Requête Resource Graph : connecteurs multicloud', file: 'kql/connecteurs-resource-graph.kql', kind: 'kql', module: 'd25', status: 'a-verifier', description: 'Liste les ressources de connecteur de sécurité. Lecture seule, rôle Reader, sans coût propre, aucun nettoyage.', how: 'Non exécutée contre un locataire : à valider dans votre environnement avant usage.', lessons: ['d25-l2'] },
  { id: 'r-kql-recos', title: 'Requête Resource Graph : recommandations non conformes', file: 'kql/recommandations-non-conformes.kql', kind: 'kql', module: 'd23', status: 'a-verifier', description: 'Compte les ressources non conformes par recommandation. Lecture seule; résultat tronqué à 1000 enregistrements par défaut.', how: 'Non exécutée contre un locataire : vérifier les noms de propriétés dans votre environnement.', lessons: ['d23-l2'] },
  { id: 'r-kql-sentinel', title: 'Requête Sentinel : alertes Defender for Cloud par gravité', file: 'kql/alertes-sentinel.kql', kind: 'kql', module: 'd22', status: 'a-verifier', description: 'Résume les alertes des sept derniers jours. Lecture seule; exige le connecteur Defender for Cloud dans Sentinel.', how: 'Non exécutée contre un espace de travail : simulée seulement dans la plateforme.', lessons: ['d22-l3'] },
  { id: 'r-bicep-plans', title: 'Modèle Bicep illustratif : plan Servers', file: 'iac/plans-defender.bicep', kind: 'config', module: 'd24', status: 'a-verifier', description: 'ÉCRITURE : active un plan payant. Security Admin ou Owner requis. Retour arrière : pricingTier Free.', how: 'Non testé : ni simulation (what-if) ni déploiement exécutés. Ne pas déployer sans approbation du coût.', needs: 'Approbation du budget, estimation datée, simulation what-if préalable.', lessons: ['d24-l2'] },
  { id: 'r-terraform-plans', title: 'Modèle Terraform illustratif : plan Servers', file: 'iac/plans-defender.tf', kind: 'config', module: 'd24', status: 'a-verifier', description: 'ÉCRITURE : active un plan payant. Lire terraform plan avant tout apply. Retour arrière : tier Free.', how: 'Non testé. Vérifier les arguments dans la documentation du fournisseur pour votre version.', needs: 'Approbation du budget et fournisseur azurerm configuré.', lessons: ['d24-l2'] },
  { id: 'r-ps-plans', title: 'Script PowerShell : lire les plans activés', file: 'scripts/lire-plans.ps1', kind: 'powershell', module: 'd02', status: 'a-verifier', description: 'Lecture seule (Get-AzSecurityPricing), rôle Reader, sans coût, aucun nettoyage.', how: 'Non exécuté contre un abonnement. Nécessite le module Az.Security.', lessons: ['d02-l2'] },
  { id: 'r-donnees-couverture', title: 'Jeu de données fictif de couverture', file: 'donnees/couverture-fictive.csv', kind: 'donnees', module: 'd04', status: 'teste', description: 'Six abonnements fictifs de Nordlys Technologies avec plans et santé des machines.', how: 'Lu par le script verifier-couverture.py, exécuté avec python3 -I.', lessons: ['d04-l3'] },
  { id: 'r-verifier-couverture', title: 'Script Python : écarts de couverture', file: 'scripts/verifier-couverture.py', kind: 'python', module: 'd04', status: 'teste', description: 'Calcule les écarts depuis le jeu fictif. Lecture seule, sans réseau, sans coût.', how: 'Exécuté avec python3 -I le 2026-10-25 : 5 écarts rapportés sur les données fictives.', lessons: ['d04-l3'] },
  { id: 'r-checklist-hebdo', title: 'Liste de contrôle : revue hebdomadaire', file: 'checklists/revue-hebdomadaire.md', kind: 'checklist', module: 'd25', status: 'a-verifier', description: 'Revue de couverture hebdomadaire (lecture).', how: 'Modèle non éprouvé en laboratoire réel.', lessons: ['d25-l1'] },
  { id: 'r-checklist-connecteur', title: 'Liste de contrôle : dépannage d’un connecteur', file: 'checklists/depannage-connecteur.md', kind: 'checklist', module: 'd25', status: 'a-verifier', description: 'Dix étapes de dépannage, un changement à la fois.', how: 'Modèle non éprouvé en laboratoire réel.', lessons: ['d25-l2'] },
  { id: 'r-rapport-direction', title: 'Modèle de rapport de direction', file: 'rapports/rapport-direction.md', kind: 'rapport', module: 'd26', status: 'a-verifier', description: 'Structure d’un rapport avec date, portée, limites et quatre catégories.', how: 'Modèle non éprouvé en laboratoire réel.', lessons: ['d26-l3'] },
];
export const CONTENT = buildContent(MDC_LEVELS, MDC_MODULES, finalProjects, resources);

await registerTrackI18n(CONTENT, () => loadDict('mdc'));
