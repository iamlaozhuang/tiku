# 2026-07-08 AI Paper Knowledge Consumption Audit

## Adversarial Review

- Scope creep check: limited to AI组卷 source resolution and targeted tests; no UI, Provider, DB/schema, auth, package, fixture, or seed changes.
- Authorization check: role and edition gates remain in existing request routes; this change does not alter allowed actors, standard/advanced decisions, or organization context requirements.
- Data safety check: source resolution still maps to redacted/selectable DTOs and does not expose stems, answers, options, raw DB rows, Provider payloads, prompts, or raw AI output in evidence.
- Selected scope check: selected `knowledgeNodePublicIds` now exclude unrelated platform questions before plan assembly can use same-scope degradation.
- Descendant check: when descendant inclusion is requested, available parent mapping is traversed with cycle protection; without mapping, exact matching remains enforced rather than admitting unrelated nodes.
- Multi-node check: selected non-descendant mode queries each selected node and de-duplicates repeated question rows by public id.
- Enterprise source check: organization training snapshots currently do not carry knowledge-node metadata; this task does not invent schema fields or over-claim enterprise knowledge filtering.

## Residual Risk

- Descendant expansion quality depends on a caller-provided `knowledgeNodeParentPublicIdsByPublicId` map. When absent, behavior is exact-match only, which is safer than admitting unrelated nodes but less complete than full tree expansion.
- Enterprise training snapshot questions remain selectable by organization source preference because no knowledge-node metadata exists on the current snapshot contract.

## Review Result

- Status: pass. No scope expansion, sensitive evidence exposure, Provider execution, DB mutation, dependency change, schema change, or authorization/edition semantic change found.
