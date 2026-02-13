'use client';

import { useState } from 'react';
import { Employee } from '@/lib/types';
import EmployeeAutocomplete from './EmployeeAutocomplete';

interface SendApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  employeeId: string;
  cctr: string;
  onSuccess: () => void;
  isLoadingEmployees?: boolean;
}

export default function SendApprovalModal({
  isOpen,
  onClose,
  employees,
  employeeId,
  cctr,
  onSuccess,
  isLoadingEmployees = false,
}: SendApprovalModalProps) {
  const [selectedApprover, setSelectedApprover] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!selectedApprover) {
      alert('กรุณาเลือกผู้อนุมัติ');
      return;
    }

    setIsSending(true);
    try {
      // Step 1: Call updateApproval API
      const updateResponse = await fetch('/api/eva/update-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Approver: selectedApprover,
          EmplCode_Admin: employeeId,
          CCTR: cctr,
          ApproveStatus: 0,
          ApproverName: '',
          ApproverPosition: '',
        }),
      });

      const updateData = await updateResponse.json();
      console.log('Update approval response:', JSON.stringify(updateData, null, 2));

      if (!updateResponse.ok) {
        throw new Error(updateData.message || 'Failed to update approval');
      }

      // Get linkCode from response - handle array response
      let linkCode: string | undefined;
      if (Array.isArray(updateData) && updateData.length > 0) {
        linkCode = updateData[0].linkCode || updateData[0].LinkCode;
      } else {
        linkCode = updateData.linkCode || updateData.LinkCode || updateData.data?.linkCode || updateData.data?.LinkCode;
      }
      
      if (!linkCode) {
        console.error('Response structure:', updateData);
        throw new Error('ไม่ได้รับ linkCode จากระบบ - กรุณาตรวจสอบ console log');
      }

      // Step 2: Construct approval link
      const baseUrl = window.location.origin;
      const approvalLink = `${baseUrl}/approval/${linkCode}`;

      // Step 3: Send message to approver
      const messageResponse = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: [selectedApprover],
          title: 'รายชื่อผู้ประเมิน',
          source: 'AOT',
          app_url: '',
          messages: [
            {
              type: 'text',
              text: `กรุณาอนุมัติรายชื่อผู้ประเมิน <a href='${approvalLink}'>คลิกที่นี่</a>`,
              originalContentUrl: null,
              previewImageUrl: null,
            },
          ],
        }),
      });

      const messageData = await messageResponse.json();
      console.log('Send message response:', messageData);

      if (!messageResponse.ok) {
        throw new Error(messageData.message || 'Failed to send message');
      }

      alert('ส่งอนุมัติเรียบร้อยแล้ว');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error sending approval:', error);
      alert('เกิดข้อผิดพลาด: ' + (error as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setSelectedApprover('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'var(--overlay-bg)' }}>
      <div className="rounded-lg shadow-xl w-full max-w-md mx-4 relative" style={{ background: 'var(--modal-bg)', border: '1px solid var(--modal-border)' }}>
        {/* Progress Overlay */}
        {isSending && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-lg" style={{ background: 'var(--modal-bg)', opacity: 0.9 }}>
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-3"></div>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>กำลังส่งอนุมัติ...</p>
          </div>
        )}

        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--modal-border)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--modal-header-text)' }}>ส่งอนุมัติ</h2>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--modal-label-text)' }}>
              เลือกผู้อนุมัติ <span className="text-red-500">*</span>
            </label>
            {isLoadingEmployees ? (
              <div className="flex items-center justify-center py-4 rounded-md" style={{ border: '1px solid var(--input-border)', background: 'var(--input-bg)' }}>
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>กำลังโหลดรายชื่อ...</span>
              </div>
            ) : (
              <EmployeeAutocomplete
                value={selectedApprover}
                onChange={setSelectedApprover}
                employees={employees}
                placeholder="ค้นหาและเลือกผู้อนุมัติ"
              />
            )}
          </div>

          {selectedApprover && (
            <div className="p-3 rounded-lg" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
              <p className="text-sm" style={{ color: 'var(--accent-text)' }}>
                รหัสผู้อนุมัติที่เลือก: <strong>{selectedApprover}</strong>
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid var(--modal-border)' }}>
          <button
            onClick={handleClose}
            disabled={isSending}
            className="px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            style={{ color: 'var(--text-primary)', background: 'var(--surface-alt)' }}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !selectedApprover}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? 'กำลังส่ง...' : 'ส่งอนุมัติ'}
          </button>
        </div>
      </div>
    </div>
  );
}
