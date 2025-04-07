import { Socket } from 'socket.io';
import { PlayerJoinRequest } from '../request/player-join.request';
import { PlayerMovedRequest } from '../request/player-moved.request';
import { PlayerJoinResponse } from '../response/player-join.response';
import { PlayerLeftResponse } from '../response/player-left.response';
import { PlayerMovedResponse } from '../response/player-moved.response';
import { ActivePlayerResponse } from '../response/active-players.response';

export interface ClientToServer {
    playerJoin: (data: PlayerJoinRequest) => void;
    playerLeft: () => void;
    playerMoved: (data: PlayerMovedRequest) => void;
}

export interface ServerToClient {
    playerJoin: (data: PlayerJoinResponse) => void;
    playerLeft: (data: PlayerLeftResponse) => void;
    playerMoved: (data: PlayerMovedResponse) => void;
    activePlayers: (data: ActivePlayerResponse) => void;
}

export type TypedSocket = Socket<ClientToServer, ServerToClient>;
