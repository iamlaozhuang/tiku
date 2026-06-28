# Layer 3 Staging Target Materialization And Next Task Reseed Plan

Task id: `layer-3-staging-target-materialization-and-next-task-reseed-2026-06-27`

Branch: `codex/layer-3-staging-target-reseed-20260627`

Task kind: `docs_state_staging_target_materialization_reseed`

## Approval Boundary

Current user fresh-approved a docs/state-only Layer 3 staging target materialization/reseed task.

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-layer-3-staging-target-materialization-and-next-task-reseed.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-target-materialization-and-next-task-reseed.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-staging-target-materialization-and-next-task-reseed.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-staging-target-materialization-and-next-task-reseed.md`

Approved work:

- Register or reconcile isolated staging target facts, staging URL or deploy target status, allowed account/data,
  rollback owner, monitoring owner, incident route, no-prod-data boundary, and redaction rules.
- Reseed the next staging-only pre-release execution task.
- Commit, ff-only merge to `master`, run master gates, push `origin/master`, and delete the merged short branch.

Forbidden work:

- Browser/e2e, DB, Provider, Cost Calibration, prod, real payment/OCR/export, external-service mutation, PR, force push,
  release readiness, or final Pass.
- `.env*` read/write or any secret, token, DB URL, credential, raw request/response/log/page text, screenshot, trace,
  cookie, localStorage, raw prompt, Provider payload, generated AI content, full paper/material content, or private data
  in evidence.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/preview-owner-acceptance-owner-assignment-staging-boundary-packet.yaml`
- `docs/05-execution-logs/evidence/2026-06-22-preview-staging-resource-boundary-planning.md`
- `docs/05-execution-logs/task-plans/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-prod-deploy-pre-release-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-pre-release-redacted-execution.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-pre-release-rollup.md`
- `docs/05-execution-logs/evidence/2026-06-27-three-layer-acceptance-final-evidence-review.md`
- `docs/05-execution-logs/acceptance/2026-06-27-three-layer-acceptance-final-evidence-review.md`

## Requirement Decision Map

- Layer 1 role/entry/permission status remains pass and preserved by prior evidence.
- Layer 2 minimum business loop remains pass through local PostgreSQL test-owned `rejected` review-command evidence.
- Layer 3 Provider smoke and minimum local Cost Calibration remain pass from existing redacted evidence.
- Layer 3 staging/pre-release remains blocked unless exactly one concrete isolated staging URL or deploy target is
  registered without secrets and without production resource reuse.
- Payment/external-service and OCR/export remain approval-package-only blocked gates.
- Release readiness and final Pass remain blocked unless a later final evidence review proves all selected gates.

## Current Staging Facts

- ADR-004/ADR-005 require strict `dev` / `staging` / `prod` isolation.
- Existing owner packet records `laozhuang` as accountable, rollback, monitoring, incident, stop, data, and redaction
  owner.
- Existing staging package defines allowed account/data class as owner-acceptance or synthetic staging account only and
  synthetic or reviewed non-sensitive sample data only.
- Existing staging execution evidence blocked because no concrete isolated staging target was registered.
- Current search found no durable non-secret staging URL, deploy target, staging database, object storage, callback
  origin, or staging credential alias that can be used for execution.

## Implementation Approach

1. Create this task plan before substantive docs/state edits.
2. Update `project-state.yaml` with this task as current task and record the staging target materialization result.
3. Update `task-queue.yaml` with this task and a successor staging-only pre-release execution task that remains blocked
   until a concrete isolated staging target is provided in durable state/queue.
4. Write evidence, audit review, and acceptance documents with a redacted envelope.
5. Run scoped Prettier write/check, `git diff --check`, project status, precommit hardening, module closeout readiness,
   and prepush readiness.
6. Commit, ff-only merge to `master`, run master gates, push `origin/master`, and delete the merged short branch.

## Risk Defenses

- Do not guess a staging URL or deploy target.
- Do not discover targets from browser, network, cloud console, `.env*`, credentials, package scripts, or external
  services.
- Keep the successor task blocked if target remains missing.
- Evidence may record only labels, counts, pass/fail/blocked, cap status, redaction status, stop condition, and
  forbidden-action checklist.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-staging-target-materialization-and-next-task-reseed.md docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-target-materialization-and-next-task-reseed.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-staging-target-materialization-and-next-task-reseed.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-staging-target-materialization-and-next-task-reseed.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-staging-target-materialization-and-next-task-reseed.md docs/05-execution-logs/evidence/2026-06-27-layer-3-staging-target-materialization-and-next-task-reseed.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-staging-target-materialization-and-next-task-reseed.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-staging-target-materialization-and-next-task-reseed.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-staging-target-materialization-and-next-task-reseed-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-staging-target-materialization-and-next-task-reseed-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-staging-target-materialization-and-next-task-reseed-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

- A concrete target would require guessing, browser/network/cloud-console access, `.env*` reading, credential handling,
  DB, Provider, deploy, staging/prod action, payment, OCR/export, or external-service mutation.
- The successor execution task would become executable without exactly one registered non-secret isolated staging target.
- Any changed file falls outside the allowed six files.
- Any evidence would need secret/raw/private content.
- Any mechanism gate fails and cannot be repaired inside the approved docs/state scope.
