import type { SourceRef } from './types.ts';

/** Date de la dernière vérification de ces pages dans la documentation officielle (recherche Microsoft Learn). */
export const VERIFIED = '2026-10-24';

const s = (title: string, url: string): SourceRef => ({ title, url, verified: VERIFIED });
const K = 'https://learn.microsoft.com/kusto/query/';
const AZ = 'https://learn.microsoft.com/azure/';

export const SRC = {
  // KQL
  where: s('where operator', K + 'where-operator'),
  summarize: s('summarize operator', K + 'summarize-operator'),
  makeSet: s('make_set() aggregation function', K + 'make-set-aggregation-function'),
  argMax: s('arg_max() aggregation function', K + 'arg-max-aggregation-function'),
  join: s('join operator', K + 'join-operator'),
  innerunique: s('innerunique join', K + 'join-innerunique'),
  quickRef: s('KQL quick reference', K + 'kql-quick-reference'),
  top: s('top operator', K + 'top-operator'),
  sort: s('sort operator', K + 'sort-operator'),
  take: s('take operator', K + 'take-operator'),
  ago: s('ago() function', K + 'ago-function'),
  bin: s('bin() function', K + 'bin-function'),
  stringOps: s('String operators', K + 'datatypes-string-operators'),
  has: s('has operator', K + 'has-operator'),
  let: s('let statement', K + 'let-statement'),
  mvExpand: s('mv-expand operator', K + 'mv-expand-operator'),
  dynamic: s('The dynamic data type', K + 'scalar-data-types/dynamic'),
  commonTasks: s('Common tasks with KQL for Microsoft Sentinel', K + 'tutorials/common-tasks-microsoft-sentinel'),
  distinct: s('distinct operator', K + 'distinct-operator'),
  extend: s('extend operator', K + 'extend-operator'),
  project: s('project operator', K + 'project-operator'),
  union: s('union operator', K + 'union-operator'),
  datatable: s('datatable operator', K + 'datatable-operator'),
  count: s('count operator', K + 'count-operator'),
  // Azure
  mgmtGroups: s('What are Azure management groups?', AZ + 'governance/management-groups/overview'),
  organize: s('Organize your Azure resources effectively', AZ + 'cloud-adoption-framework/ready/azure-setup-guide/organize-resources'),
  rbacOverview: s('What is Azure role-based access control?', AZ + 'role-based-access-control/overview'),
  rbacScope: s('Understand scope for Azure RBAC', AZ + 'role-based-access-control/scope-overview'),
  rbacSteps: s('Steps to assign an Azure role', AZ + 'role-based-access-control/role-assignments-steps'),
  locks: s('Lock your Azure resources', AZ + 'azure-resource-manager/management/lock-resources'),
  // Monitor / Sentinel
  ama: s('Azure Monitor Agent overview', AZ + 'azure-monitor/agents/azure-monitor-agent-overview'),
  amaMigration: s('Migrate to Azure Monitor Agent', AZ + 'azure-monitor/agents/azure-monitor-agent-migration'),
  dcr: s('Data collection rules (DCRs) in Azure Monitor', AZ + 'azure-monitor/data-collection/data-collection-rule-overview'),
  entraDiag: s('Create a Log Analytics workspace to analyze sign-in logs', 'https://learn.microsoft.com/entra/identity/monitoring-health/tutorial-configure-log-analytics-workspace'),
  scheduledRules: s('Scheduled analytics rules in Microsoft Sentinel', AZ + 'sentinel/scheduled-rules-overview'),
  createRules: s('Create a scheduled analytics rule from scratch', AZ + 'sentinel/create-analytics-rules'),
  incidents: s('Investigate Microsoft Sentinel incidents in depth', AZ + 'sentinel/investigate-incidents'),
  incidentOverview: s('Microsoft Sentinel incident investigation', AZ + 'sentinel/incident-investigation'),
  // Defender XDR
  ahSchema: s('Understand the advanced hunting schema', 'https://learn.microsoft.com/defender-xdr/advanced-hunting-schema-tables'),
  ahProcess: s('DeviceProcessEvents (advanced hunting)', 'https://learn.microsoft.com/defender-xdr/advanced-hunting-deviceprocessevents-table'),
  ahSentinel: s('Advanced hunting with Sentinel data in the Defender portal', 'https://learn.microsoft.com/defender-xdr/advanced-hunting-microsoft-defender'),
} as const;

