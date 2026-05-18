# Phase 0-2 Semi-Automation Mechanism Review

## Review Metadata

- Date: 2026-05-19
- Branch: `codex/phase-0-2-mechanism-review`
- Worktree: `F:\tiku\.worktrees\phase-0-2-mechanism-review`
- Base: `master` at `34de935`
- Purpose: review Phase 0 through Phase 2 delivery records and the active semi-automation mechanism, then propose improvements before Phase 3 question and paper work.

## Evidence Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/03-standards/doc-management.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Phase 0 evidence: `docs/05-execution-logs/evidence/2026-05-15-phase-0-agent-system.md`
- Phase 1 evidence: `docs/05-execution-logs/evidence/2026-05-16-phase-1-test-tooling-decision.md`, `docs/05-execution-logs/evidence/2026-05-17-dependency-format-baseline.md`, `docs/05-execution-logs/evidence/2026-05-17-foundation-review-closeout.md`
- Phase 2 evidence: auth schema, auth adapter, registration, session, redeem code, organization auth, admin employee, effective authorization, and readiness evidence files.
- Representative Phase 2 source: authorization services, contracts, repositories, mappers, route handlers, and `src/app/api/v1/**/route.ts`.
- Git state: recent log, branches, remote branches, worktree list, local status.

## Executive Verdict

The current semi-automation mechanism is effective enough to continue into Phase 3. Phase 0-2 established a strong minimum operating system: explicit architecture decisions, task queue ownership, allowed and blocked file boundaries, task plans before implementation, local quality gates, dependency approval records, isolated worktrees, merge and push evidence, and post-merge cleanup.

The main improvement area is not basic discipline. It is reducing manual friction and making high-risk review gates more explicit before the codebase moves from baselines and placeholders into real user-visible authorization, question, and paper workflows.

No critical blocker was found in the reviewed Phase 0-2 record. The highest priority recommendations are:

1. Add a formal security and authorization review gate for high-risk tasks.
2. Generate Phase 3 queue entries before implementation begins.
3. Update testing documentation to match the now-active Vitest and Playwright baseline.
4. Add a lightweight glossary and API response lint/check script.
5. Simplify closeout evidence so task commits do not require repeated amend cycles.

## Phase Review

### Phase 0: Agent System And Architecture Baseline

What worked:

- Architecture direction was frozen before feature work through ADRs and global API skeletons.
- Automation state, task queue, SOPs, and helper scripts were introduced early.
- The first readiness checks caught real gaps, including the missing test script and hook path behavior.
- Phase 0 did not pretend to have a full test gate before the tooling decision existed.

Optimization space:

- Phase 0 evidence is long-form and useful for humans, but not machine-queryable enough for future agents.
- The automation scripts started as skeletons, so early task validation depended heavily on manual interpretation.
- PowerShell profile and constrained language noise appears repeatedly in command output. The evidence remains valid, but the noise makes later audits harder.

Recommendation:

- Add a `scripts/agent-system/New-TaskEvidence.ps1` skeleton generator that pre-fills task id, branch, allowed files, blocked files, required commands, and closeout slots.
- Standardize evidence commands through `powershell.exe -NoProfile -ExecutionPolicy Bypass` wrappers where possible to reduce local profile noise.

### Phase 1: Foundation, Tooling, And Format Baseline

What worked:

- Test tooling was introduced through a dependency gate with explicit human approval.
- Vitest, Playwright, unit tests, E2E smoke coverage, lint, typecheck, format, and build evidence were recorded.
- The format baseline and LF policy made later fresh worktree verification substantially healthier.
- Dependency changes were isolated and documented.

Optimization space:

- `docs/03-standards/testing-tdd.md` still says tooling is pending even though `package.json` now has active `test`, `test:unit`, and `test:e2e` scripts.
- The Phase 1 dependency and formatting work was necessary, but it created broad mechanical change risk. The evidence explains this, but future large mechanical baselines should have a more explicit "semantic no-op" check.
- Build failures in fresh worktrees due to missing `node_modules` became a repeated theme.

Recommendation:

- Update `testing-tdd.md` in a dedicated documentation task to mark Vitest and Playwright as active.
- Add a reusable "fresh worktree bootstrap" checklist: `corepack pnpm@10 install --frozen-lockfile`, then no package or lockfile diff.
- For future mechanical baselines, record `git diff --stat` and a short semantic-impact note.

### Phase 2: User Auth And Authorization Baseline

What worked:

- Task queue dependencies were respected across schema, adapter, registration, sessions, redeem code, organization authorization, employee account, effective authorization, and readiness closeout.
- Baseline source follows the intended layering: API route, route handler, service, repository boundary, mapper, contract, validator, and tests.
- Standard API shape `{ code, message, data }` is preserved in reviewed routes.
- External API routes use public identifiers such as `publicId`; numeric database `id` stays inside repository rows and internal tests.
- Risky schema and dependency changes were handled in dedicated tasks, not mixed into later authorization implementation.
- Runtime routes intentionally return 401 or 503 placeholder responses until concrete DB/session wiring is introduced.
- Post-merge validation and cleanup became much more disciplined after the git hardening tasks.

