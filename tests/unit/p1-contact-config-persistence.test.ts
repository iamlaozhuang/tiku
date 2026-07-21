import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { createPostgresContactConfigRepository } from "@/server/repositories/contact-config-repository";

function readSource(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

describe("F-0034 contact_config persistence boundary", () => {
  it("uses PostgreSQL as the default runtime without process-local stores", () => {
    const serviceSource = readSource(
      "src/server/services/contact-config-service.ts",
    );
    const repositorySource = readSource(
      "src/server/repositories/contact-config-repository.ts",
    );

    expect(serviceSource).toContain("createPostgresContactConfigRepository");
    expect(serviceSource).not.toContain("localContactConfigStore");
    expect(serviceSource).not.toContain("localQrImageStore");
    expect(repositorySource).toContain("database.transaction");
    expect(repositorySource).toContain("expectedRevision");
    expect(repositorySource).toContain("auditLog");
  });

  it("defines durable singleton config and QR media schema plus migration", () => {
    const schemaSource = readSource("src/db/schema/system.ts");
    const migrationSource = readSource(
      "drizzle/20260721203000_p1_rc_04_contact_config_persistence.sql",
    );

    expect(schemaSource).toContain('"contact_config"');
    expect(schemaSource).toContain('"contact_config_qr_image"');
    expect(schemaSource).toContain('integer("revision")');
    expect(migrationSource).toContain('CREATE TABLE "contact_config"');
    expect(migrationSource).toContain('CREATE TABLE "contact_config_qr_image"');
  });

  it("serves learner purchase guidance from the shared durable runtime", () => {
    const routeSource = readSource(
      "src/app/api/v1/contact-configs/purchase-guidance/route.ts",
    );
    const learnerSource = readSource(
      "src/features/student/profile/StudentProfileRedeemPage.tsx",
    );

    expect(routeSource).toContain("purchaseGuidance.GET");
    expect(learnerSource).toContain("PurchaseGuidanceContactConfigResultDto");
    expect(learnerSource).toContain(
      '"/api/v1/contact-configs/purchase-guidance"',
    );
    expect(learnerSource).not.toContain(
      "LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG",
    );
  });

  it("keeps audit payloads redacted and optimistic conflicts fail closed", () => {
    const repositorySource = readSource(
      "src/server/repositories/contact-config-repository.ts",
    );
    const serviceSource = readSource(
      "src/server/services/contact-config-service.ts",
    );

    expect(repositorySource).toContain(
      "redacted contact_config update metadata",
    );
    expect(repositorySource).not.toContain("metadata_summary: JSON.stringify");
    expect(serviceSource).toContain('status === "conflict"');
    expect(serviceSource).toContain("409");
  });

  it("updates the revision and appends the redacted audit in one transaction", async () => {
    const insertedValues: Record<string, unknown>[] = [];
    const updatedRow = {
      channels: [
        {
          channelType: "phone" as const,
          href: "tel:4000002026",
          isEnabled: true,
          label: "Tiku Ops",
          qrImageUrl: null,
          serviceHours: "Workdays",
          usage: "Purchase support",
          value: "400-000-2026",
        },
      ],
      created_at: new Date("2026-07-21T00:00:00.000Z"),
      id: 1,
      public_id: "contact-config-purchase-guidance",
      revision: 2,
      safety_notice: "Do not share secrets.",
      singleton_key: "purchase_guidance",
      summary: "Verified operations contact.",
      title: "Purchase support",
      updated_at: new Date("2026-07-21T01:00:00.000Z"),
      updated_by_admin_public_id: "admin-public-001",
    };
    const transactionDatabase = {
      insert: () => ({
        values: async (value: Record<string, unknown>) => {
          insertedValues.push(value);
        },
      }),
      update: () => ({
        set: () => ({
          where: () => ({ returning: async () => [updatedRow] }),
        }),
      }),
    };
    let transactionCount = 0;
    const repository = createPostgresContactConfigRepository({
      createDatabase: () =>
        ({
          transaction: async <TResult>(
            callback: (
              transaction: typeof transactionDatabase,
            ) => Promise<TResult>,
          ) => {
            transactionCount += 1;
            return callback(transactionDatabase);
          },
        }) as never,
    });

    const result = await repository.updateContactConfig({
      actor: {
        publicId: "admin-public-001",
        requestIp: null,
        role: "ops_admin",
      },
      contactConfig: {
        channels: updatedRow.channels,
        expectedRevision: 1,
        safetyNotice: updatedRow.safety_notice,
        summary: updatedRow.summary,
        title: updatedRow.title,
      },
      now: new Date("2026-07-21T01:00:00.000Z"),
    });

    expect(transactionCount).toBe(1);
    expect(result).toMatchObject({
      status: "updated",
      contactConfig: { revision: 2 },
    });
    expect(insertedValues).toHaveLength(1);
    expect(insertedValues[0]).toMatchObject({
      action_type: "contact_config.update",
      actor_public_id: "admin-public-001",
      metadata_summary: expect.stringContaining(
        "redacted contact_config update metadata",
      ),
      target_public_id: "contact-config-purchase-guidance",
    });
    expect(JSON.stringify(insertedValues[0])).not.toContain(updatedRow.title);
    expect(JSON.stringify(insertedValues[0])).not.toContain(
      updatedRow.channels[0].value,
    );
  });

  it("does not append an audit success when the expected revision is stale", async () => {
    let insertCount = 0;
    const transactionDatabase = {
      insert: () => ({
        values: async () => {
          insertCount += 1;
        },
      }),
      update: () => ({
        set: () => ({
          where: () => ({ returning: async () => [] }),
        }),
      }),
    };
    const repository = createPostgresContactConfigRepository({
      createDatabase: () =>
        ({
          transaction: async <TResult>(
            callback: (
              transaction: typeof transactionDatabase,
            ) => Promise<TResult>,
          ) => callback(transactionDatabase),
        }) as never,
    });

    const result = await repository.updateContactConfig({
      actor: {
        publicId: "admin-public-001",
        requestIp: null,
        role: "ops_admin",
      },
      contactConfig: {
        channels: [],
        expectedRevision: 1,
        safetyNotice: "Safe",
        summary: "Summary",
        title: "Title",
      },
      now: new Date("2026-07-21T01:00:00.000Z"),
    });

    expect(result).toEqual({ status: "conflict" });
    expect(insertCount).toBe(0);
  });
});
