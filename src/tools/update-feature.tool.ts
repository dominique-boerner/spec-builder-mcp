import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { resolveDocsDir, resolveTemplatesDir } from "../helpers/directory.helper.js";

const templatesDir = resolveTemplatesDir();

export function registerUpdateFeatureTool(server: McpServer) {
  server.registerTool(
    "spec_update",
    {
      description:
        "Writes content to a document (requirements or technical_design) of an existing feature.",
      inputSchema: {
        workspace_path: z
          .string()
          .describe(
            "The absolute path to the user's current project workspace.",
          ),
        feature_name: z
          .string()
          .describe(
            "The name of the feature without prefix (e.g., 'user-login'). The folder 'FEAT-user-login' will be used.",
          ),
        type: z
          .enum(["requirements", "technical_design"])
          .describe("The document to update."),
        content: z
          .string()
          .describe("The full markdown content to write into the document."),
      },
    },
    async ({ workspace_path, feature_name, type, content }) => {
      const docsDir = await resolveDocsDir(workspace_path);
      const filePath = path.join(docsDir, `FEAT-${feature_name}`, `${type}.md`);

      try {
        await fs.access(filePath);
      } catch {
        return {
          content: [
            {
              type: "text",
              text: `Document ${type}.md not found for feature 'FEAT-${feature_name}'. Create it first with spec_create.`,
            },
          ],
          isError: true,
        };
      }

      const templateFile = type === "requirements" ? "requirements.md" : "technical_design.md";
      const template = await fs.readFile(path.join(templatesDir, templateFile), "utf8");

      const requiredSections = template
        .split("\n")
        .filter((line) => line.startsWith("## "))
        .map((line) => line.trim());

      const missingSections = requiredSections.filter(
        (section) => !content.includes(section),
      );

      if (missingSections.length > 0) {
        return {
          content: [
            {
              type: "text",
              text: `Content is missing required sections: ${missingSections.join(", ")}.\n\nRequired template structure:\n\n${template}`,
            },
          ],
          isError: true,
        };
      }

      await fs.writeFile(filePath, content, "utf8");
      return {
        content: [
          {
            type: "text",
            text: `Successfully updated ${type}.md for feature 'FEAT-${feature_name}'.`,
          },
        ],
      };
    },
  );
}
