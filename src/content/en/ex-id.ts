import type { Overlay } from './types.ts';

// Traduction anglaise (overlay). Les blocs de code et les identifiants restent identiques au français.
export const enExId: Record<string, Overlay> = {
 "id-001": {
  "title": "The three elements of a role assignment",
  "objective": "Break down an Azure RBAC role assignment.",
  "statement": "A role assignment combines three elements. Match each element to its role.",
  "hints": [
   "Who, what, where.",
   "The scope is hierarchical."
  ],
  "explanation": "A role assignment associates a principal, a role definition and a scope. Assignments are inherited down the hierarchy: a role assigned to a subscription applies to all its resource groups.",
  "commonMistakes": [
   "Confusing the role definition and the assignment.",
   "Forgetting that the scope is inherited."
  ],
  "items": [
   {
    "id": "m1",
    "text": "Security principal"
   },
   {
    "id": "m2",
    "text": "Role definition"
   },
   {
    "id": "m3",
    "text": "Scope"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Who receives the access: user, group, service principal or managed identity"
   },
   {
    "id": "p2",
    "text": "What is allowed: the set of permitted actions"
   },
   {
    "id": "p3",
    "text": "Where the access applies: management group, subscription, resource group or resource"
   }
  ]
 },
 "id-002": {
  "title": "Owner, Contributor, Reader",
  "objective": "Know the reach of the three fundamental roles.",
  "statement": "Match each built-in role to what it allows.",
  "hints": [
   "A single basic role cannot give access to others.",
   "One role only manages access."
  ],
  "explanation": "Contributor is often assigned by default, but it cannot grant access to others. Only Owner and User Access Administrator can. This separation limits the risk of privilege escalation.",
  "commonMistakes": [
   "Believing Contributor can assign roles.",
   "Giving Owner for convenience."
  ],
  "items": [
   {
    "id": "m1",
    "text": "Owner"
   },
   {
    "id": "m2",
    "text": "Contributor"
   },
   {
    "id": "m3",
    "text": "Reader"
   },
   {
    "id": "m4",
    "text": "User Access Administrator"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Manages everything, including assigning roles to others"
   },
   {
    "id": "p2",
    "text": "Creates and manages resources, but cannot assign roles"
   },
   {
    "id": "p3",
    "text": "Views the resources without modifying anything"
   },
   {
    "id": "p4",
    "text": "Manages user access to resources, without managing the resources themselves"
   }
  ]
 },
 "id-003": {
  "title": "Which role for the audit team?",
  "objective": "Apply least privilege to a read need.",
  "statement": "The audit team must view all the resources of the `Sub-Production` subscription without modifying anything. Which assignment is the most appropriate?",
  "hints": [
   "The need is read-only.",
   "An assignment at the subscription scope covers all the resources."
  ],
  "explanation": "Reader at the subscription scope gives exactly the access needed. Assigning resource by resource is unmanageable and fragile; Contributor and Owner give far more than necessary.",
  "commonMistakes": [
   "Giving Contributor \"just in case\".",
   "Assigning at a broader scope than necessary."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "Reader, at the subscription scope"
   },
   {
    "id": "c2",
    "text": "Contributor, at the subscription scope"
   },
   {
    "id": "c3",
    "text": "Owner, at the root management group scope"
   },
   {
    "id": "c4",
    "text": "Reader, at the scope of each resource, one by one"
   }
  ]
 },
 "id-004": {
  "title": "Assigning a role: the steps",
  "objective": "Order the steps to assign a role.",
  "statement": "Put the steps to assign an Azure role in order.",
  "hints": [
   "You decide before acting.",
   "The assignment is the last step."
  ],
  "explanation": "The recommended approach follows: the principal, the role, the scope, then the assignment. You must also have the right to assign roles yourself (Owner or User Access Administrator, for example).",
  "commonMistakes": [
   "Choosing the scope before knowing the need.",
   "Forgetting to check your own permissions."
  ],
  "items": [
   {
    "id": "o1",
    "text": "Determine who needs access"
   },
   {
    "id": "o2",
    "text": "Choose the appropriate role"
   },
   {
    "id": "o3",
    "text": "Identify the necessary scope"
   },
   {
    "id": "o4",
    "text": "Verify your own assignment rights"
   },
   {
    "id": "o5",
    "text": "Assign the role"
   }
  ]
 },
 "id-005": {
  "title": "The smallest scope that is enough",
  "objective": "Choose the minimum scope for each need.",
  "statement": "For each need, place it at the narrowest assignment scope that covers it.",
  "hints": [
   "The narrower the scope, the more limited the risk.",
   "A single resource calls for an assignment on that resource."
  ],
  "explanation": "Least privilege also applies to the scope: you assign at the lowest level that meets the need, because the assignment is inherited downward.",
  "commonMistakes": [
   "Assigning at the subscription \"to simplify\".",
   "Forgetting inheritance."
  ],
  "items": [
   {
    "id": "e1",
    "text": "Read one specific key vault"
   },
   {
    "id": "e2",
    "text": "Manage all the VMs of the rg-app group"
   },
   {
    "id": "e3",
    "text": "View all the subscriptions of the organization for compliance"
   },
   {
    "id": "e4",
    "text": "Manage all the resource groups of a test subscription"
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
 "id-006": {
  "title": "Groups rather than individual users",
  "objective": "Justify assigning roles to groups.",
  "statement": "Why do we preferably assign roles to security groups rather than to individual users? Several answers are possible.",
  "hints": [
   "A group does not change the scope.",
   "Think about the employee lifecycle."
  ],
  "explanation": "Managing access by group simplifies staff movements, reduces the number of assignments and makes reviews easier. The group does not change the scope of the assignment in any way.",
  "commonMistakes": [
   "Believing a group widens or bypasses the scope."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "Joiners and leavers are handled through group membership, without touching the assignments"
   },
   {
    "id": "c2",
    "text": "The number of role assignments to manage stays low"
   },
   {
    "id": "c3",
    "text": "A group bypasses the limits of the scope"
   },
   {
    "id": "c4",
    "text": "The access audit is more readable"
   }
  ]
 },
 "id-007": {
  "title": "Over-broad assignment: spot and fix",
  "objective": "Fix an assignment command that violates least privilege.",
  "statement": "The `app-factures` application must only **read the blobs** of the `stfacturesprod` account. **Spot the faulty line** and choose the fix.",
  "hints": [
   "What is the real need?",
   "A data role exists for reading blobs."
  ],
  "explanation": "Owner on the subscription gives total control over everything. The need is limited to reading the blobs of one account: a data role such as Storage Blob Data Reader, at the account scope, is enough.",
  "commonMistakes": [
   "Choosing Reader: it does not give access to the blob data.",
   "Choosing Contributor: too broad."
  ],
  "lines": [
   {
    "id": "l1",
    "text": "az login --identity"
   },
   {
    "id": "l2",
    "text": "az role assignment create --assignee $APP_ID --role \"Owner\" --scope \"/subscriptions/$SUB\"",
    "faulty": {
     "remedies": [
      {
       "id": "r2-1",
       "text": "--role \"Storage Blob Data Reader\" with the scope of the stfacturesprod account"
      },
      {
       "id": "r2-2",
       "text": "--role \"Contributor\" with the same scope"
      },
      {
       "id": "r2-3",
       "text": "--role \"Reader\" on the subscription"
      }
     ]
    }
   },
   {
    "id": "l3",
    "text": "az role assignment list --assignee $APP_ID --output table"
   }
  ]
 },
 "id-008": {
  "title": "Security platform roles",
  "objective": "Match a Sentinel role to an analyst profile.",
  "statement": "Match each profile to the most suitable Microsoft Sentinel role.",
  "hints": [
   "Reader reads, Responder acts on incidents, Contributor builds.",
   "One role is dedicated to playbooks."
  ],
  "explanation": "Sentinel separates reading, incident response and detection engineering. Tier 1 analysts get the Responder role, and detection engineers get Contributor, rather than Owner or Azure Contributor.",
  "commonMistakes": [
   "Giving Contributor to all the analysts.",
   "Forgetting Playbook Operator to run a playbook."
  ],
  "items": [
   {
    "id": "m1",
    "text": "Analyst who views incidents and data, without changing anything"
   },
   {
    "id": "m2",
    "text": "Analyst who manages incidents (assign, close, comment)"
   },
   {
    "id": "m3",
    "text": "Engineer who creates and modifies analytics rules and workbooks"
   },
   {
    "id": "m4",
    "text": "Person who manually runs playbooks"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Microsoft Sentinel Reader"
   },
   {
    "id": "p2",
    "text": "Microsoft Sentinel Responder"
   },
   {
    "id": "p3",
    "text": "Microsoft Sentinel Contributor"
   },
   {
    "id": "p4",
    "text": "Microsoft Sentinel Playbook Operator"
   }
  ]
 },
 "id-009": {
  "title": "Role to run a playbook",
  "objective": "Choose the minimum role to run a playbook manually.",
  "statement": "An analyst must manually run a playbook on an incident. Which minimum role does she need for this specific action, in addition to her incident response rights?",
  "hints": [
   "A Sentinel role is designed for this.",
   "Contributor on Logic Apps allows modifying the playbook."
  ],
  "explanation": "Playbook Operator allows running a playbook without modifying it. Logic App Contributor allows modifying or managing playbooks, which goes beyond the need.",
  "commonMistakes": [
   "Giving Logic App Contributor to an analyst who only needs to run."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "Microsoft Sentinel Playbook Operator on the playbook's resource group"
   },
   {
    "id": "c2",
    "text": "Logic App Contributor on the whole subscription"
   },
   {
    "id": "c3",
    "text": "Owner on the workspace"
   },
   {
    "id": "c4",
    "text": "No additional role: Responder is always enough"
   }
  ]
 },
 "id-010": {
  "title": "Deploying a conditional access policy safely",
  "objective": "Order a cautious conditional access deployment.",
  "statement": "Put the steps of a cautious deployment of a new conditional access policy in order.",
  "hints": [
   "You observe before enforcing.",
   "Emergency accounts are excluded from the definition."
  ],
  "explanation": "Report-only mode evaluates the policy without enforcing it. You validate the impact before enabling, and you exclude the emergency accounts to avoid locking yourself out of the tenant.",
  "commonMistakes": [
   "Enabling directly.",
   "Forgetting to exclude the emergency accounts."
  ],
  "items": [
   {
    "id": "o1",
    "text": "Define the policy and its exclusions for the emergency accounts"
   },
   {
    "id": "o2",
    "text": "Enable the policy in report-only mode"
   },
   {
    "id": "o3",
    "text": "Analyze the impact in the reports"
   },
   {
    "id": "o4",
    "text": "Enable the policy"
   }
  ]
 },
 "id-011": {
  "title": "Emergency accounts and conditional access",
  "objective": "Justify excluding the emergency accounts.",
  "statement": "Why do we exclude at least one emergency (break-glass) account from the conditional access policies?",
  "hints": [
   "Think of a configuration error that blocks all the administrators.",
   "Such an account must stay rarely used and monitored."
  ],
  "explanation": "An emergency account is the last escape hatch. It must be excluded from the policies that could block access, be strongly protected, rarely used, and its use must trigger an alert.",
  "commonMistakes": [
   "Using the emergency account day to day.",
   "Not monitoring its sign-in."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "To keep an administrator access if a misconfigured policy locks everyone out"
   },
   {
    "id": "c2",
    "text": "So that this account is used day to day"
   },
   {
    "id": "c3",
    "text": "To disable its audit"
   },
   {
    "id": "c4",
    "text": "Because these accounts do not need a password"
   }
  ]
 },
 "id-012": {
  "title": "Blocking policy: three traps",
  "objective": "Fix a dangerous conditional access policy.",
  "statement": "This policy must **block access from outside Canada** without any risk of lockout. **Spot the faulty lines** and choose the fixes.",
  "hints": [
   "Who keeps access if the policy is misconfigured?",
   "How do you validate before enforcing?"
  ],
  "explanation": "A blocking policy on all users with no exclusion exposes you to lockout. You exclude the emergency accounts and start in report-only mode, then enable after analysis.",
  "commonMistakes": [
   "Excluding all the administrators: it opens the door to the most targeted accounts.",
   "Enabling without validation."
  ],
  "lines": [
   {
    "id": "l1",
    "text": "Name: Block outside Canada"
   },
   {
    "id": "l2",
    "text": "Included users: All users"
   },
   {
    "id": "l3",
    "text": "Excluded users: none",
    "faulty": {
     "remedies": [
      {
       "id": "r3-1",
       "text": "Exclude the emergency account"
      },
      {
       "id": "r3-2",
       "text": "Exclude all the administrators"
      },
      {
       "id": "r3-3",
       "text": "Exclude the guests"
      }
     ]
    }
   },
   {
    "id": "l4",
    "text": "Target applications: All cloud apps"
   },
   {
    "id": "l5",
    "text": "Conditions: location = any location except Canada"
   },
   {
    "id": "l6",
    "text": "Access control: Block"
   },
   {
    "id": "l7",
    "text": "State: Enabled",
    "faulty": {
     "remedies": [
      {
       "id": "r7-1",
       "text": "State: Report-only, then enable after validation"
      },
      {
       "id": "r7-2",
       "text": "State: Disabled permanently"
      },
      {
       "id": "r7-3",
       "text": "State: Enabled, without validation"
      }
     ]
    }
   }
  ]
 },
 "id-013": {
  "title": "Workload identities",
  "objective": "Know which objects classic conditional access does not cover.",
  "statement": "Does a conditional access policy targeting \"All users\" also protect service principals (workload identities)?",
  "hints": [
   "A service principal is not a user.",
   "A dedicated variant exists."
  ],
  "explanation": "User policies do not apply to service principals. Conditional access for workload identities is a separate feature, with its own licensing requirements.",
  "commonMistakes": [
   "Assuming user policies also cover applications."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "No: service principals require conditional access for workload identities"
   },
   {
    "id": "c2",
    "text": "Yes: all identity types are covered automatically"
   },
   {
    "id": "c3",
    "text": "Yes, but only outside Canada"
   },
   {
    "id": "c4",
    "text": "No: they are never covered, whatever you configure"
   }
  ]
 },
 "id-014": {
  "title": "PIM: eligible or active",
  "objective": "Distinguish the assignment types in PIM.",
  "statement": "Match each Privileged Identity Management concept to its definition.",
  "hints": [
   "Eligible means \"can request\".",
   "Activation is time-limited."
  ],
  "explanation": "PIM turns a permanent privilege into an on-demand privilege: the role becomes active only for the necessary duration. PIM requires Microsoft Entra ID P2 or ID Governance.",
  "commonMistakes": [
   "Confusing eligible and active.",
   "Forgetting the required license."
  ],
  "items": [
   {
    "id": "m1",
    "text": "Eligible assignment"
   },
   {
    "id": "m2",
    "text": "Active assignment"
   },
   {
    "id": "m3",
    "text": "Activation"
   },
   {
    "id": "m4",
    "text": "Time-bound assignment"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "The user can activate the role as needed, with possible conditions"
   },
   {
    "id": "p2",
    "text": "The role is available without activation"
   },
   {
    "id": "p3",
    "text": "Temporary request for the role, which may require MFA, justification or approval"
   },
   {
    "id": "p4",
    "text": "Has a start and end date"
   }
  ]
 },
 "id-015": {
  "title": "Why PIM reduces risk",
  "objective": "Explain the value of just-in-time access.",
  "statement": "What are the advantages of an eligible administrator access rather than a permanent one? Several answers are possible.",
  "hints": [
   "The privilege only exists during the activation.",
   "PIM adds controls, it does not remove any."
  ],
  "explanation": "Just-in-time access limits the attack surface over time, logs the activations and lets you add MFA, justification and approval.",
  "commonMistakes": [
   "Believing PIM removes the authentication controls."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "The window during which a compromised account is powerful is reduced"
   },
   {
    "id": "c2",
    "text": "Activations leave an audit trail"
   },
   {
    "id": "c3",
    "text": "The administrator never needs MFA again"
   },
   {
    "id": "c4",
    "text": "You can require an approval or a justification before getting the role"
   }
  ]
 },
 "id-016": {
  "title": "Who can manage Azure roles in PIM?",
  "objective": "Know the prerequisite for managing Azure resource roles in PIM.",
  "statement": "Who can manage Azure resource role assignments in PIM?",
  "hints": [
   "Only certain roles can assign access.",
   "Contributor cannot assign roles."
  ],
  "explanation": "For Azure resources, only Owner and User Access Administrator can manage assignments in PIM, which reflects the general RBAC rule on role assignment.",
  "commonMistakes": [
   "Believing Contributor is enough."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "Users with the Owner or User Access Administrator role on the resource"
   },
   {
    "id": "c2",
    "text": "Any Contributor"
   },
   {
    "id": "c3",
    "text": "Only Readers"
   },
   {
    "id": "c4",
    "text": "Only a tenant administrator, unrelated to Azure roles"
   }
  ]
 },
 "id-017": {
  "title": "Mission: harden Nordlys administrator access",
  "objective": "Choose the appropriate control for each privileged access risk.",
  "statement": "Nordlys is reviewing its administrator access. For each situation, choose the most appropriate control.",
  "hints": [
   "When: PIM. Under which conditions: conditional access. What and where: RBAC. And if everything fails: emergency account.",
   "An emergency account is not managed through PIM."
  ],
  "explanation": "These controls complement each other: RBAC sets the perimeter, PIM limits it in time, conditional access frames the sign-in, and the emergency account guarantees a recourse.",
  "commonMistakes": [
   "Using conditional access to set the scope of a role.",
   "Replacing the emergency account with an eligible administrator in PIM."
  ],
  "items": [
   {
    "id": "e1",
    "text": "An administrator should only be Owner for a few hours during a change"
   },
   {
    "id": "e2",
    "text": "Require a compliant device to access the Azure portal"
   },
   {
    "id": "e3",
    "text": "An operator only manages the VMs of one resource group"
   },
   {
    "id": "e4",
    "text": "Keep an access if a policy locks out all the administrators"
   },
   {
    "id": "e5",
    "text": "Require a justification and an approval before activating a role"
   },
   {
    "id": "e6",
    "text": "Block administrator access from an unauthorized country"
   }
  ],
  "zones": [
   {
    "id": "pim",
    "label": "PIM",
    "description": "On-demand, time-limited access"
   },
   {
    "id": "ca",
    "label": "Conditional access",
    "description": "Access conditions at sign-in"
   },
   {
    "id": "rbac",
    "label": "RBAC and scope",
    "description": "Suitable role and perimeter"
   },
   {
    "id": "bg",
    "label": "Emergency account",
    "description": "Monitored last resort"
   }
  ]
 },
 "id-018": {
  "title": "Assessment: review of a role assignment",
  "objective": "Fix the gaps in a privileged assignment.",
  "statement": "During a review, you are handed this access description for the account `a.gagnon`, who must only **manage the VMs of rg-app** a few hours per week. **Spot the two gaps** and choose the fixes.",
  "hints": [
   "The role and the scope are both too broad.",
   "The assignment type is already suitable."
  ],
  "explanation": "Owner on the subscription far exceeds the need. Virtual Machine Contributor on `rg-app` respects least privilege, and PIM eligibility with MFA is already a good control to keep.",
  "commonMistakes": [
   "Fixing the role but not the scope.",
   "Removing PIM, which was correct."
  ],
  "lines": [
   {
    "id": "l1",
    "text": "Principal: a.gagnon@nordlys.example"
   },
   {
    "id": "l2",
    "text": "Role: Owner",
    "faulty": {
     "remedies": [
      {
       "id": "r2-1",
       "text": "Role: Virtual Machine Contributor"
      },
      {
       "id": "r2-2",
       "text": "Role: Reader"
      },
      {
       "id": "r2-3",
       "text": "Role: User Access Administrator"
      }
     ]
    }
   },
   {
    "id": "l3",
    "text": "Scope: Sub-Production subscription",
    "faulty": {
     "remedies": [
      {
       "id": "r3-1",
       "text": "Scope: rg-app resource group"
      },
      {
       "id": "r3-2",
       "text": "Scope: root management group"
      },
      {
       "id": "r3-3",
       "text": "Scope: a random single resource"
      }
     ]
    }
   },
   {
    "id": "l4",
    "text": "Type: eligible in PIM, 4-hour activation with MFA"
   }
  ]
 }
};
