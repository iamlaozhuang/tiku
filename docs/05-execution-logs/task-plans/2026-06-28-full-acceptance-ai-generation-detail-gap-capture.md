# Full Acceptance AI Generation Detail Gap Capture Plan

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`

## Requirement Decision Map

| Source                                                     | Decision used by this task                                                                                                                                           |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modules/02-question-paper.md`                             | AI question and paper generation detail controls must align to `profession`, `level`, `subject`, question type, paper metadata, sections, tags, and knowledge nodes. |
| `2026-06-23-advanced-ai-generation-scope-clarification.md` | AI question generation and AI paper generation must be discoverable for eligible roles and must not directly write formal `question` or `paper`.                     |
| `modules/03-personal-ai-generation.md`                     | Advanced learners require `AI训练` with `AI出题` and `AI组卷`; standard learners require denial or unavailable state.                                                |
| `modules/08-organization-ai-generation.md`                 | Advanced organization admins require organization-owned `AI出题` and `AI组卷`; standard organization admins require denial or unavailable state.                     |
| `2026-06-24-role-separated-mvp-requirement-alignment.md`   | Content admins require content backend `AI出题` and `AI组卷` draft/review entries; standard roles must not receive advanced AI capabilities.                         |
| `2026-06-28-owner-facing-role-gap-capture-scope.md`        | The durable full acceptance goal is not complete until every applicable role checklist item is covered and passed by redacted evidence.                              |

## Requirement Mapping

This task does not repair UI/source behavior. It verifies whether the current localhost visible surfaces provide enough
detail controls for later functional acceptance.

Required observation rows:

- Mandatory owner-facing checklist mapping: the task must read
  `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md` before browser execution and map
  any AI generation observation to the relevant role checklist row.
- Content AI question route: visible controls for scope, question type, quantity, difficulty, coverage, and draft/review boundary.
- Content AI paper route: visible controls for scope, paper type, section/structure, quantity or total score, distribution, coverage, and draft/review boundary.
- Organization AI question route: same control categories plus organization-owned boundary.
- Organization AI paper route: same control categories plus organization-owned boundary.

If a required control category is absent, evidence records a redacted gap. It does not claim final failure of the product;
it seeds the next repair task.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-option-a-session-coverage.md`

This prior evidence is used only to understand that route reachability was previously checked. It is not used as proof of
functional detail completeness.

## Conflict Check

No conflict found. Older route-level evidence is narrower than the current required control-level acceptance. The stricter
interpretation is required for the durable full acceptance matrix.

The owner-facing role checklist is the acceptance completion gate for the durable goal. This task can close only a
scoped gap-capture row; it cannot conclude the overall goal.

## Execution Boundary

Allowed:

- Navigate only to the task-listed localhost/127.0.0.1 routes.
- Inspect visible labels and control categories.
- Record role/route/control/status summaries only.

Forbidden:

- Provider calls, prompt execution, or AI generation submit.
- Form submit that creates, updates, deletes, or queues data.
- Direct DB access.
- Credential entry, cookies, tokens, sessions, localStorage, Authorization headers, raw DOM, screenshots, traces, raw AI
  input/output, Provider payloads, and complete content evidence.
- Source, test, schema, migration, seed, package, or lockfile changes.

## Validation Commands

- `browser-ai-generation-detail-gap-capture`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-full-acceptance-ai-generation-detail-gap-capture.md docs/05-execution-logs/task-plans/2026-06-28-full-acceptance-ai-generation-detail-gap-capture.md docs/05-execution-logs/evidence/2026-06-28-full-acceptance-ai-generation-detail-gap-capture.md docs/05-execution-logs/audits-reviews/2026-06-28-full-acceptance-ai-generation-detail-gap-capture.md docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-ai-generation-detail-gap-capture.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-full-acceptance-ai-generation-detail-gap-capture.md docs/05-execution-logs/task-plans/2026-06-28-full-acceptance-ai-generation-detail-gap-capture.md docs/05-execution-logs/evidence/2026-06-28-full-acceptance-ai-generation-detail-gap-capture.md docs/05-execution-logs/audits-reviews/2026-06-28-full-acceptance-ai-generation-detail-gap-capture.md docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-ai-generation-detail-gap-capture.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-acceptance-ai-generation-detail-gap-capture-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-acceptance-ai-generation-detail-gap-capture-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-acceptance-ai-generation-detail-gap-capture-2026-06-28 -SkipRemoteAheadCheck`

## Closeout Policy

- Local commit: approved by inherited per-task closeout authorization.
- Fast-forward merge to `master`: approved by inherited per-task closeout authorization.
- Push `origin/master`: approved by inherited per-task closeout authorization.
- Cleanup merged short branch: approved by inherited per-task closeout authorization.
