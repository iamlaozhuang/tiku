# Module Run v2 Auto-Seed Plan: organization-training

## Scope

- Action: `request_auto_seed_approval:organization-training`
- Seed source: `phase-72-advanced-organization-training-implementation-planning`
- Target module: `organization-training`
- Branch: `codex/auto-seed-organization-training`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`

## Implementation Plan

1. Confirm `master` and `origin/master` are aligned before queue changes.
2. Run `Get-ModuleRunV2ImplementationSeedProposal.ps1` and confirm the next seed module is `organization-training`.
3. Apply `New-ModuleRunV2ImplementationSeed.ps1` with the current user approval.
4. Record seed evidence and audit review for the four generated pending implementation tasks.
5. Run seed self-review, formatting, diff, lint, typecheck, and Module Run v2 readiness checks before commit.
6. Commit the seed transaction independently, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Guardrails

- No source, test, dependency, lockfile, schema, env, provider, browser/e2e, database, deployment, PR, or force-push work.
- No Provider/model calls, prompt/provider payload, raw generated content, plaintext `redeem_code`, raw employee answer, DB URL, token, or full paper content exposure.
- Cost Calibration Gate remains blocked.
