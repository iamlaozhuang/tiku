# batch-204 organization-training audit_log redacted reference

## Scope

- Task: `batch-204-organization-training-audit-log-redacted-reference`
- Execution profile: `local_unit_tdd`
- Evidence mode: redacted local evidence only
- Allowed implementation surface: `src/server/contracts/**`, `src/server/validators/**`, `src/server/services/**`, plus task plan, evidence, audit, and queue state

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Plan

1. Add a failing unit test for an audit_log redacted reference policy/read-model gap.
2. Keep output metadata-only and redacted; do not include raw action payloads, row data, provider payloads, prompts, raw answers, or private data.
3. Reuse existing audit log target resource terminology.
4. Avoid route, repository, schema, provider, dependency, and external-service changes.
5. Run focused unit test, lint, typecheck, diff check, readiness, evidence, audit, commit, and approved closeout.

## Risk Controls

- Do not read or modify `.env*`.
- Do not expose raw payload, raw prompt, raw answer, provider payload, Authorization header, DB URL, row data, or private data.
- Do not touch schema/drizzle/migrations, package files, lockfiles, routes, UI, provider/model code, cloud/deploy/payment, or external services.
- Keep API fields camelCase and use glossary terms: `audit_log`, `organization_training`, `employee`, `source_context`.
