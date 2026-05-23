# Audit Review: phase-11-local-product-readiness-audit

## Boundary

This review defines the local product readiness audit framework before continuing Phase 11 staging work.

No application code, dependency, schema, migration, script, `.env.local`, `.env.example`, cloud resource, deployment target, staging/prod service, or provider configuration is changed.

## Staging Entry Audit Objective

The audit answers one question:

Can the local MVP be promoted to a staging acceptance environment without exposing unknown blockers or misleading half-finished flows?

The audit does not require every product feature to be complete. It requires every observed gap to be classified and either fixed before staging, excluded from staging scope, or recorded as a known limitation.

## Role-Play Experience Checklist

| Area                   | Role            | Routes                                           | Required Checks                                                                                |
| ---------------------- | --------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Auth                   | unauthenticated | `/login`, protected student/admin/content routes | login form, invalid credentials, protected route behavior, session persistence                 |
| Student home           | student         | `/home`                                          | visible auth scope, paper list, empty state, navigation to practice and mock_exam              |
| Practice               | student         | `/practice`                                      | create or resume practice, answer save, terminate/restart, explanation affordance, error state |
| Mock exam              | student         | `/mock-exam`                                     | create mock_exam, answer flow, submit, report generation path, repeated submit behavior        |
| Exam report            | student         | `/exam-report`                                   | report list/detail, score display, unanswered items, learning_suggestion affordance            |
| Mistake book           | student         | `/mistake-book`                                  | list, favorite/unfavorite, mark mastered, remove, ai_explanation affordance                    |
| Redeem code            | student         | `/redeem-code`                                   | valid/invalid redeem_code handling, duplicate redeem behavior, auth result visibility          |
| Profile                | student         | `/profile`                                       | user summary, authorization summary, navigation consistency                                    |
| User ops               | admin           | `/ops/users`                                     | list, search/filter, reset password affordance, permission and empty states                    |
| Organization ops       | admin           | `/ops/organizations`                             | list, hierarchy signals, disabled status, org_auth relationship visibility                     |
| Redeem code ops        | admin           | `/ops/redeem-codes`                              | list, create affordance, status handling, conflict handling                                    |
| Resource ops           | admin           | `/ops/resources`                                 | resource list, rebuild-vector affordance, unsupported actions made explicit                    |
| AI audit               | admin           | `/ops/ai-audit-logs`                             | ai_call_log summary/list, redaction, empty/error states                                        |
| Question content       | content         | `/content/questions`                             | question list, filter, create/edit/disable/copy affordances, material switch                   |
| Material content       | content         | `/content/materials`                             | material list, filter, create/edit/disable/copy affordances                                    |
| Paper content          | content         | `/content/papers`                                | paper list, publish/archive/copy affordances, question relationship visibility                 |
| Knowledge node content | content         | `/content/knowledge-nodes`                       | knowledge_node list, create/edit/disable flow, relationship visibility                         |
| RAG surfaces           | content/admin   | `/ops/resources`, `/content/knowledge-nodes`     | knowledge_base/resource/chunk/citation/evidence_status visibility without raw content leaks    |

## Issue Record Format

Each issue should be recorded as:

```text
id:
route:
role:
severity:
steps:
expected:
observed:
stagingDecision:
evidence:
recommendedOwnerTask:
```

## Severity And Staging Decision

- `P0`: cannot enter staging until fixed or explicitly downgraded by human approval.
- `P1`: should be fixed before staging if the flow is inside acceptance scope.
- `P2`: can enter staging only as a named known limitation.
- `P3`: backlog or polish.

## Initial Finding

### LPR-001: Content action buttons are not fully wired

- route: `/content/questions`
- role: content/admin
- severity: `P1` if content admin is in staging acceptance scope; otherwise `P2`
- observed: visible question/material action buttons include actions that currently do not complete a browser flow.
- expected: each visible enabled action should either complete the flow or show an explicit unavailable/disabled state.
- current evidence source: local manual experience and source inspection of content admin UI.
- recommended owner task: content admin question/material UI action wiring, if included in the staging fix package.

## Recommended Follow-Up

1. Add and run `phase-11-local-product-readiness-roleplay-run`.
2. Record findings in a dedicated evidence file with no secrets or raw sensitive content.
3. Add `phase-11-staging-entry-fix-scope` to decide which findings block staging.
4. Create one bounded fix task per accepted blocker or P1 surface.
