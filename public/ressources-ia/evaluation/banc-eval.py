#!/usr/bin/env python3
"""Banc d'evaluation minimal (donnees fictives). Compare un 'systeme' de triage
a des decisions attendues et rapporte des mesures AVEC leur taille d'echantillon."""
import json, sys

def systeme_naif(texte):
    # Regle volontairement simpliste : represente un systeme a evaluer.
    t = texte.lower()
    if "test planifie" in t or "habituelle" in t or "habituel" in t and "aucun" in t:
        return "fermer"
    if "consigne" in t or "regle de transfert" in t or "massif" in t:
        return "escalader"
    return "fermer"

def evaluer(cas, systeme):
    vp = fp = fn = vn = 0
    erreurs = []
    for c in cas:
        sortie = systeme(c["entree"])
        pos_att, pos_obt = c["attendu"] == "escalader", sortie == "escalader"
        if pos_att and pos_obt: vp += 1
        elif pos_obt: fp += 1
        elif pos_att: fn += 1
        else: vn += 1
        if sortie != c["attendu"]:
            erreurs.append((c["id"], c["attendu"], sortie))
    return vp, fp, fn, vn, erreurs

if __name__ == "__main__":
    cas = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "cas-triage.json"))
    vp, fp, fn, vn, err = evaluer(cas, systeme_naif)
    n = len(cas)
    rappel = vp / (vp + fn) if vp + fn else float("nan")
    precision = vp / (vp + fp) if vp + fp else float("nan")
    print(f"Cas : {n} (echantillon petit : ne pas generaliser)")
    print(f"VP={vp} FP={fp} FN={fn} VN={vn}")
    print(f"Rappel (menaces escaladees) : {rappel:.2f}")
    print(f"Precision : {precision:.2f}")
    for e in err:
        print(f"ERREUR {e[0]} : attendu {e[1]}, obtenu {e[2]}" + ("  <- menace manquee" if e[1] == "escalader" else ""))
