import React, { useState, useEffect } from 'react';
import { User, LandingData, Ad, assetUrl } from './types';
import { getLandingData, getPublicAds, getMeApi } from './api';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SideBanners } from './components/SideBanners';
import { ProductFeatures } from './components/ProductFeatures';
import { PricingPlans } from './components/PricingPlans';
import { RegistrationForm } from './components/RegistrationForm';
import { NewsSection } from './components/NewsSection';
import { Footer } from './components/Footer';
import { AdPopup } from './components/AdPopup';
import { AdminCMS } from './components/AdminCMS';

export function App() {
  const [landingData, setLandingData] = useState<LandingData | null>(null);
  const [ads, setAds] = useState<{ left?: Ad; right?: Ad; popup?: Ad }>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showCMS, setShowCMS] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check login on load
  useEffect(() => {
    const token = localStorage.getItem('cl_token');
    if (token) {
      getMeApi()
        .then((u) => setCurrentUser(u))
        .catch(() => localStorage.removeItem('cl_token'));
    }

    // Load public landing data & ads
    Promise.all([getLandingData(), getPublicAds()])
      .then(([landing, publicAds]) => {
        setLandingData(landing);
        setAds(publicAds);
      })
      .catch((err) => console.error('Lỗi nạp dữ liệu:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cl_token');
    setCurrentUser(null);
    setShowCMS(false);
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center text-white"
        style={{
          background: 'radial-gradient(circle at 50% 30%, #1e3a8a 0%, #1e1b4b 45%, #0f172a 80%, #020617 100%)'
        }}
      >
        <div className="text-center space-y-4">
          <img src={assetUrl('images/logos/logo.png')} alt="Chốt Lương" className="h-16 mx-auto animate-pulse brightness-200" />
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-300 tracking-wider uppercase">Đang nạp dữ liệu hệ thống Chốt Lương...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative selection:bg-brand-500 selection:text-white">
      
      {/* Sticky Left and Right Banners */}
      <SideBanners leftAd={ads.left} rightAd={ads.right} />

      {/* Promotional Pop-up Modal */}
      <AdPopup popupAd={ads.popup} />

      {/* Public Header */}
      <Navbar 
        onOpenCMS={() => setShowCMS(true)} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />

      {/* Landing Page Content */}
      <main className="flex-1">
        {landingData && (
          <>
            {/* Hero Section */}
            <Hero 
              stats={landingData.stats} 
              onOpenDemo={() => {
                const el = document.querySelector('#register');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }} 
            />

            {/* Core Product Features for SME */}
            <ProductFeatures features={landingData.features} />

            {/* Pricing tiers */}
            <PricingPlans />

            {/* Published News Section */}
            <NewsSection articles={landingData.latest_news} />

            {/* Form Đăng ký sử dụng sản phẩm (Radial Gradient) */}
            <RegistrationForm />
          </>
        )}
      </main>

      {/* Company Footer */}
      {landingData && <Footer company={landingData.company} />}

      {/* CMS Management Interface Modal / Overlay */}
      {showCMS && (
        <AdminCMS 
          onClose={() => setShowCMS(false)} 
          currentUser={currentUser} 
          setCurrentUser={setCurrentUser} 
        />
      )}

    </div>
  );
}

export default App;

