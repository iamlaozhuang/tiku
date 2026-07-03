# 2026-07-02 Content Resource Management UI/UX Contract

## Status

This is package 6 of the approved serial UI/UX requirement contract closeout.

It is documentation-only. It records the first-release content resource management and content-admin UX contract from
existing requirement sources, current-thread decisions, and static source inspection.

It does not approve product source changes, tests, schema, migration, database access, Provider execution, env/secret
access, browser/runtime validation, staging/prod deployment, payment, external-service work, Cost Calibration, release
readiness, final Pass, or production usability claims.

## Scope

This contract covers:

- content workspace ownership for `resource`, Markdown, and RAG knowledge-base maintenance;
- `content_admin` / `super_admin` write authority and `ops_admin` removal from the first-release resource write entry;
- non-technical content-operator IA and wording for教材、讲义、课件、知识点资料;
- upload, conversion, Markdown draft review, publish, stop/restore, and search-index rebuild flows;
- private file access, redacted errors, and no raw `chunk` / `embedding` ordinary-user controls;
- current source alignment and follow-up source gaps.

This package does not cover formal `question` / `paper` adoption, content AI adoption, organization training, global
Prompt/log governance, OCR, cloud conversion provisioning, object storage rollout, or runtime RAG quality acceptance.

## Required Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-admin-model-prompt-log-governance-ui-ux-contract.md`
- current implementation files under `src/features/admin/resource-knowledge-management`,
  `src/app/(admin)/ops/resources`, `src/app/(admin)/content`, `src/app/api/v1/resources`,
  `src/server/services/rag-resource-knowledge-runtime.ts`,
  `src/server/repositories/rag-resource-knowledge-runtime-repository.ts`,
  `src/server/contracts/admin-content-knowledge-ops-contract.ts`, and related content-admin runtime files.

## Existing Requirement Decisions

The following points are already decided and are not reopened by this contract:

- Content backend is the first-release main entry for resources, Markdown, and RAG knowledge-base maintenance.
- `content_admin` and `super_admin` can perform first-release resource write operations.
- `ops_admin` does not own the resource management main entry and must not retain upload, Markdown review/publish,
  stop/restore, or search-index rebuild write access unless a later task explicitly approves a separate read-only
  support surface.
- Resource management must be friendly to non-technical content staff. Ordinary UI copy should use terms such as
  "资料", "解析草稿", "发布", and "重建检索索引" instead of leading with raw `chunk`, `embedding`, storage paths, or
  implementation policy keys.
- Supported first-release source formats are DOCX, Markdown, PPTX, and extractable-text PDF. Scanned PDF OCR is not in
  scope.
- Single file upload limit is 50MB.
- Resource metadata requires `profession`; `level` is optional or multi-selectable. Empty level means profession-level
  general material.
- Resource type values include教材、课件、知识点文档、讲义、其他.
- Markdown must be generated from uploaded files. Directly creating or pasting source-less Markdown is not approved.
- A Markdown file can be uploaded as the original file, then converted/read into a Markdown draft.
- Conversion failure keeps the resource out of publish and RAG; content staff see a safe failure reason and can delete
  or re-upload after offline processing.
- The required resource flow is: upload original file -> convert to Markdown draft -> review Markdown and section tree
  -> publish -> manually rebuild search/vector index -> RAG usable.
- Published resources do not automatically rebuild vectors. Content staff explicitly trigger the rebuild.
- If content changes while old vectors exist, RAG may continue using old vectors until the new rebuild succeeds, with a
  "possibly not latest" citation marker when applicable.
- Files, Markdown derivatives, and chunks are private. Learners only see citation title and section path, not direct
  file downloads.
- `chunk` manual adjustment and chunking parameter controls are out of first-release UI scope.
- Current decision anchors include `UX-REQ-14`, `CT-REQ-031`, `CT-REQ-057`, `CT-REQ-059`, and `CT-REQ-060`.

## Role And Access Contract

| Actor                | Required result                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `super_admin`        | Can enter content workspace resource management and perform the same resource write actions as `content_admin`.                                  |
| `content_admin`      | Main first-release owner for upload, conversion review, Markdown draft save, publish, stop/restore, and search-index rebuild.                    |
| `ops_admin`          | No first-release resource main entry and no resource write access. Later read-only support requires explicit task approval and separate wording. |
| `org_standard_admin` | No global resource management, raw material file access, raw chunk access, or platform knowledge-base write access.                              |
| `org_advanced_admin` | No global resource management, raw material file access, raw chunk access, or platform knowledge-base write access.                              |
| Learner or employee  | No direct resource file access; only approved AI citation title and section path may be visible.                                                 |

UI visibility is not the authorization boundary. Routes, services, and audit must enforce role and workspace boundaries.

