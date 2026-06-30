# Security Unit A Dependency Package Advisory Remediation Traceability

## Task

- Task id: `security-unit-a-dependency-package-advisory-remediation-2026-06-29`
- Branch: `codex/unit-a-dependency-advisory-20260629`
- Status: blocked for closeout by pre-existing unit baseline failure
- Human approval: user authorized `Unit A: dependency/package advisory remediation`

## Requirement Mapping

| Requirement                                                 | Implementation                                                                                                                               | Evidence                                                           |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Remediate dependency/package advisory surface only          | Updated `package.json` and `pnpm-lock.yaml` only for package manager, dependency, and override resolution                                    | `corepack pnpm audit --audit-level low` passed                     |
| Avoid blind remediation                                     | Confirmed affected versions and fixed-version boundaries before each package change; compared focused unit failure against `master` baseline | Baseline focused unit test failed before Unit A dependency changes |
| Preserve source/test/DB/Provider/browser/release boundaries | No source, test, DB, migration, script, browser, Provider, or release files changed                                                          | Scoped diff and redacted evidence                                  |
| Prevent regression before closeout                          | Ran lint, typecheck, full unit, and focused unit reproduction                                                                                | Full unit gate blocked by pre-existing baseline failure            |
| Do not commit unless validation passes                      | No commit, merge, or push performed                                                                                                          | State and queue mark closeout blocked                              |

## Package Change Trace

- `pnpm`: `10.33.4` -> `10.34.4`
- `shadcn`: `4.7.0` -> `4.12.0`
- `@vitejs/plugin-react`: `6.0.2` -> `6.0.3`
- `vitest`: `4.1.6` -> `4.1.9`
- `pnpm.overrides`: `@babel/core@7.29.6`, `esbuild@0.28.1`, `hono@4.12.27`, `js-yaml@4.3.0`,
  `postcss@8.5.16`, `qs@6.15.3`, `undici@7.28.0`, `vite@8.1.0`

## Closeout Trace

- Advisory remediation: implemented
- Audit through low severity: pass
- Lint: pass
- Typecheck: pass
- Full unit: blocked by pre-existing baseline failure
- Commit/merge/push: not performed
- Next minimal task: `security-unit-a-validation-baseline-test-fixture-repair-2026-06-29`
