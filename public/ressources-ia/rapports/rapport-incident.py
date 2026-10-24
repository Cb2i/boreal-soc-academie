#!/usr/bin/env python3
"""Generateur de rapport d'incident a partir d'un enregistrement structure (module 15).

Principe : le rapport NE DIT RIEN que les preuves ne soutiennent pas.
 - chaque ligne de chronologie doit citer au moins une preuve existante, sinon elle est marquee NON SOUTENUE ;
 - les adresses de courriel sont pseudonymisees dans la sortie (option --pseudonymiser) ;
 - les limites declarees sont reprises telles quelles ; si elles sont vides, le script avertit.
Aucun modele de langage n'est appele : c'est la partie deterministe d'un generateur, celle qu'un modele ne doit pas remplacer.
Usage : python3 rapport-incident.py incident-fictif.json [--pseudonymiser]
"""
import hashlib
import json
import re
import sys


def pseudo(texte: str) -> str:
    def remplace(m):
        h = hashlib.sha256(m.group(0).lower().encode()).hexdigest()[:6]
        return f"utilisateur-{h}"
    texte = re.sub(r"[\w.+-]+@[\w.-]+", remplace, texte)
    return re.sub(r"\bb\.roy\b", lambda m: "utilisateur-" + hashlib.sha256(b"b.roy").hexdigest()[:6], texte)


def construire(inc: dict, anonyme: bool):
    sortie, alertes = [], []
    f = pseudo if anonyme else (lambda x: x)
    sortie.append(f"# Rapport d'incident {inc['id']}")
    sortie.append(f"**{f(inc['titre'])}** (severite : {inc['severite']})")
    sortie.append("")
    sortie.append("## Chronologie")
    for e in inc["chronologie"]:
        ids = e.get("preuves", [])
        valides = [i for i in ids if i in inc["preuves"]]
        if not valides:
            alertes.append(f"{e['heure']} : affirmation sans preuve ({f(e['evenement'])})")
            sortie.append(f"- {e['heure']} {f(e['evenement'])} **[NON SOUTENUE : aucune preuve citee]**")
        else:
            sortie.append(f"- {e['heure']} {f(e['evenement'])} [{', '.join(valides)}]")
    sortie.append("")
    sortie.append("## Impact")
    sortie.append(f(inc["impact"]))
    sortie.append("")
    sortie.append("## Actions")
    for a in inc["actions"]:
        sortie.append(f"- {a['action']} ({a['etat']})")
    sortie.append("")
    sortie.append("## Preuves")
    for k, v in inc["preuves"].items():
        sortie.append(f"- {k} ({v['source']}) : {f(v['extrait'])}")
    sortie.append("")
    sortie.append("## Limites")
    if inc.get("limites"):
        for l in inc["limites"]:
            sortie.append(f"- {l}")
    else:
        alertes.append("aucune limite declaree : un rapport honnete en a toujours")
        sortie.append("- (aucune limite declaree)")
    return "\n".join(sortie), alertes


if __name__ == "__main__":
    inc = json.load(open(sys.argv[1], encoding="utf-8"))
    rapport, alertes = construire(inc, "--pseudonymiser" in sys.argv)
    print(rapport)
    print("\n---\nCONTROLES")
    print("OK : toutes les lignes sont soutenues" if not alertes else "\n".join("ALERTE : " + a for a in alertes))
