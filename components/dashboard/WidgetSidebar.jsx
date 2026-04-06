'use client';

import { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Activity,
  PieChart,
  Heart,
  Search,
  RotateCcw,
  X,
  GripVertical,
} from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';

const WIDGET_CONFIG = [
  {
    key: 'heroBalance',
    name: 'Balance Overview',
    description: 'Total balance, income and expenses at a glance',
    icon: LayoutDashboard,
    gradient: 'from-indigo-500 to-violet-500',
    gradientBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  },
  {
    key: 'quickStats',
    name: 'Quick Stats',
    description: 'Daily average, transaction count, and more',
    icon: BarChart3,
    gradient: 'from-emerald-500 to-teal-500',
    gradientBg: 'linear-gradient(135deg, #10b981, #14b8a6)',
  },
  {
    key: 'cashFlow',
    name: 'Cash Flow',
    description: 'Monthly income vs expenses trend chart',
    icon: TrendingUp,
    gradient: 'from-rose-500 to-pink-500',
    gradientBg: 'linear-gradient(135deg, #f43f5e, #ec4899)',
  },
  {
    key: 'savingsRate',
    name: 'Savings Rate',
    description: 'Savings efficiency gauge with monthly breakdown',
    icon: TrendingUp,
    gradient: 'from-violet-500 to-indigo-500',
    gradientBg: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
  },
  {
    key: 'balanceTrend',
    name: 'Balance Trend',
    description: 'Running balance over time line chart',
    icon: Activity,
    gradient: 'from-purple-500 to-violet-500',
    gradientBg: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
  },
  {
    key: 'recentActivity',
    name: 'Recent Activity',
    description: 'Your latest financial transactions',
    icon: Activity,
    gradient: 'from-amber-500 to-orange-500',
    gradientBg: 'linear-gradient(135deg, #f59e0b, #f97316)',
  },
  {
    key: 'categoryRings',
    name: 'Category Breakdown',
    description: 'Spending breakdown by category',
    icon: PieChart,
    gradient: 'from-cyan-500 to-blue-500',
    gradientBg: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
  },
  {
    key: 'healthScore',
    name: 'Financial Health',
    description: 'Health score and financial metrics',
    icon: Heart,
    gradient: 'from-red-500 to-rose-500',
    gradientBg: 'linear-gradient(135deg, #ef4444, #f43f5e)',
  },
];

