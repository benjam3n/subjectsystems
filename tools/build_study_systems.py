#!/usr/bin/env python3
"""Validate the precise study register and render its current reading views."""
import hashlib,json,os,re
from pathlib import Path
R=Path(__file__).resolve().parents[1];D=R/'research/studies'
u=json.loads((D/'study-systems.json').read_text());e=json.loads((D/'execution-results.json').read_text())
names={r['name'] for r in json.loads((R/'research/type-relations/subject-names.json').read_text())['subjects']}
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

def cell(v):return str(v).replace('|','\\|').replace('\n','<br>')
def table(headers,rows):return '\n'.join(['| '+' | '.join(headers)+' |','|'+'|'.join('---' for _ in headers)+'|']+['| '+' | '.join(cell(v) for v in row)+' |' for row in rows])+'\n'
def refs(ids):return '; '.join('['+sources[s]['title']+']('+os.path.relpath(R/sources[s]['local_path'],D)+')' if sources[s]['local_path'] else '['+sources[s]['title']+']('+sources[s]['url']+')' for s in ids)

out=['# Literal study contributions\n','A study here is an investigation or constructive inquiry into a specified matter. Each row defines a target and a result; it does not assert a completed study simply because the source contains a related procedure. The source families name origins and collections, not unique atomic subjects.\n']
for family in dict.fromkeys(r['family'] for r in u['studies']):
    out += ['## '+family+'\n',table(['Subject studied','Particular question','Required contribution','Admitted technique','Source'],[(r['subject'],r['question'],r['contribution'],'; '.join(r['technique_ids']) or 'No complete technique admitted for this row',refs(r['source_ids'])) for r in u['studies'] if r['family']==family])]
out += ['The Subject Systems rows are new investigations performed on, or using, the earlier material. They are not attributed to the source authors. The other rows translate selected source contributions into possible study specifications. A method invocation itself becomes a study only in the context of a specified investigative task.\n','[Relationship derivation](SUBJECT-STUDY-SYSTEM.md) · [Technique contracts](TECHNIQUES.md) · [Executed cases](EXECUTIONS.md)\n']
(D/'STUDY-TRANSLATIONS.md').write_text('\n'.join(out))

out=['# Admitted technique contracts\n','These five bounded contracts are operative contributions. Each original remains preserved; the local adaptations say what changed. The contracts do not certify the full source procedures or require all future intellectual methods to be deterministic software.\n',table(['Admission condition','Test'],[(r['name'],r['test']) for r in u['admission_rules']])]
for m in u['techniques']:
    out += ['## '+m['id']+' — '+m['name']+'\n',table(['Part','Specified content'],[(label,m[key]) for label,key in [('Derivation','derivation'),('Inputs','inputs'),('Transformation','operation'),('Output','output'),('Operating conditions','conditions'),('Termination','termination'),('Remaining intellectual work','remaining_discretion'),('Verification','verification'),('Implementation','implementation'),('Transfer limit','transfer_limit')]]),refs(m['source_ids'])+'\n']
out += ['## Source admission decisions\n',table(['Source feature','Decision','Decisive case or missing operation','Retained contribution or repair','Source'],[(r['label'],r['status'],r['case'],r['repair'],refs(r['source_ids'])) for r in u['admission_decisions']]),'[Study register](STUDY-TRANSLATIONS.md) · [Actual results](EXECUTIONS.md)\n']
(D/'TECHNIQUES.md').write_text('\n'.join(out))

out=['# Executed study contributions\n',e['standing']+'\n',
 '## The source outcome rule has a gap\n','The recovered GOSM gate requires all mandatory conditions and at least 70 percent of optional conditions for its numeric achieved branch. Its partial interval is 50–99 percent mandatory completion, and its not-achieved branch is below 50 percent. At 100 percent mandatory completion and zero percent optional completion, with the project not abandoned, none of these numeric branches applies. The source also describes achievement as satisfying all primary criteria, exposing a second tension between the prose criterion and added optional threshold.\n',
 'The custom achievement system returns **achieved**, reports the optional shortfall separately, and retains activity state independently. This is a deliberate revised definition, not a claim to execute the original threshold rule faithfully.\n',
 '## Complete bounded case domain\n',table(['Dimension','Values'],[(k,', '.join(v)) for k,v in e['gate_domain'].items()]),
 'The Cartesian product has 3 × 3 × 3 × 2 = **54 cases**. The replacement produces exactly one achievement status for each: **6 achieved, 30 not achieved, 18 undetermined**. Unknown evidence remains unknown. The full input and output for every case is retained in [execution-results.json](execution-results.json).\n',
 '## An inference study checks a verdict rule\n',table(['Fixed analytical inference','Validity in supplied model','Valuations','Counterexamples'],[(r['input']['name'],r['result']['valid'],r['result']['valuations_checked'],json.dumps(r['result']['counterexamples'])) for r in e['inferences']]),
 e['verdict_quota_result']+' The source also tells the executor to derive verdicts from findings; the local admission decision resolves this conflict in favor of those actual grounds. It does not infer that everything in ARAW fails.\n',
 'The invalid inference has the explicit countermodel achieved = true, process_caused = false. Achievement by itself therefore cannot identify the process contribution. A causal attribution requires additional premises and evidence. An inconsistent-premise case is reported as vacuous validity, with no premise-satisfying model; it is not presented as evidence about an actual situation.\n',
 '## An unordered component set does not specify behavior\n',table(['Order','Input','Output'],[(' → '.join(r['order']),r['input'],r['output']) for r in e['order_dependence']]),
 'The components, their individual operations and initial input remain fixed. Changing their order changes the result. A list of subjects or study names therefore cannot recover this property of the system. An organized composition can preserve it by recording the order.\n',
 '## A correction does not erase independent support\n',table(['Support path','Premise observations','Result'],[('; '.join(r['premises']),'A = false; B = true',r['status']) for r in e['support_preservation']['paths']]),
 'The rejected A path is invalidated while the B path survives. Each path is assumed independently justified; losing a path does not establish the conclusion false. This directly supplies the distinction needed before propagating a correction into a plan.\n',
 '## Method applicability retains unknowns\n',table(['Candidate','Status','Failed conditions','Unknown conditions'],[(r['candidate'],r['status'],'; '.join(r['failed']),'; '.join(r['unknown'])) for r in e['candidate_filter']]),
 '## Explicit input failures\n',table(['Case','Result','Reason'],[(r['case'],r['status'],r['reason']) for r in e['input_boundaries']]),
 'The invalid-input cases produce no substantive achievement, validity or completeness verdict. The stated execution bounds belong to these implementations; they are not limits on what the subject can investigate.\n',
 'Run `python3 tools/run_study_cases.py` to reproduce these results, then `python3 tools/build_study_systems.py` to regenerate the reading views.\n',
 '\n'.join('- '+x for x in e['interpretation_limits'])+'\n']
