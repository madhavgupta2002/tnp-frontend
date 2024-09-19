import React from 'react';

function CGPAAnalysis({ inputCGPALower, setInputCGPALower, inputCGPAUpper, setInputCGPAUpper, fetchCGPAAnalysis, activeData, darkMode }) {
    return (
        <div className="mb-4">
            <div className="flex space-x-4 mb-4">
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={inputCGPALower}
                    onChange={(e) => setInputCGPALower(e.target.value)}
                    placeholder="Lower CGPA"
                    className={`w-full px-4 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={inputCGPAUpper}
                    onChange={(e) => setInputCGPAUpper(e.target.value)}
                    placeholder="Upper CGPA"
                    className={`w-full px-4 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
            </div>
            <button
                onClick={fetchCGPAAnalysis}
                className={`mt-4 px-6 py-2 font-bold text-white ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-700'} rounded focus:outline-none focus:shadow-outline`}
            >
                Analyze
            </button>
            {activeData && activeData.departmentWise && (
                <div className="mt-4">
                    <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        CGPA Analysis (Between {inputCGPALower} and {inputCGPAUpper})
                    </h3>
                    <div className="overflow-x-auto shadow-md sm:rounded-lg">
                        <table className={`w-full text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-segoe`}>
                            <thead className={`text-xs uppercase ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>
                                <tr>
                                    <th scope="col" className="px-2 py-3">Branch</th>
                                    {Object.keys(activeData.departmentWise).map(dept => (
                                        <th key={dept} scope="col" className="px-2 py-3">{dept}</th>
                                    ))}
                                    <th scope="col" className="px-2 py-3">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {['Total', 'Placed', 'Unplaced'].map((category, index) => (
                                    <tr key={category} className={index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')}>
                                        <th scope="row" className={`px-2 py-4 font-medium whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'}`}>{category}</th>
                                        {Object.keys(activeData.departmentWise).map(dept => (
                                            <td key={`${dept}-${category}`} className="px-2 py-4 text-center">
                                                {activeData.departmentWise[dept][category.toLowerCase()]}
                                            </td>
                                        ))}
                                        <td className="px-2 py-4 font-bold text-center">
                                            {activeData.totals[category.toLowerCase()]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CGPAAnalysis;