// src/features/ship/pages/ShipPage.jsx
import React, { useEffect, useState } from "react";
import { socket } from "@/shared/services/socket";
import { PageHeader, Button, AlertDialog } from "@/shared/components/ui";
import { FiPlus } from "react-icons/fi";
import { useAuth } from "@/features/auth";
import { shipService, ShipTable, ShipCard, ShipModal } from "@/features/ship";

function ShipPage() {
  const { checkPermission } = useAuth();
  const [ships, setShips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [selectedShip, setSelectedShip] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchShips = async () => {
    try {
      setIsLoading(true);
      const response = await shipService.getShips();
      setShips(response.data?.vessels || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des navires :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShips();
  }, []);

  // Temps réel : diffusé par ship.service.js (backend) sur create/update/delete,
  // y compris par un autre utilisateur connecté.
  useEffect(() => {
    const onShipsChanged = (payload) => {
      if (!payload || !payload.action) return fetchShips();

      const { action } = payload;
      if (action === "created" && payload.ship) {
        setShips((prev) => [payload.ship, ...prev]);
      } else if (action === "updated" && payload.ship) {
        setShips((prev) =>
          prev.map((s) => (s.id === payload.ship.id ? payload.ship : s)),
        );
      } else if (action === "deleted" && payload.id) {
        setShips((prev) => prev.filter((s) => s.id !== payload.id));
      } else {
        fetchShips();
      }
    };

    socket.on("ships:changed", onShipsChanged);
    return () => {
      socket.off("ships:changed", onShipsChanged);
    };
  }, []);

  const handleCreateShip = async (newShipData) => {
    const response = await shipService.createShip(newShipData);
    if (response?.data?.ship) {
      setShips((prev) => [response.data.ship, ...prev]);
    } else {
      fetchShips();
    }
  };

  const handleOpenEdit = (ship) => {
    setSelectedShip(ship);
    setIsShipModalOpen(true);
  };

  const handleUpdateShip = async (shipId, updatedData) => {
    try {
      const response = await shipService.updateShip(shipId, updatedData);
      if (response?.data?.ship) {
        setShips((prev) =>
          prev.map((s) => (s.id === shipId ? response.data.ship : s)),
        );
      } else {
        fetchShips();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du navire :", error);
      throw error;
    }
  };

  const handleOpenDelete = (ship) => {
    setSelectedShip(ship);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedShip) return;
    try {
      setIsDeleting(true);
      await shipService.deleteShip(selectedShip.id);
      setShips(ships.filter((s) => s.id !== selectedShip.id));
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error("Erreur suppression navire :", error);
    } finally {
      setIsDeleting(false);
      setSelectedShip(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Navires"
        subtitle="Gérez le registre des navires de la flotte."
      >
        {checkPermission("VESSELS", "CREATE") && <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => {
            setSelectedShip(null);
            setIsShipModalOpen(true);
          }}
        >
          Ajouter un navire
        </Button>}
      </PageHeader>

      <div className="hidden md:block">
        <ShipTable
          data={ships}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      <div className="grid md:hidden grid-cols-1 sm:grid-cols-2 gap-4">
        {ships.length === 0 && !isLoading && (
          <p className="text-sm text-slate-400 text-center py-6">
            Aucun navire enregistré.
          </p>
        )}
        {ships.map((ship) => (
          <ShipCard
            key={ship.id}
            ship={ship}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        ))}
      </div>

      <ShipModal
        isOpen={isShipModalOpen}
        onClose={() => {
          setIsShipModalOpen(false);
          setSelectedShip(null);
        }}
        selectedShip={selectedShip}
        onShipCreated={handleCreateShip}
        onShipUpdated={handleUpdateShip}
      />

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        onClose={() => {
          setIsDeleteAlertOpen(false);
          setSelectedShip(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer définitivement ce navire"
        description={`Êtes-vous sûr de vouloir supprimer le navire ${selectedShip?.name || ""} ? Cette action est irréversible.`}
        confirmText={isDeleting ? "Suppression..." : "Oui, supprimer"}
        isDanger
      />
    </div>
  );
}

export default ShipPage;