(D/'EXECUTIONS.md').write_text('\n'.join(out))

out=['# Reuse between studies\n',table(['Earlier study','Later study','Relation','What transfers','What must remain true','New interpretation','Actual contribution'],[(r['source_study'],r['consumer_study'],r['relation'],r['transferred'],r['preserved'],r['added'],r['actual_change']) for r in u['result_reuse']]),
 'A technique is transferred by establishing that its input and operating contract apply. A finding is transferred by establishing that its supporting premises justify the new conclusion. Studying a technique turns that technique into the target. Composing studies adds dependencies and execution rules. These four relationships cannot be recovered from a generic relevant-to link.\n']
(D/'STUDY-REUSE.md').write_text('\n'.join(out))

out=['# Source record for the study/system review\n','Original source bodies are preserved as text evidence. Archived Reasoningtool skills have their exact emitted SHA-256 identities; no unverified commit is attached to them. The recovered sources remain pinned to their System Recovery snapshot. These files are not local operating instructions.\n',table(['Source','Identity','Inspected scope','Preserved body','SHA-256'],[(s['title'],s['identity'],s['scope'],refs([s['id']]),s['sha256'] or 'External documentation; no local body snapshot') for s in u['sources']]),
 '## Reasoningtool inventory boundary\n',u['reasoningtool_inventory']['standing']+' '+u['reasoningtool_inventory']['unreviewed_dependency_example']+'\n',
 'Archive metadata SHA-256: `'+u['reasoningtool_inventory']['sha256']+'`. Seven body IDs: '+', '.join(u['reasoningtool_inventory']['body_reviewed'])+'. A metadata entry is not an admitted technique, a demonstrated capability or an executed study.\n']
(D/'SOURCES.md').write_text('\n'.join(out))

# Add precise contribution views to every existing family profile. Prior source
# identity, relevance mappings and evidence standing remain intact.
projects=json.loads((R/'research/type-relations/explorations.json').read_text())['projects']
profile_map={r[0]:r[1] for r in projects}
assert {r['family'] for r in u['family_views']}==set(profile_map)
for family,slug in profile_map.items():
    p=R/'systems'/f'{slug}.md';text=p.read_text()
    marker='\n<!-- study-view:start -->'
    if marker in text:text=text.split(marker)[0].rstrip()+'\n'
    specific=[r for r in u['studies'] if r['family']==family]
    if specific:
        rows=[(r['subject'],r['question'],r['contribution'],'; '.join(r['technique_ids']) or 'No complete technique admitted for this study target') for r in specific]
    else:
        rows=[('; '.join(r['subjects']),r['particular_matter'],r['required_result'],'Prior contribution proposal; technique body not newly admitted') for r in u['family_views'] if r['family']==family and r['subjects']]
    block=['## Current study contributions\n','These are specified investigative targets or proposed study contributions. A source procedure, stored artifact, study specification and conducted study retain different standing. The [study/system derivation](../research/studies/SUBJECT-STUDY-SYSTEM.md) and [technique contracts](../research/studies/TECHNIQUES.md) determine how the material can enter a custom composition.\n',table(['Literal subject','Particular matter','Required result','Technique standing'],rows)]
    if any(not r['subjects'] for r in u['family_views'] if r['family']==family):block+=['One earlier contribution still lacks an exact target. It remains a source gap and is excluded from the study table.\n']
    if specific:block+=['The full translation is in the [study register](../research/studies/STUDY-TRANSLATIONS.md). Source-level defects and incomplete dependencies are recorded separately; the family is not admitted wholesale.\n']
    local=[r for r in u['compositions'] if family in r['source_families']]
    if local:block+=['### Executed local descendants added by this review\n',table(['Custom system','Subject','Contribution'],[('['+r['name']+'](../'+r['local_path']+')',r['subject'],r['case']) for r in local])]
    p.write_text(text+marker+'\n'+'\n'.join(block)+'<!-- study-view:end -->\n')
print(json.dumps(dict(study_targets=len(u['studies']),techniques=len(methods),verified_source_bodies=sum(bool(s['local_path']) for s in sources.values()),updated_family_profiles=len(profile_map),custom_compositions=len(u['compositions']))))
