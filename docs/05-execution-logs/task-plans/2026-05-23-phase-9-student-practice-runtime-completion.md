# Task Plan: phase-9-student-practice-runtime-completion

## Metadata

- Task id: `phase-9-student-practice-runtime-completion`
- Branch: `codex/phase-9-student-practice-runtime-completion`
- Base: `master`
- Date: `2026-05-23`
- Task plan policy: `required`

## Read Sources

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
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-content-admin-ui-completion.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-requirements-runtime-gap-inventory.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/*.md`
- `docs/01-requirements/stories/*.md`

## Scope From Queue

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-9-student-practice-runtime-completion.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-student-practice-runtime-completion.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-student-practice-runtime-completion-security-review.md`
- `src/app/api/v1/practices/**`
- `src/app/api/v1/student-papers/**`
- `src/app/api/v1/mistake-books/**`
- `src/server/auth/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Implementation Plan

1. Claim the task on a short-lived branch and keep all edits inside allowed files.
2. Add failing unit coverage for practice runtime gaps:
   - practice detail returns saved answer records for resume.
   - `currentQuestionIndex` reflects the next unanswered question.
   - multiple-choice `partial_credit` scores partial correct answers without marking them fully correct.
   - subjective practice answers do not create `mistake_book` rows.
3. Implement the smallest service/repository/contract changes needed:
   - add a repository read for practice answer records by practice public id.
   - include `answerRecords` in practice result DTOs.
   - derive progress from the paper snapshot and saved answer records.
   - honor `multiChoiceRule: partial_credit` in objective scoring.
4. Record security review because queue metadata includes `authorization`, `student`, `practice`, `mistake_book`, and `ai_call_log`.
5. Run required validation commands and write evidence.

## Scope Conflict Handling

- AI explanation auto-generation and subjective AI hint/re-answer require `ai_call_log`, prompt, RAG, and mock-provider boundaries. This task will not fabricate AI calls or mark AI success without the later `phase-9-ai-scoring-explanation-hint-runtime` task. Any remaining AI gaps will be recorded as residual risk.
- Browser UX completion is outside this runtime task because `src/features/student/**` is not allowed. UI follow-up remains `phase-9-student-experience-ui-completion`.
- No dependency, schema, migration, environment, production resource, or external provider changes are planned.

## Risk Defenses

- Preserve auth/session runtime and always resolve student identity through route user context.
- Use `publicId` only in routes and DTOs; never expose numeric `id`.
- Keep API response envelope `{ code, message, data, pagination? }`.
- Avoid returning secrets, session tokens, raw prompts, raw model payloads, or password material.
- Keep `mistake_book` writes restricted to wrong objective answers.
- Preserve immutable snapshot-based scoring for practice answers.

## Required Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-student-practice-runtime-completion`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
- `npm.cmd run test:e2e`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
