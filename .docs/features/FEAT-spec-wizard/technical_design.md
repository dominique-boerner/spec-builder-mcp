# Technical Design: Spec Wizard

## Architecture Overview

The Spec Wizard is implemented as a Claude Code skill — a prompt file registered in the MCP server that instructs Claude to act as a structured feature-planning assistant. It has no runtime logic of its own; all behaviour is driven by Claude following the skill prompt and calling MCP tools.

## Components

### MCP Server (`spec-builder-mcp`)
- Exposes the core tools: `spec_create`, `spec_search`, `spec_update`, `spec_list`
- Registers the Spec Wizard as a named skill (`spec_wizard`) via a prompt file
- Runs as a local MCP server, launched by the Claude Code host

### Skill Prompt (`sdd-workflow.prompt.md`)
- Plain Markdown file containing the full workflow instructions for Claude
- Defines the step order, tool usage rules, and language behaviour
- No executable code — Claude interprets and follows the instructions at runtime

### Filesystem Layer
- All specs are persisted as Markdown files directly in the user's workspace
- One folder per feature, named `FEAT-{name}/`
- No database, no remote storage — the filesystem is the single source of truth

## Tool Interaction Flow

```
User describes feature
  └─► spec_search        — check for existing spec
        ├─ found    ──►  inform user, offer to continue editing
        └─ not found ──► spec_create (generates FEAT-{name}/ with both files)
                              └─► iterative dialogue (requirements phase)
                                    └─► spec_update(type: requirements)
                                          └─► iterative dialogue (technical design phase)
                                                └─► spec_update(type: technical_design)
```

## File Structure

```
{workspace}/
└── FEAT-{name}/
    ├── requirements.md       # functional & non-functional requirements
    └── technical_design.md   # architecture, components, data flow
```

## Error Handling

- If `spec_search` returns no results, proceed immediately to `spec_create` — no confirmation needed.
- If `spec_create` fails (e.g. folder already exists), surface the error to the user and abort.
- If `spec_update` fails, notify the user and retry before continuing the dialogue.

## Constraints & Assumptions

- `workspace_path` must be resolvable from the Claude Code environment context at invocation time.
- The wizard is stateless: if the conversation is interrupted, the user must re-invoke the skill and resume manually.
- The skill depends entirely on MCP tool availability; without them it cannot function.
