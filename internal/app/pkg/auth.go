package app

import (
	"encoding/json"
	"errors"
	"strings"
	"net/http"
	"time"

	"lab4/internal/app/ds"
	red "lab4/internal/app/redis"
	"lab4/internal/app/role"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type loginReq struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

type registerReq struct {
	Login string `json:"login"`
	Username  string `json:"name"`
	Pass  string `json:"pass"`
}

type registerResp struct {
	Ok bool `json:"ok"`
}

func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash), err
}

func checkPassword(hash string, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

// Register godoc
// @Summary Регистрация пользователя
// @Description Создаёт нового пользователя-исследователя
// @Tags auth
// @Accept json
// @Produce json
// @Param input body registerReq true "Данные регистрации"
// @Success 200 {object} registerResp
// @Failure 400 {object} map[string]interface{}
// @Failure 409 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /auth/register [post]
func (a *Application) Register(gCtx *gin.Context) {
	req := &registerReq{}

	if err := json.NewDecoder(gCtx.Request.Body).Decode(req); err != nil {
		gCtx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
		return
	}

	if req.Login == "" || req.Username == "" || req.Pass == "" {
		gCtx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "login, username, pass are required"})
		return
	}

	req.Login = strings.TrimSpace(req.Login)
	req.Username = strings.TrimSpace(req.Username)

	if req.Login == "" || req.Username == "" || req.Pass == "" {
		gCtx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "login, name, pass are required"})
		return
	}

	_, err := a.repo.GetUserByLogin(req.Login)
	if err == nil {
		gCtx.AbortWithStatusJSON(http.StatusConflict, gin.H{"error": "login already exists"})
		return
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		gCtx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "cannot check login uniqueness"})
		return
	}

	passHash, err := hashPassword(req.Pass)
	if err != nil {
		gCtx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "cannot hash password"})
		return
	}

	err = a.repo.Register(&ds.User{
		UUID:     uuid.New(),
		Login:    req.Login,
		Username:     req.Username,
		Role:     role.Researcher,
		PassHash: passHash,
	})

	if err != nil {
		gCtx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	gCtx.JSON(http.StatusOK, registerResp{Ok: true})
}

// Login godoc
// @Summary Вход пользователя
// @Description Создаёт серверную сессию в Redis и устанавливает cookie session_id
// @Tags auth
// @Accept json
// @Produce json
// @Param input body loginReq true "Данные входа"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /auth/login [post]
func (a *Application) Login(gCtx *gin.Context) {
	req := &loginReq{}

	if err := json.NewDecoder(gCtx.Request.Body).Decode(req); err != nil {
		gCtx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
		return
	}

	req.Login = strings.TrimSpace(req.Login)

	if req.Login == "" || req.Password == "" {
		gCtx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "login and password are required"})
		return
	}

	user, err := a.repo.GetUserByLogin(req.Login)
	if err != nil {
		gCtx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	if !checkPassword(user.PassHash, req.Password) {
		gCtx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	sessionID := uuid.NewString()
	ttl := 24 * time.Hour

	sess := &red.Session{
		UserID: user.ID,
		Login:  user.Login,
		Role:   user.Role,
		ExpAt:  time.Now().Add(ttl),
	}

	if err := a.redis.SaveSession(gCtx.Request.Context(), sessionID, sess, ttl); err != nil {
		gCtx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "cannot save session"})
		return
	}

	http.SetCookie(gCtx.Writer, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(ttl.Seconds()),
	})

	gCtx.JSON(http.StatusOK, gin.H{
		"ok":    true,
		"login": user.Login,
		"role":  user.Role,
	})
}

// Logout godoc
// @Summary Выход пользователя
// @Description Удаляет серверную сессию из Redis и очищает cookie
// @Tags auth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Security SessionCookieAuth
// @Router /auth/logout [post]

func (a *Application) Logout(gCtx *gin.Context) {
	sessionID, err := gCtx.Cookie("session_id")
	if err != nil {
		gCtx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no session"})
		return
	}

	if err := a.redis.DeleteSession(gCtx.Request.Context(), sessionID); err != nil {
		gCtx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "cannot delete session"})
		return
	}

	http.SetCookie(gCtx.Writer, &http.Cookie{
		Name:     "session_id",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	})

	gCtx.JSON(http.StatusOK, gin.H{"ok": true})
}
