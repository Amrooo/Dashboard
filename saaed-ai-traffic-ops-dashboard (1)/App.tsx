import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend, AreaChart, Area, LabelList
} from 'recharts';
import { 
  Activity, Clock, Smartphone, Map as MapIcon,
  AlertTriangle, CheckCircle, TrendingUp, Users, Cpu,
  Sun, Moon, Pin, Star, X, Check, Plus, Layout, Trash2,
  Sliders, FileSpreadsheet, Zap, ArrowUpRight, ChevronUp, ChevronDown,
  BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon,
  Info, Navigation, Target, Crosshair, PhoneCall, Headphones, MessageSquare, Filter,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { utils, writeFile } from 'xlsx';
import { getKpis, getChannelMatrix, getTrendData, getStatusDistribution, getMockIncidents, getCallCenterKpis, getComplaintCategories } from './services/mockData';
import { KPIStats, ChannelMetric, CustomChartConfig, Incident, ReportStatus, CallCenterStats, ComplaintCategory, ChartDataPoint } from './types';

// --- Toast Component ---
const Toast: React.FC<{ message: string; type: 'success' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 20, x: '-50%' }}
      className={`fixed bottom-8 left-1/2 z-[500] px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 ${
        type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
      } bg-white dark:bg-slate-900`}
    >
      {type === 'success' ? <Check size={18} /> : <Star size={18} />}
      <span className="text-sm font-black uppercase tracking-widest">{message}</span>
      <button onClick={onClose} className="ms-2 hover:opacity-70"><X size={14} /></button>
    </motion.div>
  );
};

