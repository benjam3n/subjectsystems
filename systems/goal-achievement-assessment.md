Evidence: executable and exercised across 54 specified condition combinations.

Subject: **Goal achievement status**. Particular purpose: determine whether a goal's declared required conditions hold while preserving unknown evidence, optional merit and activity state. The [Goals topic](../subjects/goal.md) is the retained local address.

## Source

[GOSM](../sources/systems/gosm.md) supplies its outcome-verification gate and the distinction between a produced plan and an achieved outcome. [Reasoningtool](../sources/systems/reasoningtool.md), specifically archived `/cmp` and `/foht`, supplies required-condition filtering and explicit prerequisite states. The [source record](../sources/study-inventory.md) preserves the originals.

The original numeric gate has an uncovered state when all required conditions pass but fewer than 70 percent of optional conditions pass. This descendant removes that optional threshold from achievement, introduces an explicit unknown status and retains abandonment independently. It adds no causal attribution percentages. These changes are deliberate; they are not attributed to the original gate.

## Input

A nonempty map names the required conditions and records each as true, false or unknown. An optional map records additional merit on the same observation scale. A separate Boolean flag states whether the activity has been abandoned.

The case author must justify which conditions are required and supply evidence for their observations. This method does not infer the user's goal, certify a proxy, observe the world or silently convert a revised goal into the original goal. A nonempty required set is an operating condition of this version, not a universal rule about every possible goal.

## Operation

Validate the observation types. If any required condition is false, return **not achieved** with the failed and unknown conditions. Otherwise, if any is unknown, return **undetermined**. Otherwise return **achieved**. Retain optional observations and activity status in separate fields in all three cases.

The rules partition every admitted required-condition vector. Optional shortfall cannot negate satisfaction of all declared requirements. Abandonment cannot erase an already established observation; whether abandonment occurred before achievement requires its own time-qualified record.

An empty or malformed required map produces a specification error and no achievement verdict. Every valid input terminates after a finite pass over its conditions.

## Result already produced

Finite candidate generation produced all 54 combinations of two required observations, one optional observation and an abandonment flag. The replacement returned 6 achieved, 30 not achieved and 18 undetermined results. It returned achieved for the exact gap case in the original numeric rules and retained the optional failure explicitly. [Executed results](../studies/system/execution.md).

Implementation: [study_methods.py](../tools/study_methods.py), `achievement_status`, using M03 and M04. Reproduce through [run_study_cases.py](../tools/run_study_cases.py).

This establishes coverage and behavior for the supplied observation domain. It does not establish the truth of real-world observations, adequacy of the achievement conditions, desirability of the goal or causal effectiveness of GOSM.
