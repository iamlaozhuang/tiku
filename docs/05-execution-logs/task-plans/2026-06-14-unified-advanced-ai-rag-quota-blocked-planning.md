# Unified Advanced AI RAG Quota Blocked Planning Task Plan

## Task

- Task id: `unified-advanced-ai-rag-quota-blocked-planning`
- Branch: `codex/unified-advanced-ai-rag-quota-blocked-planning`
- Date: 2026-06-14
- Start checkpoint: `2b9823b787164d359313b7a52e5d9eda5be1de19`
- Task kind: `blocked_gate_planning`

## Required Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/advanced-edition/stories/epic-06-retention-log-governance.md`
- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-178-personal-learning-ai-staging-provider-deploy-readiness.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-178-personal-learning-ai-staging-provider-deploy-readiness.md`
- `docs/05-execution-logs/evidence/2026-06-14-batch-180-personal-learning-ai-staging-execution-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-batch-180-personal-learning-ai-staging-execution-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-implementation-queue-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-mvp-ai-rag-governed-code-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-mvp-ai-rag-governed-code-audit.md`

## Approved Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-unified-advanced-ai-rag-quota-blocked-planning.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-advanced-ai-rag-quota-blocked-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-advanced-ai-rag-quota-blocked-planning.md`

Read-only inputs:

- `docs/**`
- `scripts/**`

Blocked files:

- `.env.local`
- `.env.example`
- `.env.*`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Traceability Baseline

- `landingIds`: `LAND-AI-SCORING-AND-GENERATION`, `LAND-RAG-KNOWLEDGE`,
  `LAND-OPS-QUOTA-LEDGER`, `LAND-RETENTION-LOG-GOVERNANCE`
- `sourceIds`: `ADV-SPEC-01`, `ADV-SPEC-02`, `ADV-SPEC-03`, `ADV-MOD-02`, `ADV-MOD-03`,
  `ADV-MOD-06`, `ADV-MOD-07`, `ADV-STORY-01`, `ADV-STORY-04`, `ADV-STORY-06`,
  `GATE-B178-EV`, `GATE-B180-EV`
- `capabilityIds`: `CAP-ADV-AI-TASK-DOMAIN`, `CAP-ADV-PERSONAL-AI-QUESTION-GENERATION`,
  `CAP-ADV-PERSONAL-AI-PAPER-GENERATION`, `CAP-ADV-OPS-AUTH-QUOTA`,
  `CAP-ADV-RETENTION-LOG-GOVERNANCE`, `CAP-ADV-FORMAL-CONTENT-SEPARATION`
- `useCaseIds`: `UC-ADV-AI-TASK-LIFECYCLE`, `UC-ADV-PERSONAL-AI-QUESTION-GENERATION`,
  `UC-ADV-PERSONAL-AI-PAPER-GENERATION`, `UC-ADV-OPS-AUTH-QUOTA`,
  `UC-ADV-RETENTION-LOG-GOVERNANCE`, `UC-ADV-FORMAL-CONTENT-SEPARATION`
- `deltaIds`: `DELTA-AI-SCORING-VS-GENERATION`, `DELTA-RAG-KNOWLEDGE`,
  `DELTA-OPS-QUOTA`, `DELTA-RETENTION-LOG`, `DELTA-PROVIDER-STAGING-GATE`

## Planning Method

1. Keep this as blocked-gate planning only.
2. Translate each AI/RAG/quota landing row into a future approval boundary, not implementation work.
3. Split AI task lifecycle, personal AI generation, RAG/vector context, ops quota, retention/log governance, provider
   staging, and formal content separation so later work cannot infer provider, schema, dependency, quota, deploy, or
   raw data approval from requirements.
4. Preserve `CFX-AI-001`, `CFX-FORMAL-001`, and `CFX-PROVIDER-001` as unresolved conflict references.
5. Record redaction and evidence limits: no prompt, provider payload, raw provider response, raw generated output,
   secret, token, database URL, cleartext `redeem_code`, quota row data, private file URL, or raw source document.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-advanced-ai-rag-quota-blocked-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-advanced-ai-rag-quota-blocked-planning`

After local commit and passing gates, the user's fresh approval permits fast-forward merge to `master`,
closeout/pre-push validation on `master`, `push origin master`, deletion of the merged short branch, rereading state and
queue, then stopping without claiming `unified-future-non-goal-and-audit-only-guard`.

## Risk Controls

- No code audit, code fixes, source reads, or source writes.
- No schema/migration or database work.
- No env/secret/provider configuration reads or writes.
- No real provider/model request, vector/RAG execution, quota use, payment, deploy, PR, force-push, or e2e.
- No dependency or package/lockfile changes.
- No follow-up task claiming.
- Cost Calibration Gate remains blocked.
