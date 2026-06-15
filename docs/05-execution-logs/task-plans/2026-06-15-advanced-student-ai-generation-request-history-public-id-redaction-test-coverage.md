# advanced-student-ai-generation-request-history-public-id-redaction-test-coverage plan

## Scope

- Add a narrow request-history UI regression test fixture in `StudentPersonalAiGenerationPage.test.tsx`.
- Assert non-empty request-history metadata renders while request/task/result/AI-call public identifier text remains hidden.
- Update only task state, queue, plan, evidence, audit, and the focused page test.

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- Prior evidence/audit for request-history public identifier redaction readonly audit

## TDD Plan

1. Add the missing non-empty request-history fixture and negative public identifier rendering assertions before any source implementation change.
2. Run the focused page unit test.
3. Keep production UI/source code unchanged if the existing behavior already satisfies the new regression guard.

## Risk Controls

- No `.env*` read/write/output.
- No DB access, provider/model call, quota/cost work, dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment/external-service.
- No schema, drizzle, scripts, package, lockfile, dependency, route, service, API contract, or formal adoption write changes.
- No raw prompt, raw answer, provider payload, row data, private data, secret, token, cookie, Authorization header, DB URL, or public identifier lists in evidence output.

## Validation

- `npm.cmd run test:unit -- src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-student-ai-generation-request-history-public-id-redaction-test-coverage`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-student-ai-generation-request-history-public-id-redaction-test-coverage`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-student-ai-generation-request-history-public-id-redaction-test-coverage`
