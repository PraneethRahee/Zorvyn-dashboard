import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FALLBACK_TRANSACTIONS } from '@/data/categories';
import { sortTransactions, filterTransactions } from '@/utils/helpers';

const DEFAULT_WIDGET_LAYOUT = [
  'heroBalance',
  'quickStats',
  'cashFlow',
  'savingsRate',
  'balanceTrend',
  'recentActivity',
  'categoryRings',
  'healthScore',
];

const useFinanceStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      loading: true,
      activeTab: 'dashboard',
      role: 'admin',
      darkMode: true,
      sidebarOpen: true,
      mobileSidebarOpen: false,
      widgets: {
        heroBalance: true,
        quickStats: true,
        cashFlow: true,
        savingsRate: true,
        balanceTrend: true,
        recentActivity: true,
        categoryRings: true,
        healthScore: true,
      },
      widgetLayout: [...DEFAULT_WIDGET_LAYOUT],
      editMode: false,
      customizerOpen: false,
      selectedMonth: null,
      monthDetailOpen: false,
      monthDetailMonth: null,
      filters: { search: '', type: 'all', category: 'all', dateFrom: '', dateTo: '' },
      sortConfig: { key: 'date', direction: 'desc' },
      currentPage: 1,
      itemsPerPage: 8,
      modalOpen: false,
      editingTransaction: null,
      fetchTransactions: async () => {
        set({ loading: true });
        await new Promise(r => setTimeout(r, 300));
        set({ transactions: FALLBACK_TRANSACTIONS, loading: false });
      },

      fetchAndSeed: async () => {
        await get().fetchTransactions();
      },

      addTransaction: (transaction) => {
        const newTx = { ...transaction, _id: Date.now().toString() };
        set(state => ({ transactions: [newTx, ...state.transactions] }));
      },

      updateTransaction: (id, updates) => {
        set(state => ({
          transactions: state.transactions.map(t => (t._id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTransaction: (id) => {
        set(state => ({ transactions: state.transactions.filter(t => t._id !== id) }));
      },
      setRole: (role) => set({ role }),
      setActiveTab: (tab) => set({ activeTab: tab, currentPage: 1 }),
      setSelectedMonth: (month) => set({ selectedMonth: month }),
      openMonthDetail: (month) => set({ monthDetailOpen: true, monthDetailMonth: month }),
      closeMonthDetail: () => set({ monthDetailOpen: false, monthDetailMonth: null, selectedMonth: null }),
      toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      toggleWidget: (key) => set(s => ({ widgets: { ...s.widgets, [key]: !s.widgets[key] } })),
      setCustomizerOpen: (open) => set({ customizerOpen: open }),

      toggleEditMode: () => set(s => ({ editMode: !s.editMode, customizerOpen: s.editMode ? false : s.customizerOpen })),

      addWidget: (key) => set(s => {
        if (s.widgetLayout.includes(key)) return s;
        return {
          widgetLayout: [...s.widgetLayout, key],
          widgets: { ...s.widgets, [key]: true },
        };
      }),

      removeWidget: (key) => set(s => ({
        widgetLayout: s.widgetLayout.filter(k => k !== key),
        widgets: { ...s.widgets, [key]: false },
      })),

      reorderWidgets: (fromIndex, toIndex) => set(s => {
        const newLayout = [...s.widgetLayout];
        const [moved] = newLayout.splice(fromIndex, 1);
        newLayout.splice(toIndex, 0, moved);
        return { widgetLayout: newLayout };
      }),

      moveWidgetToEnd: (key) => set(s => {
        if (!s.widgetLayout.includes(key)) {
          return {
            widgetLayout: [...s.widgetLayout, key],
            widgets: { ...s.widgets, [key]: true },
          };
        }
        return s;
      }),

      resetLayout: () => set({
        widgetLayout: [...DEFAULT_WIDGET_LAYOUT],
        widgets: {
          heroBalance: true,
          quickStats: true,
          cashFlow: true,
          savingsRate: true,
          balanceTrend: true,
          recentActivity: true,
          categoryRings: true,
          healthScore: true,
        },
        editMode: false,
      }),

      setFilters: (filters) => set({ filters, currentPage: 1 }),
      resetFilters: () => set({
        filters: { search: '', type: 'all', category: 'all', dateFrom: '', dateTo: '' },
        currentPage: 1,
      }),

      setSortConfig: (key) => set(s => ({
        sortConfig: {
          key,
          direction: s.sortConfig.key === key && s.sortConfig.direction === 'desc' ? 'asc' : 'desc',
        },
      })),

      setCurrentPage: (page) => set({ currentPage: page }),

      openModal: (transaction = null) => set({ modalOpen: true, editingTransaction: transaction }),
      closeModal: () => set({ modalOpen: false, editingTransaction: null }),

      getFilteredTransactions: () => {
        const { transactions, filters, sortConfig } = get();
        return sortTransactions(filterTransactions(transactions, filters), sortConfig);
      },

      getPaginatedTransactions: () => {
        const filtered = get().getFilteredTransactions();
        const { currentPage, itemsPerPage } = get();
        return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
      },

      getTotalPages: () => {
        return Math.ceil(get().getFilteredTransactions().length / get().itemsPerPage);
      },
    }),
    {
      name: 'finance-dashboard-v2',
      partialize: (state) => ({
        role: state.role,
        darkMode: state.darkMode,
        sidebarOpen: state.sidebarOpen,
        widgets: state.widgets,
        widgetLayout: state.widgetLayout,
        editMode: state.editMode,
      }),
    }
  )
);

export default useFinanceStore;
