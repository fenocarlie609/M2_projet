// src/features/users/components/PermissionsModal.jsx
import React, { useState } from "react";
import { Modal, Input, Button, Badge } from "@/shared/components/ui";
import { FiTrash2 } from "react-icons/fi";

// NOTE : module/action doivent correspondre exactement aux valeurs de
// APP_MODULES / APP_ACTIONS définies côté backend
// (src/common/utils/constants.js). Je n'ai pas ce fichier, donc j'utilise de
// simples champs texte ici. Envoyez-moi constants.js si vous voulez que je les
// remplace par des <Select> avec les vraies valeurs autorisées.
export function PermissionsModal({
  isOpen,
  onClose,
  user,
  onAssign,
  onRevoke,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ module: "", action: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      setIsSubmitting(true);
      await onAssign(user.id, formData.module, formData.action);
      setFormData({ module: "", action: "" });
    } catch (error) {
      console.error("Erreur lors de l'attribution de la permission :", error);
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
        <div className="space-y-2">
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

        {/* Layout inline : formulaire brut plutôt que <Form> (qui impose un
            espacement vertical entre champs, pas adapté ici) */}
        <form
          onSubmit={handleAssign}
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
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Ajouter
          </Button>
        </form>
      </div>
    </Modal>
  );
}
