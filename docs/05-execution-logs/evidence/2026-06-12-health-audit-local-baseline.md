# Health Audit Local Baseline Evidence

## Summary

- Task id: `health-audit-local-baseline`
- Branch: `codex/health-audit-local-baseline`
- Task kind: `read_only/docs_only audit`
- Date: 2026-06-12
- Decision: `continue_with_p1_followups`
- Highest local validation level reached: L2 local build diagnostic. After restoring the local `node_modules` install from the existing `pnpm-lock.yaml`, `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build`, and Git whitespace checks passed. No e2e was run.

This batch produced a docs-only implementation health audit. It did not modify product code, tests, e2e specs, dependencies, lockfiles, schema, migrations, env files, provider configuration, deployment configuration, payment, external service, or Cost Calibration Gate surfaces.

## Scope And Redaction

Changed files:

- `docs/05-execution-logs/task-plans/2026-06-12-health-audit-local-baseline.md`
- `docs/05-execution-logs/evidence/2026-06-12-health-audit-local-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-health-audit-local-baseline.md`

Blocked work preserved:

- No `src/**`, `tests/**`, `e2e/**`, `package.json`, lockfile, `src/db/schema/**`, `drizzle/**`, `.env*`, provider, deploy, payment, external-service, schema, migration, dependency declaration, full e2e, or Cost Calibration Gate work.
- Local `node_modules` was restored from the existing lockfile with Corepack/pnpm because the checkout had an incomplete install. This did not change `package.json` or `pnpm-lock.yaml`.
- `.env.local` was not read or recorded. Build output mentioned `.env.local` presence only; no values were opened or copied into evidence.

## Entry Evidence

- `git status --short --branch`: clean on `master...origin/master` before branch creation.
- Created branch: `codex/health-audit-local-baseline`.
- Entry SHA: `a6a520bd39297776a86d5220117cddea54be76c4`.
- `origin/master` SHA: `a6a520bd39297776a86d5220117cddea54be76c4`.
- Required docs read: `AGENTS.md`, code taste rules, ADR-001 through ADR-005, task lifecycle SOP, local-first validation SOP, dependency gate SOP, `project-state.yaml`, and `task-queue.yaml`.

## Static Audit Findings

### Info: Local dependency install was incomplete and recovered

Evidence:

- `npm.cmd run lint`: failed before linting source because `eslint` was not recognized.
- `npm.cmd run typecheck`: failed before typechecking through npm because `tsc` was not recognized.
- `Test-Path node_modules`: `True`.
- `Test-Path node_modules\.bin`: `False`.
- `pnpm.cmd --version`: failed because `pnpm.cmd` is not on PATH.
- `Test-Path node_modules\eslint`: `True`; `Test-Path node_modules\typescript`: `True`.
- Direct `node .\node_modules\typescript\bin\tsc --noEmit`: passed.
- Direct `node .\node_modules\eslint\bin\eslint.js`: failed while loading ESLint config because `@babel/core` could not be resolved.
- Direct `node .\node_modules\next\dist\bin\next build`: failed while building CSS because `picocolors` could not be resolved.
- `pnpm-lock.yaml` references `picocolors@1.1.1`, but `Test-Path node_modules\picocolors` returned `False`.
- First commit attempt: Module Run v2 pre-commit hardening scope scan passed, then Husky failed because `lint-staged` was not recognized.
- `corepack pnpm --version`: `10.33.4`.
- `corepack pnpm install --frozen-lockfile`: failed because the existing `node_modules/.pnpm/@babel+parser@7.29.3/.../package.json` was missing.
- `corepack pnpm install --frozen-lockfile --force`: passed, reused lockfile-resolved packages, ran `prepare$ husky`, and did not change tracked package or lock files.
- After local dependency restoration:
  - `npm.cmd run lint`: passed.
  - `npm.cmd run typecheck`: passed.
  - `npm.cmd run build`: passed.

Risk:

- The original failure class was local install corruption, not a confirmed product-code regression.
- Future fresh checkouts should use the declared package manager through Corepack and existing lockfile before claiming local gate failures.

Follow-up:

- No product-code follow-up is required for this batch. This working copy was recovered without package or lockfile changes.

