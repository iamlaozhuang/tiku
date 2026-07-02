# AI generation post query wording Provider rerun

## Scope

- Task id: `ai-generation-post-query-wording-provider-rerun-2026-07-02`
- Branch: `codex/ai-generation-post-query-wording-rerun`
- Goal: after the grounding query token repair and ordinary UI wording repair, rerun localhost owner-preview AI 出题 / AI组卷 surfaces to confirm the previous findings are actually closed.
- This is a docs/state plus local runtime walkthrough task. It does not edit source, tests, dependencies, schema, migrations, seeds, or env files.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Matrix

Roles:

- `personal_advanced_student`
- `org_advanced_employee`
- `org_advanced_admin`
- `content_admin`
- `standard_roles_expected_denial`
- `ops_admin_observation_only`

Workflows:

- `ai_question_generation`
- `ai_paper_generation`

Cross-role checks:

- Resource-pack/RAG grounding must be sufficient before Provider execution; otherwise the UI must block or show business-language insufficient-material feedback.
- Ordinary user/admin UI must not show local contract, redaction, evidence, Provider payload, prompt, internal governance, or raw status wording.
- Generated content must stay within available marketing or monopoly resource scope.
- Logistics generation remains blocked until a local logistics resource package exists.
- Every applicable matrix cell must record `pass`, `fail`, `blocked`, or `not_applicable`.

## Runtime Boundary

- Localhost only: `http://localhost:3000`.
- Provider calls are allowed only through localhost UI and only after sufficient grounding is visible.
- Provider sample cap: at most 6 submit attempts total.
- Credential input is allowed for localhost login only. Credentials, cookies, sessions, localStorage, Authorization headers, `.env*` values, DB rows, raw DOM, screenshots, traces, Provider payloads, prompts, raw AI I/O, and full generated/question/material/resource/chunk content must not be recorded.
- No direct DB connection or mutation.
- No runtime resource mutation.
- No e2e automation.
- No staging/prod/cloud/deploy.
- No Cost Calibration, release readiness, or final Pass claim.

## Execution Steps

1. Confirm working tree and branch.
2. Restart or verify local dev server.
3. Open localhost in the in-app browser.
4. Use only approved localhost role login input; do not record sensitive values.
5. Walk the role/function matrix, including the two cross-cutting issues explicitly called out by the owner.
6. Record redacted evidence only as statuses, counts, workflow labels, duration buckets, and failure categories.
7. Run validation commands.
8. Commit, fast-forward merge to `master`, push, and delete the short branch only if validation passes.

## Validation

- `npm.cmd run typecheck`
- `git diff --check`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-ai-generation-post-query-wording-provider-rerun.md docs/05-execution-logs/evidence/2026-07-02-ai-generation-post-query-wording-provider-rerun.md docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-post-query-wording-provider-rerun.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-post-query-wording-provider-rerun-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-post-query-wording-provider-rerun-2026-07-02 -SkipRemoteAheadCheck`

## Stop Conditions

- UI exposes sensitive data or internal raw artifacts.
- Provider output appears ungrounded, off-domain, or mixed with unsupported logistics content.
- Grounding is still zero/weak for available marketing or monopoly resources.
- A workflow needs source, DB, env, dependency, schema, migration, seed, e2e, staging, prod, deploy, release readiness, final Pass, or Cost Calibration work.
