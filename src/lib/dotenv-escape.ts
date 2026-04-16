/** Escape a value for a single-line KEY=value in a .env file. */
export function escapeDotenvValue(v: string): string {
  if (/[\r\n#"']/.test(v) || /^\s/.test(v) || /\s$/.test(v)) {
    return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return v;
}
