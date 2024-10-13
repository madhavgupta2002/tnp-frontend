import React, { useState, useEffect } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

function JobListing({ data, darkMode }) {
    const [activeTab, setActiveTab] = useState('2K21 FTE');
    const [sortColumn, setSortColumn] = useState('Posted on');
    const [sortDirection, setSortDirection] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [recurringCompanies, setRecurringCompanies] = useState({});
    const [activeFilter, setActiveFilter] = useState('all');

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

    useEffect(() => {
        if (data && data[activeTab]) {
            const sortedData = [...data[activeTab]].sort((a, b) => {
                const dateA = new Date(a['Posted on'].split(' ')[0].split('-').reverse().join('-'));
                const dateB = new Date(b['Posted on'].split(' ')[0].split('-').reverse().join('-'));
                return dateB - dateA;
            });
            setFilteredData(sortedData.map((job, index) => ({ ...job, serialNumber: sortedData.length - index })));
        }
    }, [data, activeTab]);

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = data[activeTab].filter(job =>
            Object.values(job).some(value =>
                value.toString().toLowerCase().includes(term)
            )
        );
        setFilteredData(filtered.map((job, index) => ({ ...job, serialNumber: index + 1 })));
    };

    const sortedData = [...filteredData].sort((a, b) => {
        if (sortColumn === 'Posted on') {
            const dateA = new Date(a[sortColumn].split(' ')[0].split('-').reverse().join('-'));
            const dateB = new Date(b[sortColumn].split(' ')[0].split('-').reverse().join('-'));
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    }).filter(job => {
        if (activeFilter === 'all') return true;
        const lowerCaseName = job['Company Name'].toLowerCase();
        const [year, category] = activeTab.split(' ');
        const otherYear = year === '2K21' ? '2K20' : '2K21';
        if (activeFilter === 'recurring') {
            return recurringCompanies[activeTab]?.has(lowerCaseName);
        } else if (activeFilter === 'new') {
            return year === '2K21' && !recurringCompanies[`${otherYear} ${category}`]?.has(lowerCaseName);
        } else if (activeFilter === 'old') {
            return year === '2K20' && !recurringCompanies[`${otherYear} ${category}`]?.has(lowerCaseName);
        }
        return true;
    });

    const formatDate = (dateString) => {
        const [date] = dateString.split(' ');
        return date;
    };

    const formatStipend = (stipend) => {
        return stipend.replace('per Month', 'PM');
    };

    const tabOrder = ['2K21 FTE', '2K20 FTE', '2K21 Intern', '2K20 Intern'];

    const uniqueCompanies = new Set(sortedData.map(job => job['Company Name']));
    const totalJobs = sortedData.length;

    const columnOrder = ['S.No', 'Job Post Name', 'Company Name', 'CTC', 'Stipend', 'Posted on', 'CutOff'];

    const truncateText = (text, maxLength) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const getCompanyColor = (companyName) => {
        const lowerCaseName = companyName.toLowerCase();
        const [year, category] = activeTab.split(' ');
        const otherYear = year === '2K21' ? '2K20' : '2K21';

        if (recurringCompanies[activeTab]?.has(lowerCaseName)) {
            return darkMode ? 'bg-green-800' : 'bg-green-200';
        } else if (year === '2K21' && !recurringCompanies[`${otherYear} ${category}`]?.has(lowerCaseName)) {
            return darkMode ? 'bg-blue-800' : 'bg-blue-200';
        } else if (year === '2K20' && !recurringCompanies[`${otherYear} ${category}`]?.has(lowerCaseName)) {
            return darkMode ? 'bg-yellow-800' : 'bg-yellow-200';
        }
        return '';
    };

    const getButtonStyle = (isActive) => {
        return `mr-1 mb-1 px-2 py-1 text-xs rounded ${isActive ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`;
    };

    return (
        <div className={`mt-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <h2 className="text-2xl font-bold mb-4">Job Listing</h2>
            <div className="flex flex-wrap justify-between items-start mb-4">
                <div className="flex flex-wrap mb-2">
                    {tabOrder.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={getButtonStyle(activeTab === tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap mb-2">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={getButtonStyle(activeFilter === 'all')}
                    >
                        All Companies
                    </button>
                    <button
                        onClick={() => setActiveFilter('recurring')}
                        className={getButtonStyle(activeFilter === 'recurring')}
                    >
                        Recurring Companies
                    </button>
                    <button
                        onClick={() => setActiveFilter('new')}
                        className={getButtonStyle(activeFilter === 'new')}
                    >
                        New Companies (2K21)
                    </button>
                    <button
                        onClick={() => setActiveFilter('old')}
                        className={getButtonStyle(activeFilter === 'old')}
                    >
                        Old Companies (2K20)
                    </button>
                </div>
            </div>
            <div className="flex justify-center space-x-4 mb-4">
                <div className={`px-3 py-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} flex flex-col items-center`}>
                    <span className="text-xs">Total Companies</span>
                    <span className="font-bold text-lg">{uniqueCompanies.size}</span>
                </div>
                <div className={`px-3 py-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} flex flex-col items-center`}>
                    <span className="text-xs">Total Jobs</span>
                    <span className="font-bold text-lg">{totalJobs}</span>
                </div>
            </div>
            <div className="mb-4 flex flex-wrap justify-center">
                <div className={`mr-2 px-2 py-1 text-xs rounded ${darkMode ? 'bg-green-800' : 'bg-green-200'}`}>
                    Recurring Companies
                </div>
                <div className={`mr-2 px-2 py-1 text-xs rounded ${darkMode ? 'bg-blue-800' : 'bg-blue-200'}`}>
                    New Companies (2K21)
                </div>
                <div className={`mr-2 px-2 py-1 text-xs rounded ${darkMode ? 'bg-yellow-800' : 'bg-yellow-200'}`}>
                    Old Companies (2K20)
                </div>
            </div>
            <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={handleSearch}
                className={`w-full px-3 py-1 mb-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className={`w-full text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-segoe`}>
                    <thead className={`text-xs uppercase ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>
                        <tr>
                            {columnOrder.map((column) => (
                                <th
                                    key={column}
                                    scope="col"
                                    className={`px-2 py-1 cursor-pointer text-left`}
                                    onClick={() => handleSort(column)}
                                >
                                    <div className="flex items-center">
                                        {column}
                                        {sortColumn === column ? (
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
                        {sortedData.map((job) => (
                            <tr key={job.serialNumber} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} ${getCompanyColor(job['Company Name'])}`}>
                                <td className="px-2 py-1 whitespace-nowrap">{job.serialNumber}</td>
                                <td className="px-2 py-1 whitespace-normal break-words">{job['Job Post Name']}</td>
                                <td className="px-2 py-1 whitespace-normal break-words">{job['Company Name']}</td>
                                <td className="px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis" title={job['CTC']}>{truncateText(job['CTC'], 15)}</td>
                                <td className="px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis" title={formatStipend(job['Stipend'])}>{truncateText(formatStipend(job['Stipend']), 15)}</td>
                                <td className="px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis" title={formatDate(job['Posted on'])}>{formatDate(job['Posted on'])}</td>
                                <td className="px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis" title={job['CutOff']}>{truncateText(job['CutOff'], 15)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default JobListing;