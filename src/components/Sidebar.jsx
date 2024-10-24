import React from 'react';
import { FaChartLine, FaBriefcase, FaClipboardList, FaChartBar, FaGraduationCap, FaFileAlt, FaUserGraduate, FaListAlt } from 'react-icons/fa';

function Sidebar({ darkMode, dataType, setDataType, sidebarOpen, setSidebarOpen, totalPlaced, isAuthenticated }) {
    const navItems = [
        { type: 'combinedOffers', icon: FaFileAlt, label: 'Job Offers' },
        { type: 'fte', icon: FaBriefcase, label: 'Companywise FTE' },
        { type: 'ppo', icon: FaClipboardList, label: 'Companywise PPO' },
        { type: 'jobListing', icon: FaListAlt, label: 'Job Listing' },
        { type: 'unplacedStudents', icon: FaUserGraduate, label: 'Unplaced Students' },
        { type: 'stats', icon: FaChartBar, label: 'Stats' },
        { type: 'cgpaAnalysis', icon: FaGraduationCap, label: 'CGPA Analysis' },
        { type: 'salaryDistribution', icon: FaChartLine, label: 'Salary Distribution' },

    ];

    return (
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r text-gray-700 p-6 overflow-y-auto font-helvetica`}>
            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2">
                    <img src="/avatar.png" alt="Profile" className="w-full h-full rounded-full" />
                </div>
                <span className={`text-lg ${darkMode ? 'text-white' : ''}`}>Admin</span>
            </div>
            <nav className="space-y-2">
                {navItems.map(({ type, icon: Icon, label }) => (
                    <button
                        key={type}
                        onClick={() => { setDataType(type); setSidebarOpen(false); }}
                        className={`flex items-center w-full py-2 px-4 text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded ${dataType === type ? (darkMode ? 'text-white' : 'text-gray-900') : (darkMode ? 'text-[#6B778C]' : 'text-[#6B778C]')}`}
                    >
                        <Icon className={`mr-3 ${dataType === type ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-[#6B778C]'}`} /> {label}
                    </button>
                ))}
            </nav>
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
        </div>
    );
}

export default Sidebar;
