'use client';

import { useState, useMemo } from 'react';
import { EvaluationRecord } from '@/lib/types';

interface AdminTableProps {
  records: EvaluationRecord[];
  isSpotlightTheme?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export default function AdminTable({ records, isSpotlightTheme = false }: AdminTableProps) {
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
    <div className={`overflow-x-auto rounded-xl ${isSpotlightTheme ? '' : 'border border-[var(--border-color)]'}`}>
      <table className={`w-full ${isSpotlightTheme ? '' : 'table-larkon'}`}>
        <thead>
          <tr className={isSpotlightTheme ? 'border-b border-white/10' : ''}>
            <th className={`text-center ${isSpotlightTheme ? 'px-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/[0.02]' : ''}`} style={{ width: '60px' }}>ลำดับ</th>
            <th 
              className={`cursor-pointer select-none ${isSpotlightTheme ? 'px-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/[0.02]' : ''}`}
              onClick={handleSort}
              style={{ minWidth: '150px' }}
            >
              <div className="flex items-center gap-2">
                ผู้ถูกประเมิน
                <span className={isSpotlightTheme ? 'text-cyan-400' : 'text-[var(--foreground-muted)]'}>{getSortIcon()}</span>
              </div>
            </th>
            <th className={isSpotlightTheme ? 'px-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/[0.02]' : ''}>หน่วยงาน</th>
            <th className={isSpotlightTheme ? 'px-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/[0.02]' : ''}>ตำแหน่ง</th>
            <th className={isSpotlightTheme ? 'px-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/[0.02]' : ''}>ผู้ประเมิน 1</th>
            <th className={isSpotlightTheme ? 'px-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/[0.02]' : ''}>ผู้ประเมิน 2</th>
            <th className={isSpotlightTheme ? 'px-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/[0.02]' : ''}>ผู้ประเมิน 3</th>
            <th className={isSpotlightTheme ? 'px-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/[0.02]' : ''}>ผู้บันทึก</th>
            <th className={isSpotlightTheme ? 'px-4 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/[0.02]' : ''}>เวลาบันทึก</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.length === 0 ? (
            <tr>
              <td colSpan={9} className={`text-center py-8 ${isSpotlightTheme ? 'text-slate-500' : 'text-[var(--foreground-muted)]'}`}>
                ไม่พบข้อมูล
              </td>
            </tr>
          ) : (
            sortedRecords.map((record, index) => (
              <tr 
                key={record.id}
                className={isSpotlightTheme 
                  ? `border-b border-white/5 hover:bg-white/[0.04] transition-colors ${index % 2 === 0 ? 'bg-white/[0.01]' : 'bg-transparent'}` 
                  : ''
                }
              >
                <td className={`text-center ${isSpotlightTheme ? 'px-4 py-4 text-slate-400' : ''}`}>
                  {index + 1}
                </td>
                <td className={isSpotlightTheme ? 'px-4 py-4 font-medium text-white' : 'font-medium'}>
                  {record.FullnameTHEmpl}
                </td>
                <td className={isSpotlightTheme ? 'px-4 py-4 text-slate-300' : ''}>
                  {record.MainOrgOrgShort || '-'}
                </td>
                <td className={isSpotlightTheme ? 'px-4 py-4 text-slate-300' : ''}>
                  {record.MainPositionOrgShort || '-'}
                </td>
                <td className={isSpotlightTheme ? 'px-4 py-4 text-cyan-300 font-medium' : ''}>
                  {record.FullnameTH1 || '-'}
                </td>
                <td className={isSpotlightTheme ? 'px-4 py-4 text-slate-300' : ''}>
                  {record.FullnameTH2 || '-'}
                </td>
                <td className={isSpotlightTheme ? 'px-4 py-4 text-slate-500' : ''}>
                  {record.FullnameTH3 || '-'}
                </td>
                <td className={isSpotlightTheme ? 'px-4 py-4 text-slate-300' : ''}>
                  {record.EmplCode_AdminUpdateTH || '-'}
                </td>
                <td className={isSpotlightTheme ? 'px-4 py-4 text-slate-400 text-sm' : ''}>
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
