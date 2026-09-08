#!/usr/bin/env python3
import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / 'studies/subject'
catalog = json.loads((REPO / 'subjects/catalog.json').read_text())
analysis = json.loads((REPO / 'subjects/relations.json').read_text())
entries = catalog['subjects']
names = {e['name']: e for e in entries}
groups = {e['parent'] for e in entries}
roots = {r['name']: r for r in catalog['roots']}
known = set(names) | groups | set(roots)

assert len(names) == len(entries), 'Duplicate canonical names'
assert len({e['id'] for e in entries}) == len(entries), 'Duplicate subject IDs'
for e in entries:
    assert e['name'].startswith(e['root'] + ' ')
    assert e['parent'] == e['root'] or e['name'].startswith(e['parent'] + ' ')
    assert not re.search(r'\band\b|[&/]', e['name'], re.I), e['name']
    assert e['settles'] and e['excludes']
    for p in e.get('broader_subjects', []):
        assert p in names and p != e['name'], (e['name'], p)
for e in entries:
    pending = list(e.get('broader_subjects', []))
    visited = set()
    while pending:
        p = pending.pop()
        assert p != e['name'], f'Containment cycle at {p}'
        if p not in visited:
            visited.add(p)
            pending.extend(names[p].get('broader_subjects', []))
for r in analysis['name_changes']:
    assert set(r['names']) <= known, r
for r in analysis['project_bindings']:
    assert set(r['names']) <= set(names), r
for r in analysis['expansion_families']:
    assert set(r['names']) <= set(names), r
assert len({r['family'] for r in analysis['project_bindings']}) == 21
assert len({r['code'] for r in analysis['name_changes'] if re.fullmatch('[A-Z][1-5]', r['code'])}) == 28

from descriptions import table, write, link

def anchor(name):
    return re.sub(r'[^a-z0-9 -]', '', name.lower()).replace(' ', '-')

systems = json.loads((REPO/'systems/catalog.json').read_text())['systems']
index = []
for root in sorted(roots):
    record = roots[root]
    page = REPO/'subjects'/f'{anchor(root)}.md'
    selected = [e for e in entries if e['root'] == root]
    out = [record['scope']]
    for group in dict.fromkeys(e['parent'] for e in selected):
        if group != root:
            out.append('## ' + group)
        out.append(table(['Subject', 'Definition', 'Exclusion'], [(e['name'], e['settles'], e['excludes']) for e in selected if e['parent'] == group]))
    edges = [(e['name'], '; '.join(e.get('broader_subjects', []))) for e in selected if e.get('broader_subjects')]
    if edges:
        out.append(table(['Subject', 'Containing subject'], edges))
    local = [s for s in systems if s['root'] == root]
    studies = sorted((REPO/'studies'/anchor(root)).glob('*.md'))
    if studies:
        out += ['## Study', '\n'.join('- '+link(page,p,root+' '+p.stem.replace('-',' ')) for p in studies)]
    if local:
        out += ['## System', '\n'.join('- '+link(page,REPO/s['path'],s['name']) for s in local)]
    write(page, out)
    index.append((root, page, record['scope']))
for page in [REPO/'README.md', REPO/'subjects/README.md']:
    write(page,[table(['Subject','Definition'],[(link(page,p,root),scope) for root,p,scope in index]),
                '\n'.join('- '+link(page,REPO/d/'README.md',name) for d,name in [('studies','Study'),('systems','System'),('sources','Source')])])
write(REPO/'studies/subject/name-change.md', [table(['Earlier scope','Earlier name','Name','Relation','Reason'], [(r['code'],r['old'],'; '.join(r['names']),r['relation'],r['reason']) for r in analysis['name_changes']])])
write(REPO/'cases/subject-name-boundary.md', [table(['Subject','Compared subject','Relation','Case','Consequence'], [(r['a'],r['b'],r['relation'],r['case'],r['consequence']) for r in analysis['boundary_cases']])])
write(REPO/'studies/system/source-contribution.md', [table(['Source','Earlier contribution','Subject','Matter','Result','Scope relation','Evidence'], [(r['family'],r['earlier_name'],'; '.join(r['names']) or 'Unresolved',r['particular_matter'],r['proposed_result'],r['scope_fit'],r['standing']) for r in analysis['project_bindings']])])
print(f'{len(entries)} subjects; {len(roots)} types; {len(groups)} target groups')
