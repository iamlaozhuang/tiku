# Phase 4 Practice Session Baseline Evidence

## Metadata

- Task id: `phase-4-practice-session-baseline`
- Branch: `codex/phase-4-practice-session`
- Base: `master`
- Worktree: `F:\tiku\.worktrees\phase-4-practice-session`
- Date: 2026-05-19
- Result: pass

## Scope

Implemented the student-facing practice session API baseline for:

- Start or resume practice for a published paper in current authorization scope.
- Read current practice detail.
- Submit practice answers with immediate objective feedback.
- Update `mistake_book` for wrong objective answers through a repository boundary.
- Restart or terminate practice progress.

This task did not change dependencies, schema, migrations, env files, or frontend code.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-practice-session-baseline-security-review.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-practice-session-baseline.md`
- `docs/05-execution-logs/task-plans/2026-05-19-phase-4-practice-session-baseline.md`
- `src/app/api/v1/practices/route.ts`
- `src/app/api/v1/practices/[publicId]/route.ts`
- `src/app/api/v1/practices/[publicId]/answers/route.ts`
- `src/app/api/v1/practices/[publicId]/restart/route.ts`
- `src/app/api/v1/practices/[publicId]/terminate/route.ts`
- `src/server/contracts/practice-contract.ts`
- `src/server/repositories/practice-repository.ts`
- `src/server/mappers/practice-mapper.ts`
- `src/server/mappers/practice-mapper.test.ts`
- `src/server/validators/practice.ts`
- `src/server/validators/practice.test.ts`
- `src/server/services/practice-service.ts`
- `src/server/services/practice-service.test.ts`
- `src/server/services/practice-route.ts`
- `src/server/services/practice-route.test.ts`

## TDD Evidence

### Mapper And Validator Red

Commands:

```powershell
npm.cmd run test:unit -- src/server/mappers/practice-mapper.test.ts
npm.cmd run test:unit -- src/server/validators/practice.test.ts
```

Result: fail as expected.

Key output:

```text
Error: Failed to resolve import "./practice-mapper"
Error: Failed to resolve import "./practice"
Test Files 1 failed (1)
```

### Mapper And Validator Green

Commands:

```powershell
npm.cmd run test:unit -- src/server/mappers/practice-mapper.test.ts
npm.cmd run test:unit -- src/server/validators/practice.test.ts
```

Result: pass.

Key output:

```text
Test Files 1 passed (1)
Tests 2 passed (2)

Test Files 1 passed (1)
Tests 4 passed (4)
```

### Service Red

Command:

```powershell
npm.cmd run test:unit -- src/server/services/practice-service.test.ts
```

Result: fail as expected.

Key output:

```text
Error: Failed to resolve import "./practice-service"
Test Files 1 failed (1)
```

### Service Green

Command:

```powershell
npm.cmd run test:unit -- src/server/services/practice-service.test.ts
```

Result: pass.

Key output:

```text
Test Files 1 passed (1)
Tests 5 passed (5)
```

### Route Red

Command:

```powershell
npm.cmd run test:unit -- src/server/services/practice-route.test.ts
```

Result: fail as expected.

Key output:

```text
Error: Failed to resolve import "./practice-route"
Test Files 1 failed (1)
```

### Route Green

Command:

```powershell
npm.cmd run test:unit -- src/server/services/practice-route.test.ts
```

Result: pass.

Key output:

```text
Test Files 1 passed (1)
Tests 4 passed (4)
```

### Combined Targeted Tests

Command:

```powershell
npm.cmd run test:unit -- src/server/mappers/practice-mapper.test.ts src/server/validators/practice.test.ts src/server/services/practice-service.test.ts src/server/services/practice-route.test.ts
```

Result: pass.

Key output:

```text
Test Files 4 passed (4)
Tests 15 passed (15)
```

## Queue Validation Commands

### `npm.cmd run lint`

Result: pass.

Key output:

```text
> tiku-scaffold@0.1.0 lint
> eslint
```

### `npm.cmd run typecheck`

Result: pass.

Key output:

```text
> tiku-scaffold@0.1.0 typecheck
> tsc --noEmit
```

### `npm.cmd run test:unit`

Result: pass.

Key output:

```text
Test Files 49 passed (49)
Tests 138 passed (138)
```

### `Select-String -Path 'src\app\api\v1\practices\**\*.ts' -Pattern 'code|message|data'`

Result: pass.

Key output included route contract matches in:

- `src\app\api\v1\practices\[publicId]\route.ts`

### `Select-String -Path 'src\server\services\*.ts' -Pattern 'practice|answer_record|mistake_book'`

Result: pass.

Key output included matches in:

- `src\server\services\practice-service.ts`
- `src\server\services\practice-service.test.ts`
- `src\server\services\practice-route.ts`
- `src\server\services\practice-route.test.ts`

### `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`

Result: pass.

Key output:

```text
== Result ==
naming convention scan completed
```

## Additional Validation

### `npm.cmd run format:check`

Initial result: fail on five task files.

Fix command:

```powershell
npm.cmd exec -- prettier --write src/server/mappers/practice-mapper.test.ts src/server/services/practice-route.test.ts src/server/services/practice-route.ts src/server/services/practice-service.test.ts src/server/services/practice-service.ts
```

Final result: pass.

Key output:

```text
All matched files use Prettier code style!
```

### `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

Result: pass.

Key output:

```text
== Result ==
git completion readiness inventory completed
```

## Security Review

Security review path:

`docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-practice-session-baseline-security-review.md`

Verdict: `APPROVE`

Accepted gaps:

- Real repository implementation and transactionality are deferred.
- Dedicated `mistake_book` APIs are deferred.
- Phase 5 AI feedback is not invoked and AI statuses are `null`.

## State Update

- `phase-4-practice-session-baseline`: `done`
- Next recommended action: `claim_phase_4_mock_exam_session_baseline`

## Completion Notes

- No `package.json`, `pnpm-lock.yaml`, or `package-lock.json` changes.
- No `src/db/schema/**`, `drizzle/**`, or `.env.example` changes.
- No frontend code changes.
- API responses keep `{ code, message, data }`.
- Student-facing routes use `publicId`, not numeric database ids.
