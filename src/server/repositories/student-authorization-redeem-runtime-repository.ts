import { createHash, randomUUID } from "node:crypto";

import { and, asc, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as databaseSchema from "@/db/schema";
import type { AuthorizationEdition } from "../models/auth";
import type {
  EffectiveAuthUpgradeRow,
  EffectiveAuthorizationRepository,
  EffectiveOrgAuthRow,
  EffectivePersonalAuthRow,
} from "./effective-authorization-repository";
import type {
  PersonalAuthAccessRow,
  RedeemCodeAuthorizationRepository,
  RedeemCodeForUserInput,
} from "./redeem-code-authorization-repository";
import { createRuntimeDatabaseForSchema } from "./runtime-database";

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
  authUpgrade,
  organization,
  orgAuth,
  orgAuthOrganization,
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
        .from(orgAuth)
        .innerJoin(
          orgAuthOrganization,
          eq(orgAuthOrganization.org_auth_id, orgAuth.id),
        )
        .innerJoin(
          organization,
          eq(organization.id, orgAuthOrganization.organization_id),
        )
        .innerJoin(employee, eq(employee.organization_id, organization.id))
        .innerJoin(user, eq(user.id, employee.user_id))
        .where(
          and(
            eq(user.public_id, userPublicId),
            eq(user.user_type, "employee"),
            eq(user.status, "active"),
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
    async findRedeemCodeByCode(code) {
      const [row] = await getDatabase()
        .select({
          id: redeemCode.id,
          public_id: redeemCode.public_id,
          code_display: redeemCode.code_display,
          profession: redeemCode.profession,
          level: redeemCode.level,
          redeem_code_type: redeemCode.redeem_code_type,
          duration_day: redeemCode.duration_day,
          redeem_deadline_at: redeemCode.redeem_deadline_at,
          status: redeemCode.status,
          used_by_user_id: redeemCode.used_by_user_id,
          used_at: redeemCode.used_at,
        })
        .from(redeemCode)
        .where(eq(redeemCode.code_hash, createRedeemCodeHash(code)))
        .limit(1);

      return row ?? null;
    },

    async redeemCodeForUser(input) {
      return redeemCodeForUser(
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

async function redeemCodeForUser(
  database: StudentAuthorizationRedeemRuntimeDatabase,
  input: RedeemCodeForUserInput,
  createPersonalAuthPublicId: () => string,
  createAuthUpgradePublicId: () => string,
): Promise<PersonalAuthAccessRow | null> {
  return database.transaction(async (transaction) => {
    const userId = await findActiveUserIdByPublicId(
      transaction,
      input.userPublicId,
    );

    if (userId === null) {
      return null;
    }

    if (input.redeemCodeType === "edition_upgrade") {
      const targetPersonalAuth = await findEditionUpgradeTargetPersonalAuth(
        transaction,
        userId,
        input,
      );

      if (targetPersonalAuth === null) {
        return null;
      }

      const redeemedCode = await consumeUnusedRedeemCodeForUser(
        transaction,
        userId,
        input,
      );

      if (redeemedCode === null) {
        return null;
      }

      const [row] = await transaction
        .insert(authUpgrade)
        .values({
          public_id: createAuthUpgradePublicId(),
          personal_auth_id: targetPersonalAuth.id,
          target_edition: "advanced",
          source_type: "redeem_code",
          redeem_code_id: input.redeemCodeId,
          starts_at: input.redeemedAt,
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
        id: targetPersonalAuth.id,
        public_id: targetPersonalAuth.public_id,
        redeem_code_public_id: targetPersonalAuth.redeem_code_public_id,
        profession: targetPersonalAuth.profession,
        level: targetPersonalAuth.level,
        starts_at: targetPersonalAuth.starts_at,
        expires_at: targetPersonalAuth.expires_at,
        status: targetPersonalAuth.status,
      };
    }

    const redeemedCode = await consumeUnusedRedeemCodeForUser(
      transaction,
      userId,
      input,
    );

    if (redeemedCode === null) {
      return null;
    }

    const edition: AuthorizationEdition =
      input.redeemCodeType === "personal_advanced_activation"
        ? "advanced"
        : "standard";

    const [row] = await transaction
      .insert(personalAuth)
      .values({
        public_id: createPersonalAuthPublicId(),
        user_id: userId,
        redeem_code_id: input.redeemCodeId,
        edition,
        profession: redeemedCode.profession,
        level: redeemedCode.level,
        starts_at: input.redeemedAt,
        expires_at: addDays(input.redeemedAt, input.durationDay),
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
      ...row,
      redeem_code_public_id: redeemedCode.public_id,
    };
  });
}

async function consumeUnusedRedeemCodeForUser(
  database: StudentAuthorizationRedeemRuntimeDatabase,
  userId: number,
  input: RedeemCodeForUserInput,
): Promise<{
  public_id: string;
  profession: RedeemCodeForUserInput["profession"];
  level: number;
} | null> {
  const [redeemedCode] = await database
    .update(redeemCode)
    .set({
      status: "used",
      used_by_user_id: userId,
      used_at: input.redeemedAt,
      updated_at: input.redeemedAt,
    })
    .where(
      and(
        eq(redeemCode.id, input.redeemCodeId),
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

type PersonalAuthUpgradeTargetRow = PersonalAuthAccessRow & {
  edition: AuthorizationEdition;
};

async function findEditionUpgradeTargetPersonalAuth(
  database: StudentAuthorizationRedeemRuntimeDatabase,
  userId: number,
  input: RedeemCodeForUserInput,
): Promise<PersonalAuthUpgradeTargetRow | null> {
  const activePersonalAuths = await database
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
    })
    .from(personalAuth)
    .innerJoin(redeemCode, eq(redeemCode.id, personalAuth.redeem_code_id))
    .where(
      and(
        eq(personalAuth.user_id, userId),
        eq(personalAuth.profession, input.profession),
        eq(personalAuth.level, input.level),
        eq(personalAuth.status, "active"),
        lte(personalAuth.starts_at, input.redeemedAt),
        gte(personalAuth.expires_at, input.redeemedAt),
      ),
    );

  if (activePersonalAuths.some((row) => row.edition === "advanced")) {
    return null;
  }

  const standardPersonalAuths = activePersonalAuths.filter(
    (row) => row.edition === "standard",
  );

  if (standardPersonalAuths.length !== 1) {
    return null;
  }

  const hasActiveUpgrade = await hasActiveAdvancedUpgradeForPersonalAuths(
    database,
    standardPersonalAuths.map((row) => row.id),
    input.redeemedAt,
  );

  if (hasActiveUpgrade) {
    return null;
  }

  return standardPersonalAuths[0];
}

async function hasActiveAdvancedUpgradeForPersonalAuths(
  database: StudentAuthorizationRedeemRuntimeDatabase,
  personalAuthIds: number[],
  checkedAt: Date,
): Promise<boolean> {
  if (personalAuthIds.length === 0) {
    return false;
  }

  const rows = await database
    .select({
      id: authUpgrade.id,
    })
    .from(authUpgrade)
    .where(
      and(
        inArray(authUpgrade.personal_auth_id, personalAuthIds),
        eq(authUpgrade.target_edition, "advanced"),
        eq(authUpgrade.status, "active"),
        isNull(authUpgrade.revoked_at),
        lte(authUpgrade.starts_at, checkedAt),
        gte(authUpgrade.expires_at, checkedAt),
      ),
    )
    .limit(1);

  return rows.length > 0;
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

function addDays(value: Date, dayCount: number): Date {
  return new Date(value.getTime() + dayCount * 24 * 60 * 60 * 1000);
}

function createLocalRuntimeDatabase(): StudentAuthorizationRedeemRuntimeDatabase {
  return createRuntimeDatabaseForSchema(
    databaseSchema,
    "DATABASE_URL is required for student authorization redeem runtime.",
  );
}
