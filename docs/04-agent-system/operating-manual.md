# Tiku Advancement Operating Manual

## Status

Active concise recovery entry point. The minimal safety kernel supersedes the former ContentAdmin/P0/P1/Module Run
hook chain and all per-finding transition routes.

## Recovery Read Order

1. `AGENTS.md` and the code-taste commandments.
2. Relevant ADR and requirement SSOT for the product surface.
3. `docs/04-agent-system/state/task-safety.json`.
4. The current task and next task only in `project-state.yaml` and `task-queue.yaml`.
5. The task plan/evidence referenced by the current task only when it exists.

Historical guards, smoke suites, archived tasks and old evidence are read on demand, not by default.

## Ordinary Task Flow

1. Confirm WIP=1 and create a short `codex/`, `feat/` or `fix/` branch/worktree.
2. Declare objective, exact allowed files, validation commands and applicable fresh approvals in `task-safety.json`.
3. Use focused TDD for product behavior; run the affected tests before broad checks.
4. Freeze code and perform one main-thread adversarial review of contract, diff, behavior and regression risk.
5. Stage the complete task diff and commit through the real pre-commit hook.
6. Keep one task in one commit. Merge only ff-only to `master`.
7. Push only after fresh approval with `TIKU_PUSH_APPROVED=1`, then verify remote sync and run kernel closeout after cleanup.

Ordinary low-risk work does not create separate plan/evidence/audit files unless they add real recovery value. It never
changes guard/smoke code to recognize a task, finding, SHA or file set.

## Safety Boundaries

- Product TypeScript changes require declared `test`, `lint` and `typecheck` validation kinds.
- Dependency, database/schema/migration, permission/authorization, deployment and secret/env paths require non-empty
  fresh approval sources in the task contract.
- Provider, payment, external service, PR, force-push, destructive data and Cost Calibration Gate remain separately
  approval-gated.
- Evidence and terminal output must not expose secrets, tokens, credentials, raw provider payloads, raw prompts/answers,
  private data, full papers/materials or plaintext `redeem_code` outside its approved product UI boundary.

## State And Queue

State and queue own scheduling, recovery and WIP=1 only. They do not authorize commits, pushes or high-risk actions.
Historical terminal entries remain immutable and resolvable through their indexes. Do not add transition-only modes,
freshness keys or duplicated closeout checkpoints to claim ordinary work.

## Current Product Resume Anchor

- P1 remediation goal remains `in_progress`.
- Next finding: `F-0009`.
- Proposed next task: `p1-remediation-rc-03-org-auth-closure-actions-2026-07-20`.
- No F-0009 product RED starts until the minimal-safety-kernel task is committed, merged, pushed when approved, synced and cleaned.

## Commands

```powershell
# focused task safety behavior
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-MinimalSafetyKernel.Smoke.ps1 -Profile focused

# manual closeout after approved push and cleanup
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-MinimalSafetyKernel.ps1 -Phase closeout
```

If the kernel blocks because scope, approval or Git topology is ambiguous, stop and resolve the single root cause. Do not
add a task-specific compatibility branch and do not use `--no-verify`.
