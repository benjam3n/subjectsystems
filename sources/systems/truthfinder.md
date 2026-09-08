## Operation

Argument blueprints, targeted error vectors, counterexamples, and retained failure reports.

## Applicability

A targeted counterexample must retain its exact target, scope, and outcome. An untested error vector is not a passed check, and a belief assessment is not a decision recommendation.

## System

| Local system | Subject | Standing |
|---|---|---|
| [Claim inference counterexample search](../../systems/claim-inference-counterexample-search.md) | [Reasoning](../../subjects/reasoning.md) | Specified v0.1; prospective effectiveness unestablished |

## Source

- [TruthFinder/README.md](https://github.com/benjam3n/systemrecovery/blob/d71a8430452fb8563d722c5df3b904bb7109197e/structure/sources/TruthFinder/README.md) — preserved by System Recovery at `d71a8430452f`.
- [TruthFinder/src/truth_finder/models/domain.py](https://github.com/benjam3n/systemrecovery/blob/d71a8430452fb8563d722c5df3b904bb7109197e/structure/sources/TruthFinder/src/truth_finder/models/domain.py) — preserved by System Recovery at `d71a8430452f`.

<!-- study-view:start -->

## Study

| Subject | Question | Result | Technique |
|---|---|---|---|
| Claim inference specification | Fix the exact conclusion, premises, and inferential dependence being challenged. | Produce a stable target whose wording and meaning do not drift during the challenge. | Unspecified |
| Claim inference counterexample | Construct a case that satisfies the proposed premises while defeating the claimed conclusion. | Produce an actual separating case or retain that none has been found. | Unspecified |
| Reasoning error location | Identify which premise or inferential step the observed failure concerns. | Produce a specific failure report that does not overstate the affected scope. | Unspecified |

<!-- study-view:end -->
