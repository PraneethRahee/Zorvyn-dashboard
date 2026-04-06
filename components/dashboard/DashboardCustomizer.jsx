'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, LayoutDashboard, BarChart3, TrendingUp, Activity, PieChart, Heart, RotateCcw } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';

const WIDGET_CONFIG = [
  {
    key: 'heroBalance',
    name: 'Balance Overview',
    description: 'Your total balance, income and expenses at a glance',
    icon: LayoutDashboard,
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    key: 'quickStats',
    name: 'Quick Stats',
    description: 'Daily average, transaction count, and more',
    icon: BarChart3,
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    key: 'cashFlow',
    name: 'Cash Flow',
    description: 'Monthly income vs expenses trend chart',
    icon: TrendingUp,
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    key: 'recentActivity',
    name: 'Recent Activity',
    description: 'Your latest financial transactions',
    icon: Activity,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    key: 'categoryRings',
    name: 'Category Breakdown',
    description: 'Spending breakdown by category',
    icon: PieChart,
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    key: 'healthScore',
    name: 'Financial Health',
    description: 'Your financial health score and metrics',
    icon: Heart,
    gradient: 'from-red-500 to-rose-500',
  },
];

const DEFAULT_WIDGETS = {
  heroBalance: true,
  quickStats: true,
  cashFlow: true,
  recentActivity: true,
  categoryRings: true,
  healthScore: true,
};

export default function DashboardCustomizer() {
  const { customizerOpen, setCustomizerOpen, widgets, toggleWidget } = useFinanceStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWidgets = useMemo(() => {
    if (!searchQuery.trim()) return WIDGET_CONFIG;
    const q = searchQuery.toLowerCase();
    return WIDGET_CONFIG.filter(
      (w) => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeCount = Object.values(widgets).filter(Boolean).length;

  const handleReset = () => {
    const store = useFinanceStore.getState();
    store.widgets = { ...DEFAULT_WIDGETS };
    useFinanceStore.setState({ widgets: { ...DEFAULT_WIDGETS } });
  };

  return (
    <AnimatePresence>
      {customizerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setCustomizerOpen(false)}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-[420px] flex flex-col"
          >
            <div className="flex-1 flex flex-col bg-white/80 dark:bg-[#0c1229]/90 backdrop-blur-2xl border-l border-slate-200/50 dark:border-white/[0.06] shadow-2xl">
              <div className="flex items-start justify-between p-6 pb-4">
                <div>
                  <h2 className="text-[18px] font-bold tracking-tight text-slate-900 dark:text-white">
                    Customize Dashboard
                  </h2>
                  <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">
                    Toggle widgets to personalize your view
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setCustomizerOpen(false)}
                  className="p-2 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-slate-400 dark:text-slate-500 transition-colors"
                >
                  <X className="w-[18px] h-[18px]" strokeWidth={2} />
                </motion.button>
              </div>

              <div className="px-6 pb-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search widgets..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] bg-black/[0.03] dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-4">
                <div className="space-y-2.5">
                  <AnimatePresence mode="popLayout">
                    {filteredWidgets.map((widget, index) => {
                      const isActive = widgets[widget.key];
                      const Icon = widget.icon;
                      return (
                        <motion.div
                          key={widget.key}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.05,
                            layout: { duration: 0.25 },
                          }}
                          onClick={() => toggleWidget(widget.key)}
                          className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                            isActive
                              ? 'bg-indigo-50/70 dark:bg-indigo-500/[0.07] border border-indigo-200/40 dark:border-indigo-400/15'
                              : 'bg-black/[0.02] dark:bg-white/[0.02] border border-transparent hover:border-slate-200/40 dark:hover:border-white/[0.06]'
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              isActive
                                ? `bg-gradient-to-br ${widget.gradient} shadow-lg`
                                : 'bg-slate-100 dark:bg-white/[0.05]'
                            }`}
                          >
                            <Icon
                              className={`w-[18px] h-[18px] transition-colors duration-300 ${
                                isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                              }`}
                              strokeWidth={2}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-[13px] font-semibold transition-colors duration-200 ${
                                isActive
                                  ? 'text-slate-900 dark:text-white'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {widget.name}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                              {widget.description}
                            </p>
                          </div>

                          <div className="flex-shrink-0">
                            <motion.div
                              whileTap={{ scale: 0.88 }}
                              className={`relative w-[44px] h-[24px] rounded-full transition-colors duration-300 ${
                                isActive
                                  ? ''
                                  : 'bg-slate-200 dark:bg-white/[0.08]'
                              }`}
                              style={
                                isActive
                                  ? {
                                      background: `linear-gradient(135deg, var(--zen-gradient-1), var(--zen-gradient-2))`,
                                    }
                                  : undefined
                              }
                            >
                              <motion.div
                                layout
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className={`absolute top-[2px] w-[20px] h-[20px] rounded-full shadow-sm transition-colors duration-300 ${
                                  isActive
                                    ? 'left-[22px] bg-white'
                                    : 'left-[2px] bg-white dark:bg-slate-300'
                                }`}
                              />
                            </motion.div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {filteredWidgets.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <p className="text-[13px] text-slate-400 dark:text-slate-500">
                        No widgets found matching "{searchQuery}"
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-3 border-t border-slate-200/40 dark:border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                  >
                    <RotateCcw className="w-[13px] h-[13px]" strokeWidth={2} />
                    Reset to Default
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-slate-400 dark:text-slate-500">Active</span>
                    <span
                      className="inline-flex items-center justify-center min-w-[24px] h-[22px] px-1.5 rounded-full text-[11px] font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, var(--zen-gradient-1), var(--zen-gradient-2))',
                      }}
                    >
                      {activeCount}
                    </span>
                    <span className="text-[12px] text-slate-400 dark:text-slate-500">
                      / {WIDGET_CONFIG.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
