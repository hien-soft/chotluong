package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"chotluong-backend/internal/models"

	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

var DB *sql.DB

// InitDB mở kết nối tới PostgreSQL
func InitDB(connStr string) (*sql.DB, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("không thể mở kết nối database: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("không thể ping database: %w", err)
	}

	DB = db
	log.Println(" Kết nối PostgreSQL thành công!")

	if err := AutoMigrate(db); err != nil {
		return nil, fmt.Errorf("lỗi migration database: %w", err)
	}

	if err := SeedData(db); err != nil {
		return nil, fmt.Errorf("lỗi seed dữ liệu: %w", err)
	}

	return db, nil
}

// AutoMigrate tạo các bảng cho hệ thống Chốt Lương nếu chưa tồn tại
func AutoMigrate(db *sql.DB) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS cl_users (
			id VARCHAR(64) PRIMARY KEY,
			email VARCHAR(255) UNIQUE NOT NULL,
			full_name VARCHAR(255) NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			roles TEXT[] NOT NULL DEFAULT '{"REPORTER"}',
			is_active BOOLEAN DEFAULT TRUE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,

		`CREATE TABLE IF NOT EXISTS cl_roles (
			name VARCHAR(50) PRIMARY KEY,
			display_name VARCHAR(100) NOT NULL,
			description TEXT,
			permissions TEXT[] NOT NULL
		);`,

		`CREATE TABLE IF NOT EXISTS cl_articles (
			id SERIAL PRIMARY KEY,
			title VARCHAR(500) NOT NULL,
			slug VARCHAR(500) NOT NULL,
			sapo TEXT,
			content_html TEXT NOT NULL,
			cover_image_url TEXT,
			category VARCHAR(100) DEFAULT 'Tin tức',
			author_id VARCHAR(64) REFERENCES cl_users(id) ON DELETE SET NULL,
			author_name VARCHAR(255),
			status VARCHAR(50) DEFAULT 'DRAFT',
			version INT DEFAULT 1,
			holder_id VARCHAR(64) REFERENCES cl_users(id) ON DELETE SET NULL,
			l1_reviewer_id VARCHAR(64) REFERENCES cl_users(id) ON DELETE SET NULL,
			l1_approved_at TIMESTAMP WITH TIME ZONE,
			l2_reviewer_id VARCHAR(64) REFERENCES cl_users(id) ON DELETE SET NULL,
			l2_approved_at TIMESTAMP WITH TIME ZONE,
			published_at TIMESTAMP WITH TIME ZONE,
			view_count INT DEFAULT 0,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,

		`CREATE TABLE IF NOT EXISTS cl_article_status_logs (
			id SERIAL PRIMARY KEY,
			article_id INT REFERENCES cl_articles(id) ON DELETE CASCADE,
			from_status VARCHAR(50) NOT NULL,
			to_status VARCHAR(50) NOT NULL,
			action VARCHAR(50) NOT NULL,
			actor_id VARCHAR(64) NOT NULL,
			actor_name VARCHAR(255) NOT NULL,
			reason TEXT,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,

		`CREATE TABLE IF NOT EXISTS cl_ads (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			position VARCHAR(50) NOT NULL,
			image_url TEXT NOT NULL,
			link_url TEXT,
			open_new_tab BOOLEAN DEFAULT TRUE,
			is_active BOOLEAN DEFAULT TRUE,
			frequency VARCHAR(50) DEFAULT 'SESSION',
			sort_order INT DEFAULT 0,
			clicks INT DEFAULT 0,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,

		`CREATE TABLE IF NOT EXISTS cl_registrations (
			id SERIAL PRIMARY KEY,
			full_name VARCHAR(255) NOT NULL,
			phone VARCHAR(50) NOT NULL,
			email VARCHAR(255) NOT NULL,
			company_name VARCHAR(255) NOT NULL,
			company_size VARCHAR(100) DEFAULT '20 - 50 người',
			primary_need VARCHAR(255) DEFAULT 'Quản lý toàn diện HRM & Payroll',
			note TEXT,
			status VARCHAR(50) DEFAULT 'NEW',
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,
	}

	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			return fmt.Errorf("lỗi thực thi query migrate [%s]: %w", q, err)
		}
	}

	log.Println(" Khởi tạo cấu trúc bảng PostgreSQL thành công!")
	return nil
}

