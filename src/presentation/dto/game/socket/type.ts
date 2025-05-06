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
import { AttackedResponse } from '../response/attacked.response';
import { IslandHeartbeatResponse } from '../response/island-heartbeat';
import {
    CreateIslandRequest,
    GetIslandListReqeust,
    JoinDesertedIslandReqeust,
    LiveIslandItem,
} from 'types';
import { CreatedIslandResponse } from 'src/presentation/dto/game/response/created-island.response';
import { CanJoinIslandRequest } from 'src/presentation/dto/game/request/can-join.request';
import { CanJoinIslandResponse } from 'src/presentation/dto/game/response/can-join-island.response';
import { WsExceptionsType } from 'src/presentation/dto/game/socket/known-exception';

export type ClientToLoby = {
    createIsland: (data: CreateIslandRequest) => void;
    getActiveIslands: (data: GetIslandListReqeust) => void;
    canJoinIsland: (data: CanJoinIslandRequest) => void;
};
export type LobyToClient = {
    createdIsland: (data: CreatedIslandResponse) => void;
    getActiveIslands: (data: LiveIslandItem[]) => void;
    canJoinIsland: (data: CanJoinIslandResponse) => void;
};

export type ClientToChat = {
    sendMessage: (data: SendMessageRequest) => void;
};
export type ChatToClient = {
    receiveMessage: (data: ReceiveMessage) => void;
    messageSent: (data: MessageSent) => void;
};

export type ClientToIsland = {
    joinDesertedIsland: (data: JoinDesertedIslandReqeust) => void;
    joinNormalIsland: (data: PlayerJoinRequest) => void;
    playerLeft: () => void;
    playerKicked: () => void;
    playerMoved: (data: PlayerMovedRequest) => void;
    attack: () => void;
    islandHearbeat: () => void;
    jump: () => void;
};

export type IslandToClient = {
    playerJoin: (data: PlayerJoinResponse) => void;
    playerJoinSuccess: (data: PlayerJoinSuccessResponse) => void;
    playerKicked: () => void;
    playerLeft: (data: PlayerLeftResponse) => void;
    playerMoved: (data: PlayerMovedResponse) => void;
    activePlayers: (data: ActivePlayerResponse) => void;
    attacked: (data: AttackedResponse) => void;
    islandHearbeat: (data: IslandHeartbeatResponse) => void;
    jump: (userId: string) => void;
};

export type ErrorToClient = {
    wsError: (error: { name: WsExceptionsType; message: string }) => void;
};

export type ClientToServer = ClientToIsland & ClientToLoby & ClientToChat;
export type ServerToClient = IslandToClient &
    LobyToClient &
    ChatToClient &
    ErrorToClient;
