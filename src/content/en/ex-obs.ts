import type { Overlay } from './types.ts';

// Traduction anglaise (overlay). Les blocs de code et les identifiants restent identiques au français.
export const enExObs: Record<string, Overlay> = {
 "obs-001": {
  "title": "The three types of Azure logs",
  "objective": "Distinguish the activity log, resource logs and Entra logs.",
  "statement": "Match each log to what it records.",
  "hints": [
   "The first concerns what is done to resources, the second what resources do.",
   "The third concerns identity."
  ],
  "explanation": "Each source answers a different question: who modified a resource, what the resource did, who authenticated. Detection relies on all three.",
  "commonMistakes": [
   "Believing the activity log contains data operations."
  ],
  "items": [
   {
    "id": "m1",
    "text": "Azure Activity log"
   },
   {
    "id": "m2",
    "text": "Resource logs"
   },
   {
    "id": "m3",
    "text": "Microsoft Entra sign-in logs (SigninLogs)"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Operations on the management plane of a subscription's resources"
   },
   {
    "id": "p2",
    "text": "Internal operations of a resource, collected through a diagnostic setting"
   },
   {
    "id": "p3",
    "text": "Authentications of users and applications"
   }
  ]
 },
 "obs-002": {
  "title": "Where to send a diagnostic setting",
  "objective": "Know the destinations of a diagnostic setting.",
  "statement": "To which destinations can a diagnostic setting send logs? Several answers are possible.",
  "hints": [
   "Three main destinations exist, plus partner solutions.",
   "GitHub is not one of them."
  ],
  "explanation": "Log Analytics is for analysis and KQL queries, storage for archiving, Event Hubs for streaming to external systems. Partner solutions are also supported.",
  "commonMistakes": [
   "Forgetting that resource logs are not collected until a setting exists."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "A Log Analytics workspace"
   },
   {
    "id": "c2",
    "text": "A storage account"
   },
   {
    "id": "c3",
    "text": "An Event Hub"
   },
   {
    "id": "c4",
    "text": "A GitHub repository"
   }
  ]
 },
 "obs-003": {
  "title": "Choose the destination according to the need",
  "objective": "Match a need to the suitable destination.",
  "statement": "Place each need in the most appropriate destination.",
  "hints": [
   "KQL implies Log Analytics.",
   "An external SIEM receives the events as a stream."
  ],
  "explanation": "You choose the destination according to the use: querying and detection in Log Analytics, archiving in storage, continuous streaming outward through Event Hubs.",
  "commonMistakes": [
   "Sending everything to storage hoping to do detection."
  ],
  "items": [
   {
    "id": "e1",
    "text": "Hunt a threat with KQL"
   },
   {
    "id": "e2",
    "text": "Trigger a Sentinel analytics rule"
   },
   {
    "id": "e3",
    "text": "Keep logs for a retention obligation without querying them"
   },
   {
    "id": "e4",
    "text": "Continuously send the events to a third-party SIEM"
   }
  ],
  "zones": [
   {
    "id": "law",
    "label": "Log Analytics",
    "description": "Queries, alerts, Sentinel"
   },
   {
    "id": "sa",
    "label": "Storage account",
    "description": "Low-cost archiving"
   },
   {
    "id": "eh",
    "label": "Event Hub",
    "description": "Streaming to an external tool"
   }
  ]
 },
 "obs-004": {
  "title": "Azure Monitor Agent and collection rule",
  "objective": "Match the components of modern collection.",
  "statement": "Match each component to its role.",
  "hints": [
   "The rule only applies to the associated machines.",
   "The agent executes, the rule decides."
  ],
  "explanation": "AMA replaces the older agents. The rule (DCR) centralizes the configuration, which lets you reuse it for many machines through associations.",
  "commonMistakes": [
   "Installing the agent without associating a rule: nothing is collected."
  ],
  "items": [
   {
    "id": "m1",
    "text": "Azure Monitor Agent (AMA)"
   },
   {
    "id": "m2",
    "text": "Data collection rule (DCR)"
   },
   {
    "id": "m3",
    "text": "Data collection rule association (DCRA)"
   },
   {
    "id": "m4",
    "text": "Log Analytics workspace"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Collects the data on the virtual machine or server"
   },
   {
    "id": "p2",
    "text": "Describes which data to collect, how to transform it and where to send it"
   },
   {
    "id": "p3",
    "text": "Links a collection rule to a machine"
   },
   {
    "id": "p4",
    "text": "Destination where the data is stored and queried"
   }
  ]
 },
 "obs-005": {
  "title": "Collect the security events of a Windows server",
  "objective": "Order the setup of collection with AMA.",
  "statement": "Put the steps to collect the Windows events of a server into Sentinel in order.",
  "hints": [
   "The destination exists before the rule.",
   "You verify before querying."
  ],
  "explanation": "The Heartbeat table confirms that the agent is communicating. Then SecurityEvent should fill up. An absence of data after the association is a classic troubleshooting case.",
  "commonMistakes": [
   "Querying before checking the agent connection."
  ],
  "items": [
   {
    "id": "o1",
    "text": "Create or choose the Log Analytics workspace with Sentinel"
   },
   {
    "id": "o2",
    "text": "Create a collection rule with the Windows Events source"
   },
   {
    "id": "o3",
    "text": "Associate the rule with the server"
   },
   {
    "id": "o4",
    "text": "Verify that the agent sends heartbeats (Heartbeat)"
   },
   {
    "id": "o5",
    "text": "Query the SecurityEvent table"
   }
  ]
 },
 "obs-006": {
  "title": "No data after the association",
  "objective": "Diagnose a silent collection.",
  "statement": "A server has been associated with a collection rule for an hour, but `SecurityEvent` remains empty for this machine. What is the most relevant first check?",
  "hints": [
   "A simple test confirms whether the agent is communicating.",
   "Start with the simplest thing."
  ],
  "explanation": "Heartbeat is the agent's proof of life. Without a heartbeat, the problem is connectivity or the agent; with a heartbeat, you need to check the rule, its filters and the association.",
  "commonMistakes": [
   "Changing several things at once."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "Look in Heartbeat to see whether the machine sends heartbeats"
   },
   {
    "id": "c2",
    "text": "Delete the workspace and recreate it"
   },
   {
    "id": "c3",
    "text": "Disable Sentinel"
   },
   {
    "id": "c4",
    "text": "Change the time zone of the workspace"
   }
  ]
 },
 "obs-007": {
  "title": "A collection rule that is too chatty",
  "objective": "Reduce the ingested volume by filtering at the source.",
  "statement": "This rule collects **all** the events of the Security log, which is expensive. You only want the failed (4625) and successful (4624) logons. **Spot the line to fix.**",
  "hints": [
   "XPath queries filter at the source.",
   "You need to name the wanted event IDs."
  ],
  "explanation": "An XPath filter limits the collection to the wanted event IDs, which reduces the ingestion cost. A filter that is too broad could hide detections: you choose it along with the detection needs.",
  "commonMistakes": [
   "Filtering by severity level, which does not match the goal."
  ],
  "lines": [
   {
    "id": "l1",
    "text": "\"dataSources\": {"
   },
   {
    "id": "l2",
    "text": "  \"windowsEventLogs\": [{"
   },
   {
    "id": "l3",
    "text": "    \"name\": \"securite\","
   },
   {
    "id": "l4",
    "text": "    \"streams\": [\"Microsoft-SecurityEvent\"],"
   },
   {
    "id": "l5",
    "text": "    \"xPathQueries\": [\"Security!*\"]",
    "faulty": {
     "remedies": [
      {
       "id": "r5-1",
       "text": "\"Security!*[System[(EventID=4624 or EventID=4625)]]\""
      },
      {
       "id": "r5-2",
       "text": "\"Security!*[System[(Level=1)]]\""
      },
      {
       "id": "r5-3",
       "text": "\"System!*\""
      }
     ]
    }
   },
   {
    "id": "l6",
    "text": "  }]"
   },
   {
    "id": "l7",
    "text": "}"
   }
  ]
 },
 "obs-008": {
  "title": "Ingestion-time transformation",
  "objective": "Know what an ingestion transformation allows.",
  "statement": "What are typical uses of a collection rule transformation? Several answers are possible.",
  "hints": [
   "The transformation acts during ingestion.",
   "It does not rewrite the past."
  ],
  "explanation": "A transformation applies to incoming data, before it is written to the table. It lets you reduce costs and limit sensitive data, but does not change what is already stored.",
  "commonMistakes": [
   "Believing a transformation fixes the history."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "Filter out useless rows before storage"
   },
   {
    "id": "c2",
    "text": "Remove or mask sensitive columns"
   },
   {
    "id": "c3",
    "text": "Enrich or normalize data on arrival"
   },
   {
    "id": "c4",
    "text": "Retroactively modify data that is already stored"
   }
  ]
 },
 "obs-009": {
  "title": "Table plans",
  "objective": "Match a table plan to its uses.",
  "statement": "Match each Log Analytics table plan to its description.",
  "hints": [
   "Detections require the most complete plan.",
   "One plan rules out alerts."
  ],
  "explanation": "The plan is chosen table by table according to the value of the data. The tables that feed detection rules must stay on Analytics.",
  "commonMistakes": [
   "Moving to Basic a table used by an analytics rule."
  ],
  "items": [
   {
    "id": "m1",
    "text": "Analytics"
   },
   {
    "id": "m2",
    "text": "Basic"
   },
   {
    "id": "m3",
    "text": "Auxiliary"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Full analysis, unlimited queries, alerts and detections"
   },
   {
    "id": "p2",
    "text": "High-volume logs at reduced cost, limited queries"
   },
   {
    "id": "p3",
    "text": "Low-value data to keep at very low cost; alerts do not work on it"
   }
  ]
 },
 "obs-010": {
  "title": "Which table to switch to Auxiliary?",
  "objective": "Choose a candidate table for a cheaper plan.",
  "statement": "Which of these tables is the best candidate for a cheaper plan, given that no rule uses it?",
  "hints": [
   "A cheaper plan limits alerts.",
   "Keep Analytics for what feeds detections."
  ],
  "explanation": "The detection tables stay on Analytics. A bulky log that is rarely consulted and has no associated rule is a good candidate. The plan change is limited to once a week per table.",
  "commonMistakes": [
   "Switching a detection table to save money."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "Very high-volume network flow logs rarely consulted for investigations"
   },
   {
    "id": "c2",
    "text": "SigninLogs, used by several detection rules"
   },
   {
    "id": "c3",
    "text": "SecurityEvent, used for brute force detection"
   },
   {
    "id": "c4",
    "text": "AuditLogs, basis of privilege rules"
   }
  ]
 },
 "obs-011": {
  "title": "Interactive and total retention",
  "objective": "Match the retention concepts to their bounds.",
  "statement": "Match each concept to its description.",
  "hints": [
   "Sentinel raises the default to 90 days.",
   "Long-term data cannot be queried like interactive data."
  ],
  "explanation": "You need to plan the retention duration according to investigation and compliance needs. Beyond interactive retention, a search job makes the data accessible.",
  "commonMistakes": [
   "Believing total retention is interactive."
  ],
  "items": [
   {
    "id": "m1",
    "text": "Interactive retention (Analytics)"
   },
   {
    "id": "m2",
    "text": "Total retention"
   },
   {
    "id": "m3",
    "text": "Default value of a workspace"
   },
   {
    "id": "m4",
    "text": "Search job"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "From 4 to 730 days, full queries"
   },
   {
    "id": "p2",
    "text": "Up to 12 years, the part beyond interactive is long-term"
   },
   {
    "id": "p3",
    "text": "30 days (90 days with Sentinel)"
   },
   {
    "id": "p4",
    "text": "Lets you search the long-term data"
   }
  ]
 },
 "obs-012": {
  "title": "A 2-year retention requirement",
  "objective": "Size interactive and total retention.",
  "statement": "Nordlys's policy requires 90 days of fast searches and 2 years of total retention for `SigninLogs`. Which configuration meets the requirement at the lowest reasonable cost?",
  "hints": [
   "Two years equal 730 days.",
   "Interactive retention costs more than long-term retention."
  ],
  "explanation": "The 90-day interactive retention covers the frequent searches. The remaining 640 days are kept long-term, cheaper, and remain accessible through search.",
  "commonMistakes": [
   "Keeping 730 days interactive without need."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "Interactive retention of 90 days, total retention of 730 days"
   },
   {
    "id": "c2",
    "text": "Interactive retention of 730 days, total retention of 730 days"
   },
   {
    "id": "c3",
    "text": "Interactive retention of 30 days, total retention of 90 days"
   },
   {
    "id": "c4",
    "text": "Interactive retention of 90 days, total retention of 90 days"
   }
  ]
 },
 "obs-013": {
  "title": "One workspace or several?",
  "objective": "Reason about workspace design.",
  "statement": "Which criteria justify separating logs into several workspaces? Several answers are possible.",
  "hints": [
   "Separating adds complexity for queries and detections.",
   "Some differences are handled per table or through table-level access."
  ],
  "explanation": "A single workspace simplifies detection and hunting. You separate for data residency, access separation or governance reasons, not out of habit or because there are several subscriptions.",
  "commonMistakes": [
   "Creating one workspace per subscription as a reflex."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "Data residency requirements in a specific region"
   },
   {
    "id": "c2",
    "text": "Strict access separation between teams that must not see the same data"
   },
   {
    "id": "c3",
    "text": "The mere fact of having several subscriptions"
   },
   {
    "id": "c4",
    "text": "Very different retention constraints that cannot be handled per table"
   }
  ]
 },
 "obs-014": {
  "title": "Enabling an alert on a table",
  "objective": "Order the checks before basing a rule on a table.",
  "statement": "Put in order what you check before building an analytics rule on a table.",
  "hints": [
   "The data before the query.",
   "You test before enabling."
  ],
  "explanation": "A rule produces nothing without data, does not run on an Auxiliary table, and cannot look back further than the available retention.",
  "commonMistakes": [
   "Writing the query before checking the data."
  ],
  "items": [
   {
    "id": "o1",
    "text": "Confirm that the data arrives in the table"
   },
   {
    "id": "o2",
    "text": "Verify that the table is on the Analytics plan"
   },
   {
    "id": "o3",
    "text": "Confirm that retention covers the rule's lookback period"
   },
   {
    "id": "o4",
    "text": "Write and test the query"
   },
   {
    "id": "o5",
    "text": "Enable the rule"
   }
  ]
 },
 "obs-015": {
  "title": "Diagnosing a silent table in KQL",
  "objective": "Fix a query that detects silent machines.",
  "statement": "This query must list the machines that have not sent a heartbeat for **more than 30 minutes**. **Spot the faulty line.**",
  "hints": [
   "Silent means the last heartbeat is old.",
   "Older than 30 minutes is expressed as \"less than ago(30m)\"."
  ],
  "explanation": "A machine is silent if its last heartbeat is older than the threshold. The comparison `LastBeat < ago(30m)` expresses it, after summarizing per machine.",
  "commonMistakes": [
   "Reversing the direction of the comparison.",
   "Filtering before the summary and losing the silent machines."
  ],
  "lines": [
   {
    "id": "l1",
    "text": "Heartbeat"
   },
   {
    "id": "l2",
    "text": "| summarize LastBeat = max(TimeGenerated) by Computer"
   },
   {
    "id": "l3",
    "text": "| where LastBeat > ago(30m)",
    "faulty": {
     "remedies": [
      {
       "id": "r3-1",
       "text": "| where LastBeat < ago(30m)"
      },
      {
       "id": "r3-2",
       "text": "| where LastBeat == ago(30m)"
      },
      {
       "id": "r3-3",
       "text": "| where TimeGenerated < ago(30m)"
      }
     ]
    }
   },
   {
    "id": "l4",
    "text": "| order by LastBeat asc"
   }
  ]
 },
 "obs-016": {
  "title": "Which measure for which need?",
  "objective": "Match a signal to the log source that provides it.",
  "statement": "For each investigation question, place the log source that contains the answer.",
  "hints": [
   "Configuration changes are in the activity log.",
   "What a resource does is in its resource logs."
  ],
  "explanation": "Knowing the source avoids querying the wrong tables: management in the activity log, identity in the sign-ins, internal behavior in the resource logs.",
  "commonMistakes": [
   "Looking for a configuration deletion in SigninLogs."
  ],
  "items": [
   {
    "id": "e1",
    "text": "Who deleted the diagnostic setting of rg-sec?"
   },
   {
    "id": "e2",
    "text": "From which IP address did the user authenticate?"
   },
   {
    "id": "e3",
    "text": "Which requests did the firewall deny?"
   },
   {
    "id": "e4",
    "text": "Which VM was created in rg-prod?"
   },
   {
    "id": "e5",
    "text": "Which application obtained a token for this user?"
   }
  ],
  "zones": [
   {
    "id": "act",
    "label": "Azure Activity log"
   },
   {
    "id": "sign",
    "label": "Entra sign-in logs"
   },
   {
    "id": "res",
    "label": "Resource logs"
   }
  ]
 },
 "obs-017": {
  "title": "A deleted diagnostic setting",
  "objective": "Recognize the risk of a logging blind spot.",
  "statement": "In the Nordlys incident, the account `svc-backup2` deletes a diagnostic setting. Why is this worrying from a detection standpoint?",
  "hints": [
   "The setting controls the sending of logs, not their past storage.",
   "An attacker may try to stay invisible."
  ],
  "explanation": "Deleting a diagnostic setting cuts future collection and is used to hide actions. It is a defense evasion technique: you create an alert on deletion operations in the activity log.",
  "commonMistakes": [
   "Believing the past logs disappear."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "The resource stops sending its logs, which creates a blind spot for the following actions"
   },
   {
    "id": "c2",
    "text": "It deletes the logs already stored"
   },
   {
    "id": "c3",
    "text": "It disables multifactor authentication"
   },
   {
    "id": "c4",
    "text": "It changes the region of the workspace"
   }
  ]
 },
 "obs-018": {
  "title": "Assessment: monitor diagnostic deletions",
  "objective": "Fix a query that detects diagnostic setting deletions.",
  "statement": "This query must find the **deletions** of diagnostic settings in the last 24 hours. **Spot the faulty line.**",
  "hints": [
   "The first line is already correct.",
   "Which operation corresponds to a deletion?"
  ],
  "explanation": "The 24-hour window is correct. The operation to look for is `DIAGNOSTICSETTINGS/DELETE`, not WRITE. In our dataset, `svc-backup2` produces one in rg-sec.",
  "commonMistakes": [
   "Confusing WRITE (creation or modification) and DELETE."
  ],
  "lines": [
   {
    "id": "l1",
    "text": "AzureActivity"
   },
   {
    "id": "l2",
    "text": "| where TimeGenerated > ago(24h)"
   },
   {
    "id": "l3",
    "text": "| where OperationNameValue has \"DIAGNOSTICSETTINGS/WRITE\"",
    "faulty": {
     "remedies": [
      {
       "id": "r3-1",
       "text": "| where OperationNameValue has \"DIAGNOSTICSETTINGS/DELETE\""
      },
      {
       "id": "r3-2",
       "text": "| where OperationNameValue has \"DIAGNOSTICSETTINGS/READ\""
      },
      {
       "id": "r3-3",
       "text": "| where OperationNameValue == \"DELETE\""
      }
     ]
    }
   },
   {
    "id": "l4",
    "text": "| project TimeGenerated, Caller, ResourceGroup, OperationNameValue"
   }
  ]
 }
};
