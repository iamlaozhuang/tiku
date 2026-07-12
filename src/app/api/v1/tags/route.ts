import { createContentQuestionMaterialRuntimeRouteHandlers } from "@/server/services/content-question-material-runtime";

const contentQuestionMaterialRuntimeRouteHandlers =
  createContentQuestionMaterialRuntimeRouteHandlers();

export const GET =
  contentQuestionMaterialRuntimeRouteHandlers.tags.collection.GET;
