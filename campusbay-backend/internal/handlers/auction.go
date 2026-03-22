package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"campusbay-backend/internal/cache"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// Configure the Upgrader to allow connections from your Next.js frontend
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		return origin == "http://localhost:3000"
	},
}

// BidMessage defines the structure of the JSON payload sent over the WebSocket
type BidMessage struct {
	ListingID string  `json:"listing_id"`
	UserID    string  `json:"user_id"` // In production, pull this securely from the JWT context
	Amount    float64 `json:"amount"`
}

func ServeAuctionWS(c *gin.Context) {
	listingID := c.Param("id")

	// 1. Upgrade the HTTP connection to a WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v\n", err)
		return
	}
	defer conn.Close()

	log.Printf("Client connected to auction: %s\n", listingID)

	// 2. Subscribe this specific connection to the Redis Pub/Sub channel for this listing
	channelName := "auction:" + listingID
	pubsub := cache.RDB.Subscribe(cache.Ctx, channelName)
	defer pubsub.Close()

	// 3. Goroutine to listen for messages from Redis and push them to the frontend
	go func() {
		ch := pubsub.Channel()
		for msg := range ch {
			// When Redis broadcasts a new bid, send it down the WebSocket to the browser
			if err := conn.WriteMessage(websocket.TextMessage, []byte(msg.Payload)); err != nil {
				log.Println("Error writing to websocket:", err)
				break
			}
		}
	}()

	// 4. Main loop to listen for incoming bids from this specific user
	for {
		_, payload, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v\n", err)
			}
			break
		}

		var bid BidMessage
		if err := json.Unmarshal(payload, &bid); err != nil {
			log.Printf("Invalid bid payload: %v\n", err)
			continue
		}

		// TODO: Here is where we will add the logic to validate the bid amount
		// against PostgreSQL and the current highest bid cached in Redis.

		// For now, if valid, broadcast the new bid to ALL users via Redis Pub/Sub
		bidJSON, _ := json.Marshal(bid)
		cache.RDB.Publish(cache.Ctx, channelName, bidJSON)
	}
}
