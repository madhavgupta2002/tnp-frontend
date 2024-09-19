import React, { useState } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

function OfferTable({ offers, dataType, darkMode }) {
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

    const columns = [
        { key: 'rollNo', label: 'Roll No' },
        { key: 'branch', label: 'Branch' },
        { key: 'name', label: 'Name' },
        { key: 'companyName', label: 'Company Name' },
        { key: 'role', label: 'Role' },
        { key: 'ctc', label: 'CTC' },
        ...(dataType === 'fteOffers' ? [{ key: 'stipend', label: 'Stipend' }] : [])
    ];

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortOffers = (offers, column) => {
        return [...offers].sort((a, b) => {
            let valueA = a[column];
            let valueB = b[column];

            // Handle special cases for CTC and Stipend
            if (column === 'ctc' || column === 'stipend') {
                valueA = valueA ? parseFloat(valueA.replace(/[^\d.]/g, '')) : 0;
                valueB = valueB ? parseFloat(valueB.replace(/[^\d.]/g, '')) : 0;
            }

            if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const sortedOffers = sortColumn ? sortOffers(offers, sortColumn) : offers;

    return (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className={`w-full text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-segoe`}>
                <thead className={`text-xs uppercase ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>
                    <tr>
                        {columns.map(({ key, label }) => (
                            <th key={key} scope="col" className="px-2 py-3 cursor-pointer" onClick={() => handleSort(key)}>
                                <div className="flex items-center justify-center">
                                    {label}
                                    {sortColumn === key ? (
                                        sortDirection === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                                    ) : (
                                        <FaSort className="ml-1" />
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedOffers.map((offer, index) => (
                        <tr key={index} className={index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')}>
                            {columns.map(({ key }) => (
                                <td key={key} className="px-2 py-4">{offer[key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default OfferTable;