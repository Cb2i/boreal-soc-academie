#!/usr/bin/env python3
"""Verification d'hygiene d'une base de connaissances de runbooks Markdown (module 15).

Controles : metadonnees obligatoires presentes, proprietaire nomme, date de prochaine revue non depassee,
statut valide. Une base que l'on n'entretient pas devient une source de fausses certitudes, surtout si un assistant
(RAG, module 9) s'en sert pour repondre.
Usage : python3 kb-hygiene.py runbooks/ [AAAA-MM-JJ]   (la date du jour peut etre passee pour un resultat reproductible)
"""
import datetime
import pathlib
import re
import sys

OBLIGATOIRES = ["titre", "proprietaire", "revision", "prochaine_revue", "statut"]
STATUTS = {"brouillon", "approuve", "obsolete"}


def lire(chemin):
    m = re.match(r"^---\n(.*?)\n---\n", chemin.read_text(encoding="utf-8"), re.S)
    meta = {}
    if m:
        for ligne in m.group(1).splitlines():
            if ":" in ligne:
                k, v = ligne.split(":", 1)
                meta[k.strip()] = v.strip()
    return meta


if __name__ == "__main__":
    dossier = pathlib.Path(sys.argv[1])
    today = datetime.date.fromisoformat(sys.argv[2]) if len(sys.argv) > 2 else datetime.date.today()
    total_problemes = 0
    for f in sorted(dossier.glob("*.md")):
        meta, problemes = lire(f), []
        for champ in OBLIGATOIRES:
            if not meta.get(champ):
                problemes.append(f"champ manquant : {champ}")
        if meta.get("statut") and meta["statut"] not in STATUTS:
            problemes.append(f"statut invalide : {meta['statut']}")
        if meta.get("prochaine_revue"):
            if datetime.date.fromisoformat(meta["prochaine_revue"]) < today:
                problemes.append(f"revue depassee depuis {meta['prochaine_revue']}")
        total_problemes += len(problemes)
        print(f"{f.name}: {'OK' if not problemes else 'A CORRIGER'}")
        for p in problemes:
            print(f"   - {p}")
    print(f"\nProblemes : {total_problemes} (date de reference : {today})")
