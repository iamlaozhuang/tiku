# Evidence: organization-training-admin-visible-scope-local-fixture-contract-repair

- Task id: `organization-training-admin-visible-scope-local-fixture-contract-repair`
- Date: `2026-06-18`
- Branch: `codex/organization-training-local-experience-chain`
- Status: `blocked_validation_failure`
- Result: `local_seed_admin_visible_scope_repaired_full_flow_blocked_by_source_context_ui_response_mapping`

## Summary

The local seed fixture now assigns the deterministic seed admin to the deterministic seed organization through
`admin_organization`. The scoped e2e organization selection no longer uses the first organization returned by
`/api/v1/organizations`; it selects the deterministic seed-visible organization contract instead.

After applying the idempotent local seed, the scoped organization-training full-flow progressed past the previous
manual draft `409080` blocker. It now creates the draft successfully, but the flow is blocked at the admin source-context
UI step because the API returns a successful source-context response while the admin UI reads the wrong response key and
shows source binding failure.

No `experience_closed` claim is made.

## RED

Command:

```text
npm.cmd run test:unit -- src/db/dev-seed.test.ts
```

Result: fail as expected.

- 1 failed, 2 passed.
- Failure reason: seed dataset did not expose an `adminOrganization` fixture linking the seed admin to the seed
  organization.

## GREEN

Changes:

- Added a deterministic `adminOrganization` fixture to `src/db/dev-seed.ts`.
- Made `seedDevDatabase` insert the admin-to-organization visible scope row into `admin_organization` with
  idempotent conflict handling.
- Added a redacted summary count for the fixture relation.
- Changed the scoped e2e organization selection from first-list-item selection to deterministic seed-visible
  organization selection.

Command:

```text
npm.cmd run test:unit -- src/db/dev-seed.test.ts
```

Result: pass.

- 1 file passed.
- 3 tests passed.

## Local Capability And Fixture Execution

Command:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId organization-training-admin-visible-scope-local-fixture-contract-repair -Capability localDockerDatabase -Intent use_capability
```

Result: pass.

- `localCapabilityDecision: capability_ready`
- `capabilityState: approved_local_dev_only`
- No schema, migration, destructive data, staging, or prod connection action was executed by the gate.

Command:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1
```

Result: pass.

- Local seed completed.
- Redacted summary confirmed the admin-visible organization fixture relation count is `1`.
- No database URL, secret, token, public ID list, row data, or credential value was recorded.

## Scoped Full-Flow Rerun

Command:

```text
npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts --list
```

Result: pass.

- 1 test listed in 1 file.

Command:

```text
npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts
```

Result: fail.

- Previous blocker cleared: manual draft creation no longer fails with `409080`.
- New blocker: after source-context POST returns standard success (`code: 0`), the admin UI still renders the source
  binding failure state and does not render the source marker expected by the e2e.
- Root-cause candidate from source inspection: the source-context route returns `data.context`, while the admin UI reads
  `data.attachment`.

## Additional Validation

Command:

```text
npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts src/db/dev-seed.test.ts
```

Result: pass.

- 3 files passed.
- 9 tests passed.

Command:

```text
npx.cmd prettier --check --ignore-unknown src/db/dev-seed.ts src/db/dev-seed.test.ts e2e/organization-training-local-full-flow.spec.ts docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-18-organization-training-admin-visible-scope-local-fixture-contract-repair.md
```

Result: pass.

Command:

```text
git diff --check
```

Result: pass.

Command:

```text
npm.cmd run lint
```

Result: pass.

Command:

```text
npm.cmd run typecheck
```

Result: pass.

## Blocked Gate

- Blocker: `admin_source_context_ui_response_mapping_blocks_local_full_flow`
- Recommended next task: `organization-training-admin-source-context-ui-response-key-contract-repair`
- Reason: the current task repaired the seed visible scope and e2e organization selection contract, but full-flow
  validation now exposes a separate admin UI response-key mismatch.
- Next module run candidate: `organization-training-admin-source-context-ui-response-key-contract-repair`
- Cost Calibration Gate remains blocked.

## Module Run V2 Readiness Gates

Command:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-admin-visible-scope-local-fixture-contract-repair
```

Result: fail.

- Scope scan passed for all dirty files under this task's declared scope.
- Sensitive evidence scan reported `secret_assignment` findings in `src/db/dev-seed.ts` and `src/db/dev-seed.test.ts`.
- These are local deterministic dev credential fixture fields already present in the seed fixture surface; no secret
  value is recorded in this evidence.

Command:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-admin-visible-scope-local-fixture-contract-repair
```

Result: fail.

- Closeout readiness is not met because the scoped full-flow is still blocked and this task has no implementation
  commit/closeout evidence.
- This is expected for the current blocked state.

Command:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-admin-visible-scope-local-fixture-contract-repair
```

Result: pass.

- Git readiness passed.
- `master`, `origin/master`, and state-recorded master refs match in the gate output.

## Redaction

Evidence intentionally omits database URLs, secrets, credentials, session tokens, Authorization headers, row data,
public ID lists, raw source records, raw prompt/answer/model payloads, and full paper/material content.
