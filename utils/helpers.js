
import { format, parseISO, isToday, isYesterday, subDays } from 'date-fns';

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatShortCurrency(amount) {
  if (Math.abs(amount) >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return formatCurrency(amount);
}

export function formatDate(dateStr) {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  const now = new Date();
  if (isAfter(subDays(now, 7), date)) return format(date, 'EEE, MMM d');
  return format(date, 'MMM d, yyyy');
}

export function isAfter(dateA, dateB) {
  return dateA.getTime() > dateB.getTime();
}

export function calculateTotals(transactions) {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  return { income, expenses, balance: income - expenses };
}

export function getSpendingByCategory(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const map = {};
  expenses.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
  return Object.entries(map).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
}

const MONTH_NUM = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
const MONTH_ORDER = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

export function getMonthlyData(transactions) {
  const map = {};
  transactions.forEach(t => {
    const date = parseISO(t.date);
    const key = format(date, 'MMM yyyy');
    if (!map[key]) map[key] = { month: key, income: 0, expenses: 0 };
    map[key][t.type === 'income' ? 'income' : 'expenses'] += t.amount;
  });
  
  return Object.values(map).sort((a, b) => {
    const [am, ay] = a.month.split(' ');
    const [bm, by] = b.month.split(' ');
    return (parseInt(ay) * 12 + (MONTH_ORDER[am] || 0)) - (parseInt(by) * 12 + (MONTH_ORDER[bm] || 0));
  });
}

export function getTopSpendingCategory(transactions, categories) {
  const spending = getSpendingByCategory(transactions);
  if (!spending.length) return null;
  const top = spending[0];
  const cat = categories.find(c => c.id === top.category);
  const total = spending.reduce((s, i) => s + i.amount, 0);
  return {
    ...top,
    label: cat?.label || top.category,
    color: cat?.color || '#94a3b8',
    percentage: total > 0 ? ((top.amount / total) * 100).toFixed(1) : 0,
  };
}

export function generateInsights(transactions, categories) {
  const insights = [];
  const totals = calculateTotals(transactions);
  const monthly = getMonthlyData(transactions);
  const topCategory = getTopSpendingCategory(transactions, categories);

  if (topCategory) {
    insights.push({
      type: 'warning',
      title: 'Top Spending Category',
      description: `${topCategory.label} is your highest spending category at ${formatCurrency(topCategory.amount)}, accounting for ${topCategory.percentage}% of total expenses.`,
      icon: 'TrendingUp',
    });
  }

  if (monthly.length >= 2) {
    const curr = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    const diff = curr.expenses - prev.expenses;
    const pct = prev.expenses > 0 ? ((diff / prev.expenses) * 100).toFixed(1) : 0;
    if (diff > 0) {
      insights.push({
        type: 'warning',
        title: 'Spending Increased',
        description: `Your expenses went up by ${formatCurrency(Math.abs(diff))} (${Math.abs(pct)}%) compared to last month.`,
        icon: 'AlertTriangle',
      });
    } else if (diff < 0) {
      insights.push({
        type: 'success',
        title: 'Great Savings!',
        description: `You spent ${formatCurrency(Math.abs(diff))} (${Math.abs(pct)}%) less than last month.`,
        icon: 'ThumbsUp',
      });
    }
    const incDiff = curr.income - prev.income;
    if (incDiff > 0) {
      insights.push({
        type: 'success',
        title: 'Income Growth',
        description: `Your income increased by ${formatCurrency(incDiff)} compared to last month.`,
        icon: 'ArrowUpRight',
      });
    }
  }

  if (totals.income > 0) {
    const rate = ((totals.balance / totals.income) * 100).toFixed(1);
    insights.push({
      type: rate > 30 ? 'success' : 'info',
      title: 'Savings Rate',
      description: `Your overall savings rate is ${rate}%. ${rate > 30 ? 'Excellent work!' : 'Financial experts recommend saving at least 30%.'}`,
      icon: 'PiggyBank',
    });
  }

  const days = new Set(transactions.map(t => t.date)).size;
  const dailyAvg = totals.expenses / Math.max(days, 1);
  insights.push({
    type: 'info',
    title: 'Daily Average',
    description: `You spend an average of ${formatCurrency(dailyAvg)} per day, projecting to ${formatCurrency(dailyAvg * 30)} monthly.`,
    icon: 'Calendar',
  });

  return insights;
}

export function filterByMonth(transactions, selectedMonth) {
  if (!selectedMonth) return transactions;
  
  const parts = selectedMonth.split(' ');
  const monthNum = MONTH_NUM[parts[0]];
  const year = parts[1];
  if (!monthNum || !year) return transactions;
  const prefix = `${year}-${monthNum}`;
  return transactions.filter(t => t.date && t.date.startsWith(prefix));
}

export function sortTransactions(transactions, sortConfig) {
  return [...transactions].sort((a, b) => {
    let aVal, bVal;
    switch (sortConfig.key) {
      case 'date': aVal = a.date; bVal = b.date; break;
      case 'amount': aVal = a.amount; bVal = b.amount; break;
      case 'category': aVal = a.category; bVal = b.category; break;
      default: return 0;
    }
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function filterTransactions(transactions, filters) {
  return transactions.filter(t => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!t.description.toLowerCase().includes(s) && !t.category.toLowerCase().includes(s)) return false;
    }
    if (filters.type && filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.category && filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.dateFrom && t.date < filters.dateFrom) return false;
    if (filters.dateTo && t.date > filters.dateTo) return false;
    return true;
  });
}

export function exportToCSV(transactions) {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
  const rows = transactions.map(t => [
    t.date, t.description, t.category, t.type,
    t.type === 'income' ? t.amount.toFixed(2) : `-${t.amount.toFixed(2)}`,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(transactions) {
  const json = JSON.stringify(transactions, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
