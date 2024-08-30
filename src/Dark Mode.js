import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaChartBar, FaBriefcase, FaClipboardList, FaSearch, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa';

function App() {
    const [activeData, setActiveData] = useState(null);
    const [dataType, setDataType] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const encodedPassword = btoa(password);
        try {
            const response = await axios.get('https://tnp-backend.vercel.app/last-updated', {
                headers: {
                    'Authorization': `Basic ${encodedPassword}`
                }
            });
            setLastUpdated(new Date(response.data.lastUpdated).toLocaleString());
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Authentication failed:', error);
            alert('Authentication failed. Please check your password.');
        }
    };

    useEffect(() => {
        if (dataType && isAuthenticated) {
            fetchData(dataType);
        }
    }, [dataType, isAuthenticated]);

    const fetchData = async (type) => {
        try {
            const response = await axios.get(`https://tnp-backend.vercel.app/${type}`, {
                headers: {
                    'Authorization': `Basic ${btoa(password)}`
                }
            });
            setActiveData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const renderTable = (data) => {
        if (!data) return null;

        if (dataType === 'stats') {
            if (!data || typeof data !== 'object' || !data['Total Students']) {
                return <div className="text-gray-600 dark:text-gray-400">No data available for stats</div>;
            }

            const rowNames = ['Total Students', 'FTE', 'PPO', 'Total Selections', 'Percentage'];

            return (
                <div className="overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Category</th>
                                {Object.keys(data['Total Students']).map((key) => (
                                    <th key={key} scope="col" className="px-6 py-3">{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rowNames.map((rowName, index) => (
                                <tr key={rowName} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{rowName}</th>
                                    {Object.values(data[rowName]).map((value, index) => (
                                        <td key={index} className="px-6 py-4">{rowName === 'Percentage' ? value.toFixed(2) : value}</td>
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
                <div className="overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">S.No</th>
                                <th scope="col" className="px-6 py-3">Company Name</th>
                                {Object.keys(Object.values(data)[0]).filter(key => key !== 'Column1' && key !== 'Company Name' && key !== '').map((key) => (
                                    <th key={key} scope="col" className="px-6 py-3">{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reversedData
                                .filter(row => row['Company Name'] && typeof row['Company Name'] === 'string' && /[a-zA-Z]/.test(row['Company Name']))
                                .map((row, index) => (
                                    <tr key={row['Column1']} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{row['Company Name']}</th>
                                        {Object.entries(row).filter(([key]) => key !== 'Column1' && key !== 'Company Name' && key !== '').map(([key, value]) => (
                                            <td key={key} className="px-6 py-4">{value}</td>
                                        ))}
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            );
        }
    };

    const handleLogout = () => {
        window.location.reload();
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
            <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
                {/* Header */}
                <header className="bg-black text-white p-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold">TNP RM</h1>
                    <div className="flex items-center">
                        <button onClick={toggleDarkMode} className="mr-4">
                            {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-300" />}
                        </button>
                        <button onClick={handleLogout} className="flex items-center">
                            <FaSignOutAlt className="mr-2" /> Logout
                        </button>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 p-6 overflow-y-auto">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mb-2">
                                <FaUser className="text-4xl text-gray-600 dark:text-gray-300" />
                            </div>
                            <span className="text-lg font-semibold">Admin</span>
                        </div>
                        <nav className="space-y-2">
                            <button onClick={() => setDataType('fte')} className="flex items-center w-full py-2 px-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                <FaBriefcase className="mr-3 text-gray-500 dark:text-gray-400" /> FTE Data
                            </button>
                            <button onClick={() => setDataType('ppo')} className="flex items-center w-full py-2 px-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                <FaClipboardList className="mr-3 text-gray-500 dark:text-gray-400" /> PPO Data
                            </button>
                            <button onClick={() => setDataType('stats')} className="flex items-center w-full py-2 px-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                <FaChartBar className="mr-3 text-gray-500 dark:text-gray-400" /> Stats
                            </button>
                        </nav>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
                        <div className="p-8">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">DTU 2025 FTE Placement Statistics (B.Tech)</h2>
                            {!isAuthenticated ? (
                                <form onSubmit={handlePasswordSubmit} className="mb-8">
                                    <input
                                        type="password"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                    <button type="submit" className="mt-4 px-6 py-2 font-bold text-white bg-gray-800 dark:bg-gray-600 rounded hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:shadow-outline">
                                        Submit
                                    </button>
                                </form>
                            ) : null}
                            {activeData && dataType !== 'stats' && (
                                <div className="mb-4 relative">
                                    <input
                                        type="text"
                                        placeholder="Search by company name"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                </div>
                            )}
                            {activeData && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                                        {dataType === 'fte' ? 'FTE (Full Time + 6 Month Intern) Data' :
                                            dataType === 'ppo' ? 'PPO (Pre Placement Offers) Data' :
                                                'Stats'}
                                    </h3>
                                    {renderTable(activeData)}
                                </div>
                            )}
                            <footer className="mt-8 text-center text-gray-600 dark:text-gray-400">
                                Last updated on: {lastUpdated}
                            </footer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;