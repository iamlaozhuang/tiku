import { createContentQuestionMaterialRuntimeRouteHandlers } from "@/server/services/content-question-material-runtime";

const contentQuestionMaterialRuntimeRouteHandlers =
  createContentQuestionMaterialRuntimeRouteHandlers();

export const GET =
  contentQuestionMaterialRuntimeRouteHandlers.materials.collection.GET;
export const POST =
  contentQuestionMaterialRuntimeRouteHandlers.materials.collection.POST;
