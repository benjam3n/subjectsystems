#!/usr/bin/env python3
import json
from pathlib import Path
from run_perspective_case import evaluate

REPO = Path(__file__).resolve().parents[1]
D = REPO / 'studies/subject'
p = json.loads((D/'perspective-investigation.json').read_text())
c = json.loads((REPO/'subjects/catalog.json').read_text())
i = json.loads((D/'subject-integration.json').read_text())
result = json.loads((D/'perspective-case-results.json').read_text())
names = {r['name']: r for r in c['subjects']}
ids = {r['id']: r for r in c['subjects']}
sources = {r['id']: r for r in i['sources']}
translations = {r['id']: r for r in i['translations']}
assert result == evaluate(p['deviation_case']), 'Regenerate the finite case after changing its inputs.'
assert len(set(p['subject_ids'])) == len(p['subject_ids'])
assert set(p['subject_ids']) <= set(ids)
for section in ['frame_applications','source_reconciliation','source_qualifications']:
    for row in p[section]:
        assert set(row['subjects']) <= set(names), (section,row)
        assert set(row.get('source_ids',[])) <= set(sources)
assert set(p['source_boundary']['expected_labels']) == {r['source_label'] for r in p['source_reconciliation']}
assert len(p['source_reconciliation']) == len(p['source_boundary']['expected_labels'])
for row in p['source_reconciliation']:
    assert translations[row['translation_id']]['subjects'] == row['subjects']
for row in p['source_associations']: assert row['source_id'] in sources
for row in p['questions']: assert row['subject'] in names
for row in p['naming_execution']['result_changes']:
    assert ids[row['stable_id']]['name'] == row['new']
    assert row['old'] not in names
assert names['Shape representation rotation']['settles'] != names['Shape representation rotation mechanism']['settles']

from descriptions import table, write, link

def refs(source_ids):
    return '; '.join('['+sources[s]['title']+']('+sources[s]['url']+')' if sources[s]['url'] else sources[s]['title'] for s in source_ids)

write(REPO/'studies/perspective/transformation.md',[
    table(['Matter','Interpretation','Operation','Result','Boundary','Subject'],[(r['domain'],r['native'],r['transformation'],r['result'],r['limit'],'; '.join(r['subjects'])) for r in p['frame_applications']]),
    '## Perspective question',table(['Subject','Question','Target'],[(r['subject'],r['question'],r['next_result']) for r in p['questions']])])
out=[table(['Source label','Role','Subject','Relation','Boundary','Source'],[(r['source_label'],r['role'],'; '.join(r['subjects']),r['disposition'],r['residual'],refs(r['source_ids'])) for r in p['source_reconciliation']]),
     '## Memory qualification',table(['Qualification','Logical force','Subject','Consequence'],[(r['qualification'],r['force'],'; '.join(r['subjects']),r['consequence']) for r in p['source_qualifications']])]
for sid in dict.fromkeys(r['source_id'] for r in p['source_associations']):
    out += ['## '+sources[sid]['title'], refs([sid]), table(['Source category','Associated label'],[(cat,'; '.join(r['label'] for r in p['source_associations'] if r['source_id']==sid and r['source_category']==cat)) for cat in dict.fromkeys(r['source_category'] for r in p['source_associations'] if r['source_id']==sid)])]
write(REPO/'studies/memory/functional-branch.md',out)
n=p['naming_execution'];path=REPO/'cases/shape-rotation.md'
write(path,[n['case'],table(['Approach','Contribution','Result','Selection','Reason'],[(r['approach'],r['anticipated_contribution'],r['examined_result'],r['decision'],r['reason']) for r in n['candidates']]),
            table(['Earlier name','Name','Identity','Scope change'],[(r['old'],r['new'],r['stable_id'],r['effect']) for r in n['result_changes']]),
            table(['System','Input commit'],[(link(path,REPO/n['local_system'],'Reasoning approach selection'),n['input_commit'])])])
case=p['deviation_case'];by_id={r['id']:r for r in case['outcomes']}
write(REPO/'cases/resource-sharing.md',[
    table(['Arrangement','A payoff','B payoff','A change','B change','Total'],[(r['label'],*r['payoffs'],*next(x['relations'] for x in result['baseline_comparisons'] if x['id']==r['id']),result['payoff_totals'][r['id']]) for r in case['outcomes']]),
    table(['Property','Result'],[('Input','Stipulated payoffs'),('Baseline','Chaotic sharing'),('Nondominated arrangements',', '.join(by_id[k]['label'] for k in result['nondominated'])),('Common optimum','None'),('Individual maxima',str(result['criterion_maxima'])),('Full domain constant sum',result['full_domain_constant_sum']),('Restricted domain constant sum',result['restricted_domain_constant_sum'])]),
    '## Game payoff dominance',table(['Dominating arrangement','Dominated arrangement'],[(by_id[a]['label'],by_id[b]['label']) for a,b in result['dominance_pairs']]),
    '## Deviation optimality attainability','For feasible values 0 < x < 1 ordered by magnitude, the supremum is 1. No feasible value attains it.'])
print(f"{len(p['source_reconciliation'])} memory labels; {len(result['dominance_pairs'])} dominance relations")
