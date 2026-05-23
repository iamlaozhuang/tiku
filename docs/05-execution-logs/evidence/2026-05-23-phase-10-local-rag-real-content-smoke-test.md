# Evidence: phase-10-local-rag-real-content-smoke-test

## Metadata

- Task id: `phase-10-local-rag-real-content-smoke-test`
- Branch: `codex/phase-10-local-rag-real-content-smoke-test`
- Base: `master`
- Evidence created at: `2026-05-23T21:09:59+08:00`
- Task plan: `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-rag-real-content-smoke-test.md`
- Result: `blocked`
- Blocker class: `allowed_files_do_not_permit_real_content_rag_runtime`

## Scope

Allowed files used:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-rag-real-content-smoke-test.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-rag-real-content-smoke-test.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files respected:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `drizzle/**`

No dependency, lockfile, runtime source, database schema, migration file, environment example, local secret file, provider call, staging resource, production resource, deployment, public object storage URL, raw prompt, raw answer, raw model response, provider payload, response body, Authorization header, API key, secret, token, password, database URL, OCR output, answer key, or real-content excerpt was changed, printed, committed, or recorded.

## Real Content Input Check

- `rawfiles/` exists locally.
- `rawfiles/` is ignored by Git via `.gitignore:74`.
- File count: `62`.
- Total size: `310,687,817` bytes.
- Extension distribution:
  - `.pdf`: `42`
  - `.docx`: `18`
  - `.doc`: `1`
  - `.pptx`: `1`
- Detailed per-file metadata remains in the previous redacted evidence: `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-real-content-import-dry-run.md`.

This evidence does not repeat real file paths, source text, answer text, OCR text, or provider payloads.

## RAG Runtime Capability Check

Read-only code inspection found:

- `knowledge_base`, `resource`, and `knowledge_node_resource` are present in `src/db/schema/ai-rag.ts`.
- `resource.markdown_content` and `resource.markdown_content_hash` are the current inputs for local RAG chunking.
- `src/rag/chunking.ts` produces deterministic runtime `chunk` objects and redaction-safe chunk evidence summaries.
- `src/rag/retrieval.ts` produces runtime `citation` objects, `evidence_status`, and redaction-safe retrieval evidence summaries.
- `src/server/services/rag-resource-knowledge-runtime.ts` can rebuild vectors only for an existing `resource` that already has `markdownContent`.
- No persisted `chunk`, `citation`, or `embedding` tables exist in the current schema; those terms are currently runtime/evidence objects.

Local Docker database sanitized count check:

```json
{
  "appEnv": "dev",
  "resourceCount": 0,
  "resourceMarkdownCount": 0,
  "resourceContentHashCount": 0,
  "knowledgeBaseCount": 0,
  "knowledgeNodeCount": 0,
  "ragPersistenceTables": []
}
```

The query returned counts only. It did not print `.env.local`, `DATABASE_URL`, source content, secrets, or provider data.

## Blocked Decision

A true real-content RAG smoke would need at least one of these actions:

- Convert a local real file into safe `markdownContent`.
- Insert or import a real-content-backed `knowledge_base` / `resource` row into local `dev`.
- Run the existing vector rebuild path against that imported `resource`.
- Feed resulting chunks into retrieval and record redacted `citation` / `evidence_status` summaries.

The task's `allowedFiles` do not permit any runtime, parser, import script, database seed, migration, or source-code change required to do that honestly:

- `src/**` is blocked.
- `drizzle/**` is blocked.
- `scripts/**` is not allowed.
- dependency files are blocked.
- `.env.local` and `.env.example` are blocked.

Because the local database has no imported `resource.markdown_content` and this task cannot add the missing runtime/import path, the real-content RAG smoke is blocked. No synthetic content was substituted for real content, and no pass result is claimed.

## Existing Synthetic RAG Baseline

Focused unit validation of the existing synthetic RAG chain:

