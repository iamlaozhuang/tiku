# Content Admin Platform C4 Material Edit Copy Lock Evidence

Date: 2026-07-13

Task: `content-admin-platform-c4-material-edit-copy-lock-2026-07-13`

Baseline: `7ac6125dddd912f8f6337b5db037940c1354a9b6`

Profile: R2 / `independent_audit`

## Result

- result: pass
- status: complete
- validationStatus: pass
- reviewStatus: pass
- deploymentExecuted: false
- productRuntimeChanged: true
- productTestsChanged: true
- productClosureContribution: partial; closes material create/edit/copy/lock routes while C5 retains navigation recovery
  and C6 retains cumulative closure
- nextModuleRunCandidate: `content-admin-platform-c5-editor-navigation-recovery-2026-07-13`
- costCalibrationGate: blocked
- Cost Calibration Gate remains blocked.
- threadRolloverGate: not_triggered

## Reading Evidence

- status: complete
- conflictsFound: false
- targetSourceReviewed: true
- targetTestsReviewed: true
- analogousImplementationReviewed: true
- requirementsReviewed: material/content-admin requirements, P0/PIC contract, C0 route decision, C3 evidence, ADRs/taste,
  active state, queue, serial plan, standing authorization and PIC ledger
- sourceAndTestsReviewed: material editor/list form, content-integrity/form contracts, session runtime, detail/update/copy
  API/DTO/service guards, question edit analogue, and focused material tests

## Validation Evidence

- RED: the expanded 13-test editor suite failed 8 cases against the C3 baseline: create still stopped at staged
  completion, edit props were ignored, locked/missing/race states mounted the create form, and product list edit/copy did
  not navigate. These failures preceded product implementation.
- GREEN/focused unit: 4 files / 68 tests passed. The 13-test editor suite proves create-to-edit replace, unlocked
  GET/PATCH/reset, locked no-form deep link, explicit copy-to-returned edit route, copy failure recovery, lock-race input
  retention and PATCH blocking, missing/unauthorized safe return, and product list edit/copy routing. Existing 50-case
  question/material UI and material API/service suites remained green.
- lint: pass.
- typecheck: pass.
- changed-file Prettier and `git diff --check`: pass.
- production build: pass on clean root detached C4 snapshot `0638e93c1aca58b0b7ef8ee693a7c1f7959ed9ef`; the
  worktree attempt failed only because Turbopack rejects the external `node_modules` junction. The authoritative build
  compiled, typechecked, generated all 92 pages, and registered dynamic `/content/materials/[publicId]/edit`.
- full regression: not run under R2 impact-trigger policy. The shared material client was covered by its complete focused
  50-case UI suite plus route/service suites; no authorization, AI, dependency, build/test infrastructure or fixed full
  node changed. C6 remains the next fixed full node.

Recorded validation commands:

- `npm.cmd run test:unit -- tests/unit/admin-material-editor-route.test.ts` (intentional RED, then GREEN)
- `npm.cmd run test:unit -- tests/unit/admin-material-editor-route.test.ts tests/unit/admin-question-material-ui.test.ts src/server/services/material-route.test.ts src/server/services/material-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check --ignore-unknown C4_CHANGED_FILES`
- `npm.cmd run build` (known worktree junction failure, then authoritative clean-root detached snapshot pass)
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformRecoverySurface.ps1 -RepositoryRoot .`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-platform-c4-material-edit-copy-lock-2026-07-13`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-admin-platform-c4-material-edit-copy-lock-2026-07-13`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-platform-c4-material-edit-copy-lock-2026-07-13 -SkipRemoteAheadCheck`

## Round 1 — Correctness, Data Integrity, Requirements, And Contracts

- result: pass
- Attacked route/public-id identity, detail mapping, PATCH payload/status, material semantic validation, service lock
  authority, explicit copy mutation, create/edit refresh behavior, missing/forbidden mapping and dirty-baseline reset.
- Finding fixed: the first missing-state mapping copied question code `404202`; material service SSOT uses `404201`. The
  route and focused missing-material test now use `404201`, preventing valid missing responses from becoming generic
  load errors.
- No blocking finding remains. Locked initial detail never mounts the form, lock-race input stays mounted but PATCH is
  disabled, and all edit/copy navigation uses only server-returned or list DTO public ids.

## Round 2 — Regression, Privilege, Exceptional Paths, Consistency, And Over-Design

- result: pass
- Attacked list/question regression, router availability, duplicate copy/disable actions, expired session, copy/network
  failure, unavailable material, privilege confusion, read-only Drawer preservation, cross-resource consistency and
  over-design.
- Finding fixed: adding `useRouter` unconditionally to the shared list component broke all 49 router-free focused
  consumers. Routing is now isolated in `MaterialListWithEditorRoutes`, mounted only by the two product pages that enable
  canonical routes; all 50 legacy/shared UI cases pass.
- No blocking finding remains. API/service authorization, published-reference locks, disable semantics, database,
  dependencies, AI, credentials, exception ledger and deployment are unchanged.

## Closeout Intent

One principal commit; ff-only merge to `master`; ordinary push to `origin/master`; exact remote verification;
short-branch/worktree cleanup; no deployment. C5 starts automatically.

Verdict: APPROVE
