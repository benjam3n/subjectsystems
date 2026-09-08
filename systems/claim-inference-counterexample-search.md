Subject: [Reasoning](../subjects/reasoning.md).
Source: [TruthFinder](../sources/systems/truthfinder.md).

## Purpose

Locate whether an exact proposed inference fails, and preserve the difference between a defeated inference and an untested one.

## Modification

Specialize targeted error discovery to the relation between premises, interpretation, and conclusion. Require a falsifying case or identified unsupported transition rather than a generic survival score or a judgment about whether the conclusion is desirable.

## Object

Exact premises; conclusion; interpretation; dependencies; targeted inference step; challenge; result of the challenge; remaining support.

## Operation

1. State the inference with its quantifiers, conditions, and intended interpretation. Separate a conclusion about truth from a recommendation or preference before selecting a challenge.
2. Reconstruct the particular transition on which the conclusion depends. Preserve any assumption introduced by the reconstruction as an assumption rather than a supplied premise.
3. Develop a challenge targeted to that transition: a case where the premises hold and the conclusion fails, a shifted definition, or an unlicensed assumption. Identify which of these the challenge actually is.
4. Determine whether the challenge meets its own conditions. A possibility compatible with the conclusion, an undesirable consequence, or a changed question is not automatically a refutation.
5. If a transition is defeated, withdraw the inference it supplied and inspect the uses that depended on it. Keep independently supported conclusions and unchallenged alternatives separate.
6. If no defeating case is obtained, retain the actual search scope and unresolved result. Do not infer general validity from survival of the attempted challenges.

## Result

An exact defeated transition, a scoped supporting result, or a clearly unresolved inference with the attempted challenges retained.

## Failure condition

The challenge must address the asserted claim. A missing justification is distinguishable from a proven false conclusion, and the two can require different next work.

## Continuation

Repair the actual transition, obtain missing evidence, change the scope, or develop another account according to the identified result.

## Case

A system being relevant to Preferences does not entail that the unchanged system satisfies every preference inquiry. A case requiring diagnostic contrasts rather than design convergence defeats that purported implication.

## Source

- [TruthFinder README](https://github.com/benjam3n/systemrecovery/blob/d71a8430452fb8563d722c5df3b904bb7109197e/structure/sources/TruthFinder/README.md).
