// src/components/admin/components/KpiCard.tsx
import React from 'react';

const KpiCard = ({ title, value, icon, colorClass = 'emerald' }: { title: string, value: string | number, icon: React.ReactNode, colorClass?: string }) => {
    // Nota: Tailwind dinámico necesita clases completas, por eso las pasamos
    const bgClass = `bg-${colorClass}-100 dark:bg-${colorClass}-900/50`;
    const textClass = `text-${colorClass}-600 dark:text-${colorClass}-400`;
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg">
            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center ${bgClass} ${textClass} rounded-full`}>
                {icon}
            </div>
            <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate uppercase tracking-wider">{title}</dt>
                <dd className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</dd>
            </div>
        </div>
    );
};

export { KpiCard };