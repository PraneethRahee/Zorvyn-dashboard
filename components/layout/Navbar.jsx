'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Menu, Shield, Eye, Download, ChevronDown, Search, LayoutGrid, Pencil, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import useFinanceStore from '@/store/useFinanceStore';
import { exportToCSV, exportToJSON } from '@/utils/helpers';

export default function Navbar() {
  const { role, setRole, darkMode, toggleDarkMode, setMobileSidebarOpen, transactions, activeTab, customizerOpen, setCustomizerOpen, editMode, toggleEditMode } = useFinanceStore();
  const [exportOpen, setExportOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const exportRef = useRef(null);
  const roleRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target)) setRoleOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const tabLabels = {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    insights: 'Insights',
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="sticky top-0 z-30"
    >
      <div className="zenith-glass">
        <div className="flex items-center justify-between px-5 md:px-8 h-[64px]">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Menu className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </motion.button>

            <div>
              <h2 className="text-[18px] font-bold tracking-tight text-slate-900 dark:text-white">
                {tabLabels[activeTab]}
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 tracking-wide">
                {activeTab === 'dashboard' && 'Financial overview'}
                {activeTab === 'transactions' && 'Manage your activity'}
                {activeTab === 'insights' && 'Analytics & patterns'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden sm:block p-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-slate-400 dark:text-slate-500 transition-all duration-200"
            >
              <Search className="w-[16px] h-[16px]" strokeWidth={2} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={toggleEditMode}
              className={`relative hidden md:flex p-2.5 rounded-xl transition-all duration-200 ${
                editMode
                  ? 'bg-indigo-500 text-white shadow-[0_2px_10px_rgba(99,102,241,0.35)]'
                  : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-slate-400 dark:text-slate-500'
              }`
            }
            >
              {editMode
                ? <Check className="w-[16px] h-[16px]" strokeWidth={2.5} />
                : <Pencil className="w-[16px] h-[16px]" strokeWidth={2} />
              }
              {editMode && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400"
                  style={{ boxShadow: '0 0 6px rgba(52,211,153,0.5)' }}
                />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setCustomizerOpen(true)}
              className={`hidden md:flex p-2.5 rounded-xl transition-all duration-200 ${
                customizerOpen
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-500 dark:text-indigo-400'
                  : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-slate-400 dark:text-slate-500'
              }`
            }
            >
              <LayoutGrid className="w-[16px] h-[16px]" strokeWidth={2} />
            </motion.button>

            <div className="relative hidden sm:block" ref={exportRef}>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setExportOpen(!exportOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all duration-200"
              >
                <Download className="w-[14px] h-[14px]" strokeWidth={2} />
                <span className="hidden sm:inline">Export</span>
              </motion.button>
              <AnimatePresence>
                {exportOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-48 rounded-2xl py-2 z-50 zenith-glass shadow-xl"
                  >
                    <button
                      onClick={() => { exportToCSV(transactions); setExportOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-[13px] text-slate-600 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-xl mx-auto transition-colors"
                      style={{ width: 'calc(100% - 8px)', marginLeft: '4px' }}
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => { exportToJSON(transactions); setExportOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-[13px] text-slate-600 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-xl transition-colors"
                      style={{ width: 'calc(100% - 8px)', marginLeft: '4px' }}
                    >
                      Export as JSON
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.08, rotate: 15 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-slate-400 dark:text-slate-500 transition-all duration-200"
            >
              <motion.div initial={false} animate={{ rotate: darkMode ? 180 : 0 }} transition={{ duration: 0.5, type: 'spring' }}>
                {darkMode ? <Sun className="w-[16px] h-[16px] text-amber-400" /> : <Moon className="w-[16px] h-[16px]" />}
              </motion.div>
            </motion.button>

            <div className="w-px h-5 bg-slate-200/60 dark:bg-white/[0.06] mx-1 hidden sm:block" />

            <div className="relative hidden md:block" ref={roleRef}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setRoleOpen(!roleOpen)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                  role === 'admin'
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-[0_1px_4px_rgba(99,102,241,0.12)]'
                    : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400'
                }`}
              >
                {role === 'admin' ? <Shield className="w-[13px] h-[13px]" /> : <Eye className="w-[13px] h-[13px]" />}
                <span className="hidden md:inline capitalize">{role}</span>
                <motion.div animate={{ rotate: roleOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3 h-3" />
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {roleOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl py-2 z-50 zenith-glass shadow-xl"
                  >
                    {['admin', 'viewer'].map((r) => (
                      <button
                        key={r}
                        onClick={() => { setRole(r); setRoleOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] rounded-xl transition-colors mx-auto ${
                          role === r
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                        }`}
                        style={{ width: 'calc(100% - 8px)', marginLeft: '4px' }}
                      >
                        {r === 'admin' ? <Shield className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <div className="text-left">
                          <p className="font-semibold capitalize">{r}</p>
                          <p className="text-[11px] opacity-50">{r === 'admin' ? 'Full access' : 'Read only'}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-5 md:px-8 pb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      useFinanceStore.getState().setFilters({ ...useFinanceStore.getState().filters, search: e.target.value });
                    }}
                    placeholder="Search transactions..."
                    autoFocus
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-[13px] bg-black/[0.03] dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
