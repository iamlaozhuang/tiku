# 2026-07-11 0704 Ops Contact Config Polish Adversarial Audit

## Scope

- Route label: `运营后台 / 购买联系方式`
- Role labels: `super_admin`, `ops_admin`, `content_admin`, `student`
- Change type: UI information layout, runtime DTO extension, local QR image route.
- Out of scope: Provider enablement, staging/prod/deploy/env/secret work, DB schema, migrations, object storage, package changes, card/auth business rules.

## Checks

- Permission boundary:
  - `super_admin` and `ops_admin` can read/update contact config.
  - `content_admin` is denied before QR image storage and before config update.
  - Student view only consumes published local purchase guidance data; no admin write path added.

- Data boundary:
  - Contact config update accepts title, summary, safety notice, channel metadata, enabled state, and QR image URL only.
  - QR image route accepts only image content types used for purchase contact QR images and stores no credential-like metadata.
  - Evidence and audit do not record QR image binary data or sensitive runtime values.

- Business logic boundary:
  - No authorization, redeem code, edition, quota, upgrade, employee, organization, exam, paper, or AI provider logic changed.
  - Standard/advanced purchase copy remains descriptive only; no version decision is made on this page.

- UI state boundary:
  - Loading, unauthorized, error, disabled/save-in-progress, empty enabled-channel preview, and normal states remain represented.
  - Editor and preview use the same channel DTO, reducing drift between admin parameters and student rendering.

- Security boundary:
  - Upload failure does not mutate the saved contact config.
  - Deleting a QR image reference only clears contact config metadata in the editor state before save.
  - QR image read responses are `no-store`.

## Residual Risk

- The QR image storage added here is a local runtime contract, not durable object storage. This matches the approved narrow localhost/UI task and must not be represented as production storage readiness.
- Existing contact config repository remains local/in-memory in this code path; production persistence remains outside this task.

## Audit Conclusion

- No evidence of permission expansion, provider enablement, staging/prod readiness claim, credential exposure, package drift, DB schema change, or business rule change was found in this task scope.
