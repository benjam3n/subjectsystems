#!/usr/bin/env python3
"""Validate recorded references and render the concrete perspective results."""
import json
from pathlib import Path
from run_perspective_case import evaluate

REPO = Path(__file__).resolve().parents[1]
D = REPO / 'research/type-relations'
p = json.loads((D/'perspective-investigation.json').read_text())
c = json.loads((D/'subject-names.json').read_text())
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

def cell(v): return str(v).replace('|','\\|').replace('\n','<br>')
def table(headers,rows):
    return '\n'.join(['| '+' | '.join(headers)+' |','|'+'|'.join('---' for _ in headers)+'|']+['| '+' | '.join(cell(x) for x in row)+' |' for row in rows])+'\n'
def refs(source_ids):
    return '; '.join('['+sources[s]['title']+']('+sources[s]['url']+')' if sources[s]['url'] else sources[s]['title'] for s in source_ids)

out=['# Consequences of changing the perspective\n',
     'Each row performs a specified reconstruction and derives a consequence. The resulting proposals are not universal identity claims or measured performance gains. See the [argument](PERSPECTIVES.md).\n',
     table(['Matter','Starting view','Transformation performed','What becomes available','Remaining limit','Actual subjects'],[(r['domain'],r['native'],r['transformation'],r['result'],r['limit'],'; '.join(r['subjects'])) for r in p['frame_applications']]),
     '## Questions that remain unsettled\n',
     table(['Subject','Open question','Result that would advance it'],[(r['subject'],r['question'],r['next_result']) for r in p['questions']])]
(D/'FRAME-APPLICATIONS.md').write_text('\n'.join(out))

out=['# Working-memory functional branch reconciliation\n',p['source_boundary']['inventory_rule']+'\n',
     '**Coverage:** '+p['source_boundary']['coverage_claim']+' Reviewed '+p['source_boundary']['date']+'. The dated inventory is preserved in the JSON; the source websites can subsequently change.\n',
     p['source_boundary']['outside_claim']+'\n',
     table(['Source label','Role','Actual subjects','Disposition','Residual','Source'],[(r['source_label'],r['role'],'; '.join(r['subjects']),r['disposition'],r['residual'],refs(r['source_ids'])) for r in p['source_reconciliation']]),
     '## Defining qualifications\n',
     table(['Qualification','Logical force','Actual subjects','Consequence'],[(r['qualification'],r['force'],'; '.join(r['subjects']),r['consequence']) for r in p['source_qualifications']]),
     '## Associated source labels\n',
     f'{len(p["source_associations"])} source occurrences are retained below. These are associated biological and paradigm labels, not {len(p["source_associations"])} extra canonical subjects, proven necessary mechanisms or independent results.\n']
out += [x+'\n' for x in p['association_inventory_notes']]
for source_id in dict.fromkeys(r['source_id'] for r in p['source_associations']):
    out += ['### '+sources[source_id]['title']+'\n',refs([source_id])+'\n',
            table(['Source category','Associated labels'],[(cat,'; '.join(r['label'] for r in p['source_associations'] if r['source_id']==source_id and r['source_category']==cat)) for cat in dict.fromkeys(r['source_category'] for r in p['source_associations'] if r['source_id']==source_id)])]
out += ['The local catalog gained dedicated active-content interference, interference control, binding, support-dependence and persistence-duration matters. This is a detected omission in this catalog; global scientific novelty is not claimed.\n',
        '[Translations](DOMAIN-TRANSLATIONS.md) · [Requirements](SUBJECT-REQUIREMENTS.md) · [Development](SUBJECT-DEVELOPMENT.md)\n']
(D/'WORKING-MEMORY-RECONCILIATION.md').write_text('\n'.join(out))

