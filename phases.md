Building CampusBay is a massive and exciting undertaking. [cite_start]Solving the "Graduation Dump" inefficiency [cite: 22] [cite_start]by creating a verified, inter-university network with live auctions is a highly practical solution[cite: 27, 28, 29]. 

Since you are building a system that handles user data, financial transactions, and real-time state changes, approaching this methodically is critical. 

[cite_start]Here is your project's finalized technology stack[cite: 58]:
* [cite_start]**Frontend:** Next.js 14 (TypeScript), Shadcn/UI [cite: 59, 60]
* [cite_start]**Backend:** Go (Golang), Gin framework [cite: 61]
* [cite_start]**Database:** PostgreSQL [cite: 62]
* [cite_start]**Real-Time Layer:** Redis [cite: 63]
* [cite_start]**Search:** Meilisearch [cite: 64]

[cite_start]Here is a step-by-step technical roadmap to build CampusBay from scratch, structured as a modular monolith[cite: 65].

### Phase 1: Core Architecture & The "Trust Circle" (Weeks 1-2)
[cite_start]Your first goal is to establish the foundational repositories and lock down user access to create your secure environment[cite: 46, 47].

1.  **Initialize the Monorepo:** Set up your version control. Keep your Next.js 14 frontend and Go backend in separate directories but within the same repository for now to streamline early development. 
2.  [cite_start]**Database Provisioning:** Spin up a local PostgreSQL instance[cite: 62]. Design your initial schema focusing strictly on `Users` and `Universities`. 
3.  **Authentication Flow:** Build the Go/Gin endpoints for registration and login. 
    * [cite_start]Implement strict validation that only accepts valid `.edu` email domains[cite: 47].
    * [cite_start]Set up JWT (JSON Web Token) generation for session management[cite: 47].
    * *Security Check:* Ensure your auth endpoints are protected over TLS and that you've configured your headers to block basic reconnaissance tools from scraping your API structure.

### Phase 2: Marketplace Engine & Search (Weeks 3-4)
Users need to be able to post items and find them instantly before you introduce the complexity of live auctions.

1.  [cite_start]**Listing CRUD Operations:** Develop the REST API in Go to handle Creating, Reading, Updating, and Deleting item listings[cite: 48].
    * *Security Check:* Implement strict input sanitization on all listing descriptions and titles to prevent XSS payloads from being stored and executed on the client side.
2.  [cite_start]**Meilisearch Integration:** Spin up a local Meilisearch instance[cite: 64].
3.  [cite_start]**Data Synchronization:** Write a Go service that listens for new or updated listings in PostgreSQL and asynchronously pushes a formatted, sanitized document to Meilisearch[cite: 48]. 
4.  [cite_start]**Frontend Search Integration:** Build the search bar in Next.js, pointing directly to the Meilisearch instance to provide instant, typo-tolerant results[cite: 44, 48].

### Phase 3: The Real-Time Auction System (Weeks 5-6)
This is the core engine. [cite_start]You will leverage Go's Goroutines and Redis to handle high-frequency bidding[cite: 49, 61].

1.  [cite_start]**WebSocket Setup:** Create a WebSocket handler in Gin[cite: 49]. [cite_start]When a user opens an auction page on the Next.js frontend, establish a persistent connection[cite: 84].
2.  **Redis Pub/Sub:** Configure Redis. [cite_start]For every active auction, designate a specific Redis channel[cite: 49, 63].
3.  **The Bidding Logic:**
    * [cite_start]User submits a bid via WebSocket[cite: 74].
    * [cite_start]Go checks the current highest bid cached in Redis (for millisecond latency)[cite: 63].
    * [cite_start]If the bid is valid, Go updates the Redis cache and publishes the new price to the auction's Pub/Sub channel[cite: 90].
    * [cite_start]All connected frontend clients listening to that channel instantly receive the updated price[cite: 91, 100].

### Phase 4: Transactions & Security (Weeks 7-8)
Real-time speed is handled by Redis, but data integrity must be guaranteed by PostgreSQL to ensure no one loses money or items.

1.  [cite_start]**The CampusWallet Ledger:** Design the database schema for user balances and transaction histories[cite: 50].
2.  **ACID Transactions:** Write the logic to resolve an auction. [cite_start]When time expires, pull the final state from Redis and persist it to PostgreSQL[cite: 50, 93]. [cite_start]Wrap this entire process in an ACID-compliant transaction so that if the ledger update fails, the whole operation rolls back[cite: 50].
3.  [cite_start]**Rate Limiting:** Implement middleware on your API gateway to strictly rate-limit bid submissions, preventing automated scripts or malicious actors from spamming the server[cite: 50].

### Phase 5: Polish & Testing (Week 9)
Prepare the application for the real world.

1.  [cite_start]**UI Implementation:** Replace placeholder frontend elements with polished Shadcn/UI components for a clean, accessible user experience[cite: 51].
2.  [cite_start]**Load Testing:** Write scripts to simulate hundreds of concurrent users firing WebSockets bids at your auction engine[cite: 51]. Monitor how Go and Redis handle the memory and connection limits, and optimize your Goroutine management accordingly.

---

Would you like to start by setting up the database schema for the `Users` and `Universities` to get the Auth phase moving, or would you prefer to map out the Go/Gin folder structure first?