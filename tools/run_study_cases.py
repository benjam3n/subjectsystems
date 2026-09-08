#!/usr/bin/env python3
"""Execute the review's bounded studies and retain their actual results."""
import hashlib
import json
from pathlib import Path
from study_methods import finite_candidates,check_inference,achievement_status,requirement_filter,support_preservation

R=Path(__file__).resolve().parents[1];D=R/'studies/system'
u=json.loads((D/'study-systems.json').read_text())

# This is an explicit interpretation of the recovered percentage thresholds,
# not an execution of the original natural-language gate or its environment.
gate=(D/'sources/gosm_outcome.txt').read_text()
assert '100% of must-have criteria, 70%+ of nice-to-have' in gate
assert '50-99% of must-have criteria' in gate and '<50% of must-have criteria' in gate
def original_numeric_branches(must,nice):
    return [label for label,match in [('achieved',must==100 and nice>=70),('partial',50<=must<=99),('not_achieved',must<50)] if match]
gap=dict(required_percent=100,optional_percent=0,abandoned=False,matching_original_branches=original_numeric_branches(100,0))
assert gap['matching_original_branches']==[]

domains={'required_1':['true','false','unknown'],'required_2':['true','false','unknown'],'optional_1':['true','false','unknown'],'abandoned':['false','true']}
tuples=finite_candidates(domains);decode={'true':True,'false':False,'unknown':None}
achievement_cases=[]
for record in tuples:
    result=achievement_status({k:decode[record[k]] for k in ['required_1','required_2']},{'optional_1':decode[record['optional_1']]},decode[record['abandoned']])
    achievement_cases.append(dict(input=record,result=result))
assert len(tuples)==54
assert len({tuple(r.items()) for r in tuples})==54
assert {r['result']['achievement'] for r in achievement_cases}=={'achieved','not_achieved','undetermined'}
repaired=achievement_status({'required_1':True,'required_2':True},{'optional_1':False},False)
assert repaired['achievement']=='achieved'
unknown=achievement_status({'required_1':True,'required_2':None})
assert unknown['achievement']=='undetermined'

# Fixed analytical claims with independently inspectable truth-table grounds.
valid_inputs=[
 dict(name='A premise entails itself',atoms=['P'],premises=['P'],conclusion='P'),
 dict(name='Conjunction entails its first conjunct',atoms=['P','Q'],premises=[['and','P','Q']],conclusion='P'),
 dict(name='A premise entails a disjunction containing it',atoms=['P','Q'],premises=['P'],conclusion=['or','P','Q']),
 dict(name='Modus ponens',atoms=['P','Q'],premises=['P',['implies','P','Q']],conclusion='Q'),
 dict(name='Two material implications compose',atoms=['P','Q','R'],premises=[['implies','P','Q'],['implies','Q','R']],conclusion=['implies','P','R'])]
inferences=[]
for row in valid_inputs:
    result=check_inference(row['atoms'],row['premises'],row['conclusion']);assert result['valid'] and not result['vacuous']
    inferences.append(dict(input=row,result=result))
invalid=dict(name='Achievement alone entails causal process contribution',atoms=['achieved','process_caused'],premises=['achieved'],conclusion='process_caused')
result=check_inference(invalid['atoms'],invalid['premises'],invalid['conclusion']);assert result['counterexamples']==[{'achieved':True,'process_caused':False}]
inferences.append(dict(input=invalid,result=result))
vacuous=check_inference(['P','Q'],['P',['not','P']],'Q')
assert vacuous['valid'] and vacuous['vacuous']

support=support_preservation([['A'],['B']],{'A':False,'B':True})
assert support['paths'][0]['status']=='invalidated' and support['paths'][1]['status']=='retained'
assert support['has_retained_support']
filter_result=requirement_filter({'specified_finite_method':{'finite_domain':True,'operator_defined':True},'undefined_domain_method':{'finite_domain':None,'operator_defined':True},'inapplicable_method':{'finite_domain':False,'operator_defined':True}})
assert [r['status'] for r in filter_result]==['passes_required_checks','unresolved','rejected']

def execute(order,start):
    value=start;trace=[]
    for operation in order:
        before=value;value=value+1 if operation=='increment' else value*2
        trace.append(dict(operation=operation,before=before,after=value))
    return dict(order=order,input=start,output=value,trace=trace)
orders=[execute(['increment','double'],1),execute(['double','increment'],1)]
assert set(orders[0]['order'])==set(orders[1]['order']) and orders[0]['output']!=orders[1]['output']

limits=[]
for name,call in [('undeclared_atom',lambda:check_inference(['P'],[],'Q')),('empty_required_map',lambda:achievement_status({})),('oversized_enumeration',lambda:finite_candidates({'x':[str(i) for i in range(4097)]}))]:
    try:call()
    except ValueError as error:limits.append(dict(case=name,status='input_rejected',reason=str(error)))
    else:raise AssertionError(name+' did not reject the invalid input')

report=dict(date=u['date'],source_basis_commit=u['basis_commit'],standing='Executed finite models and explicit source-rule interpretation; no empirical success probabilities are inferred.',
 original_gate_gap=gap,repaired_gap_result=repaired,gate_domain=domains,achievement_cases=achievement_cases,inferences=inferences,vacuous_case=vacuous,
 support_preservation=support,candidate_filter=filter_result,order_dependence=orders,input_boundaries=limits,
 verdict_quota_result='All five fixed analytical examples have valid nonvacuous implications. An additional mandatory rejected or genuinely uncertain verdict is unsupported in that set; this targets the quota interpreted as a verdict requirement, not every ARAW operation.',
 interpretation_limits=['The formulas are explicit analytical inputs; truth-table validity does not validate every prose translation.','Goal observations are stipulated; the method does not measure whether a real-world criterion holds.','The arithmetic order example proves insufficiency of an unordered component list for its stated behavior; it is not a theory of all physical systems.','Independent support paths are assumed separately justified. The bookkeeping supplies no new causal or probabilistic evidence.'])
report['method_sha256']=hashlib.sha256((R/'tools/study_methods.py').read_bytes()).hexdigest()
(D/'execution-results.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(json.dumps(dict(achievement_cases=len(achievement_cases),status_counts={s:sum(c['result']['achievement']==s for c in achievement_cases) for s in ['achieved','not_achieved','undetermined']},inferences=len(inferences),source_gap=gap,repair=repaired['achievement'],order_outputs=[r['output'] for r in orders],retained_independent_support=support['has_retained_support'],input_boundaries=len(limits))))