Optimization space:

- Security review is present as task reasoning and test coverage, but there is not yet a dedicated, named security review artifact for high-risk auth tasks.
- Route runtime placeholders are acceptable for baselines, but they need explicit integration debt tracking before any route is treated as production-ready.
- Unit tests cover service and mapper behavior well, but there are not yet database-backed repository or session integration tests.
- Effective authorization currently computes active sources in service logic against repository row shapes. This is appropriate for the baseline, but Phase 3 should define where authorization enforcement happens for question and paper access.
- Closeout evidence generated several follow-up documentation commits and amend cycles. This improves traceability but makes history noisier than necessary.

Recommendation:

- Add `securityReviewRequired: true` or equivalent queue metadata for tasks with `authorization`, `api_contract`, `data_contract`, schema, session, token, or admin risk.
- Create `docs/05-execution-logs/security-reviews/` or reuse `audits-reviews/` for a compact review record before merging high-risk tasks.
- Add an explicit Phase 3 task to wire actual runtime repositories and session resolution, or keep placeholders clearly labeled as non-production behavior.
- Define a Phase 3 authorization enforcement contract before implementing paper/question APIs.

## Mechanism Review By Area

### 1. 前置性工作提前准备和部署

Current state:

- Phase 0 and Phase 1 show strong front-loading of architecture, local CI, dependency approval, and worktree mechanics.
- Phase 2 benefited from this preparation, especially in allowed/blocked file boundaries and validation commands.

Gap:

- `project-state.yaml` now points to `plan_phase_3_question_paper`, but `task-queue.yaml` has no Phase 3 pending tasks yet.

Improvement:

- Before Phase 3 coding, create a planning task that writes queue entries for question, paper, material, option, paper_section, and publish flows.
- Include schema approval requirements, integration-test requirements, and security review requirements in those queue entries.

### 2. 子任务代码审查

Current state:

- Evidence records local reviews, TDD, and gate results.
- The code shape in Phase 2 is reviewable because files are scoped and layered.

Gap:

- Code review is not always a separate artifact with findings, assumptions, and test gaps.

Improvement:

- For feature tasks, add a required review section to evidence:
  - Behavioral risks reviewed.
  - API contract reviewed.
  - Data exposure reviewed.
  - Test gaps accepted.
  - Reviewer conclusion.

### 3. 安全性审查

Current state:

- Phase 2 avoids exposing numeric ids, keeps public route responses standard, and does not introduce unapproved secrets or migrations in later tasks.
- Placeholder routes fail closed with 401 or 503.

Gap:

- Authorization logic is high-risk enough to deserve explicit abuse-case review, not only implementation tests.
- No automated check currently flags accidental use of `id` in DTOs, `license`, or non-glossary auth terms.

Improvement:

- Add a high-risk task checklist covering:
  - Authentication required before user-specific data.
  - Tenant or organization boundary.
  - Public identifier only in URLs and DTOs.
  - No privilege escalation through admin-created employee accounts.
  - Expiry, cancellation, disabled organization, and not-yet-started authorization states.
- Add a naming/security grep script for banned terms and suspicious DTO exposure.

### 4. 命名规范

Current state:

- Reviewed Phase 2 auth code uses approved terms such as `authorization`, `personal_auth`, `org_auth`, `organization`, `employee`, and `publicId`.
- REST route paths use kebab-case plural nouns.
- JSON DTO fields are camelCase.

Gap:

- Naming compliance depends mainly on human review and task memory.

Improvement:

- Add `Test-NamingConventions.ps1` or a Node script that scans:
  - Banned business terms: `license`, `exam_paper`.
  - Risky generic terms in business layers: standalone `section`, standalone `option`.
  - API DTO snake_case keys.
  - Route folders that are not kebab-case.

### 5. 项目文档

Current state:

- Task plans and evidence are consistently created.
- ADR, SOP, state, queue, evidence, and standards are enough to restore cross-session context.

Gap:

- Some standards documents lag behind the implemented state, especially `testing-tdd.md`.
- Evidence volume is growing, and the latest "what should I do next" signal still depends on both state YAML and human reading.

Improvement:

- Add a short `docs/05-execution-logs/phase-summaries/` document after each phase.
- Keep standards documents updated through dedicated governance tasks when implementation changes the baseline.
- Add a machine-readable `lastCompletedTask`, `lastMergedCommit`, and `nextQueueSeedRequired` field to project state.

### 6. 代码仓库管理

Current state:

- Master and origin/master were verified synced after Phase 2.
- Stale local branches and remote task branches were deleted after verification.
- `.worktrees/` isolation and cleanup rules are working.

Gap:

- Worktree removal often leaves Windows `node_modules` residue, requiring careful manual recovery.
- Remote branch cleanup is now done, but it is not yet a standard closeout command group.

Improvement:

- Add a read-only cleanup readiness script that confirms:
  - Branch merged into master.
  - Remote branch has no unique commits.
  - Worktree path is under `.worktrees/`.
  - Local branch can be deleted.
- Add optional cleanup command snippets to evidence templates, not automatic destructive cleanup.