```powershell
npm.cmd run test:unit -- tests/unit/phase-9-rag-resource-knowledge-runtime.test.ts src/server/services/rag-chunking-service.test.ts src/server/services/rag-retrieval-service.test.ts src/rag/chunking.test.ts src/rag/retrieval.test.ts
```

Result:

- Exit code: `0`
- Test files: `5` passed.
- Tests: `13` passed.

This confirms the existing synthetic `markdownContent` chunking/retrieval baseline remains healthy, but it is not a real-content smoke pass.

## Security Review

- Reviewer: Codex
- Review date: `2026-05-23`
- Files reviewed:
  - `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-rag-real-content-smoke-test.md`
  - `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-rag-real-content-smoke-test.md`
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - read-only RAG runtime/schema files listed above
- Risk types reviewed: `rag`, `resource`, `knowledge_base`, `embedding`, `chunk`, `citation`, `evidence_status`, `real_content`, `model_provider`
- Abuse cases considered:
  - recording raw source textbook/paper text in evidence
  - recording answer keys or OCR output
  - claiming synthetic RAG output as real-content RAG smoke
  - leaking `.env.local`, database URL, API key, Authorization header, provider payload, raw prompt, raw answer, or raw model response
  - modifying runtime or schema outside allowed files
  - connecting to staging/prod or changing production resources
- Verdict: `BLOCKED`, because an honest real-content RAG smoke requires a future task with allowed runtime/import files or a pre-existing local `resource.markdown_content` fixture/data set.

## Validation Commands

Initial validation:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-rag-real-content-smoke-test`: pass after branch creation. A first attempt on `master` failed as expected because the script refuses protected branches.
- `git check-ignore -v rawfiles`: pass; `.gitignore:74:rawfiles/ rawfiles`.
- `docker compose ps`: pass; `tiku-postgres-dev` is healthy on local `127.0.0.1:5432`.
- Local DB sanitized count query: pass; counts shown above.
- Focused RAG unit tests: pass, `5` files and `13` tests passed.

Required validation results after state files were updated:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-rag-real-content-smoke-test`: expected blocked after state update; exit code `1` with `Task is not claimable: phase-10-local-rag-real-content-smoke-test has status blocked`. Earlier task claim readiness passed on this branch before marking the task blocked.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: pass.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `104` files and `380` tests passed.
  - format:check: pass.
- `npm.cmd run build`: pass; Next.js production build completed successfully with `.env.local` loaded and no secret values printed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; changed files are limited to the two state files plus this task plan and evidence.

## Residual Risk

- The real-content RAG smoke remains unproven.
- No `knowledge_base`, `resource`, `chunk`, `citation`, or `evidence_status` real-content chain is claimed beyond the existing synthetic unit/runtime baseline.
- A follow-up task needs explicit allowed files for local import/runtime work, or an approved pre-seeded local dev fixture, before Phase 10 closeout can honestly proceed.

## Taste Compliance Self-Check

- Frontend visual taste: no UI, Tailwind, color, font, layout, or interaction change.
- Loading/empty/error states: no frontend data state changed.
- Interaction feedback: no clickable UI changed.
- Tailwind class order: no Tailwind classes changed.
- Backend/API contract: no REST route, DTO, API response shape, or public URL changed.
- N+1/SQL/schema: no database schema, migration, Drizzle query implementation, or persisted data model changed.
- Naming discipline: evidence uses glossary identifiers including `knowledge_base`, `resource`, `chunk`, `citation`, `evidence_status`, `model_provider`, and `ai_call_log`; no new business abbreviation introduced.
- Immutability/clean logic: no production code changed.
- Secret and content hygiene: no API key, secret, Authorization header, database URL, raw provider payload, raw prompt, raw answer, raw model response, raw OCR output, answer key, or real-content excerpt recorded.
- Environment isolation: local `dev` only; no staging, prod, deployment, production database, cloud service, public object storage, or production resource touched.
