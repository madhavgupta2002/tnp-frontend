import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AuthForm from './components/AuthForm';
import DataTable from './components/DataTable';
import OfferTable from './components/OfferTable';
import CGPAAnalysis from './components/CGPAAnalysis';

const BACKEND_BASE_URL = 'https://tnp-backend.vercel.app';
// const BACKEND_BASE_URL = 'http://localhost:3000';

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
    const [inputCGPALower, setInputCGPALower] = useState('');
    const [inputCGPAUpper, setInputCGPAUpper] = useState('');
    const [fteOffers, setFteOffers] = useState([]);
    const [ppoOffers, setPpoOffers] = useState([]);
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

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
            const lowerResponse = await axios.get(`${BACKEND_BASE_URL}/students-above-cgpa/${inputCGPALower}`, {
                headers: {
                    'Authorization': `Basic ${btoa(password)}`
                }
            });
            const upperResponse = await axios.get(`${BACKEND_BASE_URL}/students-above-cgpa/${inputCGPAUpper}`, {
                headers: {
                    'Authorization': `Basic ${btoa(password)}`
                }
            });

            // Calculate the difference between upper and lower bounds
            const rangeDiff = calculateRangeDifference(lowerResponse.data, upperResponse.data);

            setCgpaAnalysisData(rangeDiff);
            setActiveData(rangeDiff); // Set activeData to the CGPA range analysis data
        } catch (error) {
            console.error('Error fetching CGPA analysis data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateRangeDifference = (lowerData, upperData) => {
        const result = {
            departmentWise: {},
            totals: {
                total: 0,
                placed: 0,
                unplaced: 0
            }
        };

        for (const dept in lowerData.departmentWise) {
            const lowerDept = lowerData.departmentWise[dept];
            const upperDept = upperData.departmentWise[dept] || { total: 0, placed: 0, unplaced: 0 };

            result.departmentWise[dept] = {
                total: lowerDept.total - upperDept.total,
                placed: lowerDept.placed - upperDept.placed,
                unplaced: lowerDept.unplaced - upperDept.unplaced
            };

            result.totals.total += result.departmentWise[dept].total;
            result.totals.placed += result.departmentWise[dept].placed;
            result.totals.unplaced += result.departmentWise[dept].unplaced;
        }

        return result;
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

    const sortOffers = (offers, column) => {
        return [...offers].sort((a, b) => {
            let valueA = a[column];
            let valueB = b[column];

            // Handle special cases for CTC and Stipend
            if (column === 'ctc' || column === 'stipend') {
                valueA = valueA ? parseFloat(valueA.replace(/[^\d.]/g, '')) : 0;
                valueB = valueB ? parseFloat(valueB.replace(/[^\d.]/g, '')) : 0;
            }

            if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
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
            <Header
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                handleLogout={handleLogout}
                toggleSidebar={toggleSidebar}
            />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    darkMode={darkMode}
                    dataType={dataType}
                    setDataType={setDataType}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    totalPlaced={totalPlaced}
                    isAuthenticated={isAuthenticated}
                />

                <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                    <div className="p-8">
                        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>DTU 2025 FTE Placement Statistics (B.Tech)</h2>
                        {!isAuthenticated ? (
                            <AuthForm
                                password={password}
                                setPassword={setPassword}
                                handlePasswordSubmit={handlePasswordSubmit}
                                darkMode={darkMode}
                            />
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
                                    <CGPAAnalysis
                                        inputCGPALower={inputCGPALower}
                                        setInputCGPALower={setInputCGPALower}
                                        inputCGPAUpper={inputCGPAUpper}
                                        setInputCGPAUpper={setInputCGPAUpper}
                                        fetchCGPAAnalysis={fetchCGPAAnalysis}
                                        activeData={activeData}
                                        darkMode={darkMode}
                                    />
                                ) : dataType === 'fteOffers' ? (
                                    <OfferTable
                                        offers={fteOffers}
                                        dataType={dataType}
                                        darkMode={darkMode}
                                        sortColumn={sortColumn}
                                        sortDirection={sortDirection}
                                        handleSort={handleSort}
                                    />
                                ) : dataType === 'ppoOffers' ? (
                                    <OfferTable
                                        offers={ppoOffers}
                                        dataType={dataType}
                                        darkMode={darkMode}
                                        sortColumn={sortColumn}
                                        sortDirection={sortDirection}
                                        handleSort={handleSort}
                                    />
                                ) : (
                                    <DataTable
                                        data={activeData}
                                        dataType={dataType}
                                        darkMode={darkMode}
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        showAverageCGPA={showAverageCGPA}
                                        setShowAverageCGPA={setShowAverageCGPA}
                                        showCTC={showCTC}
                                        setShowCTC={setShowCTC}
                                        averageCGPAData={averageCGPAData}
                                        ctcData={ctcData}
                                        sortColumn={sortColumn}
                                        sortDirection={sortDirection}
                                        handleSort={handleSort}
                                    />
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
