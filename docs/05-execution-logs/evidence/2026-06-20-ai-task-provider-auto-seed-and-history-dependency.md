# AI Task Provider Auto Seed And History Dependency Evidence

## Summary

The local `master` fast-forward merge for `fix(agent): dedupe module seed history batches` was completed first. Then the
approved ai-task-and-provider auto-seed transaction appended four pending local implementation tasks:

- `batch-212-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`
- `batch-213-ai-task-and-provider-local-task-request-policy-and-result-referen`
- `batch-214-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence`
- `batch-215-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence`

The transaction recorded `autoDriveLocalImplementationApproval` and did not record standing unattended closeout approval.

## RED

After seed, `Get-TikuNextAction.ps1 -VerboseHistory` initially reported:

- `dependency_missing:phase-70-advanced-ai-task-domain-implementation-planning`

The source planning task exists in `task-history-index.yaml` under the real `entries:` root. A focused smoke change in
`Get-TikuNextAction.Smoke.ps1` changed the history fixture root from `tasks:` to `entries:`. Before the parser fix, the
smoke failed because archived matrix rows were counted as missing.

## GREEN

After the parser fix:

| Command                                                                                                                                                                                                                                                                                                                                                                                                     | Result | Notes                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.ps1 -ExpectedModule ai-task-and-provider`                                                                                                                                                                                                                                      | pass   | Four seed tasks passed MECE and safety review.                                                                                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-70-advanced-ai-task-domain-implementation-planning -CandidateTaskId batch-212-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract -EvidencePath docs\05-execution-logs\evidence\2026-06-20-module-run-v2-auto-seed-ai-task-and-provider.md` | pass   | Candidate approval anchors, allowed files, blocked files, lint/typecheck/diff/focused-test anchors, and closeout gate are present.               |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`                                                                                                                                                                                                                                                                                               | pass   | Next-action history `entries:` dependency parsing smoke passed.                                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`                                                                                                                                                                                                                                                                                     | pass   | Reports `nextExecutableTask: batch-212-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`; only dirty-worktree closeout remains. |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                                                                                                          | pass   | ESLint completed with exit code 0.                                                                                                               |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                                                                                                     | pass   | `tsc --noEmit` completed with exit code 0.                                                                                                       |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                          | pass   | No whitespace errors.                                                                                                                            |

## Boundary

- No provider/model call or provider configuration.
- No `.env.local`, `.env.example`, schema, drizzle, migration, dependency, package, lockfile, deploy, payment, PR, force-push, or Cost Calibration Gate work.
- No product runtime source under `src/` changed.

## Next Action

Close this seed transaction commit before claiming `batch-212-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`.
