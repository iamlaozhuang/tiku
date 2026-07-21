import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { createPaperAssetService } from "@/server/services/paper-asset-service";
import { normalizeCreatePaperAssetInput } from "@/server/validators/paper-asset";

const commandPublicId = "paper-asset-command-76aca5d6-a60b-4a4f-b8f7";
const validInput = {
  paperPublicId: "paper-public-1",
  paperAttachmentUsage: "paper_source" as const,
  fileName: "paper.md",
  objectKey: "dev/paper-asset/marketing/202607/file.md",
  contentType: "text/markdown",
  fileSizeByte: 12,
  fileHash: "a".repeat(64),
  commandPublicId,
};
const repositorySource = readFileSync(
  resolve(process.cwd(), "src/server/repositories/paper-asset-repository.ts"),
  "utf8",
);
const runtimeSource = readFileSync(
  resolve(
    process.cwd(),
    "src/server/services/paper-composition-lifecycle-runtime.ts",
  ),
  "utf8",
);
const adminUiSource = readFileSync(
  resolve(
    process.cwd(),
    "src/features/admin/paper-management/AdminPaperManagementClient.tsx",
  ),
  "utf8",
);

describe("F-0031 paper_asset multipart create idempotency and audit atomicity", () => {
  it("requires and preserves a client command public id", () => {
    expect(normalizeCreatePaperAssetInput(validInput)).toEqual({
      success: true,
      value: validInput,
    });
    expect(
      normalizeCreatePaperAssetInput({
        ...validInput,
        commandPublicId: undefined,
      }),
    ).toEqual({
      success: false,
      message: "Invalid paper_asset input.",
    });
  });

  it("rejects an overlong command identity before any repository call", () => {
    expect(
      normalizeCreatePaperAssetInput({
        ...validInput,
        commandPublicId: "x".repeat(201),
      }),
    ).toEqual({
      success: false,
      message: "Invalid paper_asset input.",
    });
  });

  it("returns a stable conflict response for a reused command with different input", async () => {
    const fileBytes = Buffer.from("paper asset conflict");
    const fileHash = createHash("sha256").update(fileBytes).digest("hex");
    const service = createPaperAssetService(
      {
        async preparePaperAssetUpload() {
          return { status: "conflict", reason: "request_mismatch" };
        },
        async markPaperAssetUploadFileStored() {
          return true;
        },
        async completePaperAssetUpload() {
          throw new Error("Conflicted upload must not complete.");
        },
        async recordPaperAssetUploadFailure() {},
      } as never,
      {
        mutationContext: {
          actorPublicId: "admin-public-1",
          auditLog: {
            actorRole: "content_admin",
            actionType: "paper_asset.create",
            metadataSummary: "redacted paper_asset mutation metadata",
            requestIp: null,
          },
        },
      },
    );

    await expect(
      service.createPaperAsset({
        commandPublicId,
        preparedFile: {
          bytes: fileBytes,
          paperPublicId: validInput.paperPublicId,
          paperAttachmentUsage: validInput.paperAttachmentUsage,
          profession: "marketing",
          fileName: validInput.fileName,
          objectKey: `dev/paper-asset/marketing/202607/${fileHash}.md`,
          contentType: validInput.contentType,
          fileSizeByte: fileBytes.byteLength,
          fileHash,
        },
      }),
    ).resolves.toEqual({
      code: 409208,
      message: "Paper asset command conflicts with an existing request.",
      data: null,
    });
  });

  it("commits the asset audit and operation completion in one transaction", () => {
    const completeStart = repositorySource.indexOf(
      "async function completePaperAssetUpload",
    );
    const completeSource = repositorySource.slice(completeStart);

    expect(completeStart).toBeGreaterThan(-1);
    expect(completeSource).toContain(
      "database.transaction(async (transaction)",
    );
    expect(completeSource).toContain(".insert(paperAsset)");
    expect(completeSource).toContain("appendPaperAssetCreateAuditLog(");
    expect(completeSource).toContain('operation_status: "completed"');
    expect(completeSource.indexOf(".insert(paperAsset)")).toBeLessThan(
      completeSource.indexOf("appendPaperAssetCreateAuditLog("),
    );
    expect(
      completeSource.indexOf("appendPaperAssetCreateAuditLog("),
    ).toBeLessThan(completeSource.indexOf('operation_status: "completed"'));
  });

  it("binds replay to actor command and request identity without duplicating the asset", () => {
    expect(repositorySource).toContain(
      "operationRow.actor_admin_id !== actorAdminId",
    );
    expect(repositorySource).toContain("operationRow.paper_id !== paperRow.id");
    expect(repositorySource).toContain(
      "operationRow.request_fingerprint !== input.requestFingerprint",
    );
    expect(repositorySource).toContain(
      "target: paperAssetUploadOperation.idempotency_key_hash",
    );
    expect(repositorySource).not.toContain("PaperAssetCommandConflictError");
  });

  it("writes a fixed redacted create audit and keeps external audit only for failed create", () => {
    expect(repositorySource).toContain('action_type: "paper_asset.create"');
    expect(repositorySource).toContain('target_resource_type: "paper_asset"');
    expect(repositorySource).toContain('result_status: "success"');

    const paperAssetRoutes = runtimeSource.slice(
      runtimeSource.indexOf("paperAssets: {"),
    );
    const createStart = paperAssetRoutes.indexOf("async POST");
    const deleteStart = paperAssetRoutes.indexOf("async DELETE");
    const createRoute = paperAssetRoutes.slice(createStart, deleteStart);

    expect(runtimeSource).toContain("createPaperAssetCreateMutationContext(");
    expect(createRoute).toMatch(
      /createPaperAssetServiceForActor\(\s*actorOrError,\s*request,?\s*\)/u,
    );
    expect(createRoute).toContain("if (response.code !== 0)");
    expect(createRoute).toContain("await auditPaperMutation(");
  });

  it("reuses one client command id across transport retry and clears it only after success", () => {
    expect(adminUiSource).toMatch(
      /const commandKey = \[\s*"paper-asset",\s*values\.paperPublicId,\s*values\.file\.name,\s*values\.file\.size,\s*values\.file\.lastModified,?\s*\]\.join\(":"\)/u,
    );
    expect(adminUiSource).toContain(
      "createPaperAssetFormData(values, commandPublicId)",
    );
    expect(adminUiSource).toContain(
      'formData.set("commandPublicId", commandPublicId)',
    );
    expect(adminUiSource).toContain(
      "paperCommandPublicIdsRef.current.delete(commandKey)",
    );
  });
});
