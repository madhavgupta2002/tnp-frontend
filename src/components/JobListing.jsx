import React, { useState, useEffect, useMemo } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { chipClass, inputClass, tableClass, theadClass, filledRowText, statTileClass } from './theme';

function JobListing({ data, darkMode }) {
    const [activeTab, setActiveTab] = useState('2K21 FTE');
    const [sortColumn, setSortColumn] = useState('Posted on');
    const [sortDirection, setSortDirection] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [recurringCompanies, setRecurringCompanies] = useState({});
    const [activeFilter, setActiveFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const parsePostedOn = (postedOn) => new Date(String(postedOn || '').split(' ')[0].split('-').reverse().join('-'));

    useEffect(() => {
        if (data) {
            const recurring = {};
            ['FTE', 'Intern'].forEach(category => {
                const companies2K21 = new Set(data[`2K21 ${category}`]?.map(job => job['Company Name'].toLowerCase()) || []);
                const companies2K20 = new Set(data[`2K20 ${category}`]?.map(job => job['Company Name'].toLowerCase()) || []);

                recurring[`2K21 ${category}`] = new Set([...companies2K21].filter(x => companies2K20.has(x)));
                recurring[`2K20 ${category}`] = new Set([...companies2K20].filter(x => companies2K21.has(x)));
            });
            setRecurringCompanies(recurring);
        }
    }, [data]);

    // Serial numbers are assigned once per tab (oldest posting = 1) so they stay stable while
    // searching / date-filtering; search and date filters are combined instead of overwriting each other.
    const numberedJobs = useMemo(() => {
        if (!data || !data[activeTab]) return [];
        const byDateDesc = [...data[activeTab]].sort((a, b) => parsePostedOn(b['Posted on']) - parsePostedOn(a['Posted on']));
        return byDateDesc.map((job, index) => ({ ...job, serialNumber: byDateDesc.length - index }));
    }, [data, activeTab]);

    const filteredData = useMemo(() => {
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return numberedJobs.filter(job => {
            const jobDate = parsePostedOn(job['Posted on']);
            if (jobDate < start || jobDate > end) return false;
            if (!searchTerm) return true;
            return Object.entries(job).some(([key, value]) =>
                key !== 'serialNumber' && value != null && value.toString().toLowerCase().includes(searchTerm)
            );
        });
    }, [numberedJobs, startDate, endDate, searchTerm]);

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const sortedData = [...filteredData].sort((a, b) => {
        if (sortColumn === 'S.No') {
            return sortDirection === 'asc' ? a.serialNumber - b.serialNumber : b.serialNumber - a.serialNumber;
        }
        if (sortColumn === 'Posted on') {
            const dateA = parsePostedOn(a[sortColumn]);
            const dateB = parsePostedOn(b[sortColumn]);
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    }).filter(job => {
        if (activeFilter === 'all') return true;
        const lowerCaseName = job['Company Name'].toLowerCase();
        if (activeFilter === 'recurring') {
            return recurringCompanies[activeTab]?.has(lowerCaseName);
        } else if (activeFilter === 'non-recurring') {
            return !recurringCompanies[activeTab]?.has(lowerCaseName);
        }
        return true;
    });

    const formatDate = (dateString) => {
        const [date] = String(dateString || '').split(' ');
        return date;
    };

    const formatStipend = (stipend) => {
        return String(stipend || '').replace('per Month', 'PM');
    };

    const tabOrder = ['2K21 FTE', '2K20 FTE', '2K21 Intern', '2K20 Intern'];

    const uniqueCompanies = new Set(sortedData.map(job => job['Company Name']));
    const totalJobs = sortedData.length;

    const columnOrder = ['S.No', 'Job Post Name', 'Company Name', 'CTC', 'Stipend', 'Posted on', 'CutOff'];

    const truncateText = (text, maxLength) => {
        text = text == null ? '' : String(text);
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const getCompanyColor = (companyName) => {
        const lowerCaseName = companyName.toLowerCase();

        if (recurringCompanies[activeTab]?.has(lowerCaseName)) {
            return darkMode ? 'bg-green-800' : 'bg-green-200';
        } else {
            return darkMode ? 'bg-yellow-800' : 'bg-yellow-200';
        }
    };

    const getButtonStyle = (isActive) => {
        return chipClass(isActive, darkMode);
    };

    const getStats = () => {
        const recurringCompanySet = recurringCompanies[activeTab] || new Set();
        const recurringCompanyCount = recurringCompanySet.size;
        const recurringJobCount = sortedData.filter(job =>
            recurringCompanySet.has(job['Company Name'].toLowerCase())
        ).length;
        const nonRecurringJobCount = sortedData.length - recurringJobCount;
        const nonRecurringCompanyCount = uniqueCompanies.size - recurringCompanyCount;

        return {
            recurringCompanies: recurringCompanyCount,
            recurringJobs: recurringJobCount,
            nonRecurringCompanies: nonRecurringCompanyCount,
            nonRecurringJobs: nonRecurringJobCount
        };
    };

    const setTodayAsEndDate = () => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        setEndDate(formattedDate);
    };

    return (
        <div className={darkMode ? 'text-white' : 'text-gray-800'}>
            <div className="flex flex-wrap justify-between items-start mb-4">
                <div className="flex flex-wrap mb-2">
                    {tabOrder.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            aria-pressed={activeTab === tab}
                            onClick={() => setActiveTab(tab)}
                            className={getButtonStyle(activeTab === tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap mb-2">
                    <button
                        type="button"
                        aria-pressed={activeFilter === 'all'}
                        onClick={() => setActiveFilter('all')}
                        className={getButtonStyle(activeFilter === 'all')}
                    >
                        All Companies
                    </button>
                    <button
                        type="button"
                        aria-pressed={activeFilter === 'recurring'}
                        onClick={() => setActiveFilter('recurring')}
                        className={getButtonStyle(activeFilter === 'recurring')}
                    >
                        Recurring Companies
                    </button>
                    <button
                        type="button"
                        aria-pressed={activeFilter === 'non-recurring'}
                        onClick={() => setActiveFilter('non-recurring')}
                        className={getButtonStyle(activeFilter === 'non-recurring')}
                    >
                        Non-Recurring Companies
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mb-4">
                <div className={statTileClass(darkMode)}>
                    <span className="text-xs">Total Companies</span>
                    <span className="font-bold text-lg">{uniqueCompanies.size}</span>
                </div>
                <div className={statTileClass(darkMode)}>
                    <span className="text-xs">Total Jobs</span>
                    <span className="font-bold text-lg">{totalJobs}</span>
                </div>
            </div>
            <div className="mb-4 flex flex-wrap justify-center items-start gap-4">
                <div className={`px-3 py-2 rounded ${darkMode ? 'bg-green-800 text-gray-100' : 'bg-green-200 text-gray-900'} flex flex-col items-center`}>
                    <span className="text-xs">Recurring Companies:</span>
                    <span className="font-bold">{getStats().recurringCompanies}</span>
                    <span className="text-xs mt-1">Recurring Jobs:</span>
                    <span className="font-bold">{getStats().recurringJobs}</span>
                </div>
                <div className={`px-3 py-2 rounded ${darkMode ? 'bg-yellow-800 text-gray-100' : 'bg-yellow-200 text-gray-900'} flex flex-col items-center`}>
                    <span className="text-xs">Non-Recurring Companies:</span>
                    <span className="font-bold">{getStats().nonRecurringCompanies}</span>
                    <span className="text-xs mt-1">Non-Recurring Jobs:</span>
                    <span className="font-bold">{getStats().nonRecurringJobs}</span>
                </div>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
                <div className="flex items-center space-x-2">
                    <label htmlFor="startDate" className="text-sm">Start Date:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={`${inputClass(darkMode)} py-1`}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <label htmlFor="endDate" className="text-sm">End Date:</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`${inputClass(darkMode)} py-1`}
                    />
                    <button
                        type="button"
                        onClick={setTodayAsEndDate}
                        className={`px-2 py-1 text-xs rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                    >
                        Set Today
                    </button>
                </div>
            </div>
            <input
                type="search"
                aria-label="Search jobs"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={handleSearch}
                className={`w-full mb-3 ${inputClass(darkMode)}`}
            />
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className={tableClass(darkMode)}>
                    <thead className={theadClass(darkMode)}>
                        <tr>
                            {columnOrder.map((column) => (
                                <th
                                    key={column}
                                    scope="col"
                                    className="px-3 py-3 cursor-pointer select-none text-left whitespace-nowrap"
                                    aria-sort={sortColumn === column ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    onClick={() => handleSort(column)}
                                >
                                    <div className="flex items-center">
                                        {column}
                                        {sortColumn === column ? (
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
                        {sortedData.map((job) => (
                            <tr key={job.serialNumber} className={`${getCompanyColor(job['Company Name'])} ${filledRowText(darkMode)}`}>
                                <td className="px-3 py-2 whitespace-nowrap">{job.serialNumber}</td>
                                <td className="px-3 py-2 whitespace-normal break-words">{job['Job Post Name']}</td>
                                <td className="px-3 py-2 whitespace-normal break-words">{job['Company Name']}</td>
                                <td className="px-3 py-2 whitespace-nowrap overflow-hidden text-ellipsis" title={job['CTC']}>{truncateText(job['CTC'], 15)}</td>
                                <td className="px-3 py-2 whitespace-nowrap overflow-hidden text-ellipsis" title={formatStipend(job['Stipend'])}>{truncateText(formatStipend(job['Stipend']), 15)}</td>
                                <td className="px-3 py-2 whitespace-nowrap overflow-hidden text-ellipsis" title={formatDate(job['Posted on'])}>{formatDate(job['Posted on'])}</td>
                                <td className="px-3 py-2 whitespace-nowrap overflow-hidden text-ellipsis" title={job['CutOff']}>{truncateText(job['CutOff'], 15)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default JobListing;