# Phase 4 Student Paper Access Baseline Security Review

## Metadata

- Task id: `phase-4-student-paper-access-baseline`
- Review date: 2026-05-19
- Risk types: `authorization`, `api_contract`, `data_contract`, `student`
- Verdict: `APPROVE`

## Scope Reviewed

- Student-facing paper scope, list, and detail API baseline.
- Route handler authentication boundary through `StudentPaperUserContext`.
- Service authorization rules that combine current user context, effective authorization scopes, and published paper metadata.
- DTO mapping from snake_case storage rows to camelCase API data.

## Findings

No blocking findings.

## Security Controls Confirmed

- User context is required before `listScopes`, `listStudentPapers`, or `getStudentPaper` can call the service.
- Student paper list access uses effective `authorization` scopes and does not trust route or query input alone.
- Multiple effective scopes require explicit `profession` and `level` selection to avoid accidental paper metadata leakage.
- Out-of-scope list requests return a typed `403301` response with `data: null`.
- Missing and unauthorized detail access both return `404301` so a student cannot enumerate paper existence by `publicId`.
- Student-facing DTOs expose `publicId` and camelCase fields only; numeric database `id` values are not present.
- `paper_snapshot` is only exposed through the authorized detail DTO.
- Runtime route files use unavailable service and unavailable resolver until real session and repository wiring lands.

## Accepted Gaps

- Repository implementation is contract-only in this task; database querying for published paper rows is deferred to a later integration task.
- Runtime session resolver is intentionally unavailable, matching existing baseline routes, so live access returns the standard unauthorized response until auth wiring is introduced.
- The service relies on repository rows to represent published-only papers; repository-level published filtering must be enforced when the real repository implementation is added.

## Evidence

- Targeted tests covered mapper, validator, service authorization, and route handler behavior.
- Queue validation passed:
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `npm.cmd run test:unit`
  - Route response contract scan
  - Service keyword scan for `authorization`, `paper_snapshot`, and `published`
  - Naming convention scan
