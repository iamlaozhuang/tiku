# AI generation bounded Provider rerun after structured contract evidence

## Boundary

- Task id: `ai-generation-bounded-provider-rerun-after-structured-contract-2026-07-02`
- Branch: `codex/ai-generation-bounded-provider-rerun-after-structured-contract`
- Scope: bounded content-admin local Provider rerun after deterministic structured contract gates.
- Source/test/runtime code changed: false at task start.
- Evidence mode: role label, route/function, profession, subject, status category, duration bucket, structured preview count, and failure category only.

## Preflight

- Deterministic rollup prerequisite: closed and passing.
- Localhost server check: `http_200`.
- Local acceptance session: `content_admin` cookie session created; credential, cookie, token, session, Authorization header, and localStorage values recorded: false.
- Provider submit attempts: `6`.
- Provider retries: `0`.
- Runtime Provider built-in limits observed: `maxRequests=1`, `maxRetries=0`, `maxOutputTokens=1800`, `timeoutMs=60000`.

## Provider Samples

| Role label      | Route/function | Profession  | Subject  | Attempted | Outcome category                  | Duration bucket | Structured preview count        | Failure category                        |
| --------------- | -------------- | ----------- | -------- | --------- | --------------------------------- | --------------- | ------------------------------- | --------------------------------------- |
| `content_admin` | content AI出题 | `marketing` | `theory` | true      | provider_executed_visible_result  | `30_60s`        | question_set `10/10`            | none                                    |
| `content_admin` | content AI组卷 | `marketing` | `theory` | true      | provider_executed_visible_result  | `20_30s`        | paper_draft question_count `50` | none                                    |
| `content_admin` | content AI出题 | `monopoly`  | `skill`  | true      | failed_or_insufficient_safe_error | `gt_60s`        | none                            | unacceptable_grounded_structured_output |
| `content_admin` | content AI组卷 | `monopoly`  | `skill`  | true      | provider_executed_visible_result  | `20_30s`        | paper_draft question_count `50` | none                                    |
| `content_admin` | content AI出题 | `logistics` | `theory` | true      | failed_or_insufficient_safe_error | `gt_60s`        | none                            | unacceptable_grounded_structured_output |
| `content_admin` | content AI组卷 | `logistics` | `theory` | true      | provider_executed_visible_result  | `20_30s`        | paper_draft question_count `50` | none                                    |

## Acceptance Result

- Provider attempt count bounded to six and retry count zero: pass.
- AI组卷 successful paper samples recognized total question count for all three professions: pass.
- AI出题 successful sample recognized requested question count: pass for `marketing`.
- AI出题 all-profession Provider acceptance: fail for `monopoly` and `logistics`.
- No raw Provider payload, prompt, AI output, generated question, generated paper, material, chunk, credential, cookie, token, session, Authorization header, localStorage, `.env*` value, raw DB row, internal id, or PII recorded: pass.

## Residual / Next Task

- `AI-GEN-PROVIDER-RERUN-01`: AI出题 still has live Provider structure failures for `monopoly` and `logistics`; both failures surfaced as safe unacceptable grounded structured output with no retry.
- `AI-GEN-PROVIDER-RERUN-02`: AI组卷 question-count recognition is no longer the observed blocker in this content-admin Provider sample set.
- Next recommended task: repair AI出题 live Provider structured-output robustness without changing Provider evidence redaction rules.

## Validation

| Command                                                                                                                                                                                                            | Result                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| `npm.cmd run test:unit -- <focused AI generation structured contract files>`                                                                                                                                       | pass, 8 files, 118 tests              |
| `npm.cmd run lint`                                                                                                                                                                                                 | pass                                  |
| `npm.cmd run typecheck`                                                                                                                                                                                            | pass                                  |
| `npm.cmd exec -- prettier --write --ignore-unknown <task docs/state files>`                                                                                                                                        | pass                                  |
| `npm.cmd exec -- prettier --check --ignore-unknown <task docs/state files>`                                                                                                                                        | pass                                  |
| `git diff --check`                                                                                                                                                                                                 | pass                                  |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-bounded-provider-rerun-after-structured-contract-2026-07-02`                                                                                         | pass, 5 scoped files scanned          |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-bounded-provider-rerun-after-structured-contract-2026-07-02 -SkipRemoteAheadCheck`                                                                     | initial block on repository SHA drift |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-bounded-provider-rerun-after-structured-contract-2026-07-02 -SkipRemoteAheadCheck` after project-state repository SHA accepted-ancestor anchor refresh | pass                                  |

## Boundary Checks

- Source/test/runtime code changed: false.
- Package or lockfile changed: false.
- Schema, migration, or seed changed: false.
- Direct database mutation by agent: false.
- `.env*` read or written by agent: false.
- Raw DB rows or internal ids recorded: false.
- Provider payload, prompt, or raw AI output recorded: false.
- Full generated question, generated paper, material, resource, or chunk content recorded: false.
- Cookie, token, session, Authorization header, localStorage, credential, or PII recorded: false.
- Staging/prod/cloud/deploy executed: false.
- Release readiness, final Pass, production usability, and Cost Calibration claimed: false.
