# Task Plan: phase-10-local-real-content-import-dry-run

## Metadata

- Task id: `phase-10-local-real-content-import-dry-run`
- Branch: `codex/phase-10-local-real-content-import-dry-run`
- Base branch: `master`
- Created at: `2026-05-23T00:00:00+08:00`
- Task plan policy: `required`
- Human approval: user explicitly requested continuing Phase 10 with this task and allowed local, read-only, metadata-level dry run over ignored `rawfiles/`.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-10-local-release-candidate-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-db-rebuild-seed-rehearsal.md`
- `archive/plans/2026-05-01-question-paper-model-research.md`

## Scope

Allowed files for this task:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-real-content-import-dry-run.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-real-content-import-dry-run.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `drizzle/**`

## Implementation Approach

1. Confirm task claim readiness on the short-lived branch before inspecting `rawfiles/`.
2. Inventory `rawfiles/` using local read-only commands:
   - Count files and top-level directory distribution.
   - Summarize extensions and total byte sizes.
   - Record per-file relative path, extension, size, and SHA256 prefix only.
3. Extract safe structural metadata without printing source content:
   - PDF page counts where local tooling can read them.
   - DOCX paragraph and table counts from zipped OpenXML metadata.
   - PPTX slide counts from zipped OpenXML metadata.
   - Legacy DOC and archive formats as risk markers only.
4. Classify files using metadata and filenames only:
   - Map likely `profession`, `level`, `subject`, `paper`, `paper_asset`, `resource`, and `knowledge_node` candidates.
   - Identify likely theory, skill, textbook, courseware, answer sheet, `standard_answer`, scanned PDF, legacy DOC, PPTX, and archive risks.
   - Treat 2024-11 material / answer sheet / standard answer separation as multiple `paper_asset` files under the same `paper`.
5. Write evidence as redacted structured summary:
   - No raw paper text, answer text, OCR text, textbook excerpts, prompt text, provider payloads, secrets, tokens, or production credentials.
   - Mention blockers or extraction limits without expanding scope or changing runtime code.
6. Update `project-state.yaml` and `task-queue.yaml` to close this task and point to the next Phase 10 task.
7. Run and record the task-queue validation commands.
8. Commit, merge to `master`, rerun necessary post-merge gates, push `origin/master`, and delete the local short-lived branch if all gates pass.

## Risk Controls

- `rawfiles/` is read-only and ignored by Git; no source material is committed.
- Evidence records metadata and classification only; it does not include reconstructable question, answer, OCR, textbook, or courseware content.
- No AI provider, model API, staging, prod, cloud service, public object storage, or production resource is contacted.
- No dependency, lockfile, runtime source, database schema, migration, `.env.example`, or `.env.local` change is allowed.
- If metadata extraction fails for a file type, record the extraction limitation and risk classification; do not introduce dependencies or write parsing code outside allowed files.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-real-content-import-dry-run
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```
