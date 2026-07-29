// src/config/socket.js
const { Server } = require("socket.io");

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

  io.on("connection", (socket) => {
    // Dès qu'un client se connecte, il rejoint une "room" privée basée sur son ID
    socket.on("join-profile", (employeeId) => {
      if (employeeId) {
        socket.join(`employee_${employeeId}`);
        console.log(
          `[Socket] Employé ${employeeId} a rejoint son canal privé.`,
        );
      }
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Client déconnecté.");
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
