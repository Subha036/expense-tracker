import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, PlusIcon, ListBulletIcon, ChartBarIcon, BellIcon, UserIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/add-expense', label: 'Add Expense', icon: PlusIcon },
    { path: '/expenses', label: 'Expenses', icon: ListBulletIcon },
    { path: '/reports', label: 'Reports', icon: ChartBarIcon },
    { path: '/notifications', label: 'Notifications', icon: BellIcon },
    { path: '/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-16 bg-primary-600">
          <h2 className="text-white text-lg font-semibold">Menu</h2>
        </div>
        <nav className="mt-8">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;