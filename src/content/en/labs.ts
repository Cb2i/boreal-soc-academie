import type { Overlay } from './types.ts';

export const enLabs: Record<string, Overlay> = {
  'labo-rg-etiquettes-verrou': {
    title: 'Resource group, tags and lock',
    summary: 'Create a resource group, add a tag and a CanNotDelete lock to it, then confirm that deletion is refused.',
    prerequisites: [
      'A test Azure subscription (a free account is enough) where you are Owner',
      'Azure CLI installed and signed in with az login (no secret is entered in this platform)',
      'Complete exercises az-001 to az-005',
    ],
    licenses: 'No additional license: an Azure subscription is enough.',
    cost: 'No billable resource is created. Resource groups, tags and locks are free.',
    steps: [
      'Choose a region and a name: az group create --name rg-labo-verrou --location canadacentral --tags Env=labo Responsable=vous',
      'Show the group and check the tag: az group show --name rg-labo-verrou --query tags',
      'Add the lock: az lock create --name pas-de-suppression --resource-group rg-labo-verrou --lock-type CanNotDelete',
      'Try to delete the group: az group delete --name rg-labo-verrou --yes. The operation must fail because of the lock.',
      'List the locks of the group: az lock list --resource-group rg-labo-verrou',
    ],
    checks: [
      'The tag Env=labo appears in the output of az group show',
      'The deletion attempt is refused with a message that mentions the lock',
      'az lock list shows the lock pas-de-suppression of type CanNotDelete',
    ],
    cleanup: [
      'Remove the lock: az lock delete --name pas-de-suppression --resource-group rg-labo-verrou',
      'Delete the group: az group delete --name rg-labo-verrou --yes',
      'Check that it no longer exists: az group exists --name rg-labo-verrou (expected result: false)',
    ],
  },
  'labo-nsg-regles': {
    title: 'Network security group rules',
    summary: 'Create an NSG, add a high-priority deny rule and observe the evaluation order and the default rules.',
    prerequisites: [
      'A test Azure subscription where you are Contributor or Owner',
      'Azure CLI signed in with az login',
      'Complete exercises az-019 to az-021',
    ],
    licenses: 'No additional license.',
    cost: 'A network security group is free. This lab creates no virtual machine and no public IP address.',
    steps: [
      'Create a resource group: az group create --name rg-labo-nsg --location canadacentral',
      'Create the NSG: az network nsg create --resource-group rg-labo-nsg --name nsg-labo',
      'Add a rule that denies RDP from the Internet: az network nsg rule create --resource-group rg-labo-nsg --nsg-name nsg-labo --name refuser-rdp --priority 200 --direction Inbound --access Deny --protocol Tcp --source-address-prefixes Internet --destination-port-ranges 3389',
      'Add a lower-priority allow rule for the same port: priority 300, access Allow. Note which one wins.',
      'List the custom rules and then the default rules: az network nsg rule list --resource-group rg-labo-nsg --nsg-name nsg-labo --include-default --output table',
    ],
    checks: [
      'The priority 200 rule (Deny) comes before the priority 300 rule (Allow) and wins',
      'The default rules appear with priorities 65000, 65001 and 65500',
      'You can explain why the priority 300 Allow rule has no effect on RDP traffic from the Internet',
    ],
    cleanup: [
      'Delete everything: az group delete --name rg-labo-nsg --yes',
      'Check: az group exists --name rg-labo-nsg (expected result: false)',
    ],
  },
  'labo-politique-audit': {
    title: 'Azure Policy: evaluate without enforcing',
    summary: 'Assign a policy in DoNotEnforce mode on a test resource group and read the compliance evaluation.',
    prerequisites: [
      'A test Azure subscription where you can assign policies (Owner or Resource Policy Contributor)',
      'Azure CLI signed in with az login',
      'Complete exercises az-029 to az-033',
    ],
    licenses: 'No additional license: Azure Policy is a governance service with no evaluation charges of its own.',
    cost: 'No billable resource is required. The lab can be done on an empty resource group. Confirm current pricing in the documentation if you extend it to other services.',
    steps: [
      'Create a test resource group: az group create --name rg-labo-policy --location canadacentral',
      'In the portal, open Azure Policy, Definitions, and search for the built-in definition “Inherit a tag from the resource group if missing”.',
      'Assign it to the group rg-labo-policy, choosing the enforcement mode “Disabled” (DoNotEnforce) and the tag name Env. A managed identity is required for the modify effect: let the portal create it.',
      'Set the tag Env=labo on the group, then create a free resource (for example a virtual network) without a tag.',
      'Wait for the evaluation (it can take a moment) then open Compliance. Note the state of the resource and the reason.',
    ],
    checks: [
      'The assignment shows the enforcement mode DoNotEnforce',
      'The resource without a tag appears as non-compliant, without the tag having been added to it automatically',
      'You can explain the difference between DoNotEnforce, an exclusion and an exemption',
    ],
    cleanup: [
      'Delete the policy assignment from Azure Policy, Assignments',
      'Delete the group: az group delete --name rg-labo-policy --yes',
      'Check that no assignment from the lab remains in Azure Policy',
    ],
  },
  'labo-diagnostic-activite': {
    title: 'Send the activity log to Log Analytics',
    summary: 'Create a workspace, export the subscription activity log and find your own operations with KQL.',
    prerequisites: [
      'A test Azure subscription where you are Owner',
      'Azure CLI signed in with az login',
      'Complete exercises obs-001 to obs-004',
    ],
    licenses: 'No additional license.',
    cost: 'A Log Analytics workspace bills ingestion and retention. The volume in this lab is low, but not zero: check current Azure Monitor pricing before you start and delete the resources at the end.',
    steps: [
      'Create a group and a workspace: az group create --name rg-labo-logs --location canadacentral, then az monitor log-analytics workspace create --resource-group rg-labo-logs --workspace-name law-labo',
      'In the portal, open Monitor, Activity log, Diagnostic settings and add a setting that sends the Administrative and Security categories to law-labo.',
      'Perform a visible operation: create then delete an empty resource group.',
      'After a few minutes, open the workspace logs and run: AzureActivity | where Caller has "your-account" | project TimeGenerated, OperationNameValue, ResourceGroup | order by TimeGenerated desc',
      'Compare your result with the detection in exercise kql-063 (deletion of diagnostic settings).',
    ],
    checks: [
      'The AzureActivity table contains your create and delete operations',
      'The Caller field matches your account',
      'You can explain why deleting a diagnostic setting deserves an alert',
    ],
    cleanup: [
      'Delete the activity log diagnostic setting',
      'Delete the group: az group delete --name rg-labo-logs --yes (the workspace is deleted with it)',
      'Check that no Log Analytics resource from the lab remains',
    ],
  },
  'labo-sentinel-regle': {
    title: 'Sentinel: connect a source and create a scheduled rule',
    summary: 'Enable Microsoft Sentinel on a test workspace, connect the Azure activity log and create a scheduled rule.',
    prerequisites: [
      'A test Azure subscription and a test Log Analytics workspace (see the previous lab)',
      'Sufficient rights to enable Sentinel (Contributor on the group) and to manage the connector',
      'Complete exercises sen-001 to sen-007',
    ],
    licenses: 'No Microsoft 365 license is needed for the Azure activity connector. Identity connectors have their own license requirements: check them in the documentation before adding them.',
    cost: 'Sentinel bills the ingestion of analyzed data on top of Log Analytics. Check current pricing and any trial offers before you start; limit the lab to a few days and a low volume.',
    steps: [
      'In the portal, add Microsoft Sentinel to the test workspace.',
      'Open Data connectors and connect “Azure Activity” to your test subscription.',
      'Create a scheduled rule (Analytics, Create) named “Diagnostic setting deletion”.',
      'Paste the query from exercise sen-007, set the frequency to 5 minutes and the lookback period to 10 minutes (see sen-004), and enable grouping of alerts into incidents.',
      'Trigger the detection by creating then deleting a diagnostic setting on a test resource, then wait for the incident.',
    ],
    checks: [
      'The rule is enabled and runs at the chosen frequency',
      'An incident appears after the diagnostic setting is deleted',
      'The Caller field of the incident identifies you',
    ],
    cleanup: [
      'Disable then delete the analytics rule',
      'Disconnect the Azure activity connector',
      'Remove Microsoft Sentinel from the workspace, then delete the lab resource group',
    ],
  },
  'labo-acces-conditionnel-rapport': {
    title: 'Conditional Access in report-only mode',
    summary: 'In a test tenant, create a location-based block policy in report-only mode, exclude an emergency account and read the impact.',
    prerequisites: [
      'A TEST Microsoft Entra tenant. Never use a production tenant for this lab',
      'A role that lets you manage Conditional Access in this test tenant',
      'A test emergency account already created and protected',
      'Complete exercises id-010 to id-012',
    ],
    licenses: 'Conditional Access requires a suitable Microsoft Entra ID license. Check the current licensing page for your test tenant before you start.',
    cost: 'No Azure infrastructure cost. Any cost is that of the test tenant licenses.',
    steps: [
      'Open Entra, Protection, Conditional Access, and create a new policy named “Block outside Canada (test)”.',
      'Target “All users” and exclude your test emergency account.',
      'Choose all cloud apps and a location condition: any location except Canada.',
      'Choose the “Block access” control and set the state to “Report-only”. Do not enable the policy.',
      'Sign in a few times with a test account, then open the policy impact report.',
    ],
    checks: [
      'The policy state is “Report-only”',
      'The emergency account is in the exclusion list',
      'The report shows the effect the policy would have had without having applied it',
    ],
    cleanup: [
      'Delete the test policy',
      'Check that no policy from the lab remains in the test tenant',
    ],
  },
};
