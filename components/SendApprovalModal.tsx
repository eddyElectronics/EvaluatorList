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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative">
        {/* Progress Overlay */}
        {isSending && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-10 rounded-lg">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-3"></div>
            <p className="text-gray-700 font-medium">กำลังส่งอนุมัติ...</p>
          </div>
        )}

        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">ส่งอนุมัติ</h2>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เลือกผู้อนุมัติ <span className="text-red-500">*</span>
            </label>
            {isLoadingEmployees ? (
              <div className="flex items-center justify-center py-4 border border-gray-300 rounded-md bg-gray-50">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-gray-600 text-sm">กำลังโหลดรายชื่อ...</span>
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
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                รหัสผู้อนุมัติที่เลือก: <strong>{selectedApprover}</strong>
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isSending}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
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
