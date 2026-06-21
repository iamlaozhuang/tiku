# 2026-06-21 Edition-Aware Authorization Docs Task Plan

## Goal

Create a documentation-only decision package for edition-aware authorization so future implementation tasks can handle personal and organization `standard | advanced` authorization, upgrades, quota ownership, and acceptance boundaries without inventing product rules during coding.

## Read Standards And Decisions

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`

## User-Confirmed Decisions

- Direct issuance of `advanced` authorization is allowed for new personal and organization purchases or grants.
- Original authorization `edition` belongs on the authorization source; upgrade facts belong in `auth_upgrade`.
- Personal `redeem_code` operations have three first-release kinds: standard activation, advanced activation, and `edition_upgrade`.
- Organization authorization can be created as `standard | advanced`; an existing standard `org_auth` can be upgraded through `auth_upgrade`.
- Quota ownership follows the selected authorization context: personal context consumes personal quota, organization context consumes organization quota.
- Existing unversioned authorization data remains compatible and is interpreted as `standard`.

## Allowed Scope

- Add or update requirements, traceability, ADR, task plan, evidence, and audit review documentation under `docs/**`.
- Keep the work documentation-only.
- Record blocked implementation gates explicitly.

## Blocked Scope

- No `src/**` changes.
- No `drizzle/**` changes.
- No schema, migration, dependency, package, lockfile, env, provider, payment, deployment, or Cost Calibration Gate work.
- No real provider or model calls.
- No secret, token, database URL, Authorization header, raw prompt, raw generated AI content, provider payload, internal DB row, raw employee answer text, full paper content, or plaintext `redeem_code` in evidence.

## Implementation Plan

1. Add a versioned authorization requirements document for `edition`, `effectiveEdition`, `auth_upgrade`, personal `redeem_code` types, organization upgrades, quota ownership, compatibility, audit, and non-goals.
2. Add ADR-007 for the edition-aware authorization source of truth.
3. Update use-case, capability, and unified edition delta traceability rows to reference the confirmed source-of-truth decisions without implying implementation approval.
4. Add an acceptance matrix for standard, advanced, upgrade, revoke, expiry, mismatch, quota, and redaction scenarios.
5. Validate with project status scripts, `git diff --check`, and targeted documentation consistency searches.

## Risk Controls

- All implementation language must state that schema/API/service/UI work requires later scoped approval.
- Quota defaults must remain undecided until the Cost Calibration Gate is approved.
- Payment, external purchase confirmation, invoice, refund, provider execution, and deployment remain non-goals.
- Documentation must preserve the existing service-layer authorization boundary from ADR-002.
