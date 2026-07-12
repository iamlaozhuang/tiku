import { asc } from "drizzle-orm";

import { tag } from "@/db/schema";
import type { TagOptionListDto } from "../contracts/tag-contract";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabaseOptions,
} from "./runtime-database";

export type TagRepository = {
  listTags(): Promise<TagOptionListDto>;
};

export function createPostgresTagRepository(
  options: RuntimeDatabaseOptions = {},
): TagRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for tag runtime.",
  );

  return {
    async listTags() {
      const rows = await getDatabase()
        .select({
          publicId: tag.public_id,
          name: tag.name,
        })
        .from(tag)
        .orderBy(asc(tag.name));

      return { tags: rows };
    },
  };
}
