# Advanced Edition Integration Matrix Task Plan

## Goal

Record the confirmed three-state boundary matrix for how advanced edition MVP modules connect to existing formal Tiku modules.

Confirmed model:

- `读取`: new modules may read existing formal data.
- `隔离`: new module outputs must not pollute formal business records.
- `采纳`: only reviewed/accepted AI drafts may enter formal draft flows.

## Scope

- Update `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`.
- Add an `Existing Module Integration Matrix` section.
- Update the phase-30 queue and project state.
- Record evidence and validation results.

## Confirmed Decision

- User confirmed the integration matrix should use the three-state boundary model: `读取` / `隔离` / `采纳`.
- User also confirmed the queue is intended as a serial semi-automation mechanism. This task continues that mechanism by completing one docs-only task before advancing to the next pending task.

## Allowed Files

- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-integration-matrix.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-integration-matrix.md`

## Blocked Scope

- Product code.
- Database schema, migrations, SQL, drizzle files.
- API implementation, route handlers, services, repositories, UI components, worker implementation.
- Tests/e2e implementation, scripts, packages, lockfiles, dependencies.
- Environment files, secrets, provider calls, staging, production, cloud, deployment, external services, online payment, real customer/customer-like data.

## Validation Commands

```powershell
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-integration-matrix.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-integration-matrix.md
Select-String -Path docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md -Pattern 'Existing Module Integration Matrix','读取','隔离','采纳','question','paper','practice','mock_exam','exam_report','mistake_book'
```
