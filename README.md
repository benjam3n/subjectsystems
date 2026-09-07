# Subject Systems

Systems organized around subjects.

Reasoning, goals, discovery, questions, preferences, design, and the other subjects determine the organization. Existing systems contribute wherever they are relevant. Each subject can develop its own concepts, accounts, questions, methods, tools, and evidence, including approaches none of the existing systems contains.

The ambition is to develop these subjects deeply enough to understand and improve what occurs within them, and to investigate what perfection would require. The name describes the organization; it does not certify completeness, effectiveness, or readiness.

## Start with a subject

The [subject index](subjects/README.md) contains 37 retained entries and two proposed additions. Start with [Goals](subjects/goals/README.md), [Discovery](subjects/discovery/README.md), [Reasoning](subjects/reasoning/README.md), [Questions](subjects/questions/README.md), or whichever subject bears on the actual work.

For example, SDS contributes to [Design](subjects/design/README.md) through alternatives, to [Preferences](subjects/preferences/README.md) through selections, and to [Goals](subjects/goals/README.md) through requirements discovered from examples. These are different uses of the same source. The subject extends beyond that source.

## Understand the project

| Entry | What it provides |
|---|---|
| [Current contract](CURRENT.md) | Current decisions, authority, scope, and remaining uncertainty |
| [Purpose](PURPOSE.md) | Goals that remain meaningful as the project changes |
| [Architecture](ARCHITECTURE.md) | Subjects, branches, contributors, relationships, and native source objects |
| [Perfection](PERFECTION.md) | Strong targets and the distinctions required to establish them |
| [Goal journey](GOAL-JOURNEY.md) | What present capabilities enable and the larger fronts of development |
| [Next work](NEXT.md) | Concrete investigations and changes warranted by the current state |
| [Recent work](research/RECENT-WORK.md) | Operations, perspectives, anticipation, and other findings to develop |
| [Worked naming and placement case](cases/naming-and-placement.md) | A real selection episode used across several subjects |
| [System index](systems/README.md) | Contributing source families and their proposed placements |
| [Source record](sources/README.md) | Pinned sources, preserved reviews, and unresolved source gaps |

## Current state

This is the initial subject-centered organization. It includes substantive starting branches, questions, source profiles, a reconstructed conversation case, and a development plan. It is not an exhaustive file migration or an implemented universal orchestrator.

Education and Collaboration are excluded as roots. Connections and Improvement remain proposed additions. The treatment of Integration, Evaluation, Automation, and Self-improvement remains revisable. Promoting is an unresolved label. These distinctions are recorded in the [boundary decision](decisions/0002-subject-boundaries.md).

## Work here

Agents begin with [AGENTS.md](AGENTS.md) and the actual request. Human readers can go directly to a subject. Read an original procedure before claiming to execute it, develop the relevant work, and preserve findings where their next use can find them.

Run the local structural check after edits:

```bash
python3 tools/check.py
```

The check covers repository structure, local references, and preserved snapshot hashes. Intellectual correctness and source-method effectiveness require their own evidence.
