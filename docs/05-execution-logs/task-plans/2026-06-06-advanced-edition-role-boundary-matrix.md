# Advanced Edition Role Boundary Matrix Task Plan

## Goal

Record the confirmed role and data boundary matrix for the advanced edition MVP requirements.

Confirmed model:

- `不可见`
- `摘要可见`
- `可操作`
- `可采纳/治理`
- `仅审计追溯`

## Scope

- Update `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`.
- Add `Role And Data Boundary Matrix`.
- Update project state and task queue.
- Record evidence and validation results.

## Confirmed Decision

- User approved the layered role/data boundary model proposed for the role matrix.
- The matrix must distinguish personal user, employee, organization admin, platform content teacher, and platform operations admin.

## Allowed Files

- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-role-boundary-matrix.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-role-boundary-matrix.md`

## Blocked Scope

- Product code.
- Database schema, migrations, SQL, drizzle files.
- API implementation, route handlers, services, repositories, UI components, worker implementation.
- Tests/e2e implementation, scripts, packages, lockfiles, dependencies.
- Environment files, secrets, provider calls, staging, production, cloud, deployment, external services, online payment, real customer/customer-like data.

## Validation Commands

```powershell
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-role-boundary-matrix.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-role-boundary-matrix.md
Select-String -Path docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md -Pattern 'Role And Data Boundary Matrix','不可见','摘要可见','可操作','可采纳/治理','仅审计追溯','personal_auth','org_auth','organization','employee','ops_admin'
```
