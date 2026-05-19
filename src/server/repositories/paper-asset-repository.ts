import type { PaperAttachmentUsage } from "../models/paper";
import type {
  NormalizedCreatePaperAssetInput,
  NormalizedPaperAssetListInput,
} from "../validators/paper-asset";

export type PaperAssetAccessRow = {
  id: number;
  public_id: string;
  paper_public_id: string;
  paper_attachment_usage: PaperAttachmentUsage;
  file_name: string;
  object_key: string;
  content_type: string;
  file_size_byte: number;
  file_hash: string;
  created_at: Date;
};

export type PaperAssetListResult = {
  rows: PaperAssetAccessRow[];
  total: number;
};

export type PaperAssetRepository = {
  listPaperAssets(
    query: NormalizedPaperAssetListInput,
  ): Promise<PaperAssetListResult>;
  createPaperAsset(
    input: NormalizedCreatePaperAssetInput,
  ): Promise<PaperAssetAccessRow>;
  findPaperAssetByPublicId(
    publicId: string,
  ): Promise<PaperAssetAccessRow | null>;
  deletePaperAsset(publicId: string): Promise<boolean>;
};
