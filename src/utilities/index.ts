export function isPhoneNumber(username: string): boolean {
  const regex = /^0\d{9}/;
  return regex.test(username?.trim());
}

export function convertPhoneNumberFormat(phoneNumber: string) {
  if (!isPhoneNumber(phoneNumber)) return '';
  return phoneNumber?.trim().replace(/^0/, '+84');
}
