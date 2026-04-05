import { Socket } from 'socket.io';

export interface SocketWithUser extends Socket {
  user?: {
    sub: string;
    email?: string;
    role?: string;
  };
}