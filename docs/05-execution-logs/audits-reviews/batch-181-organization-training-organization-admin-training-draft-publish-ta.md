# Audit Review: batch-181-organization-training-organization-admin-training-draft-publish-ta

## Scope Reviewed

- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/validators/organization-training.test.ts`
- Task plan, state, and evidence files.

## Findings

- Manual draft creation and publish-version behavior already existed before this task and remained covered by tests.
- This task added missing takedown and copy-to-new-draft service lifecycle behavior.
- Takedown now records a service-to-store access policy that blocks new answers, draft saves, and question detail
  re-entry while preserving historical summary visibility.
- Copy-to-new-draft now creates a fresh draft write from a published or taken-down version snapshot and preserves source
  version and publish scope snapshot boundaries.
- The route boundary was not expanded; runtime route wiring still exposes only the existing publish path.
- A supplemental full-unit run remained not passing in two pre-existing UI test files outside this task scope; focused
  organization-training service and validator tests passed.
- The first commit attempt was blocked by a `task-queue.yaml` duplicate `planPath` key; the accidental duplicate on a
  historical queue item was removed and Prettier check passed before final closeout.
- No repository, schema, DB, package, lockfile, provider, e2e, Browser, dev-server, deploy, payment, external-service,
  PR, force-push, or Cost Calibration Gate work was performed.

## Decision

APPROVE.

The task may close if final PreCommit, ModuleCloseout, PrePush, git integration, push, and cleanup gates pass.

## Blocked Gate Audit

Preserved:

- `.env*`, DB access, row/private data, provider/model calls, provider payloads, raw prompts, raw answers, quota/cost,
  Cost Calibration Gate, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service,
  schema/drizzle/package/lockfile/dependencies, formal content write paths, public identifier value lists, PR, and force
  push remain blocked.
