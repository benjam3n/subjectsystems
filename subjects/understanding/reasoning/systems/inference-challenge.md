# Inference challenge

**Current contribution scopes:** [A2 — Grounds and consequence](../../../../subjects/scopes/accounts.md#a2-grounds-and-consequence). The specified premise–conclusion relation and a targeted defeating case, scoped support, or explicit unresolved result. See the [scope contribution map](../../../../research/SCOPE-SYSTEMS.md). The recorded design operations and source lineage below retain their own standing.

Subject: [Reasoning](../README.md).
Source families: [TruthFinder](../../../../systems/truthfinder.md).
Standing: specified design, version 0.1. Prospective effectiveness is unestablished.

## Local purpose

Locate whether an exact proposed inference fails, and preserve the difference between a defeated inference and an untested one.

## What changes from the source

Specialize targeted error discovery to the relation between premises, interpretation, and conclusion. Require a falsifying case or identified unsupported transition rather than a generic survival score or a judgment about whether the conclusion is desirable.

## Objects and distinctions

Exact premises; conclusion; interpretation; dependencies; targeted inference step; challenge; result of the challenge; remaining support.

## Operations

1. State the inference with its quantifiers, conditions, and intended interpretation. Separate a conclusion about truth from a recommendation or preference before selecting a challenge.
2. Reconstruct the particular transition on which the conclusion depends. Preserve any assumption introduced by the reconstruction as an assumption rather than a supplied premise.
3. Develop a challenge targeted to that transition: a case where the premises hold and the conclusion fails, a shifted definition, or an unlicensed assumption. Identify which of these the challenge actually is.
4. Determine whether the challenge meets its own conditions. A possibility compatible with the conclusion, an undesirable consequence, or a changed question is not automatically a refutation.
5. If a transition is defeated, withdraw the inference it supplied and inspect the uses that depended on it. Keep independently supported conclusions and unchallenged alternatives separate.
6. If no defeating case is obtained, retain the actual search scope and unresolved result. Do not infer general validity from survival of the attempted challenges.

## Result and consumer

An exact defeated transition, a scoped supporting result, or a clearly unresolved inference with the attempted challenges retained.

## Quality and defeating case

The challenge must address the asserted claim. A missing justification is distinguishable from a proven false conclusion, and the two can require different next work.

## Continuation

Repair the actual transition, obtain missing evidence, change the scope, or develop another account according to the identified result.

## Illustrative distinction

A system being relevant to Preferences does not entail that the unchanged system satisfies every preference inquiry. A case requiring diagnostic contrasts rather than design convergence defeats that purported implication.

The example illustrates the specification. It is not a prospective performance result.

## Source lineage

- [TruthFinder README](https://github.com/benjam3n/systemrecovery/blob/d71a8430452fb8563d722c5df3b904bb7109197e/structure/sources/TruthFinder/README.md).

This is a new subject-specific design derived from the identified material. Its changed operations and criteria are not attributed to the original source. See the [customization rule](../../../../CUSTOMIZATION.md).
