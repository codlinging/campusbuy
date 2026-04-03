package handlers

import (
	"net/http"

	"campusbay-backend/internal/repository" // Adjust module name if needed

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// requireAdmin checks the DB to ensure the user is an admin before proceeding
func requireAdmin(c *gin.Context) bool {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return false
	}
	userID := userIDValue.(uuid.UUID).String()

	var role string
	err := repository.DB.QueryRow(c.Request.Context(), "SELECT role FROM users WHERE id = $1", userID).Scan(&role)
	if err != nil || role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return false
	}
	return true
}

// GetMarketplaceStats returns high-level metrics for the dashboard
func GetMarketplaceStats(c *gin.Context) {
	if !requireAdmin(c) {
		return
	}

	var totalUsers, activeListings int
	var totalBidVolume float64

	ctx := c.Request.Context()
	repository.DB.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&totalUsers)
	repository.DB.QueryRow(ctx, "SELECT COUNT(*) FROM listings WHERE status = 'active'").Scan(&activeListings)
	repository.DB.QueryRow(ctx, "SELECT COALESCE(SUM(amount), 0) FROM bids").Scan(&totalBidVolume)

	c.JSON(http.StatusOK, gin.H{
		"total_users":      totalUsers,
		"active_listings":  activeListings,
		"total_bid_volume": totalBidVolume,
	})
}

// GetAllUsers returns a list of users for moderation
func GetAllUsers(c *gin.Context) {
	if !requireAdmin(c) {
		return
	}

	// Assuming your users table has an 'email' or 'name' column.
	// Adjust 'email' below if your table uses a different column name for their identity!
	rows, err := repository.DB.Query(c.Request.Context(), "SELECT id, email, role, created_at FROM users ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	defer rows.Close()

	var users []map[string]interface{}
	for rows.Next() {
		var id, email, role, createdAt string
		if err := rows.Scan(&id, &email, &role, &createdAt); err == nil {
			users = append(users, map[string]interface{}{
				"id": id, "email": email, "role": role, "created_at": createdAt,
			})
		}
	}
	if users == nil {
		users = []map[string]interface{}{}
	}
	c.JSON(http.StatusOK, users)
}

// AdminDeleteUser forcefully removes a user and cascades to their listings/bids
func AdminDeleteUser(c *gin.Context) {
	if !requireAdmin(c) {
		return
	}
	targetUserID := c.Param("id")

	// Because we set up ON DELETE CASCADE in Phase 1, deleting the user
	// automatically deletes their wallet, bids, listings, and messages!
	_, err := repository.DB.Exec(c.Request.Context(), "DELETE FROM users WHERE id = $1", targetUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User permanently banned"})
}

// AdminDeleteListing forcefully removes any listing bypassing the seller_id check
func AdminDeleteListing(c *gin.Context) {
	if !requireAdmin(c) {
		return
	}
	listingID := c.Param("id")

	_, err := repository.DB.Exec(c.Request.Context(), "DELETE FROM listings WHERE id = $1", listingID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete listing"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Listing removed by admin"})
}
