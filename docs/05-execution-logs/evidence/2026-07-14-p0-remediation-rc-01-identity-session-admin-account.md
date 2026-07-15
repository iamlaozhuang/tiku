# P0 RC-01 Evidence

Date: 2026-07-14

Task: `p0-remediation-rc-01-identity-session-admin-account-2026-07-14`

Status: `ready_for_closeout`

result: pass

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

已按任务计划读取需求、traceability、UI 基线/脱敏设计板、迁移安全规则、原 finding、session/admin schema/service/repository/API/UI 目标源码和既有 session/admin/user lifecycle 测试。类比实现为 user 域 reset/disable/enable/session revoke，以及现有关系表和事务创建路径。

## Requirement Mapping Result

- F-0002：`confirmed`；当前 `admin` 无锁字段，默认 runtime 使用模块级 Map。
- F-0045：`confirmed`；当前只有 collection GET/POST、单值角色、非唯一 admin organization，既有 user lifecycle 不能命中 admin。
- F-0130：`root_cause_alias` 且独立验收义务保留；当前 user 失败计数仍是读后覆盖写。
- SSOT 决策一致，无需先建需求对齐任务。

## Baseline Recovery

- source/master/origin/live remote: `071d4ecd23ac0ec94bf3ca506d1e61b4c5fa5ac5`
- branch: `codex/p0-rc-01-identity-session-admin-account`
- worktree: `D:/tiku/.worktrees/p0-rc-01`
- startup task actual closeout: commit/ff-only merge/push/fresh verification/worktree cleanup/short branch cleanup all pass
- readonly audit baseline remains external and unchanged; no audit write performed

## Approval Boundary

- Product source/test changes are covered by the standing Program authorization after exact allowlist materialization.
- Schema/migration/backfill source authoring、测试与提交已由用户于 2026-07-14 明确批准；批准证据见专用 acceptance record。
- Drizzle generation exposed a pre-existing historical snapshot-chain collision. The user approved the dedicated request on 2026-07-15; only the two top-level chain identifiers in `drizzle/meta/20260710110500_snapshot.json` changed, and the schema payload remained byte-for-byte outside those lines.
- Database/runtime/browser/e2e/Provider/env/dependency/PR/force/deploy remain blocked.
- 批准前未修改产品源码、测试、schema 或 migration；后续变更严格受 task queue allowlist 约束。

## RED / GREEN

- RED-A: schema tests initially failed because admin lock fields, `admin_role_assignment`, and the one-organization unique constraint were absent.
- RED-B: session tests initially failed because admin lock state was process-local and the service/repository contract used stale absolute counts; a stale-snapshot concurrency fixture returned `401` instead of the threshold `423`.
- RED-C: contract/service/repository/UI tests initially failed because admin detail, multi-role update, enable/disable/reset, last-super protection, one-time password delivery, and lifecycle routes did not exist.
- GREEN: additive schema and SQL source, persistent atomic failure transitions, CAS success reset, account-state recheck at session creation, multi-role admin lifecycle transaction/API/UI, redacted audit, session revocation, last-super lock, seed adapters, and focused regression tests are implemented.
- GREEN: migration, repaired metadata chain, persistent login state, lifecycle transaction/API/UI and regression proof are complete for branch closeout.

## Round 1

Status: `pass`.

- Removed the process-local admin lock Map; user/admin failure transitions now use database-side `count + 1` and return the authoritative lock result.
- Successful login reset uses compare-and-set on the observed count, so a concurrent failure is not erased. `updated_at` uses database `clock_timestamp()` to avoid moving lifecycle CAS time backwards.
- Session creation and admin lifecycle share an auth-user advisory lock; disable/role-change/reset cannot race a new admin session into survival. Password credentials are reverified inside the locked session transaction, closing the old-password/reset TOCTOU.
- Admin role/organization/status/password/audit/session changes are transaction-bound; last-active-super removal/disable is serialized by a global advisory lock.
- Adversarial review added repository-level role/organization fail-closed validation, mixed-role ops denial, network failure UI recovery, migration additive-source checks, readable action labels, and a non-destructive migration preflight that rejects stale platform-role organization bindings instead of silently preserving them.
- Historical repair changed only the approved top-level identifiers; all 23 snapshots now have unique IDs and one linear `prevId` chain. Current generation is idempotent and creates no extra files.

