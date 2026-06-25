# Organization Training Advanced Employee Visible-List 500 Runtime Diagnostic Repair Evidence

Task id: `organization-training-advanced-employee-visible-list-500-runtime-diagnostic-repair-2026-06-25`

Branch: `codex/org-training-visible-list-500-20260625`

## Fresh Approval

User approved local read-only runtime/account/assignment diagnostic for the `org_advanced_employee` visible-list 500 on 2026-06-25. If the diagnostic proves a source defect, the approval includes the smallest source repair plus focused unit/browser rerun. DB write, seed/schema/migration, account mutation, Provider/Cost, staging/prod, payment, and external service work remain blocked unless separately approved.

## Scope Guard

- Local DB/runtime/account/assignment diagnostic: yes, local read-only status/count diagnostics only.
- DB write or seed write executed: no.
- Schema/migration executed: no.
- Account/user/authorization/employee mutation executed: no.
- Source repair executed: yes, repository SQL binding only.
- Focused unit test executed: yes.
- Focused browser rerun executed: yes.
- `.env*` direct read/write by diagnostic scripts: no. One discarded exact default-runtime diagnostic attempt may have invoked the existing runtime local-env loader before timing out; no env value was printed, copied, recorded, or committed. The final exact repository diagnostic used an injected local Docker database handle and did not rely on `.env*`.
- Raw credentials, account identifiers, tokens, cookies, local/session storage, raw DB rows, raw public ids, raw DOM, screenshots, traces, Provider payloads, prompts, generated content, or private answer content recorded: no.
- Standard/Advanced MVP final Pass claimed: no.

## Diagnostic Results

Read-only DB/runtime checks:

| Check                                      | Result        |
| ------------------------------------------ | ------------- |
| Local Docker PostgreSQL service            | healthy       |
| Current-schema DB organization tables      | present       |
| Published organization-training count      | nonzero       |
| Published rows with null scope/publishedAt | zero          |
| Private role account file                  | present       |
| Eight role labels matched to expected type | yes           |
| Target advanced employee record            | active        |
| Target advanced employee visible versions  | one published |

Discarded diagnostic attempts:

| Attempt                               | Result                                                                                          |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Read-only role summary via temp table | failed because PostgreSQL blocks `CREATE TEMP TABLE` inside `BEGIN READ ONLY`; no durable write |
| Read-only role summary retry          | failed because of SQL identifier escaping; no durable write                                     |
| Repository diagnostic via stdin       | failed before repository call because the TypeScript runner did not transpile stdin             |
| Repository diagnostic via eval        | failed before repository call because top-level `await` was not supported in CJS eval output    |

Root cause:

- Direct PostgreSQL/postgres.js JSONB `?| ARRAY[...]` query for the target advanced employee succeeded and returned one
  visible published version.
- Exact repository invocation before repair failed with PostgreSQL code `22P02`, class `malformed array literal`.
- The source defect was `listPublishedVersionsForEmployeeOrganization` passing `visibleOrganizationPublicIds` as one
  bound value to JSONB `?|`, while PostgreSQL requires a `text[]` right operand.

## Repair Results

- Updated `src/server/repositories/organization-training-repository.ts`.
- Added `createOrganizationTrainingVisibleOrganizationPublicIdArraySql` to bind each visible organization public id as a
  separate SQL parameter inside `ARRAY[...]::text[]`.
- Updated `listPublishedVersionsForEmployeeOrganization` to use the text-array helper with the existing JSONB `?|`
  predicate.
- Added focused unit coverage in `src/server/repositories/organization-training-repository.test.ts` proving the SQL
  compiles to `ARRAY[$1, $2]::text[]` with two independent parameters, not one nested array/string parameter.

## Validation Results

- `npx.cmd playwright --version`: passed, Playwright `1.60.0`.
- Local read-only schema/count diagnostics: passed after discarded script corrections above.
- Exact repository diagnostic after repair: passed; target advanced employee visible-list returned one published version.
- Focused browser rerun:

| Row                     | Landing | Direct route             | Training rows | Numeric inputs | Row actions | API status/code  | Result |
| ----------------------- | ------- | ------------------------ | ------------- | -------------- | ----------- | ---------------- | ------ |
| `org_standard_employee` | `/home` | `/organization-training` | 0             | 0              | 0           | `200` / `409076` | pass   |
| `org_advanced_employee` | `/home` | `/organization-training` | 1             | 3              | 3           | `200` / `0`      | pass   |

- `npm.cmd run test:unit -- src/server/repositories/organization-training-repository.test.ts`: passed, 21 tests.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npx.cmd prettier --check --ignore-unknown src/server/repositories/organization-training-repository.ts src/server/repositories/organization-training-repository.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-organization-training-advanced-employee-visible-list-500-runtime-diagnostic-repair.md docs/05-execution-logs/evidence/2026-06-25-organization-training-advanced-employee-visible-list-500-runtime-diagnostic-repair.md docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-advanced-employee-visible-list-500-runtime-diagnostic-repair.md`:
  passed.
- `git diff --check`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-advanced-employee-visible-list-500-runtime-diagnostic-repair-2026-06-25`:
  passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-advanced-employee-visible-list-500-runtime-diagnostic-repair-2026-06-25 -SkipRemoteAheadCheck`:
  passed.

## Closeout Result

Pending commit, fast-forward merge to `master`, push `origin/master`, and short-branch cleanup.

No Standard/Advanced MVP final Pass is claimed.
