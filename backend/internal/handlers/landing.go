package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"chotluong-backend/internal/models"
)

type LandingHandler struct {
	DB *sql.DB
}

// GetLandingData cung cấp dữ liệu đầy đủ cho Landing Page Chốt Lương
func (h *LandingHandler) GetLandingData(w http.ResponseWriter, r *http.Request) {
	var data models.LandingData

	// Thông tin công ty Chốt Lương
	data.Company.Name = "Công ty Cổ phần Giải pháp Công nghệ Chốt Lương"
	data.Company.Tagline = "Nền tảng Quản trị Nhân sự & Tính lương tự động số 1 cho Doanh nghiệp SME"
	data.Company.Description = "Chốt Lương giúp doanh nghiệp tự động hóa 100% quy trình từ chấm công GPS/Wifi/FaceID, tự động tính thuế, BHXH, phụ cấp và chốt bảng lương chính xác chỉ trong 3 phút."
	data.Company.Phone = "1900 6868"
	data.Company.Email = "contact@chotluong.vn"
	data.Company.Address = "Tòa nhà Innovation Hub, Phố Duy Tân, Cầu Giấy, Hà Nội"

	// Các tính năng sản phẩm cốt lõi
	data.Features = []models.ProductFeature{
		{
			ID:          "timekeeping",
			Title:       "Chấm công Đa kênh Thông minh",
			Subtitle:    "Chính xác - Chống gian lận - Tức thì",
			Description: "Tích hợp công nghệ nhận diện khuôn mặt AI (FaceID), định vị GPS theo bán kính cho phép và kết nối Wifi văn phòng. Dữ liệu đồng bộ tức thì lên hệ thống đám mây.",
			Icon:        "ClockIcon",
			Highlights:  []string{"Chấm công FaceID siêu nhạy 0.2s", "Định vị GPS chống chấm công hộ", "Đơn từ nghỉ phép, làm thêm giờ duyệt online"},
		},
		{
			ID:          "payroll",
			Title:       "Chốt Lương Tự Động 1 Chạm",
			Subtitle:    "Tiết kiệm 85% thời gian kế toán",
			Description: "Hệ thống tự động tổng hợp công, phép, phụ cấp, hoa hồng, làm thêm giờ, tự động trích nộp BHXH và tính thuế TNCN lũy tiến chuẩn 100% theo quy định pháp luật.",
			Icon:        "CalculatorIcon",
			Highlights:  []string{"Tự động tính công thức lương phức tạp", "Cập nhật biểu thuế TNCN & BHXH mới nhất", "Bảng lương chi tiết từng nhân viên"},
		},
		{
			ID:          "eslip",
			Title:       "Phiếu Lương Điện Tử Bảo Mật",
			Subtitle:    "Gửi trực tiếp qua App Chốt Lương",
			Description: "Không còn in ấn giấy hay gửi email thủ công. Nhân viên mở App xem chi tiết phiếu lương với lớp khóa mã PIN bảo mật, phản hồi thắc mắc ngay trên ứng dụng.",
			Icon:        "DocumentTextIcon",
			Highlights:  []string{"Gửi phiếu lương đồng loạt 1000+ nhân sự trong 5 giây", "Mã PIN bảo vệ thông tin thu nhập riêng tư", "Ký nhận phiếu lương số trực tiếp"},
		},
		{
			ID:          "hrm",
			Title:       "Hồ Sơ Nhân Sự & Hợp Đồng Số",
			Subtitle:    "Quản lý vòng đời nhân viên toàn diện",
			Description: "Số hóa toàn bộ hồ sơ nhân sự, hợp đồng lao động điện tử có giá trị pháp lý, nhắc nhở hạn hết hợp đồng, sinh nhật, thăng tiến tự động.",
			Icon:        "UserGroupIcon",
			Highlights:  []string{"Hợp đồng lao động điện tử", "Cảnh báo hết hạn hợp đồng, nâng lương", "Sơ đồ tổ chức phân cấp linh hoạt"},
		},
	}

	// Thống kê thành tựu
	data.Stats = []struct {
		Label string `json:"label"`
		Value string `json:"value"`
	}{
		{Label: "Doanh nghiệp tin dùng", Value: "1,200+"},
		{Label: "Phiếu lương phát hành mỗi tháng", Value: "150,000+"},
		{Label: "Thời gian chốt lương trung bình", Value: "3 Phút"},
		{Label: "Mức độ hài lòng của HR & Quản lý", Value: "99.4%"},
	}

	// Quảng cáo hoạt động
	adRows, err := h.DB.Query(`
		SELECT id, name, position, image_url, link_url, open_new_tab, is_active, frequency, sort_order, clicks, created_at, updated_at
		FROM cl_ads
		WHERE is_active = true
		ORDER BY sort_order ASC, id ASC;
	`)
	if err == nil {
		defer adRows.Close()
		for adRows.Next() {
			var ad models.Ad
			var linkURL sql.NullString
			if err := adRows.Scan(
				&ad.ID, &ad.Name, &ad.Position, &ad.ImageURL, &linkURL,
				&ad.OpenNewTab, &ad.IsActive, &ad.Frequency, &ad.SortOrder, &ad.Clicks,
				&ad.CreatedAt, &ad.UpdatedAt,
			); err == nil {
				if linkURL.Valid {
					ad.LinkURL = linkURL.String
				}
				if ad.Position == models.AdPositionLeft && data.Ads.LeftBanner == nil {
					data.Ads.LeftBanner = &ad
				} else if ad.Position == models.AdPositionRight && data.Ads.RightBanner == nil {
					data.Ads.RightBanner = &ad
				} else if ad.Position == models.AdPositionPopup && data.Ads.Popup == nil {
					data.Ads.Popup = &ad
				}
			}
		}
	}

	// Tin tức đã xuất bản mới nhất
	newsRows, err := h.DB.Query(`
		SELECT id, title, slug, sapo, content_html, cover_image_url, category,
		       author_id, author_name, status, version, published_at, view_count, created_at, updated_at
		FROM cl_articles
		WHERE status = 'PUBLISHED'
		ORDER BY published_at DESC LIMIT 6;
	`)
	if err == nil {
		defer newsRows.Close()
		for newsRows.Next() {
			var art models.Article
			if err := newsRows.Scan(
				&art.ID, &art.Title, &art.Slug, &art.Sapo, &art.ContentHTML, &art.CoverImageURL, &art.Category,
				&art.AuthorID, &art.AuthorName, &art.Status, &art.Version,
				&art.PublishedAt, &art.ViewCount, &art.CreatedAt, &art.UpdatedAt,
			); err == nil {
				data.LatestNews = append(data.LatestNews, art)
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(data)
}

// GetPublicNews danh sách tin tức đã xuất bản
func (h *LandingHandler) GetPublicNews(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT id, title, slug, sapo, content_html, cover_image_url, category,
		       author_id, author_name, status, version, published_at, view_count, created_at, updated_at
		FROM cl_articles
		WHERE status = 'PUBLISHED'
		ORDER BY published_at DESC;
	`)
	if err != nil {
		http.Error(w, `{"error":"Lỗi truy vấn tin tức"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	articles := []models.Article{}
	for rows.Next() {
		var art models.Article
		if err := rows.Scan(
			&art.ID, &art.Title, &art.Slug, &art.Sapo, &art.ContentHTML, &art.CoverImageURL, &art.Category,
			&art.AuthorID, &art.AuthorName, &art.Status, &art.Version,
			&art.PublishedAt, &art.ViewCount, &art.CreatedAt, &art.UpdatedAt,
		); err == nil {
			articles = append(articles, art)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(articles)
}

// GetPublicArticleBySlug chi tiết tin tức theo slug kèm tăng view
func (h *LandingHandler) GetPublicArticleBySlug(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	if slug == "" {
		http.Error(w, `{"error":"Slug không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	var art models.Article
	err := h.DB.QueryRow(`
		SELECT id, title, slug, sapo, content_html, cover_image_url, category,
		       author_id, author_name, status, version, published_at, view_count, created_at, updated_at
		FROM cl_articles
		WHERE slug = $1 AND status = 'PUBLISHED';
	`, slug).Scan(
		&art.ID, &art.Title, &art.Slug, &art.Sapo, &art.ContentHTML, &art.CoverImageURL, &art.Category,
		&art.AuthorID, &art.AuthorName, &art.Status, &art.Version,
		&art.PublishedAt, &art.ViewCount, &art.CreatedAt, &art.UpdatedAt,
	)

	if err != nil {
		http.Error(w, `{"error":"Bài viết không tồn tại"}`, http.StatusNotFound)
		return
	}

	// Tăng lượt xem
	_, _ = h.DB.Exec("UPDATE cl_articles SET view_count = view_count + 1 WHERE id = $1", art.ID)
	art.ViewCount++

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(art)
}

