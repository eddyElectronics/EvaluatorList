'use client';

import { useState, useMemo } from 'react';
import { EvaluationRecord } from '@/lib/types';

interface ApprovalTableProps {
  records: EvaluationRecord[];
}

type SortDirection = 'asc' | 'desc' | null;

export default function ApprovalTable({ records }: ApprovalTableProps) {
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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

  const sortedRecords = useMemo(() => {
    if (!sortDirection) return records;
    
    return [...records].sort((a, b) => {
      const nameA = a.FullnameTHEmpl || '';
      const nameB = b.FullnameTHEmpl || '';
      
      if (sortDirection === 'asc') {
        return nameA.localeCompare(nameB, 'th');
      } else {
        return nameB.localeCompare(nameA, 'th');
      }
    });
  }, [records, sortDirection]);

  const handleSort = () => {
    if (sortDirection === null) {
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortDirection(null);
    }
  };

  const getSortIcon = () => {
    if (sortDirection === 'asc') {
      return '↑';
    } else if (sortDirection === 'desc') {
      return '↓';
    }
    return '↕';
  };

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-3 whitespace-nowrap text-center w-16">ลำดับ</th>
            <th 
              className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-200 select-none"
              onClick={handleSort}
            >
              <div className="flex items-center gap-1">
                ผู้ถูกประเมิน
                <span className="text-gray-400">{getSortIcon()}</span>
              </div>
            </th>
            <th className="px-4 py-3 whitespace-nowrap">หน่วยงาน</th>
            <th className="px-4 py-3 whitespace-nowrap">ตำแหน่ง</th>
            <th className="px-4 py-3 whitespace-nowrap">ผู้ประเมิน 1</th>
            <th className="px-4 py-3 whitespace-nowrap">ผู้ประเมิน 2</th>
            <th className="px-4 py-3 whitespace-nowrap">ผู้ประเมิน 3</th>
            <th className="px-4 py-3 whitespace-nowrap">ผู้บันทึก</th>
            <th className="px-4 py-3 whitespace-nowrap">เวลาบันทึก</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedRecords.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                ไม่พบข้อมูล
              </td>
            </tr>
          ) : (
            sortedRecords.map((record, index) => (
              <tr 
                key={record.id || index} 
                className={`hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-200'}`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-center text-gray-600">
                  {index + 1}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                  {record.FullnameTHEmpl}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {record.MainOrgOrgShort || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {record.MainPositionOrgShort || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {record.FullnameTH1 || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {record.FullnameTH2 || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {record.FullnameTH3 || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {record.EmplCode_AdminUpdateTH || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                  {formatDate(record.UpdateDate)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
