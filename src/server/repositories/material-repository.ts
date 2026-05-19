import type { MaterialStatus, Profession, Subject } from "../models/paper";
import type {
  NormalizedCreateMaterialInput,
  NormalizedMaterialListInput,
  NormalizedUpdateMaterialInput,
} from "../validators/material";

export type MaterialAccessRow = {
  id: number;
  public_id: string;
  title: string;
  content_rich_text: string;
  profession: Profession;
  level: number;
  subject: Subject;
  status: MaterialStatus;
  is_locked: boolean;
  locked_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type MaterialListResult = {
  rows: MaterialAccessRow[];
  total: number;
};

export type UpdateMaterialInput = NormalizedUpdateMaterialInput & {
  publicId: string;
};

export type MaterialRepository = {
  listMaterials(
    query: NormalizedMaterialListInput,
  ): Promise<MaterialListResult>;
  createMaterial(
    input: NormalizedCreateMaterialInput,
  ): Promise<MaterialAccessRow>;
  findMaterialByPublicId(publicId: string): Promise<MaterialAccessRow | null>;
  updateMaterial(input: UpdateMaterialInput): Promise<MaterialAccessRow>;
  disableMaterial(publicId: string): Promise<MaterialAccessRow | null>;
  copyMaterial(publicId: string): Promise<MaterialAccessRow | null>;
};
