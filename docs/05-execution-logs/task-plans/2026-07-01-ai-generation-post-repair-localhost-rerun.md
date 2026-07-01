# AI generation post-repair localhost rerun plan

## Task

- Task id: `ai-generation-post-repair-localhost-rerun-2026-07-01`
- Branch: `codex/ai-generation-post-repair-localhost-rerun`
- Scope: docs/state/evidence plus local dev-server, in-app browser, localhost role matrix, and bounded real Provider owner-preview sample.
- Source, tests, dependencies, lockfiles, schema, migration, seed, staging/prod/cloud/deploy, e2e automation, Cost Calibration, release readiness, and final Pass are out of scope.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- All ADR files under `docs/02-architecture/adr/`

## Matrix

| Role                        | Route family           | AI 出题 | AI 组卷 | Notes                                      |
| --------------------------- | ---------------------- | ------- | ------- | ------------------------------------------ |
| `content_admin`             | content AI routes      | rerun   | rerun   | Verify visible result, grounding, history. |
| `org_advanced_admin`        | organization AI routes | rerun   | rerun   | Verify organization advanced workspace.    |
| `personal_advanced_student` | `/ai-generation`       | rerun   | rerun   | Verify learner history/detail wording.     |
| `org_advanced_employee`     | `/ai-generation`       | rerun   | rerun   | Verify employee advanced context.          |

## Checks

- Eligible routes open without the previous authorization/edition blockers.
- Cross-role route inventory is checked before manual rerun so every AI 出题 / AI 组卷 surface affected by learner, employee, organization admin, and content admin flows is either exercised or explicitly marked not applicable.
- Grounding state is business-facing and does not claim success when evidence is insufficient.
- Resource-package/RAG grounding is checked on every exercised surface: generation must be constrained by selected `profession`, `level`, `subject`, and `knowledge_node` evidence; insufficient evidence must block or clearly explain business insufficiency instead of allowing generic model output.
- Visible generated result appears near the action surface.
- History is separated by `generationKind` or `taskType`, newest first where exposed.
- Ordinary AI UI does not show technical/governance wording such as local-contract, redaction, internal status enums, raw field names, or schema identifiers.
- Debug/governance wording leakage is checked across all ordinary user/operator surfaces, not only the page where it was first reported.
- Real Provider sample is attempted only after sufficient grounding is visible; max `8` submit attempts total.

## Redaction Boundary

Evidence may record role labels, route labels, workflow labels, pass/fail/blocked status, safe counts, duration buckets, citation counts, evidence status, command names, and validation summaries.

Evidence must not include credentials, tokens, sessions, cookies, Authorization headers, `.env*`, database URLs, raw DB rows, internal numeric ids, PII, plaintext card codes, Provider payloads, prompts, raw AI input/output, complete generated content, screenshots, traces, raw DOM, HTML dumps, or full question/paper/material/resource/chunk content.

## Runtime Rules

- Local dev server is allowed for `http://localhost:3000` only.
- In-app browser is allowed for localhost only.
- Credential read/input is allowed only for local role login and must not be printed or recorded.
- `.env*` content must not be read, printed, modified, or committed.
- Local DB mutation is allowed only through localhost UI actions needed for this owner-preview rerun.
- Stop and materialize a source repair task if any blocking product defect is found.

## Validation Commands

- `npm.cmd exec -- prettier --check --ignore-unknown <changed docs/state>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-post-repair-localhost-rerun-2026-07-01`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-post-repair-localhost-rerun-2026-07-01 -SkipRemoteAheadCheck`
