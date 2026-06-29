# Security Dependency Deprecated Transitive Review Audit Review

- Task id: `security-dependency-deprecated-transitive-review-2026-06-29`
- Branch: `codex/security-dependency-deprecated-transitive-review-20260629`
- Review status: approved
- Date: `2026-06-29`

## Scope Review

| Check                                                 | Status | Notes                                                                                    |
| ----------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| State/queue/task plan materialized before review      | pass   | current branch contains task-scoped docs/state materialization                           |
| Required standards, ADRs, and dependency gate read    | pass   | AGENTS, code taste, open-source standard, ADRs, state/queue, and dependency SOP read     |
| Package/lockfile edits avoided                        | pass   | manifest/workspace/lockfile surfaces were read-only                                      |
| Dependency install/update/remove/audit fix avoided    | pass   | no package manager dependency mutation command executed                                  |
| Network advisory lookup avoided                       | pass   | no registry, CVE, GHSA, or public advisory lookup executed                               |
| Source/test/schema/migration edits avoided            | pass   | blocked by task boundary                                                                 |
| DB connection/raw row/mutation avoided                | pass   | no DB action                                                                             |
| Provider/AI call avoided                              | pass   | Provider budget remained zero                                                            |
| Browser/dev server/runtime avoided                    | pass   | no browser or runtime action                                                             |
| Release readiness/final Pass/Cost Calibration avoided | pass   | all remain blocked                                                                       |
| Sensitive evidence avoided                            | pass   | evidence records package names, versions, dependency chains, and redacted summaries only |

## Findings

- `pnpm-lock.yaml` contains 3 deprecated transitive entries.
- Two entries belong to the `drizzle-kit@0.31.10` dependency chain and are marked as merged into `tsx`.
- One entry belongs to the `shadcn` -> `node-fetch` -> `fetch-blob` chain and is marked as superseded by native DOMException support.
- No package/lockfile/source/test/schema/migration change was made.
- No current public advisory status was checked because the task explicitly blocks network lookup.
- A separate remediation gate task was seeded so any package or lockfile change remains behind fresh dependency approval.

## Residual Risk

- Deprecated dependency markers are maintenance risk indicators, not confirmed vulnerability findings by themselves.
- Current CVE/GHSA/NPM advisory status is still unknown until the public advisory lookup task is explicitly materialized.
- Any dependency upgrade, package classification change, lockfile refresh, or override requires a separate dependency gate and human approval evidence.
- Runtime impact was not tested because the task is offline docs/state review only.

## Audit Result

APPROVE: No blocking findings for this docs/state-only offline deprecated transitive dependency review. Scoped formatting, diff check, and Module Run v2 governance gates are recorded in evidence. No release readiness, final Pass, or Cost Calibration conclusion is made.
