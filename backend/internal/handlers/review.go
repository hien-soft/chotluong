package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"chotluong-backend/internal/middleware"
	"chotluong-backend/internal/models"
	"chotluong-backend/internal/workflow"
)

type ReviewHandler struct {
	DB *sql.DB
}

type TransitionRequest struct {
	Action string `json:"action"`
	Reason string `json:"reason"`
}

// GetL1Queue lấy danh sách bài chờ hoặc đang duyệt Cấp 1
func (h *ReviewHandler) GetL1Queue(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT a.id, a.title, a.slug, a.sapo, a.content_html, a.cover_image_url, a.category,
		       a.author_id, a.author_name, a.status, a.version, a.holder_id, u.full_name as holder_name,
		       a.l1_reviewer_id, a.l1_approved_at, a.l2_reviewer_id, a.l2_approved_at,
		       a.published_at, a.view_count, a.created_at, a.updated_at
		FROM cl_articles a
		LEFT JOIN cl_users u ON a.holder_id = u.id
		WHERE a.status IN ('PENDING_L1', 'IN_REVIEW_L1')
		ORDER BY a.updated_at DESC;
	`
	rows, err := h.DB.Query(query)
	if err != nil {
		http.Error(w, `{"error":"Lỗi truy vấn hàng đợi duyệt cấp 1"}`, http.StatusInternalServerError)
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

// GetL2Queue lấy danh sách bài chờ hoặc đang duyệt Cấp 2
func (h *ReviewHandler) GetL2Queue(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT a.id, a.title, a.slug, a.sapo, a.content_html, a.cover_image_url, a.category,
		       a.author_id, a.author_name, a.status, a.version, a.holder_id, u.full_name as holder_name,
		       a.l1_reviewer_id, a.l1_approved_at, a.l2_reviewer_id, a.l2_approved_at,
		       a.published_at, a.view_count, a.created_at, a.updated_at
		FROM cl_articles a
		LEFT JOIN cl_users u ON a.holder_id = u.id
		WHERE a.status IN ('PENDING_L2', 'IN_REVIEW_L2')
		ORDER BY a.updated_at DESC;
	`
	rows, err := h.DB.Query(query)
	if err != nil {
		http.Error(w, `{"error":"Lỗi truy vấn hàng đợi duyệt cấp 2"}`, http.StatusInternalServerError)
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

// Transition chuyển trạng thái duyệt bài viết
func (h *ReviewHandler) Transition(w http.ResponseWriter, r *http.Request) {
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

	var req TransitionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Dữ liệu đầu vào không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	// Lấy thông tin hiện tại của bài viết
	var currentStatus string
	var authorID string
	var holderID sql.NullString
	var l1ReviewerID sql.NullString

	err = h.DB.QueryRow(`
		SELECT status, author_id, holder_id, l1_reviewer_id
		FROM cl_articles
		WHERE id = $1;
	`, id).Scan(&currentStatus, &authorID, &holderID, &l1ReviewerID)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, `{"error":"Không tìm thấy bài viết"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error":"Lỗi hệ thống khi tìm bài viết"}`, http.StatusInternalServerError)
		return
	}

	isAuthor := (authorID == claims.UserID)
	isHolder := (holderID.Valid && holderID.String == claims.UserID)
	isL1Reviewer := (l1ReviewerID.Valid && l1ReviewerID.String == claims.UserID)

	// Kiểm tra máy trạng thái quy trình 2 cấp
	rule, err := workflow.ValidateTransition(currentStatus, req.Action, claims.Roles, isAuthor, isHolder, isL1Reviewer, req.Reason)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusBadRequest)
		return
	}

	tx, err := h.DB.Begin()
	if err != nil {
		http.Error(w, `{"error":"Lỗi khởi tạo transaction"}`, http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	now := time.Now()
	var newHolderID *string = nil
	var updateQuery string
	var args []interface{}

	switch req.Action {
	case models.ActionClaimL1, models.ActionClaimL2:
		newHolderID = &claims.UserID
		updateQuery = `
			UPDATE cl_articles
			SET status = $1, holder_id = $2, version = version + 1, updated_at = $3
			WHERE id = $4;
		`
		args = []interface{}{rule.ToStatus, newHolderID, now, id}

	case models.ActionReleaseL1, models.ActionReleaseL2:
		updateQuery = `
			UPDATE cl_articles
			SET status = $1, holder_id = NULL, version = version + 1, updated_at = $2
			WHERE id = $3;
		`
		args = []interface{}{rule.ToStatus, now, id}

	case models.ActionApproveL1:
		updateQuery = `
			UPDATE cl_articles
			SET status = $1, holder_id = NULL, l1_reviewer_id = $2, l1_approved_at = $3,
			    version = version + 1, updated_at = $4
			WHERE id = $5;
		`
		args = []interface{}{rule.ToStatus, claims.UserID, now, now, id}

	case models.ActionPublish:
		updateQuery = `
			UPDATE cl_articles
			SET status = $1, holder_id = NULL, l2_reviewer_id = $2, l2_approved_at = $3,
			    published_at = $4, version = version + 1, updated_at = $5
			WHERE id = $6;
		`
		args = []interface{}{rule.ToStatus, claims.UserID, now, now, now, id}

	case models.ActionUnpublish:
		updateQuery = `
			UPDATE cl_articles
			SET status = $1, holder_id = NULL, version = version + 1, updated_at = $2
			WHERE id = $3;
		`
		args = []interface{}{rule.ToStatus, now, id}

	default:
		// Các hành động RETURN, REJECT, SUBMIT, WITHDRAW, RESUBMIT
		updateQuery = `
			UPDATE cl_articles
			SET status = $1, holder_id = NULL, version = version + 1, updated_at = $2
			WHERE id = $3;
		`
		args = []interface{}{rule.ToStatus, now, id}
	}

	if _, err := tx.Exec(updateQuery, args...); err != nil {
		http.Error(w, `{"error":"Lỗi cập nhật trạng thái bài viết"}`, http.StatusInternalServerError)
		return
	}

	// Ghi nhật ký trạng thái (Audit log)
	_, err = tx.Exec(`
		INSERT INTO cl_article_status_logs (article_id, from_status, to_status, action, actor_id, actor_name, reason)
		VALUES ($1, $2, $3, $4, $5, $6, $7);
	`, id, currentStatus, rule.ToStatus, req.Action, claims.UserID, claims.FullName, req.Reason)

	if err != nil {
		http.Error(w, `{"error":"Lỗi ghi nhật ký duyệt bài"}`, http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, `{"error":"Lỗi hoàn tất giao dịch"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message":     "Chuyển trạng thái thành công!",
		"from_status": currentStatus,
		"to_status":   rule.ToStatus,
		"action":      req.Action,
	})
}

// GetLogs lấy lịch sử chuyển trạng thái và lý do duyệt bài
func (h *ReviewHandler) GetLogs(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error":"ID bài viết không hợp lệ"}`, http.StatusBadRequest)
		return
	}

	rows, err := h.DB.Query(`
		SELECT id, article_id, from_status, to_status, action, actor_id, actor_name, reason, created_at
		FROM cl_article_status_logs
		WHERE article_id = $1
		ORDER BY created_at DESC;
	`, id)
	if err != nil {
		http.Error(w, `{"error":"Lỗi truy vấn lịch sử bài viết"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	logs := []models.ArticleStatusLog{}
	for rows.Next() {
		var l models.ArticleStatusLog
		var reason sql.NullString
		if err := rows.Scan(&l.ID, &l.ArticleID, &l.FromStatus, &l.ToStatus, &l.Action, &l.ActorID, &l.ActorName, &reason, &l.CreatedAt); err == nil {
			if reason.Valid {
				l.Reason = reason.String
			}
			logs = append(logs, l)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(logs)
}

