# Task Plan: Phase 12 Student Mistake Book AC Coverage

## Task

- id: `phase-12-repair-student-mistake-book-ac-coverage`
- branch: `codex/phase-12-student-mistake-book-ac-coverage`
- source: Phase 12 SSOT audit repair queue

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Scope

Improve the student `mistake_book` local runtime and UI coverage against US-03-09 without changing schema, migrations, scripts, dependencies, env files, cloud resources, staging/prod, or provider configuration.

Allowed implementation targets:

- `src/features/student/mistake-book/**`
- `src/server/services/mistake-book-service.ts`
- `src/server/services/mistake-book-route.ts`
- `src/server/validators/mistake-book.ts`
- declared unit tests and evidence/state files

## SSOT Acceptance Focus

- AC-2: manual favorite, remove, mark mastered actions remain publicId scoped.
- AC-5: filter by question type, source, and mastery status.
- AC-6: AI explanation entry remains available without exposing raw prompt, payload, token, or raw provider response.
- AC-8: list is paginated.
- AC-9: disabled source question remains visible with a disabled marker and can still expose review/AI entry.
- Review view shows stem, learner answer summary, standard answer, and analysis where snapshots provide them.

## Implementation Approach

1. Add unit coverage for filter query construction, pagination controls, disabled question markers, and review fields.
2. Add lightweight page state for filters and page number, reloading `/api/v1/mistake-books` with canonical query keys.
3. Render filter controls and pagination in the mobile-first student page without adding new UI dependencies.
4. Keep redaction boundaries: do not render session token, internal numeric id, raw provider payload, raw prompt, raw model response, or citation chunk text.
5. Adjust service pagination total only within existing repository contract if needed.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-student-mistake-book-ac-coverage`
- `npm.cmd run test:unit -- tests/unit/student-mistake-book-ui.test.ts src/server/services/mistake-book-service.test.ts src/server/services/mistake-book-route.test.ts`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Controls

- No `.env.local` read/output beyond normal runtime test behavior.
- No provider calls.
- No raw prompts, answers, provider payloads, Authorization headers, secrets, or tokens in evidence.
- No schema, migration, package, lockfile, dependency, script, staging/prod, deploy, or cloud changes.
