export type RoomType = 'dev' | 'design';
export type Provider = 'GOOGLE' | 'KAKAO' | 'NAVER';
export type FrinedStatus = 'ACCEPTED' | 'PENDING' | 'REJECTED';
export type FriendRequestStatus = 'ACCEPTED' | 'SENT' | 'RECEIVED' | 'NONE';

export enum ProductCategory {
    AURA = '오라',
    SPEACH_BUBBLE = '말풍선',
}

export enum ProductOrder {
    LATEST = 'latest',
    PRICIEST = 'priciest',
    CHEAPEST = 'cheapest',
}
