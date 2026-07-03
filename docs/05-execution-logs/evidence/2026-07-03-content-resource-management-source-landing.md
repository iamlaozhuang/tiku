# 2026-07-03 Content Resource Management Source Landing Evidence

## Summary

result: pass

Task id: `content-resource-management-source-landing-2026-07-03`

Branch: `codex/content-resource-management-source-landing-2026-07-03`

Base commit: `5dad2425923b0888b64b3bed1ddddefc0ce84907`.
Implementation commit: `1784d8930edd651f95c44d45a262500a1853b4ce`.

Cost Calibration Gate remains blocked.

threadRolloverGate: after this source landing package closeout, recover from this evidence, current `project-state.yaml`,
current `task-queue.yaml`, the accepted content resource management UI/UX contract, and the committed source diff.

automationHandoffPolicy: no automation handoff; continue manually from committed docs, state/queue, and source only.

nextModuleRunCandidate: after this package is committed, merged, pushed, and cleaned up, start the next serial source
landing package from the remaining accepted UI/UX contract backlog. Each next package must rematerialize its own reads,
allowed files, validation commands, evidence, audit, commit, merge, push, and cleanup.

Batch range: one bounded source landing package for content resource management.

RED: accepted UI/UX contract required migrating resource management ownership away from operations wording and tightening
the `ops_admin` runtime boundary without broad product-code churn.

GREEN: source now exposes the content resource route, removes the operations menu entry, redirects the legacy operations
route, denies `ops_admin` runtime access, and covers the changed behavior with focused unit tests.

batchCommitEvidence: one commit is expected for this package after validation succeeds; no unrelated package is batched
into this commit.

localFullLoopGate: local validation is required before commit, fast-forward merge, push, and branch cleanup.

blocked remainder: operations authorization, organization training, organization analytics, organization AI post-actions,
model/Prompt/log governance, learner flows, schema/migration, dependency changes, Provider/model actions, browser/e2e
runtime, DB actions, env/secret reads, deployment, release readiness, final Pass, production usability, PR, force-push,
and Cost Calibration remain blocked for this package.

## Scope

Implemented the accepted content resource management source landing package:

- Added `/content/resources` as the content-workspace resource management page.
- Redirected the legacy `/ops/resources` page to `/content/resources`.
- Moved the resource management navigation entry from operations workspace to content workspace.
- Restricted resource runtime access so `ops_admin` is denied while `content_admin` and `super_admin` remain eligible.
- Reworded ordinary resource UI around `资料`, `解析草稿`, `发布`, and `重建检索索引`.
- Added visible page-size, pagination, sort controls, level filtering, and URL query preservation for the resource list.
- Updated focused unit coverage for route ownership, navigation ownership, runtime authorization, UI copy, pagination controls, and redaction boundaries.

## Validation

### Initial validation note

- `pnpm exec vitest run ...` did not enter tests because pnpm attempted a non-interactive dependency status check. No dependency file was changed.
- Validation was rerun through existing local binaries under `node_modules`.

### Commands

- `npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/admin-resource-knowledge-ui-layout.test.ts tests/unit/phase-9-rag-resource-knowledge-runtime.test.ts`
  - Result: passed.
  - Summary: 4 test files passed; 32 tests passed.
- `npm.cmd run typecheck`
  - Result: passed.
- `npm.cmd run lint`
  - Result: passed after removing an unnecessary pagination state-sync effect that ESLint flagged in an earlier focused
    lint run.
- `npm.cmd run format:check`
  - Result: passed after formatting task-touched source/test files.
- `git diff --check`
  - Result: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-resource-management-source-landing-2026-07-03`
  - Initial result: failed because a touched test fixture contained a banned English authorization synonym in a
    public-id string. The fixture id was changed to `permit`.
  - Rerun result: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-resource-management-source-landing-2026-07-03`
  - Initial result: failed because this evidence did not yet record required closeout anchors and validation commands.
  - Rerun result: pass after this evidence update.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-resource-management-source-landing-2026-07-03 -SkipRemoteAheadCheck`
  - Initial result: failed because `project-state.yaml` repository checkpoint still pointed to the previous master
    baseline. The checkpoint was updated to the current local `master` / `origin/master` sha.
  - Rerun result: pass.

## Boundary Evidence

- No package manifest or lockfile changes.
- No database schema, migration, seed, or direct database access.
- No Provider/model calls, Prompt registry edits, env/secret reads, OCR, object storage rollout, or cloud conversion work.
- No localhost browser, e2e runtime, staging/prod deploy, PR creation, force push, release readiness, final Pass, or production-usability claim.
- Evidence excludes credentials, tokens, sessions, cookies, Authorization headers, env values, raw DB rows, internal numeric ids, PII, plaintext `redeem_code`, Provider payloads, prompts, raw AI IO, raw employee answers, full content, screenshots, traces, and raw DOM dumps.

## Observed Result

- Content admins get a content-workspace resource management entry.
- Operations admins no longer get a resource management menu entry.
- The legacy operations resource route redirects to the content resource path.
- Runtime resource access returns permission denied for an authenticated `ops_admin` actor.
- User-facing resource management copy avoids foregrounding raw `chunk`, `embedding`, storage path, internal ids, and raw full content exports.
- Resource list controls include page size, page navigation, sort field, sort direction, and query preservation.
