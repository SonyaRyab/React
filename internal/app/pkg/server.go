package app

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	_ "lab4/docs"
)

func (a *Application) StartServer() {
	log.Println("Server start up")

	r := gin.Default()

	r.GET("/ping/:name", a.Ping)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	auth := r.Group("/auth")
	{
		auth.POST("/login", a.Login)
		auth.POST("/register", a.Register)
		auth.POST("/logout", a.WithSessionAuth(), a.Logout)
	}

	api := r.Group("/api")
	{
		api.GET("/reagents", a.GetReagentsPublic)
	}

	user := r.Group("/api")
	user.Use(a.WithSessionAuth())
	{
		user.GET("/methanes", a.GetMethanes)
		user.POST("/methanes/draft", a.CreateDraftMethane)
		user.GET("/methanes/draft", a.GetDraftMethane)
		user.PUT("/methanes/:id/form", a.FormMethane)
	}

	moderator := r.Group("/api")
	moderator.Use(a.WithSessionAuth())
	{
		moderator.PUT("/methanes/:id/complete", a.RequireModerator(), a.CompleteMethane)
	}

	addr := a.config.ServiceHost + ":" + strconv.Itoa(a.config.ServicePort)
	if a.config.ServiceHost == "" {
		addr = ":8080"
	}

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
