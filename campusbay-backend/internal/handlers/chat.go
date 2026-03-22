package handlers

import (
	"encoding/json"
	"log"

	"campusbay-backend/internal/cache"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type ChatMessage struct {
	ListingID  string `json:"listing_id"`
	SenderID   string `json:"sender_id"`
	ReceiverID string `json:"receiver_id"`
	Content    string `json:"content"`
}

func ServeChatWS(c *gin.Context) {
	// A unique room for this specific conversation (e.g., listing_123_buyer_456)
	roomID := c.Param("room_id")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Chat upgrade failed:", err)
		return
	}
	defer conn.Close()

	// Subscribe to this specific chat room via Redis Pub/Sub
	channelName := "chat:" + roomID
	pubsub := cache.RDB.Subscribe(cache.Ctx, channelName)
	defer pubsub.Close()

	// Listen for incoming messages from Redis and send to the frontend UI
	go func() {
		for msg := range pubsub.Channel() {
			conn.WriteMessage(websocket.TextMessage, []byte(msg.Payload))
		}
	}()

	// Listen for new messages typed by the user
	for {
		_, payload, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var chatMsg ChatMessage
		if err := json.Unmarshal(payload, &chatMsg); err == nil {
			// TODO: Save chatMsg to PostgreSQL `messages` table here!

			// Broadcast the message to the other person in the room instantly
			msgJSON, _ := json.Marshal(chatMsg)
			cache.RDB.Publish(cache.Ctx, channelName, msgJSON)
		}
	}
}
