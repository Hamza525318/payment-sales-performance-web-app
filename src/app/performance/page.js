'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { getSalesPerformance, getMonthlyPerformance } from '@/services/salesService';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = {
  Addison: '#FF6384',
  'Norton Alkon': '#36A2EB',
  Bosch: '#FFCE56',
  Yuri: '#4BC0C0',
  'Surie Mirrex': '#9966FF',
  Hikoki: '#FF9F40'
};

export default function PerformancePage() {
  const date = new Date();
  const [selectedDate, setSelectedDate] = useState(
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  );
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedDate]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const [dailyData, monthlyData] = await Promise.all([
        getSalesPerformance(selectedDate),
        getMonthlyPerformance(selectedDate)
      ]);
      setPerformance(dailyData);
      setMonthlyEarnings(monthlyData);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const clearFilter = () => {
    const today = new Date();
    setSelectedDate(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    );
  };

  const chartData = performance ? {
    labels: Object.keys(performance.productSales),
    datasets: [
      {
        data: Object.values(performance.productSales).map(product => product.quantity),
        backgroundColor: Object.keys(performance.productSales).map(key => CHART_COLORS[key]),
        borderColor: Object.keys(performance.productSales).map(key => CHART_COLORS[key]),
        borderWidth: 1,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const dataset = context.dataset;
            const total = dataset.data.reduce((acc, current) => acc + current, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} units (${percentage}%)`;
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Navigation and Date Filter */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedDate !== date.toISOString().split('T')[0] && (
              <button
                onClick={clearFilter}
                className="text-gray-600 hover:text-gray-800 p-2"
                title="Reset to today"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>

      {performance && performance.totalEarnings > 0 ? (
        <div className="max-w-6xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-600 mb-2">Daily Sales Earnings</h3>
              <p className="text-3xl font-bold text-gray-900">₹{performance.totalEarnings.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-600 mb-2">Monthly Sales Earnings</h3>
              <p className="text-3xl font-bold text-gray-900">₹{monthlyEarnings.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long'
                })}
              </p>
            </div>
          </div>

          {/* Product Sales Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-600 mb-6">Product Sales Distribution</h3>
            <div className="max-w-lg mx-auto">
              <Pie data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto mt-10">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Sales Data Found</h3>
            <p className="text-gray-600">
              There are no sales recorded for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
