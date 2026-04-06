'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import DraggableWidget from './DraggableWidget';
import WidgetSidebar from './WidgetSidebar';
import useFinanceStore from '@/store/useFinanceStore';

import HeroBalance from './HeroBalance';
import QuickStats from './QuickStats';
import CashFlowChart from './CashFlowChart';
import SavingsRateGauge from './SavingsRateGauge';
import BalanceTrendChart from './BalanceTrendChart';
import RecentActivity from './RecentActivity';
import CategoryRings from './CategoryRings';
import HealthScore from './HealthScore';

const WIDGET_COMPONENTS = {
  heroBalance: { Component: HeroBalance, fullWidth: true },
  quickStats: { Component: QuickStats, fullWidth: true },
  cashFlow: { Component: CashFlowChart, fullWidth: false },
  savingsRate: { Component: SavingsRateGauge, fullWidth: false },
  balanceTrend: { Component: BalanceTrendChart, fullWidth: false },
  recentActivity: { Component: RecentActivity, fullWidth: false },
  categoryRings: { Component: CategoryRings, fullWidth: false },
  healthScore: { Component: HealthScore, fullWidth: false },
};

const WIDGET_GRID = {
  heroBalance: 'col-span-full',
  quickStats: 'col-span-full',
  cashFlow: 'lg:col-span-7',
  savingsRate: 'lg:col-span-5',
  balanceTrend: 'lg:col-span-7',
  recentActivity: 'lg:col-span-5',
  categoryRings: 'lg:col-span-7',
  healthScore: 'lg:col-span-5',
};

const WIDGET_LABELS = {
  heroBalance: 'Hero Balance',
  quickStats: 'Quick Stats',
  cashFlow: 'Cash Flow Chart',
  savingsRate: 'Savings Rate',
  balanceTrend: 'Balance Trend',
  recentActivity: 'Recent Activity',
  categoryRings: 'Category Rings',
  healthScore: 'Health Score',
};

export default function DashboardGrid() {
  const { widgetLayout, editMode, reorderWidgets, moveWidgetToEnd, addWidget } = useFinanceStore();
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeKey = active.id;
    const overKey = over.id;

    if (!widgetLayout.includes(activeKey) && widgetLayout.includes(overKey)) {
      const overIndex = widgetLayout.indexOf(overKey);
      const newLayout = [...widgetLayout];
      newLayout.splice(overIndex, 0, activeKey);
      useFinanceStore.setState({ widgetLayout: newLayout, widgets: { ...useFinanceStore.getState().widgets, [activeKey]: true } });
      return;
    }

    if (!widgetLayout.includes(activeKey)) {
      addWidget(activeKey);
      return;
    }

    if (activeKey !== overKey) {
      const oldIndex = widgetLayout.indexOf(activeKey);
      const newIndex = widgetLayout.indexOf(overKey);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderWidgets(oldIndex, newIndex);
      }
    }
  }, [widgetLayout, reorderWidgets, addWidget]);

  const activeWidget = activeId ? WIDGET_COMPONENTS[activeId] : null;
  const ActiveComponent = activeWidget?.Component;

  return (
    <div className="relative">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence>
          {editMode && <WidgetSidebar />}
        </AnimatePresence>

        <div className={`transition-all duration-300 ${editMode ? 'lg:mr-[300px] xl:mr-[320px]' : ''}`}>
          {editMode && widgetLayout.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[400px] rounded-3xl border-2 border-dashed transition-colors"
              style={{
                borderColor: 'rgba(99,102,241,0.25)',
                background: 'rgba(99,102,241,0.03)',
              }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-400">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M12 8v8" />
                  <path d="M8 12h8" />
                </svg>
              </div>
              <p className="text-[15px] font-bold text-slate-500 dark:text-slate-400">No widgets on dashboard</p>
              <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">Drag widgets from the sidebar to get started</p>
            </motion.div>
          )}

          <SortableContext items={widgetLayout} strategy={verticalListSortingStrategy}>
            <div className="space-y-5">
              {widgetLayout.map((key, index) => {
                const widgetConfig = WIDGET_COMPONENTS[key];
                if (!widgetConfig) return null;
                const { Component } = widgetConfig;
                const gridClass = WIDGET_GRID[key] || 'col-span-full';

                return (
                  <DraggableWidget key={key} id={key} isFullWidth={widgetConfig.fullWidth}>
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12, height: 0, marginBottom: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.06,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {widgetConfig.fullWidth ? (
                        <Component />
                      ) : (
                        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-5`}>
                          <WidgetGridPair key={key} widgetKey={key} layout={widgetLayout} Component={Component} gridClass={gridClass} index={index} />
                        </div>
                      )}
                    </motion.div>
                  </DraggableWidget>
                );
              })}
            </div>
          </SortableContext>
        </div>

        <DragOverlay adjustScale={false}>
          {activeId && ActiveComponent ? (
            <div
              className="rounded-2xl opacity-90 pointer-events-none"
              style={{
                transform: 'scale(1.02)',
                boxShadow: '0 24px 64px -12px rgba(99,102,241,0.35), 0 0 0 2px rgba(99,102,241,0.2)',
              }}
            >
              <div className="w-[360px] h-[200px] rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(99,102,241,0.15)',
                }}
              >
                <div className="text-center">
                  <p className="text-[13px] font-bold text-indigo-500 dark:text-indigo-400">
                    {WIDGET_LABELS[activeId] || activeId.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Drop to reposition</p>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function WidgetGridPair({ widgetKey, layout, Component, gridClass, index }) {
  const pairWidgets = getPairForRow(widgetKey, layout);

  if (!pairWidgets.isPrimary) {
    return null;
  }

  return (
    <>
      <div className={gridClass}>
        <Component />
      </div>
      {pairWidgets.secondaryKey && (
        <div className={WIDGET_GRID[pairWidgets.secondaryKey] || 'lg:col-span-5'}>
          {(() => {
            const sec = WIDGET_COMPONENTS[pairWidgets.secondaryKey];
            return sec ? <sec.Component /> : null;
          })()}
        </div>
      )}
    </>
  );
}

function getPairForRow(widgetKey, layout) {
  const halfWidthWidgets = layout.filter(k => !WIDGET_COMPONENTS[k]?.fullWidth && WIDGET_COMPONENTS[k]);
  const halfWidthIndex = halfWidthWidgets.indexOf(widgetKey);

  if (halfWidthIndex === -1 || WIDGET_COMPONENTS[widgetKey]?.fullWidth) {
    return { isPrimary: true, secondaryKey: null };
  }

  const isFirstInPair = halfWidthIndex % 2 === 0;
  if (isFirstInPair) {
    const secondaryKey = halfWidthWidgets[halfWidthIndex + 1] || null;
    return { isPrimary: true, secondaryKey };
  } else {
    return { isPrimary: false, secondaryKey: null };
  }
}
