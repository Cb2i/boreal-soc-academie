import type { Overlay } from './types.ts';

// Traduction anglaise (overlay). Les blocs de code et les identifiants restent identiques au français.
export const enExSoc: Record<string, Overlay> = {
 "soc-001": {
  "title": "Encoded PowerShell",
  "objective": "Spot an encoded PowerShell command line.",
  "statement": "In `DeviceProcessEvents`, return the executions of `powershell.exe` whose command line contains `-enc` or `-EncodedCommand`. Columns: `Timestamp`, `DeviceName`, `ProcessCommandLine`, `InitiatingProcessFileName`.",
  "hints": [
   "`has_any` tests several terms at once.",
   "Compare the file name without case sensitivity."
  ],
  "explanation": "Base64-encoded PowerShell is common among attackers **and** among some legitimate administration tools (for example the management client). The parent process (`InitiatingProcessFileName`) is often what separates the legitimate from the suspicious.",
  "commonMistakes": [
   "Concluding a compromise without looking at the parent process.",
   "Comparing with `==`: the name may be in uppercase depending on the source."
  ]
 },
 "soc-002": {
  "title": "Investigation: does a password spray succeed?",
  "objective": "Confirm a spray, identify the affected account and choose the first response.",
  "statement": "A detection rule flags a burst of failures from `203.0.113.45`. You triage the incident: is the spray real, is an account compromised, and what do you do first?",
  "hints": [
   "A spray hits many accounts with few attempts each.",
   "Check whether the same address also has a success."
  ],
  "explanation": "The approach: measure the scale, look for the success, contain the affected account, then widen. Blocking the address alone does not repair an account that is already compromised.",
  "commonMistakes": [
   "Settling for blocking the IP address.",
   "Not looking for a success among the failures."
  ],
  "scenario": "Alert \"Sign-in failures from a single address\" on the Nordlys tenant. The data is in `SigninLogs`. Code `50126` means \"invalid username or password\".",
  "steps": [
   {
    "id": "s1",
    "prompt": "How many distinct accounts did this address target with code `50126`?",
    "explanation": "Fourteen accounts for 28 failures: about two attempts per account. This is the signature of a spray, which avoids lockout by limiting the attempts per account.",
    "evidence": [
     {
      "title": "Address activity by result code"
     }
    ]
   },
   {
    "id": "s2",
    "prompt": "Write the query that returns the **successful** sign-ins from this address, with `TimeGenerated`, `UserPrincipalName`, `AppDisplayName` and `Location`.",
    "explanation": "A single successful sign-in, at 02:43:12 UTC, to Exchange Online, from Russia: a success after a spray means a password was guessed."
   },
   {
    "id": "s3",
    "prompt": "Which account is probably compromised?",
    "explanation": "The success concerns l.bouchard. s.roy was also targeted by the spray but without a success from this address. svc-backup2 does not exist yet at that moment.",
    "choices": [
     {
      "id": "c1",
      "text": "s.roy@nordlys.example"
     },
     {
      "id": "c2",
      "text": "l.bouchard@nordlys.example"
     },
     {
      "id": "c3",
      "text": "c.tremblay@nordlys.example"
     },
     {
      "id": "c4",
      "text": "svc-backup2@nordlys.example"
     }
    ]
   },
   {
    "id": "s4",
    "prompt": "What is the best first containment action?",
    "explanation": "You must cut off the attacker's access (password, sessions) and check what they did next. Deleting the account destroys evidence; blocking the address alone leaves the sessions active.",
    "choices": [
     {
      "id": "c1",
      "text": "Only block the IP address and close the incident"
     },
     {
      "id": "c2",
      "text": "Reset l.bouchard's password, revoke their sessions and review their activity after 02:43"
     },
     {
      "id": "c3",
      "text": "Delete the l.bouchard account"
     },
     {
      "id": "c4",
      "text": "Wait for a second alert before acting"
     }
    ]
   }
  ]
 },
 "soc-003": {
  "title": "Investigation: the attacker grants themselves privileges",
  "objective": "Follow the privilege escalation in AuditLogs then in AzureActivity.",
  "statement": "The `l.bouchard` account is compromised. You look for what it modified in Entra ID and then what followed in Azure.",
  "hints": [
   "AuditLogs: `InitiatedBy` is a dynamic object, `has` works well on it.",
   "Link the two sources with the attacker's IP address."
  ],
  "explanation": "The attacker creates a discreet service account, gives it the Global Administrator role, tries to elevate their own account, then acts on the Azure resources from the same address.",
  "commonMistakes": [
   "Only looking at SigninLogs.",
   "Forgetting the failed attempt, which indicates intent."
  ],
  "scenario": "Directory operations are in `AuditLogs`, Azure operations in `AzureActivity`. The attacker's address is `203.0.113.45`.",
  "steps": [
   {
    "id": "s1",
    "prompt": "List the directory operations initiated by `l.bouchard`: `TimeGenerated`, `OperationName` and `Result`.",
    "explanation": "Three operations: creation of an account, addition of that account to a role, then an attempt to add l.bouchard themselves to a role, which fails."
   },
   {
    "id": "s2",
    "prompt": "Which role did the new account `svc-backup2` receive?",
    "explanation": "Global Administrator is the most powerful role in the tenant. A \"backup\" account created a few minutes after a compromise and elevated to this role is a strong persistence signal.",
    "choices": [
     {
      "id": "c1",
      "text": "Reader"
     },
     {
      "id": "c2",
      "text": "Contributor"
     },
     {
      "id": "c3",
      "text": "Global Administrator"
     },
     {
      "id": "c4",
      "text": "Security Reader"
     }
    ],
    "evidence": [
     {
      "title": "Role addition detail"
     }
    ]
   },
   {
    "id": "s3",
    "prompt": "Which operation **failed**, and what does it reveal?",
    "explanation": "The failed attempt shows the intent to elevate the stolen account. A failure is information: it indicates what the attacker wanted to do and what the protection stopped.",
    "choices": [
     {
      "id": "c1",
      "text": "An addition of l.bouchard to the Privileged Role Administrator role: the attacker was trying to elevate themselves"
     },
     {
      "id": "c2",
      "text": "A deletion of svc-backup2: the attacker was erasing their tracks"
     },
     {
      "id": "c3",
      "text": "A password reset: the administrator was reacting"
     },
     {
      "id": "c4",
      "text": "A change of the workspace region"
     }
    ]
   },
   {
    "id": "s4",
    "prompt": "List the Azure operations made from the attacker's address: `TimeGenerated`, `OperationNameValue` and `ResourceGroup`.",
    "explanation": "The same address acts in Azure: role assignment, four virtual machine writes in rg-prod, then deletion of a diagnostic setting in rg-sec. The address links the two sources."
   },
   {
    "id": "s5",
    "prompt": "Which containment and remediation actions are appropriate? Several answers.",
    "explanation": "You cut the accesses created by the attacker, examine their infrastructure changes and restore logging. Deleting the workspace would destroy the evidence.",
    "choices": [
     {
      "id": "c1",
      "text": "Disable svc-backup2 and remove its Global Administrator role"
     },
     {
      "id": "c2",
      "text": "Revoke l.bouchard's sessions and reset their password"
     },
     {
      "id": "c3",
      "text": "Examine the virtual machines written in rg-prod"
     },
     {
      "id": "c4",
      "text": "Restore the diagnostic setting deleted in rg-sec"
     },
     {
      "id": "c5",
      "text": "Delete the Log Analytics workspace to start from scratch"
     }
    ]
   }
  ]
 },
 "soc-004": {
  "title": "Investigation: RDP brute force on the file server",
  "objective": "Qualify a successful RDP brute force and its aftermath on Windows.",
  "statement": "An alert reports many sign-in failures on `SRV-FILE01`. You determine whether the attack succeeded and what followed.",
  "hints": [
   "Compare the time of the success to that of the failures.",
   "Look at the account management events on the same machine."
  ],
  "explanation": "A brute force followed by a success, then by the creation of an account and its addition to a local group, is a classic persistence sequence.",
  "commonMistakes": [
   "Stopping at the number of failures.",
   "Ignoring events 4720 and 4732."
  ],
  "scenario": "The Windows events are in `SecurityEvent`: 4625 sign-in failure, 4624 success, 4672 special privileges, 4720 account creation, 4732 addition to a local group.",
  "steps": [
   {
    "id": "s1",
    "prompt": "How many failures (4625) come from `198.51.100.23` on `SRV-FILE01`?",
    "explanation": "Sixty failures from a single address: a classic brute force, not a user's password mistake."
   },
   {
    "id": "s2",
    "prompt": "Return the successful sign-ins (4624) from this address on `SRV-FILE01`: `TimeGenerated`, `Account`, `IpAddress`.",
    "explanation": "A success exists after the failures: the attack succeeded. The time of the success, compared to the last failure, confirms it."
   },
   {
    "id": "s3",
    "prompt": "Return the account creations (4720) and additions to a local group (4732) on `SRV-FILE01`: `TimeGenerated`, `EventID`, `Account`.",
    "explanation": "Two events two minutes apart, performed by the Administrator account: an account is created then added to a local group. This is persistence."
   },
   {
    "id": "s4",
    "prompt": "What conclusion and which action do you prioritize?",
    "explanation": "A success after a brute force plus the creation of a local privileged account is a compromise. You must also fix the RDP exposure (see the lesson on Bastion and NSGs).",
    "choices": [
     {
      "id": "c1",
      "text": "Confirmed compromise: isolate the server, disable the new account, reset the local credentials and close the RDP exposure"
     },
     {
      "id": "c2",
      "text": "False positive: a scheduled administration task"
     },
     {
      "id": "c3",
      "text": "Harmless noise: close the incident"
     },
     {
      "id": "c4",
      "text": "Restart the server and monitor"
     }
    ]
   }
  ]
 },
 "soc-005": {
  "title": "Investigation: SSH dictionary attack on a Linux server",
  "objective": "Read Syslog logs and conclude a root compromise.",
  "statement": "Massive SSH attempts target `LNX-APP01`. You establish whether the attacker got in and under which account.",
  "hints": [
   "The failure messages contain `Failed password`.",
   "A success contains `Accepted password`."
  ],
  "explanation": "Forty-two failures then an accepted authentication for root: a remote root access by password succeeded.",
  "commonMistakes": [
   "Forgetting to look for the success message.",
   "Not noting that root accepts a password over SSH."
  ],
  "scenario": "The sshd logs are in `Syslog` (`Computer`, `ProcessName`, `SyslogMessage`). The suspicious address is `203.0.113.99`.",
  "steps": [
   {
    "id": "s1",
    "prompt": "How many `Failed password` messages mention `203.0.113.99` on `LNX-APP01`?",
    "explanation": "Forty-two failed attempts: a password dictionary attack."
   },
   {
    "id": "s2",
    "prompt": "Return the accepted authentications on this machine: `TimeGenerated`, `Computer`, `SyslogMessage`.",
    "explanation": "A message \"Accepted password for root from 203.0.113.99\" at 01:26:03: the attacker got in with the root account."
   },
   {
    "id": "s3",
    "prompt": "Which measures are relevant? Several answers.",
    "explanation": "You contain, preserve the evidence and fix the cause: direct exposure and weak authentication. The time of an access does not make it legitimate.",
    "choices": [
     {
      "id": "c1",
      "text": "Isolate the machine and keep a copy for analysis"
     },
     {
      "id": "c2",
      "text": "Disable direct SSH login for root and password authentication"
     },
     {
      "id": "c3",
      "text": "Restrict SSH access to a managed jump point"
     },
     {
      "id": "c4",
      "text": "Ignore: the access only took place outside office hours"
     }
    ]
   }
  ]
 },
 "soc-006": {
  "title": "Investigation: large outbound transfer",
  "objective": "Quantify an exfiltration from firewall logs.",
  "statement": "An alert about an abnormal outbound volume on the firewall reaches you. You measure the transfer, identify the source and destination, and decide on the next steps.",
  "hints": [
   "Summarize by source and destination.",
   "Observe the evolution of the volume over time."
  ],
  "explanation": "Twelve increasingly large transfers to the same destination, from a single internal workstation: the profile of an organized transfer, not a one-off upload.",
  "commonMistakes": [
   "Looking at a single event instead of the trend.",
   "Not identifying the internal source."
  ],
  "scenario": "The firewall logs are in `CommonSecurityLog` (`SourceIP`, `DestinationIP`, `SentBytes`, `DeviceAction`). The suspicious destination is `203.0.113.200`.",
  "steps": [
   {
    "id": "s1",
    "prompt": "What is the largest `SentBytes` value to `203.0.113.200`?",
    "explanation": "About 43 million bytes in a single transfer, and the volumes increase with each attempt."
   },
   {
    "id": "s2",
    "prompt": "Return, per source address, the number of transfers (`Transferts`) and the total volume (`Total`) to `203.0.113.200`.",
    "explanation": "A single internal source, 10.20.1.15, performed twelve transfers for about 439 MB in total."
   },
   {
    "id": "s3",
    "prompt": "Which reading is the most defensible?",
    "explanation": "Regularity, growth and the uniqueness of the destination are clues. You must confirm by examining the source workstation and the nature of the data before concluding.",
    "choices": [
     {
      "id": "c1",
      "text": "Regular and growing transfers to a single external destination: probable exfiltration, to be confirmed on the source workstation"
     },
     {
      "id": "c2",
      "text": "Usual nightly backup with no stakes"
     },
     {
      "id": "c3",
      "text": "Operating system update"
     },
     {
      "id": "c4",
      "text": "Normal web browsing traffic"
     }
    ]
   },
   {
    "id": "s4",
    "prompt": "What do you do next? Several answers.",
    "explanation": "You contain the source, cut the destination and look for the extent. In the Nordlys data, the same destination also appears in a phishing incident: see the next investigation.",
    "choices": [
     {
      "id": "c1",
      "text": "Identify the workstation 10.20.1.15 and isolate it"
     },
     {
      "id": "c2",
      "text": "Block 203.0.113.200 at the firewall"
     },
     {
      "id": "c3",
      "text": "Search for other hosts that contacted 203.0.113.200"
     },
     {
      "id": "c4",
      "text": "Wait for the next monthly report cycle"
     }
    ]
   }
  ]
 },
 "soc-007": {
  "title": "Investigation: phishing and encoded PowerShell",
  "objective": "Link email, process and network in Defender XDR.",
  "statement": "Emails from the host `n0rdlys-login.example` were blocked, but a workstation runs encoded PowerShell launched by Word. You reconstruct the chain.",
  "hints": [
   "A child process of WINWORD.EXE is rarely legitimate.",
   "Join by `DeviceName` and time."
  ],
  "explanation": "The phishing email was blocked for two recipients, but a document reached a workstation (by another path) and launched PowerShell, which contacts an external domain.",
  "commonMistakes": [
   "Concluding that blocking the email settles everything.",
   "Confusing the legitimate PowerShell of ccmexec.exe with that of Word."
  ],
  "scenario": "Defender XDR context (Advanced Hunting): `EmailEvents`, `DeviceProcessEvents`, `DeviceNetworkEvents`. The time column is `Timestamp`.",
  "steps": [
   {
    "id": "s1",
    "prompt": "How many emails from `n0rdlys-login.example` were blocked as phishing?",
    "explanation": "Two blocked emails, targeting executives. The block is a success of the protection, but says nothing about the rest."
   },
   {
    "id": "s2",
    "prompt": "Find the PowerShell processes launched by `WINWORD.EXE`: `Timestamp`, `DeviceName`, `AccountName`, `ProcessCommandLine`.",
    "explanation": "A single result: hidden PowerShell (`-w hidden`), without profile (`-nop`), with an encoded command (`-enc`), launched by Word on PC-017."
   },
   {
    "id": "s3",
    "prompt": "Which network connection did PowerShell establish afterwards? Return `Timestamp`, `DeviceName`, `RemoteUrl` and `RemoteIP` for the URL containing `exfil-demo`.",
    "explanation": "One minute after the launch, PowerShell contacts `cdn.exfil-demo.example`, whose address is 203.0.113.200, the same as the destination of the large transfer seen in the previous investigation."
   },
   {
    "id": "s4",
    "prompt": "Another workstation, PC-003, also runs encoded PowerShell, but launched by `ccmexec.exe`. What do you conclude?",
    "explanation": "Context distinguishes the two cases: a configuration management parent is expected, a Word parent is not. You still confirm, without presuming.",
    "choices": [
     {
      "id": "c1",
      "text": "Probably legitimate (configuration management agent), to be confirmed with the script owner, unlike PC-017"
     },
     {
      "id": "c2",
      "text": "Compromised in the same way as PC-017"
     },
     {
      "id": "c3",
      "text": "Unimportant because PowerShell is always legitimate"
     },
     {
      "id": "c4",
      "text": "The whole fleet must be isolated"
     }
    ]
   },
   {
    "id": "s5",
    "prompt": "Which actions are appropriate? Several answers.",
    "explanation": "You contain the workstation, cut the outbound communication and protect the credentials. Disabling PowerShell everywhere is disproportionate and breaks legitimate administration.",
    "choices": [
     {
      "id": "c1",
      "text": "Isolate PC-017 through the detection platform"
     },
     {
      "id": "c2",
      "text": "Block the destination domain and address"
     },
     {
      "id": "c3",
      "text": "Reset the credentials of the workstation's user"
     },
     {
      "id": "c4",
      "text": "Immediately disable PowerShell across the whole fleet"
     }
    ]
   }
  ]
 },
 "soc-008": {
  "title": "Investigation: impossible travel of s.roy",
  "objective": "Qualify an impossible travel alert without jumping to conclusions.",
  "statement": "An alert reports two sign-ins by `s.roy` from two countries in a short time. You check the facts before concluding.",
  "hints": [
   "Look for sign-ins outside Canada.",
   "A VPN or a proxy can explain unexpected countries."
  ],
  "explanation": "An impossible travel alert is a signal, not a verdict. You look for corroborating elements before containing.",
  "commonMistakes": [
   "Concluding a compromise without corroboration.",
   "Ignoring the failed attempts tied to the same user."
  ],
  "scenario": "Source: `SigninLogs`. The user usually signs in from Canada.",
  "steps": [
   {
    "id": "s1",
    "prompt": "Return the sign-ins of `s.roy@nordlys.example` from outside Canada: `TimeGenerated`, `IPAddress`, `Location`, `ResultType`.",
    "explanation": "Three rows: two failures from Russia (the spray address, on March 10) and a success from Brazil on March 11 at 14:40 UTC, 35 minutes after a Canadian sign-in."
   },
   {
    "id": "s2",
    "prompt": "How many distinct countries do we see for this user (without a filter)?",
    "explanation": "Three countries: Canada, Russia, Brazil. Canada is the user's norm."
   },
   {
    "id": "s3",
    "prompt": "What is the best next step?",
    "explanation": "Corroborate first: a 35-minute move is physically impossible, but a corporate VPN can explain it. Containment follows if the explanation is missing.",
    "choices": [
     {
      "id": "c1",
      "text": "Check with the user (VPN, travel, device), examine the detail of the Brazilian session and contain if nothing explains it"
     },
     {
      "id": "c2",
      "text": "Close as a false positive without checking"
     },
     {
      "id": "c3",
      "text": "Delete the account immediately"
     },
     {
      "id": "c4",
      "text": "Block all of Brazil for all users"
     }
    ]
   }
  ]
 },
 "soc-009": {
  "title": "Final mission: the Nordlys incident end to end",
  "objective": "Reconstruct a complete incident: initial access, privileges, impact, exfiltration, response.",
  "statement": "Final mission. The March 10 incident at Nordlys left traces in six sources. You reconstruct it and write the key decisions.",
  "hints": [
   "Follow the chronological order.",
   "Link the sources with the attacker's address and the created account."
  ],
  "explanation": "The chain: spray, compromise of an account, persistence through a privileged account, actions in Azure, disabling of logging, then exfiltration. Each link could have been detected.",
  "commonMistakes": [
   "Treating each alert as a separate incident.",
   "Closing the incident after containing the first account."
  ],
  "scenario": "You have `SigninLogs`, `AuditLogs`, `AzureActivity` and `CommonSecurityLog`. Times are in UTC. The first sign is a successful Russian sign-in.",
  "steps": [
   {
    "id": "s1",
    "prompt": "What is the attacker's first successful sign-in (address 203.0.113.45)? Return `TimeGenerated` and `UserPrincipalName`.",
    "explanation": "l.bouchard at 02:43:12: this is the initial access."
   },
   {
    "id": "s2",
    "prompt": "In AzureActivity, how many distinct operations (`OperationNameValue`) did `svc-backup2` perform?",
    "explanation": "Three types of operations: role assignment, virtual machine writes, deletion of a diagnostic setting."
   },
   {
    "id": "s3",
    "prompt": "Which action was used to reduce the security team's visibility?",
    "explanation": "Deleting the diagnostic setting is a defense evasion: it cuts the sending of logs from the targeted resource.",
    "choices": [
     {
      "id": "c1",
      "text": "The deletion of a diagnostic setting in rg-sec"
     },
     {
      "id": "c2",
      "text": "The writing of virtual machines in rg-prod"
     },
     {
      "id": "c3",
      "text": "The addition of a user in the directory"
     },
     {
      "id": "c4",
      "text": "The sign-in from Russia"
     }
    ]
   },
   {
    "id": "s4",
    "prompt": "What is the maximum volume of a transfer to `203.0.113.200`?",
    "explanation": "About 43 million bytes in one transfer, with a growing trend."
   },
   {
    "id": "s5",
    "prompt": "Classify the incident at closure.",
    "explanation": "Compromise of an account, privilege escalation, impact on the infrastructure and exfiltration: a true positive, to be documented to improve the detections.",
    "choices": [
     {
      "id": "c1",
      "text": "False positive"
     },
     {
      "id": "c2",
      "text": "Benign positive"
     },
     {
      "id": "c3",
      "text": "True positive"
     },
     {
      "id": "c4",
      "text": "Undetermined"
     }
    ]
   },
   {
    "id": "s6",
    "prompt": "Which detections would you add to cut the chain earlier? Several answers.",
    "explanation": "Each link has a targeted low-noise detection. Alerting on every individual failure would drown the team without helping.",
    "choices": [
     {
      "id": "c1",
      "text": "A sign-in success from an address that failed on many accounts"
     },
     {
      "id": "c2",
      "text": "A Global Administrator role assignment outside a PIM activation"
     },
     {
      "id": "c3",
      "text": "The deletion of a diagnostic setting"
     },
     {
      "id": "c4",
      "text": "A growing outbound volume to a rare destination"
     },
     {
      "id": "c5",
      "text": "An alert for every individual sign-in failure"
     }
    ]
   }
  ]
 }
};