## Information Architecture Contract

The content workspace should expose a first-release resource section under the content backend, alongside:

- `question` management;
- `material` management;
- `paper` management;
- `knowledge_node` tree management;
- resource and Markdown/RAG knowledge-base management;
- content `AI出题` / `AI组卷` draft and review entries.

Recommended source route shape for later implementation: `src/app/(admin)/content/resources/page.tsx` with user-facing
route `/content/resources` or the established content workspace equivalent.

The older operations route must not remain a normal write surface. Later source work should remove it, redirect it to the
content resource entry for eligible multi-role `super_admin`, or present an explicitly read-only/unsupported state. It
must not continue to give `ops_admin` resource write buttons.

## Resource List Contract

Required list fields:

- resource title;
- original file name;
- `profession`;
- `level` coverage, including a clear "通用资料" state when `level` is empty;
- resource type;
- current status;
- upload time;
- last update time;
- publish time when available;
- search-index status;
- safe failure summary when conversion or index build fails.

Required list controls:

- keyword search by safe title/file/public reference;
- filters for `profession`, `level`, resource type, and status;
- pagination default `20`, options `50` and `100`;
- sortable columns for upload/update/publish time where data exists;
- URL query preservation for filters, sort, page, and page size.

Forbidden ordinary list controls:

- raw `chunk` viewer;
- `embedding` viewer;
- object storage path viewer;
- raw full content export;
- internal auto-increment id exposure.

## Guided Workflow Contract

The first-release non-technical flow should be a guided resource lifecycle, not a technical maintenance console.

1. Upload and classify.
   - Choose file, title, `profession`, optional or multi-select `level`, and resource type.
   - Show accepted formats and 50MB limit before upload.
   - Use "资料" and "文件解析" wording instead of storage or pipeline terminology.

2. Parse and diagnose.
   - Show conversion progress and final state.
   - If conversion fails, show a safe business reason such as unsupported format, file too large, damaged file, or
     scanned PDF not supported.
   - Do not expose raw stack traces, storage paths, Provider payloads, or raw parser internals.

3. Review parsing draft.
   - Present "解析草稿" with a readable preview and editable Markdown text.
   - Provide a section tree/outline panel for heading hierarchy adjustments.
   - Allow editing title, body, list, and table text.
   - Save as draft without entering RAG.
   - Keep direct Markdown source visible enough for the confirmed requirement, but do not make raw Markdown syntax the
     only way a non-technical user understands the page.

4. Publish.
   - Publishing requires confirmation.
   - Published resource is still "待重建检索索引" until rebuild completes.
   - Published resources are private files; publish means "available to knowledge-base/RAG after indexing", not learner
     direct reading.

5. Rebuild search index.
   - Label the ordinary action "重建检索索引".
   - Confirmation should explain whether old index remains in use during rebuild.
   - Show success, failure, indexing, stale, and current-index-in-use states.
   - Do not display raw chunk text in ordinary result summaries.

6. Stop and restore.
   - Stop/disable requires confirmation and removes the resource from new retrieval.
   - Restore checks whether old index chunks still exist; if not, return to "已发布，待重建检索索引".

## Detail And Audit Contract

Resource detail should include:

- resource metadata and coverage;
- original-file safe download action when permitted;
- Markdown draft/preview state;
- conversion history;
- publish history;
- search-index rebuild history;
- stop/restore history;
- redacted operator and timestamp timeline;
- safe failure summaries.

All key writes must append `audit_log` metadata, including upload, Markdown update, publish, search-index rebuild, stop,
and restore. Audit metadata must not store raw file content, raw Markdown body, raw chunk text, object storage secret URL,
credentials, sessions, cookies, Authorization headers, Provider payload, raw Prompt, raw AI IO, or database rows.

## States Contract

Required states:

- loading;
- empty;
- error;
- permission denied;
- no content workspace permission;
- ops workspace no-resource-write state;
- upload ready;
- uploading;
- file too large;
- unsupported format;
- scanned PDF / OCR unsupported;
- conversion running;
- conversion failed;
- draft ready for review;
- draft saved;
- publish confirmation;
- published and waiting for search-index rebuild;
- rebuilding search index;
- search-index rebuild success;
- search-index rebuild failed;
- content updated while old index is active;
- stopped/disabled;
- restored;
- filters return no result.

## Current Source Alignment

Static source inspection found partial implementation, not runtime acceptance.

Aligned or directionally aligned:

- `AdminResourceKnowledgeManagement` implements a resource list, local upload, Markdown detail loading, Markdown editing,
  publish, vector rebuild, disable, enable, empty/loading/error/unauthorized states, and confirmation dialogs.
