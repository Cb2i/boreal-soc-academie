import type { Overlay } from './types.ts';

// Traduction anglaise (overlay). Les blocs de code et les identifiants restent identiques au français.
export const enExAz: Record<string, Overlay> = {
 "az-001": {
  "title": "Sort the items into the hierarchy",
  "objective": "Place an item among the four Azure scope levels.",
  "statement": "Azure organizes its items into four scope levels. Place each Nordlys Technologies item in the level it belongs to.",
  "hints": [
   "A management group contains subscriptions, never resources directly.",
   "A virtual machine and a storage account are resources, not containers."
  ],
  "explanation": "The four levels, from broadest to narrowest: management group, subscription, resource group, resource. Settings applied at one level (access, policies, locks) are inherited by the levels below.",
  "commonMistakes": [
   "Placing a resource group under \"Resource\" because it is itself an ARM resource.",
   "Confusing subscription and resource group."
  ],
  "items": [
   {
    "id": "e1",
    "text": "mg-nordlys-racine"
   },
   {
    "id": "e2",
    "text": "Sub-Production"
   },
   {
    "id": "e3",
    "text": "rg-prod-web"
   },
   {
    "id": "e4",
    "text": "vm-web-01 (virtual machine)"
   },
   {
    "id": "e5",
    "text": "stnordlyslogs (storage account)"
   },
   {
    "id": "e6",
    "text": "rg-securite"
   },
   {
    "id": "e7",
    "text": "Sub-Laboratoire"
   },
   {
    "id": "e8",
    "text": "mg-plateforme"
   }
  ],
  "zones": [
   {
    "id": "mg",
    "label": "Management group",
    "description": "Groups subscriptions"
   },
   {
    "id": "sub",
    "label": "Subscription",
    "description": "Billing and management boundary"
   },
   {
    "id": "rg",
    "label": "Resource group",
    "description": "Container for related resources"
   },
   {
    "id": "res",
    "label": "Resource",
    "description": "Single managed item"
   }
  ]
 },
 "az-002": {
  "title": "From the broadest scope to the narrowest",
  "objective": "Order the scope levels.",
  "statement": "Put the scope levels back in order, **from broadest to narrowest**.",
  "hints": [
   "The broadest level contains the subscriptions.",
   "The resource is the final item, at the very bottom."
  ],
  "explanation": "A setting applied higher up is inherited by everything below it: a policy applied to the subscription applies to all its resource groups and to all their resources.",
  "commonMistakes": [
   "Reversing subscription and resource group.",
   "Forgetting the \"management group\" level, optional in practice but present in the hierarchy."
  ],
  "items": [
   {
    "id": "o1",
    "text": "Management group"
   },
   {
    "id": "o2",
    "text": "Subscription"
   },
   {
    "id": "o3",
    "text": "Resource group"
   },
   {
    "id": "o4",
    "text": "Resource"
   }
  ]
 },
 "az-003": {
  "title": "The Azure Resource Manager vocabulary",
  "objective": "Match an ARM term to its definition.",
  "statement": "Match each term to its definition.",
  "hints": [
   "Microsoft.Compute and Microsoft.Storage are examples of providers.",
   "Two definitions describe a declarative syntax: one of them is JSON."
  ],
  "explanation": "ARM is the Azure management layer. ARM templates and Bicep are two ways of declaratively describing what you want to get, without writing the sequence of commands.",
  "commonMistakes": [
   "Confusing resource provider and resource.",
   "Assigning the JSON definition to Bicep."
  ],
  "items": [
   {
    "id": "m1",
    "text": "Resource"
   },
   {
    "id": "m2",
    "text": "Resource group"
   },
   {
    "id": "m3",
    "text": "Resource provider"
   },
   {
    "id": "m4",
    "text": "ARM template"
   },
   {
    "id": "m5",
    "text": "Bicep file"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Manageable item in Azure (virtual machine, storage account, virtual network, etc.)"
   },
   {
    "id": "p2",
    "text": "Container of related resources that share the same lifecycle"
   },
   {
    "id": "p3",
    "text": "Service that supplies a resource type, such as Microsoft.Compute"
   },
   {
    "id": "p4",
    "text": "Declarative JSON file that defines the resources to deploy"
   },
   {
    "id": "p5",
    "text": "Declarative language designed to deploy Azure resources"
   },
   {
    "id": "p6",
    "text": "Billing boundary of an organization"
   }
  ]
 },
 "az-004": {
  "title": "Why the portal and the CLI give the same results",
  "objective": "Understand that every tool goes through Azure Resource Manager.",
  "statement": "You create a virtual machine once through the Azure portal and once with Azure CLI. The result is identical. Why?",
  "hints": [
   "Think about the common management layer.",
   "Every request, whatever the tool, goes through a single entry point."
  ],
  "explanation": "Resource Manager receives the request from any tool or SDK, authenticates it, authorizes it, then forwards it to the relevant service. This common layer guarantees consistent results.",
  "commonMistakes": [
   "Imagining separate interfaces per tool.",
   "Believing the portal is a simple wrapper around Azure CLI."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "All requests are handled by the same Azure Resource Manager API, which authenticates and authorizes them before forwarding them to the service"
   },
   {
    "id": "c2",
    "text": "The portal always calls Azure CLI in the background"
   },
   {
    "id": "c3",
    "text": "Azure CLI automatically copies the portal actions"
   },
   {
    "id": "c4",
    "text": "Each Azure service implements its own interface for each tool"
   }
  ]
 },
 "az-005": {
  "title": "Same lifecycle, same resource group",
  "objective": "Decide which resources go in the same resource group based on their lifecycle.",
  "statement": "The **Billing** application is deployed, updated and deleted as a whole. The platform components are shared and follow a different pace. Place each resource in the right group.",
  "hints": [
   "What will be deleted the day the application disappears?",
   "A shared resource must not disappear with a single application."
  ],
  "explanation": "All the resources in a group should share the same lifecycle: they are deployed, updated and deleted together. Deleting the group deletes all its content, hence the value of isolating what is shared.",
  "commonMistakes": [
   "Grouping everything in a single \"prod\" group.",
   "Placing the shared network with the application: deleting it would break the others."
  ],
  "items": [
   {
    "id": "e1",
    "text": "Virtual machine of the Billing application"
   },
   {
    "id": "e2",
    "text": "Billing database"
   },
   {
    "id": "e3",
    "text": "Billing web application"
   },
   {
    "id": "e4",
    "text": "Hub virtual network shared by all applications"
   },
   {
    "id": "e5",
    "text": "Central Log Analytics workspace"
   },
   {
    "id": "e6",
    "text": "Key vault common to several teams"
   }
  ],
  "zones": [
   {
    "id": "rg-fact",
    "label": "rg-facturation",
    "description": "Lifecycle specific to the application"
   },
   {
    "id": "rg-plat",
    "label": "rg-plateforme",
    "description": "Shared and independent lifecycle"
   }
  ]
 },
 "az-006": {
  "title": "Lab cleanup: the dangerous line",
  "objective": "Spot a delete command that targets the wrong resource group.",
  "statement": "This script creates a lab environment then cleans it up. **Spot the dangerous line** and choose the right fix.",
  "hints": [
   "Which resource group did the script create?",
   "Deleting a resource group deletes **all** its resources."
  ],
  "explanation": "The deletion targets `rg-prod` whereas the script only created `rg-lab-kql`. Since deleting a group deletes its entire content, this is one of the costliest mistakes. Always check the group name before `--yes`.",
  "commonMistakes": [
   "Thinking `--no-wait` protects against the mistake.",
   "Believing `--yes` only confirms the deletion of the workspace."
  ],
  "lines": [
   {
    "id": "l1",
    "text": "az group create --name rg-lab-kql --location canadacentral"
   },
   {
    "id": "l2",
    "text": "az monitor log-analytics workspace create --resource-group rg-lab-kql --workspace-name law-lab-kql --location canadacentral"
   },
   {
    "id": "l3",
    "text": "az group delete --name rg-prod --yes --no-wait",
    "faulty": {
     "remedies": [
      {
       "id": "r3-1",
       "text": "Replace rg-prod with rg-lab-kql"
      },
      {
       "id": "r3-2",
       "text": "Add the --force option"
      },
      {
       "id": "r3-3",
       "text": "Remove --yes to confirm each resource"
      }
     ]
    }
   }
  ]
 },
 "az-007": {
  "title": "First command-line deployment",
  "objective": "Order the basic steps of a deployment with Azure CLI.",
  "statement": "Put the steps of a first command-line deployment back in order.",
  "hints": [
   "You must authenticate before any command.",
   "The resource group must exist before the deployment."
  ],
  "explanation": "Authentication, choice of the active subscription, creation of the container (resource group), deployment, then verification. Choosing the subscription avoids deploying to the wrong one.",
  "commonMistakes": [
   "Forgetting to select the subscription when you have several.",
   "Deploying before creating the group."
  ],
  "items": [
   {
    "id": "o1",
    "text": "Sign in with `az login`"
   },
   {
    "id": "o2",
    "text": "Choose the subscription with `az account set --subscription`"
   },
   {
    "id": "o3",
    "text": "Create the resource group with `az group create`"
   },
   {
    "id": "o4",
    "text": "Deploy the template in this group"
   },
   {
    "id": "o5",
    "text": "Verify the created resources"
   }
  ]
 },
 "az-008": {
  "title": "Zonal, zone-redundant or non-zonal",
  "objective": "Match a deployment mode to its behavior during a zone outage.",
  "statement": "Match each deployment mode to what it implies when an availability zone fails.",
  "hints": [
   "Who is responsible for the failover in each case?",
   "A resource not configured for zones has no distribution guarantee."
  ],
  "explanation": "An availability zone is a group of separate datacenters with independent power, cooling and network. Zonal: you manage everything. Zone-redundant: Microsoft manages it. Non-zonal: arbitrary placement, therefore exposed.",
  "commonMistakes": [
   "Believing an unconfigured resource is automatically spread out.",
   "Confusing availability zone and region."
  ],
  "items": [
   {
    "id": "m1",
    "text": "Zonal resource"
   },
   {
    "id": "m2",
    "text": "Zone-redundant resource"
   },
   {
    "id": "m3",
    "text": "Non-zonal deployment"
   },
   {
    "id": "m4",
    "text": "Multi-region deployment"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Pinned to a chosen zone: you manage replication and failover"
   },
   {
    "id": "p2",
    "text": "Spread across several zones: Microsoft manages distribution and failover"
   },
   {
    "id": "p3",
    "text": "Can be placed in any zone: a zone outage can make it unavailable"
   },
   {
    "id": "p4",
    "text": "Resources in several regions to withstand a regional outage"
   },
   {
    "id": "p5",
    "text": "Always automatically protected against any datacenter outage"
   }
  ]
 },
 "az-009": {
  "title": "A zone outage without configuration",
  "objective": "Reason about the impact of a zone outage on a non-zonal deployment.",
  "statement": "A web application was deployed in a region that supports zones, **without** zone configuration. One zone of the region goes down. Which statement is the most accurate?",
  "hints": [
   "What happens to a resource that was not configured for zones?",
   "Placement is not guaranteed."
  ],
  "explanation": "Without configuration, Azure treats the resource as non-zonal and may place it in any zone of the region: an outage of that zone can make it unavailable. For resilience, you choose a zone-redundant approach.",
  "commonMistakes": [
   "Assuming high availability is implicit.",
   "Confusing zone failover and region failover."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "The application can become unavailable, because Azure may have placed it in the affected zone"
   },
   {
    "id": "c2",
    "text": "The application is always available, because Azure automatically spreads any resource across all zones"
   },
   {
    "id": "c3",
    "text": "The application always fails over to another region"
   },
   {
    "id": "c4",
    "text": "The application cannot be affected by a zone outage"
   }
  ]
 },
 "az-010": {
  "title": "At which level should each setting be applied?",
  "objective": "Choose the scope suited to a governance need.",
  "statement": "Place each need at the **narrowest** scope level that satisfies it.",
  "hints": [
   "The narrower the scope, the fewer rights or constraints you grant.",
   "Access to a single storage account does not justify a broader scope."
  ],
  "explanation": "You apply the setting at the narrowest scope that meets the need: this is the logic of least privilege. The lower levels inherit what is defined above.",
  "commonMistakes": [
   "Assigning at the subscription level \"to make it work\".",
   "Applying to a resource what should cover a whole group."
  ],
  "items": [
   {
    "id": "e1",
    "text": "An allowed regions policy for all the subscriptions of the organization"
   },
   {
    "id": "e2",
    "text": "A Reader role for the audit team across the whole Production environment"
   },
   {
    "id": "e3",
    "text": "A CanNotDelete lock on all the components of the Billing application"
   },
   {
    "id": "e4",
    "text": "Read access to a single storage account"
   }
  ],
  "zones": [
   {
    "id": "mg",
    "label": "Management group"
   },
   {
    "id": "sub",
    "label": "Subscription"
   },
   {
    "id": "rg",
    "label": "Resource group"
   },
   {
    "id": "res",
    "label": "Resource"
   }
  ]
 },
 "az-011": {
  "title": "The journey of an Azure request",
  "objective": "Order how Azure Resource Manager processes a request.",
  "statement": "Put in order what happens when you send a resource creation request.",
  "hints": [
   "No service receives the request before it is checked.",
   "The resource provider acts last."
  ],
  "explanation": "ARM authenticates and authorizes first, then forwards to the relevant service. This is also the step where governance controls such as RBAC, locks and policies apply.",
  "commonMistakes": [
   "Placing the authorization after the creation.",
   "Believing the portal contacts the provider directly."
  ],
  "items": [
   {
    "id": "o1",
    "text": "You send the request from the portal, the CLI or an API"
   },
   {
    "id": "o2",
    "text": "Resource Manager authenticates and authorizes the request"
   },
   {
    "id": "o3",
    "text": "Resource Manager forwards the request to the appropriate resource provider"
   },
   {
    "id": "o4",
    "text": "The provider creates or modifies the resource"
   }
  ]
 },
 "az-012": {
  "title": "Design notes: find the errors",
  "objective": "Correct misconceptions about resource groups.",
  "statement": "A colleague wrote these design notes. **Some statements are wrong.** Spot them and choose the exact correction.",
  "hints": [
   "Three statements are wrong, two are right.",
   "A group's tags are not applied to the resources it contains."
  ],
  "explanation": "A resource exists in only one group, but you can add it to the group, remove it from it or move it. The group's tags are not inherited. A group's region can differ from that of its resources, even though the same location is recommended.",
  "commonMistakes": [
   "Relying on tag inheritance for billing.",
   "Believing the group's region constrains that of the resources."
  ],
  "lines": [
   {
    "id": "l1",
    "text": "A resource can belong to several resource groups at the same time.",
    "faulty": {
     "remedies": [
      {
       "id": "r1-1",
       "text": "Each resource exists in a single resource group"
      },
      {
       "id": "r1-2",
       "text": "A resource belongs to one group per subscription"
      },
      {
       "id": "r1-3",
       "text": "It depends on the resource type"
      }
     ]
    }
   },
   {
    "id": "l2",
    "text": "Deleting a resource group deletes all the resources it contains."
   },
   {
    "id": "l3",
    "text": "The resources of a group automatically inherit the tags of that group.",
    "faulty": {
     "remedies": [
      {
       "id": "r3-1",
       "text": "Resources do not inherit the group's tags"
      },
      {
       "id": "r3-2",
       "text": "Only virtual machines inherit tags"
      },
      {
       "id": "r3-3",
       "text": "Tags are inherited after 24 hours"
      }
     ]
    }
   },
   {
    "id": "l4",
    "text": "You can move a resource from one resource group to another."
   },
   {
    "id": "l5",
    "text": "A resource must be in the same region as its resource group.",
    "faulty": {
     "remedies": [
      {
       "id": "r5-1",
       "text": "Regions can differ, but the same location is recommended"
      },
      {
       "id": "r5-2",
       "text": "The group's region is ignored"
      },
      {
       "id": "r5-3",
       "text": "You need two groups per region"
      }
     ]
    }
   }
  ]
 },
 "az-013": {
  "title": "Each tool and what it offers",
  "objective": "Match an Azure tool to its nature.",
  "statement": "Match each tool to its description.",
  "hints": [
   "`New-AzResourceGroup` is a PowerShell cmdlet.",
   "The management endpoint is management.azure.com."
  ],
  "explanation": "All the portal functions are also available through PowerShell, CLI, REST API and SDKs, because they go through Resource Manager.",
  "commonMistakes": [
   "Confusing CLI and PowerShell.",
   "Thinking Bicep is a command-line tool rather than a language."
  ],
  "items": [
   {
    "id": "m1",
    "text": "Azure portal"
   },
   {
    "id": "m2",
    "text": "Azure CLI"
   },
   {
    "id": "m3",
    "text": "Azure PowerShell"
   },
   {
    "id": "m4",
    "text": "REST API"
   },
   {
    "id": "m5",
    "text": "Bicep"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Web graphical interface"
   },
   {
    "id": "p2",
    "text": "Command-line commands, of the form `az ...`"
   },
   {
    "id": "p3",
    "text": "PowerShell cmdlets, of the form `New-AzResourceGroup`"
   },
   {
    "id": "p4",
    "text": "HTTP requests to the management.azure.com endpoint"
   },
   {
    "id": "p5",
    "text": "Declarative language for infrastructure as code"
   }
  ]
 },
 "az-014": {
  "title": "Declarative syntaxes",
  "objective": "Distinguish declarative syntax from imperative scripts.",
  "statement": "Which of these use a **declarative syntax** (\"here is what I want to get\")? Several answers are possible.",
  "hints": [
   "In a declarative approach, you describe the final state.",
   "A chain of commands describes the sequence, not the desired state."
  ],
  "explanation": "ARM templates and Bicep files are declarative: you describe the properties of the infrastructure and Resource Manager determines how to get there, handling the order through dependencies.",
  "commonMistakes": [
   "Considering a command script to be declarative.",
   "Forgetting that Bicep is declarative."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "An ARM template in JSON"
   },
   {
    "id": "c2",
    "text": "A Bicep file"
   },
   {
    "id": "c3",
    "text": "A PowerShell script that chains `New-Az...` commands in a loop"
   },
   {
    "id": "c4",
    "text": "A series of `az` commands run by hand"
   }
  ]
 },
 "az-015": {
  "title": "What does this command do?",
  "objective": "Read common Azure CLI commands.",
  "statement": "Match each command to its effect.",
  "hints": [
   "The verbs `create`, `delete`, `set` are explicit.",
   "Deleting a group deletes its content."
  ],
  "explanation": "Knowing how to read a command before running it is a security skill: you check the active subscription and the targeted group, especially for a deletion.",
  "commonMistakes": [
   "Forgetting that `az account set` changes nothing in Azure, only the local context.",
   "Ignoring that the deletion is permanent."
  ],
  "items": [
   {
    "id": "m1",
    "text": "az login"
   },
   {
    "id": "m2",
    "text": "az account set --subscription \"Sub-Production\""
   },
   {
    "id": "m3",
    "text": "az group create --name rg-test --location canadacentral"
   },
   {
    "id": "m4",
    "text": "az group delete --name rg-test --yes"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Authenticates the user to Azure"
   },
   {
    "id": "p2",
    "text": "Sets the active subscription for the following commands"
   },
   {
    "id": "p3",
    "text": "Creates a resource group"
   },
   {
    "id": "p4",
    "text": "Deletes a resource group and all its resources"
   },
   {
    "id": "p5",
    "text": "Displays the month's bill"
   }
  ]
 },
 "az-016": {
  "title": "Who is responsible: you or Microsoft?",
  "objective": "Distinguish the responsibilities between zonal and zone-redundant resources.",
  "statement": "Place each task on the side of whoever is responsible for it.",
  "hints": [
   "A zonal resource is pinned to a single zone.",
   "A zone-redundant resource is spread by the service."
  ],
  "explanation": "With zonal resources, you combine several deployments in different zones and manage replication and failover. With zone-redundant resources, Microsoft manages distribution, replication and failover.",
  "commonMistakes": [
   "Confusing the isolation of a zone with resilience.",
   "Believing \"zonal\" means \"replicated\"."
  ],
  "items": [
   {
    "id": "e1",
    "text": "Fail traffic over to another zone during a zone outage"
   },
   {
    "id": "e2",
    "text": "Replicate data between zones"
   },
   {
    "id": "e3",
    "text": "Spread requests between zones"
   },
   {
    "id": "e4",
    "text": "Replicate data between zones automatically"
   },
   {
    "id": "e5",
    "text": "Fail over automatically when a zone goes down"
   },
   {
    "id": "e6",
    "text": "Distribute requests between zones"
   }
  ],
  "zones": [
   {
    "id": "vous",
    "label": "You (zonal resource)",
    "description": "You manage the resilience"
   },
   {
    "id": "ms",
    "label": "Microsoft (zone-redundant resource)",
    "description": "The service manages the resilience"
   }
  ]
 },
 "az-017": {
  "title": "What we know about management groups",
  "objective": "Remember the structural rules of management groups.",
  "statement": "Which of these statements about management groups is **correct**?",
  "hints": [
   "Think of the tree: each node has a single parent.",
   "The depth is limited."
  ],
  "explanation": "Management groups form a tree hierarchy: each group has a single parent and the depth is limited to 6 levels. They contain subscriptions (and other groups), not resources.",
  "commonMistakes": [
   "Imagining a graph with several parents.",
   "Believing there is no depth limit."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "A management group can only have one parent, and the hierarchy has at most 6 levels of depth"
   },
   {
    "id": "c2",
    "text": "A management group can have several parents to share policies"
   },
   {
    "id": "c3",
    "text": "Management groups directly contain resources"
   },
   {
    "id": "c4",
    "text": "The management group hierarchy has unlimited depth"
   }
  ]
 },
 "az-018": {
  "title": "Assessment: design the Nordlys hierarchy",
  "objective": "Combine scope, lifecycle and governance in a single design.",
  "statement": "Nordlys Technologies must apply its governance rules. Place each need at the **narrowest** level that fits.",
  "hints": [
   "For each need, ask yourself which smallest container covers it.",
   "Billing is separated at the subscription level."
  ],
  "explanation": "The narrowest scope that meets the need limits the impact of mistakes. Cross-cutting governance: management group. Billing isolation: subscription. Shared lifecycle: resource group. One-off case: resource.",
  "commonMistakes": [
   "Systematically choosing the broadest level.",
   "Forgetting that locks and roles are inherited downward."
  ],
  "items": [
   {
    "id": "e1",
    "text": "Forbid deployment outside the approved regions for the whole organization"
   },
   {
    "id": "e2",
    "text": "Separate the billing and limits of the lab from those of production"
   },
   {
    "id": "e3",
    "text": "Delete in a single operation everything that belongs to the Billing application"
   },
   {
    "id": "e4",
    "text": "Prevent the modification of one specific shared virtual network"
   },
   {
    "id": "e5",
    "text": "Apply a CanNotDelete lock to the whole rg-securite group"
   },
   {
    "id": "e6",
    "text": "Give the Reader role to the audit team on all the production subscriptions"
   },
   {
    "id": "e7",
    "text": "Assign an operator role on a single key vault"
   },
   {
    "id": "e8",
    "text": "Isolate the costs of the test environments in a separate billing container"
   }
  ],
  "zones": [
   {
    "id": "mg",
    "label": "Management group"
   },
   {
    "id": "sub",
    "label": "Subscription"
   },
   {
    "id": "rg",
    "label": "Resource group"
   },
   {
    "id": "res",
    "label": "Resource"
   }
  ]
 },
 "az-019": {
  "title": "The default rules of a network security group",
  "objective": "Know which traffic an NSG allows or denies with no custom rule.",
  "statement": "A brand-new NSG contains six default rules. Place each one in the right column according to what it does.",
  "hints": [
   "Inbound traffic from the Internet is denied by default.",
   "Outbound traffic to the Internet is allowed by default."
  ],
  "explanation": "An unmodified NSG is not a complete \"deny by default\": it allows traffic inside the virtual network and outbound traffic to the Internet, and denies the rest. The default rules have the lowest priorities (highest numbers) so that custom rules are processed first.",
  "commonMistakes": [
   "Believing all outbound traffic is blocked by default.",
   "Forgetting that traffic internal to the virtual network is allowed."
  ],
  "items": [
   {
    "id": "e1",
    "text": "AllowVNetInBound (priority 65000)"
   },
   {
    "id": "e2",
    "text": "AllowAzureLoadBalancerInBound (priority 65001)"
   },
   {
    "id": "e3",
    "text": "DenyAllInbound (priority 65500)"
   },
   {
    "id": "e4",
    "text": "AllowVnetOutBound (priority 65000)"
   },
   {
    "id": "e5",
    "text": "AllowInternetOutBound (priority 65001)"
   },
   {
    "id": "e6",
    "text": "DenyAllOutBound (priority 65500)"
   }
  ],
  "zones": [
   {
    "id": "allow",
    "label": "Allows",
    "description": "Allow action"
   },
   {
    "id": "deny",
    "label": "Denies",
    "description": "Deny action"
   }
  ]
 },
 "az-020": {
  "title": "Who wins: priority 200 or 300?",
  "objective": "Apply the NSG \"first match wins\" rule.",
  "statement": "An NSG contains two rules for the same inbound traffic on port 3389: a **Deny** rule with priority **200** and an **Allow** rule with priority **300**. What happens?",
  "hints": [
   "The lowest numbers are processed first.",
   "Once a rule matches, processing stops."
  ],
  "explanation": "Rules are processed in ascending priority order: a small number has a higher priority. As soon as a rule matches, the following ones are no longer evaluated.",
  "commonMistakes": [
   "Reading \"priority 300\" as more important than \"priority 200\".",
   "Believing all matching rules apply."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "The traffic is denied: the priority 200 rule is evaluated first and processing stops"
   },
   {
    "id": "c2",
    "text": "The traffic is allowed: the rule with the highest number wins"
   },
   {
    "id": "c3",
    "text": "The traffic is allowed then denied: both rules apply"
   },
   {
    "id": "c4",
    "text": "Azure refuses to create the second rule"
   }
  ]
 },
 "az-021": {
  "title": "NSG rule: RDP access open to the whole Internet",
  "objective": "Spot and fix an NSG rule that exposes an administration port.",
  "statement": "This NSG rule was created to allow the administration of a server. **Spot the dangerous lines** and choose the right fix. The Azure Bastion subnet is 10.0.1.0/26.",
  "hints": [
   "Who should be able to reach port 3389?",
   "Azure Bastion connects from its own subnet."
  ],
  "explanation": "Allowing port 3389 from \"*\" exposes the RDP service to the Internet, which is a target for brute force attacks. You must limit the source to the Bastion subnet (or a VPN) and never open 22 or 3389 from 0.0.0.0/0.",
  "commonMistakes": [
   "Replacing `*` with `Internet`: it is equivalent in terms of risk.",
   "Only changing the priority: the rule would remain too permissive."
  ],
  "lines": [
   {
    "id": "l1",
    "text": "\"name\": \"Autoriser-RDP\","
   },
   {
    "id": "l2",
    "text": "\"priority\": 100,"
   },
   {
    "id": "l3",
    "text": "\"direction\": \"Inbound\","
   },
   {
    "id": "l4",
    "text": "\"protocol\": \"Tcp\","
   },
   {
    "id": "l5",
    "text": "\"sourceAddressPrefix\": \"*\",",
    "faulty": {
     "remedies": [
      {
       "id": "r5-1",
       "text": "\"sourceAddressPrefix\": \"10.0.1.0/26\","
      },
      {
       "id": "r5-2",
       "text": "\"sourceAddressPrefix\": \"Internet\","
      },
      {
       "id": "r5-3",
       "text": "\"sourceAddressPrefix\": \"0.0.0.0/0\","
      }
     ]
    }
   },
   {
    "id": "l6",
    "text": "\"destinationPortRange\": \"3389\","
   },
   {
    "id": "l7",
    "text": "\"access\": \"Allow\""
   }
  ]
 },
 "az-022": {
  "title": "Sharing a VPN gateway in a hub-and-spoke",
  "objective": "Order the gateway transit configuration.",
  "statement": "Put the steps in order so that the spoke networks use the hub's VPN gateway.",
  "hints": [
   "The gateway must exist before it is shared.",
   "Verification comes last."
  ],
  "explanation": "The hub side allows transit through its gateway, the spoke side agrees to use the remote gateway. A spoke can only use one remote gateway, and transit is not available with Basic-tier VPN gateways.",
  "commonMistakes": [
   "Enabling \"Use remote gateways\" before the gateway exists.",
   "Using a Basic gateway."
  ],
  "items": [
   {
    "id": "o1",
    "text": "Deploy the VPN gateway in the hub's GatewaySubnet"
   },
   {
    "id": "o2",
    "text": "On the hub-to-spoke peering: enable \"Allow gateway transit\""
   },
   {
    "id": "o3",
    "text": "On the spoke-to-hub peering: enable \"Use remote gateways\""
   },
   {
    "id": "o4",
    "text": "Verify the effective routes on the network interface of a spoke VM"
   }
  ]
 },
 "az-023": {
  "title": "The settings of a hub-and-spoke peering",
  "objective": "Match a peering setting to its role.",
  "statement": "Match each item to its role in a hub-and-spoke topology.",
  "hints": [
   "Each setting lives on a specific side of the peering.",
   "One of the gateway tiers is excluded from transit."
  ],
  "explanation": "Transit avoids deploying a gateway in each spoke. It is configured on both sides of the peering and requires the gateway to exist first.",
  "commonMistakes": [
   "Reversing the two settings.",
   "Thinking peering alone enables transit."
  ],
  "items": [
   {
    "id": "m1",
    "text": "Allow gateway transit (hub side)"
   },
   {
    "id": "m2",
    "text": "Use remote gateways (spoke side)"
   },
   {
    "id": "m3",
    "text": "GatewaySubnet"
   },
   {
    "id": "m4",
    "text": "Basic-tier VPN gateway"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Lets the peered networks use the hub's gateway"
   },
   {
    "id": "p2",
    "text": "Makes the spoke use the peered network's gateway"
   },
   {
    "id": "p3",
    "text": "Hub subnet that hosts the VPN or ExpressRoute gateway"
   },
   {
    "id": "p4",
    "text": "Does not support gateway transit"
   },
   {
    "id": "p5",
    "text": "Automatically encrypts all the peering traffic"
   }
  ]
 },
 "az-024": {
  "title": "Why go through Azure Bastion",
  "objective": "Recognize the benefits of Bastion for administration.",
  "statement": "What are the advantages of Azure Bastion for administering virtual machines? Several answers are possible.",
  "hints": [
   "Bastion is deployed in the virtual network and connects through a private address.",
   "No agent or special client software is required on the VM."
  ],
  "explanation": "Bastion offers RDP/SSH over TLS (443) without exposing administration ports to the Internet and without a public IP on the VM, or an agent. It is deployed per virtual network and also serves peered networks. It needs an AzureBastionSubnet of at least /26 for the Basic tier and above.",
  "commonMistakes": [
   "Believing an agent is necessary.",
   "Keeping the VM's public IP \"just in case\"."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "VMs do not need a public IP address"
   },
   {
    "id": "c2",
    "text": "The RDP or SSH connection goes through TLS on port 443"
   },
   {
    "id": "c3",
    "text": "An agent must be installed on each VM"
   },
   {
    "id": "c4",
    "text": "VMs are protected against port scanning"
   }
  ]
 },
 "az-025": {
  "title": "Service endpoint or private endpoint",
  "objective": "Distinguish service endpoint and private endpoint.",
  "statement": "Place each characteristic in the right column.",
  "hints": [
   "One of the two creates a private address in your network.",
   "The one that targets an instance limits the risk of data leakage."
  ],
  "explanation": "A private endpoint brings the service into your virtual network with a private address, targets a specific resource and is preferred for production and sensitive data. A service endpoint is simpler and free but keeps a public address.",
  "commonMistakes": [
   "Believing both create a private IP.",
   "Forgetting DNS for a private endpoint."
  ],
  "items": [
   {
    "id": "e1",
    "text": "Remains a publicly routable IP address"
   },
   {
    "id": "e2",
    "text": "Free"
   },
   {
    "id": "e3",
    "text": "The PaaS service sees the virtual network as the traffic source"
   },
   {
    "id": "e4",
    "text": "Creates a network interface with a private IP in your virtual network"
   },
   {
    "id": "e5",
    "text": "Targets a specific instance of the PaaS resource"
   },
   {
    "id": "e6",
    "text": "Requires additional DNS configuration"
   }
  ],
  "zones": [
   {
    "id": "se",
    "label": "Service endpoint",
    "description": "Service Endpoint"
   },
   {
    "id": "pe",
    "label": "Private endpoint",
    "description": "Private Endpoint / Private Link"
   }
  ]
 },
 "az-026": {
  "title": "Storage redundancy levels",
  "objective": "Match a redundancy option to how it works.",
  "statement": "Match each Azure Storage redundancy option to its description.",
  "hints": [
   "The \"G\" stands for geo-redundant: there is a secondary region.",
   "The \"Z\" stands for availability zones."
  ],
  "explanation": "Redundancy in the primary region is chosen between LRS (the least costly and least durable) and ZRS (recommended for high availability). The GRS/GZRS options add a secondary region; RA-* adds read access in that region.",
  "commonMistakes": [
   "Believing GRS allows reading in the secondary region.",
   "Thinking LRS withstands the loss of a datacenter."
  ],
  "items": [
   {
    "id": "m1",
    "text": "LRS"
   },
   {
    "id": "m2",
    "text": "ZRS"
   },
   {
    "id": "m3",
    "text": "GRS"
   },
   {
    "id": "m4",
    "text": "GZRS"
   },
   {
    "id": "m5",
    "text": "RA-GRS"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Three copies in a single datacenter of the primary region"
   },
   {
    "id": "p2",
    "text": "Synchronous copies in three or more availability zones of the primary region"
   },
   {
    "id": "p3",
    "text": "LRS in the primary region, then asynchronous copy to a secondary region"
   },
   {
    "id": "p4",
    "text": "ZRS in the primary region, then asynchronous copy to a secondary region"
   },
   {
    "id": "p5",
    "text": "GRS with read access possible in the secondary region"
   }
  ]
 },
 "az-027": {
  "title": "Do we survive a regional outage?",
  "objective": "Choose a redundancy according to the outage scenario.",
  "statement": "In the event of an **outage of the entire primary region**, does the data remain durable and recoverable (with an account failover if necessary)? Classify each option.",
  "hints": [
   "Only the options with a secondary region protect against a regional outage.",
   "ZRS stays within a single region."
  ],
  "explanation": "LRS and ZRS stay in the primary region: ZRS survives the loss of a datacenter or a zone, not that of the region. GRS and GZRS copy to a secondary region; an account failover may be required to restore writes.",
  "commonMistakes": [
   "Believing ZRS protects against a regional outage.",
   "Forgetting the account failover to regain write access."
  ],
  "items": [
   {
    "id": "e1",
    "text": "LRS"
   },
   {
    "id": "e2",
    "text": "ZRS"
   },
   {
    "id": "e3",
    "text": "GRS"
   },
   {
    "id": "e4",
    "text": "GZRS"
   }
  ],
  "zones": [
   {
    "id": "oui",
    "label": "Survives the regional outage"
   },
   {
    "id": "non",
    "label": "Does not survive the regional outage"
   }
  ]
 },
 "az-028": {
  "title": "Does redundancy protect against deletion?",
  "objective": "Distinguish hardware redundancy from protection against data changes.",
  "statement": "An administrator mistakenly deletes data from a storage account configured with GZRS. What can we say about the redundancy?",
  "hints": [
   "All the copies reflect the same current state.",
   "Redundancy is for failures, not for human errors."
  ],
  "explanation": "Redundancy protects against a hardware or infrastructure failure. Deletions and overwrites are replicated to all the copies: you need other mechanisms (backup, deletion protections, locks).",
  "commonMistakes": [
   "Confusing redundancy and backup.",
   "Believing the secondary region keeps the old version."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "It does not protect: deletions and overwrites are applied simultaneously to all the copies"
   },
   {
    "id": "c2",
    "text": "It automatically restores the data from the secondary region"
   },
   {
    "id": "c3",
    "text": "It keeps an intact copy in each zone"
   },
   {
    "id": "c4",
    "text": "It prevents the deletion until replication is complete"
   }
  ]
 },
 "az-029": {
  "title": "In which order Azure Policy evaluates its effects",
  "objective": "Remember the evaluation order of Azure Policy effects.",
  "statement": "Put the effects in the order in which Azure Policy evaluates them for a create or update request.",
  "hints": [
   "A disabled effect is checked first.",
   "deny is evaluated before audit to avoid double logging."
  ],
  "explanation": "`disabled` is checked first. `append` and `modify` come next because they can alter the request and prevent a deny or an audit. `deny` precedes `audit` to avoid logging an unwanted resource twice.",
  "commonMistakes": [
   "Believing audit precedes deny.",
   "Forgetting that modify can change the result of a deny."
  ],
  "items": [
   {
    "id": "o1",
    "text": "disabled"
   },
   {
    "id": "o2",
    "text": "append and modify"
   },
   {
    "id": "o3",
    "text": "deny"
   },
   {
    "id": "o4",
    "text": "audit"
   },
   {
    "id": "o5",
    "text": "auditIfNotExists"
   }
  ]
 },
 "az-030": {
  "title": "Azure Policy effects",
  "objective": "Match an effect to its behavior.",
  "statement": "Match each Azure Policy effect to what it does.",
  "hints": [
   "Only one effect blocks the resource.",
   "deployIfNotExists needs an identity to deploy."
  ],
  "explanation": "Each policy definition has a single effect. You often start with `audit` to measure the impact before moving to an effect that applies changes.",
  "commonMistakes": [
   "Confusing audit and deny.",
   "Forgetting the managed identity of deployIfNotExists and modify."
  ],
  "items": [
   {
    "id": "m1",
    "text": "audit"
   },
   {
    "id": "m2",
    "text": "deny"
   },
   {
    "id": "m3",
    "text": "modify"
   },
   {
    "id": "m4",
    "text": "deployIfNotExists"
   },
   {
    "id": "m5",
    "text": "disabled"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Flags the noncompliant resource without blocking it"
   },
   {
    "id": "p2",
    "text": "Blocks the creation or update of a noncompliant resource"
   },
   {
    "id": "p3",
    "text": "Adds, updates or removes properties (such as tags) during the request"
   },
   {
    "id": "p4",
    "text": "Deploys a template if the related resource does not exist, with a managed identity"
   },
   {
    "id": "p5",
    "text": "Turns off the evaluation of the rule"
   }
  ]
 },
 "az-031": {
  "title": "First deployment of a new policy",
  "objective": "Choose a cautious effect to introduce a policy.",
  "statement": "You are introducing a new policy in an existing production environment. What is the recommended approach?",
  "hints": [
   "An effect that blocks can break existing automations.",
   "You want to measure first."
  ],
  "explanation": "Starting with an observation effect shows which resources would be affected without breaking anything. Enforcement (deny, modify, deployIfNotExists) can disrupt scripts or autoscaling already in place.",
  "commonMistakes": [
   "Applying deny without testing.",
   "Thinking audit is useless."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "Start with audit or auditIfNotExists to observe the impact before applying deny, modify or deployIfNotExists"
   },
   {
    "id": "c2",
    "text": "Apply deny right away to force compliance"
   },
   {
    "id": "c3",
    "text": "Apply deployIfNotExists without a managed identity"
   },
   {
    "id": "c4",
    "text": "Never use audit: it has no effect"
   }
  ]
 },
 "az-032": {
  "title": "Policy deployment plan: the errors",
  "objective": "Correct erroneous statements about Azure Policy deployment.",
  "statement": "A deployment plan contains statements. **Some are false.** Spot them and choose the exact correction.",
  "hints": [
   "Two statements are false.",
   "Existing resources are not fixed by the assignment alone."
  ],
  "explanation": "Automatic remediation only concerns resources that are created or updated; for existing ones, you launch a remediation task. The `DoNotEnforce` mode lets you evaluate without applying the effect, useful for testing a new assignment.",
  "commonMistakes": [
   "Believing the assignment fixes the existing resources by itself.",
   "Confusing DoNotEnforce and deletion."
  ],
  "lines": [
   {
    "id": "l1",
    "text": "For a deployIfNotExists policy, existing resources are fixed automatically as soon as it is assigned.",
    "faulty": {
     "remedies": [
      {
       "id": "r1-1",
       "text": "Existing resources are fixed with a remediation task"
      },
      {
       "id": "r1-2",
       "text": "They can never be fixed"
      },
      {
       "id": "r1-3",
       "text": "They must be recreated"
      }
     ]
    }
   },
   {
    "id": "l2",
    "text": "An assignment with a deployIfNotExists or modify effect requires a managed identity with the necessary roles."
   },
   {
    "id": "l3",
    "text": "The DoNotEnforce mode applies the policy effect but does not log it.",
    "faulty": {
     "remedies": [
      {
       "id": "r3-1",
       "text": "DoNotEnforce does not apply the effect on creation or update"
      },
      {
       "id": "r3-2",
       "text": "DoNotEnforce deletes the policy"
      },
      {
       "id": "r3-3",
       "text": "DoNotEnforce only disables the audit"
      }
     ]
    }
   },
   {
    "id": "l4",
    "text": "The excluded scopes (notScopes) of an assignment are neither evaluated nor counted in compliance."
   }
  ]
 },
 "az-033": {
  "title": "Exclusion, exemption, remediation and enforcement",
  "objective": "Distinguish the Azure Policy scope mechanisms.",
  "statement": "Match each concept to its definition.",
  "hints": [
   "An exemption remains visible in the reports.",
   "An exclusion removes the resource from the calculation."
  ],
  "explanation": "An exclusion takes a resource out of the scope, an exemption waives it while keeping it visible. Remediation handles existing resources for the `modify` and `deployIfNotExists` effects.",
  "commonMistakes": [
   "Confusing exclusion and exemption.",
   "Believing a remediation task runs at every evaluation."
  ],
  "items": [
   {
    "id": "m1",
    "text": "Exclusion (notScopes)"
   },
   {
    "id": "m2",
    "text": "Exemption"
   },
   {
    "id": "m3",
    "text": "Remediation task"
   },
   {
    "id": "m4",
    "text": "enforcementMode = DoNotEnforce"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Some resources of the scope are neither evaluated nor counted"
   },
   {
    "id": "p2",
    "text": "Evaluated but waived, visible as \"Exempted\", with possible expiration"
   },
   {
    "id": "p3",
    "text": "Applies the template or operations to existing noncompliant resources"
   },
   {
    "id": "p4",
    "text": "Evaluates the assignment without applying the effect on creation or update"
   }
  ]
 },
 "az-034": {
  "title": "Resource locks",
  "objective": "Match a lock to its effect.",
  "statement": "Match each item to what it means for resource locks.",
  "hints": [
   "ReadOnly is more restrictive than CanNotDelete.",
   "A lock applies to management (ARM), not to the content of a storage account."
  ],
  "explanation": "Locks apply to the management plane, are inherited by child resources and, in case of conflict, the most restrictive wins. They protect against mistakes, including those of administrators.",
  "commonMistakes": [
   "Believing a lock protects the data itself.",
   "Using ReadOnly when modifications are expected."
  ],
  "items": [
   {
    "id": "m1",
    "text": "CanNotDelete"
   },
   {
    "id": "m2",
    "text": "ReadOnly"
   },
   {
    "id": "m3",
    "text": "Lock placed on a resource group"
   },
   {
    "id": "m4",
    "text": "Locking and the data plane"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Authorized users can read and modify, but not delete"
   },
   {
    "id": "p2",
    "text": "Authorized users can read, but neither modify nor delete"
   },
   {
    "id": "p3",
    "text": "Inherited by all the resources of the group, including those added later"
   },
   {
    "id": "p4",
    "text": "Locks target management operations, not data operations"
   }
  ]
 },
 "az-035": {
  "title": "Production lock: two errors",
  "objective": "Fix a script that places the wrong lock type on the wrong group.",
  "statement": "Goal: **prevent the deletion of the `rg-prod` group without blocking the modifications** of the applications. **Spot the faulty lines** and choose the fixes.",
  "hints": [
   "Is the targeted group the one in the goal?",
   "ReadOnly also blocks modifications: is that intended?"
  ],
  "explanation": "The first lock protects `rg-test` instead of `rg-prod`. The second uses `ReadOnly`, which also forbids modifications, whereas the goal is only to prevent deletion: you need `CanNotDelete`.",
  "commonMistakes": [
   "Using ReadOnly \"to be safe\".",
   "Forgetting to check the targeted group before running."
  ],
  "lines": [
   {
    "id": "l1",
    "text": "az account set --subscription \"Sub-Production\""
   },
   {
    "id": "l2",
    "text": "az lock create --name verrou-prod --resource-group rg-test --lock-type CanNotDelete",
    "faulty": {
     "remedies": [
      {
       "id": "r2-1",
       "text": "Replace rg-test with rg-prod"
      },
      {
       "id": "r2-2",
       "text": "Add --lock-type ReadOnly"
      },
      {
       "id": "r2-3",
       "text": "Remove --resource-group"
      }
     ]
    }
   },
   {
    "id": "l3",
    "text": "az lock create --name verrou-secu --resource-group rg-securite --lock-type ReadOnly",
    "faulty": {
     "remedies": [
      {
       "id": "r3-1",
       "text": "Replace ReadOnly with CanNotDelete"
      },
      {
       "id": "r3-2",
       "text": "Replace ReadOnly with Delete"
      },
      {
       "id": "r3-3",
       "text": "Remove --lock-type"
      }
     ]
    }
   }
  ]
 },
 "az-036": {
  "title": "Mission: which governance tool for which need?",
  "objective": "Choose between lock, policy and RBAC to meet a governance need.",
  "statement": "Nordlys is setting up its governance. For each need, choose the most appropriate tool.",
  "hints": [
   "Who has the right: RBAC. What must be complied with: policy. What must be protected against error: lock.",
   "A rule that applies even to administrators is a lock."
  ],
  "explanation": "RBAC answers \"who can act\". Azure Policy answers \"what must be complied with\" (and can audit or remediate). A lock answers \"what must be protected against an accidental action\", even for owners.",
  "commonMistakes": [
   "Using a role to enforce a configuration.",
   "Relying on a policy to prevent a deletion."
  ],
  "items": [
   {
    "id": "e1",
    "text": "Prevent the accidental deletion of the rg-securite group"
   },
   {
    "id": "e2",
    "text": "Deny any resource created outside the approved regions"
   },
   {
    "id": "e3",
    "text": "Let the audit team read without modifying"
   },
   {
    "id": "e4",
    "text": "Automatically add the Env tag inherited from the resource group"
   },
   {
    "id": "e5",
    "text": "Prevent any modification of a shared virtual network"
   },
   {
    "id": "e6",
    "text": "Let an operator manage the VMs of a single group"
   },
   {
    "id": "e7",
    "text": "Flag the storage accounts that have no logging"
   },
   {
    "id": "e8",
    "text": "Give a platform administrator the right to create resource groups"
   }
  ],
  "zones": [
   {
    "id": "lock",
    "label": "Resource lock",
    "description": "Prevents deletion or modification"
   },
   {
    "id": "policy",
    "label": "Azure Policy",
    "description": "Enforces or audits a configuration"
   },
   {
    "id": "rbac",
    "label": "RBAC",
    "description": "Controls who can do what"
   }
  ]
 }
};
