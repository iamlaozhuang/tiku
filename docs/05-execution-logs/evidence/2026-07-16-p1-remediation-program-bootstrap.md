# P1 Remediation Program Bootstrap Evidence

Date: 2026-07-16

Task ID: `p1-remediation-program-bootstrap-2026-07-16`

- Evidence status: pass
- Result: pass
- Product remediation claimed: no

## Requirement Mapping Result

Result: pass

The bootstrap changes governance and recovery controls only. Requirement mapping keeps four separate initial authority questions: cross-domain identity uniqueness (F-0001), server-side logout completion (F-0003), registration unit-of-work (F-0129), and concurrent learner single-session issuance (F-0131). No product remediation or finding closure is claimed.

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

The required requirement indexes, relevant advanced-edition authorization sources, auth/student/admin modules and stories, traceability matrices, all ADRs, code-taste rules, state/queue, startup artifacts, P0 evidence patterns, governance SOPs, original audit register, and runtime backlog were reviewed. `SECURITY.md` is absent; security boundaries therefore come from requirements, ADRs, AGENTS, the original finding record, and the security triage/fix contracts.

## Entry Baseline

- Source/master/origin/live: `4cd2792f57d4eea3ac2770598b5490ebcfdead51`
- P0 product static baseline: `e136ca28acde82282a17c65ccfb828a01e872c0b`
- Audit repository HEAD: `a84224fa12ec85b28e6acd945deba2afa28c6c02`, clean
- P1/P2 identities: 125/18; total 143
- Runtime backlog: 21 pending approval-required items
- F-0013: `runtime_evidence_required` + `runtime_hold` + `pending`

## TDD Evidence

- RED: before the guard existed, `Test-P1RemediationSerialProgram.Smoke.ps1` exited non-zero because `Test-P1RemediationSerialProgram.ps1` was missing.
- GREEN: `Test-P1RemediationSerialProgram.Smoke.ps1` exits 0 with `8 positive, 47 negative`.
- Hook RED: the first real commit attempt was blocked because the historical Content Admin recovery guard rejected the legitimate P1 successor keys. A dedicated successor fixture reproduced the same three `TOP_LEVEL_BLOAT` findings.
- Hook GREEN: `Test-ContentAdminPlatformRecoverySurface.Smoke.ps1` exits 0 with `6 positive, 28 negative`, and the real recovery surface passes.
- Hook-environment RED: the second real commit attempt showed that Git for Windows `sh` supplies PowerShell 5.1 with a module path where `Get-FileHash` does not autoload, although the same command resolves in the interactive shell.
- Hook-environment GREEN: all three hash-dependent guards now use a dependency-free .NET SHA-256 helper. The P1 pre-commit, P0 global, and startup-package guards pass when launched by the actual Git `sh` to `powershell.exe` path.
- Cross-repository RED: the next real commit attempt showed that hook-local `GIT_INDEX_FILE` leaked into `git -C D:/tiku-readonly-audit`, making a clean immutable audit repository appear to have the product worktree index.
- Cross-repository GREEN: audit HEAD/status checks now clear Git's documented repository-local environment variables only around audit-repository commands, use `git --no-optional-locks`, and restore the process environment in `finally`. One positive smoke fixture poisons `GIT_INDEX_FILE` with the product index; another confirms a disposable repository's index SHA-256, mtime, and size remain unchanged after the status probe.
- Fresh-master RED: after the bootstrap commit was fast-forwarded locally, Module Run pre-push correctly rejected the task's `in_progress` status because `lastKnownMasterSha` is an ancestor checkpoint rather than the new master tip.
- Closeout-transition GREEN: the P1 guard now permits only the exact same-task `in_progress` -> `ready_for_closeout` projection in project state and queue. At pre-commit the staged set, and at pre-push the tip commit, must contain exactly those two controls; normalized parent/tip files must otherwise be byte-equivalent. The full `origin/master..HEAD` range must also preserve the complete normalized state/queue projection except for the same status change and still passes task allowlist, blocklist, and fresh evidence/audit review gates. Positive pre-commit/pre-push plus negative tip-level and intermediate-commit contract-laundering fixtures pass.
- Successor-status RED: the first fresh-master startup-package check after the valid closeout transition counted only literal `in_progress`, so the single `ready_for_closeout` task was misread as WIP=0.
- Successor-status GREEN: the historical startup guard now parses direct `activeTasks` item blocks only, binds the sole active ID to `currentTaskId`, and uses the same active-status set as the P1 Program guard—`in_progress` or `ready_for_closeout`. Embedded parser fixtures prove a later top-level nested `in_progress` neither inflates WIP nor masks a missing active task; closed startup recovery still requires zero active tasks.
- Negative coverage includes candidate reorder, WIP>1, P2/runtime/F-0013 expansion, approval and scope laundering, stale/pending reviews, ledger identity drift, omitted closeout, invalid remote/ref, redirected stdin, staged delete/rename, task transition, parent-commit review laundering, artifact physical-path alias/escape, historical artifact mutation, parent task contract mutation, fake branch/worktree identity, residual branch/worktree, two-step scope laundering, truncated/tampered startup history, duplicate/quoted/merged/noncanonical YAML keys, arbitrary/comment-poisoned indentation, duplicate critical child keys, and wrapper-based scope changes.