// --- Enhanced Heatmap Incident Map ---
const IncidentMap: React.FC<{ isDarkMode: boolean; lang: string; t: any }> = ({ isDarkMode, lang, t }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const hotspots = useMemo(() => [
    { x: 42, y: 35, size: 16, level: 3 }, 
    { x: 45, y: 38, size: 14, level: 3 },
    { x: 38, y: 32, size: 12, level: 2 },
    { x: 55, y: 45, size: 18, level: 3 },
    { x: 58, y: 48, size: 14, level: 2 },
    { x: 65, y: 25, size: 14, level: 2 },
    { x: 62, y: 28, size: 12, level: 2 },
    { x: 25, y: 55, size: 10, level: 1 },
    { x: 20, y: 60, size: 8, level: 1 },
    { x: 15, y: 80, size: 12, level: 2 },
    { x: 50, y: 55, size: 14, level: 3 },
    { x: 85, y: 10, size: 7, level: 1 },
  ], []);

  return (
    <section className={`glass-card p-10 rounded-[3.5rem] border shadow-2xl relative overflow-hidden transition-all duration-500 ${isDarkMode ? 'border-white/5 bg-black/40' : 'border-slate-300 bg-white'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 text-start relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-red-600/10 text-red-600">
            <MapIcon size={24} />
          </div>
          <div>
            <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              {t.heatmapTitle}
            </h3>
            <p className={`text-[11px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
              {lang === 'ar' ? 'تحليل كثافة الحوادث • الذكاء التحليلي' : 'Incident density heatmap • Analytical Intelligence'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6 bg-black/40 dark:bg-white/10 px-6 py-3 rounded-3xl border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#00ff00] shadow-[0_0_10px_#00ff00]" />
              <span className="text-[10px] font-black uppercase text-white">{lang === 'ar' ? 'منخفض جداً' : 'Very Low'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#f97316] shadow-[0_0_10px_#f97316]" />
              <span className="text-[10px] font-black uppercase text-white">{lang === 'ar' ? 'متوسط' : 'Medium'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#ff0000] shadow-[0_0_10px_#ff0000]" />
              <span className="text-[10px] font-black uppercase text-white">{lang === 'ar' ? 'كثيف' : 'Intensive'}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-950 shadow-sm'}`}
          >
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="map-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="relative aspect-[16/7] w-full rounded-[3rem] overflow-hidden group border border-white/10 shadow-inner bg-slate-900">
              <iframe
                title="Google Map Background"
                className={`absolute inset-0 w-full h-full border-none transition-opacity duration-1000 ${isDarkMode ? 'invert-[0.9] hue-rotate-180 brightness-[0.6]' : 'opacity-90 grayscale-[0.2] contrast-[1.1]'}`}
                src="https://maps.google.com/maps?q=Dubai%20Sheikh%20Zayed%20Road&t=k&z=13&ie=UTF8&iwloc=&output=embed"
                allowFullScreen
                loading="lazy"
              />
              
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <radialGradient id="phoenix-high" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ff0000" stopOpacity="1" />
                    <stop offset="30%" stopColor="#ff0000" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#ffff00" stopOpacity="0.7" />
                    <stop offset="75%" stopColor="#00ff00" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#00ff00" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="phoenix-med" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ff8800" stopOpacity="0.9" />
                    <stop offset="40%" stopColor="#ffff00" stopOpacity="0.6" />
                    <stop offset="80%" stopColor="#00ff00" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00ff00" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="phoenix-low" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#00ff00" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#00ff00" stopOpacity="0" />
                  </radialGradient>
                  <filter id="soft-glow">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
                  </filter>
                </defs>
                <g filter="url(#soft-glow)" opacity={isDarkMode ? 0.9 : 0.8}>
                  {hotspots.map((spot, idx) => (
                    <circle
                      key={idx}
                      cx={spot.x}
                      cy={spot.y}
                      r={spot.size}
                      fill={spot.level === 3 ? 'url(#phoenix-high)' : spot.level === 2 ? 'url(#phoenix-med)' : 'url(#phoenix-low)'}
                    />
                  ))}
                </g>
              </svg>
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/40" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const OpsCard: React.FC<{ id: string; title: string; icon: React.ReactNode; colorClass: string; metrics: any[]; isDarkMode: boolean; lang: string; isPinned?: boolean; onTogglePin: () => void }> = ({ title, icon, colorClass, metrics, isDarkMode, lang, isPinned, onTogglePin }) => (
  <div className="glass-card p-8 rounded-[3rem] border transition-all hover:translate-y-[-6px] text-start group relative shadow-2xl">
    <button onClick={onTogglePin} className={`absolute top-8 ${lang === 'ar' ? 'left-8' : 'right-8'} p-2.5 rounded-full ${isPinned ? 'text-yellow-500 bg-yellow-500/10' : 'text-slate-500 opacity-0 group-hover:opacity-100 hover:text-yellow-600 hover:bg-slate-100 dark:hover:bg-white/5'} transition-all`}><Pin size={20} className={isPinned ? "fill-yellow-500" : ""} /></button>
    <h4 className={`font-black uppercase text-[11px] tracking-widest flex items-center gap-4 mb-10 ${colorClass}`}><div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-300 shadow-sm'}`}>{icon}</div> {title}</h4>
    <div className="space-y-6">{metrics.map((m, idx) => (<div key={idx} className={`flex justify-between items-center text-sm border-b pb-2.5 ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}><span className={`font-black uppercase tracking-widest text-[10px] ${isDarkMode ? 'text-white opacity-60' : 'text-slate-950 opacity-90'}`}>{m.label}</span><span className={`font-black tabular-nums text-base ${m.color}`}>{m.value}</span></div>))}</div>
  </div>
);

const KpiCard: React.FC<{ id: string; title: string; value: string; icon: React.ReactNode; trend: string; subtitle: string; isDarkMode: boolean; lang: string; isPinned?: boolean; onTogglePin: () => void; onClick: () => void }> = ({ title, value, icon, trend, subtitle, isDarkMode, lang, isPinned, onTogglePin, onClick }) => {
  const hoverShadow = isDarkMode ? `shadow-[0_20px_40px_rgba(59,130,246,0.2)]` : `shadow-[0_20px_40px_rgba(30,41,59,0.1)]`;
  return (
    <div onClick={onClick} className={`glass-card p-10 rounded-[3.5rem] border transition-all duration-500 transform-gpu hover:scale-[1.03] text-start group relative cursor-pointer overflow-hidden ${hoverShadow}`}>
      <button onClick={(e) => { e.stopPropagation(); onTogglePin(); }} className={`absolute top-7 ${lang === 'ar' ? 'left-7' : 'right-7'} p-2.5 rounded-full ${isPinned ? 'text-yellow-600 bg-yellow-500/10' : 'text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-white/5'} transition-all`}><Pin size={20} className={isPinned ? "fill-yellow-600" : ""} /></button>
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className={`p-5 rounded-[1.8rem] border ${isDarkMode ? 'bg-white/5 border-white/5 text-blue-400' : 'bg-slate-50 border-slate-300 text-blue-800'}`}>{icon}</div>
        <span className={`text-[11px] font-black px-4 py-2 rounded-full shadow-sm ${trend.startsWith('+') ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400' : 'bg-red-500/15 text-red-800 dark:text-red-400'}`}>{trend}</span>
      </div>
      <div className="relative z-10">
        <p className={`text-[11px] font-black uppercase tracking-widest mb-2.5 ${isDarkMode ? 'text-white opacity-60' : 'text-slate-950 opacity-100'}`}>{title}</p>
        <h2 className={`text-4xl font-black tracking-tighter tabular-nums mb-4 leading-none ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{value}</h2>
        <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${isDarkMode ? 'text-white opacity-40' : 'text-slate-700 opacity-80'}`}>{subtitle}</p>
      </div>
    </div>
  );
};

const ChartBuilderModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (config: CustomChartConfig) => void; t: any; isDarkMode: boolean }> = ({ isOpen, onClose, onSave, t, isDarkMode }) => {
  const [config, setConfig] = useState<Partial<CustomChartConfig>>({
    title: '',
    metric: 'total',
    type: 'line',
    color: '#3b82f6',
    dateRange: 'Week',
    smooth: true,
    showGrid: true,
    showLegend: true,
    strokeWidth: 4,
    showXAxis: true,
    showYAxis: true,
    markerSize: 4
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className={`relative w-full max-w-2xl glass-card p-10 rounded-[3rem] border shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar ${isDarkMode ? 'border-white/10 bg-slate-900' : 'border-slate-300 bg-white'}`}>
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className={`text-2xl font-black tracking-tighter flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}><Layout className="text-blue-500" /> {t.builderTitle}</h3>
            <p className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-slate-50'}`}>{t.builderSub}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-3 block">{t.chartTitle}</label>
              <input type="text" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} placeholder="e.g. Peak Hour Volume" className={`w-full p-4 rounded-2xl border text-sm font-bold bg-transparent focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-950'}`} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-3 block">Metric Insight</label>
              <select value={config.metric} onChange={e => setConfig({...config, metric: e.target.value as any})} className={`w-full p-4 rounded-2xl border text-sm font-bold bg-transparent outline-none ${isDarkMode ? 'border-white/10 text-white bg-slate-900' : 'border-slate-200 text-slate-950'}`}>
                <option value="total">{t.metricTotal}</option>
                <option value="aiRate">{t.metricAI}</option>
                <option value="sla">{t.metricSLA}</option>
                <option value="calls">{t.totalCalls}</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-3 block">{t.chartType}</label>
              <div className="grid grid-cols-3 gap-2">
                {['line', 'bar', 'area'].map(type => (
                  <button key={type} onClick={() => setConfig({...config, type: type as any})} className={`p-4 rounded-2xl border text-[9px] font-black uppercase transition-all flex flex-col items-center gap-2 ${config.type === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-950'}`}>
                    {type === 'line' ? <LineChartIcon size={18} /> : type === 'bar' ? <BarChart3 size={18} /> : <AreaChartIcon size={18} />}
                    {(t as any)[`type${type.charAt(0).toUpperCase() + type.slice(1)}`]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="p-6 rounded-3xl border bg-black/10 border-white/5 space-y-4">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block">Visual Properties</label>
               {[
                 { key: 'smooth', label: "Smooth Lines" },
                 { key: 'showGrid', label: "Show Grid" },
                 { key: 'showLegend', label: "Show Legend" }
               ].map(opt => (
                 <div key={opt.key} className="flex justify-between items-center">
                   <span className="text-xs font-bold">{opt.label}</span>
                   <button onClick={() => setConfig({...config, [opt.key]: !(config as any)[opt.key]})} className={`w-10 h-6 rounded-full relative transition-colors ${config[opt.key as keyof typeof config] ? 'bg-blue-600' : 'bg-slate-600'}`}>
                     <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config[opt.key as keyof typeof config] ? 'right-1' : 'left-1'}`} />
                   </button>
                 </div>
               ))}
             </div>
             <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-3 block">Base Color</label>
                <div className="flex gap-3">
                  {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'].map(c => (
                    <button key={c} onClick={() => setConfig({...config, color: c})} className={`w-10 h-10 rounded-full border-4 transition-transform ${config.color === c ? 'scale-125 border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
             </div>
          </div>
        </div>

        <div className="mt-12 flex gap-4">
          <button onClick={onClose} className={`flex-1 py-5 rounded-2xl font-black uppercase text-xs tracking-widest border ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-300 text-slate-950'}`}>Discard</button>
          <button onClick={() => onSave({...config, id: Date.now().toString()} as CustomChartConfig)} className="flex-1 py-5 rounded-2xl font-black uppercase text-xs tracking-widest bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-all">{t.saveChart}</button>
        </div>
      </motion.div>
    </div>
  );
};

const translations = {
  en: {
    opsControl: "Saaed AI Dashboard",
    subHeader: "Saaed Traffic Systems • Intelligent Operations",
    heatmapTitle: "Incident Density Heatmap",
    today: "Today",
    week: "Week",
    month: "Month",
    year: "Year",
    totalReports: "Total Reports",
    aiHandled: "AI Automation Rate",
    avgClosure: "Average Resolution Time",
    slaCompliance: "SLA Compliance",
    aggChannels: "Across all reporting channels",
    autoClosure: "Fully autonomous resolution",
    efficiency: "Operational efficiency metric",
    targetSla: "KPI Target: 15 Minutes",
    volAnalysis: "Operational Intelligence Trends",
    liveStatus: "Real-time Incident Status",
    total: "Total Volume",
    aiHandledLegend: "AI Automation Rate (%)",
    totalReportsLegend: "Total Reports",
    touchpointAnalytics: "Channel Performance Analytics",
    channel: "Channel Name",
    marketShare: "Distribution",
    avgSubmit: "Submission Time",
    avgFinal: "Closure Time",
    dropOff: "Drop-off Rate",
    csat: "Satisfaction Score",
    aiUnit: "AI Agent Performance Summary",
    adoption: "Digital Transformation",
    escalation: "Human Intervention Rate",
    accuracy: "Intent Recognition Accuracy",
    automationMinor: "Autonomous Minor Accident Reports",
    aiSpeed: "Average AI Response Latency",
    handlingTime: "AI Handling Time",
    favorites: "Pinned KPIs & Favorites",
    noFavorites: "Pin indicators to personalize your dashboard",
    exportData: "Export Excel",
    exporting: "Exporting...",
    exportSuccess: "Excel data exported successfully",
    aiIntelligence: "AI Agent Intelligence",
    automationBreakdown: "Automation Performance by Intent",
    initializing: "Synchronizing AI Operations...",
    all: "All Statuses",
    filterStatus: "Filter Status",
    pinnedMsg: "Pinned to favorites",
    unpinnedMsg: "Removed from favorites",
    confirmUnpin: "Confirm Unpin?",
    ratio: "AI vs Ops Ratio",
    mobileUsers: "Active Mobile Users",
    growth: "MoM User Growth",
    retention: "Digital Retention",
    builderTitle: "Charts Builder",
    builderSub: "Configure unique insights",
    metricTotal: "Total Reports",
    metricAI: "AI Automation Rate",
    metricOps: "Opsroom Handling",
    metricPatrol: "Patrol Distribution",
    metricSLA: "SLA Compliance %",
    metricClosure: "Resolution Speed",
    metricDigital: "App Adoption",
    metricVoice: "Voice Channel",
    chartType: "Chart Type",
    saveChart: "Save & Deploy",
    typeLine: "Trend Line",
    typeBar: "Column Chart",
    typeArea: "Area Gradient",
    typePie: "Distribution Pie",
    intents: {
      'Report minor accident': 'Minor Accident',
      'Check status': 'Status Inquiry',
      'Modify report': 'Report Modification',
      'Payment query': 'Payment / Fines'
    },
    dashboardType: "Dashboard View",
    viewOps: "AI Traffic Ops",
    viewCallCenter: "Call Center & Complaints",
    totalCalls: "Total Calls",
    aiResolution: "AI Agent Resolution",
    avgHold: "Avg Hold Time",
    complaintsTotal: "Total Complaints",
    aiFixRate: "AI Fix Rate",
    complaintCategories: "Complaint Categories",
    aiFixLegend: "AI Fixed",
    humanFixLegend: "Human Fixed",
    overallCsat: "Call Center CSAT",
    firstCallResolution: "First Call Resolution (FCR)",
    loadingData: "Updating Dashboard Data..."
  },
  ar: {
    opsControl: "لوحة تحكم ساعد للذكاء الاصطناعي",
    subHeader: "ساعد لأنظمة المرور • العمليات الذكية",
    heatmapTitle: "خريطة حرارية بأعداد الحوادث",
    today: "اليوم",
    week: "الأسبوع",
    month: "الشهر",
    year: "السنة",
    totalReports: "إجمالي البلاغات",
    aiHandled: "معدل الأتمتة الذكية",
    avgClosure: "متوسط وقت إغلاق التقرير",
    slaCompliance: "نسبة الامتثال للأداء",
    aggChannels: "عبر كافة قنوات البلاغات",
    autoClosure: "المعالجة الذكية المستقلة",
    efficiency: "مؤشر كفاءة العمليات",
    targetSla: "المستهدف: 15 دقيقة",
    volAnalysis: "توجهات الذكاء التشغيلي",
    liveStatus: "حالة الحوادث المباشرة",
    total: "إجمالي الحجم",
    aiHandledLegend: "معدل الأتمتة (%)",
    totalReportsLegend: "إجمالي البلاغات",
    touchpointAnalytics: "تحليلات أداء قنوات الاتصال",
    channel: "قناة الإبلاغ",
    marketShare: "توزيع الحصة",
    avgSubmit: "وقت التقديم",
    avgFinal: "وقت الإغلاق",
    dropOff: "معدل الانسحاب",
    csat: "مستوى الرضا",
    aiUnit: "ملخص أداء وكيل الذكاء الاصطناعي",
    adoption: "مؤشرات التحول الرقمي",
    escalation: "معدل التدخل البشري",
    accuracy: "دقة فهم قصد المستخدم",
    automationMinor: "أتمتة الحوادث البسيطة",
    aiSpeed: "سرعة استجابة الذكاء الاصطناعي",
    handlingTime: "وقت معالجة الذكاء الاصطناعي",
    favorites: "المؤشرات المفضلة المثبتة",
    noFavorites: "قم بتثبيت المؤشرات لتخصيص لوحة التحكم الخاصة بك",
    exportData: "تصدير البيانات",
    exporting: "جاري التصدير...",
    exportSuccess: "تم تصدير ملف Excel بنجاح",
    aiIntelligence: "ذكاء وكيل الذكاء الاصطناعي",
    automationBreakdown: "أداء الأتمتة حسب الغرض",
    initializing: "جاري مزامنة بيانات العمليات...",
    all: "جميع الحالات",
    filterStatus: "تصفية الحالة",
    pinnedMsg: "تم التثبيت في المفضلة",
    unpinnedMsg: "تمت الإزالة من المفضلة",
    confirmUnpin: "تأكيد الإزالة؟",
    ratio: "نسبة الذكاء الاصطناعي إلى العمليات",
    mobileUsers: "مستخدمي المحمول النشطين",
    growth: "نمو المستخدمين شهرياً",
    retention: "معدل الاستبقاء الرقمي",
    builderTitle: "منشئ الرسوم البيانية",
    builderSub: "تكوين رؤى فريدة",
    metricTotal: "إجمالي البلاغات",
    metricAI: "معدل الأتمتة",
    metricOps: "معالجة العمليات",
    metricPatrol: "توزيع الدوريات",
    metricSLA: "الامتثال للأداء %",
    metricClosure: "سرعة الحل",
    metricDigital: "تبني التطبيق",
    metricVoice: "القناة الصوتية",
    chartType: "نوع الرسم البياني",
    saveChart: "حفظ ونشر",
    intents: {
      'Report minor accident': 'حادث بسيط',
      'Check status': 'استعلام حالة',
      'Modify report': 'تعديل بلاغ',
      'Payment query': 'دفع / غرامات'
    },
    dashboardType: "عرض لوحة التحكم",
    viewOps: "ذكاء العمليات المرورية",
    viewCallCenter: "مركز الاتصال والشكاوى",
    totalCalls: "إجمالي المكالمات",
    aiResolution: "حلول وكيل الذكاء الاصطناعي",
    avgHold: "متوسط وقت الانتظار",
    complaintsTotal: "إجمالي الشكاوى",
    aiFixRate: "معدل إصلاح AI",
    complaintCategories: "فئات الشكاوى",
    aiFixLegend: "تم حلها بواسطة AI",
    humanFixLegend: "تم حلها بواسطة بشري",
    overallCsat: "رضا عملاء مركز الاتصال",
    firstCallResolution: "حل الشكوى من أول مكالمة",
    loadingData: "جاري تحديث بيانات اللوحة..."
  }
};

const SaaedAiLogo: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
  <div className="relative flex items-center justify-center group cursor-pointer transition-all duration-500 rounded-3xl" dir="ltr">
    <div className={`relative z-10 flex flex-col items-center glassy-logo-container ${isDarkMode ? '' : 'shadow-sm'}`}>
       <img 
        src="data:image/png;base64,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Z2be692X20vG9992fP/W679m7P8A++9301XfS/fAnF4I+/9G3tfrHfy793V+K/v7P0Y9/0N940O7uD+7XF7l5l0PzYq30YfX8/A6/fDnzpS+U7/0E+vj3DNP3PrXw/h98Ofv3/8zN9//0E/W7vz/E9d9wXvydb+H857/d8Znv0H7mO0T7yD9GfOf3of/+71r+h18K+86fKz/+E/fF//N99fNfTfnwF0U6u63z+9/uL37v73+L+/3Pr/v+j/+NfT97B7/070/fU33z9TfV69+/lK/u329vPveq/fH/+q9X738mH//yN8Of/O7p7338O/L7f0L3/P2/5V96+V35W89P2H/hX77P9/z7/+Xv/8eOOn9eL73w9XzzhRfy//u1f86v3f+q3Xrh5fzpG3fsq6+9Jm/++vXhD965P6z7+pS/7v/4n0mXf7Vf9A87/D1/Bf3/+7f6i0u37V/5v/5W/9q79/b957Y5vT98P/nO23m5OdfXnt3T69duxOuvv65Xbr9ub9963e6f99id3v8mX7z9vL7+uT/L/N7X9H6+mX///Y8L/9f/X7D08h3vP7zR+9rN9Z6/N//9D7+0f089U/2/57v+R6E5/g0W4X99C7/7O9/x7f7+m/vX797f7//yv2L3f/766YfC7v7zX/6D++f/y1d+f/mG33m56vdf5uU6V5+6oXv8GfO/Uv/p7+X7/vM/X/7rP9f8/0IOf//63/vOofvXp7v59n8f8O7+4mR2/379w3v/+7+oU086vXf9pW7f/t0f99778H7u5C/97F87/29/Nf9vX/30/un29Zez9uXPfO/9r48/56/+W4fnf+y70uWfOf49/qV//p/K7/99/K73L/+3f+eX/uB+9v9e/S6L4y96/S7v46X8+I9+M91778P53u/799NfO/3Y6H8/tN/97T8L/e6vX87v/LdfY6fecfS7r9X7f/y37L/u9eO9S8P/85v2T3//4f6O0vY3f6/9X3729eSdf+Bivp1977N9fXmY8WCHV06W6eL0O+3tS93VvL1r07u8+M+70Lp6m8P/e2F8WNjH+VAn/K0z4XoV//H/fL9f/q4H9W9W/f9AcfyrVb8YxfGvWv9MxfGvWP8KxfEfrV86iv/X9S9vHf/7Vf8mxfFvX9+eOf7Nrf8/xfG7rL9AcfyfrK+vOP7m5998fWvi+HdrfUscf6X6lxXHXz/hG099P7zx0p/Gj/zE67p3f9df/vAn/v6F/vT9K6W70vN0V7f6874P59O2DOfW6enS+n78/6O6/tXm0f65uLg7990/9m98v3v6zG5f/T68/F90x90/57/9D++nv3b6Y6P//dD+t39nOf1Y6N97p87+V2f9T/7u4en79p7p3/reXvX//P27v/+O7/u3n9vK3f3N6S6v7X9Yj+eP799Ld/N6q7326/T+T/377/9jPv9P36uT+8fC6f477/Y3f6/9H/3990Xf+/Y5/fI3P6SjH3/pP/zM3v7+f/v9f2zN8IefvBq/8Y/v2fD57+9f/vAnvn9vP73vFfNf+fT02e+L8z09f27P09f39Pzx9vR9u6cf/16/T9/m9un8/un29OfFf/m5m8f/9M3h9f/7m/1//tH6/v38v3393vS+v/X+f/1+X7/vB7/pP7z29S+9f8f/639e/5f/79fO57/6P74V9599XNfP/P/U3/67P9j/0z9Y/73f0fn/vK/53X/+p+f9v9/V8Y+v/z09/t6v6v/P+/p8/v88n/3+r+v8P3/X8bV/+8vD2t/+fP7V7+r4v/x9vf8vfx70v38rX/p8n+H7/k76l/7t5f9/n++vfyv/36/R8Y9v1O//yN90+X/6dfv/9P/A+S98O3/+r+t8/79O1/8fD+v8P3/V8Y+v/X89rv/7fyP989v+y7/9N/XF/79v8f2v3f9+m65fO959p736m68Yf++D/+V7XpY33v6yff0/+U3+X0+m/T/7N3H/v78fP/L6m/6D+S7e/G/6v9v6v9yG/8Vv+P/A6zR4PbJvKj8NoTxy4T7IAn77vM7pOfmD3/Ym9/7oXj6qX325uNn7FteN9V3P7I/fPDvFmX6mU/6pX/8fB9+U8eN89v2eN8Hn/L6rXv6/Z/69P4L1+R3Hvx8fN+L3unvffY5O8vYI9vj7f+6Rre//I9976v+oX/2iQen+fVPDt39j/f5h07R/v0n6v6zL4Yv/62/oW/7tbe6l/7G27f+2F//Ue9pT2P7yCfrX95+SndN+Gve4fAnfsy6uGv09Wl6/+v+pXf73N507X3W60zH+uDffu7/w/3u9/m3f86e/G8/Tf6v/x5n//N3pC0X+M3PviL+0Y88Luef8U7/0A+/0fUfO6v23X/q/uCHX0f/2U/D+u/8iLvzN36e2f/l/2O6+7R3D7/0Xf/mE6fF9983Xvunp3P9D36Tf/pXPm37X/q2eO/fvi395p9e6v7O/9f7L3/LhP0/9rZ0+T/78X7Y0y757V/f9f3XzLvf8o79H/+7p8M5Wv7E9yF2D6Gf+yT7X/0547u/u9b/87+8p371K6p04W6671/9yO387H8m/fH/K61mG8Xw6Y9g+p7f8p97/6S/769/U6mF7vTvv9133v6u0f2f/3t3/C9+BvO/8D7yv38pTP7U91v5lZ9S+p9eG897" alt="Logo" className={`h-24 w-auto transition-transform hover:scale-105 ${!isDarkMode ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]' : 'drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]'}`} />
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeDashboard, setActiveDashboard] = useState<'ops' | 'callCenter'>('ops');
  const [kpis, setKpis] = useState<KPIStats | null>(null);
  const [ccStats, setCcStats] = useState<CallCenterStats | null>(null);
  const [complaints, setComplaints] = useState<ComplaintCategory[]>([]);
  const [channels, setChannels] = useState<ChannelMetric[]>([]);
  const [timeframe, setTimeframe] = useState<'Today' | 'Week' | 'Month' | 'Year'>('Week');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [isExporting, setIsExporting] = useState(false);
  const [mainChartMetric, setMainChartMetric] = useState<keyof Omit<ChartDataPoint, 'date'>>('total');
  const [isLoading, setIsLoading] = useState(true);
  
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saaed-pinned');
      return saved ? JSON.parse(saved) : ['aiHandled', 'slaCompliance'];
    } catch { return ['aiHandled', 'slaCompliance']; }
  });
  
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showGoToTop, setShowGoToTop] = useState(false);
  const t = (translations as any)[lang];

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setKpis(getKpis(timeframe));
      setCcStats(getCallCenterKpis(timeframe));
      setComplaints(getComplaintCategories());
      setChannels(getChannelMatrix(timeframe));
      setIsLoading(false);
    }, 800);
    
    document.body.className = isDarkMode ? '' : 'light-mode';
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    return () => clearTimeout(timer);
  }, [isDarkMode, lang, timeframe]);

  useEffect(() => {
    const handleScroll = () => {
      setShowGoToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const trendData = useMemo(() => getTrendData(timeframe), [timeframe]);
  const chartThemeColor = isDarkMode ? "#94a3b8" : "#020617";
  const chartGridColor = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.15)";

  const opsKpiData = useMemo(() => !kpis ? [] : [
    { id: 'totalReports', title: t.totalReports, value: kpis.totalReports.toLocaleString(), icon: <Activity size={28} />, trend: "+12.4%", subtitle: t.aggChannels },
    { id: 'aiHandled', title: t.aiHandled, value: `${kpis.aiHandledRate.toFixed(1)}%`, icon: <Cpu size={28} />, trend: "+5.2%", subtitle: t.autoClosure },
    { id: 'avgClosure', title: t.avgClosure, value: `${kpis.avgClosureTime.toFixed(1)}m`, icon: <Clock size={28} />, trend: "-1.8m", subtitle: t.efficiency },
    { id: 'slaCompliance', title: t.slaCompliance, value: `${kpis.slaCompliance.toFixed(1)}%`, icon: <CheckCircle size={28} />, trend: "+0.9%", subtitle: t.targetSla },
  ], [kpis, t]);

  const ccKpiData = useMemo(() => !ccStats ? [] : [
    { id: 'totalCalls', title: t.totalCalls, value: ccStats.totalCalls.toLocaleString(), icon: <PhoneCall size={28} />, trend: "+4.1%", subtitle: "Total call volume" },
    { id: 'aiResolution', title: t.aiResolution, value: `${ccStats.aiResolvedRate.toFixed(1)}%`, icon: <MessageSquare size={28} />, trend: "+8.2%", subtitle: "Resolved by AI agent" },
    { id: 'csatScore', title: t.overallCsat, value: `${ccStats.csatScore.toFixed(1)}/5`, icon: <Star size={28} />, trend: "+0.2", subtitle: "Customer satisfaction" },
    { id: 'holdTime', title: t.avgHold, value: `${ccStats.avgHoldTime}s`, icon: <Clock size={28} />, trend: "-12s", subtitle: "Average wait time" },
  ], [ccStats, t]);

  const togglePin = useCallback((id: string) => {
    setPinnedIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    setToast({ message: pinnedIds.includes(id) ? t.unpinnedMsg : t.pinnedMsg, type: 'info' });
  }, [pinnedIds, t]);

  const handleExport = useCallback(() => { 
    setIsExporting(true); 
    try {
      const overviewData = activeDashboard === 'ops' ? [
        { Metric: t.totalReports, Value: kpis?.totalReports },
        { Metric: t.aiHandled, Value: `${kpis?.aiHandledRate.toFixed(1)}%` },
        { Metric: t.avgClosure, Value: `${kpis?.avgClosureTime.toFixed(1)}m` },
        { Metric: t.slaCompliance, Value: `${kpis?.slaCompliance.toFixed(1)}%` }
      ] : [
        { Metric: t.totalCalls, Value: ccStats?.totalCalls },
        { Metric: t.aiResolution, Value: `${ccStats?.aiResolvedRate.toFixed(1)}%` },
        { Metric: t.overallCsat, Value: `${ccStats?.csatScore.toFixed(1)}/5` },
        { Metric: t.avgHold, Value: `${ccStats?.avgHoldTime}s` },
        { Metric: t.firstCallResolution, Value: `${ccStats?.firstCallResolution}%` }
      ];

      const exportTrendData = trendData.map(d => ({
        Date: d.date,
        Total_Reports: d.total,
        AI_Rate: d.aiRate,
        SLA_Compliance: d.sla,
        Calls: d.calls || 0,
        Resolutions: d.resolutions || 0
      }));

      const exportChannelData = channels.map(c => ({
        Channel: c.channel,
        Created: c.created,
        Percentage: `${c.percentage}%`,
        Avg_Submit_Time: `${c.avgSubmitTime}m`,
        Avg_Final_Time: `${c.avgFinalTime}m`,
        Drop_Off_Rate: `${c.dropOffRate}%`,
        CSAT: c.csat
      }));

      const wb = utils.book_new();
      const wsOverview = utils.json_to_sheet(overviewData);
      const wsTrends = utils.json_to_sheet(exportTrendData);
      const wsChannels = utils.json_to_sheet(exportChannelData);
      utils.book_append_sheet(wb, wsOverview, "Summary");
      utils.book_append_sheet(wb, wsTrends, "Historical Trends");
      utils.book_append_sheet(wb, wsChannels, "Channel Analytics");
      const filename = `Saaed_${activeDashboard === 'ops' ? 'Ops' : 'CallCenter'}_Dashboard_${new Date().toISOString().split('T')[0]}.xlsx`;
      writeFile(wb, filename);
      setToast({ message: t.exportSuccess, type: 'success' }); 
    } catch (error) {
      setToast({ message: "Export failed", type: 'info' });
    } finally {
      setIsExporting(false); 
    }
  }, [t, kpis, ccStats, trendData, channels, activeDashboard]);

  if (!kpis || !ccStats) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black">{t.initializing}</div>;

  return (
    <div className={`min-h-screen px-6 md:px-10 pt-4 md:pt-6 space-y-8 pb-32 transition-all duration-500 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-950'} ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <AnimatePresence mode="popLayout"> {toast && <Toast key="app-toast" message={toast.message} type={toast.type} onClose={() => setToast(null)} />} </AnimatePresence>
      <AnimatePresence>{isConfiguratorOpen && <ChartBuilderModal isDarkMode={isDarkMode} t={t} isOpen={isConfiguratorOpen} onClose={() => setIsConfiguratorOpen(false)} onSave={() => setIsConfiguratorOpen(false)} />}</AnimatePresence>
      
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed top-0 left-0 h-1 z-[1000] bg-blue-600 shadow-[0_0_10px_#2563eb]"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGoToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`fixed bottom-10 right-10 z-[400] p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all ${
              isDarkMode 
              ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 hover:bg-blue-600/30' 
              : 'bg-blue-600 border-blue-700 text-white hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            <ChevronUp size={24} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>

      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <SaaedAiLogo isDarkMode={isDarkMode} />
          <div className={`flex flex-col md:flex-row md:items-center gap-6 border-s ps-8 text-start ${isDarkMode ? 'border-white/10' : 'border-slate-300'}`}>
            <div>
              <h1 className={`text-xl md:text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                {activeDashboard === 'ops' ? t.opsControl : t.viewCallCenter}
              </h1>
              <p className={`text-[11px] font-bold uppercase tracking-[0.25em] ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>{t.subHeader}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => setIsConfiguratorOpen(true)} className={`p-3 glass-card rounded-xl border transition-all ${isDarkMode ? 'border-blue-500/40 bg-blue-500/10 text-blue-400' : 'border-slate-300 text-slate-950 shadow-sm'}`} title={t.builderTitle}>
            <Sliders size={20} />
          </button>
          <button onClick={handleExport} disabled={isExporting} className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-black uppercase text-[10px] tracking-widest transition-all ${isDarkMode ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400' : 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700'}`}>
            <FileSpreadsheet size={18} />
            <span className="hidden md:inline">{isExporting ? t.exporting : t.exportData}</span>
          </button>
          <div className="w-px h-8 bg-slate-300 dark:bg-white/10 mx-2" />
          <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className={`px-5 py-2.5 glass-card rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-300 text-slate-950 hover:bg-slate-200 shadow-sm'}`}>{lang === 'en' ? 'عربي' : 'English'}</button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 glass-card rounded-xl border transition-all ${isDarkMode ? 'border-white/20 text-white' : 'border-slate-300 text-slate-950 shadow-sm'}`}>{isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-800" />}</button>
        </div>
      </header>

      <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
        <div className={`flex p-1.5 glass-card rounded-2xl border shadow-inner ${isDarkMode ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-white shadow-slate-100'}`}>
          <button onClick={() => setActiveDashboard('ops')} className={`px-10 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeDashboard === 'ops' ? 'bg-blue-700 text-white shadow-lg' : 'opacity-60 hover:opacity-100'}`}>{t.viewOps}</button>
          <button onClick={() => setActiveDashboard('callCenter')} className={`px-10 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeDashboard === 'callCenter' ? 'bg-purple-700 text-white shadow-lg' : 'opacity-60 hover:opacity-100'}`}>{t.viewCallCenter}</button>
        </div>

        <div className={`md:absolute md:right-0 flex gap-1.5 p-1.5 glass-card rounded-full border ${isDarkMode ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-white'}`}>
          {['Today', 'Week', 'Month', 'Year'].map(v => (
            <button key={v} onClick={() => setTimeframe(v as any)} className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${timeframe === v ? 'bg-blue-700 text-white shadow-lg' : 'opacity-60 hover:opacity-100'}`}>
              {(t as any)[v.toLowerCase()]}
            </button>
          ))}
        </div>
      </div>

      <div className={`transition-all duration-700 ${isLoading ? 'opacity-50 blur-[2px] pointer-events-none' : 'opacity-100'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {(activeDashboard === 'ops' ? opsKpiData : ccKpiData).map(k => (
            <KpiCard key={k.id} {...k} isDarkMode={isDarkMode} lang={lang} isPinned={pinnedIds.includes(k.id)} onTogglePin={() => togglePin(k.id)} onClick={() => {}} />
          ))}
        </div>

        <section className={`glass-card p-10 rounded-[3.5rem] border shadow-xl text-start mt-8 ${isDarkMode ? 'border-white/5 bg-black/40' : 'border-slate-300 bg-white'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h3 className={`text-xl font-black tracking-tight flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                <TrendingUp className="text-blue-600" /> {t.volAnalysis}
              </h3>
              <p className={`text-[11px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>Historical performance timeline</p>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
               <Filter size={14} className="text-blue-500" />
               <select 
                value={mainChartMetric} 
                onChange={(e) => setMainChartMetric(e.target.value as any)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest border-none focus:ring-0 cursor-pointer"
               >
                 <option value="total" className="text-black">Reports Volume</option>
                 <option value="aiRate" className="text-black">AI Automation %</option>
                 <option value="sla" className="text-black">SLA Compliance</option>
                 <option value="calls" className="text-black">Call Center Volume</option>
                 <option value="resolutions" className="text-black">AI Fix Count</option>
               </select>
            </div>
          </div>
          <div className="h-[400px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="date" stroke={chartThemeColor} fontSize={10} fontWeight={900} tickLine={false} axisLine={false} dy={15} />
                <YAxis stroke={chartThemeColor} fontSize={10} fontWeight={900} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#0f0f0f' : '#ffffff', border: 'none', borderRadius: '20px' }} />
                <Area type="monotone" dataKey={mainChartMetric} stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorMetric)" dot={{r: 4, fill: '#3b82f6', strokeWidth: 0}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {activeDashboard === 'ops' ? (
            <motion.div key="ops-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10 mt-10">
              <IncidentMap isDarkMode={isDarkMode} lang={lang} t={t} />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-6">
                  <OpsCard id="aiUnitCard" title={t.aiUnit} icon={<Cpu size={24}/>} colorClass="text-purple-600" metrics={[{label: t.accuracy, value: '97.4%', color: 'text-emerald-400'}, {label: t.escalation, value: '12.4%', color: 'text-red-400'}]} isDarkMode={isDarkMode} lang={lang} onTogglePin={() => {}} />
                  <OpsCard id="adoptionCard" title={t.adoption} icon={<Smartphone size={24}/>} colorClass="text-blue-600" metrics={[{label: 'Mobile Growth', value: '+14.2%', color: 'text-blue-400'}]} isDarkMode={isDarkMode} lang={lang} onTogglePin={() => {}} />
                </div>
                <div className={`lg:col-span-8 glass-card p-10 rounded-[3.5rem] border shadow-xl ${isDarkMode ? 'border-white/5' : 'border-slate-300 bg-white'}`}>
                   <h4 className="text-xl font-black mb-10 flex items-center gap-3"><BarChart3 className="text-purple-500" /> {t.automationBreakdown}</h4>
                   <div className="h-[300px]" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={kpis.automationByIntent} layout="vertical">
                           <XAxis type="number" hide />
                           <YAxis type="category" dataKey="intent" stroke={chartThemeColor} fontSize={10} fontWeight={900} axisLine={false} tickLine={false} />
                           <Bar dataKey="rate" radius={[0, 10, 10, 0]} barSize={32}>
                              {kpis.automationByIntent.map((e, i) => (<Cell key={i} fill={e.rate > 90 ? '#10b981' : '#3b82f6'} />))}
                           </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="cc-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10 mt-10">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className={`lg:col-span-7 glass-card p-10 rounded-[3.5rem] border shadow-xl ${isDarkMode ? 'border-white/5 bg-black/40' : 'border-slate-300 bg-white'}`}>
                     <div className="flex justify-between items-center mb-10">
                       <h4 className="text-xl font-black flex items-center gap-3"><AlertTriangle className="text-red-500" /> {t.complaintCategories}</h4>
                       <div className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 font-black text-[10px] uppercase tracking-widest">Live Monitoring</div>
                     </div>
                     <div className="h-[350px]" dir="ltr">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getComplaintCategories()}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                             <XAxis dataKey="name" stroke={chartThemeColor} fontSize={10} fontWeight={900} axisLine={false} tickLine={false} />
                             <YAxis stroke={chartThemeColor} fontSize={10} fontWeight={900} axisLine={false} tickLine={false} />
                             <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                                {getComplaintCategories().map((e, i) => <Cell key={i} fill={e.color} />)}
                             </Bar>
                          </BarChart>
                       </ResponsiveContainer>
                     </div>
                  </div>
                  <div className={`lg:col-span-5 glass-card p-10 rounded-[3.5rem] border shadow-xl ${isDarkMode ? 'border-white/5 bg-black/40' : 'border-slate-300 bg-white'}`}>
                     <h4 className="text-xl font-black mb-10 flex items-center gap-3"><CheckCircle className="text-emerald-500" /> AI Agent Fix Efficiency</h4>
                     <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie 
                                data={[
                                  {name: t.aiFixLegend, value: ccStats.complaintsFixedByAi, color: '#10b981'},
                                  {name: t.humanFixLegend, value: ccStats.complaintsFixedByHuman, color: '#3b82f6'}
                                ]} 
                                innerRadius={70} 
                                outerRadius={100} 
                                paddingAngle={10} 
                                dataKey="value"
                              >
                                 <Cell fill="#10b981" />
                                 <Cell fill="#3b82f6" />
                              </Pie>
                              <Tooltip />
                           </PieChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="space-y-4 mt-6">
                        <div className="flex justify-between items-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                           <span className="text-[10px] font-black uppercase text-emerald-400">AI Fixed Complaints</span>
                           <span className="text-lg font-black text-emerald-400">{ccStats.complaintsFixedByAi}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                           <span className="text-[10px] font-black uppercase text-blue-400">Escalated to Human</span>
                           <span className="text-lg font-black text-blue-400">{ccStats.complaintsFixedByHuman}</span>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="glass-card p-10 rounded-[3rem] border border-white/5 text-start">
                     <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 w-fit mb-6"><Activity size={24} /></div>
                     <h5 className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-2">First Call Resolution</h5>
                     <p className="text-4xl font-black text-purple-400">{ccStats.firstCallResolution}%</p>
                  </div>
                  <div className="glass-card p-10 rounded-[3rem] border border-white/5 text-start">
                     <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 w-fit mb-6"><Headphones size={24} /></div>
                     <h5 className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-2">Service Quality Score</h5>
                     <p className="text-4xl font-black text-cyan-400">92.4/100</p>
                  </div>
                  <div className="glass-card p-10 rounded-[3rem] border border-white/5 text-start">
                     <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 w-fit mb-6"><Zap size={24} /></div>
                     <h5 className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-2">Peak Hour Handling</h5>
                     <p className="text-4xl font-black text-amber-400">1200 calls/hr</p>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`glass-card p-10 rounded-[3.5rem] overflow-hidden text-start shadow-xl relative z-10 mt-10 ${isDarkMode ? 'border-white/5' : 'border-slate-300 bg-white'}`}>
          <h3 className={`text-xl font-black tracking-tight flex items-center gap-4 mb-10 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}><Smartphone className="text-blue-700" /> {t.touchpointAnalytics}</h3>
          <div className="overflow-x-auto custom-scrollbar relative z-10">
            <table className="w-full border-collapse">
              <thead>
                <tr className={`text-[11px] font-black uppercase tracking-[0.25em] ${isDarkMode ? 'border-b border-white/10 text-white opacity-60' : 'border-b-2 border-slate-300 text-slate-700 bg-slate-100'}`}>
                  <th className="py-6 px-6 text-start">{t.channel}</th>
                  <th className="py-6 px-6 text-start">{t.totalReports}</th>
                  <th className="py-6 px-6 text-start">{t.avgSubmit}</th>
                  <th className="py-6 px-6 text-start">{t.avgFinal}</th>
                  <th className="py-6 px-6 text-start">{t.dropOff}</th>
                  <th className="py-6 px-6 text-center">{t.csat}</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((c, i) => (
                  <tr key={i} className={`transition-colors ${isDarkMode ? 'border-b border-white/5 hover:bg-white/5 text-white' : 'border-b border-slate-200 hover:bg-slate-50 text-slate-950'}`}>
                    <td className="py-6 px-6 font-black text-base">{c.channel}</td>
                    <td className="py-6 px-6 font-black text-base">{c.created.toLocaleString()}</td>
                    <td className="py-6 px-6 font-black">{c.avgSubmitTime}m</td>
                    <td className="py-6 px-6 font-black">{c.avgFinalTime}m</td>
                    <td className="py-6 px-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${c.dropOffRate > 5 ? 'bg-red-500/10 border-red-500/20 text-red-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'}`}>{c.dropOffRate}%</span>
                    </td>
                    <td className="py-6 px-6 text-center">
                      <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-800 dark:text-blue-300 px-5 py-2 rounded-xl font-black text-xs border border-blue-600/20 shadow-sm"><Star size={12} className="fill-current" /> {c.csat.toFixed(1)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center z-[50]"
          >
            <div className="bg-black/60 backdrop-blur-sm p-8 rounded-3xl border border-white/10 flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{t.loadingData}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;