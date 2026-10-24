#!/usr/bin/env python3
"""Controle pre-deploiement d'un agent (donnees fictives, aucun reseau, aucun deploiement).
Verifie la FORME de la configuration ; ne prouve pas que le deploiement est sur."""
import json, sys

def controles(c):
    p = []
    if not c.get("proprietaire"): p.append("BLOQUANT : aucun proprietaire")
    if c.get("secrets", {}).get("mode") not in ("coffre", "identite_geree"):
        p.append("BLOQUANT : secrets hors coffre ou identite geree")
    if c.get("identite") in ("compte-administrateur", "compte-analyste"):
        p.append("BLOQUANT : identite non dediee ou trop large")
    if not c.get("approbation_actions_reelles"):
        p.append("BLOQUANT : actions reelles sans approbation humaine")
    if c.get("plafond_budget_mensuel") in (None, 0):
        p.append("BLOQUANT : aucun plafond de budget")
    if not c.get("journalisation"): p.append("BLOQUANT : journalisation absente")
    if not c.get("retour_arriere"): p.append("AVERTISSEMENT : retour arriere non prevu")
    if not c.get("jeu_evaluation_rejoue"): p.append("BLOQUANT : jeu d'evaluation non rejoue")
    return p

if __name__ == "__main__":
    cfg = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "config-agent-fictive.json"))
    pb = controles(cfg)
    for x in pb: print(x)
    bloq = sum(1 for x in pb if x.startswith("BLOQUANT"))
    print(f"\nBloquants : {bloq}  Decision : {'NON PRET' if bloq else 'PRET POUR REVUE'}")
    sys.exit(1 if bloq else 0)
