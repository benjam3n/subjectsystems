#!/usr/bin/env python3
import hashlib,json,os,re
from pathlib import Path
R=Path(__file__).resolve().parents[1];D=R/'studies/system'
u=json.loads((D/'study-systems.json').read_text());e=json.loads((D/'execution-results.json').read_text())
names={r['name'] for r in json.loads((R/'subjects/catalog.json').read_text())['subjects']}
sources={r['id']:r for r in u['sources']};methods={r['id']:r for r in u['techniques']}
assert len(sources)==len(u['sources']) and len(methods)==len(u['techniques'])
assert len({r['id'] for r in u['studies']})==len(u['studies'])
assert e['method_sha256']==hashlib.sha256((R/'tools/study_methods.py').read_bytes()).hexdigest(),'Rerun study cases after method changes.'
for s in sources.values():
    if s['local_path']:
        b=(R/s['local_path']).read_bytes();assert len(b)==s['bytes'] and hashlib.sha256(b).hexdigest()==s['sha256']
for row in u['studies']:
    assert row['subject'] in names and row['question'] and row['contribution']
    assert set(row['source_ids'])<=set(sources)
    assert set(row['technique_ids'])<=set(methods)
for row in u['techniques']:
    assert set(row['subjects'])<=names and set(row['source_ids'])<=set(sources)
    assert all(row[k] for k in ['inputs','operation','output','conditions','termination','remaining_discretion','verification','transfer_limit'])
for row in u['compositions']:
    assert row['subject'] in names and set(row['technique_ids'])<=set(methods)
    assert (R/row['local_path']).is_file(),row['local_path']
for row in u['family_views']:assert set(row['subjects'])<=names

from descriptions import table, write, link

def refs(ids, page):
    return '; '.join(link(page,R/sources[s]['local_path'],sources[s]['title']) if sources[s]['local_path'] else '['+sources[s]['title']+']('+sources[s]['url']+')' for s in ids)

page=D/'study.md';out=[]
for family in dict.fromkeys(r['family'] for r in u['studies']):
    out += ['## '+family,table(['Subject','Question','Result','Technique','Source'],[(r['subject'],r['question'],r['contribution'],'; '.join(r['technique_ids']) or 'Unspecified',refs(r['source_ids'],page)) for r in u['studies'] if r['family']==family])]
write(page,out)
page=D/'technique.md';out=[]
for m in u['techniques']:
    out += ['## '+m['name'],table(['Property','Description'],[(label,m[key]) for label,key in [('Derivation','derivation'),('Input','inputs'),('Operation','operation'),('Output','output'),('Condition','conditions'),('Termination','termination'),('Unspecified operation','remaining_discretion'),('Verification','verification'),('Implementation','implementation'),('Transfer condition','transfer_limit')]]),refs(m['source_ids'],page)]
out += ['## Technique applicability',table(['Source feature','Decision','Case','Modification','Source'],[(r['label'],r['status'],r['case'],r['repair'],refs(r['source_ids'],page)) for r in u['admission_decisions']])]
write(page,out)
write(D/'execution.md',[
    '## Goal achievement condition',table(['Condition','Source rule','Local rule'],[('All required conditions met; no optional condition met; activity not abandoned','No numeric branch applies','Achieved; optional shortfall recorded separately')]),
    '## Goal achievement case',table(['Dimension','Value'],[(k,', '.join(v)) for k,v in e['gate_domain'].items()]),
    table(['Result','Count'],[(status,sum(r['result']['achievement']==status for r in e['achievement_cases'])) for status in ['achieved','not_achieved','undetermined']]),
    '## Claim inference validity',table(['Inference','Valid','Valuations','Counterexample'],[(r['input']['name'],r['result']['valid'],r['result']['valuations_checked'],json.dumps(r['result']['counterexamples'])) for r in e['inferences']]),
    '## System composition order dependence',table(['Order','Input','Output'],[(' → '.join(r['order']),r['input'],r['output']) for r in e['order_dependence']]),
    '## Claim support dependence',table(['Support path','Observation','Result'],[('; '.join(r['premises']),'A = false; B = true',r['status']) for r in e['support_preservation']['paths']]),
    '## Reasoning approach applicability',table(['Candidate','Result','Failed condition','Unknown condition'],[(r['candidate'],r['status'],'; '.join(r['failed']),'; '.join(r['unknown'])) for r in e['candidate_filter']]),
    '## Input admissibility',table(['Case','Result','Reason'],[(r['case'],r['status'],r['reason']) for r in e['input_boundaries']])])
write(D/'result-reuse.md',[table(['Source study','Consumer study','Relation','Transferred result','Condition','Interpretation','Contribution'],[(r['source_study'],r['consumer_study'],r['relation'],r['transferred'],r['preserved'],r['added'],r['actual_change']) for r in u['result_reuse']])])
page=R/'sources/study-inventory.md'
write(page,[table(['Source','Identity','Scope','Body','SHA-256'],[(s['title'],s['identity'],s['scope'],refs([s['id']],page),s['sha256'] or 'No local snapshot') for s in u['sources']])])
projects=json.loads((R/'studies/subject/explorations.json').read_text())['projects']
profile_map={r[0]:r[1] for r in projects}
assert {r['family'] for r in u['family_views']}==set(profile_map)
for family,slug in profile_map.items():
    page=R/'sources/systems'/f'{slug}.md';text=page.read_text()
    marker='<!-- study-view:start -->'
    if marker in text:text=text.split(marker)[0].rstrip()
    specific=[r for r in u['studies'] if r['family']==family]
    rows=[(r['subject'],r['question'],r['contribution'],'; '.join(r['technique_ids']) or 'Unspecified') for r in specific] if specific else [('; '.join(r['subjects']),r['particular_matter'],r['required_result'],'Unspecified') for r in u['family_views'] if r['family']==family and r['subjects']]
    block=['## Study',table(['Subject','Question','Result','Technique'],rows)]
    local=[r for r in u['compositions'] if family in r['source_families']]
    if local:block += ['## System execution',table(['System','Subject','Case'],[(link(page,R/r['local_path'],r['name']),r['subject'],r['case']) for r in local])]
    write(page,[text,marker,*block,'<!-- study-view:end -->'])
print(f"{len(u['studies'])} studies; {len(methods)} techniques; {sum(bool(s['local_path']) for s in sources.values())} source bodies")
