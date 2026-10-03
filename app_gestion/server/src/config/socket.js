// src/config/socket.js
const { Server } = require("socket.io");
const { prisma } = require("./database");
const { getSocketEmployeeId } = require("../common/utils/socketAuth");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      // CORRECTION : un CORS "*" combiné à credentials: true est invalide
      // (rejeté par les navigateurs, comme pour l'API HTTP classique).
      // On aligne sur la même origine que CLIENT_URL utilisée par Express/CORS.
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const employeeId = getSocketEmployeeId(socket.handshake.headers.cookie, {
      cookieSecret: process.env.COOKIE_SECRET,
      jwtSecret: process.env.JWT_SECRET,
    });

    if (!employeeId) return next(new Error("unauthorized"));

    try {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: {
          id: true,
          hasAppAccess: true,
          isActive: true,
          deletedAt: true,
        },
      });

      if (
        !employee ||
        employee.deletedAt ||
        !employee.hasAppAccess ||
        !employee.isActive
      ) {
        return next(new Error("unauthorized"));
      }

      socket.data.employeeId = employee.id;
      next();
    } catch (error) {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const employeeId = socket.data.employeeId;
    socket.join(`employee_${employeeId}`);

    socket.on("disconnect", () => {
      console.log(`[Socket] Employé ${employeeId} déconnecté.`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io n'est pas initialisé !");
  }
  return io;
};

module.exports = { initSocket, getIO };
