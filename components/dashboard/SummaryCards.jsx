'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, Zap } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';
import { formatCurrency, calculateTotals } from '@/utils/helpers';

function AnimatedCounter({ value, duration = 1.2 }) {
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

  return <span>{formatCurrency(display)}</span>;
}

const cardDefs = [
  {
    title: 'Total Balance',
    key: 'balance',
    icon: Wallet,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    iconBg: 'rgba(99,102,241,0.12)',
    shadow: '0 8px 32px -4px rgba(99,102,241,0.25)',
    darkIconBg: 'rgba(129,140,248,0.15)',
  },
  {
    title: 'Total Income',
    key: 'income',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    iconBg: 'rgba(16,185,129,0.12)',
    shadow: '0 8px 32px -4px rgba(16,185,129,0.25)',
    darkIconBg: 'rgba(52,211,153,0.15)',
  },
  {
    title: 'Total Expenses',
    key: 'expenses',
    icon: TrendingDown,
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)',
    iconBg: 'rgba(244,63,94,0.12)',
    shadow: '0 8px 32px -4px rgba(244,63,94,0.25)',
    darkIconBg: 'rgba(251,113,133,0.15)',
  },
];

export default function SummaryCards() {
  const { transactions, loading } = useFinanceStore();
  const { income, expenses, balance } = calculateTotals(transactions);
  const values = { balance, income, expenses };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-[180px] rounded-[20px] bg-slate-100 dark:bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cardDefs.map((card, i) => {
        const val = values[card.key];
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className="zenith-card p-6 relative group cursor-default"
          >
            <div
              className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
              style={{ background: card.gradient }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      background: `linear-gradient(135deg, ${card.gradient})`,
                      boxShadow: card.shadow,
                    }}
                  >
                    <card.icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </motion.div>
                  <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">
                    {card.title}
                  </p>
                </div>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${val >= 0 ? 'text-emerald-500' : 'text-rose-500'} bg-emerald-50 dark:bg-emerald-500/10`}
                >
                  {val >= 0
                    ? <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
                    : <ArrowDownRight className="w-4 h-4" strokeWidth={2.5} />
                  }
                </motion.div>
              </div>

              <div className="mb-2">
                <p className="text-[26px] md:text-[28px] font-bold tracking-tight tabular-nums text-slate-900 dark:text-white">
                  <AnimatedCounter value={val} />
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <Activity className="w-3 h-3" />
                <p className="text-[11px] font-medium tracking-wide uppercase">
                  {card.key === 'balance' ? 'Net Total' : card.key === 'income' ? 'Earned' : 'Spent'}
                </p>
              </div>
            </div>

            <div
              className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-[0.04] group-hover:opacity-[0.08] dark:opacity-[0.06] dark:group-hover:opacity-[0.1] transition-opacity duration-700"
              style={{ background: card.gradient }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
