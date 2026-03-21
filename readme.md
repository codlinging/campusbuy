--

### 3. Overall Project README (Root `README.md`)

```markdown
# CampusBay

CampusBay is a modern, full-stack platform designed for university students. It serves as a campus-specific marketplace and community hub. This repository contains both the Go-based backend API and the Next.js frontend application.

## System Architecture Overview

CampusBay operates on a decoupled client-server architecture:

* **Frontend (Next.js):** A server-rendered and statically generated web application that provides the user interface. It communicates with the backend purely via RESTful HTTP requests.
* **Backend (Go/PostgreSQL):** A high-performance REST API that handles all business logic, data persistence, and security.
* **Authentication Flow:** When a user logs in via the Next.js frontend, the Go backend verifies the credentials against the PostgreSQL database (using Bcrypt) and issues a JSON Web Token (JWT). The frontend stores this token and includes it in the `Authorization` header for subsequent secure API requests.

## Technology Stack Summary

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend** | Go (Golang), Gorilla Mux (Router), JWT |
| **Database** | PostgreSQL |
| **Security** | Bcrypt (Hashing), stateless JWT sessions |

## Project Structure

```text
campusbuy/
├── campusbay-backend/           # The Go API and server logic
│   ├── cmd/                     # Server entry points
│   ├── internal/                # Private application logic (handlers, db)
│   └── pkg/                     # Shared utilities (JWT)
│
├── campusbay-frontend/          # The Next.js web application
│   ├── public/                  # Static web assets
│   └── src/app/                 # Next.js App Router pages and components
│
└── README.md