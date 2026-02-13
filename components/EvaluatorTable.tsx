'use client';

import { useState, useMemo } from 'react';
import { EvaluationRecord } from '@/lib/types';

interface EvaluatorTableProps {
  records: EvaluationRecord[];
  onEdit: (record: EvaluationRecord) => void;
}

type SortDirection = 'asc' | 'desc' | null;

export default function EvaluatorTable({ records, onEdit }: EvaluatorTableProps) {
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
    if (sortDirection === 'asc') return '↑';
    if (sortDirection === 'desc') return '↓';
    return '↕';
  };

  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--table-border)' }}>
            <th className="text-center px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ width: '60px', color: 'var(--text-muted)', background: 'var(--table-header-bg)' }}>ลำดับ</th>
            <th 
              className="cursor-pointer select-none px-4 py-4 text-xs font-semibold uppercase tracking-wider"
              onClick={handleSort}
              style={{ minWidth: '150px', color: 'var(--text-muted)', background: 'var(--table-header-bg)' }}
            >
              <div className="flex items-center gap-2">
                ผู้ถูกประเมิน
                <span style={{ color: 'var(--accent)' }}>{getSortIcon()}</span>
              </div>
            </th>
            <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--table-header-bg)' }}>หน่วยงาน</th>
            <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--table-header-bg)' }}>ตำแหน่ง</th>
            <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--table-header-bg)' }}>ผู้ประเมิน 1</th>
            <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--table-header-bg)' }}>ผู้ประเมิน 2</th>
            <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--table-header-bg)' }}>ผู้ประเมิน 3</th>
            <th className="text-center px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--table-header-bg)' }}>จัดการ</th>
            <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--table-header-bg)' }}>ผู้บันทึก</th>
            <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--table-header-bg)' }}>เวลาบันทึก</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                ไม่พบข้อมูล
              </td>
            </tr>
          ) : (
            sortedRecords.map((record, index) => (
              <tr 
                key={record.id}
                className="transition-colors"
                style={{ 
                  borderBottom: '1px solid var(--table-border)',
                  background: index % 2 === 0 ? 'var(--table-row-alt)' : 'transparent'
                }}
              >
                <td className="text-center px-4 py-4" style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                <td className="px-4 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>{record.FullnameTHEmpl}</td>
                <td className="px-4 py-4" style={{ color: 'var(--table-text)' }}>{record.MainOrgOrgShort || '-'}</td>
                <td className="px-4 py-4" style={{ color: 'var(--table-text)' }}>{record.MainPositionOrgShort || '-'}</td>
                <td className="px-4 py-4 font-medium" style={{ color: 'var(--table-text-accent)' }}>{record.FullnameTH1 || '-'}</td>
                <td className="px-4 py-4" style={{ color: 'var(--table-text)' }}>{record.FullnameTH2 || '-'}</td>
                <td className="px-4 py-4" style={{ color: 'var(--text-muted)' }}>{record.FullnameTH3 || '-'}</td>
                <td className="text-center">
                  <button
                    onClick={() => onEdit(record)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                    style={{ color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
                  >
                    แก้ไข
                  </button>
                </td>
                <td className="px-4 py-4" style={{ color: 'var(--table-text)' }}>{record.EmplCode_AdminUpdateTH || '-'}</td>
                <td className="px-4 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(record.UpdateDate)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
