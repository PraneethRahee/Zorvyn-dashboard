'use client';

import { motion } from 'framer-motion';
import useFinanceStore from '@/store/useFinanceStore';
import { filterByMonth, getSpendingByCategory, formatCurrency } from '@/utils/helpers';
import { getCategoryInfo } from '@/data/categories';

function ProgressRing({ percentage, color, size = 56, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="rgba(148,163,184,0.08)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
      />
    </svg>
  );
}

export default function CategoryRings() {
  const { transactions, loading, selectedMonth } = useFinanceStore();
  if (loading) return <div className="h-[340px] rounded-3xl bg-slate-100 dark:bg-white/[0.03] animate-pulse" />;

  const filtered = filterByMonth(transactions, selectedMonth);
  const spending = getSpendingByCategory(filtered);
  if (spending.length === 0) return null;

  const total = spending.reduce((s, item) => s + item.amount, 0);
  const data = spending.slice(0, 5).map(s => {
    const cat = getCategoryInfo(s.category);
    return { ...s, label: cat.label, color: cat.color, icon: cat.icon };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="zenith-card p-6 md:p-8 h-full flex flex-col"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-5 rounded-full bg-rose-500" />
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">Top Spending</h3>
        </div>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 ml-3.5">
          {selectedMonth ? `${selectedMonth} breakdown — ` : 'Where your money goes — '}
          {formatCurrency(total)} total
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-5">
        {data.map((item, i) => {
          const pct = total > 0 ? ((item.amount / total) * 100) : 0;
          return (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
              className="flex items-center gap-4 group cursor-default"
            >
              <div className="relative flex-shrink-0">
                <ProgressRing percentage={pct} color={item.color} size={48} strokeWidth={4.5} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}60` }} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{item.label}</span>
                  <span className="text-[13px] font-bold text-slate-900 dark:text-white tabular-nums">{formatCurrency(item.amount)}</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}bb)` }}
                  />
                </div>
              </div>

              <div className="w-12 text-right flex-shrink-0">
                <span className="text-[13px] font-bold tabular-nums" style={{ color: item.color }}>{pct.toFixed(0)}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
