import fs from "fs/promises";
import path from "path";

export async function resolveDocsDir(workspacePath: string): Promise<string> {
  const docsDir = path.join(workspacePath, ".docs", "features");
  await fs.mkdir(docsDir, { recursive: true });
  return docsDir;
}
