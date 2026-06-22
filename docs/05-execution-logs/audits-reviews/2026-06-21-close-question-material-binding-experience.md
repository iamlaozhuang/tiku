# Close Question Material Binding Experience Audit Review

## Scope Review

- Allowed: content_admin UI feedback and focused unit tests for `question` binding to `material`, `knowledge_node`, and
  `tag`.
- Blocked: schema, migration, seed, database connection, dependency, env/secret, Provider, dev server, browser/e2e,
  deploy, PR, force-push, payment, external service, org_auth runtime behavior, and Cost Calibration Gate work.

## Findings

- No security finding in the implemented scope.
- UI feedback uses publicId values only for `material`, `knowledge_node`, and `tag`; no internal numeric id is exposed by
  the new feedback.
- The form preview reuses the existing publicId parsing and deduplication behavior before submit.
- No schema, migration, seed, database connection, dependency, env/secret, Provider, dev server, browser/e2e, deploy,
  PR, force-push, payment, external service, org_auth runtime behavior, or Cost Calibration Gate work was performed.
