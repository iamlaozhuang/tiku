import { createHash, randomUUID } from "node:crypto";

import { and, asc, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as databaseSchema from "@/db/schema";
import type { AuthorizationEdition } from "../models/auth";
import { evaluateRedeemCodePreview } from "../models/redeem-code-preview";
import type {
  EffectiveAuthUpgradeRow,
  EffectiveAuthorizationRepository,
  EffectiveOrgAuthRow,
  EffectivePersonalAuthRow,
} from "./effective-authorization-repository";
import type {
  ConfirmRedeemCodeForUserInput,
  ConfirmRedeemCodeForUserResult,
  PersonalAuthAccessRow,
  PersonalAuthPreviewRow,
  RedeemCodeAuthorizationRepository,
  RedeemCodeAuthorizationRow,
  RedeemCodePreviewFacts,
} from "./redeem-code-authorization-repository";
import { createRuntimeDatabaseForSchema } from "./runtime-database";
import { createOrgAuthCoversOrganizationCondition } from "./organization-scope-query";

type StudentAuthorizationRedeemRuntimeDatabase = PostgresJsDatabase<
  typeof databaseSchema
>;

export type StudentAuthorizationRedeemRuntimeRepositoryOptions = {
  createDatabase?: () => StudentAuthorizationRedeemRuntimeDatabase;
  createPersonalAuthPublicId?: () => string;
  createAuthUpgradePublicId?: () => string;
};

export type StudentAuthorizationRedeemRuntimeRepositories = {
  effectiveAuthorizationRepository: EffectiveAuthorizationRepository;
  redeemCodeAuthorizationRepository: RedeemCodeAuthorizationRepository;
};

const {
  employee,
  employeeOrgAuth,
  authUpgrade,
  organization,
  orgAuth,
  personalAuth,
  redeemCode,
  user,
} = databaseSchema;

function createDefaultPersonalAuthPublicId(): string {
  return `personal-auth-${randomUUID()}`;
}

function createDefaultAuthUpgradePublicId(): string {
  return `auth-upgrade-${randomUUID()}`;
}

function createRedeemCodeHash(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function createLazyDatabaseGetter(
  createDatabase: () => StudentAuthorizationRedeemRuntimeDatabase,
): () => StudentAuthorizationRedeemRuntimeDatabase {
  let cachedDatabase: StudentAuthorizationRedeemRuntimeDatabase | undefined;

  return () => {
    cachedDatabase ??= createDatabase();

    return cachedDatabase;
  };
}

export function createPostgresStudentAuthorizationRedeemRuntimeRepositories(
  options: StudentAuthorizationRedeemRuntimeRepositoryOptions = {},
): StudentAuthorizationRedeemRuntimeRepositories {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ?? createLocalRuntimeDatabase,
  );
  const createPersonalAuthPublicId =
    options.createPersonalAuthPublicId ?? createDefaultPersonalAuthPublicId;
  const createAuthUpgradePublicId =
    options.createAuthUpgradePublicId ?? createDefaultAuthUpgradePublicId;

  return {
    effectiveAuthorizationRepository:
      createPostgresEffectiveAuthorizationRepository(getDatabase),
    redeemCodeAuthorizationRepository:
      createPostgresRedeemCodeAuthorizationRepository(
        getDatabase,
        createPersonalAuthPublicId,
        createAuthUpgradePublicId,
      ),
  };
}

function createPostgresEffectiveAuthorizationRepository(
  getDatabase: () => StudentAuthorizationRedeemRuntimeDatabase,
): EffectiveAuthorizationRepository {
  return {
    async listPersonalAuthsByUserPublicId(userPublicId) {
      const rows = await getDatabase()
        .select({
          id: personalAuth.id,
          public_id: personalAuth.public_id,
          edition: personalAuth.edition,
          profession: personalAuth.profession,
          level: personalAuth.level,
          starts_at: personalAuth.starts_at,
          expires_at: personalAuth.expires_at,
          status: personalAuth.status,
        })
        .from(personalAuth)
        .innerJoin(user, eq(user.id, personalAuth.user_id))
        .where(and(eq(user.public_id, userPublicId), eq(user.status, "active")))
        .orderBy(asc(personalAuth.expires_at));

      return rows satisfies EffectivePersonalAuthRow[];
    },

    async listOrgAuthsByUserPublicId(userPublicId) {
      const rows = await getDatabase()
        .select({
          id: orgAuth.id,
          public_id: orgAuth.public_id,
          organization_public_id: organization.public_id,
          organization_name: organization.name,
          organization_status: organization.status,
          edition: orgAuth.edition,
          profession: orgAuth.profession,
          level: orgAuth.level,
          starts_at: orgAuth.starts_at,
          expires_at: orgAuth.expires_at,
          status: orgAuth.status,
        })
        .from(employee)
        .innerJoin(user, eq(user.id, employee.user_id))
        .innerJoin(organization, eq(organization.id, employee.organization_id))
        .innerJoin(
          employeeOrgAuth,
          eq(employeeOrgAuth.employee_id, employee.id),
        )
        .innerJoin(orgAuth, eq(orgAuth.id, employeeOrgAuth.org_auth_id))
        .where(
          and(
            eq(user.public_id, userPublicId),
            eq(user.user_type, "employee"),
            eq(user.status, "active"),
            eq(organization.status, "active"),
            createOrgAuthCoversOrganizationCondition({
              authScopeType: orgAuth.auth_scope_type,
              orgAuthId: orgAuth.id,
              organizationId: organization.id,
              purchaserOrganizationId: orgAuth.purchaser_organization_id,
            }),
          ),
        )
        .orderBy(asc(orgAuth.expires_at));

      return rows satisfies EffectiveOrgAuthRow[];
    },

    async listAuthUpgradesByAuthorizationPublicIds(authorizationPublicIds) {
      if (authorizationPublicIds.length === 0) {
        return [];
      }

      const rows = await getDatabase()
        .select({
          personal_auth_public_id: personalAuth.public_id,
          org_auth_public_id: orgAuth.public_id,
          target_edition: authUpgrade.target_edition,
          starts_at: authUpgrade.starts_at,
          expires_at: authUpgrade.expires_at,
          revoked_at: authUpgrade.revoked_at,
          status: authUpgrade.status,
        })
        .from(authUpgrade)
        .leftJoin(
          personalAuth,
          eq(personalAuth.id, authUpgrade.personal_auth_id),
        )
        .leftJoin(orgAuth, eq(orgAuth.id, authUpgrade.org_auth_id))
        .where(
          or(
            inArray(personalAuth.public_id, authorizationPublicIds),
            inArray(orgAuth.public_id, authorizationPublicIds),
          ),
        );

      return rows satisfies EffectiveAuthUpgradeRow[];
    },
  };
}

function createPostgresRedeemCodeAuthorizationRepository(
  getDatabase: () => StudentAuthorizationRedeemRuntimeDatabase,
  createPersonalAuthPublicId: () => string,
  createAuthUpgradePublicId: () => string,
): RedeemCodeAuthorizationRepository {
  return {
    async previewRedeemCodeForUser(input) {
      return getDatabase().transaction(async (transaction) => {
        const userId = await findActiveUserIdByPublicId(
          transaction,
          input.userPublicId,
        );

        if (userId === null) {
          return null;
        }

        const redeemCodeRow = await findRedeemCodeByHash(
          transaction,
          input.code,
        );

        if (redeemCodeRow === null) {
          return null;
        }

        return loadRedeemCodePreviewFacts(
          transaction,
          userId,
          redeemCodeRow,
          input.previewedAt,
          false,
        );
      });
    },

    async confirmRedeemCodeForUser(input) {
      return confirmRedeemCodeForUser(
        getDatabase(),
        input,
        createPersonalAuthPublicId,
        createAuthUpgradePublicId,
      );
    },

    async listPersonalAuthsByUserPublicId(userPublicId) {
      return listPersonalAuthsByUserPublicId(getDatabase(), userPublicId);
    },
  };
}

async function confirmRedeemCodeForUser(
  database: StudentAuthorizationRedeemRuntimeDatabase,
  input: ConfirmRedeemCodeForUserInput,
  createPersonalAuthPublicId: () => string,
  createAuthUpgradePublicId: () => string,
): Promise<ConfirmRedeemCodeForUserResult> {
  return database.transaction(async (transaction) => {
    const userId = await findActiveUserIdByPublicIdForUpdate(
      transaction,
      input.userPublicId,
    );

    if (userId === null) {
      return { status: "not_found" };
    }

    const redeemCodeRow = await findRedeemCodeByHashForUpdate(
      transaction,
      input.code,
    );

    if (redeemCodeRow === null) {
      return { status: "not_found" };
    }

    if (
      redeemCodeRow.status === "used" ||
      redeemCodeRow.used_by_user_id !== null ||
      redeemCodeRow.used_at !== null
    ) {
      if (
        redeemCodeRow.status === "used" &&
        redeemCodeRow.used_by_user_id === userId &&
        redeemCodeRow.used_at !== null
      ) {
        const recoveredPersonalAuth = await recoverCommittedRedeemCodeOutcome(
          transaction,
          userId,
          redeemCodeRow,
        );

        return recoveredPersonalAuth === null
          ? { status: "inconsistent" }
          : { status: "replayed", personalAuth: recoveredPersonalAuth };
      }

      return {
        status:
          redeemCodeRow.status === "used" &&
          redeemCodeRow.used_by_user_id !== null &&
          redeemCodeRow.used_at !== null
            ? "used"
            : "inconsistent",
      };
    }

    if (
      redeemCodeRow.status === "expired" ||
      (redeemCodeRow.redeem_deadline_at !== null &&
        redeemCodeRow.redeem_deadline_at < input.confirmedAt)
    ) {
      return { status: "expired" };
    }

    const previewFacts = await loadRedeemCodePreviewFacts(
      transaction,
      userId,
      redeemCodeRow,
      input.confirmedAt,
      true,
    );
    const preview = evaluateRedeemCodePreview({
      ...previewFacts,
      userPublicId: input.userPublicId,
      checkedAt: input.confirmedAt,
    });

    if (preview.status === "unavailable") {
      return { status: mapPreviewUnavailableReason(preview.reason) };
    }

    if (preview.data.previewVersion !== input.previewVersion) {
      return { status: "stale" };
    }

    if (redeemCodeRow.redeem_code_type === "edition_upgrade") {
      const targetPersonalAuth = previewFacts.activePersonalAuths.find(
        (personalAuth) =>
          personalAuth.public_id === input.targetPersonalAuthPublicId &&
          personalAuth.edition === "standard",
      );
      const isEligibleTarget = preview.data.upgradeTargets.some(
        (target) =>
          target.personalAuthPublicId === input.targetPersonalAuthPublicId,
      );

      if (targetPersonalAuth === undefined || !isEligibleTarget) {
        return { status: "invalid_target" };
      }

      const redeemedCode = await consumeUnusedRedeemCodeForUser(
        transaction,
        userId,
        redeemCodeRow.id,
        input.confirmedAt,
      );

      if (redeemedCode === null) {
        return { status: "used" };
      }

      const [row] = await transaction
        .insert(authUpgrade)
        .values({
          public_id: createAuthUpgradePublicId(),
          personal_auth_id: targetPersonalAuth.id,
          target_edition: "advanced",
          source_type: "redeem_code",
          redeem_code_id: redeemCodeRow.id,
          starts_at: input.confirmedAt,
          expires_at: targetPersonalAuth.expires_at,
          status: "active",
        })
        .returning({
          id: authUpgrade.id,
        });

      if (row === undefined) {
        throw new Error("Auth upgrade insert did not return a row.");
      }

      return {
        status: "redeemed",
        personalAuth: toPersonalAuthAccessRow(targetPersonalAuth),
      };
    }

    if (input.targetPersonalAuthPublicId !== null) {
      return { status: "invalid_target" };
    }

    const redeemedCode = await consumeUnusedRedeemCodeForUser(
      transaction,
      userId,
      redeemCodeRow.id,
      input.confirmedAt,
    );

    if (redeemedCode === null) {
      return { status: "used" };
    }

    const edition: AuthorizationEdition =
      redeemCodeRow.redeem_code_type === "personal_advanced_activation"
        ? "advanced"
        : "standard";

    const [row] = await transaction
      .insert(personalAuth)
      .values({
        public_id: createPersonalAuthPublicId(),
        user_id: userId,
        redeem_code_id: redeemCodeRow.id,
        edition,
        profession: redeemedCode.profession,
        level: redeemedCode.level,
        starts_at: input.confirmedAt,
        expires_at: addDays(input.confirmedAt, redeemCodeRow.duration_day),
        status: "active",
      })
      .returning({
        id: personalAuth.id,
        public_id: personalAuth.public_id,
        profession: personalAuth.profession,
        level: personalAuth.level,
        starts_at: personalAuth.starts_at,
        expires_at: personalAuth.expires_at,
        status: personalAuth.status,
      });

    if (row === undefined) {
      throw new Error("Personal auth insert did not return a row.");
    }

    return {
      status: "redeemed",
      personalAuth: {
        ...row,
        redeem_code_public_id: redeemedCode.public_id,
      },
    };
  });
}

async function consumeUnusedRedeemCodeForUser(
  database: StudentAuthorizationRedeemRuntimeDatabase,
  userId: number,
  redeemCodeId: number,
  redeemedAt: Date,
): Promise<{
  public_id: string;
  profession: RedeemCodeAuthorizationRow["profession"];
  level: number;
} | null> {
  const [redeemedCode] = await database
    .update(redeemCode)
    .set({
      status: "used",
      used_by_user_id: userId,
      used_at: redeemedAt,
      updated_at: redeemedAt,
    })
    .where(
      and(
        eq(redeemCode.id, redeemCodeId),
        eq(redeemCode.status, "unused"),
        isNull(redeemCode.used_by_user_id),
        isNull(redeemCode.used_at),
      ),
    )
    .returning({
      public_id: redeemCode.public_id,
      profession: redeemCode.profession,
      level: redeemCode.level,
    });

  if (redeemedCode === undefined) {
    return null;
  }

  return redeemedCode;
}

async function loadRedeemCodePreviewFacts(
  database: StudentAuthorizationRedeemRuntimeDatabase,
  userId: number,
  redeemCodeRow: RedeemCodeAuthorizationRow,
  checkedAt: Date,
  lockForUpdate: boolean,
): Promise<RedeemCodePreviewFacts> {
  if (redeemCodeRow.redeem_code_type !== "edition_upgrade") {
    return {
      redeemCode: redeemCodeRow,
      activePersonalAuths: [],
      activeUpgradedPersonalAuthPublicIds: [],
    };
  }

  const personalAuthQuery = database
    .select({
      id: personalAuth.id,
      public_id: personalAuth.public_id,
      redeem_code_public_id: redeemCode.public_id,
      edition: personalAuth.edition,
      profession: personalAuth.profession,
      level: personalAuth.level,
      starts_at: personalAuth.starts_at,
      expires_at: personalAuth.expires_at,
      status: personalAuth.status,
      updated_at: personalAuth.updated_at,
    })
    .from(personalAuth)
    .innerJoin(redeemCode, eq(redeemCode.id, personalAuth.redeem_code_id))
    .where(
      and(
        eq(personalAuth.user_id, userId),
        eq(personalAuth.profession, redeemCodeRow.profession),
        eq(personalAuth.level, redeemCodeRow.level),
        eq(personalAuth.status, "active"),
        lte(personalAuth.starts_at, checkedAt),
        gte(personalAuth.expires_at, checkedAt),
      ),
    )
    .orderBy(asc(personalAuth.public_id));
  const activePersonalAuths = lockForUpdate
    ? await personalAuthQuery.for("update")
    : await personalAuthQuery;
  const activeUpgradedPersonalAuthPublicIds =
    await listActiveUpgradedPersonalAuthPublicIds(
      database,
      activePersonalAuths,
      checkedAt,
      lockForUpdate,
    );

  return {
    redeemCode: redeemCodeRow,
    activePersonalAuths: activePersonalAuths satisfies PersonalAuthPreviewRow[],
    activeUpgradedPersonalAuthPublicIds,
  };
}

async function listActiveUpgradedPersonalAuthPublicIds(
  database: StudentAuthorizationRedeemRuntimeDatabase,
  activePersonalAuths: PersonalAuthPreviewRow[],
  checkedAt: Date,
  lockForUpdate: boolean,
): Promise<string[]> {
  if (activePersonalAuths.length === 0) {
    return [];
  }

  const upgradeQuery = database
    .select({
      personal_auth_id: authUpgrade.personal_auth_id,
    })
    .from(authUpgrade)
    .where(
      and(
        inArray(
          authUpgrade.personal_auth_id,
          activePersonalAuths.map((row) => row.id),
        ),
        eq(authUpgrade.target_edition, "advanced"),
        eq(authUpgrade.status, "active"),
        isNull(authUpgrade.revoked_at),
        lte(authUpgrade.starts_at, checkedAt),
        gte(authUpgrade.expires_at, checkedAt),
      ),
    );
  const upgradeRows = lockForUpdate
    ? await upgradeQuery.for("update")
    : await upgradeQuery;
  const upgradedIds = new Set(
    upgradeRows.flatMap((row) =>
      row.personal_auth_id === null ? [] : [row.personal_auth_id],
    ),
  );

  return activePersonalAuths
    .filter((row) => upgradedIds.has(row.id))
    .map((row) => row.public_id)
    .sort();
}

async function findRedeemCodeByHash(
  database: StudentAuthorizationRedeemRuntimeDatabase,
  code: string,
): Promise<RedeemCodeAuthorizationRow | null> {
  return executeRedeemCodeQuery(database, code, false);
}

async function findRedeemCodeByHashForUpdate(
  database: StudentAuthorizationRedeemRuntimeDatabase,
  code: string,
): Promise<RedeemCodeAuthorizationRow | null> {
  return executeRedeemCodeQuery(database, code, true);
}

async function executeRedeemCodeQuery(
  database: StudentAuthorizationRedeemRuntimeDatabase,
  code: string,
  lockForUpdate: boolean,
): Promise<RedeemCodeAuthorizationRow | null> {
  const query = database
    .select({
      id: redeemCode.id,
      public_id: redeemCode.public_id,
      profession: redeemCode.profession,
      level: redeemCode.level,
      redeem_code_type: redeemCode.redeem_code_type,
      duration_day: redeemCode.duration_day,
      redeem_deadline_at: redeemCode.redeem_deadline_at,
      status: redeemCode.status,
      used_by_user_id: redeemCode.used_by_user_id,
      used_at: redeemCode.used_at,
      updated_at: redeemCode.updated_at,
    })
    .from(redeemCode)
    .where(eq(redeemCode.code_hash, createRedeemCodeHash(code)))
    .limit(1);
  const rows = lockForUpdate ? await query.for("update") : await query;

  return rows[0] ?? null;
}

async function recoverCommittedRedeemCodeOutcome(
  database: StudentAuthorizationRedeemRuntimeDatabase,
  userId: number,
  redeemCodeRow: RedeemCodeAuthorizationRow,
): Promise<PersonalAuthAccessRow | null> {
  if (redeemCodeRow.redeem_code_type !== "edition_upgrade") {
    const [row] = await database
      .select({
        id: personalAuth.id,
        public_id: personalAuth.public_id,
        redeem_code_public_id: redeemCode.public_id,
        profession: personalAuth.profession,
        level: personalAuth.level,
        starts_at: personalAuth.starts_at,
        expires_at: personalAuth.expires_at,
        status: personalAuth.status,
      })
      .from(personalAuth)
      .innerJoin(redeemCode, eq(redeemCode.id, personalAuth.redeem_code_id))
      .where(
        and(
          eq(personalAuth.user_id, userId),
          eq(personalAuth.redeem_code_id, redeemCodeRow.id),
        ),
      )
      .limit(1);

    return row ?? null;
  }

  const [row] = await database
    .select({
      id: personalAuth.id,
      public_id: personalAuth.public_id,
      redeem_code_public_id: redeemCode.public_id,
      profession: personalAuth.profession,
      level: personalAuth.level,
      starts_at: personalAuth.starts_at,
      expires_at: personalAuth.expires_at,
      status: personalAuth.status,
    })
    .from(authUpgrade)
    .innerJoin(personalAuth, eq(personalAuth.id, authUpgrade.personal_auth_id))
    .innerJoin(redeemCode, eq(redeemCode.id, personalAuth.redeem_code_id))
    .where(
      and(
        eq(authUpgrade.redeem_code_id, redeemCodeRow.id),
        eq(authUpgrade.source_type, "redeem_code"),
        eq(authUpgrade.target_edition, "advanced"),
        eq(personalAuth.user_id, userId),
      ),
    )
    .limit(1);

  return row ?? null;
}

function mapPreviewUnavailableReason(
  reason:
    | "already_advanced"
    | "expired"
    | "inconsistent"
    | "no_target"
    | "used",
): Exclude<ConfirmRedeemCodeForUserResult["status"], "redeemed" | "replayed"> {
  return reason;
}

function toPersonalAuthAccessRow(
  personalAuthRow: PersonalAuthPreviewRow,
): PersonalAuthAccessRow {
  return {
    id: personalAuthRow.id,
    public_id: personalAuthRow.public_id,
    redeem_code_public_id: personalAuthRow.redeem_code_public_id,
    profession: personalAuthRow.profession,
    level: personalAuthRow.level,
    starts_at: personalAuthRow.starts_at,
    expires_at: personalAuthRow.expires_at,
    status: personalAuthRow.status,
  };
}

async function listPersonalAuthsByUserPublicId(
  database: StudentAuthorizationRedeemRuntimeDatabase,
  userPublicId: string,
): Promise<PersonalAuthAccessRow[]> {
  const rows = await database
    .select({
      id: personalAuth.id,
      public_id: personalAuth.public_id,
      redeem_code_public_id: redeemCode.public_id,
      profession: personalAuth.profession,
      level: personalAuth.level,
      starts_at: personalAuth.starts_at,
      expires_at: personalAuth.expires_at,
      status: personalAuth.status,
    })
    .from(personalAuth)
    .innerJoin(user, eq(user.id, personalAuth.user_id))
    .innerJoin(redeemCode, eq(redeemCode.id, personalAuth.redeem_code_id))
    .where(and(eq(user.public_id, userPublicId), eq(user.status, "active")))
    .orderBy(asc(personalAuth.expires_at));

  return rows;
}

async function findActiveUserIdByPublicId(
  database: StudentAuthorizationRedeemRuntimeDatabase,
  userPublicId: string,
): Promise<number | null> {
  const [row] = await database
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.public_id, userPublicId), eq(user.status, "active")))
    .limit(1);

  return row?.id ?? null;
}

async function findActiveUserIdByPublicIdForUpdate(
  database: StudentAuthorizationRedeemRuntimeDatabase,
  userPublicId: string,
): Promise<number | null> {
  const [row] = await database
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.public_id, userPublicId), eq(user.status, "active")))
    .for("update")
    .limit(1);

  return row?.id ?? null;
}

function addDays(value: Date, dayCount: number): Date {
  return new Date(value.getTime() + dayCount * 24 * 60 * 60 * 1000);
}

function createLocalRuntimeDatabase(): StudentAuthorizationRedeemRuntimeDatabase {
  return createRuntimeDatabaseForSchema(
    databaseSchema,
    "DATABASE_URL is required for student authorization redeem runtime.",
  );
}
