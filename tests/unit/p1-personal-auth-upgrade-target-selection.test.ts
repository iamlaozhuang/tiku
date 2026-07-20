import { describe, expect, it } from "vitest";

import { evaluateRedeemCodePreview } from "@/server/models/redeem-code-preview";
import type {
  PersonalAuthPreviewRow,
  RedeemCodeAuthorizationRow,
} from "@/server/repositories/redeem-code-authorization-repository";
import { createPostgresStudentAuthorizationRedeemRuntimeRepositories } from "@/server/repositories/student-authorization-redeem-runtime-repository";

const confirmedAt = new Date("2026-07-20T18:00:00.000Z");
const userPublicId = "user-public-personal-001";
const redeemCodePlaintext = "ABCD2345";

type RecordedMutation = Record<string, unknown>;

class StubQuery<Row> implements PromiseLike<Row[]> {
  constructor(
    private readonly rows: Row[],
    private readonly recordValues?: (values: RecordedMutation) => void,
  ) {}

  from(): this {
    return this;
  }

  innerJoin(): this {
    return this;
  }

  orderBy(): this {
    return this;
  }

  where(): this {
    return this;
  }

  for(): this {
    return this;
  }

  limit(): this {
    return this;
  }

  set(values: RecordedMutation): this {
    this.recordValues?.(values);
    return this;
  }

  values(values: RecordedMutation): this {
    this.recordValues?.(values);
    return this;
  }

  returning(): this {
    return this;
  }

