# AP-08 Organization Data Export Boundary Detailing Audit Review

## Review Decision

APPROVE L0 DETAILING ONLY. AP-08 now has an organization data export boundary packet, but no export, file generation,
database, privacy data access, storage, external service, deployment, source, test, or Cost Calibration execution is
approved.

## Scope Review

- Task id: `ap-08-org-data-export-boundary-detailing`
- Branch: `codex/ap-08-org-data-export-boundary-detailing`
- Changed-file boundary:
  - `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/task-plans/2026-06-19-ap-08-org-data-export-boundary-detailing.md`
  - `docs/05-execution-logs/evidence/2026-06-19-ap-08-org-data-export-boundary-detailing.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-19-ap-08-org-data-export-boundary-detailing.md`

## Boundary Review

- `UC-FUTURE-ORG-DATA-EXPORT` remains `release_blocked`.
- The L0 packet defines export scope, file generation, permission, privacy, audit, retention, rollback, and redaction
  approval dimensions.
- The packet does not read `.env*`, read DB rows, generate files, create download URLs, write storage, call external
  services, deploy, or modify runtime source/tests/schema/dependencies.

## Residual Risk

AP-08 remains L3 because real export work may expose private organization data, student or employee answer content, raw
rows, generated files, download URLs, and deployment/storage surfaces. Fresh approval must name exact files, commands,
dataset, row ceilings, field allowlist, privacy review, rollback, stop conditions, and redaction before execution.
