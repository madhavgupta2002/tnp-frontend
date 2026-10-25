import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DataTable from './components/DataTable';
import OfferTable from './components/OfferTable';
import CGPAAnalysis from './components/CGPAAnalysis';
import SalaryDistribution from './components/SalaryDistribution';
import UnplacedStudents from './components/UnplacedStudents';
import JobListing from './components/JobListing';
import CombinedOffersTable from './components/CombinedOffersTable';
import BulkPlacementCheck from './components/BulkPlacementCheck';


// const BACKEND_BASE_URL = 'http://localhost:3000';
const BACKEND_BASE_URL = 'https://tnp-backend.vercel.app';

function App() {
    const [activeData, setActiveData] = useState(null);
    const [dataType, setDataType] = useState('stats');
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');
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
    const [salaryData, setSalaryData] = useState([]);
    const [histogramData, setHistogramData] = useState([]);
    const [salaryStatistics, setSalaryStatistics] = useState({ mean: 0, median: 0, mode: 0 });
    const [cgpaData, setCgpaData] = useState([]);
    const [jobListingData, setJobListingData] = useState(null);
    const [combinedOffers, setCombinedOffers] = useState([]);
    const [offerType, setOfferType] = useState('all'); // 'all', 'ppo', or 'fte'

    useEffect(() => {
        const fetchLastUpdated = async () => {
            try {
                const response = await axios.get(`${BACKEND_BASE_URL}/last-updated`);
                const date = new Date(response.data && response.data.lastUpdated);
                if (!Number.isNaN(date.getTime())) {
                    setLastUpdated(date.toLocaleString());
                }
            } catch (error) {
                console.error('Error fetching last updated date:', error);
            }
        };
        fetchLastUpdated();
    }, []);

    useEffect(() => {
        fetchTotalPlaced();
    }, []);

    useEffect(() => {
        // Only these sections have a generic `/${dataType}` endpoint; the others fetch their own data below.
        if (dataType === 'stats' || dataType === 'fte' || dataType === 'ppo') {
            fetchData(dataType);
        }
        // Per-company CGPA / CTC lookups exist only for the company-wise FTE / PPO tables.
        if (dataType === 'fte' || dataType === 'ppo') {
            fetchAverageCGPAData(dataType);
            fetchCTCData(dataType);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataType]);

    useEffect(() => {
        if (dataType === 'fteOffers') {
            fetchFteOffers();
        } else if (dataType === 'ppoOffers') {
            fetchPpoOffers();
        }
    }, [dataType]);

    useEffect(() => {
        if (dataType === 'salaryDistribution') {
            fetchSalaryData();
        }
    }, [dataType]);

    useEffect(() => {
        if (dataType === 'unplacedStudents') {
            fetchCGPAData();
        }
    }, [dataType]);
    useEffect(() => {
        if (dataType === 'jobListing') {
            fetchJobListingData();
        }
    }, [dataType]);

    useEffect(() => {
        if (dataType === 'combinedOffers') {
            fetchCombinedOffers();
        }
    }, [dataType]);

    const fetchJobListingData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/job-listings`);
            setJobListingData(response.data);
        } catch (error) {
            console.error('Error fetching job listing data:', error);
        } finally {
            setLoading(false);
        }
    };
    const fetchData = async (type) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/${type}`);
            setActiveData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAverageCGPAData = async (type) => {
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/selection-${type}-cgpa`);
            setAverageCGPAData(response.data);
        } catch (error) {
            console.error('Error fetching average CGPA data:', error);
        }
    };

    const fetchCTCData = async (type) => {
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/selection-${type}-ctc`);
            setCtcData(response.data);
        } catch (error) {
            console.error('Error fetching CTC data:', error);
        }
    };

    const fetchTotalPlaced = async () => {
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/total-placed`);
            setTotalPlaced(response.data.totalPlaced);
        } catch (error) {
            console.error('Error fetching total placed data:', error);
        }
    };

    const fetchCGPAAnalysis = async () => {
        setLoading(true);
        try {
            const lowerResponse = await axios.get(`${BACKEND_BASE_URL}/students-above-cgpa/${inputCGPALower}`);
            const upperResponse = await axios.get(`${BACKEND_BASE_URL}/students-above-cgpa/${inputCGPAUpper}`);

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
            const response = await axios.get(`${BACKEND_BASE_URL}/fte-offers`);
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
            const response = await axios.get(`${BACKEND_BASE_URL}/ppo-offers`);
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

    const fetchSalaryData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/ctc/all`);
            setSalaryData(response.data);
            const processedData = processData(response.data);
            setHistogramData(processedData);
            const stats = calculateStatistics(response.data.map(item => parseFloat(item.split(' ')[0])));
            setSalaryStatistics(stats);
        } catch (error) {
            console.error('Error fetching salary data:', error);
        } finally {
            setLoading(false);
        }
    };

    const processData = (rawData) => {

        return rawData.map(item => parseFloat(item.split(' ')[0]));
    };

    const calculateStatistics = (data) => {
        const sortedData = [...data].sort((a, b) => a - b);
        const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
        const median = sortedData[Math.floor(sortedData.length / 2)];
        const mode = Object.entries(
            data.reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1;
                return acc;
            }, {})
        ).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

        return { mean: parseFloat(mean.toFixed(2)), median, mode: parseFloat(mode) };
    };

    const fetchCGPAData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_BASE_URL}/cgpa`);
            setCgpaData(response.data);
        } catch (error) {
            console.error('Error fetching CGPA data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCombinedOffers = async () => {
        setLoading(true);
        try {
            const [ppoResponse, fteResponse] = await Promise.all([
                axios.get(`${BACKEND_BASE_URL}/ppo-offers`),
                axios.get(`${BACKEND_BASE_URL}/fte-offers`)
            ]);

            const ppoOffers = ppoResponse.data.map(offer => ({ ...offer, offerType: 'PPO' }));
            const fteOffers = fteResponse.data.map(offer => ({ ...offer, offerType: 'FTE' }));
            setCombinedOffers([...ppoOffers, ...fteOffers]);
        } catch (error) {
            console.error('Error fetching combined offers:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} font-sans`}>
            <Header
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                handleLogout={handleLogout}
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
            />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    darkMode={darkMode}
                    dataType={dataType}
                    setDataType={setDataType}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    totalPlaced={totalPlaced}
                />

                <main id="main-content" className={`flex-1 min-w-0 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                    <div className="p-4 sm:p-6 md:p-8">
                        <h2 className={`text-xl sm:text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>DTU 2025 FTE Placement Statistics (B.Tech)</h2>
                        {loading ? (
                            <div className="flex justify-center items-center h-32" role="status" aria-label="Loading">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div>
                                <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {dataType === 'fte' ? 'FTE (Full Time + 6 Month Intern) Data' :
                                        dataType === 'ppo' ? 'PPO (Pre Placement Offers) Data' :
                                            dataType === 'stats' ? 'Stats' :
                                                dataType === 'cgpaAnalysis' ? 'CGPA Analysis' :
                                                    dataType === 'fteOffers' ? 'FTE Offers' :
                                                        dataType === 'ppoOffers' ? 'PPO Offers' :
                                                            dataType === 'salaryDistribution' ? 'Salary Distribution' :
                                                                dataType === 'unplacedStudents' ? 'Unplaced Students' :
                                                                    dataType === 'jobListing' ? 'Job Listings' :
                                                                        dataType === 'combinedOffers' ? 'Combined Offers' :
                                                                            dataType === 'bulkCheck' ? 'Bulk Placement Check' : ''}
                                </h3>
                                {dataType === 'cgpaAnalysis' && (
                                    <CGPAAnalysis
                                        inputCGPALower={inputCGPALower}
                                        setInputCGPALower={setInputCGPALower}
                                        inputCGPAUpper={inputCGPAUpper}
                                        setInputCGPAUpper={setInputCGPAUpper}
                                        fetchCGPAAnalysis={fetchCGPAAnalysis}
                                        activeData={activeData}
                                        darkMode={darkMode}
                                    />
                                )}
                                {dataType === 'fteOffers' && (
                                    <OfferTable
                                        offers={fteOffers}
                                        dataType={dataType}
                                        darkMode={darkMode}
                                        sortColumn={sortColumn}
                                        sortDirection={sortDirection}
                                        handleSort={handleSort}
                                    />
                                )}
                                {dataType === 'ppoOffers' && (
                                    <OfferTable
                                        offers={ppoOffers}
                                        dataType={dataType}
                                        darkMode={darkMode}
                                        sortColumn={sortColumn}
                                        sortDirection={sortDirection}
                                        handleSort={handleSort}
                                    />
                                )}
                                {dataType === 'salaryDistribution' && (
                                    <SalaryDistribution
                                        darkMode={darkMode}
                                        histogramData={histogramData}
                                        statistics={salaryStatistics}
                                    />
                                )}
                                {dataType === 'unplacedStudents' && (
                                    <UnplacedStudents
                                        cgpaData={cgpaData}
                                        darkMode={darkMode}
                                    />
                                )}
                                {dataType === 'jobListing' && (
                                    <JobListing
                                        data={jobListingData}
                                        darkMode={darkMode}
                                    />
                                )}
                                {dataType === 'combinedOffers' && (
                                    <CombinedOffersTable
                                        offers={combinedOffers}
                                        offerType={offerType}
                                        setOfferType={setOfferType}
                                        darkMode={darkMode}
                                        sortColumn={sortColumn}
                                        sortDirection={sortDirection}
                                        handleSort={handleSort}
                                    />
                                )}
                                {dataType === 'bulkCheck' && (
                                    <BulkPlacementCheck darkMode={darkMode} />
                                )}
                                {dataType !== 'cgpaAnalysis' && dataType !== 'fteOffers' && dataType !== 'ppoOffers' && dataType !== 'salaryDistribution' && dataType !== 'unplacedStudents' && dataType !== 'jobListing' && dataType !== 'combinedOffers' && dataType !== 'bulkCheck' && (
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
                        <footer className={`mt-8 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Last updated on: {lastUpdated || '—'}
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
