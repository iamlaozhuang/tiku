# Paper Legacy Alias Inventory Package

## Task Goal

Inventory and lock the compatibility boundary for legacy `question_type` aliases: `multiple_choice` must remain a
compatibility input for `multi_choice`, and `subjective` must remain a compatibility input for `short_answer`. This task
must not migrate data, remove compatibility, or introduce API output regression.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-06-21-paper-question-count-and-type-policy.md`

## Implementation Approach

1. Add a focused unit inventory test that proves canonical `questionTypeValues` exclude the legacy aliases.
2. Add static source inventory coverage for exact legacy alias usage, allowing only student snapshot normalization and
   student practice/mock_exam runtime compatibility files.
3. Record the inventory boundary in evidence and audit review without exposing raw paper/material content, publicId
   inventories, internal numeric ids, secrets, tokens, Provider payloads, prompts, or cleartext `redeem_code`.

## TDD Order

1. RED: run the new focused inventory test before adding implementation and confirm the missing test file fails.
2. GREEN: add the inventory test and verify current source boundaries pass without production behavior changes.
3. REFACTOR: keep the scanner small, deterministic, and restricted to source files.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/paper-legacy-alias-inventory.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check tests\unit\paper-legacy-alias-inventory.test.ts docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-21-paper-legacy-alias-inventory-package.md docs\05-execution-logs\evidence\2026-06-21-paper-legacy-alias-inventory-package.md docs\05-execution-logs\audits-reviews\2026-06-21-paper-legacy-alias-inventory-package.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId paper-legacy-alias-inventory-package`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId paper-legacy-alias-inventory-package -SkipRemoteAheadCheck`

## Risk Controls

- No alias migration, alias removal, schema, migration, seed, database connection, data mutation, dependency,
  env/secret, Provider, dev server, Browser, Playwright/e2e, deploy, PR, force-push, org_auth runtime, payment,
  external service, or Cost Calibration Gate work.
- Evidence records command summaries and file-level inventory only; it must not include raw DB rows, publicId lists,
  private answers, full material content, prompt text, Provider payloads, secrets, tokens, database URLs, plaintext
  `redeem_code`, or internal numeric ids.
