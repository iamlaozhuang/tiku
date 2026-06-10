# Module Run v2 Registry Finalizer Validation Lifecycle Hardening Plan

**Task id:** `module-run-v2-registry-finalizer-validation-lifecycle-hardening`

**Branch:** `codex/module-run-v2-registry-finalizer-validation-lifecycle`

**Task kind:** `mechanism_repair`

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- Module Run v2 SOPs under `docs/04-agent-system/sop/`
- Batch 102 plan, evidence, audit, run registry, and c7f9 worktree state

## Scope

Mechanism-only files:

- `scripts/agent-system/**`
- `docs/04-agent-system/state/**`
- `docs/04-agent-system/sop/**`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked surfaces remain package/lockfile, env/secret, provider, DB, schema/migration, business `src/**`, tests outside mechanism smoke scripts, e2e, deploy, payment, PR, force push, and Cost Calibration Gate.

## Implementation Plan

1. Add a run registry finalizer script and smoke that writes terminal registry fields with real Git `changedFiles`.
2. Wire serial validation failure and blocked validation-command stops to the finalizer.
3. Adjust startup dirty active-owner classification so evidence/audit-backed dirty owners run validation-surface before the heartbeat shortcut.
4. Update implementation seed generation and self-review so new tasks declare `validationCommandLifecycle`, with broad repository baseline under `advisory_baseline`.
5. Update schema, SOP, source-of-truth index, evidence, and audit.
6. Run focused mechanism smokes, startup/runner/dispatcher/serial/control-loop gates, `git diff --check`, `npm.cmd run lint`, and `npm.cmd run typecheck`.
7. Prove the next autopilot startup can take over without stale active owner or mechanism dirty state.

## Stop Conditions

Stop if any repair requires product source changes, dependency/package/lockfile edits, env/secret access, DB/provider/e2e/deploy/payment/PR/force-push, or Cost Calibration Gate execution.
