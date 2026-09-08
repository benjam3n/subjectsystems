#!/usr/bin/env python3
import json
from pathlib import Path

REPO=Path(__file__).resolve().parents[1]
DATA=REPO/'studies/subject'
atlas=json.loads((DATA/'subject-integration.json').read_text())
catalog=json.loads((REPO/'subjects/catalog.json').read_text())
names={e['name'] for e in catalog['subjects']}
sources={e['id']:e for e in atlas['sources']}
requirements={e['id'] for e in atlas['requirements']}
techniques={e['id'] for e in atlas['techniques']}
assert len(requirements)==len(atlas['requirements'])
assert len(techniques)==len(atlas['techniques'])
assert len({r['id'] for r in atlas['translations']})==len(atlas['translations'])
assert {r['subject'] for r in atlas['development']}==names
assert len(atlas['development'])==len(names)
for key in ['translations','requirements','development','techniques','claim_review','programs','gaps']:
    for row in atlas[key]:
        assert set(row.get('source_ids',[])) <= set(sources), (key,row)
        assert set(row.get('subjects',[])) <= names, (key,row)
        if 'subject' in row: assert row['subject'] in names, (key,row)
        if row.get('related_subject'): assert row['related_subject'] in names
        assert set(row.get('requirements',[])) <= requirements
        assert set(row.get('technique_ids',[])) <= techniques
for row in atlas['translations']:
    assert row['reading'] and row['subjects'] and row['residual']
for row in atlas['requirements']:
    assert all(row[k] for k in ['kind','condition','timing','scope','reason'])
domains={r['domain'] for r in atlas['coverage']}
assert {r['domain'] for r in atlas['translations']}==domains
for c in atlas['coverage']:
    assert set(c['translation_ids'])=={r['id'] for r in atlas['translations'] if r['domain']==c['domain']}
for e in catalog['subjects']:
    assert set(e.get('source_ids',[]))<=set(sources)

from descriptions import table, write

def refs(ids):
    return '; '.join('['+sources[s]['title']+']('+sources[s]['url']+')' if sources[s]['url'] else sources[s]['title'] for s in ids)

out=[]
for c in atlas['coverage']:
    out += ['## '+c['domain'], table(['Source term','Interpretation','Subject','Relation','Boundary','Source'],[(r['source_term'],r['reading'],'; '.join(r['subjects']),r['relation'],r['residual'],refs(r['source_ids'])) for r in atlas['translations'] if r['domain']==c['domain']])]
write(DATA/'domain-translation.md',out)
write(DATA/'requirement.md',[
    table(['Subject','Requirement type','Condition','Timing','Scope','Related subject','Reason'],[(r['subject'],r['kind'],r['condition'],r['timing'],r['scope'],r['related_subject'],r['reason']) for r in atlas['requirements']]),
    '## Subject requirement case',table(['Case','Situation','Consequence'],[(r['case'],r['situation'],r['consequence']) for r in atlas['requirement_cases']])])
write(DATA/'development.md',[
    '## Subject importance',table(['Subject','Purpose','Consequence','Evidence'],[(r['subject'],r['importance_context'],r['importance_reason'],r['recognition']) for r in atlas['development'] if r['importance_context']!='Importance not yet assessed against specified goals.']),
    '## Technique',table(['Subject','Technique','Scope','Specification','Implementation','Effectiveness','Transfer condition','Source'],[(r['subject'],r['technique'],r['scope'],r['formal'],r['implementation'],r['effectiveness'],r['transfer'],refs(r['source_ids'])) for r in atlas['techniques']]),
    '## Claim examination',table(['Claim','Case','Result','Operation','Boundary','Basis'],[(r['label'],r['case'],r['status'],r['action'],r['limit'],r['basis']) for r in atlas['claim_review']]),
    '## Subject scope gap',table(['Subject','Gap','Consequence','Target','Prior development'],[(r['subject'],r['gap'],r['importance'],r['next_result'],r['novelty']) for r in atlas['gaps']]),
    '## Study program',table(['Program','Result','Subject','Modification','Target'],[(r['name'],r['goal'],'; '.join(r['subjects']),r['customization'],r['next_result']) for r in atlas['programs']])])
print(f"{len(atlas['translations'])} translations; {len(atlas['requirements'])} requirements")
