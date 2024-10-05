import React from 'react';
import { FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

function DataTable({ data, dataType, darkMode, searchTerm, setSearchTerm, showAverageCGPA, setShowAverageCGPA, showCTC, setShowCTC, averageCGPAData, ctcData, sortColumn, sortDirection, handleSort }) {
    if (!data) return null;

    if (dataType === 'stats') {
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
            return <div className={`text-gray-600 ${darkMode ? 'dark:text-gray-400' : ''}`}>No data available for stats</div>;
        }

        const rowNames = Object.keys(data);
        const columnNames = Object.keys(data[rowNames[0]] || {});

        return (
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className={`w-full text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-segoe`}>
                    <thead className={`text-xs uppercase ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>
                        <tr>
                            <th scope="col" className="px-2 py-3">Branch</th>
                            {columnNames.map((key) => (
                                <th key={key} scope="col" className="px-2 py-3">{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rowNames.map((rowName, index) => (
                            <tr key={rowName} className={index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')}>
                                <th scope="row" className={`px-2 py-4 font-medium whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'}`}>{rowName}</th>
                                {Object.values(data[rowName]).map((value, index) => (
                                    <td key={index} className="px-2 py-4 text-center">
                                        {rowName === 'Percentage' ? `${value.toFixed(2)}%` :
                                            rowName === 'Average CTC' ? `${value} LPA` :
                                                value}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    } else {
        const filteredData = Object.values(data).filter(row =>
            row['Company Name'] && typeof row['Company Name'] === 'string' &&
            row['Company Name'].toLowerCase().includes(searchTerm.toLowerCase())
        );

        const reversedData = [...filteredData].reverse();

        return (
            <div>
                <div className="mb-4 flex items-center">
                    <FaSearch className="mr-2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search Company"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`px-4 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <button
                        onClick={() => setShowAverageCGPA(!showAverageCGPA)}
                        className={`ml-4 px-4 py-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        {showAverageCGPA ? 'Hide Average CGPA' : 'Show Average CGPA'}
                    </button>
                    <button
                        onClick={() => setShowCTC(!showCTC)}
                        className={`ml-4 px-4 py-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        {showCTC ? 'Hide CTC' : 'Show CTC'}
                    </button>
                </div>
                <div className="overflow-x-auto shadow-md sm:rounded-lg">
                    <table className={`w-full text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-segoe`}>
                        <thead className={`text-xs uppercase ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>
                            <tr>
                                <th scope="col" className="px-2 py-3">Order</th>
                                <th scope="col" className="px-2 py-3">Company Name</th>
                                {Object.keys(Object.values(data)[0]).filter(key => key !== 'Column1' && key !== 'Company Name' && key !== '' && key !== 'Order').map((key) => (
                                    <th key={key} scope="col" className="px-2 py-3">{key}</th>
                                ))}
                                {showAverageCGPA && <th scope="col" className="px-2 py-3">Average CGPA</th>}
                                {showCTC && <th scope="col" className="px-2 py-3">CTC</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {reversedData
                                .filter(row => row['Company Name'] && typeof row['Company Name'] === 'string' && /[a-zA-Z]/.test(row['Company Name']))
                                .map((row, index) => (
                                    <tr key={row['Column1']} className={index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')}>
                                        <td className="px-2 py-4 text-center">{row['Order']}</td>
                                        <th scope="row" className={`px-2 py-4 font-medium whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'}`}>{row['Company Name']}</th>
                                        {Object.entries(row).filter(([key]) => key !== 'Column1' && key !== 'Company Name' && key !== '' && key !== 'Order').map(([key, value]) => (
                                            <td key={key} className="px-2 py-4 text-center">{value}</td>
                                        ))}
                                        {showAverageCGPA && (
                                            <td className="px-2 py-4 text-center">
                                                {averageCGPAData && averageCGPAData[row['Company Name']]
                                                    ? averageCGPAData[row['Company Name']].toFixed(2)
                                                    : 'N/A'}
                                            </td>
                                        )}
                                        {showCTC && (
                                            <td className="px-2 py-4 text-center">
                                                {ctcData && ctcData[row['Company Name']]
                                                    ? `${ctcData[row['Company Name']]} LPA`
                                                    : 'N/A'}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default DataTable;