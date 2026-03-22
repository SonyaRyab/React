package app

import (
	"net/http"
	"lab4/internal/app/role"
	"github.com/gin-gonic/gin"
)

func (a *Application) WithSessionAuth(assignedRoles ...role.Role) gin.HandlerFunc {
	return func(gCtx *gin.Context) {
		sessionID, err := gCtx.Cookie("session_id")
		if err != nil || sessionID == "" {
			gCtx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		sess, err := a.redis.GetSession(gCtx.Request.Context(), sessionID)
		if err != nil {
			gCtx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		gCtx.Set("user_id", sess.UserID)
		gCtx.Set("user_login", sess.Login)
		gCtx.Set("user_role", sess.Role)

		if len(assignedRoles) == 0 {
			gCtx.Next()
			return
		}

		for _, assignedRole := range assignedRoles {
			if sess.Role == assignedRole {
				gCtx.Next()
				return
			}
		}

		gCtx.AbortWithStatus(http.StatusForbidden)
	}
}
