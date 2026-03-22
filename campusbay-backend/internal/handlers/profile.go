package handlers

import (
	"net/http"

	"campusbay-backend/internal/repository" // Adjust your module name if needed

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetProfile(c *gin.Context) {
	// Get the securely verified User ID from the JWT middleware
	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDValue.(uuid.UUID).String()

	// Fetch data from the repository
	listings, bids, err := repository.GetUserProfileData(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load profile data"})
		return
	}

	// Send it all back in one neat JSON package
	c.JSON(http.StatusOK, gin.H{
		"my_listings": listings,
		"my_bids":     bids,
	})
}
