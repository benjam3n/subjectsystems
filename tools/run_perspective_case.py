#!/usr/bin/env python3
"""Execute the finite, stipulated comparison in the perspective investigation.

The inputs are a mathematical example, not measured human preferences.
"""
import hashlib
import json
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / 'studies/subject'


def evaluate(case):
    outcomes = case['outcomes']
    values = {r['id']: r['payoffs'] for r in outcomes}
    assert len(values) == len(outcomes)
    assert all(len(v) == len(case['criteria']) for v in values.values())
    baseline = values[case['baseline']]
    dominates = lambda a, b: all(x >= y for x, y in zip(a, b)) and any(x > y for x, y in zip(a, b))
    pairs = [[a, b] for a, av in values.items() for b, bv in values.items() if dominates(av, bv)]
    totals = {k: sum(v) for k, v in values.items()}
    maxima = [max(v[i] for v in values.values()) for i in range(len(case['criteria']))]
    return {
        'standing': case['standing'],
        'dominance_rule': 'No worse on every admitted criterion and strictly better on at least one.',
        'dominance_pairs': pairs,
        'nondominated': [a for a in values if not any(b == a for _, b in pairs)],
        'jointly_best': [a for a, v in values.items() if v == maxima],
        'criterion_maxima': maxima,
        'payoff_totals': totals,
        'full_domain_constant_sum': len(set(totals.values())) == 1,
        'restricted_domain': case['restricted_domain'],
        'restricted_domain_constant_sum': len({totals[a] for a in case['restricted_domain']}) == 1,
        'baseline_comparisons': [dict(id=a, changes=[x-y for x,y in zip(v, baseline)],
             relations=['better' if x>y else 'worse' if x<y else 'equal' for x,y in zip(v,baseline)]) for a,v in values.items()],
        'input_sha256': hashlib.sha256(json.dumps(case, sort_keys=True).encode()).hexdigest(),
    }


if __name__ == '__main__':
    investigation = json.loads((DATA / 'perspective-investigation.json').read_text())
    result = evaluate(investigation['deviation_case'])
    # Separating cases establish the specific conclusions of this investigation.
    assert ['scheduled_use', 'chaotic_sharing'] in result['dominance_pairs']
    assert ['scheduled_use', 'exclusive_a'] not in result['dominance_pairs']
    assert set(result['nondominated']) == {'scheduled_use', 'exclusive_a', 'exclusive_b'}
    assert result['jointly_best'] == []
    assert not result['full_domain_constant_sum'] and result['restricted_domain_constant_sum']
    (DATA / 'perspective-case-results.json').write_text(json.dumps(result, indent=2)+'\n')
    print(json.dumps(result))
