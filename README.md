# Subject Systems

Systems organized around subjects.

Subjects are grouped by the kind of work they do. Within each group, subjects determine the concepts, accounts, questions, methods, tools, and evidence to develop. Existing projects provide material for custom systems built for each subject and purpose, including approaches none of the existing systems contains.

The ambition is to develop these subjects deeply enough to understand and improve what occurs within them, and to investigate what perfection would require. The name describes the organization; it does not certify completeness, effectiveness, or readiness.

## Start with the kind of work

The hierarchy is **group → subject → particular inquiry or purpose → custom system**.

| Group | What its subjects do |
|---|---|
| [Direction and choice](subjects/direction/README.md) | Develop purposes, standards, preferences, and commitments |
| [Inquiry and discovery](subjects/inquiry/README.md) | Open questions and pursue findings |
| [Reasoning and understanding](subjects/understanding/README.md) | Develop implications, accounts, expectations, and their grounds |
| [Organization and retention](subjects/organization/README.md) | Make material interpretable, connected, and available for later use |
| [Creation and problem solving](subjects/creation/README.md) | Generate and develop forms, alternatives, and interventions |
| [Planning and execution](subjects/execution/README.md) | Direct resources, arrange work, and carry it out |
| [Expression and interaction](subjects/interaction/README.md) | Construct contributions that change understanding or subsequent activity |
| [Learning and improvement](subjects/development/README.md) | Develop capability and the quality of work and its results |

The [group index](subjects/README.md) opens the subject lists and placement reasons. These eight groups contain 38 subjects; [Promoting](subjects/unplaced/promoting/README.md) remains visibly unplaced while its meaning is unresolved. Together they preserve the 37 retained subjects and two proposed additions. A group is a useful main home, with connections across groups where the work requires them.

For example, the SDS source leads to distinct systems for [Goal discovery](subjects/direction/goals/systems/goal-discovery.md), [Preference discovery](subjects/direction/preferences/systems/preference-discovery.md), and [Design exploration](subjects/creation/design/systems/design-exploration.md). They generate different objects, select for different reasons, and produce different results. The same customization principle applies to every project family. See [how custom systems are developed](CUSTOMIZATION.md).

## Understand the project

| Entry | What it provides |
|---|---|
| [Current contract](CURRENT.md) | Current decisions, authority, scope, and remaining uncertainty |
| [Purpose](PURPOSE.md) | Goals that remain meaningful as the project changes |
| [Architecture](ARCHITECTURE.md) | Functional groups, subjects, local systems, source lineage, and relationships |
| [Customization](CUSTOMIZATION.md) | How each subject and purpose determines its own systems |
| [Customization plan](research/CUSTOMIZATION-PLAN.md) | Specified versions and remaining work across all source families |
| [Perfection](PERFECTION.md) | Strong targets and the distinctions required to establish them |
| [Goal journey](GOAL-JOURNEY.md) | What present capabilities enable and the larger fronts of development |
| [Next work](NEXT.md) | Concrete investigations and changes warranted by the current state |
| [Recent work](research/RECENT-WORK.md) | Operations, perspectives, anticipation, and other findings to develop |
| [Worked naming and placement case](cases/naming-and-placement.md) | A real selection episode used across several subjects |
| [System index](systems/README.md) | Contributing source families and their proposed placements |
| [Source record](sources/README.md) | Pinned sources, preserved reviews, and unresolved source gaps |

## Current state

The repository contains eight functional group pages, the retained subject work, and ten local design specifications, alongside starting branches, questions, source profiles, worked distinctions, and a development plan. Other family–subject versions remain to be developed. A specification is not a prospective effectiveness result. The arrangement is not an exhaustive file migration or an implemented universal orchestrator.

Education and Collaboration remain excluded as standalone subjects. Connections and Improvement remain proposed additions. The treatment of Integration, Evaluation, Automation, and Self-improvement remains revisable. Promoting is an unresolved label. The [boundary decision](decisions/0002-subject-boundaries.md) and [grouping decision](decisions/0004-functional-groups.md) preserve these distinctions.

## Work here

Agents begin with [AGENTS.md](AGENTS.md) and the actual request. Human readers can go directly to a subject. Read an original procedure before claiming to execute it, develop the relevant work, and preserve findings where their next use can find them.

Run the local structural check after edits:

```bash
python3 tools/check.py
```

The check covers repository structure, local references, and preserved snapshot hashes. Intellectual correctness and source-method effectiveness require their own evidence.
