# Acceptance: Fix Route Error Envelope Question Paper Student Experience

- Task id: `fix-route-error-envelope-question-paper-student-experience-2026-06-29`
- Acceptance status: pass
- Branch: `codex/fix-route-error-envelope-20260629`

## Acceptance Criteria

| Criterion                                                                                                                                                             | Status |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Task goal, authorization, allowedFiles/blockedFiles, DB boundary, AI/Provider boundary, credential boundary, evidence rules, and closeout policy are materialized     | pass   |
| Focused RED tests prove the missing error-envelope behavior before the fix                                                                                            | pass   |
| Handler fix is minimal and uses the existing shared route-error-response helper                                                                                       | pass   |
| Focused GREEN tests prove generic 500 envelope behavior for both target handlers                                                                                      | pass   |
| Existing success-path and provider-blocked route-layering tests continue to pass                                                                                      | pass   |
| Evidence omits raw sensitive content, raw exception payloads, stack traces, and complete business content                                                             | pass   |
| Release readiness, final Pass, Cost Calibration, deploy, Provider/AI, DB, browser/runtime, dependency, schema/migration/seed, PR, and force-push gates remain blocked | pass   |
| Local governance validation commands pass                                                                                                                             | pass   |

## Accepted Output

- `src/server/services/question-paper/route-handlers.ts`
- `src/server/services/student-experience/route-handlers.ts`
- `tests/unit/question-paper/question-paper-rest-layering.test.ts`
- `tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`
- `docs/01-requirements/traceability/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md`
- `docs/05-execution-logs/task-plans/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md`
- `docs/05-execution-logs/evidence/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md`

## Next Recommended Task

`verify-ai-provider-error-snapshot-redaction-2026-06-29`

This next task is not started by this acceptance file. It must first materialize a fresh task plan,
allowedFiles/blockedFiles, validation commands, evidence restrictions, and closeout policy.
