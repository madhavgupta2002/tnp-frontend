import React, { useState, useEffect } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { chipClass, inputClass, tableClass, theadClass, filledRowText } from './theme';

function CombinedOffersTable({ offers, darkMode }) {
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedDurations, setSelectedDurations] = useState(['all']);
    const [showFTE, setShowFTE] = useState(true);
    const [showPPO, setShowPPO] = useState(true);
    const [filteredOffers, setFilteredOffers] = useState(offers);
    const [durationColors, setDurationColors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showMultipleOffers, setShowMultipleOffers] = useState(false);

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
    }, [offers, selectedDurations, showFTE, showPPO, searchTerm, showMultipleOffers]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
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

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(offer =>
                columns.some(column => {
                    const value = offer[column.key];
                    return value && value.toString().toLowerCase().includes(searchTerm);
                })
            );
        }

        // Filter multiple offers
        if (showMultipleOffers) {
            const rollNoCounts = offers.reduce((acc, offer) => {
                acc[offer.rollNo] = (acc[offer.rollNo] || 0) + 1;
                return acc;
            }, {});
            filtered = filtered.filter(offer => rollNoCounts[offer.rollNo] > 1);
        }

        // Filter by duration
        if (!selectedDurations.includes('all')) {
            filtered = filtered.filter(offer => selectedDurations.includes(offer.duration));
        }

        // Filter by offer type
        filtered = filtered.filter(offer => {
            if (offer.offerType === 'FTE' && showFTE) return true;
            if (offer.offerType === 'PPO' && showPPO) return true;
            return false;
        });

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

            if (column === 'ctc' || column === 'stipend') {
                valueA = valueA ? parseFloat(valueA.replace(/[^\d.]/g, '')) : 0;
                valueB = valueB ? parseFloat(valueB.replace(/[^\d.]/g, '')) : 0;
            }

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
        const baseClass = "px-3 py-2";
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
                type="search"
                aria-label="Search offers"
                placeholder="Search across all columns..."
                value={searchTerm}
                onChange={handleSearch}
                className={`w-full mb-3 ${inputClass(darkMode)}`}
            />
            <div className="mb-3 flex justify-center">
                <button
                    onClick={() => setShowMultipleOffers(!showMultipleOffers)}
                    type="button"
                    aria-pressed={showMultipleOffers}
                    className={`px-3 py-1 rounded text-xs sm:text-sm ${showMultipleOffers ? 'bg-blue-600 text-white' : (darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300')}`}
                >
                    {showMultipleOffers ? 'Show All Students' : 'Show Multiple Offers Only'}
                </button>
            </div>
            <div className="mb-3 flex flex-wrap justify-center">
                <button
                    onClick={() => handleDurationFilter('all')}
                    type="button"
                    aria-pressed={selectedDurations.includes('all')}
                    className={chipClass(selectedDurations.includes('all'), darkMode)}
                >
                    All Durations
                </button>
                {uniqueDurations.map(duration => (
                    <button
                        key={duration}
                        onClick={() => handleDurationFilter(duration)}
                        type="button"
                        aria-pressed={selectedDurations.includes(duration)}
                        className={chipClass(selectedDurations.includes(duration), darkMode)}
                    >
                        {duration}
                    </button>
                ))}
            </div>
            <div className="mb-3 flex flex-wrap justify-center gap-4">
                <label className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <input
                        type="checkbox"
                        checked={showFTE}
                        onChange={(e) => setShowFTE(e.target.checked)}
                        className="mr-2"
                    />
                    FTE
                </label>
                <label className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <input
                        type="checkbox"
                        checked={showPPO}
                        onChange={(e) => setShowPPO(e.target.checked)}
                        className="mr-2"
                    />
                    Summer Intern PPO
                </label>
            </div>
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className={tableClass(darkMode)}>
                    <thead className={theadClass(darkMode)}>
                        <tr>
                            {columns.map(({ key, label }) => (
                                <th
                                    key={key}
                                    scope="col"
                                    className={`${getCellClass(key)} cursor-pointer select-none`}
                                    onClick={() => handleSort(key)}
                                    aria-sort={sortColumn === key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                                >
                                    <div className="flex items-center justify-center">
                                        {label}
                                        {sortColumn === key ? (
                                            sortDirection === 'asc' ? <FaSortUp className="ml-1" aria-hidden="true" /> : <FaSortDown className="ml-1" aria-hidden="true" />
                                        ) : (
                                            <FaSort className="ml-1" aria-hidden="true" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedOffers.map((offer, index) => (
                            <tr key={index} className={`${getRowColor(offer.duration)} ${filledRowText(darkMode)}`}>
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

export default CombinedOffersTable;
