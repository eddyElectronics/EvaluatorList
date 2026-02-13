'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import UserProfile from '@/components/UserProfile';
import EvaluatorTable from '@/components/EvaluatorTable';
import EditEvaluatorModal from '@/components/EditEvaluatorModal';
import SendApprovalModal from '@/components/SendApprovalModal';
import { Employee, EvaluationRecord } from '@/lib/types';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function Home() {
  const { isAuthenticated, user, login, isLoading: authLoading } = useAuth();
  const [records, setRecords] = useState<EvaluationRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EvaluationRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSendApprovalModalOpen, setIsSendApprovalModalOpen] = useState(false);
  const [manualEmplCode, setManualEmplCode] = useState('');

  // Get CCTR from first record
  const cctr = records.length > 0 ? records[0].CCTR || '' : '';

  // Get effective employee ID (from user profile or manual input)
  const effectiveEmplCode = user?.employeeId || manualEmplCode;

  useEffect(() => {
    if (isAuthenticated) {
      loadEmployees();
      if (user?.employeeId) {
        loadData(user.employeeId);
      }
    }
  }, [isAuthenticated, user?.employeeId]);

  const loadData = async (emplCode?: string) => {
    const codeToUse = emplCode || effectiveEmplCode;
    if (!codeToUse) return;

    setLoading(true);
    try {
      const response = await fetch('/api/eva/get-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EmplCode: codeToUse,
        }),
      });

      const result = await response.json();

      if (Array.isArray(result)) {
        setRecords(result);
      } else if (result.success && result.data) {
        setRecords(result.data);
      } else if (result.data) {
        setRecords(Array.isArray(result.data) ? result.data : []);
      } else {
        console.error('Failed to load data:', result.message);
        setRecords([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    // Check localStorage first
    const CACHE_KEY = 'employeesCache';
    const CACHE_EXPIRY_KEY = 'employeesCacheExpiry';
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      
      if (cachedData && cacheExpiry && Date.now() < parseInt(cacheExpiry)) {
        // Use cached data
        const employees = JSON.parse(cachedData);
        setEmployees(employees);
        return;
      }
    } catch (error) {
      console.log('Error reading from localStorage:', error);
    }

    // Fetch from API if no cache or cache expired
    setLoadingEmployees(true);
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();

      let employeeList: Employee[] = [];
      if (Array.isArray(data)) {
        employeeList = data;
      } else if (data.data && Array.isArray(data.data)) {
        employeeList = data.data;
      }

      setEmployees(employeeList);

      // Save to localStorage
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(employeeList));
        localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
      } catch (error) {
        console.log('Error saving to localStorage:', error);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleEdit = (record: EvaluationRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    loadData(); // Reload data after save
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
      'ผู้บันทึก': record.EmplCode_AdminUpdateTH || '-',
      'เวลาบันทึก': record.UpdateDate ? new Date(record.UpdateDate).toLocaleString('th-TH') : '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'รายชื่อผู้ประเมิน');

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `รายชื่อผู้ประเมิน_${date}.xlsx`);
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
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-gradient-to-br from-cyan-500 to-cyan-600">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            กำหนดรายชื่อผู้ประเมิน
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
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }}></div>
                <span className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--accent)' }}>Evaluator System</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                กำหนดรายชื่อผู้ประเมิน
              </h1>
            </div>
            {['494198', '483778', '483750', '545570', '484074'].includes(user?.employeeId || '') && (
              <Link
                href="/admin"
                className="group relative px-6 py-3 font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative">ตรวจสอบข้อมูล</span>
              </Link>
            )}
          </div>
          <UserProfile />
        </div>

        {/* Warning and manual input if no employeeId */}
        {!user?.employeeId && (
          <div className="mb-6 p-4 rounded-xl backdrop-blur-sm" style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }}>
            <p className="mb-3" style={{ color: 'var(--warning-text)' }}>
              <strong>คำเตือน:</strong> ไม่พบรหัสพนักงาน (Employee ID) ในโปรไฟล์ของคุณ 
              กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มข้อมูล Employee ID ใน Azure AD
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="กรอกรหัสพนักงาน (เช่น 23512)"
                value={manualEmplCode}
                onChange={(e) => setManualEmplCode(e.target.value)}
                className="flex-1 max-w-xs px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
              />
              <button
                onClick={() => loadData(manualEmplCode)}
                disabled={!manualEmplCode || loading}
                className="group relative px-6 py-2.5 font-medium text-white rounded-lg overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600"></div>
                <span className="relative">ค้นหา</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Card */}
        <div className="rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          {/* Card gradient border effect */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>รายการผู้ประเมิน</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => loadData()}
                  disabled={loading || !effectiveEmplCode}
                  className="group relative px-4 py-2 font-medium text-white rounded-lg overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-cyan-600"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative">{loading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}</span>
                </button>
                <button
                  onClick={() => setIsSendApprovalModalOpen(true)}
                  disabled={loading || records.length === 0 || !effectiveEmplCode}
                  className="group relative px-4 py-2 font-medium text-white rounded-lg overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative">ส่งอนุมัติ</span>
                </button>
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
            ) : (
              <EvaluatorTable records={records} onEdit={handleEdit} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs" style={{ color: 'var(--text-footer)' }}>
          AOT Evaluator System
        </div>
      </div>

      {/* Edit Modal */}
      {selectedRecord && (
        <EditEvaluatorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          record={selectedRecord}
          employees={employees}
          employeeId={effectiveEmplCode}
          onSave={handleSave}
        />
      )}

      {/* Send Approval Modal */}
      <SendApprovalModal
        isOpen={isSendApprovalModalOpen}
        onClose={() => setIsSendApprovalModalOpen(false)}
        employees={employees}
        employeeId={effectiveEmplCode}
        cctr={cctr}
        onSuccess={() => loadData()}
        isLoadingEmployees={loadingEmployees}
      />
    </div>
  );
}
