export type RoomType = 'dev' | 'design';
export type Provider = 'GOOGLE' | 'KAKAO' | 'NAVER';
export type FrinedStatus = 'ACCEPTED' | 'PENDING' | 'REJECTED';
export type FriendRequestStatus = 'ACCEPTED' | 'SENT' | 'RECEIVED' | 'NONE';

export enum ProductType {
    AURA = 'aura',
    SPEACH_BUBBLE = 'speach-bubble',
}

export enum ProductOrder {
    LATEST = 'latest',
    PRICIEST = 'priciest',
    CHEAPEST = 'cheapest',
}
