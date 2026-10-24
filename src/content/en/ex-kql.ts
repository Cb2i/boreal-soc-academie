import type { Overlay } from './types.ts';

// Traduction anglaise (overlay). Les blocs de code et les identifiants restent identiques au français.
export const enExKql: Record<string, Overlay> = {
 "kql-001": {
  "title": "Failed sign-ins",
  "objective": "Filter a table with where on an exact value.",
  "statement": "In `SigninLogs`, the `ResultType` column is `\"0\"` for a successful sign-in. Write a query that returns **all rows** whose sign-in failed, that is, whose `ResultType` is not `\"0\"`.",
  "hints": [
   "The \"not equal to\" operator is written `!=`.",
   "ResultType is a string: put the value in quotes."
  ],
  "explanation": "`where` keeps the rows for which the expression is true. `ResultType` is text, so `\"0\"` is written with quotes. `!=` excludes the successful sign-ins.",
  "commonMistakes": [
   "Using `=` instead of `==` or `!=`.",
   "Writing `ResultType != 0` without quotes while the column is text."
  ]
 },
 "kql-002": {
  "title": "How many sign-ins per account?",
  "objective": "Count rows per group with summarize count() by.",
  "statement": "Return the number of sign-ins (successful or not) **per account** (`UserPrincipalName`). Name the count column `Total`.",
  "hints": [
   "`summarize` groups the rows with `by`.",
   "`Total = count()` names the column."
  ],
  "explanation": "`summarize Total = count() by UserPrincipalName` produces one row per account with the number of rows in that group.",
  "commonMistakes": [
   "Forgetting `by`: the result becomes a single row.",
   "Naming the column something other than `Total`: the comparison is on column names."
  ]
 },
 "kql-003": {
  "title": "The three most targeted accounts",
  "objective": "Combine filter, aggregation and top.",
  "statement": "Among the **failed sign-ins** (`ResultType` different from `\"0\"`), find the 3 accounts with the most failures. Expected columns: `UserPrincipalName` and `Echecs`. The result must be sorted from the highest to the lowest number of failures.",
  "hints": [
   "Filter first with `where`, then count.",
   "`top 3 by Echecs desc` sorts and limits in a single step."
  ],
  "explanation": "Filtering early reduces the work of `summarize`. `top N by column desc` returns the N largest values, already sorted.",
  "commonMistakes": [
   "Using `take 5`: it does not sort.",
   "Counting all the sign-ins instead of only the failures."
  ],
  "check": {
   "rules": [
    {
     "message": "Filter before summarizing: `summarize` then processes fewer rows."
    }
   ]
  }
 },
 "kql-004": {
  "title": "Distinct IP addresses",
  "objective": "Count distinct values with dcount.",
  "statement": "How many **distinct** IP addresses (`IPAddress`) appear in `SigninLogs`? Return a single row with a column `IPDistinctes`.",
  "hints": [
   "`dcount()` counts distinct values.",
   "No `by`: we want a single total."
  ],
  "explanation": "`dcount` is an estimate in real KQL for large volumes. In this local engine, the calculation is exact.",
  "commonMistakes": [
   "Using `count()`: it counts rows, not distinct values."
  ]
 },
 "kql-005": {
  "title": "Last 24 hours",
  "objective": "Filter on a time window with ago().",
  "statement": "Return the failed sign-ins from the **last 24 hours** (`TimeGenerated`). The playground clock is simulated at 2026-03-12 12:00 UTC.",
  "hints": [
   "`ago(24h)` gives the moment 24 hours before now.",
   "Filter on the `TimeGenerated` column."
  ],
  "explanation": "Putting the time condition first is a good habit: in Log Analytics, it reduces the data read.",
  "commonMistakes": [
   "Writing a fixed date: the query no longer applies to new data."
  ],
  "check": {
   "rules": [
    {
     "message": "Use a relative time window (`ago`) rather than hard-coded dates."
    }
   ]
  }
 },
 "kql-006": {
  "title": "A Heartbeat sample",
  "objective": "Take a few rows with take to discover a table.",
  "statement": "You are discovering the `Heartbeat` table. Return **10 arbitrary rows** to see what it looks like.",
  "hints": [
   "`take` (or its synonym `limit`) takes a number of rows.",
   "No sorting is requested: the rows returned can be any rows."
  ],
  "explanation": "`take 10` returns 10 rows, but **with no guarantee of order**. It is perfect for exploring the schema, not for a detection rule: for reproducible results, you need to sort before limiting.",
  "commonMistakes": [
   "Using `take` thinking you get the most recent rows: that is not the case without `sort`.",
   "Forgetting the number: `take` requires a value."
  ]
 },
 "kql-007": {
  "title": "Keep only four columns",
  "objective": "Reduce the result to the useful columns with project.",
  "statement": "In `SigninLogs`, return only the columns `TimeGenerated`, `UserPrincipalName`, `IPAddress` and `ResultType` for **all** the rows.",
  "hints": [
   "`project` lists the columns to keep.",
   "Column names are separated by commas."
  ],
  "explanation": "`project` chooses (and orders) the columns of the result. Reducing columns early makes the query more readable and lightens the transfer of results.",
  "commonMistakes": [
   "Using `project-away` while listing the columns to keep: that operator removes what you give it.",
   "Forgetting a comma between two column names."
  ]
 },
 "kql-008": {
  "title": "Failed logons on the file server",
  "objective": "Combine two conditions with and.",
  "statement": "In `SecurityEvent`, return the **4625** events (Windows logon failure) that occurred on the **SRV-FILE01** computer.",
  "hints": [
   "`EventID` is an integer: no quotes.",
   "Two conditions combine with `and`, or with two chained `where`."
  ],
  "explanation": "Both conditions must be true. `EventID` is numeric (`== 4625`), `Computer` is text (`== \"SRV-FILE01\"`). Two successive `where` give exactly the same result.",
  "commonMistakes": [
   "Putting `4625` in quotes: the text/number comparison is useless and misleading.",
   "Writing the machine name in lowercase with `==`: the comparison is case-sensitive."
  ]
 },
 "kql-009": {
  "title": "Count the Windows failures",
  "objective": "Count the filtered rows and name the column.",
  "statement": "How many **4625** events does `SecurityEvent` contain in total? Return a single row with a column named `Echecs`.",
  "hints": [
   "`summarize` without `by` produces a single row.",
   "`Echecs = count()` names the output column."
  ],
  "explanation": "A `summarize` without a `by` clause aggregates all the rows into one. The filter comes **before** so that only the 4625 events are counted.",
  "commonMistakes": [
   "Using `| count`: the column is then called `Count`, not `Echecs`.",
   "Filtering after the `summarize`: the `EventID` column no longer exists."
  ]
 },
 "kql-010": {
  "title": "Which applications are used?",
  "objective": "List the distinct values of a column.",
  "statement": "List the **distinct values** of `AppDisplayName` in `SigninLogs`.",
  "hints": [
   "There is an operator dedicated to unique values.",
   "A single column is enough."
  ],
  "explanation": "`distinct` returns the unique combinations of the given columns. It is the compact equivalent of `summarize by AppDisplayName`.",
  "commonMistakes": [
   "Doing a `count()` when you want the list, not the number.",
   "Forgetting that `distinct *` deduplicates whole rows, rarely useful."
  ]
 },
 "kql-011": {
  "title": "The five latest sign-ins",
  "objective": "Get the most recent rows with top.",
  "statement": "Return the timestamps (`TimeGenerated` only) of the **5 most recent sign-ins** in `SigninLogs`, from most recent to oldest.",
  "hints": [
   "`top N by column desc` sorts then limits in one step.",
   "End with a `project` to keep only the timestamp."
  ],
  "explanation": "`top 5 by TimeGenerated desc` is equivalent to `sort by TimeGenerated desc | take 5`. A `take` placed **before** the sort would give 5 arbitrary rows.",
  "commonMistakes": [
   "Writing `take 5` then `sort`: the 5 rows are chosen before the sort.",
   "Forgetting `desc`: by default, `top` sorts in descending order, but it is better to write it explicitly."
  ]
 },
 "kql-012": {
  "title": "Flag server events",
  "objective": "Create a computed column with extend.",
  "statement": "For Windows successful logons (`EventID` 4624), add a boolean column `EstServeur` that is true if `Computer` **starts with** `SRV-`. Return `TimeGenerated`, `Computer` and `EstServeur`.",
  "hints": [
   "`extend` adds columns without removing the others.",
   "`startswith` returns a boolean."
  ],
  "explanation": "`extend` computes a new column row by row. The final `project` sets the requested columns and their order.",
  "commonMistakes": [
   "Using `project` instead of `extend`: the columns not listed disappear.",
   "Using `contains`: \"contains\" is not \"starts with\"."
  ]
 },
 "kql-013": {
  "title": "Refused SSH passwords",
  "objective": "Search for a term with the has operator.",
  "statement": "In `Syslog`, return the rows whose `SyslogMessage` contains the term **Failed password**.",
  "hints": [
   "`has` looks for a whole term and runs fast.",
   "`has` is not case-sensitive."
  ],
  "explanation": "`has` searches for an indexed **term** and is more efficient than `contains` (substring). The term \"Failed password\" is found even when surrounded by other words.",
  "commonMistakes": [
   "Using `==`: the full message also contains the user and the address.",
   "Using `contains`: the result is correct but more expensive on large volumes."
  ]
 },
 "kql-014": {
  "title": "Workstations that send a heartbeat",
  "objective": "Filter on a prefix then deduplicate.",
  "statement": "List the **distinct** computer names in `Heartbeat` that start with `PC-`.",
  "hints": [
   "Filter first with `startswith`.",
   "Then deduplicate with `distinct`."
  ],
  "explanation": "Each machine emits a regular heartbeat: without `distinct`, you would get thousands of rows. Filtering before deduplicating reduces the work.",
  "commonMistakes": [
   "Forgetting `distinct`: the list contains one row per beat.",
   "Using `has \"PC-\"`: the hyphen changes how the term is split."
  ]
 },
 "kql-015": {
  "title": "Account creations and additions to a local group",
  "objective": "Test several values with in.",
  "statement": "Return the `SecurityEvent` events whose `EventID` is **4720** (account created) **or** **4732** (member added to a local security group).",
  "hints": [
   "Rather than two conditions joined by `or`, use `in`.",
   "The list of values goes in parentheses."
  ],
  "explanation": "`in (a, b)` is the compact form of `== a or == b`. It reads better as the list grows.",
  "commonMistakes": [
   "Writing `EventID == 4720 or 4732`: the second part is not a comparison.",
   "Using `and`: an event cannot have two identifiers."
  ]
 },
 "kql-016": {
  "title": "Ignore the noise of invalid passwords",
  "objective": "Exclude values with !in.",
  "statement": "In `SigninLogs`, return the sign-ins whose `ResultType` is **neither** `\"0\"` (success) **nor** `\"50126\"` (invalid password). These are the \"unusual\" failures that deserve a second look.",
  "hints": [
   "`!in` excludes a list of values.",
   "`ResultType` is text."
  ],
  "explanation": "`!in` is the negation of `in`. Excluding the known noise brings out the rarer error codes, such as 50074 (strong authentication required) or 50053 (account locked).",
  "commonMistakes": [
   "Using `!=` with two values: a condition that is true for one and false for the other filters nothing.",
   "Writing the codes without quotes while the column is text."
  ]
 },
 "kql-017": {
  "title": "Windows failures from the last 24 hours",
  "objective": "Bound a query in time with ago().",
  "statement": "Return the **4625** events from `SecurityEvent` for the **last 24 hours** (relative to the simulated playground clock).",
  "hints": [
   "`ago(24h)` returns the moment 24 hours before \"now\".",
   "Compare `TimeGenerated` to that result."
  ],
  "explanation": "Filtering time first is the right habit: on a real workspace, the time range first reduces the amount of data read. `ago(1d)` and `ago(24h)` are equivalent.",
  "commonMistakes": [
   "Forgetting the time filter: the query reads the entire retention.",
   "Using `<` instead of `>`: you would get everything except the last day."
  ],
  "check": {
   "rules": [
    {
     "message": "A detection query must always be bounded in time with TimeGenerated."
    }
   ]
  }
 },
 "kql-018": {
  "title": "Failed Azure operations, from oldest to most recent",
  "objective": "Sort in ascending order.",
  "statement": "In `AzureActivity`, return the timestamp (`TimeGenerated` only) of the operations whose `ActivityStatusValue` is `\"Failed\"`, **from oldest to most recent**.",
  "hints": [
   "`sort by` sorts in descending order by default.",
   "Add `asc` for ascending order."
  ],
  "explanation": "The default order of `sort` is **descending**. For chronological order, you must write `asc` explicitly.",
  "commonMistakes": [
   "Forgetting `asc`: the sort is descending.",
   "Sorting before filtering: the result is correct, but you sort useless rows."
  ]
 },
 "kql-019": {
  "title": "First and last recorded sign-in",
  "objective": "Use min() and max() in the same summarize.",
  "statement": "Return, in a single row, the oldest (`Premiere`) and the most recent (`Derniere`) value of `TimeGenerated` in `SigninLogs`.",
  "hints": [
   "`min()` and `max()` also work on dates.",
   "Several aggregates are separated by commas."
  ],
  "explanation": "A single `summarize` can compute several aggregates. Knowing the range covered by a table is the first reflex before interpreting a result.",
  "commonMistakes": [
   "Running two separate queries rather than a single summarize.",
   "Using `sort` + `take 1`: longer and less readable."
  ]
 },
 "kql-020": {
  "title": "Failures and total in one pass",
  "objective": "Use countif() to count according to a condition.",
  "statement": "In a single row, return the number of failed sign-ins (`Echecs`, `ResultType` different from `\"0\"`) and the total number of sign-ins (`Total`).",
  "hints": [
   "`countif(condition)` counts the rows where the condition is true.",
   "Do not filter with `where`: you would lose the total."
  ],
  "explanation": "`countif` avoids running two queries: the same pass over the data computes the total and the subset. It is the basis of a failure rate.",
  "commonMistakes": [
   "Using `where` before the `summarize`: the total becomes equal to the number of failures.",
   "Forgetting that the result must contain a single row."
  ]
 },
 "kql-021": {
  "title": "How many distinct accounts targeted per machine?",
  "objective": "Count unique values with dcount() per group.",
  "statement": "Among the 4625 failures in `SecurityEvent`, compute for each `Computer` the number of distinct accounts targeted (`Comptes`, from `Account`).",
  "hints": [
   "`dcount(column)` counts distinct values.",
   "Group by computer with `by Computer`."
  ],
  "explanation": "Many accounts targeted from the same machine or the same source is the signature of a **password spray**, unlike a brute force that targets a single account.",
  "commonMistakes": [
   "Using `count()`: you count events, not accounts.",
   "Forgetting the filter on 4625: the successful logons skew the number."
  ]
 },
 "kql-022": {
  "title": "Sign-ins per day",
  "objective": "Group by time interval with bin().",
  "statement": "Return the number of sign-ins (`Total`) per **day** (`Jour`) in `SigninLogs`.",
  "hints": [
   "`bin(TimeGenerated, 1d)` rounds each timestamp to the start of its day.",
   "The result of `bin` can be named directly in the `by`."
  ],
  "explanation": "`bin()` (or `floor()`) creates regular time buckets. It is the basis of any time series, including `render timechart` charts.",
  "commonMistakes": [
   "Grouping by raw `TimeGenerated`: each row becomes its own group.",
   "Using `1h` instead of `1d`: the result would be hourly."
  ]
 },
 "kql-023": {
  "title": "Outbound volume by source address",
  "objective": "Add up a numeric column with sum().",
  "statement": "In `CommonSecurityLog`, compute for each `SourceIP` the sum of `SentBytes` in a column `OctetsEnvoyes`.",
  "hints": [
   "`sum()` adds up the values of a column.",
   "Group by source address."
  ],
  "explanation": "Adding up bytes per source is the basis of exfiltration detection: a machine that sends abnormally more than its peers stands out immediately.",
  "commonMistakes": [
   "Using `count()`: you count flows, not bytes.",
   "Confusing `SentBytes` and `ReceivedBytes`."
  ]
 },
 "kql-024": {
  "title": "Remove the bulky columns",
  "objective": "Remove columns with project-away.",
  "statement": "Return all the rows of `SigninLogs` **without** the columns `UserAgent`, `DeviceDetail` and `LocationDetails`.",
  "hints": [
   "There is a variant of `project` that removes rather than keeps.",
   "List only the columns to remove."
  ],
  "explanation": "`project-away` is handy when you want to keep everything except a few columns. Listing 10 columns to keep would be longer and more fragile.",
  "commonMistakes": [
   "Using `project`: you would keep only the three columns to remove.",
   "Forgetting the hyphen in `project-away`."
  ]
 },
 "kql-025": {
  "title": "Fix: equality with a single sign",
  "objective": "Recognize the most frequent syntax error of the where operator.",
  "statement": "This query should return the **successful** sign-ins, but it fails. Fix it.",
  "hints": [
   "Read the error message carefully.",
   "In KQL, comparison is done with a two-character operator."
  ],
  "explanation": "The `=` sign alone is used for assignment (`extend X = ...`). Equality comparison is written `==`.",
  "commonMistakes": [
   "Replacing `=` with `=~`: that operator compares without regard to case and is slower.",
   "Removing the quotes around `\"0\"`."
  ]
 },
 "kql-026": {
  "title": "Fix: filter after the aggregation",
  "objective": "Understand that summarize replaces the available columns.",
  "statement": "We want the number of failures (`ResultType` different from `\"0\"`) per account, but the query reports a column not found. Fix it while keeping the columns `UserPrincipalName` and `Echecs`.",
  "hints": [
   "After a `summarize`, only the `by` columns and the aggregates remain.",
   "Move the filter to where `ResultType` still exists."
  ],
  "explanation": "`summarize` produces a new table: only the grouping columns and the aggregates survive. The filter on `ResultType` must come **before**, which is also faster.",
  "commonMistakes": [
   "Adding `ResultType` to the `by`: the result changes completely.",
   "Using `countif` but keeping the final `where`."
  ]
 },
 "kql-027": {
  "title": "Fix: string without quotes",
  "objective": "Wrap text literals in quotes.",
  "statement": "We are looking for the sign-ins of the account `l.bouchard@nordlys.example`. The query fails. Fix it.",
  "hints": [
   "Without quotes, KQL reads a column name.",
   "A text literal goes in double or single quotes."
  ],
  "explanation": "Without quotes, `l.bouchard@nordlys.example` is not a text literal. Always wrap values in quotes.",
  "commonMistakes": [
   "Using `has` without quotes.",
   "Putting quotes around the column name rather than the value."
  ]
 },
 "kql-028": {
  "title": "Assemble: the noisiest addresses",
  "objective": "Put the clauses back in the right order: filter, aggregate, rank.",
  "statement": "Assemble the blocks to get the **3 IP addresses** (`IPAddress`) with the most sign-in failures (`Echecs`). One block is not part of the solution.",
  "hints": [
   "Every query starts with its data source.",
   "The filter comes before the aggregation, and the ranking comes last."
  ],
  "explanation": "Filter → aggregate → rank. The `take 3` block would limit arbitrary rows instead of keeping the three highest values.",
  "commonMistakes": [
   "Placing `top` before `summarize`: the `Echecs` column does not exist yet.",
   "Using `take 3` instead of `top 3`."
  ]
 },
 "kql-029": {
  "title": "Read a result: the most targeted machine",
  "objective": "Interpret a result table without rewriting the query.",
  "statement": "This query counts Windows failures per computer. Read the result.",
  "hints": [
   "The rows are already sorted from the highest value to the lowest.",
   "Look at the first row."
  ],
  "explanation": "SRV-FILE01 clearly dominates. A value this high on a single server is typical of an RDP brute-force attack, to be confirmed with the source (`IpAddress`) and a possible 4624 success that follows.",
  "commonMistakes": [
   "Reading the last row rather than the first.",
   "Answering with the number of failures rather than the name."
  ],
  "question": "Which computer suffered the most logon failures?"
 },
 "kql-030": {
  "title": "Read a result: how many distinct accounts?",
  "objective": "Read a number in a single-row table.",
  "statement": "This query measures the extent of a suspicious source.",
  "hints": [
   "The result fits on one row.",
   "The `Comptes` column contains the value of `dcount`."
  ],
  "explanation": "Several accounts targeted by the same address with few attempts per account is the signature of a password spray. Do not confuse it with `Tentatives`, which counts all the rows.",
  "commonMistakes": [
   "Answering with `Tentatives`, which is the number of rows.",
   "Counting the accounts by hand rather than reading `Comptes`."
  ],
  "question": "How many distinct accounts did the address 203.0.113.45 target?"
 },
 "kql-031": {
  "title": "Classify the result codes",
  "objective": "Turn a code into a readable category with case().",
  "statement": "For each row of `SigninLogs`, add a column `Categorie` with the value:\n\n- `\"Succes\"` if `ResultType` is `\"0\"`\n- `\"MotDePasse\"` if `\"50126\"`\n- `\"MFA\"` if `\"50074\"`\n- `\"Autre\"` for everything else\n\nReturn `UserPrincipalName`, `ResultType` and `Categorie`.",
  "hints": [
   "`case(condition1, value1, condition2, value2, ..., defaultValue)`.",
   "The last value, without a condition, serves as the default."
  ],
  "explanation": "`case()` evaluates its conditions in order and returns the first value whose condition is true. The last odd argument is the default value. `iff()` is enough for only two outcomes.",
  "commonMistakes": [
   "Forgetting the final default value: `case` requires an odd number of arguments.",
   "Chaining unreadable nested `iff` when `case` fits."
  ]
 },
 "kql-032": {
  "title": "Sign-ins by country",
  "objective": "Read a property of a dynamic column.",
  "statement": "The `LocationDetails` column is of type `dynamic` and contains a property `countryOrRegion`. Return the number of sign-ins (`Total`) per country (`Pays`).",
  "hints": [
   "A property of a dynamic object is reached with a dot: `LocationDetails.countryOrRegion`.",
   "Convert the value with `tostring()` before grouping."
  ],
  "explanation": "`dynamic` values are untyped: convert explicitly with `tostring()`, `toint()`, etc. before comparing or grouping, otherwise the behavior is unpredictable.",
  "commonMistakes": [
   "Forgetting `tostring()`: the grouping is on an untyped value.",
   "Writing `LocationDetails[\"countryOrRegion\"` without closing the bracket."
  ]
 },
 "kql-033": {
  "title": "Device operating systems",
  "objective": "Use bracket notation on a dynamic object.",
  "statement": "For **successful** sign-ins, return the number of distinct devices (`Appareils`, from `UserPrincipalName`) per operating system (`OS`, property `operatingSystem` of `DeviceDetail`). Use bracket notation for the property.",
  "hints": [
   "`DeviceDetail[\"operatingSystem\"]` is equivalent to `DeviceDetail.operatingSystem`.",
   "Filter the successes first, then aggregate."
  ],
  "explanation": "Brackets are essential when the property name contains special characters or comes from a variable. Here the two notations are equivalent.",
  "commonMistakes": [
   "Using parentheses instead of brackets.",
   "Forgetting to filter the successes."
  ]
 },
 "kql-034": {
  "title": "The latest sign-in of each account",
  "objective": "Retrieve the most recent row per group with arg_max().",
  "statement": "For each `UserPrincipalName`, return the row of its **most recent sign-in** with the columns `UserPrincipalName`, `TimeGenerated` and `IPAddress`.",
  "hints": [
   "`arg_max(sortColumn, columnsToReturn)` returns the values of the maximum row.",
   "Grouping is done with `by`."
  ],
  "explanation": "`arg_max(TimeGenerated, IPAddress)` returns `TimeGenerated` (the maximum value) and `IPAddress` from **the same row**. Doing `max(TimeGenerated)` and `max(IPAddress)` separately would mix different rows.",
  "commonMistakes": [
   "Computing two independent `max()`: the IP address no longer matches the last sign-in.",
   "Using `top 1`: it does not apply per group."
  ]
 },
 "kql-035": {
  "title": "How many IP addresses per account?",
  "objective": "Collect values with make_set() and measure the size of the result.",
  "statement": "For each account in `SigninLogs`, compute the number of **distinct** IP addresses (`NbIP`) using `make_set()` and `array_length()`.",
  "hints": [
   "`make_set()` returns an array of distinct values.",
   "`array_length()` gives the size of the array."
  ],
  "explanation": "`make_set` produces an array of distinct values whose **order is not guaranteed**: you must never compare two arrays by their order, but rather by their size or sorted content. For a simple count, `dcount` is enough.",
  "commonMistakes": [
   "Using `make_list`: duplicates are kept.",
   "Assuming a stable order of the array elements."
  ]
 },
 "kql-036": {
  "title": "A reusable threshold with let",
  "objective": "Declare a constant with let and use it in a filter.",
  "statement": "Declare `seuil = 10` with `let`, then return the IP addresses (`IPAddress`) with **more than `seuil` sign-in failures** (`Echecs`).",
  "hints": [
   "A `let` statement ends with a semicolon.",
   "The filter on `Echecs` comes after the `summarize`."
  ],
  "explanation": "Isolating thresholds in `let` at the top of the query makes them easy to adjust in an analytics rule. The filter on the aggregate is done **after** `summarize`, because the column does not exist before.",
  "commonMistakes": [
   "Forgetting the semicolon after the `let`.",
   "Placing `where Echecs > seuil` before the `summarize`."
  ]
 },
 "kql-037": {
  "title": "A named subquery",
  "objective": "Name a tabular expression with let.",
  "statement": "Define `echecs` as the failed sign-ins of `SigninLogs`, then return the number of failures (`Total`) per country (`Pays`, property `countryOrRegion` of `LocationDetails`).",
  "hints": [
   "`let name = <query>;` defines a reusable expression.",
   "Then use `name` as the data source."
  ],
  "explanation": "A tabular `let` makes the query more readable and lets you reuse the same subquery several times. It is evaluated at each use, unless you use `materialize()`.",
  "commonMistakes": [
   "Leaving a blank line inside the `let` statement.",
   "Forgetting the semicolon after the definition."
  ]
 },
 "kql-038": {
  "title": "Last heartbeat of the attacked servers",
  "objective": "Join two summaries with join kind=inner.",
  "statement": "For each `Computer` with 4625 failures in `SecurityEvent`, return `Computer`, the number of failures (`Echecs`) and the date of the last heartbeat (`Dernier`, from `Heartbeat`).",
  "hints": [
   "Summarize each side **before** the join to reduce the volume.",
   "The join key is `Computer`, present on both sides."
  ],
  "explanation": "Putting the smaller table on the left and reducing each side before joining is the golden rule of performance. The `inner` type keeps only the machines present on both sides.",
  "commonMistakes": [
   "Joining the raw tables: thousands of rows multiply needlessly.",
   "Forgetting that `join` without `kind` is `innerunique`, which deduplicates the left side."
  ]
 },
 "kql-039": {
  "title": "Machines with no 4625 failure",
  "objective": "Find the absence with join kind=leftanti.",
  "statement": "List the computers (`Computer`) that send heartbeats but that **never** have a 4625 event in `SecurityEvent`.",
  "hints": [
   "`leftanti` returns the left rows without a match on the right.",
   "Deduplicate each side before the join."
  ],
  "explanation": "`leftanti` answers the question \"who is in A but not in B?\". It is the basic pattern for detecting absences: silent machines, accounts without MFA, etc.",
  "commonMistakes": [
   "Using `rightanti`: the sides are reversed.",
   "Using `kind=leftouter` then forgetting to filter the null values."
  ]
 },
 "kql-040": {
  "title": "A single table of failures",
  "objective": "Combine tables with different schemas using union.",
  "statement": "Combine into a single table:\n\n- the failed sign-ins of `SigninLogs` (columns `TimeGenerated`, `Compte` = `UserPrincipalName`, `Source` = `\"SigninLogs\"`)\n- the 4625 events of `SecurityEvent` (columns `TimeGenerated`, `Compte` = `Account`, `Source` = `\"SecurityEvent\"`)",
  "hints": [
   "First harmonize the columns of each table with `project`.",
   "`union (query1), (query2)` stacks the results."
  ],
  "explanation": "`union` stacks rows. By harmonizing the columns beforehand, the result is usable for a unified view of identities coming from different sources.",
  "commonMistakes": [
   "Forgetting the parentheses around each subquery.",
   "Confusing `union` (stacks) and `join` (associates)."
  ]
 },
 "kql-041": {
  "title": "Who received a role?",
  "objective": "Expand a dynamic array with mv-expand.",
  "statement": "In `AuditLogs`, for the operation `\"Add member to role\"`, the `TargetResources` column is an array. Return `TimeGenerated` and the targeted account (`Cible`, property `userPrincipalName` of each element).",
  "hints": [
   "`mv-expand` creates one row per element of the array.",
   "Name the expanded element, for example `t = TargetResources`."
  ],
  "explanation": "`mv-expand` turns an array into several rows. An empty array gives **zero** rows; a null value gives one. Audit logs use many arrays in `TargetResources`.",
  "commonMistakes": [
   "Forgetting `mv-expand`: a property of an array is not directly accessible.",
   "Using `t[0]`: only the first element is read."
  ]
 },
 "kql-042": {
  "title": "Extract the Windows user name",
  "objective": "Split a string with split().",
  "statement": "The `Account` column of `SecurityEvent` contains `DOMAINE\\utilisateur`. For successful logons (4624), return the number of events (`Total`) per user (`Utilisateur`, without the domain).",
  "hints": [
   "`split(text, separator)` returns an array.",
   "The separator is a backslash, which is written doubled in a string."
  ],
  "explanation": "In a KQL text literal, the backslash is an escape character: to get one backslash, you write `\"\\\\\"`. With a verbatim string `@\"\\\"`, the backslash is literal.",
  "commonMistakes": [
   "Writing `\"\\\"`: the backslash escapes the following quote.",
   "Indexing `[0]`: you get the domain."
  ]
 },
 "kql-043": {
  "title": "Build an account@machine key",
  "objective": "Assemble strings with strcat().",
  "statement": "For the 4625 events, add a column `Cle` equal to `Account` followed by `\" sur \"` then `Computer` (e.g. `NORDLYS\\sam sur PC-001`), then return the **distinct** values of `Cle`.",
  "hints": [
   "`strcat(a, b, c)` concatenates several values.",
   "End with `distinct`."
  ],
  "explanation": "`strcat` concatenates text and converted values. Building a composite key is useful for detecting rare combinations, for example an account that signs in on an unusual machine.",
  "commonMistakes": [
   "Using `+`: it adds numbers, it does not concatenate text.",
   "Forgetting the spaces around the joining word."
  ]
 },
 "kql-044": {
  "title": "Successes in the middle of the night",
  "objective": "Filter on the hour of the day with hourofday().",
  "statement": "Return the **successful** sign-ins of `SigninLogs` that occurred between 0:00 and 5:00 (UTC), that is, those where `hourofday(TimeGenerated)` is less than 5.",
  "hints": [
   "`hourofday()` returns an integer from 0 to 23.",
   "Timestamps are in UTC."
  ],
  "explanation": "Hours are in **UTC**: a \"night\" range must be shifted according to the organization's time zone. A successful sign-in in the middle of the night, especially after failures, deserves a check.",
  "commonMistakes": [
   "Forgetting that the logs are in UTC.",
   "Using `dayofweek` instead of `hourofday`."
  ]
 },
 "kql-045": {
  "title": "Accounts with several IP addresses",
  "objective": "Filter on the result of a dcount.",
  "statement": "Return the accounts (`UserPrincipalName`) that signed in from **more than 3** distinct IP addresses (`NbIP`).",
  "hints": [
   "Compute `dcount` per account.",
   "Then filter on the resulting column."
  ],
  "explanation": "An unusual number of addresses per account can signal a stolen token or account sharing. You then need to compare to a normal baseline (remote work, mobile) before alerting.",
  "commonMistakes": [
   "Filtering before the `summarize`.",
   "Comparing with `>=` when the statement says \"more than\"."
  ]
 },
 "kql-046": {
  "title": "The biggest outbound flows",
  "objective": "Rank destinations by volume.",
  "statement": "In `CommonSecurityLog`, return the 3 destinations (`DestinationIP`) that received the largest single flow (`Max`, maximum of `SentBytes`), from largest to smallest.",
  "hints": [
   "First compute the maximum per destination.",
   "Then rank with `top`."
  ],
  "explanation": "A single flow of several tens of MB to an unusual address is an exfiltration signal to investigate. The ranking must be done after the aggregation.",
  "commonMistakes": [
   "Doing `top 3 by SentBytes` without aggregating: several flows from the same destination.",
   "Using `sum`: the statement asks for the largest single flow."
  ]
 },
 "kql-047": {
  "title": "Blocked messages",
  "objective": "Query a Defender XDR table (Advanced Hunting).",
  "statement": "In Advanced Hunting, the `EmailEvents` table describes emails. Return the **blocked** emails (`DeliveryAction` equal to `\"Blocked\"`) with the columns `Timestamp`, `SenderFromDomain` and `Subject`.",
  "hints": [
   "In Advanced Hunting, the time column is called `Timestamp`.",
   "Filter on `DeliveryAction`."
  ],
  "explanation": "In the Defender portal, XDR tables use `Timestamp`, whereas Log Analytics tables use `TimeGenerated`. This difference is the first source of errors when transposing a query from one context to the other.",
  "commonMistakes": [
   "Using `TimeGenerated` in Advanced Hunting.",
   "Looking for `DeliveryAction == \"Block\"`: the exact value is `Blocked`."
  ]
 },
 "kql-049": {
  "title": "Fix: TimeGenerated in Advanced Hunting",
  "objective": "Adapt a Sentinel query to the Advanced Hunting schema.",
  "statement": "This query, written for Sentinel, is pasted into Advanced Hunting. It should return the failed logons (`ActionType` equal to `\"LogonFailed\"`) of the last day. Fix it.",
  "hints": [
   "What is the name of the time column in XDR tables?",
   "Only one column name changes."
  ],
  "explanation": "Advanced Hunting tables expose `Timestamp`. When the same tables are streamed to Log Analytics, the column becomes `TimeGenerated`, sometimes with both present: check according to the context.",
  "commonMistakes": [
   "Replacing `TimeGenerated` with `Time` or `Date`.",
   "Removing the time filter."
  ]
 },
 "kql-050": {
  "title": "Fix: join on the wrong key",
  "objective": "Fix a join whose keys have different names.",
  "statement": "We want to associate each blocked message with its URLs, but the query fails. `EmailUrlInfo` shares `NetworkMessageId` with `EmailEvents`. Return `Timestamp`, `SenderFromDomain` and `Url`.",
  "hints": [
   "Which column is common to both tables?",
   "The join key must exist on both sides."
  ],
  "explanation": "A join key must have the same name on both sides; otherwise use `$left.A == $right.B`. Note: `Timestamp` exists in both tables, which creates a column renamed to `Timestamp1` for the right side.",
  "commonMistakes": [
   "Inventing a `MessageId` column.",
   "Forgetting that homonymous columns are renamed by the join."
  ]
 },
 "kql-051": {
  "title": "Assemble: detect a password spray",
  "objective": "Compose a spray detection: many accounts, few attempts per account.",
  "statement": "Assemble the query that returns the IP addresses (`IPAddress`) that failed on **more than 10 distinct accounts** (`Comptes`). Two blocks are decoys.",
  "hints": [
   "You need to count **distinct** accounts.",
   "The threshold is applied after the aggregation."
  ],
  "explanation": "A spray is recognized by the **diversity of accounts** targeted by the same source, not by the raw number of attempts. `count()` would count attempts and confuse spray with brute force.",
  "commonMistakes": [
   "Using `count()` instead of `dcount()`.",
   "Placing the threshold before the aggregation."
  ]
 },
 "kql-052": {
  "title": "Read a result: brute force or spray?",
  "objective": "Interpret figures to qualify a behavior.",
  "statement": "This query summarizes two suspicious sources. Compare the profiles.",
  "hints": [
   "Find the row where `IPAddress` is 203.0.113.77.",
   "Read the `Comptes` column."
  ],
  "explanation": "A single account targeted many times: this is a targeted **brute force**. The other address targets several accounts a few times each: this is a **spray**. The two call for different responses (locking the account vs blocking the source).",
  "commonMistakes": [
   "Reading `Tentatives` instead of `Comptes`.",
   "Mixing up the two rows."
  ],
  "question": "How many distinct accounts did the address **203.0.113.77** target?"
 },
 "kql-053": {
  "title": "Success after a spray",
  "objective": "Reuse an intermediate result in an in filter.",
  "statement": "Define `sources` as the IP addresses (`IPAddress`) that failed with code `\"50126\"` on **more than 10 distinct accounts**. Then return the **successful** sign-ins (`ResultType == \"0\"`) coming from these addresses, with `TimeGenerated`, `UserPrincipalName` and `IPAddress`.",
  "hints": [
   "`in (letName)` accepts a table with a single column.",
   "End the `let` with `project IPAddress` to keep only one column."
  ],
  "explanation": "This is the core of a compromise detection: a **success** that follows a spray means a password was guessed. The query links two observations (spray, then success from the same source) without an expensive join.",
  "commonMistakes": [
   "Forgetting `project IPAddress`: `in` requires a single column.",
   "Looking for successes without linking the source to the spray: you would retrieve all the successful sign-ins."
  ]
 },
 "kql-054": {
  "title": "RDP brute force followed by a success",
  "objective": "Link Windows failures and successes by machine and source address.",
  "statement": "In `SecurityEvent`, find the successful logons (**4624**) coming from an address (`IpAddress`) that already had **at least 20 failures** (4625) on the same machine (`Computer`), and that occurred **after** the last failure. Return `TimeGenerated`, `Computer`, `Account`, `IpAddress` and `NbEchecs`.",
  "hints": [
   "First compute, per machine and address, the number of failures and the date of the last one.",
   "Join the successes on **both** keys, then compare the dates."
  ],
  "explanation": "Comparing the date of the success with the last failure avoids the false positives of a success that predates the attack. The double key (`Computer`, `IpAddress`) precisely isolates the attacker/target pair.",
  "commonMistakes": [
   "Joining on a single key: different attacks get mixed.",
   "Forgetting the date comparison: an old success would be included."
  ]
 },
 "kql-055": {
  "title": "Accounts seen in several countries",
  "objective": "Detect a potential impossible travel with dcount on a dynamic field.",
  "statement": "Among the **successful** sign-ins, return the accounts (`UserPrincipalName`) seen in **more than one country** (`NbPays`, from `LocationDetails.countryOrRegion`).",
  "hints": [
   "Extract the country into a column with `extend` before counting.",
   "Keep only the successes."
  ],
  "explanation": "This test does not prove an impossible travel: you must also compare the **times** of the sign-ins. But it is the first quick filter, to be followed by an analysis of distance and delay.",
  "commonMistakes": [
   "Including the failures: foreign attackers would skew the list.",
   "Counting the rows with `count()` instead of distinct countries."
  ]
 },
 "kql-056": {
  "title": "Peak hours of failures",
  "objective": "Detect an hourly spike.",
  "statement": "Return the hours (`Heure`, by one-hour `bin`) in which there were **more than 20 sign-in failures** (`Echecs`) in `SigninLogs`.",
  "hints": [
   "Group by one-hour bucket.",
   "Filter on the aggregated result."
  ],
  "explanation": "Hourly spikes reveal a one-off attack drowned in the daily noise. The threshold must be calibrated on the organization's normal baseline.",
  "commonMistakes": [
   "Grouping by day: the spike disappears into the day.",
   "Filtering the threshold before the `summarize`."
  ]
 },
 "kql-057": {
  "title": "New addresses in the last two days",
  "objective": "Detect a first appearance with min() and ago().",
  "statement": "Return the IP addresses (`IPAddress`) whose **first appearance** (`Premiere`) in `SigninLogs` is less than 2 days old, with their number of rows (`Total`).",
  "hints": [
   "Compute the first appearance per address.",
   "Compare it to `ago(2d)`."
  ],
  "explanation": "The \"first appearance\" is a classic detection pattern (new element): it requires comparing against a history. Note that a short retention makes simply old addresses look new.",
  "commonMistakes": [
   "Filtering `TimeGenerated > ago(2d)` before `min`: every recently active address looks new.",
   "Confusing first and last appearance."
  ]
 },
 "kql-058": {
  "title": "Success from a never-before-seen address",
  "objective": "Compare a recent window with a history using leftanti.",
  "statement": "Define `connues` as the IP addresses seen **before** the last 2 days. Then return the distinct addresses (`IPAddress`) that had a **successful** sign-in in the last 2 days and that do not appear in `connues`.",
  "hints": [
   "Separate the history and the recent window with two time filters.",
   "`leftanti` keeps what has no match in `connues`."
  ],
  "explanation": "This structure (history, window, anti-join) is the basis of many \"new element\" rules. It requires a history window long enough not to trigger at every data rotation.",
  "commonMistakes": [
   "Using `inner`: you keep the already known addresses.",
   "Overlapping the two time windows."
  ]
 },
 "kql-059": {
  "title": "Duration of an attack per address",
  "objective": "Measure a duration with datetime_diff().",
  "statement": "For the failed sign-ins, compute per IP address: the number of attempts (`Tentatives`), the start (`Debut`) and the end (`Fin`), then the duration in minutes (`DureeMin`, with `datetime_diff(\"minute\", Fin, Debut)`). Keep only the addresses with more than 10 attempts.",
  "hints": [
   "First aggregate `min` and `max` of `TimeGenerated`.",
   "`datetime_diff(\"minute\", end, start)` returns an integer."
  ],
  "explanation": "Duration and rate distinguish a slow attack from a burst. A slow spray (one attempt every few minutes) escapes a per-minute threshold but not an analysis over several hours.",
  "commonMistakes": [
   "Reversing `Fin` and `Debut`: the duration becomes negative.",
   "Using `Fin - Debut` without conversion: the result is a duration, not a number of minutes."
  ]
 },
 "kql-060": {
  "title": "Which roles were assigned?",
  "objective": "Extract a nested value from a JSON string.",
  "statement": "In `AuditLogs`, for the operation `\"Add member to role\"`, each element of `TargetResources` has `modifiedProperties[0].newValue`, which is a **JSON text** containing an array (e.g. `[\"Global Administrator\"]`). Return `TimeGenerated`, `Cible` (`userPrincipalName`) and `Role` (the first element of the array).",
  "hints": [
   "Expand `TargetResources` with `mv-expand`.",
   "`parse_json(tostring(...))` turns the JSON text into an array."
  ],
  "explanation": "Audit logs often store values as **JSON strings**. You must first convert them to `string`, then parse them with `parse_json`, before you can index.",
  "commonMistakes": [
   "Indexing the JSON text directly without `parse_json`.",
   "Forgetting the `mv-expand`: `t.userPrincipalName` is then not found."
  ]
 },
 "kql-061": {
  "title": "What the created account did in Azure",
  "objective": "Link an identity event to resource activity.",
  "statement": "In `AuditLogs`, the `\"Add user\"` operation creates an account (`TargetResources[0].userPrincipalName`). Return the Azure operations (`AzureActivity`) performed by these accounts: `Compte`, `Cree` (creation date), `TimeGenerated`, `OperationNameValue`.",
  "hints": [
   "The keys have different names: use `$left.` and `$right.`.",
   "Extract the created account into a column before the join."
  ],
  "explanation": "An account created at 3:12 AM that acts on production VMs at 3:40 AM is a persistence scenario. Linking identity and cloud activity is the essence of investigation in an Azure environment.",
  "commonMistakes": [
   "Joining on the display name rather than on the UPN.",
   "Forgetting that `AzureActivity.Caller` contains the UPN for a user."
  ]
 },
 "kql-062": {
  "title": "What is svc-backup2 doing?",
  "objective": "Summarize an account's activity across Azure operations.",
  "statement": "For the account whose `Caller` contains `svc-backup2`, return the number of operations (`Nb`) per `OperationNameValue`, from most to least frequent.",
  "hints": [
   "`has` works for a UPN that contains a name.",
   "Sort the final result."
  ],
  "explanation": "Four VM creations within a few minutes, a role assignment and the deletion of a diagnostic setting tell a story: privileges obtained, resources deployed, traces erased.",
  "commonMistakes": [
   "Forgetting that `has` only finds whole terms.",
   "Looking for `Caller == \"svc-backup2\"` without the domain."
  ]
 },
 "kql-063": {
  "title": "Deleting diagnostic settings",
  "objective": "Recognize defense evasion in AzureActivity.",
  "statement": "Return the Azure operations whose `OperationNameValue` contains the term `DIAGNOSTICSETTINGS` **and** ends with `DELETE`. Columns: `TimeGenerated`, `Caller`, `CallerIpAddress`, `ResourceGroup`.",
  "hints": [
   "`has` looks for a **complete term**: `DIAG` is not enough.",
   "The operation is a value of the form `PROVIDER/TYPE/ACTION`."
  ],
  "explanation": "Deleting a diagnostic setting cuts the log flow to Log Analytics: it is a defense evasion technique. This rule is useful in production, especially if it targets `rg-sec`.",
  "commonMistakes": [
   "Searching `has \"DIAG\"`: the whole term is `DIAGNOSTICSETTINGS`.",
   "Forgetting `endswith \"DELETE\"`: you would also get the writes."
  ]
 },
 "kql-064": {
  "title": "Machines silent for more than a day",
  "objective": "Detect an absence of telemetry.",
  "statement": "Return the computers (`Computer`) whose **last** heartbeat (`Dernier`) is more than one day old (relative to the simulated clock).",
  "hints": [
   "Compute the last date per machine.",
   "An absence is detected **after** the aggregation, not before."
  ],
  "explanation": "You cannot detect an absence by filtering the rows of a window: there are precisely no rows. You aggregate the history, then compare the last signal to the expected window.",
  "commonMistakes": [
   "Filtering `TimeGenerated < ago(1d)` before the `summarize`: every active machine also has old heartbeats.",
   "Using `min` instead of `max`."
  ]
 },
 "kql-065": {
  "title": "Failed SSH addresses",
  "objective": "Extract an IP address from a message with extract().",
  "statement": "In `Syslog`, the `Failed password ... from <IP> port ...` messages contain the source address. Return the number of failures (`Echecs`) per extracted address (`SourceIP`), excluding rows without an address.",
  "hints": [
   "`extract(regex, group, text)` returns the captured group.",
   "Use a verbatim string `@\"...\"` for the regex."
  ],
  "explanation": "`extract` applies a regular expression with a capture group. A verbatim string (`@\"...\"`) avoids doubling the backslashes.",
  "commonMistakes": [
   "Forgetting the group number (1).",
   "Writing the regex without `@` and losing the `\\`."
  ]
 },
 "kql-066": {
  "title": "SSH: success after failures",
  "objective": "Link SSH failures and acceptances on the same source address.",
  "statement": "Define `sources` as the addresses (extracted from the \"Failed password\" messages) with **at least 20 failures**. Then return the `Syslog` rows containing `Accepted` whose extracted address is in `sources`. Columns: `TimeGenerated`, `Computer`, `SyslogMessage`.",
  "hints": [
   "Extract the address in both queries.",
   "End the `let` with a `project SourceIP`."
  ],
  "explanation": "Same pattern as for RDP or Entra ID: many failures, then a success from the same source. A `root` accepted by password from the Internet is an incident to handle.",
  "commonMistakes": [
   "Forgetting to factor out the extraction in both queries.",
   "Leaving several columns in `sources`."
  ]
 },
 "kql-067": {
  "title": "Denied traffic by destination",
  "objective": "Analyze the firewall with CommonSecurityLog.",
  "statement": "In `CommonSecurityLog`, compute per `SourceIP` and per `DestinationPort` the number of **denied** flows (`DeviceAction == \"Deny\"`, column `Refus`), then keep only the pairs with more than one denial.",
  "hints": [
   "Group on **two** columns.",
   "Filter after the aggregation."
  ],
  "explanation": "Grouping by source and port highlights a repetition (scan, port sweep) rather than isolated denials. One denial is noise; twenty is a pattern.",
  "commonMistakes": [
   "Grouping only by source: you lose the port.",
   "Filtering `Refus > 1` before the aggregation."
  ]
 },
 "kql-068": {
  "title": "Sources whose volume exceeds 5 times the average",
  "objective": "Compare to a global value computed with toscalar().",
  "statement": "Compute the total bytes sent per `SourceIP` (`Total`). Return the sources whose total exceeds **5 times the average of the totals**. Use `toscalar()` for the average.",
  "hints": [
   "Name the per-source summary with a `let` to reuse it.",
   "`toscalar()` converts a one-cell table into a value."
  ],
  "explanation": "Comparing each entity to the population is more robust than a fixed threshold. `toscalar` computes the average once; without it, `moyenne` would not be a usable value in the `where`.",
  "commonMistakes": [
   "Using a `let` without `toscalar` for the average.",
   "Comparing to the average of the rows rather than of the totals per source."
  ]
 },
 "kql-069": {
  "title": "PowerShell launched by Word, then a network connection",
  "objective": "Correlate a suspicious process with the network on the same device and within a time window.",
  "statement": "In Advanced Hunting, find the executions of `powershell.exe` launched by `WINWORD.EXE` (`InitiatingProcessFileName`). Join them to the `DeviceNetworkEvents` connections of the **same device** that occurred within the **10 minutes following** the launch. Return `DeviceName`, `Lancement` (the `Timestamp` of the process) and `RemoteUrl`.",
  "hints": [
   "Rename the time columns on each side to avoid ambiguity.",
   "`between (start .. end)` bounds a value."
  ],
  "explanation": "Word launching PowerShell is suspicious in itself; a network connection in the following minutes confirms the execution. Joining on the device alone is broad, it is the time window that makes it precise.",
  "commonMistakes": [
   "Joining without a time bound: you associate any connection of the device.",
   "Forgetting that `Timestamp` exists in both tables."
  ]
 },
 "kql-070": {
  "title": "Assemble: first appearance of an address",
  "objective": "Order a new-element detection.",
  "statement": "Assemble the query that returns the IP addresses (`IPAddress`) whose first appearance is less than 2 days old. One block is a decoy.",
  "hints": [
   "The first-appearance date is computed over the whole history.",
   "The time filter applies to the aggregated column."
  ],
  "explanation": "Filtering on `TimeGenerated` before the aggregation would make every recently active address look \"new\", including the oldest ones.",
  "commonMistakes": [
   "Placing the time filter before `summarize`.",
   "Not aggregating at all."
  ]
 },
 "kql-071": {
  "title": "Fix: a join that loses rows",
  "objective": "Understand that the default join (innerunique) deduplicates the left table.",
  "statement": "We want **every** 4625 event of `SecurityEvent` along with the last heartbeat (`Dernier`) of its `Computer`. However, the number of rows returned is too small. Fix the query to keep all the events.",
  "hints": [
   "Which `kind` is used when none is specified?",
   "This type keeps a single left row per key value."
  ],
  "explanation": "Without `kind`, KQL applies `innerunique`: the **left** table is deduplicated on the key before the join. Rows are therefore lost, which is a silent trap. Always specify `kind=inner` (or another) explicitly.",
  "commonMistakes": [
   "Believing that `join` without `kind` is a classic inner join.",
   "Putting the big table on the right to work around it."
  ]
 },
 "kql-072": {
  "title": "Fix: take before sort",
  "objective": "See why limiting before sorting gives an arbitrary result.",
  "statement": "We want the 5 **largest** flows (`SentBytes`) of `CommonSecurityLog`, with `SourceIP` and `SentBytes`. This query gives wrong results. Fix it.",
  "hints": [
   "The order of operators matters: which one limits before sorting?",
   "`top N by` does both in the right order."
  ],
  "explanation": "`take 5` picks 5 **arbitrary** rows that are then sorted: the result has nothing to do with the 5 largest flows. `top 5 by SentBytes desc` or `sort | take` is correct.",
  "commonMistakes": [
   "Only reversing the sort direction.",
   "Believing that `take` returns the first rows of the table."
  ],
  "check": {
   "rules": [
    {
     "message": "take placed before sort picks arbitrary rows before the sort."
    }
   ]
  }
 },
 "kql-073": {
  "title": "Read a result: how many failures before the success?",
  "objective": "Read the result of a failure/success correlation.",
  "statement": "This query links the RDP failures and the success that follows.",
  "hints": [
   "The result fits on very few rows.",
   "Read the `NbEchecs` column."
  ],
  "explanation": "Sixty failures, then a success on SRV-FILE01 from the same address: this is a probable compromise by brute force. The logical next step is to look for events 4672, 4720 and 4732 on the machine.",
  "commonMistakes": [
   "Reading another column.",
   "Not seeing that the join filtered out earlier successes."
  ],
  "question": "How many failures precede this success?"
 },
 "kql-074": {
  "title": "Read a result: which machine is silent?",
  "objective": "Interpret an absence detection.",
  "statement": "This query lists the machines with no heartbeat for more than a day.",
  "hints": [
   "The sort is descending on the date of the last signal.",
   "The first row has the most recent signal."
  ],
  "explanation": "SRV-WEB01 is a web server: a sudden silence can be an outage, a planned shutdown or an agent disabled by an attacker. You need to correlate with recent changes and account activity.",
  "commonMistakes": [
   "Reading the last row (the oldest silence).",
   "Confusing the last signal and the duration of the silence."
  ],
  "question": "Which machine became silent most recently?"
 },
 "kql-075": {
  "title": "Success rate per address",
  "objective": "Compute a ratio with countif and round, then filter on a minimum volume.",
  "statement": "For each address (`IPAddress`) of `SigninLogs` with at least **20 sign-ins**, return `IPAddress`, `Total`, `Succes` (sign-ins with `ResultType == \"0\"`) and `Taux`, the success percentage rounded to one decimal. Sort by `Taux` ascending.",
  "hints": [
   "`countif` counts the rows that meet a condition.",
   "Multiply by `100.0` to avoid an integer division."
  ],
  "explanation": "A low success rate with a large volume reveals sources that almost always fail: spray, brute force or bot. The volume threshold avoids ranking addresses seen only once.",
  "commonMistakes": [
   "Forgetting the volume threshold and getting 0% rates on a single row.",
   "Computing the percentage without `100.0`."
  ]
 },
 "kql-076": {
  "title": "Locked accounts",
  "objective": "Isolate a specific result code and summarize per account.",
  "statement": "Return the accounts (`UserPrincipalName`) of `SigninLogs` whose sign-in was denied because the account is **locked** (`ResultType == \"50053\"`), with `Verrouillages`, the number of events, and `Derniere`, the most recent date.",
  "hints": [
   "Code 50053 means the account is locked.",
   "Two aggregations in the same `summarize`."
  ],
  "explanation": "A lockout is the result of a brute force or spray that is visible to the legitimate user. It is useful for prioritizing the protection of targeted accounts.",
  "commonMistakes": [
   "Using `ResultType == 50053` without quotes: the column is a string.",
   "Forgetting `by UserPrincipalName`."
  ]
 },
 "kql-077": {
  "title": "Where strong authentication is required",
  "objective": "Group related result codes with in.",
  "statement": "Count, per application (`AppDisplayName`), the sign-ins where multifactor authentication is required (`ResultType` equal to `\"50074\"` or `\"50076\"`). Return `AppDisplayName` and `Exigences`, sorted from largest to smallest.",
  "hints": [
   "`in` accepts a list of values.",
   "Sort after the aggregation."
  ],
  "explanation": "These two codes indicate that multifactor authentication is requested. The applications where it is required most often are the ones targeted first for conditional access policies.",
  "commonMistakes": [
   "Repeating `or` instead of `in`, which is harder to read.",
   "Sorting before the `summarize`."
  ]
 },
 "kql-078": {
  "title": "Who launches PowerShell?",
  "objective": "Profile the parent processes of an executable in Defender XDR.",
  "statement": "In `DeviceProcessEvents`, count the launches of `powershell.exe` per parent process (`InitiatingProcessFileName`). Return `InitiatingProcessFileName` and `Lancements`, from most to least frequent.",
  "hints": [
   "`=~` compares without case sensitivity.",
   "The parent process is in `InitiatingProcessFileName`."
  ],
  "explanation": "Knowing the usual parents of a dual-use tool makes it possible to spot rare parents: a PowerShell launched by Word stands out from a PowerShell launched by a management agent.",
  "commonMistakes": [
   "Using `==` and missing case variations.",
   "Using `TimeGenerated` in this table."
  ]
 },
 "kql-079": {
  "title": "Oversized command lines",
  "objective": "Use strlen to spot unusually long commands.",
  "statement": "Return the launches in `DeviceProcessEvents` whose command line is **longer than 100 characters**, with `Timestamp`, `DeviceName`, `FileName` and `Longueur` (the length of `ProcessCommandLine`). Sort by `Longueur` descending.",
  "hints": [
   "`strlen` returns the length of a string.",
   "Create the column with `extend` before filtering."
  ],
  "explanation": "Very long commands are often encoded or obfuscated payloads. Length alone is not proof, but it is a good sort criterion to focus attention.",
  "commonMistakes": [
   "Filtering on `Longueur` before creating it.",
   "Forgetting that `project` removes the other columns."
  ]
 },
 "kql-080": {
  "title": "Blocked emails and their links",
  "objective": "Join EmailEvents and EmailUrlInfo on NetworkMessageId.",
  "statement": "For each **blocked** email (`DeliveryAction == \"Blocked\"`) in `EmailEvents`, return `Timestamp`, `RecipientEmailAddress` and the URLs it contains (`Url` from `EmailUrlInfo`). Both tables share `NetworkMessageId`.",
  "hints": [
   "Filter the blocked emails first to shrink the join.",
   "Join on `NetworkMessageId`."
  ],
  "explanation": "The URL table links an email to its links. Filtering before the join keeps the left side small, which is faster.",
  "commonMistakes": [
   "Joining all the tables before filtering.",
   "Joining on `Timestamp`, which differs between the tables."
  ]
 },
 "kql-081": {
  "title": "Most active external senders",
  "objective": "Exclude the internal domain and rank the senders.",
  "statement": "Among the emails in `EmailEvents` whose sender domain is **not** `nordlys.example`, return the **5** domains (`SenderFromDomain`) that send the most, with `Courriels`.",
  "hints": [
   "Exclude the internal domain first.",
   "`top 5 by ... desc` replaces `sort` then `take`."
  ],
  "explanation": "The main sender domains form a baseline: a domain that looks like the company's but appears at the bottom of the ranking deserves a closer look.",
  "commonMistakes": [
   "Forgetting the filter on the internal domain.",
   "Putting the `top` before the `summarize`."
  ]
 },
 "kql-082": {
  "title": "Hosts contacting the most destinations",
  "objective": "Use dcount per host on the network.",
  "statement": "In `DeviceNetworkEvents`, return for each device (`DeviceName`) the number of distinct destinations (`RemoteUrl`) under the name `Destinations`. Keep the **3** devices that contact the most.",
  "hints": [
   "`dcount` counts distinct values.",
   "End with `top 5`."
  ],
  "explanation": "A device that contacts far more destinations than its peers may be scanning or doing automated communication. It is a starting indicator, to be cross-checked with context.",
  "commonMistakes": [
   "Using `count` instead of `dcount` and measuring volume rather than diversity."
  ]
 },
 "kql-083": {
  "title": "Failed network connections per device",
  "objective": "Filter on an action type and summarize.",
  "statement": "Return the devices with at least **one** failed network connection (`ActionType == \"ConnectionFailed\"`), with `Echecs`, and the list of distinct destinations attempted in `Destinations` (array built with `make_set(RemoteUrl)`).",
  "hints": [
   "`make_set` gathers the distinct values into an array.",
   "A single `summarize` pass is enough."
  ],
  "explanation": "Connection failures reveal attempts blocked by the firewall or a nonexistent domain. The list of destinations gives the context immediately.",
  "commonMistakes": [
   "Using `make_list`: duplicates appear.",
   "Forgetting the filter on `ActionType`."
  ]
 },
 "kql-084": {
  "title": "RDP sessions per account",
  "objective": "Filter on the Windows session type and summarize per account.",
  "statement": "In `SecurityEvent`, for the successful logons (**4624**) of type **10** (RemoteInteractive, RDP), return the number of sessions per account (`Account`) in `Sessions` and the number of distinct machines in `Machines`. Sort by `Sessions` descending.",
  "hints": [
   "`LogonType` is an integer.",
   "Two aggregations in the same `summarize`."
  ],
  "explanation": "An account that opens RDP sessions on many different machines may indicate lateral movement. Type 10 identifies remote interactive logons.",
  "commonMistakes": [
   "Putting `\"10\"` in quotes for an integer column."
  ]
 },
 "kql-085": {
  "title": "The rarest processes on Windows",
  "objective": "Sort by ascending frequency to find the unusual.",
  "statement": "In `SecurityEvent`, for the process creation events (**4688**), return the **3** **least frequent** processes (`ProcessName`), with `Executions`. In case of a tie, keep the alphabetical order of `ProcessName`.",
  "hints": [
   "Sort ascending so the rare ones come first.",
   "Two sort keys separated by a comma."
  ],
  "explanation": "Rarity is a classic signal: what runs only once across a fleet deserves a look, even if most cases are legitimate.",
  "commonMistakes": [
   "Forgetting the secondary sort key and getting an unstable result."
  ]
 },
 "kql-086": {
  "title": "Linux logs by machine and severity",
  "objective": "Group on two columns.",
  "statement": "In `Syslog`, count the events per machine (`Computer`) and per severity level (`SeverityLevel`) in `Evenements`. Sort by `Computer` then by `Evenements` descending.",
  "hints": [
   "Several grouping columns are separated by commas.",
   "Two sort keys with different directions."
  ],
  "explanation": "Grouping on two dimensions gives a cross-tab in long format, ideal before a chart or a comparison between machines.",
  "commonMistakes": [
   "Using two separate `summarize` operators."
  ]
 },
 "kql-087": {
  "title": "Ports targeted by denied traffic",
  "objective": "Profile the destination ports blocked by the firewall.",
  "statement": "In `CommonSecurityLog`, for the denied actions (`DeviceAction == \"Deny\"`), count per destination port (`DestinationPort`) in `Refus`. Keep the ports with **more than 5** denials, sorted by `Refus` descending.",
  "hints": [
   "The threshold applies after the `summarize`.",
   "Sort at the end."
  ],
  "explanation": "The most denied ports show what is being scanned or attempted: 22, 3389 or 445 often come first when exposure is poorly controlled.",
  "commonMistakes": [
   "Applying the threshold before the aggregation."
  ]
 },
 "kql-088": {
  "title": "Directory operations by category",
  "objective": "Count successes and failures in one pass on AuditLogs.",
  "statement": "In `AuditLogs`, return per `OperationName` the number of successes (`Result == \"success\"`) in `Succes` and of failures (`Result == \"failure\"`) in `Echecs`. Keep only the operations with **at least one failure**.",
  "hints": [
   "Two `countif` in the same `summarize`.",
   "Filter on `Echecs` after the aggregation."
  ],
  "explanation": "In `AuditLogs`, a failure of a privileged operation is valuable: it indicates a blocked attempt. The one-pass summary avoids reading the events one by one.",
  "commonMistakes": [
   "Filtering `Result` before counting, which erases the other category."
  ]
 },
 "kql-089": {
  "title": "Failed Azure operations by caller",
  "objective": "Identify who runs into denials in Azure.",
  "statement": "In `AzureActivity`, return the callers (`Caller`) with failed operations (`ActivityStatusValue == \"Failed\"`), with `Echecs` and the list of distinct operations in `Operations` (`make_set(OperationNameValue)`).",
  "hints": [
   "The status is in `ActivityStatusValue`.",
   "`make_set` produces distinct values."
  ],
  "explanation": "A caller running into repeated denials may be exploring their rights, which is a behavior to watch after a compromise.",
  "commonMistakes": [
   "Confusing `ActivityStatusValue` and `CategoryValue`."
  ]
 },
 "kql-090": {
  "title": "Hours above three times the average",
  "objective": "Compare an hourly series to its overall average with toscalar.",
  "statement": "In `SigninLogs`, count the failures (`ResultType != \"0\"`) per hour (`bin(TimeGenerated, 1h)`) in `Echecs`. Return `Heure` and `Echecs` for the hours where `Echecs` exceeds **three times** the hourly average of failures across all hours. Sort by `Heure`.",
  "hints": [
   "Compute the hourly series in a `let`.",
   "`toscalar` turns a single-value result into a scalar."
  ],
  "explanation": "Comparing to the overall average highlights the spikes. The attack hours stand out clearly from the ordinary noise.",
  "commonMistakes": [
   "Computing the average on the original rows rather than on the hourly series."
  ]
 },
 "kql-091": {
  "title": "Windows and Linux failures together",
  "objective": "Unify two heterogeneous sources with union.",
  "statement": "Count the authentication failures of all machines: the **4625** events of `SecurityEvent` and the `Failed password` messages of `Syslog`. Return `Machine` and `Echecs`, sorted by `Echecs` descending.",
  "hints": [
   "Align the column names before the `union`.",
   "`union` accepts subqueries in parentheses."
  ],
  "explanation": "In a SOC, the same attack hits several platforms. Unifying the sources gives a ranking regardless of the platform.",
  "commonMistakes": [
   "Doing the union before projecting to common columns."
  ]
 },
 "kql-092": {
  "title": "Unified attacker timeline",
  "objective": "Build a timeline from several tables.",
  "statement": "Build the timeline of the address `203.0.113.45`: the rows of `SigninLogs` (`IPAddress`) and of `AzureActivity` (`CallerIpAddress`). Return `TimeGenerated`, `Source` (`\"Entra\"` or `\"Azure\"`) and `Detail` (`ResultType` for Entra, `OperationNameValue` for Azure). Sort by `TimeGenerated`.",
  "hints": [
   "The three columns must exist in each subquery.",
   "A constant can serve as a column value: `Source = \"Entra\"`."
  ],
  "explanation": "A multi-source timeline turns isolated alerts into a story. Here you read the spray, the success, then the Azure operations from the same address.",
  "commonMistakes": [
   "Forgetting the `Source` column and no longer knowing where a row comes from."
  ]
 },
 "kql-093": {
  "title": "Fix: invalid time unit",
  "objective": "Recognize the valid syntax of an interval.",
  "statement": "This query should return the number of failures of the **last 3 days**, but it produces an error. Fix it.",
  "hints": [
   "Time units are written in abbreviated form.",
   "Days: `d`, hours: `h`, minutes: `m`."
  ],
  "explanation": "`ago(3d)` is the correct form. The full word \"hours\" is not recognized as a suffix of a timespan literal.",
  "commonMistakes": [
   "Writing `ago(3 days)` as in natural language."
  ]
 },
 "kql-094": {
  "title": "Fix: column removed too early",
  "objective": "Understand that a project removes the following columns.",
  "statement": "This query should return `UserPrincipalName` and `IPAddress` for the successful sign-ins, but it fails. Fix it without changing its final columns.",
  "hints": [
   "`project` drops all the other columns.",
   "Filter before projecting."
  ],
  "explanation": "After `project`, `ResultType` no longer exists. The natural order of a query: filter first, project afterwards.",
  "commonMistakes": [
   "Adding `ResultType` to the `project`: the result would contain one column too many."
  ]
 },
 "kql-095": {
  "title": "Fix: sum on a string",
  "objective": "Spot an incorrect type in an aggregation.",
  "statement": "This query should return the total volume sent per source address, but it fails. Fix it.",
  "hints": [
   "Which column contains a volume?",
   "`sum` applies to a numeric column."
  ],
  "explanation": "`SourceIP` is a string. The volume is in `SentBytes`. The grouping variable stays `DestinationIP`.",
  "commonMistakes": [
   "Converting `SourceIP` to a number to make the query pass."
  ]
 },
 "kql-096": {
  "title": "Fix: a join that duplicates rows",
  "objective": "Shrink the right side of a join before joining.",
  "statement": "This query should return one row per successful sign-in, with the number of earlier failures from the same address (`NbEchecs`). As written, it returns one row per failure. Fix it.",
  "hints": [
   "Aggregate the right side before joining.",
   "There must be a single row per join key."
  ],
  "explanation": "Joining on a non-unique key multiplies the rows. Aggregating the right side by `IPAddress` guarantees one row per key.",
  "commonMistakes": [
   "Leaving a constant `NbEchecs = 1` instead of the real count."
  ]
 },
 "kql-097": {
  "title": "Assemble: accounts seen in more than one country",
  "objective": "Put the blocks back in logical order.",
  "statement": "Assemble the query that returns the successful accounts seen in **more than one country**, with `UserPrincipalName` and `Pays`. Three blocks are not used.",
  "hints": [
   "Filter the successes before summarizing.",
   "`dcount` counts distinct values; the threshold comes after the `summarize`."
  ],
  "explanation": "The blocks form the sequence filter, aggregation, threshold. `count` would measure sign-ins, not geographic diversity, and a `top` does not set a threshold.",
  "commonMistakes": [
   "Choosing `count` instead of `dcount`.",
   "Placing the threshold before the aggregation."
  ]
 },
 "kql-098": {
  "title": "Assemble: silent machines timeline",
  "objective": "Order a query that computes a silence duration.",
  "statement": "Assemble the query that returns, for each machine, the last heartbeat and the number of hours of silence (`Silence`) since the reference date `datetime(2026-03-12T12:00:00Z)`. Two blocks are not used.",
  "hints": [
   "Summarize before computing the duration.",
   "`datetime_diff(\"hour\", end, start)`."
  ],
  "explanation": "You summarize first to get the last heartbeat, then compute the duration. The 24-hour filter is not part of the request.",
  "commonMistakes": [
   "Reversing the two dates of `datetime_diff` and getting a negative number."
  ]
 },
 "kql-099": {
  "title": "Read a result: who is the most distinct?",
  "objective": "Read a two-column aggregation result.",
  "statement": "Read the query result and answer the question.",
  "hints": [
   "The first row is the one with the most accounts.",
   "Read the `Comptes` column, not `Echecs`."
  ],
  "explanation": "The `top` sorts by number of accounts descending: the first row is the address that targeted the most accounts. This is the mark of a spray, because `Echecs` is close to `Comptes`.",
  "commonMistakes": [
   "Reading `Echecs` instead of `Comptes`."
  ],
  "question": "How many distinct accounts did the first address in the result target?"
 },
 "kql-100": {
  "title": "Read a result: the lowest rate",
  "objective": "Interpret a computed ratio.",
  "statement": "Look at this ranking of addresses by success rate, then identify the most problematic one.",
  "hints": [
   "The sort is ascending on `Taux`.",
   "The first row has the lowest rate."
  ],
  "explanation": "With an ascending sort, the first row has the lowest rate. An address with a low rate and a high volume almost always fails: this is the profile of a brute force.",
  "commonMistakes": [
   "Reading the last row believing the sort is descending."
  ],
  "question": "Which address has the lowest success rate?"
 },
 "kql-101": {
  "title": "Spray per one-hour window",
  "objective": "Detect a spray by bounding the window with bin.",
  "statement": "In `SigninLogs`, for the credential failures (`ResultType == \"50126\"`), return the pairs (`IPAddress`, `Heure` = `bin(TimeGenerated, 1h)`) where the address targeted **at least 10 distinct accounts** (`Comptes`) within the same hour.",
  "hints": [
   "Group on the address **and** on the hour.",
   "The threshold applies after the aggregation."
  ],
  "explanation": "Bounding the spray in a window avoids accumulating unrelated failures over several days. This is the usual form of a scheduled spray rule.",
  "commonMistakes": [
   "Grouping only by address and mixing different days.",
   "Placing the threshold before the `summarize`."
  ]
 },
 "kql-102": {
  "title": "Success within 30 minutes after failures",
  "objective": "Join two observations and bound the time gap with datetime_diff.",
  "statement": "Find the accounts (`UserPrincipalName`) that had a **successful** sign-in from an address (`IPAddress`) within the **30 minutes following** at least **one failure** of the same account from the same address. Return `UserPrincipalName`, `IPAddress` and `Echecs` (number of failures in the window), without duplicates per account and address.",
  "hints": [
   "Rename the failures' time so you do not overwrite `TimeGenerated`.",
   "`between (0 .. 30)` bounds the difference in minutes."
  ],
  "explanation": "A success close to failures of the same account/address pair describes an attacker who finally finds the right password, but also a user who makes a typo before succeeding. The number of failures helps tell them apart.",
  "commonMistakes": [
   "Forgetting to rename the time column on the failures side.",
   "Joining on the account alone and mixing several addresses."
  ]
 },
 "kql-103": {
  "title": "Destinations seen by a single device",
  "objective": "Isolate rare values with dcount then find the device.",
  "statement": "In `DeviceNetworkEvents`, return the destinations (`RemoteUrl`) contacted by **a single** device, with that device (`DeviceName`) in `Appareil` and the number of connections in `Connexions`.",
  "hints": [
   "`dcount(DeviceName)` measures how many devices contacted the destination.",
   "`any()` returns one value of the group, useful when there is only one."
  ],
  "explanation": "The rarity of a destination across a fleet is an indicator of relative value: it focuses the review, it proves nothing. Here the exfiltration destination stands out.",
  "commonMistakes": [
   "Forgetting to filter on `Appareils == 1`.",
   "Using `max` in place of `any` on a string without thinking about it."
  ]
 },
 "kql-104": {
  "title": "Sent to received ratio",
  "objective": "Compare two aggregated volumes and filter on a ratio.",
  "statement": "In `CommonSecurityLog`, compute per pair (`SourceIP`, `DestinationIP`) the sum of `SentBytes` (`Envoye`) and of `ReceivedBytes` (`Recu`). Return the pairs where `Envoye` is **more than 5 times** `Recu`, with `Ratio` (rounded to one decimal).",
  "hints": [
   "Protect against a division by zero with `Recu > 0`.",
   "Multiply by `1.0` for a real division."
  ],
  "explanation": "A flow that sends much more than it receives looks like an upload, whereas web browsing does the opposite. It is a signal complementary to the raw volume.",
  "commonMistakes": [
   "Dividing by a zero total.",
   "Comparing volumes row by row instead of aggregating them."
  ]
 },
 "kql-105": {
  "title": "95th percentile of transfers",
  "objective": "Use percentile to describe the tail of a distribution.",
  "statement": "In `CommonSecurityLog`, return per source address (`SourceIP`) the number of transfers `Nb`, the median value `P50` and the 95th percentile `P95` of `SentBytes`. Sort by `P95` descending.",
  "hints": [
   "`percentile(column, 95)`.",
   "Several percentiles in the same `summarize` are allowed."
  ],
  "explanation": "The 95th percentile describes the heavy tail of a behavior, more informative than the average when a few extreme values dominate. The median gives the usual behavior.",
  "commonMistakes": [
   "Using the average and hiding an exfiltration tail."
  ]
 },
 "kql-106": {
  "title": "Unauthorized addresses with datatable",
  "objective": "Use a datatable as an allow list.",
  "statement": "Define the trusted address list `confiance` with `datatable(IPAddress:string)[\"192.0.2.10\", \"198.51.100.12\"]`. Return the addresses of `SigninLogs` that are **absent** from this list and had **successful** sign-ins, with `Connexions`, sorted by `Connexions` descending. Keep the first **3**.",
  "hints": [
   "`!in` accepts a one-column table name.",
   "End with `top 3`."
  ],
  "explanation": "An inline trusted list illustrates the principle of watchlists: it remains reference data to keep up to date, separate from the query logic.",
  "commonMistakes": [
   "Forgetting to declare the column type in the `datatable`."
  ]
 },
 "kql-107": {
  "title": "Account created then added to a group",
  "objective": "Correlate two Windows events on the same machine within a window.",
  "statement": "In `SecurityEvent`, find the machines (`Computer`) where an account was **created** (4720) then a member was **added to a local group** (4732) within the following **10 minutes**. Return `Computer`, `Creation` (time of the 4720), `Ajout` (time of the 4732) and `Minutes`, the gap between the two.",
  "hints": [
   "Give different column names to the two times.",
   "Compute the gap in minutes before filtering."
  ],
  "explanation": "The sequence of creation then addition to a privileged group in a short time is a persistence signature. The two isolated events are common; their chaining is not.",
  "commonMistakes": [
   "Forgetting to bound the time gap and joining distant events.",
   "Not checking the order (addition before creation)."
  ]
 },
 "kql-108": {
  "title": "Expected servers with no heartbeat at all",
  "objective": "Compare an expected inventory to the observed machines with leftanti.",
  "statement": "Here is the expected inventory: `datatable(Computer:string)[\"SRV-DC01\", \"SRV-FILE01\", \"SRV-WEB01\", \"LNX-APP01\", \"LNX-DB01\", \"SRV-FANTOME01\"]`. Return the inventory machines that have **no** row in `Heartbeat`.",
  "hints": [
   "`leftanti` keeps the left rows with no match on the right.",
   "Shrink the right side with `distinct`."
  ],
  "explanation": "Comparing the expected to the observed reveals machines that were never onboarded. It is one of the most profitable logging coverage checks.",
  "commonMistakes": [
   "Reversing the sides of the join.",
   "Using `inner` and getting the machines that are present."
  ]
 },
 "kql-109": {
  "title": "Malicious addresses seen in Azure",
  "objective": "Reuse a list from one source to filter another.",
  "statement": "Define `suspectes` as the addresses (`IPAddress`) of `SigninLogs` with **at least 20 failures** (`ResultType != \"0\"`). Return the `AzureActivity` operations whose `CallerIpAddress` is in this list, with `TimeGenerated`, `Caller` and `OperationNameValue`.",
  "hints": [
   "The list must be a single column for `in`.",
   "The two tables do not have the same address column name."
  ],
  "explanation": "Moving from one source to the other through the address is the basis of incident correlation: an address identified as hostile in identity is searched for in the management operations.",
  "commonMistakes": [
   "Keeping more than one column in the `let`."
  ]
 },
 "kql-110": {
  "title": "Rare actors in AuditLogs",
  "objective": "Extract a dynamic field and profile the actors.",
  "statement": "In `AuditLogs`, create `Acteur` = `tostring(InitiatedBy.user.userPrincipalName)`. Return per `Acteur` the number of operations (`Operations`) and of failures (`Echecs`, `Result == \"failure\"`). Keep the actors with **fewer than 5 operations**.",
  "hints": [
   "A nested field is accessed with dot notation.",
   "`tostring` converts the dynamic value to a string."
  ],
  "explanation": "Rare actors are those that appear little in the directory: service accounts, recent or compromised accounts. It is a hunting starting point, not a conclusion.",
  "commonMistakes": [
   "Forgetting `tostring` and grouping on a dynamic value."
  ]
 },
 "kql-111": {
  "title": "Operations targeting service accounts",
  "objective": "Expand a dynamic array with mv-expand then filter.",
  "statement": "In `AuditLogs`, expand `TargetResources` with `mv-expand`, extract `Cible = tostring(TargetResources.userPrincipalName)` and keep the rows where the target **starts with** `svc-`. Return `TimeGenerated`, `OperationName`, `Result` and `Cible`.",
  "hints": [
   "`mv-expand` turns each element of the array into a row.",
   "Extract the target before filtering on it."
  ],
  "explanation": "Service accounts targeted by directory operations (creation, role assignment) deserve a review: they are rarely modified legitimately.",
  "commonMistakes": [
   "Filtering before the `mv-expand`.",
   "Forgetting `tostring`."
  ]
 },
 "kql-112": {
  "title": "Share of each destination in the outbound volume",
  "objective": "Compute a share of the total with toscalar.",
  "statement": "In `CommonSecurityLog`, compute per destination (`DestinationIP`) the total volume `Volume` (sum of `SentBytes`) and its share `Part` of the overall volume, as a percentage rounded to one decimal. Return the **3** destinations with the largest share.",
  "hints": [
   "Compute the overall total in a `let` with `toscalar`.",
   "Use `100.0` for a real division."
  ],
  "explanation": "The share tells whether a destination dominates the traffic. An unknown destination that monopolizes a large share of the outbound volume is an exfiltration signal.",
  "commonMistakes": [
   "Computing the share with a per-group total rather than the overall one."
  ]
 },
 "kql-113": {
  "title": "Session type profile per machine",
  "objective": "Build a cross-tab with several countif.",
  "statement": "In `SecurityEvent`, for the successful logons (**4624**), return per machine (`Computer`): `Interactives` (`LogonType == 2`), `Reseau` (`LogonType == 3`) and `RDP` (`LogonType == 10`). Keep the machines with **at least one** RDP session, sorted by `RDP` descending.",
  "hints": [
   "One `countif` per type in the same `summarize`.",
   "Filter on `RDP` after the aggregation."
  ],
  "explanation": "A cross-tab by session type describes how each machine is logged into. A server where RDP dominates although it should not be administered remotely deserves a review.",
  "commonMistakes": [
   "Running three separate queries instead of a single `summarize`.",
   "Filtering on the session type before counting the other types."
  ]
 },
 "kql-114": {
  "title": "Silent machines that still fail",
  "objective": "Cross an agent's silence with another source's activity.",
  "statement": "Return the machines (`Computer`) whose **last heartbeat** is earlier than `datetime(2026-03-12T00:00:00Z)` and that have **at least one 4625 failure** in `SecurityEvent`. Columns: `Computer`, `DernierePulsation`, `Echecs`.",
  "hints": [
   "Compute both sides separately, then join on `Computer`.",
   "Filter the silent machines before the join."
  ],
  "explanation": "A silent agent can hide activity: the point is to spot machines that still have recent failures elsewhere. It is a cross of collection health and detection.",
  "commonMistakes": [
   "Using `ago()`: the reference date is fixed in this playground."
  ]
 },
 "kql-115": {
  "title": "Fix: join columns with different names",
  "objective": "Join with $left and $right when the keys have different names.",
  "statement": "This query should associate each Azure operation with its caller in `SigninLogs` (column `UserPrincipalName`), but the join fails. Fix it.",
  "hints": [
   "The two tables name the key differently.",
   "Use `$left.column == $right.column`."
  ],
  "explanation": "When the names differ, `on Caller` looks for a `Caller` column on both sides. The `$left.X == $right.Y` form specifies the match.",
  "commonMistakes": [
   "Renaming a column with `extend` without keeping the other one."
  ]
 },
 "kql-116": {
  "title": "Fix: datatable without types",
  "objective": "Declare the columns of a datatable correctly.",
  "statement": "This query should count the sign-ins of the two addresses in the list, but the `datatable` declaration is invalid. Fix it.",
  "hints": [
   "Each column of a `datatable` has a type.",
   "The type is written after a colon."
  ],
  "explanation": "A `datatable` requires explicit types: `name:type`. Without a type, the engine cannot interpret the literal values.",
  "commonMistakes": [
   "Putting the types in quotes."
  ]
 },
 "kql-117": {
  "title": "Fix: threshold on the wrong set",
  "objective": "Apply a threshold on distinct accounts and not on rows.",
  "statement": "We want the addresses that targeted **at least 10 distinct accounts** with code `50126`. The query returns addresses that targeted only one account, because it counts rows. Fix it.",
  "hints": [
   "Which function counts distinct values?",
   "A brute force on a single account must not meet the criterion."
  ],
  "explanation": "Spray and brute force are told apart by the number of **accounts** targeted, not by the number of attempts. `dcount` separates the two profiles.",
  "commonMistakes": [
   "Keeping `count()` while lowering the threshold."
  ]
 },
 "kql-118": {
  "title": "Assemble: share of the outbound volume",
  "objective": "Order a query with let, toscalar and extend.",
  "statement": "Assemble the query that returns the share (`Part`, in %) of each destination in the overall outbound volume. Two blocks are not used.",
  "hints": [
   "The `let` comes first.",
   "Compute the volume per destination before the share."
  ],
  "explanation": "The overall total is computed once in the `let`, then reused after the aggregation by destination.",
  "commonMistakes": [
   "Computing the share before the aggregation."
  ]
 },
 "kql-119": {
  "title": "Read a result: the quietest actor",
  "objective": "Read an actor profile and spot the unusual.",
  "statement": "This profile sorts the AuditLogs actors from least to most active. Spot the quietest one.",
  "hints": [
   "The sort is ascending.",
   "Read the `Acteur` column of the first row."
  ],
  "explanation": "The ascending sort puts the rarest actors first. In our data, it is l.bouchard: only three operations, all during the incident, whereas the legitimate administrators have dozens.",
  "commonMistakes": [
   "Reading the last row instead of the first."
  ],
  "question": "Which actor has the fewest operations (first row)?"
 },
 "kql-120": {
  "title": "Read a result: who is missing from the inventory?",
  "objective": "Interpret the result of a leftanti join.",
  "statement": "Read the result of a query that compares a server inventory to the machines sending heartbeats.",
  "hints": [
   "`leftanti` keeps the left rows with no match.",
   "A single row is returned."
  ],
  "explanation": "This machine is in the inventory but never in the heartbeats: it was never onboarded, or its name is wrong in the inventory. Both cases deserve an action.",
  "commonMistakes": [
   "Believing the result lists the machines that are present."
  ],
  "question": "Which inventory machine never sent a heartbeat?"
 }
};
