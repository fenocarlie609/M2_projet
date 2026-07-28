import React, { useState, useEffect } from "react";
import { Modal, Button } from "@/shared/components/ui"; // Ajuste selon tes composants de UI

export function ResetPasswordModal({ isOpen, onClose, user, onConfirm }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Réinitialise le champ à l'ouverture/fermeture
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    onConfirm(password);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Réinitialiser le mot de passe"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Saisissez le nouveau mot de passe pour <strong>{user?.name}</strong>.
        </p>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium">Nouveau mot de passe</label>
          <input
            type="password"
            className="border p-2 rounded-md w-full"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary">
            Confirmer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
