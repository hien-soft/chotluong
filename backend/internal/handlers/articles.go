package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"chotluong-backend/internal/middleware"
	"chotluong-backend/internal/models"
)

type ArticleHandler struct {
	DB *sql.DB
}

// slugify chuyển tiêu đề thành đường dẫn URL thân thiện
func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	// Chuyển ký tự tiếng Việt đơn giản
	replacer := strings.NewReplacer(
		"à", "a", "á", "a", "ả", "a", "ã", "a", "ạ", "a",
		"ă", "a", "ằ", "a", "ắ", "a", "ẳ", "a", "ẵ", "a", "ặ", "a",
		"â", "a", "ầ", "a", "ấ", "a", "ẩ", "a", "ẫ", "a", "ậ", "a",
		"đ", "d",
		"è", "e", "é", "e", "ẻ", "e", "ẽ", "e", "ẹ", "e",
		"ê", "e", "ề", "e", "ế", "e", "ể", "e", "ễ", "e", "ệ", "e",
		"ì", "i", "í", "i", "ỉ", "i", "ĩ", "i", "ị", "i",
		"ò", "o", "ó", "o", "ỏ", "o", "õ", "o", "ọ", "o",
		"ô", "o", "ồ", "o", "ố", "o", "ổ", "o", "ỗ", "o", "ộ", "o",
		"ơ", "o", "ờ", "o", "ớ", "o", "ở", "o", "ỡ", "o", "ợ", "o",
		"ù", "u", "ú", "u", "ủ", "u", "ũ", "u", "ụ", "u",
		"ư", "u", "ừ", "u", "ứ", "u", "ử", "u", "ữ", "u", "ự", "u",
		"ỳ", "y", "ý", "y", "ỷ", "y", "ỹ", "y", "ỵ", "y",
	)
	s = replacer.Replace(s)
	reg := regexp.MustCompile("[^a-z0-9]+")
	s = reg.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}

