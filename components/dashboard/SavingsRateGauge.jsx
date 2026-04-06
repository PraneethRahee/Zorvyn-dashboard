'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, TrendingUp, TrendingDown } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';
import { filterByMonth, calculateTotals, getMonthlyData, formatCurrency } from '@/utils/helpers';

function GaugeArc({ percentage, size = 160, strokeWidth = 14, color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const arcLength = circumference * 0.75; 
  const filledLength = (percentage / 100) * arcLength;
  const offset = circumference - filledLength;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform" style={{ transform: 'rotate(135deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: arcLength - filledLength }}
          transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-[32px] font-black tabular-nums"
          style={{ color }}
        >
          {percentage.toFixed(0)}%
        </motion.span>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em] -mt-1">
          Savings Rate
        </span>
      </div>
    </div>
  );
}

function MiniBar({ value, maxVal, label, color, delay }) {
  const height = maxVal > 0 ? Math.max(4, (value / maxVal) * 100) : 4;
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${height}%` }}
        transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-3 md:w-4 rounded-full"
        style={{
          background: `linear-gradient(180deg, ${color}, ${color}66)`,
          boxShadow: `0 0 8px ${color}25`,
          minHeight: '4px',
        }}
      />
      <span className="text-[9px] md:text-[10px] font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

export default function SavingsRateGauge() {
  const { transactions, loading, darkMode: dark, selectedMonth } = useFinanceStore();

  if (loading) return <div className="h-[380px] rounded-3xl bg-slate-100 dark:bg-white/[0.03] animate-pulse" />;

  const filtered = filterByMonth(transactions, selectedMonth);
  const totals = calculateTotals(filtered);
  const monthly = getMonthlyData(filtered);

  if (filtered.length === 0 || totals.income === 0) return null;

  const savingsRate = (totals.balance / totals.income) * 100;

  const getColor = (rate) => {
    if (rate >= 40) return '#10b981';
    if (rate >= 20) return '#6366f1';
    if (rate >= 10) return '#f59e0b';
    return '#f43f5e';
  };

  const color = getColor(savingsRate);
  const maxSavings = Math.max(...monthly.map(m => m.income - m.expenses), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="zenith-card p-6 md:p-8 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-2 h-2 rounded-full"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 8px rgba(99,102,241,0.4)' }} />
            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">Savings Rate</h3>
          </div>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 ml-[18px]">
            {selectedMonth ? `For ${selectedMonth}` : 'Overall savings efficiency'}
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold"
          style={{
            background: savingsRate >= 20 ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
            color: savingsRate >= 20 ? '#10b981' : '#f43f5e',
            border: `1px solid ${savingsRate >= 20 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}`,
          }}>
          {savingsRate >= 20 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {savingsRate >= 20 ? 'Healthy' : 'Low'}
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <GaugeArc percentage={Math.max(0, savingsRate)} size={150} strokeWidth={13} color={color} />

        {monthly.length > 1 && (
          <div className="w-full">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-3 text-center">
              Monthly Net Savings
            </p>
            <div className="flex items-end justify-center gap-2 md:gap-3 h-[70px] px-2">
              {monthly.map((m, i) => {
                const net = m.income - m.expenses;
                const barColor = net >= 0 ? '#10b981' : '#f43f5e';
                return (
                  <MiniBar
                    key={m.month}
                    value={Math.abs(net)}
                    maxVal={Math.max(...monthly.map(x => Math.abs(x.income - x.expenses)), 1)}
                    label={m.month.split(' ')[0]}
                    color={barColor}
                    delay={0.6 + i * 0.08}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="w-full flex items-center justify-center gap-6 pt-2">
          <div className="text-center">
            <p className="text-[16px] font-black text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(totals.balance)}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Saved</p>
          </div>
          <div className="w-px h-8 bg-slate-200/50 dark:bg-white/[0.06]" />
          <div className="text-center">
            <p className="text-[16px] font-black text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(totals.income)}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Income</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
