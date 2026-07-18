// src/shared/components/Table.jsx
import React from "react";

export const Table = ({
  columns, // Array of { header: 'Nom', key: 'name', render: (row) => ... }
  data = [],
  isLoading = false,
  emptyMessage = "Aucune donnée disponible",
}) => {
  return (
    <div className="w-full bg-white border border-slate-200/60 rounded-2xl shadow-premium overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          {/* En-tête de la table */}
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200/60">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Corps de la table */}
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              // Mode Chargement : Lignes de Squelettes animés (Skeleton)
              [...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4.5">
                      <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Mode Vide
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-slate-400 font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              // Mode Données réelles
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4.5 text-sm text-slate-700 font-medium whitespace-nowrap"
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
