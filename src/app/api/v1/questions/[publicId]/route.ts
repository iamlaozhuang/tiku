import { createContentQuestionMaterialRuntimeRouteHandlers } from "@/server/services/content-question-material-runtime";

const contentQuestionMaterialRuntimeRouteHandlers =
  createContentQuestionMaterialRuntimeRouteHandlers();

export const GET =
  contentQuestionMaterialRuntimeRouteHandlers.questions.detail.GET;
export const PATCH =
  contentQuestionMaterialRuntimeRouteHandlers.questions.detail.PATCH;
