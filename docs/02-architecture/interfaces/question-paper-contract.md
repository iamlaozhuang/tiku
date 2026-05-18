# Question Paper Contract

## Status

Approved for Phase 3 implementation planning.

## Purpose

Define the Phase 3 contract for `question`, `paper`, `material`, `paper_section`, `question_group`, `question_option`, `scoring_point`, `paper_asset`, and related `authorization` boundaries before implementation starts.

This document is a contract and approval artifact. It does not create schema, generate a Drizzle migration, add a dependency, or expose a runtime API by itself.

## Sources

- `AGENTS.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/04-agent-system/sop/security-review-gate.md`

## Non-Goals

- No dependency introduction.
- No `package.json`, `pnpm-lock.yaml`, or `package-lock.json` change.
- No `src/**` implementation in this task.
- No `drizzle/**` migration generation in this task.
- No object storage provider selection in this task.
- No AI/RAG implementation in Phase 3; `kn_recommendation`, `ai_scoring`, `ai_explanation`, and `ai_hint` remain later phases.

## Naming Rules

- Database tables and columns use `snake_case`.
- REST paths use `/api/v1/` and kebab-case plural nouns.
- API JSON fields use `camelCase`.
- External URLs use `public_id` in database rows and `publicId` in API JSON.
- External URLs must never expose auto-increment `id`.
- Use `paper_section`, never standalone `section`.
- Use `question_option`, never standalone `option`.
- Use `analysis` for teacher-authored analysis.
- Use `standard_answer` for the standard answer.
- Use `paper_asset` for original source files attached to a paper.
- Use `authorization`, not `license`.

## Domain Invariants

- Published `paper` content is immutable.
- Published `paper` rows use snapshots for all user-visible `question`, `question_option`, `material`, `paper_section`, `question_group`, `scoring_point`, `analysis`, and `standard_answer` content.
- A source `question` becomes locked after any published `paper` references it.
- A source `material` becomes locked only after any published `paper` references it through a snapshot.
- Disabled `question` and disabled `material` remain visible in already published paper snapshots.
- Draft `paper` composition copies the current source snapshot when a `question` is added.
- Draft `paper` may adjust `scoring_point` for subjective questions without modifying the source `question`.
- Published `paper` cannot be deleted.
- A `paper` with existing `answer_record` rows cannot be deleted.
- Student-side content access requires current effective `authorization`.
- Admin/content-management access requires an authenticated admin role; public identifiers are not an authorization boundary.

## Enumerations

Use values already registered in `docs/03-standards/glossary.yaml`.

| Concept                  | Database enum       | Values                                                                      |
| ------------------------ | ------------------- | --------------------------------------------------------------------------- |
| `profession`             | `profession`        | `monopoly`, `marketing`, `logistics`                                        |
| `subject`                | `subject`           | `theory`, `skill`                                                           |
| `question_type`          | `question_type`     | `single_choice`, `multi_choice`, `true_false`, `fill_blank`, `short_answer` |
| `question_status`        | `question_status`   | `available`, `disabled`                                                     |
| `material_status`        | `material_status`   | `available`, `disabled`                                                     |
| `paper_status`           | `paper_status`      | `draft`, `published`, `archived`                                            |
| `multi_choice_rule`      | `multi_choice_rule` | `all_correct_only`, `partial_credit`                                        |
| `scoring_method`         | `scoring_method`    | `auto_match`, `ai_scoring`                                                  |
| `paper_type`             | `paper_type`        | `past_paper`, `mock_paper`                                                  |
| `paper_attachment_usage` | `usage_type`        | `paper_source`, `answer_analysis`, `answer_sheet`, `other`                  |

## Database Contract

All tables use `id` as internal BIGINT identity unless explicitly noted. Tables exposed in URLs must also have `public_id`.

### `material`

Purpose: source material library.

Required columns:

- `id`
- `public_id`
- `title`
- `content_rich_text`
- `profession`
- `level`
- `subject`
- `status`
- `is_locked`
- `locked_at`
- `created_by_admin_id`
- `updated_by_admin_id`
- `created_at`
- `updated_at`

