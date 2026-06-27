#!/usr/bin/env node

import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import fs from "fs/promises";
import path from "path";
import sddPrompt from "./prompts/sdd-workflow.prompt.json" with {type: "json"};
import {resolveDocsDir} from "./helpers/directory.helper.js";

const server = new McpServer(
  {name: "feature-docs-mcp", version: "1.0.0"},
);

// Tool definition

server.registerTool("list_features", {
  description: "Lists all documented features in the .docs/features directory of the workspace.",
  inputSchema: {
    workspace_path: z.string().describe("The absolute path to the user's current project workspace."),
  },
}, async ({workspace_path}) => {
  const docsDir = await resolveDocsDir(workspace_path);
  let features: string[] = [];
  try {
    const entries = await fs.readdir(docsDir, {
      withFileTypes: true
    });

    features = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    // Directory might not exist yet
  }
  return {
    content: [
      {type: "text", text: JSON.stringify(features, null, 2)}
    ]
  };
});

server.registerTool("search_feature", {
  description: "Searches existing feature documentation for a specific query to see if a feature already exists.",
  inputSchema: {
    workspace_path: z.string().describe("The absolute path to the user's current project workspace."),
    query: z.string().describe("The search query to match against feature names and contents."),
  },
}, async ({workspace_path, query}) => {
  const docsDir = await resolveDocsDir(workspace_path);
  const normalizedQuery = query.toLowerCase();
  const matches: string[] = [];
  try {
    const entries = await fs.readdir(docsDir, {
      withFileTypes: true
    });
    const featureDirs = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name);

    for (const feature of featureDirs) {
      if (feature.toLowerCase().includes(normalizedQuery)) {
        matches.push(feature);
        continue;
      }
      const reqPath = path.join(docsDir, feature, "requirements.md");
      const tdPath = path.join(docsDir, feature, "technical_design.md");

      for (const file of [reqPath, tdPath]) {
        try {
          const content = await fs.readFile(file, "utf8");
          if (content.toLowerCase().includes(normalizedQuery)) {
            matches.push(feature);
            break;
          }
        } catch { /* file might not exist */
        }
      }
    }
  } catch { /* directory might not exist */
  }

  return {
    content: [{
      type: "text",
      text: matches.length > 0 ? `Matches found: ${matches.join(", ")}` : "No similar features found."
    }],
  };
});

server.registerTool("create_feature", {
  description: "Creates a new feature folder and initializes the specified document (requirements or technical_design).",
  inputSchema: {
    workspace_path: z.string().describe("The absolute path to the user's current project workspace."),
    feature_name: z.string().describe("The name of the feature (used as the folder name, e.g., 'user-login')."),
    type: z.enum(["requirements", "technical_design"]).describe("The type of document to create."),
  },
}, async ({workspace_path, feature_name, type}) => {
  const docsDir = await resolveDocsDir(workspace_path);
  const featureDir = path.join(docsDir, feature_name);
  await fs.mkdir(featureDir, {recursive: true});

  const filePath = path.join(featureDir, `${type}.md`);
  try {
    await fs.access(filePath);
    return {
      content: [{type: "text", text: `Document ${type}.md already exists for feature '${feature_name}'.`}],
      isError: true,
    };
  } catch {
    const title = type === "requirements" ? "Anforderungen" : "Technisches Design";
    await fs.writeFile(filePath, `# ${title}: ${feature_name}\n\n`, "utf8");
    return {
      content: [{type: "text", text: `Successfully created ${type}.md for feature '${feature_name}'.`}],
    };
  }
});

// Prompt definition

server.registerPrompt(sddPrompt.name, {
  description: sddPrompt.description,
}, async () => {
  const promptPath = path.resolve(import.meta.dirname, "prompts", sddPrompt.textPath);
  const text = await fs.readFile(promptPath, "utf8");
  return {
    messages: [{role: "user", content: {type: "text", text}}],
  };
});

// Main

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Feature Docs MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
