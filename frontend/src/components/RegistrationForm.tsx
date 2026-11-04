import React, { useState } from 'react';
import { submitRegistration } from '../api';
import { 
  Sparkles, CheckCircle2, ShieldCheck, Zap, PhoneCall, Building2, 
  Send, User, Mail, Phone, Users, HelpCircle 
} from 'lucide-react';

export const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    company_name: '',
    company_size: '20 - 50 người',
    primary_need: 'Quản lý toàn diện HRM & Payroll',
    note: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await submitRegistration(formData);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi gửi thông tin đăng ký. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      id="register" 
      className="relative py-24 overflow-hidden text-white"
      style={{
        // Radial Gradient nền chính sâu thẳm công nghệ cao
        background: 'radial-gradient(circle at 50% 25%, #1e3a8a 0%, #1e1b4b 35%, #0f172a 70%, #020617 100%)',
      }}
    >
      {/* Các quầng sáng Radial Gradient phụ tạo hiệu ứng chiều sâu 3D */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(30, 64, 175, 0.2) 60%, transparent 100%)'
        }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] rounded-full pointer-events-none opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.7) 0%, rgba(217, 119, 6, 0.15) 55%, transparent 100%)'
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[45rem] rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.45) 0%, transparent 70%)'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Đăng ký trải nghiệm miễn phí
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Bắt đầu số hóa quy trình <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-500">Chốt Lương</span> ngay hôm nay
          </h2>
          
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Dành riêng 15 phút trải nghiệm nền tảng để tiết kiệm 85% thời gian chốt lương hàng tháng.
            Được tặng ngay gói dùng thử 3 tháng không giới hạn tính năng.
          </p>
        </div>

        {/* Content Box with 2 Columns */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Cam kết & Quyền lợi với hiệu ứng Radial Gradient Card */}
          <div className="lg:col-span-5 space-y-8">
            <div 
              className="p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden"
              style={{
                background: 'radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
              }}
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
                <Building2 className="w-6 h-6 text-amber-400" />
                <span>Quyền lợi dành cho Doanh nghiệp đăng ký</span>
              </h3>

              <div className="space-y-4 text-sm text-slate-200">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Tặng 3 tháng dùng thử 0đ trọn gói</strong>
                    <span className="text-xs text-slate-300">Áp dụng đầy đủ toàn bộ tính năng Chấm công FaceID, Tính lương & Phiếu lương App.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Hỗ trợ số hóa dữ liệu trong 15 phút</strong>
                    <span className="text-xs text-slate-300">Đội ngũ kỹ thuật Chốt Lương hỗ trợ import danh sách nhân sự từ file Excel sẵn có.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Bảo mật thông tin chuẩn ngân hàng</strong>
                    <span className="text-xs text-slate-300">Cam kết bảo mật dữ liệu lương, không chia sẻ cho bên thứ ba, ký thỏa thuận NDA.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Tư vấn viên 1-1 chuyên trách</strong>
                    <span className="text-xs text-slate-300">Hỗ trợ cấu hình công thức lương đặc thù của doanh nghiệp theo yêu cầu.</span>
                  </div>
                </div>
              </div>

              {/* Mini counter */}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <div>
                  <span className="text-xl font-extrabold text-amber-400 block">1,200+</span>
                  <span>Doanh nghiệp đang tin dùng</span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <span className="text-xl font-extrabold text-emerald-400 block">15 phút</span>
                  <span>Thời gian thiết lập hệ thống</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form Đăng Ký với Radial Gradient Form Card */}
          <div className="lg:col-span-7">
            <div 
              className="p-8 sm:p-10 rounded-3xl border border-white/15 shadow-2xl relative overflow-hidden backdrop-blur-2xl"
              style={{
                // Khung form dùng Radial Gradient cao cấp chuyển màu từ tâm ra biên
                background: 'radial-gradient(circle at 85% 15%, rgba(30, 58, 138, 0.6) 0%, rgba(15, 23, 42, 0.85) 60%, rgba(2, 6, 23, 0.95) 100%)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)'
              }}
            >
              
              {isSuccess ? (
                <div className="py-12 text-center space-y-6 animate-scaleUp">
                  <div 
                    className="w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg border border-emerald-400/50"
                    style={{
                      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(6, 78, 59, 0.8) 100%)'
                    }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Đăng ký thành công!</h3>
                    <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                      Cảm ơn Quý doanh nghiệp <strong>{formData.company_name}</strong> đã quan tâm tới phần mềm Chốt Lương.
                      Chuyên viên hỗ trợ sẽ liên hệ qua số điện thoại <strong>{formData.phone}</strong> trong vòng 15 phút để kích hoạt tài khoản dùng thử!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({
                        full_name: '',
                        phone: '',
                        email: '',
                        company_name: '',
                        company_size: '20 - 50 người',
                        primary_need: 'Quản lý toàn diện HRM & Payroll',
                        note: '',
                      });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
                  >
                    Gửi yêu cầu đăng ký khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      Thông tin Doanh nghiệp đăng ký
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Điền thông tin bên dưới để chuyên viên chuẩn bị gói bản quyền dùng thử phù hợp nhất cho công ty bạn.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-medium">
                      ⚠️ {errorMessage}
                    </div>
                  )}

                  {/* Row 1: Họ tên & SĐT */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span>Họ và tên người liên hệ *</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Nguyễn Văn A (Giám đốc / HR Manager)"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>Số điện thoại di động *</span>
                      </label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0912 345 678"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email & Tên công ty */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        <span>Email công ty / Email cá nhân *</span>
                      </label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="hr@doanhnghiep.vn"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tên Công ty / Doanh nghiệp *</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="Công ty Cổ phần Đầu tư..."
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 3: Quy mô nhân sự & Nhu cầu ưu tiên */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>Quy mô nhân sự</span>
                      </label>
                      <select 
                        value={formData.company_size}
                        onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="Dưới 20 người">Dưới 20 người (Gói Khởi nghiệp 0đ)</option>
                        <option value="20 - 50 người">20 - 50 người (SME tiêu chuẩn)</option>
                        <option value="50 - 200 người">50 - 200 người (Gói Tăng trưởng)</option>
                        <option value="Trên 200 người">Trên 200 người (Gói Doanh nghiệp)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Nhu cầu ưu tiên hàng đầu</span>
                      </label>
                      <select 
                        value={formData.primary_need}
                        onChange={(e) => setFormData({ ...formData, primary_need: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="Quản lý toàn diện HRM & Payroll">Quản lý toàn diện HRM & Chốt Lương</option>
                        <option value="Chấm công FaceID & Định vị GPS">Chấm công FaceID & Định vị GPS</option>
                        <option value="Tự động tính lương & Thuế, BHXH">Tự động tính lương, thuế & BHXH</option>
                        <option value="Phiếu lương điện tử gửi qua App">Phiếu lương điện tử bảo mật qua App</option>
                        <option value="Tạm ứng lương linh hoạt (EWA)">Tạm ứng lương linh hoạt (EWA)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Ghi chú thêm */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Ghi chú thêm về yêu cầu đặc thù (Không bắt buộc)
                    </label>
                    <textarea 
                      rows={2}
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Ví dụ: Công ty có 2 chi nhánh tại Hà Nội và TP.HCM, làm việc theo ca..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Submit Button với Radial Gradient Glow Effect */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative w-full py-4 px-8 rounded-2xl font-bold text-base text-white shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 overflow-hidden group"
                      style={{
                        background: 'radial-gradient(circle at 50% 0%, #f59e0b 0%, #ea580c 60%, #c2410c 100%)',
                        boxShadow: '0 10px 30px -5px rgba(234, 88, 12, 0.5)'
                      }}
                    >
                      <div className="relative z-10 flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Đang gửi thông tin đăng ký...</span>
                          </>
                        ) : (
                          <>
                            <span>Đăng ký sử dụng sản phẩm & Nhận ưu đãi 3 tháng</span>
                            <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </div>
                    </button>
                    <p className="text-center text-[11px] text-slate-400 mt-3">
                      🔒 Cam kết miễn phí 100% trong 3 tháng đầu • Không cần thẻ tín dụng • Hỗ trợ triển khai 24/7
                    </p>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

