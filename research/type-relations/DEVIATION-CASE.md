# Deviation, dominance and payoff totals

Authored finite mathematical example; all payoffs are stipulated, not measurements of people.

One shared resource has six stipulated feasible arrangements. Larger payoff is preferred by each of two participants. Chaotic sharing is the baseline for the better/worse columns. The feasible set and payoff representation stay fixed during each comparison.

| Arrangement | A payoff | B payoff | A versus baseline | B versus baseline | Total |
|---|---|---|---|---|---|
| Leave unused | 0 | 0 | worse | worse | 0 |
| Damaging conflict | -1 | -1 | worse | worse | -2 |
| Chaotic sharing | 2 | 2 | equal | equal | 4 |
| Scheduled use | 4 | 4 | better | better | 8 |
| Exclusive use by A | 6 | 0 | better | worse | 6 |
| Exclusive use by B | 0 | 6 | worse | better | 6 |

Scheduled use improves both participants relative to chaotic sharing. It does not improve both relative to exclusive use by A or B. The example therefore separates a beneficial departure from a universally best arrangement.

**Nondominated arrangements:** Scheduled use, Exclusive use by A, Exclusive use by B. There is no arrangement that simultaneously attains both individual maxima of 6. Scheduled use uniquely maximizes the stipulated total of 8, but choosing total payoff is an additional evaluative rule.

**Payoff structure:** the full domain has varying totals, so it is not constant-sum or zero-sum. Restricting the domain to the two exclusive-use outcomes gives a constant total of 6. Under a fixed affine normalization that subtracts 3 from each payoff, that restricted domain has zero total; its opposed choices do not prove the broader domain zero-sum.

## Every established dominance relation

| Dominating arrangement | Dominated arrangement |
|---|---|
| Leave unused | Damaging conflict |
| Chaotic sharing | Leave unused |
| Chaotic sharing | Damaging conflict |
| Scheduled use | Leave unused |
| Scheduled use | Damaging conflict |
| Scheduled use | Chaotic sharing |
| Exclusive use by A | Leave unused |
| Exclusive use by A | Damaging conflict |
| Exclusive use by B | Leave unused |
| Exclusive use by B | Damaging conflict |

## What perfection can mean

For a specified feasible set D and ordering, a best departure d* must satisfy d* at least as good as d for every admitted d. A nondominated departure merely has no competitor that is no worse everywhere and better somewhere. These conditions differ. In this case there are three nondominated arrangements and no common best for both individual criteria.

Even a single objective need not have an attained optimum: if feasible values are every real number x with 0 < x < 1 and larger is better, the supremum is 1 but no feasible x attains it. Thus Deviation optimality attainability has a real possible negative result. An applied optimality claim additionally needs the model assumptions and feasibility evidence to hold in the actual case.

## Reproduce the result

Run `python3 tools/run_perspective_case.py` from the repository. The result JSON retains the exact dominance pairs, baseline differences, totals and a hash of the case inputs.

- Feasibility and these payoff values are assumptions.
- A and B are the admitted evaluative perspectives; a joint-sum objective is an additional rule, not an independent observation.
- The example establishes conditional comparisons, not efficacy of scheduling in a real conflict.
- A finite deterministic case supplies no general claim about uncertain scenarios or repeated games.

[Executable calculation](../../tools/run_perspective_case.py) · [Inputs](perspective-investigation.json) · [Results](perspective-case-results.json) · [Argument](PERSPECTIVES.md)
