import { createOrganizationTrainingRuntimeRouteHandlers } from "@/server/services/organization-training-route";

const organizationTrainingRouteHandlers =
  createOrganizationTrainingRuntimeRouteHandlers();

export const GET = organizationTrainingRouteHandlers.manualDraft.GET;
export const POST = organizationTrainingRouteHandlers.manualDraft.POST;
