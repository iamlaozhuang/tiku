# Audit Review: advanced-organization-training-publish-version-route-boundary-readonly-audit

## Decision

APPROVE: pass_readonly_audit_with_tdd_route_seeding_recommended.

## Scope

- Readonly review of the future organization training publish-version route/API boundary.
- No product source implementation, route/API runtime change, service/repository/mapper change, schema/migration, DB execution, provider/model, dependency, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, formal content write, or formal target write.

## Review Checklist

- `/api/v1/` route naming and action subpath boundary reviewed.
- Public-id-only URL policy reviewed.
- Standard response envelope reviewed.
- ADR-002 route to service to repository layering reviewed.
- Metadata-only published version DTO exposure reviewed.
- Formal target write blocked status reviewed.
- Route/API/UI non-expansion reviewed.

## Findings

No blocking findings in readonly source review.

- Recommended route shape is `POST /api/v1/organization-trainings/{publicId}/publish`, using the draft public id in the URL and a verb action subpath.
- Future route work must be TDD and must not accept numeric/internal lineage fields from client input.
- Future route work must cover path/body draft public id mismatch handling before implementation.
- Success responses should return the metadata-only published version DTO in the standard envelope.
- Error and blocked responses should return standard error envelopes with `data: null`.
- Public DTO exposure remains metadata-only and redacted from internal lineage, formal targets, provider/raw fields, and employee answer detail.
- Formal content write and formal target write remain blocked.

## needs_recheck

- Seed `advanced-organization-training-publish-version-route-tdd-seeding` as the next task before any route implementation.
- The seeded task should define exact route/runtime/test allowed files and require fresh approval.
- DB access, migration execution, provider/model work, UI, formal target write, PR, and force push remain blocked.
