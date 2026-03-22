# CampusBay Backend

This is the backend RESTful API for the CampusBay platform, built with Go (Golang). It manages data persistence, business logic, user authentication, marketplace listings, real-time chat, and live auctions.

## Technology Stack

* **Language:** Go (Golang)
* **Database:** PostgreSQL
* **Caching & Real-time:** Redis (for session management, rate limiting, or pub/sub for chat/auctions)
* **Authentication:** JSON Web Tokens (JWT)
* **Security:** Bcrypt (for secure password hashing)
* **File Handling:** Native Go `multipart/form-data` processing for image uploads.

## How It Works

The backend follows a modular, layer-based architecture to separate routing, business logic, and database operations:

1.  **Entry Point (`cmd/api/main.go`):** Bootstraps the application. It connects to PostgreSQL and Redis, sets up the HTTP router, configures CORS, and registers API endpoints (Auth, Listings, Chat, Auctions).
2.  **Handlers (`internal/handlers`):** The controller layer parsing incoming HTTP requests.
    * `auth.go`: Handles user registration and login.
    * `listing.go`: Manages creating and fetching marketplace items, including multi-part forms for image uploads.
    * `auction.go`: Handles bidding logic and auction state management.
    * `chat.go`: Manages real-time messaging between users.
3.  **Middleware (`internal/middleware`):**
    * `auth.go`: Intercepts protected routes to verify the presence and validity of a JWT in the `Authorization` header.
4.  **Cache (`internal/cache`):**
    * `redis.go`: Manages connections and operations with the Redis instance, optimizing performance for real-time features.
5.  **Models (`internal/models`):** Defines Go structs that mirror database tables (`User`, `Listing`), ensuring strong typing.
6.  **Repository (`internal/repository`):** Abstracts database interactions (`db.go`, `user.go`, `university.go`, `listing.go`) using raw SQL queries.
7.  **Utilities (`pkg/utils`):** Helper functions, currently managing JWT creation and validation (`jwt.go`).
8.  **Uploads (`uploads/`):** Local storage directory for user-uploaded images.

## File Structure

```text
campusbay-backend/
├── cmd/
│   └── api/
│       └── main.go              # Application entry point and server setup
├── internal/
│   ├── cache/
│   │   └── redis.go             # Redis connection and logic
│   ├── handlers/
│   │   ├── auction.go           # HTTP handlers for auctions
│   │   ├── auth.go              # HTTP handlers for Login/Register
│   │   ├── chat.go              # HTTP handlers for messaging
│   │   └── listing.go           # HTTP handlers for listings/uploads
│   ├── middleware/
│   │   └── auth.go              # JWT verification middleware
│   ├── models/
│   │   ├── listing.go           # Data structs for marketplace items
│   │   └── user.go              # Data structs for users
│   └── repository/
│       ├── db.go                # PostgreSQL connection initialization
│       ├── listing.go           # DB queries for listings
│       ├── university.go        # DB queries for universities
│       └── user.go              # DB queries for user management
├── pkg/
│   └── utils/
│       └── jwt.go               # JWT generation logic
├── uploads/                     # Stored user-uploaded images
├── go.mod                       # Go module dependencies
└── go.sum                       # Go module checksums