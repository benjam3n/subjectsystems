# Admitted technique contracts

These five bounded contracts are operative contributions. Each original remains preserved; the local adaptations say what changed. The contracts do not certify the full source procedures or require all future intellectual methods to be deterministic software.

| Admission condition | Test |
|---|---|
| Defined target | The operation and required result have a fixed meaning; a desirable adjective is not an output rule. |
| Declared inputs | Required data, semantic interpretation and permitted unknowns are explicit. |
| Executable transformation | Each consequential step is supplied, points to an admitted dependency, or declares a bounded discretionary choice with an acceptance rule. |
| Covered conditions | Every admitted input has a continuation, result or explicit unresolved/input-failure outcome. |
| Compatible rules | Applicable instructions have a consistent interpretation or an explicit justified precedence. |
| Termination meaning | Completion, unsuccessful search, resource exhaustion and unresolved work have distinct outcomes. |
| Evidence scope | A proof, source description, implemented operation, observed result and transfer claim remain separate. |
| Source identity | Original content and scope remain attributable; a repair is a named descendant, not an alleged faithful import. |

## M01 — Finite Cartesian enumeration

| Part | Specified content |
|---|---|
| Derivation | Retained source operation with explicit local input and execution bounds |
| Inputs | Ordered named finite lists of distinct string values. |
| Transformation | Visit each tuple in the Cartesian product once, retaining its named coordinates. |
| Output | Every tuple in the declared domains; empty factor yields no tuples; zero factors yields one empty tuple. |
| Operating conditions | At most 4096 tuples in this implementation; all lists supplied explicitly. |
| Termination | After the last tuple; reject an input exceeding the bound. |
| Remaining intellectual work | Choice and completeness of the domain model are supplied by the investigator, not solved by enumeration. |
| Verification | Tuple count equals the product of supplied domain sizes; all coordinates belong to their domain; no tuple is repeated. |
| Implementation | tools/study_methods.py:finite_candidates |
| Transfer limit | Completeness applies to supplied domains only; feasibility of combinations and adequacy of dimensions require separate findings. |

