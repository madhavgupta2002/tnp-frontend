import React, { useState, useEffect } from 'react';

function UnplacedStudents({ cgpaData, darkMode }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [placementFilter, setPlacementFilter] = useState('all');
    const [selectedBranches, setSelectedBranches] = useState(['all']);
    const [sortColumn, setSortColumn] = useState('cgpa');
    const [sortDirection, setSortDirection] = useState('desc');
    const [lowerRange, setLowerRange] = useState(null);
    const [upperRange, setUpperRange] = useState(null);
    const [placedCount, setPlacedCount] = useState(0);
    const [unplacedCount, setUnplacedCount] = useState(0);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [topCount, setTopCount] = useState('');
    const [customLowerRange, setCustomLowerRange] = useState('');
    const [customUpperRange, setCustomUpperRange] = useState('');

    const branchOrder = ['AE', 'BT', 'CE', 'CH', 'CO', 'EC', 'EE', 'EN', 'EP', 'IT', 'MC', 'ME', 'PE', 'SE'];
    const cgpaRanges = Array.from({ length: 21 }, (_, i) => (i * 0.5).toFixed(1));

    useEffect(() => {
        setFilteredData(sortData(cgpaData, sortColumn, sortDirection));
    }, [cgpaData]);

    useEffect(() => {
        const placed = filteredData.filter(student => student.placed).length;
        const unplaced = filteredData.length - placed;
        setPlacedCount(placed);
        setUnplacedCount(unplaced);
    }, [filteredData]);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        applyFilters(term, placementFilter, selectedBranches, lowerRange, upperRange);
    };

    const handlePlacementFilter = (filter) => {
        setPlacementFilter(filter);
        setSortColumn('cgpa');
        setSortDirection('desc');
        applyFilters(searchTerm, filter, selectedBranches, lowerRange, upperRange);
    };

    const handleBranchFilter = (branch) => {
        let newSelectedBranches;
        if (branch === 'all') {
            newSelectedBranches = ['all'];
        } else {
            newSelectedBranches = selectedBranches.includes('all') ? [branch] :
                selectedBranches.includes(branch) ?
                    selectedBranches.filter(b => b !== branch) :
                    [...selectedBranches, branch];

            if (newSelectedBranches.length === 0) {
                newSelectedBranches = ['all'];
            }
        }
        setSelectedBranches(newSelectedBranches);
        setSortColumn('cgpa');
        setSortDirection('desc');
        applyFilters(searchTerm, placementFilter, newSelectedBranches, lowerRange, upperRange);
    };

    const handleRangeFilter = (range, isLower) => {
        if (isLower) {
            setLowerRange(lowerRange === range ? null : range);
            setCustomLowerRange('');
        } else {
            setUpperRange(upperRange === range ? null : range);
            setCustomUpperRange('');
        }
        applyFilters(searchTerm, placementFilter, selectedBranches,
            isLower ? (lowerRange === range ? null : range) : lowerRange,
            !isLower ? (upperRange === range ? null : range) : upperRange);
    };

    const handleCustomRangeFilter = (e, isLower) => {
        const value = e.target.value;
        if (isLower) {
            setCustomLowerRange(value);
            setLowerRange(value);
        } else {
            setCustomUpperRange(value);
            setUpperRange(value);
        }
        applyFilters(searchTerm, placementFilter, selectedBranches,
            isLower ? value : lowerRange,
            !isLower ? value : upperRange);
    };

    const handleTopFilter = (e) => {
        const value = e.target.value;
        setTopCount(value);
        if (value && !isNaN(value)) {
            const currentFiltered = applyFilters(searchTerm, placementFilter, selectedBranches, lowerRange, upperRange, false);
            const topStudents = sortData(currentFiltered, 'cgpa', 'desc').slice(0, parseInt(value));
            setFilteredData(topStudents);
        } else {
            applyFilters(searchTerm, placementFilter, selectedBranches, lowerRange, upperRange);
        }
    };

    const sortData = (data, column, direction) => {
        return [...data].sort((a, b) => {
            if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
            if (a[column] > b[column]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const applyFilters = (term, placement, branches, lower, upper, updateState = true) => {
        let filtered = cgpaData.filter(student =>
            (student.name.toLowerCase().includes(term) ||
                student.roll.toLowerCase().includes(term) ||
                student.branch.toLowerCase().includes(term)) &&
            (placement === 'all' ||
                (placement === 'placed' && student.placed) ||
                (placement === 'unplaced' && !student.placed)) &&
            (branches.includes('all') || branches.includes(student.branch)) &&
            (!lower || student.cgpa >= parseFloat(lower)) &&
            (!upper || student.cgpa <= parseFloat(upper))
        );

        filtered = sortData(filtered, sortColumn, sortDirection);
        if (updateState) {
            setFilteredData(filtered);
        }
        return filtered;
    };

    const handleSort = (column) => {
        const newDirection = sortColumn === column && sortDirection === 'desc' ? 'asc' : 'desc';
        setSortColumn(column);
        setSortDirection(newDirection);
        setFilteredData(sortData(filteredData, column, newDirection));
    };

    const renderPlacementDistribution = () => {
        const totalStudents = filteredData.length;
        const placedStudents = filteredData.filter(student => student.placed).length;
        const unplacedStudents = totalStudents - placedStudents;

        // Determine the current sorting column (default to 'cgpa')
        const currentSortColumn = sortColumn || 'cgpa';

        // Get min and max values for the current sorting column
        const minValue = Math.min(...filteredData.map(student => student[currentSortColumn]));
        const maxValue = Math.max(...filteredData.map(student => student[currentSortColumn]));

        // Determine if the scale should be reversed based on sort direction
        const isReversed = sortDirection === 'desc';

        // Function to calculate position of a value in the distribution
        const getPosition = (value) => {
            const studentsBelow = filteredData.filter(student => student[currentSortColumn] <= value).length;
            const position = studentsBelow / totalStudents;
            return isReversed ? 1 - position : position;
        };

        // Generate marks for CGPA scale
        const cgpaMarks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(mark => mark >= minValue && mark <= maxValue);

        return (
            <div className="w-full mb-4">
                <div className="h-8 flex rounded overflow-hidden">
                    {filteredData.map((student, index) => (
                        <div
                            key={index}
                            className={`h-full ${student.placed ? (darkMode ? 'bg-green-600' : 'bg-green-400') : (darkMode ? 'bg-gray-600' : 'bg-gray-300')}`}
                            style={{ width: `${100 / totalStudents}%` }}
                        ></div>
                    ))}
                </div>
                <div className="relative mt-1 h-4">
                    {cgpaMarks.map((mark, index) => (
                        <div key={index} className="absolute" style={{ left: `${getPosition(mark) * 100}%`, transform: 'translateX(-50%)' }}>
                            <div className={`h-2 w-px ${darkMode ? 'bg-gray-400' : 'bg-gray-600'}`}></div>
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{mark}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-1 text-xs">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Unplaced: {unplacedStudents} ({((unplacedStudents / totalStudents) * 100).toFixed(1)}%)
                    </span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Placed: {placedStudents} ({((placedStudents / totalStudents) * 100).toFixed(1)}%)
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="mb-4">
            <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Students
            </h3>
            <input
                type="text"
                placeholder="Search by name, roll number, or branch"
                value={searchTerm}
                onChange={handleSearch}
                className={`w-full px-3 py-1 mb-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <div className="mb-2 flex flex-wrap justify-center">
                <button
                    onClick={() => handlePlacementFilter('all')}
                    className={`mr-1 mb-1 px-2 py-1 text-xs rounded ${placementFilter === 'all' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                    All
                </button>
                <button
                    onClick={() => handlePlacementFilter('placed')}
                    className={`mr-1 mb-1 px-2 py-1 text-xs rounded ${placementFilter === 'placed' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                    Placed
                </button>
                <button
                    onClick={() => handlePlacementFilter('unplaced')}
                    className={`mr-1 mb-1 px-2 py-1 text-xs rounded ${placementFilter === 'unplaced' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                    Unplaced
                </button>
            </div>
            <div className="mb-2 flex flex-wrap justify-center">
                <button
                    onClick={() => handleBranchFilter('all')}
                    className={`mr-1 mb-1 px-2 py-1 text-xs rounded ${selectedBranches.includes('all') ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                    All Branches
                </button>
                {branchOrder.map(branch => (
                    <button
                        key={branch}
                        onClick={() => handleBranchFilter(branch)}
                        className={`mr-1 mb-1 px-2 py-1 text-xs rounded ${selectedBranches.includes(branch) ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        {branch}
                    </button>
                ))}
            </div>
            <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`mb-2 px-3 py-1 text-sm rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
                {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            </button>
            {showAdvancedFilters && (
                <div className="mb-4">
                    <div className="mb-2">
                        <label className="text-sm font-semibold">Top Students:</label>
                        <input
                            type="number"
                            value={topCount}
                            onChange={handleTopFilter}
                            placeholder="Enter number"
                            className={`ml-2 px-2 py-1 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                        />
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-semibold mb-1">Lower Range: {lowerRange || 'Unselected'}</p>
                        <div className="flex flex-wrap justify-center items-center">
                            {cgpaRanges.map(range => (
                                <button
                                    key={`lower-${range}`}
                                    onClick={() => handleRangeFilter(range, true)}
                                    className={`mr-1 mb-1 px-2 py-1 text-xs rounded ${lowerRange === range ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
                                >
                                    {range}
                                </button>
                            ))}
                            <input
                                type="number"
                                value={customLowerRange}
                                onChange={(e) => handleCustomRangeFilter(e, true)}
                                placeholder="Custom"
                                className={`ml-2 px-2 py-1 w-20 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                step="0.01"
                                min="0"
                                max="10"
                            />
                        </div>
                    </div>
                    <div className="mb-2">
                        <p className="text-sm font-semibold mb-1">Upper Range: {upperRange || 'Unselected'}</p>
                        <div className="flex flex-wrap justify-center items-center">
                            {cgpaRanges.map(range => (
                                <button
                                    key={`upper-${range}`}
                                    onClick={() => handleRangeFilter(range, false)}
                                    className={`mr-1 mb-1 px-2 py-1 text-xs rounded ${upperRange === range ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}
                                >
                                    {range}
                                </button>
                            ))}
                            <input
                                type="number"
                                value={customUpperRange}
                                onChange={(e) => handleCustomRangeFilter(e, false)}
                                placeholder="Custom"
                                className={`ml-2 px-2 py-1 w-20 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                step="0.01"
                                min="0"
                                max="10"
                            />
                        </div>
                    </div>
                </div>
            )}
            <div className="flex justify-center space-x-4 mb-4">
                <div className={`px-3 py-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} flex flex-col items-center`}>
                    <span className="text-xs">Placed</span>
                    <span className="font-bold text-lg">{placedCount}</span>
                </div>
                <div className={`px-3 py-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} flex flex-col items-center`}>
                    <span className="text-xs">Unplaced</span>
                    <span className="font-bold text-lg">{unplacedCount}</span>
                </div>
                <div className={`px-3 py-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} flex flex-col items-center`}>
                    <span className="text-xs">All</span>
                    <span className="font-bold text-lg">{filteredData.length}</span>
                </div>
            </div>
            {renderPlacementDistribution()}
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className={`w-full text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-segoe`}>
                    <thead className={`text-xs uppercase ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>
                        <tr>
                            <th scope="col" className="px-2 py-1 text-left">S.No.</th>
                            <th scope="col" className="px-2 py-1 cursor-pointer text-left" onClick={() => handleSort('roll')}>
                                Roll No. {sortColumn === 'roll' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>
                            <th scope="col" className="px-2 py-1 cursor-pointer text-left" onClick={() => handleSort('name')}>
                                Name {sortColumn === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>
                            <th scope="col" className="px-2 py-1 cursor-pointer text-left" onClick={() => handleSort('branch')}>
                                Branch {sortColumn === 'branch' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>
                            <th scope="col" className="px-2 py-1 cursor-pointer text-left" onClick={() => handleSort('cgpa')}>
                                CGPA {sortColumn === 'cgpa' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((student, index) => (
                            <tr key={student.roll}
                                className={`${student.placed ? (darkMode ? 'bg-green-900' : 'bg-green-100') : (darkMode ? 'bg-gray-800' : 'bg-white')}`}>
                                <td className="px-2 py-1">{index + 1}</td>
                                <td className="px-2 py-1">{student.roll}</td>
                                <td className="px-2 py-1">{student.name}</td>
                                <td className="px-2 py-1">{student.branch}</td>
                                <td className="px-2 py-1">{student.cgpa.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UnplacedStudents;