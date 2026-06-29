# Security Dependency Supply Chain Inventory Traceability

- Task id: `security-dependency-supply-chain-inventory-2026-06-29`
- Branch: `codex/security-dependency-supply-chain-inventory-20260629`
- Scope: offline dependency and supply-chain inventory
- Network advisory lookup: blocked in this task
- Status: closed_pass

## Governance Boundary

| Boundary                                      | Status       | Evidence                                                                             |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------ |
| Task materialized before manifest/lock reads  | pass         | state, queue, and task plan created before package/lock inventory                    |
| Package/lockfile modification                 | not executed | docs/state-only inventory task                                                       |
| Dependency install/update/remove/audit fix    | not executed | no dependency command executed                                                       |
| Network advisory/registry lookup              | not executed | current CVE/GHSA status split into future explicitly scoped task                     |
| Source/test/schema/migration modification     | not executed | blocked by task boundary                                                             |
| DB connection/raw row/mutation                | not executed | blocked by task boundary                                                             |
| Provider/AI execution                         | not executed | installed AI SDK packages remain dependency facts only                               |
| Browser/dev server/runtime                    | not executed | blocked by task boundary                                                             |
| Release readiness/final Pass/Cost Calibration | not executed | all gates remain blocked                                                             |
| Sensitive evidence capture                    | not executed | evidence records package names, counts, boundary labels, and redacted summaries only |

## Surface Index

| Surface                           | Count / Status | Inventory Use                                       |
| --------------------------------- | -------------- | --------------------------------------------------- |
| `package.json`                    | present        | direct dependency, dev dependency, and script index |
| `pnpm-lock.yaml`                  | present        | lockfile package/snapshot and transitive index      |
| `pnpm-workspace.yaml`             | present        | built dependency policy index                       |
| `package-lock.json`               | absent         | package-manager consistency check                   |
| `package-lock.yaml`               | absent         | package-manager consistency check                   |
| `.npmrc`                          | absent         | private registry/token presence check only          |
| `.pnpmfile.cjs`                   | absent         | install hook policy check only                      |
| `patches/**`                      | absent         | patch policy check only                             |
| direct runtime dependencies       | 17             | package area baseline                               |
| direct development dependencies   | 20             | package area baseline                               |
| lockfile package entries          | 1163           | transitive volume risk                              |
| lockfile snapshot entries         | 1054           | resolved graph volume risk                          |
| lockfile `hasBin` package entries | 47             | CLI/binary execution surface                        |
| lockfile `requiresBuild` entries  | 0              | native build script surface                         |
| lockfile deprecated entries       | 3              | transitive maintenance watch                        |

## Direct Dependency Areas

| Area                | Packages                                                                                             | Status        |
| ------------------- | ---------------------------------------------------------------------------------------------------- | ------------- |
| Framework/runtime   | `next`, `react`, `react-dom`                                                                         | aligned       |
| Auth                | `better-auth`, `@better-auth/drizzle-adapter`                                                        | aligned       |
| ORM/database        | `drizzle-orm`, `postgres`, `drizzle-kit`                                                             | aligned       |
| AI SDK              | `ai`, `@ai-sdk/alibaba`, `@ai-sdk/openai-compatible`                                                 | gated_runtime |
| UI/styling          | `@base-ui/react`, `shadcn`, `lucide-react`, `tailwind-merge`, `tw-animate-css`, `tailwindcss`        | aligned       |
| Test/tooling        | `@playwright/test`, Testing Library packages, `vitest`, `jsdom`, ESLint, Prettier, TypeScript, Husky | aligned       |
| Deferred by ADR-006 | `@langchain/textsplitters`, `react-markdown`, `remark-math`, `remark-gfm`, `rehype-katex`, `katex`   | not_installed |

## Findings Matrix

| Id          | Risk Family                                    | Severity | Status                  | Evidence Summary                                                                                                                      | Follow-up                                                                                        |
| ----------- | ---------------------------------------------- | -------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| dep-inv-001 | package-manager consistency                    | low      | covered_watch           | `packageManager` is pnpm and only `pnpm-lock.yaml` is present; npm lockfiles are absent.                                              | Continue package-manager consistency check in dependency tasks.                                  |
| dep-inv-002 | transitive dependency volume                   | medium   | needs_scoped_review     | Lockfile has 1163 package entries and 1054 snapshots; this inventory did not execute network advisory checks.                         | `security-dependency-public-advisory-lookup-2026-06-29`                                          |
| dep-inv-003 | deprecated transitive packages                 | medium   | needs_scoped_review     | Lockfile contains 3 deprecated transitive entries; no dependency change is authorized here.                                           | `security-dependency-deprecated-transitive-review-2026-06-29`                                    |
| dep-inv-004 | CLI/binary execution surface                   | medium   | monitor                 | Lockfile contains 47 `hasBin` package entries and 0 `requiresBuild` entries; workspace ignores selected built dependency scripts.     | `security-dependency-install-script-binary-surface-review-2026-06-29`                            |
| dep-inv-005 | installed Provider/AI runtime package boundary | medium   | covered_watch           | AI SDK packages are installed but remain gated dependency facts only; no Provider execution/configuration is approved.                | Monitor through future AI runtime tasks; no duplicate repair task seeded.                        |
| dep-inv-006 | deferred dependency gate                       | medium   | covered_watch           | ADR-006 deferred RAG text-splitting and Markdown/math dependencies are absent as expected and still require dependency gate approval. | None until owner selects RAG/rich-text task.                                                     |
| dep-inv-007 | dependency freshness/advisory currency         | medium   | blocked_by_current_task | Current public CVE/GHSA/advisory lookup was blocked by this task's offline boundary.                                                  | `security-dependency-public-advisory-lookup-2026-06-29` with explicit network scope if approved. |

## Task Split

| Future Task Id                                                        | Type                    | Suggested Priority | Approval Needed                                                                  |
| --------------------------------------------------------------------- | ----------------------- | ------------------ | -------------------------------------------------------------------------------- |
| `security-dependency-public-advisory-lookup-2026-06-29`               | read-only network audit | p1                 | explicit public advisory/network scope; no install, no fix, no lockfile change   |
| `security-dependency-deprecated-transitive-review-2026-06-29`         | dependency review       | p2                 | fresh manifest/lock read scope; dependency change requires separate approval     |
| `security-dependency-install-script-binary-surface-review-2026-06-29` | dependency review       | p2                 | fresh manifest/lock read scope; no package manager execution by default          |
| `test-acceptance-regression-risk-inventory-2026-06-29`                | regression inventory    | p1                 | already queued next broad lane; no browser/runtime/source/test change by default |

## Next Recommended Task

The next smallest safe broad-lane task is `test-acceptance-regression-risk-inventory-2026-06-29`.

If current dependency vulnerability status becomes the owner priority, run
`security-dependency-public-advisory-lookup-2026-06-29` first with an explicit network-read-only boundary.
