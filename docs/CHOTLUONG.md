# Hệ Thống Landing Page & CMS Công Ty Chốt Lương

> **Kiến trúc:** Frontend ReactJS (HTML5/CSS3/JavaScript/Tailwind CSS) + Backend Go Lang (Golang 1.22+) + Cơ sở dữ liệu PostgreSQL 16.  
> **Thương hiệu & Nhận diện:** Công ty Cổ phần Giải pháp Công nghệ Chốt Lương (Logo, Icon từ thư mục `Logo/`).

---

## 1. Tổng quan các yêu cầu đã hoàn thành

| Yêu cầu | Mô tả chi tiết & Công nghệ triển khai | Trạng thái |
|---|---|:---:|
| **Landing Page** | Giới thiệu công ty Chốt Lương, định vị sản phẩm: **Phần mềm Quản trị Nhân sự tổng thể (HRM & Payroll) cho khối SME**. | ✅ |
| **Sản phẩm & Tính năng** | 4 Module cốt lõi: Chấm công đa kênh (FaceID & GPS), Chốt lương tự động 1 chạm, Phiếu lương điện tử App bảo mật mã PIN, Hồ sơ & Hợp đồng lao động số, Tạm ứng lương (EWA). | ✅ |
| **Form Đăng ký Sản phẩm** | Form đăng ký dùng thử / sử dụng sản phẩm cho doanh nghiệp SME, thiết kế nổi bật với hiệu ứng **Radial Gradient**, lưu cơ sở dữ liệu `cl_registrations`. | ✅ |
| **Đăng Tin tức** | Mục bản tin & kiến thức quản trị nhân sự, hiển thị tin đã xuất bản (PUBLISHED), popup đọc bài viết chi tiết, đếm lượt xem. | ✅ |
| **Quảng cáo & Banner** | **Banner bên trái** (160px sticky), **Banner bên phải** (160px sticky) cố định 2 bên màn hình rộng, có nút đóng và theo dõi lượt click (`/api/public/ads/:id/click`). | ✅ |
| **Banner Hero & Pop-up** | Banner trình chiếu sinh động, **Pop-up ưu đãi SME** hiển thị thông minh sau 1.5 giây, lưu tần suất vào `sessionStorage`. | ✅ |
| **Hình ảnh & Logo** | Sử dụng ảnh nhẹ tối ưu và tài nguyên nhận diện trong thư mục `Logo/`: `Logo_chotluong.png`, `Logo App chot luong.png`, `Logo App chot luong.ico`. | ✅ |
| **Backend Go Lang** | RESTful API viết bằng **Go Lang**, xử lý xác thực JWT, RBAC, kết nối PostgreSQL với pooling, tự động migration và seed dữ liệu. | ✅ |
| **Cơ sở dữ liệu** | PostgreSQL 16 (`cl_users`, `cl_roles`, `cl_articles`, `cl_article_status_logs`, `cl_ads`). | ✅ |
| **Admin CMS** | Quản lý vai trò & phân quyền (RBAC), CRUD bài viết, **Duyệt bài 2 cấp** (Cấp 1 & Cấp 2 có bắt buộc lý do), quản lý quảng cáo. | ✅ |

---

## 2. Kiến trúc & Công nghệ

### 2.1 Backend (Go Lang) — Thư mục `backend/`
- **Ngôn ngữ:** Go (Golang 1.22+).
- **Cơ sở dữ liệu:** PostgreSQL (driver `github.com/lib/pq`).
- **Xác thực:** JWT Token (`github.com/golang-jwt/jwt/v5`), Mật khẩu băm an toàn bằng `bcrypt` (`golang.org/x/crypto/bcrypt`).
- **Quy trình duyệt bài 2 cấp (State Machine):** Triển khai máy trạng thái nghiêm ngặt trong `internal/workflow/machine.go`, ghi nhận vết kiểm toán `cl_article_status_logs` cho mỗi thao tác.
- **Serve Static:** Tự động phục vụ giao diện React Frontend tĩnh (`frontend/dist`) khi truy cập cổng 8080.

