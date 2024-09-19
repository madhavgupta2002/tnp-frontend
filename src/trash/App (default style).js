import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [activeData, setActiveData] = useState(null);
    const [dataType, setDataType] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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
                return <div>No data available for stats</div>;
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

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 flex flex-col justify-center">
            <div className="container mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-3xl p-8">
                    <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-white">DTU 2025 FTE Placement Statistics (B.Tech)</h1>
                    {!isAuthenticated ? (
                        <form onSubmit={handlePasswordSubmit} className="mb-8">
                            <input
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="mt-4 px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out">
                                Submit
                            </button>
                        </form>
                    ) : (
                        <div className="flex justify-center space-x-4 mb-8">
                            <button onClick={() => setDataType('fte')} className="px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out">
                                FTE Data (Full Time + 6 Month Intern)
                            </button>
                            <button onClick={() => setDataType('ppo')} className="px-4 py-2 font-bold text-white bg-green-500 rounded-full hover:bg-green-700 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out">
                                PPO Data (Pre Placement Offers)
                            </button>
                            <button onClick={() => setDataType('stats')} className="px-4 py-2 font-bold text-white bg-purple-500 rounded-full hover:bg-purple-700 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out">
                                Stats
                            </button>
                        </div>
                    )}
                    {activeData && dataType !== 'stats' && (
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search by company name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                    {activeData && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-white">
                                {dataType === 'fte' ? 'FTE (Full Time + 6 Month Intern) Data' :
                                    dataType === 'ppo' ? 'PPO (Pre Placement Offers) Data' :
                                        'Stats'}
                            </h2>
                            {renderTable(activeData)}
                        </div>
                    )}
                    <footer className="mt-8 text-center text-gray-600">
                        Last updated on: {lastUpdated}
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default App;
