import { UseFilters } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { LivislandGateway } from 'src/common/decorator/island-gateway.decorator';
import { WsExceptionFilter } from 'src/common/filter/ws-exception.filter';
import { ActiveObject } from 'src/domain/types/spawn-object/active-object';
import {
    ClientToIsland,
    IslandActiveObject,
    IslandToClient,
} from 'src/presentation/dto/game';

@UseFilters(WsExceptionFilter)
@LivislandGateway()
export class RespawnGateway {
    @WebSocketServer()
    private readonly wss: Namespace<ClientToIsland, IslandToClient>;

    spawnObjects(islandId: string, respawnObjects: ActiveObject[]) {
        this.wss.to(islandId).emit('spawnObjects', {
            objects: respawnObjects.map((object) =>
                IslandActiveObject.fromActiveObject(object),
            ),
        });
    }
}
