// src/features/employee/components/EmployeeEditModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button } from "@/shared/components/ui";

export function EmployeeEditModal({
  isOpen,
  onClose,
  onEmployeeUpdated,
  selectedEmployee,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    matricule: "",
    cin: "",
    phone: "",
    department: "",
    position: "",
  });

  useEffect(() => {
    if (selectedEmployee) {
      setFormData({
        name: selectedEmployee.name || "",
        matricule: selectedEmployee.matricule || "",
        cin: selectedEmployee.cin || "",
        phone: selectedEmployee.phone || "",
        department: selectedEmployee.department || "",
        position: selectedEmployee.position || "",
      });
    }
  }, [selectedEmployee, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = { ...formData, cin: formData.cin || undefined };
      await onEmployeeUpdated(selectedEmployee.id, payload);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la modification de l'employé :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Modifier l'employé : ${selectedEmployee?.name || ""}`}
    >
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
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting
              ? "Enregistrement..."
              : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
