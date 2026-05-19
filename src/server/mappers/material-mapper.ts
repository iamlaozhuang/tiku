import type {
  MaterialDto,
  MaterialResultDto,
} from "../contracts/material-contract";
import type { MaterialAccessRow } from "../repositories/material-repository";

function formatNullableTimestamp(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
}

export function mapMaterialToApi(material: MaterialAccessRow): MaterialDto {
  return {
    publicId: material.public_id,
    title: material.title,
    contentRichText: material.content_rich_text,
    profession: material.profession,
    level: material.level,
    subject: material.subject,
    status: material.status,
    isLocked: material.is_locked,
    lockedAt: formatNullableTimestamp(material.locked_at),
    createdAt: material.created_at.toISOString(),
    updatedAt: material.updated_at.toISOString(),
  };
}

export function mapMaterialResultToApi(
  material: MaterialAccessRow,
): MaterialResultDto {
  return {
    material: mapMaterialToApi(material),
  };
}
