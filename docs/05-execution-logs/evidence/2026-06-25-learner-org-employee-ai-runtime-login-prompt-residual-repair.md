# Learner Org Employee AI Runtime Login Prompt Residual Repair Evidence

Task id: learner-org-employee-ai-runtime-login-prompt-residual-repair-2026-06-25

Branch: codex/ai-runtime-login-prompt-20260625

Status: closed

## Scope Decision

The first minimum source repair selected from the post-browser-rerun evidence is the direct personal AI generation route login-prompt residual for authenticated personal learners and organization employees. The repair is limited to route-level cookie-backed session normalization in request/result personal AI generation resolvers plus focused unit coverage.

## Redaction Policy

- No credential values, session tokens, cookies, account identifiers, browser storage, `.env*`, or private account source contents are recorded.
- Synthetic test cookie values are local unit-test strings only.

## TDD Record

### RED

Command:

```powershell
npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts
```

Result: failed as expected before production repair.

Observed failures:

- `personal-ai-generation-request-route.test.ts`: cookie-backed personal session test expected `Bearer synthetic-cookie-session-token`, received `null`.
- `personal-ai-generation-result-route.test.ts`: cookie-backed employee session test expected `Bearer synthetic-cookie-session-token`, received `null`.

### GREEN

Production change:

- `src/server/services/personal-ai-generation-request-route.ts`: resolver now uses `getRequestAuthorization(request)`.
- `src/server/services/personal-ai-generation-result-route.ts`: resolver now uses `getRequestAuthorization(request)`.

Command:

```powershell
npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts
```

Result: passed.

Summary:

- Test Files: 2 passed
- Tests: 32 passed

## Validation Record

- `npx.cmd prettier --write --ignore-unknown ...`: passed; all listed files unchanged after formatting.
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts`: passed; 2 files, 32 tests.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npx.cmd prettier --check --ignore-unknown ...`: passed.
- `git diff --check`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-org-employee-ai-runtime-login-prompt-residual-repair-2026-06-25`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-org-employee-ai-runtime-login-prompt-residual-repair-2026-06-25 -SkipRemoteAheadCheck`: passed.

## Result

Source-level focused repair passed. Browser rerun was not executed in this task, and no Standard/Advanced MVP final Pass is claimed.
