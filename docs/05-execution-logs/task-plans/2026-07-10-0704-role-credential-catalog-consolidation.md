# 2026-07-10 0704 Role Credential Catalog Consolidation Task Plan

## Task

- Task id: `0704-role-credential-catalog-consolidation-2026-07-10`
- Branch: `codex/0704-role-credential-catalog`
- Mode: local private credential consolidation plus redacted readiness preflight.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/05-execution-logs/handoffs/2026-07-10-0704-private-account-usage-guide.md`
- Recent 2026-07-09 / 2026-07-10 redacted readiness evidence and audits for learner AI and 0704 private account usage.

## Scope

1. Create one canonical private catalog at `D:\tiku-local-private\acceptance\0704-role-credential-catalog.private.md`.
2. Keep actual account and password values only in the private catalog.
3. Update the private index so future lookup starts from the canonical catalog.
4. Archive superseded private credential source files under `D:\tiku-local-private\acceptance\archive\superseded-2026-07-10\`.
5. Run a redacted localhost readiness preflight for the 9 core role labels:
   - `super_admin`
   - `ops_admin`
   - `content_admin`
   - `personal_standard_student`
   - `personal_advanced_student`
   - `org_standard_admin`
   - `org_advanced_admin`
   - `org_standard_employee`
   - `org_advanced_employee`
6. Update repository handoff, evidence, audit, project state, and queue with only role labels, route labels, authorization context categories, readiness states, and command results.

## Boundaries

- No credential, phone number, password, cookie, token, session, Authorization header, localStorage, env value, DB URL, raw DB row, internal numeric id, Provider payload, raw prompt, raw AI output, full question, full paper, material, resource, chunk, or private fixture content may be written to chat, repository files, evidence, or audit.
- No package or lockfile change.
- No source code or test code change unless a separately confirmed product code defect is found.
- No destructive DB operation.
- No staging/prod/deploy/env/secret/Cost Calibration work.
- No Provider-enabled execution.
- No screenshots or raw DOM capture.
- Product route writes are allowed only for non-destructive localhost account-readiness correction when the supported product path and 0704 target are confirmed without printing secrets. Direct DB writes remain blocked without separate approval.

## Implementation Plan

1. Reconfirm git branch and clean baseline.
2. Use an in-memory private scan to build the candidate role matrix without printing credential values.
3. Generate the canonical private catalog outside the repository.
4. Update the private index to point at the canonical catalog and mark superseded source files.
5. Archive only superseded credential documents, not screenshots, runtime logs, design boards, or unrelated private directories.
6. Run redacted readiness preflight from the canonical catalog.
7. If a role fails and cannot be corrected through approved product paths, record the blocked readiness state and stop before business acceptance.
8. Write redacted repository evidence/audit and update the handoff.
9. Run formatting, lint/typecheck, diff, redaction, and Module Run v2 gates.
10. Perform adversarial review for role boundaries, data boundaries, sensitive information, standard/advanced edition separation, and employee/admin privacy boundaries.

## Risk Controls

- The canonical private catalog reduces lookup ambiguity but does not by itself prove runtime login readiness.
- Admin role readiness must not be inferred from old markdown credentials.
- Archiving superseded private files is reversible and avoids destructive cleanup.
- Readiness evidence records only categories, not raw values.
