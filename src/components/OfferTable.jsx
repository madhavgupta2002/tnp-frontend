import React, { useState, useEffect } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

function OfferTable({ offers, dataType, darkMode }) {
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedDurations, setSelectedDurations] = useState(['all']);
    const [filteredOffers, setFilteredOffers] = useState(offers);
    const [durationColors, setDurationColors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    // Array of color pairs [dark mode color, light mode color]
    const colorPairs = [
        ['bg-blue-800', 'bg-blue-200'],
        ['bg-green-800', 'bg-green-200'],
        ['bg-yellow-800', 'bg-yellow-200'],
        ['bg-red-800', 'bg-red-200'],
        ['bg-purple-800', 'bg-purple-200'],
        ['bg-pink-800', 'bg-pink-200'],
        ['bg-indigo-800', 'bg-indigo-200'],
        ['bg-orange-800', 'bg-orange-200'],
        ['bg-teal-800', 'bg-teal-200'],
        ['bg-cyan-800', 'bg-cyan-200']
    ];

    const columns = [
        { key: 'sNo', label: 'S.No.' },
        { key: 'rollNo', label: 'Roll No' },
        { key: 'branch', label: 'Branch' },
        { key: 'name', label: 'Name' },
        { key: 'companyName', label: 'Company Name' },
        { key: 'role', label: 'Role' },
        { key: 'ctc', label: 'CTC' },
        { key: 'stipend', label: 'Stipend' },
        { key: 'duration', label: 'Duration' },
        { key: 'others', label: 'Others' }
    ];

    // Get unique durations from offers
    const uniqueDurations = [...new Set(offers.map(offer => offer.duration))].filter(Boolean);

    useEffect(() => {
        // Assign colors to unique durations
        const colorMapping = {};
        uniqueDurations.forEach((duration, index) => {
            const colorPair = colorPairs[index % colorPairs.length];
            colorMapping[duration] = colorPair;
        });
        setDurationColors(colorMapping);
        applyFilters();
    }, [offers, selectedDurations, searchTerm]);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
    };

    const handleDurationFilter = (duration) => {
        let newSelectedDurations;
        if (duration === 'all') {
            newSelectedDurations = ['all'];
        } else {
            newSelectedDurations = selectedDurations.includes('all') ? [duration] :
                selectedDurations.includes(duration) ?
                    selectedDurations.filter(d => d !== duration) :
                    [...selectedDurations, duration];

            if (newSelectedDurations.length === 0) {
                newSelectedDurations = ['all'];
            }
        }
        setSelectedDurations(newSelectedDurations);
    };

    const applyFilters = () => {
        let filtered = offers;

        // Apply duration filter
        if (!selectedDurations.includes('all')) {
            filtered = filtered.filter(offer => selectedDurations.includes(offer.duration));
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(offer =>
                columns.some(column => {
                    const value = offer[column.key];
                    return value && value.toString().toLowerCase().includes(searchTerm);
                })
            );
        }

        setFilteredOffers(filtered);
    };

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

            // Handle numeric sorting for S.No.
            if (column === 'sNo') {
                valueA = parseInt(valueA) || 0;
                valueB = parseInt(valueB) || 0;
            }

            if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const sortedOffers = sortColumn ? sortOffers(filteredOffers, sortColumn) : filteredOffers;

    const getCellClass = (key) => {
        const baseClass = "px-2 py-1";
        if (key === 'others') {
            return `${baseClass} max-w-[200px] truncate hover:whitespace-normal hover:overflow-visible hover:text-clip`;
        }
        return `${baseClass} whitespace-nowrap`;
    };

    const getRowColor = (duration) => {
        if (durationColors[duration]) {
            return darkMode ? durationColors[duration][0] : durationColors[duration][1];
        }
        return darkMode ? 'bg-gray-700' : 'bg-gray-50';
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Search in all columns..."
                value={searchTerm}
                onChange={handleSearch}
                className={`w-full px-3 py-1 mb-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <div className="mb-2 flex flex-wrap justify-center">
                <button
                    onClick={() => handleDurationFilter('all')}
                    className={`mr-1 mb-1 px-2 py-1 text-xs rounded ${selectedDurations.includes('all') ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                    All Durations
                </button>
                {uniqueDurations.map(duration => (
                    <button
                        key={duration}
                        onClick={() => handleDurationFilter(duration)}
                        className={`mr-1 mb-1 px-2 py-1 text-xs rounded ${selectedDurations.includes(duration) ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        {duration}
                    </button>
                ))}
            </div>
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className={`w-full text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-segoe`}>
                    <thead className={`text-xs uppercase ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>
                        <tr>
                            {columns.map(({ key, label }) => (
                                <th key={key} scope="col" className={getCellClass(key)} onClick={() => handleSort(key)}>
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
                            <tr key={index} className={getRowColor(offer.duration)}>
                                {columns.map(({ key }) => (
                                    <td key={key} className={getCellClass(key)} title={key === 'others' ? offer[key] : ''}>
                                        {offer[key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default OfferTable;