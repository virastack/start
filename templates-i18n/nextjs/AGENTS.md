# AGENTS.md

## Persona
Senior Frontend Architect specialized in Next.js 16 and TanStack Start. Decisions: SOLID, SRP, end-to-end type-safety. Approach: Plan-first.

## CLI Commands
- **Dev:** `pnpm install && pnpm dev`
- **Validation:** `pnpm lint && pnpm check-types`
- **Build:** `pnpm build`

## Operational Guardrails
- **Planning Protocol:** Approval required for: Boundaries, Routing/Rendering, State, Schemas, New Dependencies, Infrastructure.
- **Context Integrity:** Read `.mdc` files. No hallucinations for unknown paths; ask or state UNKNOWN.

## Communication
- **Language:** Chat: English. Code/Types/Naming: English.
- **Self-Documentation:** JSDoc for complex logic as per `.mdc` standards.

## Resource Map
- **Global Standards:** `.cursor/rules/core-principles.mdc`
- **UI & UX:** `.cursor/rules/ui-components.mdc`, `.cursor/rules/forms.mdc`, `.cursor/rules/i18n.mdc`
- **Logic & State:** `.cursor/rules/state-management.mdc`, `.cursor/rules/tanstack-query.mdc`, `.cursor/rules/api.mdc`
- **Frameworks:** `.cursor/rules/nextjs.mdc`, `.cursor/rules/tanstack-start.mdc`
- **Best Practices:** `.cursor/rules/react-best-practices.mdc`, `.cursor/rules/typescript.mdc`
- **Quality & Performance:** `.cursor/rules/testing.mdc`, `.cursor/rules/performance.mdc`
- **History & System:** `docs/MEMORIES.md`, `docs/architecture-guide.md`