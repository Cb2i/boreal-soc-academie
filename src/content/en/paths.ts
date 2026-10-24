import type { Overlay } from './types.ts';

export const enPaths: Record<string, Overlay> = {
  'azure-foundations': {
    title: 'Azure: foundations',
    short: 'Foundations',
    description: 'Resource hierarchy, subscriptions, resource groups, regions and tools (portal, CLI, PowerShell, ARM/Bicep).',
    topics: ['Hierarchy', 'Regions', 'Tools', 'ARM and Bicep'],
  },
  'azure-admin': {
    title: 'Azure: administration and architecture',
    short: 'Admin and architecture',
    description: 'Networking (NSG, Bastion, peering, Private Link), storage redundancy and governance (Azure Policy, locks).',
    topics: ['NSG and Bastion', 'Peering', 'Storage', 'Policy and locks'],
  },
  'identity-security': {
    title: 'Identity and security',
    short: 'Identity and security',
    description: 'RBAC and least privilege, Conditional Access (report-only, emergency accounts) and privileged access with PIM.',
    topics: ['RBAC', 'Conditional Access', 'PIM', 'Emergency accounts'],
  },
  observability: {
    title: 'Observability and collection',
    short: 'Log collection',
    description: 'Log Analytics workspaces, diagnostic settings, agents, collection rules and troubleshooting missing data.',
    topics: ['Log Analytics', 'Diagnostics', 'Agents', 'DCR'],
  },
  sentinel: {
    title: 'Microsoft Sentinel',
    short: 'Sentinel',
    description: 'Components, scheduled rules, incident triage, automation rules, playbooks and watchlists.',
    topics: ['Scheduled rules', 'Incidents', 'Automation', 'Watchlists'],
  },
  kql: {
    title: 'KQL Academy',
    short: 'KQL',
    description: 'The query language of Sentinel and Log Analytics, from filters to joins, with a local engine and fictional data.',
    topics: ['Filter', 'Aggregate', 'Time', 'Joins'],
  },
  soc: {
    title: 'SOC investigations',
    short: 'Investigations',
    description: 'Multi-evidence investigation scenarios: password spray, exfiltration, phishing, privilege escalation.',
    topics: ['Triage', 'Pivot', 'Timeline', 'Conclusion'],
  },
};
