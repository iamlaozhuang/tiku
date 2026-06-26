# Mechanism batch execution package and smoke runner task plan

Task id: `mechanism-batch-execution-package-and-smoke-runner-2026-06-26`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/01-requirements/00-index.md`
- `docs/05-execution-logs/evidence/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md`
- `docs/05-execution-logs/evidence/2026-06-26-formal-publish-student-visible-content-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-formal-publish-student-visible-content-approval-package.md`

## Requirement Decision Map

- The current user goal asks to tune the agent mechanism, not product behavior.
- `docs/01-requirements/00-index.md` confirms this task does not change standard MVP product behavior. It remains a
  governance/mechanism task for future execution discipline.
- `operating-manual.md` already allows Module Run v2 grouping, but guarded goal packet and docs-only fast lane do not
  yet define a general 3-5 task execution package boundary for mixed docs/source/local-smoke chains.
- `local-first-validation-governance.md` defines a local validation ladder, but `execution-profiles.yaml` still makes
  docs-state validation heavier than the current goal wants.
- Latest paper/Provider evidence shows repeated approval and transient harness cost; the mechanism should turn that
  pattern into reusable preflight, validation, and redacted-runner guidance.

## Requirement Mapping

This task maps the goal into one mechanism hardening closure:

1. Add a durable SOP for batch execution packages that pre-declare boundaries for 3-5 serial tasks.
2. Add a minimal state/queue task packet template to reduce repeated manual YAML.
3. Update validation profiles so docs-only tasks use scoped formatting/diff/Module Run gates, while source tasks keep
   focused unit first and broader lint/typecheck last.
4. Add a governed redacted smoke runner under `scripts/agent-system/` so future route or Provider smokes can avoid
   bespoke one-off harnesses.
5. Connect the new SOP/template/runner into the operating manual and mechanism source-of-truth index.

This task does not change product source behavior and does not approve DB mutation, Provider calls, env/secret access,
schema/migration, dependency, browser/e2e runtime, staging/prod, payment, external-service, deployment, release
readiness, publish, student-visible content, PR, force push, or final Pass.

## Evidence-Only Sources

- Latest Provider paper composition smoke evidence and audit are read only to identify friction sources.
- Latest formal publish approval evidence and audit are read only to verify high-risk boundaries remain separate.
- Historical docs-only fast lane and local-first validation SOPs are read as mechanism predecessors.

## Conflict Check

No conflict was found with product requirements because this is mechanism-only work. The only mechanism mismatch is that
`execution-profiles.yaml` currently describes docs-state validation as including `lint` and `typecheck`; this task will
revise that profile to match the current goal's validation layering while preserving source-task broad gates.

## Allowed Files

- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/batch-execution-package-governance.md`
- `docs/04-agent-system/templates/module-run-v2-execution-package-template.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/agent-system/Invoke-ModuleRunV2RedactedSmokeRunner.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2RedactedSmokeRunner.Smoke.ps1`
- `docs/05-execution-logs/task-plans/2026-06-26-mechanism-batch-execution-package-and-smoke-runner.md`
- `docs/05-execution-logs/evidence/2026-06-26-mechanism-batch-execution-package-and-smoke-runner.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-mechanism-batch-execution-package-and-smoke-runner.md`

## Blocked Scope

- Product source and tests under `src/**`, `tests/**`, and `e2e/**`.
- `package.json`, lockfiles, schema, migration, `.env*`, private credential files, Playwright artifacts, `.next/**`.
- DB connection, DB mutation, Provider call, Provider credential read, schema/migration, dependency install, browser/e2e
  runtime, staging/prod/deploy, payment, external-service, publish, student-visible content, Cost Calibration Gate, PR,
  force push, or final Pass.

## Implementation Plan

1. Create `batch-execution-package-governance.md` with rules for package size, serial task boundaries, preflight,
   validation layering, reusable runner use, minimal state/queue fields, closeout, and forbidden claims.
2. Create a YAML template for execution packages and child task packets.
3. Add `Invoke-ModuleRunV2RedactedSmokeRunner.ps1` and its focused smoke script. The runner defaults to dry-run, requires
   `-Execute` for command execution, records summary-only JSON, and does not persist raw stdout/stderr.
4. Update operating manual, mechanism index, and execution profiles to reference the new SOP/template/runner and layered
   validation policy.
5. Update project state and task queue for this mechanism task.
6. Run focused smoke, scoped Prettier write/check, `git diff --check`, and Module Run v2 hardening gates.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2RedactedSmokeRunner.Smoke.ps1`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/operating-manual.md docs/04-agent-system/sop/batch-execution-package-governance.md docs/04-agent-system/templates/module-run-v2-execution-package-template.yaml docs/04-agent-system/state/execution-profiles.yaml docs/04-agent-system/state/mechanism-source-of-truth-index.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-mechanism-batch-execution-package-and-smoke-runner.md docs/05-execution-logs/evidence/2026-06-26-mechanism-batch-execution-package-and-smoke-runner.md docs/05-execution-logs/audits-reviews/2026-06-26-mechanism-batch-execution-package-and-smoke-runner.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/operating-manual.md docs/04-agent-system/sop/batch-execution-package-governance.md docs/04-agent-system/templates/module-run-v2-execution-package-template.yaml docs/04-agent-system/state/execution-profiles.yaml docs/04-agent-system/state/mechanism-source-of-truth-index.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-mechanism-batch-execution-package-and-smoke-runner.md docs/05-execution-logs/evidence/2026-06-26-mechanism-batch-execution-package-and-smoke-runner.md docs/05-execution-logs/audits-reviews/2026-06-26-mechanism-batch-execution-package-and-smoke-runner.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId mechanism-batch-execution-package-and-smoke-runner-2026-06-26`

## Closeout Boundary

Local commit is allowed by the active mechanism tuning goal. Fast-forward merge to `master`, push to `origin/master`, PR,
force push, and branch cleanup require fresh closeout approval because this task changes mechanism scripts and is not a
docs-only fast-lane task.

## Stop Conditions

- The runner would need to execute Provider, DB, browser/e2e, or secret-reading behavior during this task.
- Validation needs package install, dependency changes, schema/migration, staging/prod, deploy, payment, or
  external-service work.
- Evidence would need raw command output, secrets, provider payloads, raw prompts, raw generated content, DB URLs, or raw
  rows.
- Any changed file falls outside the allowed list.
