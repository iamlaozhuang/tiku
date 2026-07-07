# 2026-07-07 Explicit 20260704 Localhost Browser Replay Audit Review

## Verdict

`partial_with_blocked_advanced_submit_closure`.

The replay strengthens local evidence for standard-role browser denial, but it does not close the browser-submitted AI组卷 closed-loop gap. The remaining blockers are evidence-boundary and fixture issues, not confirmed current source defects.

## Findings

1. Standard-role browser denial is credible for the sampled organization paths.
   - `org_standard_employee` could not access learner AI generation.
   - `org_standard_admin` could not access organization AI组卷 and showed the standard-unavailable state.

2. Advanced browser submit cannot close under the no-Provider boundary.
   - `personal_advanced_student` AI组卷 submit produced no visible generated content because Provider was disabled by design for this task.
   - Without visible generated content, the browser cannot start the isolated AI learning session.
   - This is not evidence that the learning-session code is broken; direct explicit 20260704 DB-backed replay already passed the underlying direct runtime path.

3. Admin AI组卷 current-submit handoff remains unproven in browser under no-Provider.
   - `org_advanced_admin` and `content_admin` returned business code `409015` and showed error UI.
   - Existing history widgets or prior panels must not be counted as current-submit proof.

4. Fixture coverage is incomplete for a true seven-role browser replay.
   - `personal_standard_student` login material was missing for the explicit 20260704 private fixture set.
   - `org_advanced_employee` private import material did not work as direct session login material under current validation.

## Unsupported Extrapolations

- Do not claim full browser acceptance.
- Do not claim browser-submitted advanced learning-session closure.
- Do not claim browser-submitted admin draft handoff closure.
- Do not claim Provider-enabled browser behavior from this no-Provider replay.
- Do not claim release readiness, production usability, staging, prod, deploy, or Cost Calibration.

## Next Decision

To close the browser gap, choose one of two explicit follow-ups:

- Provider-disabled browser UX acceptance: keep Provider disabled and accept that advanced current-submit ends at clear no-Provider UI; this validates messaging, not generation closed loop.
- Provider-enabled browser bounded submit: with fresh approval, run a tiny browser submit sample for the advanced learner/admin paths and stop before any Cost Calibration interpretation.

Before a full seven-role browser replay, refresh or materialize current 20260704 login fixtures for `personal_standard_student` and `org_advanced_employee`.

## Recovery Audit Addendum

Added after recovery approval on 2026-07-07.

Root cause:

- The browser replay targeted the explicit 20260704 DB, but preflight initially tested historical/default localhost account assumptions against that DB. Those account documents are not portable across DB targets.
- The temporary short runtime workspace used a `node_modules` junction. Cleanup damaged local dependency executable links in the main worktree. This is local environment damage, not a tracked source, package, lockfile, or env change.

Corrective rule:

- Future runtime evidence must bind three facts before execution: DB target label, service port, and account-document family.
- A failed account preflight against a mismatched DB is a fixture-boundary finding, not a product login defect.
- Dependency recovery must reinstall from the existing lockfile only and must not introduce, remove, upgrade, downgrade, or persist dependency changes.

Residual risk:

- The current browser result remains `partial`; it must not be upgraded to full browser acceptance until explicit 20260704-compatible `personal_standard_student` and `org_advanced_employee` login fixtures are refreshed or separately materialized.

Recovery validation verdict:

- Local dependency executable links were restored using the existing lockfile.
- Current pnpm 11.9.0 was tested first because it is the declared `packageManager`, but frozen install failed on historical lock/config compatibility.
- The documented local-CI pnpm 10 frozen install path restored the local toolchain without package, lockfile, workspace, env, source, test, schema, migration, seed, or script changes.
- Lint, typecheck, focused unit tests, diff check, scoped Prettier check, and Module Run v2 pre-commit hardening passed after recovery.
