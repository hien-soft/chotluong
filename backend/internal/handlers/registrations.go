package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"chotluong-backend/internal/models"
)

type RegistrationsHandler struct {
	DB *sql.DB
}

// CreateRegistration tiếp nhận thông tin đăng ký dùng thử / sử dụng sản phẩm từ khách hàng
func (h *RegistrationsHandler) CreateRegistration(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Phương thức không được hỗ trợ"}`, http.StatusMethodNotAllowed)
		return
	}

	var req models.LeadRegistration
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Dữ liệu đầu vào không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	req.FullName = strings.TrimSpace(req.FullName)
	req.Phone = strings.TrimSpace(req.Phone)
	req.Email = strings.TrimSpace(req.Email)
	req.CompanyName = strings.TrimSpace(req.CompanyName)

	if req.FullName == "" || req.Phone == "" || req.CompanyName == "" {
		http.Error(w, `{"error":"Vui lòng điền đầy đủ Họ tên, Số điện thoại và Tên doanh nghiệp"}`, http.StatusBadRequest)
		return
	}

	if req.CompanySize == "" {
		req.CompanySize = "20 - 50 người"
	}
	if req.PrimaryNeed == "" {
		req.PrimaryNeed = "Quản lý toàn diện HRM & Payroll"
	}

	var newID int
	err := h.DB.QueryRow(`
		INSERT INTO cl_registrations (full_name, phone, email, company_name, company_size, primary_need, note, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'NEW')
		RETURNING id;
	`, req.FullName, req.Phone, req.Email, req.CompanyName, req.CompanySize, req.PrimaryNeed, req.Note).Scan(&newID)

	if err != nil {
		http.Error(w, `{"error":"Lỗi lưu thông tin đăng ký vào hệ thống"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      newID,
		"message": "Đăng ký thành công! Chuyên viên Chốt Lương sẽ liên hệ hỗ trợ bạn trong vòng 15 phút.",
	})
}

// ListRegistrations danh sách khách hàng đăng ký (dành cho Admin CMS)
func (h *RegistrationsHandler) ListRegistrations(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT id, full_name, phone, email, company_name, company_size, primary_need, note, status, created_at
		FROM cl_registrations
		ORDER BY created_at DESC;
	`)
	if err != nil {
		http.Error(w, `{"error":"Lỗi truy vấn danh sách đăng ký"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	list := []models.LeadRegistration{}
	for rows.Next() {
		var item models.LeadRegistration
		var note sql.NullString
		err := rows.Scan(
			&item.ID, &item.FullName, &item.Phone, &item.Email,
			&item.CompanyName, &item.CompanySize, &item.PrimaryNeed,
			&note, &item.Status, &item.CreatedAt,
		)
		if err != nil {
			continue
		}
		if note.Valid {
			item.Note = note.String
		}
		list = append(list, item)
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(list)
}

// UpdateRegistrationStatus cập nhật trạng thái xử lý liên hệ (NEW, CONTACTED, COMPLETED)
func (h *RegistrationsHandler) UpdateRegistrationStatus(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error":"ID không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Dữ liệu đầu vào không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	_, err = h.DB.Exec("UPDATE cl_registrations SET status = $1 WHERE id = $2", req.Status, id)
	if err != nil {
		http.Error(w, `{"error":"Lỗi cập nhật trạng thái"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "Cập nhật trạng thái thành công!",
	})
}

