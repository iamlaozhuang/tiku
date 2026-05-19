# Phase 3 Paper Draft Composition Baseline Task Plan

## Task

- Task id: `phase-3-paper-draft-composition-baseline`
- Branch: `codex/phase-3-paper-draft-composition-baseline`
- Base: `master`
- Date: `2026-05-19`

## Required Sources Read

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-3-question-library-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-question-library-baseline-security-review.md`

## Scope

Implement the paper draft composition baseline for:

- draft paper metadata create/list/detail/update
- `paper_section`
- `question_group`
- adding a source `question` to a draft `paper`
- paper question score and `sort_order` adjustment
- paper question removal

Allowed implementation areas are limited to:

- `src/app/api/v1/papers/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/validators/**`
- `tests/unit/**`
- task plan, evidence, security review, project state, and task queue files

Explicitly forbidden:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`
- `.env.example`

## TDD Plan

1. Add failing paper service and route tests covering list/create/detail/update, add/update/remove paper questions, snapshot payloads, `paper_section`, `question_group`, and `sort_order`.
2. Verify RED with targeted `npm.cmd run test:unit -- src/server/services/paper-draft-service.test.ts src/server/services/paper-draft-route.test.ts`.
3. Implement the smallest paper contract, validator, mapper, repository interface, service, and route handler factory needed to pass.
4. Add Next.js route files for the approved `/api/v1/papers` paths in this task.
5. Re-run targeted tests, then full task validation commands from `task-queue.yaml`.

## Implementation Notes

- Match the question/material baseline posture: runtime route files remain unavailable until authenticated admin wiring exists.
- Use `publicId` and `paperQuestionPublicId`; never expose internal numeric `id`.
- Keep snapshots in camelCase and exclude numeric ids, session data, admin phone numbers, and storage keys.
- Keep published-paper behavior out of this task except rejecting draft composition updates for non-draft paper rows.
- Validate score values at 0.5 increments and `sortOrder` as positive integers.
- Keep `paper_section` and `question_group` terms in service/repository internals where queue validation expects them; API JSON remains camelCase.

## Risk Defense

- `authorization`: runtime routes do not enable repository-backed access until admin auth integration lands.
- `api_contract`: all responses use `{ code, message, data, pagination? }`, JSON fields are camelCase, and routes use `/api/v1/papers`.
- `data_contract`: repository rows may contain numeric ids, but mappers strip them from API DTOs.
- `admin`: write operations are represented behind service boundaries and unavailable runtime route wiring.
- `paper_section` / `question_group` ownership remains draft-only until publish lifecycle tasks add stronger validation.

## Validation Plan

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `Select-String -Path 'src\app\api\v1\papers\**\*.ts' -Pattern 'code|message|data'`
- `Select-String -Path 'src\server\services\*.ts' -Pattern 'paper_section|question_group|sort_order'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- Record results in `docs/05-execution-logs/evidence/2026-05-19-phase-3-paper-draft-composition-baseline.md`.
- Write security review at `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-paper-draft-composition-baseline-security-review.md`.
