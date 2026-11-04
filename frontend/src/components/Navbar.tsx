import React from 'react';
import { LogIn, LayoutDashboard, Sparkles } from 'lucide-react';
import { assetUrl } from '../types';

interface NavbarProps {
  onOpenCMS: () => void;
  currentUser: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCMS, currentUser, onLogout }) => {
  const scrollToRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('register');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      // Focus on first input in the registration form
      setTimeout(() => {
        const input = el.querySelector('input') as HTMLInputElement;
        if (input) input.focus();
      }, 600);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-sm">
      {/* Top Gradient Line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <img 
              src={assetUrl('images/logos/logo.png')} 
              alt="Logo Công ty Chốt Lương" 
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#about" className="hover:text-brand-600 transition-colors">Giới thiệu</a>
            <a href="#features" className="hover:text-brand-600 transition-colors">Tính năng HRM & Payroll</a>
            <a href="#pricing" className="hover:text-brand-600 transition-colors">Bảng giá</a>
            <a href="#news" className="hover:text-brand-600 transition-colors">Tin tức</a>
            <a 
              href="#register" 
              onClick={scrollToRegister}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Đăng ký sản phẩm</span>
            </a>
            <a href="#contact" className="hover:text-brand-600 transition-colors">Liên hệ</a>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenCMS}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-500/20 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Vào CMS Admin</span>
                </button>
                <button
                  onClick={onLogout}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 rounded-xl border border-slate-200 hover:border-red-200 transition-all"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onOpenCMS}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 border border-slate-200 hover:border-brand-500 rounded-xl transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập CMS</span>
                </button>
                <a
                  href="#register"
                  onClick={scrollToRegister}
                  className="hidden sm:inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 transition-all transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Dùng thử miễn phí</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