## Round 2

Status: `pass`.

- Default session runtime consumes `admin_role_assignment` as `adminRoles[]`; organization capability preserves mixed-role arrays and organization binding.
- `ops_admin` list/detail/mutations fail closed if a target has any platform role; `super_admin` retains full target scope.
- API uses public IDs, camelCase, standard envelopes, `null`/`[]`, masked phones, `no-store` password responses, and no credential/session/internal-ID audit payloads.
- UI keeps backend accounts separate, supports multi-role/one-org editing and confirmed lifecycle actions, removes one-time password state on acknowledgement, and recovers from rejected lifecycle requests.
- P1/P2 remain impact-map only; runtime validation remains pending and is not represented as accepted.
- Final branch regression is complete. Standard `npm.cmd run build` remains the required post-merge fresh-master gate because this worktree intentionally uses a node_modules junction outside the Turbopack root.

## Validation Log

- `git rev-parse HEAD`: pass, `071d4ecd23ac0ec94bf3ca506d1e61b4c5fa5ac5`
- `git ls-remote origin refs/heads/master`: pass, same SHA
- `.env.local` existence-only check in isolated worktree: absent; no value read
- DB connection/migration apply/runtime acceptance: not executed
- Approved generation: repaired chain produced `20260715070131_p0_rc_01_admin_account_lifecycle.sql`, `20260715070131_snapshot.json` and journal idx 22. Idempotency probe exited 0 with “No schema changes” and `NewFiles=[]`; no database connection or apply occurred.
- Migration source proof: additive fields/table/index/backfill; stale platform-role organization bindings trigger a descriptive exception; no `DROP`/`TRUNCATE`/`DELETE`.
- Snapshot proof: 23/23 snapshot IDs unique, 22/22 adjacent `prevId` links exact, no broken link.
- Focused current diff: `13` test files, `98` tests passed.
- Final full unit: `379` files, `2190` tests passed with `--maxWorkers=1` in 1102.48 seconds.
- Two earlier high-concurrency diagnostics each exposed one unrelated timing-sensitive test; both passed isolated, and the final serial full gate above passed without exclusions.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npm.cmd run format:check`: pass.
- `git diff --check`: pass.
- P0 serial program guard: pass; WIP remains RC-01 only.
- Worktree Turbopack build cannot resolve a node_modules junction outside its root; master baseline `npm.cmd run build` passes. RC-01 standard build remains a mandatory fresh-master closeout gate after merge.
- Branch commit/merge/push/cleanup have not yet occurred; they are the authorized next closeout actions. RC-02 is not claimed before all five RC-01 closeout checkpoints pass.

## Validation Command Accounting

```text
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P0RemediationSerialProgram.ps1 -Phase manual
npm.cmd run test:unit
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run format:check
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p0-remediation-rc-01-identity-session-admin-account-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p0-remediation-rc-01-identity-session-admin-account-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p0-remediation-rc-01-identity-session-admin-account-2026-07-14 -SkipRemoteAheadCheck
```

localFullLoopGate: pass_branch_gates_fresh_master_build_after_merge

Cost Calibration Gate remains blocked.

threadRolloverGate: continue_same_goal_after_rc_01_closeout

nextModuleRunCandidate: `p0-remediation-rc-02-organization-scope-quota-employee-2026-07-14`

Blocked remainder: migration apply, database access, runtime acceptance, browser/e2e, Provider, dependency, PR, force push and deployment remain blocked.
