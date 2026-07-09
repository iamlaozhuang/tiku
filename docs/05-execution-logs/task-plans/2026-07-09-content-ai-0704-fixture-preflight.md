# 2026-07-09 Content AI 0704 Fixture Preflight Plan

## Task

- Task id: `content-ai-0704-fixture-preflight-2026-07-09`
- Branch: `codex/content-ai-0704-fixture-preflight`
- Goal link: continue the active content AI出题 / AI组卷 closed-loop acceptance goal after the 0704 readiness branch.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-fixture-readiness.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-localhost-write-acceptance.md`
- `docs/05-execution-logs/audits-reviews/2026-07-09-content-ai-0704-fixture-readiness-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-07-09-content-ai-0704-localhost-write-acceptance-audit.md`
- Relevant route/service code under `src/server/services/**` and `src/app/api/v1/**`.

## Scope

This branch performs a readiness preflight only:

0. Record that the implementation repair branches are already closed; this branch is not another code repair branch.

1. Confirm localhost service reachability and current 0704 acceptance target status without outputting DB URLs, env values, credentials, sessions, cookies, tokens, or raw rows.
2. Inspect local private acceptance material in memory only for role-label coverage and credential field presence.
3. Probe only bounded, non-Provider, non-destructive runtime read surfaces when safe:
   - content AI history aggregate readiness;
   - content AI paper draft publishability category without publishing unless a current eligible draft is already available and the action is explicitly within the bounded acceptance path;
   - employee visible training and fresh answer candidate readiness.
4. Classify each remaining goal blocker as ready, still fixture/history blocked, or requiring fresh approval before any write.

## Explicit Non-Scope

- No Provider execution.
- No fixture/history write without fresh approval.
- No schema, migration, seed, destructive DB operation, dependency, package, lockfile, env, staging, prod, deploy, screenshot, raw DOM, or Cost Calibration work.
- No source repair unless a fresh current-code defect is reproduced and then handled in a separate short branch.
- No evidence of credentials, sessions, cookies, tokens, env values, DB URLs, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI output, full question, full paper, material, resource, chunk, or employee raw answer content.
- No local account or password creation in this branch. The user's later approval for missing account/password creation must be consumed by a separate short branch after target confirmation.

## Validation Plan

- `corepack pnpm@10.26.1 exec prettier --write --ignore-unknown <scoped-doc-files>`
- `git diff --check`
- Relevant targeted tests if source code changes. For this preflight branch, source/test changes are not planned.
- `corepack pnpm@10.26.1 lint`
- `corepack pnpm@10.26.1 typecheck`
- Module Run v2 pre-commit and pre-push readiness for this task id.

## Adversarial Checks

- Do not count a mismatched or inferred session as proof for a role.
- Do not convert stale 0704 data gaps into source defects without a current-code reproduction.
- Do not use AI-generated drafts as AI组卷 formal question sources unless they have already become eligible formal or enterprise-training sources under the recontract.
- Do not expose sensitive material in evidence or chat.
- Do not let standard roles gain advanced AI or enterprise-training access by route guessing or UI-only checks.
