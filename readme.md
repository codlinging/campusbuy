### 3. Overall Project README (Root `README.md`)

```markdown
# CampusBay

CampusBay is a dedicated platform for university students to connect and trade within their campus community. It features a robust user authentication system and a marketplace for creating and browsing listings with image support.

## System Architecture Overview

CampusBay operates on a decoupled client-server architecture:

* **Frontend (Next.js):** Manages the user interface, form state (including file uploads), and client-side routing. It communicates securely with the backend via RESTful APIs.
* **Backend (Go/PostgreSQL):** Handles heavy lifting, data persistence, and security. It utilizes middleware to protect sensitive routes (like creating a listing).
* **Storage:** User-uploaded images for listings are currently stored locally in the backend's `uploads/` directory, with file paths saved to the PostgreSQL database.
* **Authentication Flow:** 1. User logs in via Next.js.
  2. Go backend validates credentials and returns a JWT.
  3. Next.js stores the JWT and attaches it as a Bearer token in the `Authorization` header for protected actions (e.g., accessing the dashboard or uploading a new listing).

## Technology Stack Summary

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend** | Go (Golang), Standard `net/http` / Router, JWT Auth |
| **Database** | PostgreSQL |
| **File Storage**| Local File System (`multipart/form-data` processing) |

## Project Structure

```text
campusbuy/
├── campusbay-backend/           # Go API API server
│   ├── cmd/                     # Server entry points
│   ├── internal/                # Logic (handlers, models, repository, middleware)
│   ├── pkg/                     # Utilities (JWT)
│   └── uploads/                 # Local image storage
│
├── campusbay-frontend/          # Next.js Web Application
│   ├── public/                  # Static assets
│   └── src/app/                 # Next.js Pages (Dashboard, Auth, Create Listing)
│
├── backend.md                   # Dev notes regarding backend setup
├── frontend.md                  # Dev notes regarding frontend setup
├── database.md                  # DB schema/configuration notes
├── phases.md                    # Project roadmap and planning
└── readme.md                    # Root documentation (this file)