package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"chotluong-backend/internal/models"
)

type AdsHandler struct {
	DB *sql.DB
}

// GetPublicAds trả về danh sách quảng cáo đang hoạt động chia theo vị trí (LEFT, RIGHT, POPUP)
func (h *AdsHandler) GetPublicAds(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT id, name, position, image_url, link_url, open_new_tab, is_active, frequency, sort_order, clicks, created_at, updated_at
		FROM cl_ads
		WHERE is_active = true
		ORDER BY sort_order ASC, id ASC;
	`)
	if err != nil {
		http.Error(w, `{"error":"Lỗi truy vấn quảng cáo"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var left *models.Ad
	var right *models.Ad
	var popup *models.Ad

	for rows.Next() {
		var ad models.Ad
		var linkURL sql.NullString
		err := rows.Scan(
			&ad.ID, &ad.Name, &ad.Position, &ad.ImageURL, &linkURL,
			&ad.OpenNewTab, &ad.IsActive, &ad.Frequency, &ad.SortOrder, &ad.Clicks,
			&ad.CreatedAt, &ad.UpdatedAt,
		)
		if err != nil {
			continue
		}
		if linkURL.Valid {
			ad.LinkURL = linkURL.String
		}

		if ad.Position == models.AdPositionLeft && left == nil {
			left = &ad
		} else if ad.Position == models.AdPositionRight && right == nil {
			right = &ad
		} else if ad.Position == models.AdPositionPopup && popup == nil {
			popup = &ad
		}
	}

	res := map[string]*models.Ad{
		"left":  left,
		"right": right,
		"popup": popup,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

// ClickAd ghi nhận lượt click vào quảng cáo
func (h *AdsHandler) ClickAd(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error":"ID không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	_, _ = h.DB.Exec("UPDATE cl_ads SET clicks = clicks + 1 WHERE id = $1", id)
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"status":"ok"}`))
}

// ListAds CMS quản trị danh sách quảng cáo
func (h *AdsHandler) ListAds(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT id, name, position, image_url, link_url, open_new_tab, is_active, frequency, sort_order, clicks, created_at, updated_at
		FROM cl_ads
		ORDER BY position ASC, sort_order ASC, id ASC;
	`)
	if err != nil {
		http.Error(w, `{"error":"Lỗi truy vấn quảng cáo"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	ads := []models.Ad{}
	for rows.Next() {
		var ad models.Ad
		var linkURL sql.NullString
		err := rows.Scan(
			&ad.ID, &ad.Name, &ad.Position, &ad.ImageURL, &linkURL,
			&ad.OpenNewTab, &ad.IsActive, &ad.Frequency, &ad.SortOrder, &ad.Clicks,
			&ad.CreatedAt, &ad.UpdatedAt,
		)
		if err != nil {
			continue
		}
		if linkURL.Valid {
			ad.LinkURL = linkURL.String
		}
		ads = append(ads, ad)
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(ads)
}

// CreateAd thêm quảng cáo mới
func (h *AdsHandler) CreateAd(w http.ResponseWriter, r *http.Request) {
	var ad models.Ad
	if err := json.NewDecoder(r.Body).Decode(&ad); err != nil {
		http.Error(w, `{"error":"Dữ liệu đầu vào không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	if ad.Position == "" {
		ad.Position = models.AdPositionLeft
	}
	if ad.Frequency == "" {
		ad.Frequency = "SESSION"
	}

	var newID int
	err := h.DB.QueryRow(`
		INSERT INTO cl_ads (name, position, image_url, link_url, open_new_tab, is_active, frequency, sort_order)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id;
	`, ad.Name, ad.Position, ad.ImageURL, ad.LinkURL, ad.OpenNewTab, ad.IsActive, ad.Frequency, ad.SortOrder).Scan(&newID)

	if err != nil {
		http.Error(w, `{"error":"Lỗi tạo quảng cáo mới"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      newID,
		"message": "Thêm quảng cáo thành công!",
	})
}

// UpdateAd cập nhật quảng cáo
func (h *AdsHandler) UpdateAd(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error":"ID không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	var ad models.Ad
	if err := json.NewDecoder(r.Body).Decode(&ad); err != nil {
		http.Error(w, `{"error":"Dữ liệu đầu vào không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	_, err = h.DB.Exec(`
		UPDATE cl_ads
		SET name = $1, position = $2, image_url = $3, link_url = $4,
		    open_new_tab = $5, is_active = $6, frequency = $7, sort_order = $8, updated_at = NOW()
		WHERE id = $9;
	`, ad.Name, ad.Position, ad.ImageURL, ad.LinkURL, ad.OpenNewTab, ad.IsActive, ad.Frequency, ad.SortOrder, id)

	if err != nil {
		http.Error(w, `{"error":"Lỗi cập nhật quảng cáo"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "Cập nhật quảng cáo thành công!",
	})
}

// DeleteAd xóa quảng cáo
func (h *AdsHandler) DeleteAd(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error":"ID không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	_, err = h.DB.Exec("DELETE FROM cl_ads WHERE id = $1", id)
	if err != nil {
		http.Error(w, `{"error":"Lỗi xóa quảng cáo"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "Xóa quảng cáo thành công!",
	})
}

