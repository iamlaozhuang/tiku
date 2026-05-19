# Browser Verification Hardening Task Plan

## Task

- id: ad-hoc-browser-verification-hardening
- date: 2026-05-19
- branch: codex/browser-verification-hardening
- base: master
- scope: harden the automation SOP so future browser verification consistently discovers the in-app Browser and Chrome backends before falling back.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- Browser skill: in-app browser backend `iab`
- Chrome skill: Chrome extension backend `extension`

## Implementation Plan

1. Add a browser verification discovery section to `docs/04-agent-system/sop/automation-loop.md`.
2. Capture the required discovery order:
   - use Browser for local app verification by default,
   - use Chrome when the user asks for Chrome or authenticated/profile-backed browser state,
   - discover `node_repl js` before declaring the browser backend unavailable,
   - bootstrap with the plugin `scripts/browser-client.mjs`,
   - run Chrome extension health checks before fallback.
3. Require evidence to record backend selection, discovery attempts, URL, interaction checks, console/log result, screenshot status, fallback reason, and tab cleanup.
4. Leave Phase 3 queue state untouched because this is a mechanism hardening task between queued work items.

## Risk Controls

- No dependency, schema, migration, or environment file changes.
- No runtime code changes.
- No queue task status transition.
- Validation focuses on SOP content, formatting, naming, readiness, and git completion inventory.
