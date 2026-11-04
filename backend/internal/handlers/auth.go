package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"chotluong-backend/internal/auth"
	"chotluong-backend/internal/middleware"
	"chotluong-backend/internal/models"

	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	DB        *sql.DB
	JWTSecret string
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// Login xử lý đăng nhập hệ thống
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Phương thức không được hỗ trợ"}`, http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Dữ liệu đầu vào không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	var user models.User
	var passwordHash string
	var roles pq.StringArray

	err := h.DB.QueryRow(`
		SELECT id, email, full_name, password_hash, roles, is_active, created_at, updated_at
		FROM cl_users
		WHERE email = $1;
	`, req.Email).Scan(&user.ID, &user.Email, &user.FullName, &passwordHash, &roles, &user.IsActive, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, `{"error":"Email hoặc mật khẩu không chính xác"}`, http.StatusUnauthorized)
			return
		}
		http.Error(w, `{"error":"Lỗi hệ thống khi tìm người dùng"}`, http.StatusInternalServerError)
		return
	}

	if !user.IsActive {
		http.Error(w, `{"error":"Tài khoản của bạn đã bị khóa, vui lòng liên hệ Admin"}`, http.StatusForbidden)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		http.Error(w, `{"error":"Email hoặc mật khẩu không chính xác"}`, http.StatusUnauthorized)
		return
	}

	user.Roles = []string(roles)

	token, err := auth.GenerateToken(h.JWTSecret, user.ID, user.Email, user.FullName, user.Roles)
	if err != nil {
		http.Error(w, `{"error":"Không thể khởi tạo phiên đăng nhập"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(LoginResponse{
		Token: token,
		User:  user,
	})
}

// Me trả về thông tin tài khoản hiện tại
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserClaims(r)
	if claims == nil {
		http.Error(w, `{"error":"Chưa xác thực"}`, http.StatusUnauthorized)
		return
	}

	var user models.User
	var roles pq.StringArray

	err := h.DB.QueryRow(`
		SELECT id, email, full_name, roles, is_active, created_at, updated_at
		FROM cl_users
		WHERE id = $1;
	`, claims.UserID).Scan(&user.ID, &user.Email, &user.FullName, &roles, &user.IsActive, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		http.Error(w, `{"error":"Không tìm thấy thông tin tài khoản"}`, http.StatusNotFound)
		return
	}

	user.Roles = []string(roles)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(user)
}

