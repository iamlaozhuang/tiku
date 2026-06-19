# Blocked Use Case Acceleration Governance Packet Task Plan

## Task

- Task id: `blocked-use-case-acceleration-governance-packet`
- Branch: `codex/blocked-use-case-acceleration-governance-packet`
- Objective: refresh the AP-02 through AP-11 blocked-use-case approval packages into a faster, safer batch
  advancement map while summarizing AP-01 as already locally closed but still release-blocked.
- Scope: docs/state/governance only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-18-blocked-gates-approval-package-materialization.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-local-experience-closeout-audit.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-local-experience-merge-push-cleanup.md`

## Approval Boundary

Approved by the current user request to execute the recommended acceleration package.

Allowed:

- Create a short-lived local branch.
- Create this task plan, evidence, and audit review.
- Update `project-state.yaml`, `task-queue.yaml`, and `local-experience-coverage-matrix.yaml`.
- Refresh AP-02 through AP-11 blocked task evidence anchors and acceleration boundaries.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and clean the
  merged short branch if the gates pass.

Blocked:

- `.env*` read/write, secret/env output, full database URL output.
- Provider/model calls, provider retry, streaming, staging/prod/cloud/deploy, payment/external-service, OCR/external
  parser execution, export/file generation execution, Cost Calibration Gate, DB read/write, destructive DB, raw SQL.
- Product source, tests, e2e specs, scripts, schema, migrations, package files, lockfiles, dependency changes.
- PR, force push, screenshots, traces, HTML reports, raw prompts, raw responses, provider payloads, row data, private
  data, raw question bank material, student answers, cleartext `redeem_code`.

## Execution Steps

1. Confirm clean `master` aligned with `origin/master`.
2. Create `codex/blocked-use-case-acceleration-governance-packet`.
3. Read mechanism, ADR, state, queue, matrix, and prior AP evidence.
4. Create task plan/evidence/audit.
5. Add a closed docs-only task queue record for this acceleration packet.
6. Update AP-02 through AP-11 blocked records to point at the refreshed acceleration evidence.
7. Update project-state and coverage matrix anchors without changing any release-blocked status.
8. Run validation gates.
9. Commit, fast-forward merge, push, and clean the branch.

## Validation Commands

- `git status --short --branch`
- `git rev-list --left-right --count master...origin/master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId blocked-use-case-acceleration-governance-packet`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId blocked-use-case-acceleration-governance-packet`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId blocked-use-case-acceleration-governance-packet`

## Closeout

This packet may close only as a docs/state acceleration package. It must not claim release readiness, execute any
high-risk gate, or mark additional matrix rows as `experience_closed`.
