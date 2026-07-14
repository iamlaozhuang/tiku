# Content Admin Platform C5 Editor Navigation Recovery Evidence

Date: 2026-07-14

Task: `content-admin-platform-c5-editor-navigation-recovery-2026-07-13`

Baseline: `1e3200c4e733ec8d3a19637b4c121a1bdbb5d4d9`

Profile: R2 / `independent_audit`

## Result

- result: pass
- status: ready_for_closeout
- validationStatus: pass
- reviewStatus: pass
- deploymentExecuted: false
- nextModuleRunCandidate: `content-admin-platform-c6-cumulative-audit-2026-07-13`
- costCalibrationGate: blocked
- Cost Calibration Gate remains blocked.
- threadRolloverGate: not_triggered
- productClosureContribution: partial; C5 closes the two-resource editor navigation/dirty-return contract, while C6 owns
  the fixed full-regression and cumulative Batch C closure.

## Reading Evidence

- status: complete
- conflictsFound: false
- targetSourceReviewed: true
- targetTestsReviewed: true
- analogousImplementationReviewed: true
- requirementsReviewed: C0 wireflow, material/question requirements, P0/PIC, D3 and C1-C4 evidence, ADRs/taste,
  active state, serial plan, standing authorization and PIC ledger
- sourceAndTestsReviewed: both editors, route-enabled list actions, URL/popstate list contract, form dirty state and focused
  editor/list tests

## Validation Evidence

- RED: the first run of `corepack pnpm exec vitest run src/lib/admin-editor-navigation.test.ts
tests/unit/admin-editor-navigation-recovery.test.ts` failed as expected because the codec and hook did not yet exist;
  both suites collected zero tests and reported unresolved imports.
- GREEN/final focused: `corepack pnpm exec vitest run src/lib/admin-editor-navigation.test.ts
tests/unit/admin-editor-navigation-recovery.test.ts tests/unit/admin-question-editor-route.test.ts
tests/unit/admin-material-editor-route.test.ts tests/unit/admin-question-material-ui.test.ts` passed 5 files / 115
  tests. This proves same-family codec rejection, one-shot/stale/invalid snapshots, both editor dirty cancel, confirmed leave,
  Back/Forward sentinel behavior, `beforeunload`, filtered/direct return, lock-race copy cancellation, create/edit/copy
  `returnTo` retention, StrictMode replay, scroll/focus restore, and missing/disabled toolbar fallback.
- `corepack pnpm typecheck`: pass.
- `corepack pnpm lint`: pass with zero errors/warnings.
- changed-files Prettier check: pass.
- `git diff --check`: pass.
- Build: the branch worktree build failed only because Turbopack rejects the intentional external `node_modules` junction
  (`Symlink [project]/node_modules ... points out of the filesystem root`). The exact staged tree was materialized as
  dangling snapshot `9e868bcefdfa96b66439384abc4f5c0c9408c886` in the clean root checkout; `corepack pnpm build` then passed,
  including TypeScript and 92/92 generated static pages. Root returned to master
  `1e3200c4e733ec8d3a19637b4c121a1bdbb5d4d9` clean.
- Recovery Guard and Program Guard: pass; current/next remain canonical C5/C6 and deployment remains blocked.
- Full regression: not additionally triggered. The change is confined to the two content editor/list consumers and a
  narrow codec/hook; it changes no core API runtime, authorization, AI, dependency, build configuration or test
  infrastructure. C6 is the immediately following fixed full-regression node.

Recorded validation commands:

- `npm.cmd run test:unit -- src/lib/admin-editor-navigation.test.ts tests/unit/admin-editor-navigation-recovery.test.ts tests/unit/admin-question-editor-route.test.ts tests/unit/admin-material-editor-route.test.ts tests/unit/admin-question-material-ui.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check --ignore-unknown C5_CHANGED_FILES`
- `npm.cmd run build` (known worktree junction failure, then authoritative clean-root detached snapshot pass)
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformRecoverySurface.ps1 -RepositoryRoot .`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-platform-c5-editor-navigation-recovery-2026-07-13`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-admin-platform-c5-editor-navigation-recovery-2026-07-13`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-platform-c5-editor-navigation-recovery-2026-07-13 -SkipRemoteAheadCheck`

## Implemented Contract

- List create/edit/copy entries now append exactly one validated same-family `returnTo` and write only version, timestamp,
  canonical list URL, finite scroll and `create`/`edit:[publicId]` identity to resource-scoped `sessionStorage`.
- The decoder rejects absolute/protocol-relative/cross-family/editor/fragment/unknown/duplicate/malformed targets and
  numeric-only external identifiers; invalid direct links fall back to the correct family list root.
- Both dedicated forms report their existing clean/dirty fingerprint to a narrow navigation guard. Dirty return/cancel,
  copy transitions and browser history require explicit discard; refresh/tab close uses `beforeunload`; failed save/copy
  preserves authored input and successful save/create does not replay POST.
- Return restoration consumes the snapshot once after list readiness, preserves URL-owned filters, restores scroll and the
  initiating control, and falls back to the list toolbar for missing, disconnected or disabled targets. React StrictMode
  effect replay cannot consume-and-cancel the one-shot restoration.
- No API/service/schema/database/dependency/authorization/AI/credential/provider/deployment behavior changed.

## Round 1 — Correctness, Data Integrity, Requirements, And Contracts

- result: pass_after_fixes
- Findings fixed: a 30-minute snapshot window could expire during legitimate long-form editing, so the bounded stale
  window is 24 hours; numeric-only identifiers are rejected at the external route boundary; filtered direct return and
  dirty lock-race copy cancellation received product-page tests.
- The unchanged API remains authoritative for create/update/copy/lock/authorization. No content, token, role, auth or
  private payload is persisted by the recovery record.

## Round 2 — Regression, Privilege, Exceptional Paths, Consistency, And Over-Design

- result: pass_after_fixes
- Findings fixed: malformed percent escapes are rejected; duplicate navigation is suppressed; a now-disabled edit target
  falls back to the toolbar; and the one-shot record survives React StrictMode effect cleanup/replay without double
  restore. Invalid mounted list URLs discard rather than retain recovery state.
- D3 popstate/filter/focus regressions, both C1-C4 editor suites and lock/copy paths remain green. The design remains two
  pure files plus explicit consumers, with no universal router/form framework or protected-domain expansion.
