'use client';
import React, { useState } from 'react';
import { cn } from '../utils/cn';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  className?: string;
  emptyMessage?: string;
  dense?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  className,
  emptyMessage = 'nothing here yet',
  dense = false,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = (a as Record<string, unknown>)[sortKey];
    const bVal = (b as Record<string, unknown>)[sortKey];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('table', className)}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  col.sortable && 'cursor-pointer select-none hover:text-[var(--ink)]',
                  col.className,
                )}
                onClick={() => col.sortable && handleSort(col.key)}
                aria-sort={
                  sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                }
              >
                <span className="inline-flex items-baseline gap-1">
                  {col.label}
                  {col.sortable && (
                    <span aria-hidden="true" style={{ opacity: 0.6, fontSize: '0.5rem' }}>
                      {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem 0.6rem' }}>
                <span className="caption">{emptyMessage}</span>
              </td>
            </tr>
          ) : (
            sorted.map((item) => (
              <tr key={keyExtractor(item)} style={dense ? { fontSize: '0.72rem' } : undefined}>
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}