import React from 'react';
import { inputClass, primaryButtonClass, tableClass, theadClass, stripedRowClass, sectionTitleClass } from './theme';

function CGPAAnalysis({ inputCGPALower, setInputCGPALower, inputCGPAUpper, setInputCGPAUpper, fetchCGPAAnalysis, activeData, darkMode }) {
    return (
        <div className="mb-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={inputCGPALower}
                    onChange={(e) => setInputCGPALower(e.target.value)}
                    placeholder="Lower CGPA"
                    aria-label="Lower CGPA bound"
                    className={`w-full ${inputClass(darkMode)}`}
                />
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={inputCGPAUpper}
                    onChange={(e) => setInputCGPAUpper(e.target.value)}
                    placeholder="Upper CGPA"
                    aria-label="Upper CGPA bound"
                    className={`w-full ${inputClass(darkMode)}`}
                />
            </div>
            <button
                type="button"
                onClick={fetchCGPAAnalysis}
                className={primaryButtonClass(darkMode)}
            >
                Analyze
            </button>
            {activeData && activeData.departmentWise && (
                <div className="mt-6">
                    <h4 className={sectionTitleClass(darkMode)}>
                        CGPA Analysis (Between {inputCGPALower} and {inputCGPAUpper})
                    </h4>
                    <div className="overflow-x-auto shadow-md sm:rounded-lg">
                        <table className={`${tableClass(darkMode)} text-center`}>
                            <thead className={theadClass(darkMode)}>
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
                                    <tr key={category} className={stripedRowClass(index, darkMode)}>
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