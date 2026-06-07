# Phase 9 Content Question Material Runtime Plan

## Metadata

- Task id: `phase-9-content-question-material-runtime`
- Branch: `codex/phase-9-content-question-material-runtime`
- Base: `master`
- Date: `2026-05-23`
- Task plan policy: `required`

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-8-product-surface-contract.md`
- `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-authorization-expiry-termination-completion.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-authorization-expiry-termination-completion-security-review.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/*.md`
- `docs/01-requirements/stories/*.md`

## Recovery Baseline

- `git status --short --branch`: `## master...origin/master` before branch creation.
- `git log -5 --oneline`: latest `63e9654 docs(agent): close authorization expiry termination task`.
- `git branch --list`: only `master` before branch creation.
- `git branch -r`: only `origin/HEAD -> origin/master` and `origin/master`.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass.
- Created task branch: `codex/phase-9-content-question-material-runtime`.
- `Test-TaskClaimReadiness.ps1 -TaskId phase-9-content-question-material-runtime`: pass.

## Scope

Allowed files follow the queue entry. This task will not modify `package.json`, lockfiles, `.env.example`, or `drizzle/**`.

In scope:

- Replace unavailable `questions` route wiring with authenticated content runtime.
- Replace unavailable `materials` route wiring with authenticated content runtime.
- Replace unavailable `knowledge-nodes` list route wiring with authenticated read runtime.
- Implement repository-backed runtime for question and material list/detail/create/update/disable/copy without schema or dependency changes.
- Implement repository-backed knowledge-node listing for the existing `GET /api/v1/knowledge-nodes` route.
- Record audit_log boundaries for question/material mutations and knowledge-node list permission denials where the local audit table is available.
- Preserve public-id-only API DTOs and standard response envelopes.

Out of scope:

- Paper composition and paper asset lifecycle; owned by `phase-9-paper-composition-lifecycle-runtime`.
- Knowledge-node create/edit/move/disable UI and full RAG lifecycle; owned by later AI/RAG and resource/knowledge tasks.
- Real AI provider, object storage, external SMS/email/payment, migrations, or dependency changes.

## TDD Plan

1. Add failing unit tests for a protected content runtime route layer:
   - unauthenticated requests return `401001`;
   - non-content admin roles return permission denied;
   - authorized content admins can create, update, disable, copy, and list questions/materials through public identifiers only;
   - successful and failed mutations append redaction-safe audit entries.
2. Add failing unit tests for `knowledge-nodes` list runtime:
   - requires admin session;
   - returns public identifiers, camelCase fields, pagination, and no numeric ids.
3. Add failing unit tests for repository/service behavior where needed:
   - question copy clears lock state and creates independent option/scoring-point rows;
   - material copy clears lock state;
   - locked question/material update is rejected before mutation.
4. Implement the smallest route/runtime/repository changes to pass the tests.
5. Run focused tests after each red/green step, then run the required full gates.

## Risk Controls

- Auth/session boundary: all new runtime route handlers resolve `getCurrentSession` and require an admin identity before returning data.
- Permission boundary: content operations require `super_admin` or `content_admin`; `ops_admin` cannot mutate content.
- API contract: no route uses numeric database `id`; DTOs keep camelCase and `{ code, message, data, pagination? }`.
- Audit boundary: mutation routes write `audit_log` summaries with action type, target resource type, target public id, result status, and redacted metadata.
- Data exposure: no password, token, API key, code hash, raw provider payload, or session token is returned or recorded in evidence.
- Dependency gate: no package or lockfile changes.

## Required Verification

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-content-question-material-runtime`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
