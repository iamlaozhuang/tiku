# Local Auto Candidate Mode Transition Confirmation Plan

**Task id:** `local-auto-candidate-mode-transition-confirmation`

**Branch:** `codex/local-auto-candidate-mode-transition`

**Task kind:** `docs_only`

## User Approval

The user explicitly requested: create a short-lived branch and execute the "Phase 68 -> local_auto_candidate mode transition confirmation task".

This approval covers this docs-only mode transition confirmation task, including task plan, evidence, audit review, validation, one focused commit, merge into `master`, push, and short-lived branch cleanup.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/automation-readiness-scorecard-and-mode-transition-governance.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-68-mode-transition-proposal-final-readiness-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-68-mode-transition-proposal-final-readiness-audit.md`

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-local-auto-candidate-mode-transition-confirmation.md`
- `docs/05-execution-logs/evidence/2026-06-07-local-auto-candidate-mode-transition-confirmation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-local-auto-candidate-mode-transition-confirmation.md`

Blocked files and surfaces:

- `.env.local`, `.env.example`
- `package.json`, lockfiles, dependency or CLI configuration
- `scripts/**`
- `src/**`, `tests/**`, `e2e/**`
- `src/db/schema/**`, `drizzle/**`
- provider, env/secret, staging/prod/cloud/deploy, payment, external-service, schema, migration, dependency, direct implementation, and Cost Calibration Gate execution

## Implementation Approach

1. Record this task in `task-queue.yaml` as a completed docs-only mode transition confirmation between Phase 68 and Phase 69.
2. Update `project-state.yaml` `automation.mode` from `semi_auto` to `local_auto_candidate`.
3. Sync the lightweight mechanism indexes to reflect the new mode.
4. Preserve Phase 68 boundaries:
   - allowed automatic or semi-automatic task kinds: `docs_only`, `implementation_planning`, `local_verification` planning, `security_review` planning, `blocked_gate`;
   - Phase 69-78 may be serially advanced only within their own queued allowed files;
   - direct product implementation remains unapproved.
5. Write evidence and audit review with blocked gate and redaction statements.

## Risk Defenses

- Do not modify product code or runtime behavior.
- Do not approve implementation tasks, dependency work, schema or migration work, provider work, env/secret work, staging/prod/cloud/deploy work, payment work, external-service work, or Cost Calibration Gate execution.
- Keep required project terms: `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log`.
- Record that local readiness does not prove staging, prod, provider, payment, or external-service readiness.
- Use the post-closeout SHA rule: do not create a self-synchronizing follow-up commit solely to record this task's final SHA.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\04-agent-system\state\mechanism-source-of-truth-index.yaml docs\04-agent-system\state\advanced-edition-code-stage-seeding-plan.yaml docs\05-execution-logs\task-plans\2026-06-07-local-auto-candidate-mode-transition-confirmation.md docs\05-execution-logs\evidence\2026-06-07-local-auto-candidate-mode-transition-confirmation.md docs\05-execution-logs\audits-reviews\2026-06-07-local-auto-candidate-mode-transition-confirmation.md`
- `Select-String -Path docs\04-agent-system\state\project-state.yaml,docs\04-agent-system\state\mechanism-source-of-truth-index.yaml,docs\04-agent-system\state\advanced-edition-code-stage-seeding-plan.yaml,docs\05-execution-logs\evidence\2026-06-07-local-auto-candidate-mode-transition-confirmation.md,docs\05-execution-logs\audits-reviews\2026-06-07-local-auto-candidate-mode-transition-confirmation.md -Pattern 'local_auto_candidate','Cost Calibration Gate remains blocked','authorization','paper','mock_exam','redeem_code','audit_log','ai_call_log'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop and hand back to the user if:

- changing mode would require direct implementation or blocked gate execution;
- validation fails and cannot be repaired inside the allowed files;
- a blocked file or forbidden surface becomes necessary;
- evidence would need secrets, provider payloads, raw prompts, raw answers, cleartext `redeem_code`, employee subjective answer text, full `paper` content, or raw generated AI content;
- Git branch, merge, push, or cleanup state becomes ambiguous.
