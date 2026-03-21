### 2. Frontend README (`campusbay-frontend/README.md`)

```markdown
# CampusBay Frontend

The frontend client for CampusBay, providing an intuitive and modern user interface for university students to interact with the platform. It is built using the latest features of React and Next.js.

## Technology Stack

* **Framework:** Next.js 15 (utilizing the modern App Router)
* **UI Library:** React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS (configured via PostCSS)
* **Tooling:** ESLint (for code quality)

## How It Works

The frontend leverages Next.js's App Router architecture for seamless routing and optimized rendering:

1.  **App Router (`src/app`):** Uses file-system-based routing. Folders like `/login` and `/register` directly map to route URLs, with `page.tsx` serving as the UI for that specific route.
2.  **Components (`src/app/components`):** Reusable React UI components. The authentication logic is abstracted into `login-form.tsx` and `register-form.tsx`, which manage local state (form inputs) and handle API submission events to the Go backend.
3.  **Styling (`globals.css`):** Global styles are injected here, leveraging Tailwind CSS utility classes to rapidly build responsive and modern interfaces directly within the TSX files without writing custom CSS files.
4.  **Layout (`layout.tsx`):** Acts as the root shell for the application, defining the foundational HTML structure, importing global styles, and setting up persistent UI elements like navigation bars (if applicable) across different pages.

## File Structure

```text
campusbay-frontend/
├── public/                      # Static assets served directly (SVGs, icons)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   └── app/
│       ├── components/          # Reusable UI elements
│       │   ├── login-form.tsx   # Client component for user login
│       │   └── register-form.tsx# Client component for user registration
│       ├── login/
│       │   └── page.tsx         # Route: /login
│       ├── register/
│       │   └── page.tsx         # Route: /register
│       ├── favicon.ico          # Browser tab icon
│       ├── globals.css          # Global Tailwind CSS imports
│       ├── layout.tsx           # Root layout wrapper
│       └── page.tsx             # Route: / (Landing Page)
├── eslint.config.mjs            # Linter configuration
├── next.config.ts               # Next.js framework configuration
├── package.json                 # Node.js dependencies and run scripts
├── postcss.config.mjs           # CSS processing configuration
└── tsconfig.json                # TypeScript compiler options

