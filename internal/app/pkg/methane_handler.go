package app

import (
	"net/http"
	"strconv"
	"errors"

	_ "lab4/internal/app/ds"
	"lab4/internal/app/role"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type completeMethaneReq struct {
	Status string `json:"status"`
}

// GetMethanes godoc
// @Summary Список заявок
// @Description Для исследователя возвращает только его заявки, для модератора и администратора — все
// @Tags methanes
// @Produce json
// @Success 200 {array} ds.Methane
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/methanes [get]

func (a *Application) GetMethanes(gCtx *gin.Context) {
	userIDAny, ok := gCtx.Get("user_id")
	if !ok {
		gCtx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userRoleAny, ok := gCtx.Get("user_role")
	if !ok {
		gCtx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID := userIDAny.(uint)
	userRole := userRoleAny.(role.Role)

	items, err := a.repo.GetMethanesForUser(userID, userRole)
	if err != nil {
		gCtx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	gCtx.JSON(http.StatusOK, items)
}

// CreateDraftMethane godoc
// @Summary Создать черновик заявки
// @Description Создаёт новую заявку и автоматически подставляет текущего пользователя как автора
// @Tags methanes
// @Produce json
// @Success 200 {object} ds.Methane
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/methanes/draft [post]
// @Security SessionCookieAuth

func (a *Application) CreateDraftMethane(gCtx *gin.Context) {
	userIDAny, ok := gCtx.Get("user_id")
	if !ok {
		gCtx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID := userIDAny.(uint)

	item, err := a.repo.CreateDraftMethane(userID)
	if err != nil {
		gCtx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	gCtx.JSON(http.StatusOK, item)
}

// GetDraftMethane godoc
// @Summary Получить черновик текущего пользователя
// @Tags methanes
// @Produce json
// @Success 200 {object} ds.Methane
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /api/methanes/draft [get]
// @Security SessionCookieAuth

func (a *Application) GetDraftMethane(gCtx *gin.Context) {
	userIDAny, ok := gCtx.Get("user_id")
	if !ok {
		gCtx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID := userIDAny.(uint)

	item, err := a.repo.GetDraftMethane(userID)
	if err != nil {
		gCtx.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	gCtx.JSON(http.StatusOK, item)
}

// FormMethane godoc
// @Summary Сформировать заявку
// @Description Только владелец заявки может перевести её из черновика в статус "сформирована"
// @Tags methanes
// @Accept json
// @Produce json
// @Param id path int true "ID заявки"
// @Param input body object true "Поля заявки для обновления"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/methanes/{id}/form [put]
// @Security SessionCookieAuth

func (a *Application) FormMethane(gCtx *gin.Context) {
	id64, err := strconv.ParseUint(gCtx.Param("id"), 10, 64)
	if err != nil {
		gCtx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	userIDAny, ok := gCtx.Get("user_id")
	if !ok {
		gCtx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID := userIDAny.(uint)

	var updates map[string]interface{}
	err = a.repo.FormMethaneByOwner(uint(id64), userID, updates)
	if err != nil {
		switch {
		case errors.Is(err, gorm.ErrRecordNotFound):
			gCtx.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "methane not found"})
		case err.Error() == "forbidden":
			gCtx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		case err.Error() == "only draft methane can be formed":
			gCtx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		default:
			gCtx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	gCtx.JSON(http.StatusOK, gin.H{"ok": true})
}

// CompleteMethane godoc
// @Summary Завершить или отклонить заявку
// @Description Только модератор или администратор может завершить сформированную заявку
// @Tags methanes
// @Accept json
// @Produce json
// @Param id path int true "ID заявки"
// @Param input body completeMethaneReq true "Статус завершения"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/methanes/{id}/complete [put]
// @Security SessionCookieAuth

func (a *Application) CompleteMethane(gCtx *gin.Context) {
	id64, err := strconv.ParseUint(gCtx.Param("id"), 10, 64)
	if err != nil {
		gCtx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	userIDAny, ok := gCtx.Get("user_id")
	if !ok {
		gCtx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	moderatorID := userIDAny.(uint)

	var req completeMethaneReq
	if err := gCtx.ShouldBindJSON(&req); err != nil {
		gCtx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
		return
	}

	err = a.repo.CompleteMethane(uint(id64), moderatorID, req.Status)
	if err != nil {
		switch {
		case errors.Is(err, gorm.ErrRecordNotFound):
			gCtx.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "methane not found"})
		case err.Error() == "invalid completion status":
			gCtx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case err.Error() == "only formed methane can be completed":
			gCtx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		default:
			gCtx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	gCtx.JSON(http.StatusOK, gin.H{"ok": true})
}
