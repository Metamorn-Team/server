import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RegisterRequest } from 'src/presentation/dto/auth/request/register.request';
import { LoginResponse } from 'src/presentation/dto/auth/response/login.response';
import { ResponseResult } from './types';

export const login = async (app: INestApplication) => {
    const dto: RegisterRequest = {
        email: 'metamorn@metamorn.com',
        nickname: '메타몬',
        tag: 'metamorn',
        provider: 'GOOGLE',
        avatarKey: 'pawn',
    };

    const response = (await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)) as ResponseResult<LoginResponse>;
    const { body } = response;

    if (!body?.accessToken) {
        throw new Error('Login failed: No access token returned');
    }

    return {
        userId: body.id,
        accessToken: `Bearer ${body.accessToken}`,
        nickname: dto.nickname,
        tag: dto.tag,
    };
};
