import React from 'react';
import { ProductFeature } from '../types';
import { Clock, Calculator, FileText, Users, Check, Sparkles, ArrowRight } from 'lucide-react';

interface ProductFeaturesProps {
  features: ProductFeature[];
}

export const ProductFeatures: React.FC<ProductFeaturesProps> = ({ features }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'timekeeping':
        return <Clock className="w-8 h-8 text-blue-600" />;
      case 'payroll':
        return <Calculator className="w-8 h-8 text-amber-500" />;
      case 'eslip':
        return <FileText className="w-8 h-8 text-emerald-500" />;
      case 'hrm':
      default:
        return <Users className="w-8 h-8 text-purple-500" />;
    }
  };

  const getGradientHalo = (id: string) => {
    switch (id) {
      case 'timekeeping':
        return 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.05) 100%)';
      case 'payroll':
        return 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.05) 100%)';
      case 'eslip':
        return 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.05) 100%)';
      case 'hrm':
      default:
        return 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(126, 34, 206, 0.05) 100%)';
    }
  };

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
      id="features" 
      className="py-24 relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 10% 20%, rgba(30, 64, 175, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(245, 158, 11, 0.05) 0%, transparent 40%), linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300/60 text-amber-800 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            Hệ sinh thái Quản trị Nhân sự HRM & Payroll
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Giải pháp chuyên sâu cho từng bài toán của Doanh nghiệp SME
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Được thiết kế riêng theo đặc thù mô hình kinh doanh và quy định luật lao động Việt Nam, 
            Chốt Lương loại bỏ 100% rủi ro nhầm lẫn số liệu và khiếu nại lương của nhân viên.
          </p>
        </div>

        {/* Feature Grid with Gradient Cards */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {features.map((f, idx) => (
            <div 
              key={f.id || idx}
              className="group relative rounded-3xl p-8 border border-slate-200/90 hover:border-brand-300 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)'
              }}
            >
              <div className="space-y-5">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border border-white/60 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: getGradientHalo(f.id) }}
                >
                  {getIcon(f.id)}
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    {f.subtitle}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-3 group-hover:text-brand-600 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {f.description}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="space-y-2.5 pt-2">
                  {f.highlights.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Link to #register */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                <a
                  href="#register"
                  onClick={scrollToRegister}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 group-hover:gap-2.5 transition-all"
                >
                  <span>Đăng ký dùng thử module này</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Dùng thử 0đ
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
