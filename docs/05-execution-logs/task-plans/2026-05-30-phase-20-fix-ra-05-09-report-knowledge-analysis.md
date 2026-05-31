# Phase 20 Fix RA-05-09 Report Knowledge Analysis Plan

## Task

- Task id: `phase-20-fix-ra-05-09-report-knowledge-analysis`
- Branch: `codex/phase-20-fix-ra-05-09-report-knowledge-analysis`
- Source finding: `F-RA-05-09-001`
- Goal: complete local report knowledge_node weak-point analysis, score/correct-rate statistics, historical snapshot display, and test/evidence coverage by reusing existing local models.

## Read Sources

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-05-rag-knowledge.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-18-audit-ra-05-rag-knowledge.md`

## Human Approval

The user approved local implementation for `phase-20-fix-ra-05-09-report-knowledge-analysis` on 2026-05-30. Approved risk includes `database_migration` only within a no-schema-change boundary: prioritize reusing existing `question_knowledge_node`, `question_tag`, `exam_report` snapshot, and `answer_record` models.

Forbidden work remains blocked: `.env.local`, `.env.example`, package or lockfile changes, dependency changes, `src/db/schema/**`, `drizzle/**`, `scripts/**`, staging/prod/cloud/real provider access, external service configuration changes, destructive data operations, and `drizzle-kit push`.

## Allowed Scope

- `src/**`
- `tests/**`
- `e2e/**`
- `docs/04-agent-system/state/**`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- Necessary `docs/05-execution-logs/audits-reviews/**` evidence updates

## Blocked Scope

- `.env.local`
- `.env.example`
- `package.json`
- lockfiles
- dependency changes
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- cloud/deploy configuration
- staging/prod/real provider connections
- destructive data operations
- `drizzle-kit push`

## Implementation Plan

1. Inspect the current exam report, answer record, and knowledge binding runtime surfaces without reading env files or schema/migration contents.
2. Add RED unit tests that prove report generation lacks knowledge_node weak-point score/correct-rate analysis and historical snapshot preservation.
3. Implement the smallest local runtime change needed to aggregate question results by existing knowledge bindings:
   - count total and correct answered questions per knowledge_node;
   - compute score and accuracy rates;
   - sort weak points deterministically by weakest rate and stable node metadata;
   - persist the computed analysis inside the existing report snapshot shape using additive fields only.
4. Add local report/UI snapshot display coverage if an existing student report surface already renders snapshot details without requiring schema, env, dependency, or auth model changes.
5. Run task validation commands and local CI gates, then record full evidence.

## Risk Controls

- Stop if completing the task requires schema/migration or Drizzle changes.
- Stop if completing the task requires new dependencies, env/secret changes, real provider calls, external service configuration, cloud/deploy changes, or destructive data operations.
- Keep DTO additions camelCase and additive.
- Do not expose numeric database ids in externally visible URLs or report surfaces.
- Record residual gaps separately; do not claim real production DB migration or full external e2e coverage from local-only evidence.
