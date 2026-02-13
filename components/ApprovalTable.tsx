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
    if (sortDirection === 'asc') return '↑';
    if (sortDirection === 'desc') return '↓';
    return '↕';
  };

  return (
    <div className="overflow-x-auto rounded-xl -mx-3 md:mx-0">
      {/* Desktop Table */}
      <table className="hidden md:table w-full">
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
            <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--table-header-bg)' }}>ผู้ประเมิน 1</th>
            <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--table-header-bg)' }}>ผู้ประเมิน 2</th>
            <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--table-header-bg)' }}>ผู้ประเมิน 3</th>
            <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--table-header-bg)' }}>ผู้บันทึก</th>
            <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--table-header-bg)' }}>เวลาบันทึก</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                ไม่พบข้อมูล
              </td>
            </tr>
          ) : (
            sortedRecords.map((record, index) => (
              <tr 
                key={record.id || index}
                className="transition-colors"
                style={{ 
                  borderBottom: '1px solid var(--table-border)',
                  background: index % 2 === 0 ? 'var(--table-row-alt)' : 'transparent'
                }}
              >
                <td className="text-center px-4 py-4" style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                <td className="px-4 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>{record.FullnameTHEmpl}</td>
                <td className="px-4 py-4" style={{ color: 'var(--table-text)' }}>{record.MainOrgOrgShort || '-'}</td>
                <td className="px-4 py-4 font-medium" style={{ color: 'var(--table-text-accent)' }}>{record.FullnameTH1 || '-'}</td>
                <td className="px-4 py-4" style={{ color: 'var(--table-text)' }}>{record.FullnameTH2 || '-'}</td>
                <td className="px-4 py-4" style={{ color: 'var(--text-muted)' }}>{record.FullnameTH3 || '-'}</td>
                <td className="px-4 py-4" style={{ color: 'var(--table-text)' }}>{record.EmplCode_AdminUpdateTH || '-'}</td>
                <td className="px-4 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(record.UpdateDate)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {sortedRecords.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            ไม่พบข้อมูล
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--table-border)' }}>
            {sortedRecords.map((record, index) => (
              <div 
                key={record.id || index} 
                className="p-4"
                style={{ background: index % 2 === 0 ? 'var(--table-row-alt)' : 'transparent' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
                    #{index + 1}
                  </span>
                </div>
                <div className="font-semibold mb-3 text-lg" style={{ color: 'var(--text-primary)' }}>
                  {record.FullnameTHEmpl}
                </div>
                <div className="text-sm">
                  <div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>หน่วยงาน</span>
                    <div className="mt-0.5" style={{ color: 'var(--table-text)' }}>{record.MainOrgOrgShort || '-'}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--table-border)' }}>
                  <div className="text-xs mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>ผู้ประเมิน</div>
                  <div className="flex flex-wrap gap-2">
                    {record.FullnameTH1 && (
                      <span className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'var(--accent-bg)', color: 'var(--table-text-accent)', border: '1px solid var(--accent-border)' }}>
                        1. {record.FullnameTH1}
                      </span>
                    )}
                    {record.FullnameTH2 && (
                      <span className="px-2.5 py-1.5 rounded-lg text-xs"
                        style={{ background: 'var(--surface-alt)', color: 'var(--table-text)', border: '1px solid var(--table-border)' }}>
                        2. {record.FullnameTH2}
                      </span>
                    )}
                    {record.FullnameTH3 && (
                      <span className="px-2.5 py-1.5 rounded-lg text-xs"
                        style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--table-border)' }}>
                        3. {record.FullnameTH3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
