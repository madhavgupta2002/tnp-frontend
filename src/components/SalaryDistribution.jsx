import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator } from 'lucide-react';

function SalaryDistribution({ darkMode, histogramData, statistics }) {
    const [rangeSize, setRangeSize] = useState(5);
    const [adjustedHistogramData, setAdjustedHistogramData] = useState([]);
    const [sortedSalaries, setSortedSalaries] = useState([]);

    useEffect(() => {
        const adjustHistogram = () => {
            const salaries = histogramData.map(salary => parseFloat(salary));
            const max = Math.max(...salaries);
            const min = 0; // Start from 0 instead of the minimum salary

            const newHistogram = [];
            for (let i = min; i <= max; i += rangeSize) {
                const range = `${i}-${(i + rangeSize)}`;
                const count = salaries.filter(salary => salary >= i && salary < i + rangeSize).length;
                newHistogram.push({ range, count }); // Include all ranges, even if count is 0
            }

            setAdjustedHistogramData(newHistogram);
            setSortedSalaries(salaries.sort((a, b) => a - b));
        };

        adjustHistogram();
    }, [rangeSize, histogramData]);

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'} p-8`}>
            <div className={`max-w-6xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <h1 className="text-3xl font-bold mb-6 flex items-center">
                    <Calculator className="mr-2" />
                    Salary Distribution Analysis
                </h1>
                <div className="mb-4">
                    <label htmlFor="rangeSize" className="block mb-2">Adjust Range Size:</label>
                    <input
                        type="range"
                        id="rangeSize"
                        min="1"
                        max="100"
                        step="0.5"
                        value={rangeSize}
                        onChange={(e) => setRangeSize(parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <span>Current Range Size: {rangeSize} LPA</span>
                </div>
                <div className="mb-8 h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={adjustedHistogramData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" label={{ value: 'Salary Range (LPA)', position: 'insideBottom', offset: -5 }} />
                            <YAxis label={{ value: 'Number of Students', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" name="Number of Students" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-100'} p-4 rounded-lg`}>
                        <h2 className="text-xl font-semibold mb-2">Mean</h2>
                        <p className="text-3xl font-bold">{statistics.mean.toFixed(2)} LPA</p>
                    </div>
                    <div className={`${darkMode ? 'bg-green-900' : 'bg-green-100'} p-4 rounded-lg`}>
                        <h2 className="text-xl font-semibold mb-2">Median</h2>
                        <p className="text-3xl font-bold">{statistics.median.toFixed(2)} LPA</p>
                    </div>
                    <div className={`${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'} p-4 rounded-lg`}>
                        <h2 className="text-xl font-semibold mb-2">Mode</h2>
                        <p className="text-3xl font-bold">{statistics.mode.toFixed(2)} LPA</p>
                    </div>
                </div>
                {/* <div className="mt-8 p-4 bg-gray-200 rounded-lg overflow-x-auto">
                    <h2 className="text-xl font-semibold mb-2">Debug: Sorted Salary Values</h2>
                    <p className="text-sm">{sortedSalaries.map(salary => salary.toFixed(2)).join(', ')}</p>
                </div> */}
            </div>
        </div>
    );
}

export default SalaryDistribution;