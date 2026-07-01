# AI Generation Provider Matrix Rerun After Repair

## Task

- Task id: `ai-generation-provider-matrix-rerun-after-repair-2026-07-01`
- Branch: `codex/ai-generation-provider-matrix-rerun`
- Scope: rerun the local owner-preview AI 出题 / AI 组卷 matrix after the Provider structured-preview and learner feedback repair.
- Added cross-cutting scan scope: before continuing Provider submits, map two user-reported risks across every AI 出题 / AI 组卷 surface: resource/RAG grounding not constraining generation, and internal governance wording leaking into normal user UI.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- All ADR files under `docs/02-architecture/adr/`
- Browser control skill documentation for the in-app browser

## Boundaries

- Localhost owner-preview only.
- Agent may read local private role credentials only to input them into localhost login screens.
- Do not output, save, or commit credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*`, database connection strings, raw DB rows, internal auto ids, PII, raw prompts, Provider payloads, raw AI input/output, complete generated content, screenshots, traces, raw DOM, or HTML dumps.
- Real Qwen Provider submit attempts are capped at 9 for this task because one pre-restart submit was interrupted after request submission and before safe evidence capture.
- No source, test, package, lockfile, dependency, schema, migration, seed, staging, prod, cloud, deploy, PR, force-push, release-readiness, final Pass, or Cost Calibration changes.

## Matrix

- Roles: `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`, `org_advanced_employee`, `org_standard_admin`, `org_advanced_admin`, `content_admin`, `ops_admin`.
- Functions: `ai_question_generation`, `ai_paper_generation`.
- Expected eligible Provider roles: `personal_advanced_student`, `org_advanced_employee`, `org_advanced_admin`, `content_admin`.
- Standard and ops roles must be recorded as `not_applicable`, `blocked`, or `fail` with safe reason labels only.

## Cross-Cutting Scan Items

- `CROSS-001`: Resource-backed generation constraint. Check whether AI 出题 / AI 组卷 requests are actually constrained by imported `resource` / `knowledge_base` / `chunk` / `citation` / `knowledge_node` evidence, not just by form parameters such as `profession`, `level`, and `subject`.
- `CROSS-002`: Internal governance copy exposure. Check whether ordinary learner, employee, enterprise admin, or content operator screens expose implementation/governance wording such as local contract summaries, redaction statuses, content visibility flags, or raw metadata field names.
- Coverage must include the learner AI page, organization employee AI page, organization advanced admin AI routes, content admin AI routes, organization portal links, and the shared history/detail areas used by these pages.

## Execution Plan

1. Confirm localhost app availability and current task boundaries.
2. Run static cross-cutting scan for `CROSS-001` and `CROSS-002`; record only source locations, safe status, and suspected root-cause labels.
3. For each role, log in through the in-app browser without recording credentials.
4. Visit the role-appropriate AI 出题 / AI 组卷 route.
5. For eligible roles, perform at most one submit per function and record only safe labels such as `草稿 10/10`, `待评审 10`, `paper_section n`, `题量 n`, duration bucket, status, and near-action feedback presence.
6. For ineligible roles, do not force Provider execution; record route availability and safe status.
7. Write redacted evidence and close the task only after governance validation passes.

## Validation Commands

- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-provider-matrix-rerun.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-provider-matrix-rerun.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-provider-matrix-rerun.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-provider-matrix-rerun-after-repair-2026-07-01`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-provider-matrix-rerun-after-repair-2026-07-01 -SkipRemoteAheadCheck`
