import React from "react";

function Load() {
  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-hidden bg-[#001f3f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(15,110,86,0.35),_transparent_45%)]" />
      <div className="relative flex flex-col items-center gap-7">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-emerald-300/30 bg-white/5 shadow-[0_0_60px_rgba(45,212,191,0.18)]">
          <span className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-emerald-300 border-r-emerald-300" />
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-2xl font-black text-[#001f3f] animate-pulse">
            M
          </span>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold tracking-[0.24em] text-white">
            MADA MARITIME
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-200/70">
            Initialisation du portail
          </p>
        </div>
        <div className="h-1 w-36 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[loadingBar_1.2s_ease-in-out_infinite] rounded-full bg-emerald-300" />
        </div>
      </div>
    </div>
  );
}

export default Load;