### P1: ADR/dependency reality drift needs explicit reconciliation

Evidence:

- `package.json:30`: `next` is `16.2.6`.
- `package.json:32`: `react` is `19.2.4`.
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md:34`: ADR records Next.js 15.
- ADR-001 records Vercel AI SDK packages (`ai`, `@ai-sdk/alibaba`) and `@langchain/textsplitters`.
- `package.json` scan did not find `ai`, `@ai-sdk/*`, `react-markdown`, `rehype-katex`, `remark-math`, or `@langchain/textsplitters`.

Risk:

- The repository may be intentionally ahead of ADR-001, or ADR-001 may be stale. Either way, implementers cannot treat ADR-001 as fully authoritative for runtime/dependency choices until reconciled.

Follow-up:

- `docs/adr-runtime-dependency-alignment`: decide whether current dependency reality supersedes ADR-001 or whether dependency work remains intentionally deferred.

### P1: API error envelope usage is inconsistent across route runtimes

Evidence:

- `src/server/services/route-error-response.ts:6` defines `createRouteHandlerWithErrorEnvelope`.
- `rg -l "Response\.json\(" src\server\services src\app\api` found 26 files.
- `rg -l "createRouteHandlerWithErrorEnvelope" src\server\services src\app\api` found 8 files.
- Example wrapped routes: `src/server/services/redeem-code-route.ts`, `src/server/services/mock-exam-route.ts`, `src/server/services/student-paper-route.ts`.
- Example unwrapped helper usage: `src/server/services/admin-ai-audit-log-ops-route.ts:19`, `src/server/services/admin-flow-runtime.ts:81`, `src/server/services/contact-config-service.ts:100`.

Risk:

- Some unexpected runtime exceptions may bypass the standard `{ code, message, data }` error envelope, depending on which route runtime is used.
- This audit did not prove a failing endpoint; it identifies an implementation consistency risk.

Follow-up:

- `fix/api-error-envelope-consistency`: audit route handler factories and standardize exception wrapping where appropriate.

### P1: Playwright can reuse a stale local dev server

Evidence:

- `playwright.config.ts:14`: `reuseExistingServer: !process.env.CI`.
- Historical evidence also records stale server reuse causing a browser verification false signal.

Risk:

- Local e2e validation can pass or fail against an old runtime on `127.0.0.1:3000`, weakening L5 evidence.

Follow-up:

- `fix/playwright-stale-server-risk`: require a fresh dev server for task-scoped e2e or add a preflight that proves the server maps to the current checkout.

### P1: Client/server boundary has concrete value-import risk

Evidence:

- `rg "@/server/contracts|@/server/models" src\features src\components src\app` found 71 matches.
- Many matches are `import type`, which is acceptable as type-only coupling.
- Concrete value import in client components:
  - `src/features/student/profile/StudentProfileRedeemPage.tsx:1`: `"use client"`.
  - `src/features/student/profile/StudentProfileRedeemPage.tsx:25`: imports `LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG` from `@/server/contracts/contact-config-contract`.
  - `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx:1`: `"use client"`.
  - `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx:33`: imports `LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG` from `@/server/contracts/contact-config-contract`.
  - `src/server/contracts/contact-config-contract.ts:32`: exports the value constant.

Risk:

- Server contract modules can leak runtime values into client bundles if contracts are not split into shared DTO-only modules and server-only runtime modules.
- Current concrete value is not a secret, but the pattern increases future bundle-boundary risk.

Follow-up:

- `fix/client-server-type-boundary`: keep DTO types shared, move client-safe fixture constants behind a shared/client-safe boundary, and prevent server-only values from being imported by `"use client"` modules.

### P2: Sample AI audit display text contains mojibake

Evidence:

- `src/server/services/admin-ai-audit-log-ops-service.ts:112`: garbled provider display text.
- `src/server/services/admin-ai-audit-log-ops-service.ts:116`: garbled model display text.

Risk:

- Admin mock/baseline UI may display broken Chinese text, which weakens product polish and evidence readability.

Follow-up:

- `fix/admin-ai-audit-log-sample-encoding`: replace garbled sample display strings with valid Chinese text and add a small regression assertion if a relevant UI or service test already exists.

### P2: Quality gate freshness record is stale

Evidence:

- `docs/04-agent-system/state/project-state.yaml:292-300` records the last full quality gate date as `2026-06-01`.
- Recent evidence files exist through `2026-06-12`, including `batch-119` through `batch-122` seed evidence.

Risk:

- Project-level health claims should not rely on `project-state.yaml` quality gate data without a fresh local validation run.

Follow-up:

- If project-level state should reflect this branch's fresh L1/L2 evidence, update that record in a dedicated docs/state task rather than mixing it into this audit batch.

## Positive Signals

- API routes under `src/app/api/v1` use kebab-case plural nouns and `[publicId]` route params in the inspected file list. No `[id]` route segment was found in the API tree during this audit.
- No front-end page or component direct Drizzle/database usage was found by scanning for repository, DB schema, `drizzle-orm`, and query method imports under `src/app`, `src/components`, and `src/features`.
- `src/server/contracts/api-response.ts` defines the standard response envelope helpers.
- Code smell scan found only:
  - `src/db/dev-seed.ts:882`: dev seed `console.log`.
  - `src/components/StudentRichText/StudentRichText.tsx:165`: localized `next/no-img-element` suppression.
- Local artifact hygiene is configured:
  - `.gitignore` ignores `.agent/`, `.worktrees/`, `.runtime/`, `/node_modules`, `/.next/`, `/playwright-report`, `/test-results`, and `*.tsbuildinfo`.
  - `eslint.config.mjs` excludes `.worktrees/**`, `.agent/**`, and `docs/05-execution-logs/**`.
  - `tsconfig.json` excludes `node_modules`, `.agent`, and `docs/05-execution-logs`.
  - `.gitattributes` sets `* text=auto eol=lf`.
- `git check-ignore -v` confirmed `.next`, `test-results`, `playwright-report`, `tsconfig.tsbuildinfo`, `node_modules`, `.runtime`, `.agent`, and `.worktrees` are ignored.

## Validation Results

| Command                                             | Result                                             | Classification                        |
| --------------------------------------------------- | -------------------------------------------------- | ------------------------------------- |
| `corepack pnpm install --frozen-lockfile`           | Failed: incomplete existing local install          | Local environment recovery diagnostic |
| `corepack pnpm install --frozen-lockfile --force`   | Passed; no tracked package/lockfile changes        | Local environment recovery            |
| `npm.cmd run lint`                                  | Passed                                             | Required static gate                  |
| `npm.cmd run typecheck`                             | Passed                                             | Required static gate                  |
| `npm.cmd run build`                                 | Passed                                             | Optional local build diagnostic       |
| `git diff --check`                                  | Passed                                             | Worktree whitespace check             |
| `git diff --cached --check`                         | Passed                                             | Staged docs whitespace check          |
| Scoped `prettier --write` on changed docs           | Passed                                             | Docs formatting                       |
| Scoped `prettier --check` on changed docs           | Passed                                             | Docs formatting verification          |
| First `git commit` attempt before dependency repair | Failed after scope scan: `lint-staged` unavailable | Local environment recovery trigger    |

No default full e2e, targeted e2e, headed e2e, e2e UI, provider call, staging/prod/cloud/deploy action, env/secret read, schema/migration, dependency declaration change, package/lockfile mutation, or product-code repair was performed.

## Follow-Up Candidate Tasks

These are candidates for independent queue items. This audit did not mutate `task-queue.yaml` to avoid disrupting the active Module Run v2 queue order.

1. `docs/adr-runtime-dependency-alignment`
2. `fix/api-error-envelope-consistency`
3. `fix/playwright-stale-server-risk`
4. `fix/client-server-type-boundary`
5. `fix/admin-ai-audit-log-sample-encoding`
6. `docs/project-quality-gate-refresh`

## Residual Gaps

- Local L1/L2 gates are fresh for this branch, but project-state's quality gate timestamp remains stale until a dedicated state update task records it.
- E2E was intentionally not run because this task did not declare task-scoped `localE2EValidation`.
- No staging, prod, provider, payment, external-service, or Cost Calibration Gate readiness is claimed.
