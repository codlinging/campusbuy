# CampusBay Backend

This is the backend service for the CampusBay platform, a RESTful API built with Go (Golang). It handles data persistence, business logic, and user authentication, serving as the foundation for the CampusBay client applications.

## Technology Stack

* **Language:** Go (Golang)
* **Database:** PostgreSQL (`github.com/lib/pq`)
* **Routing:** Gorilla Mux (`github.com/gorilla/mux`)
* **Authentication:** JSON Web Tokens (JWT) (`github.com/golang-jwt/jwt/v5`)
* **Security:** Bcrypt (`golang.org/x/crypto/bcrypt`) for secure password hashing.

## How It Works

The backend follows a standard modular architecture, separating concerns into specific packages:

1.  **Entry Point (`cmd/api/main.go`):** Initializes the application by establishing a connection to the PostgreSQL database, configuring the Gorilla Mux router, registering HTTP endpoints (like `/api/auth/register` and `/api/auth/login`), and starting the HTTP server on port 8080.
2.  **Handlers (`internal/handlers`):** Acts as the controller layer. It parses incoming HTTP requests (JSON payloads), validates the data, calls the appropriate repository functions, and formats the HTTP responses. Currently, it manages user registration and authentication logic.
3.  **Models (`internal/models`):** Defines the core data structures used throughout the application, such as the `User` struct, representing the database schema in Go code.
4.  **Repository (`internal/repository`):** Manages all direct database interactions. This pattern isolates SQL queries from the rest of the application. It includes logic for creating users, fetching user details, and managing university-related data.
5.  **Utilities (`pkg/utils`):** Contains shared helper functions, primarily handling the generation and validation of JWTs for stateless, secure user sessions.

## File Structure

```text
campusbay-backend/
├── cmd/
│   └── api/
│       └── main.go              # Application entry point and server setup
├── internal/
│   ├── handlers/
│   │   └── auth.go              # HTTP handlers for Login and Register
│   ├── models/
│   │   └── user.go              # Core data structs (User)
│   └── repository/
│       ├── db.go                # Database connection initialization
│       ├── university.go        # DB queries for universities
│       └── user.go              # DB queries for user management
├── pkg/
│   └── utils/
│       └── jwt.go               # JWT generation and validation logic
├── go.mod                       # Go module dependencies
└── go.sum                       # Go module checksums