n=p['naming_execution']
out=['# Approach-selection execution: shape rotation\n',
     '[Local custom system](../../'+n['local_system']+') · [Perspective investigation](PERSPECTIVES.md)\n',
     '**Subject:** '+n['subject']+'\n','**Case:** '+n['case']+'\n',
     'The inspected input is commit `'+n['input_commit']+'`. The local descendant adapts the pinned Reasoningtool2 contract; it is not a claim to have run an original named skill.\n',
     '## Required result\n','\n'.join('- '+r for r in n['requirements'])+'\n',
     '## Candidate approaches compared\n',
     table(['Approach','Expected contribution','Examined result','Decision','Reason'],[(r['approach'],r['anticipated_contribution'],r['examined_result'],r['decision'],r['reason']) for r in n['candidates']]),
     '## Executed changes\n',
     table(['Earlier name','Current name','Stable identity','Scope consequence'],[(r['old'],r['new'],r['stable_id'],r['effect']) for r in n['result_changes']]),
     n['actual_result']+'\n',
     'The generator verifies both stable IDs still identify the revised names, neither former name remains canonical, both completion conditions differ, all translated subject references resolve, and the finite case matches its current inputs. The naming and integration generators validate their own references. These checks establish recorded consistency, not universal subject exclusion.\n',
     'The source paper title containing Mental Rotation remains unchanged. Old type experiments and pinned source snapshots retain their original meanings. Current canonical references in the naming and integration records use the revised names.\n',
     '## Limits\n','\n'.join('- '+r for r in n['limits'])+'\n']
(D/'APPROACH-SELECTION-CASE.md').write_text('\n'.join(out))

case=p['deviation_case'];by_id={r['id']:r for r in case['outcomes']}
out=['# Deviation, dominance and payoff totals\n',case['standing']+'\n',
     'One shared resource has six stipulated feasible arrangements. Larger payoff is preferred by each of two participants. Chaotic sharing is the baseline for the better/worse columns. The feasible set and payoff representation stay fixed during each comparison.\n',
     table(['Arrangement','A payoff','B payoff','A versus baseline','B versus baseline','Total'],[(r['label'],*r['payoffs'],*next(x['relations'] for x in result['baseline_comparisons'] if x['id']==r['id']),result['payoff_totals'][r['id']]) for r in case['outcomes']]),
     'Scheduled use improves both participants relative to chaotic sharing. It does not improve both relative to exclusive use by A or B. The example therefore separates a beneficial departure from a universally best arrangement.\n',
     '**Nondominated arrangements:** '+', '.join(by_id[k]['label'] for k in result['nondominated'])+'. There is no arrangement that simultaneously attains both individual maxima of 6. Scheduled use uniquely maximizes the stipulated total of 8, but choosing total payoff is an additional evaluative rule.\n',
     '**Payoff structure:** the full domain has varying totals, so it is not constant-sum or zero-sum. Restricting the domain to the two exclusive-use outcomes gives a constant total of 6. Under a fixed affine normalization that subtracts 3 from each payoff, that restricted domain has zero total; its opposed choices do not prove the broader domain zero-sum.\n',
     '## Every established dominance relation\n',table(['Dominating arrangement','Dominated arrangement'],[(by_id[a]['label'],by_id[b]['label']) for a,b in result['dominance_pairs']]),
     '## What perfection can mean\n',
     'For a specified feasible set D and ordering, a best departure d* must satisfy d* at least as good as d for every admitted d. A nondominated departure merely has no competitor that is no worse everywhere and better somewhere. These conditions differ. In this case there are three nondominated arrangements and no common best for both individual criteria.\n',
     'Even a single objective need not have an attained optimum: if feasible values are every real number x with 0 < x < 1 and larger is better, the supremum is 1 but no feasible x attains it. Thus Deviation optimality attainability has a real possible negative result. An applied optimality claim additionally needs the model assumptions and feasibility evidence to hold in the actual case.\n',
     '## Reproduce the result\n','Run `python3 tools/run_perspective_case.py` from the repository. The result JSON retains the exact dominance pairs, baseline differences, totals and a hash of the case inputs.\n',
     '\n'.join('- '+r for r in case['interpretation_limits'])+'\n',
     '[Executable calculation](../../tools/run_perspective_case.py) · [Inputs](perspective-investigation.json) · [Results](perspective-case-results.json) · [Argument](PERSPECTIVES.md)\n']
(D/'DEVIATION-CASE.md').write_text('\n'.join(out))
print(json.dumps({'new_subjects':len(p['subject_ids']),'frame_applications':len(p['frame_applications']),'functional_labels':len(p['source_reconciliation']),'source_associations':len(p['source_associations']),'actual_name_changes':len(n['result_changes']),'dominance_pairs':len(result['dominance_pairs'])}))