// ListArticles danh sách bài viết (có lọc theo status, category)
func (h *ArticleHandler) ListArticles(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	category := r.URL.Query().Get("category")

	query := `
		SELECT a.id, a.title, a.slug, a.sapo, a.content_html, a.cover_image_url, a.category,
		       a.author_id, a.author_name, a.status, a.version, a.holder_id, u.full_name as holder_name,
		       a.l1_reviewer_id, a.l1_approved_at, a.l2_reviewer_id, a.l2_approved_at,
		       a.published_at, a.view_count, a.created_at, a.updated_at
		FROM cl_articles a
		LEFT JOIN cl_users u ON a.holder_id = u.id
		WHERE 1=1
	`
	args := []interface{}{}
	argIdx := 1

	if status != "" {
		query += fmt.Sprintf(" AND a.status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}

	if category != "" {
		query += fmt.Sprintf(" AND a.category = $%d", argIdx)
		args = append(args, category)
		argIdx++
	}

	query += " ORDER BY a.updated_at DESC"

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		http.Error(w, `{"error":"Lỗi truy vấn cơ sở dữ liệu"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	articles := []models.Article{}
	for rows.Next() {
		var art models.Article
		var holderName sql.NullString
		err := rows.Scan(
			&art.ID, &art.Title, &art.Slug, &art.Sapo, &art.ContentHTML, &art.CoverImageURL, &art.Category,
			&art.AuthorID, &art.AuthorName, &art.Status, &art.Version, &art.HolderID, &holderName,
			&art.L1ReviewerID, &art.L1ApprovedAt, &art.L2ReviewerID, &art.L2ApprovedAt,
			&art.PublishedAt, &art.ViewCount, &art.CreatedAt, &art.UpdatedAt,
		)
		if err != nil {
			continue
		}
		if holderName.Valid {
			art.HolderName = &holderName.String
		}
		articles = append(articles, art)
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(articles)
}

// GetArticle chi tiết một bài viết
func (h *ArticleHandler) GetArticle(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error":"ID bài viết không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	var art models.Article
	var holderName sql.NullString

	err = h.DB.QueryRow(`
		SELECT a.id, a.title, a.slug, a.sapo, a.content_html, a.cover_image_url, a.category,
		       a.author_id, a.author_name, a.status, a.version, a.holder_id, u.full_name as holder_name,
		       a.l1_reviewer_id, a.l1_approved_at, a.l2_reviewer_id, a.l2_approved_at,
		       a.published_at, a.view_count, a.created_at, a.updated_at
		FROM cl_articles a
		LEFT JOIN cl_users u ON a.holder_id = u.id
		WHERE a.id = $1;
	`, id).Scan(
		&art.ID, &art.Title, &art.Slug, &art.Sapo, &art.ContentHTML, &art.CoverImageURL, &art.Category,
		&art.AuthorID, &art.AuthorName, &art.Status, &art.Version, &art.HolderID, &holderName,
		&art.L1ReviewerID, &art.L1ApprovedAt, &art.L2ReviewerID, &art.L2ApprovedAt,
		&art.PublishedAt, &art.ViewCount, &art.CreatedAt, &art.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, `{"error":"Không tìm thấy bài viết"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error":"Lỗi hệ thống khi tìm bài viết"}`, http.StatusInternalServerError)
		return
	}

	if holderName.Valid {
		art.HolderName = &holderName.String
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(art)
}

// CreateArticle tạo bài viết mới ở trạng thái DRAFT
func (h *ArticleHandler) CreateArticle(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserClaims(r)
	if claims == nil {
		http.Error(w, `{"error":"Chưa xác thực"}`, http.StatusUnauthorized)
		return
	}

	var req struct {
		Title         string `json:"title"`
		Sapo          string `json:"sapo"`
		ContentHTML   string `json:"content_html"`
		CoverImageURL string `json:"cover_image_url"`
		Category      string `json:"category"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Dữ liệu đầu vào không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.Title) == "" {
		http.Error(w, `{"error":"Tiêu đề bài viết không được để trống"}`, http.StatusBadRequest)
		return
	}

	slug := slugify(req.Title) + "-" + strconv.FormatInt(time.Now().Unix(), 10)
	if req.Category == "" {
		req.Category = "Tin tức"
	}

	var artID int
	err := h.DB.QueryRow(`
		INSERT INTO cl_articles (title, slug, sapo, content_html, cover_image_url, category, author_id, author_name, status, version)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1)
		RETURNING id;
	`, req.Title, slug, req.Sapo, req.ContentHTML, req.CoverImageURL, req.Category, claims.UserID, claims.FullName, models.StatusDraft).Scan(&artID)

	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Lỗi tạo bài viết: %v"}`, err), http.StatusInternalServerError)
		return
	}

	// Ghi nhật ký khởi tạo
	_, _ = h.DB.Exec(`
		INSERT INTO cl_article_status_logs (article_id, from_status, to_status, action, actor_id, actor_name, reason)
		VALUES ($1, 'NONE', 'DRAFT', 'CREATE', $2, $3, 'Tạo bản nháp mới');
	`, artID, claims.UserID, claims.FullName)

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      artID,
		"message": "Tạo bài viết thành công!",
	})
}

// UpdateArticle cập nhật nội dung bài viết
func (h *ArticleHandler) UpdateArticle(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserClaims(r)
	if claims == nil {
		http.Error(w, `{"error":"Chưa xác thực"}`, http.StatusUnauthorized)
		return
	}

	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error":"ID bài viết không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	var req struct {
		Title         string `json:"title"`
		Sapo          string `json:"sapo"`
		ContentHTML   string `json:"content_html"`
		CoverImageURL string `json:"cover_image_url"`
		Category      string `json:"category"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Dữ liệu đầu vào không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	res, err := h.DB.Exec(`
		UPDATE cl_articles
		SET title = $1, sapo = $2, content_html = $3, cover_image_url = $4, category = $5,
		    version = version + 1, updated_at = NOW()
		WHERE id = $6;
	`, req.Title, req.Sapo, req.ContentHTML, req.CoverImageURL, req.Category, id)

	if err != nil {
		http.Error(w, `{"error":"Lỗi cập nhật bài viết"}`, http.StatusInternalServerError)
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		http.Error(w, `{"error":"Không tìm thấy bài viết hoặc không có quyền sửa"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "Cập nhật bài viết thành công!",
	})
}

// DeleteArticle xóa bài viết (chỉ cho phép khi ở DRAFT)
func (h *ArticleHandler) DeleteArticle(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error":"ID bài viết không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	res, err := h.DB.Exec("DELETE FROM cl_articles WHERE id = $1 AND status = 'DRAFT'", id)
	if err != nil {
		http.Error(w, `{"error":"Lỗi xóa bài viết"}`, http.StatusInternalServerError)
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		http.Error(w, `{"error":"Chỉ có thể xóa bài viết đang ở trạng thái Bản nháp (DRAFT)"}`, http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "Xóa bài viết thành công!",
	})
}

