# Evidence: batch-176-personal-learning-ai-formal-adoption-design

result: pass

## Batch 176

- Task: `batch-176-personal-learning-ai-formal-adoption-design`
- Branch: `codex/batch-176-personal-learning-ai-formal-adoption-design`
- Baseline Commit: `47f0008a87881d889d5094760a2dadb58bfe2d6c`
- Scope: docs-only formal generated-content adoption boundary design.

## Readiness Evidence

- Re-read required governing documents before edits:
  - `AGENTS.md`
  - `docs/03-standards/code-taste-ten-commandments.md`
  - `docs/02-architecture/adr/*.md`
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - recent batch-172 and batch-173 evidence/audit
- Re-read generated-content and formal separation context:
  - batch-159 generated-content adoption boundary review
  - batch-167 generated-content persistence blocked gate
  - batch-168 API/UI no-formal-adoption wiring
  - batch-169 local e2e validation for `isFormalAdoptionBlocked`
  - batch-170 draft persistence implementation and audit review
  - `epic-05-formal-content-separation`
  - `03-personal-ai-generation`
  - advanced edition implementation boundary checklist
  - advanced edition evidence redaction template
- Git baseline before edits:
  - current branch before short branch creation: `master`
  - `HEAD`: `47f0008a87881d889d5094760a2dadb58bfe2d6c`
  - `master`: `47f0008a87881d889d5094760a2dadb58bfe2d6c`
  - local `origin/master`: `47f0008a87881d889d5094760a2dadb58bfe2d6c`
  - remote `origin/master`: `47f0008a87881d889d5094760a2dadb58bfe2d6c`
  - worktree: clean
  - local/remote `codex/*`: no residual short branches found
- Pre-edit readiness command:
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Result: pass; inventory showed branch `codex/batch-176-personal-learning-ai-formal-adoption-design`, no changed
    files before edits, and base `origin/master`.

## Human Approval Boundary

- The user approved `batch-176-personal-learning-ai-formal-adoption-design` on 2026-06-13.
- Allowed:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - this task plan, evidence, and audit review
  - design only for adoption boundaries from generated-content drafts into formal `question`, `paper`, `practice`,
    `mock_exam`, `exam_report`, and `mistake_book`
  - review workflow, permission requirements, rollback strategy, audit requirements, and future implementation gates
- Not allowed:
  - formal writes or adoption implementation
  - source, tests, e2e, schema, Drizzle, package, lockfile, env, secret, provider, deploy, payment, or external-service
    changes
  - provider calls, model requests, sandbox execution, Cost Calibration, PR creation, or force-push
  - reading, creating, modifying, or printing `.env.local` or any real secret/env/provider configuration

## RED:

- Existing personal AI generated content is stored as personal draft content and remains separate from formal domains.
- The current API/UI contract exposes `isFormalAdoptionBlocked: true`.
- No approved workflow exists for adopting draft generated content into formal `question`, `paper`, `practice`,
  `mock_exam`, `exam_report`, or `mistake_book`.
- Batch-174 and batch-175 remain blocked for provider sandbox and Cost Calibration, so this design cannot rely on real
  provider output, provider cost evidence, or sandbox execution.

## GREEN:

- Recorded a docs-only formal adoption boundary design.
- Kept current runtime behavior unchanged: formal adoption remains blocked and no formal write path is implemented.
- Defined target-specific boundaries, review ownership, permission requirements, rollback strategy, audit requirements,
  redaction rules, and the future implementation gate for batch-177 or a later replacement task.
- Preserved provider calls, sandbox execution, Cost Calibration, schema/migration, env/secret, source/tests/e2e,
  dependency, deploy, payment, external-service, PR, and force-push blocks.

## Formal Adoption Boundary Design

### Source Domain

- The only current generated-content source recognized by this design is draft `personal_ai_generation_result` data.
- A draft source can become an adoption candidate only through a future explicit workflow; it must never write directly
  into formal tables.
- A candidate must carry source traceability before any future implementation can proceed:
  - source result public identifier;
  - owning `user` public identifier or approved reviewer-visible proxy;
  - source status such as `draft`;
  - source creation timestamp;
  - redacted `ai_call_log` reference when available;
  - review reason category.
