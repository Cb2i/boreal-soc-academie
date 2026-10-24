import type { Overlay } from './types.ts';

// Traduction anglaise (overlay). Les blocs de code et les identifiants restent identiques au français.
export const enExSen: Record<string, Overlay> = {
 "sen-001": {
  "title": "The components of Microsoft Sentinel",
  "objective": "Match each component to its role in a SOC.",
  "statement": "Match each Sentinel component to its role.",
  "hints": [
   "The connector is upstream, the incident downstream.",
   "Two components automate, at different levels."
  ],
  "explanation": "The Sentinel cycle: collection (connector), detection (rule), investigation (incident), response (automation and playbook).",
  "commonMistakes": [
   "Confusing automation rule and playbook."
  ],
  "items": [
   {
    "id": "m1",
    "text": "Data connector"
   },
   {
    "id": "m2",
    "text": "Analytics rule"
   },
   {
    "id": "m3",
    "text": "Incident"
   },
   {
    "id": "m4",
    "text": "Automation rule"
   },
   {
    "id": "m5",
    "text": "Playbook"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Brings the logs of a source into the workspace"
   },
   {
    "id": "p2",
    "text": "Runs a query and generates alerts when it finds something"
   },
   {
    "id": "p3",
    "text": "Groups alerts and entities to investigate"
   },
   {
    "id": "p4",
    "text": "Applies simple actions to incidents (tag, severity, assignment)"
   },
   {
    "id": "p5",
    "text": "Logic Apps flow for more complex responses"
   }
  ]
 },
 "sen-002": {
  "title": "Setting up Sentinel",
  "objective": "Order the steps of a first setup.",
  "statement": "Put the steps of a Sentinel setup in order.",
  "hints": [
   "The workspace comes before Sentinel.",
   "Without data, the rules are useless."
  ],
  "explanation": "You start with the highest-value sources (identity, Azure activity) then add rules. The final validation confirms that the whole chain works.",
  "commonMistakes": [
   "Enabling rules before having data."
  ],
  "items": [
   {
    "id": "o1",
    "text": "Choose or create the Log Analytics workspace"
   },
   {
    "id": "o2",
    "text": "Enable Microsoft Sentinel on this workspace"
   },
   {
    "id": "o3",
    "text": "Connect the priority sources (identity, Azure activity)"
   },
   {
    "id": "o4",
    "text": "Enable rules from the templates"
   },
   {
    "id": "o5",
    "text": "Validate that alerts and incidents are created"
   }
  ]
 },
 "sen-003": {
  "title": "Types of analytics rules",
  "objective": "Distinguish two families of rules.",
  "statement": "Match each rule type to its description.",
  "hints": [
   "One is written in KQL by you.",
   "The other turns existing alerts into incidents."
  ],
  "explanation": "Scheduled rules are the core of detection engineering. Rules that create incidents from Microsoft alerts avoid losing alerts from other products.",
  "commonMistakes": [
   "Believing a rule deletes data."
  ],
  "items": [
   {
    "id": "m1",
    "text": "Scheduled rule"
   },
   {
    "id": "m2",
    "text": "Microsoft Security rule"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "Runs a KQL query at regular intervals over a lookback period"
   },
   {
    "id": "p2",
    "text": "Creates incidents from the alerts of other Microsoft security products"
   },
   {
    "id": "p3",
    "text": "Automatically deletes the data of a table"
   }
  ]
 },
 "sen-004": {
  "title": "Lookback window and ingestion delay",
  "objective": "Size the lookback period of a scheduled rule.",
  "statement": "A scheduled rule runs every 5 minutes with a lookback period of 5 minutes. The documentation mentions an ingestion delay that can reach 5 minutes. What risk does this create and what is the fix?",
  "hints": [
   "An event timestamped 12:00 can arrive at 12:04.",
   "A longer period creates overlaps."
  ],
  "explanation": "Events are evaluated according to their timestamp but may arrive after the end of the window. A lookback period longer than the frequency compensates for the delay, at the price of overlaps that grouping alerts into incidents absorbs.",
  "commonMistakes": [
   "Setting the lookback period equal to the frequency with no margin."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "Late-arriving events may be covered by no run; lengthen the lookback period (for example 10 minutes) while handling duplicates"
   },
   {
    "id": "c2",
    "text": "None: the 5-minute window always covers everything"
   },
   {
    "id": "c3",
    "text": "Alerts are duplicated; you must reduce the period to 1 minute"
   },
   {
    "id": "c4",
    "text": "The rule is rejected by Sentinel"
   }
  ]
 },
 "sen-005": {
  "title": "Poorly configured brute force rule",
  "objective": "Spot the configuration line that creates a blind spot.",
  "statement": "This rule must detect a brute force on `SigninLogs`. Given the ingestion delay, **spot the faulty line** and choose the fix.",
  "hints": [
   "What gap is there between the frequency and the lookback period?",
   "A margin covers the late events."
  ],
  "explanation": "With a period equal to the frequency, late events escape the rule. An extra margin of 5 minutes, with grouping into incidents to avoid noise, is a common compromise.",
  "commonMistakes": [
   "Reducing the period to \"go faster\"."
  ],
  "lines": [
   {
    "id": "l1",
    "text": "Name: Entra ID brute force"
   },
   {
    "id": "l2",
    "text": "Run frequency: 5 minutes"
   },
   {
    "id": "l3",
    "text": "Lookback period: 5 minutes",
    "faulty": {
     "remedies": [
      {
       "id": "r3-1",
       "text": "Lookback period: 10 minutes"
      },
      {
       "id": "r3-2",
       "text": "Lookback period: 1 minute"
      },
      {
       "id": "r3-3",
       "text": "Frequency: 14 days"
      }
     ]
    }
   },
   {
    "id": "l4",
    "text": "Threshold: more than 20 failures per IP address"
   },
   {
    "id": "l5",
    "text": "Grouping alerts into incidents: enabled"
   }
  ]
 },
 "sen-006": {
  "title": "Rule: brute force by IP address",
  "objective": "Write the query of a scheduled brute force rule.",
  "statement": "Write the query of a rule that returns, for `SigninLogs`, the IP addresses (`IPAddress`) with **at least 20 failures** (`ResultType != \"0\"`), with the columns `IPAddress` and `Echecs`.",
  "hints": [
   "Filter the failures, then group by address.",
   "The threshold applies after the `summarize`."
  ],
  "explanation": "A scheduled rule returns one row per entity to flag. Here the IP address will become an IP address entity in the incident.",
  "commonMistakes": [
   "Placing the threshold before the `summarize`.",
   "Forgetting to restrict to failures."
  ]
 },
 "sen-007": {
  "title": "Rule: deleting a diagnostic setting",
  "objective": "Detect an attempt to evade logging.",
  "statement": "In `AzureActivity`, return the deletions of diagnostic settings (`OperationNameValue` containing `DIAGNOSTICSETTINGS/DELETE`) with `TimeGenerated`, `Caller`, `ResourceGroup` and `OperationNameValue`.",
  "hints": [
   "Filter on the operation with `has`.",
   "Keep only the four requested columns."
  ],
  "explanation": "This simple detection is very useful: an attacker who cuts logging is trying to hide their following actions.",
  "commonMistakes": [
   "Looking for WRITE instead of DELETE."
  ]
 },
 "sen-008": {
  "title": "Automation rule or playbook?",
  "objective": "Choose the suitable automation tool.",
  "statement": "Place each action in the most suitable tool.",
  "hints": [
   "Automation rules work on the incident itself.",
   "As soon as an external system is involved, think playbook."
  ],
  "explanation": "An automation rule can also launch a playbook: it serves as the trigger, the playbook does the complex work.",
  "commonMistakes": [
   "Creating a playbook for a simple assignment."
  ],
  "items": [
   {
    "id": "e1",
    "text": "Assign the incident to the tier 1 team"
   },
   {
    "id": "e2",
    "text": "Add a tag according to the rule name"
   },
   {
    "id": "e3",
    "text": "Change the severity of the incidents of a test environment"
   },
   {
    "id": "e4",
    "text": "Query an external reputation API and comment on the incident"
   },
   {
    "id": "e5",
    "text": "Send a message in a team channel with an approval button"
   },
   {
    "id": "e6",
    "text": "Disable an account after approval"
   }
  ],
  "zones": [
   {
    "id": "rule",
    "label": "Automation rule",
    "description": "Simple actions on incidents"
   },
   {
    "id": "pb",
    "label": "Playbook",
    "description": "Logic Apps flow"
   }
  ]
 },
 "sen-009": {
  "title": "Trigger of an automation rule",
  "objective": "Prefer the incident trigger.",
  "statement": "Which trigger is recommended for an automation rule and why?",
  "hints": [
   "Alerts are grouped into incidents.",
   "The incident carries more context."
  ],
  "explanation": "The incident trigger is preferred: the rule sees the grouped context and can modify the incident. The alert trigger remains useful for specific cases.",
  "commonMistakes": [
   "Triggering on every alert and multiplying the actions."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "Incident creation: the incident groups the alerts and offers more actions"
   },
   {
    "id": "c2",
    "text": "Alert creation: always preferable"
   },
   {
    "id": "c3",
    "text": "Deleting a table"
   },
   {
    "id": "c4",
    "text": "None, everything must be automated through playbooks"
   }
  ]
 },
 "sen-010": {
  "title": "Temporary muting",
  "objective": "Use the expiration date of an automation rule.",
  "statement": "A server is under maintenance until Friday and generates noisy incidents. How do you avoid losing the detection after Friday?",
  "hints": [
   "An automation rule can expire.",
   "Disabling the detection is risky if you forget to re-enable it."
  ],
  "explanation": "The expiration date prevents a temporary exception from becoming permanent. Automation rules run in the defined order, which lets you place the exception before the others.",
  "commonMistakes": [
   "Disabling a detection without a return date."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "Create an automation rule that closes these incidents with an expiration date on Friday"
   },
   {
    "id": "c2",
    "text": "Disable the analytics rule with no time limit"
   },
   {
    "id": "c3",
    "text": "Delete the analytics rule"
   },
   {
    "id": "c4",
    "text": "Manually ignore the incidents until the end of the month"
   }
  ]
 },
 "sen-011": {
  "title": "Watchlists: facts and limits",
  "objective": "Match facts about watchlists.",
  "statement": "Match each element of Sentinel watchlists to its description.",
  "hints": [
   "Think about the join key.",
   "It is not a telemetry store."
  ],
  "explanation": "Watchlists enrich queries with reference data. They do not replace a telemetry table.",
  "commonMistakes": [
   "Loading high-volume telemetry into one."
  ],
  "items": [
   {
    "id": "m1",
    "text": "_GetWatchlist('alias')"
   },
   {
    "id": "m2",
    "text": "SearchKey"
   },
   {
    "id": "m3",
    "text": "Recommended use"
   },
   {
    "id": "m4",
    "text": "Maximum size"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "KQL function that returns the content of a watchlist"
   },
   {
    "id": "p2",
    "text": "Column used to optimize joins with the list"
   },
   {
    "id": "p3",
    "text": "Reference data (VIPs, critical assets, known IP ranges)"
   },
   {
    "id": "p4",
    "text": "Up to 10 million items"
   }
  ]
 },
 "sen-012": {
  "title": "Join with a VIP list",
  "objective": "Fix a join with a watchlist.",
  "statement": "This query must find the failed sign-ins of accounts present in the `VIP` list. **Spot the faulty line.**",
  "hints": [
   "You want the accounts that are in the list.",
   "The negation returns the other accounts."
  ],
  "explanation": "`!in` returns the accounts absent from the list, which is the opposite of the need. `in (vip)` keeps the VIPs.",
  "commonMistakes": [
   "Swapping `in` and `!in`."
  ],
  "lines": [
   {
    "id": "l1",
    "text": "let vip = _GetWatchlist('VIP') | project SearchKey;"
   },
   {
    "id": "l2",
    "text": "SigninLogs"
   },
   {
    "id": "l3",
    "text": "| where UserPrincipalName !in (vip)",
    "faulty": {
     "remedies": [
      {
       "id": "r3-1",
       "text": "| where UserPrincipalName in (vip)"
      },
      {
       "id": "r3-2",
       "text": "| where UserPrincipalName == vip"
      },
      {
       "id": "r3-3",
       "text": "| where UserPrincipalName has \"vip\""
      }
     ]
    }
   },
   {
    "id": "l4",
    "text": "| where ResultType != \"0\""
   },
   {
    "id": "l5",
    "text": "| project TimeGenerated, UserPrincipalName, IPAddress, ResultType"
   }
  ]
 },
 "sen-013": {
  "title": "When to use a watchlist",
  "objective": "Recognize a good use case.",
  "statement": "Which of these needs suits a watchlist?",
  "hints": [
   "Think reference data.",
   "A list is not designed for telemetry volume."
  ],
  "explanation": "Watchlists are for enriching or filtering: VIPs, critical assets, allowed addresses. They refresh on a schedule and do not replace the log tables.",
  "commonMistakes": [
   "Using a list as a database."
  ],
  "choices": [
   {
    "id": "c1",
    "text": "A list of 300 VIP accounts to watch more closely"
   },
   {
    "id": "c2",
    "text": "Storing millions of firewall log rows every day"
   },
   {
    "id": "c3",
    "text": "Replacing the Log Analytics workspace"
   },
   {
    "id": "c4",
    "text": "Archiving closed incidents"
   }
  ]
 },
 "sen-014": {
  "title": "Rule: silent machines",
  "objective": "Detect the sources that stopped logging.",
  "statement": "In `Heartbeat`, return the machines (`Computer`) whose **last heartbeat** is older than **30 minutes**, with `Computer` and `DernierePulsation`.",
  "hints": [
   "Summarize per machine first.",
   "Then compare the date to `ago(30m)`."
  ],
  "explanation": "A silent source is a blind spot: it may be down or have been disabled by an attacker. You filter after the `summarize`, otherwise you would lose the silent machines.",
  "commonMistakes": [
   "Filtering before the summary.",
   "Reversing the comparison."
  ]
 },
 "sen-015": {
  "title": "Defender portal: the time column",
  "objective": "Distinguish the Log Analytics and Advanced Hunting schemas.",
  "statement": "This Advanced Hunting (Defender XDR) query fails: it uses a column from the other context. **Spot the faulty line.**",
  "hints": [
   "Defender XDR tables do not have the same time column as Log Analytics.",
   "The last line hints at it."
  ],
  "explanation": "In the Advanced Hunting tables, the time column is `Timestamp`. In Log Analytics and Sentinel, it is `TimeGenerated`. The Defender portal shows both contexts, so you need to know which table you are querying.",
  "commonMistakes": [
   "Using TimeGenerated on a Defender XDR table."
  ],
  "lines": [
   {
    "id": "l1",
    "text": "DeviceProcessEvents"
   },
   {
    "id": "l2",
    "text": "| where TimeGenerated > ago(1d)",
    "faulty": {
     "remedies": [
      {
       "id": "r2-1",
       "text": "| where Timestamp > ago(1d)"
      },
      {
       "id": "r2-2",
       "text": "| where TimeGenerated < ago(1d)"
      },
      {
       "id": "r2-3",
       "text": "| where Time > ago(1d)"
      }
     ]
    }
   },
   {
    "id": "l3",
    "text": "| where FileName =~ \"powershell.exe\""
   },
   {
    "id": "l4",
    "text": "| project Timestamp, DeviceName, ProcessCommandLine"
   }
  ]
 },
 "sen-016": {
  "title": "Triaging an incident",
  "objective": "Order a triage approach.",
  "statement": "Put a reasonable approach to triaging a Sentinel incident in order.",
  "hints": [
   "Understand before deciding.",
   "Closing is the last step."
  ],
  "explanation": "A good triage goes from the overview to the evidence, then to the documented decision. The closing classification feeds the improvement of the rules.",
  "commonMistakes": [
   "Closing without a classification.",
   "Deciding before establishing the timeline."
  ],
  "items": [
   {
    "id": "o1",
    "text": "Read the severity, tactics and grouped alerts"
   },
   {
    "id": "o2",
    "text": "Examine the entities (accounts, IP addresses, machines)"
   },
   {
    "id": "o3",
    "text": "Query the logs to establish the timeline"
   },
   {
    "id": "o4",
    "text": "Decide whether the activity is malicious"
   },
   {
    "id": "o5",
    "text": "Apply the response then close with the right classification"
   }
  ]
 },
 "sen-017": {
  "title": "Classifying an incident closure",
  "objective": "Choose the right closing classification.",
  "statement": "Match each situation to the appropriate closing classification.",
  "hints": [
   "An authorized test is real but harmless.",
   "A false positive comes from a flaw in the rule."
  ],
  "explanation": "These classifications guide tuning: too many false positives signal a rule to fix, benign positives call for a documented exception.",
  "commonMistakes": [
   "Classifying as a false positive what is a benign positive."
  ],
  "items": [
   {
    "id": "m1",
    "text": "The successful spray compromised the user l.bouchard"
   },
   {
    "id": "m2",
    "text": "A planned penetration test triggered the rule"
   },
   {
    "id": "m3",
    "text": "The rule fired because of a logic error in the query"
   },
   {
    "id": "m4",
    "text": "The evidence does not allow a conclusion"
   }
  ],
  "options": [
   {
    "id": "p1",
    "text": "True positive"
   },
   {
    "id": "p2",
    "text": "Benign positive"
   },
   {
    "id": "p3",
    "text": "False positive"
   },
   {
    "id": "p4",
    "text": "Undetermined"
   }
  ]
 },
 "sen-018": {
  "title": "Assessment: scheduled rule to fix",
  "objective": "Fix two logic flaws in a detection rule.",
  "statement": "This rule should detect the successful sign-ins of VIPs from an address that carried out a spray. **Spot the two faulty lines.**",
  "hints": [
   "You are looking for successes.",
   "You are looking for VIP accounts."
  ],
  "explanation": "The `!= \"0\"` filter selects the failures whereas the detection targets the successes, and `!in` excludes the VIPs instead of keeping them.",
  "commonMistakes": [
   "Fixing only one of the two errors."
  ],
  "lines": [
   {
    "id": "l1",
    "text": "let vip = _GetWatchlist('VIP') | project SearchKey;"
   },
   {
    "id": "l2",
    "text": "let sources = SigninLogs | where ResultType == \"50126\" | summarize Comptes = dcount(UserPrincipalName) by IPAddress | where Comptes > 10 | project IPAddress;"
   },
   {
    "id": "l3",
    "text": "SigninLogs"
   },
   {
    "id": "l4",
    "text": "| where ResultType != \"0\"",
    "faulty": {
     "remedies": [
      {
       "id": "r4-1",
       "text": "| where ResultType == \"0\""
      },
      {
       "id": "r4-2",
       "text": "| where ResultType == \"50126\""
      },
      {
       "id": "r4-3",
       "text": "| where ResultType > 0"
      }
     ]
    }
   },
   {
    "id": "l5",
    "text": "| where IPAddress in (sources)"
   },
   {
    "id": "l6",
    "text": "| where UserPrincipalName !in (vip)",
    "faulty": {
     "remedies": [
      {
       "id": "r6-1",
       "text": "| where UserPrincipalName in (vip)"
      },
      {
       "id": "r6-2",
       "text": "| where UserPrincipalName == \"vip\""
      },
      {
       "id": "r6-3",
       "text": "| where UserPrincipalName has_any (vip)"
      }
     ]
    }
   },
   {
    "id": "l7",
    "text": "| project TimeGenerated, UserPrincipalName, IPAddress"
   }
  ]
 }
};
