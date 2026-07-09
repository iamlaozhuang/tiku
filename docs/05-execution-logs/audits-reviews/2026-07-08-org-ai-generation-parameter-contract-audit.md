# Organization AI Generation Parameter Contract Audit

- Task id: `org-ai-generation-parameter-contract-2026-07-08`
- Branch: `codex/org-ai-generation-parameter-contract`
- Audit status: pass_source_test_merge_ready_for_push_cleanup.

## Requirement Mapping Result

| Check                              | Result                                                                                                                                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enterprise admin AI出题 parameters | Pass: question type, quantity, difficulty, and objective are carried into DTO/normalize, Provider instruction input, and structured preview validation.                                             |
| Enterprise admin AI组卷 parameters | Pass: source preference, question type distribution, paper structure, quantity, difficulty, and objective are carried into DTO/normalize, Provider instruction input, and paper preview validation. |
| Plan-only AI组卷 boundary          | Pass: Provider output remains an assembly plan; local selection still uses eligible question sources and does not accept generated question bodies.                                                 |
| Training publish boundary          | Pass: no organization training draft materialization or publish flow was changed in this stage.                                                                                                     |
| RAG boundary                       | Pass: RAG scope resolution is unchanged and remains a separate approved phase.                                                                                                                      |
| Sensitive data boundary            | Pass: no raw Provider payload, raw prompt, raw AI output, env, credential, DB row, internal numeric id, or full question/material content was introduced.                                           |

## Adversarial Review

- Could this grant enterprise standard admins advanced AI capability? No. Authorization guards and route access logic were not changed.
- Could this execute Provider or read secrets? No. Tests use controlled local fixtures; no real Provider execution or env/secret read occurred.
- Could this write formal question, paper, mock_exam, or organization training content? No. The change is limited to parameter contracts, validation, and plan normalization fallback.
- Could stricter validation reject old callers? Low risk. New preview option parameters are partial; callers that do not pass the new fields do not trigger the new mismatch checks.
- Could AI组卷 silently ignore user source preference? Lower risk after this change. Local plan normalization now falls back to the submitted source preference when the plan omits it.

## Residual Risk

- Full business loop remains incomplete until the later approved phases cover RAG scope, AI出题草稿物化, AI组卷试卷草稿物化, and end-to-end regression.
- Provider-enabled runtime was intentionally not executed.

## Conclusion

The stage 1 parameter-contract branch is suitable for master push and short-branch cleanup.
