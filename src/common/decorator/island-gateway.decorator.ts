import { applyDecorators } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';

export const LivislandGateway = (path = '/game', namespace = 'island') => {
    return applyDecorators(
        WebSocketGateway({
            path,
            namespace,
            cors: {
                origin: true,
            },
        }),
    );
};
