import React, { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { Button } from "@/shared/components/ui";

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

const formatWeight = (value) =>
  Number(value || 0).toLocaleString("fr-FR", {
    maximumFractionDigits: 3,
  });

const formatLoader = (load) => {
  const loader = load.loadedBy;
  if (!loader?.name) return "Chargeur non renseigné";
  return loader.matricule ? `${loader.name} (${loader.matricule})` : loader.name;
};

const getDateKey = (value) => {
  if (!value) return "undated";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "undated" : date.toISOString().slice(0, 10);
};

async function createManifestPdf(plan, operationType) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 9;
  const voyage = plan.voyage || {};
  const vessel = voyage.vessel || {};
  const isUnload = operationType === "UNLOAD";
  const activeLoads = (plan.loads || [])
    .filter((load) => load.status !== "CANCELLED")
    .sort((first, second) => {
      const firstDate = getDateKey(first.loadingDate);
      const secondDate = getDateKey(second.loadingDate);
      if (firstDate === "undated") return secondDate === "undated" ? 0 : 1;
      if (secondDate === "undated") return -1;
      return firstDate.localeCompare(secondDate);
    });

  pdf.setTextColor(205, 72, 86);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text(
    `PLAN DE ${isUnload ? "DÉCHARGEMENT" : "CHARGEMENT"} DES MARCHANDISES`,
    pageWidth / 2,
    16,
    {
    align: "center",
    },
  );
  pdf.setDrawColor(205, 72, 86);
  pdf.setLineWidth(0.6);
  pdf.line(margin, 20, pageWidth - margin, 20);

  pdf.setTextColor(25, 35, 48);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text(`NAVIRE  ${vessel.name || "-"}`, margin, 28);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Transporteur  ${vessel.operatorName || "-"}`, margin + 7, 34);

  const rightColumn = 112;
  pdf.setFont("helvetica", "bold");
  pdf.text(isUnload ? "DATE D'ARRIVÉE" : "DATE DE DÉPART", rightColumn, 27);
  pdf.text("RANG DE VOYAGE", rightColumn, 33);
  pdf.text("PORT D'ARRIVÉE", rightColumn, 39);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    `: ${formatDate(isUnload ? voyage.arrivalDate : voyage.departureDate)}`,
    rightColumn + 31,
    27,
  );
  pdf.text(`: ${voyage.voyageNumber || "-"}`, rightColumn + 31, 33);
  pdf.text(`: ${voyage.arrivalPort?.name || "-"}`, rightColumn + 31, 39);
  pdf.setFontSize(8);
  pdf.text(`PORT DE DÉPART  ${voyage.departurePort?.name || "-"}`, margin, 42);
  pdf.text(`RÉFÉRENCE  ${plan.reference}`, margin, 47);

  const rows = [];
  let currentDateKey = null;
  for (const load of activeLoads) {
    const dateKey = getDateKey(load.loadingDate);
    if (dateKey !== currentDateKey) {
      currentDateKey = dateKey;
      rows.push([
        {
          content:
            dateKey === "undated"
              ? "Date non renseignée"
              : formatDate(`${dateKey}T12:00:00`),
          colSpan: 8,
          styles: {
            fillColor: [255, 255, 255],
            textColor: [205, 72, 86],
            fontStyle: "bold",
            fontSize: 8,
            halign: "center",
          },
        },
      ]);
    }
    rows.push([
      load.client?.name || "-",
      [load.vehiclePlate, load.driverName].filter(Boolean).join(" ") || "-",
      String(load.packageCount ?? "-"),
      `${load.description || "-"}${load.isHazardous ? " (DANGEREUX)" : ""}`,
      `${formatWeight(load.weightKg)} kg`,
      load.anomaly || "-",
      formatLoader(load),
      load.loadingPosition || "-",
    ]);
  }

  autoTable(pdf, {
    startY: 52,
    margin: { left: margin, right: margin, bottom: 17 },
    head: [[
      "CLIENT",
      isUnload ? "VÉHICULE / CHAUFFEUR" : "CAMION / CHAUFFEUR",
      "COLIS",
      "MARCHANDISES",
      "POIDS",
      "ANOMALIE",
      isUnload ? "DÉCHARGEUR" : "CHARGEUR",
      "POSITION",
    ]],
    body: rows,
    foot: [[
      { content: "POIDS TOTAL", colSpan: 4, styles: { halign: "right" } },
      `${formatWeight(plan.totalWeightKg)} kg\n${(Number(plan.totalWeightKg || 0) / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 3 })} t`,
      "",
      "",
      "",
    ]],
    showFoot: "lastPage",
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 1.6,
      textColor: [35, 42, 50],
      lineColor: [185, 190, 196],
      lineWidth: 0.15,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [239, 241, 243],
      textColor: [30, 35, 40],
      fontStyle: "bold",
      fontSize: 6.5,
    },
    footStyles: {
      fillColor: [255, 247, 247],
      textColor: [190, 55, 70],
      fontStyle: "bold",
      lineColor: [205, 72, 86],
      lineWidth: 0.3,
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 28 },
      2: { cellWidth: 11, halign: "center" },
      3: { cellWidth: 43 },
      4: { cellWidth: 20, halign: "right" },
      5: { cellWidth: 22 },
      6: { cellWidth: 24 },
      7: { cellWidth: 19 },
    },
  });

  const pageCount = pdf.internal.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    pdf.setPage(pageNumber);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(110, 115, 122);
    pdf.text(
      `Validé le ${formatDate(plan.validatedAt)}${plan.validatedBy?.name ? ` par ${plan.validatedBy.name}` : ""}`,
      margin,
      pdf.internal.pageSize.getHeight() - 8,
    );
    pdf.text(
      `${pageNumber} / ${pageCount}`,
      pageWidth - margin,
      pdf.internal.pageSize.getHeight() - 8,
      { align: "right" },
    );
  }

  const safeReference = String(plan.reference).replace(/[^a-z0-9-_]+/gi, "-");
  pdf.save(
    `plan-${isUnload ? "dechargement" : "chargement"}-${safeReference}.pdf`,
  );
}

function OperationManifestPdf({ plan, operationType, onError }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const isUnload = operationType === "UNLOAD";

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await createManifestPdf(plan, operationType);
    } catch (downloadError) {
      onError?.(
        downloadError?.response?.data?.message ||
          downloadError?.message ||
          `Impossible de générer le PDF de ${isUnload ? "déchargement" : "chargement"}.`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="secondary"
      icon={FiDownload}
      onClick={handleDownload}
      isLoading={isGenerating}
    >
      {isUnload ? "Télécharger le PDF de déchargement" : "Télécharger le PDF de chargement"}
    </Button>
  );
}

export function LoadingManifestPdf({ plan, onError }) {
  return (
    <OperationManifestPdf
      plan={plan}
      operationType="LOAD"
      onError={onError}
    />
  );
}

export function UnloadingManifestPdf({ plan, onError }) {
  return (
    <OperationManifestPdf
      plan={plan}
      operationType="UNLOAD"
      onError={onError}
    />
  );
}
