# AP-01 Qwen Local Experience Closeout Audit Task Plan

## Task

- Task id: `ap-01-qwen-local-experience-closeout-audit`
- Branch: `codex/ap-01-qwen-local-experience-closeout-audit`
- Objective: close AP-01 local experience evidence by summarizing the approved Qwen local execution chain and recording
  remaining release/high-risk gates as blocked.
- Pre-task base commit: `58095aa6`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-user-visible-result-one-request-materialization-execution.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-user-visible-result-local-db-persistence-execution.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-user-visible-result-local-readback-closeout-execution.md`

## Scope

Allowed write files:

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-local-experience-closeout-audit.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-local-experience-closeout-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-local-experience-closeout-audit.md`

Blocked actions:

- Provider/model call, provider retry, provider streaming, additional provider execution.
- `.env.local` read, `.env*` write, env secret output, full DB URL output.
- DB read/write, destructive DB operation, raw SQL.
- Source/test/e2e/script/schema/migration/dependency/package/lockfile changes.
- Browser/Playwright runtime, dev server, staging/prod/cloud/deploy, payment/external service, PR, push, force push.
- Formal adoption and Cost Calibration Gate.

## Audit Inputs

Summarize only the already redacted AP-01 evidence chain:

- provider one-request materialization execution: passed, exactly one approved Qwen request, redacted in-memory result.
- local DB persistence execution: passed, redacted draft result persisted locally with no additional provider call.
- local readback closeout execution: passed, existing service/route/student DTO-shape readback verified with no DB write.

## Evidence Redaction

Evidence may record command names, pass/fail, task ids, sanitized counts, sanitized status labels, evidence paths, and
residual blocked gates.

Evidence must not record `.env.local` contents, full `DATABASE_URL`, keys/tokens/Authorization headers, raw DB rows,
public id inventories, raw prompt, raw response, raw model output, provider payload, raw error text, trace, screenshot,
HTML report content, full paper/material content, or raw user data.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-local-experience-closeout-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-local-experience-closeout-audit`

## Closeout

- Mark AP-01 local experience closeout audit as passed.
- Update coverage matrix rows for AP-01 use cases to point to this closeout evidence.
- Keep release/high-risk gates blocked.
- Create local commit only.
- Do not merge, push, create PR, run provider calls, read env secrets, read/write DB, or open Cost Calibration Gate.
