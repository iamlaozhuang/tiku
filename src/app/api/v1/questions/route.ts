import { createContentQuestionMaterialRuntimeRouteHandlers } from "@/server/services/content-question-material-runtime";

const contentQuestionMaterialRuntimeRouteHandlers =
  createContentQuestionMaterialRuntimeRouteHandlers();

export const GET =
  contentQuestionMaterialRuntimeRouteHandlers.questions.collection.GET;
export const POST =
  contentQuestionMaterialRuntimeRouteHandlers.questions.collection.POST;
