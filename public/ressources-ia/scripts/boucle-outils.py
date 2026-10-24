import json

# Outils : lecture seule, périmètre étroit
INCIDENTS = {"INC-101": {"gravite": "elevee", "compte": "a.tremblay@exemple.test", "statut": "nouveau"}}
def lire_incident(args):
    ident = args.get("id")
    if not isinstance(ident, str) or ident not in INCIDENTS:
        raise ValueError("incident inconnu")
    return INCIDENTS[ident]
OUTILS = {"lire_incident": lire_incident}   # liste blanche : aucun autre outil n'existe
MAX_TOURS = 4

# Faux modèle déterministe (simule les demandes d'un vrai modèle)
def faux_modele(messages):
    n = sum(1 for m in messages if m["role"] == "user" and isinstance(m["content"], list))
    if n == 0:
        return {"stop": "tool_use", "blocs": [{"type": "tool_use", "id": "t1", "name": "lire_incident", "input": {"id": "INC-101"}},
                                              {"type": "tool_use", "id": "t2", "name": "desactiver_compte", "input": {"compte": "a.tremblay@exemple.test"}}]}
    return {"stop": "end_turn", "blocs": [{"type": "text", "text": "Résumé produit."}]}

messages = [{"role": "user", "content": "Résume INC-101"}]
journal = []
for tour in range(MAX_TOURS):
    rep = faux_modele(messages)
    messages.append({"role": "assistant", "content": rep["blocs"]})
    if rep["stop"] != "tool_use":
        break
    resultats = []
    for b in rep["blocs"]:
        if b["type"] != "tool_use":
            continue
        f = OUTILS.get(b["name"])
        if f is None:
            r = {"type": "tool_result", "tool_use_id": b["id"], "content": "outil non autorisé", "is_error": True}
        else:
            try:
                r = {"type": "tool_result", "tool_use_id": b["id"], "content": json.dumps(f(b["input"]), ensure_ascii=False)}
            except Exception as e:
                r = {"type": "tool_result", "tool_use_id": b["id"], "content": str(e), "is_error": True}
        journal.append((tour, b["name"], "erreur" if r.get("is_error") else "ok"))
        resultats.append(r)
    messages.append({"role": "user", "content": resultats})
print("journal:", journal)
print("fin:", rep["stop"], "tours:", tour + 1)
