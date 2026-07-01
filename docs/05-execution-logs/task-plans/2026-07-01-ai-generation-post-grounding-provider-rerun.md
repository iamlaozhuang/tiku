# AI Generation Post-Grounding Provider Matrix Rerun

## Task

- Task id: `ai-generation-post-grounding-provider-matrix-rerun-2026-07-01`
- Branch: `codex/ai-generation-post-grounding-provider-rerun`
- Scope: rerun the local owner-preview AI 出题 / AI 组卷 matrix after `ai-generation-grounding-product-ui-repair-2026-07-01`.
- Goal: verify the previous findings are now either resolved or replaced by clear remaining issues:
  - resource / RAG grounding constrains Provider execution;
  - ordinary UI no longer exposes internal governance wording;
  - ops admin no longer sees submit-capable organization AI routes;
  - AI 组卷 visible preview recognizes paper_section and quantity counts where generation succeeds.
  - all AI generation role surfaces are cross-scanned for missing resource / RAG constraints and internal governance copy leaks before role walkthrough, so multi-role regressions are not missed.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- all ADR files under `docs/02-architecture/adr/`
- Browser control skill documentation for the in-app browser
- Prior evidence:
  - `docs/05-execution-logs/evidence/2026-07-01-ai-generation-provider-matrix-rerun.md`
  - `docs/05-execution-logs/evidence/2026-07-01-ai-generation-grounding-product-ui-repair.md`

## Boundaries

- Localhost owner-preview only.
- Agent may read local private role credentials only to input them into localhost login screens.
- Do not output, save, or commit credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*`, database connection strings, raw DB rows, internal auto ids, PII, raw prompts, Provider payloads, raw AI input/output, complete generated content, screenshots, traces, raw DOM, HTML dumps, or full question/paper/material/resource/chunk content.
- Real Qwen Provider submit attempts are capped at `8`.
- Evidence records only role labels, route labels, function labels, status, duration bucket, safe count labels, failure category, and product-copy checks.
- No source, test, package, lockfile, dependency, schema, migration, seed, staging, prod, cloud, deploy, PR, force-push, release-readiness, final Pass, or Cost Calibration changes.

## Matrix

- Roles:
  - `personal_standard_student`
  - `personal_advanced_student`
  - `org_standard_employee`
  - `org_advanced_employee`
  - `org_standard_admin`
  - `org_advanced_admin`
  - `content_admin`
  - `ops_admin`
- Functions:
  - `ai_question_generation`
  - `ai_paper_generation`
- Eligible Provider roles:
  - `personal_advanced_student`
  - `org_advanced_employee`
  - `org_advanced_admin`
  - `content_admin`
- Ineligible roles must be recorded as `not_applicable`, `blocked`, or `fail` with safe reason labels only.

## Execution Plan

1. Confirm localhost app availability and in-app browser connection.
2. Run static product-copy and route-surface checks for AI generation pages.
   - Cross-scan all AI 出题 / AI 组卷 surfaces for resource / RAG grounding terms, submit routes, and ordinary UI wording.
   - Treat `本地合约`, `已脱敏`, raw Provider / prompt wording, `evidenceStatus`, and `citationCount` in ordinary role UI as product-copy risks unless the surface is an ops/audit diagnostic view.
3. For each role, log in through the in-app browser without recording credentials.
4. Visit role-appropriate AI 出题 / AI 组卷 routes.
5. For eligible roles, submit at most once per function and record only:
   - `generated`, `blocked_insufficient_grounding`, `failed`, or `no_visible_feedback`;
   - `草稿 n/10`, `paper_section n`, `题量 n`, or safe missing-count labels;
   - duration bucket;
   - near-action feedback status;
   - whether product UI exposes blocked governance terms.
6. For ineligible roles, do not force Provider execution; record route availability, submit button state, and safe status.
7. Write redacted evidence, audit, and closeout status.

## Validation Commands

- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-post-grounding-provider-rerun.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-post-grounding-provider-rerun.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-post-grounding-provider-rerun.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-post-grounding-provider-matrix-rerun-2026-07-01`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-post-grounding-provider-matrix-rerun-2026-07-01 -SkipRemoteAheadCheck`

## Exit Criteria

- Every matrix row has `pass`, `fail`, `blocked`, or `not_applicable`.
- Previous `CROSS-001`, `CROSS-002`, ops route, and paper quantity findings are explicitly rechecked.
- Evidence remains redacted and contains no credentials, raw Provider material, full generated content, raw DOM, screenshots, traces, storage, env, DB raw rows, or PII.
- The task may close as `completed_with_findings` if remaining failures are fully categorized for a later source repair.
