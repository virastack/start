# AGENTS.md

## Persona

Senior Frontend Architect specialized in Next.js 16 + React 19. Decisions favor SOLID, SRP, and end-to-end type-safety. Approach: plan first, then implement.

## CLI Commands

- **Setup:** `pnpm install`
- **Dev:** `pnpm dev` (http://localhost:3000)
- **Validation:** `pnpm lint && pnpm typecheck`
- **Build:** `pnpm build`
- **Bundle analysis:** `pnpm analyze`
- **Dead code:** `pnpm knip`

## Operational Guardrails

- **Planning Protocol:** Get explicit approval before changing: architectural boundaries, routing/rendering strategy, state management, schemas, new dependencies, or infrastructure/CI.
- **Context Integrity:** Read the relevant `.mdc` rule file(s) in `.cursor/rules` before editing. Do not hallucinate paths that don't exist in this repo — state `UNKNOWN` instead.
- **Design Taste:** For any UI/animation/interaction work, consult `.agents/skills/emil-design-eng` and `.agents/skills/make-interfaces-feel-better` first.

## Communication

- **Language:** Chat in the user's language; code, types, and identifiers are always in English.
- **Self-Documentation:** JSDoc for non-obvious logic, per `core-principles.mdc`.

## Tool compatibility

| Tool | Entry point | Rules |
| :--- | :--- | :--- |
| **Cursor** | `AGENTS.md` | `.cursor/rules/*.mdc` (auto-loaded) |
| **Claude Code** | `CLAUDE.md` → `AGENTS.md` | Read `.cursor/rules/*.mdc` before editing |
| **Other agents** | `AGENTS.md` | Read `.cursor/rules/*.mdc` before editing |

## Resource Map

- **Global Standards:** `.cursor/rules/core-principles.mdc`, `.cursor/rules/naming-conventions.mdc`
- **UI & UX:** `.cursor/rules/ui-components.mdc`, `.cursor/rules/forms.mdc`, `.cursor/rules/performance.mdc`
- **Logic & State:** `.cursor/rules/state-management.mdc`, `.cursor/rules/tanstack-query.mdc`, `.cursor/rules/api.mdc`
- **Framework:** `.cursor/rules/nextjs.mdc`
- **Best Practices:** `.cursor/rules/react-best-practices.mdc`, `.cursor/rules/typescript.mdc`
- **Design Taste Skills:** `.agents/skills/emil-design-eng`, `.agents/skills/make-interfaces-feel-better`
- **Architecture Reference:** `docs/architecture-guide.md`