[Reasoningtool archived /se](sources/rt_se.txt); [Python itertools.product](https://docs.python.org/3/library/itertools.html#itertools.product)

## M02 — Finite propositional counterexample search

| Part | Specified content |
|---|---|
| Derivation | Locally composed finite truth-table method from conditional counterexample search and complete enumeration; no claim of historical novelty. |
| Inputs | Distinct Boolean atoms, premises and a conclusion expressed with not, and, or, implies or iff. |
| Transformation | Enumerate every Boolean assignment; retain assignments satisfying every premise; return those falsifying the conclusion. |
| Output | Valid-in-model or counterexamples, plus whether the premises are unsatisfiable. |
| Operating conditions | At most 12 atoms and formula nesting at most 64; classical two-valued semantics. |
| Termination | After all 2^n assignments; invalid syntax or undeclared atoms are input failures. |
| Remaining intellectual work | Translating a prose proposition into the formulas is an independent intellectual operation. |
| Verification | A returned counterexample has true premises and false conclusion; no-counterexample entails validity only in the declared complete Boolean model. |
| Implementation | tools/study_methods.py:check_inference |
| Transfer limit | Not a parser, empirical truth test, unrestricted proof search or execution of the entire original ARAW. |

[Reasoningtool archived /araw](sources/rt_araw.txt); [Reasoningtool archived /se](sources/rt_se.txt)

## M03 — Required-condition candidate filtering

| Part | Specified content |
|---|---|
| Derivation | Source filtering operation revised to retain unknown prerequisite states |
| Inputs | Candidate identities with a nonempty map of required checks to true, false or unknown. |
| Transformation | Reject if any required check is false; otherwise retain unresolved if any is unknown; otherwise record that required checks pass. |
| Output | Status plus the exact failed and unknown conditions for each candidate. |
| Operating conditions | The supplied checks are the declared requirements; observations retain their evidence scope. |
| Termination | After each supplied candidate and requirement has been examined once. |
| Remaining intellectual work | Investigators must justify the requirements and observation values; passing does not establish optimality. |
| Verification | Unknown-only candidates remain unresolved; one known failure is enough for rejection under a conjunctive contract. |
| Implementation | tools/study_methods.py:requirement_filter |
| Transfer limit | Does not infer absent requirements or measure the truth of supplied observations. |

[Reasoningtool archived /cmp](sources/rt_cmp.txt); [Reasoningtool archived /foht](sources/rt_foht.txt)

## M04 — Required-condition achievement assessment

| Part | Specified content |
|---|---|
| Derivation | Deliberate repair of the incomplete source gate; optional merit separated |
| Inputs | Nonempty required-condition observations, optional observations and an independent abandonment flag. |
| Transformation | Apply the required-condition status rule; return achieved, not achieved or undetermined. Retain optional observations and activity status separately. |
| Output | Achievement status, failed requirements, unknown requirements, optional observations and activity status. |
| Operating conditions | Achievement means satisfaction of all declared required conditions; input observations are true, false or unknown. |
| Termination | After the finite required map is examined; empty or malformed required maps are specification failures. |
| Remaining intellectual work | The goal-specific required conditions and evidence must be supplied; no universal 70 percent optional threshold is imported. |
| Verification | Every valid input has one achievement status; unknown is not coerced to false; optional shortfalls do not negate satisfaction of all declared requirements. |
| Implementation | tools/study_methods.py:achievement_status |
| Transfer limit | A passing assessment proves neither causal effectiveness of the process nor fulfillment of an incorrectly specified goal. |

[GOSM outcome verification v1.0](sources/gosm_outcome.txt)

## M05 — Alternative support-path preservation

| Part | Specified content |
|---|---|
| Derivation | Deliberate refinement of downstream pruning into support-path inspection |
| Inputs | Finite justified alternative premise sets and a supplied true, false or unknown status for each premise. |
| Transformation | Within each path, mark invalidated if a premise is false, unresolved if none is false and some are unknown, otherwise retained. Preserve every unaffected path. |
| Output | Per-path status and whether at least one declared support path remains. |
| Operating conditions | Each path is separately justified as sufficient support; all named premise statuses supplied. |
| Termination | After every finite path has been inspected once. |
| Remaining intellectual work | Justifying the inference from a premise set to its conclusion is separate; cyclic self-support is not established by this bookkeeping. |
| Verification | Changing one premise invalidates only paths containing it; an independent retained path survives. |
| Implementation | tools/study_methods.py:support_preservation |
| Transfer limit | Losing all recorded support does not imply the conclusion false or that no other support exists. |

[ARAW to GOSM bridge v1.0.0](sources/gosm_bridge.txt); [Reasoningtool archived /araw](sources/rt_araw.txt)

## Source admission decisions

| Source feature | Decision | Decisive case or missing operation | Retained contribution or repair | Source |
|---|---|---|---|---|
| ARAW universalization guarantees all possibilities | Not admitted as a completeness guarantee | Deriving a broad form supplies no enumerator or closure proof for every possible instance. | A finite declared-domain product is retained as M01; discovering the adequate domain remains study work. | [ARAW recovered README](sources/araw_readme.txt) |
| ARAW prescribed rejection or disagreement proportions | Not imported as a verdict rule | A fixed set of valid analytical claims can all be proven; an additional forced false or genuinely uncertain verdict cannot be derived from those proofs. | Evidence-derived verdicts remain. Counts can describe exploration, but cannot determine which propositions are true. | [Reasoningtool archived /araw](sources/rt_araw.txt) |
| ARAW conclusion implies acceptance after useful consequences | No such implication admitted | Consequences conditional on an assumption do not prove the assumption. The original also requires derived verdicts. | M02 keeps truth of premises, validity of implication and acceptance of the actual premise separate. | [Reasoningtool archived /araw](sources/rt_araw.txt) |
| GOSM outcome percentage thresholds | Rejected as a complete outcome partition; repaired locally | All required conditions satisfied with fewer than 70 percent optional conditions satisfied matches none of the non-abandoned numeric branches. | M04 returns achievement from required conditions and reports optional merit separately. | [GOSM outcome verification v1.0](sources/gosm_outcome.txt) |
| GOSM causal contribution percentages | Not admitted as an identified causal estimator | A template requesting percentages does not supply a causal model, comparison design or identification argument. | Attribution remains a separate investigative target; no percentages are fabricated. | [GOSM outcome verification v1.0](sources/gosm_outcome.txt) |
| GOSM immediate pruning of downstream conclusions | Qualified and revised | A rejected premise can invalidate one support path while another independently supports the conclusion. The source later calls for per-dependent review. | M05 inspects support paths and preserves independent grounds. | [ARAW to GOSM bridge v1.0.0](sources/gosm_bridge.txt) |
| GOSM every tension is a prerequisite | Not imported universally | Two alternatives can disagree about a fact that cannot change the selected action or its required conditions. | A tension becomes a prerequisite only when a case-specific dependency establishes it. | [ARAW to GOSM bridge v1.0.0](sources/gosm_bridge.txt) |
| GOSM one uniform system under the name | Source identities separated | The archived /gosm is an analysis-depth dispatcher; historical GOSM instructions describe projects, gates and state records. | Translate both versions explicitly. The /pce dependency of Full remains unadmitted here. | [Reasoningtool archived /gosm](sources/rt_gosm.txt); [GOSM historical agent instructions, January 18 version](sources/gosm_history.txt) |
| Reasoningtool dimension variation proves independence | Not admitted as statistical independence or full product feasibility | One coordinate can vary while another stays fixed in some examples although a different pair of values is impossible. | Retain coordinate distinctions; investigate constraints and statistical independence only under their own definitions. | [Reasoningtool archived /dd](sources/rt_dd.txt) |
| Reasoningtool coverage of examples proves domain completeness | Restricted to coverage of the declared examples or domains | A third omitted example can introduce a new consequential dimension despite complete encoding of the seed examples. | M01 certifies finite enumeration. The domain-completeness claim remains separate. | [Reasoningtool archived /dd](sources/rt_dd.txt); [Reasoningtool archived /se](sources/rt_se.txt) |
| Reasoningtool all plausible methods before evaluation | Not admitted as a generally terminating prerequisite | An open-ended method space has no supplied finite enumeration or completion condition. | Use declared candidate inventories and expansion routes; retain the unresolved possibility of another method. | [Reasoningtool archived /foht](sources/rt_foht.txt) |
| Reasoningtool agreement across three futures means high confidence | Restricted to invariance within those scenarios | The three scenarios can share a false premise; their agreement supplies no probability calibration for omitted futures. | Preserve the conditional shared consequence and stated scenario domain. | [Reasoningtool archived /fut](sources/rt_fut.txt) |
| Reasoningtool complete procedure repertoire | Not claimed from metadata | The recovered source reports 415 skills; the separate archive contains 656 metadata entries and seven inspected bodies. | Unreviewed procedures remain source candidates, not admitted techniques or completed studies. | [Reasoningtool recovered agent instructions](sources/rt_agents.txt) |

[Study register](STUDY-TRANSLATIONS.md) · [Actual results](EXECUTIONS.md)
