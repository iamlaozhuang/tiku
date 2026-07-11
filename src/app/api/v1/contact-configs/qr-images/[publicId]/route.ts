import { createContactConfigRuntimeRouteHandlers } from "@/server/services/contact-config-service";

const contactConfigRouteHandlers = createContactConfigRuntimeRouteHandlers();

export const GET = contactConfigRouteHandlers.contactConfigQrImages.GET;
