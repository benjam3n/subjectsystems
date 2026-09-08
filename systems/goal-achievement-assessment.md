Achievement under declared required conditions, with optional observations and activity state retained separately.

1. Accept a nonempty map of required conditions, an optional-condition map, and a Boolean abandonment flag. Each observation must be true, false, or unknown. Reject an empty or malformed required map.
2. If any required condition is false, return not achieved and retain all failed and unknown conditions.
3. Otherwise, if any required condition is unknown, return undetermined with those conditions.
4. Otherwise return achieved. Preserve optional observations and abandonment state in every result.
5. When applying the result to an actual goal, examine the justification of the required conditions and the evidence for the observations.

[Goal achievement status](../subjects/goal.md#goal-achievement-status)

[Case results](../studies/system/execution.md)

[achievement_status](../tools/study_methods.py)
