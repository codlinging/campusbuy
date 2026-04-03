Here is your ultimate cheat sheet for spinning up the entire CampusBay ecosystem. 

You will need **4 separate terminal windows** open to run everything simultaneously.

### Terminal 1: The Databases (Docker)
First, make sure Docker Desktop is open and running on your laptop. Then, ensure your Redis instance is up (PostgreSQL should already be running from our earlier setup):
```bash
docker run -d --name campusbay-redis -p 6379:6379 redis:alpine
```
*(If it says the container name is already in use, just run `docker start campusbay-redis` instead).*

### Terminal 2: The Go Backend
Navigate to your `campusbay-backend` folder and start the API engine:
```bash
go run cmd/api/main.go
```

### Terminal 3: The Next.js Web App
Navigate to your `campusbay-frontend` folder and start the web server:
```bash
npm run dev
```
*(You can view this on your laptop at `http://localhost:3000`)*

### Terminal 4: The Expo Mobile App
Navigate to your Expo mobile app folder and start the Metro bundler:
```bash
npx expo start
```
*(Scan the QR code with your phone's camera or the Expo Go app).*

---

### 💡 Quick Network Reminder for Phone Testing
If you are testing on your phone, remember that you need your laptop's Local IP Address. 
* Open a 5th terminal (PowerShell) and run: `ipconfig`
* Look for the **IPv4 Address** (e.g., `192.168.1.15`).
* Type `http://192.168.1.15:3000` into your phone's mobile browser to test the web view, and make sure your Expo app's `API_URL` uses that same IP!

Let me know once you've fired everything up and tested the live bidding and chat. Are you ready to move into Phase 4 to secure those WebSockets with your JWTs?

docker start campusbay-redis for now on 