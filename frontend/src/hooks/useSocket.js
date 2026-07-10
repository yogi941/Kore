import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuth from './useAuth';

const useSocket = () => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !token) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001', {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.emit('join_room', user._id);
    if (user.canteen) {
      socketRef.current.emit('join_canteen', user.canteen._id || user.canteen);
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, token]);

  return socketRef.current;
};

export default useSocket;
