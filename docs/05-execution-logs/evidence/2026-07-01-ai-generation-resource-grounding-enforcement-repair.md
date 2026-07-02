# Evidence: AI generation resource grounding enforcement repair

## Scope

- Task id: `ai-generation-resource-grounding-enforcement-repair-2026-07-01`
- Branch: `codex/ai-generation-resource-grounding-enforcement-repair`
- Execution type: source/test/docs/state repair.
- Runtime exclusions: no database mutation, Provider runtime call, env access, credential read, browser runtime, dependency change, schema/migration/seed change, staging/prod/cloud/deploy, Cost Calibration, release readiness, or final Pass.

## Redaction Boundary

This evidence records only command names, pass/fail summaries, safe file paths, and safe count summaries. It must not include credentials, tokens, sessions, localStorage values, Authorization headers, `.env*`, database URLs, raw DB rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, complete generated content, screenshots, traces, raw DOM, HTML dumps, or full question/paper/material/resource/chunk content.

## RED

- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts`: failed as expected after adding missing-grounding-resolver tests.
  - Personal route-integrated Provider execution still reached the Provider executor when no grounding resolver was supplied.
  - Admin route-integrated Provider execution still reached the Provider executor when no grounding resolver was supplied.
  - Failure mode confirmed the tests were catching the intended resource/RAG grounding bypass.

## GREEN

- Changed both shared execution paths so missing grounding resolver is treated as insufficient grounding evidence.
- Updated Provider-success tests to explicitly provide sufficient grounding context before credential access and Provider execution.
- Updated admin route fake Provider workflow test fixture to provide sufficient grounding through the shared route-integrated grounding contract.
- Focused result: `6` test files / `62` tests passed after the fix.

## Static Scan

- Grounding gate scan: pass. No old conditional pattern remained where grounding was checked only when a resolver existed.
- Shared execution scan: pass. Admin and personal execution paths now both call the same grounding sufficiency helper before credential access.
- Cross-role AI 出题 / AI组卷 entry scan: pass for source coverage. Shared admin page covers content and organization AI 出题 / AI组卷 routes; shared student page covers personal AI 出题 / AI组卷.
- Ordinary UI wording scan: no ordinary AI generation visible-render copy hit for internal local-preview/governance wording. Hits were limited to sanitizer/test guards and separate ops/diagnostic surfaces outside this task scope.

## Validation

- `npm.cmd exec -- prettier --write --ignore-unknown <changed files>`: pass
- `npm.cmd exec -- prettier --check --ignore-unknown <changed files>`: pass
- `npm.cmd run test:unit -- <focused files>`: pass, `6` files / `62` tests
- `npm.cmd run lint`: pass
- `npm.cmd run typecheck`: pass after fixing test import/type fixture issues
- `git diff --check`: pass
- `Test-ModuleRunV2PreCommitHardening.ps1`: pass
- `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck`: pass

## Closeout

- Source/test changed: true
- Provider call executed: false
- Env file content read or written: false
- Database mutation executed: false
- Schema/migration/seed executed: false
- Dependency/package/lockfile changed: false
- Staging/prod/cloud/deploy executed: false
- Cost Calibration executed: false
- Release readiness claimed: false
- Final Pass claimed: false
