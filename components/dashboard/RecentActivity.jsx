'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';
import { filterByMonth, formatCurrency, formatDate } from '@/utils/helpers';
import { getCategoryInfo } from '@/data/categories';

export default function RecentActivity() {
  const { transactions, loading, setActiveTab, selectedMonth } = useFinanceStore();
  if (loading) return <div className="h-[260px] rounded-3xl bg-slate-100 dark:bg-white/[0.03] animate-pulse" />;

  const filtered = filterByMonth(transactions, selectedMonth);
  const recent = [...filtered]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  if (recent.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="zenith-card p-6 md:p-8 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-5 rounded-full bg-amber-500" />
            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">Recent Activity</h3>
          </div>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 ml-3.5">
            {selectedMonth ? `Latest in ${selectedMonth}` : 'Latest transactions'}
          </p>
        </div>
        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('transactions')}
          className="flex items-center gap-1 text-[12px] font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          View all <ChevronRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-1">
        {recent.map((t, i) => {
          const cat = getCategoryInfo(t.category);
          const isIncome = t.type === 'income';
          return (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.06, duration: 0.35 }}
              whileHover={{ backgroundColor: 'rgba(0,0,0,0.015)' }}
              className="flex items-center gap-3.5 py-2.5 px-3 -mx-3 rounded-xl transition-colors cursor-default group"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110" style={{ backgroundColor: `${cat.color}12` }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color, boxShadow: `0 0 6px ${cat.color}40` }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{t.description}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{formatDate(t.date)}</p>
              </div>

              <div className={`flex items-center gap-1 flex-shrink-0 ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isIncome
                  ? <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                  : <ArrowDownRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                }
                <span className="text-[13px] font-bold tabular-nums">
                  {formatCurrency(t.amount)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
