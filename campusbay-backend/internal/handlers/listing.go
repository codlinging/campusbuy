package handlers

import (
	"fmt"
	"html"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"campusbay-backend/internal/models"
	"campusbay-backend/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateListing(c *gin.Context) {
	// 1. Get user ID from middleware
	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	sellerID := userIDValue.(uuid.UUID)

	// 2. Parse the Multipart Form Data (instead of JSON)
	title := c.PostForm("title")
	description := c.PostForm("description")
	startingPriceStr := c.PostForm("starting_price")
	durationHoursStr := c.PostForm("duration_hours")

	// Convert strings back to numbers
	startingPrice, _ := strconv.ParseFloat(startingPriceStr, 64)
	durationHours, _ := strconv.Atoi(durationHoursStr)

	if title == "" || description == "" || startingPrice <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing or invalid text fields"})
		return
	}

	// 3. Handle the Image File
	var finalImageURL string
	file, err := c.FormFile("image")
	if err == nil {
		// A file was uploaded! Generate a secure, unique filename to prevent overwrites
		ext := filepath.Ext(file.Filename)
		newFileName := uuid.New().String() + ext
		savePath := filepath.Join("uploads", newFileName)

		// Save the file to our local directory
		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}

		// Create the URL that the frontend will use to display it
		// If your Go port is 8081, this matches perfectly
		finalImageURL = fmt.Sprintf("http://localhost:8081/%s", savePath)
	}

	// 4. Construct the Listing
	expiresAt := time.Now().Add(time.Duration(durationHours) * time.Hour)

	listing := models.Listing{
		SellerID:      sellerID,
		Title:         html.EscapeString(title),
		Description:   html.EscapeString(description),
		StartingPrice: startingPrice,
		CurrentPrice:  startingPrice,
		ImageURL:      finalImageURL, // Now passing the real local URL!
		ExpiresAt:     expiresAt,
	}

	// 5. Save to Postgres
	if err := repository.CreateListing(c.Request.Context(), &listing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create listing"})
		return
	}

	// 6. Push to Meilisearch

	c.JSON(http.StatusCreated, gin.H{
		"message": "Listing created successfully",
		"listing": listing,
	})
}

func GetListings(c *gin.Context) {
	listings, err := repository.GetAllActiveListings(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch listings"})
		return
	}

	// If there are no listings, return an empty array instead of null
	if listings == nil {
		listings = []models.Listing{}
	}

	c.JSON(http.StatusOK, listings)
}
