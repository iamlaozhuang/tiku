# Fix Route Error Envelope Question Paper Student Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to execute this plan in the current session. Use superpowers:test-driven-development for the source/test change and superpowers:verification-before-completion before claiming completion.

## Task

- Task id: `fix-route-error-envelope-question-paper-student-experience-2026-06-29`
- Branch: `codex/fix-route-error-envelope-20260629`
- Source finding: `sec-redlog-001` from `security-data-redaction-log-boundary-inventory-2026-06-29`
- Goal: add focused regression coverage and a minimal route-handler fix so unexpected runtime exceptions in question_paper and student_experience REST handlers return the standard `{ code, message, data }` envelope without serializing raw exception details.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest related task plan, evidence, acceptance, audit, and traceability for `security-data-redaction-log-boundary-inventory-2026-06-29`

## Scope

Allowed writable files:

- `src/server/services/question-paper/route-handlers.ts`
- `src/server/services/student-experience/route-handlers.ts`
- `tests/unit/question-paper/question-paper-rest-layering.test.ts`
- `tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md`
- `docs/05-execution-logs/task-plans/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md`
- `docs/05-execution-logs/evidence/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md`
- `docs/05-execution-logs/acceptance/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md`

Blocked actions:

- No staging, production, cloud, deployment, release readiness, final Pass, or Cost Calibration.
- No database connection, mutation, schema, migration, seed, raw row access, or DB evidence capture.
- No Provider or AI call, provider configuration, model configuration, prompt capture, or raw AI input/output evidence.
- No browser runtime, dev server, raw DOM, screenshots, traces, or HTML report capture.
- No account login, private account read, credential, cookie, token, session, localStorage, Authorization header, env file, or connection-string access.
- No package or lockfile changes, dependency introduction, dependency removal, or dependency upgrade.
- No PR creation and no force-push.

## TDD Plan

1. RED: add unit coverage for question_paper handler repository failure.
   - Route target: `handlers.examPapers.collection.GET(...)`
   - Assertion: response status is 500.
   - Assertion: JSON body is `{ code: 500001, message: "Unexpected runtime error.", data: null }`.
   - Assertion: serialized response body does not contain the synthetic thrown error detail.
2. RED: add unit coverage for student_experience mistake_book list repository failure.
   - Route target: `handlers.mistakeBooks.collection.GET(...)`
   - Assertion: response status is 500.
   - Assertion: JSON body is `{ code: 500001, message: "Unexpected runtime error.", data: null }`.
   - Assertion: serialized response body does not contain the synthetic thrown error detail.
3. GREEN: wrap the question_paper handler tree with `createRouteHandlersWithErrorEnvelope`.
4. GREEN: wrap the student_experience handler tree with `createRouteHandlersWithErrorEnvelope`.
5. REFACTOR: keep naming aligned with glossary terms and avoid unrelated refactors.

## Evidence Rules

Record only:

- File paths, test names, commands, pass/fail status, counts, and redacted summaries.
- Commit hash, branch names, and merge/push result.

Do not record:

- Raw exception payloads or stack traces.
- Raw DB rows, internal IDs, PII, email, phone, plaintext redeem_code, env values, credentials, cookies, tokens, sessions, localStorage, Authorization headers, raw DOM, screenshots, traces, provider payloads, prompts, or raw AI input/output.
- Complete question, paper, material, resource, or chunk content.

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown src/server/services/question-paper/route-handlers.ts src/server/services/student-experience/route-handlers.ts tests/unit/question-paper/question-paper-rest-layering.test.ts tests/unit/student-experience/student-experience-layering-mistake-book.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md docs/05-execution-logs/task-plans/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md docs/05-execution-logs/evidence/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md docs/05-execution-logs/audits-reviews/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md docs/05-execution-logs/acceptance/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md
npx.cmd prettier --check --ignore-unknown src/server/services/question-paper/route-handlers.ts src/server/services/student-experience/route-handlers.ts tests/unit/question-paper/question-paper-rest-layering.test.ts tests/unit/student-experience/student-experience-layering-mistake-book.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md docs/05-execution-logs/task-plans/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md docs/05-execution-logs/evidence/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md docs/05-execution-logs/audits-reviews/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md docs/05-execution-logs/acceptance/2026-06-29-fix-route-error-envelope-question-paper-student-experience.md
npm run test:unit -- tests/unit/question-paper/question-paper-rest-layering.test.ts tests/unit/student-experience/student-experience-layering-mistake-book.test.ts
npm run lint
npm run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-route-error-envelope-question-paper-student-experience-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-route-error-envelope-question-paper-student-experience-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-route-error-envelope-question-paper-student-experience-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by active thread task materialization.
- Fast-forward merge to `master`: approved by active thread task materialization after validation passes.
- Push `origin/master`: approved by active thread task materialization after validation passes.
- Cleanup short branch: approved by active thread task materialization after merge and push.
