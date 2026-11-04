import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Users2 } from 'lucide-react';
import { assetUrl } from '../types';

interface HeroProps {
  stats: { label: string; value: string }[];
  onOpenDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ stats, onOpenDemo }) => {
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
    <section 
      className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28"
      style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.12) 0%, transparent 50%), radial-gradient(circle at 85% 25%, rgba(245, 158, 11, 0.1) 0%, transparent 40%), radial-gradient(circle at 15% 65%, rgba(99, 102, 241, 0.08) 0%, transparent 40%), linear-gradient(180deg, #f8fafc 0%, #eff6ff 45%, #ffffff 100%)'
      }}
    >
      {/* Decorative ambient glowing circles */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 right-1/4 w-72 h-72 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text & CTA */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Tag badge with Gradient */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-amber-500/10 border border-blue-200/80 text-brand-700 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Giải pháp Quản trị Nhân sự & Tính lương tự động cho SME 2026</span>
            </div>

            {/* Main Headline with Gradient Text */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Tự động hóa{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500">
                Chốt Lương
              </span>{' '}
              trong{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
                3 phút
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Giải phóng hoàn toàn phòng HR và Kế toán khỏi bảng tính Excel phức tạp. 
              Chấm công GPS/FaceID, tự động tổng hợp công - phạt - thưởng, khấu trừ BHXH, thuế TNCN và phát hành phiếu lương bảo mật qua App di động.
            </p>

            {/* Feature bullets */}
            <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0 text-left text-sm font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Chấm công FaceID & Định vị GPS</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Biểu mẫu thuế & BHXH chuẩn 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Phiếu lương điện tử có khóa PIN</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Tạm ứng lương linh hoạt (EWA)</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#register"
                onClick={scrollToRegister}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 rounded-2xl shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-5 h-5" />
                <span>Đăng ký Dùng thử Miễn phí</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-sm transition-all"
              >
                <span>Xem Demo Tính Năng</span>
              </a>
            </div>

            <p className="text-xs text-slate-500 flex items-center justify-center lg:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Không cần cài đặt máy chủ • Thiết lập trong 15 phút • Hỗ trợ 24/7</span>
            </p>
          </div>

          {/* Right Column: Visual App Mockup */}
          <div className="lg:col-span-5 relative">
            <div 
              className="relative mx-auto max-w-sm sm:max-w-md bg-white/95 rounded-3xl p-6 shadow-2xl border border-slate-200/90 backdrop-blur-md"
              style={{
                boxShadow: '0 20px 40px -15px rgba(30, 58, 138, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)'
              }}
            >
              {/* App header preview */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <img src={assetUrl('images/icons/app-icon.png')} alt="App Chốt Lương" className="w-12 h-12 rounded-2xl shadow-md border border-slate-100" />
                  <div>
                    <h3 className="font-bold text-slate-900 leading-none text-base">App Chốt Lương</h3>
                    <span className="text-xs text-emerald-600 font-medium">● Đang hoạt động trên iOS & Android</span>
                  </div>
                </div>
                <span className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-brand-700 font-bold px-2.5 py-1 rounded-full border border-blue-200">
                  v3.2.0
                </span>
              </div>

              {/* Sample Salary Slip Card with Rich Gradient */}
              <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-900 text-white rounded-2xl p-5 mb-4 shadow-lg shadow-indigo-900/20 space-y-3">
                <div className="flex items-center justify-between text-xs text-blue-200">
                  <span>PHIẾU LƯƠNG THÁNG 10/2026</span>
                  <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[11px] font-semibold">ĐÃ CHỐT</span>
                </div>
                <div>
                  <div className="text-xs text-blue-100 font-medium">Lương thực nhận (Net):</div>
                  <div className="text-3xl font-extrabold tracking-tight mt-0.5">24.850.000 đ</div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-xs text-blue-100">
                  <div>
                    <span className="block opacity-80 text-[10px]">Lương cơ bản</span>
                    <span className="font-semibold text-white">20.000.000</span>
                  </div>
                  <div>
                    <span className="block opacity-80 text-[10px]">Thưởng KPI</span>
                    <span className="font-semibold text-amber-300">+6.500.000</span>
                  </div>
                  <div>
                    <span className="block opacity-80 text-[10px]">BHXH & Thuế</span>
                    <span className="font-semibold text-rose-200">-1.650.000</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions List */}
              <div className="space-y-2 text-xs font-medium text-slate-600">
                <div className="flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-100 rounded-xl transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</div>
                    <div>
                      <div className="text-slate-800 font-semibold text-xs">Chấm công hôm nay</div>
                      <div className="text-[11px] text-slate-500">FaceID tại Văn phòng • 08:28 AM</div>
                    </div>
                  </div>
                  <span className="text-emerald-600 font-bold">Đúng giờ</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-100 rounded-xl transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">⚡</div>
                    <div>
                      <div className="text-slate-800 font-semibold text-xs">Tạm ứng lương (EWA)</div>
                      <div className="text-[11px] text-slate-500">Khả dụng: 5.000.000 đ</div>
                    </div>
                  </div>
                  <span className="text-brand-600 font-bold">Ứng ngay</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Bảo mật dữ liệu chuẩn mã hóa AES-256 ngân hàng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar with Gradient Card Accents */}
        <div className="mt-16 pt-10 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-2xl bg-gradient-to-br from-white via-white to-blue-50/60 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 tracking-tight">
                {s.value}
              </div>
              <div className="text-sm font-semibold text-slate-600 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
