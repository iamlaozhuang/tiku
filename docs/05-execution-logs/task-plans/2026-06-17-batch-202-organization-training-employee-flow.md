# batch-202 organization-training employee answer lifecycle local role flow

## Scope

- Task: `batch-202-organization-training-employee-answer-lifecycle-local-role-flow`
- Execution profile: `local_unit_tdd`
- Evidence mode: redacted local evidence only
- Allowed implementation surface: `src/server/contracts/**`, `src/server/services/**`, plus task plan, evidence, audit, and queue state

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Plan

1. Add a failing unit test for a metadata-only employee answer lifecycle read-model.
2. Represent only local role-flow metadata: visible training version, current answer status, available employee actions, and redaction status.
3. Reuse existing organization-training visibility and answer lifecycle helpers.
4. Add contract DTOs and a service helper without route, repository, schema, provider, dependency, or external-service changes.
5. Run focused unit test, lint, typecheck, diff check, readiness, evidence, audit, commit, and approved closeout.

## Risk Controls

- Do not read or modify `.env*`.
- Do not expose question body, standard answer, analysis, raw answer, provider payload, formal `answer_record` identifiers, row data, or private data.
- Do not touch schema/drizzle/migrations, package files, lockfiles, routes, UI, provider/model code, cloud/deploy/payment, or external services.
- Keep output API fields camelCase and use glossary terms: `organization_training`, `employee`, `answer`, `mock_exam`, `practice`, `answer_record`.
