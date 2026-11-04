import React, { useState } from 'react';
import { Article } from '../types';
import { Calendar, User, Eye, ArrowRight, X, Newspaper, Sparkles } from 'lucide-react';

interface NewsSectionProps {
  articles: Article[];
}

export const NewsSection: React.FC<NewsSectionProps> = ({ articles }) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <section 
      id="news" 
      className="py-24 relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 80% 10%, rgba(37, 99, 235, 0.05) 0%, transparent 40%), linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #eff6ff 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Newspaper className="w-3.5 h-3.5" />
              Bản tin Doanh nghiệp & Quản trị Nhân sự
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tin tức & Kiến thức Quản trị Nhân sự
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-sm">
            Cập nhật xu hướng chuyển đổi số HRM, thay đổi luật lao động và cẩm nang tính lương thực tiễn.
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
            Hiện chưa có tin tức nào được xuất bản.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((art) => (
              <article 
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="group cursor-pointer rounded-3xl border border-slate-200/90 hover:border-brand-400 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.8) 100%)'
                }}
              >
                <div>
                  {/* Cover image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                    <img 
                      src={art.cover_image_url || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80'} 
                      alt={art.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                      {art.category || 'Tin tức'}
                    </div>
                  </div>

                  {/* Body info */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(art.published_at || art.created_at).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {art.author_name || 'Ban biên tập'}
                      </span>
                      <span className="flex items-center gap-1 ml-auto font-mono">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {art.view_count || 0}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug mb-2">
                      {art.title}
                    </h3>

                    <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
                      {art.sapo || 'Xem chi tiết nội dung bài viết từ Công ty Chốt Lương...'}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <div className="text-xs font-bold text-brand-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    <span>Đọc tiếp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>

      {/* READING MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            
            {/* Modal header with Gradient */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-white">
              <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 uppercase tracking-wider">
                {selectedArticle.category} • Bản tin Chốt Lương
              </span>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal scrollable content */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {selectedArticle.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-4 border-b border-slate-100">
                <span>Tác giả: <strong>{selectedArticle.author_name}</strong></span>
                <span>Ngày đăng: <strong>{new Date(selectedArticle.published_at || selectedArticle.created_at).toLocaleDateString('vi-VN')}</strong></span>
                <span>Lượt xem: <strong>{selectedArticle.view_count}</strong></span>
              </div>

              {selectedArticle.sapo && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 text-slate-700 text-sm font-medium italic leading-relaxed">
                  {selectedArticle.sapo}
                </div>
              )}

              {selectedArticle.cover_image_url && (
                <img 
                  src={selectedArticle.cover_image_url} 
                  alt={selectedArticle.title} 
                  className="w-full max-h-96 object-cover rounded-2xl shadow-sm"
                />
              )}

              {/* Render HTML content safely */}
              <div 
                className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm space-y-3"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content_html }}
              />
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-md shadow-blue-500/20"
              >
                Đóng bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
