// socket.js
import { io } from 'socket.io-client';

export const createSocket = () => io(import.meta.env.VITE_API_URL);
