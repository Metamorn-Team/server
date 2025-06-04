export type RoomType = 'dev' | 'design';
export type Provider = 'GOOGLE' | 'KAKAO' | 'NAVER';
export type FrinedStatus = 'ACCEPTED' | 'PENDING' | 'REJECTED';
export type FriendRequestStatus = 'ACCEPTED' | 'SENT' | 'RECEIVED' | 'NONE';

export enum ProductOrder {
    LATEST = 'latest',
    PRICIEST = 'priciest',
    CHEAPEST = 'cheapest',
}
