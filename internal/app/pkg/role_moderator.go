package app

import (
	"net/http"
	"lab4/internal/app/role"
	"github.com/gin-gonic/gin"
)

func (a *Application) RequireModerator() gin.HandlerFunc {
	return func(gCtx *gin.Context) {
		roleAny, exists := gCtx.Get("user_role")
		if !exists {
			gCtx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		currentRole := roleAny.(role.Role)
		if currentRole != role.Manager && currentRole != role.Admin {
			gCtx.AbortWithStatus(http.StatusForbidden)
			return
		}

		gCtx.Next()
	}
}
