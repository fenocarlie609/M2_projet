// src/features/users/components/GrantAccessModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button } from "@/shared/components/ui";

export function GrantAccessModal({
  isOpen,
  onClose,
  employees,
  onAccessGranted,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({ employeeId: "", email: "", password: "" });
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onAccessGranted(formData.employeeId, {
        email: formData.email,
        password: formData.password,
      });
      setFormData({ employeeId: "", email: "", password: "" });
    } catch (error) {
      console.error("Erreur lors de l'attribution de l'accès :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Donner l'accès à l'application"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Employé
          </label>
          <select
            name="employeeId"
            required
            value={formData.employeeId}
            onChange={handleInputChange}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            <option value="" disabled>
              Sélectionner un employé sans accès...
            </option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} — {emp.position} ({emp.matricule})
              </option>
            ))}
          </select>
          {employees.length === 0 && (
            <p className="mt-1.5 text-xs text-slate-500">
              Tous les employés ont déjà un accès, ou aucun employé n'existe
              encore.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Adresse Email
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Ex: john.doe@example.com"
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mot de passe initial
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            value={formData.password}
            onChange={handleInputChange}
            placeholder="8 caractères minimum"
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !formData.employeeId}
          >
            {isSubmitting ? "Attribution..." : "Donner l'accès"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
