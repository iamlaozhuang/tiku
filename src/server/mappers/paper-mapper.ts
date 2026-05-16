import type { PaperDto, PaperRow } from "../models/paper";

function formatNullableTimestamp(value: Date | null): string | null {
  return value === null ? null : value.toISOString();
}

export function mapPaperRowToApi(paperRow: PaperRow): PaperDto {
  return {
    publicId: paperRow.public_id,
    title: paperRow.title,
    profession: paperRow.profession,
    level: paperRow.level,
    subject: paperRow.subject,
    paperType: paperRow.paper_type,
    paperStatus: paperRow.paper_status,
    description: paperRow.description,
    createdAt: paperRow.created_at.toISOString(),
    updatedAt: paperRow.updated_at.toISOString(),
    publishedAt: formatNullableTimestamp(paperRow.published_at),
  };
}
