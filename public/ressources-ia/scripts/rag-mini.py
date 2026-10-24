"""Mini RAG pédagogique : découpage, recherche par mots-clés (TF-IDF simplifié), citations, mesure.
Données entièrement fictives. Aucun modèle de langage, aucun réseau."""
import math, re, unicodedata

DOCS = {
  "RB-PHISH-01": "Procédure phishing. Si un courriel contient un lien suspect, extraire l'URL, vérifier le domaine, "
                 "chercher les autres destinataires dans les journaux de messagerie, puis demander le blocage de l'URL au pare-feu après approbation du responsable.",
  "RB-IDENT-02": "Procédure compte compromis. Vérifier les connexions inhabituelles dans les journaux de connexion, "
                 "forcer la réinitialisation du mot de passe, révoquer les sessions actives et vérifier les règles de transfert de courriel.",
  "RB-VULN-03":  "Procédure vulnérabilités critiques. Prioriser selon l'exposition à Internet, la présence d'un exploit connu et la criticité de l'actif. "
                 "Une vulnérabilité exposée avec exploit connu est traitée sous 72 heures.",
}

def norm(t):
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return re.findall(r"[a-z0-9]+", t)

def decouper(doc_id, texte):
    phrases = [p.strip() for p in re.split(r"(?<=[.])\s+", texte) if p.strip()]
    return [{"id": f"{doc_id}#{i+1}", "doc": doc_id, "texte": p} for i, p in enumerate(phrases)]

CHUNKS = [c for d, t in DOCS.items() for c in decouper(d, t)]
N = len(CHUNKS)
df = {}
for c in CHUNKS:
    for m in set(norm(c["texte"])):
        df[m] = df.get(m, 0) + 1

def score(requete, chunk):
    toks = norm(chunk["texte"])
    s = 0.0
    for m in set(norm(requete)):
        tf = toks.count(m)
        if tf:
            s += tf * math.log((N + 1) / (df.get(m, 0) + 0.5))
    return s

def chercher(requete, k=3, seuil=1.0):
    res = sorted(((score(requete, c), c) for c in CHUNKS), key=lambda x: -x[0])
    return [(round(s, 2), c) for s, c in res[:k] if s >= seuil]

# Jeu d'essais : requête -> document attendu (None = rien d'applicable)
ESSAIS = [
  ("que faire d'un lien suspect dans un courriel", "RB-PHISH-01"),
  ("comment révoquer les sessions d'un compte compromis", "RB-IDENT-02"),
  ("délai pour une vulnérabilité exposée avec exploit connu", "RB-VULN-03"),
  ("procédure de sauvegarde des serveurs de fichiers", None),
]
ok = 0
for q, attendu in ESSAIS:
    r = chercher(q, k=1)
    trouve = r[0][1]["doc"] if r else None
    bon = (trouve == attendu)
    ok += bon
    print(("OK " if bon else "ECHEC "), q, "->", trouve, r[0][0] if r else "")
print(f"exactitude top-1: {ok}/{len(ESSAIS)}")
print("citation exemple:", chercher("délai pour une vulnérabilité exposée avec exploit connu", k=1)[0][1]["id"])
