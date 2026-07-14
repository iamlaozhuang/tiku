# Content Admin Platform F1 Content-Admin Acceptance Evidence

Date: 2026-07-14

Task: `content-admin-platform-f1-content-admin-acceptance-2026-07-13`

Baseline: `2659e674fab4a1ff7a9ac16289d13f7ae2f7fe17`

Profile: R3 / `independent_audit`

## Result

- result: pass
- status: ready_for_closeout
- validationStatus: pass
- reviewStatus: pass
- deploymentExecuted: false
- providerCallExecuted: false
- generationSubmitExecuted: false
- formalAdoptionMutationExecuted: false
- businessDataMutationExecuted: false
- productSourceOrTestChanged: false
- approvedExceptionCount: 0
- nextModuleRunCandidate: `content-admin-platform-f2-operations-super-admin-acceptance-2026-07-13`
- costCalibrationGate: blocked
- threadRolloverGate: not_triggered

Cost Calibration Gate remains blocked.

## Reading Evidence

- status: complete
- conflictsFound: false
- targetSourceReviewed: true
- targetTestsReviewed: true
- analogousImplementationReviewed: true
- requirementsReviewed: standard content/paper/resource/RAG requirements; advanced index and edition-aware authorization;
  ADR-007; current AI traceability and supersession baseline; B-F plan/authorization; PIC ledger; E0/E1/F0 and latest
  0704 content AI/non-AI acceptance evidence/audits
- sourceReviewed: content route entrypoints and runtime clients for question/material, paper/composer,
  resource/knowledge and AI generation; role/session/availability boundaries; corresponding focused test catalogues
- analogousImplementation: E1 content-family proof and E2 role-family acceptance conventions
- boundaryConclusion: F1 is a validation-only localhost task. It changes no product source, test, API, lifecycle,
  authorization, Provider, database, dependency, configuration or deployment behavior.

## Controlled Runtime And Credential Boundary

- The canonical private index and catalog were read in the mandated order. Their SHA-256 identifiers were
  `b268cea4747f65c9a0cfda28f32c52d178a4441b17ca8e028d63d573a8fa699b` and
  `4e50e3b8f73c04a49493e251cb497b73375ebf50b8fa7f6c666025bb446d76e1`; credential values stayed in process memory.
- The catalog `content_admin` row was `ready_0704_verified`; one login redirected to `/content/overview` without retry.
- The localhost process used the canonical 0704DB label by process-only override with `AI_PROVIDER_ENABLED=false`.
  `.env.local` was never written and its last-write timestamp predates F1.
- The runtime used E6's passed 92-route production build. This is source-equivalent: the exact E6-to-F1 committed range
  contains governance docs only, and F1 has no product-source/config diff.
- One temporary product session was revoked successfully; the subsequent session read failed closed. Browser data,
  browser process, port `3115`, private runtime files and worktree build cache were cleaned.
- No credential, phone, cookie, token, session, env/DB value, identifier, row, private content, generated content,
  screenshot, snapshot, DOM or trace entered repository artifacts or retained logs.

## Representative Browser Acceptance

Playwright CLI drove one isolated `content_admin` browser session. Assertions were retained only as safe aggregate
results; no browser artifact was kept.

| Surface         | Result | Representative proof                                                                                        |
| --------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| questions       | pass   | non-empty list, read-only detail Drawer, clean `/content/questions/new` form entry and return               |
| materials       | pass   | non-empty list, read-only detail Drawer, clean `/content/materials/new` form entry and return               |
| papers          | pass   | non-empty list, read-only detail route and one enabled draft composer entry                                 |
| resources       | pass   | truthful `暂无资料与知识库数据`, visible upload affordance, local panel open/close without submit           |
| knowledge nodes | pass   | non-empty tree, lifecycle band, node selection and read-only relation detail                                |
| AI question     | pass   | Provider-closed envelope/UI, disabled submit, non-empty history, review traceability and formal-draft state |
| AI paper        | pass   | Provider-closed envelope/UI, disabled submit, non-empty history, review traceability and formal-draft state |

Additional adversarial browser proof:

- seven content routes at 1440x900 had no page-level horizontal overflow;
- the question detail Drawer captured focus, closed by Escape and restored focus to its initiating control;
- direct `/ops/redeem-codes` access failed closed to `/content/overview` for `content_admin`;
- unexpected console error count: `0`; request-failure count: `0`;
- generation submits, formal-adoption writes, Provider calls and all other business mutations: `0`.

