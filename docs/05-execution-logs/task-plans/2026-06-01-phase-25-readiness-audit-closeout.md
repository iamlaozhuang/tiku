# Phase 25 Readiness Audit Closeout Plan

## Scope

- Task id: `phase-25-readiness-audit-closeout`.
- Branch: `codex/phase-25-fresh-validation-runner-hardening`.
- Task kind: `closeout`.
- Security review path: `docs/05-execution-logs/audits-reviews/2026-06-01-phase-25-readiness-audit-closeout-security-review.md`.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/state/blocked-gates.yaml`
- All Phase 25 task plan and evidence files.

## Closeout Plan

1. Summarize Phase 25 pass/fail/blocked status and residual risks.
2. Run final validation gates:
   - `git diff --check`
   - `npm.cmd run test:unit`
   - `npm.cmd run test:e2e`
   - `npm.cmd run build`
   - `Test-AgentSystemReadiness.ps1`
   - `Test-GitCompletionReadiness.ps1 -BaseBranch master`
   - `Test-NamingConventions.ps1`
   - `Invoke-QualityGate.ps1`
3. Record security review verdict and evidence hygiene.
4. Update `project-state.yaml` and `task-queue.yaml` to closed state if gates pass.
5. Commit the batch, merge to `master`, push `master`, and clean up the merged short-lived branch using the prompt-approved path.
6. Reconfirm final `master` and `origin/master` alignment, no unmerged `codex/*` branch, and no unknown worktree.

## Risk Controls

- No `.env.example`, package/lockfile, dependency, schema/migration, raw SQL, destructive DB, staging/prod/cloud/deploy, real provider, or external service changes.
- Evidence records no DB URLs, credentials, tokens, provider payloads, raw prompts, raw student answers, raw model responses, or plaintext `redeem_code`.
- If any final gate fails, record the failure and stop before commit/merge/push unless the failure is fixed within the approved scope.
