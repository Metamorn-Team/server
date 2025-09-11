import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { v4 } from 'uuid';

@Injectable()
export class TurnAuthService {
    private readonly secret: string;

    constructor() {
        this.secret = String(process.env.TURN_SECRET);
    }

    getTurnCredentials() {
        const unixTimestamp = Math.floor(Date.now() / 1000) + 24 * 3600;
        const username = `${unixTimestamp}:${v4()}`;

        const hmac = crypto.createHmac('sha1', this.secret);
        hmac.update(username);
        const password = hmac.digest('base64');

        return { username, password };
    }
}
