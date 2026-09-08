Every assignment in an explicitly supplied finite Cartesian product.

1. Accept an ordered map of named dimensions to finite lists of distinct strings. Validate the names and values.
2. Multiply the dimension sizes. Return an input error if the product exceeds 4096.
3. Enumerate every tuple in dimension and value order and retain its named coordinates. An empty dimension yields no tuples; an empty dimension map yields one empty assignment.
4. Return the assignments. Apply any feasibility or exclusion conditions in a separate examination that retains their reasons and unresolved cases.

[Reasoning candidate generation](../subjects/reasoning.md#reasoning-candidate-generation)

[Case results](../studies/system/execution.md)

[finite_candidates](../tools/study_methods.py)
