// src/features/companyStructure/components/CompanyStructureCard.jsx
import React from "react";
import {
  Card,
  CardContent,
  Badge,
  Button,
  DropdownMenu,
} from "@/shared/components/ui";
import { FiPlus, FiEdit3, FiTrash2 } from "react-icons/fi";

export function CompanyStructureCard({
  department,
  onEditDepartment,
  onDeleteDepartment,
  onAddPosition,
  onEditPosition,
  onDeletePosition,
}) {
  const departmentMenuItems = [
    {
      label: "Modifier",
      icon: FiEdit3,
      onClick: () => onEditDepartment(department),
    },
    {
      label: "Supprimer",
      icon: FiTrash2,
      variant: "danger",
      onClick: () => onDeleteDepartment(department),
    },
  ];

  return (
    <Card>
      {/* Header custom (CardHeader ne prévoit pas de zone d'actions à droite) */}
      <div className="flex items-start justify-between px-6 py-4.5 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-base">
            {department.label}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{department.code}</p>
        </div>
        <DropdownMenu items={departmentMenuItems} />
      </div>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          {(department.positions || []).length === 0 && (
            <p className="text-xs text-slate-400">
              Aucun poste dans ce département.
            </p>
          )}
          {(department.positions || []).map((pos) => {
            const positionMenuItems = [
              {
                label: "Modifier",
                icon: FiEdit3,
                onClick: () => onEditPosition(pos),
              },
              {
                label: "Supprimer",
                icon: FiTrash2,
                variant: "danger",
                onClick: () => onDeletePosition(pos),
              },
            ];

            return (
              <div
                key={pos.id}
                className="flex items-center justify-between px-3 py-2 bg-slate-50/70 border border-slate-100 rounded-lg"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {pos.label}
                  </p>
                  <Badge variant="navy">{pos.code}</Badge>
                </div>
                <DropdownMenu items={positionMenuItems} />
              </div>
            );
          })}
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={FiPlus}
          onClick={() => onAddPosition(department)}
        >
          Ajouter un poste
        </Button>
      </CardContent>
    </Card>
  );
}
