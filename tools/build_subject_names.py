#!/usr/bin/env python3
"""Validate the naming records and render their repository reading views.

JSON is the editable source. This checks recorded consistency, not semantic
exclusion or universal completeness. The boundary arguments remain explicit.
"""
import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / 'research/type-relations'
catalog = json.loads((DATA / 'subject-names.json').read_text())
analysis = json.loads((DATA / 'subject-name-analysis.json').read_text())
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

def cell(value):
    return str(value).replace('|', '\\|').replace('\n', '<br>')

def table(headers, rows):
    return '\n'.join(['| ' + ' | '.join(headers) + ' |', '|' + '|'.join('---' for _ in headers) + '|'] + ['| ' + ' | '.join(cell(c) for c in row) + ' |' for row in rows]) + '\n'

def anchor(name):
    return re.sub(r'[^a-z0-9 -]', '', name.lower()).replace(' ', '-')

out = ['# Named subjects\n', 'Canonical names for the present working inventory. Each row defines one determination; parent headings collect their listed matters. These are partial scopes, not a certified exclusive partition of every possible subject. See the [derivation](../../research/type-relations/SUBJECT-NAMES.md) and [boundary review](../../cases/subject-names.md).\n', f'{len(entries)} named determinations · {len(groups)} target groups · {len(roots)} general headings.\n']
out.append(table(['General heading', 'Named determinations', 'Defined scope'], [(f'[{r}](#{anchor(r)})', sum(e['root'] == r for e in entries), roots[r]['scope']) for r in roots]))
for root, record in roots.items():
    out += [f'## {root}\n', record['scope'] + '\n']
    selected = [e for e in entries if e['root'] == root]
    for group in dict.fromkeys(e['parent'] for e in selected):
        if group != root:
            out += [f'### {group}\n']
        out.append(table(['Name', 'Matter to settle', 'Does not by itself settle'], [(e['name'], e['settles'], e['excludes']) for e in selected if e['parent'] == group]))
    edges = [(e['name'], '; '.join(e.get('broader_subjects', []))) for e in selected if e.get('broader_subjects')]
    if edges:
        out += ['Explicit broader subjects from the boundary review:\n', table(['Qualified subject', 'Containing subject'], edges)]
(REPO / 'subjects/scopes/NAMES.md').write_text('\n'.join(out))

out = ['# Subject name changes\n', 'This map distinguishes renaming from splits, target qualification, aliases, and rejected ambiguity. Old wording is retained here as evidence; it is not a second canonical name inventory.\n', table(['Earlier scope', 'Earlier name', 'Current names or target groups', 'Change', 'Reason'], [(r['code'], r['old'], '; '.join(r['names']), r['relation'], r['reason']) for r in analysis['name_changes']]), '[Named inventory](NAMES.md) · [Naming derivation](../../research/type-relations/SUBJECT-NAMES.md)\n']
(REPO / 'subjects/scopes/NAME-CHANGES.md').write_text('\n'.join(out))

out = ['# Subject naming boundary review\n', 'Constructed cases examining the new definitions. Distinct requested determinations do not imply disjoint classes of episodes. Aliases are merged, qualified targets are linked to their broader subjects, and unresolved overlaps remain explicit. This is not a complete pairwise exclusion proof.\n', table(['First subject', 'Compared subject', 'Relation', 'Separating or shared case', 'Consequence'], [(r['a'], r['b'], r['relation'], r['case'], r['consequence']) for r in analysis['boundary_cases']]), '[Named inventory](../subjects/scopes/NAMES.md) · [Derivation](../research/type-relations/SUBJECT-NAMES.md)\n']
(REPO / 'cases/subject-names.md').write_text('\n'.join(out))

out = ['# Source contributions within named subjects\n', 'The 63 source contribution records preserve their earlier particular purpose and proposed result. Sixty-two have proposed subject specializations or components; one exact conceptual target remains unspecified. A binding is not blanket equivalence with the earlier expression, and does not certify implementation or general effectiveness.\n', table(['Source family', 'Earlier project contribution', 'Literal subject', 'Particular matter', 'Proposed result', 'Scope fit', 'Standing'], [(r['family'], r['earlier_name'], '; '.join(r['names']) or 'Exact target unresolved', r['particular_matter'], r['proposed_result'], r['scope_fit'], r['standing']) for r in analysis['project_bindings']]), '[Named inventory](NAMES.md) · [Existing local designs](../../research/SCOPE-SYSTEMS.md)\n']
(REPO / 'subjects/scopes/PROJECT-BINDINGS.md').write_text('\n'.join(out))

print(json.dumps({'named_subjects': len(entries), 'target_groups': len(groups), 'general_headings': len(roots), 'name_changes': len(analysis['name_changes']), 'boundary_cases': len(analysis['boundary_cases']), 'project_bindings': len(analysis['project_bindings']), 'standing': 'Recorded consistency, not semantic completeness'}))