// Sources complémentaires (vérifiées le 2026-10-24 via Microsoft Learn).
const MON = 'https://learn.microsoft.com/azure/azure-monitor/';
const SEN = 'https://learn.microsoft.com/azure/sentinel/';
const ENT = 'https://learn.microsoft.com/entra/';
export const SRC2 = {
  zones: s('Qu’est-ce que les zones de disponibilité ?', AZ + 'reliability/availability-zones-overview'),
  zonesDesign: s('Using availability zones and regions', AZ + 'well-architected/design-guides/regions-availability-zones'),
  nsg: s('Azure network security groups overview', AZ + 'virtual-network/network-security-groups-overview'),
  nsgManage: s('Create, change, or delete a network security group', AZ + 'virtual-network/manage-network-security-group'),
  policyEffects: s('Azure Policy definitions effect basics', AZ + 'governance/policy/concepts/effect-basics'),
  policyOverview: s('What is Azure Policy?', AZ + 'governance/policy/overview'),
  policyDine: s('Azure Policy deployIfNotExists effect', AZ + 'governance/policy/concepts/effect-deploy-if-not-exists'),
  caReportOnly: s('Conditional Access report-only mode', ENT + 'identity/conditional-access/concept-conditional-access-report-only'),
  caBlock: s('Block access example policy (Conditional Access)', ENT + 'identity/conditional-access/policy-block-example'),
  pimStart: s('Start using Privileged Identity Management', ENT + 'id-governance/privileged-identity-management/pim-getting-started'),
  pimRbac: s('Eligible and time-bound role assignments in Azure RBAC', AZ + 'role-based-access-control/pim-integration'),
  tablePlans: s('Tables in Azure Monitor Logs', MON + 'logs/logs-table-overview'),
  retention: s('Manage data retention in a Log Analytics workspace', MON + 'logs/data-retention-configure'),
  logsOverview: s('Azure Monitor Logs overview', MON + 'logs/data-platform-logs'),
  automationRules: s('Automate threat response with automation rules', SEN + 'automate-incident-handling-with-automation-rules'),
  playbooks: s('Automate threat response with playbooks', SEN + 'automation/automate-responses-with-playbooks'),
  sentinelAutomation: s('Automation in Microsoft Sentinel (SOAR)', SEN + 'automation/automation'),
  watchlists: s('Watchlists in Microsoft Sentinel', SEN + 'watchlists'),
  watchlistsQueries: s('Build queries or detection rules with watchlists', SEN + 'watchlists-queries'),
} as const;

const NET = 'https://learn.microsoft.com/azure/';
export const SRC3 = {
  gatewayTransit: s('Configure VPN gateway transit for virtual network peering', NET + 'vpn-gateway/vpn-gateway-peering-gateway-transit'),
  hubSpoke: s('Hub-and-spoke network topology', NET + 'networking/design-guide/hub-spoke'),
  bastion: s('What is Azure Bastion?', NET + 'bastion/bastion-overview'),
  bastionDesign: s('Design architecture for Azure Bastion', NET + 'bastion/design-architecture'),
  privateLinkFaq: s('Azure Private Link frequently asked questions', NET + 'private-link/private-link-faq'),
  privatePaas: s('Private access to Azure PaaS services', NET + 'networking/design-guide/private-platform-as-a-service'),
  storageRedundancy: s('Azure Storage redundancy', NET + 'storage/common/storage-redundancy'),
  policyScope: s('Understand scope in Azure Policy', NET + 'governance/policy/concepts/scope'),
  policyAssignment: s('Azure Policy assignment structure', NET + 'governance/policy/concepts/assignment-structure'),
  policyRemediate: s('Remediate non-compliant resources with Azure Policy', NET + 'governance/policy/how-to/remediate-resources'),
  tagPolicies: s('Assign policy definitions for tag compliance', NET + 'azure-resource-manager/management/tag-policies'),
} as const;
