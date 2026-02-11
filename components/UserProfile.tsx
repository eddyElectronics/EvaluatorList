'use client';

import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';

interface UserProfileProps {
  isSpotlightTheme?: boolean;
}

export default function UserProfile({ isSpotlightTheme = false }: UserProfileProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  if (isSpotlightTheme) {
    return (
      <div className="flex items-center space-x-4 px-6 py-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
        {user.photo ? (
          <Image
            src={user.photo}
            alt={user.displayName}
            width={48}
            height={48}
            className="rounded-full ring-2 ring-cyan-500/30"
            unoptimized
          />
        ) : (
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg bg-gradient-to-br from-cyan-500 to-cyan-600">
            {user.displayName?.charAt(0) || '?'}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-white">{user.displayName || 'ไม่ระบุชื่อ'}</h3>
          <p className="text-sm text-slate-400">{user.jobTitle || 'ไม่ระบุตำแหน่ง'}</p>
          {user.employeeId ? (
            <p className="text-xs text-slate-500">รหัสพนักงาน: {user.employeeId}</p>
          ) : (
            <p className="text-xs text-amber-400">ไม่พบรหัสพนักงาน</p>
          )}
          {user.mail && (
            <p className="text-xs text-slate-500">{user.mail}</p>
          )}
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-colors"
        >
          ออกจากระบบ
        </button>
      </div>
    );
  }

  return (
    <div className="card flex items-center space-x-4 px-6 py-4">
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
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg" style={{ background: 'var(--primary)' }}>
          {user.displayName?.charAt(0) || '?'}
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>{user.displayName || 'ไม่ระบุชื่อ'}</h3>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{user.jobTitle || 'ไม่ระบุตำแหน่ง'}</p>
        {user.employeeId ? (
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>รหัสพนักงาน: {user.employeeId}</p>
        ) : (
          <p className="text-xs" style={{ color: 'var(--warning)' }}>ไม่พบรหัสพนักงาน</p>
        )}
        {user.mail && (
          <p className="text-xs" style={{ color: 'var(--foreground-muted)', opacity: 0.7 }}>{user.mail}</p>
        )}
      </div>
      <button
        onClick={logout}
        className="btn"
        style={{ background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)' }}
      >
        ออกจากระบบ
      </button>
    </div>
  );
}
