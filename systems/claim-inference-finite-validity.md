Classical Boolean entailment of a supplied conclusion by supplied premises across their complete finite valuation space.

1. Accept at most 12 distinct atoms, a premise list, and a conclusion. Permit Boolean constants, declared atoms, unary not, and binary and, or, implies, and iff, with nesting at most 64.
2. Reject malformed formulas, undeclared atoms, and exceeded bounds before issuing a verdict.
3. Enumerate every Boolean assignment. Evaluate the premises under each assignment; where all are true, evaluate the conclusion and retain assignments where it is false.
4. Return all counterexamples, the valuation count, and validity within the supplied model. Report vacuous validity when no assignment satisfies the premises.
5. Examine the translation from the original claim separately whenever the formal result is used to judge that claim.

[Claim inference validity](../subjects/claim.md#claim-inference-validity)

[Case results](../studies/system/execution.md)

[check_inference](../tools/study_methods.py)
