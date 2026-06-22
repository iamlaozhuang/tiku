# Paper Student Runtime Guard Package

## Task Goal

Implement the low-risk local service guard so `practice` and `mock_exam` startup reject published `paper` snapshots with illegal question counts before a student runtime session is created or resumed.

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

1. Add focused service tests proving `startPractice` and `startMockExam` reject `paper_snapshot` question counts outside the published paper boundary before creating runtime rows.
2. Reuse the existing published `paper` question-count validator from the `paper` validator/service package.
3. Keep the guard in service startup paths after the published paper is loaded and before authorization/session lookup side effects.
4. Do not change schema, migrations, seeds, repositories, database connections, Provider code, dependencies, dev server, browser/e2e, or runtime acceptance artifacts.

## TDD Order

1. RED: add service tests for empty and 101-question published snapshots in both `practice` and `mock_exam` startup.
2. GREEN: add startup guards using the shared published question-count rule.
3. REFACTOR: keep helper names aligned with glossary terms and existing service structure.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check src\server\services\practice-service.ts src\server\services\practice-service.test.ts src\server\services\mock-exam-service.ts src\server\services\mock-exam-service.test.ts docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-21-paper-student-runtime-guard-package.md docs\05-execution-logs\evidence\2026-06-21-paper-student-runtime-guard-package.md docs\05-execution-logs\audits-reviews\2026-06-21-paper-student-runtime-guard-package.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId paper-student-runtime-guard-package`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId paper-student-runtime-guard-package -SkipRemoteAheadCheck`

## Risk Controls

- Evidence records command summaries only.
- No secrets, tokens, database URLs, Authorization headers, raw DB rows, plaintext `redeem_code`, raw prompts, Provider payloads, private answers, full paper/material content, internal numeric ids, or publicId inventories.
- This task only claims local service/unit closure; runtime acceptance with dev server or browser remains blocked.
