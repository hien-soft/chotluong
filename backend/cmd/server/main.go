package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"chotluong-backend/internal/config"
	"chotluong-backend/internal/database"
	"chotluong-backend/internal/handlers"
	"chotluong-backend/internal/middleware"
)

func main() {
	log.Println("======================================================")
	log.Println("🚀 KHỞI ĐỘNG HỆ THỐNG BACKEND CÔNG TY CHỐT LƯƠNG (GOLANG)")
	log.Println("======================================================")

	cfg := config.Load()

	// Khởi tạo PostgreSQL
	db, err := database.InitDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("❌ Lỗi kết nối database: %v", err)
	}
	defer db.Close()

	// Khởi tạo các handler
	authHandler := &handlers.AuthHandler{DB: db, JWTSecret: cfg.JWTSecret}
	articleHandler := &handlers.ArticleHandler{DB: db}
	reviewHandler := &handlers.ReviewHandler{DB: db}
	adsHandler := &handlers.AdsHandler{DB: db}
	usersHandler := &handlers.UsersHandler{DB: db}
	landingHandler := &handlers.LandingHandler{DB: db}
	regHandler := &handlers.RegistrationsHandler{DB: db}

	authMid := middleware.AuthMiddleware(cfg.JWTSecret)

	mux := http.NewServeMux()

	// 1. PUBLIC ENDPOINTS (Landing Page, Tin tức, Quảng cáo, Đăng ký sản phẩm)
	mux.HandleFunc("GET /api/public/landing", landingHandler.GetLandingData)
	mux.HandleFunc("GET /api/public/news", landingHandler.GetPublicNews)
	mux.HandleFunc("GET /api/public/news/{slug}", landingHandler.GetPublicArticleBySlug)
	mux.HandleFunc("GET /api/public/ads", adsHandler.GetPublicAds)
	mux.HandleFunc("POST /api/public/ads/{id}/click", adsHandler.ClickAd)
	mux.HandleFunc("POST /api/public/register", regHandler.CreateRegistration)

	// 2. AUTH
	mux.HandleFunc("POST /api/auth/login", authHandler.Login)
	mux.Handle("GET /api/auth/me", authMid(http.HandlerFunc(authHandler.Me)))

	// 3. ARTICLES (CRUD Bài viết / Tin tức)
	mux.Handle("GET /api/articles", authMid(http.HandlerFunc(articleHandler.ListArticles)))
	mux.Handle("POST /api/articles", authMid(http.HandlerFunc(articleHandler.CreateArticle)))
	mux.Handle("GET /api/articles/{id}", authMid(http.HandlerFunc(articleHandler.GetArticle)))
	mux.Handle("PUT /api/articles/{id}", authMid(http.HandlerFunc(articleHandler.UpdateArticle)))
	mux.Handle("DELETE /api/articles/{id}", authMid(http.HandlerFunc(articleHandler.DeleteArticle)))

	// 4. WORKFLOW DUYỆT BÀI 2 CẤP
	mux.Handle("GET /api/review/l1/queue", authMid(http.HandlerFunc(reviewHandler.GetL1Queue)))
	mux.Handle("GET /api/review/l2/queue", authMid(http.HandlerFunc(reviewHandler.GetL2Queue)))
	mux.Handle("POST /api/articles/{id}/transition", authMid(http.HandlerFunc(reviewHandler.Transition)))
	mux.Handle("GET /api/articles/{id}/logs", authMid(http.HandlerFunc(reviewHandler.GetLogs)))

	// 5. ADS MANAGEMENT (CMS)
	mux.Handle("GET /api/ads", authMid(http.HandlerFunc(adsHandler.ListAds)))
	mux.Handle("POST /api/ads", authMid(http.HandlerFunc(adsHandler.CreateAd)))
	mux.Handle("PUT /api/ads/{id}", authMid(http.HandlerFunc(adsHandler.UpdateAd)))
	mux.Handle("DELETE /api/ads/{id}", authMid(http.HandlerFunc(adsHandler.DeleteAd)))

	// 6. USERS & ROLES RBAC
	mux.Handle("GET /api/users", authMid(http.HandlerFunc(usersHandler.ListUsers)))
	mux.Handle("POST /api/users", authMid(http.HandlerFunc(usersHandler.CreateUser)))
	mux.Handle("PUT /api/users/{id}", authMid(http.HandlerFunc(usersHandler.UpdateUser)))
	mux.Handle("DELETE /api/users/{id}", authMid(http.HandlerFunc(usersHandler.DeleteUser)))
	mux.Handle("GET /api/roles", authMid(http.HandlerFunc(usersHandler.ListRoles)))

	// 7. LEAD REGISTRATIONS (CMS)
	mux.Handle("GET /api/registrations", authMid(http.HandlerFunc(regHandler.ListRegistrations)))
	mux.Handle("PUT /api/registrations/{id}/status", authMid(http.HandlerFunc(regHandler.UpdateRegistrationStatus)))

	// Health check
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"healthy","service":"ChotLuong-GoBackend"}`))
	})

	// 7. SERVE STATIC FRONTEND (dist) NẾU CÓ
	frontendDist := filepath.Join("..", "frontend", "dist")
	if _, err := os.Stat(frontendDist); err == nil {
		fs := http.FileServer(http.Dir(frontendDist))
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			if strings.HasPrefix(r.URL.Path, "/api") {
				http.NotFound(w, r)
				return
			}
			fPath := filepath.Join(frontendDist, filepath.Clean(r.URL.Path))
			if fi, err := os.Stat(fPath); os.IsNotExist(err) || fi.IsDir() {
				http.ServeFile(w, r, filepath.Join(frontendDist, "index.html"))
				return
			}
			fs.ServeHTTP(w, r)
		})
		log.Printf(" Serving React Frontend từ: %s\n", frontendDist)
	}

	handler := middleware.CORS(mux)

	serverAddr := ":" + cfg.Port
	log.Printf(" Chot Luong Server sẵn sàng tại http://localhost%s\n", serverAddr)
	if err := http.ListenAndServe(serverAddr, handler); err != nil {
		log.Fatalf("❌ Server dừng do lỗi: %v", err)
	}
}
