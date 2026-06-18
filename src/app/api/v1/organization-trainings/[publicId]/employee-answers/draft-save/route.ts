import { createOrganizationTrainingRuntimeRouteHandlers } from "@/server/services/organization-training-route";

const organizationTrainingRouteHandlers =
  createOrganizationTrainingRuntimeRouteHandlers();

export const POST =
  organizationTrainingRouteHandlers.employeeAnswerDraftSave.POST;
