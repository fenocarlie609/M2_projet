// src/pages/TemplatePage.jsx
import React, { useState, useRef } from "react";
import {
  FiTrash2,
  FiEdit2,
  FiEye,
  FiDownload,
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
} from "react-icons/fi";

import { FaShip } from "react-icons/fa6";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Alert,
  AlertDialog,
  Stepper,
  Calendar,
  ContextMenu,
  DropdownMenu,
  Form,
  // Rapatriement des composants précédents pour la démo complète
  Button,
  Input,
  Select,
  Badge,
} from "@/shared/components/ui";

function TemplatePage() {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(2);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    nomNavire: "",
    typeFret: "conteneur",
  });

  // Référence pour le clic droit sur la zone dédiée (ContextMenu)
  const contextZoneRef = useRef(null);

  // Actions de démo pour le menu contextuel et le dropdown
  const actionItems = [
    {
      label: "Voir les détails",
      icon: FiEye,
      onClick: () => alert("Action : Voir les détails"),
    },
    {
      label: "Modifier la ligne",
      icon: FiEdit2,
      onClick: () => alert("Action : Modifier"),
    },
    {
      label: "Télécharger le manifeste",
      icon: FiDownload,
      onClick: () => alert("Action : Télécharger"),
    },
    {
      label: "Supprimer l'enregistrement",
      icon: FiTrash2,
      variant: "danger",
      onClick: () => setIsAlertOpen(true),
    },
  ];
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 sm:p-10 font-sans text-slate-800 antialiased selection:bg-brand-primary/10">
      {/* Header de la page Template */}
      <div className="mb-10 border-b border-slate-200/60 pb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Visual UI Kit Showcase
        </h1>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          Laboratoire visuel de tous les composants de l'application optimisés
          pour Tailwind v4.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* COLONNE GAUCHE (8 COLS) - Formulaires, Cartes, Steppers, Alertes */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section: Stepper & Progression */}
          <Card>
            <CardHeader
              title="Progression & Flux de Travail"
              subtitle="Composant Stepper idéal pour suivre les phases de transit ou de validation."
            />
            <CardContent className="space-y-6">
              <Stepper
                steps={["Enregistrement", "Facturation", "Douane", "Livraison"]}
                currentStep={currentStep}
              />
              <div className="flex gap-2 justify-center">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setCurrentStep((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentStep === 1}
                >
                  Étape Précédente
                </Button>
                <Button
                  variant="primary"
                  onClick={() =>
                    setCurrentStep((prev) => Math.min(4, prev + 1))
                  }
                  disabled={currentStep === 4}
                >
                  Étape Suivante
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section: Formulaires & Cartes */}
          <Card>
            <CardHeader
              title="Gestion des Formulaires & Inputs"
              subtitle="Combinaison des composants Card, Form, Input et Select."
            />
            <CardContent>
              <Form
                onSubmit={() =>
                  alert(`Soumis avec : ${JSON.stringify(formData)}`)
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nom du Navire"
                    placeholder="Ex: Premium Express I"
                    value={formData.nomNavire}
                    onChange={(e) =>
                      setFormData({ ...formData, nomNavire: e.target.value })
                    }
                  />
                  <Select
                    label="Type de Fret"
                    value={formData.typeFret}
                    onChange={(e) =>
                      setFormData({ ...formData, typeFret: e.target.value })
                    }
                    options={[
                      { value: "conteneur", label: "Marchandise en Conteneur" },
                      { value: "vrac", label: "Vrac Liquide / Solide" },
                      { value: "roll-on", label: "Véhicules (Ro-Ro)" },
                    ]}
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary">
                    Enregistrer la cargaison
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>

          {/* Section: Alertes & Messages Système */}
          <Card>
            <CardHeader
              title="Alertes Contextuelles"
              subtitle="Messages de retour d'information pour notifier l'état du système."
            />
            <CardContent className="space-y-4">
              <Alert variant="info" title="Information Système">
                La synchronisation automatique avec l'API portuaire a lieu
                toutes les 15 minutes.
              </Alert>
              <Alert variant="success" title="Action Réussie">
                Le manifeste de cargaison pour le trajet de Tamatave a été
                validé avec succès.
              </Alert>
              <Alert variant="error" title="Alerte Critique">
                Échec de connexion au routeur de secours. Veuillez vérifier la
                configuration de la passerelle.
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* COLONNE DROITE (4 COLS) - Sélections, Menus & Déclencheurs */}
        <div className="lg:col-span-4 space-y-8">
          {/* Section: Calendrier de Saisie */}
          <Card>
            <CardHeader
              title="Planification & Dates"
              subtitle="Sélecteur compact autonome."
            />
            <CardContent className="flex flex-col items-center gap-4">
              <Calendar onDateSelect={(date) => setSelectedDate(date)} />
              {selectedDate && (
                <Badge variant="success">
                  Date choisie : {selectedDate.toLocaleDateString("fr-FR")}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Section: Menus & Clics */}
          <Card>
            <CardHeader
              title="Interactions & Menus"
              subtitle="Déclencheurs d'actions directes et contextuelles."
            />
            <CardContent className="space-y-6">
              {/* Dropdown Menu standard */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-lg">
                    <FaShip size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Ligne de tableau type
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Cliquez sur les trois points
                    </p>
                  </div>
                </div>
                <DropdownMenu items={actionItems} />
              </div>

              {/* Zone pour Clic Droit */}
              <div
                ref={contextZoneRef}
                className="h-32 w-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-context-menu hover:bg-slate-50/50 hover:border-brand-primary/40 transition-colors"
              >
                <span className="text-xs font-bold text-slate-700">
                  Zone de Clic Droit
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-1">
                  Faites un clic droit n'importe où dans ce rectangle pour
                  ouvrir le menu.
                </span>
              </div>

              {/* Raccordement du composant ContextMenu à sa zone cible */}
              <ContextMenu targetRef={contextZoneRef} items={actionItems} />
            </CardContent>
          </Card>

          {/* Section: Actions Destructives */}
          <Card>
            <CardHeader
              title="Modales de Sécurité"
              subtitle="Forcer la confirmation des opérations à risque."
            />
            <CardContent>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => setIsAlertOpen(true)}
              >
                Déclencher l'AlertDialog
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rendu global de l'AlertDialog de confirmation */}
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={() => {
          alert("Élément définitivement supprimé.");
          setIsAlertOpen(false);
        }}
        title="Supprimer définitivement cet enregistrement ?"
        description="Cette action est irréversible. Toutes les données liées à cette cargaison, y compris l'historique de facturation et les manifestes associés, seront effacées des bases de données."
        confirmText="Oui, supprimer"
        isDanger={true}
      />
    </div>
  );
}

export default TemplatePage;
