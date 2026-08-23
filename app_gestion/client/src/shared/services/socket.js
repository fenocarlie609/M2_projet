// src/shared/services/socket.js
import { io } from "socket.io-client";

// L'URL du socket est l'origine du serveur (PAS le préfixe /api/v1 utilisé par axios)
const API_URL = import.meta.env.VITE_API_URL || "/api/v1";
const SOCKET_URL =
  API_URL.replace(/\/api\/v1\/?$/, "") || "http://localhost:5000";

// autoConnect: false -> c'est AuthContext qui décide quand se connecter
// (seulement une fois l'utilisateur authentifié), et non au chargement du module.
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});
