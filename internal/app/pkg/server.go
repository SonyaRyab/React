package app

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (a *Application) StartServer() {
	log.Println("Server start up")

	r := gin.Default()

	r.GET("/ping/:name", a.Ping)

	auth := r.Group("/auth")
	{
		auth.POST("/login", a.Login)
		auth.POST("/register", a.Register)
		auth.POST("/logout", a.WithSessionAuth(), a.Logout)
	}

	api := r.Group("/")
	{
		api.GET("/reagents", a.GetReagentsPublic)
	}

	user := r.Group("/")
	user.Use(a.WithSessionAuth())
	{
		user.GET("/methanes", a.GetMethanes)
		user.POST("/methanes/draft", a.CreateDraftMethane)
		user.GET("/methanes/draft", a.GetDraftMethane)
	}

	moderator := r.Group("/")
	moderator.Use(a.WithSessionAuth())
	{
		moderator.PUT("/methanes/:id/complete", a.RequireModerator(), a.CompleteMethane)
	}

	addr := ":8080"
	if err := r.Run(addr); err != nil {
		log.Println(err)
	}

	log.Println("Server down")
}

type pingResp struct {
	Status string `json:"status"`
}

func (a *Application) Ping(gCtx *gin.Context) {
	name := gCtx.Param("name")
	gCtx.String(http.StatusOK, "Hello %s", name)
}
