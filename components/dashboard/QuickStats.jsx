'use client';

import { motion } from 'framer-motion';
import { CreditCard, Repeat, BarChart3, Target } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';
import { filterByMonth, calculateTotals, getMonthlyData, formatCurrency, formatShortCurrency, getSpendingByCategory } from '@/utils/helpers';
import { CATEGORIES } from '@/data/categories';

export default function QuickStats() {
  const { transactions, loading, selectedMonth } = useFinanceStore();
  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-[90px] rounded-2xl bg-slate-100 dark:bg-white/[0.03] animate-pulse" />)}</div>;

  const filtered = filterByMonth(transactions, selectedMonth);
  const totals = calculateTotals(filtered);
  const monthly = getMonthlyData(filtered);
  const spending = getSpendingByCategory(filtered);

  const days = new Set(filtered.map(t => t.date)).size;
  const dailyAvg = totals.expenses / Math.max(days, 1);
  const avgTransaction = filtered.length > 0 ? filtered.reduce((s, t) => s + t.amount, 0) / filtered.length : 0;

  const topCat = spending.length > 0 ? spending[0] : null;
  const topCatInfo = topCat ? CATEGORIES.find(c => c.id === topCat.category) : null;

  const stats = [
    {
      label: 'Daily Average',
      value: formatShortCurrency(dailyAvg),
      icon: CreditCard,
      color: '#6366f1',
      bg: 'rgba(99,102,241,0.08)',
      border: 'rgba(99,102,241,0.15)',
    },
    {
      label: 'Avg Transaction',
      value: formatShortCurrency(avgTransaction),
      icon: BarChart3,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.08)',
      border: 'rgba(139,92,246,0.15)',
    },
    {
      label: 'Recurring Months',
      value: `${monthly.length}`,
      icon: Repeat,
      color: '#06b6d4',
      bg: 'rgba(6,182,212,0.08)',
      border: 'rgba(6,182,212,0.15)',
    },
    {
      label: 'Top Category',
      value: topCatInfo?.label || 'N/A',
      icon: Target,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.15)',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}
          whileHover={{ y: -3, transition: { duration: 0.25 } }}
          className="zenith-card p-4 md:p-5 group cursor-default"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{ backgroundColor: stat.bg }}
            >
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} strokeWidth={2} />
            </div>
          </div>
          <p className="text-[18px] md:text-[20px] font-black text-slate-900 dark:text-white tracking-tight truncate">
            {stat.value}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em] font-bold mt-0.5">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
