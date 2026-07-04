# 2026-07-04 Full-chain Scenario 2 Content Baseline Rerun After Pack Provisioning

## Task

- Task id: `full-chain-scenario-2-content-baseline-rerun-after-pack-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-2-content-baseline-rerun-after-pack-provisioning-2026-07-04`
- Dependency: `full-chain-scenario-2-content-pack-provisioning-2026-07-04`
- Goal: rerun Scenario 2 from the content-baseline preflight node, then use `content_admin` through the local product
  runtime to create the Scenario 2 material, knowledge-node, question, and paper baseline from the private package.

## Approval And Boundary

- Approval source: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`.
- Covered: local app startup, browser/e2e, in-memory private credential use, private package read in memory,
  selector-scoped non-destructive product writes, selector-scoped aggregate DB verification, redacted evidence, validation,
  commit, fast-forward merge, push, branch cleanup, and continuation to Scenario 3 if pass.
- Not covered: Provider execution, Provider credential/config reads, staging/prod, Cost Calibration, destructive DB
  operation, schema/migration/seed, dependency or lockfile change, source/test repair unless a separate repair task is
  split, screenshots, raw DOM, trace, raw DB rows, credentials, sessions, cookies, tokens, localStorage, Authorization
  headers, full private material/question/paper content, raw Prompt, raw AI I/O, release readiness, final Pass, or
  production usability claim.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-baseline.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-pack-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-pack-provisioning.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-21-paper-question-count-and-type-policy.md`
- `src/app/(auth)/login/page.tsx`
- `src/server/auth/session-cookie.ts`
- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`
- `src/features/admin/paper-management/AdminPaperManagementClient.tsx`
- `src/features/admin/knowledge-node-management/AdminKnowledgeNodeManagement.tsx`
- `src/server/services/material-service.ts`
- `src/server/services/question-service.ts`
- `src/server/services/paper-draft-service.ts`
- `src/server/services/content-question-material-runtime.ts`
- `src/server/services/paper-composition-lifecycle-runtime.ts`
- `src/server/services/rag-resource-knowledge-runtime.ts`
- `src/server/repositories/paper-draft-repository.ts`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`

## Execution Plan

1. Confirm private `content_admin` input presence without outputting private values.
2. Confirm the full-chain private package exists and has expected metadata counts.
3. Start or reuse a local app server on a localhost-only temporary port, with DB target verified against
   `tiku_full_chain_acceptance_20260704_001`.
4. Use browser automation to log in as `content_admin` and create one material, three knowledge nodes, seven canonical
   question-type rows, one draft paper, seven paper-question bindings, and publish the paper if product validation
   passes.
5. Run selector-scoped aggregate DB verification with counts only.
6. Stop and split repair if login, DB target, runtime, product validation, permission, redaction, or source behavior
   fails.

## Stop Rules

Stop on missing private inputs, DB target mismatch, service startup failure that is not a generated-lock cleanup,
permission bypass, inability to create content through product runtime, paper publish validation failure, redaction risk,
need for source/test/schema/migration/seed/dependency repair, Provider/staging/prod/Cost, destructive DB operation, or
any release readiness/final Pass/production usability claim.

## Execution Result

- Result: `blocked_missing_product_runtime_knowledge_node_creation_and_empty_knowledge_baseline`.
- Target DB aggregate probe matched `tiku_full_chain_acceptance_20260704_001`.
- Knowledge baseline aggregate counts: knowledge base `0`, active knowledge node `0`.
- Source contract review found authenticated knowledge-node listing only in the content runtime; no governed product
  create route exists for the required Scenario 2 knowledge baseline.
- Browser login and product content mutations were stopped before credential entry.
- Next action: split `full-chain-scenario-2-knowledge-baseline-db-provisioning-2026-07-04`, then rerun Scenario 2 from
  this node after the provisioning task is committed, merged, pushed, and cleaned up.
