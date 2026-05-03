export function escapeLike(str: string): string {
  return str.replace(/[\\%_]/g, "\\$&");
}