- Evidence and audit records must not copy raw generated content, prompts, provider payloads, provider responses,
  secrets, tokens, database URLs, row data, or Authorization headers.

### Review Workflow

- Future implementation should use a two-step workflow:
  - create an adoption proposal from a draft source;
  - apply an approved proposal through a separate adoption transaction.
- Required proposal states should use snake_case status values, for example:
  - `draft`
  - `in_review`
  - `approved`
  - `rejected`
  - `adopted`
  - `rolled_back`
- A proposal cannot skip from `draft` to `adopted`.
- A reviewer must record a validation decision before any formal target write.
- A rejected proposal must retain a redacted reason category and must not modify formal content.
- An adopted proposal must record target public identifiers and an `audit_log` entry.

### Permission Requirements

- The owning `user` may view personal draft content inside the personal AI learning content domain.
- A future adoption workflow must require explicit review permission before reviewer access to draft content.
- Platform content teacher or `admin` review ownership must be defined before implementation.
- `organization` or `employee` visibility must not be implied by `org_auth`; any organization-scoped review path needs a
  separate approval that states how personal content sharing, `authorization`, and audit consent are handled.
- No implementation task may change the authorization permission model unless the queue entry records a fresh approval
  for that model.

### Target Boundaries

#### `question`

- A future approved implementation may create or update only a draft formal `question` candidate.
- Required checks before a `question` write:
  - reviewer approval;
  - source traceability;
  - duplicate check against existing formal `question` content;
  - validation of `question_option`, `standard_answer`, `analysis`, `scoring_point`, `knowledge_node`, and `tag` fields
    when those fields are present;
  - no external URL exposes internal auto-increment ids.
- A generated draft must not publish a `question` automatically.

#### `paper`

- A future approved implementation may create or update only a draft `paper` candidate.
- A draft `paper` must reference reviewed draft or existing formal `question` records through explicit composition
  metadata such as `paper_section` and `question_group`.
- A generated draft must not publish a `paper` automatically and must not create `paper_asset` objects without a separate
  approval for asset handling.

#### `practice`

- Generated content must not create formal `practice` records.
- Formal `practice` remains a learner action over formal content under existing `authorization`.
- If a future task wants generated practice suggestions, it must keep them in the personal AI domain until a separate
  implementation gate defines the exact formal behavior.

#### `mock_exam`

- Generated content must not create formal `mock_exam` records.
- Formal `mock_exam` remains a learner action over a published `paper` under existing `authorization`.
- Any future generated mock suggestion must remain a proposal and cannot become a submitted or active `mock_exam`
  session automatically.

#### `exam_report`

- Generated content must not create formal `exam_report` records.
- `exam_report` remains downstream of submitted `answer_record` or `mock_exam` scoring.
- AI-generated learning advice may be referenced only through a future approved `learning_suggestion` or
  `ai_explanation` path, not by writing a formal report directly.

#### `mistake_book`

- Generated content must not create formal `mistake_book` records.
- `mistake_book` remains downstream of scoring, answer history, and existing mistake selection rules.
- A future AI suggestion may point to likely weak areas, but it must not write mistake entries without a separate
  approved implementation task.

## Rollback Strategy

- Before adoption, rollback is proposal-level: move the proposal to `rejected` or `rolled_back` and keep formal tables
  unchanged.
- After draft `question` or draft `paper` adoption, rollback should disable or archive the draft target and preserve
  source traceability.
- After publication, rollback must not mutate historical `answer_record`, `practice`, `mock_exam`, `exam_report`, or
  `mistake_book` records. It may only prevent future use, supersede content, or trigger a separately approved correction
  path.
- Physical deletion is not part of this design.

## Audit Requirements

- Every future proposal state change must write an `audit_log` summary with:
  - actor role;
  - action type;
  - source public identifier;
  - target public identifier when available;
  - status;
  - timestamp;
  - redacted reason category;
  - redaction status.
- Future `ai_call_log` references must stay summary-only and may include public task identifier, `model_provider`,
  `model_config`, retry count, quota summary, `evidence_status`, and redaction status.
- Evidence must use redacted summaries and must not record raw generated content.

