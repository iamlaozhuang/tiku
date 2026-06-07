# Phase 9 Authorization Expiry And Termination Completion Task Plan

## Metadata

- Task id: `phase-9-authorization-expiry-termination-completion`
- Branch: `codex/phase-9-authorization-expiry-termination-completion`
- Base: `master`
- Date: `2026-05-23`
- Task plan policy: `required`

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-8-product-surface-contract.md`
- `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-auth-session-account-completion.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-auth-session-account-completion-security-review.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/*.md`
- `docs/01-requirements/stories/*.md`
- Security references:
  - `javascript-typescript-nextjs-web-server-security.md`
  - `javascript-typescript-react-web-frontend-security.md`
  - `javascript-general-web-frontend-security.md`

## Recovery Baseline

- `git status --short --branch`: clean `master...origin/master` before branch creation.
- `git log -5 --oneline`: latest `775b689 merge: phase 9 auth session account completion`.
- `git branch --list`: only `master` before task branch creation.
- `git branch -r`: only `origin/HEAD -> origin/master` and `origin/master`.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass.
- Created task branch: `codex/phase-9-authorization-expiry-termination-completion`.

## Initial Claim Blocker And Handling

`Test-TaskClaimReadiness.ps1 -TaskId phase-9-authorization-expiry-termination-completion` initially failed because `phase-9-auth-session-account-completion` remained `status: committed` in `task-queue.yaml`, while repository evidence shows it has been merged and pushed:

- `master` and `origin/master` both point to merge commit `775b689`.
- User handoff states Phase 9 auth/session/account completion is complete, merged, and pushed.
- The claim script accepts dependency statuses `done`, `closed`, `pushed`, or `merged`.

Handling strategy:

1. Reconcile durable state by marking `phase-9-auth-session-account-completion` as `pushed`.
2. Move `project-state.yaml` current task to `phase-9-authorization-expiry-termination-completion` with status `claimed`.
3. Rerun `Test-TaskClaimReadiness.ps1` before editing runtime code.

This does not expand product scope and only fixes stale automation state needed for the required claim gate.

## Allowed Scope

Allowed files from queue:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-9-authorization-expiry-termination-completion.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-authorization-expiry-termination-completion.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-authorization-expiry-termination-completion-security-review.md`
- `src/app/(student)/**`
- `src/app/api/v1/authorizations/**`
- `src/app/api/v1/personal-auths/**`
- `src/app/api/v1/org-auths/**`
- `src/app/api/v1/practices/**`
- `src/app/api/v1/mock-exams/**`
- `src/server/auth/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Implementation Strategy

1. Inspect existing authorization, practice, mock exam, and session runtime boundaries.
2. Write failing unit tests first for:
   - expired or cancelled authorization hiding access from effective authorization results;
   - expired/cancelled authorization preventing practice and mock exam continuation;
   - explicit termination behavior returning `terminated` state without triggering scoring/report generation;
   - no numeric database `id`, session token, password, secret, or raw provider payload in DTOs.
3. Run focused unit tests and confirm RED failures for missing behavior.
4. Implement the smallest service/repository changes needed inside existing boundaries.
5. Add route-level behavior only when the service contract already supports it; keep route handlers thin.
6. Update student UI only if an existing visible boundary needs a clear authorization-expired or terminated state.
7. Write evidence and high-risk security review before closeout.

## Risk Controls

- Do not modify schema, migrations, package files, lockfiles, or `.env.example`.
- Do not introduce dependencies.
- Do not call real SMS, email, payment, AI provider, object storage, or production resources.
- Do not bypass auth/session/authorization runtime.
- Do not expose auto-increment IDs in URLs or DTOs.
- Do not log or output session tokens, passwords, secrets, API keys, raw prompts, raw answers, or raw model responses.
- Treat `publicId` only as a lookup handle; ownership and authorization checks stay server-side.
- Record any matrix/queue conflict in evidence instead of expanding scope silently.

## Required Validation Commands

1. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-authorization-expiry-termination-completion`
2. `npm.cmd run test:unit`
3. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
4. `npm.cmd run build`
5. `npm.cmd run test:e2e`
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
7. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Security Review Plan

Security review artifact:

- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-authorization-expiry-termination-completion-security-review.md`

Review focus:

- Server-side authn/authz coverage on all changed protected routes.
- Runtime validation of request params and JSON bodies.
- Authorization expiry, cancellation, enterprise disablement, and account-disable termination behavior.
- Session invalidation and active practice/mock termination without leaking internal state.
- API response envelope consistency and sensitive-field redaction.
- CSRF and state-changing endpoint posture preserved; no widened CORS or weakened auth checks.
