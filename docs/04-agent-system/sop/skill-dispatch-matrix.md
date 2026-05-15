# Skill Dispatch Matrix

## Status

Draft for Phase 0

## Purpose

Define which Codex skills agents should use for Tiku work. Skill names and paths are kept in their original English form so they can be matched against the active skill list without translation.

## Immediate Superpowers Skills

These skills are available through the Superpowers plugin in the current active skill list and may be used immediately when the task matches their trigger:

- `superpowers:brainstorming`
- `superpowers:writing-plans`
- `superpowers:executing-plans`
- `superpowers:test-driven-development`
- `superpowers:systematic-debugging`
- `superpowers:verification-before-completion`
- `superpowers:requesting-code-review`

## Local Skills Requiring Codex Restart

The following local skills may exist under `C:\Users\laozhuang\.codex\skills`, but newly installed skills must not be treated as available in the current session. Restart Codex first, then verify each skill in the active skill list before use.

- `ralplan`
- `ralph`
- `autopilot`
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
- `playwright-skill`
- `webapp-testing`
- `e2e-testing`
- `tdd-orchestrator`
- `tdd-workflow`
- `testing-patterns`

## Dispatch Rules

- Architecture planning uses `superpowers:brainstorming`, `superpowers:writing-plans`, `ralplan`, and `design` when those skills are active.
- Written implementation plans use `superpowers:executing-plans`.
- Test-first implementation uses `superpowers:test-driven-development`, `tdd-orchestrator`, or `tdd-workflow` when active.
- Debugging uses `superpowers:systematic-debugging` before broad code changes.
- Verification before handoff uses `superpowers:verification-before-completion`.
- Database work uses `drizzle-orm-expert`, `postgresql`, and `postgres-best-practices` when active.
- Auth work uses `auth-implementation-patterns` when active.
- UI work uses `shadcn`, `tailwind-design-system`, `tailwind-patterns`, `react-nextjs-development`, and `nextjs-best-practices` when active.
- AI and RAG work uses `vercel-ai-sdk-expert`, `rag-engineer`, and `rag-implementation` when active.
- Browser, UI, and end-to-end validation uses `playwright-skill`, `webapp-testing`, and `e2e-testing` when active.
- Cleanup uses `code-simplifier` followed by the available local gates.
- Code review uses `superpowers:requesting-code-review` or `code-review` when active.
- Autonomous loop work uses `ralplan -> ralph -> code-review` after those local skills are verified active.

## Reserved Skills

`autopilot` is reserved for a later stronger mechanism version. Do not use `autopilot` for Phase 0 automation execution unless a future ADR or SOP explicitly activates it.
