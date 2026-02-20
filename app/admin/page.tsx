'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import UserProfile from '@/components/UserProfile';
import AdminTable from '@/components/AdminTable';
import { EvaluationRecord } from '@/lib/types';
import Link from 'next/link';
import * as XLSX from 'xlsx';

interface AdminOption {
  EmplCode_Admin: string;
  FullnameTH_Admin: string;
}

export default function AdminPage() {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const [admins, setAdmins] = useState<AdminOption[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<string>('');
  const [records, setRecords] = useState<EvaluationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdmins();
    }
  }, [isAuthenticated]);

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const response = await fetch('/api/eva/get-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAdmins(data);
      } else if (data.data && Array.isArray(data.data)) {
        setAdmins(data.data);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const loadData = async (adminCode: string) => {
    if (!adminCode) return;

    setLoading(true);
    try {
      const response = await fetch('/api/eva/get-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EmplCode: adminCode,
        }),
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setRecords(data);
      } else if (data.data && Array.isArray(data.data)) {
        setRecords(data.data);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const adminCode = e.target.value;
    setSelectedAdmin(adminCode);
    if (adminCode) {
      loadData(adminCode);
    } else {
      setRecords([]);
    }
  };

  const exportToExcel = () => {
    if (records.length === 0) return;

    const exportData = records.map((record, index) => ({
      'ลำดับ': index + 1,
      'ผู้ถูกประเมิน': record.FullnameTHEmpl || '-',
      'หน่วยงาน': record.MainOrgOrgShort || '-',
      'ตำแหน่ง': record.MainPositionOrgShort || '-',
      'ผู้ประเมิน 1': record.FullnameTH1 || '-',
      'ผู้ประเมิน 2': record.FullnameTH2 || '-',
      'ผู้ประเมิน 3': record.FullnameTH3 || '-',
      'ผู้อนุมัติ': record.ApproverName || '-',
      'ตำแหน่งผู้อนุมัติ': record.ApproverPosition || '-',
      'ผู้บันทึก': record.EmplCode_AdminUpdateTH || '-',
      'เวลาบันทึก': record.UpdateDate ? new Date(record.UpdateDate).toLocaleString('th-TH') : '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'รายชื่อผู้ประเมิน');

    // Generate filename with date and admin code
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `ตรวจสอบข้อมูล_${selectedAdmin}_${date}.xlsx`);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, var(--page-bg-from), var(--page-bg-via), var(--page-bg-to))` }}>
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-12 h-12 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--spinner-border)', borderTopColor: 'var(--spinner-accent)' }}></div>
            <div className="absolute inset-0 w-12 h-12 rounded-full blur-xl" style={{ background: 'var(--spinner-glow)' }}></div>
          </div>
          <p className="mt-4" style={{ color: 'var(--text-muted)' }}>กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, var(--page-bg-from), var(--page-bg-via), var(--page-bg-to))` }}>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 'var(--grid-opacity)', backgroundImage: `url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(148%2C163%2C184%2C1)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20fill%3D%22url(%23grid)%22%20width%3D%22100%25%22%20height%3D%22100%25%22%2F%3E%3C%2Fsvg%3E')` }}></div>
        
        <div className="relative rounded-2xl backdrop-blur-xl p-8 text-center max-w-md" style={{ background: 'var(--login-card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--login-card-shadow)' }}>
          {/* Card gradient border effect */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            ตรวจสอบข้อมูล
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
            กรุณาเข้าสู่ระบบด้วย Azure Entra ID
          </p>
          <button
            onClick={login}
            className="group relative w-full px-6 py-3 font-medium rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute inset-0" style={{ background: 'var(--login-btn-bg)' }}></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'var(--login-btn-hover)' }}></div>
            <span className="relative flex items-center justify-center gap-3" style={{ color: 'var(--login-btn-text)' }}>
              <svg className="w-5 h-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
              Sign in with Microsoft
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, var(--page-bg-from), var(--page-bg-via), var(--page-bg-to))` }}>
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 'var(--grid-opacity)', backgroundImage: `url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(148%2C163%2C184%2C1)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20fill%3D%22url(%23grid)%22%20width%3D%22100%25%22%20height%3D%22100%25%22%2F%3E%3C%2Fsvg%3E')` }}></div>
      
      <div className="relative w-[90%] mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: 'var(--badge-bg)', border: '1px solid var(--badge-border)' }}>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">Admin Portal</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                ตรวจสอบข้อมูล
              </h1>
            </div>
            <Link
              href="/"
              className="group relative px-6 py-3 font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative">กลับหน้าหลัก</span>
            </Link>
          </div>
          <UserProfile />
        </div>

        {/* Admin Dropdown Card */}
        <div className="mb-6 p-6 rounded-xl backdrop-blur-sm" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
            เลือกรหัสธุรการ
          </label>
          <select
            value={selectedAdmin}
            onChange={handleAdminChange}
            disabled={loadingAdmins}
            className="w-full max-w-md px-4 py-3 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)', colorScheme: 'auto' }}
          >
            <option value="" style={{ background: 'var(--select-option-bg)', color: 'var(--select-option-text)' }}>-- เลือกรหัสธุรการ --</option>
            {admins.map((admin) => (
              <option key={admin.EmplCode_Admin} value={admin.EmplCode_Admin} style={{ background: 'var(--select-option-bg)', color: 'var(--select-option-text)' }}>
                {admin.EmplCode_Admin} - {admin.FullnameTH_Admin}
              </option>
            ))}
          </select>
          {loadingAdmins && (
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>กำลังโหลดรายการธุรการ...</p>
          )}
        </div>

        {/* Content Card */}
        <div className="rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          {/* Card gradient border effect */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>รายการผู้ประเมิน</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  ทั้งหมด {records.length} รายการ
                </span>
                <button
                  onClick={exportToExcel}
                  disabled={loading || records.length === 0}
                  className="group relative px-4 py-2 font-medium text-white rounded-lg overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative">Export Excel</span>
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="py-16 text-center">
                <div className="relative inline-block">
                  <div className="w-12 h-12 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--spinner-border)', borderTopColor: 'var(--spinner-accent)' }}></div>
                  <div className="absolute inset-0 w-12 h-12 rounded-full blur-xl" style={{ background: 'var(--spinner-glow)' }}></div>
                </div>
                <p className="mt-4" style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
              </div>
            ) : !selectedAdmin ? (
              <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                กรุณาเลือกรหัสธุรการเพื่อดูข้อมูล
              </div>
            ) : (
              <AdminTable records={records} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs" style={{ color: 'var(--text-footer)' }}>
          AOT Evaluator System
        </div>
      </div>
    </div>
  );
}
