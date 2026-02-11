'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ApprovalTable from '@/components/ApprovalTable';
import { EvaluationRecord } from '@/lib/types';

export default function ApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const linkCode = params.linkCode as string;
  
  const [records, setRecords] = useState<EvaluationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (linkCode) {
      loadData();
    }
  }, [linkCode]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/eva/get-data-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkCode: linkCode,
        }),
      });

      const result = await response.json();
      console.log('Approval data response:', result);

      if (Array.isArray(result)) {
        setRecords(result);
      } else if (result.data && Array.isArray(result.data)) {
        setRecords(result.data);
      } else if (result.success === false) {
        setError(result.message || 'ไม่สามารถโหลดข้อมูลได้');
        setRecords([]);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error('Error loading approval data:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (result: 1 | 2) => {
    const actionText = result === 1 ? 'อนุมัติ' : 'ไม่อนุมัติ';
    
    if (!confirm(`คุณต้องการ${actionText}รายการนี้หรือไม่?`)) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/eva/send-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ApproveLinkCode: linkCode,
          Result: result,
        }),
      });

      const data = await response.json();
      console.log('Approval response:', data);

      if (response.ok && data.success !== false) {
        setSuccess(`${actionText}เรียบร้อยแล้ว`);
        // Optionally reload data or redirect
      } else {
        setError(data.message || `เกิดข้อผิดพลาดในการ${actionText}`);
      }
    } catch (error) {
      console.error('Error sending approval:', error);
      setError('เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-[90%] mx-auto py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            รายการผู้ประเมิน (สำหรับอนุมัติ)
          </h1>
          <p className="text-gray-600">
            รหัสอนุมัติ: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{linkCode}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <>
              <ApprovalTable records={records} />

              {/* Approval Buttons */}
              {records.length > 0 && !success && (
                <div className="mt-6 flex justify-center gap-4">
                  <button
                    onClick={() => handleApproval(1)}
                    disabled={submitting}
                    className="px-8 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
                  </button>
                  <button
                    onClick={() => handleApproval(2)}
                    disabled={submitting}
                    className="px-8 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'กำลังดำเนินการ...' : 'ไม่อนุมัติ'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
