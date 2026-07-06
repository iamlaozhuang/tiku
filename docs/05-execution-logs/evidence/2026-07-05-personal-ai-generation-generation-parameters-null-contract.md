# 2026-07-05 Personal AI Generation `generationParameters` Null Contract Evidence

## Scope

- Close the current full-unit red subset where personal AI generation request validator/service/flow tests omitted `generationParameters` even though the contract returns `generationParameters: null`.
- Keep runtime behavior unchanged because ADR-002 requires optional API fields to return `null`.

## Commands

| Command                                                                                                                                                                                                                            | Result                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- src/server/validators/personal-ai-generation-request.test.ts src/server/services/personal-ai-generation-request-service.test.ts src/server/services/personal-ai-generation-request-flow-service.test.ts` | Failed before repair: 3 files, 3 failing assertions, all missing `generationParameters: null` in expected objects.                                                                                                                                                           |
| `npm.cmd run test:unit -- src/server/validators/personal-ai-generation-request.test.ts src/server/services/personal-ai-generation-request-service.test.ts src/server/services/personal-ai-generation-request-flow-service.test.ts` | Passed after repair: 3 files, 11 tests.                                                                                                                                                                                                                                      |
| `npm.cmd run typecheck`                                                                                                                                                                                                            | Passed.                                                                                                                                                                                                                                                                      |
| `npm.cmd run lint`                                                                                                                                                                                                                 | Passed.                                                                                                                                                                                                                                                                      |
| `npm.cmd run format:check`                                                                                                                                                                                                         | Passed.                                                                                                                                                                                                                                                                      |
| `git diff --check`                                                                                                                                                                                                                 | Passed.                                                                                                                                                                                                                                                                      |
| `npm.cmd run test:unit`                                                                                                                                                                                                            | First run timed out after 184 seconds with no usable result.                                                                                                                                                                                                                 |
| `npm.cmd run test:unit`                                                                                                                                                                                                            | Failed with 4 remaining failures outside this task scope: legacy paper alias inventory, phase-21 reset password expectation, phase-22 cookie-only admin read expectation, and phase-8 org auth UI empty-state expectation. The 3 personal AI generation failures are closed. |

## Adversarial Checks

- Confirmed `PersonalAiGenerationRequestDto` and `PersonalAiGenerationRequestInput` require `generationParameters` with a `null` fallback.
- Confirmed the validator already normalizes missing generation parameters to `null`.
- No source behavior, Provider execution, DB action, env/credential access, dependency change, schema/migration/seed change, browser runtime, or dev server work was performed.

## Remaining Known Failures

- `tests/unit/paper-legacy-alias-inventory.test.ts`
- `tests/unit/phase-21-admin-permission-boundary-review.test.ts`
- `tests/unit/phase-22-content-admin-cookie-session-repair.test.ts`
- `tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts`
