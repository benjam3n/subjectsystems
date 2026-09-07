# Subjects, studies, systems

Subjects are the stable organizing units of Subject Systems. Studies develop answers or constructions concerning those subjects. Systems organize the contributors that produce or use those results. The source project names remain provenance; they do not determine the subject hierarchy.

This revision reads fourteen complete source bodies, translates selected ARAW, GOSM and Reasoningtool contributions into forty-two study targets, conducts seven further inquiries on or using that material, admits five bounded techniques, and implements three custom compositions. It does not claim an exhaustive decomposition of every file in those project families. [Exact sources and versions](SOURCES.md) define the inspected scope.

## What the proposed distinction gets right

A subject is a specified matter of consideration: for example, Reasoning approach selection. A particular study asks which available approach supplies a required contribution in a particular case. A study program develops the subject across questions and cases. A body of studies may contain established results, unresolved questions, methods and constructed artifacts.

That broader reading of “study” is useful here. The proposal need not mean only a conducted experiment. Studying Reasoning approach creation can actually create an approach; studying Expression representation can construct a representation. A constructive study still needs an identifiable contribution and grounds for what it establishes.

Many existing project names bundle several such matters. Expanding them reveals where a procedure supplies an operation, merely requests a result, or leaves a consequential choice unspecified. This makes it possible to retain useful material without importing a whole source's assumptions or unearned claims.

## What does not hold universally

| Proposition | Finding | Consequence for the repository |
|---|---|---|
| Subjects can be the fundamental organizing unit. | Adopted as a design rule. A subject can itself be refined, so “fundamental” does not mean indivisible. | Start from the matter being developed; identify contributing sources afterward. |
| Every project is one study. | Some contain several study programs, reusable methods, implementations, findings and administrative material. The particular artifact determines its role. | A method definition is not evidence that its study has been conducted. |
| Every system is a combination of studies. | A research system can be. An operating system can also contain actions, state and artifacts that do not themselves constitute inquiries. If “study” includes every component description, the claim becomes a convention about descriptions. | Allow systems of studies without forcing every operational component to be a study. |
| A set of studies completely specifies a system. | False even when every component is specified. Increment then double maps 1 to 4; double then increment maps 1 to 3. | Record relevant connections, order, conditions, state and interpretation. An unordered roster loses behavior. |
| A subject-specific system needs several subjects. | Several operations can serve one specified subject. Conversely, one operating artifact can contribute to several different matters. | Subject scope and component structure are separate relations. |
| A system cannot itself be a subject. | Its composition, behavior or effectiveness can be investigated. | Being considered as a subject does not replace the system's operating structure. |
| Every custom system needs wholly new techniques. | The same finite enumeration operation works in several compositions when their input and interpretation contracts are explicit. | Customize what the matter requires; preserve an adequate shared operation. |

The stronger formulation is therefore: **a subject identifies what is being developed; a study develops a contribution concerning it; a system organizes contributions and their means of production or use.** These are roles and relations, not three mutually exclusive folders for every artifact. A study about a system can itself be performed by a system without circularly defining the subject's content.

## Translating the source families

The [full study register](STUDY-TRANSLATIONS.md) gives each target its particular question, required result, source and technique standing. The following examples show the change in granularity.

| Source family | Literal subject | What a study must actually settle |
|---|---|---|
| ARAW | Claim content quantifier scope | Which cases an assertion covers, including the scope of “all,” “some,” and its conditions. |
| ARAW | Reasoning assumption consequence derivation | What follows from accepting the exact assumption. |
| ARAW | Claim inference counterexample | A case with true premises and a false conclusion, under the specified inference. |
| ARAW | Reasoning assumption alternative construction | A replacement derived from an identified way the original assumption fails. |
| ARAW | Claim support limits | Which conclusions the performed exploration does not warrant. |
| GOSM | Goal achievement condition specification | The conditions that make an intended outcome count as achieved. |
| GOSM | Goal achievement status | Whether those conditions hold in the case. |
| GOSM | Plan prerequisite | What must hold before a particular planned activity can proceed. |
| GOSM | Plan contingency | Which continuation follows from each relevant observed condition. |
| GOSM | Claim support preservation | Which grounds remain when a premise is corrected. |
| Reasoningtool | Reasoning approach availability | Which procedures are actually available in usable form. |
| Reasoningtool | Reasoning approach selection | Which available procedure supplies the required contribution here. |
| Reasoningtool | Reasoning candidate space specification | Which dimensions and values define the represented possibilities. |
| Reasoningtool | Reasoning candidate generation | Which candidates a specified operation produces in that space. |
| Reasoningtool | Comparison result incomparability | Which supplied criteria leave a tradeoff unresolved. |

ARAW's right and wrong assumptions contribute to different studies; the complete procedure also specifies how those contributions interact and recur. Historical GOSM contains goal, plan, execution and learning contributions. The archived Reasoningtool `/gosm` is a particular analysis-depth dispatcher, not the whole historical project. Reasoningtool as a collection makes methods available; individual procedures contribute to different studies. None of these facts makes the project name an atomic subject or proves the effectiveness of all its contents.

