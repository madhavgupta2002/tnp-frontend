import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { inputClass, secondaryButtonClass, tableClass, theadClass, stripedRowClass } from './theme';

function DataTable({ data, dataType, darkMode, searchTerm, setSearchTerm, showAverageCGPA, setShowAverageCGPA, showCTC, setShowCTC, averageCGPAData, ctcData }) {
    if (!data) return null;

    if (dataType === 'stats') {
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
            return <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No data available for stats</div>;
        }

        const rowNames = Object.keys(data);
        const columnNames = Object.keys(data[rowNames[0]] || {});

        return (
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className={`${tableClass(darkMode)} text-center`}>
                    <thead className={theadClass(darkMode)}>
                        <tr>
                            <th scope="col" className="px-2 py-3">Branch</th>
                            {columnNames.map((key) => (
                                <th key={key} scope="col" className="px-2 py-3">{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rowNames.map((rowName, index) => (
                            <tr key={rowName} className={stripedRowClass(index, darkMode)}>
                                <th scope="row" className={`px-2 py-4 font-medium whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'}`}>{rowName}</th>
                                {Object.values(data[rowName]).map((value, index) => (
                                    <td key={index} className="px-2 py-4 text-center whitespace-nowrap">
                                        {rowName === 'Percentage' ? `${value.toFixed(2)}%` :
                                            rowName === 'Mean CTC' || rowName === 'Median CTC' || rowName === 'Mode CTC' ? `${value} LPA` :
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
                <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-4">
                    <FaSearch className={darkMode ? 'text-gray-400' : 'text-gray-500'} aria-hidden="true" />
                    <input
                        type="search"
                        aria-label="Search company"
                        placeholder="Search Company"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`${inputClass(darkMode)} flex-1 min-w-0 sm:flex-none`}
                    />
                    <button
                        onClick={() => setShowAverageCGPA(!showAverageCGPA)}
                        type="button"
                        className={secondaryButtonClass(darkMode)}
                    >
                        {showAverageCGPA ? 'Hide Average CGPA' : 'Show Average CGPA'}
                    </button>
                    <button
                        onClick={() => setShowCTC(!showCTC)}
                        type="button"
                        className={secondaryButtonClass(darkMode)}
                    >
                        {showCTC ? 'Hide CTC' : 'Show CTC'}
                    </button>
                </div>
                <div className="overflow-x-auto shadow-md sm:rounded-lg">
                    <table className={`${tableClass(darkMode)} text-center`}>
                        <thead className={theadClass(darkMode)}>
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
                                    <tr key={row['Column1'] ?? `${row['Order']}-${row['Company Name']}-${index}`} className={stripedRowClass(index, darkMode)}>
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