- `resourceStatusLabels` and `resourceTypeLabels` cover the expected resource lifecycle and material types.
- `rag-resource-knowledge-runtime.ts` has API handlers for resource collection, detail, Markdown update, publish,
  rebuild-vector, disable, and enable.
- Resource API handlers append redacted `audit_log` metadata for upload, Markdown update, publish, rebuild, disable, and
  enable.
- The repository contract supports server-side list query, pagination, filtering, and safe resource DTOs with public ids.
- Local runtime enforces 50MB file size and stores redacted parser summaries.
- RAG retrieval uses resource status filtering and does not expose direct learner file access in the inspected resource
  management code.

Gaps or conflicts with the confirmed contract:

- No `src/app/(admin)/content/resources/page.tsx` or equivalent one-page content resource entry was found.
- The currently implemented resource page is `src/app/(admin)/ops/resources/page.tsx`, which contradicts the current
  resource ownership decision if it remains a normal operations write entry.
- `ResourcePageHeader` still labels the page as "Ops Admin".
- `rag-resource-knowledge-runtime.ts` currently treats `ops_admin` as a `ContentAdminRole` and `canManageContent`
  returns true for `ops_admin`, so service-level resource writes still include operations admins.
- The UI still exposes technical wording such as `RAG`, `Markdown`, "向量", `chunk`, `publicId`, local `.runtime`, and
  "本地资源" in ordinary operator-facing copy.
- The visible component has client-side filtering but no visible page/pageSize controls or URL-query preservation for
  the filtered UI.
- Upload UI uses a single numeric level field, not optional/multi-select levels with "专业通用资料" as a first-class state.
- Upload implementation is local Markdown/txt oriented and explicitly says DOCX/PPTX/PDF cloud conversion needs later
  approval; this is a local/runtime limitation and not full first-release requirement completion.
- The content workspace has `ContentKnowledgeOpsBaseline` preview content, but no connected resource lifecycle page.
- `AdminContentKnowledgeOpsBaseline` uses "发布资源" and "手动重建向量" preview actions, not the confirmed non-technical
  resource lifecycle contract.
- Resource detail/timeline is not represented as a full content-admin detail surface.
- Old operations-side labels in active source and historical matrices must not be reused to justify resource write access.

## Follow-Up Source Gap Register

| Id                    | Follow-up source task direction                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `CONTENT-RES-UX-01`   | Add a content workspace resource route/page and primary navigation entry for `content_admin` and `super_admin`.                            |
| `CONTENT-RES-UX-02`   | Remove, redirect, or explicitly read-only-gate the old `/ops/resources` route; do not leave `ops_admin` resource write access.             |
| `CONTENT-RES-AUTH-03` | Change resource runtime authorization so write actions are limited to `content_admin` and `super_admin`.                                   |
| `CONTENT-RES-UX-04`   | Replace "Ops Admin" and technical copy with content-facing wording: "资料", "解析草稿", "发布", "重建检索索引", and safe failure reasons.  |
| `CONTENT-RES-UX-05`   | Add guided upload -> parse -> review -> publish -> rebuild -> stop/restore workflow with status-specific CTAs.                             |
| `CONTENT-RES-UX-06`   | Add optional/multi-select level coverage and clear "专业通用资料" state.                                                                   |
| `CONTENT-RES-UX-07`   | Add visible pagination, sorting, page-size controls, and URL-query preservation.                                                           |
| `CONTENT-RES-UX-08`   | Add a resource detail/timeline surface with safe original-file download, Markdown draft state, publish/index history, and redacted audit.  |
| `CONTENT-RES-UX-09`   | Preserve Markdown source review while also giving non-technical users readable preview and outline editing.                                |
| `CONTENT-RES-UX-10`   | Keep raw chunk, embedding, storage-path, stack trace, full content export, direct learner file access, and OCR out of first-release scope. |

## Decision Items

No new product decision is required from this package. The current decisions are sufficient:

- Resource management belongs to the content workspace.
- `content_admin` and `super_admin` own first-release resource write operations.
- `ops_admin` does not own resource write operations in the first release.
- Non-technical content staff should see business wording and guided status flows.
- OCR, raw chunk editing, object-storage rollout, and cloud conversion provisioning remain separate future work.

If a later task proposes `ops_admin` resource write access, OCR, direct source-less Markdown creation, raw chunk editing,
raw embedding views, public learner file access, bulk export of full resource content, or production cloud conversion
provisioning, it must stop and request a new product decision or implementation approval as appropriate.

## Non-Claims

- No source implementation is complete by this contract.
- No runtime acceptance is claimed.
- No Provider, database, schema, migration, dependency, staging/prod, payment, Cost Calibration, release readiness,
  final Pass, or production usability is claimed.
