# batch-203 organization-training paper and mock_exam context usage

## Scope

- Task: `batch-203-organization-training-paper-and-mock-exam-context-usage-without-ex`
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

1. Add a failing unit test for metadata-only paper/mock_exam context usage.
2. Represent only allowed context metadata and formal usage policy.
3. Reuse existing `OrganizationTrainingSourceContextDto` and formal usage policy semantics.
4. Avoid route, repository, schema, provider, dependency, and external-service changes.
5. Run focused unit test, lint, typecheck, diff check, readiness, evidence, audit, commit, and approved closeout.

## Risk Controls

- Do not read or modify `.env*`.
- Do not expose full paper content, question bodies, standard answers, analysis, raw answers, provider payloads, prompts, model outputs, row data, or private data.
- Do not touch schema/drizzle/migrations, package files, lockfiles, routes, UI, provider/model code, cloud/deploy/payment, or external services.
- Keep API fields camelCase and use glossary terms: `paper`, `mock_exam`, `organization_training`, `source_context`.
