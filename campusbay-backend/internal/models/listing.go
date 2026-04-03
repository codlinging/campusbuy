package models

import (
	"time"

	"github.com/google/uuid"
)

type Listing struct {
	ID            string    `json:"id"`
	SellerID      uuid.UUID `json:"seller_id"`
	SellerName    string    `json:"seller_name"` // <-- ADD THIS LINE
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	StartingPrice float64   `json:"starting_price"`
	CurrentPrice  float64   `json:"current_price"`
	Status        string    `json:"status"`
	ImageURL      string    `json:"image_url"`
	CreatedAt     time.Time `json:"created_at"`
	ExpiresAt     time.Time `json:"expires_at"`
}
