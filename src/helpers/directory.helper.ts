import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

export async function resolveDocsDir(workspacePath: string): Promise<string> {
  const docsDir = path.join(workspacePath, ".docs", "features");
  await fs.mkdir(docsDir, { recursive: true });
  return docsDir;
}

export function resolveTemplatesDir(): string {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "../templates");
}
