# Evidence Format Finalization Governance Task Plan

## Task

- id: `evidence-format-finalization-governance`
- branch: `codex/evidence-format-finalization-governance`
- task kind: `docs_state_governance`
- requested by: user request on 2026-06-08 to resolve the recurring formatting blocker that has slowed later batch closeout.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- recent Batch 94 and Batch 95 task plans, evidence, and audit reviews

## Verified Problem

The repeated closeout blocker was not a broken formatter. The recurring failure pattern came from writing final evidence or audit validation results and then running scoped `prettier --check` before first running scoped `prettier --write` on the edited docs/state files.

That made the check command act as the first formatting discovery step, causing avoidable retry churn after evidence rows changed from draft or pending wording to final pass wording.

## Scope

Allowed files:

- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-08-evidence-format-finalization-governance.md`
- `docs/05-execution-logs/evidence/2026-06-08-evidence-format-finalization-governance.md`
- `docs/05-execution-logs/audits-reviews/2026-06-08-evidence-format-finalization-governance.md`

Blocked files and actions:

- no product code
- no scripts
- no dependencies, package files, or lockfiles
- no schema, migration, `src/db/schema/**`, or `drizzle/**`
- no `.env.local`, `.env.example`, env/secret, provider, staging/prod/cloud/deploy, payment, or external-service work
- no repository, API route, or Server Action work
- no real `authorization` permission model change
- no Cost Calibration Gate execution

## Documentation Approach

1. Add an Evidence Formatting Finalization Rule to the task lifecycle SOP.
2. Add the same closeout sequence to the module lifecycle SOP.
3. Clarify local-first docs-only validation so changed docs/state files are formatted with scoped `prettier --write` before scoped `prettier --check`.
4. Record this governance task in `project-state.yaml` and `task-queue.yaml`.
5. Write evidence and audit review after validation.

## Risk Defenses

- Keep the change procedural only; do not add automation scripts.
- Use scoped Prettier paths instead of broad repository formatting.
- Keep `prettier --check` as a validation gate, not a first formatting command.
- Do not rewrite semantic evidence conclusions when formatting changes layout only.
- Preserve project terminology: `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, and `ai_call_log`.

## Validation Commands

```powershell
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --write docs\04-agent-system\sop\task-lifecycle-governance.md docs\04-agent-system\sop\module-lifecycle-governance.md docs\04-agent-system\sop\local-first-validation-governance.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-08-evidence-format-finalization-governance.md docs\05-execution-logs\evidence\2026-06-08-evidence-format-finalization-governance.md docs\05-execution-logs\audits-reviews\2026-06-08-evidence-format-finalization-governance.md
node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\sop\task-lifecycle-governance.md docs\04-agent-system\sop\module-lifecycle-governance.md docs\04-agent-system\sop\local-first-validation-governance.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-08-evidence-format-finalization-governance.md docs\05-execution-logs\evidence\2026-06-08-evidence-format-finalization-governance.md docs\05-execution-logs\audits-reviews\2026-06-08-evidence-format-finalization-governance.md
Select-String -Path docs\04-agent-system\sop\task-lifecycle-governance.md,docs\04-agent-system\sop\module-lifecycle-governance.md,docs\04-agent-system\sop\local-first-validation-governance.md,docs\04-agent-system\state\project-state.yaml,docs\04-agent-system\state\task-queue.yaml,docs\05-execution-logs\task-plans\2026-06-08-evidence-format-finalization-governance.md,docs\05-execution-logs\evidence\2026-06-08-evidence-format-finalization-governance.md,docs\05-execution-logs\audits-reviews\2026-06-08-evidence-format-finalization-governance.md -Pattern 'Evidence Formatting Finalization Rule','prettier --write','prettier --check','Batch 95','authorization','personal_auth','org_auth','redeem_code','paper','mock_exam','audit_log','ai_call_log','Cost Calibration Gate remains blocked'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

## Stop Conditions

Stop if the fix requires scripts, dependencies, Prettier config changes, product code, blocked surfaces, sensitive evidence, or ambiguous Git state.
