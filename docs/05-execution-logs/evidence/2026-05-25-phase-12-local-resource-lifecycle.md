# Evidence: Phase 12 Local Resource Lifecycle

## Status

`validated`

## Boundary

This task implements local/dev resource lifecycle only. It does not change dependencies, package or lockfiles, schema, migrations, scripts, secrets, env files, staging/prod, deployment, cloud resources, Tencent Cloud COS, or public object storage URLs.

## Recovery

| Item            | Result                                       |
| --------------- | -------------------------------------------- |
| Started from    | clean `master` at `06c4418`                  |
| Branch          | `codex/phase-12-local-resource-lifecycle`    |
| Task            | `phase-12-repair-local-resource-lifecycle`   |
| Claim readiness | pass                                         |
| High-risk gates | schema/dependency/secret/cloud remain closed |

## Implementation Summary

- Added local-only resource storage under ignored `.runtime/uploads` using `dev/resource/{profession}/{yyyymm}/{hash}.{ext}` object keys.
- Added protected local resource upload through `POST /api/v1/resources`; Markdown/txt files become `draft`, unsupported files become `conversion_failed`.
- Added local resource detail and Markdown draft save through `/api/v1/resources/{publicId}`.
- Extended publish and rebuild behavior so local resources can move `draft -> published -> rag_ready` without schema, migration, dependency, cloud, or provider changes.
- Added local resource disable through `POST /api/v1/resources/{publicId}/disable`.
- Updated `/ops/resources` to expose upload, Markdown review, publish, rebuild, and disable actions in empty and populated states.
- Evidence and UI do not expose local absolute paths, object keys, embeddings, chunk text, secrets, tokens, Authorization headers, raw prompts, raw answers, or provider payloads.

## Validation

| Command                                                                                                                                                                                                                                                                                                                                               | Result                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-local-resource-lifecycle`                                                                                                                                                                                         | pass                    |
| `npm.cmd run test:unit -- tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/phase-11-local-file-upload-storage-adapter.test.ts tests/unit/phase-11-local-text-document-parser-boundary.test.ts tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts tests/unit/phase-11-local-rag-mock-embedding-pipeline.test.ts` | pass: 5 files, 26 tests |
| `npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts`                                                                                                                                                                                                                                                                                             | pass: 1 Playwright test |
| `npm.cmd run build`                                                                                                                                                                                                                                                                                                                                   | pass                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                                                                                                                                                                                        | pass                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                                                                                                                                                                                           | pass                    |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                    | pass                    |

## Runtime Notes

- The first E2E resource assertion exposed that the empty resource page did not render an upload entry; this was fixed so local upload remains available even before any resource exists.
- One E2E rerun hit a transient local API empty-response failure before reaching the resource section; local PostgreSQL was restarted and the same E2E command later passed.
- A manual local upload smoke was used only to classify the upload failure; the response content is not recorded here because evidence must remain redacted.

## Repository Hygiene

| Item                            | Result                                             |
| ------------------------------- | -------------------------------------------------- |
| Package/lockfile changes        | none                                               |
| Schema/migration/script changes | none                                               |
| Secret/env access               | no `.env.local` content read or output             |
| Staging/prod/cloud/deploy       | not touched                                        |
| Runtime output                  | local ignored `.runtime/` only                     |
| Provider calls                  | none                                               |
| Next task after closeout        | `phase-12-repair-student-mistake-book-ac-coverage` |

## Notes

- Evidence must not include local file contents, full教材、完整试卷、OCR 全文, secret, token, Authorization header, raw prompt, raw answer, raw model response, provider payload, or customer/customer-like private data.

## Taste Compliance Self-Check

- 禁止廉价视觉感：未引入纯黑、Inter 或紫蓝渐变。
- Loading/Empty/Error：资源页保留 loading、empty、unauthorized、error，并修复 empty 状态缺上传入口的问题。
- 交互反馈：新增按钮沿用项目 Button，保留 active/disabled 交互。
- Tailwind 顺序：已用项目 Prettier 格式化。
- API 标准响应：新增资源 JSON API 返回 `{ code, message, data }`。
- N+1/SQL/schema：未新增数据库查询循环，未改 schema/migration。
- 注释：未加入解释性废话注释。
- 命名：沿用 `resource`、`knowledge_base`、`chunk`、`publicId`、`resourceStatus` 等术语。
- 不可变性：前端资源列表更新使用 `map/filter/spread`。
- 环境隔离：仅 dev/local `.runtime`，未触碰 staging/prod/cloud。
