# docs-adr-runtime-dependency-alignment Evidence

## Scope

- Branch: `codex/docs-adr-runtime-dependency-alignment`
- Task kind: `docs_only`
- User approval: implement the serial closeout and repair plan; each task may commit, fast-forward merge into `master`, push `origin/master`, and clean up the short branch.
- Blocked areas respected: no product code, tests, dependency, lockfile, schema, migration, env/secret, provider, deploy, payment, external-service, PR, force-push, or Cost Calibration Gate work.

## Implementation Evidence

- Added `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`.
- ADR-006 records the current runtime baseline from `package.json`:
  - Next.js 16.2.6;
  - React 19.2.4 and React DOM 19.2.4;
  - Better Auth 1.6.x with Drizzle adapter;
  - Drizzle ORM 0.45.x and drizzle-kit 0.31.x;
  - Tailwind CSS 4 and current local test/tooling baseline.
- ADR-006 records deferred dependency areas from ADR-001:
  - Vercel AI SDK and provider packages;
  - LangChain text splitters;
  - Markdown/math rendering packages;
  - pgvector as an infrastructure/database capability.
- ADR-001 was not modified.

## Validation

### Scoped Prettier

Command:

```powershell
npm.cmd exec -- prettier --write docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md docs/05-execution-logs/task-plans/2026-06-12-docs-adr-runtime-dependency-alignment.md
```

Result:

- PASS

### Lint

Command:

```powershell
npm.cmd run lint
```

Result:

- PASS

### Typecheck

Command:

```powershell
npm.cmd run typecheck
```

Result:

- PASS

### Whitespace Check

Command:

```powershell
git diff --check
```

Result:

- PASS

## Residual Risk

- This task did not install or remove any package.
- Deferred AI/RAG/Markdown dependencies still require separate dependency gate approval before implementation.
- No provider, env, schema, migration, staging, production, deploy, payment, external-service, e2e, or Cost Calibration Gate validation was run.
