export interface User {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleInfo {
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  sapo: string;
  content_html: string;
  cover_image_url: string;
  category: string;
  author_id: string;
  author_name: string;
  status: string;
  version: number;
  holder_id?: string;
  holder_name?: string;
  l1_reviewer_id?: string;
  l1_approved_at?: string;
  l2_reviewer_id?: string;
  l2_approved_at?: string;
  published_at?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ArticleStatusLog {
  id: number;
  article_id: number;
  from_status: string;
  to_status: string;
  action: string;
  actor_id: string;
  actor_name: string;
  reason: string;
  created_at: string;
}

export interface Ad {
  id: number;
  name: string;
  position: 'LEFT' | 'RIGHT' | 'POPUP';
  image_url: string;
  link_url?: string;
  open_new_tab: boolean;
  is_active: boolean;
  frequency: string;
  sort_order: number;
  clicks: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFeature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  highlights: string[];
}

export interface LandingData {
  company: {
    name: string;
    tagline: string;
    description: string;
    phone: string;
    email: string;
    address: string;
  };
  features: ProductFeature[];
  stats: { label: string; value: string }[];
  ads: {
    left_banner?: Ad;
    right_banner?: Ad;
    popup?: Ad;
  };
  latest_news: Article[];
}

export interface LeadRegistration {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  company_name: string;
  company_size: string;
  primary_need: string;
  note?: string;
  status: 'NEW' | 'CONTACTED' | 'COMPLETED';
  created_at: string;
}

export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
}