// SeedData tạo dữ liệu mẫu cho hệ thống
func SeedData(db *sql.DB) error {
	// 1. Roles & Permissions catalog
	roles := []models.RoleInfo{
		{
			Name:        models.RoleAdmin,
			DisplayName: "Quản trị hệ thống (Admin)",
			Description: "Toàn quyền quản trị tài khoản, phân quyền vai trò, quản lý quảng cáo và hệ thống",
			Permissions: []string{"user.manage", "role.manage", "ads.manage", "article.viewAll", "audit.viewAll"},
		},
		{
			Name:        models.RoleEditorL2,
			DisplayName: "Duyệt cấp 2 (Thư ký tòa soạn / TBT)",
			Description: "Quyền tiếp nhận bài cấp 2, duyệt và xuất bản bài viết, trả về cấp 1, từ chối hoặc gỡ bài",
			Permissions: []string{"review.l2.view", "review.l2.act", "article.publish", "article.unpublish", "ads.manage"},
		},
		{
			Name:        models.RoleEditorL1,
			DisplayName: "Duyệt cấp 1 (Biên tập viên)",
			Description: "Quyền tiếp nhận bài từ phóng viên, sơ duyệt, chuyển tiếp lên cấp 2 hoặc trả lại yêu cầu sửa đổi",
			Permissions: []string{"review.l1.view", "review.l1.act", "article.edit"},
		},
		{
			Name:        models.RoleReporter,
			DisplayName: "Phóng viên / CTV nội dung",
			Description: "Quyền tạo bản nháp, chỉnh sửa bài của mình, gửi duyệt và rút bài chờ duyệt",
			Permissions: []string{"article.create", "article.editOwn", "article.submitOwn", "article.withdrawOwn"},
		},
	}

	for _, r := range roles {
		_, err := db.Exec(`
			INSERT INTO cl_roles (name, display_name, description, permissions)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (name) DO UPDATE SET
				display_name = EXCLUDED.display_name,
				description = EXCLUDED.description,
				permissions = EXCLUDED.permissions;
		`, r.Name, r.DisplayName, r.Description, pq.Array(r.Permissions))
		if err != nil {
			return err
		}
	}

	// 2. Default Users
	defaultUsers := []struct {
		ID       string
		Email    string
		FullName string
		Password string
		Roles    []string
	}{
		{"usr-admin", "admin@chotluong.vn", "Quản trị viên Chốt Lương", "Admin@123", []string{models.RoleAdmin}},
		{"usr-tbt", "tbt@chotluong.vn", "Nguyễn Văn Thư Ký (Duyệt Cấp 2)", "Tbt@123", []string{models.RoleEditorL2}},
		{"usr-btv", "btv@chotluong.vn", "Trần Thị Biên Tập (Duyệt Cấp 1)", "Btv@123", []string{models.RoleEditorL1}},
		{"usr-pv", "phongvien@chotluong.vn", "Lê Văn Phóng Viên", "Pv@123", []string{models.RoleReporter}},
		{"usr-lead", "tongbien@chotluong.vn", "Hoàng Tổng Biên Tập (Toàn quyền duyệt)", "Lead@123", []string{models.RoleAdmin, models.RoleEditorL2, models.RoleEditorL1, models.RoleReporter}},
	}

	for _, u := range defaultUsers {
		hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		_, err = db.Exec(`
			INSERT INTO cl_users (id, email, full_name, password_hash, roles, is_active)
			VALUES ($1, $2, $3, $4, $5, true)
			ON CONFLICT (email) DO NOTHING;
		`, u.ID, u.Email, u.FullName, string(hash), pq.Array(u.Roles))
		if err != nil {
			return err
		}
	}

	// 3. Sample Articles
	var articleCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM cl_articles").Scan(&articleCount); err == nil && articleCount == 0 {
		now := time.Now()
		articles := []struct {
			Title         string
			Slug          string
			Sapo          string
			ContentHTML   string
			CoverURL      string
			Category      string
			AuthorID      string
			AuthorName    string
			Status        string
			PublishedAt   *time.Time
		}{
			{
				Title:       "Công ty Chốt Lương ra mắt giải pháp Chấm công & Tính lương tự động dành riêng cho SME",
				Slug:        "cong-ty-chot-luong-ra-mat-giai-phap-hrm-payroll-cho-sme",
				Sapo:        "Chốt Lương tiên phong cung cấp giải pháp số hóa toàn diện quy trình nhân sự, từ chấm công định vị GPS đến tính toán và chốt bảng lương chính xác trong 3 phút.",
				ContentHTML: `<p>Thấu hiểu những khó khăn của các doanh nghiệp vừa và nhỏ (SME) tại Việt Nam khi cuối tháng HR và kế toán phải căng mình xử lý hàng trăm bảng chấm công, tính toán tăng ca, phạt đi muộn, BHXH và thuế TNCN, <strong>Công ty Cổ phần Công nghệ Chốt Lương</strong> chính thức ra mắt hệ thống phần mềm HRM & Payroll thế hệ mới.</p><h3>Những tính năng đột phá của Chốt Lương:</h3><ul><li><strong>Chấm công đa kênh:</strong> Tích hợp FaceID, GPS chống gian lận, kết nối trực tiếp Wifi văn phòng.</li><li><strong>Công thức tính lương linh hoạt:</strong> Tự động cập nhật quy định đóng BHXH mới nhất, biểu thuế lũy tiến và cơ chế thưởng KPI.</li><li><strong>Phiếu lương điện tử 1 chạm:</strong> Nhân viên nhận bảng kê lương chi tiết trực tiếp trên App di động có mã bảo mật cá nhân.</li></ul><p>Đại diện công ty cho biết, hệ thống đã giúp hơn 500+ doanh nghiệp tiết kiệm 85% thời gian chốt lương và giảm thiểu 100% sai sót số liệu.</p>`,
				CoverURL:    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80",
				Category:    "Tin công ty",
				AuthorID:    "usr-pv",
				AuthorName:  "Lê Văn Phóng Viên",
				Status:      models.StatusPublished,
				PublishedAt: &now,
			},
			{
				Title:       "Xu hướng chuyển đổi số quy trình Quản trị Nhân sự (HRM) năm 2026",
				Slug:        "xu-huong-chuyen-doi-so-hrm-2026",
				Sapo:        "Phần mềm quản trị nhân sự trên đám mây kết hợp ứng lương linh hoạt (EWA) đang trở thành tiêu chuẩn mới giúp doanh nghiệp giữ chân nhân tài.",
				ContentHTML: `<p>Chuyển đổi số nhân sự không còn là sự lựa chọn mà đã trở thành yêu cầu bắt buộc đối với mọi doanh nghiệp muốn tối ưu hóa chi phí vận hành.</p><p>Tại Việt Nam, tỷ lệ nhân sự gen Z và thế hệ số gia tăng nhanh chóng đòi hỏi các phương thức quản trị minh bạch, tức thì. Tính năng tạm ứng lương linh hoạt (Earned Wage Access - EWA) trên ứng dụng Chốt Lương cho phép người lao động chủ động nhận trước phần lương đã làm, giảm bớt áp lực tài chính ngắn hạn mà không phát sinh thêm gánh nặng thủ tục cho phòng kế toán.</p>`,
				CoverURL:    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
				Category:    "Kiến thức Quản trị",
				AuthorID:    "usr-pv",
				AuthorName:  "Lê Văn Phóng Viên",
				Status:      models.StatusPublished,
				PublishedAt: &now,
			},
			{
				Title:       "Cẩm nang tính lương, BHXH và Thuế TNCN chuẩn quy định mới cho kế toán doanh nghiệp",
				Slug:        "cam-nang-tinh-luong-bhxh-thue-tncn-2026",
				Sapo:        "Tổng hợp các thay đổi trọng yếu về mức lương tối thiểu vùng, tỷ lệ trích nộp các khoản bảo hiểm và quy định giảm trừ gia cảnh.",
				ContentHTML: `<p>Quy định về tiền lương và bảo hiểm xã hội liên tục được cập nhật. Để hạn chế sai sót khi chốt bảng lương cuối tháng, doanh nghiệp nên ứng dụng các giải pháp tự động hóa như Chốt Lương nhằm đảm bảo tuân thủ 100% chính sách pháp luật hiện hành.</p>`,
				CoverURL:    "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80",
				Category:    "Pháp luật Lao động",
				AuthorID:    "usr-pv",
				AuthorName:  "Lê Văn Phóng Viên",
				Status:      models.StatusPendingL1,
				PublishedAt: nil,
			},
			{
				Title:       "Chốt Lương mở rộng hợp tác cùng các ngân hàng thương mại phát triển gói giải pháp chi hộ lương tự động",
				Slug:        "chot-luong-hop-tac-ngan-hang-chi-ho-luong",
				Sapo:        "Giải pháp tích hợp API Open Banking giúp kế toán thực hiện lệnh chi trả lương hàng loạt tới tất cả các ngân hàng chỉ trong 1 thao tác.",
				ContentHTML: `<p>Dự án hợp tác chiến lược giữa Chốt Lương và hệ thống ngân hàng giúp rút ngắn quy trình phê duyệt thanh toán lương của ban lãnh đạo doanh nghiệp, đảm bảo tiền về tài khoản nhân viên đúng hẹn vào ngày quy định.</p>`,
				CoverURL:    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
				Category:    "Tin công ty",
				AuthorID:    "usr-btv",
				AuthorName:  "Trần Thị Biên Tập",
				Status:      models.StatusPendingL2,
				PublishedAt: nil,
			},
		}

		for _, a := range articles {
			var artID int
			err := db.QueryRow(`
				INSERT INTO cl_articles (title, slug, sapo, content_html, cover_image_url, category, author_id, author_name, status, published_at)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
				RETURNING id;
			`, a.Title, a.Slug, a.Sapo, a.ContentHTML, a.CoverURL, a.Category, a.AuthorID, a.AuthorName, a.Status, a.PublishedAt).Scan(&artID)
			if err != nil {
				return err
			}

			// Ghi log trạng thái ban đầu
			_, _ = db.Exec(`
				INSERT INTO cl_article_status_logs (article_id, from_status, to_status, action, actor_id, actor_name, reason)
				VALUES ($1, 'NONE', $2, 'INITIAL_SEED', $3, $4, 'Khởi tạo dữ liệu mẫu');
			`, artID, a.Status, a.AuthorID, a.AuthorName)
		}
	}

	// 4. Sample Ads (Quảng cáo bên trái, bên phải, Popup)
	var adCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM cl_ads").Scan(&adCount); err == nil && adCount == 0 {
		sampleAds := []models.Ad{
			{
				Name:       "Banner Trái - Tải App Chốt Lương",
				Position:   models.AdPositionLeft,
				ImageURL:   "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=320&auto=format&fit=crop&q=80",
				LinkURL:    "#products",
				OpenNewTab: false,
				IsActive:   true,
				Frequency:  "SESSION",
				SortOrder:  1,
			},
			{
				Name:       "Banner Phải - Đăng ký Demo Doanh Nghiệp SME",
				Position:   models.AdPositionRight,
				ImageURL:   "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=320&auto=format&fit=crop&q=80",
				LinkURL:    "#contact",
				OpenNewTab: false,
				IsActive:   true,
				Frequency:  "SESSION",
				SortOrder:  1,
			},
			{
				Name:       "Popup Khuyến Mãi - Tặng 3 tháng dùng thử",
				Position:   models.AdPositionPopup,
				ImageURL:   "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
				LinkURL:    "#pricing",
				OpenNewTab: false,
				IsActive:   true,
				Frequency:  "SESSION",
				SortOrder:  1,
			},
		}

		for _, ad := range sampleAds {
			_, err := db.Exec(`
				INSERT INTO cl_ads (name, position, image_url, link_url, open_new_tab, is_active, frequency, sort_order)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
			`, ad.Name, ad.Position, ad.ImageURL, ad.LinkURL, ad.OpenNewTab, ad.IsActive, ad.Frequency, ad.SortOrder)
			if err != nil {
				return err
			}
		}
	}

	// 5. Sample Lead Registration
	var regCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM cl_registrations").Scan(&regCount); err == nil && regCount == 0 {
		_, _ = db.Exec(`
			INSERT INTO cl_registrations (full_name, phone, email, company_name, company_size, primary_need, note, status)
			VALUES ('Nguyễn Thành Long', '0912345678', 'long.nt@techviet.vn', 'Công ty Cổ phần TechViet', '50 - 200 người', 'Tự động tính & chốt lương 1 chạm', 'Cần tư vấn triển khai dùng thử gói Tăng Trưởng', 'NEW');
		`)
	}

	log.Println(" Seed dữ liệu mẫu Chốt Lương thành công!")
	return nil
}

