package handlers

import (
	"campusbay-backend/internal/repository"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type TopUpRequest struct {
	Amount float64 `json:"amount"`
}

func GetWallet(c *gin.Context) {
	userIDValue, _ := c.Get("user_id")
	userID := userIDValue.(uuid.UUID).String()

	balance, locked, err := repository.GetWalletBalance(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Wallet not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id":       userID, // <-- Added this so the Chat knows who you are!
		"total_balance": balance,
		"locked_funds":  locked,
		"available":     balance - locked,
	})
}

func TopUpWallet(c *gin.Context) {
	userIDValue, _ := c.Get("user_id")
	userID := userIDValue.(uuid.UUID).String()

	var req TopUpRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
		return
	}

	// Add money to the wallet
	query := "UPDATE wallets SET balance = balance + $1 WHERE user_id = $2"
	_, err := repository.DB.Exec(c.Request.Context(), query, req.Amount, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to top up"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Topped up successfully!"})
}
