# Advanced Edition MVP Requirements Queue Task Plan

## Goal

Build a lightweight serial mechanism for advancing the advanced edition MVP requirements work, starting from the confirmed main loop:

`高级版个人用户 AI 出题/组卷 + 企业管理员创建企业训练 + 员工作答统计 + 运营后台授权/额度管理`

This task seeds only the requirements-design queue. It does not approve implementation, API, schema, dependency, provider, staging, production, deployment, or environment work.

## Scope

- Create a short-lived branch for the requirements queue work.
- Read and respect project governance, terminology, ADRs, project state, task queue, and the existing advanced edition design record.
- Add a phase-30 serial requirements queue to `docs/04-agent-system/state/task-queue.yaml`.
- Update `docs/04-agent-system/state/project-state.yaml` so the next active work is the phase-30 requirements track.
- Record evidence for the queue mechanism and validation.

## Serial Mechanism

Phase 30 uses one active task at a time:

1. `phase-30-advanced-edition-mvp-requirements-plan`
2. `phase-30-advanced-edition-mvp-scope-and-source`
3. `phase-30-advanced-edition-integration-matrix`
4. `phase-30-advanced-edition-role-boundary-matrix`
5. `phase-30-advanced-edition-acceptance-scenarios`
6. `phase-30-advanced-edition-mvp-requirements-review`

Each task should:

- keep the work docs-only unless a later approved plan says otherwise;
- write only confirmed decisions as settled requirements;
- place unresolved questions in the new requirements document's follow-up queue;
- maintain evidence before completion;
- avoid moving to the next task while the current task has uncommitted changes.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-follow-up-decisions.md`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-mvp-requirements-queue.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-mvp-requirements-queue.md`

## Blocked Scope

- Product source code.
- Database schema, drizzle files, migrations, SQL, or migration tooling.
- API implementation or route handlers.
- Tests, e2e implementation, scripts, package files, lock files, dependency changes.
- Environment files, secrets, AI provider calls, staging, production, cloud, deployment, external services.
- Any online payment, provider, or real customer/customer-like data operation.

## Validation Commands

```powershell
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-mvp-requirements-queue.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-mvp-requirements-queue.md
Select-String -Path docs\04-agent-system\state\task-queue.yaml -Pattern 'phase-30-advanced-edition-mvp-requirements-plan','phase-30-advanced-edition-mvp-requirements-review'
Select-String -Path docs\04-agent-system\state\project-state.yaml -Pattern 'phase-30-advanced-edition-mvp-requirements'
```

## Risk Controls

- Do not write implementation-ready API or schema decisions in this queue seed.
- Do not introduce new dependencies, scripts, runtime behavior, or environment variables.
- Keep future high-risk work blocked behind separate human approval.
- Do not write prompt, raw answer, model output, provider payload, secret, token, database URL, or plaintext `redeem_code` into evidence.