function DraggableSidebarItem({ widget, isActive }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: widget.key,
    disabled: isActive,
  });
  const Icon = widget.icon;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...(isActive ? {} : listeners)}
      className={`
        group flex items-center gap-3 p-3 rounded-xl transition-all duration-200
        ${isActive
          ? 'bg-indigo-50/80 dark:bg-indigo-500/[0.08] border border-indigo-200/30 dark:border-indigo-400/15'
          : 'bg-black/[0.02] dark:bg-white/[0.02] border border-transparent hover:border-slate-200/40 dark:hover:border-white/[0.06] cursor-grab active:cursor-grabbing hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
        }
        ${isDragging ? 'opacity-50 scale-95 ring-2 ring-indigo-500/30' : ''}
      `}
      style={isDragging ? { boxShadow: '0 8px 24px rgba(99,102,241,0.15)' } : undefined}
    >
      <div className="flex-shrink-0">
        {isActive ? (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: widget.gradientBg }}>
            <Icon className="w-[16px] h-[16px] text-white" strokeWidth={2} />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-white/[0.06]">
            <GripVertical className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-[12px] font-semibold truncate ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>
          {widget.name}
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
          {isActive ? '✓ On dashboard' : 'Drag to add'}
        </p>
      </div>

      {isActive && (
        <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function WidgetSidebar() {
  const { widgetLayout, removeWidget, resetLayout, toggleEditMode } = useFinanceStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWidgets = useMemo(() => {
    if (!searchQuery.trim()) return WIDGET_CONFIG;
    const q = searchQuery.toLowerCase();
    return WIDGET_CONFIG.filter(
      (w) => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeCount = widgetLayout.length;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="hidden lg:flex fixed right-4 top-[76px] bottom-4 w-[280px] xl:w-[300px] z-40 flex-col rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(226,232,240,0.5)',
        boxShadow: '0 16px 48px -8px rgba(0,0,0,0.12), 0 0 0 1px rgba(99,102,241,0.05)',
        backdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      <style>{`
        .ws-dark {
          background: rgba(10,15,30,0.88) !important;
          border-color: rgba(51,65,85,0.3) !important;
        }
      `}</style>
      <DarkAwareSidebarInner
        filteredWidgets={filteredWidgets}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCount={activeCount}
        removeWidget={removeWidget}
        resetLayout={resetLayout}
        toggleEditMode={toggleEditMode}
        widgetLayout={widgetLayout}
      />
    </motion.div>
  );
}

function DarkAwareSidebarInner({
  filteredWidgets, searchQuery, setSearchQuery,
  activeCount, removeWidget, resetLayout, toggleEditMode, widgetLayout,
}) {
  const { darkMode } = useFinanceStore();

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background: darkMode ? 'rgba(10,15,30,0.92)' : 'rgba(255,255,255,0.9)',
        border: `1px solid ${darkMode ? 'rgba(51,65,85,0.3)' : 'rgba(226,232,240,0.5)'}`,
        backdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className={`text-[14px] font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Widgets
            </h3>
            <p className={`text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Drag to add • {activeCount} active
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleEditMode}
            className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/[0.06] text-slate-400' : 'hover:bg-black/[0.04] text-slate-400'}`}
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </motion.button>
        </div>

        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search widgets..."
            className={`w-full pl-9 pr-3 py-2 rounded-lg text-[12px] border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
              darkMode
                ? 'bg-white/[0.04] border-white/[0.06] text-white placeholder:text-slate-500'
                : 'bg-black/[0.02] border-slate-200/50 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
      </div>

      <div className={`mx-4 h-px ${darkMode ? 'bg-white/[0.06]' : 'bg-slate-200/50'}`} />

      {widgetLayout.length > 0 && (
        <div className="p-4 pb-2">
          <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            On Dashboard ({widgetLayout.length})
          </p>
          <div className="space-y-1.5">
            {widgetLayout.map((key) => {
              const config = WIDGET_CONFIG.find(w => w.key === key);
              if (!config) return null;
              return (
                <div
                  key={key}
                  className={`flex items-center gap-2.5 p-2 rounded-lg group cursor-default transition-colors ${
                    darkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.03]'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: config.gradientBg }}>
                    <config.icon className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                  </div>
                  <span className={`flex-1 text-[12px] font-medium truncate ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    {config.name}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => removeWidget(key)}
                    className={`opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                      darkMode ? 'hover:bg-rose-500/20 text-slate-500 hover:text-rose-400' : 'hover:bg-rose-50 text-slate-400 hover:text-rose-500'
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {widgetLayout.length > 0 && (
        <div className={`mx-4 h-px ${darkMode ? 'bg-white/[0.06]' : 'bg-slate-200/50'}`} />
      )}

      <div className="flex-1 overflow-y-auto p-4 pt-3">
        <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Available
        </p>
        <div className="space-y-1.5">
          {filteredWidgets.map((widget) => (
            <DraggableSidebarItem
              key={widget.key}
              widget={widget}
              isActive={widgetLayout.includes(widget.key)}
            />
          ))}
          {filteredWidgets.length === 0 && (
            <p className={`text-center py-6 text-[12px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              No widgets found
            </p>
          )}
        </div>
      </div>

      <div className={`p-4 pt-2 border-t ${darkMode ? 'border-white/[0.06]' : 'border-slate-200/40'}`}>
        <button
          onClick={resetLayout}
          className={`flex items-center gap-1.5 text-[11px] font-medium w-full justify-center py-2 rounded-lg transition-colors ${
            darkMode ? 'text-slate-400 hover:text-indigo-400 hover:bg-white/[0.04]' : 'text-slate-400 hover:text-indigo-500 hover:bg-black/[0.03]'
          }`}
        >
          <RotateCcw className="w-3 h-3" strokeWidth={2} />
          Reset Layout
        </button>
      </div>
    </div>
  );
}
