# AI Generation Post Admin Parameters Localhost Rerun Task Plan

## Task

- Task id: `ai-generation-post-admin-parameters-localhost-rerun-2026-07-01`
- Branch: `codex/ai-generation-post-admin-parameters-localhost-rerun`
- Scope: restart/verify local owner preview after the admin parameter-state repair and scan AI 出题 / AI组卷 entrances across all approved roles.
- Non-goals: no source/test change, no dependency/package/lockfile change, no schema/migration/seed change, no `.env*` read/write, no e2e, no staging/prod/cloud/deploy, no Cost Calibration, no release readiness or final Pass claim.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- Browser control skill for in-app browser observation.

## Matrix

Roles:

- `personal_standard_student`
- `personal_advanced_student`
- `org_standard_employee`
- `org_advanced_employee`
- `org_standard_admin`
- `org_advanced_admin`
- `content_admin`
- `ops_admin`

Workflows:

- AI 出题
- AI 组卷

Cross-role scan items:

- Generated content must be grounded in imported resource / knowledge base / chunk / citation evidence, or generation must be blocked with a clear business message when evidence is insufficient.
- Ordinary users and operators must not see internal governance wording such as local contract summary, redaction status, raw contract fields, Provider payload, prompt, raw AI output, or implementation identifiers.

## Execution Plan

1. Confirm working tree and task state are clean and scoped.
2. Restart or verify local `http://localhost:3000`.
3. Open the in-app browser to localhost.
4. Use only local owner-preview credentials in memory; never print, store, or write them.
5. For each role and workflow, record only route/process status, pass/fail/blocked conclusion, sanitized UI wording findings, grounding status, and whether Provider sample was skipped or executed.
6. Provider samples are allowed only when the page is reachable and grounding is sufficient; evidence must not include prompt, payload, AI output, or full generated content.
7. Summarize blockers and next repair tasks if any.

## Validation Commands

```powershell
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-post-admin-parameters-localhost-rerun-2026-07-01
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-post-admin-parameters-localhost-rerun-2026-07-01 -SkipRemoteAheadCheck
```

## Evidence Boundary

Evidence records sanitized role labels, routes, workflow names, pass/fail/blocked/not_applicable status, status counts, duration buckets, token counts if Provider is executed, and failure categories only.

Evidence must not contain credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*`, raw DOM, screenshots, traces, raw DB rows, internal ids, PII, raw prompt, Provider payload, raw AI output, or full question/paper/material/resource/chunk content.
