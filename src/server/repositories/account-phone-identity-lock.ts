import { eq, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as authSchema from "@/db/schema/auth";

const { admin, user } = authSchema;

const ACCOUNT_PHONE_IDENTITY_LOCK_NAMESPACE = 200113;

type AuthRuntimeDatabase = PostgresJsDatabase<typeof authSchema>;
type AuthRuntimeTransaction = Parameters<
  Parameters<AuthRuntimeDatabase["transaction"]>[0]
>[0];

type AccountPhoneIdentityReader = Pick<AuthRuntimeTransaction, "select">;
type AccountPhoneIdentityLockTransaction = Pick<
  AuthRuntimeTransaction,
  "execute" | "select"
>;

export type AccountPhoneIdentityConflict = "admin" | "user";

export async function findAccountPhoneIdentityConflict(
  database: AccountPhoneIdentityReader,
  phone: string,
): Promise<AccountPhoneIdentityConflict | null> {
  const [existingAdmin] = await database
    .select({ id: admin.id })
    .from(admin)
    .where(eq(admin.phone, phone))
    .limit(1);

  if (existingAdmin !== undefined) {
    return "admin";
  }

  const [existingUser] = await database
    .select({ id: user.id })
    .from(user)
    .where(eq(user.phone, phone))
    .limit(1);

  return existingUser === undefined ? null : "user";
}

export async function findAccountPhoneIdentityConflictUnderLock(
  transaction: AccountPhoneIdentityLockTransaction,
  phone: string,
): Promise<AccountPhoneIdentityConflict | null> {
  await transaction.execute(
    sql`select pg_advisory_xact_lock(${ACCOUNT_PHONE_IDENTITY_LOCK_NAMESPACE}, hashtext(${phone})) as account_phone_identity_lock`,
  );

  return findAccountPhoneIdentityConflict(transaction, phone);
}
