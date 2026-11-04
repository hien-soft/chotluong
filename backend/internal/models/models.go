package models

import "time"

// Các vai trò trong hệ thống
const (
	RoleAdmin    = "ADMIN"
	RoleEditorL2 = "EDITOR_L2"
	RoleEditorL1 = "EDITOR_L1"
	RoleReporter = "REPORTER"
)

// Các trạng thái bài viết
const (
	StatusDraft       = "DRAFT"
	StatusPendingL1   = "PENDING_L1"
	StatusInReviewL1  = "IN_REVIEW_L1"
	StatusPendingL2   = "PENDING_L2"
	StatusInReviewL2  = "IN_REVIEW_L2"
	StatusReturned    = "RETURNED"
	StatusPublished   = "PUBLISHED"
	StatusRejected    = "REJECTED"
	StatusUnpublished = "UNPUBLISHED"
)

// Các hành động chuyển trạng thái (Workflow)
const (
	ActionSubmit       = "SUBMIT"        // DRAFT -> PENDING_L1
	ActionWithdraw     = "WITHDRAW"      // PENDING_L1 -> DRAFT
	ActionClaimL1      = "CLAIM_L1"      // PENDING_L1 -> IN_REVIEW_L1
	ActionReleaseL1    = "RELEASE_L1"    // IN_REVIEW_L1 -> PENDING_L1
	ActionApproveL1    = "APPROVE_L1"    // IN_REVIEW_L1 -> PENDING_L2
	ActionReturnL1     = "RETURN_L1"     // IN_REVIEW_L1 -> RETURNED
	ActionRejectL1     = "REJECT_L1"     // IN_REVIEW_L1 -> REJECTED
	ActionClaimL2      = "CLAIM_L2"      // PENDING_L2 -> IN_REVIEW_L2
	ActionReleaseL2    = "RELEASE_L2"    // IN_REVIEW_L2 -> PENDING_L2
	ActionPublish      = "PUBLISH"       // IN_REVIEW_L2 -> PUBLISHED
	ActionReturnL2     = "RETURN_L2"     // IN_REVIEW_L2 -> RETURNED
	ActionSendBackL1   = "SEND_BACK_L1"  // IN_REVIEW_L2 -> PENDING_L1
	ActionRejectL2     = "REJECT_L2"     // IN_REVIEW_L2 -> REJECTED
	ActionResubmit     = "RESUBMIT"      // RETURNED -> PENDING_L1
	ActionUnpublish    = "UNPUBLISH"     // PUBLISHED -> UNPUBLISHED
)

// Vị trí quảng cáo
const (
	AdPositionLeft  = "LEFT"
	AdPositionRight = "RIGHT"
	AdPositionPopup = "POPUP"
)

// User đại diện tài khoản trong hệ thống
type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	FullName     string    `json:"full_name"`
	PasswordHash string    `json:"-"`
	Roles        []string  `json:"roles"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// RoleInfo mô tả chi tiết vai trò và danh sách quyền
type RoleInfo struct {
	Name        string   `json:"name"`
	DisplayName string   `json:"display_name"`
	Description string   `json:"description"`
	Permissions []string `json:"permissions"`
}

// Article đại diện cho bài viết / tin tức
type Article struct {
	ID             int        `json:"id"`
	Title          string     `json:"title"`
	Slug           string     `json:"slug"`
	Sapo           string     `json:"sapo"`
	ContentHTML    string     `json:"content_html"`
	CoverImageURL  string     `json:"cover_image_url"`
	Category       string     `json:"category"`
	AuthorID       string     `json:"author_id"`
	AuthorName     string     `json:"author_name"`
	Status         string     `json:"status"`
	Version        int        `json:"version"`
	HolderID       *string    `json:"holder_id,omitempty"`
	HolderName     *string    `json:"holder_name,omitempty"`
	L1ReviewerID   *string    `json:"l1_reviewer_id,omitempty"`
	L1ApprovedAt   *time.Time `json:"l1_approved_at,omitempty"`
	L2ReviewerID   *string    `json:"l2_reviewer_id,omitempty"`
	L2ApprovedAt   *time.Time `json:"l2_approved_at,omitempty"`
	PublishedAt    *time.Time `json:"published_at,omitempty"`
	ViewCount      int        `json:"view_count"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

// ArticleStatusLog nhật ký chuyển trạng thái duyệt bài
type ArticleStatusLog struct {
	ID         int       `json:"id"`
	ArticleID  int       `json:"article_id"`
	FromStatus string    `json:"from_status"`
	ToStatus   string    `json:"to_status"`
	Action     string    `json:"action"`
	ActorID    string    `json:"actor_id"`
	ActorName  string    `json:"actor_name"`
	Reason     string    `json:"reason"`
	CreatedAt  time.Time `json:"created_at"`
}

// Ad đại diện cho banner quảng cáo và pop-up
type Ad struct {
	ID         int       `json:"id"`
	Name       string    `json:"name"`
	Position   string    `json:"position"` // LEFT, RIGHT, POPUP
	ImageURL   string    `json:"image_url"`
	LinkURL    string    `json:"link_url"`
	OpenNewTab bool      `json:"open_new_tab"`
	IsActive   bool      `json:"is_active"`
	Frequency  string    `json:"frequency"` // EVERY_PAGE, SESSION, DAILY
	SortOrder  int       `json:"sort_order"`
	Clicks     int       `json:"clicks"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// ProductFeature tính năng sản phẩm Chốt Lương
type ProductFeature struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Subtitle    string   `json:"subtitle"`
	Description string   `json:"description"`
	Icon        string   `json:"icon"`
	Highlights  []string `json:"highlights"`
}

// LandingData tổng hợp dữ liệu trang Landing Page Chốt Lương
type LandingData struct {
	Company struct {
		Name        string `json:"name"`
		Tagline     string `json:"tagline"`
		Description string `json:"description"`
		Phone       string `json:"phone"`
		Email       string `json:"email"`
		Address     string `json:"address"`
	} `json:"company"`
	Features []ProductFeature `json:"features"`
	Stats    []struct {
		Label string `json:"label"`
		Value string `json:"value"`
	} `json:"stats"`
	Ads struct {
		LeftBanner  *Ad `json:"left_banner,omitempty"`
		RightBanner *Ad `json:"right_banner,omitempty"`
		Popup       *Ad `json:"popup,omitempty"`
	} `json:"ads"`
	LatestNews []Article `json:"latest_news"`
}

// LeadRegistration đơn đăng ký sử dụng / dùng thử sản phẩm
type LeadRegistration struct {
	ID          int       `json:"id"`
	FullName    string    `json:"full_name"`
	Phone       string    `json:"phone"`
	Email       string    `json:"email"`
	CompanyName string    `json:"company_name"`
	CompanySize string    `json:"company_size"`
	PrimaryNeed string    `json:"primary_need"`
	Note        string    `json:"note"`
	Status      string    `json:"status"` // NEW, CONTACTED, COMPLETED
	CreatedAt   time.Time `json:"created_at"`
}


