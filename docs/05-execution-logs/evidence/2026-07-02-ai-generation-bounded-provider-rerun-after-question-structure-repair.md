# AI generation bounded Provider rerun after question structure repair evidence

## Boundary

- Task id: `ai-generation-bounded-provider-rerun-after-question-structure-repair-2026-07-02`
- Branch: `codex/ai-generation-bounded-provider-rerun-after-question-structure-repair`
- Scope: bounded content-admin local Provider rerun for previously failed AI出题 samples.
- Source/test/runtime code changed: false at task start.
- Evidence mode: role label, route/function, profession, subject, status category, duration bucket, structured preview count, and failure category only.

## Requirement Mapping Result

- `UC-ADV-CONTENT-ADMIN-AI-GENERATION`: rerun validates reviewable content-admin AI出题 draft generation for the previously failed professions.
- Admin ops AI draft/review boundary remains unchanged: no formal `question` or `paper` adoption is performed.
- Shared AI出题 parser repair remains the only code prerequisite; this task does not add role-specific behavior.

## Preflight

- Previous structured-output repair commit on master: `2509862c9`.
- Localhost server check: `http_200`.
- Local acceptance session: `content_admin` cookie session created; credential, cookie, token, session, Authorization header, and localStorage values recorded: false.
- Provider submit attempts: `2`.
- Provider retries: `0`.

## Provider Samples

| Role label      | Route/function | Profession  | Subject  | Attempted | Outcome category                  | Duration bucket | Structured preview count | Failure category                        |
| --------------- | -------------- | ----------- | -------- | --------- | --------------------------------- | --------------- | ------------------------ | --------------------------------------- |
| `content_admin` | content AI出题 | `monopoly`  | `skill`  | true      | failed_or_insufficient_safe_error | `gt_60s`        | none                     | unacceptable_grounded_structured_output |
| `content_admin` | content AI出题 | `logistics` | `theory` | true      | provider_executed_visible_result  | `20_30s`        | question_set `10/10`     | none                                    |

## Acceptance Result

- Provider attempt count bounded to two and retry count zero: pass.
- AI出题 structured preview recognized requested question count for `monopoly`: fail.
- AI出题 structured preview recognized requested question count for `logistics`: pass.
- No raw Provider payload, prompt, AI output, generated question, generated paper, material, chunk, credential, cookie, token, session, Authorization header, localStorage, `.env*` value, raw DB row, internal id, or PII recorded: pass.

## Residual / Next Task

- `AI-GEN-PROVIDER-RERUN-03`: `monopoly` / `skill` / AI出题 still fails as safe unacceptable grounded structured output after shared parser repair.
- `AI-GEN-PROVIDER-RERUN-04`: `logistics` / `theory` / AI出题 now returns acceptable structured preview `10/10` in this bounded sample.
- Next recommended task: proceed to the already queued monopoly scanned-PDF OCR/runtime RAG coverage task before another monopoly Provider rerun.

## Validation

| Command                                                                                                                                                                                                         | Result                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/route-integrated-provider-instruction-service.test.ts ...`                                | pass, 4 files, 64 tests |
| `npm.cmd run lint`                                                                                                                                                                                              | pass                    |
| `npm.cmd run typecheck`                                                                                                                                                                                         | pass                    |
| `npm.cmd exec -- prettier --write --ignore-unknown <task docs/state files>`                                                                                                                                     | pass                    |
| `npm.cmd exec -- prettier --check --ignore-unknown <task docs/state files>`                                                                                                                                     | pass                    |
| `git diff --check`                                                                                                                                                                                              | pass                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-bounded-provider-rerun-after-question-structure-repair-2026-07-02` | pass                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-bounded-provider-rerun-after-question-structure-repair-2026-07-02`   | pass                    |

## Boundary Checks

- Source/test/runtime code changed: false.
- Package or lockfile changed: false.
- Schema, migration, or seed changed: false.
- Direct database query or mutation by agent: false.
- `.env*` read or written by agent: false.
- Raw DB rows or internal ids recorded: false.
- Provider payload, prompt, or raw AI output recorded: false.
- Full generated question, generated paper, material, resource, or chunk content recorded: false.
- Cookie, token, session, Authorization header, localStorage, credential, or PII recorded: false.
- Staging/prod/cloud/deploy executed: false.
- AI组卷 repair executed: false.
- Release readiness, final Pass, production usability, and Cost Calibration claimed: false.
