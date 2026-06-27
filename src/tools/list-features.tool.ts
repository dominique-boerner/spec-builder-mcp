import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs/promises";
import { resolveDocsDir } from "../helpers/directory.helper.js";

export function registerListFeaturesTool(server: McpServer) {
  server.registerTool(
    "list_features",
    {
      description:
        "Lists all documented features in the .docs/features directory of the workspace.",
      inputSchema: {
        workspace_path: z
          .string()
          .describe(
            "The absolute path to the user's current project workspace.",
          ),
      },
    },
    async ({ workspace_path }) => {
      const docsDir = await resolveDocsDir(workspace_path);
      let features: string[] = [];
      try {
        const entries = await fs.readdir(docsDir, { withFileTypes: true });
        features = entries.filter((e) => e.isDirectory()).map((e) => e.name);
      } catch {
        // Directory might not exist yet
      }
      return {
        content: [{ type: "text", text: JSON.stringify(features, null, 2) }],
      };
    },
  );
}
