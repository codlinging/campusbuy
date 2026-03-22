package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"campusbay-backend/internal/cache"
	"campusbay-backend/internal/middleware"
	"campusbay-backend/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
)

// Updated to allow connections from your Phone (Expo) and Laptop (Next.js)
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for local testing
	},
}

type BidMessage struct {
	ListingID string  `json:"listing_id"`
	UserID    string  `json:"user_id"`
	Amount    float64 `json:"amount"`
}

func ServeAuctionWS(c *gin.Context) {
	listingID := c.Param("id")

	// 1. SECURITY: Read the JWT Cookie before upgrading the connection
	tokenString, err := c.Cookie("campusbay_jwt")
	if err != nil {
		log.Println("WS Connection rejected: No JWT cookie")
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	// 2. Parse the JWT to get the verified User ID
	claims := &middleware.Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return middleware.JwtKey, nil
	})

	if err != nil || !token.Valid {
		log.Println("WS Connection rejected: Invalid JWT")
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	realUserID := claims.UserID.String()

	// 3. Upgrade to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v\n", err)
		return
	}
	defer conn.Close()

	channelName := "auction:" + listingID
	pubsub := cache.RDB.Subscribe(cache.Ctx, channelName)
	defer pubsub.Close()

	// Listen for Redis broadcasts
	go func() {
		for msg := range pubsub.Channel() {
			conn.WriteMessage(websocket.TextMessage, []byte(msg.Payload))
		}
	}()

	// Listen for incoming bids
	for {
		_, payload, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var bid BidMessage
		if err := json.Unmarshal(payload, &bid); err != nil {
			continue
		}

		// SECURITY OVERRIDE: Ignore frontend ID, use the verified JWT ID
		bid.UserID = realUserID

		// 4. Execute the Financial Transaction
		if err := repository.PlaceBid(c.Request.Context(), listingID, realUserID, bid.Amount); err != nil {
			log.Printf("Bid rejected for user %s: %v\n", realUserID, err)

			// Optional: Send an error message back to the user
			errorMsg, _ := json.Marshal(map[string]string{"error": err.Error()})
			conn.WriteMessage(websocket.TextMessage, errorMsg)
			continue // Stop processing this bid
		}

		// 5. If successful, broadcast the new bid to ALL connected users
		bidJSON, _ := json.Marshal(bid)
		cache.RDB.Publish(cache.Ctx, channelName, bidJSON)
	}
}
