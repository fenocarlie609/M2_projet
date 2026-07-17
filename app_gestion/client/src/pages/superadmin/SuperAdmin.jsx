import React from "react";

function SuperAdmin() {
  return (
    <div className="min-h-[60vh] rounded-3xl bg-white p-8 shadow-sm text-slate-900">
      <h1 className="text-2xl font-semibold mb-4">Espace Superadmin</h1>
      <p className="text-sm text-slate-600 leading-relaxed">
        Cette page est réservée aux utilisateurs disposant du rôle{" "}
        <strong>SUPERADMIN</strong>. Tu peux y placer les outils de
        configuration globale et les paramètres critiques.
      </p>
    </div>
  );
}

export default SuperAdmin;
