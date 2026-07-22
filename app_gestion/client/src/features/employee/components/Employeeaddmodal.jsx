// src/features/employee/components/EmployeeAddModal.jsx
import React, { useState } from "react";
import { Modal, Button } from "@/shared/components/ui";

const emptyForm = {
  name: "",
  matricule: "",
  cin: "",
  phone: "",
  department: "",
  position: "",
};

export function EmployeeAddModal({ isOpen, onClose, onEmployeeCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // Le CIN est optionnel côté backend : on n'envoie pas une chaîne vide
      const payload = { ...formData, cin: formData.cin || undefined };
      await onEmployeeCreated(payload);
      setFormData(emptyForm);
    } catch (error) {
      console.error("Erreur lors de la création de l'employé :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un nouvel employé">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nom complet
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ex: John Doe"
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Matricule
          </label>
          <input
            type="text"
            name="matricule"
            required
            value={formData.matricule}
            onChange={handleInputChange}
            placeholder="Ex: MAT-2026-014"
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            CIN (optionnel)
          </label>
          <input
            type="text"
            name="cin"
            value={formData.cin}
            onChange={handleInputChange}
            placeholder="Ex: 101112013014"
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Téléphone (optionnel)
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Ex: 034 00 000 00"
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Département
          </label>
          <input
            type="text"
            name="department"
            required
            value={formData.department}
            onChange={handleInputChange}
            placeholder="Ex: Logistique Maritime"
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Poste
          </label>
          <input
            type="text"
            name="position"
            required
            value={formData.position}
            onChange={handleInputChange}
            placeholder="Ex: Agent de quai"
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Créer l'employé"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
