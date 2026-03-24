package app

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetReagentsPublic godoc
// @Summary Список реагентов
// @Description Публичный метод чтения данных
// @Tags reagents
// @Produce json
// @Param search query string false "Поиск"
// @Success 200 {array} ds.Reagent
// @Failure 500 {object} map[string]interface{}
// @Router /api/reagents [get]
func (a *Application) GetReagentsPublic(gCtx *gin.Context) {
	search := gCtx.Query("search")

	items, err := a.repo.GetReagents(search)
	if err != nil {
		gCtx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	gCtx.JSON(http.StatusOK, items)
}
