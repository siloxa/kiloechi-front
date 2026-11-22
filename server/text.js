/** Convert Persian (۰-۹) and Arabic (٠-٩) digits to ASCII, so phone numbers typed on a Persian keyboard are stored consistently. */
export function latinDigits(s) {
  return String(s ?? '')
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}
