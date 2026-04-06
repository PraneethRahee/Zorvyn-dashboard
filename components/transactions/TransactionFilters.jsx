'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, Filter } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';
import { CATEGORIES } from '@/data/categories';

export default function TransactionFilters() {
  const { filters, setFilters, resetFilters } = useFinanceStore();
  const hasActiveFilters = filters.search || filters.type !== 'all' || filters.category !== 'all' || filters.dateFrom || filters.dateTo;

  const inputCls = "w-full px-4 py-3 rounded-xl text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 bg-black/[0.02] dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all duration-200";
  const selectCls = "px-3.5 py-3 rounded-xl text-[13px] text-slate-600 dark:text-slate-300 bg-black/[0.02] dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 cursor-pointer transition-all duration-200";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className={`${inputCls} pl-11 pr-10`}
          />
          <AnimatePresence>
            {filters.search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setFilters({ ...filters, search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[13px] font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/15 border border-rose-200/50 dark:border-rose-500/15 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </motion.button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] mr-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filters</span>
        </div>
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className={selectCls}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className={selectCls}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} className={selectCls} />
        <span className="text-[12px] text-slate-300 dark:text-slate-600 hidden sm:block">→</span>
        <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} className={selectCls} />
      </div>
    </motion.div>
  );
}