Indexes:

- `udx_material_public_id`
- `idx_material_profession_level_subject`
- `idx_material_status`
- `idx_material_is_locked`

Rules:

- `content_rich_text` max length is 30000 characters at validation/service boundary.
- `is_locked` becomes true after a published `paper` references a snapshot derived from the material.
- Disabled material cannot be newly selected for draft composition.

### `question`

Purpose: source question library.

Required columns:

- `id`
- `public_id`
- `question_type`
- `profession`
- `level`
- `subject`
- `stem_rich_text`
- `analysis_rich_text`
- `standard_answer_rich_text`
- `status`
- `is_locked`
- `locked_at`
- `multi_choice_rule`
- `scoring_method`
- `material_id`
- `created_by_admin_id`
- `updated_by_admin_id`
- `created_at`
- `updated_at`

Indexes:

- `udx_question_public_id`
- `idx_question_profession_level_subject`
- `idx_question_question_type`
- `idx_question_status`
- `idx_question_material_id`
- `idx_question_is_locked`

Rules:

- `stem_rich_text`, `analysis_rich_text`, and `standard_answer_rich_text` max length is 10000 characters each at validation/service boundary.
- `material_id` is nullable because not every `question` uses material.
- `true_false` stores normalized boolean-like answer values internally and maps to `A.正确` / `B.错误` for student display.
- Locked source questions cannot be edited; they can be copied to a new `question`.
- Disabled source questions cannot be newly selected for draft composition.

### `question_option`

Purpose: source options for objective questions.

Required columns:

- `id`
- `question_id`
- `label`
- `content_rich_text`
- `is_correct`
- `sort_order`
- `created_at`
- `updated_at`

Indexes:

- `idx_question_option_question_id`
- `idx_question_option_sort_order`

Rules:

- `label` is the display label such as `A`, `B`, `C`, or `D`.
- `sort_order` controls stable display order.
- `question_option` rows are not edited independently after the parent `question` is locked.

### `scoring_point`

Purpose: source scoring points for subjective or AI-scored questions.

Required columns:

- `id`
- `question_id`
- `description`
- `score`
- `sort_order`
- `created_at`
- `updated_at`

Indexes:

- `idx_scoring_point_question_id`
- `idx_scoring_point_sort_order`

Rules:

- `score` supports 0.5 increments.
- Source `scoring_point` rows belong to the source `question`.
- Draft `paper` composition copies scoring points into paper-level rows so adjustments do not mutate the source `question`.

### `question_knowledge_node`

Purpose: source relationship between `question` and `knowledge_node`.

Required columns:

- `id`
- `question_id`
- `knowledge_node_id`
- `created_at`

Indexes:

- `udx_question_knowledge_node_question_id_knowledge_node_id`
- `idx_question_knowledge_node_question_id`
- `idx_question_knowledge_node_knowledge_node_id`

Rules:

- This table is only a relationship contract in Phase 3 if `knowledge_node` schema is not yet implemented.
- Schema implementation must either add this table with validated foreign keys or defer it with explicit evidence.

### `question_tag`

Purpose: source relationship between `question` and `tag`.

Required columns:

- `id`
- `question_id`
- `tag_id`
- `created_at`

Indexes:

- `udx_question_tag_question_id_tag_id`
- `idx_question_tag_question_id`
- `idx_question_tag_tag_id`

Rules:

- This table is only a relationship contract in Phase 3 if `tag` schema is not yet implemented.
- Schema implementation must either add this table with validated foreign keys or defer it with explicit evidence.

### `paper`

Purpose: paper metadata and lifecycle.

Required columns:

- `id`
- `public_id`
- `name`
- `profession`
- `level`
- `subject`
- `paper_status`
- `paper_type`
- `year`
- `source`
- `duration_minute`
- `total_score`
- `published_at`
- `archived_at`
- `created_by_admin_id`
- `updated_by_admin_id`
- `created_at`
- `updated_at`

