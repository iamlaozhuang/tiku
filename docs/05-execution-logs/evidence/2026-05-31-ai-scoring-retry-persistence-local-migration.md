# AI Scoring Retry Persistence Local Migration Check

Summary

```text
result: blocked
scope: local_verification/blocked_gate
changed surfaces: local/dev database migration attempt, evidence, project-state handoff
gates: db identity check/drizzle migrate/post-migration read-only verification/readiness/git inventory/naming/quality gate
forbiddenScope: .env modification/env disclosure/dependency change/drizzle-kit push/destructive SQL/staging/prod/cloud/deploy/real provider
residualGaps: local/dev database migration history drift prevents safe drizzle-kit migrate completion
```

## Human Approval

- User confirmed `.env.local` `DATABASE_URL` points to local/dev only, not staging/prod/shared cloud.
- User approved reading `.env.local` only for this local migration execution.
- User approved:
  - read-only DB identity check
  - `npx.cmd drizzle-kit migrate`
  - read-only post-migration verification
- Still forbidden:
  - print/modify/commit/expose env or secrets
  - `drizzle-kit push`
  - destructive SQL
  - staging/prod/cloud/deploy/real provider

No database URL, credential, provider payload, prompt, student answer, model response, or secret is recorded in this evidence.

## Database Identity Check

Command:

```powershell
node C:\tmp\tiku-local-dev-db-check.js
```

Result: pass.

Sanitized output:

```json
{
  "envFileRead": true,
  "databaseName": "tiku",
  "schemaName": "public",
  "serverVersion": "16.14 (Debian 16.14-1.pgdg12+1)",
  "preMigration": {
    "attemptTableExists": false,
    "attemptStatusTypeExists": false,
    "migrationTableExists": true
  }
}
```

Interpretation:

- `.env.local` was read under explicit approval, but no env value was printed or written.
- The target is a PostgreSQL local/dev database named `tiku`.
- Before migration, `ai_scoring_attempt` and `ai_scoring_attempt_status` were absent.

## Migration Attempt

Command:

```powershell
npx.cmd drizzle-kit migrate
```

Result: fail, exit code 1.

Sanitized output:

```text
No config path provided, using default 'drizzle.config.ts'
Reading config file 'D:\tiku\drizzle.config.ts'
Using 'postgres' driver for database querying
NOTICE: schema "drizzle" already exists, skipping
NOTICE: relation "__drizzle_migrations" already exists, skipping
applying migrations...
```

Command:

```powershell
npx.cmd drizzle-kit migrate --config=drizzle.config.ts
```

Result: fail, exit code 1.

Sanitized output:

```text
Reading config file 'D:\tiku\drizzle.config.ts'
Using 'postgres' driver for database querying
NOTICE: schema "drizzle" already exists, skipping
NOTICE: relation "__drizzle_migrations" already exists, skipping
applying migrations...
```

Safety decision:

- No raw SQL was executed.
- No manual migration table repair was attempted.
- No destructive data operation was attempted.
- No `drizzle-kit push` was run.

## Post-Failure Read-Only Verification

Command:

```powershell
node C:\tmp\tiku-local-dev-db-check.js
```

Result: pass.

Sanitized output:

```json
{
  "envFileRead": true,
  "databaseName": "tiku",
  "schemaName": "public",
  "serverVersion": "16.14 (Debian 16.14-1.pgdg12+1)",
  "preMigration": {
    "attemptTableExists": false,
    "attemptStatusTypeExists": false,
    "migrationTableExists": true
  }
}
```

Interpretation:

- `drizzle-kit migrate` did not apply `20260531104500_add_ai_scoring_attempt.sql`.
- The required retry persistence database objects remain absent in local/dev.

## Migration Table Inventory

Command:

```powershell
node C:\tmp\tiku-local-dev-db-migrations.js
```

Result: pass.

Sanitized output:

```json
{
  "migrationCount": 2,
  "latest": [
    {
      "id": 2,
      "hashPrefix": "fa36de0ed74d",
      "createdAt": "1779380681502"
    },
    {
      "id": 1,
      "hashPrefix": "429f4f84ae15",
      "createdAt": "1779347323411"
    }
  ]
}
```

## Local/Dev Drift Check

Command:

```powershell
node C:\tmp\tiku-local-dev-db-drift-check.js
```

Result: pass.

Sanitized output:

```json
{
  "question_exists": true,
  "question_case_analysis": false,
  "question_calculation_process": false,
  "model_config_snapshot_policy": false,
  "question_fill_blank_answers": true,
  "ai_scoring_attempt_exists": false
}
```

Interpretation:

- The local/dev `drizzle.__drizzle_migrations` table records only two migrations.
- At least one later schema surface, `question.fill_blank_answers`, exists even though the migration inventory does not reflect the expected full migration sequence.
- Other later schema surfaces are absent.
- This is a local/dev migration history drift, not a code implementation failure.

## Blocked Gate

The actual AI scoring retry persistence migration remains blocked for this local/dev database because the migration history and live schema are inconsistent. Continuing with raw SQL or manual migration-table edits would exceed the current safe boundary.

Recommended next safe choices:

1. Approve rebuilding/resetting the local/dev database from migrations and seed data. This is destructive and requires explicit approval.
2. Approve a separate local/dev drift reconciliation task that first produces a read-only inventory, then proposes a reviewable non-destructive repair plan. Any manual SQL or migration table change still requires explicit approval.
3. Point `.env.local` to a fresh empty local/dev database and run `npx.cmd drizzle-kit migrate` there.

## Validation

Validation commands for this evidence/state update:

```text
git diff --check: pass
node .\node_modules\prettier\bin\prettier.cjs --check docs/04-agent-system/state/project-state.yaml docs/05-execution-logs/evidence/2026-05-31-ai-scoring-retry-persistence-local-migration.md: initially failed on evidence markdown, then pass after scoped prettier --write
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1: pass
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master: pass
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1: pass
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1: initially failed on format:check for this evidence markdown, then pass after scoped prettier --write
```

Quality gate final pass details:

```text
lint: pass
typecheck: pass
test:unit: pass, 149 files / 621 tests
format:check: pass
naming: pass
readiness: pass
git completion readiness: pass
```

Build/e2e: skipped for this migration execution evidence update because no frontend, route, runtime, browser behavior, source code, schema file, or migration file was modified in this commit. The database migration command itself failed before applying any schema object.