## Future Implementation Gate

Batch-177 or a later replacement implementation task remains blocked until fresh approval explicitly records:

- exact formal write targets;
- exact route, service, repository, UI, schema, migration, test, and e2e files allowed;
- whether schema/migration is allowed;
- authorization model and reviewer roles;
- review workflow statuses;
- rollback behavior;
- `audit_log` and `ai_call_log` redaction rules;
- duplicate and validation checks;
- e2e scope, if any;
- provider/env/secret boundary;
- Cost Calibration status;
- local and closeout validation commands.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-176-personal-learning-ai-formal-adoption-design.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-176-personal-learning-ai-formal-adoption-design.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-176-personal-learning-ai-formal-adoption-design.md`

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-13-batch-176-personal-learning-ai-formal-adoption-design.md docs/05-execution-logs/evidence/2026-06-13-batch-176-personal-learning-ai-formal-adoption-design.md docs/05-execution-logs/audits-reviews/2026-06-13-batch-176-personal-learning-ai-formal-adoption-design.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-176-personal-learning-ai-formal-adoption-design`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-176-personal-learning-ai-formal-adoption-design`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-176-personal-learning-ai-formal-adoption-design`

## Validation Results

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`:
  pass; inventory showed only batch-176 allowed files changed on branch
  `codex/batch-176-personal-learning-ai-formal-adoption-design`.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-13-batch-176-personal-learning-ai-formal-adoption-design.md docs/05-execution-logs/evidence/2026-06-13-batch-176-personal-learning-ai-formal-adoption-design.md docs/05-execution-logs/audits-reviews/2026-06-13-batch-176-personal-learning-ai-formal-adoption-design.md`:
  pass; all matched files use Prettier code style.
- `npm.cmd run lint`: pass; `eslint` exited 0.
- `npm.cmd run typecheck`: pass; `tsc --noEmit` exited 0.
- `npm.cmd run test:unit`: pass; Vitest reported 250 test files and 920 tests passed.
- `git diff --check`: pass; no whitespace errors reported.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-176-personal-learning-ai-formal-adoption-design`:
  pass; scope scan approved all 5 changed files and found no sensitive evidence or terminology findings.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-176-personal-learning-ai-formal-adoption-design`:
  pass after RED/GREEN evidence anchor normalization; evidence/audit paths, validation anchors, threadRolloverGate,
  nextModuleRunCandidate, blocked remainder, and audit approval were accepted.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-176-personal-learning-ai-formal-adoption-design`:
  pass on the short branch; `master` and `origin/master` were `47f0008a87881d889d5094760a2dadb58bfe2d6c`, and the
  prior state SHA was accepted as an ancestor checkpoint.
- `npm.cmd run build`: not planned. The local Next.js build has previously reported loading `.env.local`, which
  conflicts with this task's explicit no real env/secret access boundary.

## Module Run v2 Gates

- `localFullLoopGate`: docs-only design gate; no source, test, schema, Drizzle, provider, env, dependency, deployment,
  payment, or external-service files changed.
- `threadRolloverGate`: not required for this short docs-only design task.
- `nextModuleRunCandidate`: `batch-174-personal-learning-ai-local-provider-sandbox-smoke` only after future fresh
  approval that explicitly defines provider/model/command/quota/redaction boundaries.
- `batch-177-personal-learning-ai-formal-adoption-implementation` remains blocked because Cost Calibration and formal
  write implementation approvals are absent.
- Cost Calibration Gate remains blocked.

## Blocked Remainder

- Formal writes into `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` remain blocked.
- Provider calls, model requests, local provider sandbox execution, provider quota use, env/secret reads or writes,
  `.env.local`, schema/migration, dependency/package/lockfile changes, source/test/e2e changes, staging/prod/cloud,
  deploy, payment, external-service, PR creation, force-push, and Cost Calibration remain blocked unless a later prompt
  grants task-specific fresh approval.

## Residual Risk

- The adoption workflow is designed but not implemented.
- Provider runtime readiness and local provider sandbox smoke remain unexecuted.
- Cost Calibration remains unexecuted.
- Formal adoption implementation remains blocked.
- Staging/deploy readiness remains blocked.
