'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';
import { filterByMonth, formatCurrency, formatShortCurrency, calculateTotals, getSpendingByCategory } from '@/utils/helpers';
import { getCategoryInfo } from '@/data/categories';

function CategoryDonut({ data, size = 140, strokeWidth = 18 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const total = data.reduce((s, d) => s + d.amount, 0);
  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth={strokeWidth} />
        {data.map((d, i) => {
          const pct = total > 0 ? d.amount / total : 0;
          const arcLen = pct * circumference;
          const gap = data.length > 1 ? 2 : 0;
          const actualArc = Math.max(0, arcLen - gap);
          const el = (
            <motion.circle
              key={d.category}
              cx={size/2} cy={size/2} r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth - 2}
              strokeLinecap="round"
              strokeDasharray={`${actualArc} ${circumference - actualArc}`}
              strokeDashoffset={-offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
              style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
            />
          );
          offset += arcLen;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Total</span>
        <span className="text-[15px] font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
          {formatShortCurrency(total)}
        </span>
      </div>
    </div>
  );
}

function DailySpendingBars({ expenses }) {
  const dayMap = {};
  expenses.forEach(t => {
    const day = parseInt(t.date.split('-')[2], 10);
    if (!isNaN(day)) dayMap[day] = (dayMap[day] || 0) + t.amount;
  });
  const days = Object.entries(dayMap).sort(([a], [b]) => Number(a) - Number(b));

  if (days.length === 0) {
    return (
      <div className="flex items-center justify-center h-[130px]">
        <p className="text-center text-slate-400 text-sm">No expense data for this period</p>
      </div>
    );
  }

  const maxVal = Math.max(...days.map(([,v]) => v), 1);
  const totalSpend = days.reduce((s, [,v]) => s + v, 0);
  const avgDaily = totalSpend / days.length;
  const busiestDay = days.reduce((best, [d, v]) => v > best[1] ? [d, v] : best, days[0]);

  const svgW = 460;
  const svgH = 110;
  const padTop = 6;
  const padBottom = 16;
  const padSide = 2;
  const chartH = svgH - padTop - padBottom;
  const chartW = svgW - padSide * 2;
  const slotW = chartW / days.length;
  const barW = Math.max(3, slotW * 0.65);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <div className="w-2 h-2 rounded-full bg-indigo-500" /> Low
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <div className="w-2 h-2 rounded-full bg-amber-500" /> Mid
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <div className="w-2 h-2 rounded-full bg-rose-500" /> High
          </div>
        </div>
        <span className="text-[10px] font-semibold text-slate-400">Day {busiestDay[0]} highest</span>
      </div>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 'auto' }} preserveAspectRatio="xMidYMid meet">
        <line x1={padSide} y1={padTop + chartH} x2={svgW - padSide} y2={padTop + chartH} stroke="rgba(148,163,184,0.15)" strokeWidth={1} />

        {days.map(([day, amount], i) => {
          const pct = amount / maxVal;
          const barH = Math.max(3, pct * chartH);
          const cx = padSide + i * slotW + slotW / 2;
          const x = cx - barW / 2;
          const y = padTop + chartH - barH;
          const intensity = pct;
          const color = intensity > 0.7 ? '#f43f5e' : intensity > 0.4 ? '#f59e0b' : '#6366f1';

          return (
            <g key={day}>
              <rect
                x={x}
                y={padTop + chartH}
                width={barW}
                height={0}
                rx={barW / 2}
                fill={color}
                opacity={0.85}
              >
                <animate
                  attributeName="height"
                  from="0"
                  to={barH}
                  dur="0.45s"
                  begin={`${0.12 + i * 0.018}s`}
                  fill="freeze"
                  calcMode="spline"
                  keySplines="0.22 1 0.36 1"
                />
                <animate
                  attributeName="y"
                  from={padTop + chartH}
                  to={y}
                  dur="0.45s"
                  begin={`${0.12 + i * 0.018}s`}
                  fill="freeze"
                  calcMode="spline"
                  keySplines="0.22 1 0.36 1"
                />
              </rect>
              {(Number(day) % 5 === 0 || Number(day) === 1) && (
                <text
                  x={cx}
                  y={svgH - 2}
                  textAnchor="middle"
                  fill="rgba(148,163,184,0.55)"
                  fontSize="8"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="500"
                >
                  {day}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex items-center justify-between mt-2 pt-2 px-1" style={{ borderTop: '1px solid rgba(148,163,184,0.1)' }}>
        <span className="text-[10px] text-slate-400">{days.length} active days</span>
        <span className="text-[10px] font-semibold text-slate-500">Avg {formatCurrency(avgDaily)}/day</span>
      </div>
    </div>
  );
}

function IncomeExpenseCompare({ income, expenses }) {
  const maxVal = Math.max(income, expenses, 1);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }} />
            <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Income</span>
          </div>
          <span className="text-[13px] font-bold text-emerald-500 tabular-nums">{formatCurrency(income)}</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(income / maxVal) * 100}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }} />
            <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Expenses</span>
          </div>
          <span className="text-[13px] font-bold text-rose-500 tabular-nums">{formatCurrency(expenses)}</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(expenses / maxVal) * 100}%` }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #f43f5e, #ec4899)' }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 mt-1" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Net Savings</span>
        <div className="flex items-center gap-1.5">
          {income - expenses >= 0
            ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            : <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
          }
          <span className={`text-[15px] font-bold tabular-nums ${income - expenses >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {formatCurrency(income - expenses)}
          </span>
        </div>
      </div>
    </div>
  );
}


