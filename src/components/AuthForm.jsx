import React from 'react';

function AuthForm({ password, setPassword, handlePasswordSubmit, darkMode }) {
    return (
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
    );
}

export default AuthForm;