package handler

import (
	"lab3/internal/app/repository"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type Handler struct {
	Repository *repository.Repository
}

func NewHandler(r *repository.Repository) *Handler {
	return &Handler{
		Repository: r,
	}
}

func (h *Handler) RegisterHandler(router *gin.Engine) {
	router.GET("/methanes", h.GetMethanesAPI)
	router.GET("/methanes/:id", h.GetMethaneByIdAPI)
	router.POST("/methanes", h.AddMethaneAPI)
	router.PUT("/methanes/:id", h.ModifyMethaneAPI)
	router.DELETE("/methanes/:id", h.DeleteMethaneAPI)
	router.POST("/users/:id", h.GetUserStocksAPI)
}

// RegisterStatic То же самое, что и с маршрутами, регистрируем статику
func (h *Handler) RegisterStatic(router *gin.Engine) {
	router.LoadHTMLGlob("templates/*")
	router.Static("/styles", "./resources/styles")
	router.Static("/img", "./resources/img")
}

func (h *Handler) errorHandler(ctx *gin.Context, errorStatusCode int, err error) {
	logrus.Error(err.Error())
	ctx.JSON(errorStatusCode, gin.H{
		"status":      "error",
		"description": err.Error(),
	})
}
