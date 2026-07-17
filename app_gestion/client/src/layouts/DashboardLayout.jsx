import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans">
      {/* Sidebar - Reçoit l'état pour le contrôle sur Mobile */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Zone de contenu principale (Glisse à droite sur Desktop grâce au pl-64) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Header supérieur */}
        <Header onMenuToggle={() => setSidebarOpen(true)} />

        {/* Zone "Main" - Là où s'injecteront nos futurs modules */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto animate-[fadeIn_0.3s_ease-out]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
