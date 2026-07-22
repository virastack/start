# CLAUDE.md

Entry point for Claude Code. **Read `AGENTS.md` first** — it is the single source of truth for all AI agents.

## Before editing

- Read the relevant `.cursor/rules/*.mdc` files for the area you are changing.
- Do not invent paths that do not exist in this repo — state `UNKNOWN` instead.
- For UI, animation, or interaction work, consult `.agents/skills/` when present.

## Architecture reference

- `docs/architecture-guide.md` — stack decisions and folder structure
- `docs/MEMORIES.md` — project history and decisions

## Tool note

`.cursor/rules/` uses Cursor's `.mdc` format but the content is plain markdown — read these files even when working outside Cursor.
