package models

import (
	"time"

	"github.com/google/uuid"
)

// University represents the allowed institutions
type University struct {
	ID        uuid.UUID `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Domain    string    `json:"domain" db:"domain"` // e.g., "nyu.edu"
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// User represents a student in the system
type User struct {
	ID           uuid.UUID `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"` // "-" prevents hash from leaking in JSON responses
	UniversityID uuid.UUID `json:"university_id" db:"university_id"`
	FirstName    string    `json:"first_name" db:"first_name"`
	LastName     string    `json:"last_name" db:"last_name"`
	IsVerified   bool      `json:"is_verified" db:"is_verified"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}
