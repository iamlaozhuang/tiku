# Knowledge Node AI Cross-Role Regression Evidence

## Scope

- Task: `knowledge-node-ai-cross-role-regression-2026-07-08`
- Branch: `codex/knowledge-node-ai-cross-role-regression-2026-07-08`
- Matrix row: final cross-role regression and closure.
- Code/test scope:
  - `tests/unit/knowledge-node-ai-cross-role-regression.test.ts`

## Requirement Mapping Result

- Structured `knowledgeNodePublicIds`, `knowledgeNodeMode`, `includeDescendants`, supplement, and source preference remain a shared contract for `personal_advanced_student`, `org_advanced_employee`, `org_advanced_admin`, and `content_admin` AI generation surfaces.
- Empty balanced knowledge scope remains explicit and allowed; malformed public ids or source preference values are rejected before role-specific request execution.
- Organization AI routes remain advanced-only; organization standard admins get a standard-unavailable decision instead of an advanced AI workspace.
- `super_admin` without selected organization context is denied from organization AI routes with explicit organization-context requirement.
- `content_admin` and `ops_admin` workspaces remain separated; `ops_admin` cannot enter content AI routes.
- Full regression found no additional source inconsistency requiring a code fix.

## Validation

- `npm.cmd exec -- vitest run tests/unit/knowledge-node-ai-cross-role-regression.test.ts`
  - Result: PASS
  - Scope: 1 file, 4 tests.
- `npm.cmd exec -- vitest run`
  - Result: PASS
  - Scope: 346 files, 1750 tests.
- `npm.cmd run lint`
  - Result: PASS
- `npm.cmd run typecheck`
  - Result: PASS
- `git diff --check`
  - Result: PASS

## Redaction And Safety

- No DB read/write, migration, seed, schema, fixture, rawfiles, browser runtime, screenshot, raw DOM, Provider execution, Provider configuration read/write, env read/write, dependency change, package/lockfile change, staging/prod/deploy, or Cost Calibration was performed.
- Evidence contains only file paths, command names, aggregate test counts, and redacted conclusions.
- No credential, session, cookie, token, localStorage, Authorization header, DB row, internal numeric id, Provider payload, raw prompt, raw AI output, full question, full paper, full material, or full resource content is recorded.

## Module Run v2 Gates

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId knowledge-node-ai-cross-role-regression-2026-07-08`
  - Result: PASS
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId knowledge-node-ai-cross-role-regression-2026-07-08 -SkipRemoteAheadCheck`
  - Result: PASS
