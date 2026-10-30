export const ORDER_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const ORDER_CODE_LENGTH = 6;
export const ORDER_CODE_PATTERN = /^FD-[A-HJ-NP-Z2-9]{6}$/;

/**
 * Generates an Order Code (`FD-` + 6 characters from a 32-character unambiguous alphabet).
 */
export function generateOrderCode(): string {
  const bytes = new Uint8Array(ORDER_CODE_LENGTH);
  crypto.getRandomValues(bytes);

  let suffix = "";
  for (const byte of bytes) {
    suffix += ORDER_CODE_ALPHABET[byte % ORDER_CODE_ALPHABET.length];
  }

  return `FD-${suffix}`;
}
