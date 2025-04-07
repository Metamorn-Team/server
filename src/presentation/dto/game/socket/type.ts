import { Socket } from 'socket.io';
import { PlayerJoinRequest } from 'src/presentation/dto/game/request/player-join.request';
import { PlayerMovedRequest } from 'src/presentation/dto/game/request/player-moved.request';
import { ActivePlayerResponse } from 'src/presentation/dto/game/response/active-players.response';
import { PlayerJoinResponse } from 'src/presentation/dto/game/response/player-join.response';
import { PlayerLeftResponse } from 'src/presentation/dto/game/response/player-left.response';
import { PlayerMovedResponse } from 'src/presentation/dto/game/response/player-moved.response';

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
