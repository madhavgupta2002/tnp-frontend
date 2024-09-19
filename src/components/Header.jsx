import React from 'react';
import { FaBars, FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa';

function Header({ darkMode, toggleDarkMode, handleLogout, toggleSidebar }) {
    return (
        <header className="bg-[#212121] text-white p-5 flex justify-between items-center font-helvetica">
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="mr-4 text-2xl md:hidden">
                    <FaBars />
                </button>
                <h1 className="text-3xl font-bold">DTU TNP</h1>
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
    );
}

export default Header;