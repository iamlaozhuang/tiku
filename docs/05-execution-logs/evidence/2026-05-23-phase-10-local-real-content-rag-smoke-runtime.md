# Evidence: phase-10-local-real-content-rag-smoke-runtime

## Metadata

- Task id: `phase-10-local-real-content-rag-smoke-runtime`
- Branch: `codex/phase-10-local-real-content-rag-smoke-runtime`
- Base: `master`
- Evidence created at: `2026-05-23T22:18:00+08:00`
- Task plan: `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-real-content-rag-smoke-runtime.md`
- Human approval: User approved adding a local dev follow-up runtime task to unblock the Phase 10 real-content RAG smoke.

## Scope

Allowed files used:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-real-content-rag-smoke-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-real-content-rag-smoke-runtime.md`
- `scripts/local/Invoke-RealContentRagSmoke.ps1`
- `tests/unit/phase-10-local-real-content-rag-smoke-runtime.test.ts`
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

No dependency, lockfile, environment example, local secret file, schema, migration, route handler, production runtime, staging resource, production resource, deployment, public storage URL, filename, full source path, raw textbook excerpt, full paper, answer key, OCR output, raw prompt, raw answer, raw model response, provider payload, response body, Authorization header, API key, secret, token, password, or database URL was changed, printed, committed, or recorded.

## Implementation Summary

- Added `scripts/local/Invoke-RealContentRagSmoke.ps1`.
- Added `tests/unit/phase-10-local-real-content-rag-smoke-runtime.test.ts`.
- The script validates that local input is under Git-ignored `rawfiles/`.
- The script uses a bounded sample:
  - source count: `1`
  - max extracted characters: `12000`
  - max chunks: `6`
  - provider call: `not_run`
  - database write: `not_run`
- The script emits sanitized JSON only:
  - `knowledgeBase` local synthetic hash prefix
  - `resource` local synthetic hash prefix and status
  - `chunkSummary` counts and hash prefixes
  - `retrievalSummary` citation count, citation hash prefixes, and `evidenceStatus`

## Local Real-Content RAG Smoke Result

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-RealContentRagSmoke.ps1
```

Result:

- Exit code: `0`
- Result: `pass`
- Source location: `ignored_rawfiles`
- Supported extension: `.docx`
- Source size: `21884` bytes
- Source hash prefix: `11ceaa0c5acd`
- Knowledge base mode: `local_runtime_synthetic`
- Knowledge base public id hash prefix: `a94672dc1630`
- Resource mode: `local_runtime_synthetic`
- Resource public id hash prefix: `75464e23c62f`
- Resource status: `rag_ready`
- Resource content hash prefix: `a5d87556769b`
- Chunk count: `3`
- Chunk hash prefixes: `2fae8dc8e708`, `d5b141ab8e3e`, `a4e200950a9e`
- Citation count: `2`
- Citation hash prefixes: `2fae8dc8e708`, `d5b141ab8e3e`
- Evidence status: `sufficient`
- Provider call: `not_run`
- Database write: `not_run`
- Redaction markers present: `redacted`, `no raw content`, `ignored_rawfiles`, `bounded sample`

The executed smoke output did not include filenames, full source paths, raw textbook excerpts, full papers, answer keys, OCR output, raw prompts, raw answers, raw model responses, provider payloads, response bodies, Authorization headers, API keys, secrets, tokens, passwords, database URLs, staging resources, production resources, or public object storage URLs.

## TDD Result

- Initial focused unit test run before implementation: failed as expected because `scripts/local/Invoke-RealContentRagSmoke.ps1` did not exist.
- Focused unit test after implementation:
  - `npm.cmd run test:unit -- tests/unit/phase-10-local-real-content-rag-smoke-runtime.test.ts`: pass, `1` file and `1` test passed.

## Validation Commands

Initial validation:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-real-content-rag-smoke-runtime`: pass.
- `npm.cmd run test:unit -- tests/unit/phase-10-local-real-content-rag-smoke-runtime.test.ts`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-RealContentRagSmoke.ps1`: pass.

