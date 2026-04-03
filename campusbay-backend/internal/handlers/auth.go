package handlers

import (
	"html"
	"net/http"
	"strings"

	"campusbay-backend/internal/models"
	"campusbay-backend/internal/repository"
	"campusbay-backend/pkg/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
}
type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func RegisterUser(c *gin.Context) {
	var input RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format or missing fields"})
		return
	}

	parts := strings.Split(input.Email, "@")
	if len(parts) != 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email structure"})
		return
	}
	domain := parts[1]

	if !strings.HasSuffix(domain, ".edu") {
		c.JSON(http.StatusForbidden, gin.H{"error": "CampusBay is restricted to verified .edu email addresses"})
		return
	}

	// Query DB for the university
	university, err := repository.GetUniversityByDomain(c.Request.Context(), domain)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Your university is not currently supported by CampusBay"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process security credentials"})
		return
	}

	// Construct User object, sanitizing HTML inputs to prevent XSS
	user := models.User{
		Email:        strings.ToLower(input.Email),
		PasswordHash: string(hashedPassword),
		FirstName:    html.EscapeString(input.FirstName),
		LastName:     html.EscapeString(input.LastName),
		UniversityID: university.ID,
		IsVerified:   false,
	}

	// Save to DB
	if err := repository.CreateUser(c.Request.Context(), &user); err != nil {
		// Basic error handling for duplicate emails
		if strings.Contains(err.Error(), "duplicate key value") {
			c.JSON(http.StatusConflict, gin.H{"error": "A user with this email already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user account"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Registration successful. Please check your university email to verify your account.",
	})
}
func LoginUser(c *gin.Context) {
	var input LoginInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format"})
		return
	}

	user, err := repository.GetUserByEmail(c.Request.Context(), strings.ToLower(input.Email))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate authentication token"})
		return
	}

	// Set JWT as an HttpOnly cookie
	// Params: name, value, maxAge (seconds), path, domain, secure, httpOnly
	// Note: Set 'secure' to true in production when using HTTPS
	c.SetCookie("campusbay_jwt", token, 86400, "/", "localhost", false, true)

	// NEW: Fetch the user's role directly from the database
	var role string
	err = repository.DB.QueryRow(c.Request.Context(), "SELECT role FROM users WHERE id = $1", user.ID).Scan(&role)
	if err != nil {
		role = "user" // Default fallback
	}

	// Send the role back to the React frontend!
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user": gin.H{
			"id":         user.ID,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
			"role":       role, // <-- Added this line!
		},
	})
}
func LogoutUser(c *gin.Context) {
	// Overwrite the cookie with a blank value and set MaxAge to -1 to delete it
	c.SetCookie("campusbay_jwt", "", -1, "/", "localhost", false, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out successfully",
	})
}
