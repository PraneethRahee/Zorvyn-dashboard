'use client';

import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, ThumbsUp, ArrowUpRight, PiggyBank, Calendar, Zap, Target, BarChart3 } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';
import { generateInsights, getTopSpendingCategory, calculateTotals, formatCurrency } from '@/utils/helpers';
import { CATEGORIES } from '@/data/categories';

const iconMap = { TrendingUp, AlertTriangle, ThumbsUp, ArrowUpRight, PiggyBank, Calendar, Zap, Target, BarChart3 };

const accentMap = {
  success: { color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.12)', iconBg: 'rgba(16,185,129,0.1)', gradient: 'linear-gradient(135deg, #10b981, #06b6d4)' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.12)', iconBg: 'rgba(245,158,11,0.1)', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' },
  info: { color: '#6366f1', bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.12)', iconBg: 'rgba(99,102,241,0.1)', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
};

export default function SmartInsights() {
  const { transactions, loading } = useFinanceStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-[140px] rounded-[20px] bg-slate-100 dark:bg-white/[0.03] animate-pulse" />)}
      </div>
    );
  }

  const insights = generateInsights(transactions, CATEGORIES);
  const topCat = getTopSpendingCategory(transactions, CATEGORIES);
  const totals = calculateTotals(transactions);

  const quickStats = [
    { label: 'Transactions', value: transactions.length, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', shadow: '0 4px 16px rgba(99,102,241,0.2)' },
    { label: 'Avg Amount', value: formatCurrency(transactions.reduce((s, t) => s + t.amount, 0) / Math.max(transactions.length, 1)), gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)', shadow: '0 4px 16px rgba(6,182,212,0.2)' },
    { label: 'Savings Rate', value: `${totals.income > 0 ? ((totals.balance / totals.income) * 100).toFixed(1) : 0}%`, gradient: 'linear-gradient(135deg, #10b981, #14b8a6)', shadow: '0 4px 16px rgba(16,185,129,0.2)' },
    { label: 'Daily Spend', value: formatCurrency(totals.expenses / Math.max(new Set(transactions.map(t => t.date)).size, 1)), gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', shadow: '0 4px 16px rgba(245,158,11,0.2)' },
  ];

  return (
    <div className="space-y-6">
      {topCat && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[24px] p-8 md:p-10 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', transform: 'translate(30%, -40%)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', transform: 'translate(-30%, 40%)' }} />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', transform: 'translate(-50%, -50%)' }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topCat.color, boxShadow: `0 0 12px ${topCat.color}80` }} />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Highest Spending</p>
            </div>

            <h3 className="text-[32px] md:text-[38px] font-black text-white tracking-tight mb-8">{topCat.label}</h3>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-slate-400 font-medium">{formatCurrency(topCat.amount)} of {formatCurrency(totals.expenses)}</span>
                <span className="text-[13px] font-bold text-indigo-400">{topCat.percentage}%</span>
              </div>
              <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${topCat.percentage}%` }}
                  transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${topCat.color}, ${topCat.color}aa)` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-10">
              {[
                { label: 'Total Spent', value: formatCurrency(topCat.amount), color: '#34d399' },
                { label: 'Share', value: `${topCat.percentage}%`, color: '#818cf8' },
                { label: 'Transactions', value: transactions.filter(t => t.type === 'expense' && t.category === topCat.category).length, color: '#fbbf24' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] mb-1 font-bold">{stat.label}</p>
                  <p className="text-[22px] font-black tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
            whileHover={{ y: -3, transition: { duration: 0.25 } }}
            className="zenith-card p-5 text-center relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] opacity-50 group-hover:opacity-100 transition-opacity" style={{ background: stat.gradient }} />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2 font-bold">{stat.label}</p>
            <p className="text-[20px] font-black tabular-nums text-slate-900 dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => {
          const accent = accentMap[insight.type] || accentMap.info;
          const IconComponent = iconMap[insight.icon] || TrendingUp;
          return (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
              whileHover={{ y: -3, transition: { duration: 0.25 } }}
              className="zenith-card p-5 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity" style={{ background: accent.gradient }} />

              <div className="flex items-start gap-4">
                <motion.div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: accent.iconBg }}
                >
                  <IconComponent className="w-[18px] h-[18px]" style={{ color: accent.color }} strokeWidth={2} />
                </motion.div>
                <div className="min-w-0">
                  <h4 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">{insight.title}</h4>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
