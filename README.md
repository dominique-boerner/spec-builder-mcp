# spec-builder-mcp

An MCP (Model Context Protocol) server that helps AI assistants plan and document software features using a structured **Software Design Document (SDD)** approach.

Instead of jumping straight into code, the AI guides you through creating proper documentation — requirements and technical design — before any implementation begins.

## How it works

When connected to an MCP-compatible client (e.g. Claude Desktop, Cursor, Junie), the server exposes tools and a workflow prompt that the AI uses to manage feature documentation in your project.

All documents are stored locally in your project under `.docs/features/`:

```
your-project/
└── .docs/
    └── features/
        └── user-login/
            ├── requirements.md
            └── technical_design.md
```

### Workflow

1. You trigger the `spec_wizard` prompt in your MCP client.
2. The AI asks: *"What do you want to build?"*
3. It searches existing feature docs to check if the feature already exists.
4. If it's new, it asks whether to start with **Requirements** or **Technical Design**.
5. The document is created and filled out iteratively with you.

## Tools

| Tool | Description |
|---|---|
| `spec_list` | Lists all documented features in `.docs/features/` |
| `spec_search` | Searches feature names and document contents for a query |
| `spec_create` | Creates a new feature folder and initializes a document |

## Setup

### 1. Build

```bash
npm install
npm run build
```

### 2. Configure your MCP client

Add the server to your MCP client configuration:

```json
{
  "mcpServers": {
    "spec-builder-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/spec-builder-mcp/build/index.js"]
    }
  }
}
```

### 3. Use

In your MCP client, select the `spec_wizard` prompt to begin a guided feature planning session.

## Development

```bash
npm run build   # compile TypeScript + copy prompt files
npm start       # run the built server
```

Source structure:

```
src/
├── index.ts                        # entry point — registers tools and prompt
├── helpers/
│   └── directory.helper.ts         # resolves .docs/features/ path
├── prompts/
│   ├── sdd-workflow.prompt.json    # prompt metadata
│   └── sdd-workflow.prompt.md      # prompt content sent to the AI
└── tools/
    ├── list-features.tool.ts
    ├── search-feature.tool.ts
    └── create-feature.tool.ts
```
