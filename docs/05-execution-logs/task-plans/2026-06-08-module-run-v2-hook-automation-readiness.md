# Module Run v2 Hook Automation Readiness

## Task

- task id: `module-run-v2-hook-automation-readiness`
- task kind: `docs_only`
- branch: `codex/module-run-v2-hook-automation-readiness`
- date: `2026-06-08`
- approval: User approved merging the Module Run v2 mechanism baseline first, then separately advancing hook and
  automation readiness.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/03-standards/local-ci.md`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `package.json`
- `.husky/pre-commit`
- `scripts/agent-system/Test-GitCompletionReadiness.ps1`
- `scripts/agent-system/Test-TaskClaimReadiness.ps1`
- `scripts/agent-system/Invoke-QualityGate.ps1`
- `scripts/agent-system/Test-AgentSystemReadiness.ps1`
- `scripts/agent-system/Test-NamingConventions.ps1`

## Scope

Assess the existing hook and automation execution layer after Module Run v2 is merged to `master`.

Allowed changes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- matching readiness evidence
- matching audit review

Blocked changes:

- `.husky/**`
- `scripts/**`
- `package.json`
- lockfiles
- product code under `src/**`
- tests under `tests/**` or `e2e/**`
- schema, migration, `src/db/schema/**`, or `drizzle/**`
- `.env.local`, `.env.example`, provider, env/secret, staging/prod/cloud/deploy, payment, or external-service work
- Cost Calibration Gate execution

## Readiness Questions

The evidence must answer:

- Which existing hook or script capabilities can be reused without new dependencies?
- Which Module Run v2 hook concepts can be advisory first?
- Which concepts should become hard block later?
- Which implementation tasks should be split out after this docs-only readiness task?
- What must remain blocked until separate approval?

## Expected Readiness Matrix

- `pre-work`: advisory first, based on state/queue/current task/branch/blocked gate checks.
- `pre-edit`: advisory first, later hard block for blocked file scans.
- `pre-commit`: preserve current Husky behavior and later add sensitive evidence, blocked file, and terminology scans.
- `pre-push`: later hard block around GitCompletionReadiness, master/origin alignment, and evidence existence.
- `post-commit`: advisory commit and evidence inventory.
- `module-closeout`: hard block later, after Module Run v2 evidence/audit/rollover shape is stable.

## Validation Commands

- `git diff --check`
- scoped `prettier --write`
- scoped `prettier --check`
- required anchor check for `Module Run v2`, `hookIntegrationMatrix`, `automationHandoffPolicy`, `threadRolloverGate`,
  and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1
-BaseBranch master`

Docs-only task: product lint/typecheck/tests are not required unless staged files or pre-commit hooks run them during
commit.

## Stop Conditions

Stop immediately if:

- implementation would require changing `.husky/**`, `scripts/**`, `package.json`, or lockfiles;
- the readiness matrix would imply automatic execution of provider, env/secret, staging/prod/cloud/deploy, payment,
  external-service, dependency, schema, migration, or Cost Calibration Gate work;
- evidence would need to record secrets, provider payloads, raw prompts, raw responses, database URLs, Authorization
  headers, or any protected content.
