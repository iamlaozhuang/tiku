# Learner/Org Employee AI Direct Route Authorization Guard Repair Evidence

Task id: `learner-org-employee-ai-direct-route-authorization-guard-repair-2026-06-25`

Branch: `codex/ai-direct-route-guard-20260625`

## Scope

Focused source repair for learner AI direct-route authorization guard. No browser runtime, credential read/input, DB,
schema, seed, migration, env, Provider, Cost, staging/prod, payment, external service, dependency, PR, force push, or
final MVP Pass scope.

## Requirement Mapping Result

- Standard personal learners and standard organization employees must not enter advanced learner AI workflow by direct
  `/ai-generation`.
- Advanced personal learners and advanced organization employees must retain learner AI workflow when their
  `effectiveEdition` and AI generation capabilities allow it.
- UI entry hiding is not sufficient; the direct route must enforce effective authorization and capability checks.

## TDD Result

- RED command:
  `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts -t "renders unavailable state for direct AI route access"`
  failed as expected before the guard because direct `/ai-generation` did not consult effective authorization and the
  standard rows could still reach the AI workflow.
- GREEN repair:
  - `StudentPersonalAiGenerationPage` now fetches `/api/v1/authorizations` with the same session boundary and explicit
    `GET`.
  - Initial route load requires at least one `effectiveEdition: "advanced"` authorization context with
    `canGenerateAiQuestion` or `canGenerateAiPaper` before loading histories.
  - Submit flow repeats the same effective authorization check before posting an AI generation request.
  - Missing/failed/standard-only authorization data fails closed into the existing unavailable state.
- Regression coverage:
  - Standard personal learner and standard organization employee authorization contexts render unavailable state.
  - Standard rows stop after `/api/v1/authorizations`; histories and workflow requests are not called.
  - Existing advanced personal learner and advanced organization employee workflow tests remain covered with explicit
    advanced authorization contexts.

## Validation

- `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts -t "renders unavailable state for direct AI route access"`:
  pass after GREEN, 2 passed and 13 skipped.
- `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts`: pass, 15 tests passed.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npx.cmd prettier --check --ignore-unknown ...`: pass.
- `git diff --check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-org-employee-ai-direct-route-authorization-guard-repair-2026-06-25`:
  pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-org-employee-ai-direct-route-authorization-guard-repair-2026-06-25 -SkipRemoteAheadCheck`:
  pass.
- Browser runtime: not executed in this source repair task.
- Credential read/input: not executed in this source repair task.
- DB, seed, schema, migration, env, Provider, Cost, staging/prod, payment, external service, dependency, PR, force push:
  not touched.

## Conclusion

Local source repair validation passed for the learner AI direct-route authorization guard.

Runtime browser rerun is still required as a separate next task before any full 8-row acceptance rerun. No
Standard/Advanced MVP final Pass is claimed.
