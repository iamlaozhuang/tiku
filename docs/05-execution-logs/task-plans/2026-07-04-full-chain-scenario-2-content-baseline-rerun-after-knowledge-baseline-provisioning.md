# 2026-07-04 Full-chain Scenario 2 Content Baseline Rerun After Knowledge Baseline Provisioning

## Task

- Task id: `full-chain-scenario-2-content-baseline-rerun-after-knowledge-baseline-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-2-content-baseline-rerun-after-knowledge-baseline-provisioning-2026-07-04`
- Dependencies:
  - `full-chain-scenario-2-content-pack-provisioning-2026-07-04`
  - `full-chain-scenario-2-knowledge-baseline-db-provisioning-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Actor selector label: `fc_content_admin_created_by_super_admin`
- Approval source: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`

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
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-pack-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-pack-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-pack-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-pack-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-knowledge-baseline-db-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-knowledge-baseline-db-provisioning.md`
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
- `src/server/validators/material.ts`
- `src/server/validators/question.ts`
- `src/server/validators/paper-draft.ts`
- `src/server/repositories/content-knowledge-node-runtime-repository.ts`
- `src/server/repositories/paper-draft-repository.ts`
- `src/db/schema/paper.ts`
- `src/db/schema/ai-rag.ts`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`

## Boundary

- Covered: local app startup, browser login as `content_admin`, in-memory private credential use, private package read
  in memory, product runtime writes for material/question/paper/paper-question binding/publish, route status probes,
  selector-scoped aggregate DB verification, redacted evidence, validation, commit, fast-forward merge, push, branch
  cleanup, and Scenario 3 continuation if pass.
- Not covered: Provider execution, Provider credential/config reads, staging/prod, Cost Calibration, destructive DB
  operation, schema/migration/seed, dependency/lockfile change, source/test repair unless split, screenshots, raw DOM,
  trace, raw DB rows, credentials, sessions, cookies, tokens, localStorage, Authorization headers, full private content,
  raw Prompt, raw AI I/O, release readiness, final Pass, or production usability claim.

## Execution Plan

1. Confirm `npx`/Playwright runtime availability without installing dependencies.
2. Start or reuse a localhost-only app server with runtime DB target verified as `tiku_full_chain_acceptance_20260704_001`.
3. Parse `content_admin` private input and Scenario 2 private package in memory only.
4. Use browser automation to log in, then execute authenticated product API calls from the browser context:
   - list active knowledge nodes;
   - create one material;
   - create seven canonical question types bound to the material and available knowledge nodes;
   - create one paper;
   - bind all seven questions to the paper;
   - publish the paper.
5. Probe content route labels without screenshots/raw DOM/trace.
6. Run read-only aggregate DB verification and record counts only.
7. Stop the local dev server, write evidence/audit/state/queue, validate, commit, fast-forward merge, push, clean branch,
   and continue to Scenario 3.

## Stop Rules

Stop on missing private input, DB target mismatch, login failure, service startup failure not limited to generated-lock
cleanup, permission bypass, product validation failure, paper publish failure, redaction risk, missing knowledge
baseline, need for source/test/schema/migration/seed/dependency repair, Provider/staging/prod/Cost, destructive DB
operation, or any release readiness/final Pass/production usability claim.
