# Module Run v2 WorkReadiness empty line parser repair

## Scope

- Task id: `module-run-v2-work-readiness-empty-line-parser-repair`
- Branch: `codex/work-readiness-empty-line-parser-repair`
- Fresh approval: current user prompt on 2026-06-21 asked to do the WorkReadiness empty line parser repair.
- This packet is limited to the WorkReadiness script, its smoke test, and governance plan/evidence/audit/state files.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `superpowers:systematic-debugging`
- `superpowers:test-driven-development`

## Root Cause Investigation

- Observed failure: `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit` failed before policy output with `HARD_BLOCK_ERROR Cannot bind argument to parameter 'Lines' because it is an empty string.`
- Reproduction conditions: queue/project-state YAML files contain blank lines, and the script passes file content arrays or task block arrays into functions with `[string[]]` parameters that do not allow empty string elements.
- Working pattern: other Module Run v2 scripts use `[AllowEmptyCollection()][AllowEmptyString()][string[]]` on YAML line/block parameters.
- Additional smoke baseline issue: existing WorkReadiness smoke expects a terminal task to hard-block, while the script currently treats terminal tasks as non-executable and exits successfully. This test expectation must be aligned so the empty-line regression is not masked.

## Allowed Files

- `scripts/agent-system/Test-ModuleRunV2WorkReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2WorkReadiness.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Files And Gates

- No `.env*`, package or lockfile changes.
- No `src/**`, `e2e/**`, `drizzle/**`, dependency, provider/model call, payment, deploy, PR, force-push, DB migration apply, destructive DB, staging/prod DB, or Cost Calibration Gate.
- Evidence records only command/result summaries.

## TDD Plan

1. Update WorkReadiness smoke fixture to include blank lines in project-state and task queue YAML, and align terminal task assertion to current non-executable terminal behavior.
2. Run the smoke before production script changes and record RED from the blank-line binding failure.
3. Add `[AllowEmptyCollection()][AllowEmptyString()]` to WorkReadiness string-array parameters that consume file lines, task blocks, and list values.
4. Re-run smoke and the real pre-edit command for this task as GREEN.
5. Run lint, typecheck, `git diff --check`, and pre-commit hardening.
6. Commit locally. Merge/push/branch cleanup remain unapproved unless separately requested.
