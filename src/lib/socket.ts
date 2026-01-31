import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || '';

// Connect to the same host as the Vite proxy or API
// If API_URL is set (prod), connect there. If empty (dev), define relative path for proxy.
const connectionUrl = API_URL ? API_URL : '/';

export const socket = io(connectionUrl, {
    autoConnect: false, // Connect manually in helper or component
    path: '/socket.io', // Standard path
    transports: ['polling', 'websocket']
});
