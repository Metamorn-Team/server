import { Request } from 'express';

export interface UserAgent {
    browser?: string;
    device?: string;
    os?: string;
    model?: string;
    ip?: string;
}

export interface LiaRequest extends Request {
    userId?: string;
    agent?: UserAgent;
}