## Round 1 — Root cause and state machine

Result: pass

The main-Agent adversarial pass confirmed exact 125/18/21 identity, canonical candidate order, WIP=1, materialized/completed partition, checkpoint monotonicity, immutable ledger/map/cluster hashes, P2/runtime/F-0013 holds, scope boundaries, actual pre-push remote/ref input, and bootstrap/transition/steady-task/same-task-closeout state paths. It found and repaired marker-only review acceptance, incomplete task-to-finding boundaries, omitted completed-task coverage, staged deletion/rename gaps, cross-commit scope laundering, closeout-status deadlock, and closed-Program recovery-guard incompatibility.

## Round 2 — Approval and recovery

Result: pass

An independent read-only Subagent C review attacked approval laundering, historical evidence rewriting, artifact aliases, fake cleanup metadata, parent task mutation, audit-repository contamination, pre-push stdin/ref binding, successor recovery, YAML split interpretation, duplicate keys, indentation poisoning, wrapper-based scope changes, Git-hook shell compatibility, cross-repository Git environment leakage, optional index writes, and SHA-256 resource disposal. Every blocking review wave was repaired and re-tested. The final narrow reviews verified semantic equivalence to `Get-FileHash`, error visibility, environment restoration, optional-lock suppression, read-only behavior, Windows PowerShell 5.1 compatibility, and leak-free nested disposal. Final independent disposition: `APPROVE`, no blocking finding. The reviewer made no file change and did not touch `D:/tiku-readonly-audit`.

## Validation Results

Result: pass

| Validation                                           | Result | Evidence                                                                              |
| ---------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| P1 Program smoke                                     | pass   | `8 positive, 47 negative`; exit 0                                                     |
| P1 Program guard, manual/pre-commit                  | pass   | canonical state, scope, review, branch/worktree, artifact, and closeout contracts     |
| Content Admin recovery smoke                         | pass   | `6 positive, 28 negative`; exit 0                                                     |
| Content Admin recovery guard                         | pass   | closed legacy history plus exact P1 successor recovery contract                       |
| Git `sh` hook-shell compatibility                    | pass   | P1 pre-commit, P0 global, and startup guards pass through `sh` -> `powershell.exe`    |
| Cross-repository Git environment isolation           | pass   | poisoned product `GIT_INDEX_FILE` cannot alter audit HEAD/status interpretation       |
| Same-task closeout projection                        | pass   | exact pre-commit/pre-push tip passes; task contract laundering is rejected            |
| P1/P2 startup-package guard                          | pass   | 125 P1 + 18 P2; F-0013 runtime hold; 21 runtime items; frozen hashes                  |
| P0 global baseline guard                             | pass   | 35 P0, 143 P1/P2 impacts, 21 runtime items; frozen SHA retained                       |
| P0 serial guard                                      | pass   | closed Program remains valid                                                          |
| Module Run v2 pre-commit/closeout/pre-push readiness | pass   | task-scoped governance anchors and closeout policy accepted                           |
| Scoped Prettier check                                | pass   | changed Markdown/YAML governance files formatted                                      |
| `git diff --check`                                   | pass   | no whitespace error                                                                   |
| Product diff from entry SHA                          | pass   | zero change under `src`, `tests`, `e2e`, schema/migration, package and lockfile paths |
| Audit repository integrity                           | pass   | HEAD `a84224f...`, clean; frozen hashes retained                                      |

### Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1` — pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual` — pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1P2RemediationStartupPackage.ps1` — pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1` — pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationSerialProgram.ps1 -Phase manual` — pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ContentAdminPlatformRecoverySurface.Smoke.ps1` — pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ContentAdminPlatformRecoverySurface.ps1` — pass
- `C:/Program Files/Git/bin/sh.exe -c 'powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase pre_commit'` — pass
- `C:/Program Files/Git/bin/sh.exe -c 'powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1'` — pass
- `C:/Program Files/Git/bin/sh.exe -c 'powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File scripts/agent-system/Test-P1P2RemediationStartupPackage.ps1'` — pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-program-bootstrap-2026-07-16` — pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-program-bootstrap-2026-07-16` — pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-program-bootstrap-2026-07-16 -SkipRemoteAheadCheck` — pass
- `D:/tiku/node_modules/.bin/prettier.cmd --check <changed Markdown/YAML governance files>` — pass
- `git diff --check` — pass
- `git diff --name-only 4cd2792f57d4eea3ac2770598b5490ebcfdead51 -- src tests e2e package.json pnpm-lock.yaml src/db/schema drizzle migrations` — pass with no output

The historical startup guard never executes the ledger/map generator under the successor Program. No dependency, package, lockfile, product source, test, schema, migration, database, Provider, browser/runtime, PR, force-push, or deployment action occurred.

## Thread Rollover Decision

threadRolloverGate: no rollover required for bootstrap closeout; the next task remains within the same approved P1 Program and must be materialized only after predecessor cleanup.

## Next Module Run

nextModuleRunCandidate: `p1-remediation-rc-01-jit-revalidation`

This is a planning/JIT-revalidation candidate, not a materialized implementation task. Program WIP remains 1.

## Blocked Gates

- Cost Calibration Gate remains blocked.
- P2 implementation remains blocked; only later impact recalibration is authorized.
- All 21 runtime validations remain excluded and approval-required.
- F-0013 remains `runtime_evidence_required` + `runtime_hold`.
- PR, deployment, real Provider/vector/database operation, browser/runtime acceptance, force push, and force-with-lease remain blocked.

## Sensitive Evidence Review

No token, cookie, password, database URL, plaintext `redeem_code`, private row, raw protected prompt/answer, or full protected content is recorded.

## 品味合规自检 Checklist

- [x] 1–4 前端/UI：本任务未改 UI、颜色、交互、动效或 Tailwind。
- [x] 5–6 数据库：未改查询、SQL、schema、migration，也未执行数据库操作。
- [x] 7 API：未改 API 或响应结构。
- [x] 8 注释：新增脚本没有解释语句本身的垃圾注释。
- [x] 9 命名：守卫函数、变量、字段和文件名均表达具体职责并遵循项目命名规范。
- [x] 10 不可变性：未直接修改产品状态对象；Program 状态变化由受守卫的 YAML 投影显式记录。

## 2026-07-16 Independent Pre-Push Hotfix Addendum

This addendum does not reopen or rewrite the bootstrap result. After bootstrap reached `ready_for_closeout`, the first successor transition exposed a pre-push ordering deadlock: P1 accepted the governance-only transition while Module Run evaluated the ancestor checkpoint before receiving that proof. The current user separately approved task `p1-prepush-transition-ancestor-gate-hotfix-2026-07-16`, limited to the pre-push hook, P1/Module guards, their smoke tests, and governance evidence.

The hotfix uses no state/queue allowlist expansion. A one-time Module pre-commit bridge is pinned to parent `4806ba0aed4c9e5f85fd65e1a663bda3e73ebce3`, branch `codex/p1-prepush-transition-hotfix`, the existing bootstrap `ready_for_closeout` projection, an exact 14-file set, and a fresh approval artifact absent from the parent commit. Any extra or missing path falls back to the ordinary task allowlist. After the commit, both the parent-SHA and approval-absence conditions are false, so the bridge cannot be reused.

Fresh focused smoke results before final hotfix commit:

- P1 Program guard smoke: `8 positive, 48 negative`; pass after the independent hotfix added dotfile-alias coverage.
- Module Run pre-push readiness smoke: pass.
- Module Run pre-commit hardening smoke: pass, including invalid-approval and extra-product-path hard blocks.

The independent hotfix evidence and review are recorded in:

- `docs/05-execution-logs/evidence/2026-07-16-p1-prepush-transition-hotfix.md`
- `docs/05-execution-logs/audits-reviews/2026-07-16-p1-prepush-transition-hotfix.md`
