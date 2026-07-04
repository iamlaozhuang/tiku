# 2026-07-04 Full-chain Scenario 2 Knowledge Baseline DB Provisioning Plan

## Task

- Task id: `full-chain-scenario-2-knowledge-baseline-db-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-2-knowledge-baseline-db-provisioning-2026-07-04`
- Source block: `full-chain-scenario-2-content-baseline-rerun-after-pack-provisioning-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Private package label: `full-chain-acceptance-2026-07-04`
- Approval source: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-pack-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-pack-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-pack-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-pack-provisioning.md`
- `src/db/schema/ai-rag.ts`
- `src/server/repositories/content-knowledge-node-runtime-repository.ts`
- Private package metadata under `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/`

## Boundary

- Allowed DB action: selector-scoped, non-destructive insert/upsert for the minimum Scenario 2 `knowledge_base` and
  `knowledge_node` prerequisite rows only.
- Target enforcement: abort unless `current_database()` equals `tiku_full_chain_acceptance_20260704_001`.
- Input enforcement: abort unless the private package exists and has exactly 3 knowledge-node candidates.
- Evidence enforcement: record only labels, aggregate counts, command labels, pass/fail/block, and redacted summaries.
- Blocked: destructive DB work, unscoped mutation, schema/migration/seed file changes, source/test changes,
  package/lockfile changes, browser/e2e, Provider/staging/prod/Cost, credentials or connection strings in evidence,
  raw DB rows, internal ids, screenshots, raw DOM, traces, raw Prompt, raw AI I/O, or private fixture contents.

## Execution Plan

1. Parse `.env.local` in memory, construct the target DB URL in memory, and never print it.
2. Parse private package metadata in memory and validate candidate counts and shape without printing private values.
3. Run one transaction against the target DB:
   - ensure one enabled `knowledge_base` per candidate profession;
   - insert/upsert the 3 candidate `knowledge_node` rows using selector-scoped deterministic public ids;
   - preserve parent-child ordering from private selector labels;
   - leave unrelated rows untouched.
4. Run aggregate verification:
   - target DB label matched;
   - Scenario 2 provisioned knowledge base profession count;
   - Scenario 2 active knowledge node count;
   - raw rows/internal ids/private values not output.
5. Write evidence/audit/state/queue, validate, commit, fast-forward merge to `master`, push `origin/master`, delete the
   short branch, and rerun Scenario 2 from the blocked node.
