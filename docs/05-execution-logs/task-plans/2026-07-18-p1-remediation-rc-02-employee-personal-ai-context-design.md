# F-0143 employee personal AI context design transition plan

## Objective

Close the already merged F-0117 task in repository state and materialize F-0143 as the only active P1 task. Freeze approved design option A without changing product source or tests before written-spec approval.

## Standards read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/` ADR-001 through ADR-007
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- relevant advanced-edition authorization, personal AI generation, organization employee, traceability, and current AI-generation baseline documents
- current P1 state, queue, finding ledger, F-0117 evidence, and F-0117 audit
- current UI requirement, design-baseline, and role-matrix chain for personal and employee AI generation

## Root cause and approved direction

The request route derives organization ownership from employee identity before honoring the selected authorization. Valid personal advanced authorization is therefore rejected or hidden after a user joins an organization. The approved correction makes the exact server-revalidated `authorizationPublicId` authoritative for source, owner, organization, and quota ownership. Client-supplied ownership metadata remains untrusted.

## Design-transition allowlist

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-18-p1-f0143-employee-personal-ai-context-authorization.md`
- `docs/05-execution-logs/task-plans/2026-07-18-p1-remediation-rc-02-employee-personal-ai-context-design.md`
- `docs/05-execution-logs/evidence/2026-07-18-p1-remediation-rc-02-employee-personal-ai-context.md`
- `docs/05-execution-logs/audits-reviews/2026-07-18-p1-remediation-rc-02-employee-personal-ai-context.md`
- `docs/superpowers/specs/2026-07-18-employee-personal-ai-selected-context-design.md`

Product source, tests, scripts, dependencies, schema, migration, database, Provider, runtime, P2, PR, force-push, and deployment surfaces must remain unchanged during this transition.

## Execution

1. Confirm F-0117 is merged, pushed, and cleaned; mark it closed in state and queue.
2. Materialize F-0143 with exact allowed and blocked files, stop conditions, validation commands, and standing closeout policy.
3. Record option A as a written design and preserve the separate written-spec approval gate.
4. Perform a first-principles review and an independent adversarial review of this transition.
5. Run scoped formatting, diff, P1, P0, and Module guards.
6. If all guards pass, create one design-transition commit, ff-only merge it to `master`, push `origin/master`, and clean the transition worktree and short branch.
7. Wait for written-spec approval before writing the implementation plan or changing product code/tests.

## Stop conditions

Stop if implementation requires F-0142 policy, schema/migration, dependency, database execution, Provider execution, runtime/browser acceptance, P2, PR, force push, deployment, an unlisted file, a second in-progress task, or weakened P1/P0/Module/closeout guards.

## Validation

```powershell
git diff --check
corepack pnpm@11.9.0 exec prettier --check <seven design-transition files>
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase pre_commit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-employee-personal-ai-context-2026-07-18
```
