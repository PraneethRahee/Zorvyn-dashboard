'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, Lightbulb, Wallet, Sparkles,
} from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
];

export default function Sidebar() {
  const { activeTab, setActiveTab, mobileSidebarOpen, setMobileSidebarOpen } = useFinanceStore();

  return (
    <>
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className={`fixed top-0 left-0 z-50 h-full flex flex-col lg:relative lg:z-auto ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="zenith-rail w-[72px] h-full flex flex-col items-center py-6 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 rounded-2xl flex items-center justify-center mb-10 relative cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <Wallet className="w-5 h-5 text-white" strokeWidth={2} />
            <div className="absolute -top-0.5 -right-0.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
          </motion.div>

          <nav className="flex-1 flex flex-col items-center gap-2 w-full px-3">
            {navItems.map((item, index) => {
              const isActive = activeTab === item.id;
              return (
                <div key={item.id} className="relative w-full">
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="zenith-nav-bar"
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-l-full"
                        style={{
                          background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                          boxShadow: '0 0 14px rgba(99,102,241,0.6)',
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="zenith-nav-bg"
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 100%)',
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.button
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.08, duration: 0.4 }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
                    className={`relative w-full flex items-center justify-center py-3 rounded-2xl transition-colors duration-200 group ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    <item.icon className="w-5 h-5 relative z-10" strokeWidth={isActive ? 2.2 : 1.8} />

                    <div className="absolute left-full ml-4 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-[100]">
                      {item.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-white" />
                    </div>
                  </motion.button>
                </div>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col items-center gap-2 px-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-indigo-500/20">
              A
            </div>
          </div>
        </div>


      </motion.aside>
    </>
  );
}
