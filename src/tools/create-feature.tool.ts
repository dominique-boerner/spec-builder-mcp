import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { resolveDocsDir } from "../helpers/directory.helper.js";

export function registerCreateFeatureTool(server: McpServer) {
  server.registerTool(
    "spec_create",
    {
      description:
        "Creates a new feature folder (prefixed with FEAT-) and initializes both requirements.md and technical_design.md.",
      inputSchema: {
        workspace_path: z
          .string()
          .describe(
            "The absolute path to the user's current project workspace.",
          ),
        feature_name: z
          .string()
          .describe(
            "The name of the feature without prefix (e.g., 'user-login'). The folder will be created as 'FEAT-user-login'.",
          ),
      },
    },
    async ({ workspace_path, feature_name }) => {
      const docsDir = await resolveDocsDir(workspace_path);
      const folderName = `FEAT-${feature_name}`;
      const featureDir = path.join(docsDir, folderName);

      try {
        await fs.access(featureDir);
        return {
          content: [
            {
              type: "text",
              text: `Feature '${folderName}' already exists.`,
            },
          ],
          isError: true,
        };
      } catch {
        await fs.mkdir(featureDir, { recursive: true });
        await fs.writeFile(
          path.join(featureDir, "requirements.md"),
          `# Anforderungen: ${feature_name}\n\n`,
          "utf8",
        );
        await fs.writeFile(
          path.join(featureDir, "technical_design.md"),
          `# Technisches Design: ${feature_name}\n\n`,
          "utf8",
        );
        return {
          content: [
            {
              type: "text",
              text: `Successfully created '${folderName}' with requirements.md and technical_design.md.`,
            },
          ],
        };
      }
    },
  );
}
