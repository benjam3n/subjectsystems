Evidence: executable and exercised on six fixed analytical inferences, with scope and input failures recorded.

Subject: **Claim inference validity**. Specific purpose: decide whether supplied classical Boolean premises entail a supplied conclusion within their complete finite valuation space. The [Reasoning topic](../subjects/reasoning.md) is the retained local address.

## Source

This new composition replaces open-ended counterexample generation with complete Boolean assignment enumeration for this particular target. It does not claim to execute the original ARAW, discover every real-world possibility, meet source depth quotas or perform an empirical study automatically. Semantic translation into formulas remains independently examinable work.

## Operation

Input consists of at most 12 distinct atom names, a list of premises and a conclusion. Formulas use Boolean constants, declared atom names, unary `not`, or binary `and`, `or`, `implies`, `iff`. Nesting is bounded at 64. No arbitrary code or prose evaluation occurs.

Validate the formula grammar and atom declarations. Enumerate the complete `false`/`true` product. Evaluate every premise under each assignment. Where all premises are true, evaluate the conclusion and retain the assignment if it is false. At exhaustion, return validity within this model, all counterexamples, valuation count and whether the premises had no satisfying assignment.

Malformed formulas, undeclared atoms or oversized inputs terminate with an input error, not a validity verdict. Inconsistent premises yield vacuous validity explicitly; they supply no evidence that any actual case satisfies those premises.

## Composition

Formula validation determines which atom domain can be enumerated. Enumeration supplies the assignments consumed by premise evaluation. The premise result controls whether an assignment enters conclusion evaluation. Counterexample retention consumes true-premise/false-conclusion pairs. Order and those conditions are necessary parts of this system description; a list of subjects alone omits them.

## Result already produced

Implementation: [study_methods.py](../tools/study_methods.py), `check_inference`, using technique contracts M01 and M02. Reproduce through [run_study_cases.py](../tools/run_study_cases.py).

The result certifies the supplied formal implications only. A correct truth table cannot rescue an incorrect translation of a natural-language claim. A future subject-specific version can use a richer logic, but it must supply that logic's own semantics and procedure.
