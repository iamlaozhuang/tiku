# AP-01 Qwen User-Visible Result Local Readback Closeout Execution Task Plan

## Task

- Task id: `ap-01-qwen-user-visible-result-local-readback-closeout-execution`
- Branch: `codex/ap-01-qwen-user-visible-result-local-readback-closeout-execution`
- Objective: run the approved local-only, read-only readback and user-visible data-shape verification for the redacted
  AP-01 Qwen result that was already persisted to the local DB.
- Pre-task base commit: `b2358942`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-user-visible-result-local-readback-closeout-approval.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-user-visible-result-local-db-persistence-execution.md`

## Scope

Allowed write files:

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-user-visible-result-local-readback-closeout-execution.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-user-visible-result-local-readback-closeout-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-user-visible-result-local-readback-closeout-execution.md`

Read-only runtime inputs:

- `.env.local`, only for the `DATABASE_URL` alias in process.
- Existing source readback path files:
  - `src/app/api/v1/personal-ai-generation-results/route.ts`
  - `src/app/api/v1/personal-ai-generation-results/[publicId]/route.ts`
  - `src/server/services/personal-ai-generation-result-route.ts`
  - `src/server/services/personal-ai-generation-result-history-service.ts`
  - `src/server/repositories/personal-ai-generation-result-repository.ts`
  - `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`

Blocked files and actions:

- `.env*` writes, package files, lockfiles, source, tests, e2e specs, schema, migrations, scripts, reports.
- Provider/model calls, provider retry/streaming, additional provider execution, provider configuration changes, DB writes,
  destructive DB operations, raw SQL, Browser/Playwright runtime, dev server, staging/prod/cloud/deploy, payment,
  external services, PR, push, force push, formal adoption, and Cost Calibration Gate.

## Execution Design

1. Use an inline `tsx` runner through stdin; do not create a script file.
2. Read `.env.local` only to load `DATABASE_URL`, then classify the host as local loopback/local Docker without printing
   the URL.
3. Connect to the local DB with a single client and use the existing repository/service/route-handler path for readback.
4. Verify collection readback and detail readback for the already persisted AP-01 redacted draft result.
5. Verify route-handler data-shape and student UI DTO expectations without running Browser/Playwright.
6. Emit sanitized JSON only: pass/fail, counts, booleans, redaction states, formal adoption blocked status, and blocked
   gate states.
7. Stop as blocked if provider call, DB write, raw sensitive output, non-local DB target, source change, schema change, or
   dependency change would be required.

## Evidence Redaction

Evidence may record command names, pass/fail, sanitized count values, field-presence booleans, redaction-state labels,
highest local verification level, and residual blocked gates.

Evidence must not record `.env.local` contents, full `DATABASE_URL`, keys/tokens/Authorization headers, raw DB rows,
public id inventories, raw prompt, raw response, raw model output, provider payload, raw error text, trace, screenshot,
or HTML report content.

## Validation Commands

- `node_modules\.bin\tsx.cmd --tsconfig tsconfig.json - <redacted local readback runner via stdin>`
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-user-visible-result-local-readback-closeout-execution`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-user-visible-result-local-readback-closeout-execution`

## Closeout

- Write redacted evidence and audit review.
- Update task queue, project state, and local experience coverage matrix.
- Create local commit only.
- Do not merge, push, create PR, run additional provider calls, or open Cost Calibration Gate.
