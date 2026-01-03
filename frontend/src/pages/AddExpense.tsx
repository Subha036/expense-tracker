import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../api/axios';

const AddExpense: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }
    if (!category) {
      toast.error('Please select a category');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    setLoading(true);

    try {
      await api.post('/expenses/', {
        amount: parseFloat(amount),
        category,
        description: description.trim(),
        date: date.toISOString(),
      });

      toast.success('Expense added successfully!');
      navigate('/expenses');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Expense</h1>

      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              required
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select a category</option>
              <option value="Food">Food</option>
              <option value="Transportation">Transportation</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <DatePicker
              selected={date}
              onChange={(selectedDate: Date | null) => setDate(selectedDate)}
              className="input-field"
              dateFormat="yyyy-MM-dd"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;