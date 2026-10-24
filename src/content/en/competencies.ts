import type { Overlay } from './types.ts';

export const enCompetencies: Record<string, Overlay> = {
  'az-hierarchy': { name: 'Azure hierarchy', description: 'Management groups, subscriptions, resource groups, resources.' },
  'az-core-services': { name: 'Core Azure services', description: 'Regions, availability zones, compute, storage and redundancy.' },
  'az-tools': { name: 'Azure tools', description: 'Portal, CLI, PowerShell, ARM and Bicep.' },
  'az-network': { name: 'Azure networking', description: 'Virtual networks, subnets, network security groups.' },
  'az-governance': { name: 'Governance', description: 'Tags, locks, policies.' },
  'id-rbac': { name: 'RBAC and least privilege', description: 'Roles, scopes and minimal assignments.' },
  'id-privileged': { name: 'Privileged access', description: 'PIM, emergency accounts, privileged roles.' },
  'id-entra': { name: 'Microsoft Entra ID', description: 'Users, groups, Conditional Access.' },
  'obs-collection': { name: 'Log collection', description: 'Diagnostic settings, agents, DCRs.' },
  'obs-workspace': { name: 'Log Analytics workspaces', description: 'Design, retention, tables.' },
  'sen-onboarding': { name: 'Sentinel onboarding', description: 'Connectors and go-live.' },
  'sen-automation': { name: 'Sentinel automation', description: 'Automation rules, playbooks, watchlists.' },
  'sen-detection': { name: 'Sentinel detection', description: 'Analytics rules and incidents.' },
  'kql-filter': { name: 'KQL: filter and project', description: 'where, project, extend, take, sort.' },
  'kql-aggregate': { name: 'KQL: aggregate', description: 'summarize, count, dcount, make_set, arg_max.' },
  'kql-time': { name: 'KQL: time', description: 'ago, bin, datetime_diff, time windows.' },
  'kql-join': { name: 'KQL: joins and unions', description: 'join, union, let, datatable.' },
  'kql-reading': { name: 'KQL: reading and fixing', description: 'Read a result, fix an error.' },
  'soc-triage': { name: 'SOC triage', description: 'Tell a true positive from a false positive.' },
  'soc-investigation': { name: 'SOC investigation', description: 'Pivot, rebuild a timeline, conclude.' },
};
