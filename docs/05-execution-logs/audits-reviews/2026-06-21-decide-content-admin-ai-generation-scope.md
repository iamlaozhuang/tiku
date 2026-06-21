# Audit Review: Decide Content Admin AI Generation Scope

**Date:** 2026-06-21
**Task id:** `decide-content-admin-ai-generation-scope`
**Review type:** `product_architecture_decision_package`
**Runtime claim:** none

## Findings

| severity | findingId     | finding                                                                                                                              | decision                                                                                      |
| -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| high     | CONTENT-AI-01 | Standard MVP docs and AP-04 keep AI 出题/AI 组卷 as future/non-goal, while the audit found users may expect content_admin entries.   | Record current implementation as blocked and require product scope choice before code.        |
| high     | CONTENT-AI-02 | Direct Provider output into formal `question` or `paper` would cross formal-content, Provider, cost, security, and audit boundaries. | Future implementation must use isolated generated result/draft review before formal adoption. |

## Audit Conclusion

This task closes the audit item as a decision package. It does not implement content_admin AI generation, does not approve Provider execution, and does not create formal adoption behavior.