Indexes:

- `udx_paper_public_id`
- `idx_paper_profession_level_subject`
- `idx_paper_paper_status`
- `idx_paper_published_at`
- `idx_paper_updated_at`

Rules:

- `duration_minute` is nullable; when present it must be between 10 and 300.
- `total_score` is required before publish.
- `paper_status` uses `archived` for downlisted paper.
- `published_at` is immutable after first publish.

### `paper_section`

Purpose: paper module or large question grouping.

Required columns:

- `id`
- `paper_id`
- `title`
- `description`
- `sort_order`
- `total_score`
- `created_at`
- `updated_at`

Indexes:

- `idx_paper_section_paper_id`
- `idx_paper_section_sort_order`

Rules:

- Published paper cannot contain an empty `paper_section`.
- `total_score` is calculated from child paper questions and stored for snapshot/report stability.

### `question_group`

Purpose: material-based question group inside a paper.

Required columns:

- `id`
- `paper_id`
- `paper_section_id`
- `material_id`
- `material_snapshot`
- `title`
- `sort_order`
- `created_at`
- `updated_at`

Indexes:

- `idx_question_group_paper_id`
- `idx_question_group_paper_section_id`
- `idx_question_group_material_id`
- `idx_question_group_sort_order`

Rules:

- `material_snapshot` stores user-visible material content used by the paper.
- `material_id` remains internal and is not exposed in external URLs.
- `question_group` is optional for questions that are not material-based.

### `paper_question`

Purpose: paper-level question copy and snapshot.

Required columns:

- `id`
- `paper_id`
- `paper_section_id`
- `question_group_id`
- `question_id`
- `question_snapshot`
- `material_snapshot`
- `score`
- `sort_order`
- `created_at`
- `updated_at`

Indexes:

- `idx_paper_question_paper_id`
- `idx_paper_question_paper_section_id`
- `idx_paper_question_question_group_id`
- `idx_paper_question_question_id`
- `idx_paper_question_sort_order`

Rules:

- `question_snapshot` stores stem, question type, question_option, analysis, standard_answer, scoring_method, multi_choice_rule, and source metadata needed for immutable display and scoring.
- `material_snapshot` is nullable when the question has no material.
- `score` is required before publish and supports 0.5 increments.
- `question_group_id` is nullable for non-material questions.
- Published paper uses `paper_question` snapshots, not source `question` rows, for student display and report generation.

### `paper_scoring_point`

Purpose: paper-level scoring points copied from or adjusted from source `scoring_point`.

Required columns:

- `id`
- `paper_question_id`
- `source_scoring_point_id`
- `description`
- `score`
- `sort_order`
- `created_at`
- `updated_at`

Indexes:

- `idx_paper_scoring_point_paper_question_id`
- `idx_paper_scoring_point_source_scoring_point_id`
- `idx_paper_scoring_point_sort_order`

Rules:

- `source_scoring_point_id` is nullable when a content teacher adds a paper-specific scoring point.
- Sum of `paper_scoring_point.score` must equal `paper_question.score` for subjective questions before publish.
- Adjustments never mutate source `scoring_point`.

### `paper_asset`

Purpose: source files attached to a paper for traceability.

Required columns:

- `id`
- `public_id`
- `paper_id`
- `paper_attachment_usage`
- `file_name`
- `object_key`
- `content_type`
- `file_size_byte`
- `file_hash`
- `created_by_admin_id`
- `created_at`

Indexes:

- `udx_paper_asset_public_id`
- `idx_paper_asset_paper_id`
- `idx_paper_asset_paper_attachment_usage`
- `idx_paper_asset_file_hash`

Rules:

- `object_key` follows the object storage path convention: `{environment}/{resource-type}/{profession}/{yyyyMM}/{file-hash}.{extension}`.
- Student-facing APIs must not expose `paper_asset` or `object_key`.
- Admin APIs may expose `paper_asset.publicId`, `fileName`, `paperAttachmentUsage`, `contentType`, `fileSizeByte`, and created time.

