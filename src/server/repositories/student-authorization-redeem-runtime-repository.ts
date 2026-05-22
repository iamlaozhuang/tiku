import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { and, asc, eq, isNull } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as databaseSchema from "@/db/schema";
import type {
  EffectiveAuthorizationRepository,
  EffectiveOrgAuthRow,
  EffectivePersonalAuthRow,
} from "./effective-authorization-repository";
import type {
  PersonalAuthAccessRow,
  RedeemCodeAuthorizationRepository,
  RedeemCodeForUserInput,
} from "./redeem-code-authorization-repository";

type StudentAuthorizationRedeemRuntimeDatabase = PostgresJsDatabase<
  typeof databaseSchema
>;

export type StudentAuthorizationRedeemRuntimeRepositoryOptions = {
  createDatabase?: () => StudentAuthorizationRedeemRuntimeDatabase;
  createPersonalAuthPublicId?: () => string;
};

export type StudentAuthorizationRedeemRuntimeRepositories = {
  effectiveAuthorizationRepository: EffectiveAuthorizationRepository;
  redeemCodeAuthorizationRepository: RedeemCodeAuthorizationRepository;
};

const {
  employee,
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

  return {
    effectiveAuthorizationRepository:
      createPostgresEffectiveAuthorizationRepository(getDatabase),
    redeemCodeAuthorizationRepository:
      createPostgresRedeemCodeAuthorizationRepository(
        getDatabase,
        createPersonalAuthPublicId,
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
        .where(and(eq(user.public_id, userPublicId), eq(user.status, "active")))
        .orderBy(asc(orgAuth.expires_at));

      return rows satisfies EffectiveOrgAuthRow[];
    },
  };
}

function createPostgresRedeemCodeAuthorizationRepository(
  getDatabase: () => StudentAuthorizationRedeemRuntimeDatabase,
  createPersonalAuthPublicId: () => string,
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
): Promise<PersonalAuthAccessRow | null> {
  return database.transaction(async (transaction) => {
    const userId = await findActiveUserIdByPublicId(
      transaction,
      input.userPublicId,
    );

    if (userId === null) {
      return null;
    }

    const [redeemedCode] = await transaction
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

    const [row] = await transaction
      .insert(personalAuth)
      .values({
        public_id: createPersonalAuthPublicId(),
        user_id: userId,
        redeem_code_id: input.redeemCodeId,
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
  loadLocalEnv();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required for student authorization redeem runtime.",
    );
  }

  return drizzle(postgres(databaseUrl, { max: 5 }), {
    schema: databaseSchema,
  });
}

function loadLocalEnv(): void {
  const localEnvPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(localEnvPath)) {
    return;
  }

  const localEnvContent = readFileSync(localEnvPath, "utf8");

  for (const line of localEnvContent.split(/\r?\n/u)) {
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0 || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/gu, "");

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
