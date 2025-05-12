import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { login } from 'test/helper/login';
import { ClientToServer, ServerToClient } from 'types';

export type TypedSockect = Socket<ServerToClient, ClientToServer>;

export const createSocketConnection = async (
    url: string,
    app: INestApplication,
): Promise<TypedSockect> => {
    const { accessToken } = await login(app);

    return new Promise((res, rej) => {
        const socket: TypedSockect = io(url, {
            path: '/game',
            auth: {
                authorization: accessToken.split(' ')[1],
            },
        });
        socket.on('connect', () => {
            res(socket);
        });

        socket.on('connect_error', (err) => {
            rej(err);
        });
    });
};
