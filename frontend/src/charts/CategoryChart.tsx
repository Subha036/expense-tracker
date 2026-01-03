import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryData {
  [key: string]: number;
}

interface CategoryChartProps {
  data: CategoryData;
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  const categories = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels: categories,
    datasets: [
      {
        data: values,
        backgroundColor: [
          '#3B82F6', // primary-500
          '#10B981', // success-500
          '#F59E0B', // warning-500
          '#EF4444', // danger-500
          '#8B5CF6', // purple-500
          '#06B6D4', // cyan-500
          '#84CC16', // lime-500
          '#F97316', // orange-500
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
      <div className="h-80">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default CategoryChart;