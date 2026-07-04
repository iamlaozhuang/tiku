# 2026-07-04 Full-chain Scenario 2 Content Pack Provisioning

## Task

- Task id: `full-chain-scenario-2-content-pack-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-2-content-pack-provisioning-2026-07-04`
- Source block: `full-chain-scenario-2-content-baseline-2026-07-04`
- Goal: create the missing local-private Scenario 2 content/question/paper input package outside the repository so the
  next Scenario 2 runtime acceptance rerun can start from a complete, redacted input boundary.

## Approval And Boundary

- Approval source: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`.
- Covered: local-private package root creation, metadata-driven material selection, knowledge-node candidate selection,
  canonical question-type input rows, paper composition plan, redaction checklist, redacted evidence, validation, commit,
  fast-forward merge, push, branch cleanup, and Scenario 2 rerun continuation.
- Not covered: browser/e2e execution, app startup, DB connection, DB mutation, schema/migration/seed, source/test change,
  dependency change, Provider, staging/prod, Cost Calibration, release readiness, final Pass, production usability, or
  repo storage of full private material/question/paper content.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-baseline.md`
- `docs/01-requirements/traceability/2026-06-21-paper-question-count-and-type-policy.md`
- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`
- `src/features/admin/paper-management/AdminPaperManagementClient.tsx`
- `src/features/admin/knowledge-node-management/AdminKnowledgeNodeManagement.tsx`
- `src/db/owner-preview-resource-import.ts`
- `tests/unit/owner-preview-resource-import.test.ts`

## Execution Plan

1. Confirm the Scenario 2 block is missing local-private full-chain input, not a runtime/source defect.
2. Create the local-private root
   `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/`.
3. Reuse existing local-private material metadata to select Markdown-backed content inputs without copying any private
   content into the repository.
4. Create a canonical seven-question-type input CSV using only current `question_type` values.
5. Create knowledge-node and paper-plan private files needed by the later product browser flow.
6. Validate the private pack by metadata counts only.
7. Record redacted repo evidence and audit.

## Stop Rules

Stop if private source package metadata is unreadable, if the generated pack would need Provider execution, if any
private content would enter repo docs/evidence/chat output, if question inputs require legacy aliases, if browser or DB
execution becomes necessary, or if a product decision is needed for real content correctness beyond local acceptance
coverage.
