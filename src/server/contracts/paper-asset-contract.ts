import type { PaperAttachmentUsage } from "../models/paper";

export type PaperAssetDto = {
  publicId: string;
  paperPublicId: string;
  paperAttachmentUsage: PaperAttachmentUsage;
  fileName: string;
  contentType: string;
  fileSizeByte: number;
  fileHash: string;
  createdAt: string;
};

export type PaperAssetResultDto = {
  paperAsset: PaperAssetDto;
};

export type PaperAssetDeleteResultDto = {
  deletedPaperAssetPublicId: string;
};
