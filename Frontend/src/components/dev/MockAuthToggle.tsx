import React, { useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store';
import type { UserRole } from '@/types';

const MOCK_USERS: Record<UserRole | 'Public', any> = {
  Public: null,
  Student: {
    id: 'student-001',
    email: 'student@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'Student',
    createdAt: new Date().toISOString(),
  },
  Instructor: {
    id: 'instructor-001',
    email: 'instructor@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'Instructor',
    createdAt: new Date().toISOString(),
  },
  Admin: {
    id: 'admin-001',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'Admin',
    createdAt: new Date().toISOString(),
  },
};

export const MockAuthToggle: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentRole = user?.role || 'Public';

  const handleRoleSwitch = (role: UserRole | 'Public') => {
    if (role === 'Public') {
      setUser(null);
    } else {
      setUser(MOCK_USERS[role]);
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <span className="text-xs">
            {currentRole === 'Public' ? '👤 Public' : `${currentRole}`}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-48 rounded-lg border border-gray-200 bg-white shadow-xl">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Mock Auth (Dev Only)
              </p>

              {/* Role Options */}
              {(['Public', 'Student', 'Instructor', 'Admin'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                    currentRole === role
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {role === 'Public' ? '👤 Public (No Auth)' : `👤 ${role}`}
                </button>
              ))}

              <div className="my-2 border-t border-gray-200" />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>

              {/* Current User Info */}
              {user && (
                <div className="mt-2 border-t border-gray-200 pt-2">
                  <p className="px-3 text-xs text-gray-500">
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p className="px-3 text-xs text-gray-500">
                    <strong>ID:</strong> {user.id}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Badge */}
      <div className="mt-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-800 border border-yellow-200 max-w-xs">
        <p className="font-semibold mb-1">🔧 Dev Mode</p>
        <p>Use the button above to switch roles and test all pages without a backend.</p>
      </div>
    </div>
  );
};
