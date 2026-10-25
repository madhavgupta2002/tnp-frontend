import React, { useState, useEffect } from 'react';
import { chipClass, inputClass, secondaryButtonClass, tableClass, theadClass, statTileClass, sectionTitleClass } from './theme';

function UnplacedStudents({ cgpaData, darkMode }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [placementFilter, setPlacementFilter] = useState('all');
    const [selectedBranches, setSelectedBranches] = useState(['all']);
    const [selectedGenders, setSelectedGenders] = useState(['all']);
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
    const [rollNumberLowerRange, setRollNumberLowerRange] = useState('');
    const [rollNumberUpperRange, setRollNumberUpperRange] = useState('');
    const [selectedBranchForRoll, setSelectedBranchForRoll] = useState('');

    const branchOrder = ['AE', 'BT', 'CE', 'CH', 'CO', 'EC', 'EE', 'EN', 'EP', 'IT', 'MC', 'ME', 'PE', 'SE'];
    const genderOptions = ['Male', 'Female', 'Other'];
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
        applyFilters(term, placementFilter, selectedBranches, selectedGenders, lowerRange, upperRange);
    };

    const handlePlacementFilter = (filter) => {
        setPlacementFilter(filter);
        setSortColumn('cgpa');
        setSortDirection('desc');
        applyFilters(searchTerm, filter, selectedBranches, selectedGenders, lowerRange, upperRange);
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
        applyFilters(searchTerm, placementFilter, newSelectedBranches, selectedGenders, lowerRange, upperRange);
    };

    const handleGenderFilter = (gender) => {
        let newSelectedGenders;
        if (gender === 'all') {
            newSelectedGenders = ['all'];
        } else {
            newSelectedGenders = selectedGenders.includes('all') ? [gender] :
                selectedGenders.includes(gender) ?
                    selectedGenders.filter(g => g !== gender) :
                    [...selectedGenders, gender];

            if (newSelectedGenders.length === 0) {
                newSelectedGenders = ['all'];
            }
        }
        setSelectedGenders(newSelectedGenders);
        applyFilters(searchTerm, placementFilter, selectedBranches, newSelectedGenders, lowerRange, upperRange);
    };

    const handleRangeFilter = (range, isLower) => {
        if (isLower) {
            setLowerRange(lowerRange === range ? null : range);
            setCustomLowerRange('');
        } else {
            setUpperRange(upperRange === range ? null : range);
            setCustomUpperRange('');
        }
        applyFilters(searchTerm, placementFilter, selectedBranches, selectedGenders,
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
        applyFilters(searchTerm, placementFilter, selectedBranches, selectedGenders,
            isLower ? value : lowerRange,
            !isLower ? value : upperRange);
    };

    const handleTopFilter = (e) => {
        const value = e.target.value;
        setTopCount(value);
        if (value && !isNaN(value)) {
            const currentFiltered = applyFilters(searchTerm, placementFilter, selectedBranches, selectedGenders, lowerRange, upperRange, false);
            const topStudents = sortData(currentFiltered, 'cgpa', 'desc').slice(0, parseInt(value));
            setFilteredData(topStudents);
        } else {
            applyFilters(searchTerm, placementFilter, selectedBranches, selectedGenders, lowerRange, upperRange);
        }
    };

    const handleRollNumberRangeChange = (e, isLower) => {
        const value = e.target.value;
        if (isLower) {
            setRollNumberLowerRange(value);
        } else {
            setRollNumberUpperRange(value);
        }
    };

    const handleBranchForRollChange = (e) => {
        setSelectedBranchForRoll(e.target.value);
    };

    const applyRollNumberFilter = () => {
        const filtered = cgpaData.filter(student => {
            const rollNumber = parseInt(student.roll.slice(-3));
            return (
                (!selectedBranchForRoll || student.branch === selectedBranchForRoll) &&
                (!rollNumberLowerRange || rollNumber >= parseInt(rollNumberLowerRange)) &&
                (!rollNumberUpperRange || rollNumber <= parseInt(rollNumberUpperRange))
            );
        });
        setFilteredData(sortData(filtered, sortColumn, sortDirection));
    };

    const sortData = (data, column, direction) => {
        return [...data].sort((a, b) => {
            if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
            if (a[column] > b[column]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const applyFilters = (term, placement, branches, genders, lower, upper, updateState = true) => {
        let filtered = cgpaData.filter(student =>
            (student.name.toLowerCase().includes(term) ||
                student.roll.toLowerCase().includes(term) ||
                student.branch.toLowerCase().includes(term)) &&
            (placement === 'all' ||
                (placement === 'placed' && student.placed) ||
                (placement === 'unplaced' && !student.placed)) &&
            (branches.includes('all') || branches.includes(student.branch)) &&
            (genders.includes('all') || genders.includes(student.gender)) &&
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
        if (totalStudents === 0) return null;
        const placedStudents = filteredData.filter(student => student.placed).length;
        const unplacedStudents = totalStudents - placedStudents;

        const currentSortColumn = sortColumn || 'cgpa';

        const minValue = Math.min(...filteredData.map(student => student[currentSortColumn]));
        const maxValue = Math.max(...filteredData.map(student => student[currentSortColumn]));

        const isReversed = sortDirection === 'desc';

        const getPosition = (value) => {
            const studentsBelow = filteredData.filter(student => student[currentSortColumn] <= value).length;
            const position = studentsBelow / totalStudents;
            return isReversed ? 1 - position : position;
        };

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
            <h4 className={sectionTitleClass(darkMode)}>
                Students
            </h4>
            <input
                type="search"
                aria-label="Search by name, roll number, or branch"
                placeholder="Search by name, roll number, or branch"
                value={searchTerm}
                onChange={handleSearch}
                className={`w-full mb-3 ${inputClass(darkMode)}`}
            />
            <div className="mb-3 flex flex-wrap justify-center">
                <button
                    onClick={() => handlePlacementFilter('all')}
                    type="button"
                    aria-pressed={placementFilter === 'all'}
                    className={chipClass(placementFilter === 'all', darkMode)}
                >
                    All
                </button>
                <button
                    onClick={() => handlePlacementFilter('placed')}
                    type="button"
                    aria-pressed={placementFilter === 'placed'}
                    className={chipClass(placementFilter === 'placed', darkMode)}
                >
                    Placed
                </button>
                <button
                    onClick={() => handlePlacementFilter('unplaced')}
                    type="button"
                    aria-pressed={placementFilter === 'unplaced'}
                    className={chipClass(placementFilter === 'unplaced', darkMode)}
                >
                    Unplaced
                </button>
            </div>
            <div className="mb-3 flex flex-wrap justify-center">
                <button
                    onClick={() => handleBranchFilter('all')}
                    type="button"
                    aria-pressed={selectedBranches.includes('all')}
                    className={chipClass(selectedBranches.includes('all'), darkMode)}
                >
                    All Branches
                </button>
                {branchOrder.map(branch => (
                    <button
                        key={branch}
                        onClick={() => handleBranchFilter(branch)}
                        type="button"
                    aria-pressed={selectedBranches.includes(branch)}
                    className={chipClass(selectedBranches.includes(branch), darkMode)}
                    >
                        {branch}
                    </button>
                ))}
            </div>
            <div className="mb-3 flex flex-wrap justify-center">
                <button
                    onClick={() => handleGenderFilter('all')}
                    type="button"
                    aria-pressed={selectedGenders.includes('all')}
                    className={chipClass(selectedGenders.includes('all'), darkMode)}
                >
                    All Genders
                </button>
                {genderOptions.map(gender => (
                    <button
                        key={gender}
                        onClick={() => handleGenderFilter(gender)}
                        type="button"
                    aria-pressed={selectedGenders.includes(gender)}
                    className={chipClass(selectedGenders.includes(gender), darkMode)}
                    >
                        {gender}
                    </button>
                ))}
            </div>
            <button
                type="button"
                aria-expanded={showAdvancedFilters}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`mb-3 ${secondaryButtonClass(darkMode)}`}
            >
                {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            </button>
            {showAdvancedFilters && (
                <div className="mb-4">
                    <div className="mb-2">
                        <label htmlFor="top-count" className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Top Students:</label>
                        <input
                            id="top-count"
                            type="number"
                            value={topCount}
                            onChange={handleTopFilter}
                            placeholder="Enter number"
                            className={`ml-2 ${inputClass(darkMode)} py-1`}
                        />
                    </div>
                    <div className="mb-2">
                        <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Lower Range: {lowerRange || 'Unselected'}</p>
                        <div className="flex flex-wrap justify-center items-center">
                            {cgpaRanges.map(range => (
                                <button
                                    key={`lower-${range}`}
                                    onClick={() => handleRangeFilter(range, true)}
                                    type="button"
                    aria-pressed={lowerRange === range}
                    className={chipClass(lowerRange === range, darkMode)}
                                >
                                    {range}
                                </button>
                            ))}
                            <input
                                type="number"
                                value={customLowerRange}
                                onChange={(e) => handleCustomRangeFilter(e, true)}
                                placeholder="Custom"
                                aria-label="Custom CGPA bound"
                                className={`ml-2 w-20 ${inputClass(darkMode)} py-1`}
                                step="0.01"
                                min="0"
                                max="10"
                            />
                        </div>
                    </div>
                    <div className="mb-2">
                        <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Upper Range: {upperRange || 'Unselected'}</p>
                        <div className="flex flex-wrap justify-center items-center">
                            {cgpaRanges.map(range => (
                                <button
                                    key={`upper-${range}`}
                                    onClick={() => handleRangeFilter(range, false)}
                                    type="button"
                    aria-pressed={upperRange === range}
                    className={chipClass(upperRange === range, darkMode)}
                                >
                                    {range}
                                </button>
                            ))}
                            <input
                                type="number"
                                value={customUpperRange}
                                onChange={(e) => handleCustomRangeFilter(e, false)}
                                placeholder="Custom"
                                aria-label="Custom CGPA bound"
                                className={`ml-2 w-20 ${inputClass(darkMode)} py-1`}
                                step="0.01"
                                min="0"
                                max="10"
                            />
                        </div>
                    </div>
                    <div className="mb-2">
                        <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Roll Number Range</p>
                        <div className="flex flex-wrap justify-center items-center">
                            <select
                                value={selectedBranchForRoll}
                                onChange={handleBranchForRollChange}
                                aria-label="Branch for roll number range"
                                className={`mr-2 ${inputClass(darkMode)} py-1`}
                            >
                                <option value="">Select Branch</option>
                                {branchOrder.map(branch => (
                                    <option key={branch} value={branch}>{branch}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={rollNumberLowerRange}
                                onChange={(e) => handleRollNumberRangeChange(e, true)}
                                placeholder="Lower"
                                aria-label="Lower roll number"
                                className={`mr-2 w-20 ${inputClass(darkMode)} py-1`}
                                min="1"
                                max="999"
                            />
                            <input
                                type="number"
                                value={rollNumberUpperRange}
                                onChange={(e) => handleRollNumberRangeChange(e, false)}
                                placeholder="Upper"
                                aria-label="Upper roll number"
                                className={`mr-2 w-20 ${inputClass(darkMode)} py-1`}
                                min="1"
                                max="999"
                            />
                            <button
                                type="button"
                                onClick={applyRollNumberFilter}
                                className={`px-3 py-1 text-sm rounded ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex flex-wrap justify-center gap-4 mb-4">
                <div className={statTileClass(darkMode)}>
                    <span className="text-xs">Placed</span>
                    <span className="font-bold text-lg">{placedCount}</span>
                </div>
                <div className={statTileClass(darkMode)}>
                    <span className="text-xs">Unplaced</span>
                    <span className="font-bold text-lg">{unplacedCount}</span>
                </div>
                <div className={statTileClass(darkMode)}>
                    <span className="text-xs">All</span>
                    <span className="font-bold text-lg">{filteredData.length}</span>
                </div>
            </div>
            {renderPlacementDistribution()}
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className={tableClass(darkMode)}>
                    <thead className={theadClass(darkMode)}>
                        <tr>
                            <th scope="col" className="px-3 py-3 text-left">S.No.</th>
                            <th scope="col" className="px-3 py-3 cursor-pointer text-left" onClick={() => handleSort('roll')}>
                                Roll No. {sortColumn === 'roll' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>
                            <th scope="col" className="px-3 py-3 cursor-pointer text-left" onClick={() => handleSort('name')}>
                                Name {sortColumn === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>
                            <th scope="col" className="px-3 py-3 cursor-pointer text-left" onClick={() => handleSort('branch')}>
                                Branch {sortColumn === 'branch' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>
                            <th scope="col" className="px-3 py-3 cursor-pointer text-left" onClick={() => handleSort('gender')}>
                                Gender {sortColumn === 'gender' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>
                            <th scope="col" className="px-3 py-3 cursor-pointer text-left" onClick={() => handleSort('cgpa')}>
                                CGPA {sortColumn === 'cgpa' && (sortDirection === 'asc' ? '▲' : '▼')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((student, index) => (
                            <tr key={student.roll}
                                className={`${student.placed ? (darkMode ? 'bg-green-900' : 'bg-green-100') : (darkMode ? 'bg-gray-800' : 'bg-white')}`}>
                                <td className="px-3 py-2">{index + 1}</td>
                                <td className="px-3 py-2">{student.roll}</td>
                                <td className="px-3 py-2">{student.name}</td>
                                <td className="px-3 py-2">{student.branch}</td>
                                <td className="px-3 py-2">{student.gender}</td>
                                <td className="px-3 py-2">{student.cgpa.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UnplacedStudents;