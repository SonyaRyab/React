package app

import (
	"net/http"
	"strconv"

	"lab4/internal/app/role"

	"github.com/gin-gonic/gin"
)

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

func (a *Application) FormMethane(gCtx *gin.Context) {
	id64, err := strconv.ParseUint(gCtx.Param("id"), 10, 64)
	if err != nil {
		gCtx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var updates map[string]interface{}
	if err := gCtx.ShouldBindJSON(&updates); err != nil {
		gCtx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
		return
	}

	if err := a.repo.FormMethane(uint(id64), updates); err != nil {
		gCtx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	gCtx.JSON(http.StatusOK, gin.H{"ok": true})
}

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

	var req struct {
		Status string `json:"status"`
	}

	if err := gCtx.ShouldBindJSON(&req); err != nil {
		gCtx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
		return
	}

	if err := a.repo.CompleteMethane(uint(id64), moderatorID, req.Status); err != nil {
		gCtx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	gCtx.JSON(http.StatusOK, gin.H{"ok": true})
}
