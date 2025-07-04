import * as crypto from 'crypto';

export const random = {
    /**
     * 최소값과 최대값 사이의 랜덤 정수를 반환합니다.
     *
     * @param min 최소값
     * @param max 최대값
     * @returns 최소값과 최대값 사이의 랜덤 정수
     */
    between: (min: number, max: number) => {
        const low = Math.ceil(min);
        const high = Math.floor(max);
        return Math.floor(Math.random() * (high - low + 1)) + low;
    },
};

export function generateRandomString(length: number) {
    return crypto.randomBytes(length).toString('hex');
}
