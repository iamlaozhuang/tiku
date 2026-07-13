const CHINA_PHONE_PATTERN = /^1\d{10}$/u;
const MASKED_CHINA_PHONE_PATTERN = /^1\d{2}\*{4}\d{4}$/u;

export function maskPhoneForDisplay(phone: string): string {
  const normalizedPhone = phone.trim();

  if (MASKED_CHINA_PHONE_PATTERN.test(normalizedPhone)) {
    return normalizedPhone;
  }

  if (!CHINA_PHONE_PATTERN.test(normalizedPhone)) {
    return "已绑定手机号";
  }

  return `${normalizedPhone.slice(0, 3)}****${normalizedPhone.slice(-4)}`;
}
