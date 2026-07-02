# AI generation bounded monopoly question Provider rerun after plaintext acceptance repair evidence

## Boundary

- Task id: `ai-generation-bounded-monopoly-question-provider-rerun-after-plaintext-acceptance-repair-2026-07-02`
- Branch: `codex/ai-generation-bounded-monopoly-question-provider-rerun-after-plaintext-acceptance-repair`
- Scope: one bounded content-admin local Provider rerun for `monopoly` / level `3` / `skill` / AI出题.
- Source/test/runtime code changed: false at task start.
- Evidence mode: role label, route/function, profession, level, subject, status category, duration bucket, structured preview count, and failure category only.

## Requirement Mapping Result

- `UC-ADV-CONTENT-ADMIN-AI-GENERATION`: rerun validates reviewable content-admin AI出题 draft generation for the previously failed monopoly slice after shared plaintext fallback repair.
- Admin ops AI draft/review boundary remains unchanged: no formal `question` or `paper` adoption is performed.
- Shared AI出题 parser repair remains the only code prerequisite; this task does not add role-specific behavior.

## Preflight

- Previous plaintext acceptance repair commit on master: `684580dc7`.
- Localhost server check: `http_200`.
- Local acceptance session: `content_admin` cookie session created; credential, cookie, token, session, Authorization header, and localStorage values recorded: false.
- Provider submit attempts: `1`.
- Provider retries: `0`.

## Provider Sample

| Role label      | Route/function | Profession | Level | Subject | Attempted | Outcome category                 | Duration bucket | Structured preview count | Failure category |
| --------------- | -------------- | ---------- | ----- | ------- | --------- | -------------------------------- | --------------- | ------------------------ | ---------------- |
| `content_admin` | content AI出题 | `monopoly` | 3     | `skill` | true      | provider_executed_visible_result | `20_30s`        | question_set `10/10`     | none             |

Safe response summary:

```text
httpStatus=200
apiCode=0
providerSubmitAttempts=1
providerRetries=0
executionResultStatus=pass
structuredPreviewCount=question_set 10/10
rawProviderPayloadRecorded=false
promptRecorded=false
rawAiOutputRecorded=false
```

## Acceptance Result

- Provider attempt count bounded to one and retry count zero: pass.
- AI出题 structured preview recognized requested question count for `monopoly` / level `3` / `skill`: pass.
- No raw Provider payload, prompt, AI output, generated question, generated paper, material, chunk, credential, cookie, token, session, Authorization header, localStorage, `.env*` value, raw DB row, internal id, or PII recorded: pass.
- This task did not repair or rerun AI组卷 question-count preview.

## Validation

| Command                                                                                                                                                                                                                                                                                                                  | Result                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts` | Passed: 4 files, 68 tests. |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                       | Passed.                    |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                  | Passed.                    |
| `npm.cmd exec -- prettier --write --ignore-unknown <task docs/state files>`                                                                                                                                                                                                                                              | Passed.                    |
| `npm.cmd exec -- prettier --check --ignore-unknown <task docs/state files>`                                                                                                                                                                                                                                              | Passed.                    |
| `git diff --check`                                                                                                                                                                                                                                                                                                       | Passed.                    |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-bounded-monopoly-question-provider-rerun-after-plaintext-acceptance-repair-2026-07-02`                                                                                                                                                                     | Passed.                    |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-bounded-monopoly-question-provider-rerun-after-plaintext-acceptance-repair-2026-07-02 -SkipRemoteAheadCheck`                                                                                                                                                 | Passed after SHA refresh.  |

## Boundary Checks

- Source/test/runtime code changed: false.
- Package or lockfile changed: false.
- Schema, migration, or seed changed: false.
- Direct database query or mutation by agent: false.
- Private OCR/material read or write: false.
- `.env*` read or written by agent: false.
- Raw DB rows or internal ids recorded: false.
- Provider payload, prompt, or raw AI output recorded: false.
- Full generated question, generated paper, material, resource, or chunk content recorded: false.
- Cookie, token, session, Authorization header, localStorage, credential, or PII recorded: false.
- Staging/prod/cloud/deploy executed: false.
- AI组卷 repair executed: false.
- Release readiness, final Pass, production usability, and Cost Calibration claimed: false.
