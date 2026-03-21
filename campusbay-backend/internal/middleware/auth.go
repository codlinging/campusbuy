package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Ensure this matches the key in pkg/utils/jwt.go
var jwtKey = []byte("super_secret_campusbay_key_change_me_in_prod")

type Claims struct {
	UserID uuid.UUID `json:"user_id"`
	jwt.RegisteredClaims
}

func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Get the JWT from the HttpOnly cookie
		tokenString, err := c.Cookie("campusbay_jwt")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: No token provided"})
			return
		}

		// 2. Parse and validate the token
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Invalid or expired token"})
			return
		}

		// 3. Attach the user_id to the context for the next handlers to use
		c.Set("user_id", claims.UserID)
		c.Next()
	}
}
