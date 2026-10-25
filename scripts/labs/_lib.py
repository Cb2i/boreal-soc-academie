import json, re, sys
def P(title, goal, steps, expected, check):
    return dict(title=title, goal=goal, steps=steps.strip(), expected=expected.strip(), check=check)
def L(id, module, level, title, problem, tools, client, mission, duration, parts, deliverables, success, risks, extensions, facts=None, mode='simule', context='defender-xdr', connected=None, resources=None):
    lab = dict(client=client.strip(), mission=mission, duration=duration, mode=mode, parts=parts, deliverables=deliverables, context=context)
    if facts: lab['facts'] = [dict(title=t, head=h, rows=r) for t, h, r in facts]
    o = dict(id=id, module=module, level=level, title=title, problem=problem, architecture='Voir le déroulement du lab.', tools=tools,
             data='Données fictives de Nordlys Technologies fournies dans le lab.', steps=[p['title'] for p in parts], success=success, risks=risks, extensions=extensions, lab=lab)
    if connected: o['connected'] = connected
    if resources: o['resources'] = resources
    return o
def emit(path, const, labs):
    s = json.dumps(labs, ensure_ascii=False, indent=1)
    if '—' in s: 
        i = s.index('—'); sys.exit('em dash: ' + s[max(0,i-60):i+60])
    open(path, 'w').write("import type { AiProject } from '../../agentic/types.ts';\n\n// Généré par scripts/labs/*.py : ne pas éditer à la main.\nexport const %s: AiProject[] = %s;\n" % (const, s))
    print(path, len(labs), len(s))
