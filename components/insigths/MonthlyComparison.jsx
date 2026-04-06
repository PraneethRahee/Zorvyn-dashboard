'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import useFinanceStore from '@/store/useFinanceStore';
import { getMonthlyData, formatCurrency } from '@/utils/helpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="zenith-glass rounded-2xl px-5 py-4 shadow-2xl min-w-[160px]">
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-[0.15em]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-6 py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">{entry.name}</span>
          </div>
          <span className="text-[13px] font-bold text-slate-900 dark:text-white tabular-nums">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function MonthlyComparison() {
  const { transactions, loading } = useFinanceStore();
  if (loading) return <div className="h-[360px] rounded-[20px] bg-slate-100 dark:bg-white/[0.03] animate-pulse" />;

  const data = getMonthlyData(transactions).map(d => ({ ...d, balance: d.income - d.expenses }));
  if (data.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="zenith-card p-6 md:p-7"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">Monthly Comparison</h3>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">Income, expenses & net balance</p>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-500 dark:text-slate-400">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-500 dark:text-slate-400">Expenses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-500 dark:text-slate-400">Net</span>
          </div>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={5} barSize={20}>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(148,163,184,0.06)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} dx={-4} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="income" fill="#6366f1" radius={[6, 6, 0, 0]} animationDuration={1000} name="Income" />
            <Bar dataKey="expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} animationDuration={1000} name="Expenses" />
            <Bar dataKey="balance" fill="#10b981" radius={[6, 6, 0, 0]} animationDuration={1000} name="Net Balance" opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
