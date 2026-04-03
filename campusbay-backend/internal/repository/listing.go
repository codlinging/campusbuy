package repository

import (
	"campusbay-backend/internal/models"
	"context"
)

// CreateListing inserts a new item into the database
func CreateListing(ctx context.Context, listing *models.Listing) error {
	query := `
		INSERT INTO listings (seller_id, title, description, starting_price, current_price, image_url, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, status, created_at
	`

	err := DB.QueryRow(
		ctx,
		query,
		listing.SellerID,

		listing.Title,
		listing.Description,
		listing.StartingPrice,
		listing.CurrentPrice,
		listing.ImageURL,
		listing.ExpiresAt,
	).Scan(&listing.ID, &listing.Status, &listing.CreatedAt)

	return err
}

// GetListingByID fetches a single item for the auction page
// Replace your existing GetListingByID with this:
func GetListingByID(ctx context.Context, id string) (*models.Listing, error) {
	var l models.Listing
	// We use a JOIN here to grab the seller's first and last name from the users table!
	query := `
		SELECT l.id, l.seller_id, u.first_name || ' ' || u.last_name as seller_name, 
		       l.title, l.description, l.starting_price, l.current_price, 
		       l.status, l.image_url, l.created_at, l.expires_at 
		FROM listings l
		JOIN users u ON l.seller_id = u.id
		WHERE l.id = $1
	`

	err := DB.QueryRow(ctx, query, id).Scan(
		&l.ID, &l.SellerID, &l.SellerName, &l.Title, &l.Description,
		&l.StartingPrice, &l.CurrentPrice, &l.Status,
		&l.ImageURL, &l.CreatedAt, &l.ExpiresAt,
	)

	return &l, err
}

// GetAllActiveListings fetches items for the dashboard
func GetAllActiveListings(ctx context.Context) ([]models.Listing, error) {
	query := `
		SELECT id, seller_id, title, description, starting_price, current_price, status, image_url, created_at, expires_at 
		FROM listings 
		WHERE status = 'active'
		ORDER BY created_at DESC
	`

	rows, err := DB.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var listings []models.Listing
	for rows.Next() {
		var l models.Listing
		err := rows.Scan(
			&l.ID, &l.SellerID, &l.Title, &l.Description,
			&l.StartingPrice, &l.CurrentPrice, &l.Status,
			&l.ImageURL, &l.CreatedAt, &l.ExpiresAt,
		)
		if err != nil {
			return nil, err
		}
		listings = append(listings, l)
	}

	return listings, nil
}
