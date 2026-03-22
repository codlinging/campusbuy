package handlers

import (
	"encoding/json"
	"net/http"

	"campusbay-backend/internal/cache"
	"campusbay-backend/internal/middleware"
	"campusbay-backend/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
)

type ChatMessage struct {
	ListingID  string `json:"listing_id"`
	SenderID   string `json:"sender_id"`
	ReceiverID string `json:"receiver_id"`
	Content    string `json:"content"`
}

func ServeChatWS(c *gin.Context) {
	roomID := c.Param("room_id")

	// 1. SECURITY: Read the JWT Cookie
	tokenString, err := c.Cookie("campusbay_jwt")
	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	claims := &middleware.Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return middleware.JwtKey, nil
	})

	if err != nil || !token.Valid {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	realUserID := claims.UserID.String()

	// 2. Upgrade Connection
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	channelName := "chat:" + roomID
	pubsub := cache.RDB.Subscribe(cache.Ctx, channelName)
	defer pubsub.Close()

	// Listen for Redis broadcasts
	go func() {
		for msg := range pubsub.Channel() {
			conn.WriteMessage(websocket.TextMessage, []byte(msg.Payload))
		}
	}()

	// Listen for incoming messages
	for {
		_, payload, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var chatMsg ChatMessage
		if err := json.Unmarshal(payload, &chatMsg); err == nil {
			// OVERRIDE: Force the sender ID to be the real logged-in user
			chatMsg.SenderID = realUserID

			// Save to Postgres
			repository.SaveChatMessage(c.Request.Context(), chatMsg.ListingID, chatMsg.SenderID, chatMsg.ReceiverID, chatMsg.Content)

			// Broadcast
			msgJSON, _ := json.Marshal(chatMsg)
			cache.RDB.Publish(cache.Ctx, channelName, msgJSON)
		}
	}
}
