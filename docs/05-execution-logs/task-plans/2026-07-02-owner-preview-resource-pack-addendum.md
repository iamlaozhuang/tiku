# Owner Preview Resource Pack Addendum

## Task

- Task id: `owner-preview-resource-pack-addendum-2026-07-02`
- Branch: `codex/owner-preview-resource-pack-addendum`
- Goal: augment the local owner preview fixture pack with the newly provided textbook and assessment-point materials so later AI 出题 / AI 组卷 validation can cover marketing, monopoly, and logistics more completely.

## Scope

- Source input: ignored local `D:\tiku\rawfiles\教材与鉴定点细则`.
- Target fixture pack: local private `D:\tiku-local-private\owner-facing-fixtures\2026-06-28-rawfiles-curated`.
- Allowed work:
  - metadata and extractability inspection;
  - local private file copy or safe conversion for runtime RAG compatibility;
  - inventory, manifest, coverage, and redacted evidence updates;
  - resource package and runtime RAG dry-runs.
- Blocked work:
  - `.env*` read/write;
  - DB execute/import/mutation;
  - Provider call;
  - browser/e2e/dev-server runtime;
  - package/lockfile/dependency change;
  - schema/migration/seed change;
  - staging/prod/cloud/deploy;
  - release readiness, final Pass, Cost Calibration.

## Standards Read

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

## Implementation Plan

1. Confirm the new source directory and existing fixture pack are present, using metadata only.
2. Inspect import contracts for `source-inventory.json` and runtime RAG supported formats.
3. Add direct `.docx` textbook / assessment-point sources to private `materials`.
4. Treat assessment-point detail files as knowledge-node source material while avoiding full content in repo evidence.
5. For unsupported `.pdf` or `.doc` sources, record extractability and either add them as non-runtime reference material or skip with a clear reason; do not force a lossy conversion into runtime RAG if tooling is missing or extraction quality is uncertain.
6. Update private `source-inventory.json`, `source-coverage.csv`, `copied-source-files.json`, `resource-pack-manifest.json`, and a compact `knowledge-node-candidates.csv` with metadata only.
7. Run dry-run checks for the resource package and runtime RAG import.
8. Write redacted evidence and an adversarial audit review.

## Risk Controls

- Do not commit raw material files; `rawfiles` and the private fixture pack remain local-only.
- Do not write full textbook, paper, question, chunk, prompt, Provider payload, or raw AI output into repo docs.
- Runtime RAG import currently supports `.docx`, `.md`, `.markdown`, `.txt`; PDF and legacy `.doc` must not be counted as runtime-ready unless converted safely.
- Include both `level` and `levels` metadata for 3/4/5 materials so resource and runtime RAG validators interpret coverage consistently.
- Keep logistics enabled for validation only after dry-run shows logistics runtime source coverage.

## Validation

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Import-OwnerPreviewResourcePackage.ps1 -PackageRoot D:\tiku-local-private\owner-facing-fixtures
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Import-OwnerPreviewRuntimeRagResources.ps1 -PackageRoot D:\tiku-local-private\owner-facing-fixtures
npm.cmd run test:unit -- tests/unit/owner-preview-resource-import.test.ts tests/unit/owner-preview-runtime-rag-resource-import.test.ts
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-owner-preview-resource-pack-addendum.md docs/05-execution-logs/evidence/2026-07-02-owner-preview-resource-pack-addendum.md docs/05-execution-logs/audits-reviews/2026-07-02-owner-preview-resource-pack-addendum.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId owner-preview-resource-pack-addendum-2026-07-02
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId owner-preview-resource-pack-addendum-2026-07-02 -SkipRemoteAheadCheck
```
