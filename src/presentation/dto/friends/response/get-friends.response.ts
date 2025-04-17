export class FriendUserInfo {
    readonly id: string;

    readonly nickname: string;

    readonly tag: string;

    readonly avatarKey: string;

    readonly friendshipId: string;

    readonly becameFriendAt: Date;
}

export class GetFriendsResponse {
    readonly data: FriendUserInfo[];

    readonly nextCursor: string | null;
}
