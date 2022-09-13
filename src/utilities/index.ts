export function isPhoneNumber(username: string): boolean {
  const regex = /^0\d{9}/;
  return regex.test(username?.trim());
}

function isPhoneNumberFormat(phoneNumber: string): boolean {
  return /^\+84\d{9}/.test(phoneNumber?.trim());
}

export function convertPhoneNumberFormat(phoneNumber: string) {
  if (isPhoneNumberFormat(phoneNumber)) return phoneNumber;
  if (!isPhoneNumber(phoneNumber)) return '';
  return phoneNumber?.trim().replace(/^0/, '+84');
}
