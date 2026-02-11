'use client';

import { useState, useEffect } from 'react';
import { Employee, EvaluationRecord } from '@/lib/types';
import EmployeeAutocomplete from './EmployeeAutocomplete';

interface EditEvaluatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: EvaluationRecord;
  employees: Employee[];
  employeeId: string;
  onSave: () => void;
}

export default function EditEvaluatorModal({
  isOpen,
  onClose,
  record,
  employees,
  employeeId,
  onSave,
}: EditEvaluatorModalProps) {
  const [evaluator1, setEvaluator1] = useState('');
  const [evaluator2, setEvaluator2] = useState('');
  const [evaluator3, setEvaluator3] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && record) {
      setEvaluator1(record.EmplCode_Evaluator1 || '');
      setEvaluator2(record.EmplCode_Evaluator2 || '');
      setEvaluator3(record.EmplCode_Evaluator3 || '');
    }
  }, [isOpen, record]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        id: record.id,
        EmplCode_Evaluator1: evaluator1,
        EmplCode_Evaluator2: evaluator2,
        EmplCode_Evaluator3: evaluator3,
        EmplCode_AdminUpdate: employeeId,
      };
      
      console.log('Saving data:', payload);
      
      const response = await fetch('/api/eva/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Save response:', data);

      if (response.ok && data.success !== false) {
        alert('บันทึกข้อมูลสำเร็จ');
        onSave();
        onClose();
      } else {
        alert('เกิดข้อผิดพลาด: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">แก้ไขผู้ประเมิน</h2>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* ผู้ถูกประเมิน */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ผู้ถูกประเมิน
            </label>
            <input
              type="text"
              value={record.FullnameTHEmpl}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
          </div>

          {/* ผู้ประเมิน 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ผู้ประเมิน 1
            </label>
            <EmployeeAutocomplete
              value={evaluator1}
              onChange={setEvaluator1}
              employees={employees}
              placeholder="เลือกผู้ประเมิน 1"
            />
          </div>

          {/* ผู้ประเมิน 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ผู้ประเมิน 2
            </label>
            <EmployeeAutocomplete
              value={evaluator2}
              onChange={setEvaluator2}
              employees={employees}
              placeholder="เลือกผู้ประเมิน 2"
            />
          </div>

          {/* ผู้ประเมิน 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ผู้ประเมิน 3
            </label>
            <EmployeeAutocomplete
              value={evaluator3}
              onChange={setEvaluator3}
              employees={employees}
              placeholder="เลือกผู้ประเมิน 3"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            ปิด
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}
