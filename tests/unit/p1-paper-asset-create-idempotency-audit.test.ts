import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { admin, auditLog, paper, paperAsset, paperCommand } from "@/db/schema";
import {
  createPostgresPaperAssetRepository,
  PaperAssetCommandConflictError,
} from "@/server/repositories/paper-asset-repository";
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
    const service = createPaperAssetService(
      {
        async createPaperAsset() {
          throw new PaperAssetCommandConflictError();
        },
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

    await expect(service.createPaperAsset(validInput)).resolves.toEqual({
      code: 409208,
      message: "Paper asset command conflicts with an existing request.",
      data: null,
    });
  });

  it("claims the existing paper_command and commits asset audit and completion in one transaction", () => {
    const createStart = repositorySource.indexOf("async createPaperAsset");
    const createSource = repositorySource.slice(
      createStart,
      repositorySource.indexOf("async findPaperAssetByPublicId", createStart),
    );

    expect(createStart).toBeGreaterThan(-1);
    expect(createSource).toContain("database.transaction(async (transaction)");
    expect(createSource).toContain("claimPaperAssetCreateCommand(");
    expect(createSource).toContain("appendPaperAssetCreateAuditLog(");
    expect(createSource).toContain("completePaperAssetCreateCommand(");
    expect(createSource).toContain('commandKind: "paper_asset.create"');
  });

  it("propagates create audit failure before command completion in the same transaction", async () => {
    const auditFailure = new Error("audit unavailable");
    const update = vi.fn();
    const transactionDatabase = {
      select: vi.fn(() => ({
        from(table: unknown) {
          return {
            where() {
              return {
                async limit() {
                  if (table === admin) return [{ id: 11 }];
                  if (table === paper) return [{ id: 22 }];
                  return [];
                },
              };
            },
          };
        },
      })),
      insert: vi.fn((table: unknown) => {
        if (table === paperCommand) {
          return {
            values: () => ({
              onConflictDoNothing: () => ({
                returning: async () => [{ id: 33 }],
              }),
            }),
          };
        }

        if (table === paperAsset) {
          return {
            values: () => ({
              returning: async () => [
                { public_id: "paper-asset-public-created" },
              ],
            }),
          };
        }

        expect(table).toBe(auditLog);
        return {
          async values() {
            throw auditFailure;
          },
        };
      }),
      update,
    };
    const transaction = vi.fn(
      async (callback: (database: unknown) => Promise<unknown>) =>
        callback(transactionDatabase),
    );
    const repository = createPostgresPaperAssetRepository({
      createDatabase: () => ({ transaction }) as never,
    });

    await expect(
      repository.createPaperAsset(validInput, {
        actorPublicId: "admin-public-1",
        auditLog: {
          actorRole: "content_admin",
          actionType: "paper_asset.create",
          metadataSummary: "redacted paper_asset mutation metadata",
          requestIp: null,
        },
      }),
    ).rejects.toBe(auditFailure);
    expect(transaction).toHaveBeenCalledOnce();
    expect(update).not.toHaveBeenCalled();
  });

  it("binds replay to actor command and request identity without duplicating the asset", () => {
    expect(repositorySource).toContain("createPaperAssetRequestHash(");
    expect(repositorySource).toContain(
      "existing.actor_admin_id === input.actorAdminId",
    );
    expect(repositorySource).toContain(
      "existing.request_hash === input.requestHash",
    );
    expect(repositorySource).toMatch(
      /findPaperAssetByPublicId\(\s*scopedDatabase,\s*commandClaim\.resultPublicId,?\s*\)/u,
    );
    expect(repositorySource).toContain("PaperAssetCommandConflictError");
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
