# 2026-07-06 AI Paper Learning Session Handoff Contract Evidence

## Scope

- Task id: `ai-paper-learning-session-handoff-contract-2026-07-06`
- Branch: `codex/ai-paper-learning-session-handoff-contract-2026-07-06`
- Scope type: local source/test/docs/state only.
- Runtime boundaries: no DB runtime, no Provider call, no browser/dev server, no staging/prod/deploy, no Cost Calibration.
- Dependency boundaries: no dependency/package/lockfile/schema/migration/seed change.
- Evidence redaction: only file paths, command status, test counts, role labels, source categories, counts, and failure categories are recorded.

## Source Changes

- Learning session contract now exposes an AI组卷 handoff input for `paperAssemblyContainer` plus server-side formal source questions.
- Learning session service now creates answerable personal/employee sessions from locally selected AI组卷 containers.
- Selected source lookup requires matching `questionPublicId` plus source category, covering platform formal questions and enterprise training snapshots.
- Missing or invalid selected source content blocks creation with a safe category instead of saving a partial session.
- Paper assembly session questions use local selected paper scores and keep formal write boundary blocked.
- Existing AI出题 `visibleGeneratedContent` learning-session path remains unchanged.

## TDD Red

Command:

```text
npm.cmd run test:unit -- src/server/services/personal-ai-generation-learning-session-service.test.ts
```

Initial red result:

- Result: failed as expected.
- Test files: 1 failed.
- Tests: 2 failed, 7 passed.
- Failure category: `createLearningSessionFromPaperAssembly` contract missing.
- Sensitive output: not recorded.

## Validation Commands

Focused GREEN:

```text
npm.cmd run test:unit -- src/server/services/personal-ai-generation-learning-session-service.test.ts
```

- Result: pass.
- Test files: 1 passed.
- Tests: 9 passed.

Focused service + route regression:

```text
npm.cmd run test:unit -- src/server/services/personal-ai-generation-learning-session-service.test.ts src/server/services/personal-ai-generation-learning-session-route.test.ts
```

- Result: pass.
- Test files: 2 passed.
- Tests: 15 passed.

Related AI paper regression:

```text
npm.cmd run test:unit -- src/server/services/personal-ai-generation-learning-session-service.test.ts src/server/services/personal-ai-generation-learning-session-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts
```

- Result: pass.
- Test files: 5 passed.
- Tests: 59 passed.

Static gates:

```text
git diff --check
npm.cmd run typecheck
npm.cmd run lint
```

- `git diff --check`: pass.
- `typecheck`: pass after fixing one optional-field type mismatch in the local normalizer signature.
- `lint`: pass.

Scoped formatting:

```text
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-paper-learning-session-handoff-contract.md docs/05-execution-logs/evidence/2026-07-06-ai-paper-learning-session-handoff-contract.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-paper-learning-session-handoff-contract.md src/server/contracts/personal-ai-generation-learning-session-contract.ts src/server/models/personal-ai-generation-learning-session.ts src/server/services/personal-ai-generation-learning-session-service.ts src/server/services/personal-ai-generation-learning-session-service.test.ts src/server/services/personal-ai-generation-learning-session-route.ts src/server/services/personal-ai-generation-learning-session-route.test.ts src/server/validators/personal-ai-generation-learning-session.ts
```

- Result: pass after formatting one allowed source file.

Module Run v2 hardening:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-learning-session-handoff-contract-2026-07-06
```

- Result: pass.
- Cost Calibration Gate remained blocked.

## Assertions Covered

- `org_advanced_employee`-style owner scope can create an answerable AI组卷 learning session from platform formal question and enterprise training snapshot categories.
- The created session remains actor-isolated and answerable through the existing answer submission service.
- Formal write boundary stays blocked for question, paper, practice, answer record, exam report, and mistake book.
- Missing selected formal source content blocks the handoff and does not save a session.
- AI出题 route/service regression remains covered by the existing `visibleGeneratedContent` tests.

## Non-Claims

- DB-backed runtime: not tested.
- Browser/UI: not tested.
- Provider-disabled: not tested.
- Provider-enabled small sample: not tested.
- Staging/prod/deploy: not executed; requires fresh approval.
- Cost Calibration: not executed; requires fresh approval.
- Release readiness: not claimed.
- Production usability: not claimed.
