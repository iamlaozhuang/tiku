# 2026-07-11 0704 Ops Contact Config Polish

## Task

- Task id: `0704-ops-contact-config-polish-2026-07-11`
- Branch: `codex/0704-ops-contact-config-polish`
- Base: latest `origin/master` after `0704-ops-redeem-code-management-polish-2026-07-11`
- Scope: localhost UI/source/test implementation for operations purchase contact configuration.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- Latest local UI/UX evidence and audits for operations contact configuration.
- Private screenshot reviewed locally: `super_admin__01__ops-contact-config.png`; not copied into repository.

## Current Finding

- `/ops/contact-config` currently renders the form in a narrow left column with large unused desktop space.
- The editor only maps and saves the first contact channel while the preview renders all channels.
- The contract supports channel arrays but has no QR image field.
- Requirements require operations-managed phone, WeChat, QR image, copy, enablement, and audit record.
- Existing runtime is local/in-memory contact config storage, not a DB table; this task must not introduce a DB schema or object-storage dependency.

## Implementation Plan

1. Add focused tests first:
   - Multi-channel editor renders phone and WeChat channels from the API response.
   - Saving submits the same channel array shape shown in preview.
   - WeChat channel supports QR upload through a protected local route and saves a QR image URL field.
   - Student purchase guidance renders the QR image when configured.
   - `content_admin` remains denied for contact config mutation and QR upload.
2. Extend the contact config DTO narrowly:
   - Add `isEnabled` and `qrImageUrl` to `ContactConfigChannelDto`.
   - Normalize missing `isEnabled` as `true` and missing `qrImageUrl` as `null` for compatibility.
3. Add local QR upload runtime:
   - `POST /api/v1/contact-configs/qr-images` for `ops_admin` / `super_admin` only.
   - Validate PNG/JPEG/WebP and size before storing in module-local memory.
   - `GET /api/v1/contact-configs/qr-images/{publicId}` serves the uploaded image by public, non-database identifier.
   - Do not write files, object storage, DB rows, env values, secrets, or dependencies.
4. Refactor `AdminContactConfigPage`:
   - Use a full-width desktop layout with editor and live learner-style preview.
   - Edit a channel list rather than a single first channel.
   - Support add/remove, enable/disable, type-specific labels, and WeChat QR upload/replace/remove.
   - Keep save using existing `PUT /api/v1/contact-configs` contract.
5. Update student purchase guidance rendering to show QR image for WeChat channels when `qrImageUrl` is present.
6. Write redacted evidence and adversarial audit.
7. Run targeted tests, lint, typecheck, `git diff --check`, and Module Run v2 gates.

## Boundaries

- No Provider-enabled behavior.
- No staging/prod/deploy/env/secret work.
- No package or lockfile changes.
- No database schema, migration, seed, direct DB connection, or object-storage integration.
- No online payment, pricing, invoice, settlement, or Cost Calibration.
- No raw credential/session/token/cookie/DB URL/provider payload/raw AI output/full content evidence.
- No release readiness, staging readiness, production readiness, or final release readiness claim.

## Risk Controls

- QR upload is local runtime only and does not claim persistence beyond current in-memory contact config posture.
- Upload evidence records only route label, status category, and test counts; no binary content or URLs copied.
- Existing contact config permission boundary remains service-side.
- The student preview and admin preview share the same channel DTO shape to prevent future drift.
