import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  appendContentMutationAuditLog,
  type ContentMutationContext,
} from "@/server/repositories/content-mutation-audit";

const questionRepositorySource = readFileSync(
  resolve(process.cwd(), "src/server/repositories/question-repository.ts"),
  "utf8",
);
const materialRepositorySource = readFileSync(
  resolve(process.cwd(), "src/server/repositories/material-repository.ts"),
  "utf8",
);
const runtimeSource = readFileSync(
  resolve(
    process.cwd(),
    "src/server/services/content-question-material-runtime.ts",
  ),
  "utf8",
);

const auditContext: ContentMutationContext = {
  actorPublicId: "admin-public-1",
  auditLog: {
    actorRole: "content_admin",
    actionType: "question.create",
    targetResourceType: "question",
    metadataSummary: "redacted question mutation metadata",
    requestIp: "127.0.0.1",
  },
};

describe("F-0031 question/material audit atomicity partition", () => {
  it("writes only redacted success audit data through the supplied transaction", async () => {
    const values = vi.fn(async () => undefined);
    const insert = vi.fn(() => ({ values }));

    await appendContentMutationAuditLog(
      { insert } as never,
      auditContext,
      "question-public-1",
    );

    expect(insert).toHaveBeenCalledOnce();
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_public_id: "admin-public-1",
        actor_role: "content_admin",
        action_type: "question.create",
        target_resource_type: "question",
        target_public_id: "question-public-1",
        result_status: "success",
        metadata_summary: "redacted question mutation metadata",
        request_ip: "127.0.0.1",
      }),
    );
    expect(JSON.stringify(values.mock.calls)).not.toContain("stemRichText");
    expect(JSON.stringify(values.mock.calls)).not.toContain("contentRichText");
  });

  it("propagates audit insert failure so the enclosing mutation transaction can roll back", async () => {
    const auditFailure = new Error("audit unavailable");
    const database = {
      insert: vi.fn(() => ({
        values: vi.fn(async () => {
          throw auditFailure;
        }),
      })),
    };

    await expect(
      appendContentMutationAuditLog(
        database as never,
        auditContext,
        "question-public-1",
      ),
    ).rejects.toBe(auditFailure);
  });

  it.each([
    ["question", questionRepositorySource],
    ["material", materialRepositorySource],
  ])(
    "keeps all %s mutation and success-audit writes inside repository transactions",
    (_resourceType, source) => {
      for (const methodName of [
        `create${capitalize(_resourceType)}`,
        `update${capitalize(_resourceType)}`,
        `disable${capitalize(_resourceType)}`,
        `copy${capitalize(_resourceType)}`,
      ]) {
        const methodStart = source.indexOf(`async ${methodName}`);
        const nextMethodStart = source.indexOf("\n    async ", methodStart + 1);
        const methodSource = source.slice(
          methodStart,
          nextMethodStart === -1 ? undefined : nextMethodStart,
        );

        expect(methodStart, `${methodName} exists`).toBeGreaterThan(-1);
        expect(methodSource).toContain(
          "database.transaction(async (transaction)",
        );
        expect(methodSource).toContain("appendContentMutationAuditLog(");
      }
    },
  );

  it("passes audit context into repositories and retains external audits only for failed commands", () => {
    expect(runtimeSource).toContain("auditLog: {");
    expect(runtimeSource).toContain("if (response.code !== 0)");
    expect(runtimeSource).not.toMatch(
      /if \(response\.code === 0\)[\s\S]{0,200}auditFailed(?:Question|Material)Mutation/u,
    );
  });
});

function capitalize(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
