// src/features/users/components/PermissionsModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Badge } from "@/shared/components/ui";
import { FiTrash2, FiPlus } from "react-icons/fi";

// NOTE : module/action doivent correspondre exactement aux valeurs de
// APP_MODULES / APP_ACTIONS définies côté backend
// (src/common/utils/constants.js). Je n'ai pas ce fichier, donc j'utilise de
// simples champs texte ici. Envoyez-moi constants.js si vous voulez que je les
// remplace par des <Select> avec les vraies valeurs autorisées.
export function PermissionsModal({
  isOpen,
  onClose,
  user,
  onAssignMany,
  onRevoke,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ module: "", action: "" });
  // Liste composée localement avant l'envoi groupé au serveur
  const [pendingPermissions, setPendingPermissions] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ module: "", action: "" });
      setPendingPermissions([]);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleAddToPending = (e) => {
    e.preventDefault();
    if (!formData.module || !formData.action) return;

    const alreadyExists =
      (user?.permissions || []).some(
        (p) => p.module === formData.module && p.action === formData.action,
      ) ||
      pendingPermissions.some(
        (p) => p.module === formData.module && p.action === formData.action,
      );
    if (alreadyExists) {
      setFormData({ module: "", action: "" });
      return;
    }

    setPendingPermissions((prev) => [...prev, { ...formData }]);
    setFormData({ module: "", action: "" });
  };

  const handleRemovePending = (index) => {
    setPendingPermissions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitAll = async () => {
    if (!user || pendingPermissions.length === 0) return;
    try {
      setIsSubmitting(true);
      await onAssignMany(user.id, pendingPermissions);
      setPendingPermissions([]);
    } catch (error) {
      console.error("Erreur lors de l'attribution des permissions :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Permissions de ${user?.name || ""}`}
    >
      <div className="space-y-4">
        {/* Permissions déjà attribuées, en base */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Déjà attribuées
          </p>
          {(user?.permissions || []).length === 0 && (
            <p className="text-sm text-slate-500">
              Aucune permission attribuée.
            </p>
          )}
          {(user?.permissions || []).map((perm) => (
            <div
              key={perm.id}
              className="flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg"
            >
              <Badge variant="navy">
                {perm.module}:{perm.action}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                icon={FiTrash2}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                onClick={() => onRevoke(user.id, perm.id)}
              />
            </div>
          ))}
        </div>

        {/* Liste composée localement, pas encore envoyée */}
        {pendingPermissions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              À ajouter ({pendingPermissions.length})
            </p>
            {pendingPermissions.map((perm, index) => (
              <div
                key={`${perm.module}-${perm.action}-${index}`}
                className="flex items-center justify-between px-3 py-2 border border-dashed border-indigo-200 bg-indigo-50/40 rounded-lg"
              >
                <Badge variant="indigo">
                  {perm.module}:{perm.action}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={FiTrash2}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  onClick={() => handleRemovePending(index)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Formulaire d'ajout à la liste (n'envoie rien au serveur) */}
        <form
          onSubmit={handleAddToPending}
          className="flex items-end gap-2 pt-4 border-t border-slate-100"
        >
          <Input
            label="Module"
            name="module"
            required
            value={formData.module}
            onChange={handleInputChange}
            placeholder="Ex: EMPLOYEES"
            className="flex-1"
          />
          <Input
            label="Action"
            name="action"
            required
            value={formData.action}
            onChange={handleInputChange}
            placeholder="Ex: READ"
            className="flex-1"
          />
          <Button type="submit" variant="ghost" icon={FiPlus}>
            Ajouter à la liste
          </Button>
        </form>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Fermer
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={isSubmitting}
            disabled={pendingPermissions.length === 0}
            onClick={handleSubmitAll}
          >
            Enregistrer{" "}
            {pendingPermissions.length > 1
              ? `(${pendingPermissions.length})`
              : ""}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
