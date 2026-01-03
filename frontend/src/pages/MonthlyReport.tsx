import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import CategoryChart from '../charts/CategoryChart';
import MonthlyChart from '../charts/MonthlyChart';
import Loader from '../components/Loader';

interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface MonthlyReportData {
  year: number;
  month: number;
  total_expenses: number;
  category_breakdown: Record<string, number>;
  daily_breakdown: Record<string, number>;
  expense_count: number;
  expenses: Expense[];
}

const MonthlyReport: React.FC = () => {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [year, month]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/monthly/${year}/${month}`);
      setReportData(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch monthly report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const rows = reportData.expenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      `"${exp.description}"`,
      exp.category,
      exp.amount.toFixed(2)
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-report-${year}-${String(month).padStart(2, '0')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully!');
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [selectedYear, selectedMonth] = e.target.value.split('-').map(Number);
    setYear(selectedYear);
    setMonth(selectedMonth);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Monthly Report</h1>
        {reportData && (
          <button onClick={exportToCSV} className="btn-primary">
            Export to CSV
          </button>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
          Select Month
        </label>
        <input
          type="month"
          id="month"
          value={`${year}-${String(month).padStart(2, '0')}`}
          onChange={handleMonthChange}
          className="input-field max-w-xs"
        />
      </div>

      {reportData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Expenses:</span>
                  <span className="font-semibold">${reportData.total_expenses.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Number of Expenses:</span>
                  <span className="font-semibold">{reportData.expense_count}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">By Category</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(reportData.category_breakdown).map(([category, amount]) => (
                  <div key={category} className="flex justify-between">
                    <span className="text-gray-600">{category}:</span>
                    <span className="font-semibold">${amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CategoryChart data={reportData.category_breakdown} />
            <MonthlyChart data={reportData.daily_breakdown} />
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Expense Details</h2>
            {reportData.expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.expenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-900">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-900">{expense.description}</td>
                        <td className="py-3 px-4 text-gray-900">{expense.category}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          ${expense.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No expenses for this month.</p>
            )}
          </div>
        </>
      ) : (
        <div className="card">
          <p className="text-gray-500 text-center py-8">No data available for the selected month.</p>
        </div>
      )}
    </div>
  );
};

export default MonthlyReport;