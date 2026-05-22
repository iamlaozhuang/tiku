# Phase 8 Student Profile And Redeem UI Evidence

## Metadata

- Task id: `phase-8-student-profile-redeem-ui`
- Branch: `codex/phase-8-student-profile-redeem-ui`
- Base: `master`
- Head at recovery: `47a59e2`
- Evidence created at: `2026-05-22T15:20:00+08:00`

## Recovery And Readiness

- Read required project instructions, code taste commandments, document management, local CI, testing/TDD standard, ADRs, runtime slice contract, Phase 8 product surface contract, MVP roadmap, automation SOP, dependency gate, security review gate, project state, task queue, and latest authorization/redeem runtime evidence.
- `git status --short --branch`: `## master...origin/master`, clean.
- `git log -5 --oneline`: latest `47a59e2 docs(agent): close phase 8 authorization redeem runtime`.
- `git branch --list`: only `master`.
- `git branch -r`: `origin/HEAD -> origin/master`, `origin/master`.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass; no tracked, staged, untracked, or upstream differences.
- Created branch: `codex/phase-8-student-profile-redeem-ui`.
- `Test-TaskClaimReadiness.ps1 -TaskId phase-8-student-profile-redeem-ui`: pass on task branch.

## Scope

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-22-phase-8-student-profile-redeem-ui.md`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-student-profile-redeem-ui.md`
- `src/app/(student)/profile/**`
- `src/app/(student)/redeem-code/**`
- `src/app/(student)/home/**`
- `src/features/student/**`
- `tests/unit/**`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## TDD Evidence

- Added `tests/unit/student-profile-redeem-ui.test.ts` before implementation.
- RED run: `npm.cmd run test:unit -- tests/unit/student-profile-redeem-ui.test.ts` failed because `@/features/student/profile/StudentProfileRedeemPage` did not exist.
- GREEN focused run: `npm.cmd run test:unit -- tests/unit/student-profile-redeem-ui.test.ts` passed, `1` file and `4` tests passed.
- Regression run for changed home entrypoint: `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts` passed, `1` file and `4` tests passed.

## Implementation Summary

- Added `src/features/student/profile/StudentProfileRedeemPage.tsx` with:
  - `StudentProfilePage` reading the local session runtime, effective authorization list, and personal authorization list through `/api/v1/sessions`, `/api/v1/authorizations`, and `/api/v1/personal-auths`;
  - `StudentRedeemCodePage` reading `/api/v1/personal-auths` and submitting `/api/v1/redeem-codes/redeem` with a private bearer token from `localStorage`;
  - explicit loading, unauthorized, error, empty, success, and contract-safe failure states;
  - client-side redeem-code normalization using the server-compatible 8-character code shape.
- Added routes:
  - `src/app/(student)/profile/page.tsx`
  - `src/app/(student)/redeem-code/page.tsx`
- Updated `src/features/student/home/StudentHomePage.tsx` to expose MVP-visible links for `/profile` and `/redeem-code`.
- Extended `e2e/local-business-flow.spec.ts` to verify profile and redeem-code browser flow after student login.
- No package, lockfile, `.env.example`, schema, migration, or `drizzle/**` changes.

## Security And Privacy Review

- Separate security review artifact: not required by queue metadata; reviewed in evidence because this is a frontend-only UI task and does not create or change API/runtime authorization behavior.
- Auth/session boundary: UI reads existing local session token from `localStorage` and sends it only as `Authorization: Bearer ...` to existing Phase 8 APIs.
- Data exposure: UI does not render session token, password, secret, API key, `code_hash`, raw internal errors, or numeric database `id`.
- API contract: UI consumes standard `{ code, message, data }` envelopes and maps redeem failures to fixed Chinese, contract-safe messages.
- Authorization boundary: protected UI shows an unauthorized state when no session token or a `401001` envelope is returned; it does not fabricate authorized data.
- Verdict: `APPROVE` with residual risks listed below.

## Validation

- `npm.cmd run test:unit -- tests/unit/student-profile-redeem-ui.test.ts`: RED before implementation, failed on missing module.
- `npm.cmd run test:unit -- tests/unit/student-profile-redeem-ui.test.ts`: pass, `1` file passed, `4` tests passed.
- `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts`: pass, `1` file passed, `4` tests passed.
- `npm.cmd run test:unit`: pass, `91` files passed, `306` tests passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: first failed at `lint` because `setLoadState` was called synchronously in `useEffect`; fixed by moving token checks into async loaders.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: second failed at `typecheck` because `payload.data` was still possibly null in a state updater closure; fixed by narrowing to `redeemedPersonalAuth`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: third failed at `format:check`; ran project Prettier on task files.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: pass.
  - `lint`: pass.
  - `typecheck`: pass.
  - `test:unit`: pass, `91` files passed, `306` tests passed.
  - `format:check`: pass.
- `npm.cmd run build`: pass; Next.js route output includes `/profile` and `/redeem-code`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; expected task-scoped uncommitted files listed.

## Browser And E2E Evidence

- `npm.cmd run test:e2e`: pass, `2` Chromium tests passed.
- Browser routes verified through Playwright fallback via repository E2E:
  - `/home` exposes links to `/profile` and `/redeem-code`.
  - `/profile` renders profile and authorization sections after login.
  - `/redeem-code` renders the redeem form after login.
  - Submitting a valid-shaped nonexistent code displays `兑换码不存在`.
  - Page body does not contain the local session token and does not show `兑换成功` on failed redeem.

## Git Closeout

- implementationCommit: `c5d888f feat(student): add profile redeem ui`
- merge: `711f9b6 merge: phase 8 student profile redeem ui`
- master validation:
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: pass on `master`.
    - `lint`: pass.
    - `typecheck`: pass.
    - `test:unit`: pass, `91` files passed, `306` tests passed.
    - `format:check`: pass.
  - `npm.cmd run build`: pass on `master`; route output includes `/profile` and `/redeem-code`.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass on `master`.
  - `npm.cmd run test:e2e`: pass on `master`, `2` Chromium tests passed.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass on `master`, ahead of `origin/master` by implementation and merge commits before closeout evidence commit.
- push: pending.
- cleanup: pending.
- closeoutEvidenceCommit: pending.

## Residual Risk

- The new UI depends on the Phase 8 APIs and local session token already established by the login UI; it does not add server redirects or middleware.
- E2E uses a nonexistent valid-shaped redeem code to avoid mutating dev seed state; successful redeem mutation remains covered by unit/API runtime tests from `phase-8-student-authorization-redeem-runtime`.
- The student home paper list remains fixture-backed; this task only adds MVP-visible profile/redeem navigation there because full home runtime hydration is outside the allowed task scope.
