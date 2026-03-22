package handler

import (
	"lab4/internal/app/repository"

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
	// Reagents (услуги)
	router.GET("/api/reagents", h.GetReagentsAPI)
	router.GET("/api/reagents/:id", h.GetReagentByIDAPI)
	router.POST("/api/reagents", h.AddReagentAPI)
	router.PUT("/api/reagents/:id", h.UpdateReagentAPI)
	router.DELETE("/api/reagents/:id", h.DeleteReagentAPI)

	// MethaneReagent (м-м связь)
	router.POST("/api/methanes/:id/reagents", h.AddReagentToMethaneAPI)
	router.PUT("/api/methanes/:id/reagents/:reagent_id", h.UpdateMethaneReagentAPI)
	router.DELETE("/api/methanes/:id/reagents/:reagent_id", h.RemoveReagentFromMethaneAPI)

	// Methane (заявки)
	router.GET("/api/methanes/cart", h.GetCartAPI)
	router.GET("/api/methanes", h.GetMethanesAPI)
	router.GET("/api/methanes/:id", h.GetMethaneByIdAPI)
	//router.POST("/api/methanes/:id", h.AddMethaneAPI)
	router.POST("/api/methanes", h.CreateDraftMethaneAPI)
	router.PUT("/api/methanes/:id", h.UpdateMethaneAPI)
	router.PUT("/api/methanes/:id/form", h.FormMethaneAPI)
	router.PUT("/api/methanes/:id/complete", h.CompleteMethaneAPI)
	router.DELETE("/api/methanes/:id", h.DeleteMethaneAPI)

	// Users
	router.POST("/api/users/register", h.RegisterUserAPI)
	router.POST("/login", a.Login) // там где мы ранее уже заводили эндпоинты
	router.Use(a.WithAuthCheck).GET("/ping", a.Ping)
	router.Use(a.WithAuthCheck(role.Manager, role.Admin)).GET("/ping", a.Ping)
	router.POST("/sign_up", a.Register)
	router.GET("/api/users/:id/methanes", h.GetUserMethanesAPI)
}

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

type loginReq struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

type loginResp struct {
	ExpiresIn   time.Duration `json:"expires_in"`
	AccessToken string        `json:"access_token"`
	TokenType   string        `json:"token_type"`
}

func (a *Application) Login(gCtx *gin.Context) {
	cfg := a.config
	req := &loginReq{}

	err := json.NewDecoder(gCtx.Request.Body).Decode(req)
	if err != nil {
		gCtx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if req.Login == login && req.Password == password {
		// значит проверка пройдена
		// генерируем ему jwt
		token := jwt.NewWithClaims(cfg.JWT.SigningMethod, &ds.JWTClaims{
			StandardClaims: jwt.StandardClaims{
				ExpiresAt: time.Now().Add(cfg.JWT.ExpiresIn).Unix(),
				IssuedAt:  time.Now().Unix(),
				Issuer:    "bitop-admin",
			},
			UserUUID: uuid.New(), // test uuid
			Scopes:   []string{}, // test data
		})

		if token == nil {
			gCtx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("token is nil"))
			return
		}

		strToken, err := token.SignedString([]byte(cfg.JWT.Token))
		if err != nil {
			gCtx.AbortWithError(http.StatusInternalServerError, fmt.Errorf("cant create str token"))
			return
		}

		gCtx.JSON(http.StatusOK, loginResp{
			ExpiresIn:   cfg.JWT.ExpiresIn,
			AccessToken: strToken,
			TokenType:   "Bearer",
		})
	}

	gCtx.AbortWithStatus(http.StatusForbidden) // отдаем 403 ответ в знак того что доступ запрещен
}

type registerReq struct {
	Name string `json:"name"` // лучше назвать то же самое что login
	Pass string `json:"pass"`
}

type registerResp struct {
	Ok bool `json:"ok"`
}

func (a *Application) Register(gCtx *gin.Context) {
	req := &registerReq{}

	err := json.NewDecoder(gCtx.Request.Body).Decode(req)
	if err != nil {
		gCtx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if req.Pass == "" {
		gCtx.AbortWithError(http.StatusBadRequest, fmt.Errorf("pass is empty"))
		return
	}

	if req.Name == "" {
		gCtx.AbortWithError(http.StatusBadRequest, fmt.Errorf("name is empty"))
		return
	}

	err = a.repo.Register(&ds.User{
		UUID: uuid.New(),
		Role: role.Buyer,
		Name: req.Name,
		Pass: generateHashString(req.Pass), // пароли делаем в хешированном виде и далее будем сравнивать хеши, чтобы их не угнали с базой вместе
	})
	if err != nil {
		gCtx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	gCtx.JSON(http.StatusOK, &registerResp{
		Ok: true,
	})
}

func generateHashString(s string) string {
	h := sha1.New()
	h.Write([]byte(s))
	return hex.EncodeToString(h.Sum(nil))
}
