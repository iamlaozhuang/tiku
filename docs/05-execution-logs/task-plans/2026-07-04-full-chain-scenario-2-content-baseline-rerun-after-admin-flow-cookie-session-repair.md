# 2026-07-04 Full-chain Scenario 2 Content Baseline Rerun After Admin-flow Cookie Session Repair Plan

## Task

- Task id: `full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair-2026-07-04`
- Kind: `local_acceptance_runtime_rerun`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Actor selector label: `fc_content_admin_created_by_super_admin`
- Approval boundary: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-pack-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-knowledge-baseline-db-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-knowledge-baseline-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-knowledge-baseline-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-admin-flow-cookie-session-auth-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-admin-flow-cookie-session-auth-repair.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-21-paper-question-count-and-type-policy.md`
- `src/server/auth/session-cookie.ts`
- `src/features/admin/content-admin-runtime.tsx`
- `src/features/admin/paper-management/AdminPaperManagementClient.tsx`
- `src/server/services/admin-flow-runtime.ts`
- `src/server/services/paper-composition-lifecycle-runtime.ts`
- `C:/Users/jzzhu/.codex/plugins/cache/openai-bundled/browser/26.623.101652/skills/control-in-app-browser/SKILL.md`

## Scope

This task reruns Scenario 2 only from the affected paper collection route node after the admin-flow session repair. The
existing Scenario 2 product-created content baseline must be reused and verified by aggregates; this task must not
create duplicate material, question, knowledge-node, or paper records.

Allowed runtime actions:

- start or reuse a localhost-only app server;
- override the child-process runtime DB target in memory only when `.env.local` does not point at the isolated DB;
- log in with the approved `content_admin` selector using private credentials in memory only;
- probe content surface route labels and content API route labels;
- run selector-scoped aggregate DB read verification.

Forbidden actions:

- source/test/package/lockfile changes;
- `.env*` edits or environment value output;
- DB write outside product login/session behavior;
- content creation or fixture expansion;
- schema, migration, seed, destructive DB operation;
- Provider, Prompt, raw AI I/O, staging/prod, deployment, Cost Calibration;
- screenshot, raw DOM, trace, raw DB rows, credentials, tokens, sessions, cookies, `localStorage`, Authorization headers,
  full private content, plaintext card values, release readiness, final Pass, or production usability claim.

## Execution Plan

1. Verify worktree branch and target DB label readiness with redacted output.
2. Start the local app on a localhost-only port using child-process environment target override if required.
3. Use the in-app browser to establish the `content_admin` product session from private credentials in memory only.
4. Verify route labels:
   - `content_materials_surface`
   - `content_questions_surface`
   - `content_papers_surface`
   - `materials_collection_api`
   - `questions_collection_api`
   - `knowledge_nodes_collection_api`
   - `papers_collection_api`
5. Verify aggregate counts remain consistent with the prior Scenario 2 baseline.
6. Stop the local app server, write redacted evidence/audit, validate, commit, fast-forward merge, push, delete branch,
   then continue to Scenario 3 if pass.

## Stop Rules

Stop and split repair/provisioning if runtime DB target mismatches, private input is missing, login fails, paper
collection API still returns `401001`, aggregate counts are missing or duplicate-prone, a product mutation would be
needed to continue, redaction risk appears, or any excluded Provider/staging/Cost/destructive DB/source/dependency
operation becomes necessary.

## Validation Commands

- `node - <redacted target DB aggregate verification>`
- `node - <redacted local app and browser route probe>`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair-2026-07-04`
