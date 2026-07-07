export function escapeODataString(value: string) {
  return value.replace(/'/g, "''");
}
