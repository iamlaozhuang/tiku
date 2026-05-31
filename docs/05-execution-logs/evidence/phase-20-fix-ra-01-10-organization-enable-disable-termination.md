# Phase 20 Fix RA-01-10 Organization Enable Disable Termination Evidence

## Summary

- Task id: `phase-20-fix-ra-01-10-organization-enable-disable-termination`.
- Branch: `codex/phase-20-fix-ra-01-10-organization-enable-disable-termination`.
- Finding: `F-RA-01-10-001`.
- Result: implemented and validated on branch.

## Startup and Claim

- Verified `master` was clean and aligned with `origin/master`.
- Verified no residual `codex/*` branch and no unknown worktree before claiming.
- Created branch: `codex/phase-20-fix-ra-01-10-organization-enable-disable-termination`.
- Claim readiness command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-01-10-organization-enable-disable-termination
```

Result: pass.

## Source Finding

`F-RA-01-10-001` reported that organization enable coverage was missing and organization disable did not demonstrate termination of affected active student `practice` / `mock_exam` flows.

## Implementation Notes

- Existing runtime already exposed `POST /api/v1/organizations/{publicId}/enable`.
- Extended organization disable results with `activeFlowTermination` counts.
- Updated organization disable audit metadata to include redacted affected organization and terminated flow counts.
- Updated local repository disable flow to terminate active affected employee flows:
  - `practice.practice_status = "in_progress"`
  - `mock_exam.exam_status in ("in_progress", "scoring", "scoring_partial_failed")`
- No schema, drizzle, dependency, env, external service, cloud, deploy, or destructive data outside the intended local status transition was introduced.

## Command Evidence

### RED

Command:

```powershell
npm.cmd run test:unit -- tests/unit/phase-20-ra-01-10-organization-disable-termination.test.ts
```

Result: expected fail before implementation.

Output summary:

```text
audit metadata lacked terminated practice/mock_exam counts
repository source lacked terminateOrganizationActiveFlows
```

### Targeted Unit

Command:

```powershell
npm.cmd run test:unit -- tests/unit/phase-20-ra-01-10-organization-disable-termination.test.ts tests/unit/phase-11-system-ops-organization-management-loop.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts
```

Result: pass.

Output summary:

```text
Test Files  3 passed (3)
Tests       9 passed (9)
```

### Lint and Typecheck

Commands:

```powershell
npm.cmd run lint
npm.cmd run typecheck
```

Result: pass.

### Full Unit

Command:

```powershell
npm.cmd run test:unit
```

Result: pass.

Output summary:

```text
Test Files  143 passed (143)
Tests       597 passed (597)
```

### Full E2E

Command:

```powershell
npm.cmd run test:e2e
```

Result: pass.

Output summary:

```text
26 passed
```

### Quality Gate

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

Result: initial fail on `format:check`, then pass after formatting.

Final output summary:

```text
lint: pass
typecheck: pass
test:unit: pass, 143 files / 597 tests
format:check: pass
```

### Agent Gates

Commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
git diff --check
```

Result: pass.

Output summary:

```text
agent system readiness: pass
naming convention scan completed
git completion readiness inventory completed
diff check: pass
```

### Build

`npm.cmd run build` skipped because this task changed backend route/runtime result metadata and unit coverage, not frontend rendering or build-system behavior.

## Security Review

- Task id: `phase-20-fix-ra-01-10-organization-enable-disable-termination`.
- Risk types reviewed: `auth_permission_model`, `local_human_verification`, `evidence_integrity`.
- Files reviewed:
  - `src/server/contracts/organization-auth-contract.ts`
  - `src/server/services/admin-organization-org-auth-runtime.ts`
  - `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
  - `tests/unit/phase-20-ra-01-10-organization-disable-termination.test.ts`
- Abuse cases considered:
  - `content_admin` bypasses organization mutation guard.
  - organization disable terminates unrelated users outside affected organizations.
  - termination counts leak internal numeric ids.
  - evidence records session tokens or internal row ids.
- Authorization boundary review: existing `requireOrganizationManager` remains the only mutation entry and allows only `super_admin` / `ops_admin`.
- Data boundary review: result exposes public organization ids and aggregate counts only; no internal row ids are returned.
- Mutation scope review: repository gathers active user ids through `employee.organization_id in affected organizationIds`; active `practice` and active/scoring `mock_exam` rows are terminated for those users only.
- Evidence review: command output records counts and redacted metadata only; no token, password, or private payload is recorded.
- Verdict: `APPROVE`.
