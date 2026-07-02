# Marketing and monopoly Provider rerun implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-run the marketing / monopoly resource-backed 8-role localhost Provider acceptance after learner and employee history closure repair.

**Architecture:** Treat this as a local acceptance rerun, not a source repair. Reuse the existing owner-preview resource import scripts, local acceptance login/session helpers, route-integrated Provider flow, and redacted evidence conventions. Keep logistics out of scope until material exists.

**Tech Stack:** Next.js 16 local dev server, TypeScript import scripts, PostgreSQL local dev target, in-app browser, Qwen through existing OpenAI-compatible route.

---

## Task

- Task id: `marketing-monopoly-provider-rerun-2026-07-02`
- Branch: `codex/marketing-monopoly-provider-rerun`
- Depends on: `learner-employee-ai-history-closure-2026-07-02`
- Source: user requested entering the “营销 / 专卖资料覆盖导入与更完整 8 角色真实 Provider 验收”专项, with logistics excluded until material is available.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-marketing-monopoly-provider-acceptance.md`
- `docs/05-execution-logs/evidence/2026-07-02-learner-employee-ai-history-closure.md`
- `scripts/db/Import-OwnerPreviewResourcePackage.ps1`
- `scripts/db/Import-OwnerPreviewRuntimeRagResources.ps1`
- `tests/unit/owner-preview-resource-import.test.ts`
- `tests/unit/owner-preview-runtime-rag-resource-import.test.ts`
- `tests/unit/local-acceptance-session-bootstrap.test.ts`

## Scope

- Local-only package discovery and dry-run checks for `marketing` and `monopoly`.
- Re-run idempotent local import only if the dry-run and package coverage are valid.
- Use `.runtime/owner-preview-rag` for local runtime resource storage; `.runtime/` is ignored.
- Restart or start local `http://localhost:3000` only if needed.
- Run 8 role labels through localhost browser acceptance:
  - `personal_standard_student`
  - `personal_advanced_student`
  - `org_standard_employee`
  - `org_advanced_employee`
  - `org_standard_admin`
  - `org_advanced_admin`
  - `content_admin`
  - `ops_admin`
- Run bounded real Provider samples only for routes that legitimately expose AI出题 / AI组卷.
- Record only role labels, profession labels, route labels, workflow labels, status categories, error categories, counts, and duration buckets.

## Out Of Scope

- `logistics` resource coverage or logistics Provider validation.
- Source/test/runtime code changes unless a new blocker makes the rerun impossible and the user separately approves a repair task.
- Package, lockfile, dependency, schema, migration, seed, e2e, staging/prod/cloud/deploy, Cost Calibration, release readiness, final Pass, PR, force push.
- `.env*` modification or evidence. Existing local runtime may read required local env values, but values must not be printed, recorded, or committed.
- Raw DB rows, internal ids, credentials, cookies, tokens, sessions, localStorage, Authorization headers, Provider payloads, prompts, raw AI input/output, raw DOM, screenshots, traces, or full generated/resource/question/paper/material/chunk content in evidence.

## Execution Steps

- [x] Confirm branch and clean working tree.
- [x] Run focused unit tests for import and local acceptance helpers.
- [x] Run catalog import dry-run and record only aggregate counts/status.
- [x] Run runtime RAG import dry-run with `.runtime/owner-preview-rag` and record only aggregate counts/status.
- [x] Execute idempotent catalog import only if dry-run is valid.
- [x] Execute idempotent runtime RAG import only if dry-run is valid.
- [x] Confirm or start local dev server at `http://localhost:3000`.
- [x] Connect to the in-app browser and run the 8-role route matrix.
- [x] Run at most 8 Provider submits, max one per role/function route, no retries.
- [x] Check request/result closure using safe aggregate UI/API status only.
- [x] Record pass/fail/blocked/not_applicable for each role/function.
- [x] Write redacted evidence and adversarial audit review.
- [x] Run validation gates.

## Acceptance Matrix

- `personal_standard_student`: login reachable, advanced AI generation disabled or denied, no Provider submit.
- `personal_advanced_student`: AI出题 and AI组卷 reachable, each at most one Provider submit, result/request closure visible through ordinary UI or safe aggregate status.
- `org_standard_employee`: login reachable, advanced AI generation disabled or denied, no Provider submit.
- `org_advanced_employee`: AI出题 and AI组卷 reachable, each at most one Provider submit, result/request closure visible through ordinary UI or safe aggregate status.
- `org_standard_admin`: organization portal reachable, advanced AI generation disabled or denied, no Provider submit.
- `org_advanced_admin`: organization AI出题 and AI组卷 reachable, each at most one Provider submit, history/result categories separated by generation kind.
- `content_admin`: content AI出题 and AI组卷 reachable, each at most one Provider submit, history/result categories separated by generation kind.
- `ops_admin`: ops route reachable, no Provider submit.

## Provider Budget

- Max Provider submit attempts: 8.
- Max per role/function route: 1.
- Retries: 0.
- Evidence records only executed/not_executed status, status category, failure category, duration bucket, and token count bucket if exposed safely.

## Validation

- `npm.cmd run test:unit -- tests/unit/owner-preview-resource-import.test.ts tests/unit/owner-preview-runtime-rag-resource-import.test.ts tests/unit/local-acceptance-session-bootstrap.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-marketing-monopoly-provider-rerun.md docs/05-execution-logs/evidence/2026-07-02-marketing-monopoly-provider-rerun.md docs/05-execution-logs/audits-reviews/2026-07-02-marketing-monopoly-provider-rerun.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId marketing-monopoly-provider-rerun-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId marketing-monopoly-provider-rerun-2026-07-02 -SkipRemoteAheadCheck`
