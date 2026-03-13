// src/components/admin/accounts/DataTable.tsx
'use client';

import React, { useState, useMemo } from 'react';

export interface ColumnDef<T> {
    header: string;
    accessorKey: keyof T | string;
    cell?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    searchPlaceholder?: string;
    searchableKeys?: (keyof T)[];
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    searchPlaceholder = 'Cari data...',
    searchableKeys = [],
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof T | string; direction: 'asc' | 'desc' } | null>(null);

    // Protected Variation: Logika filter dan sort diisolasi di dalam memori komponen
    const processedData = useMemo(() => {
        let result = [...data];

        // 1. Filtering
        if (searchTerm && searchableKeys.length > 0) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter((item) =>
                searchableKeys.some((key) => {
                    const val = item[key];
                    return val ? String(val).toLowerCase().includes(lowerSearch) : false;
                })
            );
        }

        // 2. Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                // Handle nested accessor (e.g., 'mentor.name') if needed, for now simple accessor
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, searchTerm, sortConfig, searchableKeys]);

    const handleSort = (accessorKey: keyof T | string) => {
        setSortConfig((prev) => {
            if (prev && prev.key === accessorKey) {
                return { key: accessorKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key: accessorKey, direction: 'asc' };
        });
    };

    return (
        <div className="flex flex-col space-y-4">
            {searchableKeys.length > 0 && (
                <div className="flex justify-between items-center">
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            )}

            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    onClick={() => col.sortable && handleSort(col.accessorKey)}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                                        }`}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{col.header}</span>
                                        {sortConfig?.key === col.accessorKey && (
                                            <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {processedData.length > 0 ? (
                            processedData.map((item, rowIndex) => (
                                <tr key={item.id || rowIndex} className="hover:bg-gray-50 transition-colors">
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {col.cell ? col.cell(item) : (item[col.accessorKey as keyof T] as React.ReactNode) || '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-gray-500">
                                    Data tidak ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}