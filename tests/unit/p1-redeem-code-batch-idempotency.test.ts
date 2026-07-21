import { describe, expect, it } from "vitest";

import { auditLog, redeemCode } from "@/db/schema";
import {
  createPostgresAdminRedeemCodeRuntimeRepositories,
  type AdminRedeemCodeRuntimeRepositories,
} from "@/server/repositories/admin-redeem-code-runtime-repository";

const createdAt = new Date("2026-07-20T20:00:00.000Z");
const requestPublicId = "redeem-code-generation-request-public-001";
const actorPublicId = "admin-public-001";

type RecordedValues = Record<string, unknown>;
type RedeemCodeRow = {
  public_id: string;
  code_display: string;
  redeem_code_type: "personal_standard_activation";
  profession: "monopoly";
  level: number;
  duration_day: number;
  redeem_deadline_at: Date | null;
  status: "unused";
  generation_group_id: string;
  created_at: Date;
};

class StubQuery<Row> implements PromiseLike<Row[]> {
  private rows: Row[];

  constructor(
    rows: Row[],
    private readonly recordValues?: (values: RecordedValues) => Row[],
  ) {
    this.rows = rows;
  }

  from(): this {
    return this;
  }

  orderBy(): this {
    return this;
  }

  where(): this {
    return this;
  }

  limit(): this {
    return this;
  }

