# Local Full Loop Knowledge RAG Maintenance Smoke Plan

## Task

- Task id: `local-full-loop-knowledge-rag-maintenance-smoke-2026-06-28`
- Branch: `codex/local-full-loop-rag-20260628`
- Task kind: `implementation`
- Sprint id: `local-full-loop-acceleration-2026-06-28`
- Approval: current user fresh approval on 2026-06-28 for local full-loop acceleration, including local Docker dev DB,
  localhost/127.0.0.1 validation, focused unit/e2e tests, redacted evidence, local commit, fast-forward merge to
  `master`, push to `origin/master`, and short branch cleanup.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-acceleration-planning-state-queue.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-baseline-accounts-auth-db.md`

## Skill Notes

- `rag-implementation` and `rag-engineer` were read before implementation.
- This task follows the local deterministic retrieval path already present in the repository.
- Retrieval evidence must evaluate retrieval separately from Provider generation and must avoid raw chunk, embedding, or
  prompt/output evidence.

## Requirement Decision Map

| Decision area              | Active rule for this task                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Local resource maintenance | Prove local Markdown resource upload, publish, vector rebuild, and `rag_ready` status through localhost API. |
| Knowledge node maintenance | Prove `knowledge_node` creation/list path through localhost API and local DB.                                |
| Retrieval                  | Reuse existing focused local RAG retrieval tests; do not create a new public retrieval API in this task.     |
| Evidence                   | Record only role labels, route labels, statuses, aggregate counts, and pass/fail.                            |
| Dependencies               | No package or lockfile changes; no LangChain or pgvector enablement.                                         |
| Provider                   | Provider/model calls remain blocked. No prompt, Provider payload, or raw generated output.                   |
| Storage                    | Local `.runtime/uploads` is already ignored. Evidence must not record object keys or local file paths.       |
| Cost Calibration           | Cost Calibration Gate remains blocked. No pricing, quota default, release readiness, or final Pass decision. |

## Implementation Plan

1. Add a scoped localhost Playwright API smoke for `content_admin` that:
   - logs in through `/api/v1/sessions`;
   - creates a `knowledge_node`;
   - lists `knowledge_node` rows by profession;
   - uploads a local Markdown `resource`;
   - publishes the resource;
   - triggers `rebuild-vector`;
   - lists resources and verifies the target is `rag_ready`;
   - attaches only a redacted status/count summary.
2. Run focused local RAG unit coverage that already proves chunking, resource lifecycle, retrieval filtering, and
   redacted citation summaries.
3. If the e2e smoke exposes an implementation gap, add a focused failing test before repairing source.
4. Write traceability, evidence, audit, acceptance, and state/queue closeout records.
5. Run scoped Prettier, focused unit/e2e, lint, typecheck, `git diff --check`, `Get-TikuProjectStatus`, and Module Run v2
   gates.
6. Commit locally, fast-forward merge to `master`, push `origin/master`, and clean up the short branch after gates pass.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts tests/unit/phase-11-local-rag-mock-embedding-pipeline.test.ts src/server/services/rag-retrieval-service.test.ts tests/unit/rag-knowledge/rag-layering-retrieval-governance.test.ts`
- `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER="1"; npm.cmd run test:e2e -- e2e/local-full-loop-knowledge-rag-maintenance-smoke.spec.ts --reporter=line`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown <changed files>`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-full-loop-knowledge-rag-maintenance-smoke-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-full-loop-knowledge-rag-maintenance-smoke-2026-06-28 -SkipRemoteAheadCheck`

## Stop Conditions

- Any step requires package/lockfile or `.env*` modification.
- Any step requires schema/migration, pgvector enablement, `drizzle-kit push`, or shared/prod DB mutation.
- Evidence would require raw resource content, full chunk text, embeddings, Provider payload, prompt, raw AI output, raw DB
  row, internal id, credential value, token, cookie, localStorage, screenshot, trace, raw DOM, or full question/paper
  content.
- A repair expands into Provider, Cost Calibration, payment, OCR/export, staging/prod/deploy, PR, or force push.
