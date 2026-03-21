### 2. Frontend README (`campusbay-frontend/README.md`)

```markdown
# CampusBay Frontend

The Next.js frontend client for CampusBay. It provides a modern, responsive user interface for university students to authenticate, browse the marketplace, and post their own listings.

## Technology Stack

* **Framework:** Next.js 15 (App Router)
* **UI Library:** React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Tooling:** ESLint, PostCSS

## How It Works

The application utilizes Next.js's App Router for efficient, server-side rendered (SSR) and statically generated pages:

1.  **Routing & Pages (`src/app`):** * Public routes include `/login`, `/register`, and the landing page (`/`).
    * Protected/User routes include `/dashboard` (the main hub for authenticated users) and `/create-listing` (the interface for posting items).
2.  **Components (`src/app/components`):** Reusable, stateful client components. 
    * `login-form.tsx` and `register-form.tsx` handle auth API calls.
    * `create-listing-form.tsx` handles complex state management for text inputs and file (image) selections, submitting them as `FormData` to the Go backend.
3.  **State & Auth Flow:** Upon successful login, the JWT is stored (typically in `localStorage` or cookies). When navigating to `/dashboard` or submitting via `create-listing-form.tsx`, this token is attached to the request headers to authorize the action.
4.  **Styling (`globals.css`):** Completely styled using Tailwind CSS utility classes, ensuring a consistent and responsive design across all devices.

## File Structure

```text
campusbay-frontend/
├── public/                      # Static assets (SVGs, icons)
├── src/
│   └── app/
│       ├── components/          # Reusable React components
│       │   ├── create-listing-form.tsx # Form with image upload handling
│       │   ├── login-form.tsx   
│       │   └── register-form.tsx
│       ├── create-listing/      
│       │   └── page.tsx         # Route: /create-listing
│       ├── dashboard/           
│       │   └── page.tsx         # Route: /dashboard (Main authenticated view)
│       ├── login/               
│       │   └── page.tsx         # Route: /login
│       ├── register/            
│       │   └── page.tsx         # Route: /register
│       ├── favicon.ico          
│       ├── globals.css          # Global Tailwind styles
│       ├── layout.tsx           # Root HTML/Body layout
│       └── page.tsx             # Route: / (Landing Page)
├── eslint.config.mjs            # Linter configuration
├── next.config.ts               # Next.js configuration
├── package.json                 # Node.js dependencies
├── postcss.config.mjs           # CSS processing config
└── tsconfig.json