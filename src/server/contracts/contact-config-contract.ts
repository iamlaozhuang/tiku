export type ContactConfigChannelType = "phone" | "wechat_work";

export type ContactConfigChannelDto = {
  channelType: ContactConfigChannelType;
  isEnabled: boolean;
  label: string;
  qrImageUrl: string | null;
  value: string;
  serviceHours: string;
  usage: string;
  href: string | null;
};

export type PurchaseGuidanceContactConfigDto = {
  publicId: string;
  revision: number;
  title: string;
  summary: string;
  channels: ContactConfigChannelDto[];
  safetyNotice: string;
  updatedAt: string;
};

export type PurchaseGuidanceContactConfigResultDto = {
  contactConfig: PurchaseGuidanceContactConfigDto;
};

export type UpdateContactConfigInputDto = {
  expectedRevision: number;
  title: string;
  summary: string;
  channels: ContactConfigChannelDto[];
  safetyNotice: string;
};

export type ContactConfigQrImageUploadResultDto = {
  qrImage: {
    publicId: string;
    qrImageUrl: string;
    contentType: "image/jpeg" | "image/png" | "image/webp";
    byteSize: number;
  };
};
