'use client';

import { motion, animate } from 'framer-motion';
import { useEffect, useState, useRef, useMemo } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, Activity, Calendar } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';
import { formatCurrency, formatShortCurrency, calculateTotals, getMonthlyData, filterByMonth } from '@/utils/helpers';

function AnimatedCounter({ value, duration = 1.5 }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prevValue.current = value;
    return controls.stop;
  }, [value, duration]);
  return <>{formatCurrency(display)}</>;
}

function MonthBubble({ month, data, isSelected, onClick, index }) {
  const isCurrentMonth = index === month.length - 1;
  const net = data ? data.income - data.expenses : 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 16, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.7 + index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.08, y: -3, transition: { duration: 0.25 } }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center gap-1 px-3 py-2 sm:px-4 sm:py-3 sm:gap-1.5 rounded-2xl transition-all duration-300 cursor-pointer group min-w-[72px] sm:min-w-[90px] flex-shrink-0"
      style={{
        background: isSelected
          ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))'
          : 'rgba(255,255,255,0.04)',
        border: isSelected
          ? '1.5px solid rgba(99,102,241,0.4)'
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isSelected
          ? '0 8px 32px -8px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          : 'none',
      }}
    >
      {isSelected && (
        <motion.div
          layoutId="month-glow"
          className="absolute -inset-1 rounded-2xl opacity-30"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 0.3 }}
        />
      )}

      <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] relative z-10 transition-colors ${
        isSelected ? 'text-indigo-300' : 'text-white/40 group-hover:text-white/60'
      }`}>
        {data ? data.month.split(' ')[0] : 'N/A'}
      </span>

      {data && (
        <>
          <span className={`text-[14px] sm:text-[16px] font-black tabular-nums relative z-10 transition-colors ${
            isSelected ? 'text-white' : 'text-white/70 group-hover:text-white/90'
          }`}>
            {formatShortCurrency(data.income - data.expenses)}
          </span>
          <div className="flex items-center gap-1 relative z-10">
            <div className={`w-1.5 h-1.5 rounded-full ${net >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span className={`text-[8px] sm:text-[9px] font-semibold ${
              net >= 0 ? 'text-emerald-400/70' : 'text-rose-400/70'
            }`}>
              {net >= 0 ? '+' : ''}{formatShortCurrency(net)}
            </span>
          </div>
        </>
      )}
    </motion.button>
  );
}

export default function HeroBalance() {
  const { transactions, loading, selectedMonth, setSelectedMonth, openMonthDetail } = useFinanceStore();

  const filtered = useMemo(() => filterByMonth(transactions, selectedMonth), [transactions, selectedMonth]);
  const { income, expenses, balance } = calculateTotals(filtered);
  const monthly = getMonthlyData(transactions);
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  const filteredMonthly = getMonthlyData(filtered);
  const lastMonth = filteredMonthly.length >= 2 ? filteredMonthly[filteredMonthly.length - 2] : null;
  const thisMonth = filteredMonthly.length >= 1 ? filteredMonthly[filteredMonthly.length - 1] : null;
  let expChange = null;
  if (lastMonth && thisMonth && lastMonth.expenses > 0) {
    expChange = (((thisMonth.expenses - lastMonth.expenses) / lastMonth.expenses) * 100).toFixed(1);
  }

  if (loading) return <div className="h-[200px] rounded-3xl bg-slate-100 dark:bg-white/[0.03] animate-pulse" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1145 40%, #2d1b69 70%, #0f0f23 100%)',
        boxShadow: '0 24px 64px -12px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', transform: 'translate(20%, -40%)' }} />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)', transform: 'translate(-20%, 40%)' }} />
      <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', transform: 'translate(-50%, -50%)' }} />

      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative z-10 p-4 sm:p-5 md:p-7 lg:p-9">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Wallet className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-[0.15em]">
                  {selectedMonth ? `${selectedMonth} Balance` : 'Total Balance'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: balance >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)' }}>
                {balance >= 0
                  ? <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  : <ArrowDownRight className="w-3 h-3 text-rose-400" />
                }
                <span className={`text-[11px] font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {balance >= 0 ? '+' : ''}{savingsRate}%
                </span>
              </div>
              {selectedMonth && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMonth(null)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">All Months</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/50">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </motion.button>
              )}
            </div>

            <motion.h2 className="text-[30px] sm:text-[38px] md:text-[48px] lg:text-[54px] font-black text-white tracking-tight leading-none mb-2" style={{ fontFamily: 'var(--font-geist-sans)' }}>
              <AnimatedCounter value={balance} duration={1.8} />
            </motion.h2>

            <p className="text-[13px] text-indigo-200/60 font-medium">
              {selectedMonth
                ? `${filtered.length} transactions in ${selectedMonth}`
                : `Across ${transactions.length} transactions this period`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 lg:gap-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative p-3.5 sm:p-4 md:p-5 lg:p-6 rounded-2xl"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)' }}>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[11px] font-bold text-emerald-300/70 uppercase tracking-[0.15em]">Income</span>
              </div>
              <p className="text-[20px] sm:text-[22px] md:text-[26px] font-black text-white tabular-nums tracking-tight">
                <AnimatedCounter value={income} duration={1.4} />
              </p>
              {expChange !== null && !selectedMonth && (
                <div className="mt-2 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400/70 font-medium">
                    vs last month
                  </span>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="relative p-3.5 sm:p-4 md:p-5 lg:p-6 rounded-2xl"
              style={{
                background: 'rgba(244,63,94,0.08)',
                border: '1px solid rgba(244,63,94,0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.2)' }}>
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <span className="text-[11px] font-bold text-rose-300/70 uppercase tracking-[0.15em]">Expenses</span>
              </div>
              <p className="text-[20px] sm:text-[22px] md:text-[26px] font-black text-white tabular-nums tracking-tight">
                <AnimatedCounter value={expenses} duration={1.4} />
              </p>
              <div className="mt-2 flex items-center gap-1">
                <Activity className="w-3 h-3 text-rose-400/60" />
                <span className="text-[11px] text-rose-300/50 font-medium">
                  {filteredMonthly.length} months tracked
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-4 sm:mt-7 flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 pl-1 pr-7">
          <div className="hidden sm:flex items-center gap-2 mr-2 flex-shrink-0">
            <Calendar className="w-3.5 h-3.5 text-indigo-300/50" />
            <span className="text-[10px] font-bold text-indigo-200/40 uppercase tracking-[0.15em]">Filter by month</span>
          </div>
          {monthly.map((m, i) => (
            <MonthBubble
              key={m.month}
              month={monthly}
              data={m}
              isSelected={selectedMonth === m.month}
              onClick={() => {
                setSelectedMonth(m.month === selectedMonth ? null : m.month);
                openMonthDetail(m.month);
              }}
              index={i}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
