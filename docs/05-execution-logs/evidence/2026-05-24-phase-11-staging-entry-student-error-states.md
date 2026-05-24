# Evidence: phase-11-staging-entry-student-error-states

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-staging-entry-student-error-states`
- Goal: distinguish student missing-object deep links from generic load failures before Phase 11 staging entry.

## Boundary

- No dependency, package, or lockfile change.
- No schema, migration, or script change.
- No `.env.local` content read or recorded.
- No staging/prod connection.
- No deployment.
- No cloud resource change.
- No provider call.
- No secret/env change.
- No token, Authorization header, raw answer, full paper/material/OCR text, or private data recorded.

## Recovery And Claim

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-staging-entry-student-error-states
First result: failed because the newly added queue entry had already been marked in_progress.
Correction: restored the queue entry to pending, reran claim readiness, then marked it in_progress.
Final result: task claim readiness passed while task was pending.
```

## TDD Evidence

RED:

```text
npm.cmd run test:unit -- --run tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts
Result: failed as expected.
- practice fixture missing publicId still showed "暂无可继续的练习".
- practice runtime 404 still showed "练习加载失败".
- mock_exam fixture missing publicId still showed "暂无可进入的模拟考试".
- mock_exam runtime 404 still showed "模拟考试加载失败".
- exam_report fixture missing publicId still showed "暂无考试报告".
- exam_report runtime 404 still showed "考试报告加载失败".
```

GREEN:

```text
npm.cmd run test:unit -- --run tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts
Result: 2 test files passed, 23 tests passed.
```

## Validation Results

```text
node .\node_modules\prettier\bin\prettier.cjs --write <task allowlist>
Result: passed after sandbox EPERM retry with approval.
```

```text
npm.cmd run test:unit -- --run tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts
Result: 2 test files passed, 23 tests passed.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: passed.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: passed.
```

```text
git diff --check
Result: passed.
```

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
Result: passed.
- lint: passed.
- typecheck: passed.
- unit: 107 files passed, 399 tests passed.
- format:check: passed.
```

## Staging Decision

`stagingDecision`: `local_happy_path_ready_for_staging_entry_planning_review`

Reason: local student practice, mock_exam, exam_report missing-object error states are now distinct from generic load failure and authorization expiration. This does not approve deployment, cloud work, staging/prod connection, secret/env work, dependency work, schema work, migration work, or script work.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, generated plaintext `redeem_code` values, and customer/private data.
