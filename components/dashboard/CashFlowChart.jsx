'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';
import { filterByMonth, getMonthlyData, formatCurrency, formatShortCurrency } from '@/utils/helpers';

function AnimatedCounter({ value, duration = 1.4 }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const diff = value - from;
    if (diff === 0) return;
    const t0 = performance.now();
    let raf;
    const step = (now) => {
      const p = Math.min((now - t0) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(from + diff * ease);
      if (p < 1) raf = requestAnimationFrame(step);
      else prev.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{formatCurrency(display)}</>;
}

function ChartTooltip({ data, dark }) {
  const income = data.income;
  const expenses = data.expenses;
  const net = income - expenses;
  return (
    <div
      className="rounded-2xl px-5 py-4 min-w-[210px]"
      style={{
        background: dark ? 'rgba(10,15,30,0.94)' : 'rgba(255,255,255,0.96)',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
        backdropFilter: 'blur(24px)',
        boxShadow: dark
          ? '0 20px 60px -12px rgba(0,0,0,0.5)'
          : '0 20px 60px -12px rgba(0,0,0,0.12)',
      }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3"
        style={{ color: dark ? '#64748b' : '#94a3b8' }}
      >
        {data.month}
      </p>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2.5">
            <div
              className="w-[7px] h-[7px] rounded-full"
              style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)', boxShadow: '0 0 6px rgba(16,185,129,0.4)' }}
            />
            <span className="text-[12px]" style={{ color: dark ? '#94a3b8' : '#64748b' }}>Income</span>
          </div>
          <span className="text-[13px] font-bold text-emerald-500 tabular-nums">{formatCurrency(income)}</span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2.5">
            <div
              className="w-[7px] h-[7px] rounded-full"
              style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899)', boxShadow: '0 0 6px rgba(244,63,94,0.4)' }}
            />
            <span className="text-[12px]" style={{ color: dark ? '#94a3b8' : '#64748b' }}>Expenses</span>
          </div>
          <span className="text-[13px] font-bold text-rose-500 tabular-nums">{formatCurrency(expenses)}</span>
        </div>
        <div
          className="border-t pt-2.5 mt-1"
          style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center justify-between gap-8">
            <span className="text-[11px] font-semibold" style={{ color: dark ? '#94a3b8' : '#64748b' }}>Net Savings</span>
            <span className={`text-[13px] font-bold tabular-nums ${net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {net >= 0 ? '+' : ''}{formatCurrency(net)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowChart({ data, dark, hovered, onHover }) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 700, h: 320 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setDims({ w: e.contentRect.width, h: Math.max(280, e.contentRect.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const PAD_L = 8, PAD_R = 40, PAD_T = 12, PAD_B = 44;
  const W = dims.w - PAD_L - PAD_R;
  const H = dims.h - PAD_T - PAD_B;
  const n = data.length;

  const allVals = data.flatMap((d) => [d.income, d.expenses]);
  const maxVal = Math.max(...allVals, 1);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const xOf = (i) => PAD_L + (n > 1 ? (i / (n - 1)) * W : W / 2);
  const yOf = (v) => PAD_T + H - ((v - minVal) / range) * H;
  const baseY = PAD_T + H;

  const incomePts = data.map((d, i) => ({ x: xOf(i), y: yOf(d.income) }));
  const expensePts = data.map((d, i) => ({ x: xOf(i), y: yOf(d.expenses) }));

  function smoothPath(pts) {
    if (pts.length < 2) return `M ${pts[0]?.x ?? 0} ${pts[0]?.y ?? 0}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - ((pts[Math.min(i + 2, pts.length - 1)].x - p1.x) * tension);
      const cp2y = p2.y - ((pts[Math.min(i + 2, pts.length - 1)].y - p1.y) * tension);
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  function smoothArea(pts) {
    if (pts.length < 2) return '';
    const curve = smoothPath(pts);
    return `${curve} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;
  }

  const incomeLine = smoothPath(incomePts);
  const expenseLine = smoothPath(expensePts);
  const incomeFill = smoothArea(incomePts);
  const expenseFill = smoothArea(expensePts);

  const gridSteps = 4;
  const gridLines = [];
  for (let i = 0; i <= gridSteps; i++) {
    const val = minVal + (range * i) / gridSteps;
    gridLines.push({ y: yOf(val), val });
  }

  const hoverX = hovered !== null ? xOf(hovered) : 0;

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg viewBox={`0 0 ${dims.w} ${dims.h}`} className="w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="cf-inc-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="cf-exp-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="cf-inc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.22} />
            <stop offset="50%" stopColor="#10b981" stopOpacity={0.07} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cf-exp-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.18} />
            <stop offset="50%" stopColor="#f43f5e" stopOpacity={0.05} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
          <filter id="cf-glow-g" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
          <filter id="cf-glow-r" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
        </defs>

        {gridLines.map((g, i) => (
          <line
            key={i}
            x1={PAD_L} y1={g.y} x2={dims.w - PAD_R} y2={g.y}
            stroke={dark ? 'rgba(51,65,85,0.12)' : 'rgba(148,163,184,0.07)'}
            strokeWidth="1"
            strokeDasharray={i === gridSteps ? 'none' : '2 6'}
          />
        ))}

        {hovered !== null && (
          <line
            x1={hoverX} y1={PAD_T} x2={hoverX} y2={baseY}
            stroke={dark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)'}
            strokeWidth="1" strokeDasharray="3 4"
          />
        )}

        <motion.path d={expenseFill} fill="url(#cf-exp-fill)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <motion.path d={incomeFill} fill="url(#cf-inc-fill)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />

        <path d={expenseLine} fill="none" stroke="#f43f5e"
          strokeWidth={8} strokeLinecap="round" opacity={0.12} filter="url(#cf-glow-r)" />
        <path d={incomeLine} fill="none" stroke="#10b981"
          strokeWidth={8} strokeLinecap="round" opacity={0.12} filter="url(#cf-glow-g)" />

        <path d={expenseLine} fill="none" stroke="url(#cf-exp-stroke)"
          strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={incomeLine} fill="none" stroke="url(#cf-inc-stroke)"
          strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {hovered !== null && (
          <>
            <circle cx={incomePts[hovered].x} cy={incomePts[hovered].y} r={7}
              fill="#10b981" opacity={0.15}>
              <animate attributeName="r" values="5;12" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx={incomePts[hovered].x} cy={incomePts[hovered].y} r={5}
              fill="#10b981" opacity={0.15} />
            <circle cx={incomePts[hovered].x} cy={incomePts[hovered].y} r={4}
              fill="white" stroke="#10b981" strokeWidth={2.5} />

            <circle cx={expensePts[hovered].x} cy={expensePts[hovered].y} r={7}
              fill="#f43f5e" opacity={0.15}>
              <animate attributeName="r" values="5;12" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx={expensePts[hovered].x} cy={expensePts[hovered].y} r={5}
              fill="#f43f5e" opacity={0.15} />
            <circle cx={expensePts[hovered].x} cy={expensePts[hovered].y} r={4}
              fill="white" stroke="#f43f5e" strokeWidth={2.5} />

            <line x1={incomePts[hovered].x} y1={incomePts[hovered].y}
              x2={expensePts[hovered].x} y2={expensePts[hovered].y}
              stroke={dark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)'}
              strokeWidth="1.5" strokeDasharray="3 3" />
          </>
        )}

        {n > 0 && (
          <>
            <circle cx={incomePts[n - 1].x} cy={incomePts[n - 1].y} r={3.5} fill="#10b981" opacity={0.8} />
            <circle cx={expensePts[n - 1].x} cy={expensePts[n - 1].y} r={3.5} fill="#f43f5e" opacity={0.8} />
          </>
        )}

        {data.map((d, i) => {
          const isHov = hovered === i;
          const x = xOf(i);
          return (
            <g key={d.month} onClick={() => onHover(isHov ? null : i)} style={{ cursor: 'pointer' }}>
              <rect x={x - W / n / 2} y={PAD_T} width={W / n} height={H + 20} fill="transparent" />
              <text
                x={x} y={baseY + 24} textAnchor="middle"
                fill={isHov ? (dark ? '#e2e8f0' : '#0f172a') : (dark ? '#475569' : '#94a3b8')}
                fontSize="11" fontWeight={isHov ? '700' : '500'}
                style={{ transition: 'fill 0.15s ease' }}
              >
                {d.month.startsWith('Day')
                  ? (Number(d.month.replace('Day ', '')) % 5 === 0 || Number(d.month.replace('Day ', '')) === 1
                    ? d.month.replace('Day ', '') : '')
                  : d.month.split(' ')[0]}
              </text>
              <line x1={x} y1={baseY} x2={x} y2={baseY + 5}
                stroke={isHov ? '#6366f1' : (dark ? 'rgba(71,85,105,0.3)' : 'rgba(148,163,184,0.2)')}
                strokeWidth="1.5" strokeLinecap="round"
                style={{ transition: 'stroke 0.15s ease' }}
              />
            </g>
          );
        })}

        {gridLines.map((g, i) => (
          <text key={`yl-${i}`} x={dims.w - PAD_R + 4} y={g.y - 6} textAnchor="end"
            fill={dark ? '#334155' : '#cbd5e1'} fontSize="10" fontWeight="500"
          >
            {formatShortCurrency(g.val)}
          </text>
        ))}
      </svg>

      {hovered !== null && data[hovered] && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute pointer-events-none z-30"
          style={{
            left: `${(hoverX / dims.w) * 100}%`,
            top: '0px',
            transform: 'translateX(-50%)',
          }}
        >
          <ChartTooltip data={data[hovered]} dark={dark} />
        </motion.div>
      )}
    </div>
  );
}

export default function CashFlowChart() {
  const { transactions, loading, darkMode: dark, selectedMonth } = useFinanceStore();
  const [hovered, setHovered] = useState(null);

  const filtered = useMemo(() => filterByMonth(transactions, selectedMonth), [transactions, selectedMonth]);

  const data = useMemo(() => {
    if (selectedMonth) {
      const dayMap = {};
      filtered.forEach(t => {
        const day = parseInt(t.date.split('-')[2], 10);
        if (isNaN(day)) return;
        if (!dayMap[day]) dayMap[day] = { month: `Day ${day}`, income: 0, expenses: 0 };
        dayMap[day][t.type === 'income' ? 'income' : 'expenses'] += t.amount;
      });
      return Object.entries(dayMap)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, v]) => v);
    }
    return getMonthlyData(filtered);
  }, [filtered, selectedMonth]);

  if (loading) return <div className="h-[340px] rounded-3xl bg-slate-100 dark:bg-white/[0.03] animate-pulse" />;
  if (data.length === 0) return null;

  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpenses = data.reduce((s, d) => s + d.expenses, 0);
  const netFlow = totalIncome - totalExpenses;

  const latest = data[data.length - 1];
  const prev = data.length >= 2 ? data[data.length - 2] : null;
  const incomeChange = prev ? ((latest.income - prev.income) / Math.max(prev.income, 1)) * 100 : 0;
  const expenseChange = prev ? ((latest.expenses - prev.expenses) / Math.max(prev.expenses, 1)) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="zenith-card p-6 md:p-8 h-full flex flex-col"
    >
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-2 h-2 rounded-full"
              style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)', boxShadow: '0 0 8px rgba(16,185,129,0.4)' }} />
            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">Cash Flow</h3>
          </div>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 ml-[18px]">
            {selectedMonth ? `Daily cash flow in ${selectedMonth}` : 'Monthly income vs expenses trend'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {prev && (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                style={{
                  background: incomeChange >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
                  color: incomeChange >= 0 ? '#10b981' : '#f43f5e',
                  border: `1px solid ${incomeChange >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}`,
                }}>
                {incomeChange >= 0 ? <TrendingUp className="w-3 h-3" strokeWidth={2.5} /> : <TrendingDown className="w-3 h-3" strokeWidth={2.5} />}
                {Math.abs(incomeChange).toFixed(0)}%
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                style={{
                  background: expenseChange <= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
                  color: expenseChange <= 0 ? '#10b981' : '#f43f5e',
                  border: `1px solid ${expenseChange <= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}`,
                }}>
                {expenseChange <= 0 ? <TrendingDown className="w-3 h-3" strokeWidth={2.5} /> : <TrendingUp className="w-3 h-3" strokeWidth={2.5} />}
                {Math.abs(expenseChange).toFixed(0)}%
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-5 mb-5 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }} />
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Income</span>
          <span className="text-[14px] font-bold text-emerald-500 tabular-nums"><AnimatedCounter value={totalIncome} /></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899)' }} />
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Expenses</span>
          <span className="text-[14px] font-bold text-rose-500 tabular-nums"><AnimatedCounter value={totalExpenses} /></span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg"
          style={{ background: netFlow >= 0 ? 'rgba(16,185,129,0.06)' : 'rgba(244,63,94,0.06)' }}>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Net</span>
          <span className={`text-[14px] font-bold tabular-nums ${netFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {netFlow >= 0 ? '+' : '-'}<AnimatedCounter value={Math.abs(netFlow)} />
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[260px] relative">
        <FlowChart data={data} dark={dark} hovered={hovered} onHover={setHovered} />
      </div>

      <div className="flex items-center justify-between mt-4 pt-3"
        style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
        <div className="flex items-center gap-6 text-[11px] font-medium">
          <div className="flex items-center gap-2">
            <div className="w-6 h-[3px] rounded-full"
              style={{ background: 'linear-gradient(90deg,#10b981,#06b6d4)', boxShadow: '0 0 6px rgba(16,185,129,0.3)' }} />
            <span className="text-slate-400 dark:text-slate-500">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-[3px] rounded-full"
              style={{ background: 'linear-gradient(90deg,#f43f5e,#ec4899)', boxShadow: '0 0 6px rgba(244,63,94,0.3)' }} />
            <span className="text-slate-400 dark:text-slate-500">Expenses</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-300 dark:text-slate-600 font-medium">
          {selectedMonth ? 'Showing daily breakdown' : 'Click a month bubble to see daily flow'}
        </p>
      </div>
    </motion.div>
  );
}
