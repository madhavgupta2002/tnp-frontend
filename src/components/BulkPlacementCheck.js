import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_BASE_URL = 'https://tnp-backend.vercel.app';

function BulkPlacementCheck({ darkMode }) {
    const [rollNumbers, setRollNumbers] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Split the input by newlines and filter out empty lines
            const rollNumberList = rollNumbers
                .split('\n')
                .map(roll => roll.trim())
                .filter(roll => roll.length > 0);

            if (rollNumberList.length === 0) {
                setError('Please enter at least one roll number');
                return;
            }
            const response = await axios.post(`${BACKEND_BASE_URL}/check-placement-status`, {
                rollNumbers: rollNumberList
            }, {
                headers: {
                    'Authorization': 'Basic c2hpdmE='
                }
            });

            setResults(response.data);
        } catch (error) {
            setError('Error checking placement status. Please try again.');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const placedStudents = results.filter(result => result.placed);
    const unplacedStudents = results.filter(result => !result.placed);

    return (
        <div className="container mx-auto p-4">
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bulk Placement Status Check</h2>

            <div className="mb-8">
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="mb-4">
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Enter Roll Numbers (one per line)
                        </label>
                        <textarea
                            value={rollNumbers}
                            onChange={(e) => setRollNumbers(e.target.value)}
                            className={`w-full h-48 p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Enter roll numbers here&#10;2K21/CO/001&#10;2K21/EC/12"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 font-bold text-white rounded focus:outline-none focus:shadow-outline ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? 'Checking...' : 'Check Status'}
                    </button>
                </form>

                {error && (
                    <div className="text-red-500 mb-4">
                        {error}
                    </div>
                )}
            </div>

            {results.length > 0 && (
                <div className="grid grid-cols-1 gap-8">
                    <div>
                        <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                            Placed Students ({placedStudents.length})
                        </h3>
                        <div className="overflow-x-auto shadow-md sm:rounded-lg">
                            <table className={`min-w-full text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-segoe`}>
                                <thead className={`text-xs uppercase ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>
                                    <tr>
                                        <th className="px-6 py-3 border-b text-left">Roll Number</th>
                                        <th className="px-6 py-3 border-b text-left">Name</th>
                                        <th className="px-6 py-3 border-b text-left">Offers</th>
                                    </tr>
                                </thead>
                                <tbody className={darkMode ? 'bg-gray-700' : 'bg-white'}>
                                    {placedStudents.map((student) => (
                                        <tr key={student.rollNumber} className={`${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                            <td className="px-6 py-4">{student.rollNumber}</td>
                                            <td className="px-6 py-4">{student.name}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-row gap-4 overflow-x-auto">
                                                    {student.offers.map((offer, idx) => (
                                                        <div key={idx} className={`flex-shrink-0 p-2 rounded ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50'}`}>
                                                            <div><span className="font-semibold">Company:</span> {offer.company}</div>
                                                            <div><span className="font-semibold">Type:</span> {offer.type}</div>
                                                            <div><span className="font-semibold">Role:</span> {offer.role}</div>
                                                            <div><span className="font-semibold">CTC:</span> {offer.ctc}</div>
                                                            <div><span className="font-semibold">Stipend:</span> {offer.stipend}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                            Unplaced Students ({unplacedStudents.length})
                        </h3>
                        <div className="overflow-x-auto shadow-md sm:rounded-lg">
                            <table className={`min-w-full text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-segoe`}>
                                <thead className={`text-xs uppercase ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700'}`}>
                                    <tr>
                                        <th className="px-6 py-3 border-b text-left">Roll Number</th>
                                        <th className="px-6 py-3 border-b text-left">Name</th>
                                        <th className="px-6 py-3 border-b text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className={darkMode ? 'bg-gray-700' : 'bg-white'}>
                                    {unplacedStudents.map((student) => (
                                        <tr key={student.rollNumber} className={`${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                            <td className="px-6 py-4">{student.rollNumber}</td>
                                            <td className="px-6 py-4">{student.name}</td>
                                            <td className={`px-6 py-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>No offers yet</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BulkPlacementCheck;