## Snapshot Contract

Use structured JSON-compatible snapshots inside schema columns selected by the implementation task. Snapshot field names in API DTOs are camelCase; stored JSON field names should also be camelCase to avoid double mapping inside snapshots.

Minimum `question_snapshot` shape:

```json
{
  "questionPublicId": "q_...",
  "questionType": "single_choice",
  "profession": "monopoly",
  "level": 3,
  "subject": "theory",
  "stemRichText": "<p>...</p>",
  "questionOptions": [],
  "standardAnswerRichText": "<p>...</p>",
  "analysisRichText": "<p>...</p>",
  "multiChoiceRule": "all_correct_only",
  "scoringMethod": "auto_match"
}
```

Minimum `material_snapshot` shape:

```json
{
  "materialPublicId": "m_...",
  "title": "材料标题",
  "contentRichText": "<p>...</p>",
  "profession": "monopoly",
  "level": 3,
  "subject": "skill"
}
```

Snapshots must not contain internal numeric `id`, password/session data, admin phone numbers, or storage `object_key`.

## API Contract

All APIs return `{ code, message, data, pagination? }`.

### Material APIs

- `GET /api/v1/materials`
- `POST /api/v1/materials`
- `GET /api/v1/materials/{publicId}`
- `PATCH /api/v1/materials/{publicId}`
- `POST /api/v1/materials/{publicId}/disable`
- `POST /api/v1/materials/{publicId}/copy`

### Question APIs

- `GET /api/v1/questions`
- `POST /api/v1/questions`
- `GET /api/v1/questions/{publicId}`
- `PATCH /api/v1/questions/{publicId}`
- `POST /api/v1/questions/{publicId}/disable`
- `POST /api/v1/questions/{publicId}/copy`

### Paper APIs

- `GET /api/v1/papers`
- `POST /api/v1/papers`
- `GET /api/v1/papers/{publicId}`
- `PATCH /api/v1/papers/{publicId}`
- `POST /api/v1/papers/{publicId}/questions`
- `PATCH /api/v1/papers/{publicId}/questions/{paperQuestionPublicId}`
- `DELETE /api/v1/papers/{publicId}/questions/{paperQuestionPublicId}`
- `POST /api/v1/papers/{publicId}/publish`
- `POST /api/v1/papers/{publicId}/archive`
- `POST /api/v1/papers/{publicId}/copy`
- `DELETE /api/v1/papers/{publicId}`

### Paper Asset APIs

- `GET /api/v1/paper-assets`
- `POST /api/v1/paper-assets`
- `GET /api/v1/paper-assets/{publicId}`
- `DELETE /api/v1/paper-assets/{publicId}`

Route implementation tasks may split nested routes into Next.js route folders, but folder names must remain kebab-case and dynamic route params must use `[publicId]` or another public identifier name, never `[id]`.

## DTO Contract

DTOs live in `src/server/contracts` during implementation. Names below are contractual names for Phase 3.

### Shared DTOs

- `QuestionType`
- `QuestionStatus`
- `MaterialStatus`
- `PaperStatus`
- `MultiChoiceRule`
- `ScoringMethod`
- `PaperType`
- `PaperAttachmentUsage`

### Material DTOs

Required response fields:

- `publicId`
- `title`
- `contentRichText`
- `profession`
- `level`
- `subject`
- `status`
- `isLocked`
- `lockedAt`
- `createdAt`
- `updatedAt`

Optional fields must use `null`, not empty string.

### Question DTOs

Required response fields:

- `publicId`
- `questionType`
- `profession`
- `level`
- `subject`
- `stemRichText`
- `analysisRichText`
- `standardAnswerRichText`
- `status`
- `isLocked`
- `lockedAt`
- `multiChoiceRule`
- `scoringMethod`
- `materialPublicId`
- `questionOptions`
- `scoringPoints`
- `knowledgeNodePublicIds`
- `tagPublicIds`
- `createdAt`
- `updatedAt`

