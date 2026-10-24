#!/usr/bin/env python3
"""Garde-fou d'appels d'outils pour un agent (donnees fictives, aucun reseau).
Principe : le MODELE propose un appel ; le CODE decide (liste blanche, parametres,
approbation, limite de debit). Une instruction trouvee dans une donnee n'a aucun pouvoir."""
import json, sys, re

POLITIQUE = {
    "lire_alerte":      {"effet": "lecture", "params": {"id": r"^INC-\d{1,6}$"}},
    "chercher_ioc":     {"effet": "lecture", "params": {"valeur": r"^[A-Za-z0-9\.\-:/_]{1,120}$"}},
    "ajouter_note":     {"effet": "ecriture_faible", "params": {"id": r"^INC-\d{1,6}$", "texte": r"^.{1,500}$"}},
    "isoler_machine":   {"effet": "action_reelle", "params": {"hote": r"^[A-Z0-9\-]{3,30}$"}},
}
LIMITE_PAR_SESSION = 5

def decider(appel, deja):
    nom, params = appel.get("outil"), appel.get("params", {})
    if nom not in POLITIQUE:
        return "REFUSE", "outil hors liste blanche"
    regles = POLITIQUE[nom]["params"]
    if set(params) != set(regles):
        return "REFUSE", "parametres inattendus ou manquants"
    for k, rx in regles.items():
        if not re.match(rx, str(params[k])):
            return "REFUSE", f"parametre {k} invalide"
    if deja >= LIMITE_PAR_SESSION:
        return "REFUSE", "limite d'appels atteinte"
    if POLITIQUE[nom]["effet"] == "action_reelle":
        return "APPROBATION", "action a effet reel : approbation humaine requise"
    return "AUTORISE", POLITIQUE[nom]["effet"]

if __name__ == "__main__":
    appels = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "appels-fictifs.json"))
    for i, a in enumerate(appels):
        r, why = decider(a, i)
        print(f"{r:12} {a.get('outil')}({json.dumps(a.get('params', {}), ensure_ascii=False)}) : {why}")