### 7. 代码提交、合并、Push、清理

Current state:

- The git hardening task materially improved the process.
- Recent Phase 2 tasks record branch, worktree, compare, validation, merge, push, and cleanup.

Gap:

- Evidence updates after commit cause SHA churn and extra documentation commits.
- Some tasks pushed a short-lived task branch before master merge, then later deleted it. This is fine when PR review is desired, but it should be intentional.

Improvement:

- Adopt a two-commit closeout rule when needed:
  - Commit 1: implementation plus task plan and validation evidence.
  - Commit 2: post-merge or cleanup evidence, only on master after merge.
- Evidence should record "implementation commit" and "closeout evidence commit" separately.
- Before pushing a task branch, explicitly record whether the purpose is PR review, backup, or user-requested remote state.

## Findings

### Medium: High-Risk Security Review Is Too Implicit

Phase 2 authorization tasks passed unit and quality gates, but authorization work should have an explicit security review artifact. Phase 3 will add question and paper access surfaces, so this should be fixed before protected content APIs become real.

Recommended action:

- Add a queue/SOP rule for `securityReviewRequired`.
- Create a security review template with abuse cases and accepted residual risks.

### Medium: Phase 3 Has A State Pointer But No Queue Yet

`project-state.yaml` points to `plan_phase_3_question_paper`, while `task-queue.yaml` contains completed Phase 0-2 tasks and no next pending Phase 3 task.

Recommended action:

- Create the Phase 3 planning task first, with allowed/blocked files and validation commands.

### Medium: Runtime Placeholders Need Integration Debt Tracking

Several routes intentionally return 401 or 503 until DB and session wiring exist. That is safe as a baseline, but Phase 3 should not treat route existence as production readiness.

Recommended action:

- Track placeholder route wiring as explicit dependencies before user-visible flows.

### Medium: Standards Documentation Has Drifted

`testing-tdd.md` still says tooling is pending even though Vitest and Playwright are active.

Recommended action:

- Update testing standards in a governance/documentation task.

### Low: Closeout Evidence Creates History Noise

Closeout evidence is thorough but currently creates multiple evidence commits and amend cycles.

Recommended action:

- Use explicit implementation and closeout evidence commit slots.

### Low: Naming And API Contract Checks Need Automation

Human review caught no current blocker in the sampled Phase 2 code, but Phase 3 introduces many terminology-sensitive entities.

Recommended action:

- Add a glossary and DTO scan before Phase 3 implementation scales up.

## Proposed Queue Additions

1. `phase-3-question-paper-planning`
   - Scope: create Phase 3 task queue entries, risks, dependencies, allowed files, blocked files, and validation commands.
   - Must include schema/migration approval requirements if needed.

2. `governance-testing-doc-refresh`
   - Scope: update `testing-tdd.md` to active Vitest and Playwright policy.
   - No package changes.

3. `agent-security-review-gate`
   - Scope: add a high-risk review template and task queue metadata guidance.
   - No runtime code changes.

4. `agent-naming-contract-scan`
   - Scope: add a read-only script for glossary, route, DTO, and banned-term checks.
   - Validation: run against current code and record baseline.

5. `agent-evidence-template-hardening`
   - Scope: add evidence skeletons for task validation, merge, push, cleanup, and self-check.
   - Goal: reduce repeated manual closeout churn.

## Deep Self-Check

- Evidence basis: This review is grounded in local files, task plans, evidence files, representative source files, and Git state. It does not rely on memory alone.
- Scope control: This task changed only a task plan and this audit document. No package, lockfile, schema, migration, or runtime source file was modified.
- Overclaiming check: The review does not claim production-ready authentication or authorization. It explicitly preserves the distinction between baseline routes and fully wired runtime behavior.
- Security humility: No critical blocker was found, but the review treats authorization as high risk and recommends an explicit security review gate before deeper implementation.
- Naming check: Sampled Phase 2 code uses approved glossary terms; the review still recommends automation because human-only naming review will not scale.
- Repository check: Current isolated branch and worktree usage follows the active mechanism. Merge and push are intentionally not assumed by this document.
- Documentation check: The main documentation drift found is `testing-tdd.md`; it should be fixed as a separate allowed-file task.
- Validation check: This document still requires final `format:check` and Git completion readiness before handoff.

## Taste Compliance Self-Check

- Standard API response: reviewed Phase 2 routes and services use `{ code, message, data }`.
- Naming discipline: recommendations preserve glossary terms such as `authorization`, `personal_auth`, `org_auth`, `paper_section`, and avoid `license`.
- Public ID boundary: reviewed API route paths and DTO direction avoid exposing numeric database ids externally.
- Layering: reviewed Phase 2 code keeps api, route handler, service, repository, mapper, contract, and validator boundaries.
- No dependency creep: this review adds no dependency and does not touch package or lock files.
- No schema or migration drift: this review does not touch `src/db/schema/**` or `drizzle/**`.
- No broad refactor: recommendations are queued as small governance or planning tasks.
- Evidence before conclusion: conclusions are tied to evidence files, source samples, and Git state.
