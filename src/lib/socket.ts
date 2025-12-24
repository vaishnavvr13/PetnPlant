import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
    }
    return socket;
};

export const connectSocket = (userId: string) => {
    const socketInstance = getSocket();

    if (!socketInstance.connected) {
        socketInstance.connect();

        socketInstance.on('connect', () => {
            console.log('✅ Socket connected');
            socketInstance.emit('join', userId);
        });

        socketInstance.on('disconnect', () => {
            console.log('❌ Socket disconnected');
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    return socketInstance;
};

export const disconnectSocket = () => {
    if (socket?.connected) {
        socket.disconnect();
        socket = null;
    }
};

export { socket };
