package repository

import (
	"context"
	"errors"
)

// PlaceBid handles the financial transaction of placing an auction bid
func PlaceBid(ctx context.Context, listingID string, userID string, amount float64) error {
	// 1. Begin SQL Transaction
	tx, err := DB.Begin(ctx)
	if err != nil {
		return err
	}
	// Defer a rollback in case anything fails before we hit Commit()
	defer tx.Rollback(ctx)

	// 2. Check the user's wallet balance
	var balance, lockedFunds float64
	err = tx.QueryRow(ctx, "SELECT balance, locked_funds FROM wallets WHERE user_id = $1", userID).Scan(&balance, &lockedFunds)
	if err != nil {
		return errors.New("wallet not found")
	}

	availableFunds := balance - lockedFunds
	if availableFunds < amount {
		return errors.New("insufficient available funds")
	}

	// 3. Lock the funds so they can't double-spend
	_, err = tx.Exec(ctx, "UPDATE wallets SET locked_funds = locked_funds + $1 WHERE user_id = $2", amount, userID)
	if err != nil {
		return err
	}

	// 4. Record the bid permanently in the ledger
	_, err = tx.Exec(ctx, "INSERT INTO bids (listing_id, bidder_id, amount) VALUES ($1, $2, $3)", listingID, userID, amount)
	if err != nil {
		return err
	}

	// 5. Update the listing's current price
	_, err = tx.Exec(ctx, "UPDATE listings SET current_price = $1 WHERE id = $2", amount, listingID)
	if err != nil {
		return err
	}

	// 6. Commit the transaction (save all changes)
	return tx.Commit(ctx)
}

// SaveChatMessage permanently records a chat message
func SaveChatMessage(ctx context.Context, listingID, senderID, receiverID, content string) error {
	query := `INSERT INTO messages (listing_id, sender_id, receiver_id, content) VALUES ($1, $2, $3, $4)`
	_, err := DB.Exec(ctx, query, listingID, senderID, receiverID, content)
	return err
}

// GetWalletBalance retrieves the user's financial state
func GetWalletBalance(ctx context.Context, userID string) (float64, float64, error) {
	var balance, locked float64
	query := "SELECT balance, locked_funds FROM wallets WHERE user_id = $1"

	err := DB.QueryRow(ctx, query, userID).Scan(&balance, &locked)
	return balance, locked, err
}
