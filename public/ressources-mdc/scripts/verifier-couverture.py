"""Ressource : calcule les écarts de couverture à partir de donnees/couverture-fictive.csv.
Version de portée : MDC-2026.10.25-r1 | Nature : lecture seule (aucun accès réseau) | Données : fictives.
Impact : aucun | Coût : aucun | Nettoyage : aucun. Exécuter : python3 -I verifier-couverture.py
Un écart n'est jamais une preuve d'absence de protection ni l'inverse : il désigne où vérifier."""
import csv, os

chemin = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "donnees", "couverture-fictive.csv")
ecarts = []
with open(chemin, newline="", encoding="utf-8") as f:
    for ligne in csv.DictReader(f):
        attendues = int(ligne["machines_attendues"])
        saines = int(ligne["machines_en_bonne_sante"])
        if ligne["servers_plan"] == "aucun" and attendues > 0:
            ecarts.append((ligne["abonnement"], "aucun plan Servers pour %d machines" % attendues))
        elif saines < attendues:
            ecarts.append((ligne["abonnement"], "%d machines sur %d en bonne santé" % (saines, attendues)))
        if ligne["environnement"] == "production" and ligne["defender_cspm"] != "oui":
            ecarts.append((ligne["abonnement"], "production sans Defender CSPM"))

for abonnement, message in ecarts:
    print("%s : %s" % (abonnement, message))
print("Total des écarts à investiguer : %d" % len(ecarts))
