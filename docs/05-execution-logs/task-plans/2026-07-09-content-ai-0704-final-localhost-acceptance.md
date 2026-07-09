# Content AI 0704 Final Localhost Acceptance Plan

## Task

- Task id: `content-ai-0704-final-localhost-acceptance-2026-07-09`
- Branch: `codex/content-ai-0704-final-localhost-acceptance`
- Mode: localhost-only final acceptance record after account matrix recovery.

## Read Baseline

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-localhost-write-acceptance.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-local-e2e-regression.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-account-matrix-recovery.md`
- Content AI, personal AI, organization AI/training, paper, question, session, and authorization route code.

## Boundary

- localhost / `127.0.0.1` only.
- No Provider-enabled generation.
- No screenshots, raw DOM, traces, browser storage reads, session/cookie/token/localStorage/auth header output, env value
  reads, DB URL output, raw DB rows, internal numeric ids, raw prompts, raw AI output, or complete question/paper/material
  content.
- No direct DB connection, schema, migration, seed, destructive DB operation, package/lockfile/dependency change,
  staging/prod/deploy, or Cost Calibration.
- Private credentials may be used in memory only for role login probes.
- Write actions are allowed only through localhost product routes when they do not invoke Provider and only if needed to
  verify already materialized local fixture/history flows. Evidence remains aggregate and redacted.

## Acceptance Questions

1. Can the recovered role matrix authenticate against the current localhost service and preserve standard/advanced
   boundaries?
2. Can content backend AI出题/AI组卷 history, formal adoption, draft detail, and publish/user visibility be verified from
   current 0704 data without Provider?
3. Can personal advanced learner and organization advanced employee AI boundaries be verified without enabling Provider?
4. Can organization training visibility and content-admin/organization semantics remain distinct?
5. If a current blocker remains, is it fixture/history state or a reproducible source defect?

## Validation

- Runtime probes must record only route labels, role labels, aggregate counts, status categories, and capability
  categories.
- Run targeted existing tests covering content AI, formal content, personal AI, organization training, role navigation.
- Run lint, typecheck, and `git diff --check`.
- Run Module Run v2 pre-commit and pre-push readiness.
