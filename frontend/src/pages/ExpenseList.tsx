import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Dialog } from '@headlessui/react';
import api from '../api/axios';

interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const ExpenseList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState<Date | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses/');
      setExpenses(response.data);
    } catch (error) {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedExpenses = () => {
    let filtered = expenses.filter(expense => {
      if (categoryFilter && expense.category !== categoryFilter) return false;
      if (dateFrom && new Date(expense.date) < dateFrom) return false;
      if (dateTo && new Date(expense.date) > dateTo) return false;
      return true;
    });

    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      if (sortBy === 'date') {
        aVal = new Date(a.date);
        bVal = new Date(b.date);
      } else if (sortBy === 'amount') {
        aVal = a.amount;
        bVal = b.amount;
      } else {
        aVal = a.category;
        bVal = b.category;
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const deleteExpense = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(expense => expense.id !== id));
      toast.success('Expense deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete expense');
    }
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setEditDescription(expense.description);
    setEditDate(new Date(expense.date));
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    // Validations
    if (!editAmount || parseFloat(editAmount) <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }
    if (!editCategory) {
      toast.error('Please select a category');
      return;
    }
    if (!editDescription.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!editDate) {
      toast.error('Please select a date');
      return;
    }

    setEditLoading(true);
    try {
      const response = await api.put(`/expenses/${editingExpense.id}`, {
        amount: parseFloat(editAmount),
        category: editCategory,
        description: editDescription.trim(),
        date: editDate.toISOString(),
      });
      setExpenses(expenses.map(exp => exp.id === editingExpense.id ? response.data : exp));
      toast.success('Expense updated successfully');
      setShowEditModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update expense');
    } finally {
      setEditLoading(false);
    }
  };

  const handleSort = (column: 'date' | 'amount' | 'category') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredExpenses = getFilteredAndSortedExpenses();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Expenses</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="Food">Food</option>
              <option value="Transportation">Transportation</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <DatePicker
              selected={dateFrom}
              onChange={(date: Date | null) => setDateFrom(date)}
              className="input-field"
              dateFormat="yyyy-MM-dd"
              isClearable
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <DatePicker
              selected={dateTo}
              onChange={(date: Date | null) => setDateTo(date)}
              className="input-field"
              dateFormat="yyyy-MM-dd"
              isClearable
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setCategoryFilter('');
                setDateFrom(null);
                setDateTo(null);
              }}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {filteredExpenses.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th
                    className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('date')}
                  >
                    Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
                  <th
                    className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('category')}
                  >
                    Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-right py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('amount')}
                  >
                    Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-900">{expense.description}</td>
                    <td className="py-3 px-4 text-gray-900">{expense.category}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center space-x-2">
                      <button
                        onClick={() => openEditModal(expense)}
                        className="text-primary-600 hover:text-primary-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <p className="text-gray-500 text-center py-8">
            {expenses.length === 0 ? 'No expenses found. Add your first expense!' : 'No expenses match the current filters.'}
          </p>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">Edit Expense</Dialog.Title>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="input-field"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="Food">Food</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <DatePicker
                  selected={editDate}
                  onChange={(date: Date | null) => setEditDate(date)}
                  className="input-field"
                  dateFormat="yyyy-MM-dd"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button type="submit" disabled={editLoading} className="btn-primary flex-1">
                  {editLoading ? 'Updating...' : 'Update'}
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default ExpenseList;