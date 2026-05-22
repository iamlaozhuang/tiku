import { createContentQuestionMaterialRuntimeRouteHandlers } from "@/server/services/content-question-material-runtime";

const contentQuestionMaterialRuntimeRouteHandlers =
  createContentQuestionMaterialRuntimeRouteHandlers();

export const GET =
  contentQuestionMaterialRuntimeRouteHandlers.materials.detail.GET;
export const PATCH =
  contentQuestionMaterialRuntimeRouteHandlers.materials.detail.PATCH;
