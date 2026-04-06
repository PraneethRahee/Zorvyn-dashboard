'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import useFinanceStore from '@/store/useFinanceStore';
import { CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/data/categories';

const emptyForm = { description: '', amount: '', type: 'expense', category: 'food', date: new Date().toISOString().split('T')[0] };

export default function TransactionModal() {
  const { modalOpen, closeModal, editingTransaction, addTransaction, updateTransaction } = useFinanceStore();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const prevModalOpen = useRef(false);

  useEffect(() => {
    if (modalOpen && !prevModalOpen.current) {
      if (editingTransaction) {
        setForm({
          description: editingTransaction.description,
          amount: String(editingTransaction.amount),
          type: editingTransaction.type,
          category: editingTransaction.category,
          date: editingTransaction.date,
        });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
    }
    prevModalOpen.current = modalOpen;
  }, [editingTransaction, modalOpen]);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const validate = () => {
    const errs = {};
    if (!form.description.trim()) errs.description = 'Required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!form.date) errs.date = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = { description: form.description.trim(), amount: parseFloat(form.amount), type: form.type, category: form.category, date: form.date };
    if (editingTransaction) await updateTransaction(editingTransaction._id, data);
    else await addTransaction(data);
    closeModal();
  };

  const fieldCls = (hasError) => `w-full px-4 py-3 rounded-xl text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 bg-black/[0.02] dark:bg-white/[0.04] border ${hasError ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200/50 dark:border-white/[0.08] focus:ring-indigo-500/20 focus:border-indigo-500/30'} focus:outline-none focus:ring-2 transition-all duration-200`;

  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] rounded-[24px] overflow-hidden relative"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.15), 0 0 0 1px rgba(226,232,240,0.3)',
            }}
          >
            <div className="absolute top-0 inset-x-0 h-[2px]" style={{
              background: editingTransaction
                ? 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)'
                : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            }} />

            <div className="dark-modal-content">
              <div className="flex items-center justify-between px-7 pt-7 pb-4">
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight">
                    {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
                  </h3>
                  <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">{editingTransaction ? 'Update the details' : 'Fill in the details'}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="px-7 pb-7 pt-2 space-y-5">
                <div className="flex gap-1 p-1 bg-slate-100/80 dark:bg-white/[0.04] rounded-xl">
                  {['income', 'expense'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, type, category: type === 'income' ? 'salary' : 'food' })}
                      className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-300 capitalize ${
                        form.type === type
                          ? 'text-white shadow-lg'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                      style={form.type === type ? {
                        background: type === 'income'
                          ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                          : 'linear-gradient(135deg, #f43f5e, #ec4899)',
                        boxShadow: type === 'income'
                          ? '0 4px 14px rgba(16,185,129,0.3)'
                          : '0 4px 14px rgba(244,63,94,0.3)',
                      } : {}}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-[0.15em]">Description</label>
                    <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Grocery shopping" className={fieldCls(errors.description)} />
                    {errors.description && <p className="text-[11px] text-rose-500 mt-1 ml-0.5 font-medium">{errors.description}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-[0.15em]">Amount ($)</label>
                    <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className={fieldCls(errors.amount)} />
                    {errors.amount && <p className="text-[11px] text-rose-500 mt-1 ml-0.5 font-medium">{errors.amount}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-[0.15em]">Date</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={fieldCls(errors.date)} />
                    {errors.date && <p className="text-[11px] text-rose-500 mt-1 ml-0.5 font-medium">{errors.date}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-[0.15em]">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`${fieldCls(false)} cursor-pointer`}>
                      {categories.map(id => { const cat = CATEGORIES.find(c => c.id === id); return <option key={id} value={id}>{cat?.label || id}</option>; })}
                    </select>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01, boxShadow: '0 6px 24px rgba(99,102,241,0.35)' }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-[14px] font-bold text-white transition-all duration-300 mt-1"
                  style={editingTransaction
                    ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 16px rgba(99,102,241,0.25)' }
                    : { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 16px rgba(99,102,241,0.25)' }
                  }
                >
                  {editingTransaction ? 'Update Transaction' : 'Create Transaction'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
