import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { assetUrl } from '../types';

interface FooterProps {
  company: {
    name: string;
    tagline: string;
    description: string;
    phone: string;
    email: string;
    address: string;
  };
}

export const Footer: React.FC<FooterProps> = ({ company }) => {
  const scrollToRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('register');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const input = el.querySelector('input') as HTMLInputElement;
        if (input) input.focus();
      }, 600);
    }
  };

  return (
    <footer 
      id="contact" 
      className="text-slate-300 pt-20 pb-12 relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f172a 40%, #020617 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Top glowing ambient gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-amber-400 to-indigo-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand & intro */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src={assetUrl('images/logos/logo.png')} alt="Chốt Lương" className="h-12 w-auto brightness-200" />
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {company.description || 'Nền tảng số hóa quản trị nhân sự, chấm công thông minh và tự động hóa tính lương toàn diện cho doanh nghiệp SME Việt Nam.'}
            </p>
            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{company.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Hotline tư vấn: <strong className="text-white font-bold">{company.phone}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Email hỗ trợ: <strong className="text-white font-bold">{company.email}</strong></span>
              </div>
            </div>
          </div>

          {/* Col 1: Sản phẩm */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Hệ thống Sản phẩm</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#features" className="hover:text-white transition-colors">Chấm công GPS & FaceID</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Tính & Chốt lương 1 chạm</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Phiếu lương điện tử App</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Hợp đồng lao động điện tử</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Tạm ứng lương tức thì (EWA)</a></li>
            </ul>
          </div>

          {/* Col 2: Tài nguyên */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Tài nguyên & Hỗ trợ</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#news" className="hover:text-white transition-colors">Bản tin HR & Kế toán</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Bảng giá SME</a></li>
              <li>
                <a 
                  href="#register" 
                  onClick={scrollToRegister}
                  className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Đăng ký Dùng thử 0đ
                </a>
              </li>
              <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn cài đặt App</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tài liệu API tích hợp</a></li>
            </ul>
          </div>

          {/* Col 3: Cam kết */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Bảo mật & Pháp lý</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Mã hóa AES-256 an toàn</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Hệ thống tuân thủ 100% Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân tại Việt Nam.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <img src={assetUrl('images/icons/app-icon.png')} alt="App Chốt Lương" className="w-8 h-8 rounded-lg shadow" />
                <span className="text-[11px] text-white font-semibold">Tải ngay trên App Store & Google Play</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © 2026 {company.name}. Bảo lưu mọi quyền.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-white transition-colors">Quy chế hoạt động</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
