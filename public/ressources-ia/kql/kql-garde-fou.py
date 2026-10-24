#!/usr/bin/env python3
"""Garde-fou heuristique pour du KQL propose par un assistant (module 12).

Ce script NE COMPREND PAS le KQL : il applique des controles simples et lisibles avant la relecture humaine.
Il ne se connecte a aucun service et n'execute aucune requete.
Usage : python3 kql-garde-fou.py schema-kql.json   (lance les cas de demonstration)
        python3 kql-garde-fou.py schema-kql.json requete.kql
"""
import json
import re
import sys

KEYWORDS = set("""
where project extend summarize join lookup union take limit top sort order by asc desc on kind inner leftouter
let materialize ago now bin count countif dcount make_set make_list arg_max arg_min min max sum avg
has has_any has_all contains in in~ startswith endswith matches regex isnotempty isempty tostring toint todouble
datetime between and or not true false distinct parse_json mv-expand todynamic strcat iff case coalesce
format_datetime datetime_diff dynamic string int long real bool timespan project-away project-rename
render timechart barchart by_ out set external_data ipv4_is_private split replace_string extract
""".split())

def check(query: str, schema: dict):
    problems = []
    q = query.strip()
    code = re.sub(r"//.*", "", q)                      # commentaires
    strings = re.findall(r'"(?:[^"\\]|\\.)*"', code)
    bare = re.sub(r'"(?:[^"\\]|\\.)*"', '""', code)    # chaines retirees pour l'analyse

    if re.search(r"(^|\n)\s*\.", bare):
        problems.append("commande de gestion (ligne commencant par un point) : refusee, lecture seule uniquement")
    if re.search(r"\b(externaldata|evaluate\s+http|http_request)\b", bare, re.I):
        problems.append("acces externe (externaldata / http_request) : refuse")

    m = re.match(r"\s*(?:let\b.*?;\s*)*([A-Za-z_]\w*)", bare, re.S)
    tables = [t for t in schema["tables"] if re.search(rf"\b{t}\b", bare)]
    if not tables:
        problems.append("aucune table du schema verifie n'est utilisee")
        return problems

    time_ok = any(re.search(rf"\b{schema['tables'][t]['time']}\b\s*(>|>=|between)", bare) for t in tables)
    if not time_ok:
        problems.append("aucun filtre de temps sur la colonne de temps de la table")
    if not re.search(r"\b(take|limit|top|summarize|count|distinct)\b", bare):
        problems.append("pas de borne de resultat (take, limit, top, summarize, count)")

    known = set()
    for t in tables:
        known.update(schema["tables"][t]["columns"])
    lets = set(re.findall(r"\blet\s+(\w+)\s*=", bare))
    aliases = set(re.findall(r"\b(\w+)\s*=", bare))     # noms crees par summarize / extend / project
    tabs = set(schema["tables"])
    for tok in sorted(set(re.findall(r"\b[A-Z][A-Za-z0-9_]*\b", bare))):
        if tok in known or tok in lets or tok in aliases or tok in tabs or tok.lower() in KEYWORDS:
            continue
        problems.append(f"nom inconnu du schema verifie : {tok} (colonne inventee ? verifier avec getschema)")
    return problems

DEMOS = {
    "ok-echecs-puis-succes": """SigninLogs
| where TimeGenerated > ago(24h)
| where UserPrincipalName =~ "b.roy@exemple.test"
| summarize Echecs = countif(ResultType != "0"), Succes = countif(ResultType == "0") by IPAddress, bin(TimeGenerated, 1h)
| where Echecs > 5 and Succes > 0
| take 100""",
    "ok-incidents-etat-courant": """SecurityIncident
| where TimeGenerated > ago(14d)
| summarize arg_max(TimeGenerated, *) by IncidentNumber
| where Status != "Closed"
| project IncidentNumber, Title, Severity, Status, LastModifiedTime
| take 200""",
    "colonne-inventee": """SigninLogs
| where TimeGenerated > ago(1d)
| where RiskScore > 50
| take 10""",
    "sans-filtre-de-temps": """SigninLogs
| where UserPrincipalName == "x@exemple.test"
| take 10""",
    "commande-de-gestion": """.set-or-append Resultats <| SigninLogs
| where TimeGenerated > ago(1d)
| take 10""",
}

if __name__ == "__main__":
    schema = json.load(open(sys.argv[1], encoding="utf-8"))
    if len(sys.argv) > 2:
        cases = {sys.argv[2]: open(sys.argv[2], encoding="utf-8").read()}
    else:
        cases = DEMOS
    for name, query in cases.items():
        probs = check(query, schema)
        print(f"{name}: {'ACCEPTE (relecture humaine requise)' if not probs else 'REFUSE'}")
        for p in probs:
            print(f"   - {p}")
