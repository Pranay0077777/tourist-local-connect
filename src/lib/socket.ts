import { io } from 'socket.io-client';

// Connect to the same host as the Vite proxy or API
export const socket = io('/', {
    autoConnect: false, // Connect manually in helper or component
    path: '/socket.io', // Standard path, proxy should handle if configured or direct URL
    transports: ['polling', 'websocket']
});