## Validation

- focused unit regression: pass; 11 files / 189 tests with one worker. Coverage includes question/material list and
  dedicated editors, paper list/composer, resource/knowledge empty/detail/lifecycle boundaries, content AI
  history/review/availability and workspace role guards.
- lint: pass; warning-free authoritative serial run.
- typecheck: pass; authoritative serial run after lint.
- changed-file Prettier: pass.
- `git diff --check`: pass.
- recovery/Program Guard: pass with F1 current and F2 unique next.
- Module Run pre-commit, closeout and pre-push gates: pass.
- build/full regression: not triggered. F1 changed only governance state/evidence, did not touch product/test/config or
  any M1 impact-trigger domain, and is not a fixed full node.
- X1: not triggered; personal historical `paperAssembly` is outside F1 and no content acceptance step required it.
- X2: not triggered; no current-master product failure was found.

Recorded validation commands:

- redacted Playwright CLI content-admin localhost representative route and interaction acceptance
- redacted process-only 0704DB Provider-closed, logout and cleanup verification
- `node D:\tiku\node_modules\vitest\vitest.mjs run --maxWorkers=1 tests/unit/admin-question-material-ui.test.ts tests/unit/admin-question-editor-route.test.ts tests/unit/admin-material-editor-route.test.ts tests/unit/admin-paper-ui.test.ts src/features/admin/paper-composer/AdminPaperComposerPage.test.tsx tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/admin-resource-knowledge-ui-layout.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/ai-generation-availability-route.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `node D:\tiku\node_modules\prettier\bin\prettier.cjs --check F1_CHANGED_DOCS`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformRecoverySurface.ps1 -RepositoryRoot .`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-platform-f1-content-admin-acceptance-2026-07-13`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-admin-platform-f1-content-admin-acceptance-2026-07-13`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-platform-f1-content-admin-acceptance-2026-07-13 -SkipRemoteAheadCheck`

## Local Dependency Restoration Diagnostic

- The first focused run executed zero tests because 99 package targets under the local pnpm virtual store were empty;
  `jsdom` and Next failed before product code on missing existing transitive packages.
- pnpm v11 also correctly rejected a frozen reinstall while the repository's existing overrides remained only in the
  now-ignored `package.json#pnpm` location. No non-frozen install was used.
- For local restoration only, the exact eight lockfile overrides were temporarily mirrored into `pnpm-workspace.yaml`,
  the corrupt `node_modules` was isolated, and an offline frozen install reused 741/741 packages with zero downloads.
  The temporary workspace block and corrupt backup were then removed.
- Final `package.json`, `pnpm-lock.yaml` and `pnpm-workspace.yaml` match Git exactly. No package was added, removed,
  upgraded or committed. The rerun executed all 189 tests, so the infrastructure failure was not misreported as a test
  result and does not qualify as X2 product failure.

## PIC And Route-Family Accounting

- Question/material list, detail and clean editor entries now have representative F1 role proof in addition to the
  closed B/D/C implementation and regression proof; the content route family is compliant.
- PIC-01/04/05/08/10/11/12/13 gain F1 representative acceptance proof. Focused regression protects the closed
  PIC-02/03/06/07/09 contracts without reopening or globally reclassifying them.
- Global Program PIC reconciliation remains assigned to F5. The approved exception ledger remains empty.

## Adversarial Review Summary

- Round 1 attacked 0704 target/role correctness, content data integrity, list/detail/editor/composer contracts, truthful
  empty/resource state, knowledge ownership, AI draft/review/formal separation and Provider closure. All seven matrix
  rows passed without business mutation.
- Round 2 attacked regression, workspace escalation, browser/request errors, page overflow, keyboard focus, stale
  session, sensitive artifacts, dependency false positives and over-claiming. Fail-closed redirect, focus restoration,
  zero console/request errors, cleanup and focused/static gates leave no blocker.
- Independent audit:
  `docs/05-execution-logs/audits-reviews/2026-07-14-content-admin-platform-f1-content-admin-acceptance-audit.md`.

## Closeout Intent

One principal docs/state commit; ff-only merge to `master`; ordinary push to `origin/master`; remote equality
verification; short branch/worktree cleanup; no deployment. F2 starts automatically.
