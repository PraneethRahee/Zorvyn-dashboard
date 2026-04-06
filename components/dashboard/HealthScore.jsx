'use client';

import { motion } from 'framer-motion';
import { Heart, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';
import { filterByMonth, calculateTotals, getMonthlyData, getSpendingByCategory, formatCurrency } from '@/utils/helpers';
import { CATEGORIES } from '@/data/categories';

function ScoreRing({ score, size = 100, strokeWidth = 7 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#6366f1';
    if (s >= 40) return '#f59e0b';
    return '#f43f5e';
  };

  const color = getColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-[26px] font-black tabular-nums"
          style={{ color }}
        >
          {score}
        </motion.span>
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] -mt-0.5">
          Score
        </span>
      </div>
    </div>
  );
}

export default function HealthScore() {
  const { transactions, loading, selectedMonth } = useFinanceStore();
  if (loading) return <div className="h-[300px] rounded-3xl bg-slate-100 dark:bg-white/[0.03] animate-pulse" />;

  const filtered = filterByMonth(transactions, selectedMonth);
  const totals = calculateTotals(filtered);
  const monthly = getMonthlyData(filtered);
  const spending = getSpendingByCategory(filtered);
  const totalExpenses = spending.reduce((s, i) => s + i.amount, 0);
  const topCategory = spending.length > 0 ? spending[0] : null;
  const topCat = topCategory ? CATEGORIES.find(c => c.id === topCategory.category) : null;

  let score = 50;
  if (totals.income > 0) {
    const savingsRate = (totals.balance / totals.income) * 100;
    score += Math.min(savingsRate * 0.5, 25);
    if (savingsRate > 20) score += 5;
    if (topCategory && totalExpenses > 0) {
      const topPct = (topCategory.amount / totalExpenses) * 100;
      if (topPct < 30) score += 10; 
      else if (topPct > 50) score -= 10; 
    }
    if (monthly.length >= 3) {
      const last3 = monthly.slice(-3);
      const avgExpense = last3.reduce((s, m) => s + m.expenses, 0) / last3.length;
      const variance = last3.reduce((s, m) => s + Math.pow(m.expenses - avgExpense, 2), 0) / last3.length;
      if (variance < Math.pow(avgExpense * 0.15, 2)) score += 10;
    }
  }
  score = Math.max(0, Math.min(100, Math.round(score)));

  const getGrade = (s) => {
    if (s >= 80) return { label: 'Excellent', color: '#10b981', icon: Heart, desc: 'Your finances are in great shape!' };
    if (s >= 60) return { label: 'Good', color: '#6366f1', icon: TrendingUp, desc: 'Solid financial health overall.' };
    if (s >= 40) return { label: 'Fair', color: '#f59e0b', icon: AlertTriangle, desc: 'Room for improvement in spending habits.' };
    return { label: 'Needs Work', color: '#f43f5e', icon: Zap, desc: 'Consider reducing unnecessary expenses.' };
  };

  const grade = getGrade(score);
  const GradeIcon = grade.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="zenith-card p-6 md:p-8 h-full flex flex-col"
    >
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">Financial Health</h3>
        </div>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 ml-3.5">
          {selectedMonth ? `${selectedMonth} health score` : 'Overall score based on your habits'}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <ScoreRing score={score} size={110} strokeWidth={8} />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="mt-5 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <GradeIcon className="w-4 h-4" style={{ color: grade.color }} />
            <span className="text-[14px] font-bold" style={{ color: grade.color }}>{grade.label}</span>
          </div>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 max-w-[200px]">{grade.desc}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.4 }}
          className="mt-5 w-full flex items-center justify-center gap-6"
        >
          <div className="text-center">
            <p className="text-[16px] font-black text-slate-900 dark:text-white tabular-nums">{monthly.length}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Months</p>
          </div>
          <div className="w-px h-8 bg-slate-200/50 dark:bg-white/[0.06]" />
          <div className="text-center">
            <p className="text-[16px] font-black text-slate-900 dark:text-white tabular-nums">{filtered.length}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Entries</p>
          </div>
          <div className="w-px h-8 bg-slate-200/50 dark:bg-white/[0.06]" />
          <div className="text-center">
            <p className="text-[16px] font-black tabular-nums" style={{ color: grade.color }}>{totals.income > 0 ? ((totals.balance / totals.income) * 100).toFixed(0) : 0}%</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Saved</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
