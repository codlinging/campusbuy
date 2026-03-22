---

### 3. Overall Project README (Root `README.md`)

```markdown
# CampusBay

CampusBay is a comprehensive digital platform designed for university students to connect, trade, and communicate within their campus community. It features user authentication, a marketplace with image support, live auctions, real-time messaging, user profiles, and an integrated digital wallet system.

## System Architecture Overview

CampusBay operates on a decoupled client-server architecture:

* **Frontend (Next.js):** Manages the UI, client-side routing, file uploads, dynamic views for chat/auctions, and wallet interactions. It communicates securely with the backend via RESTful APIs and utilizes real-time protocols for live features.
* **Backend (Go/PostgreSQL/Redis):** Handles business logic, data persistence, and security. It utilizes PostgreSQL for primary data storage (users, listings, wallet balances) and Redis for caching and facilitating real-time interactions (chat and bidding).
* **Storage:** User-uploaded images are stored locally in the backend's `uploads/` directory, referenced by file paths in the database.
* **Authentication Flow:** Next.js client sends credentials -> Go backend validates and returns JWT -> Next.js uses JWT as a Bearer token for all protected API calls.

## Technology Stack Summary

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend** | Go (Golang), Standard `net/http` / Router, JWT Auth |
| **Databases** | PostgreSQL (Primary Data), Redis (Cache/Real-time) |
| **File Storage**| Local File System (`multipart/form-data`) |

## Project Structure

```text
campusbuy/
├── campusbay-backend/           # Go API server
│   ├── cmd/                     # Server entry points
│   ├── internal/                # Logic (handlers, models, cache, db)
│   ├── pkg/                     # Utilities (JWT)
│   └── uploads/                 # Local image storage
│
├── campusbay-frontend/          # Next.js Web Application
│   ├── public/                  # Static assets
│   └── src/app/                 # Next.js Pages (Dashboard, Auth, Auction, Chat, Profile)
│
├── backend.md                   # Dev notes: backend setup
├── commands.md                  # Useful CLI commands for the project
├── database.md                  # Dev notes: DB schema/configuration
├── frontend.md                  # Dev notes: frontend setup
├── phases.md                    # Project roadmap and planning
├── firstcommit.md               # Git tracking details
└── readme.md                    # Root documentation (this file)