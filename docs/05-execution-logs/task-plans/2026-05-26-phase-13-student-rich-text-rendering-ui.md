# Phase 13 Student Rich Text Rendering UI Task Plan

**Task id:** `phase-13-student-rich-text-rendering-ui`

**Branch:** `codex/phase-13-student-rich-text-rendering-ui`

**Date:** 2026-05-26

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-student-experience-gap-scan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-experience-gap-closeout-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Queue Scope

### allowedFiles

- `src/features/student/**`
- `src/components/**`
- `tests/unit/**`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

### blockedFiles

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/db/schema/**`
- `drizzle/**`

## Task Range

Fix Phase 12 student gaps:

- `STU-GAP-001`: student practice and mistake_book render `*RichText` fields as literal text instead of safe rich text.
- `STU-GAP-002`: practice progress card exposes `practice.publicId` as learner-facing metadata.

Do not add dependencies, change schema, read env files, call real providers, or record raw paper/customer content.

## Implementation Plan

1. Add a small student-facing rich text renderer under `src/components/**` that uses a narrow allowlist for common rich-text tags and strips unsafe or unsupported nodes instead of injecting raw HTML.
2. Use the renderer for practice stem, material, options, feedback standard answer, feedback analysis, and mistake_book stem/standard answer/analysis.
3. Replace visible practice public id in the learner progress card with useful mode/session metadata.
4. Keep API DTO fields and route behavior unchanged.

## Browser Validation Plan

The flow under test is: `/login` -> `/home` -> `/practice?paperPublicId=...` -> submit one objective answer -> rendered rich text appears without literal HTML tags.

Also verify `/mistake-book` renders rich text content without literal tags and still hides sensitive/session text.

## Code Cross-Check Paths

- `src/features/student/practice/StudentPracticePage.tsx`
- `src/features/student/mistake-book/StudentMistakeBookPage.tsx`
- `tests/unit/student-practice-ui.test.ts`
- `tests/unit/student-mistake-book-ui.test.ts`
- `e2e/student-practice-mock-entry.spec.ts`

## Risk Defense

- TDD first: add failing unit coverage for literal markup not being displayed and unsafe tags being stripped before implementation.
- Do not use `dangerouslySetInnerHTML` for unreviewed payloads.
- Keep rendering allowlist small and deterministic.
- Preserve Loading, Empty, Error, and authorization states.
- Do not expose internal numeric ids, tokens, raw prompt, raw answer, provider payload, storage object keys, or environment values.

## Validation Commands

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

- Do not read, modify, or output `.env.local` or `.env.example`.
- Do not connect to staging, prod, cloud, or a real provider.
- Do not record secrets, tokens, Authorization headers, database URLs, raw prompt, raw answer, raw model response, raw provider payload, full paper content, full教材, OCR full text, or private customer-like data.
