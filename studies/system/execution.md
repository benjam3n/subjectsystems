## Goal achievement condition

| Condition | Source rule | Local rule |
|---|---|---|
| All required conditions met; no optional condition met; activity not abandoned | No numeric branch applies | Achieved; optional shortfall recorded separately |

## Goal achievement case

| Dimension | Value |
|---|---|
| required_1 | true, false, unknown |
| required_2 | true, false, unknown |
| optional_1 | true, false, unknown |
| abandoned | false, true |

| Result | Count |
|---|---|
| achieved | 6 |
| not_achieved | 30 |
| undetermined | 18 |

## Claim inference validity

| Inference | Valid | Valuations | Counterexample |
|---|---|---|---|
| A premise entails itself | True | 2 | [] |
| Conjunction entails its first conjunct | True | 4 | [] |
| A premise entails a disjunction containing it | True | 4 | [] |
| Modus ponens | True | 4 | [] |
| Two material implications compose | True | 8 | [] |
| Achievement alone entails causal process contribution | False | 4 | [{"achieved": true, "process_caused": false}] |

## System composition order dependence

| Order | Input | Output |
|---|---|---|
| increment → double | 1 | 4 |
| double → increment | 1 | 3 |

## Claim support dependence

| Support path | Observation | Result |
|---|---|---|
| A | A = false; B = true | invalidated |
| B | A = false; B = true | retained |

## Reasoning approach applicability

| Candidate | Result | Failed condition | Unknown condition |
|---|---|---|---|
| specified_finite_method | passes_required_checks |  |  |
| undefined_domain_method | unresolved |  | finite_domain |
| inapplicable_method | rejected | finite_domain |  |

## Input admissibility

| Case | Result | Reason |
|---|---|---|
| undeclared_atom | input_rejected | Undeclared atom: Q |
| empty_required_map | input_rejected | Supply a nonempty map of required checks to true, false or null. |
| oversized_enumeration | input_rejected | Declared Cartesian space exceeds the execution bound. |
