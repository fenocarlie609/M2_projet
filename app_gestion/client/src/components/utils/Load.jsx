import React from "react";

function Load({ text }) {
  return (
    <div className="p-6 text-nano-blue font-black uppercase italic w-full text-center h-full flex items-center justify-center">
      {text || "Recuperation des donnees..."}
    </div>
  );
}

export default Load;
