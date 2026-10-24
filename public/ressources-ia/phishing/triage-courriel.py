#!/usr/bin/env python3
"""Analyse deterministe d'un courriel (.eml) pour le triage d'hameconnage (module 14).

Ce script NE SE CONNECTE A RIEN : il n'ouvre aucun lien, ne telecharge rien, n'execute aucune piece jointe.
Il lit le fichier, releve des indicateurs verifiables et PROPOSE un verdict. Un humain decide.
Les adresses sont affichees "defangees" (hxxps, [.]) pour eviter les clics accidentels.
Usage : python3 triage-courriel.py courriel-fictif-1.eml courriel-fictif-2.eml
"""
import email
import json
import re
import sys
from email import policy
from html.parser import HTMLParser
from urllib.parse import urlparse

DOMAINES_ORG = ["contoso.example"]   # domaines legitimes de l'organisation fictive


def defang(s: str) -> str:
    return s.replace("http", "hxxp").replace(".", "[.]")


def domaine_adresse(valeur: str) -> str:
    m = re.search(r"@([A-Za-z0-9.-]+)", valeur or "")
    return m.group(1).lower() if m else ""


def distance(a: str, b: str) -> int:
    """Distance d'edition (Levenshtein), suffisante pour de courts noms de domaine."""
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def ressemble(domaine: str) -> bool:
    """Vrai si le domaine n'est pas celui de l'organisation mais lui ressemble."""
    if not domaine or domaine in DOMAINES_ORG or any(domaine.endswith("." + d) for d in DOMAINES_ORG):
        return False
    base = [d.split(".")[0] for d in DOMAINES_ORG]
    premier = domaine.split(".")[0]
    return any(distance(premier, b) <= 2 or b in premier for b in base)


class Liens(HTMLParser):
    def __init__(self):
        super().__init__()
        self.liens, self._href, self._texte = [], None, []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self._href = dict(attrs).get("href")
            self._texte = []

    def handle_data(self, data):
        if self._href is not None:
            self._texte.append(data)

    def handle_endtag(self, tag):
        if tag == "a" and self._href is not None:
            self.liens.append((self._href, "".join(self._texte).strip()))
            self._href = None


def analyser(chemin: str) -> dict:
    msg = email.message_from_file(open(chemin, encoding="utf-8"), policy=policy.default)
    indicateurs = []
    d_from = domaine_adresse(msg["From"])
    d_rp = domaine_adresse(msg["Return-Path"])
    d_reply = domaine_adresse(msg["Reply-To"])
    auth = (msg["Authentication-Results"] or "").lower()

    for nom in ("spf", "dkim", "dmarc"):
        m = re.search(rf"{nom}=(\w+)", auth)
        if m and m.group(1) in ("fail", "softfail", "none", "temperror", "permerror"):
            indicateurs.append({"id": f"auth-{nom}", "preuve": f"{nom}={m.group(1)}", "poids": "fort" if nom == "dmarc" else "moyen"})
    if d_rp and d_from and d_rp != d_from:
        indicateurs.append({"id": "from-vs-returnpath", "preuve": f"From={d_from} / Return-Path={d_rp}", "poids": "moyen"})
    if d_reply and d_from and d_reply != d_from:
        indicateurs.append({"id": "reply-to-different", "preuve": f"From={d_from} / Reply-To={d_reply}", "poids": "moyen"})
    if ressemble(d_from):
        indicateurs.append({"id": "domaine-ressemblant", "preuve": f"{d_from} ressemble a {DOMAINES_ORG[0]}", "poids": "fort"})

    corps = msg.get_body(preferencelist=("html", "plain"))
    html = corps.get_content() if corps else ""
    p = Liens()
    p.feed(html)
    liens = []
    for href, texte in p.liens:
        h = (urlparse(href).hostname or "").lower()
        t = (urlparse(texte).hostname or "").lower() if texte.startswith("http") else ""
        liens.append(defang(href))
        if t and h and t != h:
            indicateurs.append({"id": "lien-texte-different", "preuve": f"texte={defang(texte)} / cible={defang(href)}", "poids": "fort"})
        if ressemble(h):
            indicateurs.append({"id": "lien-domaine-ressemblant", "preuve": defang(h), "poids": "fort"})

    forts = sum(1 for i in indicateurs if i["poids"] == "fort")
    if forts >= 2:
        verdict = "suspect_fort"
    elif indicateurs:
        verdict = "indetermine"
    else:
        verdict = "aucun_indicateur"
    return {
        "fichier": chemin, "sujet": str(msg["Subject"]), "liens": liens, "indicateurs": indicateurs,
        "verdict_propose": verdict,
        "action_proposee": "mise_en_quarantaine_simulee_en_attente_approbation" if verdict == "suspect_fort" else "revue_analyste",
        "avertissement": "Proposition automatique heuristique. Aucun lien ouvert. Un analyste decide.",
    }


if __name__ == "__main__":
    for chemin in sys.argv[1:]:
        print(json.dumps(analyser(chemin), ensure_ascii=False, indent=2))
