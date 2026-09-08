Evidence: executable and used to supply cases to the achievement-assessment study.

Subject: **Reasoning candidate generation**. Particular purpose: produce every candidate tuple in explicitly supplied finite domains, preserving exactly what completeness means. The [Reasoning topic](../subjects/reasoning.md) is the retained local address.

## Source

[Reasoningtool](../sources/systems/reasoningtool.md) archived `/se` Step 3A specifies a Cartesian product for exhaustive finite enumeration. This descendant retains that operation and supplies exact input rules, empty-domain behavior, an execution bound and a coverage result. Its implementation uses Python's documented `itertools.product`. [Source record](../sources/study-inventory.md).

It does not import the broader claim that describing a universal category automatically discovers all possible instances. It does not infer statistical independence, feasibility of combinations or completeness of the dimensions from their appearance in examples. It contains no automatic switch from exhaustive mode to a sample while retaining an exhaustive label.

## Operation

Supply an ordered map of named dimensions to finite lists of distinct string values. Validate the names and lists; multiply their lengths to obtain the declared candidate count. If that count exceeds 4096 in this version, return an input-bound error before enumeration.

Enumerate the Cartesian product in supplied dimension/value order, returning a named assignment for every tuple. A dimension with no values yields zero tuples. An empty dimension map yields the single empty assignment. Both follow the stated product semantics and are reported within that exact domain.

No tuple is discarded because it seems implausible. A downstream applicability study can assess constraints and distinguish rejected, unresolved and admissible candidates. Removing one requires its actual exclusion condition.

## Result already produced

The achievement-assessment case defines three three-valued observation dimensions and one two-valued activity dimension. This system produces all 54 distinct tuples. The branch-coverage study uses those cases to exercise its replacement assessment, while a known-state separating case exposes the original GOSM gate's gap. [Executed results](../studies/system/execution.md).

Implementation: [study_methods.py](../tools/study_methods.py), `finite_candidates`, under contract M01. The same enumeration operation also supplies assignments to [finite inference validity](claim-inference-finite-validity.md); the interpretation of the values and the relevant completion condition differ between those systems.

Choosing adequate dimensions remains a different subject. The next useful extension can replace an inadequate domain after a separating example, preserving the previous coverage result as true only of its previous domain.
