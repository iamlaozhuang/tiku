# AI Generation AI Question Provider Structured Output Robustness Plan

## Task Boundary

- Task id: `ai-generation-ai-question-provider-structured-output-robustness-2026-07-02`
- Branch: `codex/ai-generation-ai-question-provider-structured-output-robustness`
- Scope: shared AI出题 structured parser and Provider instruction robustness only.
- Blocked: Provider call, browser runtime, DB access or mutation, dependency/package/lockfile changes, schema/migration/seed, staging/prod/cloud/deploy, PR, force push, release readiness, final Pass, and Cost Calibration.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-bounded-provider-rerun-after-structured-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-bounded-provider-rerun-after-structured-contract.md`
- Shared route-integrated Provider parser, instruction, runtime bridge, and contract files.

## Requirement Mapping

- `UC-ADV-CONTENT-ADMIN-AI-GENERATION`: content admins create reviewable AI出题/AI组卷 drafts; generated content must remain structured draft output, not direct formal `question` or `paper`.
- `UC-ADV-PERSONAL-AI-QUESTION-GENERATION` and `UC-ADV-EMPLOYEE-AI-GENERATION`: learner/employee AI出题 flows depend on the same shared structured task contract, so parser hardening must stay shared.
- `UC-ADV-ORG-ADMIN-AI-GENERATION`: organization admin AI draft generation must use the same structured output contract without role-specific Provider exceptions.
- Admin ops content backend requirements cover `AI出题` and `AI组卷` draft/review entry points; this task only repairs the shared route-integrated structured parsing and instruction layer.
- Boundary: this task does not execute Provider calls, browse localhost, read or mutate DB state, change authorization scope, adopt generated drafts into formal content, or claim release readiness.

## First-Principles Diagnosis

The latest bounded Provider rerun showed AI组卷 now returns paper drafts with recognized question counts in all three professions. The remaining live failure is AI出题 structured output for monopoly and logistics. Because deterministic tests already prove strict `questions` JSON works, the next repair should not add role-specific branches. It should harden the shared structured parser against common Provider JSON envelope variants while keeping the output contract strict and exact-count based.

## Implementation Steps

1. Add focused parser tests for AI出题 root array and common compatible array envelopes.
2. Keep exact requested-count enforcement; compatible roots still fail on mismatch.
3. Strengthen AI出题 Provider instruction to require one JSON object, top-level `questions`, exact count, and no Markdown/prose wrapper.
4. Preserve AI组卷 parser behavior and tests.
5. Run focused route/runtime tests, lint, typecheck, scoped Prettier, diff check, and Module Run v2 gates.

## Acceptance Standards

- AI出题 parser accepts strict top-level `questions` and compatible array roots without accepting wrong counts.
- AI出题 instruction explicitly requires a single JSON object with top-level `questions` and exact requested count.
- AI组卷 question-count parser behavior remains covered.
- No raw Provider payload, prompt, AI output, generated question, generated paper, material, chunk, credential, env, DB row, internal id, or PII is recorded.
- No Provider/browser/DB/dependency/schema/deploy/release/final Pass/Cost Calibration action is executed.
