# Requirements: Spec Wizard

## Goal

The Spec Wizard is a Claude Code skill that guides developers through a strict SDD (Software Design Document) process — from a raw feature idea to a fully written spec with requirements and technical design.

## Functional Requirements

1. **Feature Discovery** — The wizard asks "What do you want to build?" if the user has not already described a feature.
2. **Duplicate Detection** — Before creating anything, the wizard calls `spec_search` to check whether a spec for the described feature already exists.
   - If found: inform the user and offer to continue editing the existing spec.
   - If not found: proceed to creation.
3. **Spec Creation** — For new features, the wizard calls `spec_create`, which generates a `FEAT-{name}/` folder containing `requirements.md` and `technical_design.md`.
4. **Iterative Authoring** — The wizard works through the spec in two ordered phases:
   - Phase 1: Requirements (functional + non-functional)
   - Phase 2: Technical Design (architecture, data model, API, etc.)
5. **Immediate Persistence** — Every completed section is saved immediately via `spec_update` without waiting for the full document to be finished.
6. **Workspace Path Resolution** — The `workspace_path` parameter is derived automatically from the Claude Code environment context and passed to every MCP tool call.

## Non-Functional Requirements

- **Language** — The wizard responds in the language the user is writing in.
- **Process Discipline** — Steps must not be skipped; requirements must be completed before technical design begins.
- **Stateless** — The wizard carries no persisted session state between invocations; all state lives in the spec files on disk.
- **Tool Dependency** — The wizard is non-functional without access to the MCP tools: `spec_search`, `spec_create`, `spec_update`, `spec_list`.
