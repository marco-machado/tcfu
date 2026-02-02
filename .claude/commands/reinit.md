---
plan: true
---

Please analyze this codebase and update the CLAUDE.md files, which will be given to future instances of Claude Code to operate in this repository.

## Scope

This project uses multiple CLAUDE.md files:
- Root `/CLAUDE.md` - Project overview, critical rules, dev commands, code style
- Subdirectory CLAUDE.md files - Detailed documentation for specific areas

You must discover and update ALL CLAUDE.md files in the project, not just the root one.

## What to add

1. Commands that will be commonly used, such as how to build, lint, and run tests. Include the necessary commands to develop in this codebase, such as how to run a single test.
2. High-level code architecture and structure so that future instances can be productive more quickly. Focus on the "big picture" architecture that requires reading multiple files to understand.

## Performance

- Use parallel Read tool calls to speed up file retrieval - read multiple files in a single message when possible.

## Usage notes

- If there's already a CLAUDE.md, suggest improvements to it.
- When you make the initial CLAUDE.md, do not repeat yourself and do not include obvious instructions like "Provide helpful error messages to users", "Write unit tests for all new utilities", "Never include sensitive information (API keys, tokens) in code or commits".
- Avoid listing every component or file structure that can be easily discovered.
- Don't include generic development practices.
- If there are Cursor rules (in .cursor/rules/ or .cursorrules) or Copilot rules (in .github/copilot-instructions.md), make sure to include the important parts.
- If there is a README.md, make sure to include the important parts.
- Do not make up information such as "Common Development Tasks", "Tips for Development", "Support and Documentation" unless this is expressly included in other files that you read.
- Keep subdirectory CLAUDE.md files focused on their specific domain - don't duplicate information across files.
- The root CLAUDE.md should reference subdirectory files so Claude knows where to find detailed documentation.
- If a CLAUDE.md file grows beyond ~80 lines, suggest splitting it into more focused files or creating new subdirectory CLAUDE.md files for specific areas.
- Be sure to prefix the root file with the following text:

```
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
```
