#!/usr/bin/env python3
"""Valide une sortie JSON de triage contre sortie-triage.schema.json (necessite le paquet jsonschema)."""
import json, sys
from jsonschema import Draft202012Validator

schema = json.load(open(sys.argv[1], encoding="utf-8"))
v = Draft202012Validator(schema)
for nom, doc in {
  "valide": {"classification":"vrai_positif","gravite":"elevee","justification":"Connexion inhabituelle puis regle de transfert [E1,E2].","preuves":["E1","E2"],"action_proposee":"escalader","anomalies":[]},
  "action_hors_liste": {"classification":"vrai_positif","gravite":"elevee","justification":"Connexion inhabituelle puis regle de transfert [E1,E2].","preuves":["E1"],"action_proposee":"envoyer_courriel","anomalies":[]},
  "sans_preuve": {"classification":"faux_positif","gravite":"faible","justification":"Probablement un test, rien a signaler.","preuves":[],"action_proposee":"aucune","anomalies":[]},
}.items():
    erreurs = sorted(e.message for e in v.iter_errors(doc))
    print(f"{nom:18} {'OK' if not erreurs else 'REFUSE : ' + erreurs[0][:70]}")
