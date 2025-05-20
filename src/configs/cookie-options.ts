import { CookieOptions } from 'express';

export const cookieOptions = (): CookieOptions => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    domain: process.env.NODE_ENV === 'production' ? 'livisland.com' : undefined,
    maxAge: Number(process.env.REFRESH_COOKIE_TIME),
});
