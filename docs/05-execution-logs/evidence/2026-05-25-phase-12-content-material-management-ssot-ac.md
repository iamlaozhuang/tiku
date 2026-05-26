# Phase 12 Content Material Management SSOT AC Evidence

## 任务边界

- TaskId: `phase-12-repair-content-material-management-ssot-ac`
- Branch: `codex/phase-12-content-material-management-ssot-ac`
- Scope: existing-schema local material management UI, tests, evidence, and queue state.

## 外部与安全边界

- No cloud resources created or modified.
- No staging/prod connection.
- No deployment.
- No package, lockfile, dependency, schema, migration, script, `.env.local`, or `.env.example` change.
- No secret, token, Authorization header, provider payload, raw prompt, raw answer, raw model response, full paper, full textbook, OCR full text, customer or customer-like private data recorded.
- Real object storage upload/public URL remains out of scope; material rich text helpers use local placeholders only.

## SSOT AC 对照

| AC                                                                            | Runtime result                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-02-06 AC-1 material title/body/table/image/profession/level/subject/status | Implemented for existing schema/API. Material form captures title, rich text body, profession, level, subject; status remains runtime-managed for create and preserved as `available` on existing edit path. Local image/table helpers insert bounded markup placeholders only.        |
| US-02-06 AC-2 locked material copy-only                                       | Implemented in UI: locked material edit button is disabled and copy remains enabled. Service already rejects locked material update.                                                                                                                                                   |
| US-02-06 AC-3 disabled material action                                        | Existing disable action remains wired through `/api/v1/materials/{publicId}/disable` and covered by UI/service tests.                                                                                                                                                                  |
| US-02-06 AC-4 referenced question/paper list                                  | Partially covered by current runtime data. Material list now derives referenced question publicIds from loaded question DTOs. Referenced paper list is explicitly blocked because current material DTO/API does not provide paper reference data without a service contract expansion. |
| US-06 content material management UI                                          | Implemented for local material create/edit/disable/copy, filters, lock boundary, and redacted publicId-only reference visibility.                                                                                                                                                      |

## 验证记录

### TDD RED

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts src/server/services/material-service.test.ts
```

Result:

- Failed as expected before implementation.
- `tests/unit/admin-question-material-ui.test.ts`: 4 failed material UI tests.
- Failure categories: missing locked material edit test id/disabled state; material form lacked accessible `材料表单`; missing material metadata fields; missing 30000-char guard and rich text helper controls.

### TDD GREEN

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts src/server/services/material-service.test.ts
```

Result:

- PASS.
- Test Files: 2 passed.
- Tests: 21 passed.

### E2E

Command:

```powershell
npm.cmd run test:e2e -- e2e/content-action-closures.spec.ts
```

Result:

- PASS.
- `1 passed`.

### Build

Command:

```powershell
npm.cmd run build
```

Result:

- PASS.
- Next.js build compiled successfully, TypeScript completed, and 47 static pages generated.
- Build output reported `.env.local` was loaded by Next.js; no secret value was read, copied, or recorded.

### Mechanism Gates

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-content-material-management-ssot-ac
```

Result:

- PASS at task start while queue status was `pending`.
- Later rerun after task state was set to `in_progress` returned the expected "not claimable" message; this is a state-timing result, not a runtime failure.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

Result:

- PASS.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
```

Result:

- PASS.
- Banned terms absent; API route folders, DTO fields, and generic term scans passed.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result:

- PASS inventory.
- Branch: `codex/phase-12-content-material-management-ssot-ac`.
- Pending changes were limited to this task scope before closeout.

Command:

```powershell
git diff --check
```

Result:

- PASS.

### Extra Quality Gate

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

Result:

- PASS.
- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm run test:unit`: 125 files passed, 484 tests passed.
- `npm run format:check`: pass.

## Repository Hygiene Closeout

- package/lockfile/dependency changes: none.
- schema/migration/script changes: none.
- `.env.local` or secret/env changes: none.
- cloud/staging/prod/deployment changes: none.
- public object storage URL: none.
- sensitive/raw content recorded: none.
- Known boundary: referenced paper list for materials still requires a material reference API/DTO extension in a future approved task.

## Post-Merge Master Verification

After merging `codex/phase-12-content-material-management-ssot-ac` into `master`:

- `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts src/server/services/material-service.test.ts`: PASS, 2 files, 21 tests.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: PASS.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch origin/master`: PASS inventory; master was ahead of `origin/master` by the task commit and merge commit only.
- `git diff --check`: PASS.
