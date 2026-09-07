# Executed study contributions

Executed finite models and explicit source-rule interpretation; no empirical success probabilities are inferred.

## The source outcome rule has a gap

The recovered GOSM gate requires all mandatory conditions and at least 70 percent of optional conditions for its numeric achieved branch. Its partial interval is 50–99 percent mandatory completion, and its not-achieved branch is below 50 percent. At 100 percent mandatory completion and zero percent optional completion, with the project not abandoned, none of these numeric branches applies. The source also describes achievement as satisfying all primary criteria, exposing a second tension between the prose criterion and added optional threshold.

The custom achievement system returns **achieved**, reports the optional shortfall separately, and retains activity state independently. This is a deliberate revised definition, not a claim to execute the original threshold rule faithfully.

## Complete bounded case domain

| Dimension | Values |
|---|---|
| required_1 | true, false, unknown |
| required_2 | true, false, unknown |
| optional_1 | true, false, unknown |
| abandoned | false, true |

The Cartesian product has 3 × 3 × 3 × 2 = **54 cases**. The replacement produces exactly one achievement status for each: **6 achieved, 30 not achieved, 18 undetermined**. Unknown evidence remains unknown. The full input and output for every case is retained in [execution-results.json](execution-results.json).

## An inference study checks a verdict rule

| Fixed analytical inference | Validity in supplied model | Valuations | Counterexamples |
|---|---|---|---|
| A premise entails itself | True | 2 | [] |
| Conjunction entails its first conjunct | True | 4 | [] |
| A premise entails a disjunction containing it | True | 4 | [] |
| Modus ponens | True | 4 | [] |
| Two material implications compose | True | 8 | [] |
| Achievement alone entails causal process contribution | False | 4 | [{"achieved": true, "process_caused": false}] |

All five fixed analytical examples have valid nonvacuous implications. An additional mandatory rejected or genuinely uncertain verdict is unsupported in that set; this targets the quota interpreted as a verdict requirement, not every ARAW operation. The source also tells the executor to derive verdicts from findings; the local admission decision resolves this conflict in favor of those actual grounds. It does not infer that everything in ARAW fails.

The invalid inference has the explicit countermodel achieved = true, process_caused = false. Achievement by itself therefore cannot identify the process contribution. A causal attribution requires additional premises and evidence. An inconsistent-premise case is reported as vacuous validity, with no premise-satisfying model; it is not presented as evidence about an actual situation.

## An unordered component set does not specify behavior

| Order | Input | Output |
|---|---|---|
| increment → double | 1 | 4 |
| double → increment | 1 | 3 |

The components, their individual operations and initial input remain fixed. Changing their order changes the result. A list of subjects or study names therefore cannot recover this property of the system. An organized composition can preserve it by recording the order.

## A correction does not erase independent support

| Support path | Premise observations | Result |
|---|---|---|
| A | A = false; B = true | invalidated |
| B | A = false; B = true | retained |

The rejected A path is invalidated while the B path survives. Each path is assumed independently justified; losing a path does not establish the conclusion false. This directly supplies the distinction needed before propagating a correction into a plan.

## Method applicability retains unknowns

| Candidate | Status | Failed conditions | Unknown conditions |
|---|---|---|---|
| specified_finite_method | passes_required_checks |  |  |
| undefined_domain_method | unresolved |  | finite_domain |
| inapplicable_method | rejected | finite_domain |  |

## Explicit input failures

| Case | Result | Reason |
|---|---|---|
| undeclared_atom | input_rejected | Undeclared atom: Q |
| empty_required_map | input_rejected | Supply a nonempty map of required checks to true, false or null. |
| oversized_enumeration | input_rejected | Declared Cartesian space exceeds the execution bound. |

The invalid-input cases produce no substantive achievement, validity or completeness verdict. The stated execution bounds belong to these implementations; they are not limits on what the subject can investigate.

Run `python3 tools/run_study_cases.py` to reproduce these results, then `python3 tools/build_study_systems.py` to regenerate the reading views.

- The formulas are explicit analytical inputs; truth-table validity does not validate every prose translation.
- Goal observations are stipulated; the method does not measure whether a real-world criterion holds.
- The arithmetic order example proves insufficiency of an unordered component list for its stated behavior; it is not a theory of all physical systems.
- Independent support paths are assumed separately justified. The bookkeeping supplies no new causal or probabilistic evidence.
