'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import useFinanceStore from '@/store/useFinanceStore';
import { getSpendingByCategory, formatCurrency } from '@/utils/helpers';
import { getCategoryInfo } from '@/data/categories';

export default function SpendingBreakdown() {
  const { transactions, loading } = useFinanceStore();

  if (loading) return <div className="h-[380px] rounded-[20px] bg-slate-100 dark:bg-white/[0.03] animate-pulse" />;

  const spending = getSpendingByCategory(transactions);
  if (spending.length === 0) return null;

  const total = spending.reduce((s, item) => s + item.amount, 0);
  const data = spending.slice(0, 7).map(s => {
    const cat = getCategoryInfo(s.category);
    return { ...s, label: cat.label, color: cat.color };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="zenith-card p-6 md:p-7"
    >
      <div className="mb-5">
        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">Spending Breakdown</h3>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">Where your money goes</p>
      </div>

      <div className="flex flex-col items-center gap-5">
        <div className="w-full max-w-[220px] h-[220px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="amount"
                animationDuration={1200}
                animationEasing="ease-out"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '13px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                  padding: '12px 16px',
                }}
                formatter={(value) => [formatCurrency(value)]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Total</p>
            <p className="text-[18px] font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">{formatCurrency(total)}</p>
          </div>
        </div>

        <div className="w-full space-y-2.5">
          {data.map((item, i) => {
            const pct = ((item.amount / total) * 100).toFixed(1);
            return (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.35 }}
                className="group cursor-default"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[12px] text-slate-600 dark:text-slate-300 font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-semibold text-slate-900 dark:text-white tabular-nums">{formatCurrency(item.amount)}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 w-10 text-right tabular-nums font-medium">{pct}%</span>
                  </div>
                </div>
                <div className="h-1 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.5 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}cc)` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
