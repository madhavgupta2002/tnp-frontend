import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator } from 'lucide-react';

function useIsNarrow(breakpoint = 640) {
    const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < breakpoint);
    useEffect(() => {
        const onResize = () => setNarrow(window.innerWidth < breakpoint);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [breakpoint]);
    return narrow;
}

function SalaryDistribution({ darkMode, histogramData, statistics }) {
    const [rangeSize, setRangeSize] = useState(5);
    const isNarrow = useIsNarrow();

    const adjustedHistogramData = useMemo(() => {
        const salaries = histogramData.map(salary => parseFloat(salary)).filter(salary => !Number.isNaN(salary));
        if (salaries.length === 0) return [];
        const max = Math.max(...salaries);
        const newHistogram = [];
        // Start from 0 instead of the minimum salary; include all ranges, even if count is 0
        for (let i = 0; i <= max; i += rangeSize) {
            const range = `${i}-${(i + rangeSize)}`;
            const count = salaries.filter(salary => salary >= i && salary < i + rangeSize).length;
            newHistogram.push({ range, count });
        }
        return newHistogram;
    }, [rangeSize, histogramData]);

    const axisColor = darkMode ? '#D1D5DB' : '#4B5563';
    const gridColor = darkMode ? '#4B5563' : '#D1D5DB';
    const tiles = [
        { label: 'Mean', value: statistics.mean, bg: darkMode ? 'bg-blue-900' : 'bg-blue-100' },
        { label: 'Median', value: statistics.median, bg: darkMode ? 'bg-green-900' : 'bg-green-100' },
        { label: 'Mode', value: statistics.mode, bg: darkMode ? 'bg-yellow-900' : 'bg-yellow-100' },
    ];

    return (
        <div className={darkMode ? 'text-white' : 'text-gray-800'}>
            <div className={`max-w-6xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 sm:p-6`}>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <Calculator className="mr-2 flex-shrink-0" aria-hidden="true" />
                    Salary Distribution Analysis
                </h4>
                <div className="mb-4">
                    <label htmlFor="rangeSize" className="block mb-2 text-sm">Adjust Range Size:</label>
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
                    <span className="text-sm" aria-live="polite">Current Range Size: {rangeSize} LPA</span>
                </div>
                <div className="mb-8 h-80 sm:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={adjustedHistogramData} margin={{ top: 5, right: 10, left: isNarrow ? -10 : 0, bottom: isNarrow ? 30 : 15 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis
                                dataKey="range"
                                tick={{ fill: axisColor, fontSize: 12 }}
                                stroke={axisColor}
                                interval="preserveStartEnd"
                                minTickGap={isNarrow ? 12 : 5}
                                angle={isNarrow ? -45 : 0}
                                textAnchor={isNarrow ? 'end' : 'middle'}
                                height={isNarrow ? 50 : 30}
                                label={{ value: 'Salary Range (LPA)', position: 'insideBottom', offset: isNarrow ? -25 : -10, fill: axisColor }}
                            />
                            <YAxis
                                tick={{ fill: axisColor, fontSize: 12 }}
                                stroke={axisColor}
                                label={isNarrow ? undefined : { value: 'Number of Students', angle: -90, position: 'insideLeft', fill: axisColor }}
                            />
                            <Tooltip
                                contentStyle={darkMode ? { backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#F9FAFB' } : undefined}
                                labelStyle={darkMode ? { color: '#F9FAFB' } : undefined}
                                cursor={{ fill: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
                            />
                            <Bar dataKey="count" fill="#8884d8" name="Number of Students" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    {tiles.map(({ label, value, bg }) => (
                        <div key={label} className={`${bg} p-4 rounded-lg`}>
                            <p className="text-base font-semibold mb-2">{label}</p>
                            <p className="text-2xl lg:text-3xl font-bold whitespace-nowrap">{Number(value || 0).toFixed(2)} LPA</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SalaryDistribution;
