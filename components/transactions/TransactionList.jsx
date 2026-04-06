'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit2, Trash2, Plus, Search, MoreHorizontal } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { getCategoryInfo } from '@/data/categories';

export default function TransactionList() {
  const { getPaginatedTransactions, getTotalPages, currentPage, setCurrentPage, sortConfig, setSortConfig, role, openModal, deleteTransaction, getFilteredTransactions } = useFinanceStore();
  const transactions = getPaginatedTransactions();
  const totalPages = getTotalPages();
  const totalFiltered = getFilteredTransactions().length;

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600" />;
    return sortConfig.direction === 'desc'
      ? <ArrowDown className="w-3 h-3 text-indigo-500" />
      : <ArrowUp className="w-3 h-3 text-indigo-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="zenith-card overflow-hidden"
    >
      {role === 'admin' && (
        <div className="px-6 py-4 border-b border-slate-100/60 dark:border-white/[0.04]">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(99,102,241,0.3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 2px 12px rgba(99,102,241,0.25)',
            }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} /> Add Transaction
          </motion.button>
        </div>
      )}

      <div className="hidden md:grid md:grid-cols-[110px_1fr_120px_120px_64px] items-center px-6 py-3 border-b border-slate-100/60 dark:border-white/[0.04]">
        <button onClick={() => setSortConfig('date')} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          Date <SortIcon col="date" />
        </button>
        <button className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] text-left">Description</button>
        <button onClick={() => setSortConfig('category')} className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          Category <SortIcon col="category" />
        </button>
        <button onClick={() => setSortConfig('amount')} className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          Amount <SortIcon col="amount" />
        </button>
        <div />
      </div>

      <div>
        <AnimatePresence mode="popLayout">
          {transactions.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
              </div>
              <p className="text-[14px] font-semibold text-slate-400 dark:text-slate-500">No transactions found</p>
              <p className="text-[12px] text-slate-300 dark:text-slate-600 mt-1">Try adjusting your filters</p>
            </motion.div>
          ) : (
            transactions.map((t, i) => {
              const cat = getCategoryInfo(t.category);
              const isIncome = t.type === 'income';
              return (
                <motion.div
                  key={t._id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                  transition={{ delay: Math.min(i * 0.02, 0.2), duration: 0.3 }}
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.015)' }}
                  className="group grid grid-cols-1 md:grid-cols-[110px_1fr_120px_120px_64px] items-center px-6 py-3.5 border-b border-slate-50/80 dark:border-white/[0.02] transition-colors duration-150"
                >
                  <div className="md:col-start-1 flex items-center gap-3 py-1 md:py-0">
                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{formatDate(t.date)}</p>
                  </div>

                  <div className="md:col-start-2 px-2 md:px-4 py-0.5 md:py-0 min-w-0">
                    <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 truncate">{t.description}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 md:hidden mt-0.5">{cat.label}</p>
                  </div>

                  <div className="hidden md:flex col-start-3 items-center justify-end py-0">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/[0.03]">{cat.label}</span>
                  </div>

                  <div className={`hidden md:flex col-start-4 items-center justify-end py-0 font-bold text-[13px] tabular-nums ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {isIncome ? '+' : '−'}{formatCurrency(t.amount)}
                  </div>

                  <div className="hidden md:flex col-start-5 items-center justify-end gap-0.5">
                    <AnimatePresence>
                      {role === 'admin' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => openModal(t)} className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" strokeWidth={2} />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => deleteTransaction(t._id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="md:hidden flex items-center justify-between px-2 -mt-1 pb-1">
                    <span className="text-[11px] text-slate-400 capitalize font-medium">{t.type}</span>
                    <span className={`text-[14px] font-bold tabular-nums ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isIncome ? '+' : '−'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100/60 dark:border-white/[0.04]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500 font-medium">{totalFiltered} transaction{totalFiltered !== 1 ? 's' : ''}</p>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-[12px] font-bold tabular-nums transition-all duration-200 ${
                  page === currentPage
                    ? 'text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
                style={page === currentPage ? {
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                } : {}}
              >
                {page}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