### 2.2 Frontend (ReactJS) — Thư mục `frontend/`
- **Framework:** React 18, Vite 6, TypeScript, Tailwind CSS 3.4.
- **Biểu tượng:** `lucide-react`.
- **Thư mục public:** Chứa trực tiếp `logo.png`, `app-icon.png`, `favicon.ico` trích xuất từ thư mục `Logo/`.
- **Mã nguồn thành phần:**
  - `Navbar.tsx`: Thanh điều hướng, menu chuyên mục, nút đăng nhập CMS Admin.
  - `Hero.tsx`: Giới thiệu Chốt Lương, số liệu thống kê SME, thẻ minh họa App Chốt Lương với phiếu lương mẫu.
  - `SideBanners.tsx`: Banner dính bên trái và bên phải 160px kèm nút thu gọn / đóng và đếm click.
  - `ProductFeatures.tsx`: Giới thiệu 4 module giải pháp nhân sự và chốt lương.
  - `PricingPlans.tsx`: Bảng giá 3 gói dịch vụ thiết kế riêng cho doanh nghiệp SME.
  - `NewsSection.tsx`: Bản tin nội bộ và tin tức pháp luật lao động, kèm Modal đọc bài viết.
  - `AdPopup.tsx`: Hộp thoại Pop-up khuyến mãi xuất hiện thông minh.
  - `Footer.tsx`: Chân trang với thông tin công ty, hotline, địa chỉ, bản quyền.
  - `AdminCMS.tsx`: Ứng dụng CMS quản trị tích hợp với 6 màn hình chức năng.

---

## 3. Tài khoản Demo kiểm thử CMS

| Email đăng nhập | Mật khẩu | Vai trò | Quyền hạn chính |
|---|---|---|---|
| `admin@chotluong.vn` | `Admin@123` | **ADMIN** | Toàn quyền quản trị tài khoản, phân quyền vai trò, quản lý quảng cáo |
| `tbt@chotluong.vn` | `Tbt@123` | **EDITOR_L2** | Thư ký tòa soạn / TBT: Nhận bài cấp 2, **Phê duyệt xuất bản**, trả về cấp 1, từ chối |
| `btv@chotluong.vn` | `Btv@123` | **EDITOR_L1** | Biên tập viên: Nhận bài cấp 1, **Sơ duyệt chuyển cấp 2**, trả lại tác giả sửa có lý do |
| `phongvien@chotluong.vn` | `Pv@123` | **REPORTER** | Phóng viên: Soạn thảo bài nháp (DRAFT), **Gửi duyệt Cấp 1**, Rút bài về sửa |

*(Trên form đăng nhập CMS có sẵn các nút bấm 1 chạm để tự điền nhanh thông tin từng tài khoản).*

---

## 4. Bảng chuyển trạng thái Quy trình duyệt bài 2 cấp

| Trạng thái hiện tại | Hành động (`Action`) | Trạng thái mới | Đối tượng thực hiện | Bắt buộc nhập lý do |
|---|---|---|---|:---:|
| `DRAFT` | `SUBMIT` | `PENDING_L1` | Tác giả bài viết | Không |
| `PENDING_L1` | `WITHDRAW` | `DRAFT` | Tác giả bài viết | Không |
| `PENDING_L1` | `CLAIM_L1` | `IN_REVIEW_L1` | BTV Cấp 1 | Không |
| `IN_REVIEW_L1` | `APPROVE_L1` | `PENDING_L2` | BTV Cấp 1 đang giữ bài | Không |
| `IN_REVIEW_L1` | `RETURN_L1` | `RETURNED` | BTV Cấp 1 đang giữ bài | Có |
| `IN_REVIEW_L1` | `REJECT_L1` | `REJECTED` | BTV Cấp 1 đang giữ bài | Có |
| `PENDING_L2` | `CLAIM_L2` | `IN_REVIEW_L2` | Thư ký / TBT Cấp 2 | Không |
| `IN_REVIEW_L2` | `PUBLISH` | `PUBLISHED` | Thư ký / TBT đang giữ bài | Không |
| `IN_REVIEW_L2` | `SEND_BACK_L1` | `PENDING_L1` | Thư ký / TBT đang giữ bài | Có |
| `IN_REVIEW_L2` | `RETURN_L2` | `RETURNED` | Thư ký / TBT đang giữ bài | Có |
| `IN_REVIEW_L2` | `REJECT_L2` | `REJECTED` | Thư ký / TBT đang giữ bài | Có |
| `RETURNED` | `RESUBMIT` | `PENDING_L1` | Tác giả bài viết | Không |
| `PUBLISHED` | `UNPUBLISH` | `UNPUBLISHED` | TBT / Admin | Có |

