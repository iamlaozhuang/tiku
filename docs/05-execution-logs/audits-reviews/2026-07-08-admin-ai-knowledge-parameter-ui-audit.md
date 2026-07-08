# Admin AI knowledge parameter UI adversarial audit

Task id: `admin-ai-knowledge-parameter-ui-2026-07-08`

## Requirement Mapping Result

- Requirement root was read from `docs/01-requirements/00-index.md`.
- Advanced, edition, and organization AI requirements were read from `docs/01-requirements/advanced-edition/00-index.md`, `edition-aware-authorization-requirements.md`, and `modules/08-organization-ai-generation.md`.
- Current AI出题 / AI组卷 source order was read from the 2026-07-02, 2026-07-05, 2026-07-06, and 2026-07-08 traceability overlays.
- UI/UX source requirements were read from the 2026-07-07 source entry, batch 0, batch 2, batch 5, local design board materialization, and design-board review.

## Review Questions

1. Did this branch change authorization, login, role, organization context, edition, quota, Provider, DB, schema, seed, fixture, package, lockfile, env, staging, prod, deploy, or Cost Calibration semantics?
   - Result: no. Diff is limited to admin AI UI, focused tests, and task governance logs.

2. Can a standard organization admin reach the AI form because of UI-only visibility?
   - Result: no. Existing `standard-unavailable` load state remains unchanged; tests still cover standard denial paths through existing suite.

3. Can `content_admin` receive organization-only source preference or enterprise-training wording?
   - Result: no. Content paper keeps platform-only source wording; organization source preference control is only rendered for organization AI paper.

4. Can `org_advanced_admin` write platform formal content through these UI changes?
   - Result: no. Organization AI boundary copy and draft creation path still target enterprise training draft domain only.

5. Can the page submit `selected` knowledge mode without concrete knowledge-node public ids?
   - Result: no. UI disables submit and shows a visible reason when `knowledgeNodeMode = selected` and public-id list is empty.

6. Did free-text supplement become an internal id or sole formal binding?
   - Result: no. It maps to `knowledgeNodeSupplement` and compatibility `knowledgeNode` text only; public-id list remains a structured array.

7. Did user-visible wording expose raw ids or implementation terms?
   - Result: reviewed and corrected. The UI no longer displays `public id`; it uses product wording for selected knowledge scope.

## Residual Risk

- The page still does not fetch a live knowledge-node tree. That is intentional for this branch because service-level visibility and source filtering are separate matrix tasks; this UI branch provides clear empty/disabled behavior instead of fake options.
- Runtime Provider and DB-backed acceptance remain out of scope and require separate approval.

## Conclusion

No boundary regression found in the current diff. Proceed to Module Run v2 gates and closeout if validations remain green.
