# Staging Purchased Resource Assessment Plan

## Goal

Record the currently purchased Tencent Cloud staging resource from owner-provided screenshots and assess whether it fits Tiku staging needs.

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- Owner-provided screenshots:
  - `QQ_1780322766720.png`
  - `QQ_1780322794879.png`
  - `QQ_1780322831731.png`
  - `QQ_1780322852797.png`

## Scope

- Docs-only record and recommendation.
- No cloud console operation.
- No deployment.
- No secret/env handling.
- No product code, script, test, dependency, schema, migration, DB, provider, or destructive operation.

## Plan

1. Record purchased CVM configuration as evidence without secrets.
2. Assess fit against ADR-004/ADR-005 staging boundaries.
3. List remaining staging resources to purchase or configure.
4. Prefer cost-controlled staging parameters.
5. Record official Tencent Cloud references used for current assumptions.
