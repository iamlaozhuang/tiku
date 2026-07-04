# 2026-07-04 Full-chain Scenario 2 Content Baseline

## Task

- Task id: `full-chain-scenario-2-content-baseline-2026-07-04`
- Branch: `codex/full-chain-scenario-2-content-baseline-2026-07-04`
- Goal: start Scenario 2 from the completed Scenario 1 role bootstrap and validate whether `content_admin` can proceed
  to content baseline creation without violating material completeness, redaction, Provider, or fixture-expansion rules.

## Approval And Boundary

- Approval source: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`.
- Covered: local-only Scenario 2 preflight, private material package metadata inspection, source/test/requirement reading,
  redacted block evidence, commit, fast-forward merge, push, branch cleanup, and split provisioning when prerequisites are
  missing.
- Not covered: browser execution after missing prerequisite detection, DB mutation, source/test change, schema/migration,
  seed, Provider, staging/prod, Cost Calibration, dependency change, release readiness, final Pass, production usability,
  full material/question/paper content evidence, screenshots, raw DOM, trace, credentials, tokens, cookies, sessions,
  `localStorage`, Authorization headers, raw DB rows, or private fixture contents.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-reuse-and-gap-inventory.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-1-admin-role-bootstrap-runtime-rerun-after-panel-repair.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-06-29-full-acceptance-content-admin-formal-content-workflow.md`
- `docs/01-requirements/traceability/2026-06-29-repair-content-admin-formal-content-workflow-actions.md`
- `src/app/(auth)/login/page.tsx`
- `src/app/(admin)/content/materials/page.tsx`
- `src/app/(admin)/content/questions/page.tsx`
- `src/app/(admin)/content/papers/page.tsx`
- `src/app/(admin)/content/knowledge-nodes/page.tsx`
- `src/features/admin/content-admin-runtime.tsx`
- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`
- `src/features/admin/paper-management/AdminPaperManagementClient.tsx`
- `src/features/admin/knowledge-node-management/AdminKnowledgeNodeManagement.tsx`
- `src/server/auth/session-cookie.ts`
- `src/server/services/content-question-material-runtime.ts`
- `src/server/services/paper-composition-lifecycle-runtime.ts`
- `src/db/schema/paper.ts`
- `src/db/schema/ai-rag.ts`
- `tests/unit/phase-22-content-admin-cookie-session-repair.test.ts`
- `tests/unit/admin-question-material-ui.test.ts`
- `tests/unit/admin-paper-ui.test.ts`
- `tests/unit/admin-content-knowledge-ops-baseline.test.ts`

## Execution Plan

1. Confirm Scenario 1 created `content_admin` and `ops_admin`.
2. Inspect local-private materials package metadata only.
3. Verify the required full-chain Scenario 2 private package exists before starting browser/runtime mutation.
4. Stop before browser/DB mutation if full-chain content/question inputs are missing or incomplete.
5. Record redacted block evidence and split a provisioning task.

## Observed Preflight Result

The full-chain private package root
`D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/` is missing.
The reusable source package has enough material and paper metadata to inform provisioning, but the materials prep package
explicitly records full question-type coverage and Scenario 2 full-chain content inputs as gaps to be filled outside the
repository before execution.

## Validation

- `powershell.exe -NoProfile -Command "<redacted local-private material metadata count and full-chain pack existence check>"`
- `npm.cmd exec -- prettier --write --ignore-unknown <changed governance files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <changed governance files>`
- `git diff --check`
- `git diff --name-only -- <blocked repo paths>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-2-content-baseline-2026-07-04`

## Stop Rules

Stop and split provisioning if the full-chain content source selection, knowledge-node candidates, all-question-type
inputs, or paper baseline inputs are missing. Stop if continuing would copy private content into the repository, invent
scenario data, widen fixtures for convenience, start Provider execution, weaken formal content separation, or record
forbidden evidence.
