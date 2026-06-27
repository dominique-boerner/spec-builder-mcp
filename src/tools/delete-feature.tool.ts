import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { resolveDocsDir } from "../helpers/directory.helper.js";

export function registerDeleteFeatureTool(server: McpServer) {
  server.registerTool(
    "spec_delete",
    {
      description: "Permanently deletes a feature folder and all its documents.",
      inputSchema: {
        workspace_path: z
          .string()
          .describe(
            "The absolute path to the user's current project workspace.",
          ),
        feature_name: z
          .string()
          .describe(
            "The name of the feature without prefix (e.g., 'user-login'). The folder 'FEAT-user-login' will be deleted.",
          ),
      },
    },
    async ({ workspace_path, feature_name }) => {
      const docsDir = await resolveDocsDir(workspace_path);
      const featureDir = path.join(docsDir, `FEAT-${feature_name}`);

      try {
        await fs.access(featureDir);
      } catch {
        return {
          content: [
            {
              type: "text",
              text: `Feature 'FEAT-${feature_name}' not found.`,
            },
          ],
          isError: true,
        };
      }

      await fs.rm(featureDir, { recursive: true, force: true });
      return {
        content: [
          {
            type: "text",
            text: `Successfully deleted 'FEAT-${feature_name}'.`,
          },
        ],
      };
    },
  );
}
