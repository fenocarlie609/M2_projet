// src/shared/components/ui/Calendar.jsx
import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export const Calendar = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: adjustedFirstDay }, (_, i) => null);

  const handleDateClick = (day) => {
    const d = new Date(year, month, day);
    setSelectedDate(d);
    if (onDateSelect) onDateSelect(d);
  };

  return (
    <div className="w-full max-w-[280px] bg-white p-3.5 sm:p-4 border border-slate-200/60 rounded-xl shadow-premium">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          {monthNames[month]} {year}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 cursor-pointer"
          >
            <FiChevronLeft size={14} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 cursor-pointer"
          >
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase mb-2">
        <span>Lu</span>
        <span>Ma</span>
        <span>Me</span>
        <span>Je</span>
        <span>Ve</span>
        <span>Sa</span>
        <span>Di</span>
      </div>
      <div className="grid grid-cols-7 gap-1 justify-items-center">
        {[...blanks, ...daysArray].map((day, idx) => {
          const isSelected =
            day &&
            selectedDate &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year;
          return (
            <button
              key={idx}
              disabled={!day}
              onClick={() => handleDateClick(day)}
              className={`h-7 w-7 sm:h-8 sm:w-8 text-xs font-medium rounded-lg transition-colors flex items-center justify-center cursor-pointer
                ${!day ? "bg-transparent pointer-events-none" : ""}
                ${isSelected ? "bg-brand-primary text-white font-bold" : "text-slate-700 hover:bg-slate-100"}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
