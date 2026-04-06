'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useFinanceStore from '@/store/useFinanceStore';
import { filterByMonth, formatCurrency, formatShortCurrency } from '@/utils/helpers';

export default function BalanceTrendChart() {
  const { transactions, loading, darkMode: dark, selectedMonth } = useFinanceStore();
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 500, h: 280 });
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setDims({ w: e.contentRect.width, h: Math.max(260, e.contentRect.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const filtered = useMemo(() => filterByMonth(transactions, selectedMonth), [transactions, selectedMonth]);

  if (loading) return <div className="h-[340px] rounded-3xl bg-slate-100 dark:bg-white/[0.03] animate-pulse" />;

  const sorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));

  const dateMap = {};
  sorted.forEach(t => {
    if (!dateMap[t.date]) dateMap[t.date] = 0;
    dateMap[t.date] += t.type === 'income' ? t.amount : -t.amount;
  });

  const dates = Object.keys(dateMap).sort();
  const balanceData = [];
  let running = 0;
  dates.forEach(d => {
    running += dateMap[d];
    balanceData.push({ date: d, balance: running });
  });

  if (balanceData.length < 2) return null;

  const values = balanceData.map(d => d.balance);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;
  const zeroY = minVal < 0 ? Math.max(0, ((0 - minVal) / range)) : 0;

  const PAD_L = 8, PAD_R = 44, PAD_T = 12, PAD_B = 40;
  const W = dims.w - PAD_L - PAD_R;
  const H = dims.h - PAD_T - PAD_B;
  const n = balanceData.length;

  const xOf = (i) => PAD_L + (n > 1 ? (i / (n - 1)) * W : W / 2);
  const yOf = (v) => PAD_T + H - ((v - minVal) / range) * H;
  const baseY = PAD_T + H;

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

  const pts = balanceData.map((d, i) => ({ x: xOf(i), y: yOf(d.balance) }));
  const line = smoothPath(pts);
  const zeroLineY = yOf(0);

  const areaFill = `${line} L ${pts[n - 1].x} ${zeroLineY} L ${pts[0].x} ${zeroLineY} Z`;

  const hoverX = hovered !== null ? xOf(hovered) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="zenith-card p-6 md:p-8 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-2 h-2 rounded-full"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 0 8px rgba(139,92,246,0.4)' }} />
            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">Balance Trend</h3>
          </div>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 ml-[18px]">
            {selectedMonth ? `${selectedMonth} running balance` : 'Running balance over time'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold tabular-nums"
          style={{
            background: balanceData[balanceData.length - 1].balance >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
            color: balanceData[balanceData.length - 1].balance >= 0 ? '#10b981' : '#f43f5e',
            border: `1px solid ${balanceData[balanceData.length - 1].balance >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}`,
          }}>
          {formatCurrency(balanceData[balanceData.length - 1].balance)}
        </div>
      </div>

      <div className="flex-1 min-h-[220px] relative" ref={containerRef}>
        <svg viewBox={`0 0 ${dims.w} ${dims.h}`} className="w-full h-full" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="bt-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="bt-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.18} />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.06} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <filter id="bt-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
            </filter>
          </defs>

          {minVal < 0 && (
            <line x1={PAD_L} y1={zeroLineY} x2={dims.w - PAD_R} y2={zeroLineY}
              stroke={dark ? 'rgba(244,63,94,0.15)' : 'rgba(244,63,94,0.12)'}
              strokeWidth="1" strokeDasharray="3 4" />
          )}

          {hovered !== null && (
            <line x1={hoverX} y1={PAD_T} x2={hoverX} y2={baseY}
              stroke={dark ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.15)'}
              strokeWidth="1" strokeDasharray="3 4" />
          )}

          <motion.path d={areaFill} fill="url(#bt-fill)"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          <path d={line} fill="none" stroke="#8b5cf6"
            strokeWidth={8} strokeLinecap="round" opacity={0.12} filter="url(#bt-glow)" />

          <path d={line} fill="none" stroke="url(#bt-stroke)"
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {hovered !== null && (
            <>
              <circle cx={pts[hovered].x} cy={pts[hovered].y} r={7}
                fill="#8b5cf6" opacity={0.15}>
                <animate attributeName="r" values="5;12" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0" dur="1.2s" repeatCount="indefinite" />
              </circle>
              <circle cx={pts[hovered].x} cy={pts[hovered].y} r={5} fill="#8b5cf6" opacity={0.15} />
              <circle cx={pts[hovered].x} cy={pts[hovered].y} r={4} fill="white" stroke="#8b5cf6" strokeWidth={2.5} />
            </>
          )}

          <circle cx={pts[n - 1].x} cy={pts[n - 1].y} r={3.5} fill="#8b5cf6" opacity={0.8} />

          {balanceData.map((d, i) => {
            const showLabel = n <= 8 || i === 0 || i === n - 1 || i === Math.floor(n / 2);
            if (!showLabel) return null;
            const date = new Date(d.date + 'T00:00:00');
            const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const isHov = hovered === i;
            return (
              <g key={d.date + i}
                onClick={() => setHovered(isHov ? null : i)}
                style={{ cursor: 'pointer' }}>
                <rect x={xOf(i) - W / n / 2} y={PAD_T} width={W / n} height={H + 20} fill="transparent" />
                <text x={xOf(i)} y={baseY + 20} textAnchor="middle"
                  fill={isHov ? (dark ? '#e2e8f0' : '#0f172a') : (dark ? '#475569' : '#94a3b8')}
                  fontSize="9" fontWeight={isHov ? '700' : '500'}>
                  {label}
                </text>
              </g>
            );
          })}

          {[0, 0.5, 1].map((pct, i) => {
            const val = minVal + range * pct;
            return (
              <text key={`yl-${i}`} x={dims.w - PAD_R + 4} y={yOf(val) - 4} textAnchor="end"
                fill={dark ? '#334155' : '#cbd5e1'} fontSize="9" fontWeight="500">
                {formatShortCurrency(val)}
              </text>
            );
          })}
        </svg>

        {hovered !== null && balanceData[hovered] && (
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
            <div className="rounded-2xl px-4 py-3 min-w-[140px]"
              style={{
                background: dark ? 'rgba(10,15,30,0.94)' : 'rgba(255,255,255,0.96)',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                backdropFilter: 'blur(24px)',
                boxShadow: dark ? '0 20px 60px -12px rgba(0,0,0,0.5)' : '0 20px 60px -12px rgba(0,0,0,0.12)',
              }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5"
                style={{ color: dark ? '#64748b' : '#94a3b8' }}>
                {new Date(balanceData[hovered].date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p className={`text-[14px] font-bold tabular-nums ${balanceData[hovered].balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatCurrency(balanceData[hovered].balance)}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
