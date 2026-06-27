#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "fs/promises";
import path from "path";
import sddPrompt from "./prompts/sdd-workflow.prompt.json" with { type: "json" };
import { registerListFeaturesTool } from "./tools/list-features.tool.js";
import { registerSearchFeatureTool } from "./tools/search-feature.tool.js";
import { registerCreateFeatureTool } from "./tools/create-feature.tool.js";
import { registerUpdateFeatureTool } from "./tools/update-feature.tool.js";

const server = new McpServer({ name: "spec-builder-mcp", version: "1.0.0" });

// Tools
registerListFeaturesTool(server);
registerSearchFeatureTool(server);
registerCreateFeatureTool(server);
registerUpdateFeatureTool(server);

// Prompt
server.registerPrompt(
  sddPrompt.name,
  {
    description: sddPrompt.description,
  },
  async () => {
    const promptPath = path.resolve(
      import.meta.dirname,
      "prompts",
      sddPrompt.textPath,
    );
    const text = await fs.readFile(promptPath, "utf8");
    return {
      messages: [{ role: "user", content: { type: "text", text } }],
    };
  },
);

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
