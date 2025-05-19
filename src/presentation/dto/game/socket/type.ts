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
import { CreatedIslandResponse } from '../response/created-island.response';
import { CanJoinIslandRequest } from '../request/can-join.request';
import { CanJoinIslandResponse } from '../response/can-join-island.response';
import { CreateIslandRequest } from '../request/create-island.request';
import { GetLiveIslandListReqeust } from '../../island/request/get-live-island-list.request';
import { GetLiveIslandListResponse } from '../../island/response/get-live-island-list.response';
import { JoinDesertedIslandReqeust } from '../request/join-deserted-island.request';
import { WsErrorBody } from './known-exception';
import { SendFriendRequest } from '../../friends/request/send-friend.request';

export type ClientToLoby = {
    createIsland: (data: CreateIslandRequest) => void;
    getActiveIslands: (data: GetLiveIslandListReqeust) => void;
    canJoinIsland: (data: CanJoinIslandRequest) => void;
};
export type LobyToClient = {
    createdIsland: (data: CreatedIslandResponse) => void;
    getActiveIslands: (data: GetLiveIslandListResponse) => void;
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
    playerLeftSuccess: () => void;
    playerMoved: (data: PlayerMovedResponse) => void;
    activePlayers: (data: ActivePlayerResponse) => void;
    attacked: (data: AttackedResponse) => void;
    islandHearbeat: (data: IslandHeartbeatResponse) => void;
    jump: (userId: string) => void;
    invalidVersion: () => void;
} & ErrorToClient;

export type ClientToFriend = {
    sendFriendRequest: (data: SendFriendRequest) => void;
};

export type FriendToClient = {
    receiveFriendRequest: () => void;
    sendFriendRequestSuccess: () => void;
};

export type ErrorToClient = {
    wsError: (error: WsErrorBody) => void;
};

export type ClientToServer = ClientToIsland &
    ClientToLoby &
    ClientToChat &
    ClientToFriend;
export type ServerToClient = IslandToClient &
    LobyToClient &
    ChatToClient &
    FriendToClient &
    ErrorToClient;
