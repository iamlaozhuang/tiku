# unified-repair-standard-advanced-ai-generation-boundary-guard Task Plan

## Task

- Task id: `unified-repair-standard-advanced-ai-generation-boundary-guard`
- Branch: `codex/unified-repair-standard-advanced-ai-generation-boundary-guard`
- Date: 2026-06-14
- Mode: strict serial docs-only edition-boundary repair planning task

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-mvp-ai-rag-governed-code-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-mvp-ai-rag-governed-code-audit.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-advanced-ai-rag-quota-blocked-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-advanced-ai-rag-quota-blocked-planning.md`

## Scope

Allowed write surfaces are limited to:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

This task is docs-only. It must not edit `src/**`, `tests/**`, `e2e/**`, `scripts/**`, schema, migrations, package
files, lockfiles, or env files.

## Blocked Boundaries

- No route guard implementation, source code edits, tests, or e2e.
- No provider/model request, quota use, env/secret/provider configuration, schema/migration, dependency/package/lockfile
  changes, staging/prod/cloud/deploy, payment, external-service, PR, force-push, or Cost Calibration work.
- No generated content, prompt, provider payload, model response, raw source content, private answer data, or database row
  evidence.

## Docs-Only RED/GREEN Plan

1. RED: Record that the remaining pending queue item has no task-specific boundary guard plan, evidence, audit review,
   closeout state, or future implementation gate package.
2. GREEN: Create this plan, a redacted evidence file, an audit review, and state/queue updates that define exact future
   gates for preventing advanced AI generation route presence from being treated as standard MVP coverage or provider
   execution approval.
3. Preserve `CAP-STD-FUTURE-AI-GENERATION-NON-GOAL`, `CAP-ADV-AI-TASK-DOMAIN`,
   `CAP-ADV-PERSONAL-AI-QUESTION-GENERATION`, `CAP-ADV-PERSONAL-AI-PAPER-GENERATION`,
   `DELTA-AI-SCORING-VS-GENERATION`, and `DELTA-PROVIDER-STAGING-GATE` separation.
4. Validate docs-only closeout with the task's declared commands.

## Boundary Guard Planning Targets

- Standard MVP AI scoring/explanation/hint and knowledge recommendation remain separate from AI question or AI `paper`
  generation.
- Advanced AI generation route presence is not implementation coverage for standard MVP.
- Advanced generation route presence is not provider/model execution approval.
- Generated output must stay isolated from formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and
  `mistake_book` until a separately approved formal adoption flow exists.
- Future implementation must be a separate scoped task with exact allowedFiles, RED/GREEN tests, route/service/repository
  boundaries, authorization checks, redacted logs, and provider/quota gates approved.

## Validation Commands

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-repair-standard-advanced-ai-generation-boundary-guard`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-repair-standard-advanced-ai-generation-boundary-guard`

## Risk Defense

- Keep this task docs-only; source/test route guards remain future implementation.
- Treat historical advanced AI generation implementation artifacts as context, not current executable approval.
- Keep evidence redacted: no prompt, generated content, provider payload, model response, token, secret, database URL,
  raw answer data, raw source document, or private user/customer content.
- Explicitly carry forward blocked gates so future automation cannot infer approval from route presence.
