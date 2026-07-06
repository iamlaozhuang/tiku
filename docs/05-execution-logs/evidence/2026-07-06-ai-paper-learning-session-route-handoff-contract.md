# 2026-07-06 AI Paper Learning Session Route Handoff Contract Evidence

## Scope

- Task id: `ai-paper-learning-session-route-handoff-contract-2026-07-06`
- Branch: `codex/ai-paper-learning-session-route-handoff-contract-2026-07-06`
- Scope type: local source/test/docs/state only.
- Runtime boundaries: no DB runtime, no Provider call, no browser/dev server, no staging/prod/deploy, no Cost Calibration.
- Dependency boundaries: no dependency/package/lockfile/schema/migration/seed change.
- Evidence redaction: only file paths, command status, test counts, role labels, source categories, counts, and failure categories are recorded.

## Source Changes

- Learning session route now accepts AI组卷 `paperAssemblyContainer` as a separate creation path.
- Route grounding evidence for AI组卷 is derived from `visibleGeneratedContent.groundingSummary`.
- Route resolves formal source question content through a server-side `paperSourceQuestionResolver`.
- Client-sent source question content is ignored and is not used as the answerable paper source.
- Existing AI出题 learning-session route remains on the `visibleGeneratedContent` path and does not call the paper source resolver.
- Resolver absence or incomplete selected source coverage returns safe blocked results through the learning-session service.

## TDD Red

Command:

```text
npm.cmd run test:unit -- src/server/services/personal-ai-generation-learning-session-route.test.ts
```

Initial red result:

- Result: failed as expected.
- Test files: 1 failed.
- Tests: 2 failed, 7 passed.
- Failure categories observed: paper source resolver not invoked; route used old generated-question path for AI组卷 request.
- Sensitive output: not recorded.

## Validation Commands

Focused GREEN:

```text
npm.cmd run test:unit -- src/server/services/personal-ai-generation-learning-session-route.test.ts
```

- Result: pass.
- Test files: 1 passed.
- Tests: 9 passed.

Related AI paper regression:

```text
npm.cmd run test:unit -- src/server/services/personal-ai-generation-learning-session-service.test.ts src/server/services/personal-ai-generation-learning-session-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts
```

- Result: pass.
- Test files: 5 passed.
- Tests: 62 passed.

Static gates:

```text
git diff --check
npm.cmd run typecheck
npm.cmd run lint
```

- `git diff --check`: pass.
- `typecheck`: pass.
- `lint`: pass.

Scoped formatting:

```text
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-paper-learning-session-route-handoff-contract.md docs/05-execution-logs/evidence/2026-07-06-ai-paper-learning-session-route-handoff-contract.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-paper-learning-session-route-handoff-contract.md src/server/contracts/personal-ai-generation-learning-session-contract.ts src/server/services/personal-ai-generation-learning-session-route.ts src/server/services/personal-ai-generation-learning-session-route.test.ts
```

- Result: pass after formatting one allowed route test file.

Module Run v2 hardening:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-learning-session-route-handoff-contract-2026-07-06
```

- Result: pass.
- Cost Calibration Gate remained blocked.

## Assertions Covered

- `org_advanced_employee`-style route owner scope can create an AI组卷 learning session from server-resolved source question content.
- AI组卷 route ignores client-supplied source question content and uses resolver output.
- Missing selected formal source content blocks creation with `selected_question_source_missing` and saves no session.
- AI出题 route regression remains covered and does not invoke the paper source resolver.

## Non-Claims

- DB-backed source resolver wiring: not implemented in this task.
- DB-backed runtime: not tested.
- Browser/UI: not tested.
- Provider-disabled: not tested.
- Provider-enabled small sample: not tested.
- Staging/prod/deploy: not executed; requires fresh approval.
- Cost Calibration: not executed; requires fresh approval.
- Release readiness: not claimed.
- Production usability: not claimed.
