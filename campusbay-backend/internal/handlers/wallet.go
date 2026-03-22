package handlers

import (
	"net/http"

	"campusbay-backend/internal/repository" // Adjust to your actual module name if different

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetWallet(c *gin.Context) {
	// 1. Get the securely verified User ID from the JWT middleware
	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDValue.(uuid.UUID).String()

	// 2. Fetch the balances from PostgreSQL
	balance, locked, err := repository.GetWalletBalance(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Wallet not found"})
		return
	}

	// 3. Send the math back to the frontend
	c.JSON(http.StatusOK, gin.H{
		"total_balance": balance,
		"locked_funds":  locked,
		"available":     balance - locked,
	})
}
