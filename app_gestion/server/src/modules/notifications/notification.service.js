// src/modules/notifications/notification.service.js
const { prisma } = require("../../config/database");
const { getIO } = require("../../config/socket");
const logger = require("../../config/logger");

/**
 * Crée une notification et la diffuse en temps réel.
 * targetModule/targetAction définissent QUI doit la voir (ex: "USERS"/"CREATE"
 * pour les employés capables de donner un accès applicatif). Laisser les deux
 * à null pour une notification globale (visible par tous les employés connectés).
 */
const createNotification = async ({
  type,
  message,
  payload,
  targetModule = null,
  targetAction = null,
}) => {
  const notification = await prisma.notification.create({
    data: { type, message, payload, targetModule, targetAction },
  });

  // Diffusion à tous les sockets connectés : c'est le front qui filtre selon
  // les permissions de l'utilisateur courant (voir NotificationContext.jsx).
  // On ne bloque jamais la création si Socket.IO n'est pas dispo (ex: script,
  // tests) : on log et on continue.
  try {
    getIO().emit("notification:new", notification);
  } catch (err) {
    logger.warn("Socket.IO indisponible, notification non diffusée en direct.");
  }

  return notification;
};

/**
 * Liste les notifications visibles par un employé donné, selon ses
 * permissions, avec le statut "lu/non lu" propre à cet employé.
 */
const getNotificationsForEmployee = async (employeeId, permissions = []) => {
  const hasWildcard = permissions.some(
    (p) => p.module === "*" && p.action === "*",
  );

  const orConditions = [{ targetModule: null }]; // notifications globales

  if (!hasWildcard) {
    for (const p of permissions) {
      if (p.module === "*") continue; // couvert par hasWildcard normalement
      if (p.action === "*") {
        orConditions.push({ targetModule: p.module });
      } else {
        orConditions.push({ targetModule: p.module, targetAction: p.action });
      }
    }
  }

  const notifications = await prisma.notification.findMany({
    where: hasWildcard ? {} : { OR: orConditions },
    include: {
      reads: { where: { employeeId } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return notifications.map(({ reads, ...notification }) => ({
    ...notification,
    isRead: reads.length > 0,
  }));
};

const markAsRead = async (notificationId, employeeId) => {
  return prisma.notificationRead.upsert({
    where: {
      notificationId_employeeId: { notificationId, employeeId },
    },
    update: {},
    create: { notificationId, employeeId },
  });
};

/**
 * Supprime les notifications ACCESS_REQUEST liées à un employé donné (une
 * fois l'accès accordé, ou si la demande est annulée). Suppression réelle en
 * base (pas juste "lu") pour ne pas accumuler des lignes obsolètes, et
 * diffusion temps réel pour que la notif disparaisse aussi chez les autres
 * IT connectés qui l'auraient encore affichée.
 */
const deleteAccessRequestNotifications = async (employeeId) => {
  const toDelete = await prisma.notification.findMany({
    where: {
      type: "ACCESS_REQUEST",
      payload: { path: ["employeeId"], equals: employeeId },
    },
    select: { id: true },
  });

  if (toDelete.length === 0) return;

  const ids = toDelete.map((n) => n.id);
  // onDelete: Cascade sur NotificationRead.notification -> nettoyage automatique
  await prisma.notification.deleteMany({ where: { id: { in: ids } } });

  try {
    getIO().emit("notification:removed", { ids });
  } catch (err) {
    logger.warn(
      "Socket.IO indisponible, suppression de notification non diffusée en direct.",
    );
  }
};

module.exports = {
  createNotification,
  getNotificationsForEmployee,
  markAsRead,
  deleteAccessRequestNotifications,
};
