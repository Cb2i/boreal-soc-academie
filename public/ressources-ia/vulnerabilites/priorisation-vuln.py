#!/usr/bin/env python3
"""Priorisation de vulnerabilites transparente (module 13).

Lit un CSV de constats FICTIFS et produit un classement P1..P4 avec la raison de chaque rang.
Principes : regles lisibles, pas de multiplication de scores (FIRST deconseille de multiplier EPSS et CVSS),
une donnee manquante n'est jamais traitee comme "faible", un constat reste visible quel que soit son rang.
Les seuils sont des POINTS DE DEPART a calibrer localement.
Usage : python3 priorisation-vuln.py vulns-fictives.csv
"""
import csv
import json
import sys

SEUIL_EPSS = 0.10   # point de depart, a calibrer sur vos donnees
SEUIL_VPR = 7.0     # bande "High" du VPR Tenable (7.0 et plus)
SEUIL_CVSS = 9.0    # bande "Critical" CVSS v3/v4


def nombre(v):
    v = (v or "").strip()
    return float(v) if v else None


def classer(r):
    raisons = []
    kev = r["kev"] == "oui"
    expose = r["expose_internet"] == "oui"
    critique = r["criticite_actif"] == "haute"
    epss, vpr, cvss = nombre(r["epss"]), nombre(r["vpr"]), nombre(r["cvss"])
    manquant = [n for n, v in (("epss", epss), ("vpr", vpr), ("cvss", cvss)) if v is None]

    if kev:
        raisons.append("exploitation active connue (KEV)")
    if expose:
        raisons.append("actif expose a Internet")
    if critique:
        raisons.append("actif de criticite haute")
    if epss is not None and epss >= SEUIL_EPSS:
        raisons.append(f"EPSS {epss:.2f} >= {SEUIL_EPSS}")
    if vpr is not None and vpr >= SEUIL_VPR:
        raisons.append(f"VPR {vpr} >= {SEUIL_VPR}")
    if cvss is not None and cvss >= SEUIL_CVSS:
        raisons.append(f"CVSS {cvss} >= {SEUIL_CVSS}")
    if manquant:
        raisons.append("donnees manquantes : " + ",".join(manquant) + " (revue humaine)")
    if r["correctif_disponible"] != "oui":
        raisons.append("pas de correctif : prevoir mesure compensatoire")

    menace = kev or (epss is not None and epss >= SEUIL_EPSS) or (vpr is not None and vpr >= SEUIL_VPR)
    contexte = expose or critique
    if kev and contexte:
        rang = "P1"
    elif kev or (menace and expose):
        rang = "P2"
    elif menace or (cvss is not None and cvss >= SEUIL_CVSS and contexte):
        rang = "P3"
    else:
        rang = "P4"
    if manquant and rang == "P4":
        rang = "P3"   # une donnee manquante ne peut pas faire descendre au rang le plus bas
    if critique and r["correctif_disponible"] != "oui" and rang == "P4":
        rang = "P3"   # actif critique sans correctif : on planifie une mesure compensatoire
    return rang, raisons


if __name__ == "__main__":
    lignes = list(csv.DictReader(open(sys.argv[1], encoding="utf-8")))
    sortie = []
    for r in lignes:
        rang, raisons = classer(r)
        sortie.append({"id": r["id"], "actif": r["actif"], "cve": r["cve"], "rang": rang, "raisons": raisons})
    sortie.sort(key=lambda x: (x["rang"], x["id"]))
    for s in sortie:
        print(f"{s['rang']} {s['id']} {s['actif']:<18} | " + "; ".join(s["raisons"]))
    print()
    print(json.dumps({r: sum(1 for s in sortie if s["rang"] == r) for r in ("P1", "P2", "P3", "P4")}))
