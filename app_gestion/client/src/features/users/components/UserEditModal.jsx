// src/features/user/components/UserEditModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button } from "@/shared/components/ui";

export function UserEditModal({
  isOpen,
  onClose,
  onUserUpdated,
  selectedUser,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "USER",
  });

  // Synchro de l'état local dès que la modale s'ouvre avec un utilisateur sélectionné
  useEffect(() => {
    if (selectedUser) {
      setFormData({
        name: selectedUser.name || "",
        email: selectedUser.email || "",
        role: selectedUser.role || "USER",
      });
    }
  }, [selectedUser, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // On passe l'ID en plus des données modifiées pour que le parent sache qui update côté API
      await onUserUpdated(selectedUser.id, formData);
      onClose(); // Fermeture propre
    } catch (error) {
      console.error("Erreur lors de la modification de l'utilisateur :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Modifier l'utilisateur : ${selectedUser?.name || ""}`}
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
            placeholder="Ex: John Doe"
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
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
            Rôle système
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            <option value="USER">Utilisateur (USER)</option>
            <option value="ADMIN">Administrateur (ADMIN)</option>
            <option value="SUPERADMIN">
              Super Administrateur (SUPERADMIN)
            </option>
          </select>
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
