import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartBar, FaBriefcase, FaClipboardList, FaSearch, FaSignOutAlt, FaMoon, FaSun, FaBars, FaGraduationCap, FaFileAlt, FaFileContract } from 'react-icons/fa';

// const BACKEND_BASE_URL = 'http://localhost:3000';
const BACKEND_BASE_URL = 'https://tnp-backend.vercel.app';

function App() {
    const [activeData, setActiveData] = useState(null);
    const [dataType, setDataType] = useState('stats');
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showAverageCGPA, setShowAverageCGPA] = useState(false);
    const [averageCGPAData, setAverageCGPAData] = useState(null);
    const [showCTC, setShowCTC] = useState(false);
    const [ctcData, setCtcData] = useState(null);
    const [totalPlaced, setTotalPlaced] = useState(0);
    const [cgpaAnalysisData, setCgpaAnalysisData] = useState(null);
    const [inputCGPA, setInputCGPA] = useState('');
    const [fteOffers, setFteOffers] = useState([]);
    const [ppoOffers, setPpoOffers] = useState([]);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const encodedPassword = btoa(password);
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/last-updated`, {
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
            fetchAverageCGPAData(dataType);
            fetchCTCData(dataType);
            fetchTotalPlaced();
        }
    }, [dataType, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            if (dataType === 'fteOffers') {
                fetchFteOffers();
            } else if (dataType === 'ppoOffers') {
                fetchPpoOffers();
            }
        }
    }, [dataType, isAuthenticated]);

    const fetchData = async (type) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/${type}`, {
                headers: {
                    'Authorization': `Basic ${btoa(password)}`
                }
            });
            setActiveData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAverageCGPAData = async (type) => {
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/selection-${type}-cgpa`, {
                headers: {
                    'Authorization': `Basic ${btoa(password)}`
                }
            });
            setAverageCGPAData(response.data);
        } catch (error) {
            console.error('Error fetching average CGPA data:', error);
        }
    };

    const fetchCTCData = async (type) => {
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/selection-${type}-ctc`, {
                headers: {
                    'Authorization': `Basic ${btoa(password)}`
                }
            });
            setCtcData(response.data);
        } catch (error) {
            console.error('Error fetching CTC data:', error);
        }
    };

    const fetchTotalPlaced = async () => {
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/total-placed`, {
                headers: {
                    'Authorization': `Basic ${btoa(password)}`
                }
            });
            setTotalPlaced(response.data.totalPlaced);
        } catch (error) {
            console.error('Error fetching total placed data:', error);
        }
    };

    const fetchCGPAAnalysis = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/students-above-cgpa/${inputCGPA}`, {
                headers: {
                    'Authorization': `Basic ${btoa(password)}`
                }
            });
            setCgpaAnalysisData(response.data);
            setActiveData(response.data); // Set activeData to the CGPA analysis data
        } catch (error) {
            console.error('Error fetching CGPA analysis data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFteOffers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/fte-offers`, {
                headers: {
                    'Authorization': `Basic ${btoa(password)}`
                }
            });
            setFteOffers(response.data);
        } catch (error) {
            console.error('Error fetching FTE offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPpoOffers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/ppo-offers`, {
                headers: {
                    'Authorization': `Basic ${btoa(password)}`
                }
            });
            setPpoOffers(response.data);
        } catch (error) {
            console.error('Error fetching PPO offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderTable = (data) => {
        if (!data) return null;

        if (dataType === 'stats') {
            if (!data || typeof data !== 'object' || !data['Total Students']) {
                return <div className={`text-gray-600 ${darkMode ? 'dark:text-gray-400' : ''}`}>No data available for stats</div>;
            }

            const rowNames = ['Total Students', 'FTE', 'PPO', 'Total Selections', 'Percentage', 'Average CTC'];

            return (
                <div className="overflow-x-auto shadow-md sm:rounded-lg">
                    <table className={`w-full text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-segoe`}>
                        <thead className={`text-xs uppercase ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>
                            <tr>
                                <th scope="col" className="px-2 py-3">Branch</th>
                                {Object.keys(data['Total Students']).map((key) => (
                                    <th key={key} scope="col" className="px-2 py-3">{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rowNames.map((rowName, index) => (
                                <tr key={rowName} className={index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')}>
                                    <th scope="row" className={`px-2 py-4 font-medium whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'}`}>{rowName}</th>
                                    {Object.values(data[rowName]).map((value, index) => (
                                        <td key={index} className="px-2 py-4 text-center">{rowName === 'Percentage' ? `${value.toFixed(2)}%` : rowName === 'Average CTC' ? `${value} LPA` : value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        } else if (dataType === 'cgpaAnalysis') {
            if (!data.departmentWise) return null;

            const departments = Object.keys(data.departmentWise);

            return (
                <div>
                    <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        CGPA Analysis (Above {inputCGPA})
                    </h3>
                    <div className="overflow-x-auto shadow-md sm:rounded-lg">
                        <table className={`w-full text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-segoe`}>
                            <thead className={`text-xs uppercase ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>
                                <tr>
                                    <th scope="col" className="px-2 py-3">Branch</th>
                                    {departments.map(dept => (
                                        <th key={dept} scope="col" className="px-2 py-3">{dept}</th>
                                    ))}
                                    <th scope="col" className="px-2 py-3">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {['Total', 'Placed', 'Unplaced'].map((category, index) => (
                                    <tr key={category} className={index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')}>
                                        <th scope="row" className={`px-2 py-4 font-medium whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'}`}>{category}</th>
                                        {departments.map(dept => (
                                            <td key={`${dept}-${category}`} className="px-2 py-4 text-center">
                                                {data.departmentWise[dept][category.toLowerCase()]}
                                            </td>
                                        ))}
                                        <td className="px-2 py-4 font-bold text-center">
                                            {data.totals[category.toLowerCase()]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
    };

    const renderOffers = (offers) => {
        return (
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className={`w-full text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-segoe`}>
                    <thead className={`text-xs uppercase ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>
                        <tr>
                            <th scope="col" className="px-2 py-3">Roll No</th>
                            <th scope="col" className="px-2 py-3">Branch</th>
                            <th scope="col" className="px-2 py-3">Name</th>
                            <th scope="col" className="px-2 py-3">Company Name</th>
                            <th scope="col" className="px-2 py-3">Role</th>
                            <th scope="col" className="px-2 py-3">CTC</th>
                            {dataType === 'fteOffers' && <th scope="col" className="px-2 py-3">Stipend</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {offers.map((offer, index) => (
                            <tr key={index} className={index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')}>
                                <td className="px-2 py-4">{offer.rollNo}</td>
                                <td className="px-2 py-4">{offer.branch}</td>
                                <td className="px-2 py-4">{offer.name}</td>
                                <td className="px-2 py-4">{offer.companyName}</td>
                                <td className="px-2 py-4">{offer.role}</td>
                                <td className="px-2 py-4">{offer.ctc}</td>
                                {dataType === 'fteOffers' && <td className="px-2 py-4">{offer.stipend}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const handleLogout = () => {
        window.location.reload();
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'} font-sans`}>
            {/* Header */}
            <header className="bg-[#212121] text-white p-5 flex justify-between items-center font-helvetica">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="mr-4 text-2xl md:hidden">
                        <FaBars />
                    </button>
                    <h1 className="text-3xl font-bold">TNP RM</h1>
                </div>
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
                <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r text-gray-700 p-6 overflow-y-auto font-helvetica`}>
                    <div className="flex flex-col items-center mb-8">
                        <div className={`w-20 h-20  rounded-full flex items-center justify-center mb-2`}>
                            <img src="/avatar.png" alt="Profile" className="w-full h-full rounded-full" />
                        </div>
                        <span className={`text-lg  ${darkMode ? 'text-white' : ''}`}>Admin</span>
                    </div>
                    <nav className="space-y-2">
                        <button onClick={() => { setDataType('fte'); setSidebarOpen(false); }} className={`flex items-center w-full py-2 px-4 text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded ${dataType === 'fte' ? (darkMode ? 'text-white' : 'text-gray-900') : (darkMode ? 'text-[#6B778C]' : 'text-[#6B778C]')}`}>
                            <FaBriefcase className={`mr-3 ${dataType === 'fte' ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-[#6B778C]'}`} /> FTE Data
                        </button>
                        <button onClick={() => { setDataType('ppo'); setSidebarOpen(false); }} className={`flex items-center w-full py-2 px-4 text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded ${dataType === 'ppo' ? (darkMode ? 'text-white' : 'text-gray-900') : (darkMode ? 'text-[#6B778C]' : 'text-[#6B778C]')}`}>
                            <FaClipboardList className={`mr-3 ${dataType === 'ppo' ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-[#6B778C]'}`} /> PPO Data
                        </button>
                        <button onClick={() => { setDataType('stats'); setSidebarOpen(false); }} className={`flex items-center w-full py-2 px-4 text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded ${dataType === 'stats' ? (darkMode ? 'text-white' : 'text-gray-900') : (darkMode ? 'text-[#6B778C]' : 'text-[#6B778C]')}`}>
                            <FaChartBar className={`mr-3 ${dataType === 'stats' ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-[#6B778C]'}`} /> Stats
                        </button>
                        <button onClick={() => { setDataType('cgpaAnalysis'); setSidebarOpen(false); }} className={`flex items-center w-full py-2 px-4 text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded ${dataType === 'cgpaAnalysis' ? (darkMode ? 'text-white' : 'text-gray-900') : (darkMode ? 'text-[#6B778C]' : 'text-[#6B778C]')}`}>
                            <FaGraduationCap className={`mr-3 ${dataType === 'cgpaAnalysis' ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-[#6B778C]'}`} /> CGPA Analysis
                        </button>
                        <button onClick={() => { setDataType('fteOffers'); setSidebarOpen(false); }} className={`flex items-center w-full py-2 px-4 text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded ${dataType === 'fteOffers' ? (darkMode ? 'text-white' : 'text-gray-900') : (darkMode ? 'text-[#6B778C]' : 'text-[#6B778C]')}`}>
                            <FaFileAlt className={`mr-3 ${dataType === 'fteOffers' ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-[#6B778C]'}`} /> FTE Offers
                        </button>
                        <button onClick={() => { setDataType('ppoOffers'); setSidebarOpen(false); }} className={`flex items-center w-full py-2 px-4 text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded ${dataType === 'ppoOffers' ? (darkMode ? 'text-white' : 'text-gray-900') : (darkMode ? 'text-[#6B778C]' : 'text-[#6B778C]')}`}>
                            <FaFileContract className={`mr-3 ${dataType === 'ppoOffers' ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-[#6B778C]'}`} /> PPO Offers
                        </button>
                        <div className={`mt-4 p-4 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} rounded`}>
                            <p className="text-sm font-semibold">Total Placed</p>
                            {isAuthenticated ? (
                                <>
                                    <p className="text-lg font-bold">{((totalPlaced / 2615) * 100).toFixed(2)}%</p>
                                    <p className="text-xs">{totalPlaced} / 2615</p>
                                </>
                            ) : (
                                <p className="text-lg font-bold">Login to view</p>
                            )}
                        </div>
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
                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="mt-8">
                                <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {dataType === 'fte' ? 'FTE (Full Time + 6 Month Intern) Data' :
                                        dataType === 'ppo' ? 'PPO (Pre Placement Offers) Data' :
                                            dataType === 'stats' ? 'Stats' :
                                                dataType === 'cgpaAnalysis' ? 'CGPA Analysis' :
                                                    dataType === 'fteOffers' ? 'FTE Offers' :
                                                        dataType === 'ppoOffers' ? 'PPO Offers' : ''}
                                </h3>
                                {dataType === 'cgpaAnalysis' ? (
                                    <div className="mb-4">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="10"
                                            value={inputCGPA}
                                            onChange={(e) => setInputCGPA(e.target.value)}
                                            placeholder="Enter CGPA"
                                            className={`w-full px-4 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                        <button
                                            onClick={fetchCGPAAnalysis}
                                            className={`mt-4 px-6 py-2 font-bold text-white ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-700'} rounded focus:outline-none focus:shadow-outline`}
                                        >
                                            Analyze
                                        </button>
                                        {renderTable(activeData)}
                                    </div>
                                ) : dataType === 'fteOffers' ? (
                                    renderOffers(fteOffers)
                                ) : dataType === 'ppoOffers' ? (
                                    renderOffers(ppoOffers)
                                ) : (
                                    renderTable(activeData)
                                )}
                            </div>
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