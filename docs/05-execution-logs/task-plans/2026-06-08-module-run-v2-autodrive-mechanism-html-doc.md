# Module Run v2 Autodrive Mechanism HTML Documentation Plan

## Task

- taskId: `module-run-v2-autodrive-mechanism-html-doc`
- branch: `codex/autodrive-mechanism-html-doc`
- scope: documentation-only static HTML artifact plus mechanism closeout logs/state/queue
- output: `archive/presentations/module-run-v2-autodrive-mechanism.html`

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- existing HTML documents under `archive/presentations/`
- automation scripts under `scripts/agent-system/`

## Implementation Plan

1. Create a standalone static HTML document in the existing HTML presentation directory.
2. Explain the Module Run v2 autodrive mechanism end to end: state sources, startup, lease, task execution, thread handoff,
   hooks, stopped automation hygiene, module progression, hard blocks, skills, and operator checklist.
3. Include inline SVG visualizations for the architecture and execution flow.
4. Keep the document local-only and dependency-free.
5. Validate formatting, anchors, banned visual/terminology patterns, lint, typecheck, module closeout, and Git inventory.

## Allowed Files

- `archive/presentations/module-run-v2-autodrive-mechanism.html`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-08-module-run-v2-autodrive-mechanism-html-doc.md`
- `docs/05-execution-logs/evidence/2026-06-08-module-run-v2-autodrive-mechanism-html-doc.md`
- `docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-autodrive-mechanism-html-doc.md`

## Blocked Files

- `.env.local`
- `.env.example`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `scripts/**`
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`

## Risk Controls

- Documentation-only; no product behavior changes.
- No dependency, package, lockfile, schema, migration, env/secret, provider, staging/prod/cloud/deploy, payment, or
  external-service work.
- Cost Calibration Gate remains blocked.
- No raw prompt, provider payload, secret, database URL, Authorization header, raw generated AI content, cleartext
  `redeem_code`, or full `paper` content in evidence.
