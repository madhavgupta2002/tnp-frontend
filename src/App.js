import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartBar, FaBriefcase, FaClipboardList, FaSearch, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa';

function App() {
    const [activeData, setActiveData] = useState(null);
    const [dataType, setDataType] = useState('stats');
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [loading, setLoading] = useState(false);

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
        setLoading(true); // Set loading to true when fetching data
        try {
            const response = await axios.get(`https://tnp-backend.vercel.app/${type}`, {
                headers: {
                    'Authorization': `Basic ${btoa(password)}`
                }
            });
            setActiveData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false); // Set loading to false after fetching data
        }
    };

    const renderTable = (data) => {
        if (!data) return null;

        if (dataType === 'stats') {
            if (!data || typeof data !== 'object' || !data['Total Students']) {
                return <div className={`text-gray-600 ${darkMode ? 'dark:text-gray-400' : ''}`}>No data available for stats</div>;
            }

            const rowNames = ['Total Students', 'FTE', 'PPO', 'Total Selections', 'Percentage'];

            return (
                <div className="overflow-x-auto shadow-md sm:rounded-lg">
                    <table className={`w-full text-sm text-left ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-segoe`}>
                        <thead className={`text-xs uppercase ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-700'}`}>
                            <tr>
                                <th scope="col" className="px-6 py-3">Category</th>
                                {Object.keys(data['Total Students']).map((key) => (
                                    <th key={key} scope="col" className="px-6 py-3">{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rowNames.map((rowName, index) => (
                                <tr key={rowName} className={index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')}>
                                    <th scope="row" className={`px-6 py-4 font-medium whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'}`}>{rowName}</th>
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
                    <table className={`w-full text-sm text-left ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-segoe`}>
                        <thead className={`text-xs uppercase ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-700'}`}>
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
                                    <tr key={row['Column1']} className={index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')}>
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <th scope="row" className={`px-6 py-4 font-medium whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'}`}>{row['Company Name']}</th>
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
        <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'} font-sans`}>
            {/* Header */}
            <header className="bg-[#212121] text-white p-5 flex justify-between items-center font-helvetica">
                <h1 className="text-3xl font-bold">TNP RM</h1>
                <div className="flex items-center">
                    <button onClick={toggleDarkMode} className="mr-5 text-2xl">
                        {darkMode ? <FaSun /> : <FaMoon />}
                    </button>
                    <button onClick={handleLogout} className="flex items-center text-xl">
                        <FaSignOutAlt className="mr-2" /> Logout
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className={`w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r text-gray-700 p-6 overflow-y-auto font-helvetica`}>
                    <div className="flex flex-col items-center mb-8">
                        <div className={`w-20 h-20  rounded-full flex items-center justify-center mb-2`}>
                            <img src="/avatar.png" alt="Profile" className="w-full h-full rounded-full" />
                        </div>
                        <span className={`text-lg  ${darkMode ? 'text-white' : ''}`}>Admin</span>
                    </div>
                    <nav className="space-y-2">
                        <button onClick={() => setDataType('fte')} className={`flex items-center w-full py-2 px-4 text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded ${dataType === 'fte' ? (darkMode ? 'text-white' : 'text-gray-900') : (darkMode ? 'text-[#6B778C]' : 'text-[#6B778C]')}`}>
                            <FaBriefcase className={`mr-3 ${dataType === 'fte' ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-[#6B778C]'}`} /> FTE Data
                        </button>
                        <button onClick={() => setDataType('ppo')} className={`flex items-center w-full py-2 px-4 text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded ${dataType === 'ppo' ? (darkMode ? 'text-white' : 'text-gray-900') : (darkMode ? 'text-[#6B778C]' : 'text-[#6B778C]')}`}>
                            <FaClipboardList className={`mr-3 ${dataType === 'ppo' ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-[#6B778C]'}`} /> PPO Data
                        </button>
                        <button onClick={() => setDataType('stats')} className={`flex items-center w-full py-2 px-4 text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded ${dataType === 'stats' ? (darkMode ? 'text-white' : 'text-gray-900') : (darkMode ? 'text-[#6B778C]' : 'text-[#6B778C]')}`}>
                            <FaChartBar className={`mr-3 ${dataType === 'stats' ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-[#6B778C]'}`} /> Stats
                        </button>
                    </nav>
                </div>

                {/* Main content */}
                <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                    <div className="p-8">
                        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>DTU 2025 FTE Placement Statistics (B.Tech)</h2>
                        {!isAuthenticated ? (
                            <form onSubmit={handlePasswordSubmit} className="mb-8">
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full px-4 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                                <button type="submit" className={`mt-4 px-6 py-2 font-bold text-white ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-700'} rounded focus:outline-none focus:shadow-outline`}>
                                    Submit
                                </button>
                            </form>
                        ) : null}
                        {loading ? ( // Show loading circle while fetching data
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            activeData && (
                                <div className="mt-8">
                                    <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {dataType === 'fte' ? 'FTE (Full Time + 6 Month Intern) Data' :
                                            dataType === 'ppo' ? 'PPO (Pre Placement Offers) Data' :
                                                'Stats'}
                                    </h3>
                                    {renderTable(activeData)}
                                </div>
                            )
                        )}
                        <footer className={`mt-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Last updated on: {lastUpdated}
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;