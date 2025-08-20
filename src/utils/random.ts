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

/**
 * Base62로 랜덤 문자열을 생성합니다.
 *
 * @param length 생성할 문자열 길이
 * @returns Base62로 인코딩된 랜덤 문자열
 */
export function generateRandomBase62(length: number): string {
    // Base62 문자셋 (알파벳 대소문자 + 숫자)
    const charset =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let result = '';
    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
        result += charset[randomBytes[i] % charset.length];
    }

    return result;
}