  values(values: RecordedValues): this {
    this.rows = this.recordValues?.(values) ?? this.rows;
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

function createExistingRow(
  generationGroupId = `redeem-code-batch-${actorPublicId}-${requestPublicId}`,
): RedeemCodeRow {
  return {
    public_id: "redeem-code-public-001",
    code_display: "ABCDEFG2",
    redeem_code_type: "personal_standard_activation",
    profession: "monopoly",
    level: 3,
    duration_day: 365,
    redeem_deadline_at: null,
    status: "unused",
    generation_group_id: generationGroupId,
    created_at: createdAt,
  };
}

function createInput(
  overrides: Record<string, unknown> = {},
): Parameters<
  AdminRedeemCodeRuntimeRepositories["createRedeemCodeBatchAtomically"]
>[0] {
  return {
    actorPublicId,
    actorRole: "ops_admin",
    count: 1,
    durationDay: 365,
    level: 3,
    profession: "monopoly",
    redeemCodeType: "personal_standard_activation",
    redeemDeadlineAt: null,
    requestIp: "127.0.0.1",
    requestPublicId,
    ...overrides,
  } as Parameters<
    AdminRedeemCodeRuntimeRepositories["createRedeemCodeBatchAtomically"]
  >[0];
}

function createHarness(input?: {
  failAuditAt?: number;
  selectRows?: RedeemCodeRow[][];
}) {
  let persistedRedeemCodes: RecordedValues[] = [];
  let persistedAudits: RecordedValues[] = [];
  const queuedSelectRows = [...(input?.selectRows ?? [[]])];
  let selectIndex = 0;
  let generatedPublicIdIndex = 0;
  let lockTail = Promise.resolve();

  const database = {
    async transaction<Result>(
      callback: (transaction: {
        execute(): Promise<void>;
        insert(table: unknown): StubQuery<unknown>;
        select(): StubQuery<RedeemCodeRow>;
      }) => Promise<Result>,
    ) {
      let pendingRedeemCodes: RecordedValues[] = [];
      let pendingAudits: RecordedValues[] = [];
      let releaseTransactionLock: () => void = () => undefined;
      const transaction = {
        async execute() {
          const priorLock = lockTail;
          let releaseLock: () => void = () => undefined;

          lockTail = new Promise<void>((resolve) => {
            releaseLock = resolve;
          });
          await priorLock;
          releaseTransactionLock = releaseLock;
        },
        insert(table: unknown) {
          if (table === redeemCode) {
            return new StubQuery<unknown>([], (values) => {
              pendingRedeemCodes = [...pendingRedeemCodes, values];
              return [
                {
                  public_id: values.public_id,
                  code_display: values.code_display,
                  redeem_code_type: values.redeem_code_type,
                  profession: values.profession,
                  level: values.level,
                  status: values.status,
                  redeem_deadline_at: values.redeem_deadline_at,
                  created_at: createdAt,
                },
              ];
            });
          }

          if (table === auditLog) {
            return new StubQuery<unknown>([], (values) => {
              if (pendingAudits.length + 1 === input?.failAuditAt) {
                throw new Error("audit unavailable");
              }

              pendingAudits = [...pendingAudits, values];
              return [];
            });
          }

          throw new Error("Unexpected insert table.");
        },
        select() {
          const rows = queuedSelectRows[selectIndex] ?? [];

          selectIndex += 1;
          return new StubQuery<RedeemCodeRow>(rows);
        },
      };

      try {
        const result = await callback(transaction);

        persistedRedeemCodes = [...persistedRedeemCodes, ...pendingRedeemCodes];
        persistedAudits = [...persistedAudits, ...pendingAudits];
        return result;
      } finally {
        releaseTransactionLock();
      }
    },
  };
  const repository = createPostgresAdminRedeemCodeRuntimeRepositories({
    createDatabase: () => database as never,
    createGenerationGroupId: (generationInput?: {
      actorPublicId: string;
      requestPublicId: string;
    }) =>
      generationInput === undefined
        ? "legacy-random-batch"
        : `redeem-code-batch-${generationInput.actorPublicId}-${generationInput.requestPublicId}`,
    createRedeemCodePlainText: () => "ABCDEFG2",
    createRedeemCodePublicId: () => {
      generatedPublicIdIndex += 1;
      return `redeem-code-public-${generatedPublicIdIndex.toString().padStart(3, "0")}`;
    },
    now: () => createdAt,
  });

  return {
    get persistedAudits() {
      return persistedAudits;
    },
    get persistedRedeemCodes() {
      return persistedRedeemCodes;
    },
    repository,
  };
}

describe("F-0017 redeem code batch transaction and idempotency", () => {
  it("exposes only the audit-owning atomic generation command", () => {
    const harness = createHarness();
    const commands = harness.repository as unknown as Record<string, unknown>;

    expect(typeof commands.createRedeemCodeBatchAtomically).toBe("function");
    expect(commands.createRedeemCodeBatch).toBeUndefined();
  });

  it("rolls back card rows when either required audit write fails", async () => {
    const harness = createHarness({ failAuditAt: 2 });

    await expect(
      harness.repository.createRedeemCodeBatchAtomically(createInput()),
    ).rejects.toThrow("audit unavailable");
    expect(harness.persistedRedeemCodes).toEqual([]);
    expect(harness.persistedAudits).toEqual([]);
  });

  it("returns one persisted batch for an exact retry without new cards", async () => {
    const existingRow = createExistingRow();
    const harness = createHarness({ selectRows: [[], [existingRow]] });

    const firstResult =
      await harness.repository.createRedeemCodeBatchAtomically(createInput());
    const retryResult =
      await harness.repository.createRedeemCodeBatchAtomically(createInput());

    expect(retryResult).toEqual(firstResult);
    expect(harness.persistedRedeemCodes).toHaveLength(1);
    expect(harness.persistedAudits).toHaveLength(3);
    expect(
      harness.persistedAudits.filter(
        (audit) => audit.action_type === "redeem_code.batch_create",
      ),
    ).toHaveLength(1);
    expect(
      harness.persistedAudits.filter(
        (audit) => audit.action_type === "redeem_code.plaintext_view",
      ),
    ).toHaveLength(2);
    expect(JSON.stringify(harness.persistedAudits)).not.toContain("ABCDEFG2");
  });

  it("rejects payload reuse for the same actor and request before mutation", async () => {
    const harness = createHarness({ selectRows: [[createExistingRow()]] });

    await expect(
      harness.repository.createRedeemCodeBatchAtomically(
        createInput({ durationDay: 730 }),
      ),
    ).rejects.toMatchObject({
      name: "RedeemCodeGenerationIdempotencyConflictError",
    });
    expect(harness.persistedRedeemCodes).toEqual([]);
    expect(harness.persistedAudits).toEqual([]);
  });

  it("isolates the same request public ID by actor", async () => {
    const harness = createHarness({ selectRows: [[], []] });

    const firstResult =
      await harness.repository.createRedeemCodeBatchAtomically(createInput());
    const secondResult =
      await harness.repository.createRedeemCodeBatchAtomically(
        createInput({ actorPublicId: "admin-public-002" }),
      );

    expect(secondResult.generation.generationGroupId).not.toBe(
      firstResult.generation.generationGroupId,
    );
    expect(harness.persistedRedeemCodes).toHaveLength(2);
  });

  it("serializes concurrent exact retries to one batch", async () => {
    const harness = createHarness({ selectRows: [[], [createExistingRow()]] });

    const [firstResult, retryResult] = await Promise.all([
      harness.repository.createRedeemCodeBatchAtomically(createInput()),
      harness.repository.createRedeemCodeBatchAtomically(createInput()),
    ]);

    expect(retryResult).toEqual(firstResult);
    expect(harness.persistedRedeemCodes).toHaveLength(1);
    expect(harness.persistedAudits).toHaveLength(3);
  });
});
