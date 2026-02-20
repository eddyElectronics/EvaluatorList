'use client';

import { useState, useMemo, useEffect } from 'react';
import { EvaluationRecord } from '@/lib/types';

interface EvaluatorTableProps {
  records: EvaluationRecord[];
  onEdit: (record: EvaluationRecord) => void;
}

type SortDirection = 'asc' | 'desc' | null;

const ITEMS_PER_PAGE = 50;

export default function EvaluatorTable({ records, onEdit }: EvaluatorTableProps) {
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when records change
  useEffect(() => { setCurrentPage(1); }, [records]);

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

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / ITEMS_PER_PAGE));
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

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
          {paginatedRecords.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                ไม่พบข้อมูล
              </td>
            </tr>
          ) : (
            paginatedRecords.map((record, index) => (
              <tr 
                key={record.id}
                className="transition-colors"
                style={{ 
                  borderBottom: '1px solid var(--table-border)',
                  background: index % 2 === 0 ? 'var(--table-row-alt)' : 'transparent'
                }}
              >
                <td className="text-center px-4 py-4" style={{ color: 'var(--text-muted)' }}>{startIndex + index + 1}</td>
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

      {/* Pagination */}
      {sortedRecords.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-4 py-4" style={{ borderTop: '1px solid var(--table-border)' }}>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            แสดง {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, sortedRecords.length)} จาก {sortedRecords.length} รายการ
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                if (totalPages <= 7) return true;
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .reduce<(number | string)[]>((acc, page, idx, arr) => {
                if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push('...');
                acc.push(page);
                return acc;
              }, [])
              .map((item, idx) =>
                typeof item === 'string' ? (
                  <span key={`dot-${idx}`} className="px-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                    style={
                      item === currentPage
                        ? { color: '#fff', background: 'var(--accent)' }
                        : { color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }
                    }
                  >
                    {item}
                  </button>
                )
              )}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
