import React from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Expense Tracker</h1>
        </div>
        <div className="flex items-center space-x-4">
          <NotificationBell />
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
          <button
            onClick={logout}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;