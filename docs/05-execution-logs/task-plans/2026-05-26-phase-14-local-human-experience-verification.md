# Phase 14 Local Human Experience Verification Task Plan

**Task id:** `phase-14-local-human-experience-verification`

**Branch:** `codex/phase-14-local-human-experience-verification`

**Date:** 2026-05-26

## Scope

Prepare and accompany a local human experience verification pass after Phase 13 fixes. This task is docs-only except for local browser/test execution evidence. It records observed gaps and validation results without changing runtime code, tests, dependencies, schema, scripts, deployment configuration, or env files.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/01-requirements/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-26-phase-13-ai-audit-model-config-runtime-ui.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-13-ai-redaction-shape-and-management-e2e.md`

## Verification Boundary

Allowed:

- Read code, tests, requirements, and interface contracts only as needed to locate routes and expected behavior.
- Start or confirm a local dev server.
- Use in-app browser or Playwright against `localhost` / `127.0.0.1` only.
- Record role, operation path, expected result, actual result, pass/fail, and UX/copy/data/permission/redaction gaps.
- Modify only project state, task queue, this plan, and evidence.

Forbidden:

- Do not read, modify, output, or summarize `.env.local` or `.env.example`.
- Do not connect to `staging`, `prod`, cloud resources, or real providers.
- Do not deploy, create PRs, or push without explicit approval.
- Do not add, remove, or upgrade dependencies.
- Do not modify `src/**`, `e2e/**`, `tests/**`, `src/db/schema/**`, `drizzle/**`, `scripts/**`, `package.json`, or lockfiles.
- Do not record secrets, tokens, Authorization headers, database URLs, raw provider payloads, raw prompts, raw answers, raw model responses, full textbooks, full papers, OCR full text, or customer/customer-like private data.
- Do not bypass `phase-13-real-provider-staging-redaction-approval-gate`; it remains blocked.

## Human Experience Paths

Minimum paths:

1. Login page.
2. Student home.
3. `practice`.
4. `mock_exam`.
5. `exam_report`.
6. `mistake_book`.
7. Profile.
8. Admin entry.
9. Content management core pages.
10. User / `organization` / `authorization` related pages.
11. AI audit / `model_config` pages.

## Risk Defense

- Use synthetic/local seeded data only.
- Treat browser-visible data as evidence summaries, not raw content dumps.
- If a gap is found, record it only; do not edit code unless a new repair task is explicitly authorized.
- Keep validation evidence concise and redaction-safe.
- Re-check `git status` before staging and ensure changed files are limited to allowed docs/state/queue paths.

## Validation Commands

- `npm.cmd run test:e2e`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Closeout Plan

1. Complete local browser/human verification evidence.
2. Run validation commands and record results.
3. Confirm forbidden scope self-check.
4. Confirm only allowed docs/state/queue files changed.
5. Commit current task files on the short branch.
6. Switch to `master`, merge with `--no-ff`, rerun necessary gates, and amend post-merge evidence if needed.
7. Stop before `git push origin master` unless the user explicitly authorizes push.
