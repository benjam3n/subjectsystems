#!/usr/bin/env python3
"""Bounded techniques admitted by the subject/study/system review.

No prose parser, empirical observation, causal attribution or universal method
selector is supplied by these functions. Their domains are explicit inputs.
"""
from itertools import product
from math import prod


def finite_candidates(domains, limit=4096):
    """Every tuple in finite, ordered, named string domains; no feasibility claim."""
    if not isinstance(domains, dict) or any(not isinstance(k,str) or not k for k in domains):
        raise ValueError('Domains must have nonempty string names.')
    for values in domains.values():
        if not isinstance(values,list) or any(not isinstance(v,str) for v in values) or len(set(values))!=len(values):
            raise ValueError('Each domain must be a finite list of distinct strings.')
    count=prod(len(v) for v in domains.values())
    if count>limit: raise ValueError('Declared Cartesian space exceeds the execution bound.')
    return [dict(zip(domains,vs)) for vs in product(*domains.values())]


def truth_value(expression, assignment):
    if type(expression) is bool:return expression
    if isinstance(expression,str):return assignment[expression]
    op,*args=expression
    if op=='not':return not truth_value(args[0],assignment)
    a,b=(truth_value(x,assignment) for x in args)
    if op=='and':return a and b
    if op=='or':return a or b
    if op=='implies':return not a or b
    if op=='iff':return a==b
    raise ValueError('Unknown operator.')


def check_inference(atoms,premises,conclusion):
    """Exhaustive classical propositional entailment for at most 12 atoms."""
    if not isinstance(atoms,list) or len(atoms)>12 or any(not isinstance(a,str) or not a for a in atoms) or len(set(atoms))!=len(atoms):
        raise ValueError('Supply at most 12 distinct named Boolean atoms.')
    if not isinstance(premises,list):raise ValueError('Premises must be a list.')
    def validate(e,depth=0):
        if depth>64:raise ValueError('Formula exceeds the nesting bound.')
        if type(e) is bool:return
        if isinstance(e,str):
            if e not in atoms:raise ValueError('Undeclared atom: '+e)
            return
        if not isinstance(e,list) or not e or not isinstance(e[0],str):raise ValueError('Malformed formula.')
        arity={'not':1,'and':2,'or':2,'implies':2,'iff':2}.get(e[0])
        if arity is None or len(e)!=arity+1:raise ValueError('Unknown operator or wrong arity.')
        for child in e[1:]:validate(child,depth+1)
    for e in [*premises,conclusion]:validate(e)
    satisfying=[];counterexamples=[]
    for values in product([False,True],repeat=len(atoms)):
        assignment=dict(zip(atoms,values))
        if all(truth_value(p,assignment) for p in premises):
            satisfying.append(assignment)
            if not truth_value(conclusion,assignment):counterexamples.append(assignment)
    return dict(valid=not counterexamples,vacuous=not satisfying,valuations_checked=2**len(atoms),premise_models=len(satisfying),counterexamples=counterexamples,
                scope='Exactly the supplied classical Boolean formulas; translation from prose requires separate justification.')


def requirement_filter(candidates):
    """Evaluate supplied required-condition observations; unknown is retained."""
    result=[]
    if not isinstance(candidates,dict):raise ValueError('Candidates must be keyed by identity.')
    for candidate,checks in candidates.items():
        if not isinstance(checks,dict) or not checks or any(v is not None and type(v) is not bool for v in checks.values()):
            raise ValueError('Supply a nonempty map of required checks to true, false or null.')
        failed=[k for k,v in checks.items() if v is False]
        unknown=[k for k,v in checks.items() if v is None]
        status='rejected' if failed else 'unresolved' if unknown else 'passes_required_checks'
        result.append(dict(candidate=candidate,status=status,failed=failed,unknown=unknown))
    return result


def achievement_status(required,optional=None,abandoned=False):
    """Goal status from required observations; optional merit and activity separate."""
    if type(abandoned) is not bool:raise ValueError('Abandoned must be Boolean.')
    optional={} if optional is None else optional
    if not isinstance(optional,dict) or any(v is not None and type(v) is not bool for v in optional.values()):raise ValueError('Optional observations must be true, false or null.')
    row=requirement_filter({'goal':required})[0]
    status={'rejected':'not_achieved','unresolved':'undetermined','passes_required_checks':'achieved'}[row['status']]
    return dict(achievement=status,failed_required=row['failed'],unknown_required=row['unknown'],optional_observations=optional,activity='abandoned' if abandoned else 'not_marked_abandoned')


def support_preservation(paths,statuses):
    """Finite alternative support sets: each path requires all its stated premises.

    Paths must be independently justified before this bookkeeping applies.
    False invalidates a support path; it does not assert the conclusion false.
    """
    if not isinstance(paths,list) or not paths:raise ValueError('Supply at least one declared support path.')
    if not isinstance(statuses,dict) or any(v is not None and type(v) is not bool for v in statuses.values()):raise ValueError('Premise observations must be true, false or null.')
    records=[]
    for index,path in enumerate(paths):
        if not isinstance(path,list) or len(set(path))!=len(path) or any(not isinstance(p,str) or p not in statuses for p in path):raise ValueError('Each path must name distinct supplied premises.')
        state='invalidated' if any(statuses[p] is False for p in path) else 'unresolved' if any(statuses[p] is None for p in path) else 'retained'
        records.append(dict(path=index,premises=path,status=state))
    return dict(paths=records,has_retained_support=any(r['status']=='retained' for r in records),conclusion_truth='Not inferred from the loss of a support path.')
