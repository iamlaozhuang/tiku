# Skill Dispatch Matrix

## Status

Draft for Phase 0

## Purpose

Define which Codex skills agents should use for Tiku work. Skill names and paths are kept in their original English form so they can be matched against the active skill list without translation.

## Superpowers Plugin Skills

The Superpowers plugin is enabled as `superpowers@openai-curated` in `C:\Users\laozhuang\.codex\config.toml` and cached under `C:\Users\laozhuang\.codex\plugins\cache\openai-curated\superpowers`.

These skills should be used from the plugin, not copied into `C:\Users\laozhuang\.codex\skills`, to avoid duplicate local skill names and version drift. After a Codex restart, verify that they appear in the active skill list before relying on automatic triggering:

- `brainstorming`
- `dispatching-parallel-agents`
- `executing-plans`
- `finishing-a-development-branch`
- `receiving-code-review`
- `requesting-code-review`
- `subagent-driven-development`
- `systematic-debugging`
- `test-driven-development`
- `using-git-worktrees`
- `using-superpowers`
- `verification-before-completion`
- `writing-plans`
- `writing-skills`

## Local Skills Requiring Codex Restart

The following local skills are installed under `C:\Users\laozhuang\.codex\skills`, but newly installed skills must not be treated as available in the current session. Restart Codex first, then verify each skill in the active skill list before use.

- `playwright`
- `security-best-practices`
- `security-threat-model`
- `ralplan`
- `ralph`
- `code-review`
- `code-simplifier`
- `drizzle-orm-expert`
- `postgresql`
- `postgres-best-practices`
- `nextjs-app-router-patterns`
- `nextjs-best-practices`
- `react-nextjs-development`
- `shadcn`
- `tailwind-design-system`
- `tailwind-patterns`
- `vercel-ai-sdk-expert`
- `rag-engineer`
- `rag-implementation`
- `webapp-testing`
- `e2e-testing`
- `tdd-orchestrator`
- `tdd-workflow`
- `testing-patterns`

## Reserved Skills

`autopilot` is reserved for a later stronger mechanism version. Do not install or use `autopilot` for Phase 1 automation execution unless a future ADR or SOP explicitly activates it.

## Dispatch Rules

- Session startup and task recovery uses `superpowers:verification-before-completion` for evidence discipline and the local project state files for context restoration.
- Architecture planning uses `superpowers:brainstorming`, `superpowers:writing-plans`, `ralplan`, and `design` when those skills are active.
- Written implementation plans use `superpowers:executing-plans`.
- Test-first implementation uses `superpowers:test-driven-development`, `tdd-orchestrator`, or `tdd-workflow` when active.
- Debugging uses `superpowers:systematic-debugging` before broad code changes.
- Verification before handoff uses `superpowers:verification-before-completion`.
- Database work uses `drizzle-orm-expert`, `postgresql`, and `postgres-best-practices` when active.
- Auth work uses `auth-implementation-patterns` when active.
- UI work uses `shadcn`, `tailwind-design-system`, `tailwind-patterns`, `react-nextjs-development`, and `nextjs-best-practices` when active.
- AI and RAG work uses `vercel-ai-sdk-expert`, `rag-engineer`, and `rag-implementation` when active.
- Browser, UI, and end-to-end validation uses `playwright`, `webapp-testing`, and `e2e-testing` when active.
- Security-sensitive auth, authorization, dependency, deployment, and external service work uses `security-best-practices` and `security-threat-model` when active and when the task calls for security review.
- Cleanup uses `code-simplifier` followed by the available local gates.
- Code review uses `superpowers:requesting-code-review` or `code-review` when active.
- Autonomous loop work uses `ralplan -> ralph -> code-review` after those local skills are verified active.

## Lifecycle Requirements

- Before writing code: use planning skills and create a task plan.
- While writing code: use the domain skill for the changed surface, such as database, auth, UI, AI/RAG, or testing.
- After writing code: use verification before completion, then request code review for risky or shared changes.
- Before dependency changes: use the dependency introduction gate and record human approval.
- Before UI handoff: use UI and browser validation skills when available.

## Activation Verification

Skill readiness has two levels:

1. Path readiness: `scripts/agent-system/Test-AgentSystemReadiness.ps1` confirms that plugin caches and local skill directories exist.
2. Session readiness: the current Codex session must expose the skill in the active skill list before an agent treats it as automatically available.

If path readiness passes but session readiness does not show the skill, do not assume automatic triggering. Use the project SOP, standards, and explicit file references as fallback, and record the missing active-skill visibility in evidence.
