# 2026-07-06 AI paper plan route integration evidence

## Scope

- Task ID: `ai-paper-plan-route-integration-2026-07-06`
- Branch: `codex/ai-paper-plan-route-integration-2026-07-06`
- Scope type: local source + focused unit tests + redacted docs/state evidence.
- Runtime boundaries:
  - Provider call executed: no.
  - Env/secret read or write: no.
  - DB runtime / mutation: no.
  - Browser/dev server: no.
  - Staging/prod/deploy: no.
  - Cost Calibration: no.
  - Dependency/package/lockfile/schema/migration/seed change: no.

## TDD RED

Command:

```text
npm.cmd run test:unit -- src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts
```

Result: failed as expected.

Observed failure categories:

- AI组卷 Provider instruction still required nested generated question fields.
- Shared AI组卷 task spec still used old default and old redaction category.
- Structured preview parser still missed `sections` / `targetQuestionCount`.
- Structured preview parser still accepted nested generated question arrays.

No Provider payload, raw prompt, raw AI output, full question, answer, material, DB row, credential, session, cookie, token, env value, or private fixture value was recorded.

## GREEN

Command:

```text
npm.cmd run test:unit -- src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts
```

Result: pass.

Aggregate:

- Test files: 2 passed.
- Tests: 37 passed.

Command:

```text
npm.cmd run test:unit -- src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts
```

Result: pass.

Aggregate:

- Test files: 4 passed.
- Tests: 53 passed.

## Static Gates

Command:

```text
npm.cmd run typecheck
```

Result: pass.

Command:

```text
npm.cmd run lint
```

Result: pass.

Command:

```text
git diff --check
```

Result: pass.

Command:

```text
npm.cmd exec -- prettier --check --ignore-unknown <task allowed files>
```

Initial result: failed on scoped formatting only.

Follow-up:

```text
npm.cmd exec -- prettier --write --ignore-unknown <5 task files>
```

Final result: pass.

Command:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-plan-route-integration-2026-07-06
```

Result: pass.

## Source Contract Evidence

Implemented source-level contract changes:

- AI组卷 route-integrated Provider instruction now requests only a paper assembly plan.
- AI组卷 instruction no longer asks for final question stems, options, answers, or analysis.
- AI组卷 shared task default target count is 30.
- AI组卷 redaction category is plan-summary only.
- Structured preview parser accepts `sections` and `targetQuestionCount` plan-style outputs.
- Structured preview parser rejects nested generated question content before persistence acceptance.
- Existing `paper_draft` preview kind is retained as a compatibility wrapper for later UI packages; current semantics are plan summary, not generated final question bodies.

## Non-Claims

- No local DB-backed AI组卷 selection runtime was executed.
- No formal paper draft creation or content-admin adoption runtime was claimed.
- No learner/employee preview-before-answer UI was changed or claimed.
- No role matrix/browser acceptance was executed.
- No Provider-enabled sample was executed.
- No release readiness, production usability, staging, production, deploy, final Pass, or Cost Calibration is claimed.
