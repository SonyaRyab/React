// package handler

// import (
// 	"net/http"
// 	"strconv"

// 	"lab4/internal/app/ds"

// 	"github.com/gin-gonic/gin"
// )

// func (h *Handler) RegisterUserAPI(ctx *gin.Context) {
// 	var input struct {
// 		Username string `json:"username" binding:"required"`
// 		Login    string `json:"login" binding:"required"`
// 		Password string `json:"password" binding:"required"`
// 	}

// 	if err := ctx.BindJSON(&input); err != nil {
// 		h.errorHandler(ctx, http.StatusBadRequest, err)
// 		return
// 	}

// 	user := ds.User{
// 		Username:    input.Username,
// 		Login:       input.Login,
// 		Password:    input.Password,
// 		IsModerator: false,
// 	}

// 	if err := h.Repository.CreateUser(&user); err != nil {
// 		h.errorHandler(ctx, http.StatusInternalServerError, err)
// 		return
// 	}

// 	ctx.JSON(http.StatusCreated, gin.H{
// 		"status":  "success",
// 		"data":    gin.H{"id": user.ID, "login": user.Login},
// 		"message": "пользователь зарегистрирован",
// 	})
// }

// func (h *Handler) GetUserMethanesAPI(ctx *gin.Context) {
// 	strId := ctx.Param("id")
// 	id, err := strconv.Atoi(strId)
// 	if err != nil {
// 		h.errorHandler(ctx, http.StatusInternalServerError, err)
// 		return
// 	}

// 	userMethanes, err := h.Repository.GetUserMethanes(id)
// 	if err != nil {
// 		h.errorHandler(ctx, http.StatusInternalServerError, err)
// 		return
// 	}

// 	ctx.JSON(http.StatusOK, gin.H{
// 		"status": "success",
// 		"data":   userMethanes,
// 	})
// }
