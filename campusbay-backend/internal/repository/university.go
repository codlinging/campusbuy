package repository

import (
	"campusbay-backend/internal/models"
	"context"
)

func GetUniversityByDomain(ctx context.Context, domain string) (*models.University, error) {
	var uni models.University
	query := `SELECT id, name, domain, created_at FROM universities WHERE domain = $1`

	err := DB.QueryRow(ctx, query, domain).Scan(&uni.ID, &uni.Name, &uni.Domain, &uni.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &uni, nil
}
