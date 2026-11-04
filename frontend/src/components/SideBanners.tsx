import React, { useState } from 'react';
import { Ad } from '../types';
import { recordAdClick } from '../api';
import { X, ExternalLink, Sparkles } from 'lucide-react';

interface SideBannersProps {
  leftAd?: Ad;
  rightAd?: Ad;
}

export const SideBanners: React.FC<SideBannersProps> = ({ leftAd, rightAd }) => {
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);

  const handleClick = (ad: Ad) => {
    recordAdClick(ad.id);
    if (ad.link_url) {
      if (ad.link_url.startsWith('#')) {
        const targetId = (ad.link_url === '#contact' || ad.link_url === '#products') ? 'register' : ad.link_url.replace('#', '');
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          if (targetId === 'register') {
            setTimeout(() => {
              const input = el.querySelector('input') as HTMLInputElement;
              if (input) input.focus();
            }, 600);
          }
        }
      } else {
        window.open(ad.link_url, ad.open_new_tab ? '_blank' : '_self');
      }
    } else {
      // Default to register
      const el = document.getElementById('register');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* LEFT BANNER */}
      {leftAd && showLeft && (
        <aside 
          aria-label="Quảng cáo tài trợ bên trái"
          className="hidden 2xl:flex flex-col fixed left-4 top-28 z-30 w-44 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden transition-all animate-fadeIn"
        >
          <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-amber-400 text-[10px] font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> TÀI TRỢ
            </span>
            <button 
              onClick={() => setShowLeft(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              title="Đóng quảng cáo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div 
            onClick={() => handleClick(leftAd)}
            className="cursor-pointer group relative block overflow-hidden"
          >
            <div className="relative overflow-hidden aspect-[3/4]">
              <img 
                src={leftAd.image_url} 
                alt={leftAd.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <p className="text-xs font-bold line-clamp-2 leading-tight drop-shadow">
                  {leftAd.name}
                </p>
              </div>
            </div>
            <div className="p-2.5 bg-gradient-to-b from-white to-blue-50/50 text-center">
              <span className="inline-flex items-center justify-center gap-1 w-full py-1.5 px-2 text-[11px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg shadow-sm transition-all">
                Đăng ký ngay <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </aside>
      )}

      {/* RIGHT BANNER */}
      {rightAd && showRight && (
        <aside 
          aria-label="Quảng cáo tài trợ bên phải"
          className="hidden 2xl:flex flex-col fixed right-4 top-28 z-30 w-44 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden transition-all animate-fadeIn"
        >
          <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-amber-400 text-[10px] font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> TÀI TRỢ
            </span>
            <button 
              onClick={() => setShowRight(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              title="Đóng quảng cáo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div 
            onClick={() => handleClick(rightAd)}
            className="cursor-pointer group relative block overflow-hidden"
          >
            <div className="relative overflow-hidden aspect-[3/4]">
              <img 
                src={rightAd.image_url} 
                alt={rightAd.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <p className="text-xs font-bold line-clamp-2 leading-tight drop-shadow">
                  {rightAd.name}
                </p>
              </div>
            </div>
            <div className="p-2.5 bg-gradient-to-b from-white to-purple-50/50 text-center">
              <span className="inline-flex items-center justify-center gap-1 w-full py-1.5 px-2 text-[11px] font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm transition-all">
                Dùng thử 0đ <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </aside>
      )}
    </>
  );
};
