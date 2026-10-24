"""Orchestrateur pédagogique : routage + enchaînement + budget + état + arrêt.
Aucun modèle réel : les « étapes » sont des fonctions déterministes."""
import json

def classer(alerte):                     # étape de routage (règles simples)
    t = alerte["type"]
    if t in ("phishing", "identite", "vulnerabilite"):
        return t
    return "inconnu"

def etape_phishing(etat):
    etat["indicateurs"] = [alerte_url for alerte_url in etat["alerte"].get("urls", [])]
    return "indicateurs extraits"

def etape_identite(etat):
    etat["indicateurs"] = [etat["alerte"].get("compte")]
    return "compte identifié"

def etape_vuln(etat):
    etat["indicateurs"] = [etat["alerte"].get("cve")]
    return "cve identifiée"

def etape_resume(etat):
    etat["resume"] = f'{etat["route"]}: {len(etat["indicateurs"])} indicateur(s)'
    return "résumé produit"

CHAINES = {
    "phishing": [etape_phishing, etape_resume],
    "identite": [etape_identite, etape_resume],
    "vulnerabilite": [etape_vuln, etape_resume],
}

def executer(alerte, budget_etapes=3):
    etat = {"alerte": alerte, "route": classer(alerte), "journal": [], "indicateurs": [], "resume": None}
    if etat["route"] == "inconnu":
        etat["journal"].append("route inconnue -> escalade humaine")
        return etat, "escalade"
    for i, etape in enumerate(CHAINES[etat["route"]]):
        if i >= budget_etapes:
            etat["journal"].append("budget épuisé -> arrêt")
            return etat, "arret_budget"
        etat["journal"].append(f"{etape.__name__}: {etape(etat)}")
    return etat, "termine"

for a in [{"type": "phishing", "urls": ["http://exemple-login.test/verif"]},
          {"type": "identite", "compte": "a.tremblay@exemple.test"},
          {"type": "ddos"}]:
    etat, fin = executer(a)
    print(a["type"], "->", fin, "|", etat["journal"], "|", etat["resume"])
etat, fin = executer({"type": "phishing", "urls": ["http://x.test"]}, budget_etapes=1)
print("budget=1 ->", fin, "|", etat["journal"])
