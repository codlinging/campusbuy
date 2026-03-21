# CampusBay Backend

This is the backend RESTful API for the CampusBay platform, built with Go (Golang). It manages data persistence, business logic, user authentication, and marketplace listing operations (including image uploads).

## Technology Stack

* **Language:** Go (Golang)
* **Database:** PostgreSQL
* **Authentication:** JSON Web Tokens (JWT)
* **Security:** Bcrypt (for secure password hashing)
* **File Handling:** Native Go `multipart/form-data` processing for image uploads.

## How It Works

The backend follows a modular, layer-based architecture to separate routing, business logic, and database operations:

1.  **Entry Point (`cmd/api/main.go`):** Bootstraps the application. It connects to PostgreSQL, sets up the HTTP router, configures CORS, and registers API endpoints (Auth, Listings, etc.).
2.  **Handlers (`internal/handlers`):** The controller layer. It parses incoming HTTP requests. 
    * `auth.go` handles user registration and login.
    * `listing.go` manages creating and fetching marketplace items, including parsing multi-part forms for image uploads.
3.  **Middleware (`internal/middleware`):** * `auth.go` intercepts protected routes (like creating a listing) to verify the presence and validity of a JWT in the `Authorization` header before allowing the request to proceed.
4.  **Models (`internal/models`):** Defines Go structs that mirror database tables (`User`, `Listing`), ensuring strong typing for data payloads.
5.  **Repository (`internal/repository`):** Abstracts database interactions.
    * `db.go` handles connection pooling.
    * `user.go`, `university.go`, and `listing.go` execute raw SQL queries to securely read/write data to PostgreSQL.
6.  **Utilities (`pkg/utils`):** Helper functions, currently managing JWT creation and validation (`jwt.go`).
7.  **Uploads (`uploads/`):** A local directory serving as a storage bucket for user-uploaded images related to their listings.

## File Structure

```text
campusbay-backend/
├── cmd/
│   └── api/
│       └── main.go              # Application entry point and server setup
├── internal/
│   ├── handlers/
│   │   ├── auth.go              # HTTP handlers for Login/Register
│   │   └── listing.go           # HTTP handlers for creating/fetching listings
│   ├── middleware/
│   │   └── auth.go              # JWT verification middleware for protected routes
│   ├── models/
│   │   ├── listing.go           # Data structs for marketplace items
│   │   └── user.go              # Data structs for users
│   └── repository/
│       ├── db.go                # Database connection initialization
│       ├── listing.go           # DB queries for listings and image paths
│       ├── university.go        # DB queries for universities
│       └── user.go              # DB queries for user management
├── pkg/
│   └── utils/
│       └── jwt.go               # JWT generation logic
├── uploads/                     # Stored user-uploaded images (e.g., .jpg, .jpeg)
├── go.mod                       # Go module dependencies
└── go.sum                       # Go module checksums