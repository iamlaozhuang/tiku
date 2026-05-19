import type { MaterialStatus, Profession, Subject } from "../models/paper";

export type MaterialDto = {
  publicId: string;
  title: string;
  contentRichText: string;
  profession: Profession;
  level: number;
  subject: Subject;
  status: MaterialStatus;
  isLocked: boolean;
  lockedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MaterialResultDto = {
  material: MaterialDto;
};
