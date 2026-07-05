# 2026-07-05 Stage C-1 Provider Freshness Bounded Smoke Rerun Plan

Task ID: `stage-c-1-provider-freshness-bounded-smoke-rerun-2026-07-05`

Branch: `codex/stage-c-1-provider-freshness-bounded-smoke-rerun-2026-07-05`

Status: closed as blocked before Provider call.

## Purpose

Run one bounded local Provider freshness smoke only if the approved runtime secret source is available in the current
process environment. This task does not execute Cost Calibration, staging/prod, DB, browser/e2e, schema/migration/seed,
dependency, or product source changes.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/acceptance/2026-07-05-full-chain-provider-cost-staging-approval-package.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-provider-cost-staging-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-1-read-only-provider-target-inventory.md`
- `docs/05-execution-logs/evidence/2026-07-04-stage-c-1-read-only-provider-target-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-stage-c-1-read-only-provider-target-inventory.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-1-secret-availability-decision.md`
- `docs/05-execution-logs/evidence/2026-07-04-stage-c-1-secret-availability-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-stage-c-1-secret-availability-decision.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-1-provider-smoke-rerun.md`
- `docs/05-execution-logs/evidence/2026-07-04-stage-c-1-provider-smoke-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-stage-c-1-provider-smoke-rerun.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`
- `src/server/services/route-integrated-provider-execution-service.ts`
- `src/server/contracts/route-integrated-provider-execution-contract.ts`
- `src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts`

## Scope

Allowed:

- materialize task plan, acceptance packet, evidence, audit, project state, and task queue;
- perform a boolean runtime presence check for the public secret source label `ALIBABA_API_KEY`;
- if present, execute at most one Provider call against `openai_compatible / alibaba-qwen / qwen3.7-max /
dashscope.aliyuncs.com` through the existing redacted smoke runner;
- record only task id, branch, public target labels, boolean status, request count, duration/token summary,
  pass/fail/block, and redacted summary.

Blocked:

- `.env*` read/write;
- secret/env value output, commit, or evidence;
- raw Prompt, Provider payload, raw AI I/O, complete generated content, full material/question/paper/resource content;
- token/session/cookie/header, raw DB rows, internal ids, screenshot, trace, raw DOM;
- DB, browser/e2e, dev server, schema/migration/seed, dependency, product source/test change, staging/prod, Cost
  Calibration;
- Provider readiness, release readiness, final Pass, production usability, or production readiness claim.

## Runtime Procedure

1. Confirm the task is on its own short branch and state/queue are aligned to this task.
2. Run the existing smoke runner with runtime approval flag, public target labels, one request cap, zero retry, and
   `60000 ms` timeout.
3. Treat missing runtime secret source, target mismatch, provider failure, timeout, redaction failure, or boundary
   expansion as terminal for this task.
4. Update redacted evidence and audit with the final pass/fail/block result.

The existing runner uses an internal synthetic non-sensitive smoke instruction. The instruction text and any Provider
response must not be recorded in evidence.

## Runtime Result

The runtime process did not have a usable `ALIBABA_API_KEY` source label. The smoke runner stopped before any Provider
call. This is a secret availability blocker for the current process, not a Provider target failure and not a product
source/auth/DB/browser issue.

## Closeout Result

Closeout gates passed after the redacted block evidence was recorded. No Provider request executed.

## Acceptance Mapping Result

| Requirement                              | Planned handling                                                                                           |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Exact public Provider target             | `openai_compatible / alibaba-qwen / qwen3.7-max / dashscope.aliyuncs.com` only.                            |
| Runtime secret label only                | Check/use `ALIBABA_API_KEY` from process environment only; no value output; no `.env*` read/write.         |
| Bounded execution                        | Max request `1`, retry `0`, timeout `60000 ms`, smoke runner output cap remains below approved max output. |
| Redacted evidence                        | Status/count/timing/token summary only; no raw Prompt/payload/output/secret/full content.                  |
| External gates remain separate           | Cost Calibration and staging/prod remain blocked.                                                          |
| No release or production readiness claim | Explicitly blocked.                                                                                        |

## Validation Plan

- `npm.cmd exec -- prettier --write --ignore-unknown <task files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <task files>`
- `git diff --check`
- blocked path diff against source/test/script/package/lockfile/db/browser/runtime/archive/index/env paths
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-c-1-provider-freshness-bounded-smoke-rerun-2026-07-05`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId stage-c-1-provider-freshness-bounded-smoke-rerun-2026-07-05 -SkipRemoteAheadCheck`
