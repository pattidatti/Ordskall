import React from 'react';

interface InflectionTableProps {
  inflections: string[];
}

export const InflectionTable: React.FC<InflectionTableProps> = ({ inflections }) => {
  if (!inflections || inflections.length === 0) return null;

  return (
    <div className="mt-2">
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-400 mb-3">
        Bøyning & Former
      </h3>
      <div className="flex flex-wrap gap-2">
        {inflections.map((form, index) => (
          <span 
            key={index}
            className="px-4 py-1.5 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-600 shadow-sm hover:border-emerald-200 hover:text-emerald-700 transition-colors cursor-default"
          >
            {form}
          </span>
        ))}
      </div>
    </div>
  );
};