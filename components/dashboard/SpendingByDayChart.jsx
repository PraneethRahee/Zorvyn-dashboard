'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';
import { filterByMonth, formatCurrency } from '@/utils/helpers';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#6366f1', '#10b981', '#f59e0b', '#ec4899',
];

export default function SpendingByDayChart() {
  const { transactions, loading, darkMode: dark, selectedMonth } = useFinanceStore();
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 400, h: 240 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setDims({ w: e.contentRect.width, h: Math.max(220, e.contentRect.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (loading) return <div className="h-[340px] rounded-3xl bg-slate-100 dark:bg-white/[0.03] animate-pulse" />;

  const filtered = filterByMonth(transactions, selectedMonth);
  const expenses = filtered.filter(t => t.type === 'expense');

  const dayTotals = DAYS.map(() => 0);
  const dayCounts = DAYS.map(() => 0);
  expenses.forEach(t => {
    const d = new Date(t.date);
    let dayIndex = d.getDay() - 1;
    if (dayIndex < 0) dayIndex = 6;
    dayTotals[dayIndex] += t.amount;
    dayCounts[dayIndex]++;
  });

  const maxVal = Math.max(...dayTotals, 1);
  const totalSpend = dayTotals.reduce((a, b) => a + b, 0);
  const avgSpend = totalSpend / 7;
  const busiestDay = DAYS[dayTotals.indexOf(Math.max(...dayTotals))];

  if (totalSpend === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="zenith-card p-6 md:p-8 h-full flex flex-col items-center justify-center"
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <CalendarDays className="w-5 h-5" style={{ color: '#f59e0b' }} />
          </div>
          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight mb-1">Spending by Day</h3>
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            {selectedMonth ? `No expenses recorded in ${selectedMonth}` : 'No expense data available'}
          </p>
        </div>
      </motion.div>
    );
  }

  const PAD_B = 36, PAD_T = 8, PAD_L = 8, PAD_R = 8;
  const H = dims.h - PAD_T - PAD_B;
  const W = dims.w - PAD_L - PAD_R;
  const barWidth = Math.min(28, W / 7 - 10);
  const gap = (W - barWidth * 7) / 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="zenith-card p-6 md:p-8 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-2 h-2 rounded-full"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 0 8px rgba(245,158,11,0.4)' }} />
            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">Spending by Day</h3>
          </div>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 ml-[18px]">
            {selectedMonth ? `${selectedMonth} breakdown` : 'Weekly spending pattern'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold"
          style={{
            background: 'rgba(245,158,11,0.08)',
            color: '#f59e0b',
            border: '1px solid rgba(245,158,11,0.15)',
          }}>
          <CalendarDays className="w-3 h-3" />
          {busiestDay}
        </div>
      </div>

      <div className="flex-1 min-h-[200px] relative" ref={containerRef}>
        <svg viewBox={`0 0 ${dims.w} ${dims.h}`} className="w-full h-full" style={{ overflow: 'visible' }}>
          <defs>
            {DAYS.map((_, i) => (
              <linearGradient key={i} id={`day-bar-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={DAY_COLORS[i]} stopOpacity={1} />
                <stop offset="100%" stopColor={DAY_COLORS[i]} stopOpacity={0.5} />
              </linearGradient>
            ))}
            <filter id="bar-glow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            </filter>
          </defs>

          {avgSpend > 0 && (
            <>
              <line
                x1={PAD_L}
                y1={PAD_T + H - (avgSpend / maxVal) * H}
                x2={dims.w - PAD_R}
                y2={PAD_T + H - (avgSpend / maxVal) * H}
                stroke={dark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={dims.w - PAD_R - 2}
                y={PAD_T + H - (avgSpend / maxVal) * H - 6}
                textAnchor="end"
                fill={dark ? '#6366f1' : '#6366f1'}
                fontSize="9"
                fontWeight="600"
              >
                avg {formatCurrency(avgSpend)}
              </text>
            </>
          )}

          {DAYS.map((day, i) => {
            const barH = Math.max(4, (dayTotals[i] / maxVal) * H);
            const x = PAD_L + i * (barWidth + gap);
            const y = PAD_T + H - barH;
            return (
              <g key={day}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={barWidth / 2}
                  fill={DAY_COLORS[i]}
                  opacity={0.15}
                  filter="url(#bar-glow)"
                />
                <motion.rect
                  x={x}
                  y={PAD_T + H}
                  width={barWidth}
                  height={0}
                  rx={barWidth / 2}
                  fill={`url(#day-bar-${i})`}
                  initial={{ height: 0, y: PAD_T + H }}
                  animate={{ height: barH, y }}
                  transition={{ delay: 0.4 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
                {dayTotals[i] > 0 && (
                  <motion.text
                    initial={{ opacity: 0, y: y - 4 }}
                    animate={{ opacity: 1, y: y - 6 }}
                    transition={{ delay: 0.8 + i * 0.07, duration: 0.3 }}
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fill={dark ? '#94a3b8' : '#64748b'}
                    fontSize="9"
                    fontWeight="600"
                  >
                    {dayTotals[i] >= 1000
                      ? `$${(dayTotals[i] / 1000).toFixed(1)}k`
                      : `$${dayTotals[i].toFixed(0)}`}
                  </motion.text>
                )}
                <text
                  x={x + barWidth / 2}
                  y={dims.h - PAD_B + 18}
                  textAnchor="middle"
                  fill={dark ? '#475569' : '#94a3b8'}
                  fontSize="11"
                  fontWeight="600"
                >
                  {day}
                </text>
                {/* Count badge */}
                {dayCounts[i] > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={dims.h - PAD_B + 30}
                    textAnchor="middle"
                    fill={dark ? '#334155' : '#cbd5e1'}
                    fontSize="8"
                    fontWeight="500"
                  >
                    {dayCounts[i]} txns
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </motion.div>
  );
}
