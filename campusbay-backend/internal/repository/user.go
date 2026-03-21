package repository

import (
	"campusbay-backend/internal/models"
	"context"
)

func CreateUser(ctx context.Context, user *models.User) error {
	query := `
		INSERT INTO users (email, password_hash, university_id, first_name, last_name, is_verified)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`

	err := DB.QueryRow(
		ctx,
		query,
		user.Email,
		user.PasswordHash,
		user.UniversityID,
		user.FirstName,
		user.LastName,
		user.IsVerified,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	return err
}
func GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	query := `
		SELECT id, email, password_hash, university_id, first_name, last_name, is_verified 
		FROM users 
		WHERE email = $1
	`

	err := DB.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.UniversityID,
		&user.FirstName,
		&user.LastName,
		&user.IsVerified,
	)

	return &user, err
}
