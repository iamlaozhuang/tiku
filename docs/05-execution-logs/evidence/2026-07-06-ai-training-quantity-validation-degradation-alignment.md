# 2026-07-06 AI training quantity validation and degradation alignment evidence

## Scope

- Task id: `ai-training-quantity-validation-degradation-alignment-2026-07-06`
- Branch: `codex/ai-training-quantity-validation-degradation-alignment-2026-07-06`
- Scope: local source, focused unit tests, docs/state/evidence/audit only
- Not executed: DB runtime, Provider call, browser runtime, dev server, staging, production, deploy, Cost Calibration

## Redaction Boundary

Evidence records only file paths, command names, aggregate test counts, status codes, role labels, source categories, and
non-sensitive failure categories. It does not record credentials, sessions, cookies, tokens, env values, DB connection
values, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI output, full question or paper content,
materials, resources, chunks, screenshots, traces, DOM dumps, private fixture values, employee raw answers, or plaintext
`redeem_code`.

## TDD RED Evidence

Command:

```text
npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx -t "bounded|above the product contract|bounds preserved"
```

Observed result before source fix:

- Exit code: `1`
- Expected RED failures: `5`
- Covered gaps:
  - shared AI出题 preview accepted `20` instead of capping at `10`;
  - shared AI组卷 preview accepted `99` instead of capping at `80`;
  - admin UI preserved `99` instead of normalizing by generation kind;
  - personal local browser flow accepted AI出题 count above max;
  - admin local contract route accepted AI出题 count above max and advanced to a later runtime rejection.

## GREEN Evidence

Focused RED-to-GREEN command:

```text
npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx -t "bounded|above the product contract|bounds preserved"
```

Result:

- Exit code: `0`
- Test files: `4 passed`
- Tests: `5 passed`

Degradation wording command:

```text
npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts -t "degradation and insufficiency"
```

Result:

- Exit code: `0`
- Test files: `1 passed`
- Tests: `1 passed`

Focused package command:

```text
npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts
```

Result:

- Exit code: `0`
- Test files: `6 passed`
- Tests: `149 passed`

## Static Gates

Command:

```text
git diff --check
```

Result:

- Exit code: `0`

Command:

```text
npm.cmd run typecheck
```

Result:

- First run: exit code `1`, caught an over-wide admin task type boundary after the source change.
- Follow-up after narrowing the local resolver return type: exit code `0`.

Command:

```text
npm.cmd run lint
```

Result:

- Exit code: `0`

Command:

```text
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-training-quantity-validation-degradation-alignment.md docs/05-execution-logs/evidence/2026-07-06-ai-training-quantity-validation-degradation-alignment.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-training-quantity-validation-degradation-alignment.md src/server/contracts/ai-generation-task-spec-contract.ts src/server/services/route-integrated-provider-instruction-service.ts src/server/services/admin-ai-generation-local-contract-route.ts src/server/services/personal-ai-generation-request-route.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts
```

Result:

- Exit code: `0`
- Output category: all matched files use Prettier code style.

Command:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-training-quantity-validation-degradation-alignment-2026-07-06
```

Result:

- Exit code: `0`
- Output category: Module Run v2 pre-commit hardening passed.

## Implementation Summary

- Shared task spec now records AI出题 default `3` / max `10` and AI组卷 default `30` / max `80`.
- Shared structured preview and Provider instruction construction use the same bounded requested count.
- Admin request route rejects out-of-range question counts before task persistence or runtime bridge work.
- Personal/employee local browser request route rejects out-of-range question counts before request persistence.
- Admin UI normalizes persisted and manually entered quantity by generation kind.
- Admin paper assembly UI test covers Chinese product wording for nearby-knowledge supplement, same-scope supplement, and
  insufficient source states without exposing internal enum or `fallback` wording.

## Non-Claims

- This evidence does not claim DB-backed runtime pass, browser pass, Provider-enabled pass, release readiness, production
  usability, staging execution, production execution, deploy readiness, or Cost Calibration.
