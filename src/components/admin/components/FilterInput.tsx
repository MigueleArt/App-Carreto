// src/components/admin/components/FilterInput.tsx
import React from 'react';

const FilterInput = ({ label, name, value, onChange, type, disabled = false, children = null }: any) => (
    <div className="w-full">
        <label htmlFor={name} className="block mb-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</label>
        {type === 'select' ? (
            <select id={name} name={name} value={value} onChange={onChange} disabled={disabled} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {children}
            </select>
        ) : (
            <input id={name} name={name} type={type} value={value} onChange={onChange} disabled={disabled} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
        )}
    </div>
);

export { FilterInput };