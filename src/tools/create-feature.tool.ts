import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { resolveDocsDir } from "../helpers/directory.helper.js";

const DOC_TITLES: Record<"requirements" | "technical_design", string> = {
  requirements: "Anforderungen",
  technical_design: "Technisches Design",
};

export function registerCreateFeatureTool(server: McpServer) {
  server.registerTool(
    "create_feature",
    {
      description:
        "Creates a new feature folder and initializes the specified document (requirements or technical_design).",
      inputSchema: {
        workspace_path: z
          .string()
          .describe(
            "The absolute path to the user's current project workspace.",
          ),
        feature_name: z
          .string()
          .describe(
            "The name of the feature (used as the folder name, e.g., 'user-login').",
          ),
        type: z
          .enum(["requirements", "technical_design"])
          .describe("The type of document to create."),
      },
    },
    async ({ workspace_path, feature_name, type }) => {
      const docsDir = await resolveDocsDir(workspace_path);
      const featureDir = path.join(docsDir, feature_name);
      await fs.mkdir(featureDir, { recursive: true });

      const filePath = path.join(featureDir, `${type}.md`);
      try {
        await fs.access(filePath);
        return {
          content: [
            {
              type: "text",
              text: `Document ${type}.md already exists for feature '${feature_name}'.`,
            },
          ],
          isError: true,
        };
      } catch {
        const title = DOC_TITLES[type];
        await fs.writeFile(
          filePath,
          `# ${title}: ${feature_name}\n\n`,
          "utf8",
        );
        return {
          content: [
            {
              type: "text",
              text: `Successfully created ${type}.md for feature '${feature_name}'.`,
            },
          ],
        };
      }
    },
  );
}