---

## 5. Hướng dẫn khởi chạy

### Cách 1: Chạy trực tiếp máy chủ Go (Đã tích hợp Frontend)
Nhấp đúp vào file `start-chotluong.cmd` ở thư mục gốc, hoặc mở PowerShell:

```powershell
cd backend
.\server.exe
```
Truy cập trình duyệt: **http://localhost:8080**

### Cách 2: Chạy chế độ Development (Hot Reloading)
- **Terminal 1 (Backend Go):**
  ```powershell
  cd backend
  go run ./cmd/server
  ```
- **Terminal 2 (Frontend React Vite):**
  ```powershell
  cd frontend
  pnpm dev
  ```
Truy cập trình duyệt dev: **http://localhost:3000** (tự động proxy API sang port 8080).

---

## 6. Cấu trúc thư mục Đa phương tiện & Gradient Design System

### 6.1 Cấu trúc thư mục Hình ảnh & Video chuẩn hóa
Tài nguyên media được phân tách thành các thư mục chuyên biệt:
```
frontend/public/
├── images/
│   ├── logos/      # logo.png, logo-app.png (nhận diện thương hiệu)
│   ├── icons/      # favicon.ico, app-icon.png (biểu tượng ứng dụng)
│   └── banners/    # banner-sme-voucher.png, banner-tet-payroll.png
└── videos/         # Thư mục lưu trữ video giới thiệu sản phẩm & hướng dẫn
    └── README.md   # Hướng dẫn định dạng video MP4/WebM tối ưu SEO & CDN
```
*(Bản sao đồng bộ cũng được lưu trữ tại `assets/` cho mục đích lưu trữ mã nguồn).*

### 6.2 Hệ thống màu Gradient toàn diện (Design System)
- **Mesh Radial Gradient:** Phối hợp các điểm cực màu `from-blue-600`, `via-indigo-600`, `to-amber-500` tạo chiều sâu hiện đại.
- **Form Đăng ký Radial Gradient:** Sử dụng bảng màu đêm sâu `radial-gradient(circle at 50% 0%, #1e3a8a 0%, #1e1b4b 45%, #0f172a 80%, #020617 100%)` kết hợp card kính mờ glassmorphism và quầng sáng trang trí.
- **Header Topline & CTA:** Đường viền gradient phát sáng chạy dọc mép trên navigation và toàn bộ nút kêu gọi hành động (Call To Action).
- **Hệ thống điều hướng thông minh:** Toàn bộ các nút "Dùng thử miễn phí" (trên Navbar, Hero, Feature Cards, Pricing Plans, Side Banners, Ad Popup, Footer) đều liên kết trực tiếp tới `#register`, tự động cuộn trang êm ái (smooth scroll) và trỏ tiêu điểm (auto-focus) vào ô nhập liệu để tối ưu tỷ lệ chuyển đổi.

### 6.3 Quản lý Khách hàng Đăng ký (Leads CRM) trong CMS
- Bảng cơ sở dữ liệu `cl_registrations`: Lưu trữ họ tên, số điện thoại, email, tên công ty, quy mô nhân sự, gói dịch vụ quan tâm và ghi chú nhu cầu.
- Quản trị viên CMS có thể cập nhật luồng xử lý khách hàng qua 5 trạng thái:
  - **NEW** (Mới đăng ký)
  - **CONTACTED** (Đã liên hệ tư vấn)
  - **TRIALING** (Đang trong thời gian dùng thử)
  - **CONVERTED** (Chốt hợp đồng thành công)
  - **CANCELLED** (Hủy bỏ / Không liên lạc được)


