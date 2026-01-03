import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const Dashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await api.get('/expenses/');
        setExpenses(response.data);
        const total = response.data.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
        setTotalExpenses(total);
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
        toast.error('Failed to load expenses');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const recentExpenses = expenses.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const monthlyBudget = user?.monthly_budget || 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-gray-900">Total Expenses</h3>
          <p className="text-3xl font-bold text-primary-600">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Budget</h3>
          <p className="text-3xl font-bold text-success-600">${monthlyBudget.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-gray-900">Remaining Budget</h3>
          <p className={`text-3xl font-bold ${monthlyBudget - totalExpenses >= 0 ? 'text-success-600' : 'text-error-600'}`}>
            ${(monthlyBudget - totalExpenses).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Expenses</h2>
        {recentExpenses.length > 0 ? (
          <ul className="space-y-3">
            {recentExpenses.map((expense) => (
              <li key={expense.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{expense.description}</p>
                  <p className="text-sm text-gray-500">{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <p className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No expenses yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;