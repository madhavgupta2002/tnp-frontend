// Shared class helpers so every view applies the same light/dark palette via the `darkMode` prop.

export const chipClass = (active, darkMode) =>
    `mr-1 mb-1 px-2.5 py-1 text-xs sm:text-sm rounded transition-colors ${active
        ? (darkMode ? 'bg-white text-gray-900' : 'bg-black text-white')
        : (darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300')}`;

export const inputClass = (darkMode) =>
    `px-3 py-2 rounded border text-sm ${darkMode
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 [color-scheme:dark]'
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`;

export const secondaryButtonClass = (darkMode) =>
    `px-4 py-2 text-sm rounded ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`;

export const primaryButtonClass = (darkMode) =>
    `px-6 py-2 font-bold text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-700'}`;

export const tableClass = (darkMode) =>
    `w-full text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`;

export const theadClass = (darkMode) =>
    `text-xs uppercase ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`;

// Text color for rows that carry a saturated category fill (blue-200 / blue-800 etc.).
export const filledRowText = (darkMode) => (darkMode ? 'text-gray-100' : 'text-gray-900');

export const stripedRowClass = (index, darkMode) =>
    index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50');

export const statTileClass = (darkMode) =>
    `px-3 py-2 rounded flex flex-col items-center ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`;

export const sectionTitleClass = (darkMode) =>
    `text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`;