### Paper DTOs

Required response fields:

- `publicId`
- `name`
- `profession`
- `level`
- `subject`
- `paperStatus`
- `paperType`
- `year`
- `source`
- `durationMinute`
- `totalScore`
- `publishedAt`
- `archivedAt`
- `questionCount`
- `paperSections`
- `createdAt`
- `updatedAt`

### Paper Asset DTOs

Required response fields:

- `publicId`
- `paperPublicId`
- `paperAttachmentUsage`
- `fileName`
- `contentType`
- `fileSizeByte`
- `fileHash`
- `createdAt`

Never expose `objectKey` to student-facing APIs.

## Publish Validation Contract

Before `POST /api/v1/papers/{publicId}/publish` succeeds:

- Every `paper_question` has `score`.
- `paper.total_score` equals the sum of all counting `paper_question.score`.
- Each subjective `paper_question` has `paper_scoring_point` rows whose scores sum to the question score.
- Fill blank per-blank score totals equal the question score when the implementation supports per-blank score details.
- Paper contains at least one counting question.
- No empty `paper_section` exists.
- Draft paper has valid `profession`, `level`, and `subject`.
- All source `question` and source `material` references can be resolved for lock marking.
- Validation failures return standard API errors with `data: null`.

After publish:

- `paper.paper_status` becomes `published`.
- `paper.published_at` is set once.
- Referenced source `question` rows are locked.
- Referenced source `material` rows are locked.
- Published snapshots are immutable.

## Authorization Contract

Admin/content-management APIs:

- Require authenticated admin context.
- `super_admin` and `content_admin` can manage `question`, `material`, `paper`, `paper_section`, `question_group`, `question_option`, `scoring_point`, and `paper_asset`.
- `ops_admin` can view content metadata required for operations, but write access to question/paper authoring must be denied unless a later role decision expands it.
- Every write operation must record audit metadata or be explicitly queued for `audit_log` implementation when the audit module lands.

Student-facing access:

- Phase 3 may expose admin/content APIs only.
- Phase 4 student paper listing must filter by effective `authorization` over `profession` and `level`.
- Student-facing APIs must hide archived paper from new practice or mock exam starts.
- Historical visibility rules depend on `answer_record` and `exam_report` snapshots in later phases.

Public identifier rules:

- `publicId` lookup must always be combined with role, session, and authorization checks.
- `publicId` is not an access-control mechanism.

## Error Contract

Recommended error code ranges for Phase 3:

- `4032xx`: admin permission denied or content role denied.
- `4042xx`: question/paper/material/paper_asset public resource not found.
- `4092xx`: locked source content, invalid lifecycle transition, duplicate composition conflict.
- `4222xx`: validation failure, publish validation failure, invalid score total.

Every error response shape:

```json
{
  "code": 422201,
  "message": "Paper publish validation failed.",
  "data": null
}
```

## Implementation Sequencing

1. `phase-3-question-paper-schema-baseline`
   - Implement schema from this contract.
   - Do not generate Drizzle migration unless a dedicated approval task records human approval.
2. `phase-3-material-library-baseline`
   - Implement material service, repository, DTO mapping, and routes.
3. `phase-3-question-library-baseline`
   - Implement question service, question_option, scoring_point, search/filter, disable/copy.
4. `phase-3-paper-draft-composition-baseline`
   - Implement paper draft metadata and composition.
5. `phase-3-paper-publish-snapshot-baseline`
   - Implement publish validation and immutable snapshots.
6. `phase-3-paper-lifecycle-asset-baseline`
   - Implement archive/delete/copy and paper_asset metadata.
7. Admin UI baselines
   - Implement desktop-first content management pages after API and service contracts exist.

## Approval Decision

Approved for Phase 3 implementation tasks as a contract baseline.

This approval does not approve:

- Dependency installation.
- Migration generation.
- Production database changes.
- Remote push.
- PR creation.
- Deployment.