Required validation after evidence write:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-real-content-rag-smoke-runtime`: pass.
- `Select-String -Path 'docs\05-execution-logs\evidence\2026-05-23-phase-10-local-real-content-rag-smoke-runtime.md' -Pattern 'no raw content|redacted|ignored_rawfiles|bounded sample'`: pass; matches found.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass.
- First `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: failed only at `format:check`; lint, typecheck, and unit tests had passed, including `105` files and `381` tests.
- Format fix: `node .\node_modules\prettier\bin\prettier.cjs --write tests\unit\phase-10-local-real-content-rag-smoke-runtime.test.ts`: pass outside the sandbox after a sandbox `EPERM` while reading local `node_modules`.
- Second `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: pass.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `105` files and `381` tests passed.
  - format:check: pass.
- `npm.cmd run build`: pass; Next.js production build completed successfully with `.env.local` loaded and no secret values printed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; changed files are limited to the new task plan, evidence, local smoke script, safety unit test, and agent state/queue files.

## Queue Unblock Result

- `phase-10-local-real-content-rag-smoke-runtime`: `closed`.
- `phase-10-local-rag-real-content-smoke-test`: moved from `blocked` to `pending` and now depends on `phase-10-local-real-content-rag-smoke-runtime`.
- Next expected task: claim `phase-10-local-rag-real-content-smoke-test` and record sanitized evidence using the new local runtime.

## Security Review

- Reviewer: Codex
- Review date: `2026-05-23`
- Files reviewed:
  - `scripts/local/Invoke-RealContentRagSmoke.ps1`
  - `tests/unit/phase-10-local-real-content-rag-smoke-runtime.test.ts`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/04-agent-system/state/project-state.yaml`
- Risk types reviewed: `rag`, `resource`, `knowledge_base`, `embedding`, `chunk`, `citation`, `evidence_status`, `real_content`, `evidence_integrity`
- Abuse cases considered:
  - accidentally recording filenames or full local source paths
  - committing real教材/试卷/resource files
  - dumping raw extracted text or OCR-like content into evidence
  - leaking answer keys, full papers, or customer-like private data
  - reading `.env.local` or provider secrets
  - calling a provider or creating retry/cost storms
  - connecting staging/prod, deploying, or changing production resources
- Data exposure review: script output is fixed to redacted summary fields and hash prefixes; it does not serialize extracted text, source paths, provider payloads, environment values, or response bodies.
- Authorization boundary review: no user, admin, organization, employee, session, personal_auth, org_auth, or redeem_code runtime boundary is touched.
- API contract review: no REST route, DTO, public URL, or response contract is changed.
- Test coverage: unit test checks bounded settings, ignored source marker, RAG summary fields, and obvious raw-output/provider/secret regressions.
- Accepted gaps: this is a local runtime smoke and does not persist `knowledge_base`, `resource`, `chunk`, `citation`, or `evidence_status` rows; the existing project has runtime chunk/citation evidence objects and no persisted `chunk` / `citation` tables in this task's allowedFiles. It proves the sanitized local path needed to unblock the previously blocked RAG smoke.
- Verdict: `APPROVE`

## Residual Risk

- The script validates a bounded local sample only; it is not a full importer.
- The script does not perform semantic quality evaluation.
- Real source content remains local and ignored; future sanitized fixtures require a separate approved task.

## Git Closeout

- implementationCommit: `c655647 feat(rag): add local real content smoke runtime`.
- merge: `8dad5b7 merge: phase 10 real content rag smoke runtime`.
- postMergeValidation on `master`:
  - `Test-AgentSystemReadiness.ps1`: pass.
  - `Invoke-QualityGate.ps1`: pass.
    - lint: pass.
    - typecheck: pass.
    - test:unit: pass, `105` files and `381` tests passed.
    - format:check: pass.
  - `npm.cmd run build`: pass; Next.js build completed successfully with `.env.local` loaded and no secret values printed.
  - `Test-NamingConventions.ps1`: pass.
  - `Test-GitCompletionReadiness.ps1 -BaseBranch origin/master`: pass inventory; `master` was ahead of `origin/master` by the implementation and merge commits, and changed files remained limited to this task.
- Local real-content RAG smoke rerun after merge: not run; the branch run already recorded one bounded local sample, and extra real-content reads are unnecessary for this merge evidence.
- Push target: pending evidence update commit and push to `origin/master`.

## Taste Compliance Self-Check

- Frontend visual taste: no UI, Tailwind, color, font, layout, or interaction change.
- Loading/empty/error states: no frontend data state changed.
- Interaction feedback: no clickable UI changed.
- Tailwind class order: no Tailwind classes changed.
- Backend/API contract: no REST route or API response contract changed.
- N+1/SQL/schema: no database query, schema, migration, or Drizzle code changed.
- Naming discipline: used glossary terms including `knowledge_base`, `resource`, `chunk`, `citation`, and `evidence_status`; no new unregistered business abbreviations introduced.
- Clean logic: script is bounded, deterministic, and emits structured sanitized output only.
- Secret hygiene: no API key, no secret, no `.env.local`, no provider call, redacted output only.
- Environment isolation: local `dev` only; no staging, prod, deployment, production resource, production database, public object storage, or cloud resource touched.
