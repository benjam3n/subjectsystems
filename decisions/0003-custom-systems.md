# 0003 — Custom systems for subjects and purposes

Standing: current direction expressed by the user after the initial setup, 7 September 2026.

## Change

The user proposed making a custom version of each project for each subject, given what is being attempted, rather than having one SDS simply apply to several subjects. This extends the subject-first decision from organization into the design of the systems themselves.

The previous architecture treated several branches as uses of one source system. The revised architecture places distinct locally designed systems within subjects. Shared ancestry remains recorded, but the subject and purpose govern the descendant's objects, operations, outputs, criteria, and continuation.

## Scope

The direction applies to every project family, not only SDS. The initial relevance map supplies starting purposes, not an exhaustive set of permissible versions. The same subject can have more than one system from a family for different purposes, and a local system can combine families where the work requires it.

Exact original sources and their evidence remain preserved. The earlier rule against turning one source into conflicting copies protects source identity; it does not prohibit intentionally distinct descendants. Changes to a custom design are recorded as its own changes rather than silently attributed to its ancestor.

## Current implementation

Local designs now live under `subjects/<group>/<subject>/systems/`, following the later [grouping decision](0004-functional-groups.md). The customization revision specified all six SDS destinations in the existing map, plus designs derived from GOSM, Discovery Engine, QuestionRoute, Reasoningtool2, and TruthFinder. Subject pages distinguish these specifications from pending custom development. Source-family profiles link back to the distinct descendants.

The remaining versions across the portfolio are open development work. Ten specifications are not a claim that all combinations have been completed or their effectiveness established.

See [customization](../CUSTOMIZATION.md) and the [development plan](../research/CUSTOMIZATION-PLAN.md).
