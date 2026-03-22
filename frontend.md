---

### 2. Frontend README (`campusbay-frontend/README.md`)

```markdown
# CampusBay Frontend

The Next.js frontend client for CampusBay. It provides a modern, responsive user interface for university students to authenticate, browse the marketplace, participate in auctions, chat with peers, manage their profiles, and utilize their digital wallets.

## Technology Stack

* **Framework:** Next.js 15 (App Router)
* **UI Library:** React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Tooling:** ESLint, PostCSS

## How It Works

The application utilizes Next.js's App Router for efficient routing, rendering, and state management:

1.  **Routing & Pages (`src/app`):**
    * **Public routes:** `/login`, `/register`, and the landing page (`/`).
    * **Protected routes:** `/dashboard` (main hub), `/create-listing` (posting items), and `/profile` (user settings and wallet view).
    * **Dynamic routes:** `/auction/[id]` for individual live auctions and `/chat/[roomId]` for messaging.
2.  **Components (`src/app/components`):** Reusable, stateful client components handling API submissions and local state (`login-form.tsx`, `register-form.tsx`, `create-listing-form.tsx`, `wallet-widgets.tsx`).
3.  **State & Auth Flow:** Upon login, the JWT is stored client-side. When navigating to protected routes or submitting data, this token is attached to the request headers to authorize the action.
4.  **Styling (`globals.css`):** Styled entirely using Tailwind CSS utility classes.

## File Structure

```text
campusbay-frontend/
├── public/                      # Static assets (SVGs, icons)
├── src/
│   └── app/
│       ├── auction/
│       │   └── [id]/
│       │       └── page.tsx     # Dynamic Route: Individual auction view
│       ├── chat/
│       │   └── [roomId]/
│       │       └── page.tsx     # Dynamic Route: Chat room view
│       ├── components/          
│       │   ├── create-listing-form.tsx 
│       │   ├── login-form.tsx   
│       │   ├── register-form.tsx
│       │   └── wallet-widgets.tsx # UI components for wallet balance/actions
│       ├── create-listing/      
│       │   └── page.tsx         # Route: /create-listing
│       ├── dashboard/           
│       │   └── page.tsx         # Route: /dashboard 
│       ├── login/               
│       │   └── page.tsx         # Route: /login
│       ├── profile/
│       │   └── page.tsx         # Route: /profile (User details & Wallet)
│       ├── register/            
│       │   └── page.tsx         # Route: /register
│       ├── favicon.ico          
│       ├── globals.css          # Global Tailwind styles
│       ├── layout.tsx           # Root HTML/Body layout
│       └── page.tsx             # Route: / (Landing Page)
├── eslint.config.mjs            
├── next.config.ts               
├── package.json                 
├── postcss.config.mjs           
└── tsconfig.json