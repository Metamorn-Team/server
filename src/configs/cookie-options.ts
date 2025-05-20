import { CookieOptions } from 'express';

export const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    domain: 'livisland.com',
    maxAge: Number(process.env.REFRESH_COOKIE_TIME),
};
