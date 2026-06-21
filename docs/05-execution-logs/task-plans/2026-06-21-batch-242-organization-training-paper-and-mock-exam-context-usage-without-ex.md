# batch-242 organization training source context usage plan

## Task

- taskId: `batch-242-organization-training-paper-and-mock-exam-context-usage-without-ex`
- branch: `codex/batch-242-organization-context-usage`
- module: `organization-training`
- targetClosureItem: paper and mock_exam context usage without exposing full paper content in evidence

## Read Norms

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Approval And Boundaries

- Approval: current `autoDriveLocalImplementationApproval for module organization-training`.
- Allowed files:
  - `src/server/models/**`
  - `src/server/contracts/**`
  - `src/server/validators/**`
  - `src/server/services/**`
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/task-plans/**`
  - `docs/05-execution-logs/evidence/**`
  - `docs/05-execution-logs/audits-reviews/**`
- Blocked files:
  - `.env.local`
  - `.env.example`
  - `package.json`
  - `pnpm-lock.yaml`
  - `package-lock.yaml`
  - `package-lock.json`
  - `src/db/schema/**`
  - `drizzle/**`

## Implementation Strategy

1. Run the pre-edit auto-seed readiness gate.
2. Materialize current task metadata and plan path before WorkReadiness.
3. Inspect existing paper/mock_exam source context service and route coverage.
4. Prefer no source change if existing implementation already enforces metadata-only context usage and redacted evidence.
5. If a real gap is found, make the smallest allowed server-layer service/test change.
6. Run focused organization-training service/route tests, lint, typecheck, diff check, module closeout readiness, pre-commit hardening, and pre-push readiness.
7. Record only command names, pass/fail results, and redacted metadata in evidence.

## Risk Controls

- No provider/model call.
- No env/secret/token/database URL/Authorization header read or output.
- No dependency/package/lockfile change.
- No schema/migration change and no local DB migration apply.
- No deploy, payment, PR, force-push, or Cost Calibration Gate.
- Evidence must not include raw employee answer text, full paper content, raw prompt, raw generated content, provider payload, internal DB rows, or plaintext redeem_code.
