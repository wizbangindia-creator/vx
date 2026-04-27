import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Users,
  Globe,
  Search,
  Filter,
  Download,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  LogOut,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Facebook,
  Chrome,
  Monitor,
  TrendingUp,
  Copy,
  Upload,
  FileSpreadsheet,
  Settings,
  X,
  Link,
  Zap,
  GraduationCap,
  Star,
  MessageSquare,
  Plus,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  Ticket,
  MessageCircle,
  Send,
  Edit3,
  Sparkles,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const sourceColors = {
  website: "bg-blue-100 text-blue-700",
  meta: "bg-purple-100 text-purple-700",
  google: "bg-green-100 text-green-700",
  google_sheets: "bg-emerald-100 text-emerald-700",
  university_change: "bg-teal-100 text-teal-700",
  germany_fair: "bg-amber-100 text-amber-700",
  ivr_missed_call: "bg-orange-100 text-orange-700",
  webhook: "bg-gray-100 text-gray-700",
};

const sourceIcons = {
  website: Monitor,
  meta: Facebook,
  google: Chrome,
  google_sheets: FileSpreadsheet,
  university_change: GraduationCap,
  germany_fair: Ticket,
  ivr_missed_call: Phone,
  webhook: Globe,
};

const statusColors = {
  new: "bg-yellow-100 text-yellow-700",
  contacted: "bg-blue-100 text-blue-700",
  converted: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

const statusIcons = {
  new: Clock,
  contacted: Phone,
  converted: CheckCircle2,
  closed: XCircle,
};

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(15);
  const [filters, setFilters] = useState({
    source: "",
    status: "",
    search: "",
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [showWebhookInfo, setShowWebhookInfo] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [showSyncSettings, setShowSyncSettings] = useState(false);
  const [syncSettings, setSyncSettings] = useState({
    google_sheets_url: "",
    auto_sync_enabled: false,
    last_sync: null,
    last_sync_result: null
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState("leads");
  const [reviews, setReviews] = useState([]);
  const [showAddReview, setShowAddReview] = useState(false);

  // Check for saved session
  useEffect(() => {
    const savedEmail = sessionStorage.getItem("dashboard_email");
    const savedPassword = sessionStorage.getItem("dashboard_password");
    const savedUserInfo = sessionStorage.getItem("dashboard_user_info");
    if (savedEmail && savedPassword) {
      setCredentials({ email: savedEmail, password: savedPassword });
      setIsAuthenticated(true);
      if (savedUserInfo) {
        setUserInfo(JSON.parse(savedUserInfo));
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API}/dashboard/login`, credentials);
      setIsAuthenticated(true);
      setUserInfo(response.data.user);
      sessionStorage.setItem("dashboard_email", credentials.email);
      sessionStorage.setItem("dashboard_password", credentials.password);
      sessionStorage.setItem("dashboard_user_info", JSON.stringify(response.data.user));
      toast.success(`Welcome, ${response.data.user?.name || 'User'}!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCredentials({ email: "", password: "" });
    setUserInfo(null);
    sessionStorage.removeItem("dashboard_email");
    sessionStorage.removeItem("dashboard_password");
    sessionStorage.removeItem("dashboard_user_info");
    toast.success("Logged out successfully");
  };

  const getAuthParams = useCallback(() => {
    return `email=${encodeURIComponent(credentials.email)}&password=${encodeURIComponent(credentials.password)}`;
  }, [credentials]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats?${getAuthParams()}`);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  }, [getAuthParams]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        email: credentials.email,
        password: credentials.password,
        page: currentPage,
        per_page: perPage,
        ...(filters.source && { source: filters.source }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });
      
      const response = await axios.get(`${API}/dashboard/leads?${params}`);
      setLeads(response.data.leads);
      setTotalLeads(response.data.total);
    } catch (error) {
      toast.error("Failed to fetch leads");
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [credentials, currentPage, perPage, filters]);

  const fetchSyncSettings = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/dashboard/sync-settings?${getAuthParams()}`);
      setSyncSettings(response.data);
    } catch (error) {
      console.error("Failed to fetch sync settings:", error);
    }
  }, [getAuthParams]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/dashboard/reviews?${getAuthParams()}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  }, [getAuthParams]);

  const handleSyncNow = async () => {
    if (!syncSettings.google_sheets_url) {
      toast.error("Please configure Google Sheets URL first");
      setShowSyncSettings(true);
      return;
    }
    
    setIsSyncing(true);
    try {
      const response = await axios.post(
        `${API}/dashboard/sync-google-sheets?${getAuthParams()}&sheet_url=${encodeURIComponent(syncSettings.google_sheets_url)}`
      );
      toast.success(response.data.message);
      fetchStats();
      fetchLeads();
      fetchSyncSettings();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchLeads();
      fetchSyncSettings();
      fetchReviews();
    }
  }, [isAuthenticated, fetchStats, fetchLeads, fetchSyncSettings, fetchReviews]);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await axios.patch(
        `${API}/dashboard/leads/${leadId}/status?status=${newStatus}&${getAuthParams()}`
      );
      toast.success(`Status updated to ${newStatus}`);
      fetchLeads();
      fetchStats();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await axios.delete(`${API}/dashboard/reviews/${reviewId}?${getAuthParams()}`);
      toast.success("Review deleted");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const handleToggleReview = async (reviewId) => {
    try {
      await axios.patch(`${API}/dashboard/reviews/${reviewId}/toggle?${getAuthParams()}`);
      toast.success("Review status updated");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to toggle review");
    }
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    
    try {
      await axios.delete(`${API}/dashboard/leads/${leadId}?${getAuthParams()}`);
      toast.success("Lead deleted");
      fetchLeads();
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        email: credentials.email,
        password: credentials.password,
        ...(filters.source && { source: filters.source }),
        ...(filters.status && { status: filters.status }),
      });
      
      const response = await axios.get(`${API}/dashboard/export?${params}`);
      const leadsData = response.data.leads;
      
      const headers = ["Name", "Email", "Phone", "City", "Country", "Source", "Status", "Created At", "Campaign"];
      const csvContent = [
        headers.join(","),
        ...leadsData.map(lead => [
          `"${lead.name || ""}"`,
          `"${lead.email || ""}"`,
          `"${lead.phone || ""}"`,
          `"${lead.city || ""}"`,
          `"${lead.country || ""}"`,
          `"${lead.source || ""}"`,
          `"${lead.status || ""}"`,
          `"${lead.created_at || ""}"`,
          `"${lead.campaign || ""}"`,
        ].join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      
      toast.success(`Exported ${leadsData.length} leads`);
    } catch (error) {
      toast.error("Failed to export leads");
    }
  };

  const totalPages = Math.ceil(totalLeads / perPage);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Leads Dashboard</h1>
              <p className="text-slate-500 mt-2">Sign in to access your leads</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  placeholder="admin@visaxpert.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  data-testid="login-email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  data-testid="login-password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !credentials.email || !credentials.password}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                data-testid="login-submit"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">VisaXpert Leads</h1>
                <p className="text-xs text-slate-500">
                  {totalLeads} total leads
                  {userInfo?.access === "university_change" && " (University Change)"}
                  {userInfo?.access === "main_landing" && " (Main Landing)"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* User Info */}
              {userInfo && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm">
                  <span className="text-slate-600">Welcome,</span>
                  <span className="font-medium text-slate-900">{userInfo.name}</span>
                </div>
              )}
              
              {/* Google Sheets Sync Button - Only for main_landing or all access */}
              {(!userInfo || userInfo?.access !== "university_change") && (
              <>
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  syncSettings.google_sheets_url 
                    ? "bg-green-50 text-green-700 hover:bg-green-100" 
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
                data-testid="sync-btn"
                title={syncSettings.last_sync ? `Last sync: ${new Date(syncSettings.last_sync).toLocaleString()}` : "Sync Google Sheets"}
              >
                <Zap size={16} className={isSyncing ? "animate-pulse" : ""} />
                <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync"}</span>
              </button>
              <button
                onClick={() => setShowSyncSettings(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                data-testid="sync-settings-btn"
              >
                <Link size={16} />
                <span className="hidden sm:inline">Sheets</span>
              </button>
              <button
                onClick={() => setShowImporter(true)}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
                data-testid="import-btn"
              >
                <Upload size={16} />
                <span className="hidden sm:inline">Import</span>
              </button>
              </>
              )}
              <button
                onClick={() => setShowWebhookInfo(true)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                data-testid="webhook-info-btn"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Setup</span>
              </button>
              <button
                onClick={() => setActiveTab(activeTab === "reviews" ? "leads" : "reviews")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === "reviews" ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
                data-testid="reviews-tab-btn"
              >
                <Star size={16} />
                <span className="hidden sm:inline">Reviews</span>
              </button>
              <button
                onClick={() => setActiveTab(activeTab === "whatsapp" ? "leads" : "whatsapp")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === "whatsapp" ? "bg-green-500 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                data-testid="whatsapp-tab-btn"
              >
                <MessageCircle size={16} />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button
                onClick={() => setActiveTab(activeTab === "logos" ? "leads" : "logos")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === "logos" ? "bg-indigo-500 text-white" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"}`}
                data-testid="logos-tab-btn"
              >
                <ImageIcon size={16} />
                <span className="hidden sm:inline">Header Logo</span>
              </button>
              <button
                onClick={() => setActiveTab(activeTab === "partner_logos" ? "leads" : "partner_logos")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === "partner_logos" ? "bg-purple-500 text-white" : "bg-purple-50 text-purple-700 hover:bg-purple-100"}`}
                data-testid="partner-logos-tab-btn"
              >
                <ImageIcon size={16} />
                <span className="hidden sm:inline">Partner Logos</span>
              </button>
              <button
                onClick={() => { fetchStats(); fetchLeads(); fetchSyncSettings(); }}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                data-testid="refresh-btn"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
                data-testid="logout-btn"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <StatCard title="Total Leads" value={stats.total_leads} icon={Users} color="blue" />
            <StatCard title="Today" value={stats.today_leads} icon={TrendingUp} color="green" />
            <StatCard title="Website" value={stats.by_source?.website || stats.website_leads || 0} icon={Monitor} color="indigo" />
            <StatCard title="Meta Ads" value={stats.by_source?.meta || stats.meta_leads || 0} icon={Facebook} color="purple" />
            <StatCard title="Google" value={stats.by_source?.google || stats.google_leads || 0} icon={Chrome} color="emerald" />
            <StatCard title="Uni Change" value={stats.by_source?.university_change || 0} icon={GraduationCap} color="teal" />
          </div>
        )}

        {activeTab === "leads" ? (
        <>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, city..."
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                data-testid="search-input"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-400" />
              <select
                value={filters.source}
                onChange={(e) => {
                  setFilters({ ...filters, source: e.target.value });
                  setCurrentPage(1);
                }}
                className="px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                data-testid="source-filter"
              >
                <option value="">All Sources</option>
                <option value="website">Website</option>
                <option value="meta">Meta Ads</option>
                <option value="google">Google</option>
                <option value="university_change">University Change</option>
                <option value="germany_fair">Germany Fair</option>
                <option value="ivr_missed_call">IVR Calls</option>
              </select>
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              data-testid="status-filter"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
            </select>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
              data-testid="export-btn"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <RefreshCw size={24} className="animate-spin mx-auto text-slate-400 mb-2" />
              <p className="text-slate-500">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No leads found</p>
              <p className="text-slate-400 text-sm mt-1">Leads will appear here when captured</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.map((lead) => {
                      const SourceIcon = sourceIcons[lead.source] || Globe;
                      
                      return (
                        <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{lead.name || "—"}</div>
                            {lead.campaign && (
                              <div className="text-xs text-slate-400 mt-1">{lead.campaign}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {lead.email && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Mail size={14} className="text-slate-400" />
                                  <a href={`mailto:${lead.email}`} className="hover:text-blue-600">{lead.email}</a>
                                </div>
                              )}
                              {lead.phone && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Phone size={14} className="text-slate-400" />
                                  <a href={`tel:${lead.phone}`} className="hover:text-blue-600">{lead.phone}</a>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-2 text-sm text-slate-600">
                              <MapPin size={14} className="text-slate-400 mt-0.5" />
                              <div>
                                {lead.city && <div>{lead.city}</div>}
                                {lead.country && <div className="text-slate-400">{lead.country}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sourceColors[lead.source] || sourceColors.webhook}`}>
                              <SourceIcon size={12} />
                              {lead.source}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[lead.status]}`}
                              data-testid={`status-select-${lead.id}`}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="converted">Converted</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Calendar size={14} />
                              {new Date(lead.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedLead(lead)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                data-testid={`view-btn-${lead.id}`}
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(lead.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                data-testid={`delete-btn-${lead.id}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500">
                    Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalLeads)} of {totalLeads} leads
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm text-slate-600 px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        </>
        ) : activeTab === "reviews" ? (
        /* Reviews Management Tab */
        <div className="space-y-6" data-testid="reviews-management">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Manage Reviews</h2>
              <p className="text-sm text-slate-500 mt-1">Add reviews that appear on your landing pages</p>
            </div>
            <button
              onClick={() => setShowAddReview(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium shadow-sm"
              data-testid="add-review-btn"
            >
              <Plus size={16} />
              Add Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No reviews yet</p>
              <p className="text-slate-400 text-sm mt-1">Add reviews to display on your landing pages</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reviews.map((review) => (
                <div key={review.review_id} className={`bg-white rounded-xl border p-5 ${review.is_active ? 'border-slate-200' : 'border-red-200 bg-red-50/30'}`} data-testid={`review-card-${review.review_id}`}>
                  <div className="flex items-start gap-4">
                    {review.image_url ? (
                      <img src={review.image_url.replace(/^\/assets\/uploads\//, "/api/uploads/")} alt={review.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-700 font-bold text-xl">{review.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">{review.name}</h4>
                        <span className="text-xs text-slate-400">|</span>
                        <span className="text-sm text-slate-500">{review.country}</span>
                        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${review.page === 'main' ? 'bg-blue-100 text-blue-700' : review.page === 'university_change' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                          {review.page === 'main' ? 'Main Page' : review.page === 'university_change' ? 'Uni Change' : 'Germany Fair'}
                        </span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[...Array(review.rating || 5)].map((_, i) => (
                          <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-slate-600 text-sm">"{review.content}"</p>
                      {!review.is_active && <p className="text-red-500 text-xs mt-2 font-medium">Hidden from pages</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleToggleReview(review.review_id)}
                        className={`p-2 rounded-lg transition-colors ${review.is_active ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`}
                        title={review.is_active ? "Hide review" : "Show review"}
                        data-testid={`toggle-review-${review.review_id}`}
                      >
                        {review.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.review_id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`delete-review-${review.review_id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        ) : activeTab === "whatsapp" ? (
        /* WhatsApp Templates & Schedule Manager */
        <WhatsAppManager credentials={credentials} />
        ) : activeTab === "partner_logos" ? (
        /* Partner Logos Manager (sliding) */
        <PartnerLogosManager credentials={credentials} />
        ) : (
        /* Header Logo Manager */
        <LogosManager credentials={credentials} />
        )}
      </main>

      {/* Add Review Modal */}
      {showAddReview && (
        <AddReviewModal
          onClose={() => setShowAddReview(false)}
          credentials={credentials}
          onReviewAdded={() => { fetchReviews(); setShowAddReview(false); }}
        />
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <Modal onClose={() => setSelectedLead(null)} title="Lead Details">
          <div className="space-y-4">
            <DetailRow label="Name" value={selectedLead.name} />
            <DetailRow label="Email" value={selectedLead.email} />
            <DetailRow label="Phone" value={selectedLead.phone} />
            <DetailRow label="City" value={selectedLead.city} />
            <DetailRow label="Country" value={selectedLead.country} />
            <DetailRow label="Source" value={selectedLead.source} />
            <DetailRow label="Status" value={selectedLead.status} />
            <DetailRow label="Campaign" value={selectedLead.campaign} />
            <DetailRow label="Platform" value={selectedLead.platform} />
            <DetailRow label="Created" value={new Date(selectedLead.created_at).toLocaleString()} />
            {selectedLead.extra_data && Object.keys(selectedLead.extra_data).length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">Extra Data</p>
                <pre className="bg-slate-50 p-3 rounded-lg text-xs overflow-auto max-h-40">
                  {JSON.stringify(selectedLead.extra_data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Webhook Info Modal */}
      {showWebhookInfo && (
        <Modal onClose={() => setShowWebhookInfo(false)} title="Integration Setup" large>
          <div className="space-y-6">
            {/* Facebook Setup */}
            <div className="border border-purple-200 rounded-xl p-4 bg-purple-50/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Facebook size={20} className="text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Meta (Facebook/Instagram) Lead Ads</h4>
                  <p className="text-xs text-slate-500">Direct integration - No Zapier needed</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <p className="font-medium text-slate-700">Setup Steps:</p>
                <ol className="list-decimal list-inside space-y-2 text-slate-600">
                  <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">developers.facebook.com</a> → Create App → Business</li>
                  <li>Add <strong>Webhooks</strong> product to your app</li>
                  <li>Click <strong>Configure</strong> → Select <strong>Page</strong> from dropdown</li>
                  <li>Click <strong>Subscribe to this object</strong></li>
                  <li>Enter these details:</li>
                </ol>
                
                <div className="bg-white rounded-lg p-3 space-y-2">
                  <div>
                    <label className="text-xs text-slate-500">Callback URL:</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-slate-100 px-2 py-1 rounded text-xs">{BACKEND_URL}/api/webhook/facebook</code>
                      <button onClick={() => copyToClipboard(`${BACKEND_URL}/api/webhook/facebook`)} className="p-1 text-slate-400 hover:text-slate-600">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Verify Token:</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-slate-100 px-2 py-1 rounded text-xs">visaxpert_leads_2024</code>
                      <button onClick={() => copyToClipboard("visaxpert_leads_2024")} className="p-1 text-slate-400 hover:text-slate-600">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <ol start={6} className="list-decimal list-inside space-y-2 text-slate-600">
                  <li>Subscribe to <strong>leadgen</strong> field</li>
                  <li>Go to your Facebook Page Settings → Leads → Connect your app</li>
                  <li>Done! Leads will flow directly to this dashboard</li>
                </ol>
              </div>
            </div>

            {/* Google Sheets Import */}
            <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Google Sheets Import</h4>
                  <p className="text-xs text-slate-500">Import leads from Google Ads via Sheets</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <p className="font-medium text-slate-700">Setup Steps:</p>
                <ol className="list-decimal list-inside space-y-2 text-slate-600">
                  <li>In Google Ads, go to Lead Form Extensions</li>
                  <li>Enable "Google Sheets" as lead destination</li>
                  <li>Export leads from Google Sheets as CSV</li>
                  <li>Click "Import" button above to upload</li>
                </ol>
                
                <button
                  onClick={() => { setShowWebhookInfo(false); setShowImporter(true); }}
                  className="w-full mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                >
                  Open Importer
                </button>
              </div>
            </div>

            {/* Universal Webhook */}
            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Globe size={20} className="text-slate-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Universal Webhook</h4>
                  <p className="text-xs text-slate-500">For custom integrations</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-slate-100 px-3 py-2 rounded text-sm">{BACKEND_URL}/api/webhook/lead</code>
                <button onClick={() => copyToClipboard(`${BACKEND_URL}/api/webhook/lead`)} className="p-2 text-slate-400 hover:text-slate-600">
                  <Copy size={16} />
                </button>
              </div>
              
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">View Example Payload</summary>
                <pre className="mt-2 bg-slate-50 p-3 rounded-lg text-xs overflow-auto">
{JSON.stringify({
  name: "John Doe",
  email: "john@example.com",
  phone: "9876543210",
  city: "Delhi",
  country: "Canada",
  source: "custom",
  campaign: "My Campaign"
}, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </Modal>
      )}

      {/* Importer Modal */}
      {showImporter && (
        <SheetsImporter
          onClose={() => setShowImporter(false)}
          credentials={credentials}
          onImportComplete={() => { fetchStats(); fetchLeads(); }}
        />
      )}

      {/* Google Sheets Sync Settings Modal */}
      {showSyncSettings && (
        <GoogleSheetsSettings
          onClose={() => setShowSyncSettings(false)}
          credentials={credentials}
          syncSettings={syncSettings}
          onSettingsSaved={() => { fetchSyncSettings(); }}
          onSyncNow={handleSyncNow}
          isSyncing={isSyncing}
        />
      )}
    </div>
  );
}

// Modal Component
function Modal({ children, onClose, title, large = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${large ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto p-6`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold text-slate-900 mb-6">{title}</h3>
        {children}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
  };
  
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{title}</p>
        </div>
      </div>
    </div>
  );
}

// Detail Row Component
function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-sm text-slate-900 text-right">{value}</p>
    </div>
  );
}

// Google Sheets Importer Component
function SheetsImporter({ onClose, credentials, onImportComplete }) {
  const [csvData, setCsvData] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState(null);

  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, "").toLowerCase());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].match(/(".*?"|[^,]+)/g) || [];
      const row = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || "";
        value = value.trim().replace(/^"|"$/g, "");
        
        // Map common header variations
        if (header.includes("name")) row.name = value;
        else if (header.includes("email")) row.email = value;
        else if (header.includes("phone") || header.includes("mobile")) row.phone = value;
        else if (header.includes("city")) row.city = value;
        else if (header.includes("country")) row.country = value;
        else if (header.includes("source")) row.source = value;
        else if (header.includes("date") || header.includes("time")) row.date = value;
      });
      
      if (row.name || row.email || row.phone) {
        data.push(row);
      }
    }
    
    return data;
  };

  const handlePaste = (e) => {
    const text = e.target.value;
    setCsvData(text);
    const parsed = parseCSV(text);
    setParsedData(parsed);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCsvData(text);
      const parsed = parseCSV(text);
      setParsedData(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast.error("No data to import");
      return;
    }
    
    setIsImporting(true);
    try {
      const response = await axios.post(
        `${API}/dashboard/import-sheets?email=${encodeURIComponent(credentials.email)}&password=${encodeURIComponent(credentials.password)}`,
        parsedData
      );
      setResult(response.data);
      toast.success(`Imported ${response.data.imported} leads!`);
      onImportComplete();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Import from Google Sheets" large>
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <strong>How to export from Google Sheets:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Open your Google Sheet with leads</li>
            <li>Go to File → Download → CSV</li>
            <li>Upload the CSV file below or paste the data</li>
          </ol>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Upload CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Or Paste CSV Data</label>
          <textarea
            value={csvData}
            onChange={handlePaste}
            placeholder="name,email,phone,city,country,date&#10;John Doe,john@example.com,9876543210,Delhi,Canada,2024-01-01"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-32 font-mono"
          />
        </div>

        {parsedData.length > 0 && (
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-sm font-medium text-slate-700 mb-2">Preview ({parsedData.length} rows found):</p>
            <div className="max-h-40 overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="p-1">Name</th>
                    <th className="p-1">Email</th>
                    <th className="p-1">Phone</th>
                    <th className="p-1">City</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t border-slate-200">
                      <td className="p-1">{row.name || "—"}</td>
                      <td className="p-1">{row.email || "—"}</td>
                      <td className="p-1">{row.phone || "—"}</td>
                      <td className="p-1">{row.city || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 5 && (
                <p className="text-xs text-slate-400 mt-2">...and {parsedData.length - 5} more rows</p>
              )}
            </div>
          </div>
        )}

        {result && (
          <div className={`rounded-lg p-3 ${result.imported > 0 ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
            <p className="font-medium">Import Complete!</p>
            <p className="text-sm">Imported: {result.imported} | Skipped: {result.skipped}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting || parsedData.length === 0}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isImporting ? "Importing..." : `Import ${parsedData.length} Leads`}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Google Sheets Auto-Sync Settings Component
function GoogleSheetsSettings({ onClose, credentials, syncSettings, onSettingsSaved, onSyncNow, isSyncing }) {
  const [sheetUrl, setSheetUrl] = useState(syncSettings.google_sheets_url || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post(
        `${API}/dashboard/sync-settings?email=${encodeURIComponent(credentials.email)}&password=${encodeURIComponent(credentials.password)}&google_sheets_url=${encodeURIComponent(sheetUrl)}&auto_sync_enabled=false&sync_interval_minutes=30`
      );
      toast.success("Settings saved!");
      onSettingsSaved();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncAndClose = async () => {
    await handleSave();
    if (sheetUrl) {
      onSyncNow();
    }
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Google Sheets Auto-Sync" large>
      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">How to Connect Google Sheets</h4>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Open your Google Sheet containing leads</li>
            <li>Click <strong>Share</strong> → Set to <strong>"Anyone with link can view"</strong></li>
            <li>Copy the sheet URL and paste it below</li>
            <li>Click "Sync Now" to import leads</li>
          </ol>
        </div>

        {/* Sheet URL Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Google Sheet URL</label>
          <input
            type="text"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            data-testid="sheet-url-input"
          />
          <p className="text-xs text-slate-500 mt-2">
            Make sure your sheet has columns: Name, Email, Phone, City, Country
          </p>
        </div>

        {/* Last Sync Info */}
        {syncSettings.last_sync && (
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Last Sync</p>
                <p className="text-xs text-slate-500">{new Date(syncSettings.last_sync).toLocaleString()}</p>
              </div>
              {syncSettings.last_sync_result && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {syncSettings.last_sync_result}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Google Ads Instructions */}
        <div className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-2">For Google Ads Lead Forms:</h4>
          <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
            <li>Go to Google Ads → Assets → Lead Form Extensions</li>
            <li>Edit your lead form → Lead delivery</li>
            <li>Enable <strong>"Google Sheets"</strong></li>
            <li>Create or link a Google Sheet</li>
            <li>Leads will automatically sync to that sheet</li>
            <li>Paste the sheet URL above to import into this dashboard</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
          <button
            onClick={handleSyncAndClose}
            disabled={isSyncing || !sheetUrl}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Zap size={16} className={isSyncing ? "animate-pulse" : ""} />
            {isSyncing ? "Syncing..." : "Save & Sync Now"}
          </button>
        </div>
      </div>
    </Modal>
  );
}


// Add Review Modal Component
function AddReviewModal({ onClose, credentials, onReviewAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    content: "",
    image_url: "",
    rating: 5,
  });
  const [selectedPages, setSelectedPages] = useState(["main"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const PAGE_OPTIONS = [
    { value: "main", label: "Main Landing Page" },
    { value: "university_change", label: "University Change Page" },
    { value: "germany_fair", label: "Germany Fair Page" },
  ];

  const togglePage = (value) => {
    setSelectedPages((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload to backend
    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const response = await axios.post(
        `${API}/upload/image?email=${encodeURIComponent(credentials.email)}&password=${encodeURIComponent(credentials.password)}`,
        uploadData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setFormData({ ...formData, image_url: response.data.image_url });
      toast.success("Photo uploaded!");
    } catch (error) {
      toast.error("Failed to upload photo");
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.country || !formData.content) {
      toast.error("Please fill in name, country, and review content");
      return;
    }
    if (formData.content.length < 10) {
      toast.error("Review content must be at least 10 characters");
      return;
    }
    if (selectedPages.length === 0) {
      toast.error("Please select at least one page to display this review on");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create one review per selected page so each page can manage them independently
      await Promise.all(
        selectedPages.map((page) =>
          axios.post(
            `${API}/dashboard/reviews?email=${encodeURIComponent(credentials.email)}&password=${encodeURIComponent(credentials.password)}`,
            { ...formData, page }
          )
        )
      );
      toast.success(
        selectedPages.length > 1
          ? `Review added to ${selectedPages.length} pages!`
          : "Review added successfully!"
      );
      onReviewAdded();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to add review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Add New Review" large>
      <form onSubmit={handleSubmit} className="space-y-5" data-testid="add-review-form">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Student Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Priya Sharma"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
              data-testid="review-input-name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Country *</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="e.g. Canada"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
              data-testid="review-input-country"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Student Photo (optional)</label>
          <div className="flex items-center gap-4">
            <label
              className={`flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors text-sm ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
              data-testid="review-photo-upload"
            >
              <Upload size={18} className="text-slate-500" />
              <span className="text-slate-600">{isUploading ? "Uploading..." : "Choose Photo"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                className="hidden"
                data-testid="review-input-image-file"
              />
            </label>
            {(imagePreview || formData.image_url) && (
              <div className="relative">
                <img
                  src={imagePreview || formData.image_url}
                  alt="Preview"
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-200"
                />
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setFormData({ ...formData, image_url: "" }); }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Max 5MB. JPEG, PNG, WebP or GIF</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Review Content *</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write the student's review..."
            rows={4}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm resize-none"
            data-testid="review-input-content"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1"
                  data-testid={`review-star-${star}`}
                >
                  <Star
                    size={24}
                    className={star <= formData.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Display On Pages <span className="text-slate-400 font-normal">(select one or more)</span>
            </label>
            <div className="space-y-2">
              {PAGE_OPTIONS.map((opt) => {
                const checked = selectedPages.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2.5 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                      checked
                        ? "border-amber-400 bg-amber-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                    data-testid={`review-page-option-${opt.value}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePage(opt.value)}
                      className="w-4 h-4 accent-amber-500"
                      data-testid={`review-page-checkbox-${opt.value}`}
                    />
                    <span className="text-sm text-slate-700">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="review-submit-btn"
          >
            {isSubmitting ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {isSubmitting ? "Adding..." : "Add Review"}
          </button>
        </div>
      </form>
    </Modal>
  );
}


// ==================== WHATSAPP TEMPLATES MANAGER ====================
const PLACEHOLDER_OPTIONS = [
  { value: "name", label: "{name} — First name of lead" },
  { value: "full_name", label: "{full_name} — Full name" },
  { value: "city", label: "{city} — Lead's home city" },
  { value: "preferred_city", label: "{preferred_city} — Fair location chosen (e.g. Jammu)" },
  { value: "preferred_branch", label: "{preferred_branch} — Branch chosen for offline visit" },
  { value: "branch_address", label: "{branch_address} — Full address of chosen branch" },
  { value: "branch_phone", label: "{branch_phone} — Phone number of chosen branch" },
  { value: "branch_contact_name", label: "{branch_contact_name} — e.g. Team Visaxpert Ludhiana" },
  { value: "counselling_mode", label: "{counselling_mode} — online / offline" },
  { value: "event_date", label: "{event_date} — Fair date (e.g. 25th May 2026)" },
  { value: "phone", label: "{phone} — Phone number" },
];

const CATEGORY_OPTIONS = [
  { value: "germany_fair", label: "Germany Fair" },
  { value: "main_online", label: "Main Page - Online Counselling" },
  { value: "main_offline", label: "Main Page - Offline Counselling" },
];

const CATEGORY_LABELS = CATEGORY_OPTIONS.reduce((acc, o) => {
  acc[o.value] = o.label;
  return acc;
}, {});

const TRIGGER_LABELS = {
  immediate: "Immediately (on form submit)",
  days_before: "X days before event",
  same_day: "On event day",
};

function WhatsAppManager({ credentials }) {
  const [templates, setTemplates] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingTpl, setLoadingTpl] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState("templates"); // templates | messages
  const [statusFilter, setStatusFilter] = useState("");

  const fetchTemplates = useCallback(async () => {
    setLoadingTpl(true);
    try {
      const { data } = await axios.get(`${API}/dashboard/whatsapp/templates`, {
        params: credentials,
      });
      setTemplates(data.templates || []);
    } catch (e) {
      toast.error("Failed to load templates");
    } finally {
      setLoadingTpl(false);
    }
  }, [credentials]);

  const fetchMessages = useCallback(async () => {
    setLoadingMsgs(true);
    try {
      const params = { ...credentials, limit: 200 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await axios.get(`${API}/dashboard/whatsapp/messages`, { params });
      setMessages(data.messages || []);
    } catch (e) {
      toast.error("Failed to load messages");
    } finally {
      setLoadingMsgs(false);
    }
  }, [credentials, statusFilter]);

  useEffect(() => {
    fetchTemplates();
    fetchMessages();
  }, [fetchTemplates, fetchMessages]);

  const handleDelete = async (template_id) => {
    if (!window.confirm("Delete this template? Pending scheduled messages will be cancelled.")) return;
    try {
      await axios.delete(`${API}/dashboard/whatsapp/templates/${template_id}`, {
        params: credentials,
      });
      toast.success("Template deleted");
      fetchTemplates();
      fetchMessages();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleRetry = async (msg_id) => {
    try {
      await axios.post(`${API}/dashboard/whatsapp/messages/${msg_id}/retry`, {}, {
        params: credentials,
      });
      toast.success("Message queued for retry");
      fetchMessages();
    } catch {
      toast.error("Retry failed");
    }
  };

  const handleCancel = async (msg_id) => {
    if (!window.confirm("Cancel this pending message?")) return;
    try {
      await axios.delete(`${API}/dashboard/whatsapp/messages/${msg_id}`, {
        params: credentials,
      });
      toast.success("Message cancelled");
      fetchMessages();
    } catch {
      toast.error("Cancel failed");
    }
  };

  const handleSeedGF = async () => {
    if (!window.confirm("Create 6 draft Germany Fair templates (1 immediate + 4 days-before + 1 on-event-day)?\n\nThey'll be INACTIVE — just edit each one, paste the AiSensy campaign name, and flip Active on.")) return;
    try {
      const { data } = await axios.post(
        `${API}/dashboard/whatsapp/seed-germany-fair`,
        {},
        { params: credentials }
      );
      if (data.success) {
        toast.success(`Created ${data.created} draft templates. Edit each to set the AiSensy campaign name.`);
        fetchTemplates();
      } else {
        toast.error(data.message || "Seed skipped");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Seed failed");
    }
  };

  return (
    <div className="space-y-6" data-testid="whatsapp-manager">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">WhatsApp Config</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage message templates and scheduled sends for every lead flow (Main Page Online / Offline, Germany Fair)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 rounded-lg p-1 flex items-center">
            <button
              onClick={() => setView("templates")}
              className={`px-3 py-1.5 rounded text-sm font-medium ${view === "templates" ? "bg-white text-green-700 shadow-sm" : "text-slate-600"}`}
              data-testid="wa-view-templates"
            >Templates</button>
            <button
              onClick={() => setView("messages")}
              className={`px-3 py-1.5 rounded text-sm font-medium ${view === "messages" ? "bg-white text-green-700 shadow-sm" : "text-slate-600"}`}
              data-testid="wa-view-messages"
            >Message Log</button>
          </div>
          {view === "templates" && (
            <>
              <button
                onClick={handleSeedGF}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium shadow-sm"
                data-testid="wa-seed-gf-btn"
                title="Create 6 Germany Fair draft templates you just need to name"
              >
                <Sparkles size={16} /> Seed Germany Fair (6)
              </button>
              <button
                onClick={() => { setEditing(null); setShowForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium shadow-sm"
                data-testid="wa-new-template-btn"
              >
                <Plus size={16} /> New Template
              </button>
            </>
          )}
          <button
            onClick={() => { fetchTemplates(); fetchMessages(); }}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            data-testid="wa-refresh-btn"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {view === "templates" ? (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <p className="font-medium mb-1">How it works</p>
            <ul className="list-disc pl-5 space-y-1 text-blue-800">
              <li>Each template is tied to a <strong>Category</strong> that picks which lead flow it fires on:
                <code className="bg-white px-1 rounded mx-1">Main Page - Online</code>,
                <code className="bg-white px-1 rounded mx-1">Main Page - Offline</code>, or
                <code className="bg-white px-1 rounded mx-1">Germany Fair</code>.
              </li>
              <li>Main-page templates send <strong>immediately</strong> after the form submit; Germany Fair supports scheduled days-before / on-event reminders.</li>
              <li><strong>Campaign name</strong> must exactly match a <em>live campaign</em> created in your AiSensy dashboard (attached to an approved template).</li>
              <li>Body parameters fill the template's <code>{'{{1}}'}</code>, <code>{'{{2}}'}</code> etc. in order.</li>
              <li>Use <code>static:your text</code> to pass a literal string.</li>
            </ul>
          </div>

          {loadingTpl ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">Loading…</div>
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <MessageCircle size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No templates yet</p>
              <p className="text-slate-400 text-sm mt-1">Create one to start sending automated messages</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {templates.map((t) => (
                <div key={t.template_id}
                  className={`bg-white rounded-xl border p-5 ${t.active ? "border-slate-200" : "border-red-200 bg-red-50/30"}`}
                  data-testid={`wa-template-${t.template_id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h4 className="font-semibold text-slate-900">{t.name}</h4>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                          {CATEGORY_LABELS[t.category || "germany_fair"] || t.category || "Germany Fair"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {t.wa_template_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {TRIGGER_LABELS[t.trigger_type] || t.trigger_type}
                          {t.trigger_type === "days_before" ? ` (${t.days_before}d)` : ""}
                        </span>
                        {!t.active && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        Lang: <span className="font-mono">{t.language_code}</span>
                        {"  •  Send @ "}{String(t.send_hour_utc).padStart(2, "0")}:00 UTC
                      </p>
                      {(t.body_params || []).length > 0 && (
                        <div className="text-xs text-slate-600">
                          <span className="font-medium">Body params:</span>{" "}
                          {t.body_params.map((p, i) => (
                            <code key={i} className="inline-block bg-slate-100 px-1.5 py-0.5 rounded mr-1 font-mono text-[11px]">
                              {`{{${i + 1}}}`} = {p}
                            </code>
                          ))}
                        </div>
                      )}
                      {t.header_param && (
                        <div className="text-xs text-slate-600 mt-1">
                          <span className="font-medium">Header:</span>{" "}
                          <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">{t.header_param}</code>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => { setEditing(t); setShowForm(true); }}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        data-testid={`wa-edit-${t.template_id}`}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.template_id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        data-testid={`wa-delete-${t.template_id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
              data-testid="wa-msg-status-filter"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="sending">Sending</option>
            </select>
            <span className="text-sm text-slate-500">{messages.length} message(s)</span>
          </div>
          {loadingMsgs ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">Loading…</div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Send size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No messages in queue</p>
              <p className="text-slate-400 text-sm mt-1">Messages are scheduled automatically on Germany Fair lead submission</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Phone</th>
                    <th className="text-left px-3 py-2">Template</th>
                    <th className="text-left px-3 py-2">City</th>
                    <th className="text-left px-3 py-2">Scheduled</th>
                    <th className="text-left px-3 py-2">Sent / Error</th>
                    <th className="text-right px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((m) => {
                    const statusPill = {
                      pending: "bg-yellow-100 text-yellow-700",
                      sending: "bg-blue-100 text-blue-700",
                      sent: "bg-green-100 text-green-700",
                      failed: "bg-red-100 text-red-700",
                      cancelled: "bg-slate-200 text-slate-600",
                    }[m.status] || "bg-slate-100 text-slate-600";
                    return (
                      <tr key={m.msg_id} className="border-t border-slate-100" data-testid={`wa-msg-${m.msg_id}`}>
                        <td className="px-3 py-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusPill}`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{m.phone}</td>
                        <td className="px-3 py-2">
                          <div className="font-medium">{m.template_display_name}</div>
                          <div className="text-xs text-slate-500">{m.wa_template_name}</div>
                        </td>
                        <td className="px-3 py-2">{m.preferred_city || "—"}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : "—"}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {m.status === "sent" && m.sent_at ? (
                            <span className="text-green-700">{new Date(m.sent_at).toLocaleString()}</span>
                          ) : m.status === "failed" && m.error ? (
                            <span className="text-red-700 break-all">{String(m.error).slice(0, 100)}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {m.status === "failed" || m.status === "cancelled" ? (
                            <button
                              onClick={() => handleRetry(m.msg_id)}
                              className="text-xs text-blue-600 hover:underline"
                              data-testid={`wa-retry-${m.msg_id}`}
                            >Retry</button>
                          ) : m.status === "pending" ? (
                            <button
                              onClick={() => handleCancel(m.msg_id)}
                              className="text-xs text-red-600 hover:underline"
                              data-testid={`wa-cancel-${m.msg_id}`}
                            >Cancel</button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <WhatsAppTemplateForm
          credentials={credentials}
          template={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); fetchTemplates(); }}
        />
      )}
    </div>
  );
}

function WhatsAppTemplateForm({ credentials, template, onClose, onSaved }) {
  const isEdit = !!template;
  const [form, setForm] = useState(() => ({
    name: template?.name || "",
    wa_template_name: template?.wa_template_name || "",
    language_code: template?.language_code || "en",
    body_params: template?.body_params || [],
    header_param: template?.header_param || "",
    trigger_type: template?.trigger_type || "immediate",
    days_before: template?.days_before ?? 1,
    send_hour_utc: template?.send_hour_utc ?? 4,
    active: template?.active ?? true,
    category: template?.category || "main_online",
  }));
  const [saving, setSaving] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testing, setTesting] = useState(false);

  const addBodyParam = () => setForm({ ...form, body_params: [...form.body_params, "name"] });
  const updateBodyParam = (i, v) => {
    const arr = [...form.body_params];
    arr[i] = v;
    setForm({ ...form, body_params: arr });
  };
  const removeBodyParam = (i) => {
    const arr = form.body_params.filter((_, idx) => idx !== i);
    setForm({ ...form, body_params: arr });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.wa_template_name.trim()) {
      toast.error("Name and WhatsApp template name are required");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      header_param: form.header_param ? form.header_param : null,
      days_before: Number(form.days_before) || 0,
      send_hour_utc: Number(form.send_hour_utc) || 0,
    };
    try {
      if (isEdit) {
        await axios.patch(`${API}/dashboard/whatsapp/templates/${template.template_id}`, payload, {
          params: credentials,
        });
        toast.success("Template updated");
      } else {
        await axios.post(`${API}/dashboard/whatsapp/templates`, payload, {
          params: credentials,
        });
        toast.success("Template created");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!isEdit) {
      toast.error("Save the template first before testing");
      return;
    }
    if (!testPhone.trim()) {
      toast.error("Enter a test phone number");
      return;
    }
    setTesting(true);
    try {
      const { data } = await axios.post(
        `${API}/dashboard/whatsapp/test`,
        { template_id: template.template_id, phone: testPhone, name: "Test User", preferred_city: "Jammu" },
        { params: credentials }
      );
      if (data.result?.ok) {
        toast.success("Test message sent");
      } else {
        toast.error(`Send failed: ${data.result?.error || "Unknown"}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Test failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Modal onClose={onClose} title={isEdit ? "Edit Template" : "New WhatsApp Template"} large>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
          <select
            value={form.category}
            onChange={(e) => {
              const newCat = e.target.value;
              // main_* categories only use immediate trigger
              const newTrigger = newCat === "germany_fair" ? form.trigger_type : "immediate";
              setForm({ ...form, category: newCat, trigger_type: newTrigger });
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            data-testid="wa-form-category"
          >
            {CATEGORY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Chooses which lead flow fires this template.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Display Name *</label>
            <input
              type="text" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Reminder 3 Days Before"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              data-testid="wa-form-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              AiSensy Campaign Name *
            </label>
            <input
              type="text" value={form.wa_template_name}
              onChange={(e) => setForm({ ...form, wa_template_name: e.target.value })}
              placeholder="e.g. main_online_welcome"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
              data-testid="wa-form-wa-name"
            />
            <p className="text-xs text-slate-400 mt-1">Must exactly match a live campaign in your AiSensy dashboard</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Language Code</label>
            <input
              type="text" value={form.language_code}
              onChange={(e) => setForm({ ...form, language_code: e.target.value })}
              placeholder="en"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
              data-testid="wa-form-lang"
            />
          </div>
          <div className="flex items-center gap-3 mt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox" checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                data-testid="wa-form-active"
              />
              <span className="text-sm text-slate-700">Active (send on new leads)</span>
            </label>
          </div>
        </div>

        {form.category === "germany_fair" ? (
          <div className="border-t border-slate-200 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">When to send</label>
            <div className="grid md:grid-cols-3 gap-3">
              <select
                value={form.trigger_type}
                onChange={(e) => setForm({ ...form, trigger_type: e.target.value })}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                data-testid="wa-form-trigger"
              >
                <option value="immediate">Immediately on signup</option>
                <option value="days_before">X days before event</option>
                <option value="same_day">On the event day</option>
              </select>
              {form.trigger_type === "days_before" && (
                <input
                  type="number" min="0" max="30" value={form.days_before}
                  onChange={(e) => setForm({ ...form, days_before: e.target.value })}
                  placeholder="Days before"
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  data-testid="wa-form-days"
                />
              )}
              {form.trigger_type !== "immediate" && (
                <div className="flex items-center gap-2">
                  <input
                    type="number" min="0" max="23" value={form.send_hour_utc}
                    onChange={(e) => setForm({ ...form, send_hour_utc: e.target.value })}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-24"
                    data-testid="wa-form-hour"
                  />
                  <span className="text-xs text-slate-500">hour UTC (4 = 9:30 AM IST)</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <span className="font-medium">Trigger:</span> Sends immediately when the user submits the main landing page form.
            </p>
          </div>
        )}

        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              Body Parameters ({'{{1}}'}, {'{{2}}'}, …)
            </label>
            <button
              type="button" onClick={addBodyParam}
              className="text-xs text-green-600 hover:underline flex items-center gap-1"
              data-testid="wa-form-add-param"
            >
              <Plus size={12} /> Add parameter
            </button>
          </div>
          {form.body_params.length === 0 && (
            <p className="text-xs text-slate-400">No body parameters. Add one if your template has placeholders.</p>
          )}
          <div className="space-y-2">
            {form.body_params.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono w-10">{`{{${i + 1}}}`}</span>
                <select
                  value={PLACEHOLDER_OPTIONS.some(o => o.value === p) ? p : "__static"}
                  onChange={(e) => {
                    if (e.target.value === "__static") updateBodyParam(i, "static:");
                    else updateBodyParam(i, e.target.value);
                  }}
                  className="px-2 py-1.5 border border-slate-200 rounded text-sm"
                  data-testid={`wa-form-param-select-${i}`}
                >
                  {PLACEHOLDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  <option value="__static">static: custom text</option>
                </select>
                {(p.startsWith("static:") || (!PLACEHOLDER_OPTIONS.some(o => o.value === p))) && (
                  <input
                    type="text" value={p.replace(/^static:/, "")}
                    onChange={(e) => updateBodyParam(i, "static:" + e.target.value)}
                    placeholder="Custom static text"
                    className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-sm"
                    data-testid={`wa-form-param-input-${i}`}
                  />
                )}
                <button
                  type="button" onClick={() => removeBodyParam(i)}
                  className="p-1.5 text-slate-400 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Header Parameter (optional)
          </label>
          <select
            value={form.header_param && PLACEHOLDER_OPTIONS.some(o => o.value === form.header_param) ? form.header_param : (form.header_param?.startsWith("static:") ? "__static" : "")}
            onChange={(e) => {
              if (e.target.value === "") setForm({ ...form, header_param: "" });
              else if (e.target.value === "__static") setForm({ ...form, header_param: "static:" });
              else setForm({ ...form, header_param: e.target.value });
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            data-testid="wa-form-header"
          >
            <option value="">— None —</option>
            {PLACEHOLDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            <option value="__static">static: custom text</option>
          </select>
          {form.header_param?.startsWith("static:") && (
            <input
              type="text" value={form.header_param.replace(/^static:/, "")}
              onChange={(e) => setForm({ ...form, header_param: "static:" + e.target.value })}
              placeholder="Header custom text"
              className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          )}
        </div>

        {isEdit && (
          <div className="border-t border-slate-200 pt-4 bg-slate-50 -mx-6 px-6 -mb-1 pb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Send Test Message</label>
            <div className="flex gap-2">
              <input
                type="text" value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="e.g. 919876543210 (10 or 12 digits)"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                data-testid="wa-form-test-phone"
              />
              <button
                type="button" onClick={handleTest} disabled={testing}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                data-testid="wa-form-test-btn"
              >
                <Send size={14} /> {testing ? "Sending…" : "Send Test"}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Test uses sample values (name=Test User, city=Jammu). Requires a live AiSensy campaign with this exact name.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-3">
          <button
            type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium"
          >Cancel</button>
          <button
            type="submit" disabled={saving}
            className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="wa-form-submit"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {saving ? "Saving…" : isEdit ? "Update Template" : "Create Template"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ==================== LOGOS MANAGER ====================
const PAGE_DEFS = [
  { key: "main", label: "Main Landing Page", route: "/" },
  { key: "germany_fair", label: "Germany Fair Page", route: "/germany-fair" },
  { key: "university_change", label: "University Change Page", route: "/university-change" },
];
const DEFAULT_LOGO_URL = "/assets/visaxpert-logo.png";

function LogosManager({ credentials }) {
  const [logos, setLogos] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingFor, setUploadingFor] = useState(null);

  const fetchLogos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/page-logos`);
      setLogos(data || {});
    } catch {
      toast.error("Failed to load logos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogos(); }, [fetchLogos]);

  const handleUpload = async (pageKey, file) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Logo must be under 3MB");
      return;
    }
    setUploadingFor(pageKey);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axios.post(`${API}/dashboard/page-logos/upload`, formData, {
        params: { ...credentials, page: pageKey },
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`Logo uploaded for ${pageKey.replace("_", " ")}`);
      fetchLogos();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploadingFor(null);
    }
  };

  const handleReset = async (pageKey) => {
    if (!window.confirm(`Reset ${pageKey.replace("_", " ")} logo to default?`)) return;
    try {
      await axios.delete(`${API}/dashboard/page-logos/${pageKey}`, { params: credentials });
      toast.success("Reset to default logo");
      fetchLogos();
    } catch {
      toast.error("Reset failed");
    }
  };

  return (
    <div className="space-y-6" data-testid="logos-manager">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Page Logos</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload a custom logo for each landing page. Leave empty to use the default.
          Recommended size: 400×100 px (PNG/SVG with transparent background). Max 3MB.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">Loading…</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PAGE_DEFS.map((p) => {
            const currentUrl = logos[p.key] || DEFAULT_LOGO_URL;
            const isCustom = !!logos[p.key];
            const isUploading = uploadingFor === p.key;
            return (
              <div
                key={p.key}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col"
                data-testid={`logo-card-${p.key}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{p.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="font-mono">{p.route}</span>
                    </p>
                  </div>
                  {isCustom && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">
                      Custom
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 rounded-lg p-6 flex items-center justify-center min-h-[100px] mb-3 border border-slate-100">
                  <img
                    src={currentUrl}
                    alt={p.label}
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => { e.target.src = DEFAULT_LOGO_URL; }}
                  />
                </div>

                <div className="mt-auto space-y-2">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      onChange={(e) => handleUpload(p.key, e.target.files?.[0])}
                      disabled={isUploading}
                      className="hidden"
                      data-testid={`logo-file-${p.key}`}
                    />
                    <span className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg cursor-pointer text-sm font-medium ${isUploading ? "bg-slate-100 text-slate-400" : "bg-indigo-500 text-white hover:bg-indigo-600"}`}>
                      {isUploading ? (
                        <><RefreshCw size={14} className="animate-spin" /> Uploading…</>
                      ) : (
                        <><Upload size={14} /> {isCustom ? "Replace Logo" : "Upload Logo"}</>
                      )}
                    </span>
                  </label>
                  {isCustom && (
                    <button
                      onClick={() => handleReset(p.key)}
                      className="w-full px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-medium"
                      data-testid={`logo-reset-${p.key}`}
                    >
                      Reset to Default
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ==================== PARTNER LOGOS MANAGER ====================
function PartnerLogosManager({ credentials }) {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const fetchLogos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/dashboard/partner-logos`, { params: credentials });
      setLogos(data.logos || []);
    } catch {
      toast.error("Failed to load partner logos");
    } finally {
      setLoading(false);
    }
  }, [credentials]);

  useEffect(() => { fetchLogos(); }, [fetchLogos]);

  const handleToggle = async (logo_id) => {
    try {
      await axios.patch(`${API}/dashboard/partner-logos/${logo_id}/toggle`, null, { params: credentials });
      toast.success("Logo visibility updated");
      fetchLogos();
    } catch {
      toast.error("Failed to toggle logo");
    }
  };

  const handleDelete = async (logo_id) => {
    if (!window.confirm("Delete this logo?")) return;
    try {
      await axios.delete(`${API}/dashboard/partner-logos/${logo_id}`, { params: credentials });
      toast.success("Logo deleted");
      fetchLogos();
    } catch {
      toast.error("Failed to delete logo");
    }
  };

  const pageBadge = (page) => {
    if (page === "main") return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">Main</span>;
    if (page === "university_change") return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-100 text-teal-700">Uni Change</span>;
    if (page === "germany_fair") return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">Germany Fair</span>;
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">{page}</span>;
  };

  return (
    <div className="space-y-6" data-testid="partner-logos-manager">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Partner Logos</h2>
          <p className="text-sm text-slate-500 mt-1">
            Upload partner / university logos that appear in the sliding carousel on each page.
            Each logo can be assigned to one or more pages.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium"
          data-testid="add-partner-logo-btn"
        >
          <Plus size={16} /> Upload Logo
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">Loading…</div>
      ) : logos.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center">
          <ImageIcon size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-lg">No partner logos yet</p>
          <p className="text-slate-400 text-sm mt-1">Upload your first logo — it will appear in the sliding carousel on the selected pages.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {logos.map((logo) => (
            <div
              key={logo.logo_id}
              className={`bg-white rounded-xl border p-4 flex flex-col ${logo.is_active ? "border-slate-200" : "border-red-200 bg-red-50/30"}`}
              data-testid={`partner-logo-card-${logo.logo_id}`}
            >
              <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-center min-h-[100px] mb-3 border border-slate-100">
                <img
                  src={logo.logo_url.replace(/^\/assets\/uploads\//, "/api/uploads/")}
                  alt={logo.name}
                  className="max-h-20 max-w-full object-contain"
                />
              </div>
              <p className="font-medium text-slate-900 text-sm truncate" title={logo.name}>{logo.name}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {(logo.pages || []).map((p) => <span key={p}>{pageBadge(p)}</span>)}
              </div>
              {!logo.is_active && <p className="text-red-500 text-xs mt-2 font-medium">Hidden</p>}
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleToggle(logo.logo_id)}
                  className={`flex-1 p-2 rounded-lg transition-colors text-xs font-medium ${logo.is_active ? "text-green-700 bg-green-50 hover:bg-green-100" : "text-slate-500 bg-slate-100 hover:bg-slate-200"}`}
                  title={logo.is_active ? "Hide logo" : "Show logo"}
                  data-testid={`toggle-partner-logo-${logo.logo_id}`}
                >
                  {logo.is_active ? "Visible" : "Hidden"}
                </button>
                <button
                  onClick={() => handleDelete(logo.logo_id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  data-testid={`delete-partner-logo-${logo.logo_id}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddPartnerLogoModal
          onClose={() => setShowAdd(false)}
          credentials={credentials}
          onLogoAdded={() => { fetchLogos(); setShowAdd(false); }}
        />
      )}
    </div>
  );
}

function AddPartnerLogoModal({ onClose, credentials, onLogoAdded }) {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedPages, setSelectedPages] = useState(["main"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const PAGE_OPTIONS = [
    { value: "main", label: "Main Landing Page" },
    { value: "university_change", label: "University Change Page" },
    { value: "germany_fair", label: "Germany Fair Page" },
  ];

  const togglePage = (value) => {
    setSelectedPages((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) {
      toast.error("Logo must be under 3MB");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Please choose a logo image"); return; }
    if (!name.trim()) { toast.error("Please enter a name for this logo"); return; }
    if (selectedPages.length === 0) { toast.error("Select at least one page"); return; }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", name.trim());
      fd.append("pages", selectedPages.join(","));
      await axios.post(`${API}/dashboard/partner-logos`, fd, {
        params: credentials,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(
        selectedPages.length > 1
          ? `Logo added to ${selectedPages.length} pages!`
          : "Logo added successfully!"
      );
      onLogoAdded();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to upload logo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Upload Partner Logo" large>
      <form onSubmit={handleSubmit} className="space-y-5" data-testid="add-partner-logo-form">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Name / University *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Technical University of Munich"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
            data-testid="partner-logo-input-name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Logo Image *</label>
          <div className="flex items-center gap-4">
            <label
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors text-sm"
              data-testid="partner-logo-upload"
            >
              <Upload size={18} className="text-slate-500" />
              <span className="text-slate-600">{file ? file.name : "Choose Logo"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
                data-testid="partner-logo-input-file"
              />
            </label>
            {preview && (
              <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                <img src={preview} alt="Preview" className="h-12 max-w-[120px] object-contain" />
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">PNG / SVG with transparent background works best. Max 3MB.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Display On Pages <span className="text-slate-400 font-normal">(select one or more)</span>
          </label>
          <div className="grid sm:grid-cols-3 gap-2">
            {PAGE_OPTIONS.map((opt) => {
              const checked = selectedPages.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${checked ? "border-purple-400 bg-purple-50" : "border-slate-200 hover:bg-slate-50"}`}
                  data-testid={`partner-logo-page-option-${opt.value}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePage(opt.value)}
                    className="w-4 h-4 accent-purple-500"
                    data-testid={`partner-logo-page-checkbox-${opt.value}`}
                  />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium"
          >Cancel</button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="partner-logo-submit-btn"
          >
            {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
            {isSubmitting ? "Uploading…" : "Upload Logo"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

