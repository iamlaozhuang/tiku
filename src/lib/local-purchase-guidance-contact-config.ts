import type { PurchaseGuidanceContactConfigDto } from "@/server/contracts/contact-config-contract";

export const LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG: PurchaseGuidanceContactConfigDto =
  {
    publicId: "contact-config-local-purchase-guidance",
    title: "购买支持",
    summary:
      "没有可用授权或卡密时，请联系 Tiku 运营支持获取购买方式与开通流程。",
    channels: [
      {
        channelType: "phone",
        isEnabled: true,
        label: "Tiku 运营支持",
        qrImageUrl: null,
        value: "400-000-2026",
        serviceHours: "工作日 09:00-18:00",
        usage: "购买咨询、卡密开通、授权范围确认",
        href: "tel:4000002026",
      },
    ],
    safetyNotice: "请勿在沟通中提供密码、验证码、卡密明文或个人隐私数据。",
    updatedAt: "2026-05-24T00:00:00.000Z",
  };
