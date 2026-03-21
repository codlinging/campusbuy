package main

import (
	"log"
	"net/http"
	"time"

	"campusbay-backend/internal/repository"

	"campusbay-backend/internal/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize Database Connection
	// Replace "postgres" and "password" with your local DB credentials
	dbConnString := "postgres://postgres:meow@localhost:5432/campusbay?sslmode=disable"
	if err := repository.InitDB(dbConnString); err != nil {
		log.Fatalf("Could not initialize database: %v", err)
	}

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "CampusBay API is active"})
	})

	authRoutes := router.Group("/api/v1/auth")
	{
		authRoutes.POST("/register", handlers.RegisterUser)
		authRoutes.POST("/login", handlers.LoginUser) // Uncomment this
	}
	log.Println("Starting CampusBay backend on port 8080...")
	if err := router.Run(":8081"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
