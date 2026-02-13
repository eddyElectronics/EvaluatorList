'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ApprovalTable from '@/components/ApprovalTable';
import { EvaluationRecord } from '@/lib/types';

interface ApproverInfo {
  FullnameTH?: string;
  MainPositionOrgShort?: string;
  ApproveStatus?: number;
  ApproveDate?: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export default function ApprovalPage() {
  const params = useParams();
  const linkCode = params.linkCode as string;
  
  const [records, setRecords] = useState<EvaluationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [approverInfo, setApproverInfo] = useState<ApproverInfo | null>(null);

  useEffect(() => {
    if (linkCode) {
      loadData();
      loadApproverInfo();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkCode]);

  const loadApproverInfo = async () => {
    try {
      const response = await fetch('/api/eva/get-approval-link-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkCode: linkCode,
        }),
      });

      const result = await response.json();
      console.log('Approver info response:', result);

      // API returns array, get first item
      if (Array.isArray(result) && result.length > 0) {
        setApproverInfo(result[0]);
      } else if (result && !Array.isArray(result) && result.success !== false) {
        setApproverInfo(result);
      }
    } catch (error) {
      console.error('Error loading approver info:', error);
    }
  };

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
        // Reload approver info to update status
        loadApproverInfo();
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
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, var(--page-bg-from), var(--page-bg-via), var(--page-bg-to))` }}>
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 'var(--grid-opacity)', backgroundImage: `url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(148%2C163%2C184%2C1)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20fill%3D%22url(%23grid)%22%20width%3D%22100%25%22%20height%3D%22100%25%22%2F%3E%3C%2Fsvg%3E')` }}></div>
      
      <div className="relative w-full px-4 sm:px-6 md:w-[95%] lg:w-[90%] xl:max-w-6xl mx-auto py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 md:mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: 'var(--badge-bg)', border: '1px solid var(--badge-border)' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }}></div>
            <span className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--accent)' }}>Approval Portal</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            รายการผู้ประเมิน
          </h1>
          {approverInfo && (
            <div className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{approverInfo.FullnameTH}</span>
              {approverInfo.MainPositionOrgShort && (
                <span className="ml-2" style={{ color: 'var(--text-muted)' }}>({approverInfo.MainPositionOrgShort})</span>
              )}
              {/* Status Badge */}
              {approverInfo.ApproveStatus === 1 && (
                <div className="mt-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-400 font-medium">อนุมัติแล้ว</span>
                    <span className="text-emerald-400/70 text-xs">({formatDate(approverInfo.ApproveDate)})</span>
                  </span>
                </div>
              )}
              {approverInfo.ApproveStatus === 2 && (
                <div className="mt-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30">
                    <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-rose-400 font-medium">ไม่อนุมัติ</span>
                    <span className="text-rose-400/70 text-xs">({formatDate(approverInfo.ApproveDate)})</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl backdrop-blur-sm" style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--error-bg)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--error-text)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p style={{ color: 'var(--error-text)' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-xl backdrop-blur-sm" style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--success-bg)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--success-text)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p style={{ color: 'var(--success-text)' }}>{success}</p>
            </div>
          </div>
        )}

        {/* Content Card */}
        <div className="rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          {/* Card gradient border effect */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          
          <div className="p-4 md:p-8">
            {loading ? (
              <div className="py-16 text-center">
                <div className="relative inline-block">
                  <div className="w-12 h-12 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--spinner-border)', borderTopColor: 'var(--spinner-accent)' }}></div>
                  <div className="absolute inset-0 w-12 h-12 rounded-full blur-xl" style={{ background: 'var(--spinner-glow)' }}></div>
                </div>
                <p className="mt-4" style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <>
                <ApprovalTable records={records} />

                {/* Approval Buttons */}
                {records.length > 0 && !success && approverInfo?.ApproveStatus === 0 && (
                  <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      onClick={() => handleApproval(1)}
                      disabled={submitting}
                      className="group relative w-full sm:w-auto px-8 py-4 font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.1)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20fill%3D%22url(%23grid)%22%20width%3D%22100%25%22%20height%3D%22100%25%22%2F%3E%3C%2Fsvg%3E')] opacity-50"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        {submitting ? 'กำลังดำเนินการ...' : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            อนุมัติ
                          </>
                        )}
                      </span>
                    </button>
                    <button
                      onClick={() => handleApproval(2)}
                      disabled={submitting}
                      className="group relative w-full sm:w-auto px-8 py-4 font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.1)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20fill%3D%22url(%23grid)%22%20width%3D%22100%25%22%20height%3D%22100%25%22%2F%3E%3C%2Fsvg%3E')] opacity-50"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        {submitting ? 'กำลังดำเนินการ...' : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            ไม่อนุมัติ
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                )}
              </>
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