function TopTransactions({ transactions }) {
  const sorted = [...transactions]
    .filter(t => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  return (
    <div className="space-y-2">
      {sorted.map((t, i) => {
        const cat = getCategoryInfo(t.category);
        const parts = t.date.split('-');
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const dayStr = `${monthNames[parseInt(parts[1],10)-1]} ${parseInt(parts[2],10)}`;
        return (
          <motion.div
            key={t._id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.06, duration: 0.35 }}
            className="flex items-center gap-3 py-2 px-3 -mx-1 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-default"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}12` }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200 truncate">{t.description}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{dayStr} · {cat.label}</p>
            </div>
            <span className="text-[12px] font-bold text-rose-500 tabular-nums flex-shrink-0">
              -{formatCurrency(t.amount)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function MonthDetailModal() {
  const { monthDetailOpen, monthDetailMonth, closeMonthDetail, transactions, darkMode: dark } = useFinanceStore();

  useEffect(() => {
    if (!monthDetailOpen) return;
    const handler = (e) => { if (e.key === 'Escape') closeMonthDetail(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [monthDetailOpen, closeMonthDetail]);

  const filtered = useMemo(() => filterByMonth(transactions, monthDetailMonth), [transactions, monthDetailMonth]);
  const totals = calculateTotals(filtered);
  const spending = useMemo(() => getSpendingByCategory(filtered), [filtered]);
  const expenseList = filtered.filter(t => t.type === 'expense');

  const savingsRate = totals.income > 0 ? ((totals.balance / totals.income) * 100).toFixed(1) : 0;
  const categoryData = spending.slice(0, 6).map(s => {
    const cat = getCategoryInfo(s.category);
    return { ...s, label: cat.label, color: cat.color };
  });
  const txCount = filtered.length;
  const avgDaily = expenseList.length > 0
    ? expenseList.reduce((s, t) => s + t.amount, 0) / Math.max(new Set(expenseList.map(t => t.date)).size, 1)
    : 0;

  return (
    <AnimatePresence>
      {monthDetailOpen && monthDetailMonth && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMonthDetail}
            className="fixed inset-0 z-[200] bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-4 md:inset-8 lg:inset-12 z-[201] flex items-center justify-center"
          >
            <div
              className="w-full max-w-[900px] max-h-full overflow-y-auto rounded-3xl"
              style={{
                background: dark ? '#0c1220' : '#ffffff',
                border: `1px solid ${dark ? 'rgba(51,65,85,0.3)' : 'rgba(226,232,240,0.6)'}`,
                boxShadow: dark
                  ? '0 32px 80px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)'
                  : '0 32px 80px -16px rgba(0,0,0,0.15), 0 0 0 1px rgba(99,102,241,0.05)',
              }}
            >
              <div className="sticky top-0 z-10 px-7 py-5 flex items-center justify-between"
                style={{
                  background: dark ? 'rgba(12,18,32,0.95)' : 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(12px)',
                  borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                }}>
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                      </svg>
                    </div>
                    <h2 className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight">
                      {monthDetailMonth} Breakdown
                    </h2>
                  </div>
                  <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 ml-[42px]">
                    {txCount} transactions · Daily avg {formatCurrency(avgDaily)}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeMonthDetail}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{
                    background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  }}
                >
                  <X className="w-4 h-4 text-slate-400" />
                </motion.button>
              </div>

              <div className="px-7 py-5 grid grid-cols-3 gap-4"
                style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                {[
                  { label: 'Income', value: totals.income, color: '#10b981', icon: TrendingUp },
                  { label: 'Expenses', value: totals.expenses, color: '#f43f5e', icon: TrendingDown },
                  { label: 'Savings Rate', value: `${savingsRate}%`, color: '#6366f1', icon: ArrowUpRight },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="text-center"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 mb-1">
                      {item.label}
                    </p>
                    <p className="text-[20px] font-black tabular-nums" style={{ color: item.color }}>
                      {typeof item.value === 'number' ? formatCurrency(item.value) : item.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl"
                  style={{
                    background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                  }}>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white mb-4">Income vs Expenses</p>
                  <IncomeExpenseCompare income={totals.income} expenses={totals.expenses} />
                </div>

                <div className="p-5 rounded-2xl"
                  style={{
                    background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                  }}>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white mb-4">Spending by Category</p>
                  <div className="flex items-center gap-5">
                    <CategoryDonut data={categoryData} size={120} strokeWidth={16} />
                    <div className="flex-1 space-y-2">
                      {categoryData.map((cat, i) => {
                        const totalSpend = spending.reduce((s, x) => s + x.amount, 0);
                        const pct = totalSpend > 0 ? ((cat.amount / totalSpend) * 100).toFixed(0) : 0;
                        return (
                          <div key={cat.category} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate">{cat.label}</span>
                            </div>
                            <span className="text-[11px] font-bold tabular-nums text-slate-700 dark:text-slate-200">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl"
                  key={`chart-${monthDetailMonth}`}
                  style={{
                    background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                  }}>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white mb-3">Daily Spending Pattern</p>
                  <DailySpendingBars expenses={expenseList} />
                </div>

                <div className="p-5 rounded-2xl"
                  style={{
                    background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                  }}>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white mb-3">Top Expenses</p>
                  <TopTransactions transactions={filtered} />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
