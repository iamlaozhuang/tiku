import type {
  PaperAssetDto,
  PaperAssetResultDto,
} from "../contracts/paper-asset-contract";
import type { PaperAssetAccessRow } from "../repositories/paper-asset-repository";

export function mapPaperAssetToApi(
  paperAsset: PaperAssetAccessRow,
): PaperAssetDto {
  return {
    publicId: paperAsset.public_id,
    paperPublicId: paperAsset.paper_public_id,
    paperAttachmentUsage: paperAsset.paper_attachment_usage,
    fileName: paperAsset.file_name,
    contentType: paperAsset.content_type,
    fileSizeByte: paperAsset.file_size_byte,
    fileHash: paperAsset.file_hash,
    createdAt: paperAsset.created_at.toISOString(),
  };
}

export function mapPaperAssetResultToApi(
  paperAsset: PaperAssetAccessRow,
): PaperAssetResultDto {
  return {
    paperAsset: mapPaperAssetToApi(paperAsset),
  };
}
