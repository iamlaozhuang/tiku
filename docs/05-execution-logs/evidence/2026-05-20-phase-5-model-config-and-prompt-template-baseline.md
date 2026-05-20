# Phase 5 Model Config And Prompt Template Baseline Evidence

## Metadata

- Task id: `phase-5-model-config-and-prompt-template-baseline`
- Branch: `codex/phase-5-model-config-and-prompt-template-baseline`
- Base: `master`
- Worktree: `F:\tiku\.worktrees\phase-5-model-config-and-prompt-template-baseline`
- Date: 2026-05-20
- Result: pass

## Startup Recovery

- `git status --short --branch`: `## master...origin/master`
- `git remote -v`: `origin https://github.com/iamlaozhuang/tiku`
- `git log --oneline -8`: HEAD `62bcc51 docs(agent): record phase 5 ai rag contract closeout`
- `git worktree list --porcelain`: only `F:/tiku` on `refs/heads/master` before this task worktree was created
- `project.currentPhase`: `phase-5-ai-rag`
- `project.currentTask`: idle/null
- `handoff.nextRecommendedAction`: `phase-5-ai-rag / phase-5-model-config-and-prompt-template-baseline`
- `phase-5-ai-rag-contract-and-threat-model-baseline`: `done`
- `phase-5-model-config-and-prompt-template-baseline`: `pending`

## Task Claim

Initial command:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-5-model-config-and-prompt-template-baseline
```

Initial result: failed due known host PowerShell language mode dot-source issue.

Stable rerun:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& 'F:\tiku\.worktrees\phase-5-model-config-and-prompt-template-baseline\scripts\agent-system\Test-TaskClaimReadiness.ps1' -TaskId 'phase-5-model-config-and-prompt-template-baseline'"
```

Result: pass.

Key output:

```text
id: phase-5-model-config-and-prompt-template-baseline
branch: codex/phase-5-model-config-and-prompt-template-baseline
status: pending
taskPlanPolicy: required
dependency approval: not triggered by metadata
task claim readiness passed
```

## Dependency Install For Worktree

Fresh worktree dependency install:

```text
corepack pnpm@10 install --frozen-lockfile
```

Result: pass. Lockfile was up to date, 738 packages were reused from local store, downloaded 0, and package files were not edited.

## TDD Log

RED command:

```text
npm.cmd run test:unit -- src/db/schema/ai-rag.test.ts src/server/models/ai-rag.test.ts src/server/validators/ai-rag.test.ts src/ai/prompts/templates.test.ts
```

First sandboxed attempt failed with `spawn EPERM`; escalated rerun reached the expected RED state.

RED result: fail.

Key output:

```text
Failed to resolve import "./ai-rag" from "src/db/schema/ai-rag.test.ts"
Failed to resolve import "./ai-rag" from "src/server/models/ai-rag.test.ts"
Failed to resolve import "./ai-rag" from "src/server/validators/ai-rag.test.ts"
Failed to resolve import "./templates" from "src/ai/prompts/templates.test.ts"
```

GREEN command:

```text
npm.cmd run test:unit -- src/db/schema/ai-rag.test.ts src/server/models/ai-rag.test.ts src/server/validators/ai-rag.test.ts src/ai/prompts/templates.test.ts
```

GREEN result: pass.

Key output:

```text
Test Files 4 passed (4)
Tests 13 passed (13)
```

## Implementation Summary

- Added `src/db/schema/ai-rag.ts` with `model_provider`, `model_config`, `prompt_template`, and `ai_func_type`.
- Exported AI/RAG schema from `src/db/schema/index.ts`.
- Added `src/server/models/ai-rag.ts` with row types and redaction-safe `createModelConfigSnapshot`.
- Added `src/server/contracts/ai-rag-contract.ts` with camelCase DTOs and public identifiers.
- Added `src/server/validators/ai-rag.ts` with provider/config/template normalization, API key last-four derivation, timeout/retry bounds, and scoring fallback rejection.
- Added `src/ai/prompts/templates.ts` with versioned static prompt template definitions for scoring, explanation, hint, knowledge recommendation, and learning suggestion.

## Security Review

Security review path:

```text
docs/05-execution-logs/audits-reviews/2026-05-20-phase-5-model-config-and-prompt-template-baseline-security-review.md
```

Verdict: `APPROVE`.

Coverage:

- Secret/env handling.
- Provider API key display redaction.
- Model config snapshotting.
- Prompt template versioning.
- Scoring fallback prevention.
- Public identifier and DTO safety.

## Early Validation

### `npm.cmd run test:unit`

Result: pass.

Key output:

```text
Test Files 68 passed (68)
Tests 212 passed (212)
```

### `npm.cmd run typecheck`

Initial result: fail because `PromptTemplateRow` test fixture missed `archived_at`.

Fix: added `archived_at: null` to the row fixture.

Final result: pass.

## Scope Guard

- This task does not modify `package.json`, `pnpm-lock.yaml`, `package-lock.json`, `drizzle/**`, or `.env.example`.
- This task does not add dependencies.
- This task does not write real secrets or placeholder credentials.
- This task does not generate migrations.
- This task does not add routes or real provider calls.

## Final Validation

### `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`

First result: fail only at `npm.cmd run format:check`.

Fix: formatted `src/server/validators/ai-rag.ts` with the repository Prettier binary.

Final result: pass.

Key output:

```text
lint: pass
typecheck: pass
test:unit: pass, 68 files, 212 tests
format:check: pass
Quality gate passed.
```

### `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`

Result: pass.

Key output:

```text
Banned term scan passed
Risky generic term scan passed
API route folder kebab-case scan passed
DTO/API field camelCase scan passed
Naming convention scan passed.
```

### `npm.cmd run build`

Result: pass.

Key output:

```text
Next.js 16.2.6 (Turbopack)
Compiled successfully
Finished TypeScript
Generating static pages using 7 workers (31/31)
```

### `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

Result: pass.

Key output:

```text
branch: codex/phase-5-model-config-and-prompt-template-baseline
base: origin/master
git completion readiness inventory completed
```

## Final Scope Guard

Blocked file diff:

```text
git diff --name-only -- package.json pnpm-lock.yaml package-lock.yaml drizzle/** .env.example
```

Result: empty output.

Changed files are limited to the task queue allowed files:

```text
docs/04-agent-system/state/project-state.yaml
docs/04-agent-system/state/task-queue.yaml
docs/05-execution-logs/audits-reviews/2026-05-20-phase-5-model-config-and-prompt-template-baseline-security-review.md
docs/05-execution-logs/evidence/2026-05-20-phase-5-model-config-and-prompt-template-baseline.md
docs/05-execution-logs/task-plans/2026-05-20-phase-5-model-config-and-prompt-template-baseline.md
src/ai/prompts/templates.test.ts
src/ai/prompts/templates.ts
src/db/schema/ai-rag.test.ts
src/db/schema/ai-rag.ts
src/db/schema/index.ts
src/server/contracts/ai-rag-contract.ts
src/server/models/ai-rag.test.ts
src/server/models/ai-rag.ts
src/server/validators/ai-rag.test.ts
src/server/validators/ai-rag.ts
```

## Handoff

- `phase-5-model-config-and-prompt-template-baseline`: `done`
- `handoff.nextRecommendedAction`: `phase-5-ai-rag / phase-5-ai-call-log-and-redaction-baseline`
- `lastSummaryPath`: `docs/05-execution-logs/evidence/2026-05-20-phase-5-model-config-and-prompt-template-baseline.md`
