import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { resolveDocsDir } from "../helpers/directory.helper.js";

export function registerSearchFeatureTool(server: McpServer) {
  server.registerTool(
    "spec_search",
    {
      description:
        "Searches existing feature documentation for a specific query to see if a feature already exists.",
      inputSchema: {
        workspace_path: z
          .string()
          .describe(
            "The absolute path to the user's current project workspace.",
          ),
        query: z
          .string()
          .describe(
            "The search query to match against feature names and contents.",
          ),
      },
    },
    async ({ workspace_path, query }) => {
      const docsDir = await resolveDocsDir(workspace_path);
      const normalizedQuery = query.toLowerCase();
      const matches: string[] = [];
      try {
        const entries = await fs.readdir(docsDir, { withFileTypes: true });
        const featureDirs = entries
          .filter((e) => e.isDirectory())
          .map((e) => e.name);

        for (const feature of featureDirs) {
          if (feature.toLowerCase().includes(normalizedQuery)) {
            matches.push(`${feature} — matched folder name`);
            continue;
          }
          const reqPath = path.join(docsDir, feature, "requirements.md");
          const tdPath = path.join(docsDir, feature, "technical_design.md");

          let matched = false;
          for (const [file, label] of [
            [reqPath, "requirements.md"],
            [tdPath, "technical_design.md"],
          ] as [string, string][]) {
            if (matched) break;
            try {
              const lines = (await fs.readFile(file, "utf8")).split("\n");
              const matchLine = lines.find((l) =>
                l.toLowerCase().includes(normalizedQuery),
              );
              if (matchLine) {
                matches.push(
                  `${feature} — matched in ${label}: "${matchLine.trim()}"`,
                );
                matched = true;
              }
            } catch {
              /* file might not exist */
            }
          }
        }
      } catch {
        /* directory might not exist */
      }

      return {
        content: [
          {
            type: "text",
            text:
              matches.length > 0
                ? `Matches found: ${matches.join(", ")}`
                : "No similar features found.",
          },
        ],
      };
    },
  );
}
