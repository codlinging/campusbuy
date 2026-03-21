package models

import (
	"time"

	"github.com/google/uuid"
)

type Listing struct {
	ID            uuid.UUID `json:"id" db:"id"`
	SellerID      uuid.UUID `json:"seller_id" db:"seller_id"`
	Title         string    `json:"title" db:"title"`
	Description   string    `json:"description" db:"description"`
	StartingPrice float64   `json:"starting_price" db:"starting_price"`
	CurrentPrice  float64   `json:"current_price" db:"current_price"`
	Status        string    `json:"status" db:"status"`
	ImageURL      string    `json:"image_url" db:"image_url"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	ExpiresAt     time.Time `json:"expires_at" db:"expires_at"`
}
