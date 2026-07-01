# Evidence: ai-generation-core-walkthrough-2026-07-01

## Scope

- Branch: `codex/ai-generation-core-walkthrough`
- Task id: `ai-generation-core-walkthrough-2026-07-01`
- Evidence mode: redacted role/route/workflow/status/count/validation summaries only.
- Runtime execution: no browser, no e2e, no Provider, no DB connection, no schema/migration/seed, no `.env*` read.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- all ADR files under `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Static Preflight Summary

Source inspection confirms:

- Content and organization admin AI pages route through the shared admin AI generation entry surface.
- Admin AI history currently has a server-side requested-time descending query, but the target walkthrough contract requires page-level `generationKind`, pagination, and filtering behavior before a complete owner-facing pass can be claimed.
- Learner AI generation uses a separate personal AI generation flow and must be checked for task-type/function-type alignment.
- The existing known owner-preview issues OP-01 through OP-09 map cleanly into the four-layer AI generation matrix.

## Known Issue Mapping

| Issue   | Priority | Matrix area                                         | Baseline status             |
| ------- | -------- | --------------------------------------------------- | --------------------------- |
| `OP-01` | P1       | learner AI 出题 / AI 组卷 semantic contract         | `fail`                      |
| `OP-02` | P2       | AI generation business context                      | `fail_in_empty_baseline`    |
| `OP-03` | P0       | learner and employee active authorization flow      | `blocked_by_existing_issue` |
| `OP-04` | P0       | organization advanced admin AI entry                | `blocked_by_existing_issue` |
| `OP-05` | P1       | content/organization admin level parameter contract | `fail`                      |
| `OP-06` | P1       | AI 出题 quantity and structure result contract      | `fail`                      |
| `OP-07` | P2       | generation feedback and result placement            | `fail`                      |
| `OP-08` | P2       | AI 出题 / AI 组卷 history type isolation            | `fail`                      |
| `OP-09` | P2       | history pagination and filtering                    | `fail`                      |

## Validation Results

Commands executed:

| Command                                                                                                                                                                                       | Result                          | Redacted summary                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd exec -- prettier --write --ignore-unknown <changed-docs-and-state>`                                                                                                                  | pass                            | Changed Markdown/YAML files formatted.                                                                                                                                            |
| `npm.cmd exec -- prettier --check --ignore-unknown <changed-docs-and-state>`                                                                                                                  | pass                            | All matched files use Prettier formatting.                                                                                                                                        |
| `npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/student-personal-ai-generation-ui.test.ts`                                                          | pass                            | 2 focused files, 33 tests passed.                                                                                                                                                 |
| `git diff --check`                                                                                                                                                                            | pass                            | No whitespace errors.                                                                                                                                                             |
| `npm.cmd run lint`                                                                                                                                                                            | pass                            | Lint gate passed.                                                                                                                                                                 |
| `npm.cmd run typecheck`                                                                                                                                                                       | pass                            | Typecheck gate passed.                                                                                                                                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-core-walkthrough-2026-07-01`                     | pass                            | Module Run v2 pre-commit hardening passed.                                                                                                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-core-walkthrough-2026-07-01 -SkipRemoteAheadCheck` | pass after checkpoint alignment | First run detected repository checkpoint drift. `project-state.yaml` repository checkpoint was aligned to the current local/remote `master` head, then the readiness gate passed. |

## Closeout Evidence

- Source/test/runtime files changed: no.
- Documentation/state files changed: yes.
- Browser/e2e executed: no.
- Provider call/configuration executed: no.
- Direct database connection or mutation executed: no.
- Package/lockfile/dependency changed: no.
- Schema/migration/seed changed: no.
- Staging/prod/cloud/deploy executed: no.
- Release readiness/final Pass claimed: no.

## Redaction Check

No passwords, tokens, cookies, sessions, localStorage, Authorization headers, `.env*` contents, DB rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, full question/paper/material/resource/chunk content, screenshots, traces, raw DOM, or HTML dumps are recorded in this evidence.
