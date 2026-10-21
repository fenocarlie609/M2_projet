// src/shared/services/socket.js
import { io } from "socket.io-client";

// L'URL du socket est l'origine du serveur (PAS le préfixe /api/v1 utilisé
// par axios).
//
// Avec une interface servie par un relais (nginx en production, Vite en
// développement), le canal temps réel passe par la meme origine que la
// page : c'est le relais qui transmet les evenements au serveur. Ecrire
// "localhost:5000" ici rendrait le canal injoignable depuis un autre
// appareil que celui qui heberge l'application.
const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

const SOCKET_URL = API_URL.startsWith("http")
  ? API_URL.replace(/\/api\/v1\/?$/, "") || window.location.origin
  : typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:5000";

// autoConnect: false -> c'est AuthContext qui décide quand se connecter
// (seulement une fois l'utilisateur authentifié), et non au chargement du module.
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});
