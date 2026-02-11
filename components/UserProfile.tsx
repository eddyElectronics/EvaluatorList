'use client';

import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';

export default function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center space-x-4 bg-white px-6 py-4 shadow-sm rounded-lg">
      {user.photo ? (
        <Image
          src={user.photo}
          alt={user.displayName}
          width={48}
          height={48}
          className="rounded-full"
          unoptimized
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
          {user.displayName?.charAt(0) || '?'}
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{user.displayName || 'ไม่ระบุชื่อ'}</h3>
        <p className="text-sm text-gray-600">{user.jobTitle || 'ไม่ระบุตำแหน่ง'}</p>
        {user.employeeId ? (
          <p className="text-xs text-gray-500">รหัสพนักงาน: {user.employeeId}</p>
        ) : (
          <p className="text-xs text-orange-500">ไม่พบรหัสพนักงาน</p>
        )}
        {user.mail && (
          <p className="text-xs text-gray-400">{user.mail}</p>
        )}
      </div>
      <button
        onClick={logout}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        ออกจากระบบ
      </button>
    </div>
  );
}
