# Batch 103 Authorization And Access Paper And Mock Exam Access Context Plan

**Task id:** `batch-103-authorization-and-access-paper-and-mock-exam-access-context-without-c`

**Task kind:** `implementation`

**Branch:** `codex/batch-103-owner-recovery`

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- Relevant Module Run v2 SOPs under `docs/04-agent-system/sop/`
- Latest registry-finalizer task plan, evidence, and audit

## Scope

Implement a low-risk local access-context summary for `paper` and `mock_exam` surfaces without changing real permission behavior.

Allowed surfaces:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- task plan, evidence, audit, and automation state files

Blocked surfaces remain env/secret files, package/lockfiles, database schema, migrations, provider calls, deploy, PR, force push, destructive DB work, and Cost Calibration Gate.

## Implementation Approach

1. Inspect existing authorization summary model/service naming and mirror established TypeScript patterns.
2. Add a local model/contract/service/validator slice that produces redacted `paper` and `mock_exam` access-context summaries for UI or API adapters.
3. Keep the implementation pure and local: no repository calls, no DB reads, no provider calls, and no permission decision changes.
4. Add focused unit coverage under allowed `src/server/services/**` or `src/server/validators/**`.
5. Run the task's validation commands with `D:\tiku\node_modules\.bin` prepended to `PATH` because this automation worktree has no local `node_modules`.
6. Write redacted evidence and audit review before any completion claim.

## Risk Defenses

- Do not expose auto-increment ids, raw `paper` content, raw answer text, plaintext `redeem_code`, provider payloads, Authorization headers, or database URLs.
- Use glossary terms exactly: `authorization`, `paper`, `mock_exam`, `personal_auth`, `org_auth`.
- Preserve API JSON `camelCase` in contracts and database-style `snake_case` only inside internal/local row-like models where already established.
- Treat generated context as explanatory summary only, not a real authorization gate.

## Stop Conditions

Stop if the task requires schema/migration changes, dependency/package/lockfile edits, env/secret access, real provider calls, real DB mutation, e2e, deploy, payment, PR, force push, or Cost Calibration Gate execution.

## Governed Recovery Plan

Recovery trigger: scheduler startup classified the stopped dirty owner worktree as `open_recovery_plan` for `manual_required_validation_surface_or_phase8_baseline_repair`.

Root cause:

- The focused Batch 103 implementation gates passed.
- The queue only had legacy `validationCommands`, so `npm.cmd run test -- --run focused` was treated as a hard validation gate.
- That command expands to the broad unit/e2e script and fails on unrelated phase-8 baseline tests outside Batch 103 allowed files, including an env/DB prerequisite that this task is not approved to satisfy.

Recovery scope:

1. Add `validationCommandLifecycle` to Batch 103 so `post_edit` gates are the implementation readiness surface, while broad baseline remains `advisory_baseline`.
2. Keep the broad baseline failure visible in evidence; do not hide or delete it.
3. Run `Test-ModuleRunV2ValidationSurfaceReadiness.ps1` before and after the lifecycle repair.
4. Run the scoped gates again with `D:\tiku\node_modules\.bin` prepended to `PATH`.
5. Run `Test-ModuleRunV2ModuleCloseoutReadiness.ps1` and record its result.

Recovery boundaries:

- No commit, merge, push, PR, branch cleanup, worktree cleanup, dependency, schema/migration, env/secret, provider, DB, deploy, payment, or Cost Calibration Gate action is approved by this recovery plan.
- Closeout remains blocked until a fresh approval explicitly authorizes local commit and any downstream closeout action.
