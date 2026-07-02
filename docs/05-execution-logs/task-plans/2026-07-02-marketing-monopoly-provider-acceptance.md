# Marketing and monopoly resource coverage plus Provider acceptance task plan

## Task

- Task id: `marketing-monopoly-provider-acceptance-2026-07-02`
- Branch: `codex/marketing-monopoly-provider-acceptance`
- Source: user requested the next专项 for `marketing` / `monopoly` resource coverage and a fuller 8-role real Provider acceptance. Logistics is excluded until material exists.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-20-fix-quick-acceptance.md`
- `docs/05-execution-logs/evidence/2026-07-02-ops-admin-local-login-residual.md`
- Existing owner-preview resource import scripts and tests.

## Scope

- Local-only resource package discovery and import for `marketing` and `monopoly`.
- Local aggregate coverage checks only: counts, profession labels, status categories.
- Localhost browser acceptance for all 8 owner-preview role labels.
- Bounded real Provider samples only where the role and page legitimately expose AI出题 / AI组卷.
- Record only role labels, profession labels, route labels, status categories, counts, duration buckets, and failure categories.

## Out Of Scope

- `logistics` resource coverage.
- Source/test/runtime code changes.
- `.env*` modification or evidence. Existing local runtime code and existing import scripts may read necessary local env values to connect only to guarded local dev services; values must not be printed, recorded, or committed.
- Dependency, package, lockfile, schema, migration, seed, staging/prod/cloud/deploy, e2e, Cost Calibration, release readiness, final Pass, PR, or force push.
- Raw DB rows, internal ids, credentials, cookies, tokens, sessions, localStorage, Authorization headers, Provider payloads, prompts, raw AI input/output, raw DOM, screenshots, traces, or full generated/resource/question/paper/material/chunk content in evidence.

## Acceptance Matrix

- `personal_standard_student`: login and AI access denied/not applicable; no Provider submit.
- `personal_advanced_student`: AI出题 and AI组卷 visible; at most 2 Provider submits.
- `org_standard_employee`: login and AI access denied/not applicable; no Provider submit.
- `org_advanced_employee`: AI出题 and AI组卷 visible; at most 2 Provider submits.
- `org_standard_admin`: login and advanced AI access denied/not applicable; no Provider submit.
- `org_advanced_admin`: organization AI出题 and AI组卷 visible; at most 2 Provider submits.
- `content_admin`: content AI出题 and AI组卷 visible; at most 2 Provider submits.
- `ops_admin`: login and ops/admin routes usable; no Provider submit unless an existing ops surface legitimately exposes scoped AI review, which should be recorded separately as not part of generation samples.

## Provider Budget

- Max localhost UI submit attempts: 8.
- Max per role/function route: 1.
- Retries: 0.
- No raw prompt, Provider payload, raw AI output, or generated content evidence.

## Validation

- `npm.cmd run test:unit -- tests/unit/owner-preview-resource-import.test.ts tests/unit/owner-preview-runtime-rag-resource-import.test.ts tests/unit/local-acceptance-session-bootstrap.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-marketing-monopoly-provider-acceptance.md docs/05-execution-logs/evidence/2026-07-02-marketing-monopoly-provider-acceptance.md docs/05-execution-logs/audits-reviews/2026-07-02-marketing-monopoly-provider-acceptance.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId marketing-monopoly-provider-acceptance-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId marketing-monopoly-provider-acceptance-2026-07-02 -SkipRemoteAheadCheck`