  then<TResult1 = Row[], TResult2 = never>(
    onfulfilled?: ((value: Row[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.rows).then(onfulfilled, onrejected);
  }
}

function createRedeemCode(): RedeemCodeAuthorizationRow {
  return {
    id: 301,
    public_id: "redeem-code-public-upgrade-001",
    profession: "monopoly",
    level: 3,
    redeem_code_type: "edition_upgrade",
    duration_day: 365,
    redeem_deadline_at: new Date("2026-08-20T18:00:00.000Z"),
    status: "unused",
    used_by_user_id: null,
    used_at: null,
    updated_at: new Date("2026-07-20T17:00:00.000Z"),
  };
}

function createPersonalAuth(
  id: number,
  publicId: string,
): PersonalAuthPreviewRow {
  return {
    id,
    public_id: publicId,
    redeem_code_public_id: `source-redeem-code-${id}`,
    edition: "standard",
    profession: "monopoly",
    level: 3,
    starts_at: new Date("2026-06-20T18:00:00.000Z"),
    expires_at: new Date("2027-06-20T18:00:00.000Z"),
    status: "active",
    updated_at: new Date("2026-07-20T16:00:00.000Z"),
  };
}

function createHarness(personalAuths: PersonalAuthPreviewRow[]) {
  const redeemCode = createRedeemCode();
  const preview = evaluateRedeemCodePreview({
    redeemCode,
    activePersonalAuths: personalAuths,
    activeUpgradedPersonalAuthPublicIds: [],
    userPublicId,
    checkedAt: confirmedAt,
  });

  if (preview.status !== "ready") {
    throw new Error("Expected a ready upgrade preview.");
  }

  let selectIndex = 0;
  const updates: RecordedMutation[] = [];
  const inserts: RecordedMutation[] = [];
  const selectRows: unknown[][] = [
    [{ id: 101, user_type: "personal" }],
    [redeemCode],
    personalAuths,
    [],
  ];
  const transaction = {
    select() {
      const rows = selectRows[selectIndex] ?? [];
      selectIndex += 1;
      return new StubQuery(rows);
    },
    update() {
      return new StubQuery(
        [
          {
            public_id: redeemCode.public_id,
            profession: redeemCode.profession,
            level: redeemCode.level,
          },
        ],
        (values) => updates.push(values),
      );
    },
    insert() {
      const insertIndex = inserts.length;
      return new StubQuery(insertIndex === 0 ? [{ id: 401 }] : [], (values) =>
        inserts.push(values),
      );
    },
  };
  const database = {
    async transaction<Result>(
      callback: (transactionValue: typeof transaction) => Promise<Result>,
    ) {
      return callback(transaction);
    },
  };
  const repository =
    createPostgresStudentAuthorizationRedeemRuntimeRepositories({
      createDatabase: () => database as never,
      createAuthUpgradePublicId: () => "auth-upgrade-public-001",
    }).redeemCodeAuthorizationRepository;

  return {
    previewVersion: preview.data.previewVersion,
    repository,
    updates,
    inserts,
  };
}

describe("F-0004 personal authorization upgrade target selection", () => {
  it("resolves an omitted target only when one eligible standard authorization exists and audits the public target", async () => {
    const target = createPersonalAuth(201, "personal-auth-public-001");
    const harness = createHarness([target]);

    await expect(
      harness.repository.confirmRedeemCodeForUser({
        code: redeemCodePlaintext,
        userPublicId,
        confirmedAt,
        previewVersion: harness.previewVersion,
        targetPersonalAuthPublicId: null,
      }),
    ).resolves.toMatchObject({
      status: "redeemed",
      personalAuth: { public_id: target.public_id },
    });

    expect(harness.updates).toHaveLength(1);
    expect(harness.inserts[0]).toMatchObject({
      personal_auth_id: target.id,
      public_id: "auth-upgrade-public-001",
      source_type: "redeem_code",
      target_edition: "advanced",
    });
    expect(harness.inserts[1]).toMatchObject({
      actor_public_id: userPublicId,
      actor_role: "student",
      action_type: "personal_auth.upgrade_by_redeem_code",
      target_resource_type: "personal_auth",
      target_public_id: target.public_id,
      result_status: "success",
    });
    expect(JSON.stringify(harness.inserts[1])).not.toContain(
      redeemCodePlaintext,
    );
    expect(JSON.stringify(harness.inserts[1])).not.toMatch(/"\w+_id":\d+/u);
  });

  it("rejects an omitted target when multiple eligible standards exist before any mutation", async () => {
    const harness = createHarness([
      createPersonalAuth(201, "personal-auth-public-001"),
      createPersonalAuth(202, "personal-auth-public-002"),
    ]);

    await expect(
      harness.repository.confirmRedeemCodeForUser({
        code: redeemCodePlaintext,
        userPublicId,
        confirmedAt,
        previewVersion: harness.previewVersion,
        targetPersonalAuthPublicId: null,
      }),
    ).resolves.toEqual({ status: "invalid_target" });
    expect(harness.updates).toEqual([]);
    expect(harness.inserts).toEqual([]);
  });

  it("honors an explicit eligible target when multiple standards exist", async () => {
    const firstTarget = createPersonalAuth(201, "personal-auth-public-001");
    const selectedTarget = createPersonalAuth(202, "personal-auth-public-002");
    const harness = createHarness([firstTarget, selectedTarget]);

    await expect(
      harness.repository.confirmRedeemCodeForUser({
        code: redeemCodePlaintext,
        userPublicId,
        confirmedAt,
        previewVersion: harness.previewVersion,
        targetPersonalAuthPublicId: selectedTarget.public_id,
      }),
    ).resolves.toMatchObject({
      status: "redeemed",
      personalAuth: { public_id: selectedTarget.public_id },
    });
    expect(harness.inserts[0]).toMatchObject({
      personal_auth_id: selectedTarget.id,
    });
    expect(harness.inserts[1]).toMatchObject({
      target_public_id: selectedTarget.public_id,
    });
  });

  it("rejects a forged explicit target before any mutation", async () => {
    const harness = createHarness([
      createPersonalAuth(201, "personal-auth-public-001"),
      createPersonalAuth(202, "personal-auth-public-002"),
    ]);

    await expect(
      harness.repository.confirmRedeemCodeForUser({
        code: redeemCodePlaintext,
        userPublicId,
        confirmedAt,
        previewVersion: harness.previewVersion,
        targetPersonalAuthPublicId: "personal-auth-public-forged",
      }),
    ).resolves.toEqual({ status: "invalid_target" });
    expect(harness.updates).toEqual([]);
    expect(harness.inserts).toEqual([]);
  });
});
