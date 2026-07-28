// src/features/users/components/PermissionsModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Select, Button, Badge } from "@/shared/components/ui";
import { FiTrash2, FiPlus } from "react-icons/fi";
import { modulesService } from "@/features/module";

// Actions REST classiques. Contrairement aux modules (métier, propres à
// chaque projet, donc stockés en base pour rester éditables sans déploiement),
// ces actions sont un petit ensemble fixe et stable : pas besoin de table dédiée.
const COMMON_ACTIONS = [
  { value: "", label: "Sélectionner une action..." },
  { value: "CREATE", label: "CREATE" },
  { value: "READ", label: "READ" },
  { value: "UPDATE", label: "UPDATE" },
  { value: "DELETE", label: "DELETE" },
  { value: "*", label: "* (toutes les actions)" },
];

export function PermissionsModal({
  isOpen,
  onClose,
  user,
  onAssignMany,
  onRevoke,
  onRevokeMany,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [modules, setModules] = useState([]);
  const [formData, setFormData] = useState({ module: "", action: "" });
  const [pendingPermissions, setPendingPermissions] = useState([]);
  // Sélection pour la révocation groupée (ids de EmployeePermission déjà en base)
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ module: "", action: "" });
      setPendingPermissions([]);
      setSelectedIds([]);
      return;
    }
    // On charge la liste des modules à chaque ouverture (peut évoluer entre
    // deux ouvertures si un autre IT en a ajouté un).
    modulesService
      .getModules()
      .then((res) => setModules(res.data.modules || []))
      .catch((error) =>
        console.error("Erreur lors du chargement des modules :", error),
      );
  }, [isOpen]);

  const moduleOptions = [
    { value: "", label: "Sélectionner un module..." },
    ...modules.map((m) => ({ value: m.code, label: m.label })),
  ];

  const handleModuleChange = (e) => {
    setFormData((prev) => ({ ...prev, module: e.target.value }));
  };

  const handleActionChange = (e) => {
    setFormData((prev) => ({ ...prev, action: e.target.value }));
  };

  const handleAddToPending = () => {
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

  const existingPermissions = user?.permissions || [];
  const hasMultiplePermissions = existingPermissions.length > 1;
  const allSelected =
    hasMultiplePermissions && selectedIds.length === existingPermissions.length;

  const toggleSelected = (permId) => {
    setSelectedIds((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId],
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : existingPermissions.map((p) => p.id));
  };

  const handleRevokeSelected = async () => {
    if (!user || selectedIds.length === 0) return;
    try {
      setIsRevoking(true);
      await onRevokeMany(user.id, selectedIds);
      setSelectedIds([]);
    } catch (error) {
      console.error("Erreur lors de la révocation groupée :", error);
    } finally {
      setIsRevoking(false);
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
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Déjà attribuées
            </p>
            {hasMultiplePermissions && (
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300"
                />
                Tout sélectionner
              </label>
            )}
          </div>

          {existingPermissions.length === 0 && (
            <p className="text-sm text-slate-500">
              Aucune permission attribuée.
            </p>
          )}

          {existingPermissions.map((perm) => (
            <div
              key={perm.id}
              className="flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg"
            >
              <div className="flex items-center gap-2.5">
                {/* La case à cocher n'a d'intérêt que s'il y a plusieurs
                    permissions : avec une seule, l'icône poubelle suffit. */}
                {hasMultiplePermissions && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(perm.id)}
                    onChange={() => toggleSelected(perm.id)}
                    className="rounded border-slate-300"
                  />
                )}
                <Badge variant="navy">
                  {perm.module}:{perm.action}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={FiTrash2}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                onClick={() => onRevoke(user.id, perm.id)}
              />
            </div>
          ))}

          {hasMultiplePermissions && selectedIds.length > 0 && (
            <div className="flex justify-end pt-1">
              <Button
                variant="danger"
                size="sm"
                icon={FiTrash2}
                isLoading={isRevoking}
                onClick={handleRevokeSelected}
              >
                Supprimer la sélection ({selectedIds.length})
              </Button>
            </div>
          )}
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
                <Badge variant="navy">
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
        <div className="flex items-end gap-2 pt-4 border-t border-slate-100">
          <Select
            label="Module"
            name="module"
            value={formData.module}
            onChange={handleModuleChange}
            options={moduleOptions}
            className="flex-1"
          />
          <Select
            label="Action"
            name="action"
            value={formData.action}
            onChange={handleActionChange}
            options={COMMON_ACTIONS}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            icon={FiPlus}
            disabled={!formData.module || !formData.action}
            onClick={handleAddToPending}
          >
            Ajouter
          </Button>
        </div>

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
