# Unified Advanced Auth Org Training Blocked Planning Task Plan

## Task

- Task id: `unified-advanced-auth-org-training-blocked-planning`
- Branch: `codex/unified-advanced-auth-org-training-blocked-planning`
- Date: 2026-06-14
- Start checkpoint: `30c3466eec4af178b3e2756fff4a85c937d72fcb`
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
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-implementation-queue-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-mvp-admin-ops-logs-code-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-mvp-admin-ops-logs-code-audit.md`

## Approved Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-unified-advanced-auth-org-training-blocked-planning.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-advanced-auth-org-training-blocked-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-advanced-auth-org-training-blocked-planning.md`

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

- `landingIds`: `LAND-AUTH-ACCOUNT-SESSION`, `LAND-PERSONAL-AUTH-REDEEM-QUOTA`,
  `LAND-ORG-AUTH-PORTAL`, `LAND-ORG-TRAINING`, `LAND-ORG-ANALYTICS`
- `sourceIds`: `ADV-SPEC-01`, `ADV-SPEC-02`, `ADV-MOD-01`, `ADV-MOD-04`, `ADV-MOD-05`,
  `ADV-STORY-02`, `ADV-STORY-03`, `ADV-STORY-04`, `ADV-STORY-05`
- `capabilityIds`: `CAP-ADV-AUTH-CONTEXT`, `CAP-ADV-ORG-PORTAL-ADMIN`,
  `CAP-ADV-ORG-TRAINING-CONTENT`, `CAP-ADV-EMPLOYEE-TRAINING-ANSWER`, `CAP-ADV-ORG-ANALYTICS`
- `useCaseIds`: `UC-ADV-AUTH-CONTEXT-UPGRADE`, `UC-ADV-ORG-PORTAL-ADMIN`,
  `UC-ADV-ORG-TRAINING-CONTENT-LIFECYCLE`, `UC-ADV-EMPLOYEE-TRAINING-ANSWER`,
  `UC-ADV-ORG-ANALYTICS-SUMMARY`
- `deltaIds`: `DELTA-AUTH-ACCOUNT-SESSION`, `DELTA-ORG-AUTH-PORTAL`, `DELTA-ORG-TRAINING`,
  `DELTA-ORG-ANALYTICS`

## Planning Method

1. Keep this as blocked-gate planning only.
2. Translate each landing/capability/use-case/delta row into a future approval boundary, not implementation work.
3. Split organization portal, training content, employee answers, analytics, and auth context gates so later tasks cannot
   bundle schema, UI, privacy, export, raw answer viewing, provider/env, deploy, or Cost Calibration work by inference.
4. Preserve `CFX-ORG-001`, `CFX-FORMAL-001`, and `CFX-PROVIDER-001` as unresolved conflict references.
5. Record redaction and evidence limits: no cleartext `redeem_code`, employee subjective answer text, raw sensitive
   content, raw provider payload, secret, token, database URL, row data, or private content.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-advanced-auth-org-training-blocked-planning`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-advanced-auth-org-training-blocked-planning`

After local commit and passing gates, the user's fresh approval permits fast-forward merge to `master`,
closeout/pre-push validation on `master`, `push origin master`, deletion of the merged short branch, rereading state and
queue, then stopping without claiming `unified-advanced-ai-rag-quota-blocked-planning`.

## Risk Controls

- No code audit, code fixes, source reads, or source writes.
- No schema/migration or database work.
- No env/secret/provider configuration reads or writes.
- No real provider/model request, quota use, payment, deploy, PR, force-push, or e2e.
- No follow-up task claiming.
- Cost Calibration Gate remains blocked.
