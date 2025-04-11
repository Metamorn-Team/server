import { Socket } from 'socket.io';
import { PlayerJoinRequest } from '../request/player-join.request';
import { PlayerMovedRequest } from '../request/player-moved.request';
import { PlayerJoinResponse } from '../response/player-join.response';
import { PlayerLeftResponse } from '../response/player-left.response';
import { PlayerMovedResponse } from '../response/player-moved.response';
import { ActivePlayerResponse } from '../response/active-players.response';
import { SendMessageRequest } from '../request/send-message.request';
import { ReceiveMessage } from '../response/receive-message';
import { MessageSent } from '../response/message-sent.response';
import { PlayerJoinSuccessResponse } from '../response/player-join-success.response';

export interface ClientToServer {
    playerJoin: (data: PlayerJoinRequest) => void;
    playerLeft: () => void;
    playerMoved: (data: PlayerMovedRequest) => void;
    sendMessage: (data: SendMessageRequest) => void;
}

export interface ServerToClient {
    playerJoin: (data: PlayerJoinResponse) => void;
    playerJoinSuccess: (data: PlayerJoinSuccessResponse) => void;
    playerLeft: (data: PlayerLeftResponse) => void;
    playerMoved: (data: PlayerMovedResponse) => void;
    activePlayers: (data: ActivePlayerResponse) => void;
    receiveMessage: (data: ReceiveMessage) => void;
    messageSent: (data: MessageSent) => void;
}

export type TypedSocket = Socket<ClientToServer, ServerToClient>;
