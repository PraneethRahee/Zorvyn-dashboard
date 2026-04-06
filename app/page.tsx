'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useFinanceStore from '@/store/useFinanceStore';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionModal from '@/components/transactions/TransactionModal';
import MonthlyComparison from '@/components/insigths/MonthlyComparison';
import SmartInsights from '@/components/insigths/SmartInsights';
import DashboardCustomizer from '@/components/dashboard/DashboardCustomizer';
import MonthDetailModal from '@/components/dashboard/MonthDetailModal';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function Home() {
  const { activeTab, darkMode, fetchAndSeed, loading, editMode } = useFinanceStore();

  useEffect(() => { fetchAndSeed(); }, [fetchAndSeed]);
  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);

  return (
    <div className="flex h-screen overflow-hidden relative">
      <div className="zenith-bg" />

      <div className="relative z-10 flex h-full w-full">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar />

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 py-4 sm:py-8">
              {loading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[200] flex items-center justify-center bg-white/60 dark:bg-[#050a18]/70 backdrop-blur-xl"
                >
                  <div className="flex flex-col items-center gap-5">
                    <div className="relative">
                      <motion.div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                        }}
                        animate={{
                          scale: [1, 1.05, 1],
                          rotate: [0, 2, -2, 0],
                        }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                      </motion.div>
                      <motion.div
                        className="absolute w-2 h-2 rounded-full bg-indigo-400"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        style={{ top: '-4px', left: '50%', transformOrigin: '0 36px' }}
                      />
                      <motion.div
                        className="absolute w-1.5 h-1.5 rounded-full bg-pink-400"
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        style={{ top: '-4px', left: '50%', transformOrigin: '0 36px' }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white tracking-wide">Loading your finances</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Connecting to your data...</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {editMode && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-6 overflow-hidden"
                  >
                    <div
                      className="flex items-center justify-between px-5 py-3 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))',
                        border: '1px solid rgba(99,102,241,0.15)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg"
                          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400">Edit Mode Active</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">Drag widgets to reorder • Use the sidebar to add or remove</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-indigo-500 dark:text-indigo-400"
                          style={{ background: 'rgba(99,102,241,0.08)' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                          Click ✕ to remove widgets
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                  <motion.div key="dashboard" variants={pageTransition} initial="initial" animate="animate" exit="exit">
                    <DashboardGrid />
                  </motion.div>
                )}

                {activeTab === 'transactions' && (
                  <motion.div key="transactions" variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }} />
                        <h1 className="text-[26px] md:text-[30px] font-black tracking-tight">
                          <span className="zenith-gradient-text">Transactions</span>
                        </h1>
                      </div>
                      <p className="text-[13px] text-slate-400 dark:text-slate-500 ml-4 pl-0.5">
                        View and manage all your financial transactions.
                      </p>
                    </motion.div>

                    <TransactionFilters />
                    <TransactionList />
                  </motion.div>
                )}

                {activeTab === 'insights' && (
                  <motion.div key="insights" variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #ec4899, #f59e0b)' }} />
                        <h1 className="text-[26px] md:text-[30px] font-black tracking-tight">
                          <span className="zenith-gradient-text">Insights</span>
                        </h1>
                      </div>
                      <p className="text-[13px] text-slate-400 dark:text-slate-500 ml-4 pl-0.5">
                        Understand your spending patterns and financial health.
                      </p>
                    </motion.div>

                    <MonthlyComparison />
                    <SmartInsights />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      <TransactionModal />
      <DashboardCustomizer />
      <MonthDetailModal />
    </div>
  );
}
