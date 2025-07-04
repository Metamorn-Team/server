export function randomString(prefix: string) {
    return `${prefix}_${Math.random().toString(36).substring(2, 8)}`;
}

export function generateTag() {
    const chars = 'abcdefghijklmnopqrstuvwxyz_';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
