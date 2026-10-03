// src/features/voyage/pages/VoyagePage.jsx
import React, { useEffect, useState } from "react";
import { socket } from "@/shared/services/socket";
import { PageHeader, Button, AlertDialog } from "@/shared/components/ui";
import { FiPlus } from "react-icons/fi";
import {
  voyageService,
  VoyageTable,
  VoyageCard,
  VoyageModal,
} from "@/features/voyages"; // Assurez-vous du nom exact du dossier

function VoyagePage() {
  const [voyages, setVoyages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isVoyageModalOpen, setIsVoyageModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [selectedVoyage, setSelectedVoyage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVoyages = async () => {
    try {
      setIsLoading(true);
      const response = await voyageService.getVoyages();
      setVoyages(response.data?.voyages || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des voyages :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVoyages();
  }, []);

  // Écouteur temps réel sécurisé contre les doublons
  useEffect(() => {
    const onVoyagesChanged = (payload) => {
      if (!payload || !payload.action) return fetchVoyages();

      const { action } = payload;
      if (action === "created" && payload.voyage) {
        setVoyages((prev) => {
          const exists = prev.some((v) => v.id === payload.voyage.id);
          return exists ? prev : [payload.voyage, ...prev];
        });
      } else if (action === "updated" && payload.voyage) {
        setVoyages((prev) =>
          prev.map((v) => (v.id === payload.voyage.id ? payload.voyage : v)),
        );
      } else if (action === "deleted" && payload.id) {
        setVoyages((prev) => prev.filter((v) => v.id !== payload.id));
      } else {
        fetchVoyages();
      }
    };

    socket.on("voyages:changed", onVoyagesChanged);
    return () => {
      socket.off("voyages:changed", onVoyagesChanged);
    };
  }, []);

  const handleCreateVoyage = async (newVoyageData) => {
    const response = await voyageService.createVoyage(newVoyageData);
    if (response?.data?.voyage) {
      const newVoyage = response.data.voyage;
      setVoyages((prev) => {
        const exists = prev.some((v) => v.id === newVoyage.id);
        return exists ? prev : [newVoyage, ...prev];
      });
    } else {
      fetchVoyages();
    }
  };

  const handleOpenEdit = (voyage) => {
    setSelectedVoyage(voyage);
    setIsVoyageModalOpen(true);
  };

  const handleUpdateVoyage = async (voyageId, updatedData) => {
    try {
      const response = await voyageService.updateVoyage(voyageId, updatedData);
      if (response?.data?.voyage) {
        setVoyages((prev) =>
          prev.map((v) => (v.id === voyageId ? response.data.voyage : v)),
        );
      } else {
        fetchVoyages();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du voyage :", error);
      throw error;
    }
  };

  const handleOpenDelete = (voyage) => {
    setSelectedVoyage(voyage);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedVoyage) return;
    try {
      setIsDeleting(true);
      await voyageService.deleteVoyage(selectedVoyage.id);
      setVoyages((prev) => prev.filter((v) => v.id !== selectedVoyage.id));
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error("Erreur suppression voyage :", error);
    } finally {
      setIsDeleting(false);
      setSelectedVoyage(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Voyages" subtitle="Gérez les voyages de la flotte.">
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => {
            setSelectedVoyage(null);
            setIsVoyageModalOpen(true);
          }}
        >
          Ajouter un voyage
        </Button>
      </PageHeader>

      <div className="hidden md:block">
        <VoyageTable
          data={voyages}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      <div className="grid md:hidden grid-cols-1 sm:grid-cols-2 gap-4">
        {voyages.length === 0 && !isLoading && (
          <p className="text-sm text-slate-400 text-center py-6">
            Aucun voyage enregistré.
          </p>
        )}
        {voyages.map((voyage) => (
          <VoyageCard
            key={voyage.id}
            voyage={voyage}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        ))}
      </div>

      <VoyageModal
        isOpen={isVoyageModalOpen}
        onClose={() => {
          setIsVoyageModalOpen(false);
          setSelectedVoyage(null);
        }}
        selectedVoyage={selectedVoyage}
        onVoyageCreated={handleCreateVoyage}
        onVoyageUpdated={handleUpdateVoyage}
      />

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        onClose={() => {
          setIsDeleteAlertOpen(false);
          setSelectedVoyage(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer définitivement ce voyage"
        description={`Êtes-vous sûr de vouloir supprimer le voyage ${selectedVoyage?.voyageNumber || ""} ? Cette action est irréversible.`}
        confirmText={isDeleting ? "Suppression..." : "Oui, supprimer"}
        isDanger
      />
    </div>
  );
}

export default VoyagePage;
