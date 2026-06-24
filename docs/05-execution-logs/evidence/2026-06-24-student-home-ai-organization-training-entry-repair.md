# Evidence: student-home-ai-organization-training-entry-repair-2026-06-24

## Status

- Current status: closed on `master` after fast-forward merge and local post-merge validation; push and short-branch deletion are approved and pending in this closeout run.
- Branch: codex/student-home-ai-org-training-entries-20260624
- Scope: learner home `AI训练` and `企业训练` entry discoverability plus learner AI page product labels.
- Explicit non-claim: this evidence does not declare standard/advanced MVP final Pass.

## Closeout Approval

- Approval source: user message on 2026-06-24, "合入 master、push、删除短分支，然后继续推进下一步工作" followed by "继续".
- Approved actions: fast-forward merge into `master`, push `master` to `origin/master`, and delete merged short branch `codex/student-home-ai-org-training-entries-20260624`.
- Still blocked: PR, force push, staging/prod deploy, Provider enablement, payment/external services, and standard/advanced MVP final Pass claims.

## SSOT Read List

- docs/01-requirements/00-index.md
- docs/01-requirements/modules/03-student-experience.md
- docs/01-requirements/advanced-edition/00-index.md
- docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md
- docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md
- docs/01-requirements/advanced-edition/modules/04-organization-training.md
- docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md
- docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md
- docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md
- docs/01-requirements/traceability/role-experience-fulfillment-matrix.md

## Requirement Mapping Result

- R5 personal advanced learner requirement maps to a discoverable learner-home `AI训练` entry and visible learner AI route actions for `AI出题` and `AI组卷`.
- R5 personal standard learner exclusion maps to no enabled advanced AI entry when no existing authorization capability permits AI generation.
- R6 advanced organization employee requirement maps to learner-home `AI训练` and `企业训练` entries when existing authorization context capabilities permit AI generation and organization training.
- R6 standard organization employee exclusion maps to no enabled `AI训练` or `企业训练` entry when existing authorization context capabilities do not permit those actions.

## Role Mapping Result

- In scope: `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`, `org_advanced_employee`.
- Out of scope: backend admin roles, content backend roles, ops backend roles.
- Capability source: existing `/api/v1/authorizations` response fields; no schema, migration, Provider, or dependency change was introduced.

## Implementation Evidence

- `src/features/student/home/StudentHomePage.tsx` now accepts and runtime-loads existing authorization contexts from `/api/v1/authorizations`.
- Learner home derives `AI训练` from `canGenerateAiQuestion` or `canGenerateAiPaper`, and derives `企业训练` from `canAnswerOrganizationTraining`.
- Absence of capability evidence remains fail-closed: advanced learner home entries are hidden, and an authorization-context fetch failure does not block paper list loading.
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx` now uses learner-facing `AI训练`, `AI出题`, and `AI组卷` labels while preserving local contract / redacted status boundaries.
- No `.env*`, dependency, lockfile, schema, migration, Provider, Cost Calibration, staging/prod, payment, external service, browser/e2e, or script change was made.

## Verification Log

| Command                                                                                                                                                                                                   | Status                          | Evidence                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`                                                                 | RED fail before implementation  | 2 files ran; 4 expected failures: missing `AI训练`/`企业训练` learner home links and missing `AI训练` heading / `AI出题` / `AI组卷` buttons.                                       |
| `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`                                                                 | GREEN pass                      | 2 files passed; 20 tests passed after implementation.                                                                                                                              |
| `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts`                                                                                                                                             | RED fail before fail-closed fix | 1 expected failure: authorization-context fetch error made the learner home render the generic loading-failed state instead of continuing with papers and hidden advanced entries. |
| `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts`                                                                                                                                             | GREEN pass                      | 1 file passed; 13 tests passed after fail-closed authorization-context handling.                                                                                                   |
| `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/organization-training-employee-entry-surface.test.ts` | pass                            | 3 files passed; 24 tests passed.                                                                                                                                                   |
| `npm.cmd run lint`                                                                                                                                                                                        | pass                            | ESLint completed with exit 0.                                                                                                                                                      |
| `npm.cmd run typecheck`                                                                                                                                                                                   | pass                            | `tsc --noEmit` completed with exit 0.                                                                                                                                              |
| `npx.cmd prettier --check --ignore-unknown ...`                                                                                                                                                           | initial fail, remediated        | Initial check warned only on the new evidence and audit Markdown files; `npx.cmd prettier --write ...` was run on those two files.                                                 |
| `npx.cmd prettier --check --ignore-unknown ...`                                                                                                                                                           | pass                            | Final full allowlist check reported: `All matched files use Prettier code style!`.                                                                                                 |
| `git diff --check`                                                                                                                                                                                        | pass                            | Exit 0 with no whitespace findings.                                                                                                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId student-home-ai-organization-training-entry-repair-2026-06-24`             | pass                            | Module Run v2 hardening passed; SSOT Read List and Requirement Mapping Result were accepted; 9 files scanned in task scope.                                                        |

## Master Closeout Verification

- `git merge --ff-only codex/student-home-ai-org-training-entries-20260624`: pass; `master` fast-forwarded to `d7d9910915d92ca8b19278292beecde517f87fc6`.
- `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/organization-training-employee-entry-surface.test.ts`: pass on `master`; 3 files passed, 24 tests passed.
- `npm.cmd run lint`: pass on `master`; ESLint exit 0.
- `npm.cmd run typecheck`: pass on `master`; `tsc --noEmit` exit 0.
- `npx.cmd prettier --check --ignore-unknown ...`: pass on `master`; all matched files use Prettier code style.
- `git diff --check`: pass on `master`; no whitespace findings.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId student-home-ai-organization-training-entry-repair-2026-06-24`: pass on `master`; no changed files before closeout status update.