A source operation that requests “identify all relevant dimensions” does not already supply a reliable dimension-discovery technique. It can still identify a real subject, such as Reasoning candidate space specification. The missing mechanism stays outside the admitted technique set; the matter itself remains available for actual investigation.

## Technique admission

Admission concerns an operation in a declared use, not the reputation of its source. Each admitted [technique contract](TECHNIQUES.md) states the target, inputs, transformation, output, applicability, termination, remaining discretion, implementation and evidence limits.

Three questions must remain separate:

1. **Is it specified?** Can the required operation and consequential choices be identified? Defined parameters and explicit input requirements are legitimate generality. Unexplained “best,” an unbounded “all,” or an unspecified stopping decision are not executable answers.
2. **Is it well formed for its declared domain?** Do the input and output conditions fit, do the branches cover the admitted cases, and can the governing rules coexist? A partial method can be legitimate if its domain and undefined cases are stated.
3. **Does it establish or accomplish what is claimed?** A correct implementation of a total rule can still be a poor forecast or an unsuitable decision method. Proof and observed performance answer different effectiveness questions.

An unresolved subject is not a placeholder if its target is defined. A missing method is not a method. Where a technique remains unspecified, this revision translates its intended contribution but does not admit it as an operative component. Original bodies remain available as source evidence, including their rejected or unadmitted instructions.

The inspection produces concrete reasons for this rule:

- The GOSM outcome gate's numeric branches leave all required criteria passing but fewer than 70% of optional criteria passing unclassified. Its prose and numeric conditions also need reconciliation. A local replacement determines achievement from required conditions and retains optional merit and abandonment separately. This is an explicit design change.
- The inspected ARAW text combines evidence-derived verdicts with mandatory disagreement or uncertainty proportions. Five valid analytical implications show why a fixed contrary-verdict quota cannot itself justify rejecting one. The custom inference checker follows the formulas; this does not establish a defect in every ARAW use.
- Finite Cartesian enumeration covers the stated finite factors. It does not show that the factors represent every real possibility, that every tuple is feasible, or that the factors are statistically independent.
- An outcome being achieved does not imply that the examined process caused it. The local Boolean checker constructs that exact countermodel. No causal contribution percentages are supplied without an identification method.
- Losing one support path does not remove an independent surviving path. The local support operation records that distinction instead of declaring the conclusion false.

These investigations also yield seven new literal subjects: Reasoning approach specification completeness; Reasoning approach branch coverage; Reasoning approach rule consistency; Inquiry finding transfer condition; Inquiry finding use contribution; System composition order dependence; System composition description sufficiency.

## Studies supplying other studies

The [reuse register](STUDY-REUSE.md) distinguishes method reuse, result reuse and investigation of a method. This revision performs an actual composition:

1. A specified finite enumeration operation supplies the possible observation states.
2. Examining the source outcome rules exposes a state without a numeric classification.
3. That finding motivates a custom achievement-assessment rule with separate required, optional and activity fields.
4. Enumeration supplies all 54 combinations for two required conditions, one optional condition and abandonment. The custom rule returns 6 achieved, 30 not achieved and 18 undetermined results.
5. A separate inference study shows that achievement alone leaves the causal explanation unsettled.

The result is stronger than attaching study names to one another: the transferred content changes a particular rule, and the rule has an executed, inspectable behavior. It is also narrower than a general performance claim. The 54 cases exhaust the declared finite input pattern, not all goals or all kinds of evidence.

## Custom systems now available

| System | Primary subject | Actual contribution |
|---|---|---|
| [Finite inference validity](../../subjects/understanding/reasoning/systems/finite-inference-validity.md) | Claim inference validity | Validates finite Boolean formulas, enumerates assignments, retains countermodels and marks vacuous validity. |
| [Goal achievement assessment](../../subjects/direction/goals/systems/achievement-assessment.md) | Goal achievement status | Assesses explicit required observations, retains unknowns, and keeps optional merit and activity separate. |
| [Finite candidate generation](../../subjects/understanding/reasoning/systems/finite-candidate-generation.md) | Reasoning candidate generation | Generates the full product of explicit finite named domains within a declared bound. Its output supplied another study in this revision. |

The [executed cases](EXECUTIONS.md) record what was run. These are deliberately narrow implementations of admitted operations, with explicit source-derived and authored parts. New refers to the local composition or repair; it does not claim historical novelty for finite enumeration or truth-table checking. The other source contributions remain study specifications or development material at their recorded standing. All 21 source profiles now have literal study-contribution views; only ARAW, GOSM and the selected Reasoningtool bodies receive this revision's new detailed technique review.

## Next consequential work

The next broadening should close a specific missing contribution. In Claim content specification, the finite checker needs a justified translation from ordinary language into formulas; the enumeration result cannot certify that translation. In Reasoning candidate space specification, a separating real case can test whether the represented dimensions omit something consequential. In Inquiry finding transfer condition, a second application with changed assumptions can determine what survives transfer.

A further source technique should enter when its actual contract can be stated and checked, or when a separately named repair has been constructed. An open-ended prompt can inspire a new approach, but it does not become a reliable component merely because its requested output is desirable.

[Current contract](../../CURRENT.md) · [Study translations](STUDY-TRANSLATIONS.md) · [Technique contracts](TECHNIQUES.md) · [Sources](SOURCES.md)
