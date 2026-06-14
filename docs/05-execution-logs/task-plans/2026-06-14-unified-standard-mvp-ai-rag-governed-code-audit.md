# Unified Standard MVP AI/RAG Governed Code Audit Plan

## Task

- Task id: `unified-standard-mvp-ai-rag-governed-code-audit`
- Branch: `codex/unified-standard-mvp-ai-rag-governed-code-audit`
- Date: 2026-06-14
- Task kind: read-only code audit candidate

## Fresh Approval

The user approved this task and its closeout in the same turn:

> Continue `D:\tiku`; create and execute `unified-standard-mvp-ai-rag-governed-code-audit`; strictly follow
> `task-queue.yaml` `allowedFiles`, `readOnlyAllowedFiles`, and `blockedFiles`; only read-only code audit and
> governance records are allowed; no code fixes, implementation, schema/migration, provider/env, e2e, dependency
> changes, real provider/model request, quota use, PR, force-push, or deployment; do not read, create, modify, or print
> `.env.local`, `.env.*`, real secret files, or provider configuration files; finish with a local independent commit.
>
> After the task commit and all gates pass, fast-forward merge
> `codex/unified-standard-mvp-ai-rag-governed-code-audit` to `master`, run required closeout/pre-push validation on
> `master`, push `origin master`, delete the merged short branch, reread state and queue, then stop.

This approval does not include `unified-standard-mvp-admin-ops-logs-code-audit`, code fixes, implementation,
schema/migration, provider/env, e2e, dependency changes, real provider/model requests, quota use, deploy, payment,
external-service work, PR, force-push, or follow-up task execution.

## Start Checkpoint

| Checkpoint               | Result                                                                |
| ------------------------ | --------------------------------------------------------------------- |
| Current branch           | `codex/unified-standard-mvp-ai-rag-governed-code-audit`               |
| HEAD                     | `2948a35d7ff69390d94a60b7ebf7790f8d3c4ecc`                            |
| `master`                 | `2948a35d7ff69390d94a60b7ebf7790f8d3c4ecc`                            |
| `origin/master`          | `2948a35d7ff69390d94a60b7ebf7790f8d3c4ecc`                            |
| Worktree                 | clean before this task plan                                           |
| Local `codex/*` residue  | only `codex/unified-standard-mvp-ai-rag-governed-code-audit` observed |
| Remote `codex/*` residue | none observed before task                                             |

## Required Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`

## Traceability Baseline

- `landingIds`: `LAND-AI-SCORING-AND-GENERATION`, `LAND-RAG-KNOWLEDGE`
- `sourceIds`: `STD-REQ-04`, `STD-STORY-04`, `STD-REQ-05`, `STD-STORY-05`, `STD-REQ-06`, `STD-STORY-06`
- `capabilityIds`: `CAP-STD-AI-SCORING-EXPLANATION`, `CAP-STD-KN-RECOMMENDATION`,
  `CAP-STD-RAG-KNOWLEDGE-BASE`
- `useCaseIds`: `UC-STD-AI-SCORING-EXPLANATION`, `UC-STD-KN-RECOMMENDATION`,
  `UC-STD-RAG-KNOWLEDGE-BASE`
- `deltaIds`: `DELTA-AI-SCORING-VS-GENERATION`, `DELTA-RAG-KNOWLEDGE`, `DELTA-PROVIDER-STAGING-GATE`
- `conflictRefs`: `CFX-AI-001`, `CFX-PROVIDER-001`, `CFX-FORMAL-001`

## Allowed Writes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-unified-standard-mvp-ai-rag-governed-code-audit.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-mvp-ai-rag-governed-code-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-mvp-ai-rag-governed-code-audit.md`

## Read-Only Scope

- `docs/**`
- `scripts/**`
- `src/server/services/ai-scoring/**`
- `src/server/services/rag-knowledge/**`
- `src/server/repositories/rag-knowledge/**`
- `src/server/contracts/rag-knowledge/**`
- `src/server/mappers/rag-knowledge/**`
- `src/server/validators/rag-knowledge/**`
- `src/ai/**`
- `src/app/(student)/**`
- `src/app/(admin)/**`

## Blocked Files And Gates

- Blocked files: `.env.local`, `.env.example`, `.env.*`, real secret files, provider configuration files,
  `package.json`, lockfiles, `src/**` writes, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, and `scripts/**`
  writes.
- Blocked gates: real provider call, model request, env/secret, dependency/package/lockfile, vector provider/RAG
  execution, quota/cost measurement, schema/migration, implementation, staging/prod/cloud/deploy, payment,
  external-service, PR, force-push, and Cost Calibration Gate.

## Audit Method

1. Inventory the queued read-only AI/RAG surfaces and record present or missing paths.
2. Search only the approved read-only paths for glossary terms, AI/RAG route surfaces, provider-adjacent strings, and
   delegation boundaries.
3. Inspect matching files only when they are inside `readOnlyAllowedFiles`; do not follow imports into out-of-scope
   feature modules except by recording the delegation boundary.
4. Compare scoped implementation surfaces against standard MVP AI scoring, AI explanation, AI hint,
   `kn_recommendation`, RAG, `knowledge_base`, `embedding`, `chunk`, `citation`, and `ai_call_log` expectations.
5. Record findings as audit evidence only, with traceability ids and blocked remediation boundaries.
6. Update `project-state.yaml` and `task-queue.yaml` to mark this task closed after evidence and audit review are
   written.
7. Run queued validation commands, create one local commit, then perform the user-approved fast-forward closeout.
8. Stop after rereading state and queue; do not claim `unified-standard-mvp-admin-ops-logs-code-audit` or any other
   follow-up task.

## Evidence Hygiene

Evidence must not include raw secrets, provider payloads, raw responses, database URLs, row data, prompt payloads,
cleartext `redeem_code`, raw question bank content, raw paper content, raw material content, source document content,
student answer text, employee answer text, private file URLs, or provider configuration values.
