#!/usr/bin/env python3
"""Check recorded references and render the subject integration reading views.

These checks do not infer equivalence, prove prerequisite necessity, measure
worldwide attention, or establish the effectiveness of the described methods.
"""
import json
from pathlib import Path

REPO=Path(__file__).resolve().parents[1]
DATA=REPO/'research/type-relations'
atlas=json.loads((DATA/'subject-integration.json').read_text())
catalog=json.loads((DATA/'subject-names.json').read_text())
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

def cell(v):return str(v).replace('|','\\|').replace('\n','<br>')
def table(headers,rows):
    return '\n'.join(['| '+' | '.join(headers)+' |','|'+'|'.join('---' for _ in headers)+'|']+['| '+' | '.join(cell(c) for c in row)+' |' for row in rows])+'\n'
def refs(ids):
    return '; '.join('['+sources[s]['title']+']('+sources[s]['url']+')' if sources[s]['url'] else sources[s]['title'] for s in ids)

out=['# Existing terms translated into precise subjects\n',
     'These are authored proposed translations of stated readings. They preserve entry points from existing disciplines without admitting each broad name as an atomic subject. A mapping may be partial, qualified, or a program decomposition. It is not blanket equivalence. See the [integration argument](INTEGRATION.md).\n']
for c in atlas['coverage']:
    out += ['## '+c['domain']+'\n',c['residual']+'\n',table(['Source term','Reading examined','Actual subjects','Relation','Uncovered matter or restriction','Sources'],[(r['source_term'],r['reading'],'; '.join(r['subjects']),r['relation'],r['residual'],refs(r['source_ids'])) for r in atlas['translations'] if r['domain']==c['domain']])]
(DATA/'DOMAIN-TRANSLATIONS.md').write_text('\n'.join(out))

out=['# Subject requirements\n',
     'A requirement is a scoped proposition. It is not automatically an earlier operation. Necessary case specification, successful operation conditions, quality conditions, method prerequisites, justification requirements, and conditions under study have different force. These 39 records are an examined subset; requirements for every catalog subject are not yet exhaustively derived.\n',
     table(['Subject','Requirement kind','Condition','When','Scope','Related subject','Reason'],[(r['subject'],r['kind'],r['condition'],r['timing'],r['scope'],r['related_subject'],r['reason']) for r in atlas['requirements']]),
     '## Separating cases\n',table(['Case','Situation','Consequence'],[(r['case'],r['situation'],r['consequence']) for r in atlas['requirement_cases']]),
     '[Integration argument](INTEGRATION.md) · [Current catalog](../../subjects/scopes/NAMES.md)\n']
(DATA/'SUBJECT-REQUIREMENTS.md').write_text('\n'.join(out))

out=['# Subject development evidence\n',
     'Importance is relative to stated goals. Attention needs a corpus, aliases, period, effort unit and denominator. No worldwide neglect ranking or fabricated maturity score is recorded. The JSON and workbook have a profile for every subject; open assessments are explicit, not completed reviews.\n',
     '## Scoped importance assessments\n',table(['Subject','Purpose','Consequence','Development standing'],[(r['subject'],r['importance_context'],r['importance_reason'],r['recognition']) for r in atlas['development'] if r['importance_context']!='Importance not yet assessed against specified goals.']),
     '## Techniques with source evidence\n',table(['Subject','Technique','Examined scope','Formal standing','Implementation','Effectiveness evidence','Transfer limit','Source'],[(r['subject'],r['technique'],r['scope'],r['formal'],r['implementation'],r['effectiveness'],r['transfer'],refs(r['source_ids'])) for r in atlas['techniques']]),
     '## What a nonsense verdict must identify\n',table(['Complaint','Specified case','Standing','Next result','Limit','Basis'],[(r['label'],r['case'],r['status'],r['action'],r['limit'],r['basis']) for r in atlas['claim_review']]),
     '## Candidate gaps\n',table(['Subject','Catalog gap','Why it matters','Next result','Novelty standing'],[(r['subject'],r['gap'],r['importance'],r['next_result'],r['novelty']) for r in atlas['gaps']]),
     '## Programs built from subjects\n',table(['Program','Intended result','Subject contributions','Customization','Next result'],[(r['name'],r['goal'],'; '.join(r['subjects']),r['customization'],r['next_result']) for r in atlas['programs']]),
     '[Integration argument](INTEGRATION.md) · [Translations](DOMAIN-TRANSLATIONS.md) · [Requirements](SUBJECT-REQUIREMENTS.md)\n']
(DATA/'SUBJECT-DEVELOPMENT.md').write_text('\n'.join(out))
print(json.dumps({k:len(atlas[k]) for k in ['translations','requirements','requirement_cases','development','techniques','claim_review','programs','gaps','coverage','sources']}))
