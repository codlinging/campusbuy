package repository

import (
	"context"
)

// Define the data structures for the profile dashboard
type ProfileListing struct {
	ID           string  `json:"id"`
	Title        string  `json:"title"`
	CurrentPrice float64 `json:"current_price"`
	ImageURL     string  `json:"image_url"`
	Status       string  `json:"status"`
}

type ProfileBid struct {
	ListingID    string  `json:"listing_id"`
	Title        string  `json:"title"`
	MyBidAmount  float64 `json:"my_bid_amount"`
	CurrentPrice float64 `json:"current_price"`
	ImageURL     string  `json:"image_url"`
}

func GetUserProfileData(ctx context.Context, userID string) ([]ProfileListing, []ProfileBid, error) {
	var listings []ProfileListing
	var bids []ProfileBid

	// 1. Fetch items the user is selling
	listingQuery := `SELECT id, title, current_price, image_url, status FROM listings WHERE seller_id = $1 ORDER BY created_at DESC`
	rows, err := DB.Query(ctx, listingQuery, userID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var l ProfileListing
			if err := rows.Scan(&l.ID, &l.Title, &l.CurrentPrice, &l.ImageURL, &l.Status); err == nil {
				listings = append(listings, l)
			}
		}
	}

	// 2. Fetch the user's highest bids on active items
	// We use MAX(b.amount) in case they bid multiple times on the same item
	bidQuery := `
		SELECT b.listing_id, l.title, MAX(b.amount) as my_bid, l.current_price, l.image_url 
		FROM bids b 
		JOIN listings l ON b.listing_id = l.id 
		WHERE b.bidder_id = $1 
		GROUP BY b.listing_id, l.title, l.current_price, l.image_url
	`
	bidRows, err := DB.Query(ctx, bidQuery, userID)
	if err == nil {
		defer bidRows.Close()
		for bidRows.Next() {
			var b ProfileBid
			if err := bidRows.Scan(&b.ListingID, &b.Title, &b.MyBidAmount, &b.CurrentPrice, &b.ImageURL); err == nil {
				bids = append(bids, b)
			}
		}
	}

	// If slices are nil, initialize them to empty arrays so JSON doesn't return null
	if listings == nil {
		listings = []ProfileListing{}
	}
	if bids == nil {
		bids = []ProfileBid{}
	}

	return listings, bids, nil
}
