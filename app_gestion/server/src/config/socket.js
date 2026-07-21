// src/config/socket.js
const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        // process.env.FRONTEND_URL || "http://localhost:3000",
        // "https://www.postman.com",
        "*",
      ],
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
