import React, { useState, useEffect } from 'react';
import { 
  User, Article, RoleInfo, Ad, ArticleStatusLog, LeadRegistration, assetUrl 
} from '../types';
import { 
  loginApi, getMeApi, getArticles, createArticle, updateArticle, deleteArticle,
  getL1Queue, getL2Queue, transitionArticle, getArticleLogs,
  getAds, createAd, updateAd, deleteAd,
  getUsers, createUser, updateUser, deleteUser, getRoles,
  getRegistrations, updateRegistrationStatus
} from '../api';
import { 
  LayoutDashboard, FileText, CheckSquare, Award, Megaphone, 
  Users, Shield, LogOut, Plus, Edit, Trash2, ArrowRight, ArrowLeft, 
  Send, RotateCcw, AlertTriangle, Eye, CheckCircle2, X, Lock, KeyRound,
  UserCheck, PhoneCall
} from 'lucide-react';

interface AdminCMSProps {
  onClose: () => void;
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({ onClose, currentUser, setCurrentUser }) => {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active tab in CMS: dashboard, articles, review_l1, review_l2, ads, rbac, leads
  const [activeTab, setActiveTab] = useState<'dashboard' | 'articles' | 'review_l1' | 'review_l2' | 'ads' | 'rbac' | 'leads'>('dashboard');

  // Data states
  const [articles, setArticles] = useState<Article[]>([]);
  const [l1Queue, setL1Queue] = useState<Article[]>([]);
  const [l2Queue, setL2Queue] = useState<Article[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [leads, setLeads] = useState<LeadRegistration[]>([]);

  // Dialog & Modal states
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);

  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [transitionData, setTransitionData] = useState<{ articleId: number; action: string; title: string; requireReason: boolean } | null>(null);
  const [transitionReason, setTransitionReason] = useState('');

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState<ArticleStatusLog[]>([]);
  const [currentArticleTitle, setCurrentArticleTitle] = useState('');

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Partial<Ad> | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load CMS Data when logged in
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, activeTab]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const loadData = async () => {
    try {
      if (activeTab === 'dashboard' || activeTab === 'articles') {
        const arts = await getArticles();
        setArticles(arts);
      }
      if (activeTab === 'dashboard' || activeTab === 'review_l1') {
        const l1 = await getL1Queue();
        setL1Queue(l1);
      }
      if (activeTab === 'dashboard' || activeTab === 'review_l2') {
        const l2 = await getL2Queue();
        setL2Queue(l2);
      }
      if (activeTab === 'dashboard' || activeTab === 'ads') {
        const adList = await getAds();
        setAds(adList);
      }
      if (activeTab === 'dashboard' || activeTab === 'rbac') {
        const uList = await getUsers();
        const rList = await getRoles();
        setUsers(uList);
        setRoles(rList);
      }
      if (activeTab === 'dashboard' || activeTab === 'leads') {
        const leadList = await getRegistrations();
        setLeads(leadList);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleUpdateLeadStatus = async (id: number, status: string) => {
    try {
      await updateRegistrationStatus(id, status);
      showToast('Cập nhật trạng thái khách hàng thành công!');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật trạng thái', 'error');
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    try {
      const res = await loginApi(email, password);
      localStorage.setItem('cl_token', res.token);
      setCurrentUser(res.user);
      showToast(`Đăng nhập thành công! Xin chào ${res.user.full_name}`);
    } catch (err: any) {
      setLoginError(err.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick account fill
  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  const handleLogout = () => {
    localStorage.removeItem('cl_token');
    setCurrentUser(null);
  };

  // Check roles
  const hasRole = (role: string) => {
    if (!currentUser) return false;
    return currentUser.roles.includes(role) || currentUser.roles.includes('ADMIN');
  };

  // Workflow transition
  const openTransitionDialog = (articleId: number, action: string, title: string, requireReason = false) => {
    setTransitionData({ articleId, action, title, requireReason });
    setTransitionReason('');
    setIsTransitionModalOpen(true);
  };

  const handleExecuteTransition = async () => {
    if (!transitionData) return;
    if (transitionData.requireReason && (!transitionReason || transitionReason.trim().length < 3)) {
      showToast('Hành động này bắt buộc phải nhập lý do chi tiết!', 'error');
      return;
    }

    try {
      await transitionArticle(transitionData.articleId, transitionData.action, transitionReason);
      showToast(`Thực hiện '${transitionData.title}' thành công!`);
      setIsTransitionModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi chuyển trạng thái duyệt', 'error');
    }
  };

  // View article logs
  const handleViewLogs = async (article: Article) => {
    try {
      const logs = await getArticleLogs(article.id);
      setCurrentLogs(logs);
      setCurrentArticleTitle(article.title);
      setIsLogModalOpen(true);
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải lịch sử duyệt bài', 'error');
    }
  };

  // Article Save
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.title) return;

    try {
      if (editingArticle.id) {
        await updateArticle(editingArticle.id, editingArticle);
        showToast('Cập nhật bài viết thành công!');
      } else {
        await createArticle(editingArticle);
        showToast('Tạo bài viết mới thành công (Bản nháp)!');
      }
      setIsArticleModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu bài viết', 'error');
    }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
    try {
      await deleteArticle(id);
      showToast('Đã xóa bài viết!');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi xóa bài viết', 'error');
    }
  };

  // Ad Save
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd || !editingAd.name) return;

    try {
      if (editingAd.id) {
        await updateAd(editingAd.id, editingAd);
        showToast('Cập nhật quảng cáo thành công!');
      } else {
        await createAd(editingAd);
        showToast('Thêm quảng cáo mới thành công!');
      }
      setIsAdModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu quảng cáo', 'error');
    }
  };

  const handleDeleteAd = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa quảng cáo này?')) return;
    try {
      await deleteAd(id);
      showToast('Đã xóa quảng cáo!');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi xóa quảng cáo', 'error');
    }
  };

  // User Save
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      if (editingUser.id) {
        await updateUser(editingUser.id, editingUser);
        showToast('Cập nhật người dùng thành công!');
      } else {
        await createUser(editingUser);
        showToast('Thêm tài khoản mới thành công!');
      }
      setIsUserModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu người dùng', 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tài khoản này?')) return;
    try {
      await deleteUser(id);
      showToast('Đã xóa tài khoản!');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi xóa người dùng', 'error');
    }
  };

  // -------------------------------------------------------------
  // RENDER: LOGIN FORM (IF NOT LOGGED IN)
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
        <div 
          className="relative w-full max-w-md rounded-3xl shadow-2xl p-8 border border-slate-700/60 text-slate-100 overflow-hidden"
          style={{ background: 'radial-gradient(circle at 50% 0%, #1e3a8a 0%, #1e1b4b 45%, #0f172a 80%, #020617 100%)' }}
        >
          {/* Ambient decorative glow */}
          <div className="absolute -top-24 -left-24 w-52 h-52 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2 mb-8 relative z-10">
            <div className="inline-block p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg mb-2">
              <img src={assetUrl('images/logos/logo.png')} alt="Chốt Lương" className="h-11 mx-auto object-contain" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">CMS Quản Trị Hệ Thống</h2>
            <p className="text-xs text-slate-300">Đăng nhập tài khoản để vào bàn làm việc và duyệt bài 2 cấp</p>
          </div>

          {loginError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Email đăng nhập</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@chotluong.vn"
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Mật khẩu</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15 transition-all"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Đang xác thực...' : 'Đăng nhập vào CMS'}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-8 pt-5 border-t border-white/10 space-y-2 relative z-10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Chọn tài khoản demo để trải nghiệm nhanh:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                type="button"
                onClick={() => handleQuickLogin('admin@chotluong.vn', 'Admin@123')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-blue-200 font-semibold text-left border border-blue-400/20 transition-all cursor-pointer"
              >
                <div className="text-white font-bold">🛡️ Admin Hệ Thống</div>
                <div className="text-[10px] text-slate-400 font-normal">Toàn quyền hệ thống</div>
              </button>
              <button 
                type="button"
                onClick={() => handleQuickLogin('tbt@chotluong.vn', 'Tbt@123')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-purple-200 font-semibold text-left border border-purple-400/20 transition-all cursor-pointer"
              >
                <div className="text-white font-bold">🏆 Duyệt Cấp 2 (TBT)</div>
                <div className="text-[10px] text-slate-400 font-normal">Xuất bản bài viết</div>
              </button>
              <button 
                type="button"
                onClick={() => handleQuickLogin('btv@chotluong.vn', 'Btv@123')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-emerald-200 font-semibold text-left border border-emerald-400/20 transition-all cursor-pointer"
              >
                <div className="text-white font-bold">📝 Duyệt Cấp 1 (BTV)</div>
                <div className="text-[10px] text-slate-400 font-normal">Sơ duyệt & chuyển cấp</div>
              </button>
              <button 
                type="button"
                onClick={() => handleQuickLogin('phongvien@chotluong.vn', 'Pv@123')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-amber-200 font-semibold text-left border border-amber-400/20 transition-all cursor-pointer"
              >
                <div className="text-white font-bold">✍️ Phóng viên / CTV</div>
                <div className="text-[10px] text-slate-400 font-normal">Tạo nháp & gửi duyệt</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: MAIN ADMIN CMS DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 text-slate-800 animate-fadeIn">
      
      {/* Toast Notification */}
      {statusMessage && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 border ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
            : 'bg-rose-50 border-rose-300 text-rose-800'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Top Bar */}
      <header className="h-16 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/50 px-6 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-1.5 bg-white/10 rounded-xl border border-white/15">
            <img src={assetUrl('images/logos/logo.png')} alt="Chốt Lương" className="h-8 w-auto" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-200 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 px-3 py-1 rounded-lg border border-indigo-500/30">
            Hệ Thống CMS Tòa Soạn 2 Cấp
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-bold text-white">{currentUser.full_name}</div>
            <div className="flex items-center gap-1 justify-end">
              {currentUser.roles.map((r, i) => (
                <span key={i} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-indigo-200 border border-white/15">
                  {r}
                </span>
              ))}
            </div>
          </div>

          <button 
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Landing Page</span>
          </button>

          <button 
            onClick={handleLogout}
            className="p-2 text-slate-300 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors border border-transparent hover:border-rose-500/30 cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main CMS Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-slate-300 flex flex-col justify-between shrink-0 p-4 border-r border-indigo-950">
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-2">
              Quản trị chuyên môn
            </div>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Bàn làm việc</span>
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'articles' ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Quản lý Bài viết</span>
            </button>

            <button
              onClick={() => setActiveTab('review_l1')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'review_l1' ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Duyệt Cấp 1</span>
              </div>
              {l1Queue.length > 0 && (
                <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {l1Queue.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('review_l2')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'review_l2' ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Duyệt Cấp 2 (TBT)</span>
              </div>
              {l2Queue.length > 0 && (
                <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {l2Queue.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'ads' ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4 text-blue-400" />
              <span>Quảng cáo & Banner</span>
            </button>

            <button
              onClick={() => setActiveTab('rbac')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'rbac' ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Vai trò & Phân quyền</span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'leads' ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30' : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Khách hàng Đăng ký</span>
              </div>
              {leads.filter(l => l.status === 'NEW').length > 0 && (
                <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {leads.filter(l => l.status === 'NEW').length}
                </span>
              )}
            </button>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-1 text-slate-400">
            <div className="font-semibold text-white">Chốt Lương Engine v2.0</div>
            <div>PostgreSQL 16 & Go Lang</div>
            <div className="text-[10px] text-emerald-400">● Máy chủ API hoạt động bình thường</div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Bàn làm việc tổng quan</h2>
                <p className="text-sm text-slate-500 mt-1">Theo dõi số liệu và luồng kiểm duyệt bài viết hôm nay</p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng bài viết</div>
                    <div className="text-3xl font-extrabold text-slate-900 mt-1">{articles.length}</div>
                    <div className="text-xs text-slate-500 mt-1">Tin tức & Bài chuyên môn</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center font-bold">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Chờ duyệt Cấp 1</div>
                    <div className="text-3xl font-extrabold text-emerald-600 mt-1">{l1Queue.length}</div>
                    <div className="text-xs text-slate-500 mt-1">Biên tập viên xử lý</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Chờ duyệt Cấp 2</div>
                    <div className="text-3xl font-extrabold text-amber-600 mt-1">{l2Queue.length}</div>
                    <div className="text-xs text-slate-500 mt-1">Thư ký / TBT phê duyệt</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Award className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Quảng cáo Banner</div>
                    <div className="text-3xl font-extrabold text-purple-600 mt-1">{ads.length}</div>
                    <div className="text-xs text-slate-500 mt-1">Banner trái, phải & popup</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Megaphone className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Workflow Flowchart Explanation */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-600" />
                  Quy trình duyệt bài 2 cấp tuân thủ chuẩn tòa soạn
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs text-center font-semibold">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block mb-1">BƯỚC 1</span>
                    <strong className="text-slate-800">DRAFT (Bản nháp)</strong>
                    <p className="text-[11px] text-slate-500 font-normal mt-1">Tác giả/Phóng viên soạn thảo và bấm "Gửi duyệt"</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <span className="text-[10px] text-brand-500 block mb-1">BƯỚC 2</span>
                    <strong className="text-brand-700">PENDING_L1</strong>
                    <p className="text-[11px] text-slate-500 font-normal mt-1">BTV Cấp 1 nhận bài (CLAIM), biên tập và kiểm duyệt</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                    <span className="text-[10px] text-amber-600 block mb-1">BƯỚC 3</span>
                    <strong className="text-amber-800">PENDING_L2</strong>
                    <p className="text-[11px] text-slate-500 font-normal mt-1">L1 duyệt chuyển tiếp lên hàng đợi Thư ký / TBT</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                    <span className="text-[10px] text-purple-600 block mb-1">BƯỚC 4</span>
                    <strong className="text-purple-800">IN_REVIEW_L2</strong>
                    <p className="text-[11px] text-slate-500 font-normal mt-1">Cấp 2 thẩm định cuối, có quyền trả về L1 hoặc tác giả</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-600 block mb-1">BƯỚC 5</span>
                    <strong className="text-emerald-800">PUBLISHED</strong>
                    <p className="text-[11px] text-slate-500 font-normal mt-1">Bài viết chính thức xuất bản ra trang Landing Page</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARTICLES (CRUD & WORKFLOW) */}
          {activeTab === 'articles' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quản lý bài viết & Đăng tin</h2>
                  <p className="text-sm text-slate-500 mt-1">Tạo mới, chỉnh sửa và quản lý vòng đời bài viết</p>
                </div>
                <button
                  onClick={() => {
                    setEditingArticle({ title: '', sapo: '', content_html: '', category: 'Tin công ty', cover_image_url: '' });
                    setIsArticleModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Viết bài mới</span>
                </button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">ID</th>
                        <th className="py-3.5 px-4">Tiêu đề bài viết</th>
                        <th className="py-3.5 px-4">Chuyên mục</th>
                        <th className="py-3.5 px-4">Tác giả</th>
                        <th className="py-3.5 px-4">Trạng thái</th>
                        <th className="py-3.5 px-4">Lượt xem</th>
                        <th className="py-3.5 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {articles.map((art) => (
                        <tr key={art.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-500">#{art.id}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 max-w-md line-clamp-1">{art.title}</div>
                            <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{art.sapo}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                              {art.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-slate-600">{art.author_name}</td>
                          <td className="py-3.5 px-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              art.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' :
                              art.status === 'PENDING_L1' ? 'bg-blue-100 text-blue-800' :
                              art.status === 'PENDING_L2' ? 'bg-amber-100 text-amber-800' :
                              art.status === 'RETURNED' ? 'bg-rose-100 text-rose-800' :
                              art.status === 'IN_REVIEW_L1' || art.status === 'IN_REVIEW_L2' ? 'bg-purple-100 text-purple-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {art.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono">{art.view_count}</td>
                          <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                            
                            {/* Workflow buttons */}
                            {art.status === 'DRAFT' && (
                              <button
                                onClick={() => openTransitionDialog(art.id, 'SUBMIT', 'Gửi duyệt Cấp 1', false)}
                                className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                                title="Gửi duyệt Cấp 1"
                              >
                                Gửi duyệt
                              </button>
                            )}

                            {art.status === 'PENDING_L1' && (
                              <button
                                onClick={() => openTransitionDialog(art.id, 'WITHDRAW', 'Rút bài về Bản nháp', false)}
                                className="px-2.5 py-1 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg"
                                title="Rút bài về sửa"
                              >
                                Rút bài
                              </button>
                            )}

                            {art.status === 'RETURNED' && (
                              <button
                                onClick={() => openTransitionDialog(art.id, 'RESUBMIT', 'Gửi lại Cấp 1 sau khi sửa', false)}
                                className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                                title="Gửi lại duyệt"
                              >
                                Gửi lại
                              </button>
                            )}

                            {/* View logs */}
                            <button
                              onClick={() => handleViewLogs(art)}
                              className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg"
                              title="Xem lịch sử duyệt bài"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => {
                                setEditingArticle(art);
                                setIsArticleModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg"
                              title="Chỉnh sửa bài"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete (Draft only) */}
                            {art.status === 'DRAFT' && (
                              <button
                                onClick={() => handleDeleteArticle(art.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Xóa bản nháp"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEW L1 QUEUE */}
          {activeTab === 'review_l1' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hàng đợi duyệt Cấp 1 (Biên tập viên)</h2>
                <p className="text-sm text-slate-500 mt-1">Biên tập viên nhận bài từ phóng viên, biên tập và duyệt chuyển lên Cấp 2</p>
              </div>

              {l1Queue.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                  Hiện không có bài viết nào đang chờ duyệt Cấp 1.
                </div>
              ) : (
                <div className="space-y-4">
                  {l1Queue.map((art) => (
                    <div key={art.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            art.status === 'IN_REVIEW_L1' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {art.status}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">#{art.id} • {art.category}</span>
                          {art.holder_name && (
                            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium border border-amber-200">
                              Đang giữ: {art.holder_name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">{art.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2">{art.sapo}</p>
                        <div className="text-[11px] text-slate-400">
                          Tác giả: <strong>{art.author_name}</strong> • Ngày gửi: {new Date(art.updated_at).toLocaleDateString('vi-VN')}
                        </div>
                      </div>

                      {/* L1 Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {art.status === 'PENDING_L1' ? (
                          <button
                            onClick={() => openTransitionDialog(art.id, 'CLAIM_L1', 'Nhận duyệt bài Cấp 1', false)}
                            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                          >
                            Nhận duyệt (Claim)
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openTransitionDialog(art.id, 'APPROVE_L1', 'Duyệt chuyển Cấp 2', false)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Duyệt Cấp 1</span>
                            </button>

                            <button
                              onClick={() => openTransitionDialog(art.id, 'RETURN_L1', 'Trả lại cho tác giả sửa', true)}
                              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold rounded-xl transition-all"
                            >
                              Trả lại tác giả
                            </button>

                            <button
                              onClick={() => openTransitionDialog(art.id, 'REJECT_L1', 'Từ chối bài viết', true)}
                              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-all"
                            >
                              Từ chối
                            </button>

                            <button
                              onClick={() => openTransitionDialog(art.id, 'RELEASE_L1', 'Nhả bài về hàng đợi PENDING', false)}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-all"
                            >
                              Nhả bài
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleViewLogs(art)}
                          className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-xl"
                          title="Lịch sử duyệt"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REVIEW L2 QUEUE */}
          {activeTab === 'review_l2' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hàng đợi duyệt Cấp 2 (Thư ký / Tổng biên tập)</h2>
                <p className="text-sm text-slate-500 mt-1">Phê duyệt và chính thức xuất bản bài viết ra website hoặc trả về yêu cầu sửa</p>
              </div>

              {l2Queue.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                  Hiện không có bài viết nào đang chờ duyệt Cấp 2.
                </div>
              ) : (
                <div className="space-y-4">
                  {l2Queue.map((art) => (
                    <div key={art.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            art.status === 'IN_REVIEW_L2' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {art.status}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">#{art.id} • {art.category}</span>
                          {art.holder_name && (
                            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium border border-amber-200">
                              Đang duyệt: {art.holder_name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">{art.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2">{art.sapo}</p>
                        <div className="text-[11px] text-slate-400">
                          Tác giả: <strong>{art.author_name}</strong> • Người duyệt L1: {art.l1_reviewer_id || 'Chưa gán'}
                        </div>
                      </div>

                      {/* L2 Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {art.status === 'PENDING_L2' ? (
                          <button
                            onClick={() => openTransitionDialog(art.id, 'CLAIM_L2', 'Nhận thẩm định Cấp 2', false)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                          >
                            Nhận duyệt Cấp 2
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openTransitionDialog(art.id, 'PUBLISH', 'Phê duyệt & Xuất bản', false)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                            >
                              <Award className="w-4 h-4" />
                              <span>Xuất bản (Publish)</span>
                            </button>

                            <button
                              onClick={() => openTransitionDialog(art.id, 'SEND_BACK_L1', 'Trả về Cấp 1 biên tập lại', true)}
                              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-brand-700 border border-blue-200 text-xs font-semibold rounded-xl transition-all"
                            >
                              Trả về Cấp 1
                            </button>

                            <button
                              onClick={() => openTransitionDialog(art.id, 'RETURN_L2', 'Trả về Tác giả', true)}
                              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold rounded-xl transition-all"
                            >
                              Trả về Tác giả
                            </button>

                            <button
                              onClick={() => openTransitionDialog(art.id, 'REJECT_L2', 'Từ chối xuất bản', true)}
                              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-all"
                            >
                              Từ chối
                            </button>

                            <button
                              onClick={() => openTransitionDialog(art.id, 'RELEASE_L2', 'Nhả bài về PENDING_L2', false)}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-all"
                            >
                              Nhả bài
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleViewLogs(art)}
                          className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-xl"
                          title="Lịch sử duyệt"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ADS MANAGEMENT */}
          {activeTab === 'ads' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quản lý Banner Quảng cáo & Pop-up</h2>
                  <p className="text-sm text-slate-500 mt-1">Cấu hình banner tài trợ bên trái, bên phải và pop-up khuyến mãi</p>
                </div>
                <button
                  onClick={() => {
                    setEditingAd({ name: '', position: 'LEFT', image_url: '', link_url: '#', is_active: true, frequency: 'SESSION', sort_order: 1 });
                    setIsAdModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm quảng cáo</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Vị trí</th>
                      <th className="py-3.5 px-4">Tên quảng cáo</th>
                      <th className="py-3.5 px-4">Hình ảnh</th>
                      <th className="py-3.5 px-4">Liên kết đích</th>
                      <th className="py-3.5 px-4">Lượt bấm (Clicks)</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ads.map((ad) => (
                      <tr key={ad.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            ad.position === 'LEFT' ? 'bg-blue-100 text-brand-700' :
                            ad.position === 'RIGHT' ? 'bg-purple-100 text-purple-700' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {ad.position === 'LEFT' ? 'Banner Trái' : ad.position === 'RIGHT' ? 'Banner Phải' : 'Pop-up'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{ad.name}</td>
                        <td className="py-3.5 px-4">
                          <img src={ad.image_url} alt={ad.name} className="h-10 w-16 object-cover rounded shadow-sm" />
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500 max-w-xs truncate">{ad.link_url || '—'}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{ad.clicks}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            ad.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {ad.is_active ? 'Đang chạy' : 'Đã dừng'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingAd(ad);
                              setIsAdModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-brand-600 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: RBAC & USERS */}
          {activeTab === 'rbac' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Vai trò & Phân quyền (RBAC)</h2>
                  <p className="text-sm text-slate-500 mt-1">Quản lý danh sách tài khoản người dùng và ma trận quyền tòa soạn</p>
                </div>
                <button
                  onClick={() => {
                    setEditingUser({ email: '', full_name: '', password: '', roles: ['REPORTER'], is_active: true });
                    setIsUserModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm người dùng</span>
                </button>
              </div>

              {/* Roles Matrix Catalog */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900">Ma trận vai trò & Quyền hạn hệ thống</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {roles.map((r) => (
                    <div key={r.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="font-bold text-sm text-brand-700">{r.display_name}</div>
                      <p className="text-xs text-slate-500 leading-tight">{r.description}</p>
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1">
                        {r.permissions.map((p, pIdx) => (
                          <span key={pIdx} className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-mono">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Users List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Tài khoản (Email)</th>
                      <th className="py-3.5 px-4">Họ và tên</th>
                      <th className="py-3.5 px-4">Vai trò đảm nhiệm</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4">Ngày tạo</th>
                      <th className="py-3.5 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">{u.email}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">{u.full_name}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.map((r, rIdx) => (
                              <span key={rIdx} className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {u.is_active ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {new Date(u.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingUser({ ...u, password: '' });
                              setIsUserModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-brand-600 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {u.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: LEADS / PRODUCT REGISTRATIONS */}
          {activeTab === 'leads' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Danh sách Khách hàng Đăng ký Sản phẩm</h2>
                  <p className="text-sm text-slate-500 mt-1">Thông tin các doanh nghiệp gửi yêu cầu dùng thử phần mềm Chốt Lương từ Landing Page</p>
                </div>
                <div className="text-xs bg-white px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 shadow-sm">
                  Tổng đăng ký: <strong className="text-brand-600 text-sm">{leads.length}</strong> doanh nghiệp
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {leads.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm">Chưa có lượt đăng ký nào.</div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Doanh nghiệp</th>
                        <th className="py-3.5 px-4">Người liên hệ</th>
                        <th className="py-3.5 px-4">Quy mô & Nhu cầu</th>
                        <th className="py-3.5 px-4">Ghi chú</th>
                        <th className="py-3.5 px-4">Thời gian</th>
                        <th className="py-3.5 px-4">Trạng thái</th>
                        <th className="py-3.5 px-4 text-right">Xử lý</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leads.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{l.company_name}</div>
                            <span className="text-xs bg-blue-50 text-brand-700 px-2 py-0.5 rounded font-medium border border-blue-200">
                              {l.company_size}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{l.full_name}</div>
                            <div className="text-xs text-slate-500">{l.phone}</div>
                            <div className="text-xs font-mono text-slate-400">{l.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-xs font-semibold text-slate-700">{l.primary_need}</div>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                            {l.note || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                            {new Date(l.created_at).toLocaleString('vi-VN')}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              l.status === 'NEW' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              l.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}>
                              {l.status === 'NEW' ? 'Chưa liên hệ' : l.status === 'CONTACTED' ? 'Đã liên hệ' : 'Đã kích hoạt'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                            {l.status === 'NEW' && (
                              <button
                                onClick={() => handleUpdateLeadStatus(l.id, 'CONTACTED')}
                                className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                                title="Đánh dấu đã gọi điện tư vấn"
                              >
                                Đã gọi
                              </button>
                            )}
                            {l.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleUpdateLeadStatus(l.id, 'COMPLETED')}
                                className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                                title="Hoàn tất kích hoạt tài khoản"
                              >
                                Kích hoạt
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: WRITE / EDIT ARTICLE */}
      {/* ------------------------------------------------------------- */}
      {isArticleModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingArticle.id ? `Chỉnh sửa bài viết #${editingArticle.id}` : 'Soạn thảo bài viết mới (Bản nháp)'}
              </h3>
              <button onClick={() => setIsArticleModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề bài viết *</label>
                <input 
                  type="text" 
                  required
                  value={editingArticle.title || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  placeholder="Ví dụ: Công ty Chốt Lương mở rộng hợp tác phát hành thẻ chi hộ lương..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chuyên mục</label>
                  <select 
                    value={editingArticle.category || 'Tin công ty'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="Tin công ty">Tin công ty</option>
                    <option value="Kiến thức Quản trị">Kiến thức Quản trị</option>
                    <option value="Pháp luật Lao động">Pháp luật Lao động</option>
                    <option value="Sản phẩm & Giải pháp">Sản phẩm & Giải pháp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL ảnh bìa (Cover Image)</label>
                  <input 
                    type="url" 
                    value={editingArticle.cover_image_url || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, cover_image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đoạn mở đầu (Sapo tóm tắt)</label>
                <textarea 
                  rows={2}
                  value={editingArticle.sapo || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, sapo: e.target.value })}
                  placeholder="Tóm tắt ngắn gọn 1-2 câu về nội dung bài viết..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung chi tiết (HTML)</label>
                <textarea 
                  rows={8}
                  required
                  value={editingArticle.content_html || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content_html: e.target.value })}
                  placeholder="<p>Nội dung bài viết...</p>"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md"
                >
                  Lưu bài viết
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: WORKFLOW TRANSITION DIALOG (REASON REQUIRED) */}
      {/* ------------------------------------------------------------- */}
      {isTransitionModalOpen && transitionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">
              Xác nhận: {transitionData.title}
            </h3>

            <p className="text-xs text-slate-600">
              Bạn đang chuyển trạng thái cho bài viết <strong>#{transitionData.articleId}</strong> với hành động <strong>{transitionData.action}</strong>.
            </p>

            {transitionData.requireReason && (
              <div>
                <label className="block text-xs font-bold text-rose-700 mb-1">
                  Lý do chi tiết (Bắt buộc theo quy chế tòa soạn) *
                </label>
                <textarea 
                  rows={3}
                  required
                  value={transitionReason}
                  onChange={(e) => setTransitionReason(e.target.value)}
                  placeholder="Vui lòng ghi rõ lý do trả bài hoặc yêu cầu sửa đổi..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsTransitionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button 
                type="button" 
                onClick={handleExecuteTransition}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md"
              >
                Xác nhận chuyển trạng thái
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: AUDIT LOGS HISTORY */}
      {/* ------------------------------------------------------------- */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Nhật ký duyệt bài (Audit Trail)</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{currentArticleTitle}</p>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {currentLogs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">Chưa có nhật ký nào.</div>
              ) : (
                <div className="relative pl-6 border-l-2 border-brand-200 space-y-6">
                  {currentLogs.map((log) => (
                    <div key={log.id} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-brand-500 border-2 border-white shadow-sm" />
                      <div className="text-xs font-bold text-slate-800">
                        {log.action} : <span className="text-brand-600">{log.from_status}</span> → <span className="text-emerald-600">{log.to_status}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Thực hiện bởi: <strong>{log.actor_name}</strong> • {new Date(log.created_at).toLocaleString('vi-VN')}
                      </div>
                      {log.reason && (
                        <div className="mt-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                          <strong>Lý do:</strong> {log.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsLogModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: CREATE / EDIT AD */}
      {/* ------------------------------------------------------------- */}
      {isAdModalOpen && editingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              {editingAd.id ? 'Chỉnh sửa quảng cáo' : 'Thêm quảng cáo / Banner mới'}
            </h3>

            <form onSubmit={handleSaveAd} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên chiến dịch quảng cáo *</label>
                <input 
                  type="text" 
                  required
                  value={editingAd.name || ''}
                  onChange={(e) => setEditingAd({ ...editingAd, name: e.target.value })}
                  placeholder="Ví dụ: Banner Trái - Tải App Chốt Lương"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vị trí hiển thị</label>
                  <select 
                    value={editingAd.position || 'LEFT'}
                    onChange={(e) => setEditingAd({ ...editingAd, position: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="LEFT">Banner bên trái (LEFT)</option>
                    <option value="RIGHT">Banner bên phải (RIGHT)</option>
                    <option value="POPUP">Pop-up Khuyến Mãi (POPUP)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thứ tự hiển thị</label>
                  <input 
                    type="number" 
                    value={editingAd.sort_order || 1}
                    onChange={(e) => setEditingAd({ ...editingAd, sort_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Hình ảnh quảng cáo *</label>
                <input 
                  type="url" 
                  required
                  value={editingAd.image_url || ''}
                  onChange={(e) => setEditingAd({ ...editingAd, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Liên kết khi bấm vào (Link URL)</label>
                <input 
                  type="text" 
                  value={editingAd.link_url || ''}
                  onChange={(e) => setEditingAd({ ...editingAd, link_url: e.target.value })}
                  placeholder="#pricing hoặc https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingAd.is_active ?? true}
                    onChange={(e) => setEditingAd({ ...editingAd, is_active: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span className="font-bold text-slate-700">Kích hoạt quảng cáo</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsAdModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-md"
                >
                  Lưu quảng cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: CREATE / EDIT USER */}
      {/* ------------------------------------------------------------- */}
      {isUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              {editingUser.id ? `Chỉnh sửa tài khoản ${editingUser.email}` : 'Thêm người dùng mới'}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email đăng nhập *</label>
                <input 
                  type="email" 
                  required
                  disabled={!!editingUser.id}
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="btv2@chotluong.vn"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên *</label>
                <input 
                  type="text" 
                  required
                  value={editingUser.full_name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mật khẩu {editingUser.id ? '(Để trống nếu không đổi)' : '*'}
                </label>
                <input 
                  type="password" 
                  required={!editingUser.id}
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vai trò đảm nhiệm</label>
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  {['ADMIN', 'EDITOR_L2', 'EDITOR_L1', 'REPORTER'].map((r) => {
                    const checked = (editingUser.roles || []).includes(r);
                    return (
                      <label key={r} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input 
                          type="checkbox" 
                          checked={checked}
                          onChange={(e) => {
                            let updated = [...(editingUser.roles || [])];
                            if (e.target.checked) {
                              updated.push(r);
                            } else {
                              updated = updated.filter((x: string) => x !== r);
                            }
                            setEditingUser({ ...editingUser, roles: updated });
                          }}
                          className="w-4 h-4 text-brand-600 rounded"
                        />
                        <span>{r}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-md"
                >
                  Lưu tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

