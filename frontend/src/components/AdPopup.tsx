import React, { useState, useEffect } from 'react';
import { Ad } from '../types';
import { recordAdClick } from '../api';
import { X, Sparkles, ExternalLink } from 'lucide-react';

interface AdPopupProps {
  popupAd?: Ad;
}

export const AdPopup: React.FC<AdPopupProps> = ({ popupAd }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!popupAd) return;

    // Check frequency
    const dismissed = sessionStorage.getItem('cl_popup_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500); // Popup appears after 1.5s
      return () => clearTimeout(timer);
    }
  }, [popupAd]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('cl_popup_dismissed', 'true');
  };

  const handleClick = () => {
    if (!popupAd) return;
    recordAdClick(popupAd.id);
    handleClose();
    
    // Always smoothly scroll to #register form and focus
    const el = document.getElementById('register');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const input = el.querySelector('input') as HTMLInputElement;
        if (input) input.focus();
      }, 600);
    }
  };

  if (!popupAd || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20 transform animate-scaleUp"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(239, 246, 255, 0.95) 0%, rgba(255, 255, 255, 1) 100%)'
        }}
      >
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Popup image */}
        <div 
          onClick={handleClick}
          className="cursor-pointer group relative overflow-hidden"
        >
          <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 relative">
            <img 
              src={popupAd.image_url} 
              alt={popupAd.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
          </div>

          <div className="p-6 sm:p-8 text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              Ưu đãi Doanh nghiệp SME 2026
            </div>
            
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors">
              {popupAd.name}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Đăng ký ngay hôm nay để nhận trọn bộ giải pháp Chấm công, Tính lương & Phiếu lương điện tử hoàn toàn miễn phí 3 tháng cho doanh nghiệp của bạn!
            </p>

            <div className="pt-2">
              <button 
                type="button"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Nhận ưu đãi 3 tháng & Đăng ký ngay</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
