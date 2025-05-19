// socket-io.adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import * as msgpackParser from 'socket.io-msgpack-parser';

export class MessagePackIoAdapter extends IoAdapter {
    createIOServer(port: number, options?: ServerOptions): any {
        if (options) {
            options.parser = msgpackParser;
        }

        return super.createIOServer(port, options);
    }
}
