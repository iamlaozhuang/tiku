# Evidence: AI generation cross-role grounding and UI wording rerun

## Scope

- Task id: `ai-generation-cross-role-grounding-ui-rerun-2026-07-01`
- Branch: `codex/ai-generation-cross-role-grounding-ui-rerun`
- Execution type: source/test/docs/state repair with static scans.
- Runtime exclusions: no DB connection or mutation, Provider call, env access, credential read, browser runtime, dependency change, schema/migration/seed change, staging/prod/cloud/deploy, Cost Calibration, release readiness, or final Pass.

## Redaction Boundary

This evidence records only command names, pass/fail summaries, role labels, file paths, and safe count summaries. It must not include credentials, tokens, sessions, localStorage values, Authorization headers, `.env*`, database URLs, raw DB rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, complete generated content, screenshots, traces, raw DOM, HTML dumps, or full question/paper/material/resource/chunk content.

## Root Cause Scan

- Initial focused scan showed two classes:
  - student AI history/detail JSX passed technical field keys into ordinary visible label props;
  - content admin AI review traceability panel rendered raw implementation enum wording.
- Existing focused tests also still expected a schema-facing paper structure label; this was a regression risk because tests could preserve the wrong product wording.
- Service scan confirmed both student and admin route-integrated Provider paths still resolve grounding context and block insufficient evidence before Provider execution.
- Wider observation scan found protected-content wording in ops/audit/model configuration areas outside the ordinary AI 出题 / AI 组卷 shared surfaces. This is recorded as a follow-up UX consistency item rather than expanded into this source repair.

## RED

- `npm.cmd run test:unit -- src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`: failed as expected after adding/updating guards.
  - Admin review panel still rendered implementation wording.
  - Student AI page still passed technical field names as ordinary visible labels.

## GREEN

- Replaced student AI history/detail visible label props with business labels while preserving existing value mapping.
- Replaced content admin AI review traceability and validation wording with operator-facing business language.
- Updated stale admin AI test expectations from schema wording to business wording.
- Focused result: `3` test files / `26` tests passed.

## Static Scan

- AI 出题 / AI 组卷 production source label scan: pass, no hits.
- AI 出题 / AI 组卷 production source blocked wording scan: pass, no hits.
- Grounding service scan: pass, shared student/admin runtime bridge still checks grounding context before Provider execution.

## Validation

- `npm.cmd exec -- prettier --check --ignore-unknown <changed files>`: pass.
- `npm.cmd run test:unit -- src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`: pass.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `git diff --check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-cross-role-grounding-ui-rerun-2026-07-01`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-cross-role-grounding-ui-rerun-2026-07-01 -SkipRemoteAheadCheck`: fail then pass. First run failed only because repository SHA anchors were stale; anchors were updated to current master/origin master and rerun passed.

## Closeout

- Ready for local commit, fast-forward merge to `master`, push to `origin/master`, and short branch cleanup under the task closeout policy.
