import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RegisterRequest } from 'src/presentation/dto/auth/request/register.request';
import { LoginResponse } from 'src/presentation/dto/auth/response/login.response';
import { ResponseResult } from './types';

const randomString = (prefix: string) =>
    `${prefix}_${Math.random().toString(36).substring(2, 8)}`;

const genrateTag = () => {
    const min = 4;
    const max = 15;
    const length = Math.floor(Math.random() * (max - min + 1)) + min;
    const characters = 'abcdefghijklmnopqrstuvwxyz_';
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';

    let tag = '';

    tag += alphabet.charAt(Math.floor(Math.random() * alphabet.length));

    for (let i = 1; i < length; i++) {
        tag += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return tag;
};

export const login = async (app: INestApplication) => {
    const email = `${randomString('user')}@test.com`;
    const nickname = randomString('nick');
    const tag = genrateTag();

    const dto: RegisterRequest = {
        email,
        nickname,
        tag,
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
