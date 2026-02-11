'use client';

import { useState, useMemo } from 'react';
import { EvaluationRecord } from '@/lib/types';

interface ApprovalTableProps {
  records: EvaluationRecord[];
  isSpotlightTheme?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export default function ApprovalTable({ records, isSpotlightTheme = false }: ApprovalTableProps) {
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
    <div className={`overflow-x-auto rounded-xl -mx-3 md:mx-0 ${isSpotlightTheme ? '' : 'border border-[var(--border-color)]'}`}>
      {/* Desktop Table */}
      <table className={`hidden md:table w-full ${isSpotlightTheme ? 'spotlight-table' : 'table-larkon'}`}>
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
              <td colSpan={8} className={`text-center py-8 ${isSpotlightTheme ? 'text-slate-500' : 'text-[var(--foreground-muted)]'}`}>
                ไม่พบข้อมูล
              </td>
            </tr>
          ) : (
            sortedRecords.map((record, index) => (
              <tr 
                key={record.id || index}
                className={isSpotlightTheme 
                  ? `border-b border-white/5 hover:bg-white/[0.04] transition-colors ${index % 2 === 0 ? 'bg-white/[0.01]' : 'bg-transparent'}` 
                  : ''
                }
              >
                <td className={`text-center ${isSpotlightTheme ? 'px-4 py-4 text-slate-400' : ''}`}>{index + 1}</td>
                <td className={isSpotlightTheme ? 'px-4 py-4 font-medium text-white' : 'font-medium'}>{record.FullnameTHEmpl}</td>
                <td className={isSpotlightTheme ? 'px-4 py-4 text-slate-300' : ''}>{record.MainOrgOrgShort || '-'}</td>
                <td className={isSpotlightTheme ? 'px-4 py-4 text-cyan-300 font-medium' : ''}>{record.FullnameTH1 || '-'}</td>
                <td className={isSpotlightTheme ? 'px-4 py-4 text-slate-300' : ''}>{record.FullnameTH2 || '-'}</td>
                <td className={isSpotlightTheme ? 'px-4 py-4 text-slate-500' : ''}>{record.FullnameTH3 || '-'}</td>
                <td className={isSpotlightTheme ? 'px-4 py-4 text-slate-300' : ''}>{record.EmplCode_AdminUpdateTH || '-'}</td>
                <td className={isSpotlightTheme ? 'px-4 py-4 text-slate-400 text-sm' : ''}>{formatDate(record.UpdateDate)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {sortedRecords.length === 0 ? (
          <div className={`text-center py-8 ${isSpotlightTheme ? 'text-slate-500' : 'text-[var(--foreground-muted)]'}`}>
            ไม่พบข้อมูล
          </div>
        ) : (
          <div className={`divide-y ${isSpotlightTheme ? 'divide-white/10' : 'divide-[var(--border-color)]'}`}>
            {sortedRecords.map((record, index) => (
              <div 
                key={record.id || index} 
                className={`p-4 ${isSpotlightTheme 
                  ? index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'
                  : index % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isSpotlightTheme 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                    : 'bg-[var(--primary-light)] text-[var(--primary)]'
                  }`}>
                    #{index + 1}
                  </span>
                </div>
                <div className={`font-semibold mb-3 ${isSpotlightTheme ? 'text-white text-lg' : 'text-[var(--foreground)]'}`}>
                  {record.FullnameTHEmpl}
                </div>
                <div className="text-sm">
                  <div>
                    <span className={`text-xs ${isSpotlightTheme ? 'text-slate-500' : 'text-[var(--foreground-muted)]'}`}>หน่วยงาน</span>
                    <div className={isSpotlightTheme ? 'text-slate-300 mt-0.5' : 'text-[var(--foreground)]'}>{record.MainOrgOrgShort || '-'}</div>
                  </div>
                </div>
                <div className={`mt-3 pt-3 ${isSpotlightTheme ? 'border-t border-white/10' : 'border-t border-[var(--border-color)]'}`}>
                  <div className={`text-xs mb-2 font-medium ${isSpotlightTheme ? 'text-slate-500' : 'text-[var(--foreground-muted)]'}`}>ผู้ประเมิน</div>
                  <div className="flex flex-wrap gap-2">
                    {record.FullnameTH1 && (
                      <span className={`px-2.5 py-1.5 rounded-lg text-xs ${isSpotlightTheme 
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 font-medium' 
                        : 'bg-[#e0f2fe] text-[#0369a1]'
                      }`}>
                        1. {record.FullnameTH1}
                      </span>
                    )}
                    {record.FullnameTH2 && (
                      <span className={`px-2.5 py-1.5 rounded-lg text-xs ${isSpotlightTheme 
                        ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' 
                        : 'bg-[#fef3c7] text-[#92400e]'
                      }`}>
                        2. {record.FullnameTH2}
                      </span>
                    )}
                    {record.FullnameTH3 && (
                      <span className={`px-2.5 py-1.5 rounded-lg text-xs ${isSpotlightTheme 
                        ? 'bg-slate-700/30 text-slate-500 border border-slate-600/20' 
                        : 'bg-[#f3e8ff] text-[#7c3aed]'
                      }`}>
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
