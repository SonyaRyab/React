package main

import (
	"context"
	"log"
	app "lab4/internal/app/pkg"
	"os"
)

// @title BITOP
// @version 1.0
// @description Bmstu Open IT Platform

// @contact.name API Support
// @contact.url https://vk.com/bmstu_schedule
// @contact.email bitop@spatecon.ru

// @license.name AS IS (NO WARRANTY)

// @host localhost:8080
// @schemes http
// @BasePath /

// @securityDefinitions.apikey SessionCookieAuth
// @in cookie
// @name session_id

func main() {
	log.Println("Initializing server")
	application, err := app.New(context.Background())
	if err != nil {
		log.Println("cant create application")
		os.Exit(2)
	}

	log.Println("Application start!")
	if err := application.Run(); err != nil {
		log.Println("application error:", err)
		os.Exit(1)
	}
	log.Println("Application terminated!")
}
