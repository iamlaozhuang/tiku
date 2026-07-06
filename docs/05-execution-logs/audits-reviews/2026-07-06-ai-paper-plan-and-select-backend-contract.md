# AI Paper Plan-And-Select Backend Contract Audit Review

## Metadata

- Task id: `ai-paper-plan-and-select-backend-contract-2026-07-06`
- Branch: `codex/ai-paper-plan-and-select-backend-contract-2026-07-06`
- Date: 2026-07-06
- Review mode: adversarial local source review.
- Redaction: this audit records only file paths, role labels, source categories, counts, and command statuses.

## Requirement Mapping Result

- Source of truth used: `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Package boundary: backend contract foundation only.
- Current package does not claim route, UI, Provider, DB-backed runtime, browser, release, production, staging/prod, or Cost Calibration readiness.

## Adversarial Findings

- Finding 1: Initial test fixture used an invalid question type label.
  - Evidence: `npm.cmd run typecheck` rejected the enum value.
  - Root cause: local test fixture did not follow the existing model enum.
  - Resolution: changed the fixture to the existing project enum value.
  - Status: closed by final typecheck pass.
- Finding 2: Task plan promised content admin source coverage, but the first test draft did not separately assert it.
  - Evidence: manual review of focused unit coverage.
  - Resolution: added content admin platform-only assertion.
  - Status: closed by focused unit pass.
- Finding 3: Plan target count could drift from section target totals if not validated.
  - Evidence: contract review against AI组卷 plan semantics.
  - Resolution: added `section_count_mismatch` validation category.
  - Status: closed by focused unit pass.
- Finding 4: The first selector implementation applied exact difficulty matching to all fallback tiers.
  - Evidence: adversarial fixture with difficulty mismatch failed to select nearby-knowledge and same-scope fallback questions.
  - Root cause: shared difficulty predicate was evaluated before match-tier-specific logic.
  - Resolution: exact difficulty is enforced only for exact matches; fallback tiers keep question type and scope constraints while relaxing difficulty.
  - Status: closed by focused unit pass.

## Residual Risks

- Route-integrated Provider parsing and instruction still require a later package; this package only creates a safe contract/service foundation.
- Repository adapters must still map platform available questions and enterprise published training snapshots into the new selector DTO.
- UI must still be updated to show paper container, insufficiency, degradation, source composition, and Chinese user-friendly messages.
- Browser and DB-backed runtime were intentionally not executed in this package.

## Boundary Check

- No dependency, package, lockfile, schema, migration, seed, env, DB runtime, Provider, browser, staging/prod, deploy, or Cost Calibration operation was executed.
- Evidence remains redacted and does not include full question, full paper, material, Provider payload, raw prompt, raw AI output, DB rows, internal ids, credentials, tokens, sessions, cookies, or screenshots.

## Conclusion

- source/unit: pass for the new focused backend contract tests.
- DB-backed runtime: not tested.
- browser: not tested.
- Provider-disabled: not tested.
- Provider-enabled small sample: not tested.
- release readiness: not claimed.
- production usability: not claimed.
- staging: not executed; requires fresh approval.
- Cost Calibration: not executed; requires fresh approval.
