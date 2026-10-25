import React from 'react';
import { FaBars, FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa';

function Header({ darkMode, toggleDarkMode, handleLogout, toggleSidebar, sidebarOpen }) {
    return (
        <header className="bg-[#212121] text-white p-5 flex justify-between items-center font-helvetica">
            <div className="flex items-center">
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="mr-4 text-2xl md:hidden"
                    aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={!!sidebarOpen}
                    aria-controls="sidebar-nav"
                >
                    <FaBars aria-hidden="true" />
                </button>
                <h1 className="text-3xl font-bold">DTU TNP</h1>
            </div>
            <div className="flex items-center">
                <button
                    type="button"
                    onClick={toggleDarkMode}
                    className="mr-5 text-2xl"
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    aria-pressed={!!darkMode}
                >
                    {darkMode ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
                </button>
                <button type="button" onClick={handleLogout} className="flex items-center text-xl" aria-label="Logout">
                    <FaSignOutAlt className="mr-2" aria-hidden="true" /> Logout
                </button>
            </div>
        </header>
    );
}

export default Header;
