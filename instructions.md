You are a senior full-stack architect specializing in modern React ecosystems.

I want to initialize a production-grade project using the LATEST stable versions of:

- Next.js (App Router)
- React
- TypeScript (strict mode)
- TailwindCSS
- shadcn/ui
- Radix UI
- @tanstack/react-table
- @tiptap/react
- Zustand
- dnd-kit
- Motion (framer-motion successor if applicable)
- React Hook Form
- Zod

This project must follow industry best practices, scalability patterns, clean architecture, and reusable component design.

# ==================================================
🔧 CORE REQUIREMENTS

1. Use Next.js App Router (NOT Pages Router).
2. Use Server Components by default.
3. Use Client Components only where required.
4. Enable strict TypeScript config.
5. Use absolute imports with path aliases.
6. Organize using feature-based architecture.
7. Implement proper folder structure for scalability.
8. Use ESLint + Prettier best practices.
9. Use Tailwind with class variance authority (CVA).
10. All UI components must be reusable and isolated.
11. Use shadcn/ui components or blocks whenever possible.
12. Prefer composition over prop-drilling.
13. Use Zod schemas for all form validation.
14. Use React Hook Form + Zod resolver.
15. Zustand must follow slice pattern for scalability.
16. Use TanStack Table in headless mode with reusable wrapper.
17. Use Tiptap in modular extension pattern.
18. Use dnd-kit with composable drag layers.
19. Motion animations must be subtle and performant.
20. Follow accessibility best practices (ARIA, Radix primitives).

# ==================================================
📁 PROJECT STRUCTURE

Design a scalable folder structure like:

/app
/components
/ui
/shared
/features
/lib
/db          ← dummy database
/dal         ← data access layer
/validations
/store
/utils
/hooks
/constants
/types
/styles

Explain why each folder exists.

# ==================================================
🎨 DESIGN SYSTEM SETUP

- Configure Tailwind with design tokens.
- Use shadcn theme system.
- Implement dark/light theme toggle.
- Use CSS variables.
- Setup typography scale.
- Setup container system.

Use official shadcn components from:
https://ui.shadcn.com/docs/components
Use blocks when useful:
https://ui.shadcn.com/blocks

# ==================================================
🧠 STATE MANAGEMENT

- Create a sample Zustand store using slice architecture.
- Show best practice typing.
- Avoid unnecessary re-renders.
- Demonstrate server/client separation.

# ==================================================
📝 FORMS

Create a reusable form components from shacn/ui system:

- Base Form wrapper
- Controlled inputs
- Zod schema example
- Error handling pattern
- Submit pattern

# ==================================================
📊 TABLE SYSTEM

Create a reusable DataTable component using:

- @tanstack/react-table
- Column typing
- Sorting
- Pagination
- Row selection
- Empty state

# ==================================================
🧩 RICH TEXT EDITOR

Create a modular Tiptap wrapper:

- Extensions separated
- Toolbar component
- Reusable Editor wrapper
- Controlled state

# ==================================================
🎯 FIRST PAGE REQUIREMENT

Now prepare the project for the FIRST PAGE design:

The first page should:

- Be a modern dashboard layout
- Include:
    - Sidebar (collapsible)
    - Header
    - Data table
    - Form modal
    - Drag-and-drop card section
    - Rich text editor section
- Use shadcn components wherever possible
- Be responsive
- Use Motion for subtle animations
- Be clean and minimal

# ==================================================
📦 OUTPUT FORMAT

1. Show installation commands
2. Show project setup steps
3. Show folder structure
4. Provide starter layout code
5. Provide reusable component patterns
6. Provide best practices explanations
7. Prepare code ready to paste
8. Do NOT over-simplify

Act like you are building a real SaaS starter kit.

# ==================================================
🗄️ DUMMY DATABASE REQUIREMENTS

Inside /lib/db:

1. Create mock data files per domain (users.ts, tasks.ts, etc).
2. Data must be strongly typed.
3. Create a delay utility:
    
    export const delay = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms))
    
4. Every mock fetch must:
    - Await delay()
    - Return deep-cloned data
    - Simulate real async behavior
5. Create simple CRUD-like functions.

Example pattern:

- getUsers()
- getUserById(id)
- createUser(data)
- updateUser(id, data)
- deleteUser(id)

All async.

# ==================================================
🧠 DATA ACCESS LAYER (DAL)

Inside /lib/dal:

Create abstraction layer functions that wrap the dummy DB.

Example:

/lib/dal/user.ts

- export async function fetchUsers()
- export async function createUser()

The UI must NEVER import from /lib/db directly.
Only import from /lib/dal.

This makes it easy to later replace implementation with:

- fetch("/api/...")
- server actions
- or real backend integration

# ==================================================
🔄 INTEGRATION STRATEGY (FUTURE API READY)

Architect the DAL so that:

1. Switching from dummy DB to real API requires changing only the DAL implementation.
2. No UI refactor should be required.
3. Data types remain stable.
4. Zod schemas validate incoming data.

Explain clearly how this abstraction enables clean backend migration.