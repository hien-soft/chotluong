import { Article, ArticleStatusLog, Ad, LandingData, User, RoleInfo, LeadRegistration } from './types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('cl_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Demo fallback data for GitHub Pages / Static Hosting
const DEMO_USERS: Record<string, User> = {
  'admin@chotluong.vn': {
    id: 'usr_admin',
    email: 'admin@chotluong.vn',
    full_name: 'Quản trị viên Hệ thống',
    roles: ['ADMIN'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'tbt@chotluong.vn': {
    id: 'usr_tbt',
    email: 'tbt@chotluong.vn',
    full_name: 'Trần Văn Tổng Biên Tập',
    roles: ['EDITOR_L2'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'btv@chotluong.vn': {
    id: 'usr_btv',
    email: 'btv@chotluong.vn',
    full_name: 'Lê Thị Biên Tập Viên (Cấp 1)',
    roles: ['EDITOR_L1'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'phongvien@chotluong.vn': {
    id: 'usr_pv',
    email: 'phongvien@chotluong.vn',
    full_name: 'Nguyễn Văn Phóng Viên',
    roles: ['REPORTER'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

const FALLBACK_LANDING_DATA: LandingData = {
  company: {
    name: 'Công ty Cổ phần Giải pháp Công nghệ Chốt Lương',
    tagline: 'Nền tảng Quản trị Nhân sự & Tính lương tự động số 1 cho Doanh nghiệp SME',
    description: 'Chốt Lương giúp doanh nghiệp tự động hóa 100% quy trình từ chấm công GPS/Wifi/FaceID, tự động tính thuế, BHXH, phụ cấp và chốt bảng lương chính xác chỉ trong 3 phút.',
    phone: '1900 6868',
    email: 'contact@chotluong.vn',
    address: 'Tòa nhà Innovation Hub, Phố Duy Tân, Cầu Giấy, Hà Nội',
  },
  features: [
    {
      id: 'timekeeping',
      title: 'Chấm công Đa kênh Thông minh',
      subtitle: 'Chính xác - Chống gian lận - Tức thì',
      description: 'Tích hợp công nghệ nhận diện khuôn mặt AI (FaceID), định vị GPS theo bán kính cho phép và kết nối Wifi văn phòng. Dữ liệu đồng bộ tức thì lên hệ thống đám mây.',
      icon: 'ClockIcon',
      highlights: ['Chấm công FaceID siêu nhạy 0.2s', 'Định vị GPS chống chấm công hộ', 'Đơn từ nghỉ phép, làm thêm giờ duyệt online'],
    },
    {
      id: 'payroll',
      title: 'Chốt Lương Tự Động 1 Chạm',
      subtitle: 'Tiết kiệm 85% thời gian kế toán',
      description: 'Hệ thống tự động tổng hợp công, phép, phụ cấp, hoa hồng, làm thêm giờ, tự động trích nộp BHXH và tính thuế TNCN lũy tiến chuẩn 100% theo quy định pháp luật.',
      icon: 'CalculatorIcon',
      highlights: ['Tự động tính công thức lương phức tạp', 'Cập nhật biểu thuế TNCN & BHXH mới nhất', 'Bảng lương chi tiết từng nhân viên'],
    },
    {
      id: 'eslip',
      title: 'Phiếu Lương Điện Tử Bảo Mật',
      subtitle: 'Gửi trực tiếp qua App Chốt Lương',
      description: 'Không còn in ấn giấy hay gửi email thủ công. Nhân viên mở App xem chi tiết phiếu lương với lớp khóa mã PIN bảo mật, phản hồi thắc mắc ngay trên ứng dụng.',
      icon: 'DocumentTextIcon',
      highlights: ['Gửi phiếu lương đồng loạt 1000+ nhân sự trong 5 giây', 'Mã PIN bảo vệ thông tin thu nhập riêng tư', 'Ký nhận phiếu lương số trực tiếp'],
    },
    {
      id: 'hrm',
      title: 'Hồ Sơ Nhân Sự & Hợp Đồng Số',
      subtitle: 'Quản lý vòng đời nhân viên toàn diện',
      description: 'Số hóa toàn bộ hồ sơ nhân sự, hợp đồng lao động điện tử có giá trị pháp lý, nhắc nhở hạn hết hợp đồng, sinh nhật, thăng tiến tự động.',
      icon: 'UserGroupIcon',
      highlights: ['Hợp đồng lao động điện tử', 'Cảnh báo hết hạn hợp đồng, nâng lương', 'Sơ đồ tổ chức phân cấp linh hoạt'],
    },
  ],
  stats: [
    { label: 'Doanh nghiệp tin dùng', value: '1,200+' },
    { label: 'Phiếu lương phát hành mỗi tháng', value: '150,000+' },
    { label: 'Thời gian chốt lương trung bình', value: '3 Phút' },
    { label: 'Mức độ hài lòng của HR & Quản lý', value: '99.4%' },
  ],
  ads: {
    left_banner: {
      id: 1,
      name: 'Voucher 30% SME Khởi Nghiệp',
      position: 'LEFT',
      image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=320&auto=format&fit=crop&q=80',
      link_url: '#register',
      open_new_tab: false,
      is_active: true,
      frequency: 'ALWAYS',
      sort_order: 1,
      clicks: 142,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    right_banner: {
      id: 2,
      name: 'Giải Pháp Tính Lương Tết 2026',
      position: 'RIGHT',
      image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=320&auto=format&fit=crop&q=80',
      link_url: '#register',
      open_new_tab: false,
      is_active: true,
      frequency: 'ALWAYS',
      sort_order: 2,
      clicks: 98,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    popup: {
      id: 3,
      name: 'Ưu đãi Đặc quyền Dùng thử 30 ngày',
      position: 'POPUP',
      image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80',
      link_url: '#register',
      open_new_tab: false,
      is_active: true,
      frequency: 'ONCE_PER_SESSION',
      sort_order: 1,
      clicks: 45,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  latest_news: [
    {
      id: 1,
      title: 'Chính sách mới về mức đóng BHXH và Thuế thu nhập cá nhân áp dụng từ năm 2026',
      slug: 'chinh-sach-moi-ve-muc-dong-bhxh-va-thue-tncn-2026',
      sapo: 'Tổng hợp các quy định pháp luật mới nhất liên quan đến quyền lợi người lao động và nghĩa vụ của doanh nghiệp SME.',
      content_html: '<p>Chi tiết các thay đổi về mức đóng BHXH bắt buộc và biểu thuế lũy tiến từng phần theo quy định mới nhất hiện hành...</p>',
      cover_image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
      category: 'PHAP_LUAT',
      author_id: '1',
      author_name: 'ThS. Nguyễn Văn Quản Trị',
      status: 'PUBLISHED',
      version: 1,
      published_at: new Date().toISOString(),
      view_count: 532,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Bí quyết giúp doanh nghiệp SME tiết kiệm 80% thời gian chốt lương hàng tháng',
      slug: 'bi-quyet-tiet-kiem-80-phan-tram-thoi-gian-chot-luong',
      sapo: 'Kinh nghiệm triển khai chuyển đổi số quy trình chấm công và tính lương thực chiến từ hơn 1,200 khách hàng Chốt Lương.',
      content_html: '<p>Tự động hóa giúp loại bỏ hoàn toàn các sai sót nhập liệu thủ công trong quá trình tổng hợp ngày công và chốt bảng lương...</p>',
      cover_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      category: 'KY_NANG',
      author_id: '1',
      author_name: 'Ban Biên Tập Chốt Lương',
      status: 'PUBLISHED',
      version: 1,
      published_at: new Date().toISOString(),
      view_count: 384,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

// 1. PUBLIC APIS
export async function getLandingData(): Promise<LandingData> {
  try {
    const res = await fetch(`${API_BASE}/public/landing`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Static / GitHub Pages fallback
  }
  return FALLBACK_LANDING_DATA;
}

export async function getPublicNews(): Promise<Article[]> {
  try {
    const res = await fetch(`${API_BASE}/public/news`);
    if (res.ok) return await res.json();
  } catch (err) {}
  return FALLBACK_LANDING_DATA.latest_news;
}

export async function getPublicArticle(slug: string): Promise<Article> {
  try {
    const res = await fetch(`${API_BASE}/public/news/${slug}`);
    if (res.ok) return await res.json();
  } catch (err) {}
  const found = FALLBACK_LANDING_DATA.latest_news.find(a => a.slug === slug);
  if (found) return found;
  return FALLBACK_LANDING_DATA.latest_news[0];
}

export async function getPublicAds(): Promise<{ left?: Ad; right?: Ad; popup?: Ad }> {
  try {
    const res = await fetch(`${API_BASE}/public/ads`);
    if (res.ok) return await res.json();
  } catch (err) {}
  return {
    left: FALLBACK_LANDING_DATA.ads.left_banner,
    right: FALLBACK_LANDING_DATA.ads.right_banner,
    popup: FALLBACK_LANDING_DATA.ads.popup,
  };
}

export async function recordAdClick(adId: number): Promise<void> {
  try {
    await fetch(`${API_BASE}/public/ads/${adId}/click`, { method: 'POST' });
  } catch (err) {}
}

// 2. AUTH APIS
export async function loginApi(email: string, password: string): Promise<{ token: string; user: User }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Demo fallback for GitHub Pages
  }

  // Check demo credentials
  if (DEMO_USERS[email]) {
    const user = DEMO_USERS[email];
    return { token: `mock_token_${user.id}`, user };
  }

  throw new Error('Email hoặc mật khẩu không chính xác');
}

export async function getMeApi(): Promise<User> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    if (res.ok) return await res.json();
  } catch (err) {}

  const token = localStorage.getItem('cl_token');
  if (token && token.startsWith('mock_token_')) {
    const userId = token.replace('mock_token_', '');
    const user = Object.values(DEMO_USERS).find(u => u.id === userId);
    if (user) return user;
  }

  throw new Error('Phiên đăng nhập đã hết hạn');
}

// 3. ARTICLES CRUD
export async function getArticles(status?: string, category?: string): Promise<Article[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (category) params.append('category', category);

  const res = await fetch(`${API_BASE}/articles?${params.toString()}`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Lỗi tải danh sách bài viết');
  return res.json();
}

export async function getArticle(id: number): Promise<Article> {
  const res = await fetch(`${API_BASE}/articles/${id}`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Lỗi tải bài viết');
  return res.json();
}

export async function createArticle(data: Partial<Article>): Promise<{ id: number; message: string }> {
  const res = await fetch(`${API_BASE}/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi tạo bài viết');
  }
  return res.json();
}

export async function updateArticle(id: number, data: Partial<Article>): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/articles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi cập nhật bài viết');
  }
  return res.json();
}

export async function deleteArticle(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/articles/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi xóa bài viết');
  }
  return res.json();
}

// 4. WORKFLOW DUYỆT BÀI 2 CẤP
export async function getL1Queue(): Promise<Article[]> {
  const res = await fetch(`${API_BASE}/review/l1/queue`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Lỗi tải hàng đợi duyệt cấp 1');
  return res.json();
}

export async function getL2Queue(): Promise<Article[]> {
  const res = await fetch(`${API_BASE}/review/l2/queue`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Lỗi tải hàng đợi duyệt cấp 2');
  return res.json();
}

export async function transitionArticle(id: number, action: string, reason?: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/articles/${id}/transition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ action, reason }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi chuyển trạng thái duyệt');
  }
  return res.json();
}

export async function getArticleLogs(id: number): Promise<ArticleStatusLog[]> {
  const res = await fetch(`${API_BASE}/articles/${id}/logs`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Lỗi tải nhật ký duyệt bài');
  return res.json();
}

// 5. ADS CMS
export async function getAds(): Promise<Ad[]> {
  const res = await fetch(`${API_BASE}/ads`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Lỗi tải danh sách quảng cáo');
  return res.json();
}

export async function createAd(data: Partial<Ad>): Promise<{ id: number; message: string }> {
  const res = await fetch(`${API_BASE}/ads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi thêm quảng cáo');
  }
  return res.json();
}

export async function updateAd(id: number, data: Partial<Ad>): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/ads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi cập nhật quảng cáo');
  }
  return res.json();
}

export async function deleteAd(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/ads/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi xóa quảng cáo');
  }
  return res.json();
}

// 6. USERS & ROLES
export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Lỗi tải danh sách người dùng');
  return res.json();
}

export async function createUser(data: any): Promise<{ id: string; message: string }> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi tạo người dùng');
  }
  return res.json();
}

export async function updateUser(id: string, data: any): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi cập nhật người dùng');
  }
  return res.json();
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi xóa người dùng');
  }
  return res.json();
}

export async function getRoles(): Promise<RoleInfo[]> {
  const res = await fetch(`${API_BASE}/roles`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Lỗi tải danh mục vai trò');
  return res.json();
}

// 7. PRODUCT REGISTRATION / LEADS
export async function submitRegistration(data: Partial<LeadRegistration>): Promise<{ id: number; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/public/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    // Static fallback for GitHub Pages
  }

  // Store in localStorage
  const raw = localStorage.getItem('cl_leads');
  const list = raw ? JSON.parse(raw) : [];
  const newLead: LeadRegistration = {
    id: Date.now(),
    full_name: data.full_name || '',
    phone: data.phone || '',
    email: data.email || '',
    company_name: data.company_name || '',
    company_size: data.company_size || '10-50',
    primary_need: data.primary_need || 'PRO',
    note: data.note || '',
    status: 'NEW',
    created_at: new Date().toISOString(),
  };
  list.unshift(newLead);
  localStorage.setItem('cl_leads', JSON.stringify(list));

  return {
    id: newLead.id,
    message: 'Đăng ký thành công! Chuyên viên Chốt Lương sẽ liên hệ hỗ trợ bạn trong vòng 15 phút.',
  };
}

export async function getRegistrations(): Promise<LeadRegistration[]> {
  try {
    const res = await fetch(`${API_BASE}/registrations`, {
      headers: { ...getAuthHeader() },
    });
    if (res.ok) return await res.json();
  } catch (err) {}

  const raw = localStorage.getItem('cl_leads');
  return raw ? JSON.parse(raw) : [
    {
      id: 1,
      full_name: 'Nguyễn Văn Minh',
      phone: '0912345678',
      email: 'minh.nguyen@smeviet.com',
      company_name: 'Công ty TNHH May Mặc Minh Phát',
      company_size: '50-100',
      primary_need: 'PRO',
      note: 'Cần tư vấn tính ca kíp và chốt lương tự động',
      status: 'NEW',
      created_at: new Date().toISOString(),
    }
  ];
}

export async function updateRegistrationStatus(id: number, status: string): Promise<{ message: string }> {
  try {
    const res = await fetch(`${API_BASE}/registrations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status }),
    });
    if (res.ok) return await res.json();
  } catch (err) {}

  const raw = localStorage.getItem('cl_leads');
  if (raw) {
    const list: LeadRegistration[] = JSON.parse(raw);
    const item = list.find(l => l.id === id);
    if (item) {
      item.status = status as any;
      localStorage.setItem('cl_leads', JSON.stringify(list));
    }
  }

  return { message: 'Cập nhật trạng thái khách hàng thành công!' };
}


