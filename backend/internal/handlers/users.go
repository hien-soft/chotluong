package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"chotluong-backend/internal/models"

	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type UsersHandler struct {
	DB *sql.DB
}

// ListUsers lấy danh sách tài khoản người dùng
func (h *UsersHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT id, email, full_name, roles, is_active, created_at, updated_at
		FROM cl_users
		ORDER BY created_at ASC;
	`)
	if err != nil {
		http.Error(w, `{"error":"Lỗi truy vấn người dùng"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	users := []models.User{}
	for rows.Next() {
		var u models.User
		var roles pq.StringArray
		if err := rows.Scan(&u.ID, &u.Email, &u.FullName, &roles, &u.IsActive, &u.CreatedAt, &u.UpdatedAt); err == nil {
			u.Roles = []string(roles)
			users = append(users, u)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(users)
}

// CreateUser tạo tài khoản người dùng mới kèm gán vai trò
func (h *UsersHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string   `json:"email"`
		FullName string   `json:"full_name"`
		Password string   `json:"password"`
		Roles    []string `json:"roles"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Dữ liệu đầu vào không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" || req.FullName == "" {
		http.Error(w, `{"error":"Email, Họ tên và Mật khẩu không được để trống"}`, http.StatusBadRequest)
		return
	}

	if len(req.Roles) == 0 {
		req.Roles = []string{models.RoleReporter}
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, `{"error":"Lỗi mã hóa mật khẩu"}`, http.StatusInternalServerError)
		return
	}

	userID := fmt.Sprintf("usr-%d", time.Now().UnixNano())

	_, err = h.DB.Exec(`
		INSERT INTO cl_users (id, email, full_name, password_hash, roles, is_active)
		VALUES ($1, $2, $3, $4, $5, true);
	`, userID, req.Email, req.FullName, string(hash), pq.Array(req.Roles))

	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Email đã tồn tại hoặc lỗi tạo người dùng: %v"}`, err), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      userID,
		"message": "Tạo người dùng thành công!",
	})
}

// UpdateUser cập nhật thông tin vai trò, trạng thái người dùng
func (h *UsersHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, `{"error":"ID không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	var req struct {
		FullName string   `json:"full_name"`
		Roles    []string `json:"roles"`
		IsActive bool     `json:"is_active"`
		Password string   `json:"password,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Dữ liệu đầu vào không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	if req.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err == nil {
			_, _ = h.DB.Exec("UPDATE cl_users SET password_hash = $1 WHERE id = $2", string(hash), id)
		}
	}

	_, err := h.DB.Exec(`
		UPDATE cl_users
		SET full_name = $1, roles = $2, is_active = $3, updated_at = NOW()
		WHERE id = $4;
	`, req.FullName, pq.Array(req.Roles), req.IsActive, id)

	if err != nil {
		http.Error(w, `{"error":"Lỗi cập nhật người dùng"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "Cập nhật tài khoản thành công!",
	})
}

// DeleteUser xóa người dùng
func (h *UsersHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, `{"error":"ID không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	_, err := h.DB.Exec("DELETE FROM cl_users WHERE id = $1", id)
	if err != nil {
		http.Error(w, `{"error":"Lỗi xóa người dùng"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "Xóa người dùng thành công!",
	})
}

// ListRoles danh mục vai trò và ma trận quyền
func (h *UsersHandler) ListRoles(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT name, display_name, description, permissions
		FROM cl_roles
		ORDER BY name ASC;
	`)
	if err != nil {
		http.Error(w, `{"error":"Lỗi truy vấn danh mục vai trò"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	roles := []models.RoleInfo{}
	for rows.Next() {
		var r models.RoleInfo
		var perms pq.StringArray
		if err := rows.Scan(&r.Name, &r.DisplayName, &r.Description, &perms); err == nil {
			r.Permissions = []string(perms)
			roles = append(roles, r)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(roles)
}

