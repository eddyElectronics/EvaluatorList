'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import UserProfile from '@/components/UserProfile';
import EvaluatorTable from '@/components/EvaluatorTable';
import EditEvaluatorModal from '@/components/EditEvaluatorModal';
import SendApprovalModal from '@/components/SendApprovalModal';
import { Employee, EvaluationRecord } from '@/lib/types';

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
    setLoadingEmployees(true);
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();

      if (Array.isArray(data)) {
        setEmployees(data);
      } else if (data.data && Array.isArray(data.data)) {
        setEmployees(data.data);
      } else {
        console.error('Invalid employees data format');
        setEmployees([]);
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

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            กำหนดรายชื่อผู้ประเมิน
          </h1>
          <p className="text-gray-600 mb-6">
            กรุณาเข้าสู่ระบบด้วย Azure Entra ID
          </p>
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Sign in with Microsoft
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-[90%] mx-auto py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            กำหนดรายชื่อผู้ประเมิน
          </h1>
          <UserProfile />
        </div>

        {/* Warning and manual input if no employeeId */}
        {!user?.employeeId && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 mb-3">
              <strong>คำเตือน:</strong> ไม่พบรหัสพนักงาน (Employee ID) ในโปรไฟล์ของคุณ 
              กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มข้อมูล Employee ID ใน Azure AD
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="กรอกรหัสพนักงาน (เช่น 23512)"
                value={manualEmplCode}
                onChange={(e) => setManualEmplCode(e.target.value)}
                className="flex-1 max-w-xs px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button
                onClick={() => loadData(manualEmplCode)}
                disabled={!manualEmplCode || loading}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ค้นหา
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">รายการผู้ประเมิน</h2>
            <div className="flex gap-2">
              <button
                onClick={() => loadData()}
                disabled={loading || !effectiveEmplCode}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}
              </button>
              <button
                onClick={() => setIsSendApprovalModalOpen(true)}
                disabled={loading || records.length === 0 || !effectiveEmplCode}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ส่งอนุมัติ
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <EvaluatorTable records={records} onEdit={handleEdit} />
          )}
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
