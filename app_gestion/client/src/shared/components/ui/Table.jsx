// src/shared/components/Table.jsx
import React, { useState, useMemo } from "react";
// 1. Importation de ton composant DropdownMenu
import { DropdownMenu } from "@/shared/components/ui";
import { FiEye } from "react-icons/fi"; // Optionnel : pour une icône sympa pour les colonnes

export const Table = ({
  columns,
  data = [],
  isLoading = false,
  emptyMessage = "Aucune donnée disponible",
  initialRowsPerPage = 5,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce(
      (acc, col, index) => ({ ...acc, [col.key || index]: true }),
      {},
    ),
  );
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // --- LOGIQUE DE RECHERCHE & TRI (Identique) ---
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.render ? col.render(row) : row[col.key];
        if (val === null || val === undefined) return false;
        const stringVal =
          typeof val === "object" ? "" : String(val).toLowerCase();
        return stringVal.includes(lowerSearch);
      }),
    );
  }, [data, searchTerm, columns]);

  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === "string" && typeof valB === "string") {
          return sortConfig.direction === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // --- LOGIQUE DE PAGINATION ---
  const totalPages = Math.ceil(sortedData.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const activeColumns = columns.filter(
    (col, index) => visibleColumns[col.key || index],
  );

  const toggleColumn = (key) => {
    setVisibleColumns((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const hasVisible = Object.values(next).some(Boolean);
      return hasVisible ? next : prev;
    });
  };

  const requestSort = (key) => {
    if (!key) return;
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 2. 🔥 Transformation de tes colonnes en items compatibles avec ton DropdownMenu
  // On crée un tableau d'objets avec un label dynamique (case cochée ou non)
  const dropdownColumnItems = columns.map((col, index) => {
    const colKey = col.key || index;
    const isVisible = !!visibleColumns[colKey];
    return {
      label: `${isVisible ? "✓ " : "  "} ${col.header}`,
      icon: FiEye,
      onClick: () => toggleColumn(colKey),
    };
  });

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ================= BARRE D'OUTILS SUPÉRIEURE ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Recherche */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Rechercher dans le tableau..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          />
        </div>

        {/* 3. 🔥 Remplacement de l'ancien Dropdown par ton composant réutilisable */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">
            Colonnes :
          </span>
          <DropdownMenu items={dropdownColumnItems} />
        </div>
      </div>

      {/* ================= CONTENEUR DE LA TABLE ORIGINAL ================= */}
      <div className="w-full bg-white border border-slate-200/60 rounded-2xl shadow-premium overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/60">
                {activeColumns.map((col, index) => {
                  const isSorted = sortConfig.key === col.key;
                  return (
                    <th
                      key={index}
                      onClick={() => requestSort(col.key)}
                      className={`px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500 select-none ${
                        col.key
                          ? "cursor-pointer hover:bg-slate-100/60 transition-colors"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {col.key && (
                          <span
                            className={`transition-transform duration-200 text-slate-400 ${
                              isSorted && sortConfig.direction === "desc"
                                ? "rotate-180"
                                : ""
                            }`}
                          >
                            <svg
                              className={`w-3 h-3 ${isSorted ? "text-brand-primary font-bold" : "opacity-30"}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(rowsPerPage)].map((_, rowIndex) => (
                  <tr key={rowIndex} className="animate-pulse">
                    {activeColumns.map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4.5">
                        <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeColumns.length}
                    className="px-6 py-12 text-center text-sm text-slate-400 font-medium"
                  >
                    {searchTerm ? "Aucun résultat trouvé" : emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {activeColumns.map((col, colIndex) => (
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

      {/* ================= BARRE DE PAGINATION INFERIEURE ================= */}
      {!isLoading && sortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Afficher</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-hidden"
            >
              {[5, 10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>
              lignes sur{" "}
              <strong className="text-slate-700">{sortedData.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="flex items-center gap-1 text-sm font-semibold">
              <span className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-xl">
                {currentPage}
              </span>
              <span className="text-slate-400 font-normal">/</span>
              <span className="px-2 text-slate-600">{totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
