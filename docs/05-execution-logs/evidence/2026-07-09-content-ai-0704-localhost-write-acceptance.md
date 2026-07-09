# 2026-07-09 Content AI 0704 Localhost Write Acceptance Evidence

## Scope

- Task id: `content-ai-0704-localhost-write-acceptance-2026-07-09`
- Branch: `codex/content-ai-0704-localhost-write-acceptance`
- Runtime: localhost / `127.0.0.1` only, explicit 20260704 local DB target, process-only DB override.
- Approval: current user approved process-only 0704 DB override and private account login material in process memory.
- Redaction: this evidence records only role labels, route labels, aggregate counts, safe status categories, and command outcomes. It does not record credentials, sessions, cookies, tokens, env values, DB URLs, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI output, full question/paper/material/resource/chunk content, screenshots, raw DOM, browser storage, or private fixture values.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Code taste, UI code, ADR, AI generation, RAG, advanced edition, authorization, content admin, learner, organization training requirements.
- Latest 2026-07-07 through 2026-07-09 0704 DB, content AI, organization AI, enterprise training, evidence, and audit records.

## Runtime Boundary

| Check                           | Result       | Redacted note                                                              |
| ------------------------------- | ------------ | -------------------------------------------------------------------------- |
| Local dev server                | pass         | `http://127.0.0.1:3000/login` returned HTTP 200                            |
| 0704 DB target                  | pass         | process-only target label match confirmed; no DB URL printed               |
| `.env.local` mutation           | not_executed | no env file edit                                                           |
| Provider-enabled generation     | not_executed | no AI generation POST was submitted                                        |
| Provider secret exposure        | pass         | child process did not expose provider key values in command line           |
| Browser screenshot / raw DOM    | not_executed | no screenshot, trace, DOM dump, storage capture, session, or cookie output |
| Package / lockfile / dependency | not_changed  | no package or lockfile edit                                                |
| Schema / migration / seed       | not_changed  | no schema, migration, seed, or destructive DB operation                    |

## Private Account Login Probe

Private account material was read from the local private acceptance directory in memory only. Values were not copied to evidence or chat.

| Role                        | Direct login result | Counted for this branch | Note                                                                            |
| --------------------------- | ------------------- | ----------------------- | ------------------------------------------------------------------------------- |
| `content_admin`             | pass                | yes                     | exact role session established                                                  |
| `personal_standard_student` | pass                | yes                     | exact personal session established                                              |
| `org_advanced_employee`     | pass                | yes                     | exact employee session established                                              |
| `personal_advanced_student` | blocked             | no                      | current direct password login was not re-confirmed against the explicit 0704 DB |
| `org_standard_employee`     | blocked             | no                      | current direct password login was not re-confirmed against the explicit 0704 DB |
| `org_standard_admin`        | blocked             | no                      | current direct password login did not establish the target admin role           |
| `org_advanced_admin`        | blocked             | no                      | current direct password login did not establish the target admin role           |

Interpretation: service and DB target are healthy, but the currently available private direct-login material does not re-confirm every historical role against this explicit 0704 DB run. This is treated as a fixture/account-material gap, not a source-code defect.

## Content AI Write-Path Probe

| Area                        | Result             | Aggregate evidence                                                                                                                                   |
| --------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content AI出题 history      | pass               | 2 history items; 2 generated results; statuses: rejected 1, blocked 1; reviewed draft count 1; formal question count 0                               |
| Content AI出题 adoption     | blocked_data_gap   | no existing result simultaneously had `blocked` adoption status, reviewed draft payload, and adoptable evidence; no Provider generation was executed |
| Content AI出题 publish      | blocked_data_gap   | no formal question draft public target existed in current 0704 history                                                                               |
| Content AI组卷 history      | pass               | 2 history items; 2 generated results; statuses: draft_created 1, approved_for_formal_adoption 1; reviewed draft count 1; formal paper count 1        |
| Content AI组卷 draft detail | pass               | draft detail available; section count 1; question count 2; scored question count 2                                                                   |
| Content AI组卷 publish      | blocked_validation | publish returned validation category `422204`; aggregate question score was present but paper total score was null                                   |

Interpretation: the current source implementation is covered by the prior closed source/test branches, but the existing 0704 DB content AI records are stale for a full no-Provider write-path replay. The paper draft was created before the current stricter publish-validity expectations and is not publishable as-is.

## Organization Training Probe

| Role                    | Route / action                   | Result                | Aggregate evidence                                   |
| ----------------------- | -------------------------------- | --------------------- | ---------------------------------------------------- |
| `org_advanced_employee` | visible training list            | pass                  | visible published version category count 4           |
| `org_advanced_employee` | answer submit                    | blocked_current_state | submit returned conflict/already-processed category  |
| `org_standard_employee` | direct role boundary             | not_counted           | target direct login was not re-confirmed in this run |
| `org_advanced_admin`    | organization AI / training admin | not_counted           | target direct login was not re-confirmed in this run |

## Security Boundary

- Provider call executed: false.
- Fresh AI generation submitted: false.
- Screenshots/raw DOM/storage capture: false.
- Sensitive values recorded in evidence/chat: false.
- Destructive DB operation: false.
- Staging/prod/deploy/Cost Calibration: false.
- Source/test/package/schema changes: false.

## Current Result

This branch proves the process-only 0704 DB localhost service, in-memory private login for the roles that currently match, content AI history/detail surfaces, and employee visible-training read path. It does not prove a full content AI publish replay or full seven-role direct-login matrix because the current 0704 fixture/history state is insufficient without separate fixture/history refresh approval.

No current source-code defect is confirmed in this branch.

## Validation

| Command                                                                                                                                                                                                                                                                                                                                                                                                               | Result                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/admin-paper-ui.test.ts --reporter=dot`                                                                                                                                                                                                                           | pass; 3 files / 80 tests  |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/lib/admin-ai-generation-formal-draft-payload.test.ts src/server/services/paper-draft-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts --reporter=dot`                                                                                                             | pass; 4 files / 67 tests  |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts --reporter=dot`                                                                                              | pass; 4 files / 96 tests  |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/organization-training-route.test.ts src/server/services/organization-training-service.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts --reporter=dot` | pass; 6 files / 119 tests |
| `corepack pnpm@10.26.1 run typecheck`                                                                                                                                                                                                                                                                                                                                                                                 | pass                      |
| `corepack pnpm@10.26.1 run lint`                                                                                                                                                                                                                                                                                                                                                                                      | pass                      |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                    | pass                      |
| `corepack pnpm@10.26.1 exec prettier --write --ignore-unknown <scoped-doc-files>`                                                                                                                                                                                                                                                                                                                                     | pass                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-0704-localhost-write-acceptance-2026-07-09`                                                                                                                                                                                                                                 | pass                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-0704-localhost-write-acceptance-2026-07-09 -SkipRemoteAheadCheck`                                                                                                                                                                                                             | pass                      |

## Closeout Status

- Current status: ready for local commit, fast-forward merge, master push, and short-branch cleanup under approved closeout boundary.
- Acceptance result: bounded localhost acceptance completed with current 0704 fixture/history gaps.
