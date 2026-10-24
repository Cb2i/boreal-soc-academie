"""Simulateur de triage SOC : règles déterministes + validation humaine obligatoire.
Données fictives. Aucun modèle de langage, aucun réseau, aucune action réelle.
Un vrai assistant remplacerait `proposer()` par un appel de modèle, mais conserverait
la validation de sortie, la décision humaine et la simulation des actions."""
import json

ALERTES = [
  {"id": "A-1", "type": "phishing", "gravite": "elevee", "utilisateur": "a.tremblay", "destinataires": 14, "url_connue_malveillante": True},
  {"id": "A-2", "type": "identite", "gravite": "moyenne", "utilisateur": "b.roy", "pays_inhabituel": True, "mfa_reussi": True, "compte_privilegie": False},
  {"id": "A-3", "type": "identite", "gravite": "elevee", "utilisateur": "svc-admin", "pays_inhabituel": True, "mfa_reussi": False, "compte_privilegie": True},
  {"id": "A-4", "type": "inconnu", "gravite": "faible", "utilisateur": "c.gagnon"},
]

VERDICTS = {"vrai_positif", "faux_positif", "benin_attendu", "indetermine"}

def proposer(a):
    """Proposition automatique (règles). Retourne un dict conforme au schéma."""
    preuves, verdict, conf = [], "indetermine", "faible"
    if a["type"] == "phishing":
        if a.get("url_connue_malveillante"):
            verdict, conf = "vrai_positif", "eleve"
            preuves.append("url_connue_malveillante = True")
        if a.get("destinataires", 0) > 5:
            preuves.append(f'{a["destinataires"]} destinataires')
    elif a["type"] == "identite":
        if a.get("pays_inhabituel") and not a.get("mfa_reussi"):
            verdict, conf = "vrai_positif", "moyen"
            preuves += ["pays inhabituel", "MFA non réussi"]
        elif a.get("pays_inhabituel") and a.get("mfa_reussi"):
            verdict, conf = "indetermine", "faible"
            preuves += ["pays inhabituel", "MFA réussi (atténuant)"]
    action = {"vrai_positif": "preparer_confinement", "indetermine": "demander_analyste"}.get(verdict, "aucune")
    return {"alerte": a["id"], "verdict": verdict, "confiance": conf, "preuves": preuves, "action_proposee": action}

def valider_proposition(p, a):
    erreurs = []
    if p["verdict"] not in VERDICTS: erreurs.append("verdict hors énumération")
    if p["verdict"] == "vrai_positif" and not p["preuves"]: erreurs.append("vrai positif sans preuve")
    if p["action_proposee"] == "preparer_confinement" and a.get("compte_privilegie"): p["approbation_renforcee"] = True
    return erreurs

def decision_humaine(p):
    """Simule la file d'approbation : AUCUNE action n'est exécutée par le code."""
    if p["action_proposee"] == "preparer_confinement":
        return "en_attente_approbation"
    if p["action_proposee"] == "demander_analyste":
        return "assigne_analyste"
    return "ferme_pour_revue"

for a in ALERTES:
    p = proposer(a)
    err = valider_proposition(p, a)
    etat = "rejete: " + "; ".join(err) if err else decision_humaine(p)
    print(a["id"], p["verdict"], p["confiance"], "|", etat, "| renforcee" if p.get("approbation_renforcee") else "")
