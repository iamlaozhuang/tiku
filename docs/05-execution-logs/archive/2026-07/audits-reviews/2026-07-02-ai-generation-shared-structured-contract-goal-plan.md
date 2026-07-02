# AI generation shared structured contract goal plan audit review

## Scope Review

- Task id: `ai-generation-shared-structured-contract-goal-plan-2026-07-02`
- Scope: create the next-phase goal, child task templates, acceptance standards, and queue/state materialization.
- Source/runtime/test code changed: false.
- Provider, DB, browser, dependency, schema, migration, seed, staging/prod/deploy, PR, force push, Cost Calibration, release readiness, and final Pass were not executed.

## Adversarial Checks

- Root-cause control: the plan does not assume another Provider rerun will fix the issue; it requires deterministic contract repair first.
- Reuse control: the plan identifies existing shared services and requires new work to reuse them before adding role-specific logic.
- Regression control: every source child task must add failing tests first and close with focused tests plus Module Run v2 gates.
- Provider budget control: real Provider execution is isolated to the final rerun task and blocked until deterministic rollup passes.
- Evidence control: no credential, cookie, token, session, Authorization header, `.env*` value, DB raw row, internal numeric id, PII, Provider payload, prompt, raw AI output, full material/chunk/question/paper content, raw DOM, screenshot, trace, or localStorage value is recorded.
- Scope creep control: AI组卷 question-count repair is represented as a future source/test child task, not silently bundled into this planning task.

## Findings

- The goal is appropriate because the remaining failures are contract and parser determinism issues, not only data coverage issues.
- The child task order is intentionally serial: task spec first, parser second, instruction reuse third, route alignment fourth, UI matrix fifth, rollup sixth, real Provider rerun seventh.
- The most important regression guard is keeping real Provider reruns behind mocked-provider deterministic route and UI gates.

## Recommendation

- Start with `ai-generation-shared-task-spec-contract-2026-07-02`.
- Do not execute the bounded real Provider rerun until the deterministic rollup task is closed with passing evidence.
