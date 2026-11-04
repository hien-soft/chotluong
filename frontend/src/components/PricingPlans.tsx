import React from 'react';
import { Check, Star, Sparkles, ArrowRight } from 'lucide-react';

export const PricingPlans: React.FC = () => {
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

  const plans = [
    {
      name: "Khởi Nghiệp (Starter)",
      badge: "Trải nghiệm 0đ",
      price: "0",
      unit: "tháng đầu tiên",
      desc: "Dành cho công ty mới thành lập, dưới 15 nhân sự muốn số hóa bảng lương tức thì.",
      features: [
        "Chấm công FaceID & Wifi tối đa 15 nhân sự",
        "Tự động tính lương & khấu trừ BHXH cơ bản",
        "Gửi phiếu lương điện tử qua App",
        "Hỗ trợ qua Zalo và Hotline",
      ],
      cta: "Bắt đầu miễn phí 0đ",
      popular: false,
    },
    {
      name: "Tăng Trưởng (Growth)",
      badge: "Phổ biến nhất cho SME",
      price: "29.000",
      unit: "nhân sự / tháng",
      desc: "Giải pháp toàn diện cho doanh nghiệp từ 15 đến 200 nhân viên.",
      features: [
        "Toàn bộ tính năng gói Khởi Nghiệp",
        "Không giới hạn số lượng nhân sự & chi nhánh",
        "Chấm công định vị GPS chống gian lận đa điểm",
        "Công thức lương phức tạp (KPI, doanh số, tăng ca đêm)",
        "Tính năng Tạm ứng lương (EWA) linh hoạt",
        "Hợp đồng lao động điện tử & quản lý phép năm",
        "Chuyên viên hỗ trợ triển khai 1-1",
      ],
      cta: "Đăng ký dùng thử gói Tăng Trưởng",
      popular: true,
    },
    {
      name: "Doanh Nghiệp (Enterprise)",
      badge: "Tùy biến cao cấp",
      price: "Liên hệ",
      unit: "theo nhu cầu",
      desc: "Doanh nghiệp trên 200 nhân sự hoặc chuỗi bán lẻ, F&B nhiều ca kíp.",
      features: [
        "Toàn bộ tính năng gói Tăng Trưởng",
        "Tích hợp API phần mềm kế toán (MISA, Bravo, SAP)",
        "Tích hợp ngân hàng chi hộ lương hàng loạt tự động",
        "Máy chủ cơ sở dữ liệu riêng biệt bảo mật cao",
        "Cam kết SLA dịch vụ 99.9%",
      ],
      cta: "Tư vấn giải pháp riêng",
      popular: false,
    },
  ];

  return (
    <section 
      id="pricing" 
      className="py-24 relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 60%), linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f8fafc 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-300/60 text-brand-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Định giá minh bạch & Tối ưu chi phí
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bảng giá minh bạch, linh hoạt theo quy mô Doanh nghiệp
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Chỉ trả tiền theo số lượng nhân sự thực tế. Không chi phí ẩn, không phí bảo trì hàng năm.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((p, idx) => (
            <div 
              key={idx}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                p.popular 
                  ? 'border-2 border-brand-500 shadow-2xl shadow-brand-500/15 scale-105 z-10' 
                  : 'border border-slate-200/90 shadow-sm hover:shadow-xl'
              }`}
              style={{
                background: p.popular
                  ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(239, 246, 255, 0.7) 100%)'
                  : 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.8) 100%)'
              }}
            >
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>{p.badge}</span>
                </div>
              )}

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {!p.popular && p.badge}
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-2 min-h-[32px]">{p.desc}</p>

                <div className="my-6 pb-6 border-b border-slate-200/70">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
                      {p.price} {p.price !== 'Liên hệ' && 'đ'}
                    </span>
                    <span className="text-xs font-medium text-slate-500">/{p.unit}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Quyền lợi bao gồm:
                  </div>
                  {p.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-blue-100 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="leading-tight">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <a
                  href="#register"
                  onClick={scrollToRegister}
                  className={`w-full py-3.5 rounded-2xl text-center text-sm font-bold transition-all block flex items-center justify-center gap-2 ${
                    p.popular
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20'
                  }`}
                >
                  <span>{p.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
